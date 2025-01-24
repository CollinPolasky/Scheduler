import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const Calendar: React.FC = () => {
  const handleDateSelect = (selectInfo: any) => {
    const title = prompt('Please enter a title for your event');
    if (title) {
      const calendarApi = selectInfo.view.calendar;
      calendarApi.unselect();
      
      // Send event data to server
      fetch('http://localhost:8000/events/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include CSRF token if needed
        },
        body: JSON.stringify({
          title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
          allDay: selectInfo.allDay,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          calendarApi.addEvent({
            id: data.id,
            title,
            start: selectInfo.startStr,
            end: selectInfo.endStr,
            allDay: selectInfo.allDay
          });
        } else {
          console.error('Error creating event:', data.message);
        }
      });
    }
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      selectable={true}
      select={handleDateSelect}
      events={{
        url: 'http://localhost:8000/events/',
        method: 'GET',
        extraParams: {
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      }}
    />
  );
};

export default Calendar;