# backend/ml/finance_score.py

def generate_advice(status):
    if status == "Excellent":
        return "Keep up your saving habits and consider low-risk investments."
    elif status == "Good":
        return "You’re doing well! Reduce minor unnecessary expenses."
    elif status == "Average":
        return "Try tracking your spending more closely and set a savings goal."
    else:
        return "Reassess your budget. Consider cutting non-essential expenses."

def calculate_financial_score(income, expenses, savings=0, debt=0):
    try:
        income = float(income) if income is not None else 0.0
        expenses = float(expenses) if expenses is not None else 0.0
        if income <= 0:
            saving_rate = 0
            debt_ratio = 1 if debt > 0 else 0
        else:
            saving_rate = max(0.0, (income - expenses) / income)
            debt_ratio = min(1.0, debt / income) if debt > 0 else 0.0

        score_raw = (saving_rate * 0.7) - (debt_ratio * 0.3)
        score = max(0.0, min(1.0, score_raw))
        score_percent = round(score * 100, 2)

        if score_percent >= 80:
            status = "Excellent"
        elif score_percent >= 60:
            status = "Good"
        elif score_percent >= 40:
            status = "Average"
        else:
            status = "Poor"

        return {
            "financial_score": score_percent,
            "status": status,
            "advice": generate_advice(status)
        }
    except Exception as e:
        return {"financial_score": 0, "status": "Error", "advice": str(e)}
