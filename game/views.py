from django.http import HttpResponse

def index(request):
    line1 = '<h1 style="text-align: center"> Django project </h1>'
    line2 = '<img src = https://www.ruanyifeng.com/blogimg/asset/2018/bg2018020901.png width = 1000>'
    return HttpResponse(line1 + line2)

def play(request):
    line1 = '<h1 style="text-align: center"> My game </h1>' 
    line2 = '<img src = https://d29fhpw069ctt2.cloudfront.net/vector/5790/preview/preview-1400x1167.jpg width = 1000>'
    return HttpResponse(line1 + line2)