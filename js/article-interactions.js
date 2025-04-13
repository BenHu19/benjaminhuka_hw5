// Article Interactions JS - Handles likes and comments for articles

// Function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Function to get the current article ID from the page
function getCurrentArticleId() {
    // Get the article ID from the URL parameter
    const urlArticleId = getUrlParameter('id');
    
    // If there's an ID in the URL, use that; otherwise default to 1
    return urlArticleId || '1';
}

// Functions for likes
function saveLikesToLocalStorage(articleId, likeCount) {
    const likes = getLikesFromLocalStorage();
    likes[articleId] = likeCount;
    localStorage.setItem('article-likes', JSON.stringify(likes));
}

function getLikesFromLocalStorage() {
    const likes = localStorage.getItem('article-likes');
    return likes ? JSON.parse(likes) : {};
}

function loadLikes() {
    const articleId = getCurrentArticleId();
    const likes = getLikesFromLocalStorage();
    const likeCount = likes[articleId] || 0;
    
    // Update UI
    document.querySelector('.like-count').textContent = likeCount;
    
    // Check if user has already liked this article
    const likedArticles = localStorage.getItem('user-liked-articles');
    const likedArticlesList = likedArticles ? JSON.parse(likedArticles) : [];
    
    if (likedArticlesList.includes(articleId)) {
        document.getElementById('like-button').classList.add('liked');
        document.querySelector('.like-icon').classList.remove('far');
        document.querySelector('.like-icon').classList.add('fas');
    }
}

function handleLikeButtonClick() {
    const articleId = getCurrentArticleId();
    const likeButton = document.getElementById('like-button');
    const likeCountElement = document.querySelector('.like-count');
    
    // Get liked articles from localStorage
    const likedArticles = localStorage.getItem('user-liked-articles');
    let likedArticlesList = likedArticles ? JSON.parse(likedArticles) : [];
    
    // Check if user has already liked this article
    const alreadyLiked = likedArticlesList.includes(articleId);
    
    if (alreadyLiked) {
        // Unlike
        likeButton.classList.remove('liked');
        document.querySelector('.like-icon').classList.remove('fas');
        document.querySelector('.like-icon').classList.add('far');
        
        // Update liked articles list
        likedArticlesList = likedArticlesList.filter(id => id !== articleId);
        
        // Update like count
        const currentLikes = parseInt(likeCountElement.textContent);
        const newLikeCount = Math.max(0, currentLikes - 1);
        likeCountElement.textContent = newLikeCount;
        
        // Save to localStorage
        saveLikesToLocalStorage(articleId, newLikeCount);
    } else {
        // Like
        likeButton.classList.add('liked');
        document.querySelector('.like-icon').classList.remove('far');
        document.querySelector('.like-icon').classList.add('fas');
        
        // Update liked articles list
        likedArticlesList.push(articleId);
        
        // Update like count
        const currentLikes = parseInt(likeCountElement.textContent);
        const newLikeCount = currentLikes + 1;
        likeCountElement.textContent = newLikeCount;
        
        // Save to localStorage
        saveLikesToLocalStorage(articleId, newLikeCount);
    }
    
    // Save liked articles list
    localStorage.setItem('user-liked-articles', JSON.stringify(likedArticlesList));
    
    // Add animation
    document.querySelector('.like-icon').classList.add('animated');
    setTimeout(() => {
        document.querySelector('.like-icon').classList.remove('animated');
    }, 300);
}

// Functions for comments
function saveCommentsToLocalStorage(articleId, comments) {
    const allComments = getCommentsFromLocalStorage();
    allComments[articleId] = comments;
    localStorage.setItem('article-comments', JSON.stringify(allComments));
}

function getCommentsFromLocalStorage() {
    const comments = localStorage.getItem('article-comments');
    return comments ? JSON.parse(comments) : {};
}

function loadComments() {
    const articleId = getCurrentArticleId();
    const allComments = getCommentsFromLocalStorage();
    const articleComments = allComments[articleId] || [];
    
    const commentsContainer = document.getElementById('comments-container');
    const commentCount = document.getElementById('comment-count');
    
    // Update comment count
    commentCount.textContent = articleComments.length;
    
    // Clear container
    commentsContainer.innerHTML = '';
    
    // If no comments, show message
    if (articleComments.length === 0) {
        commentsContainer.innerHTML = '<div class="no-comments">Be the first to comment!</div>';
        return;
    }
    
    // Add comments to the container
    articleComments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        
        commentElement.innerHTML = `
            <div class="comment-header">
                <span class="commenter-name">${comment.name}</span>
                <span class="comment-date">${comment.date}</span>
            </div>
            <div class="comment-text">${comment.text}</div>
        `;
        
        commentsContainer.appendChild(commentElement);
    });
}

function handleCommentFormSubmit(e) {
    e.preventDefault();
    
    const articleId = getCurrentArticleId();
    const nameInput = document.getElementById('commenter-name');
    const commentTextInput = document.getElementById('comment-text');
    
    const name = nameInput.value.trim();
    const text = commentTextInput.value.trim();
    
    if (!name || !text) {
        alert('Please fill in all fields');
        return;
    }
    
    // Create new comment object
    const newComment = {
        name: name,
        text: text,
        date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    // Get existing comments
    const allComments = getCommentsFromLocalStorage();
    const articleComments = allComments[articleId] || [];
    
    // Add new comment
    articleComments.unshift(newComment); // Add to the beginning of the array
    
    // Save to localStorage
    saveCommentsToLocalStorage(articleId, articleComments);
    
    // Update UI
    loadComments();
    
    // Reset form
    document.getElementById('comment-form').reset();
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Load likes and comments
    loadLikes();
    loadComments();
    
    // Add event listeners
    const likeButton = document.getElementById('like-button');
    if (likeButton) {
        likeButton.addEventListener('click', handleLikeButtonClick);
    }
    
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', handleCommentFormSubmit);
    }
});
