from django import template
from ak_app.models import Comment, NewsArticle, Reply
from ak_app.forms import AddReply

register = template.Library()


@register.filter
def datetime(date):
    return date.strftime('%b %d, %Y at %H:%M UTC')


@register.filter
def num_comments(id):
    comments = Comment.objects.filter(article_id=id)

    replies = 0
    for comment in comments:
        if Reply.objects.filter(comment_id=comment.id):
            replies += 1

    return len(comments) + replies

@register.filter
def num_articles(id):
    return len(NewsArticle.objects.filter(publisher_id=id))


@register.filter
def num_tags(tag):
    return len(NewsArticle.objects.filter(tag=tag))


@register.simple_tag
def get_replies(id):
    return Reply.objects.filter(comment_id=id).order_by('-date')


@register.filter
def num_replies(comment):
    return len(Reply.objects.filter(comment=comment))