# Generated by Django 5.0.6 on 2024-06-27 05:51

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('scheduler', '0005_event_person'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='person',
            name='user',
        ),
    ]
