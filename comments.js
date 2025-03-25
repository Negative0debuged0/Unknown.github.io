// Anonymous commenting system
import config from './config.js';

// Gun.js initialization
let gun;

export function initComments() {
    // Initialize Gun
    gun = Gun({
        peers: ['https://gun-manhattan.herokuapp.com/gun'] // Public relay server
    });
    
    createCommentSection();
    loadComments();
    setupCommentForm();
}

function createCommentSection() {
    const main = document.querySelector('main');
    
    const commentSection = document.createElement('section');
    commentSection.className = 'comments-section';
    commentSection.innerHTML = `
        <h2>Comments</h2>
        <div class="comment-form-container">
            <textarea id="comment-input" placeholder="Share your thoughts..." class="comment-textarea"></textarea>
            <button id="comment-submit" class="comment-button">Post Comment</button>
        </div>
        <div class="comments-container">
            <div class="comments-list">
                <!-- Comments will be loaded here -->
            </div>
        </div>
    `;
    
    main.appendChild(commentSection);
}

function setupCommentForm() {
    const commentInput = document.getElementById('comment-input');
    const commentSubmit = document.getElementById('comment-submit');
    
    // Submit comment
    commentSubmit.addEventListener('click', () => {
        const commentText = commentInput.value.trim();
        
        if (!commentText) {
            showNotification('Please enter a comment');
            return;
        }
        
        // Create a new comment
        const commentData = {
            text: commentText,
            timestamp: Date.now(),
            avatar: `https://ui-avatars.com/api/?name=Anonymous&background=random`
        };
        
        // Save to Gun
        gun.get('comments').set(commentData);
        
        // Clear input
        commentInput.value = '';
        
        showNotification('Comment posted!');
    });
}

function loadComments() {
    const commentsList = document.querySelector('.comments-list');
    
    // Load and listen for comments
    gun.get('comments').map().on(function(comment, id) {
        if (!comment) return;
        
        // Check if comment already exists in the DOM
        const existingComment = document.getElementById(`comment-${id}`);
        if (existingComment) return;
        
        // Create comment element
        const commentEl = document.createElement('div');
        commentEl.className = 'comment-item';
        commentEl.id = `comment-${id}`;
        
        const date = new Date(comment.timestamp);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        commentEl.innerHTML = `
            <div class="comment-header">
                <img src="${comment.avatar}" alt="Anonymous" class="comment-avatar">
                <div class="comment-meta">
                    <div class="comment-author">Anonymous</div>
                    <div class="comment-timestamp">${formattedDate}</div>
                </div>
            </div>
            <div class="comment-text">${comment.text}</div>
        `;
        
        // Add to the beginning of the list
        if (commentsList.firstChild) {
            commentsList.insertBefore(commentEl, commentsList.firstChild);
        } else {
            commentsList.appendChild(commentEl);
        }
    });
}

function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Show message
    notification.textContent = message;
    notification.classList.add('active');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
}