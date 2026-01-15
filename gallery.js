// ============================================
// GALLERY PAGE - INTERACTIONS
// ============================================

function initGallery() {
    console.log('🎨 Initializing gallery...');

    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        // Click to expand (optional feature)
        item.addEventListener('click', () => {
            const title = item.dataset.title;
            const info = item.querySelector('.item-info h3').textContent;
            const desc = item.querySelector('.item-info p').textContent;

            // You could add a lightbox/modal here
            console.log(`Clicked: ${title}`);
        });

        // Enhanced glitch on hover
        item.addEventListener('mouseenter', () => {
            const overlay = item.querySelector('.glitch-overlay');
            if (overlay) {
                // Add extra glitch intensity
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGallery);
} else {
    initGallery();
}