# Generated by Django 5.0.8 on 2024-10-15 08:08

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0063_alter_saledetail_idsale'),
    ]

    operations = [
        migrations.AddField(
            model_name='saledetail',
            name='date',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
