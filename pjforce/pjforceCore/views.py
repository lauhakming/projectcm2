from django.shortcuts import render, redirect
# Create your views here.

def	index(request):
	return render(request, 'home.html', {})

def	index2(request):
	return redirect("https://www.facebook.com/v4.0/dialog/oauth?client_id=22252858575642484")


