import pandas as pd
import numpy as np

FEATURE_COLS = [
    'rsi_14', 'return_1day', 'return_5day', 'return_10day', 'return_20day',
    'sma_5', 'sma_10', 'close_ratio_amv_10', 'sma_20', 'close_ratio_amv_20',
    'close_ratio_amv_5', 'macd_line', 'bb_width', 'bb_pct_b',
    'volatility_10_day', 'volatility_20_day',
    'volume_1day', 'volume_20_sma', 'volume_normalize_ratio',
]

DAYS_FORWARD = 5


def _compute_rsi(close: pd.Series, period: int = 14) -> pd.Series:
    delta = close.diff()
    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)
    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))


def compute_features(df: pd.DataFrame) -> pd.DataFrame:
    """Takes raw OHLCV DataFrame and adds all 19 technical indicators + targets."""
    df = df.copy()

    # Lagged returns
    for days in [1, 5, 10, 20]:
        df[f'return_{days}day'] = df['Close'].pct_change(days)

    # Simple moving averages + close ratios
    for day in [5, 10, 20]:
        df[f'sma_{day}'] = df['Close'].rolling(window=day).mean()
        df[f'close_ratio_amv_{day}'] = df['Close'] / df[f'sma_{day}']

    # Volatility
    for day in [10, 20]:
        df[f'volatility_{day}_day'] = df['Close'].rolling(window=day).std()

    # Volume features
    df['volume_1day'] = df['Volume'].pct_change(1)
    df['volume_20_sma'] = df['Volume'].rolling(window=20).mean()
    df['volume_normalize_ratio'] = df['Volume'] / df['volume_20_sma']

    # RSI (14-day)
    df['rsi_14'] = _compute_rsi(df['Close'], 14)

    # MACD
    ema_12 = df['Close'].ewm(span=12, adjust=False).mean()
    ema_26 = df['Close'].ewm(span=26, adjust=False).mean()
    df['macd_line'] = ema_12 - ema_26
    df['macd_signal_line'] = df['macd_line'].ewm(span=9, adjust=False).mean()
    df['macd_histogram'] = df['macd_line'] - df['macd_signal_line']

    # Bollinger Bands
    sma_20 = df['Close'].rolling(window=20).mean()
    std_20 = df['Close'].rolling(window=20).std()
    df['bb_upper_bound'] = sma_20 + (2 * std_20)
    df['bb_lower_bound'] = sma_20 - (2 * std_20)
    df['bb_width'] = (df['bb_upper_bound'] - df['bb_lower_bound']) / sma_20
    df['bb_pct_b'] = (df['Close'] - df['bb_lower_bound']) / (df['bb_upper_bound'] - df['bb_lower_bound'])

    # Target variables (5-day forward)
    df['future_return'] = df['Close'].shift(-DAYS_FORWARD) / df['Close'] - 1
    df['target'] = (df['future_return'] > 0).astype(int)

    return df
