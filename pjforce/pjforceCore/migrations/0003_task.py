# Generated by Django 2.2.3 on 2019-08-29 07:26

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('pjforceCore', '0002_project_projectrole'),
    ]

    operations = [
        migrations.CreateModel(
            name='Task',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('taskname', models.CharField(max_length=40)),
                ('taskdescription', models.TextField(blank=True, max_length=100, null=True)),
                ('plannedstartdate', models.DateField(blank=True, default=None, null=True)),
                ('plannedcompletedate', models.DateField(blank=True, default=None, null=True)),
                ('actualstartdate', models.DateField(blank=True, default=None, null=True)),
                ('actualcompletedate', models.DateField(blank=True, default=None, null=True)),
                ('projecttaskid', models.IntegerField(default=None, editable=False, null=True)),
                ('plannedresource', models.DecimalField(blank=True, decimal_places=2, default=None, max_digits=6, null=True)),
                ('actualresource', models.DecimalField(blank=True, decimal_places=2, default=None, max_digits=6, null=True)),
                ('taskstatus', models.CharField(choices=[('OPEN', 'Open - Not completed'), ('INPROGRESS', 'Work In Progress'), ('COMPLETED', 'Completed')], default='OPEN', max_length=20)),
                ('dependencetask', models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, to='pjforceCore.Task')),
                ('ownedby', models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='pjforceCore.Project')),
            ],
        ),
    ]