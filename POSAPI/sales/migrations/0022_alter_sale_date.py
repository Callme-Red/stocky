# Generated by Django 5.0.8 on 2024-08-26 20:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0021_alter_sale_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sale',
            name='date',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]