from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Person(models.Model):
    #user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100)
    building = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.name

class Event(models.Model):
    title = models.CharField(max_length=200)
    start = models.DateTimeField()
    end = models.DateTimeField()
    allDay = models.BooleanField(default=False)
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='events', null=True, blank=True)
    #person_id = models.IntegerField(null=True, blank=True)  # New field for storing the person ID

    def __str__(self):
        return self.title

    # def save(self, *args, **kwargs):
    #     if self.person:
    #         self.person_id = self.person.id
    #     super().save(*args, **kwargs)

class UserPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    resource_order = models.JSONField(default=list)

    def __str__(self):
        return f"{self.user.username}'s preferences"

@receiver(post_save, sender=User)
def create_user_preference(sender, instance, created, **kwargs):
    if created:
        UserPreference.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_preference(sender, instance, **kwargs):
    instance.userpreference.save()