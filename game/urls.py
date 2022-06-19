import imp
from multiprocessing.spawn import import_main_path
from django.urls import path
from game.views import index,play
urlpatterns = [
    path('', index, name="index"),
    path('play/', play, name ="play"),
]
