from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from .models import User
from django import forms

# Register your models here.
# This section change the admin page for User in the django admin page
#

class UserCreationForm(forms.ModelForm):
# This section modify the user creation form

	password1 = forms.CharField(label='Password',widget=forms.PasswordInput)
	password2 = forms.CharField(label='Password confirmation', widget=forms.PasswordInput)
	class Meta:
		model = User
		fields = ('email', 'date_of_birth')
	def clean_password2(self):
		password1 = self.cleaned_data.get('password1')
		password2 = self.cleaned_data.get('password2')
		if password1 and password2 and password1 != password2:
			raise forms.ValidationError('Passwords don\'t match')
		return password2
	def save(self, commit=True):
		user = super(UserCreationForm, self).save(commit=False)
		user.set_password(self.cleaned_data["password1"])
		if commit:
			user.save()
		return user

class UserChangeForm(forms.ModelForm):
# This section change user User's change form

	password = ReadOnlyPasswordHashField()
	class Meta:
		model = User
		fields = ('email', 'password', 'date_of_birth', 'is_active', 'is_admin')
	def clean_password(self):
		return self.initial['password']

class UserAdmin(BaseUserAdmin):
# We are overriding the UserAdmin class in the original auth contrib package

	form = UserChangeForm
	add_form = UserCreationForm
	list_display = ('email','date_of_birth', 'is_admin')
	list_filter = ('is_admin',)
	fieldsets = (
		(None, {'fields': ('email','password')}),
		('Personal info', {'fields': ('date_of_birth',)}),
		('Permissions', {'fields': ('is_admin',)}),
	)
	add_fieldsets = (
		(None, {
			'classes': ('wide',),
			'fields': ('email', 'date_of_birth', 'password1', 'password2')}
		),
	)
	search_fields = ('email',)
	ordering = ('email',)
	filter_horizontal = ()


admin.site.register(User, UserAdmin)
admin.site.unregister(Group)
