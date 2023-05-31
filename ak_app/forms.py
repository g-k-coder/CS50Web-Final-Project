from django import forms
from .models import User, NewsArticle, Comment, Reply


class ChangeImageForm(forms.ModelForm):
    """ Change profile image """
    username = forms.CharField(widget=forms.HiddenInput())
    image = forms.ImageField(label='')

    class Meta:
        model = User
        fields = ('username', 'image')


class CreateArticle(forms.ModelForm):
    """ Publish a news article """

    class Meta:
        model = NewsArticle
        fields = '__all__'
        exclude = ('views', 'date')
        widgets = {
            'publisher': forms.HiddenInput(),
            'body': forms.Textarea(
                attrs={
                    'class': 'editor',
                    'id': 'newsForm',
                }),
        }
        labels = {
            'title': 'Article Title',
            'body': 'Article Body',
            'thumbnail': 'Article Thumbnail',
            'tag': 'Article Tag'
        }


class AddComment(forms.ModelForm):

    class Meta:
        model = Comment
        fields = '__all__'
        exclude = ('date',)
        widgets = {
            'user': forms.HiddenInput(),
            'article': forms.HiddenInput(),
            'content': forms.Textarea(
                attrs={
                    'class': 'editor',
                    'id': 'commentForm',
                }),
        }
        labels = {
            'content': '',
        }


class AddReply(forms.ModelForm):

    class Meta:
        model = Reply
        exclude = ('date',)
        widgets = {
            'user': forms.HiddenInput(),
            'comment': forms.HiddenInput(),
        }
