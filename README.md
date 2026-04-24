# FitTrack Performance Website

![Performance](performance.jpg)

This project is a high-performance modern website dedicated to fitness tracking. It integrates various technical performance requirements such as Gulp automation, service workers, asset minification, critical CSS, and HTTP/2 server push.

## Features
- Step Counter
- Water Tracker
- Weekly Summary
- Daily Motivation
- Nutrition Guide
- Distance Tracker
- Progress Overview
- Theme Customization (Dark Mode)

## Performance Optimizations
- **Critical CSS**: Inlined critical styles for faster first contentful paint.
- **Service Worker**: Caching assets for offline support and faster subsequent loads.
- **Image Optimization**: Images are served in modern formats and lazy-loaded where appropriate.
- **HTTP/2**: Server push for critical resources.
- **Minification**: CSS and JS are minified to reduce payload size.

## Getting Started
To run the project locally:
1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Build for production: `npm run build`
