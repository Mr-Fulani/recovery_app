# recovery_app/wagtail_hooks.py
"""
Wagtail hooks for registering the WorkPhoto model in the admin interface.
"""
from wagtail.contrib.modeladmin.options import ModelAdmin, modeladmin_register
from .models import WorkPhoto

class WorkPhotoAdmin(ModelAdmin):
    """
    Admin interface configuration for the WorkPhoto model.
    """
    model = WorkPhoto
    menu_label = 'Фотографии работ'
    menu_icon = 'image'
    menu_order = 200
    add_to_settings_menu = False
    exclude_from_explorer = False
    list_display = ('title', 'created_at', 'is_published')
    list_filter = ('is_published', 'created_at')
    search_fields = ('title', 'description')

modeladmin_register(WorkPhotoAdmin)