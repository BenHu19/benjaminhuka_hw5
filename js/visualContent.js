// Visual Content Class for handling images and videos
class VisualContent {
    constructor(id, name, description, shortName, fileType, cssClass, articleId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.shortName = shortName;
        this.fileType = fileType;
        this.cssClass = cssClass;
        this.articleId = articleId;
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

    getShortName() {
        return this.shortName;
    }

    getFileType() {
        return this.fileType;
    }

    getCssClass() {
        return this.cssClass;
    }

    getArticleId() {
        return this.articleId;
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

    setShortName(shortName) {
        this.shortName = shortName;
    }

    setFileType(fileType) {
        this.fileType = fileType;
    }

    setCssClass(cssClass) {
        this.cssClass = cssClass;
    }

    setArticleId(articleId) {
        this.articleId = articleId;
    }

    // Convert to HTML tag based on file type
    getHTML(overrideCssClass) {
        const cssClass = overrideCssClass || this.cssClass;
        let filePath = '';
        
        if (this.fileType === 'image') {
            filePath = `images/${this.shortName}`;
            return `<img src="${filePath}" alt="${this.description}" class="${cssClass}">`;
        } else if (this.fileType === 'video') {
            filePath = `videos/${this.shortName}`;
            return `<video src="${filePath}" controls muted autoplay class="${cssClass}"></video>`;
        }
        
        return '';
    }
}

// Load visual content using fetch from the API endpoint
function loadVisualContent() {
    const visualContents = [];

    fetch('/api/visualContent')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Create VisualContent objects from the fetched data
                data.data.forEach(item => {
                    if (!item.ID) return;

                    const visualContent = new VisualContent(
                        item.ID,
                        item.Name,
                        item.Description,
                        item['Short Name'], 
                        item['File Type'],
                        item['CSS Class'],
                        item['Article ID']
                    );
                    visualContents.push(visualContent);
                });

                // Trigger a custom event to indicate visual contents are loaded
                const event = new CustomEvent('visualContentsLoaded');
                document.dispatchEvent(event);
            } else {
                console.error('Error fetching visual content:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching or parsing visual content:', error);
        });


    return visualContents; // Returns an initially empty array
}

// VisualContents array to store loaded data
let visualContents = [];

// Function to get visual content by article ID
function getVisualContentByArticleId(articleId) {
    return visualContents.find(content => content.getArticleId() === articleId);
}

// Function to initialize visual contents on page load
function initVisualContents() {
    visualContents = loadVisualContent();
}

// Function to render visual content to specific elements
function renderVisualContent() {
    // Get all elements with data-visual-content attribute
    const elements = document.querySelectorAll('[data-visual-content]');
    
    // If no visual contents loaded yet, wait for the visualContentsLoaded event
    if (visualContents.length === 0) {
        document.addEventListener('visualContentsLoaded', function() {
            renderVisualContentToElements(elements);
        });
    } else {
        renderVisualContentToElements(elements);
    }
}

// Helper function to render visual content to elements
function renderVisualContentToElements(elements) {
    elements.forEach(element => {
        const articleId = element.getAttribute('data-visual-content');
        const visualContent = getVisualContentByArticleId(articleId);
        
        if (visualContent) {
            element.innerHTML = visualContent.getHTML();
        }
    });
}

// Initialize visual contents when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initVisualContents();
    renderVisualContent();
});