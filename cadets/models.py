from django.db import models
from django.contrib.auth.models import User

#Defining cadet model to be used for the DB
class Cadet(models.Model):
    #uses user model as FK to that cadet name can be mapped to a user retrospectively

    #null is set to true for the user object, this allows a storesman to create cadets in order to issue kit before the beginning
    #of a year and issue items ahead of time, the cadet model can then be edited on the day in order to link to an account
    cadetNo = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=50)
    yearGroup = models.IntegerField()
    registrationDate = models.DateField("Registration Date", auto_now_add=True)
    section = models.CharField(max_length=1)


    def __str__(self):
        return self.name

#Defining IssueRecord model to be used for the DB
class IssueRecord(models.Model):
    recordID = models.AutoField(primary_key=True)
    issueDate = models.DateField("Issue Date", auto_now_add=True)
    issuingNCO = models.CharField(max_length=50)
    #IssuedTO is set to an object of cadet table
    issuedTO = models.ForeignKey('Cadet', on_delete=models.CASCADE)
    #itemID is set to an object of Item table
    itemID = models.ForeignKey('Item', on_delete=models.CASCADE)
    specificID = models.IntegerField(default=0)

    def __str__(self):
        return str(self.recordID)

#defining item model
class Item(models.Model):
    itemNo = models.AutoField(primary_key=True)
    itemID = models.CharField(max_length=20, unique = True)
    size = models.CharField(max_length=10)
    type = models.CharField(max_length=20)
    #To be set as all issued + in stores
    totalQuantity = models.IntegerField()


    def __str__(self):
        return str(self.itemID)
