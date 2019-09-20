from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from .models import Project, Task, ProjectRole, Company
from django.contrib.auth.decorators import login_required
from .forms import ProjectForm, ProjectRoleForm, ProjectTaskForm, CompanyForm
from django.contrib.auth.models import User
from django import forms
from datetime import datetime
from django.db.models import Q

import logging

logger = logging.getLogger(__name__)


@login_required(login_url='/accounts/login/')


# Create your views here.

def	index(request):
	return HttpResponse("Projects") 

def	add_staff_from_existing(request, companyid):
	context = {}
	if request.method == 'GET':
		searchfield = request.GET.get('username', None)
		if searchfield != None:
			users = User.objects.filter(Q(username__contains=searchfield) | Q(email__contains=searchfield))
			context = { 'users': users }
		return render(request, 'projectcm_core/add_staff_existing.html', context)

def	company_manage_modify(request, companyid):
	company = Company.objects.get(id=companyid)
	staffs = company.staffs.all()	
	#form = CompanyForm(instance=company)
	return render(request, 'projectcm_core/company_admin_modify.html', {'staffs': staffs})


def	company_manage_lists(request):
	if not request.user.is_authenticated:
		context = {}
		return render(request, 'projectcm_core/listall.html', context)
	loginuser= request.user
	companies = Company.objects.filter(staffs__in = [loginuser, ])
	context = {}
	if companies.filter(company_group__in = loginuser.groups.all()).exists():
		companies_admin_role = companies.filter(company_group__in = loginuser.groups.all())
		context = { 'company_admin_list': companies_admin_role,  }
	return render(request, 'projectcm_core/company_admin_listall.html', context)

	
def	listprojects(request):
	if not request.user.is_authenticated:
		context = {}
		return render(request, 'projectcm_core/listall.html', context)
	if request.method == 'GET':
		loginuser = request.user
		statusfilter = request.GET.get('taskstatus', None)
		projects_in_role = ProjectRole.objects.filter(projectuser=loginuser).values("project")
		project_list = Project.objects.filter(id__in=projects_in_role)
		
		if statusfilter == 'ALL':
			task_list = Task.objects.filter(ownedby=loginuser)

		elif statusfilter:
			task_list = Task.objects.filter(ownedby=loginuser).filter(taskstatus=statusfilter)
		else:
			task_list = Task.objects.filter(ownedby=loginuser).exclude(taskstatus=Task.COMPLETED)

		context = {'project_list': project_list,
			'task_list': task_list,
		  }
		return render(request, 'projectcm_core/listall.html', context)
	else:
		# in post, try to save the changes in task
		return redirect('/projects')
	
def	project_new(request):
	if request.method == "POST":
		form = ProjectForm(request.POST)
		if form.is_valid():
			project = form.save(commit=False)
			created_by = request.user
			project.created_by = created_by
			project.company = Company.objects.get(id=form['company'].value())
			project.save()
		return redirect('/projects')
	else:
	# added Company in the form field, and limit the user can only
	# create project for Company that he/she belongs
		form = ProjectForm()
		user = request.user
		companys = Company.objects.filter(staffs__in = { user })
		form.fields['company'] = forms.ModelChoiceField(companys)
		return render(request, 'projectcm_core/project_new.html', {'form': form})

def	project_listall(request):
# this is different to listprojects above, it only list the projects 
# that are created by the user
	if not request.user.is_authenticated:
		context = {}
		return render(request, 'projectcm_core/listall.html', context)
	loginuser = request.user	
	project_list = Project.objects.filter(created_by=loginuser)
	context = {'project_manage_list': project_list,
		  }

	return render(request, 'projectcm_core/project_listall.html', context )

