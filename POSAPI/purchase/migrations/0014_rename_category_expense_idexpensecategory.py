# Generated by Django 5.0.8 on 2024-08-17 05:50

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('purchase', '0013_alter_expense_date'),
    ]

    operations = [
        migrations.RenameField(
            model_name='expense',
            old_name='category',
            new_name='IDExpenseCategory',
        ),
    ]
