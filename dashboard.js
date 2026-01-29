// dashboard.js
console.log('📊 Dashboard.js loaded');

// Wait for authSystem to be ready
function waitForAuthSystem(callback) {
    if (window.authSystem) {
        console.log('✅ authSystem found');
        callback();
    } else {
        console.log('⏳ Waiting for authSystem...');
        setTimeout(() => waitForAuthSystem(callback), 100);
    }
}

// Wait for authSystem, THEN run checkAuth
waitForAuthSystem(() => {
    console.log('✅ authSystem ready, checking auth...');
    checkAuth();
});

// Check authentication
async function checkAuth() {
    console.log('🔍 Starting auth check...');

    const overlay = document.getElementById('auth-check-overlay');

    try {
        // Check localStorage first
        const token = localStorage.getItem('authToken');
        const username = localStorage.getItem('username');

        if (!token || !username) {
            console.log('❌ No token/username found, redirecting to login...');
            window.location.href = '/author-login.html';
            return;
        }

        console.log('✅ Token and username found in localStorage');

        // Give Firebase a moment to initialize auth state
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Wait for Firebase auth to initialize
        const currentUser = await window.authSystem.getCurrentUser();

        if (!currentUser) {
            console.error('❌ No Firebase user found, redirecting to login...');
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            localStorage.removeItem('isAdmin');
            window.location.href = '/author-login.html';
            return;
        }

        console.log('✅ Firebase user confirmed:', currentUser.uid);

        // Wait for profile to load if not already loaded
        if (!window.authSystem.userProfile) {
            console.log('⏳ Profile not loaded yet, loading now...');
            await window.authSystem.loadUserProfile(currentUser.uid);
            // Give it a moment to finish
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('✅ User profile loaded:', window.authSystem.userProfile?.username);
        console.log('📊 Profile data:', window.authSystem.userProfile);

        // Verify admin status from the profile
        if (!window.authSystem.userProfile || !window.authSystem.userProfile.isAdmin) {
            console.error('❌ Not an admin user, redirecting to login...');
            console.error('Profile:', window.authSystem.userProfile);
            await window.authSystem.signOut();
            localStorage.clear();
            window.location.href = '/author-login.html';
            return;
        }

        console.log('✅ Admin access confirmed!');

        // Update UI with username
        const currentUserEl = document.getElementById('current-user');
        if (currentUserEl) {
            currentUserEl.textContent = window.authSystem.userProfile.username;
        }

        // Hide loading overlay
        if (overlay) {
            overlay.style.display = 'none';
        }

        // Initialize dashboard
        initDashboard();

    } catch (error) {
        console.error('❌ Auth check error:', error);
        if (overlay) {
            overlay.innerHTML = '<p style="color: #ff0033;">Authentication failed. Redirecting...</p>';
        }
        setTimeout(() => {
            window.location.href = '/author-login.html';
        }, 2000);
    }
}

// Initialize dashboard functionality
function initDashboard() {
    console.log('🚀 Initializing dashboard...');

    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            console.log('🚪 Logging out...');
            if (window.authSystem) {
                await window.authSystem.signOut();
            }
            localStorage.clear();
            window.location.href = '/author-login.html';
        });
    }

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
            const targetView = document.getElementById(`${viewId}-view`);
            if (targetView) {
                targetView.classList.add('active');
            }

            // Load data for view
            if (viewId === 'posts') loadPosts('published');
            if (viewId === 'drafts') loadPosts('draft');
        });
    });

    // Rich text editor
    const toolbar = document.getElementById('editor-toolbar');
    const editor = document.getElementById('post-content');

    if (toolbar && editor) {
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
    }

    // Post form submission
    const postForm = document.getElementById('post-form');
    const saveDraftBtn = document.getElementById('save-draft-btn');
    let editingPostId = null;

    if (postForm) {
        postForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await savePost('published');
        });
    }

    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', async () => {
            await savePost('draft');
        });
    }

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
                const postsBtn = document.querySelector('.menu-btn[data-view="posts"]');
                if (postsBtn) postsBtn.click();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            alert('Error saving post: ' + error.message);
            console.error('Save post error:', error);
        }
    }

    // Load posts
    async function loadPosts(status = 'published') {
        const listId = status === 'draft' ? 'drafts-list' : 'posts-list';
        const listEl = document.getElementById(listId);

        if (!listEl) return;

        listEl.innerHTML = '<p class="loading-text">Loading...</p>';

        try {
            const response = await fetch(`/api/posts/list?status=${status}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success && data.posts && data.posts.length > 0) {
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
            console.error('Error loading posts:', error);
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
                const newPostBtn = document.querySelector('.menu-btn[data-view="new-post"]');
                if (newPostBtn) newPostBtn.click();

                // Scroll to top
                window.scrollTo(0, 0);
            }
        } catch (error) {
            alert('Error loading post: ' + error.message);
            console.error('Edit post error:', error);
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
            console.error('Delete post error:', error);
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
                // Use Firebase to update password
                const user = window.authSystem.currentUser;

                if (!user) {
                    throw new Error('No user logged in');
                }

                // Re-authenticate user first
                const credential = firebase.auth.EmailAuthProvider.credential(
                    user.email,
                    currentPassword
                );

                await user.reauthenticateWithCredential(credential);

                // Now update the password
                await user.updatePassword(newPassword);

                successEl.textContent = '✅ Password changed successfully!';
                successEl.style.display = 'block';
                changePasswordForm.reset();

                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });

                console.log('✅ Password changed successfully');

            } catch (error) {
                console.error('Password change error:', error);

                let errorMessage = 'Failed to change password';

                if (error.code === 'auth/wrong-password') {
                    errorMessage = 'Current password is incorrect';
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = 'New password is too weak';
                } else if (error.message) {
                    errorMessage = error.message;
                }

                errorEl.textContent = errorMessage;
                errorEl.style.display = 'block';
            }
        });
    }

    console.log('✅ Dashboard initialized');
}