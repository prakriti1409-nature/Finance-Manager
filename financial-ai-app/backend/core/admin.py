from django.contrib import admin
from .models import Transaction, ChatMessage

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'source', 'message_short')
    readonly_fields = ('created_at',)

    def message_short(self, obj):
        return (obj.message[:75] + '...') if len(obj.message) > 75 else obj.message
    message_short.short_description = 'message'

# Register your models here.
