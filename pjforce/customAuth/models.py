from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
#from django.contrib.auth.backends import ModelBackend


# Create your models here.

class CustomUserManager(BaseUserManager):
	def create_user(self, email, password=None):
		if not email:
			raise ValueError('Users must have an email address')
		user = self.model(
			email = self.normalize_email(email),
			username = self.normalize_email(email),
		)
		user.set_password(password)
		user.save(using=self._db)
		return user
	def create_superuser(self, email, password):
		user = self.create_user(
			email,
			password=password,
		)
		user.is_admin=True
		user.save(using=self._db)
		return user



class User(AbstractUser):
	email = models.EmailField(
		verbose_name='email address',
		max_length=255,
		unique=True,
	)
	date_of_birth = models.DateField(null=True)
	is_active = models.BooleanField(default=True)
	is_admin = models.BooleanField(default=False)
	objects = CustomUserManager()
	USERNAME_FIELD = 'email'
	REQUIRED_FIELDS = ['password']
	def get_full_name(self):
		return self.email
	def get_short_name(self):
		return self.email
	def __str__(self):
		return self.email
	def has_perm(self, perm, obj=None):
		return True
	def has_module_perms(self, app_label):
		return True
	@property
	def is_staff(self):
		return self.is_admin

class customUserBackend:
	def authenticate(self, request, username=None, uid=None):
		user = None
		try:
			user = User.objects.get(email=username,socialaccount__uid=uid)
			print("Hello from customUserBackend")
		except User.DoesNotExist:
			print("No such user")
		return user
	def get_user(self, user_id):
		try:
			return User.objects.get(pk=user_id)
		except User.DoesNotExist:
			return None
