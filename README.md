# Soccer 'BeNews' Website

A simple news website built with Node.js and Express. It serves article data from CSV files via its own API endpoints and integrates external APIs (PokéAPI, OpenWeatherMap) to enhance article pages.

## Project Overview

This news website displays articles loaded from CSV files. The Node.js backend serves article and visual content data through custom API endpoints (`/api/articles`, `/api/visualContent`). It features responsive design, search with live filtering, an article submission form, an admin tool to view all articles, and like/comment functionality.

## New Features:
- Backend API: Serves CSV data as JSON via internal API endpoints.
- External API Integration:  
   1. PokéAPI: Fetches and displays a unique Pokémon sprite on each article page (client-side fetch).  
   2. OpenWeatherMap API: Fetches and displays the current weather for the article's associated location (server-side fetch via `/api/weather`).
   3. Enhanced Article Pages: Each article now includes a section showing its associated Pokémon and the current weather (temperature in °C/°F, description, icon) for its location.

## Setup and Installation

1.  Make sure you have Node.js installed on your computer.
2.  Clone or download this repository.
3.  Open a terminal/command prompt in the project directory.
4.  Install dependencies:
    npm install
5.  **Configure API Key:**
    *   Create a file named `.env` in the root of the project directory.
    *   Add your OpenWeatherMap API key to the `.env` file like this:
        OPENWEATHERMAP_API_KEY=YOUR_ACTUAL_API_KEY_HERE
    *   Replace `YOUR_ACTUAL_API_KEY_HERE` with your real key obtained from [OpenWeatherMap](https://openweathermap.org/).
6.  Start the server:
    node server.js
7.  Open a web browser and navigate to:
    http://localhost:3000

## How to Use

### Browsing Articles
- The homepage displays featured news articles.
- Click on "Read More" to view the full article.
- The article page shows the full content, along with:
    - The associated Pokémon's sprite.
    - The current weather for the article's location.
    - Recommended articles.

### Live filtering Articles Search
- Enter keywords in the search box (e.g "Mbappe", "Amorim").
- Click the search button.
- View matching results on the search results page.

### Admin tools and Article Submission Form
- Navigate to the "Admin" link on the homepage navbar.
- Fill in the form with the article details (including Location and Pokémon name).
- Click the "Submit" button to add the article.
- View all articles (including newly submitted ones) in the admin section table.
- Submitted articles will appear on the homepage and be accessible.

### Like and Comment Functionality
- On the article page, click the "Like" button to like the article.
- Enter your name and comment in the comment form.
- Click the "Post Comment" button to submit your comment.