// Search history management
const MAX_SEARCH_HISTORY = 5;

// Function to save search query to localStorage
function saveSearchToHistory(query) {
    if (!query.trim()) return;
    
    // Get existing search history or initialize empty array
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    
    // Remove the query if it already exists (to avoid duplicates)
    searchHistory = searchHistory.filter(item => item.toLowerCase() !== query.toLowerCase());
    
    // Add the new query to the beginning of the array
    searchHistory.unshift(query);
    
    // Limit the history to MAX_SEARCH_HISTORY items
    if (searchHistory.length > MAX_SEARCH_HISTORY) {
        searchHistory = searchHistory.slice(0, MAX_SEARCH_HISTORY);
    }
    
    // Save back to localStorage
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    
    // Update the UI if on search page
    displaySearchHistory();
}

// Function to display search history
function displaySearchHistory() {
    const historyContainer = document.getElementById('search-history-container');
    if (!historyContainer) return;
    
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    
    if (searchHistory.length === 0) {
        historyContainer.style.display = 'none';
        return;
    }
    
    historyContainer.style.display = 'block';
    historyContainer.innerHTML = '<h3>Recent Searches</h3>';
    
    const historyList = document.createElement('ul');
    historyList.className = 'search-history-list';
    
    searchHistory.forEach(query => {
        const listItem = document.createElement('li');
        listItem.className = 'search-history-item';
        
        const queryLink = document.createElement('a');
        queryLink.href = '#';
        queryLink.textContent = query;
        queryLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('search-input').value = query;
            performSearch(query);
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-history-item';
        deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        deleteBtn.title = 'Remove from history';
        deleteBtn.addEventListener('click', function() {
            removeFromSearchHistory(query);
        });
        
        listItem.appendChild(queryLink);
        listItem.appendChild(deleteBtn);
        historyList.appendChild(listItem);
    });
    
    historyContainer.appendChild(historyList);
}

// Function to remove a query from search history
function removeFromSearchHistory(query) {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    searchHistory = searchHistory.filter(item => item.toLowerCase() !== query.toLowerCase());
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    displaySearchHistory();
}

// Function to clear all search history
function clearSearchHistory() {
    localStorage.removeItem('searchHistory');
    displaySearchHistory();
}

// Debounce function to limit how often a function is called
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Function to initialize live search
function initLiveSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    // Add event listener with debounce
    const debouncedSearch = debounce(function(e) {
        const query = e.target.value.trim();
        
        if (query.length >= 2) {
            performSearch(query);
        } else if (query.length === 0) {
            // If the search field is empty, clear results
            const resultsContainer = document.getElementById('search-results-container');
            if (resultsContainer) {
                resultsContainer.innerHTML = '';
            }
            
            const noResultsMessage = document.getElementById('no-results-message');
            if (noResultsMessage) {
                noResultsMessage.style.display = 'none';
            }
        }
    }, 300); // 300ms debounce time
    
    searchInput.addEventListener('input', debouncedSearch);
    
    // Handle form submission differently based on which page we're on
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            // Check if we're on the search page
            const isSearchPage = window.location.pathname.includes('search.html');
            
            // If we're on the search page, prevent default and use live search
            if (isSearchPage) {
                e.preventDefault();
                const query = searchInput.value.trim();
                if (query) {
                    performSearch(query);
                    // Save to history when submitting the form
                    saveSearchToHistory(query);
                    
                    // Update URL for sharing/bookmarking without page reload
                    const url = new URL(window.location.href);
                    url.searchParams.set('q', query);
                    window.history.pushState({}, '', url);
                }
            } else {
                // If we're not on the search page, allow the form to submit normally
                // But still save the search to history
                const query = searchInput.value.trim();
                if (query) {
                    saveSearchToHistory(query);
                }
                // Do not preventDefault() so the form will submit normally and redirect
            }
        });
    }
}

// Function to perform a search (used by both live search and form submission)
function performSearch(query) {
    if (!query) {
        return;
    }
    
    // Update query display if on search page
    const queryDisplay = document.getElementById('search-query-display');
    if (queryDisplay) {
        queryDisplay.textContent = `Results for: "${query}"`;
    }
    
    // Call the existing search function
    searchArticles(query);
}

