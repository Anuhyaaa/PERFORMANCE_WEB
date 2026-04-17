# FitTrack

FitTrack is a lightweight fitness web app for tracking daily movement and habits. It includes a step counter, water tracker, weekly summaries, progress views, motivational quotes, profile settings, and a simple dashboard for quick stats.

## Features

- Real-time step tracking on supported mobile browsers
- Water intake tracking with daily goals
- Weekly and progress summaries
- Distance and calorie estimates
- Daily motivation quotes
- Nutrition and profile pages
- Image formats showcase page
- Theme and app settings
- Service worker support for offline caching
- Gulp-based build pipeline for minifying and optimizing assets
- GitHub Actions workflow for validating HTML image references

## Pages

- `index.html` - home dashboard
- `steps.html` - step counter
- `weekly.html` - weekly summary
- `water.html` - water tracker
- `quotes.html` - motivational quotes
- `nutrition.html` - nutrition page
- `profile.html` - profile page
- `progress.html` - progress overview
- `distance.html` - distance tracker
- `images.html` - image formats showcase
- `settings.html` - app settings
- `about.html` - app overview

## Requirements

- Node.js and npm
- A modern browser
- Mobile device permissions for step tracking features

## Installation

```bash
npm install
```

## Run Locally

Start the development server with BrowserSync:

```bash
npm start
```

Then open the local server shown in the terminal, usually `http://localhost:3000`.

## Build

Create an optimized production build in `dist`:

```bash
npm run build
```

The build process minifies HTML, CSS, and JavaScript, and optimizes images.

## CI Image Check

This project includes a GitHub Actions workflow that validates local image references in HTML files:

- Workflow file: `.github/workflows/image-load-check.yml`
- Script: `scripts/check_images.py`

You can run the same check locally:

```bash
python3 scripts/check_images.py
```

## Step Tracking Note

The step counter uses device motion sensors. On iOS, the browser may ask for motion permission before tracking can start. If step tracking does not begin automatically, allow motion access and try again on a supported mobile device.

## Project Structure

- `*.html` - app pages
- `*.js` - page scripts and shared behavior
- `style.css` - global styling
- `images/` - image assets
- `gulpfile.js` - build tasks
- `service-worker.js` - offline support

## License

ISC