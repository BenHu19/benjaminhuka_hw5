// Admin JS for BeNews Article Management

// Function to generate a unique ID (simple implementation)
function generateUniqueId() {
    return (articles.length + 1).toString();
}

// Function to save articles to localStorage
function saveArticlesToLocalStorage(articlesList) {
    localStorage.setItem('customArticles', JSON.stringify(articlesList));
}

// Function to load articles from localStorage
function loadArticlesFromLocalStorage() {
    const storedArticles = localStorage.getItem('customArticles');
    return storedArticles ? JSON.parse(storedArticles) : [];
}

// Function to save visual content to localStorage
function saveVisualContentToLocalStorage(visualContentList) {
    localStorage.setItem('customVisualContent', JSON.stringify(visualContentList));
}

// Function to load visual content from localStorage
function loadVisualContentFromLocalStorage() {
    const storedVisualContent = localStorage.getItem('customVisualContent');
    return storedVisualContent ? JSON.parse(storedVisualContent) : [];
}

// Function to find visual content associated with an article
function findVisualContentForArticle(articleId, allVisualContents, customVisualContents) {
    // First check if it's a standard article ID
    let visual = allVisualContents.find(v => v.getArticleId() === `index-news-article-${articleId}`);
    
    // If not found, check if it's a custom article ID
    if (!visual) {
        visual = allVisualContents.find(v => v.getArticleId() === articleId);
    }
    
    // If still not found, check in custom visual contents
    if (!visual) {
        const customVisual = customVisualContents.find(v => v.articleId === `user-article-${articleId}`);
        if (customVisual) {
            // Convert to VisualContent object
            visual = new VisualContent(
                customVisual.id,
                customVisual.name,
                customVisual.description,
                customVisual.shortName,
                customVisual.fileType,
                customVisual.cssClass || 'article-thumb',
                customVisual.articleId
            );
        }
    }
    
    return visual;
}

// Function to display articles in the admin panel
function displayArticlesInAdmin() {
    const articlesList = document.getElementById('articles-list');
    if (!articlesList) return;

    // Clear the loading message
    articlesList.innerHTML = '';

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
        
        // Combine CSV articles and custom articles for display
        const allArticles = [...articles];
        const allVisualContents = [...visualContents];
        
        // Add custom articles
        customArticles.forEach(articleData => {
            const article = new Article(
                articleData.id,
                articleData.name,
                articleData.description
            );
            allArticles.push(article);
        });
        
        // Add custom visual content
        customVisualContent.forEach(visualData => {
            const visual = new VisualContent(
                visualData.id,
                visualData.name,
                visualData.description,
                visualData.shortName,
                visualData.fileType,
                visualData.cssClass,
                visualData.articleId
            );
            allVisualContents.push(visual);
        });
        
        // Display all articles
        if (allArticles.length === 0) {
            articlesList.innerHTML = '<p>No articles found.</p>';
            return;
        }
        
        // Create article cards
        allArticles.forEach(article => {
            const articleCard = document.createElement('div');
            articleCard.className = 'article-card';
            
            // Find visual content for this article
            const visual = findVisualContentForArticle(article.getId(), allVisualContents, customVisualContent);
            
            articleCard.innerHTML = `
                <div class="article-image">
                    ${visual ? visual.getHTML('article-thumb') : '<div class="no-image">No Image</div>'}
                </div>
                <div class="article-info">
                    <h3>${article.getName()}</h3>
                    <p>${article.getDescription().substring(0, 150)}...</p>
                    <div class="article-details">
                        <span>ID: ${article.getId()}</span>
                        ${visual ? `<span>Image: ${visual.getShortName()}</span>` : ''}
                    </div>
                </div>
            `;
            
            articlesList.appendChild(articleCard);
        });
    });
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const title = document.getElementById('article-title').value;
    const description = document.getElementById('article-description').value;
    const imageName = document.getElementById('image-name').value;
    const imageDescription = document.getElementById('image-description').value;
    const fileType = document.getElementById('file-type').value;
    
    // Generate unique IDs
    const articleId = generateUniqueId();
    const visualId = Date.now().toString();
    const articleElementId = `user-article-${articleId}`;
    
    // Create new article object
    const newArticle = {
        id: articleId,
        name: title,
        description: description
    };
    
    // Create new visual content object
    const newVisualContent = {
        id: visualId,
        name: title,
        description: imageDescription,
        shortName: imageName,
        fileType: fileType,
        cssClass: 'news-article',
        articleId: articleElementId
    };
    
    // Load existing custom articles
    let customArticles = loadArticlesFromLocalStorage();
    let customVisualContent = loadVisualContentFromLocalStorage();
    
    // Add new content to the arrays
    customArticles.push(newArticle);
    customVisualContent.push(newVisualContent);
    
    // Save to localStorage
    saveArticlesToLocalStorage(customArticles);
    saveVisualContentToLocalStorage(customVisualContent);
    
    // Add to the DOM without refresh
    addArticleToDOM(newArticle, newVisualContent);
    
    // Reset the form
    document.getElementById('article-form').reset();
    
    // Show success message
    alert('Article added successfully!');
}

// Function to add a newly created article to the admin DOM
function addArticleToDOM(article, visual) {
    const articlesList = document.getElementById('articles-list');
    if (!articlesList) return;
    
    // Create article card
    const articleCard = document.createElement('div');
    articleCard.className = 'article-card';
    
    // Create visual content object for rendering
    const visualObj = new VisualContent(
        visual.id,
        visual.name,
        visual.description,
        visual.shortName,
        visual.fileType,
        visual.cssClass,
        visual.articleId
    );
    
    articleCard.innerHTML = `
        <div class="article-image">
            ${visualObj.getHTML('article-thumb')}
        </div>
        <div class="article-info">
            <h3>${article.name}</h3>
            <p>${article.description.substring(0, 150)}...</p>
            <div class="article-details">
                <span>ID: ${article.id}</span>
                <span>Image: ${visual.shortName}</span>
            </div>
        </div>
    `;
    
    // Add to the list (at the top)
    articlesList.insertBefore(articleCard, articlesList.firstChild);
}

// Initialize the admin page
document.addEventListener('DOMContentLoaded', function() {
    // Display existing articles
    displayArticlesInAdmin();
    
    // Add event listener for form submission
    const articleForm = document.getElementById('article-form');
    if (articleForm) {
        articleForm.addEventListener('submit', handleFormSubmit);
    }
});
