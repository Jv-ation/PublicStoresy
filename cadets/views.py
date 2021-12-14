from django.shortcuts import render

#forcing a redirect if no URL is specified
def index(request):
    context = {}
    return render(request, "redirect.html", context=context)

#Posts the login.html when directed to /login
def login_view(request):
    context = {}
    return render(request, "login.html", context=context)

#sends the records.html when directed to /records (automatically done after login)
def records(request):
    context = {}
    return render(request, "records.html", context=context)

#sends the items.html when directed to /items
def items(request):
    context = {}
    return render(request, "items.html", context=context)

#sends the cadets.html when directed to /cadets
def cadets(request):
    context = {}
    return render(request, "cadets.html", context=context)

#handles 404 errors
def handler404(request, exception):
    context = {}
    return render(request, "handler404.html", context=context)

#showcase views
def showcase(request):
    context = {}
    return render(request, "showcase.html", context=context)