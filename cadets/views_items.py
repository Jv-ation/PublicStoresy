from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
from django.forms.models import model_to_dict
from django.core.exceptions import ObjectDoesNotExist
from cadets.models import Item, IssueRecord
from django.db.models import Q
import json


def serialize_item(item):
    serialized = model_to_dict(item)
    serialized["itemID"] = str(item.itemID)
    serialized["size"] = str(item.size)
    serialized["type"] = str(item.type)
    serialized["totalQuantity"] = str(item.totalQuantity)
    issuedCount = IssueRecord.objects.filter(itemID__itemID__icontains=item.itemID).count()
    serialized["quantityIssued"] = str(issuedCount)
    itemsInStores = int(item.totalQuantity) - int(issuedCount)
    serialized["itemInStores"] = str(itemsInStores)

    return serialized

# separate function for POST and PUT to copy data from fields after verified to be correct data


def save_record(request, item, success_status):
    errors = []
    # These errors will be displayed in the browser console if there is an error, on the frontend an error alert will also display
    userItemID = request.data.get("itemID", "")
    if userItemID == "":
        errors.append({"itemID": "This field is required"})

    userSize = request.data.get("size", "")
    if userSize == "":
        errors.append({"size": "This field is required"})

    userType = request.data.get("type", "")
    if userType == "":
        errors.append({"type": "This field is required"})

    userQuantity = request.data.get("totalQuantity", "")
    if int(userQuantity) < 0:
        errors.append({"quantity": "Quantity must be 0 or greater"})
    elif len(str(userQuantity)) < 1:
        errors.append({"quantity": "This field is required"})

    if len(errors) > 0:
        return HttpResponse(json.dumps(
            {
                "errors": errors
            }), status=status.HTTP_400_BAD_REQUEST)

    try:
        # saving item properties inputted
        item.itemID = userItemID
        item.size = userSize
        item.type = userType
        item.totalQuantity = userQuantity
        item.save()
    # Exception for errors with requests
    except Exception as e:
        return HttpResponse(json.dumps(
            {
                "errors": {"Item": str(e)}
            }), status=status.HTTP_400_BAD_REQUEST)

    return HttpResponse(json.dumps({"data": serialize_item(item)}), status=success_status)


# API views for all requests starting with GET and POST
@api_view(['GET', 'POST'])
def items(request):

    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"Not authorized"}),
                            status=status.HTTP_401_UNAUTHORIZED)

    # All request are now made with a search and date paramaters which are blank when not specified
    if request.method == "GET":
        searchQuery = str(request.GET.get("search_content", ""))
        # For when a search string and dates are inputted
        print(searchQuery)
        if len(searchQuery) > 0:
            items_data = Item.objects.filter(
                # OR based queries 'anded' with the date range
                Q(itemID__icontains=searchQuery) |
                Q(size__icontains=searchQuery) |
                Q(type__icontains=searchQuery) |
                Q(totalQuantity__icontains=searchQuery)

            )

        else:

            items_data = Item.objects.all()

        # Setting data counts in order to display correct number on each page
        items_count = items_data.count()
        page_size = int(request.GET.get("page_size", "25"))
        page_no = int(request.GET.get("page_no", "0"))
        items_data = list(
            items_data[page_no * page_size:page_no * page_size + page_size])
        items_data = [serialize_item(item) for item in items_data]
        # Passing data in json format for frontend to handle
        return HttpResponse(json.dumps({"count": items_count, "data": items_data}), status=status.HTTP_200_OK)

    if request.method == "POST":
        # when POST requests are used no processing must be done, just the saving of the item
        item = Item()
        return save_record(request, item, status.HTTP_201_CREATED)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(['GET', 'PUT', 'DELETE'])
def item(request, itemNo):
    userItemNo = int(itemNo)
    # A second check to prevent unauthorised editing, this should already have been handled on the front-end
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    try:
        # setting value of item variable for all request types
        item = Item.objects.get(itemNo=itemNo)
    except ObjectDoesNotExist:
        return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        # displays JSON to browser if type of request is GET
        return HttpResponse(json.dumps({"data": serialize_item(Item)}), status=status.HTTP_200_OK)

    if request.method == "PUT":
        return save_record(request, item, status.HTTP_200_OK)

    if request.method == "DELETE":
        item.delete()
        return HttpResponse(json.dumps({"detail": "deleted"}), status=status.HTTP_410_GONE)
    # for when the method used is POST or another unrecognised method
    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)
