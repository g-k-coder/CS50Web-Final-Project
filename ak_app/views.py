from django.shortcuts import render, reverse, redirect
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from django.http import HttpResponse, HttpResponseRedirect
from django.views.decorators.csrf import requires_csrf_token
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
import math
import json
from datetime import datetime
from asgiref.sync import async_to_sync
from aiohttp import ClientSession
import environ
from .forms import ChangeImageForm, CreateArticle, AddComment
from django.core.paginator import Paginator
from .models import User, WeatherData, NewsArticle, Comment, TAGS, Reply
from django.views.decorators.http import require_POST

# Initialise environment variables
env = environ.Env()
environ.Env.read_env()

# Create your views here.


def index(request):
    return render(request, 'ak_app/index.html')

# Must be named differently then the built-in 'login' function


def login_view(request):
    if request.method == 'GET':
        return render(request, 'ak_app/login.html')

    # Submission is not possible if the information is not valid
    username = request.POST["username"]
    password = request.POST["password"]

    try:
        User.objects.get(username=username)
    except AttributeError and User.DoesNotExist:
        return HttpResponseRedirect(reverse('login'))

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)

    return HttpResponseRedirect(reverse('index'))

# The user can't logout if not logged in


@login_required
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse('login'))


def register(request):
    if request.method == 'GET':
        return render(request, 'ak_app/login.html')

    username = request.POST["username"]
    email = request.POST["email"]
    first_name = request.POST['first_name']
    last_name = request.POST['last_name']
    password = request.POST["password"]

    try:
        # Register user
        # Instantiate User object
        user = User.objects.create_user(
            first_name=first_name,
            last_name=last_name,
            username=username,
            email=email,
            password=password,
        )
        user.save()
        # Log the user in
        login(request, user)
    except IntegrityError:
        return HttpResponseRedirect(reverse('login'))

    return HttpResponseRedirect(reverse('index'))


def validate(request, action: str):
    if request.method != 'POST' or action not in ['login', 'register']:
        return JsonResponse({'message': 'Invalid request.'}, status=400)

    # Convert JSON to Python dict
    request = json.loads(request.body)

    username = request['username']

    if action == 'register':
        email = request['email']

        checkUsername = User.objects.filter(username=username)
        checkEmail = User.objects.filter(email=email)

        if checkUsername is not None and checkEmail is not None:
            return JsonResponse({'message': 'Email and username are already in use.'}, status=202)
        elif checkEmail is not None:
            return JsonResponse({'message': 'Email is already in use.'}, status=202)
        elif checkUsername is not None:
            return JsonResponse({'message': 'Username is already in use.'}, status=202)

        return JsonResponse({'message': 'Email and username are available.'}, status=202)

    elif action == 'login':
        password = request['password']
        # Check if the login information is valid
        if authenticate(request, username=username, password=password) is not None:
            return JsonResponse({'message': 'Information valid'}, status=200)
        else:
            return JsonResponse({"message": "Username and/or password invalid."}, status=202)


def profile(request, username: str):
    try:
        user = User.objects.get(username=username)

        if request.user.username == user.username:
            form = ChangeImageForm(request.POST or None,
                                   request.FILES or None, instance=user)

            if request.method != 'POST':
                return render(request, 'ak_app/profile.html', {
                    'profileUser': user,
                    'form': form
                })

            if form.is_valid():
                form.save()

            return HttpResponseRedirect(f"/profile/{username}")
        else:
            return render(request, 'ak_app/profile.html', {
                'profileUser': user,
            })

    except User.DoesNotExist:
        return render(request, 'ak_app/profile.html', {
            'error': 'ERROR 404',
            'title': f"User @{username} doesn't exist",
            'username': username,
        })


@async_to_sync
async def callWeatherAPI():
    # Lat, Lon to Karlovac, Croatia, i.e., artist's hometown

    print(f"api_key={env('WEATHER_API')}")
    url = f"https://api.openweathermap.org/data/2.5/weather?lat=45.4929&lon=15.5553&units=metric&appid={env('WEATHER_API')}"

    print(f"URL = {url}")
    print('Call started.')
    async with ClientSession() as session:
        async with session.get(url) as response:
            print('Making API Call...')
            response = await response.read()
            print(response)
            return response.decode("unicode-escape")

    """ 
    Weather API response example
    {
        "coord":{"lon":15.5553,"lat":45.4929},
        "weather":[{"id":800,"main":"Clear","description":"clear sky","icon":"01n"}],
        "base":"stations",
        "main":{"temp":12.24,"feels_like":11.9,"temp_min":12.24,"temp_max":13.94,"pressure":1016,"humidity":91,"sea_level":1016,"grnd_level":1002},
        "visibility":10000,
        "wind":{"speed":0.96,"deg":263,"gust":0.92},
        "clouds":{"all":10},
        "dt":1682017511,
        "sys":{"type":1,"id":6816,"country":"HR","sunrise":1681963457,"sunset":1682012932},
        "timezone":7200,
        "id":3198259,
        "name":"Karlovac",
        "cod":200
    }
    """


