# backend/ml/forecast_model.py
"""
Lightweight forecast replacement for the LSTM-based predictor.

This file provides build_lstm_model(data) so your existing views/imports work without
TensorFlow. It returns 7 predicted amounts based on recent history using:
 - linear trend (polyfit degree 1) on last N points
 - weighted moving average of last window
 - blended prediction between trend and moving average
"""

import math
from typing import List

try:
    import numpy as np
except Exception:
    # tiny fallback if numpy not installed (but recommend installing numpy)
    def _to_np(x):
        return [float(v) for v in x]
    np = None
else:
    def _to_np(x):
        return np.array(x, dtype=float)


def build_lstm_model(data: List[float]) -> List[float]:
    """
    Lightweight predictor that returns next 7-day forecasts.

    Args:
        data: list of floats (expense amounts) ordered oldest -> newest

    Returns:
        List[7] of floats (next 7 predicted amounts)
    """
    if not data or len(data) < 7:
        raise ValueError("Need at least 7 data points for forecast")

    # Use last N points for fitting/trend, prefer last 30 if available
    n_points = min(len(data), 30)
    window = data[-n_points:]

    # Convert to numpy if available
    arr = _to_np(window)

    # 1) Linear trend fit on available points
    try:
        x = None
        if np is not None:
            x = np.arange(len(arr))
            m, b = np.polyfit(x, arr, 1)
        else:
            # simple linear fit without numpy (least squares)
            n = len(arr)
            xs = list(range(n))
            sx = sum(xs)
            sy = sum(arr)
            sxx = sum(x*x for x in xs)
            sxy = sum(x*y for x, y in zip(xs, arr))
            denom = n * sxx - sx * sx
            if denom == 0:
                m = 0.0
            else:
                m = (n * sxy - sx * sy) / denom
            b = (sy - m * sx) / n
    except Exception:
        # if fitting fails, fallback to zero trend
        m, b = 0.0, float(arr[-1])

    # 2) Weighted moving average of last 7 days
    last_k = 7
    last_vals = window[-last_k:] if len(window) >= last_k else window
    weights = list(range(1, len(last_vals) + 1))  # increasing weights
    weighted_sum = sum(v * w for v, w in zip(last_vals, weights))
    weight_total = sum(weights)
    wma = weighted_sum / weight_total if weight_total != 0 else float(last_vals[-1])

    # 3) Blend: weight trend more if data shows monotonic behavior, else favor WMA
    # measure volatility: std dev / mean
    try:
        mean_recent = sum(last_vals) / len(last_vals)
        variance = sum((v - mean_recent) ** 2 for v in last_vals) / len(last_vals)
        std = math.sqrt(variance)
        volatility = std / (mean_recent if mean_recent != 0 else 1)
    except Exception:
        volatility = 0.5

    # volatility in [0, inf). map to blend factor alpha in [0.25, 0.75]
    alpha = 0.5
    if volatility < 0.05:
        alpha = 0.75
    elif volatility < 0.2:
        alpha = 0.6
    elif volatility < 0.5:
        alpha = 0.5
    else:
        alpha = 0.4

    # Predict next 7 days using trend + blend with moving average baseline
    preds = []
    last_index = (len(window) - 1) if np is None else (len(arr) - 1)
    for i in range(1, 8):  # next 1..7
        trend_pred = m * (last_index + i) + b
        baseline = wma  # baseline level
        pred = alpha * trend_pred + (1 - alpha) * baseline
        # ensure non-negative and round to 2 decimals
        pred = float(round(max(0.0, pred), 2))
        preds.append(pred)

    return preds
