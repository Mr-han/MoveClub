# MoveClub

MoveClub is a community event platform built for discovering, creating, and managing local activities. Users can browse events, join activities, explore locations on a map, and manage their own profiles. Admin users can also review platform-level metrics and participant data.

## Tech Stack

- Vue 3 + Vite
- Vue Router
- Pinia
- Firebase Authentication
- Cloud Firestore
- Firebase Functions
- PrimeVue
- Tailwind CSS
- Mapbox

## Features

- User registration and login
- Google sign-in
- Event creation, editing, joining, and leaving
- Event discovery with search, filters, and pagination
- Map-based event exploration
- User center for created and joined events
- Admin dashboard with metrics, tables, and charts
- Batch email sending for participant management

## Getting Started

### 1. Install dependencies

```sh
npm install
cd functions
npm install
cd ..
```

### 2. Configure environment variables

Create a local `.env` file based on `.env.example`.

Frontend variables:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

Firebase Functions variables:

```env
SENDGRID_API_KEY=your_sendgrid_api_key
```

For deployed Firebase Functions, configure the SendGrid key in your runtime environment before enabling email sending.

### 3. Run the app

```sh
npm run dev
```

### 4. Quality checks

```sh
npm run lint
npm run build
```

## Project Structure

```text
src/
  api/           frontend API wrappers
  components/    reusable UI components
  router/        route definitions
  stores/        Pinia stores
  views/         page-level views
functions/
  event.js       event-related cloud functions
  user.js        user-related cloud functions
  mail.js        email-related cloud functions
```

## Open Source Notes

- Secrets have been removed from source files and should be provided through environment variables.
- `node_modules` and local environment files are excluded from version control.
- The project is structured to support a cleaner Git history and a more reviewable development workflow.
