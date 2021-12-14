#This is a separate views file for fetching the values of cadets for the dropdown box of Cadet Name on the front end
from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
from django.forms.models import model_to_dict

from cadets.models import Cadet, Item

import json

#Serializes cadet but only the name value
def serialize_cadet(cadet):
    serialized = model_to_dict(cadet)
    serialized["name"] = str(cadet.name)
    return serialized

#API for this request which only accepts GET methods, however we accept POST PUT and DELETE requests in order to display the bad request response
@api_view (['GET', 'POST', 'PUT', 'DELETE'])
def getRequested(request):
    if request.method == 'GET':

        dropdowns = Cadet.objects.all()
        dropdowns = list(dropdowns)
        dropdowns = [serialize_cadet(cadet) for cadet in dropdowns]

        return HttpResponse(json.dumps({"dropdowns": dropdowns}), status=status.HTTP_200_OK)
    else: 
        return HttpResponse(json.dumps(status=status.HTTP_400_BAD_REQUEST))