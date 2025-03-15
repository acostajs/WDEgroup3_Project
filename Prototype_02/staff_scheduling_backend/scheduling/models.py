from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = [('staff', 'Staff'), ('manager', 'Manager')]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

class Schedule(models.Model):
    employee = models.ForeignKey(User, on_delete=models.CASCADE)
    shift_start = models.DateTimeField()
    shift_end = models.DateTimeField()

class Performance(models.Model):
    employee = models.ForeignKey(User, on_delete=models.CASCADE)
    efficiency_score = models.FloatField()
    attendance = models.IntegerField()
