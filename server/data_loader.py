import pandas as pd
import yfinance as yf
from pathlib import Path

from features import compute_features

DATA_DIR = Path(__file__).parent / "notebooks" / "data"

TICKERS = {
    "VFV": "VFV_TO_csv_CLEAN.csv",
    "VCN": "VCN_TO_csv_CLEAN.csv",
    "VSP": "VSP_TO_csv_CLEAN.csv",
    "XIC": "XIC_TO_csv_CLEAN.csv",
    "XUS": "XUS_TO_csv_CLEAN.csv",
    "XIU": "XIU_TO_csv_CLEAN.csv",
}

YFINANCE_TICKERS = {
    "VFV": "VFV.TO",
    "VCN": "VCN.TO",
    "VSP": "VSP.TO",
    "XIC": "XIC.TO",
    "XUS": "XUS.TO",
    "XIU": "XIU.TO",
}


def load_csv(ticker: str) -> pd.DataFrame:
    """Load existing clean CSV data for a given ticker."""
    filename = TICKERS[ticker]
    df = pd.read_csv(DATA_DIR / filename, index_col="Date", parse_dates=True)
    return df


def load_all() -> dict[str, pd.DataFrame]:
    """Load all 6 ETFs into a dict."""
    return {ticker: load_csv(ticker) for ticker in TICKERS}


def fetch_fresh_data(ticker: str, period: str = "5y") -> pd.DataFrame:
    """Download fresh data from yfinance and compute features."""
    yf_ticker = YFINANCE_TICKERS[ticker]
    raw = yf.download(tickers=yf_ticker, period=period)
    if isinstance(raw.columns, pd.MultiIndex):
        raw.columns = raw.columns.get_level_values(0)
    df = compute_features(raw)
    # Drop warmup NaN rows (from rolling indicators)
    df = df.dropna(subset=["rsi_14"])
    return df
