from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login', views.login_view, name='login'),
    path('register', views.register, name='register'),
    path('validateCredentials/<str:action>', views.validate, name='validate'),
    path('profile/<str:username>', views.profile, name='profile'),
    path('weather', views.weather, name='weather'),
    path('logout', views.logout_view, name='logout'),
    path('about', views.about, name='about'),
    path('accolades', views.accolades, name='accolades'),
    path('news', views.news, name='news'),
    path('news/article/<int:id>', views.article, name='article'),
    path('news/<str:string>', views.news, name='author'),
    path('add', views.add, name='add'),
    path('reply', views.add, name='reply'),
    path('delete', views.delete_profile, name='delete-profile'),
    path('edit', views.edit, name='edit'),
    path('remove-article', views.edit, name='remove-article'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