def weather(request):
    if request.method != 'POST':
        return JsonResponse({'message': 'Invalid request, only POST supported'}, status=400)

    now = datetime.now()

    # * First check if the user is eligible for another API call,
    # * if so make the API call and update DB(time, data),
    # * otherwise get and return data from the previous call

    try:
        last_call = WeatherData.objects.all().last()
    except WeatherData.DoesNotExist:
        data = callWeatherAPI()
        WeatherData.create(data)
        return JsonResponse({'message': 'Success', 'data': data}, status=201)

    if last_call is not None:
        if last_call.time.day != now.day:
            # Only keep track of the latest call, lest to take up unnecessary space after some time
            WeatherData.objects.all().delete()
            data = callWeatherAPI()
            WeatherData.create(data)
            return JsonResponse({'message': 'Success', 'data': data}, status=201)

        return JsonResponse({'message': 'Success', 'data': last_call.data}, status=201)
    else:
        data = callWeatherAPI()
        WeatherData.create(data)
        return JsonResponse({'message': 'Success', 'data': data}, status=201)


def about(request):
    return render(request, 'ak_app/about.html')


def accolades(request):
    return render(request, 'ak_app/accolades.html')


def news(request, string=''):
    if request.user.is_staff:
        form = CreateArticle(request.POST or None, request.FILES or None, initial={
                             'publisher': request.user})

    if request.method == 'POST' and form.is_valid():
        form.save()
        article = NewsArticle.objects.filter(publisher=request.user).last()
        return HttpResponseRedirect(f"/news/article/{article.id}")

    query = None
    nomatch = None

    try:
        try:
            query = request.POST.get('q')
        except:
            raise Exception

        news_list = NewsArticle.objects.filter(
            title__contains=query).order_by('-date', 'views')

        if not len(news_list):
            nomatch = f"No matches found for '{query}'"
    except:
        if string:
            try:
                news_list = NewsArticle.objects.filter(
                    publisher=User.objects.get(username=string)).order_by('-date', 'views')
            except:
                news_list = NewsArticle.objects.filter(
                    tag=string).order_by('-date', 'views')
        else:
            news_list = NewsArticle.objects.all().order_by('-date', 'views')

    paginator = Paginator(news_list, 5)

    page_number = request.GET.get("page")
    news = paginator.get_page(page_number)

    num_pages = []
    if math.ceil(len(news_list)/5) > 1:
        for i in range(1, math.ceil(len(news_list)/5)+1):
            num_pages.append(i)

    return render(request, "ak_app/news.html", {
        "form": form,
        'news': news,
        'num_pages': num_pages,
        'authors': list(set([o.publisher for o in NewsArticle.objects.all()])),
        'tags': [o[0] for o in TAGS],
        'value': query if query is not None else '',
        'nomatch': nomatch,
    })


def article(request, id):
    article = NewsArticle.objects.get(id=id)

    article.views = article.views + 1
    article.save()

    if request.user.is_authenticated:
        form = AddComment(request.POST or None, initial={'user': request.user,
                                                         'article': article})

        if request.method == 'POST' and form.is_valid():
            form.save()
            return HttpResponseRedirect(f"/news/article/{id}")

        return render(request, 'ak_app/article.html', {
            'article': article,
            'form': form,
            'comments': Comment.objects.filter(article_id=id).order_by('-date'),
        })

    return render(request, 'ak_app/article.html', {
        'article': article,
        'comments': Comment.objects.filter(article_id=id),
    })


@require_POST
def add(request):
    user = request.user
    info = json.loads(request.body)
    content = info['content']

    if request.path == '/add':
        article_id = NewsArticle.objects.get(id=info['id'])
        Comment.create(
            user=user,
            article=article_id,
            content=content
        )

        comment = Comment.objects.filter(user=user).last()
    else:

        Reply.create(
            user=user,
            comment=Comment.objects.get(id=info['id']),
            content=content
        )

        comment = Reply.objects.filter(user=user).last()

    return JsonResponse({
        'message': "I've fetched successfully",
        'id': comment.id,
        'time': comment.date.strftime("%B %d, %Y at %H:%M UTC"),
        'content': comment.content,
    }, status=200)


@require_POST
def edit(request):
    user = request.user

    if request.path == '/edit':
        request = json.loads(request.body)
        print(request)
        pk = request['id']
        article = NewsArticle.objects.get(id=pk)
        article.body = request['content']
        article.save()

        return JsonResponse({
            'message': "I've fetched successfully",
        }, status=200)
    elif request.path == '/remove-article':
        NewsArticle.objects.get(id=request.POST.get('id')).delete()
        return HttpResponseRedirect(reverse('news'))


def delete_profile(request):
    User.objects.get(id=request.user.id).delete()
    return HttpResponseRedirect(reverse('login'))
