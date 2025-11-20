# core/models.py
from django.db import models
from django.contrib.auth.models import User

# -------------------- TRANSACTIONS --------------------
class Transaction(models.Model):
    CATEGORY_CHOICES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
    amount = models.FloatField()
    description = models.TextField(blank=True)
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.category} - {self.amount}"


# -------------------- CHATBOT HISTORY --------------------
class ChatMessage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    message = models.TextField()
    reply = models.TextField(blank=True)
    source = models.CharField(max_length=32, default='local')  # local or llm
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} @ {self.created_at:%Y-%m-%d %H:%M}"


# -------------------- CATEGORY --------------------
class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


# -------------------- BUDGET --------------------
class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    amount = models.FloatField()
    month = models.CharField(max_length=20)  # "2024-11"

    def __str__(self):
        return f"{self.user.username} - {self.category.name} - {self.month}"


# # -------------------- GOALS --------------------
# class Goal(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     title = models.CharField(max_length=100)
#     target_amount = models.FloatField()
#     current_amount = models.FloatField(default=0)
#     deadline = models.DateField()

#     def __str__(self):
#         return self.title

class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="expense_entries")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=255)
    date = models.DateField()
    note = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.category} - {self.amount}"
class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="goals")
    title = models.CharField(max_length=255)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    deadline = models.DateField()
    note = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"
class Income(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="income_entries")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    source = models.CharField(max_length=255)
    date = models.DateField()
    note = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.source} - {self.amount}"

