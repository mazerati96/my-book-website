// ============================================
// BREADCRUMB SYSTEM PATH NAVIGATION - FIXED
// ============================================

class BreadcrumbSystem {
    constructor() {
        this.pathMap = {
            'index.html': { name: 'HOME', parent: null },
            'trilogy.html': { name: 'TRILOGY', parent: 'index.html' },
            'signal.html': { name: 'SIGNAL', parent: 'index.html' },
            'book-one.html': { name: 'BOOK_ONE', parent: 'trilogy.html' },
            'book-two.html': { name: 'BOOK_TWO', parent: 'trilogy.html' },
            'book-three.html': { name: 'BOOK_THREE', parent: 'trilogy.html' },
            'authors.html': { name: 'AUTHORS', parent: 'index.html' },
            'universe.html': { name: 'UNIVERSE', parent: 'index.html' },
            'contact.html': { name: 'CONTACT', parent: 'index.html' },
            'characters.html': { name: 'CHARACTERS', parent: 'universe.html' },
            'timeline.html': { name: 'TIMELINE', parent: 'universe.html' },
            'gallery.html': { name: 'GALLERY', parent: 'index.html' },
            // ADDED MISSING PAGES:
            'quiz.html': { name: 'QUIZ', parent: 'index.html' },
            'memory-fragments.html': { name: 'FRAGMENTS', parent: 'index.html' },
            'fragments.html': { name: 'FRAGMENTS', parent: 'index.html' },
            'blog.html': { name: 'BLOG', parent: 'index.html' },
            'login.html': { name: 'LOGIN', parent: 'index.html' },
            'profile.html': { name: 'PROFILE', parent: 'index.html' }
        };
    }

    getCurrentPage() {
        let path = window.location.pathname;

        // Handle root path
        if (path === '/' || path === '') {
            return 'index.html';
        }

        // Extract filename
        const filename = path.split('/').pop();

        // Handle empty filename (trailing slash)
        if (!filename || filename === '') {
            return 'index.html';
        }

        return filename;
    }

    buildPath(currentPage) {
        const path = [];
        let page = currentPage;

        // Build path from current to root
        while (page && this.pathMap[page]) {
            path.unshift({
                name: this.pathMap[page].name,
                file: page
            });
            page = this.pathMap[page].parent;
        }

        // Always start with ROOT
        if (path.length === 0 || path[0].name !== 'HOME') {
            path.unshift({ name: 'ROOT', file: 'index.html' });
        } else {
            path[0].name = 'ROOT';
        }

        return path;
    }

    init() {
        const currentPage = this.getCurrentPage();

        const pathArray = this.buildPath(currentPage);

        // Create breadcrumb container
        const container = document.createElement('div');
        container.className = 'breadcrumb-container';

        const pathElement = document.createElement('div');
        pathElement.className = 'breadcrumb-path';

        // Build breadcrumb items
        pathArray.forEach((item, index) => {
            const isLast = index === pathArray.length - 1;

            // Create breadcrumb item
            if (isLast) {
                const span = document.createElement('span');
                span.className = 'breadcrumb-item active breadcrumb-typing';
                span.textContent = item.name;
                pathElement.appendChild(span);
            } else {
                const link = document.createElement('a');
                link.href = item.file;
                link.className = 'breadcrumb-item';
                link.textContent = item.name;
                pathElement.appendChild(link);

                // Add separator
                const separator = document.createElement('span');
                separator.className = 'breadcrumb-separator';
                separator.textContent = ' > ';
                pathElement.appendChild(separator);
            }
        });

        container.appendChild(pathElement);
        document.body.appendChild(container);

        console.log('✅ Breadcrumb system initialized:', pathArray.map(p => p.name).join(' > '));
    }
}

// Initialize breadcrumb system
const breadcrumbSystem = new BreadcrumbSystem();

// Start when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        breadcrumbSystem.init();
    });
} else {
    breadcrumbSystem.init();
}

// Export for manual control
if (typeof window !== 'undefined') {
    window.breadcrumbSystem = breadcrumbSystem;
}