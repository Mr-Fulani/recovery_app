# Generated by Django 5.0.2 on 2025-05-21 21:43

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('recovery_app', '0005_homepage_seo_description_homepage_seo_keywords'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='homepage',
            name='seo_description',
        ),
        migrations.RemoveField(
            model_name='homepage',
            name='seo_keywords',
        ),
    ]
