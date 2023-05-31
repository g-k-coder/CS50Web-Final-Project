from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, NewsArticle, Comment, Reply
    
@admin.register(NewsArticle)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['id', 'publisher', 'title']
    list_per_page = 10
        
admin.site.register(User, UserAdmin)
admin.site.register(Comment)
admin.site.register(Reply)