# Generated by Django 2.1.7 on 2019-02-20 10:54

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('projectcm_core', '0005_project_created_by'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='ProjecRole',
            new_name='ProjectRole',
        ),
    ]
