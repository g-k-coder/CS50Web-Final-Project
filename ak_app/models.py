from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid
from django_ckeditor_5.fields import CKEditor5Field

# Create your models here.


class User(AbstractUser):
    id = models.UUIDField(primary_key=True,
                          editable=False,
                          default=uuid.uuid4,
                          null=False)

    image = models.ImageField(upload_to='profile_pic/',
                              default='profile_pic/default-prof-pic.png')

    def __str__(self):
        return self.username

# Make call to Weather API available once a day


class WeatherData(models.Model):
    # The time of an API call
    time = models.DateTimeField(auto_now_add=True)

    # The response data from last Weather API call
    data = models.JSONField()

    @classmethod
    def create(cls, data):
        weather = cls(data=data)
        weather.save()
        return True


TAGS = [
    ('Aquarelle', 'Aquarelle'),
    ('Auction', 'Auction'),
    ('Award', 'Award'),
    ('Collaboration', 'Collaboration'),
    ('Contemporary Art', 'Contemporary Art'),
    ('Croatia', 'Croatia'),
    ('Fine Art', 'Fine Art'),
    ('France', 'France'),
    ('Ink', 'Ink'),
    ('International', 'International'),
    ('Japan', 'Japan'),
    ('Miscellaneous', 'Miscellaneous'),
    ('NFT', 'NFT'),
    ('New Ink Art', 'New Ink Art'),
    ('Painting', 'Painting'),
    ('Recognition', 'Recognition'),
    ('USA', 'USA'),
]


class NewsArticle(models.Model):
    publisher = models.ForeignKey(User,
                                  on_delete=models.CASCADE,
                                  verbose_name='Publisher',
                                  related_name='publisher')

    title = models.CharField(max_length=255,
                             blank=False,
                             null=False,
                             verbose_name="Article Title")

    body = CKEditor5Field(config_name='extends', blank=False, null=False)

    date = models.DateTimeField(auto_now_add=True,
                                verbose_name='Published on')

    views = models.IntegerField(default=0, verbose_name='Views')

    tag = models.CharField(choices=TAGS, verbose_name='Tag', max_length=25)

    thumbnail = models.ImageField(
        upload_to='thumbnail/', default='thumbnail/default-thumbnail.jpg')

    def __str__(self):
        return self.title


class Comment(models.Model):
    article = models.ForeignKey(
        NewsArticle, on_delete=models.CASCADE, related_name='comment_article')
    user = models.ForeignKey(User,
                             on_delete=models.CASCADE,
                             related_name='commented_by',
                             verbose_name='Commentator')
    content = CKEditor5Field(config_name='extends', blank=False, null=False)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.article.title + ' - ' + self.user.username

    @classmethod
    def create(cls, article, user, content):
        comment = cls(article=article, user=user, content=content)
        comment.save()
        return True


class Reply(models.Model):
    """ 
        Fields

        - Original Post (FK)    
        - User (FK)
        - Content (CKEditor5)
        - Date (DateTime)

        Methods

        - create new reply
    """

    comment = models.ForeignKey(
        Comment, on_delete=models.CASCADE, related_name='src_comment')
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='reply_user')
    content = CKEditor5Field(config_name='extends', blank=False, null=False)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username + ' ' + self.comment.article.title

    @classmethod
    def create(cls, comment, user, content):
        comment = cls(comment=comment, user=user, content=content)
        comment.save()
        return True

    class Meta:
        verbose_name_plural = 'Replies'
