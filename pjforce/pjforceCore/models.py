from django.db import models
from django.db.models import Max, Q
from django.contrib.auth.models import Group
from customAuth.models import User



class Holiday(models.Model):
        name = models.CharField(max_length=50, default="default")
        sundayWork = models.BooleanField(default=False)
        saturdayWork = models.BooleanField(default=False)
        fridayWork = models.BooleanField(default=True)
        thursdayWork = models.BooleanField(default=True)
        wednesdayWork = models.BooleanField(default=True)
        tuesdayWork = models.BooleanField(default=True)
        mondayWork = models.BooleanField(default=True)
        def __str__(self):
                return self.name

class Company(models.Model):
        company_type_choice = (
                ["Private", "Private Company"],
                ["Public", "Public Company"],
        )

        company_type = models.CharField(max_length=20, choices=company_type_choice, default="Private")
        company_name = models.CharField(max_length=100)
        staffs = models.ManyToManyField(User, blank=True)
        company_group = models.ForeignKey(Group, on_delete=models.CASCADE, null=True, blank=True, default=None)
        holiday = models.ForeignKey(Holiday, on_delete=models.CASCADE, null=True, blank=True, default=None)
        def __str__(self):
                return self.company_name
        def save(self, *args, **kwargs):
                super().save(*args, **kwargs)
                if self.company_group == None:
                        newgroup = Group()
                        newgroup.name = str(self.id) + "_" + self.company_name + "_Admin"
                        newgroup.save()
                        self.company_group = newgroup
                        super().save(*args, **kwargs)

class Project(models.Model):
        pjname = models.CharField(max_length=20)
        company = models.ForeignKey(Company, on_delete=models.CASCADE,)
        created_by = models.ForeignKey(User, on_delete=models.CASCADE, default=None, null=True)
        def __str__(self):
                return self.company.company_name + ":" + self.pjname
        def save(self, *args, **kwargs):
                super().save(*args, **kwargs)
                #if after save, the project created_by is changed and the created_by person has no role, add a role for this user
                if not ProjectRole.objects.filter(project__id=self.id, projectuser__id=self.created_by.id):
                        role = ProjectRole()
                        role.project = self
                        role.projectuser = self.created_by
                        role.save()

class ProjectRole(models.Model):
        PM = 'PM'
        MEMBER = 'Member'
        STACKHOLDER = 'Stackholder'
        projectuser = models.ForeignKey(User, on_delete=models.CASCADE,)
        projectrole_choice = (
                (PM, 'Project Manager'),
                (MEMBER, 'Project Member'),
                (STACKHOLDER, 'Project Stackholder'),
        )
        projectrole = models.CharField(max_length=20, choices=projectrole_choice, default=STACKHOLDER)
        project = models.ForeignKey(Project, on_delete=models.CASCADE,)

class Task(models.Model):
        OPEN = 'OPEN'
        INPROGRESS = 'INPROGRESS'
        COMPLETED = 'COMPLETED'
        taskstatus_choice = (
                (OPEN, 'Open - Not completed'),
                (INPROGRESS, 'Work In Progress'),
                (COMPLETED, 'Completed'),
        )
        taskname = models.CharField(max_length=40)
        taskdescription = models.TextField(max_length=100, null=True, blank=True)
        plannedstartdate = models.DateField(null=True,blank=True, default=None)
        plannedcompletedate = models.DateField(null=True,blank=True, default=None)
        actualstartdate = models.DateField(null=True,blank=True, default=None)
        actualcompletedate = models.DateField(null=True,blank=True, default=None)
        ownedby = models.ForeignKey(User, on_delete=models.SET_NULL, default=None, blank=True,null=True)
        project = models.ForeignKey(Project, on_delete=models.CASCADE,)
        projecttaskid = models.IntegerField(default=None, editable=False, null=True)
        dependencetask = models.ForeignKey('self', default=None, blank=True, null=True, on_delete=models.SET_NULL)
        plannedresource = models.DecimalField(null=True, blank=True, decimal_places=2, max_digits=6, default=None)
        actualresource = models.DecimalField(null=True, blank=True, decimal_places=2, max_digits=6, default=None)
        taskstatus = models.CharField(max_length=20, choices=taskstatus_choice, default='OPEN')
        def moveup(self):
                # if it is a move up, swap the project task id with the previous numbered project task id
                this_task_num = self.projecttaskid
                max_task_num = Task.objects.filter(project = self.project).aggregate(Max('projecttaskid'))

                if not this_task_num:
                        if max_task_num:
                                self.projecttaskid = max_task_num['projecttaskid__max'] + 1
                                self.save()
                        else:
                                self.projecttaskid = 1
                                self.save()
                else:
                        previous_task = Task.objects.filter(Q(project = self.project), Q(projecttaskid__lt = this_task_num)).order_by('-projecttaskid')
                        if previous_task:
                                previous_task_num = previous_task[0].projecttaskid
                                previous_task[0].projecttaskid = this_task_num
                                self.projecttaskid = previous_task_num
                                previous_task[0].save()
                                self.save()
                         #otherwise, do nothing, can not move up anymore.

        def movedown(self):
                # if it is a move up, swap the project task id with the previous numbered project task id
                this_task_num = self.projecttaskid
                max_task_num = Task.objects.filter(project = self.project).aggregate(Max('projecttaskid'))

                if not this_task_num:
                        if max_task_num:
                                self.projecttaskid = max_task_num['projecttaskid__max'] + 1
                                self.save()
                        else:
                                self.projecttaskid = 1
                                self.save()
                else:
                        next_task = Task.objects.filter(Q(project = self.project), Q(projecttaskid__gt = this_task_num)).order_by('projecttaskid')
                        if next_task:
                                next_task_num = next_task[0].projecttaskid
                                next_task[0].projecttaskid = this_task_num
                                self.projecttaskid = next_task_num
                                next_task[0].save()
                                self.save()
                         #otherwise, do nothing, can not move down anymore.


        def save(self):
                # assign a project next task id for this task if this field is empty
                if not self.projecttaskid:
                        if self.project:
                                max_task_num = Task.objects.filter(project = self.project).aggregate(Max('projecttaskid'))
                                if max_task_num['projecttaskid__max'] == None:
                                        self.projecttaskid = 1
                                else:
                                        self.projecttaskid = max_task_num['projecttaskid__max'] + 1
                if self.actualstartdate and self.actualcompletedate:
                        # if actual start date and complete date are present
                        # change the project status to completed
                        self.taskstatus = self.COMPLETED
                if self.actualstartdate and not self.actualcompletedate:
                        self.taskstatus = self.INPROGRESS

                super().save()