// Function to search articles
function searchArticles(query) {
    if (!query) {
        return;
    }

    // Clear previous results
    const resultsContainer = document.getElementById('search-results-container');
    resultsContainer.innerHTML = '<div class="loading-message">Loading results...</div>';

    // Load article data using PapaParse
    Papa.parse('data/article.csv', {
        download: true,
        header: true,
        complete: function(articleResults) {
            // Load visual content data
            Papa.parse('data/visualContent.csv', {
                download: true,
                header: true,
                complete: function(visualResults) {
                    // Filter articles by query
                    const matchedArticles = articleResults.data.filter(article => {
                        // Skip empty rows
                        if (!article.ID) return false;
                        
                        // Check if article name or description contains the query
                        const lowerQuery = query.toLowerCase();
                        return article.Name.toLowerCase().includes(lowerQuery) || 
                               article.Description.toLowerCase().includes(lowerQuery);
                    });
                    
                    // Display the search results
                    displaySearchResults({
                        articles: matchedArticles,
                        visualContent: visualResults.data
                    });
                },
                error: function(error) {
                    console.error('Error parsing visualContent.csv:', error);
                    resultsContainer.innerHTML = '<p>Error fetching search results. Please try again.</p>';
                }
            });
        },
        error: function(error) {
            console.error('Error parsing article.csv:', error);
            resultsContainer.innerHTML = '<p>Error fetching search results. Please try again.</p>';
        }
    });
}

// Function to display search results
function displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results-container');
    const noResultsMessage = document.getElementById('no-results-message');
    
    // Clear the loading message
    resultsContainer.innerHTML = '';
    
    if (results.articles && results.articles.length > 0) {
        noResultsMessage.style.display = 'none';
        
        // Display each article in the results
        results.articles.forEach(article => {
            // Find a matching visual content to use as thumbnail
            const thumbnail = findThumbnail(results.visualContent, article.ID);
            
            // Create article element
            const articleElement = document.createElement('div');
            articleElement.className = 'news-article';
            
            // Create thumbnail
            let thumbnailHTML = '';
            if (thumbnail) {
                if (thumbnail['File Type'].toLowerCase() === 'image') {
                    thumbnailHTML = `<img src="images/${thumbnail['Short Name']}" alt="${thumbnail.Name}" class="${thumbnail['CSS Class']}">`;
                } else if (thumbnail['File Type'].toLowerCase() === 'video') {
                    thumbnailHTML = `<video src="videos/${thumbnail['Short Name']}" controls muted autoplay class="${thumbnail['CSS Class']}"></video>`;
                }
            } else {
                // Default thumbnail if none found
                thumbnailHTML = '<div class="placeholder-image">No Image</div>';
            }
            
            // Create the article HTML
            articleElement.innerHTML = `
                ${thumbnailHTML}
                <h3>${article.Name}</h3>
                <p>${truncateText(article.Description, 150)}</p>
                <a href="article.html?id=${article.ID}">Read More</a>
            `;
            
            // Add to results container
            resultsContainer.appendChild(articleElement);
        });
    } else {
        // Display no results message
        noResultsMessage.style.display = 'block';
        resultsContainer.innerHTML = '';
    }
}

// Helper function to find a thumbnail for an article
function findThumbnail(visualContents, articleId) {
    // First try to find an exact match for the article ID
    const directMatch = visualContents.find(content => 
        content['Article ID'] === articleId || 
        content['Article ID'] === `article-${articleId}`
    );
    
    if (directMatch) {
        return directMatch;
    }
    
    // If no direct match, use any visual content that includes the article ID
    const partialMatch = visualContents.find(content => 
        content['Article ID'] && content['Article ID'].includes(articleId)
    );
    
    if (partialMatch) {
        return partialMatch;
    }
    
    // If no match at all, return the first visual content or null
    return visualContents.length > 0 ? visualContents[0] : null;
}

// Helper function to truncate text
function truncateText(text, maxLength) {
    if (!text) return '';
    
    if (text.length <= maxLength) {
        return text;
    }
    
    return text.substring(0, maxLength) + '...';
}

// Document load event handler to initialize search functionality based on URL parameters
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');
    
    if (searchQuery) {
        const searchInput = document.getElementById('search-input');
        const queryDisplay = document.getElementById('search-query-display');
        
        if (searchInput) searchInput.value = searchQuery;
        if (queryDisplay) queryDisplay.textContent = `Results for: "${searchQuery}"`;
        searchArticles(searchQuery);
    } else {
        const resultsContainer = document.getElementById('search-results-container');
        const noResultsMessage = document.getElementById('no-results-message');
        
        if (resultsContainer) resultsContainer.innerHTML = '';
        if (noResultsMessage) noResultsMessage.style.display = 'block';
    }
    
    // Initialize live search functionality
    initLiveSearch();
    
    // Display search history
    displaySearchHistory();
});