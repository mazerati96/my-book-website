// dashboard.js
// Check authentication
const token = localStorage.getItem('authToken');
const username = localStorage.getItem('username');

if (!token || !username) {
    window.location.href = '/dashboard.html';
}

// Display current user
document.getElementById('current-user').textContent = username;

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    window.location.href = '/author-login.html';
});

// View switching
const menuBtns = document.querySelectorAll('.menu-btn[data-view]');
const contentViews = document.querySelectorAll('.content-view');

menuBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const viewId = btn.dataset.view;

        // Update active menu button
        menuBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Show corresponding view
        contentViews.forEach(view => view.classList.remove('active'));
        document.getElementById(`${viewId}-view`).classList.add('active');

        // Load data for view
        if (viewId === 'posts') loadPosts('published');
        if (viewId === 'drafts') loadPosts('draft');
    });
});

// Rich text editor
const toolbar = document.getElementById('editor-toolbar');
const editor = document.getElementById('post-content');

toolbar.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        e.preventDefault();
        const command = e.target.dataset.command;

        if (command === 'h2' || command === 'h3') {
            document.execCommand('formatBlock', false, command);
        } else if (command === 'createLink') {
            const url = prompt('Enter URL:');
            if (url) document.execCommand('createLink', false, url);
        } else {
            document.execCommand(command, false, null);
        }

        editor.focus();
    }
});

// Post form submission
const postForm = document.getElementById('post-form');
let editingPostId = null;

postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await savePost('published');
});

document.getElementById('save-draft-btn').addEventListener('click', async () => {
    await savePost('draft');
});

async function savePost(status) {
    const title = document.getElementById('post-title').value;
    const category = document.getElementById('post-category').value;
    const content = document.getElementById('post-content').innerHTML;

    if (!title || !content) {
        alert('Please fill in title and content');
        return;
    }

    try {
        const endpoint = editingPostId ? '/api/posts/update' : '/api/posts/create';
        const method = editingPostId ? 'PUT' : 'POST';

        const body = editingPostId
            ? { postId: editingPostId, title, content, category, status }
            : { title, content, category, status };

        const response = await fetch(endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (data.success) {
            alert(status === 'published' ? 'Post published!' : 'Draft saved!');
            postForm.reset();
            editor.innerHTML = '';
            editingPostId = null;

            // Switch to posts view
            document.querySelector('.menu-btn[data-view="posts"]').click();
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        alert('Error saving post: ' + error.message);
    }
}

// Load posts
async function loadPosts(status = 'published') {
    const listId = status === 'draft' ? 'drafts-list' : 'posts-list';
    const listEl = document.getElementById(listId);

    listEl.innerHTML = '<p class="loading-text">Loading...</p>';

    try {
        const response = await fetch(`/api/posts/list?status=${status}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success && data.posts.length > 0) {
            listEl.innerHTML = data.posts.map(post => `
                <div class="post-card">
                    <div class="post-card-header">
                        <h3>${post.title}</h3>
                        <span class="post-category">${post.category}</span>
                    </div>
                    <div class="post-card-meta">
                        <span>By ${post.author}</span>
                        <span>${new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="post-card-content">
                        ${post.content.substring(0, 150)}...
                    </div>
                    <div class="post-card-actions">
                        <button onclick="editPost('${post.id}')" class="btn-edit">EDIT</button>
                        <button onclick="deletePost('${post.id}')" class="btn-delete">DELETE</button>
                    </div>
                </div>
            `).join('');
        } else {
            listEl.innerHTML = '<p class="empty-text">No posts yet.</p>';
        }
    } catch (error) {
        listEl.innerHTML = '<p class="error-text">Error loading posts</p>';
    }
}

// Edit post
window.editPost = async function (postId) {
    try {
        const response = await fetch(`/api/posts/list`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        const post = data.posts.find(p => p.id === postId);

        if (post) {
            editingPostId = postId;
            document.getElementById('post-title').value = post.title;
            document.getElementById('post-category').value = post.category;
            document.getElementById('post-content').innerHTML = post.content;

            // Switch to new post view
            document.querySelector('.menu-btn[data-view="new-post"]').click();

            // Scroll to top
            window.scrollTo(0, 0);
        }
    } catch (error) {
        alert('Error loading post: ' + error.message);
    }
};

// Delete post
window.deletePost = async function (postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
        const response = await fetch('/api/posts/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ postId })
        });

        const data = await response.json();

        if (data.success) {
            alert('Post deleted!');
            loadPosts('published');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        alert('Error deleting post: ' + error.message);
    }
};

// Load posts on page load
loadPosts('published');

// Change Password Form
const changePasswordForm = document.getElementById('change-password-form');
if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        const errorEl = document.getElementById('password-error');
        const successEl = document.getElementById('password-success');

        // Hide previous messages
        errorEl.style.display = 'none';
        successEl.style.display = 'none';

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            errorEl.textContent = 'New passwords do not match';
            errorEl.style.display = 'block';
            return;
        }

        // Validate password length
        if (newPassword.length < 8) {
            errorEl.textContent = 'Password must be at least 8 characters';
            errorEl.style.display = 'block';
            return;
        }

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                successEl.textContent = '✅ Password changed successfully!';
                successEl.style.display = 'block';
                changePasswordForm.reset();

                // Optionally scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                throw new Error(data.error || 'Failed to change password');
            }
        } catch (error) {
            errorEl.textContent = error.message;
            errorEl.style.display = 'block';
        }
    });
}