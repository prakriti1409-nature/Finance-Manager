# core/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Transaction
from .utils import encrypt_data, decrypt_data
from .models import Transaction, ChatMessage, Category, Budget, Goal


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

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
