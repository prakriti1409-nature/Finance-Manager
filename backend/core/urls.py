from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    RegisterView,
    TransactionListCreate,
    ExpenseForecastView,
    FinancialHealthView,
    ChatbotView,
    ChatbotLLMView,
    CategoryListCreate,
    BudgetListCreate,
    GoalListCreateView,
    GoalDeleteView,
    ExpenseListCreateView,
    ExpenseDeleteView,
    IncomeListCreateView,
    IncomeDeleteView,
    UserProfileView,
)

from .ml_views import ForecastView, FinancialScoreView

urlpatterns = [
    # Auth
    path("register/", RegisterView.as_view(), name="register"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # User Profile
    path("me/", UserProfileView.as_view(), name="user-profile"),

    # Transactions
    path("transactions/", TransactionListCreate.as_view(), name="transactions"),

    # Categories & Budgets
    path("categories/", CategoryListCreate.as_view(), name="categories"),
    path("budgets/", BudgetListCreate.as_view(), name="budgets"),

    # Goals
    path("goals/", GoalListCreateView.as_view(), name="goals-list-create"),
    path("goals/<int:pk>/", GoalDeleteView.as_view(), name="goals-delete"),

    # Expenses
    path("expenses/", ExpenseListCreateView.as_view(), name="expenses-list-create"),
    path("expenses/<int:pk>/", ExpenseDeleteView.as_view(), name="expenses-delete"),

    # Income
    path("income/", IncomeListCreateView.as_view(), name="income-list-create"),
    path("income/<int:pk>/", IncomeDeleteView.as_view(), name="income-delete"),

    # ML + Chatbot
    path("forecast/", ExpenseForecastView.as_view(), name="forecast"),
    path("score/", FinancialHealthView.as_view(), name="score"),
    path("chatbot/", ChatbotView.as_view(), name="chatbot"),
    path("chatbot/llm/", ChatbotLLMView.as_view(), name="chatbot-llm"),

    # ML Views v2
    path("forecast-v2/", ForecastView.as_view(), name="forecast-v2"),
    path("financial-score/", FinancialScoreView.as_view(), name="financial-score"),
]
