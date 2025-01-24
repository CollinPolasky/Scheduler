# Scheduler Program (Work-in-Progress)

This Project seeks to be an online scheduling platform with persistent database connection alongside features to verify a schedule is conflict-free and meets minimum requirements.

Current Features/Progress:
- Connection to Django/PostgreSQL backend
- Basic calendar resource view via FullCalendar
- Basic event creation - Integrated with Database
- Basic event editing (Stretch/Shrink) - Integrated with Database
- Basic event deletion - Integrated with Database
- Basic event drag and drop - Integrated with Database
- Basic Customization of Calender View with People Selector (Shift Click to select multiple people)
- Shift to using .env file for backend and .env.local file for frontend

To-Do:
- Implement Frontend option for users to Add People (Currently only possible through backend)
- Implement System for user to input their requirements
- Implement Validator
- Update Frontend to be more user-friendly
- Implement Account Management
- Implement Conflict Resolution Suggestion Algorithm
- Reorganize Project File Structure
- Switch to venv


##
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
...\Scheduler v2\scheduler> npm run dev
```

Second, run the backend server:

```bash
...\Scheduler v2\backend\scheduler_program> python manage.py migrate   
...\Scheduler v2\backend\scheduler_program> python manage.py makemigrations   
...\Scheduler v2\backend\scheduler_program> python manage.py runserver   
```

Ensure that you set up your .env and .env.local files for the backend and frontend respectively.
These files are provided in the repository as .env.example and .env.local.example

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Current State

Resource Calendar View:
![alt text](<scheduler/images/Resource Calendar View.png>)

Resource Calendar View - Collapsed:
![alt text](<scheduler/images/Resource Calendar View - Collapsed.png>)

Resource Calendar View - Adding Events:
![alt text](<scheduler/images/Resource Calendar View - Adding Events.png>)

Resource Calendar View - Deleting Events (Clicking on Event):
![alt text](<scheduler/images/Resource Calendar View - Deleting Events.png>)
