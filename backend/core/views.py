# core/views.py
from rest_framework import generics, permissions
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny   # ✅ ADD THIS
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import ChatMessage
from .serializers import ChatMessageSerializer
from .models import Transaction, ChatMessage, Category, Budget, Goal,Expense,Income
from .serializers import (
    UserSerializer, TransactionSerializer,
    ChatMessageSerializer, CategorySerializer,
    BudgetSerializer, GoalSerializer,ExpenseSerializer,IncomeSerializer,UserSerializer, RegisterSerializer
)

# ML helpers
from ml.forecast_model import build_lstm_model
from ml.finance_score import calculate_financial_score

import requests
import os
import csv
from django.http import HttpResponse

# -------------------------
# Register
# -------------------------
# class RegisterView(generics.CreateAPIView):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer
#     permission_classes = [permissions.AllowAny]


# -------------------------
# Transactions
# -------------------------
class TransactionListCreate(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# -------------------------
# Forecast
# -------------------------
class ExpenseForecastView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        expenses = Transaction.objects.filter(
            user=user, category="expense"
        ).order_by("date")

        data = [float(t.amount) for t in expenses]

        if len(data) < 7:
            return Response({"error": "Need at least 7 expense records."}, status=400)

        try:
            predictions = build_lstm_model(data)
            return Response({"next_7_days": predictions})
        except Exception as e:
            return Response({"error": str(e)}, status=500)


# -------------------------
# Financial Health Score
# -------------------------
class FinancialHealthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        print("🔥 ALL USER TRANSACTIONS:", 
                    list(Transaction.objects.filter(user=user)
                        .values("id", "category", "amount")))
        income_total = sum(
            Transaction.objects.filter(
                user=user, category__iexact="income"
            ).values_list("amount", flat=True)
        )

        expense_total = sum(
            Transaction.objects.filter(
                user=user, category__iexact="expense"
            ).values_list("amount", flat=True)
        )

        score_data = calculate_financial_score(income_total, expense_total)
        return Response(score_data)


# -------------------------
# Helper for chat history
# -------------------------
def get_last_n_messages(user, n=6):
    qs = ChatMessage.objects.filter(user=user).order_by("-created_at")[:n]
    return list(reversed(qs))


# -------------------------
# Local Chatbot
# -------------------------
class ChatbotView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user_msg = (request.data.get("message") or "").strip().lower()

        if not user_msg:
            return Response({"reply": "Please type a message."}, status=400)

        reply = None

        # Greetings
        if any(g in user_msg for g in ["hello", "hi", "hey"]):
            reply = f"Hello {user.username}! How can I assist you today?"
        elif "income" in user_msg:
            inc = sum(Transaction.objects.filter(user=user, category="income").values_list("amount", flat=True))
            reply = f"Your total income is ₹{inc:.2f}."
        elif "expense" in user_msg or "spent" in user_msg:
            exp = sum(Transaction.objects.filter(user=user, category="expense").values_list("amount", flat=True))
            reply = f"You have spent a total of ₹{exp:.2f}."
        elif "score" in user_msg or "health" in user_msg:
            inc = sum(Transaction.objects.filter(user=user, category="income").values_list("amount", flat=True))
            exp = sum(Transaction.objects.filter(user=user, category="expense").values_list("amount", flat=True))
            score_data = calculate_financial_score(inc, exp)
            reply = f"Your financial health score is {score_data['financial_score']}. Status: {score_data['status']}."
        elif "forecast" in user_msg or "predict" in user_msg:
            expenses = Transaction.objects.filter(user=user, category="expense").order_by("date")
            data = [float(t.amount) for t in expenses]
            if len(data) < 7:
                reply = "I need at least 7 expense records to generate a forecast."
            else:
                preds = build_lstm_model(data)
                reply = f"Your next 7-day predicted expenses are: {preds}"
        elif "save" in user_msg or "advice" in user_msg:
            reply = "Tip: Use the 50-30-20 rule — 50% needs, 30% wants, 20% savings."
        elif "emi" in user_msg:
            reply = "EMI = Equated Monthly Installment — fixed monthly loan repayment."
        else:
            reply = "I'm not sure how to respond to that. Try asking about income, expenses, score, or forecast."

        # Save message
        msg_obj = ChatMessage.objects.create(
            user=user,
            message=user_msg,
            reply=reply,
            source="local"
        )

        return Response(ChatMessageSerializer(msg_obj).data, status=201)


# -------------------------
# OpenAI LLM Proxy (Optional)
# -------------------------
class ChatbotLLMView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user_msg = request.data.get("message", "").strip()

        if not user_msg:
            return Response({"detail": "Message required."}, status=400)

        api_key = os.environ.get("OPENROUTER_API_KEY")
        if not api_key:
            return Response({"detail": "OpenRouter API key missing"}, status=503)

        # Build chat history for OpenRouter
        history = []
        for c in get_last_n_messages(user, 6):
            history.append({"role": "user", "content": c.message})
            history.append({"role": "assistant", "content": c.reply})

        history.append({"role": "user", "content": user_msg})

        try:
            endpoint = "https://openrouter.ai/api/v1/chat/completions"

            resp = requests.post(
                endpoint,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "openai/gpt-4o-mini",  # free/cheap fast model
                    "messages": history,
                },
            )

            data = resp.json()

            if "choices" not in data:
                raise Exception(data.get("error", "Unknown OpenRouter response"))

            reply = data["choices"][0]["message"]["content"]

        except Exception as e:
            print("🔥 ERROR:", str(e))
            return Response({"detail": str(e)}, status=500)

        msg = ChatMessage.objects.create(
            user=user,
            message=user_msg,
            reply=reply,
            source="openrouter"
        )

        return Response(ChatMessageSerializer(msg).data)
