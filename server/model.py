import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, TimeSeriesSplit, cross_val_score
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

from features import FEATURE_COLS

ARTIFACTS_DIR = Path(__file__).parent / "artifacts"


def _model_path(ticker: str) -> Path:
    return ARTIFACTS_DIR / f"{ticker}_model.joblib"


def _metrics_path(ticker: str) -> Path:
    return ARTIFACTS_DIR / f"{ticker}_metrics.json"


def build_pipeline() -> Pipeline:
    """Best-performing pipeline: StandardScaler + Logistic Regression (L1, C=0.01)."""
    preprocessor = ColumnTransformer(
        transformers=[("scaler", StandardScaler(), FEATURE_COLS)]
    )
    return Pipeline([
        ("cleaning_steps", preprocessor),
        ("logistic_model", LogisticRegression(
            l1_ratio=1, solver="saga", C=0.01, max_iter=5000
        )),
    ])


def train_and_save(df: pd.DataFrame, ticker: str) -> dict:
    """Train on the dataframe, save model, return metrics dict."""
    df_clean = df.dropna(subset=["future_return"])
    X = df_clean[FEATURE_COLS]
    y = df_clean["target"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, shuffle=False
    )

    pipe = build_pipeline()
    pipe.fit(X_train, y_train)

    preds = pipe.predict(X_test)
    proba = pipe.predict_proba(X_test)
    acc = accuracy_score(y_test, preds)
    cm = confusion_matrix(y_test, preds).tolist()
    report = classification_report(
        y_test, preds, target_names=["Down", "Up"],
        output_dict=True, zero_division=0
    )

    tscv = TimeSeriesSplit(n_splits=5)
    cv_scores = cross_val_score(pipe, X, y, cv=tscv, scoring="accuracy")

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipe, _model_path(ticker))

    metrics = {
        "accuracy": float(acc),
        "confusion_matrix": cm,
        "classification_report": report,
        "cv_mean": float(cv_scores.mean()),
        "cv_std": float(cv_scores.std()),
        "cv_folds": [float(s) for s in cv_scores],
        "train_size": len(X_train),
        "test_size": len(X_test),
    }

    with open(_metrics_path(ticker), "w") as f:
        json.dump(metrics, f)

    return metrics


def load_model(ticker: str) -> Pipeline:
    return joblib.load(_model_path(ticker))


def load_metrics(ticker: str) -> dict | None:
    path = _metrics_path(ticker)
    if path.exists():
        with open(path) as f:
            return json.load(f)
    return None


def has_saved_model(ticker: str) -> bool:
    return _model_path(ticker).exists()


def predict_latest(df: pd.DataFrame, ticker: str) -> dict:
    """Predict on the most recent row of features."""
    pipe = load_model(ticker)
    latest = df[FEATURE_COLS].iloc[[-1]]
    prediction = int(pipe.predict(latest)[0])
    probabilities = pipe.predict_proba(latest)[0]
    return {
        "prediction": prediction,
        "direction": "up" if prediction == 1 else "down",
        "probability_up": float(probabilities[1]),
        "probability_down": float(probabilities[0]),
        "date": str(df.index[-1].date()),
        "close_price": float(df["Close"].iloc[-1]),
    }
