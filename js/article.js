// Article Class for handling article content
class Article {
    constructor(id, name, description, visualContent, location, pokemon) { // Added location and pokemon
        this.id = id;
        this.name = name;
        this.description = description;
        this.visualContent = visualContent;
        this.location = location; // Added location
        this.pokemon = pokemon;   // Added pokemon
    }

    // Getters
    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getDescription() {
        return this.description;
    }
    
    getVisualContent() {
        return this.visualContent;
    }

    getLocation() { // Added getter
        return this.location;
    }

    getPokemon() { // Added getter
        return this.pokemon;
    }

    // Setters
    setId(id) {
        this.id = id;
    }

    setName(name) {
        this.name = name;
    }

    setDescription(description) {
        this.description = description;
    }
    
    setVisualContent(visualContent) {
        this.visualContent = visualContent;
    }

    setLocation(location) { // Added setter
        this.location = location;
    }

    setPokemon(pokemon) { // Added setter
        this.pokemon = pokemon;
    }
}

// Load articles using our API endpoint instead of PapaParse
function loadArticles() {
    const articles = [];
    
    // Using fetch to get data from our API endpoint
    fetch('/api/articles')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            if (result.success) {
                // Create Article objects from the API data
                result.data.forEach(item => {
                    // Skip empty rows
                    if (!item.ID) return;
                    
                    const article = new Article(
                        item.ID,
                        item.Name,
                        item.Description,
                        item.VisualContent,
                        item.Location, // Pass location
                        item.Pokemon   // Pass pokemon
                    );
                    articles.push(article);
                });
                
                // Trigger a custom event to indicate articles are loaded
                const event = new CustomEvent('articlesLoaded');
                document.dispatchEvent(event);
            } else {
                console.error('Error loading articles:', result.message);
            }
        })
        .catch(error => {
            console.error('Error fetching articles:', error);
        });
    
    return articles;
}

// Articles array to store loaded data
let articles = [];

// Function to get article by ID
function getArticleById(id) {
    return articles.find(article => article.getId() === id);
}

// Function to initialize articles on page load
function initArticles() {
    articles = loadArticles();
}

// Function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Function to render article content to specific elements
function renderArticleContent() {
    // Get the article ID from the URL parameter
    const urlArticleId = getUrlParameter('id');
    
    // Get all elements with data-article-content attribute
    const elements = document.querySelectorAll('[data-article-content]');
    
    // If no articles loaded yet, wait for the articlesLoaded event
    if (articles.length === 0) {
        document.addEventListener('articlesLoaded', function() {
            renderArticleContentToElements(elements, urlArticleId);
        });
    } else {
        renderArticleContentToElements(elements, urlArticleId);
    }
}

// Helper function to render article content to elements
function renderArticleContentToElements(elements, urlArticleId) {
    let mainArticle = null; // Store the main article for API calls

    elements.forEach(element => {
        // Get the element's original article ID
        let articleId = element.getAttribute('data-article-content');
        let isMainContent = false;

        if (urlArticleId && window.location.pathname.includes('article.html')) {
            const mainArticleIds = ['1']; // Assuming '1' is the placeholder for the main content area
            if (mainArticleIds.includes(articleId)) {
                articleId = urlArticleId;
                isMainContent = true; // Mark this as the main content being rendered
            }
        } else if (!urlArticleId && articleId === '1' && window.location.pathname.includes('article.html')) {
             // Handle default case for article.html when no ID is specified (show article 1)
             isMainContent = true;
        }

        const dataType = element.getAttribute('data-content-type') || 'name'; // Default to name
        const article = getArticleById(articleId);
        
        if (article) {
            if (dataType === 'name') {
                element.textContent = article.getName();
            } else if (dataType === 'description') {
                element.textContent = article.getDescription();
            }

            // If this is the main article content, store it
            if (isMainContent) {
                mainArticle = article;
            }
        }
    });
    
    // If we have a URL parameter for an article, update the visual content as well
    if (urlArticleId && window.location.pathname.includes('article.html')) {
        updateArticleVisualContent(urlArticleId);
    } else if (!urlArticleId && window.location.pathname.includes('article.html')) {
        // Handle default visual content for article 1 if no ID specified
        updateArticleVisualContent('1');
    }

    // Fetch Pokemon and Weather data for the main article
    if (mainArticle) {
        const pokemonName = mainArticle.getPokemon();
        const locationName = mainArticle.getLocation();

        if (pokemonName) {
            fetchPokemonData(pokemonName);
        } else {
            // Hide Pokemon section if no name provided
            const pokemonSection = document.getElementById('pokemon-info');
            if (pokemonSection) pokemonSection.style.display = 'none';
        }

        if (locationName) {
            fetchWeatherData(locationName);
        } else {
            // Hide Weather section if no location provided
            const weatherSection = document.getElementById('weather-info');
            if (weatherSection) weatherSection.style.display = 'none';
        }
    } else {
         // Hide sections if no main article identified (e.g., error or different page)
         const pokemonSection = document.getElementById('pokemon-info');
         if (pokemonSection) pokemonSection.style.display = 'none';
         const weatherSection = document.getElementById('weather-info');
         if (weatherSection) weatherSection.style.display = 'none';
    }
}

