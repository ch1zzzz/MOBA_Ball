from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from game.models.player.player import Player

class PlayerView(APIView):

    def post(self, request):
        data = request.POST
        username = data.get("username", "").strip()
        password = data.get("password", "").strip()
        password_confirm = data.get("password_confirm", "").strip()
        if not username or not password:
            return Response({
                'result' : "Username or password can't be empty!"
            })
        if password != password_confirm:
            return Response({
                'result' : "Inconsistent password!"
            })
        if User.objects.filter(username=username).exists():
            return Response({
                'result' : "Username already exsits!"
            })
        user = User(username=username)
        user.set_password(password)
        user.save()
        Player.objects.create(user=user, photo="https://app4881.acapp.acwing.com.cn/static/image/settings/shiba.png")
        return Response({
            'result' : "success"
        })