# ---------- CATEGORY ----------
class CategoryListCreate(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = Category.objects.filter(user=request.user)
        return Response(CategorySerializer(categories, many=True).data)

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

# ---------- BUDGET ----------
class BudgetListCreate(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        budgets = Budget.objects.filter(user=request.user)
        return Response(BudgetSerializer(budgets, many=True).data)

    def post(self, request):
        serializer = BudgetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

# ---------- GOALS ----------
class GoalListCreate(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        goals = Goal.objects.filter(user=request.user)
        return Response(GoalSerializer(goals, many=True).data)

    def post(self, request):
        serializer = GoalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


# -------------------------
# CSV Export
# -------------------------
class ExportCSVView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transactions = Transaction.objects.filter(user=request.user)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="transactions.csv"'

        writer = csv.writer(response)
        writer.writerow(["Date", "Category", "Amount", "Description"])

        for t in transactions:
            writer.writerow([t.date, t.category, t.amount, t.description])

        return response
class ExpenseListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        expenses = Expense.objects.filter(user=request.user).order_by("-date")
        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ExpenseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExpenseDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        expense = get_object_or_404(Expense, pk=pk, user=request.user)
        expense.delete()
        return Response({"message": "Expense deleted"}, status=status.HTTP_200_OK)
class GoalListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        goals = Goal.objects.filter(user=request.user).order_by("deadline")
        serializer = GoalSerializer(goals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = GoalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GoalDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        goal = get_object_or_404(Goal, pk=pk, user=request.user)
        goal.delete()
        return Response({"message": "Goal deleted"}, status=status.HTTP_200_OK)
class IncomeListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        incomes = Income.objects.filter(user=request.user).order_by("-date")
        serializer = IncomeSerializer(incomes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = IncomeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IncomeDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        income = get_object_or_404(Income, pk=pk, user=request.user)
        income.delete()
        return Response({"message": "Income deleted"}, status=status.HTTP_200_OK)
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User registered successfully"},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
