# Generated by Django 5.0.8 on 2024-08-15 02:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0009_alter_saledetail_date'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='saledetail',
            name='date',
        ),
        migrations.AlterField(
            model_name='client',
            name='date',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name='sale',
            name='date',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
