# Generated by Django 5.0.8 on 2024-09-13 03:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('purchase', '0021_remove_expense_idpaymentmethod_remove_expense_vendor_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='expense',
            name='state',
            field=models.BooleanField(blank=True, default=True, null=True),
        ),
    ]