def	project_modify(request, projectid):
	# get the project object
	# create a form and load the instance = project
	# load the project_core/project_edit.html
	if request.method == "POST":
		form = ProjectForm(request.POST)
		if form.is_valid():
			projects = Project.objects.filter(id=projectid)
			project = projects[0]
			project.pjname = form['pjname'].value()
			project.company = Company.objects.get(id=form['company'].value())
			project.save()
		return redirect(request.META.get('HTTP_REFERER'))		
	
	project = Project.objects.filter(id=projectid)
	if project:
		form = ProjectForm(instance=project[0])
		return render(request, 'projectcm_core/project_edit.html', {'form': form})
	return HttpResponse("No Such Project") 

def	project_delete(request, projectid):
	# load the project using the projectid
	# delete it, 
	# and then redirect the user to project listall page
	project = Project.objects.filter(id=projectid)
	if project:
		project.delete()
	
	return redirect(request.META.get('HTTP_REFERER'))	
	
def	project_role_list(request, projectid):
	# load the project roles of this project.
	projects = Project.objects.filter(id=projectid)
	projectroles = ProjectRole.objects.filter(project__in=projects)

	return render(request, 'projectcm_core/project_role_list.html', {'project_role_list':projectroles })	

def	project_role_modify(request, projectid, roleid):
	# load the project roles of this project.
	# limit the user can only select project user from the same company
	
	# if it is a post method, save the changes
	if request.method == "POST":
		form = ProjectRoleForm(request.POST)
		if form.is_valid():
			roles = ProjectRole.objects.filter(id=roleid)
			role = roles[0]
			role.projectuser.id = form['projectuser'].value()
			role.projectrole = form['projectrole'].value()
			role.save()
		return redirect('project_role_list', projectid=projectid)		
	
	
	projects = Project.objects.filter(id=projectid)
	role = ProjectRole.objects.get(id=roleid)
	form = ProjectRoleForm(instance=role)
	company = projects[0].company
	staffincompany = User.objects.filter(company__id=company.id)
	form.fields['projectuser'] =  forms.ModelChoiceField(staffincompany)

	return render(request, 'projectcm_core/project_role_modify.html', {'form': form })	

def	project_role_add(request, projectid):
	# If it is post, create a new role, if it is get, display the role
	# template
	if request.method == "POST":
		form = ProjectRoleForm(request.POST)
		if form.is_valid():
			role = form.save(commit=False)
			role.project = Project.objects.get(id=projectid)
			role.save()
		return redirect('project_role_list', projectid=projectid)
			
	projects = Project.objects.filter(id=projectid)
	company = projects[0].company
	staffincompany = User.objects.filter(company__id=company.id)
	form = ProjectRoleForm()
	form.fields['projectuser'] = forms.ModelChoiceField(staffincompany)
	return render(request, 'projectcm_core/project_role_modify.html', {'form': form })

def	project_role_delete(request, projectid, roleid):
	# load the project using the projectid
	# delete it, 
	# and then redirect the user to project listall page
	roles = ProjectRole.objects.filter(id=roleid)
	if roles:
		roles.delete()
	
	return redirect('project_role_list', projectid=projectid)	

def	project_task_list(request, projectid):
	# load the project tasks of this project.
	projects = Project.objects.filter(id=projectid)
	projecttasks = Task.objects.filter(project__in=projects).order_by('projecttaskid')
	projectmembers = ProjectRole.objects.filter(project__in=projects)

	return render(request, 'projectcm_core/project_task_list.html', {'project_task_list':projecttasks, 'project': projects[0], 'projectmember':projectmembers })	

def	project_task_add(request, projectid):
	# If it is post, create a new task, if it is get, display the new task
	# template
	if request.method == "POST":
		form = ProjectTaskForm(request.POST)
		if form.is_valid():
			task = form.save(commit=False)
			task.project = Project.objects.get(id=projectid)
			task.save()
		return redirect('project_task_list', projectid=projectid)
			
	projects = Project.objects.filter(id=projectid)
	projectroles = ProjectRole.objects.filter(project__in=projects)
	projectmembers = User.objects.filter(projectrole__in=projectroles)
	form = ProjectTaskForm()
	form.fields['ownedby'] = forms.ModelChoiceField(projectmembers)
	return render(request, 'projectcm_core/project_task_modify.html', {'form': form })

