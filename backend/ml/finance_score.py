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

def calculate_financial_score(income, expenses):
    try:
        income = float(income)
        expenses = float(expenses)

        if income <= 0 and expenses <= 0:
            return {"financial_score": 0, "status": "Poor", "advice": "Add income and expenses data."}

        score = 100 * (1 - (expenses / (income + expenses)))
        score = round(max(0, min(100, score)), 2)

        if score >= 80:
            status = "Excellent"
        elif score >= 60:
            status = "Good"
        elif score >= 40:
            status = "Average"
        else:
            status = "Poor"

        return {
            "financial_score": score,
            "status": status,
            "advice": generate_advice(status)
        }

    except Exception as e:
        return {"financial_score": 0, "status": "Error", "advice": str(e)}

