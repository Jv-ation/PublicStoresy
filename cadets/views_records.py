from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
from django.forms.models import model_to_dict
from django.core.exceptions import ObjectDoesNotExist
from cadets.models import IssueRecord, Cadet, Item
from django.db.models import Q
import json
import datetime


#serializes all records of IssueRecord table

def serialize_record(record):
    serialized = model_to_dict(record)
    serialized["issueDate"] = str(record.issueDate)
    serialized["issuingNCO"] = str(record.issuingNCO)
    serialized["issuedTO"] = str(record.issuedTO)
    serialized["itemID"] = str(record.itemID)
    serialized["specificID"] = str(record.specificID)
    return serialized


#separate function for POST and PUT to copy data from fields after verified to be correct data
def save_record(request, record, success_status):
    specificID = request.data.get("specificID")
    errors = []
    #These errors will be displayed in the browser console if there is an error, on the frontend an error alert will also display
    userIssuingNCO = request.data.get("issuingNCO", "")
    if userIssuingNCO == "":
        errors.append({"issuingNCO": "This field is required"})

    userIssuedTO = request.data.get("issuedTO", "")
    if userIssuedTO == "":
        errors.append({"issuedTO": "This field is required"})

    userItemID = request.data.get("itemID", "")
    if userItemID == "":
        errors.append({"itemID": "This field is required"})

    if len(errors) > 0:
        return HttpResponse(json.dumps(
            {
                "errors": errors
            }), status=status.HTTP_400_BAD_REQUEST)

    try:

        # use issuedTO to get an instance of a cadet from the Cadet table, same for ItemID
        cadetRecord = Cadet.objects.get(name=userIssuedTO)
        print(userItemID.upper())
        itemRecord = Item.objects.get(itemID=userItemID.upper())
        # setting these instances to values in the IssueRecord table
        record.issuingNCO = userIssuingNCO
        record.issuedTO = cadetRecord
        record.itemID = itemRecord
        record.specificID = specificID
        record.save()
    #Exception for errors with requests
    except Exception as e:
        return HttpResponse(json.dumps(
            {
                "errors": {"IssueRecord": str(e)}
            }), status=status.HTTP_400_BAD_REQUEST)

    return HttpResponse(json.dumps({"data": serialize_record(record)}), status=success_status)


#API views for all requests starting with GET and POST
@api_view (['GET', 'POST'])
def records(request):

    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"Not authorized"}),
status=status.HTTP_401_UNAUTHORIZED)

    #All request are now made with a search and date paramaters which are blank when not specified
    if request.method == "GET":
        searchQuery = str(request.GET.get("search_content", ""))
        startDate = str(request.GET.get("start_date", ""))
        endDate = str(request.GET.get("end_date", ""))
        #For when a search string and dates are inputted
        if len(searchQuery) > 0 and len(startDate)*len(endDate) > 0:
            records_data = IssueRecord.objects.filter(
                #OR based queries 'anded' with the date range
                Q(issuedTO__name__icontains=searchQuery)&Q(issueDate__range=[startDate, endDate])|
                Q(recordID__icontains=searchQuery)&Q(issueDate__range=[startDate, endDate])|
                Q(issuingNCO__icontains=searchQuery)&Q(issueDate__range=[startDate, endDate])|
                Q(itemID__itemID__icontains=searchQuery)&Q(issueDate__range=[startDate, endDate])
                
            )
        #For when only a search term is specified
        elif len(searchQuery) > 0:
            records_data = IssueRecord.objects.filter(
                Q(issuedTO__name__icontains=searchQuery)|
                Q(recordID__icontains=searchQuery)|
                Q(issuingNCO__icontains=searchQuery)|
                Q(itemID__itemID__icontains=searchQuery)
            )
        #For when only a date range is specified, BOTH must be specified
        elif len(startDate)*len(endDate) > 0:
            records_data = IssueRecord.objects.filter(
            Q(issueDate__range=[startDate, endDate])
            )
        #When no values of date of search are provided
        else:
            records_data = IssueRecord.objects.all()
        
        #Setting data counts in order to display correct number on each page
        records_count = records_data.count()
        page_size = int(request.GET.get("page_size", "250"))
        page_no = int(request.GET.get("page_no", "0"))
        records_data = list(records_data[page_no * page_size:page_no * page_size + page_size])
        records_data = [serialize_record(record) for record in records_data]
        #Passing data in json format for frontend to handle
        return HttpResponse(json.dumps({"count": records_count, "data": records_data}), status=status.HTTP_200_OK)

    
    if request.method == "POST":
        #when POST requests are used no processing must be done, just the saving of the record
        record = IssueRecord()
        return save_record(request, record, status.HTTP_201_CREATED)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


    
@api_view(['GET', 'PUT', 'DELETE'])
def record(request, recordID):
    userRecordID = int(recordID)
    #A second check to prevent unauthorised editing, this should already have been handled on the front-end
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    try:
        #setting value of record variable for all request types
        record = IssueRecord.objects.get(recordID=recordID)
    except ObjectDoesNotExist:
        return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        #displays JSON to browser if type of request is GET
        return HttpResponse(json.dumps({"data": serialize_record(IssueRecord)}), status=status.HTTP_200_OK)

    if request.method == "PUT":
        return save_record(request, record, status.HTTP_200_OK)
        
    if request.method == "DELETE":
        record.delete()
        return HttpResponse(json.dumps({"detail": "deleted"}), status=status.HTTP_410_GONE)    
    #for when the method used is POST or another unrecognised method
    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)
