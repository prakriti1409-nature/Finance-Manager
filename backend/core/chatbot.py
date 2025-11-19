# core/chatbot.py

import datetime

def chatbot_response(message, user, transactions):
    msg = message.lower()

    # ---------- 1. GREETINGS ----------
    if any(word in msg for word in ["hello", "hi", "hey"]):
        return "Hello! How can I assist you with your finances today?"

    # ---------- 2. TOTAL EXPENSES ----------
    if "total expense" in msg or "spent" in msg:
        total = sum(t.amount for t in transactions if t.category == "expense")
        return f"You have spent a total of ₹{total:.2f} so far."

    # ---------- 3. TOTAL INCOME ----------
    if "income" in msg:
        total = sum(t.amount for t in transactions if t.category == "income")
        return f"Your total income recorded is ₹{total:.2f}."

    # ---------- 4. SAVINGS ----------
    if "saving" in msg or "left" in msg:
        income = sum(t.amount for t in transactions if t.category == "income")
        expenses = sum(t.amount for t in transactions if t.category == "expense")
        savings = income - expenses
        return f"You currently have ₹{savings:.2f} as savings."

    # ---------- 5. LAST TRANSACTION ----------
    if "last transaction" in msg or "recent" in msg:
        if not transactions:
            return "You have no transactions yet."
        last = transactions.order_by("-date").first()
        return f"Your last transaction was {last.category} of ₹{last.amount} on {last.date}."

    # ---------- 6. MONTHLY SUMMARY ----------
    if "month" in msg or "monthly" in msg or "this month" in msg:
        today = datetime.date.today()
        monthly_exp = sum(
            t.amount for t in transactions 
            if t.category == "expense" and t.date.month == today.month
        )
        return f"This month's total expenses are ₹{monthly_exp:.2f}."

    # ---------- 7. HELP ----------
    if "help" in msg:
        return (
            "You can ask things like:\n"
            "- 'What is my total expense?'\n"
            "- 'How much did I save?'\n"
            "- 'What is my income?'\n"
            "- 'Show my last transaction'\n"
            "- 'Monthly expenses'\n"
            "- 'Hello'\n"
        )

    # ---------- 8. DEFAULT ----------
    return "I'm not sure I understood that. Try asking about expenses, income, or savings."
