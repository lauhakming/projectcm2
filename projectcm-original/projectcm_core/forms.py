from django import forms
from django.forms import DateInput
from .models import Project, ProjectRole, Task, Company

class CompanyForm(forms.ModelForm):
	class Meta:
		model = Company
		fields = ('company_name','staffs')
		labels = {
			'company_name': 'Company name',
			'staffs': 'Company staffs',
		}


class ProjectForm(forms.ModelForm):
	
	class Meta:
		model = Project
		fields = ('pjname','company')
		labels = {
			'pjname': 'Project Name',
		}

class ProjectRoleForm(forms.ModelForm):
	class Meta:
		model = ProjectRole
		fields = ('projectuser', 'projectrole')
		labels = {
			'projectuser': 'Project Member',
			'projectrole': 'Member\'s Role',
		}

class ProjectTaskForm(forms.ModelForm):
	class Meta:
		model = Task
		fields = ('taskname', 'taskdescription', 'plannedstartdate', 
			'plannedcompletedate', 'actualstartdate', 
			'actualcompletedate','ownedby', 'plannedresource', 'actualresource', 'taskstatus')
		labels = {
			'taskname': 'Task Name',
			'taskdescription': 'Description',
			'plannedstartdate': 'Planned Start',
			'plannedcompletedate': 'Planned End',
			'actualstartdate': 'Actual Start',
			'actualcompletedate': 'Actual End',
			'ownedby': 'Action by',
			'plannedresource': 'Planned Resource',
			'actualresource': 'Actual Resource',
			'taskstatus': 'Status',
		}
		widgets = {
			'plannedstartdate': DateInput(attrs={'type': 'date'}),
			'plannedcompletedate': DateInput(attrs={'type': 'date'}),
			'actualstartdate': DateInput(attrs={'type': 'date'}),
			'actualcompletedate': DateInput(attrs={'type': 'date'}),
		}