def	project_task_member_modify(request, taskid):
	if request.method == "GET":
		#task = Task.objects.get(id=taskid)
		task = get_object_or_404(Task, pk=taskid)
		#form = ProjectTaskForm()
		form = ProjectTaskForm(instance=task)	
		return render(request, 'projectcm_core/project_task_modify.html', {'form': form })
	else:
		original_task = get_object_or_404(Task, pk=taskid)
		form = ProjectTaskForm(request.POST)
		if form.is_valid():
			task = form.save(commit=False)
			task.project = original_task.project
			task.save()
		return redirect('project_home')
		


def	project_task_up(request, projectid, taskid):
	task = Task.objects.get(id=taskid)
	if task:
		task.moveup()
	
	return redirect('project_task_list', projectid=projectid)

def	project_task_down(request, projectid, taskid):
	task = Task.objects.get(id=taskid)
	if task:
		task.movedown()
	
	return redirect('project_task_list', projectid=projectid)

def	project_task_modify(request, projectid, taskid):
	if request.method == "POST":
		form = ProjectTaskForm(request.POST)
		if form.is_valid():
			task = Task.objects.get(id=taskid)
			if task:
				task.project = Project.objects.get(id=projectid)
				task.taskname = form['taskname'].value()
				task.description = form['taskdescription'].value()
				if form['plannedstartdate'].value() == "":
					task.plannedstartdate = None
				else: 
					task.plannedstartdate = datetime.strptime(form['plannedstartdate'].value(), "%Y-%m-%d").date()
				task.plannedcompletedate = datetime.strptime(form['plannedcompletedate'].value(), "%Y-%m-%d").date()
				if form['actualstartdate'].value() == "":
					task.actualstartdate = None
				else:
					task.actualstartdate = datetime.strptime(form['actualstartdate'].value(), "%Y-%m-%d").date()
				if form['actualcompletedate'].value() == "":
					task.actualcompletedate = None
				else:
					task.actualcompletedate = datetime.strptime(form['actualcompletedate'].value(), "%Y-%m-%d").date()
				
				task.ownedby = User.objects.get(id=form['ownedby'].value())
				if form['plannedresource'].value() == "":
					task.plannedresource = None
				else:
					task.plannedresource = form['plannedresource'].value()
				if form['actualresource'].value() == "":
					task.actualresource = None
				else:
					task.actualresource = form['actualresource'].value()
				task.taskstatus = form['taskstatus'].value() 
				task.save()
	return redirect('project_task_list', projectid=projectid)

def	project_task_delete(request, projectid, taskid):
	# load the task id and then
	# delete it, 
	# and then redirect the user to project task list  page
	tasks = Task.objects.filter(id=taskid)
	if tasks:
		tasks.delete()
	
	return redirect('project_task_list', projectid=projectid)	

def	project_show(request, projectid):
	# load the project task

	# work out the resource chart info

	# work out the critical notes

	# parse the task and the resource info for rendering gantt and resource chart
	
	# plot the resource chart
	
	context = {}

	if not request.user.is_authenticated:
		return render(request, 'projectcm_core/project_show.html', context)

	loginuser = request.user	
	projects_in_role = ProjectRole.objects.filter(projectuser=loginuser).values("project")
	project_list = Project.objects.filter(id__in=projects_in_role)

	# load the project tasks of this project.
	projects = Project.objects.filter(id=projectid)
	projecttasks = Task.objects.filter(project__in=projects).order_by('projecttaskid')
	projectmembers = ProjectRole.objects.filter(project__in=projects)

	return render(request, 'projectcm_core/project_show.html', {'project_task_list':projecttasks, 'project': projects[0], 'projectmember':projectmembers, 'project_list':project_list })	



