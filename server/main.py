from contextlib import asynccontextmanager

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from data_loader import load_all, fetch_fresh_data, TICKERS
from model import train_and_save, predict_latest, load_metrics, has_saved_model
from features import FEATURE_COLS

# In-memory caches
_data: dict = {}
_metrics: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load data and train models on startup."""
    global _data, _metrics
    _data = load_all()
    for ticker, df in _data.items():
        if has_saved_model(ticker):
            _metrics[ticker] = load_metrics(ticker)
        else:
            _metrics[ticker] = train_and_save(df, ticker)
    yield


app = FastAPI(title="Stock Predictor API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _validate_ticker(ticker: str) -> str:
    ticker = ticker.upper()
    if ticker not in TICKERS:
        raise HTTPException(status_code=404, detail=f"Unknown ticker: {ticker}")
    return ticker


@app.get("/api/tickers")
def get_tickers():
    return list(TICKERS.keys())


@app.get("/api/stock/history")
def get_history(
    ticker: str = Query("VFV"),
    days: int | None = Query(None, description="Number of days to return"),
):
    ticker = _validate_ticker(ticker)
    df = _data[ticker]
    if days is not None:
        df = df.iloc[-days:]
    records = []
    for date, row in df.iterrows():
        records.append({
            "date": str(date.date()),
            "open": round(float(row["Open"]), 2),
            "high": round(float(row["High"]), 2),
            "low": round(float(row["Low"]), 2),
            "close": round(float(row["Close"]), 2),
            "volume": int(row["Volume"]),
        })
    return records


@app.get("/api/stock/prediction")
def get_prediction(ticker: str = Query("VFV")):
    ticker = _validate_ticker(ticker)
    return predict_latest(_data[ticker], ticker)


@app.get("/api/model/metrics")
def get_metrics(ticker: str = Query("VFV")):
    ticker = _validate_ticker(ticker)
    metrics = _metrics.get(ticker)
    if metrics is None:
        raise HTTPException(status_code=404, detail="Model not trained yet")
    return metrics


@app.get("/api/stock/indicators")
def get_indicators(
    ticker: str = Query("VFV"),
    days: int = Query(252, description="Number of days"),
):
    ticker = _validate_ticker(ticker)
    df = _data[ticker].iloc[-days:]

    rsi = []
    macd = []
    bollinger = []

    for date, row in df.iterrows():
        d = str(date.date())
        rsi.append({"date": d, "value": round(float(row["rsi_14"]), 2)})
        macd.append({
            "date": d,
            "line": round(float(row["macd_line"]), 4),
            "signal": round(float(row["macd_signal_line"]), 4),
            "histogram": round(float(row.get("macd_histogram", row.get("mcad_histogram", 0))), 4),
        })
        bollinger.append({
            "date": d,
            "upper": round(float(row["bb_upper_bound"]), 2),
            "lower": round(float(row["bb_lower_bound"]), 2),
            "close": round(float(row["Close"]), 2),
        })

    return {"rsi": rsi, "macd": macd, "bollinger": bollinger}


@app.post("/api/stock/refresh")
def refresh_data(ticker: str = Query("VFV")):
    ticker = _validate_ticker(ticker)
    df = fetch_fresh_data(ticker)
    _data[ticker] = df
    _metrics[ticker] = train_and_save(df, ticker)
    return {
        "status": "ok",
        "ticker": ticker,
        "rows": len(df),
        "accuracy": _metrics[ticker]["accuracy"],
    }
