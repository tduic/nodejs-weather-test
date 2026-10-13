# nodejs-weather-test

A small Node.js learning project: a simple web app that looks up the current weather for a city using the [OpenWeatherMap](https://openweathermap.org/api) API and displays it in the browser.

## Overview

The app serves a single page with a form. You type in a city name, submit it, and the server queries the OpenWeatherMap API and renders the current temperature back on the same page. It was built as a practice/learning exercise with Express and EJS.

## Features

- Single-page web form to enter a city
- Fetches live weather data from the OpenWeatherMap API
- Displays the current temperature (in Fahrenheit) for the requested city
- Basic error handling for invalid cities or failed requests

## Tech Stack

- **Node.js** with **Express** for the web server and routing
- **EJS** for server-side HTML templating
- **request** for making HTTP calls to the OpenWeatherMap API
- **body-parser** for handling form (POST) data
- Plain **CSS** for styling

## Project Structure

```
server.js            # Express server and weather lookup logic
views/index.ejs      # Page template with the city form and result
public/css/style.css # Styling
package.json         # Dependencies and metadata
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- An [OpenWeatherMap API key](https://openweathermap.org/api)

### Installation

```bash
git clone https://github.com/tduic/nodejs-weather-test.git
cd nodejs-weather-test
npm install
```

### Configuration

Set your OpenWeatherMap API key in the environment before starting the server:

```bash
export OPENWEATHER_API_KEY=your_key_here
```

### Running

```bash
node server.js
```

Then open [http://localhost:3000](http://localhost:3000) in your browser, enter a city, and click **Get Weather**.

## License

ISC
