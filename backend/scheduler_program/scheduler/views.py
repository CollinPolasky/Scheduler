# Create your views here.
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods, require_POST
from django.utils import timezone
from rest_framework import viewsets

from datetime import datetime
from zoneinfo import ZoneInfo
import json
import logging

from .models import Event, Person, UserPreference
from .serializers import EventSerializer
from .forms import PersonForm

logger = logging.getLogger(__name__)

def index(request):
    events = Event.objects.all()
    persons = Person.objects.all()
    context = {
        'persons': persons,
        'events': events,
    }
    return render(request, 'index.html', context)


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer


# def get_events(request):
#     events = Event.objects.all()
#     event_list = []
#     for event in events:
#         event_list.append({
#             'title': event.title,
#             'start': event.start.isoformat(),
#             'end': event.end.isoformat(),
#             'allDay': event.allDay,
#         })
#     return JsonResponse(event_list, safe=False)
def get_events(request):
    events = Event.objects.all()
    data = [{
        'id': str(event.id),
        'resourceId': str(event.person.id) if event.person else None,
        'title': event.title,
        'start': event.start.isoformat(),
        'end': event.end.isoformat(),
        'allDay': event.allDay,
    } for event in events]
    return JsonResponse(data, safe=False)


# @csrf_exempt
# @require_http_methods(["POST"])
# def create_event(request):
#     logger.info(f"Received request method: {request.method}")
#     logger.info(f"Received data: {request.body}")
#     if request.method == "POST":
#         data = json.loads(request.body)
#         try:
#             # Get the user's time zone
#             user_tz = ZoneInfo(data['timeZone'])
#             logger.debug(f"User time zone: {user_tz}")
            
#             # Parse the date strings and make them timezone-aware
#             start = datetime.fromisoformat(data['start']).astimezone(ZoneInfo('UTC'))
#             end = datetime.fromisoformat(data['end']).astimezone(ZoneInfo('UTC'))
#             logger.debug(f"Start: {start}, End: {end}")
            
#             # # Convert to UTC
#             # start_utc = start.astimezone(ZoneInfo('UTC'))
#             # end_utc = end.astimezone(ZoneInfo('UTC'))
#             # logger.debug(f"Start UTC: {start_utc}, End UTC: {end_utc}")
#             # Get the person object
#             person = Person.objects.get(id=data['resourceId'])
            
#             event = Event.objects.create(
#                 title=data['title'],
#                 start=start,
#                 end=end,
#                 allDay=data.get('allDay', False),
#                 person=person
#             )

#             # event = Event.objects.create(
#             #     title=data['title'],
#             #     start=start,
#             #     end=end,
#             #     allDay=data.get('allDay', False)
#             # )
#             logger.info(f"Event created: {event.id} - {event.title}")
#             return JsonResponse({'status': 'success', 'id': event.id})
#         except Exception as e:
#             logger.error(f"Error creating event: {str(e)}")
#             return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
#     else:
#         return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@login_required
def add_person(request):
    if request.method == 'POST':
        form = PersonForm(request.POST)
        if form.is_valid():
            form.save()
            events = Event.objects.all()
            persons = Person.objects.all()
            context = {
                'persons': persons,
                'events': events,
            }
            return render(request, 'index.html', context)  # or wherever you want to redirect after successful form submission
    else:
        form = PersonForm()
    return render(request, 'add_person.html', {'form': form})

def person_list(request):
    persons = Person.objects.all()
    return render(request, 'person_list.html', {'persons': persons})


def get_persons(request):
    persons = Person.objects.all()
    data = [{'id': person.id, 'name': person.name, 'building': person.building} for person in persons]
    return JsonResponse(data, safe=False)


@csrf_exempt
@login_required
@require_POST
def save_resource_order(request):
    try:
        data = json.loads(request.body)
        order = data.get('order', [])
        
        user_preference, created = UserPreference.objects.get_or_create(user=request.user)
        user_preference.resource_order = order
        user_preference.save()

        return JsonResponse({'status': 'success', 'order': order})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


@login_required
def get_resource_order(request):
    try:
        user_preference = UserPreference.objects.get(user=request.user)
        order = user_preference.resource_order
    except UserPreference.DoesNotExist:
        order = []
    return JsonResponse({'order': order})

# def create_event(request):
#     rule = Rule.objects.create(frequency="WEEKLY")
#     event = Event.objects.create(
#         title="Test event",
#         start=datetime(2023, 6, 1, 8, 0),
#         end=datetime(2023, 6, 1, 9, 0),
#         rule=rule,
#         end_recurring_period=datetime(2023, 12, 31),
#     )
#     return HttpResponse("Event created")