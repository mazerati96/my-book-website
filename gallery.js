// ============================================
// GALLERY PAGE - INTERACTIONS WITH LIGHTBOX
// ============================================

function initGallery() {
    console.log('🎨 Initializing gallery...');

    const galleryItems = document.querySelectorAll('.gallery-item');

    // Create lightbox modal (only once)
    createLightbox();

    galleryItems.forEach(item => {
        // Click to open lightbox
        item.addEventListener('click', () => {
            const title = item.dataset.title;
            const imagePlaceholder = item.querySelector('.image-placeholder');
            const imageUrl = window.getComputedStyle(imagePlaceholder).backgroundImage;
            const description = item.querySelector('.item-info p').textContent;

            // Extract URL from CSS background-image property
            const cleanUrl = imageUrl.slice(5, -2); // Removes 'url("' and '")'

            openLightbox(cleanUrl, title, description);
        });

        // Enhanced glitch on hover
        item.addEventListener('mouseenter', () => {
            const overlay = item.querySelector('.glitch-overlay');
            if (overlay) {
                overlay.style.animationDuration = '0.3s';
            }
        });

        item.addEventListener('mouseleave', () => {
            const overlay = item.querySelector('.glitch-overlay');
            if (overlay) {
                overlay.style.animationDuration = '0.5s';
            }
        });
    });

    console.log('✅ Gallery ready!');
}

// Create lightbox HTML structure
function createLightbox() {
    const lightboxHTML = `
        <div id="lightbox" class="lightbox">
            <div class="lightbox-backdrop"></div>
            <div class="lightbox-content">
                <button class="lightbox-close">✕</button>
                <img id="lightbox-image" src="" alt="">
                <div class="lightbox-info">
                    <h3 id="lightbox-title"></h3>
                    <p id="lightbox-description"></p>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', lightboxHTML);

    // Close handlers
    document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    document.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
}

// Open lightbox with image
function openLightbox(imageUrl, title, description) {
    const lightbox = document.getElementById('lightbox');
    const image = document.getElementById('lightbox-image');
    const titleEl = document.getElementById('lightbox-title');
    const descEl = document.getElementById('lightbox-description');

    image.src = imageUrl;
    titleEl.textContent = title;
    descEl.textContent = description;

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

// Close lightbox
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable scrolling
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGallery);
} else {
    initGallery();
}