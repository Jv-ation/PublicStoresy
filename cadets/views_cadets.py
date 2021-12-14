from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
from django.forms.models import model_to_dict
from django.core.exceptions import ObjectDoesNotExist
from cadets.models import Cadet
from django.db.models import Q
import json

def serialize_cadet(cadet):
    serialized = model_to_dict(cadet)
    serialized["cadetNo"] = str(cadet.cadetNo)
    serialized["name"] = str(cadet.name)
    serialized["yearGroup"] = str(cadet.yearGroup)
    serialized["section"] = str(cadet.section)
    serialized["registrationDate"] = str(cadet.registrationDate)
    return serialized

#separate function for POST and PUT to copy data from fields after verified to be correct data
def save_record(request, cadet, success_status):
    errors = []
    #These errors will be displayed in the browser console if there is an error, on the frontend an error alert will also display
    userName = request.data.get("name", "")
    if userName == "":
        errors.append({"name": "This field is required"})

    userYearGroup = request.data.get("yearGroup", "")
    if userYearGroup == "":
        errors.append({"yearGroup": "This field is required"})

    userSection = request.data.get("section", "")
    if userYearGroup == "":
        errors.append({"section": "This field is required"})


    if len(errors) > 0:
        #throughout the views files returns on error events are shown, these are logged in the browser console for user debugging
        return HttpResponse(json.dumps(
            {
                "errors": errors
            }), status=status.HTTP_400_BAD_REQUEST)
    


    try:
        #saving item properties inputted
        cadet.name = userName
        cadet.yearGroup = userYearGroup
        cadet.section = userSection
        cadet.save()
    #Exception for errors with requests
    except Exception as e:
        return HttpResponse(json.dumps(
            {
                "errors": {"Cadet": str(e)}
            }), status=status.HTTP_400_BAD_REQUEST)

    return HttpResponse(json.dumps({"data": serialize_cadet(cadet)}), status=success_status)


#API views for all requests starting with GET and POST
@api_view (['GET', 'POST'])
def cadets(request):

    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    #All request are now made with a search and date paramaters which are blank when not specified
    if request.method == "GET":
        
        searchQuery = str(request.GET.get("search_content", ""))
        startDate = str(request.GET.get("start_date", ""))
        endDate = str(request.GET.get("end_date", ""))
        #For when a search string and dates are inputted
        if len(searchQuery) > 0 and len(startDate)*len(endDate) > 0:
            cadets_data = Cadet.objects.filter(
                #OR based queries 'anded' with the date range
                Q(name__icontains=searchQuery)&Q(registrationDate__range=[startDate, endDate])|
                Q(section__icontains=searchQuery)&Q(registrationDate__range=[startDate, endDate])|
                Q(yearGroup__icontains=searchQuery)&Q(registrationDate__range=[startDate, endDate])|
                Q(cadetNo__icontains=searchQuery)&Q(registrationDate__range=[startDate, endDate])
            )

        elif len(searchQuery) > 0:
            cadets_data = Cadet.objects.filter(
                #OR based queries 'anded' with the date range
                Q(name__icontains=searchQuery)|
                Q(section__icontains=searchQuery)|
                Q(yearGroup__icontains=searchQuery)|
                Q(cadetNo__icontains=searchQuery)
                )
        
        elif len(startDate)*len(endDate) > 0:
            cadets_data = Cadet.objects.filter(
            Q(registrationDate__range=[startDate, endDate])
            )

        else:
        
            cadets_data = Cadet.objects.all()
        
        #Setting data counts in order to display correct number on each page
        cadets_count = cadets_data.count()
        page_size = int(request.GET.get("page_size", "25"))
        page_no = int(request.GET.get("page_no", "0"))
        cadets_data = list(cadets_data[page_no * page_size:page_no * page_size + page_size])
        cadets_data = [serialize_cadet(cadet) for cadet in cadets_data]
        #Passing data in json format for frontend to handle
        return HttpResponse(json.dumps({"count": cadets_count, "data": cadets_data}), status=status.HTTP_200_OK)

    
    if request.method == "POST":
        #when POST requests are used no processing must be done, just the saving of the item
        cadet = Cadet()
        return save_record(request, cadet, status.HTTP_201_CREATED)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


    
@api_view(['GET', 'PUT', 'DELETE'])
def cadet(request,cadetNo):
    userCadetNo = int(cadetNo)
    #A second check to prevent unauthorised editing, this should already have been handled on the front-end
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    try:
        #setting value of cadet variable for all request types
        cadet = Cadet.objects.get(cadetNo=cadetNo)
    except ObjectDoesNotExist:
        return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        #displays JSON to browser if type of request is GET
        return HttpResponse(json.dumps({"data": serialize_cadet(Cadet)}), status=status.HTTP_200_OK)

    if request.method == "PUT":
        return save_record(request, cadet, status.HTTP_200_OK)
        
    if request.method == "DELETE":
        cadet.delete()
        return HttpResponse(json.dumps({"detail": "deleted"}), status=status.HTTP_410_GONE)    
    #for when the method used is POST or another unrecognised method
    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)