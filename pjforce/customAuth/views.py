from django.shortcuts import render
from django.http import JsonResponse
from django.views import View
from customAuth.models import customUserBackend
from django.contrib.auth import authenticate, login, logout
from customAuth.models import User, customUserBackend
from allauth.socialaccount.models import SocialAccount
import json
from datetime import datetime

# Create your views here.


class AjaxUserAuthView(View):
	def get(self, request):
			data = {
				'message': 'Success',
				'username': 'Testuser',
			}
			return JsonResponse(data)
	def post(self, request):
		try:
			social_email = request.POST['email']
			social_id = request.POST['uid']
			social_first_name = request.POST['first_name']
			social_last_name = request.POST['last_name']
			print("Email=" + social_email + "|ID=" + social_id + "|first=" + social_first_name + "|last=" + social_last_name)

			users = User.objects.filter(username=social_email)
			if not users.exists(): 
				print("Create a new user for this account")
				useraccount=User.objects.create_user(social_email, 'aBcd1234#')
				useraccount.first_name = social_first_name
				useraccount.last_name = social_last_name
				useraccount.save()
			else:
				useraccount = users[0]
			
			socialaccount, created = SocialAccount.objects.get_or_create(
					uid = social_id,
					provider = 'facebook',
					defaults = {
						'user': useraccount,
						'date_joined': datetime.now(),
					},
			)
			socialaccount.user = useraccount
			socialaccount.last_login = datetime.now()
			socialaccount.save()
			authenticatedUser = authenticate(request, username=useraccount.username, uid=socialaccount.uid)
			data = {
				'message': 'None'
			}
			if authenticatedUser:
				login(request, user=authenticatedUser)
				data = {
					'message': 'OK'
				}
			else:
				data = {
					'message': 'Can not login user'
				}
		
			return JsonResponse(data)
		except Exception as e:
			print(e)
			data = {
				'message': 'Error'
			}
			return JsonResponse(data)

authenticateByAjax = AjaxUserAuthView.as_view()
