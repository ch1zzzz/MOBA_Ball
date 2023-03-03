from django.shortcuts import redirect
from django.core.cache import cache
from game.models.player.player import Player
from django.contrib.auth.models import User
from django.contrib.auth import login
from random import randint
import requests


def receive_code(request):
    #check state and get code
    data = request.GET
    code = data.get('code')
    state = data.get('state')
    if not cache.has_key(state):
        return redirect("index")
    cache.delete(state)

    # apply access token by code
    apply_access_token_url = 'https://www.acwing.com/third_party/api/oauth2/access_token/'
    params = {
        'appid': '4881',
        'secret': 'dd5a0cfcbe764cd8a1b2eddf6c86dc9c',
        'code': code
    }
    access_token_response = requests.get(apply_access_token_url, params=params).json()
    
    # require userinfo by token and openid
    access_token = access_token_response['access_token']
    openid = access_token_response['openid']
    players = Player.objects.filter(openid=openid)
    if players.exists(): # player exists
        login(request, players[0].user)
        return redirect("index")
    
    #player not exists
    get_user_info = 'https://www.acwing.com/third_party/api/meta/identity/getinfo/'
    token_params = {
        'access_token': access_token,
        'openid': openid
    }
    userinfo_res = requests.get(get_user_info, params=token_params).json()
    username = userinfo_res['username']
    photo = userinfo_res['photo']

    #create a new username that never exists for the new user
    while User.objects.filter(username=username).exists():
        username += str(randint(0, 9))
    
    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)

    login(request, user)

    return redirect("index")