# Chrono Android

A mobile planner for scheduled tasks, calendar browsing, reminders, and photo-supported journal entries.

**Android** · **In Development** · 2026

[Portfolio](https://kuraisler.xyz)

## Purpose

Chrono Android brings daily schedules and journaling to a phone-friendly interface. It is the mobile companion in the Chrono project family, focusing on capturing tasks, reviewing upcoming work, and keeping personal entries accessible while away from a desktop.

## Intended users

Students and individuals who want mobile access to schedules, task reminders, and a personal journal.

## Main capabilities

- Create scheduled tasks and mark them complete.
- Browse tasks through schedule and calendar screens.
- Create journal entries, organize categories, bookmark entries, and attach photos.
- Schedule native task notifications through Capacitor.

## How it was built

### Mobile web interface

React, JavaScript, and Vite implement the screens, with Tailwind CSS and Radix UI components for presentation.

### Native wrapper

Capacitor packages the web interface for mobile platforms and provides local-notification access.

### Cloud data

A backend adapter connects authentication, tasks, journal entries, and uploaded photos to Supabase services.

## Technology stack

| Responsibility | Technologies |
| --- | --- |
| Interface | JavaScript, React 18, Vite 8, Tailwind CSS 3, Radix UI |
| Mobile runtime | Capacitor 8, Capacitor Local Notifications |
| Data & accounts | Supabase Auth, PostgreSQL, Supabase Storage |
| Navigation & interaction | React Router, Framer Motion |

## Project scope and current state

A personal project in development. The current repository is React/Capacitor-based with Android and iOS tooling; the portfolio name remains Chrono Android. Native notifications require supported device permissions and platform setup.

## Source guide

- [`src/pages/`](src/pages/)
- [`src/api/backend.js`](src/api/backend.js)
- [`src/lib/notifications.js`](src/lib/notifications.js)
- [`capacitor.config.ts`](capacitor.config.ts)

## Development setup

Requires Node.js, npm, a configured Supabase project, and Android Studio for Android packaging. Configure task, journal, category, and photo-storage workflows. Capacitor handles native project synchronization. The iOS command requires macOS and Xcode.

```sh
npm install
npm run dev

# Build, synchronize, and open Android tooling:
npm run android
```

---

Project by [Mark Crysler Baddo](https://github.com/Kuraisura) · [Portfolio](https://kuraisler.xyz)
