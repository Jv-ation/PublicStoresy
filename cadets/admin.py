from django.contrib import admin

from .models import Cadet, Item, IssueRecord


admin.site.register(Cadet)
admin.site.register(Item)
admin.site.register(IssueRecord)