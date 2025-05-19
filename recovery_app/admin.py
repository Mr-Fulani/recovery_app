from django.contrib import admin
from .models import Review, ServiceRequest

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('name', 'rating', 'created_at', 'is_approved')
    list_filter = ('is_approved', 'rating', 'created_at')
    search_fields = ('name', 'email', 'text')
    list_editable = ('is_approved',)
    date_hierarchy = 'created_at'

@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'phone', 'email', 'message')
    list_editable = ('status',)
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at')
