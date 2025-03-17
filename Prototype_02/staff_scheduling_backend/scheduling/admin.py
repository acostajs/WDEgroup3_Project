from django.contrib import admin
from .models import User, Schedule, Performance

admin.site.register(User)
admin.site.register(Schedule)
admin.site.register(Performance)