// Function to update visual content based on article ID
function updateArticleVisualContent(articleId) {
    // Get the article to find its associated visual content
    const article = getArticleById(articleId);
    if (!article) return;
    
    // Wait for visual contents to load if needed
    if (typeof visualContents !== 'undefined' && visualContents.length > 0) {
        updateHeroImage(articleId);
    } else {
        document.addEventListener('visualContentsLoaded', function() {
            updateHeroImage(articleId);
        });
    }
}

// Function to update the hero image
function updateHeroImage(articleId) {
    // Get the article hero image container
    const heroImageContainer = document.getElementById('article-visual-content');
    if (!heroImageContainer) return;
    
    // Find the article
    const article = getArticleById(articleId);
    if (!article) return;
    
    // Get the filename directly from the VisualContent field
    const visualContentField = article.getVisualContent();
    
    if (!visualContentField) {
        console.warn('No VisualContent field found for article ID:', articleId);
        return;
    }
    
    // Create the HTML for the appropriate image or video
    let html = '';
    if (visualContentField.endsWith('.mp4')) {
        html = `<video src="videos/${visualContentField}" controls muted autoplay class="article-hero"></video>`;
    } else {
        html = `<img src="images/${visualContentField}" alt="${article.getName()}" class="article-hero">`;
    }
    
    // Update the container
    heroImageContainer.innerHTML = html;
}

// Function to fetch and display Pokemon data
function fetchPokemonData(pokemonName) {
    const pokemonSection = document.getElementById('pokemon-info');
    const pokemonSprite = document.getElementById('pokemon-sprite');
    const pokemonNameEl = document.getElementById('pokemon-name');

    if (!pokemonSection || !pokemonSprite || !pokemonNameEl) return;

    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Pokemon not found or API error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.sprites && data.sprites.front_default) {
                pokemonSprite.src = data.sprites.front_default;
                pokemonSprite.alt = `Sprite of ${pokemonName}`;
                pokemonNameEl.textContent = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);
                pokemonSection.style.display = 'flex'; // Show the section
            } else {
                throw new Error('No sprite found for this Pokemon.');
            }
        })
        .catch(error => {
            console.error('Error fetching Pokemon data:', error);
            pokemonSection.style.display = 'none'; // Hide section on error
        });
}

// Function to fetch and display Weather data
function fetchWeatherData(locationName) {
    const weatherSection = document.getElementById('weather-info');
    const weatherLocation = document.getElementById('weather-location');
    const weatherDescription = document.getElementById('weather-description');
    const weatherTemp = document.getElementById('weather-temp');
    const weatherIcon = document.getElementById('weather-icon');


    if (!weatherSection || !weatherLocation || !weatherDescription || !weatherTemp || !weatherIcon) return;

    const apiUrl = `/api/weather?city=${encodeURIComponent(locationName)}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                 // Check for specific errors if needed, e.g., 404 for city not found
                 if (response.status === 404) {
                     throw new Error(`City not found: ${locationName}`);
                 }
                 throw new Error(`Weather API error: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            if (result.success) {
                const data = result.data;
                const tempK = data.temp_kelvin;
                const tempC = (tempK - 273.15).toFixed(1);
                const tempF = ((tempK - 273.15) * 9/5 + 32).toFixed(1);

                weatherLocation.textContent = locationName;
                weatherDescription.textContent = data.description.charAt(0).toUpperCase() + data.description.slice(1);
                weatherTemp.textContent = `${tempC}°C / ${tempF}°F`;
                 if (data.icon) {
                    weatherIcon.src = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
                    weatherIcon.alt = data.description;
                    weatherIcon.style.display = 'inline-block'; // Show icon
                } else {
                    weatherIcon.style.display = 'none'; // Hide if no icon code
                }

                weatherSection.style.display = 'flex'; // Show the section
            } else {
                throw new Error(result.message || 'Failed to fetch weather data');
            }
        })
        .catch(error => {
            console.error('Error fetching Weather data:', error);
            weatherSection.style.display = 'none'; // Hide section on error
        });
}

// Initialize articles when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initArticles();
    renderArticleContent();
});