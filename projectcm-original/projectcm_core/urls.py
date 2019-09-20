from django.urls import path

from . import views

urlpatterns = [
	path('', views.listprojects, name='project_home'),
	path('manage/company', views.company_manage_lists, name='company_manage'),
	path('manage/company/<int:companyid>/modify', views.company_manage_modify, name='company_manage_modify'),
	path('manage/company/<int:companyid>/modify/addstaff', views.add_staff_from_existing, name='add_staff_existing'),
	path('task/<int:taskid>', views.project_task_member_modify, name='task_modify'),
	path('<int:projectid>', views.project_show, name='project_show'),
	path('new', views.project_new, name='project_new'),
	path('manage', views.project_listall, name='project_listall'),
	path('manage/<int:projectid>/modify', views.project_modify, name='project_modify'),
	path('manage/<int:projectid>/delete', views.project_delete, name='project_delete'),
	path('manage/<int:projectid>/role', views.project_role_list, name='project_role_list'),
	path('manage/<int:projectid>/role/<int:roleid>/modify', views.project_role_modify, name='project_role_modify'),
	path('manage/<int:projectid>/role/add', views.project_role_add, name='project_role_add'),
	path('manage/<int:projectid>/role/<int:roleid>/delete', views.project_role_delete, name='project_role_delete'),
	path('manage/<int:projectid>/task', views.project_task_list, name='project_task_list'),
	path('manage/<int:projectid>/task/add', views.project_task_add, name='project_task_add'),
	path('manage/<int:projectid>/task/<int:taskid>/up', views.project_task_up),
	path('manage/<int:projectid>/task/<int:taskid>/down', views.project_task_down),
	path('manage/<int:projectid>/task/<int:taskid>/modify', views.project_task_modify, name='project_task_modify'),
	path('manage/<int:projectid>/task/<int:taskid>/delete', views.project_task_delete, name='project_task_delete'),
]
