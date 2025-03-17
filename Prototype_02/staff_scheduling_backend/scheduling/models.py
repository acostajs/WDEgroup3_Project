from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.timezone import now
from django.conf import settings


class User(AbstractUser):
    role_choices = [
        ('admin', 'Admin'),
        ('staff', 'Staff'),
    ]
    role = models.CharField(max_length=10, choices=role_choices, default='staff')

class Performance(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.IntegerField()
    date = models.DateField(default=now)
    
class Schedule(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    shift_start = models.DateTimeField()
    shift_end = models.DateTimeField()
