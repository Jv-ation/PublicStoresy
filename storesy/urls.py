from django.contrib import admin
from django.conf.urls import url
from django.conf import settings
from django.views.static import serve
from django.urls import path, include
from django.views.generic.base import RedirectView
from cadets import views
from . import settings
from cadets import views_records, views_dropdowns, views_items, views_cadets
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.staticfiles.storage import staticfiles_storage
from django.conf import settings


urlpatterns = [
    url(r'^static/(?P<path>.*)$', serve,{'document_root': settings.STATIC_ROOT}),
    path('admin/', admin.site.urls),
    #Authentication patterns
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('', views.index),
    path('login', views.login_view),
    #records related
    path('records', views.records),
    path('api/records/', views_records.records),
    path('api/records/<int:recordID>/', views_records.record),
    path('api/records/dropdowns', views_dropdowns.getRequested),
    #items related
    path('items', views.items),
    path('api/items/', views_items.items),
    path('api/items/<int:itemNo>/', views_items.item),
    #cadets related
    path('cadets', views.cadets),
    path('api/cadets/', views_cadets.cadets),
    path('api/cadets/<int:cadetNo>/', views_cadets.cadet),
    path('favicon.ico', RedirectView.as_view(url=staticfiles_storage.url("favicon.ico"))),
    #for the showcase
    path('layer1.svg', RedirectView.as_view(url=staticfiles_storage.url("layer1.svg"))),
    path('showcase', views.showcase),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

handler404 = 'cadets.views.handler404'