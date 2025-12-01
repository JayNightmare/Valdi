<div align="center">

# Valdi

[![Deployed Pages](https://github.com/JayNightmare/Valdi/actions/workflows/nextjs.yml/badge.svg)](https://github.com/JayNightmare/Valdi/actions/workflows/nextjs.yml)

A modern, interactive timetable and campus navigation application designed for Kingston University students. Valdi parses course schedule data and presents it in a user-friendly calendar interface, integrated with a 3D campus map for seamless navigation.

</div>

## Table of Contents

- [Valdi](#valdi)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
  - [Usage](#usage)
    - [Dashboard](#dashboard)
    - [Managing Modules](#managing-modules)
    - [Using the Map](#using-the-map)
  - [Project Structure](#project-structure)
  - [License](#license)

## Features

- **Interactive Timetable:** View your weekly or daily schedule using a robust calendar interface.
- **Module Filtering:** Select specific modules to customize your timetable view.
- **Event Type Filtering:** Toggle visibility for Lectures, Labs, Drop-in sessions, and more.
- **3D Campus Map:** Explore the campus with an interactive 3D map powered by Mapbox GL JS.
- **Room Navigation:** Search for room codes (e.g., JG.1003) to get specific walking directions and visual markers.
- **Seamless Integration:** Jump directly from a calendar event to its location on the map.
- **Responsive Design:** Optimized for both desktop and mobile devices.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Calendar:** FullCalendar
- **Maps:** Mapbox GL JS (via react-map-gl)
- **Icons:** Lucide React
- **State Management:** React Hooks & Local Storage
- **Deployment:** GitHub Pages (via GitHub Actions)

## Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

- Node.js (Version 20 or higher recommended)
- npm (Node Package Manager)
- A Mapbox Access Token (for map functionality)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/JayNightmare/Valdi.git
   cd Valdi
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env.local` file in the root directory and add your Mapbox token:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_access_token_here
```

You can obtain a free access token by signing up at Mapbox.

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser to view the application.

## Usage

### Dashboard
The main dashboard provides a split view (on desktop) or toggle view (on mobile) between your Timetable and the Campus Map.

### Managing Modules
1. Navigate to the "Select Modules" page or use the sidebar on the dashboard.
2. Check the boxes for the modules you are currently enrolled in.
3. Your selection is saved locally and persists across sessions.

### Using the Map
1. Switch to the "Map" view.
2. Use the "Find a Room" search bar to enter a room code (e.g., `SB2025` or `PR.JG.1003`).
3. The map will fly to the building and provide text directions (e.g., "Go to Sopwith Building, 2nd Floor...").
4. Alternatively, click "View on Map" from any calendar event to instantly locate your class.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages and layouts
│   ├── dashboard/       # Main application dashboard
│   ├── login/           # Authentication pages
│   └── select-modules/  # Module selection interface
├── components/          # Reusable React components
│   ├── ui/              # Basic UI elements (Buttons, Inputs)
│   ├── Calendar.tsx     # FullCalendar integration wrapper
│   └── CampusMap.tsx    # Mapbox 3D map component
├── lib/                 # Utility functions and types
│   ├── api.ts           # Data fetching logic
│   ├── csv-parser.ts    # CSV parsing for timetable data
│   ├── room-utils.ts    # Room code parsing and direction logic
│   └── types.ts         # TypeScript definitions
└── public/
    └── data/            # Static CSV data files for timetables
```

## License

This project is available for personal and educational use.
