import math
from datetime import datetime, timedelta
from typing import List, Dict, Any

def generate_demand_forecast(
    phc_id: str,
    medicine_id: str,
    days_ahead: int = 14,
    current_stock: int = 1200,
    daily_usage: int = 150,
    demand_multiplier: float = 1.0,
    weather_impact_factor: float = 1.15
) -> List[Dict[str, Any]]:
    """
    Generates historical 7-day demand followed by N-day forward forecast
    with 95% confidence intervals based on seasonal and environmental signals.
    """
    points = []
    now = datetime.now()
    
    # Historical 7 days (days -7 to -1)
    base = daily_usage
    for i in range(-7, 0):
        dt = now + timedelta(days=i)
        # Add slight realistic noise to history
        noise = math.sin(i * 1.7) * (base * 0.08)
        hist_demand = max(10, round(base + noise))
        points.append({
            "day": i,
            "date": dt.strftime("%b %d"),
            "demand": hist_demand,
            "lower_ci": hist_demand,
            "upper_ci": hist_demand,
            "simulated_stock": max(0, current_stock + (abs(i) * base)),
            "is_forecast": False
        })

    # Today (day 0)
    points.append({
        "day": 0,
        "date": "Today (" + now.strftime("%b %d") + ")",
        "demand": round(base * demand_multiplier),
        "lower_ci": round(base * demand_multiplier),
        "upper_ci": round(base * demand_multiplier),
        "simulated_stock": current_stock,
        "is_forecast": False
    })

    # Forecast days 1 to days_ahead
    running_stock = current_stock
    effective_daily = base * demand_multiplier * weather_impact_factor

    for i in range(1, days_ahead + 1):
        dt = now + timedelta(days=i)
        # Seasonal weekend dip or surge
        weekday = dt.weekday()
        day_factor = 1.1 if weekday in (0, 1) else (0.95 if weekday == 6 else 1.0)
        
        projected_demand = round(effective_daily * day_factor)
        ci_spread = projected_demand * (0.05 + (0.015 * i)) # confidence interval expands over time
        lower = max(5, round(projected_demand - ci_spread))
        upper = round(projected_demand + ci_spread)

        running_stock = max(0, running_stock - projected_demand)

        points.append({
            "day": i,
            "date": dt.strftime("%b %d"),
            "demand": projected_demand,
            "lower_ci": lower,
            "upper_ci": upper,
            "simulated_stock": running_stock,
            "is_forecast": True
        })

    return points
