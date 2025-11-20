from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import models

from ml.finance_score import calculate_financial_score
from ml.forecast_model import build_lstm_model

from.models import Income
from .models import Expense


class ForecastView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        expenses = Expense.objects.filter(user=request.user).order_by("date")
        values = [float(e.amount) for e in expenses]

        if len(values) < 7:
            return Response({
                "error": "Not enough data. Need at least 7 expense entries."
            }, status=400)

        try:
            predictions = build_lstm_model(values)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

        return Response({
            "next_7_days": predictions
        })
        

class FinancialScoreView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        income_total = Income.objects.filter(user=request.user).aggregate(total=models.Sum("amount"))["total"] or 0
        expense_total = Expense.objects.filter(user=request.user).aggregate(total=models.Sum("amount"))["total"] or 0

        result = calculate_financial_score(
            income=income_total,
            expenses=expense_total,
            savings=request.query_params.get("savings", 0),
            debt=request.query_params.get("debt", 0),
        )

        return Response(result)
