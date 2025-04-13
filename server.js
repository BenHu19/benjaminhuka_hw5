// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios'); // Import axios
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY; // Get API key

// Middleware for parsing JSON
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(__dirname));

// Route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to serve the article.html file
app.get('/article', (req, res) => {
    res.sendFile(path.join(__dirname, 'article.html'));
});

// Route to serve search.html file for search results
app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'search.html'));
});

// Route to serve visualContent.csv file directly
app.get('/visualContent.csv', (req, res) => {
    res.sendFile(path.join(__dirname, 'data/visualContent.csv'));
});

// Route to serve article.csv file directly
app.get('/article.csv', (req, res) => {
    res.sendFile(path.join(__dirname, 'data/article.csv'));
});

// API endpoint to serve CSV data as JSON
app.get('/api/articles', (req, res) => {
    const results = [];
    
    fs.createReadStream(path.join(__dirname, 'data/article.csv'))
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            res.json({
                success: true,
                data: results
            });
        })
        .on('error', (error) => {
            console.error('Error reading CSV file:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error reading CSV file' 
            });
        });
});

// API endpoint to serve visual content CSV data as JSON
app.get('/api/visualContent', (req, res) => {
    const results = [];

    fs.createReadStream(path.join(__dirname, 'data/visualContent.csv'))
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            res.json({
                success: true,
                data: results
            });
        })
        .on('error', (error) => {
            console.error('Error reading visual content CSV file:', error);
            res.status(500).json({
                success: false,
                message: 'Error reading visual content CSV file'
            });
        });
});

// API endpoint for weather data
app.get('/api/weather', async (req, res) => {
    const city = req.query.city;

    if (!city) {
        return res.status(400).json({ success: false, message: 'City parameter is required' });
    }

    if (!OPENWEATHERMAP_API_KEY) {
        console.error('OpenWeatherMap API key not configured.');
        return res.status(500).json({ success: false, message: 'Weather service configuration error' });
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHERMAP_API_KEY}`;

    try {
        const response = await axios.get(weatherUrl);
        res.json({
            success: true,
            data: {
                temp_kelvin: response.data.main.temp,
                description: response.data.weather[0].description,
                icon: response.data.weather[0].icon
            }
        });
    } catch (error) {
        console.error(`Error fetching weather for ${city}:`, error.response ? error.response.data : error.message);
        // Determine appropriate status code based on OpenWeatherMap error
        const statusCode = error.response && error.response.status === 404 ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: `Could not fetch weather data for ${city}. ${error.response && error.response.data ? error.response.data.message : 'Service unavailable.'}`
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});