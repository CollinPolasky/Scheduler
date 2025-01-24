"use client"
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { Draggable, DropArg } from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid'
import { EventSourceInput } from '@fullcalendar/core/index.js'
import React from 'react';
import PersonDropdown from './components/personDropdown';
import { getCookie } from './utils/csrf';

interface Person {
    id: number;
    name: string;
    building?: string;
  }

interface Event {
  title: string;
  start: Date | string;
  allDay: boolean;
  id: number;
  resourceId: string;
}

export default function Home() {
//   const [events, setEvents] = useState([
//     { title: 'event 1', id: '1', resourceId: 'a' },
//     { title: 'event 2', id: '2', resourceId: 'a' },
//     { title: 'event 3', id: '3', resourceId: 'a'},
//     { title: 'event 4', id: '4', resourceId: 'a'},
//     { title: 'event 5', id: '5', resourceId: 'a'},
//   ])
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [idToDelete, setIdToDelete] = useState<number | null>(null)
  const [newEvent, setNewEvent] = useState<Event>({
    title: '',
    start: '',
    allDay: false,
    id: 0,
    resourceId: ""
  })

  useEffect(() => {
    let draggableEl = document.getElementById('draggable-el')
    console.log("useEffect")
    if (draggableEl) {
        console.log("draggableEl")
      new Draggable(draggableEl, {
        itemSelector: ".fc-event",
        eventData: function (eventEl) {
          let title = eventEl.getAttribute("title")
          let id = eventEl.getAttribute("data")
          let start = eventEl.getAttribute("start")
          let resourceId = eventEl.getAttribute("resourceId")
          console.log("testing:", resourceId)
          return { title, id, start, resourceId }
        }
      })
    }
  }, [])

  const [persons, setPersons] = useState<Person[]>([]);
  const [selectedPersons, setSelectedPersons] = useState<number[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/persons/')
      .then(response => response.json())
      .then(data => setPersons(data))
      .catch(error => console.error('Error fetching persons:', error));

    fetch('http://localhost:8000/api/events/')
      .then(response => response.json())
      .then(data => setEvents(data))
      .catch(error => console.error('Error fetching events:', error));
  }, []);

  const handlePersonSelect = (personIds: number[]) => {
    setSelectedPersons(personIds);
  };

  const resources = persons
    .filter(person => selectedPersons.includes(person.id))
    .map(person => ({
      id: String(person.id),
      building: person.building || 'Unassigned',
      title: person.name
    }));

    function handleDateClick(info) {
        console.log("handleDateClick");
        console.log(info);
        console.log("start: ", info.date);
        console.log("allDay: ", info.allDay);
        console.log("id: ", new Date().getTime());
        console.log("resourceId: ", info.resource.id);
        console.log("Done");

        const title = prompt('Please enter a title for your event');
        if (title) {
            const newEvent = {
                title,
                start: info.date.toISOString(),
                end: new Date(info.date.getTime() + 60 * 60 * 1000).toISOString(),
                resourceId: info.resource.id,
                allDay: info.allDay,
            };

            // Get CSRF token first
            fetch('http://localhost:8000/api/csrf/', {
                credentials: 'include'
            })
            .then(() => {
                const csrftoken = getCookie('csrftoken');
                
                return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken || '',
                    },
                    credentials: 'include',
                    body: JSON.stringify(newEvent)
                });
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setEvents([...events, { ...newEvent, id: data.id }]);
                console.log('Event created successfully:', data);
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to create event. Please try again.');
            });
        }
    }

