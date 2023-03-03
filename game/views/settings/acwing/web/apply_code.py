from django.http import JsonResponse
from urllib.parse import quote
from random import randint

def get_state():
    res = ''
    for i in range(8):
        res += str(randint(0, 9))
    return res

# redis cache
from django.core.cache import cache

def apply_code(request):
    appid = "4881"
    # url to receive the code
    redirect_uri = quote('https://app4881.acapp.acwing.com.cn/settings/acwing/web/receive_code/')
    # require field for user
    scope = "userinfo"
    # random number to check the identity of the web that send the code
    state = get_state()
    # store the state in redis for 2 hours
    cache.set(state, True, 7200)

    # web for require code
    apply_code_url = "https://www.acwing.com/third_party/api/oauth2/web/authorize/"
    return JsonResponse({
        'result': 'success',
        'apply_code_url': apply_code_url + "?appid=%s&redirect_uri=%s&scope=%s&state=%s" % (appid, redirect_uri, scope, state)
    })