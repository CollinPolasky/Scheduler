from rest_framework import serializers
from .models import Event, Person

class EventSerializer(serializers.ModelSerializer):
    resourceId = serializers.IntegerField(source='person.id', required=False, allow_null=True)

    class Meta:
        model = Event
        fields = ['id', 'title', 'start', 'end', 'allDay', 'resourceId']

    def create(self, validated_data):
        person_data = validated_data.pop('person', None)
        if person_data and 'id' in person_data:
            try:
                person = Person.objects.get(id=person_data['id'])
                validated_data['person'] = person
            except Person.DoesNotExist:
                pass
        return super().create(validated_data)

    def update(self, instance, validated_data):
        person_data = validated_data.pop('person', None)
        if person_data and 'id' in person_data:
            try:
                person = Person.objects.get(id=person_data['id'])
                instance.person = person
            except Person.DoesNotExist:
                pass
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['resourceId'] = instance.person.id if instance.person else None
        return representation