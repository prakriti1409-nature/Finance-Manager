# core/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Transaction
from .utils import encrypt_data, decrypt_data
from .models import Transaction, ChatMessage, Category, Budget, Goal,Expense,Income
from django.contrib.auth.hashers import make_password


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6, style={"input_type":"password"})
    confirm_password = serializers.CharField(write_only=True, required=True, min_length=6, style={"input_type":"password"})

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "confirm_password",
            "first_name",
            "last_name",
        ]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        validated_data["password"] = make_password(validated_data["password"])
        return User.objects.create(**validated_data)


class TransactionSerializer(serializers.ModelSerializer):
    description = serializers.CharField(allow_blank=True, required=False)

    class Meta:
        model = Transaction
        fields = ['id', 'user', 'category', 'amount', 'description', 'date']
        read_only_fields = ['user']

    def create(self, validated_data):
        desc = validated_data.get('description', '')
        if desc:
            validated_data['description'] = encrypt_data(desc)
        return super().create(validated_data)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        enc_desc = ret.get('description') or ''
        if enc_desc:
            try:
                ret['description'] = decrypt_data(enc_desc)
            except Exception:
                # if it wasn't encrypted, leave as-is
                pass
        return ret
class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'user', 'message', 'reply', 'source', 'created_at']
        read_only_fields = ['user', 'reply', 'source', 'created_at']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"
        read_only_fields = ["user"]

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = "__all__"
        read_only_fields = ["user"]

class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = "__all__"
        read_only_fields = ["user"]
        
class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = [
            "id",
            "user",
            "amount",
            "category",
            "date",
            "note",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "user"]

class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = [
            "id",
            "title",
            "target_amount",
            "deadline",
            "note",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = [
            "id",
            "amount",
            "source",
            "date",
            "note",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
