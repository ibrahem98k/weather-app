# Weather App

A beautiful weather application built with Svelte and Tailwind CSS, inspired by Apple Weather. Uses the Open-Meteo API for weather data.

## Features

- 🌤️ Current weather conditions with beautiful UI
- 📅 10-day weather forecast
- ⏰ 24-hour hourly forecast
- 🔍 Location search functionality
- 📍 Automatic location detection
- 🎨 Apple Weather-inspired design

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technologies Used

- **Svelte** - Reactive UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool and dev server
- **Open-Meteo API** - Free weather API (no API key required)

## API

This app uses the [Open-Meteo API](https://open-meteo.com/) which provides:
- Current weather conditions
- Hourly forecasts
- Daily forecasts
- Historical weather data
- No API key required for non-commercial use

