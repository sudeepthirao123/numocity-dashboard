from rest_framework import serializers
from .models import User, Station, Transaction

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'wallet']

class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    station_name = serializers.ReadOnlyField(source='station.name')
    
    class Meta:
        model = Transaction
        fields = ['id', 'user', 'station', 'station_name', 'amount', 'energy', 'timestamp']
