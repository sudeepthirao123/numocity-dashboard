from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import User, Station, Transaction
from .serializers import UserSerializer, StationSerializer, TransactionSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class StationViewSet(viewsets.ModelViewSet):
    queryset = Station.objects.all()
    serializer_class = StationSerializer

    @action(detail=True, methods=['post'])
    def toggle(self, request, pk=None):
        station = self.get_object()
        if station.status == 'Offline':
            station.status = 'Available'
        else:
            station.status = 'Offline'
        station.save()
        return Response({'status': station.status})

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    def create(self, request, *args, **kwargs):
        # Transaction Logic: Deduct Wallet & Update Station
        user_id = request.data.get('user')
        station_id = request.data.get('station')
        amount = request.data.get('amount')
        
        user = User.objects.get(id=user_id)
        station = Station.objects.get(id=station_id)
        
        if user.wallet < float(amount):
            return Response({'error': 'Insufficient funds'}, status=400)
            
        user.wallet -= float(amount)
        user.save()
        
        station.status = 'Occupied'
        station.save()
        
        return super().create(request, *args, **kwargs)