//   function addEvent(data: DropArg) {
//     console.log("addEvent")
//     const event = { ...newEvent, start: data.date.toISOString(), title: data.draggedEl.innerText, allDay: data.allDay, id: new Date().getTime(), resourceId: data.resource.id}
//     setAllEvents([...allEvents, event])
//   }

  const addEvent = (data: any) => {
    const title = prompt('Please enter a title for your event');
    if (title) {
      const newEvent = {
        title,
        start: data.event.startStr,
        end: data.event.endStr,
        resourceId: data.event.resourceId,
        allDay: data.event.allDay,
      };

    const csrftoken = getCookie('csrftoken');

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (csrftoken) {
        headers['X-CSRFToken'] = csrftoken;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/create/`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(newEvent),
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
        })
        .then(data => {
        if (data.status === 'success') {
            setEvents([...events, { ...newEvent, id: data.id }]);
            console.log('Event created successfully:', data);
        } else {
            console.error('Error creating event:', data.message);
        }
        })
        .catch(error => {
        console.error('Error:', error);
        });
    }
  };

  function handleDeleteModal(data: { event: { id: string } }) {
    console.log("handleDeleteModal")
    setShowDeleteModal(true)
    setIdToDelete(Number(data.event.id))
  }

  function handleEventClick(clickInfo: EventClickArg) {
    if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'?`)) {
      const eventId = clickInfo.event.id;
      const csrftoken = getCookie('csrftoken');

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (csrftoken) {
        headers['X-CSRFToken'] = csrftoken;
      }

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}/`, {
        method: 'DELETE',
        headers: headers,
        credentials: 'include'
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // If successful, remove the event from the calendar
        clickInfo.event.remove();
        // Also update your local state
        setEvents(events.filter(event => event.id !== eventId));
        console.log('Event deleted successfully');
      })
      .catch(error => {
        console.error('Error deleting event:', error);
        alert('Failed to delete the event. Please try again.');
      });
    }
  }

  function handleDelete() {
    console.log("handleDelete")
    setAllEvents(allEvents.filter(event => Number(event.id) !== Number(idToDelete)))
    setShowDeleteModal(false)
    setIdToDelete(null)
  }

  function handleCloseModal() {
    console.log("handleCloseModal")
    setShowModal(false)
    setNewEvent({
      title: '',
      start: '',
      allDay: false,
      id: 0,
      resourceId: ''
    })
    setShowDeleteModal(false)
    setIdToDelete(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    console.log("handleChange")
    setNewEvent({
      ...newEvent,
      title: e.target.value,
      //resourceId: 'a'
    })
    
  }

function handleEventChange(changeInfo) {
    // Get the updated event
    console.log("handleEventChange")
    console.log(changeInfo)
    console.log("here")
    const updatedEvent = {
        id: changeInfo.event.id,
        title: changeInfo.event.title,
        start: changeInfo.event.start?.toISOString(),
        end: changeInfo.event.end?.toISOString(),
        allDay: changeInfo.event.allDay,
        resourceId: changeInfo.event.getResources()[0]?.id
      };
  
      const csrftoken = getCookie('csrftoken');
  
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
  
      if (csrftoken) {
        headers['X-CSRFToken'] = csrftoken;
      }
  
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${updatedEvent.id}/`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify(updatedEvent),
        credentials: 'include'
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Event updated successfully:', data);
        // Optionally update your local state here if needed
      })
      .catch(error => {
        console.error('Error updating event:', error);
        // Revert the event if the update failed
        changeInfo.revert();
      });
    }
  

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    console.log("handleSubmit")
    e.preventDefault()
    setAllEvents([...allEvents, newEvent])
    setShowModal(false)
    setNewEvent({
      title: '',
      start: '',
      allDay: false,
      id: 0,
      resourceId: ''
    })
  }

  return (
    <>
      <nav className="flex justify-between mb-12 border-b border-violet-100 p-4">
        <h1 className="font-bold text-2xl text-gray-700">Calendar</h1>
      </nav>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        {/* <div className="grid grid-cols-10"> */}
          <div className="col-span-8">
            
            
            <div>
            <h1>Resource Timeline Calendar</h1>
            <PersonDropdown 
                persons={persons}
                selectedPersons={selectedPersons}
                onPersonSelect={handlePersonSelect}
            />
            <FullCalendar 
                schedulerLicenseKey={process.env.NEXT_PUBLIC_SCHEDULER_LICENSE}
                plugins={[resourceTimelinePlugin, interactionPlugin]}
                initialView="resourceTimelineDay"
                //resourceGroupField='building'
                scrollTime={new Date().getHours() - 1 + ":00:00"}
                resources={resources}
                events={events}
                nowIndicator={true}
                editable={true}
                droppable={true}
                selectable={true}
                selectMirror={true}
                dateClick={handleDateClick}
                eventChange={handleEventChange}
                eventClick={handleEventClick}
                // height="600px"
                // width="auto"
            />
                <div>
                    
                </div>
            </div>
            <FullCalendar
              plugins={[
                dayGridPlugin,
                interactionPlugin,
                timeGridPlugin
              ]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'resourceTimelineWook, dayGridMonth,timeGridWeek'
              }}
              events={allEvents as EventSourceInput}
              nowIndicator={true}
              editable={true}
              droppable={true}
              selectable={true}
              selectMirror={true}
              dateClick={handleDateClick}
              drop={(data) => addEvent(data)}
              eventClick={(data) => handleDeleteModal(data)}
            />
            <FullCalendar 
                schedulerLicenseKey="process.env.NEXT_PUBLIC_SCHEDULER_LICENSE" 
                plugins={[ 
                    resourceTimelinePlugin,
                    interactionPlugin ]}
                initialView="resourceTimelineDay"
                resourceGroupField = {'building'}
                resources={ [
                        // your resource list
                        { id: 'a', building: 'Room 1', title: 'Name 1' },
                        { id: 'b', building: 'Room 1', title: 'Name 2' },
                        { id: 'c', building: 'Room 2', title: 'Name 3' },
                        { id: 'd', building: 'Room 2', title: 'Name 4' },

                      ]}
                events={allEvents as EventSourceInput}
                nowIndicator={true}
                editable={true}
                droppable={true}
                selectable={true}
                selectMirror={true}
                dateClick={handleDateClick}
                drop={(data) => addEvent(data)}
                eventClick={(data) => handleDeleteModal(data)}
                eventChange={handleEventChange}

                       />
          </div>
          {/* <div id="draggable-el" className="ml-8 w-full border-2 p-2 rounded-md mt-16 lg:h-1/2 bg-violet-50">
            <h1 className="font-bold text-lg text-center">Drag Event</h1>
            {events.map(event => (
              <div
                className="fc-event border-2 p-1 m-2 w-full rounded-md ml-auto text-center bg-white"
                title={event.title}
                key={event.id}
              >
                {event.title}
              </div>
            ))}
          </div> */}
          
        {/* </div> */}

        <Transition.Root show={showDeleteModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setShowDeleteModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"

            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg
                   bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
                  >
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center 
                      justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                          <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                            Delete Event
                          </Dialog.Title>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Are you sure you want to delete this event?
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <button type="button" className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm 
                      font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto" onClick={handleDelete}>
                        Delete
                      </button>
                      <button type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 
                      shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={handleCloseModal}
                      >
                        Cancel
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
        <Transition.Root show={showModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setShowModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                    <div>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                      </div>
                      <div className="mt-3 text-center sm:mt-5">
                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                          Add Event
                        </Dialog.Title>
                        <form action="submit" onSubmit={handleSubmit}>
                          <div className="mt-2">
                            <input type="text" name="title" className="block w-full rounded-md border-0 py-1.5 text-gray-900 
                            shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 
                            focus:ring-2 
                            focus:ring-inset focus:ring-violet-600 
                            sm:text-sm sm:leading-6"
                              value={newEvent.title} onChange={(e) => handleChange(e)} placeholder="Title" />
                          </div>
                          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                            <button
                              type="submit"
                              className="inline-flex w-full justify-center rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 sm:col-start-2 disabled:opacity-25"
                              disabled={newEvent.title === ''}
                            >
                              Create
                            </button>
                            <button
                              type="button"
                              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                              onClick={handleCloseModal}

                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </main >
    </>
  )
}