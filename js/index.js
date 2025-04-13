// Index JS - Dynamically loads articles for the index page

// Function to load articles from localStorage
function loadArticlesFromLocalStorage() {
    const storedArticles = localStorage.getItem('customArticles');
    return storedArticles ? JSON.parse(storedArticles) : [];
}

// Function to load visual content from localStorage
function loadVisualContentFromLocalStorage() {
    const storedVisualContent = localStorage.getItem('customVisualContent');
    return storedVisualContent ? JSON.parse(storedVisualContent) : [];
}

// Function to load static and dynamic articles in the news grid
function loadNewsGridArticles() {
    const newsGrid = document.getElementById('news-grid');
    if (!newsGrid) return;

    // Clear loading message
    newsGrid.innerHTML = '';

    // Wait for both articles and visual content to load
    Promise.all([
        new Promise(resolve => {
            if (articles.length > 0) {
                resolve();
            } else {
                document.addEventListener('articlesLoaded', resolve, { once: true });
            }
        }),
        new Promise(resolve => {
            if (visualContents.length > 0) {
                resolve();
            } else {
                document.addEventListener('visualContentsLoaded', resolve, { once: true });
            }
        })
    ]).then(() => {
        // Load custom articles from localStorage
        const customArticles = loadArticlesFromLocalStorage();
        const customVisualContent = loadVisualContentFromLocalStorage();
        
        // Get the initial static articles (IDs 6-9 for the news grid)
        const staticArticleIds = ['6', '7', '8', '9']; 
        const staticArticlesToDisplay = [];
        
        // Get static articles
        staticArticleIds.forEach(id => {
            const article = getArticleById(id);
            if (article) {
                staticArticlesToDisplay.push({
                    id: article.getId(),
                    name: article.getName(),
                    description: article.getDescription(),
                    isCustom: false
                });
            }
        });
        
        // Convert custom articles to the same format
        const customArticlesToDisplay = customArticles.map(article => ({
            id: article.id,
            name: article.name,
            description: article.description,
            isCustom: true
        }));
        
        // Combine all articles to display
        const allArticlesToDisplay = [...staticArticlesToDisplay, ...customArticlesToDisplay];
        
        // If no articles, show message
        if (allArticlesToDisplay.length === 0) {
            newsGrid.innerHTML = '<p>No articles found</p>';
            return;
        }
        
        // Create article elements
        allArticlesToDisplay.forEach((articleData, index) => {
            // Create article element
            const articleElement = document.createElement('article');
            articleElement.className = 'news-article';
            
            // Set ID based on whether it's custom or static
            const articleElementId = articleData.isCustom 
                ? `user-article-${articleData.id}` 
                : `index-news-article-${index + 1}`;
            
            articleElement.id = articleElementId;
            
            // Find visual content
            let visualContent;
            
            if (articleData.isCustom) {
                // Find in custom visual content
                const customVisual = customVisualContent.find(v => v.articleId === articleElementId);
                if (customVisual) {
                    visualContent = new VisualContent(
                        customVisual.id,
                        customVisual.name,
                        customVisual.description,
                        customVisual.shortName,
                        customVisual.fileType,
                        'news-article', // Use consistent class
                        customVisual.articleId
                    );
                }
            } else {
                // Find in static visual content
                visualContent = visualContents.find(v => v.getArticleId() === articleElementId);
            }
            
            // Create the inner HTML for the article
            let articleHTML = '';
            
            // Add visual content if available
            if (visualContent) {
                articleHTML += `<div>${visualContent.getHTML()}</div>`;
            } else {
                articleHTML += `<div class="no-image">No image available</div>`;
            }
            
            // Add article content
            articleHTML += `
                <h3>${articleData.name}</h3>
                <p>${articleData.description.substring(0, 120)}...</p>
                <a href="article.html?id=${articleData.id}">Read More</a>
            `;
            
            articleElement.innerHTML = articleHTML;
            newsGrid.appendChild(articleElement);
        });
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadNewsGridArticles();
});
