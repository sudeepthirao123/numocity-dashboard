from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    role = models.CharField(max_length=50, default='user') # 'user' or 'operator'
    wallet = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

class Station(models.Model):
    name = models.CharField(max_length=150)
    status = models.CharField(max_length=50, default='Available')
    power = models.CharField(max_length=50)
    type = models.CharField(max_length=50)
    location = models.CharField(max_length=150)

    def __str__(self):
        return self.name

class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    station = models.ForeignKey(Station, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    energy = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)
