from django import template
from django.template.defaultfilters import stringfilter
from django.contrib.auth.models import User, Group
from projectcm_core.models import Company

register = template.Library()

@register.filter
@stringfilter
def is_company_admin_filter(value):
	# lets find out if can pass a user object
	if value=="Correct" :
		return True
	return False

@register.simple_tag(takes_context=True)
def is_company_admin(context, user_name_string):
	user = User.objects.get(username = user_name_string)
	companies = Company.objects.filter(staffs__in = [user,])
	if companies.filter(company_group__in = user.groups.all()).exists():
		return True
	return False

