from django.contrib import admin

# Register your models here.

from projectcm_core.models import Company, Project, Task, ProjectRole, Holiday

class CompanyAdmin(admin.ModelAdmin):
	list_display = ('company_name',)

class ProjectAdmin(admin.ModelAdmin):
	list_display = ('pjname',)

class TaskAdmin(admin.ModelAdmin):
	list_display = ('taskname',)

class ProjectRoleAdmin(admin.ModelAdmin):
	list_display = ('projectuser','projectrole','project',)

class HolidayAdmin(admin.ModelAdmin):
	list_display = ('name',)


admin.site.register(Company, CompanyAdmin)
admin.site.register(Project, ProjectAdmin)
admin.site.register(Task, TaskAdmin)
admin.site.register(ProjectRole, ProjectRoleAdmin)
admin.site.register(Holiday, HolidayAdmin)
