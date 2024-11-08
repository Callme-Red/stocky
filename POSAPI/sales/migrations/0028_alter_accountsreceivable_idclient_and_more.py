# Generated by Django 5.0.8 on 2024-08-30 05:43

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0027_remove_accountsreceivable_expirationdate_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='accountsreceivable',
            name='IDClient',
            field=models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='accountsreceivable_set', to='sales.client'),
        ),
        migrations.AlterField(
            model_name='sale',
            name='IDClient',
            field=models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='sales', to='sales.client'),
        ),
    ]
