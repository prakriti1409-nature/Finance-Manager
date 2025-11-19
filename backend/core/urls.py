# backend/core/urls.py
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
    GoalListCreate,
)


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('transactions/', TransactionListCreate.as_view(), name='transactions'),
    path('forecast/', ExpenseForecastView.as_view(), name='forecast'),
    path('score/', FinancialHealthView.as_view(), name='score'),

    # Chatbot endpoints
    path('chatbot/', ChatbotView.as_view(), name='chatbot'),
    path('chatbot/llm/', ChatbotLLMView.as_view(), name='chatbot_llm'),
    
    path('categories/', CategoryListCreate.as_view(), name='categories'),
path('budgets/', BudgetListCreate.as_view(), name='budgets'),
path('goals/', GoalListCreate.as_view(), name='goals'),

]
