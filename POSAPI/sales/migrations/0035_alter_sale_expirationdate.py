# Generated by Django 5.0.8 on 2024-09-07 06:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0034_alter_sale_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sale',
            name='expirationDate',
            field=models.DateField(blank=True, null=True),
        ),
    ]
