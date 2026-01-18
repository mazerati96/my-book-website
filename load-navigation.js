// Load navigation HTML and initialize hamburger menu
(function () {
    // Load the navigation HTML
    fetch('navigation.html')
        .then(response => response.text())
        .then(html => {
            // Insert navigation at the start of body
            document.body.insertAdjacentHTML('afterbegin', html);

            // Highlight active page
            highlightActivePage();

            // Prefer the global initializer (which contains particle logic).
            // Fall back to the local init if the global isn't available.
            if (typeof window.initHamburgerMenu === 'function') {
                try {
                    window.initHamburgerMenu();
                    console.log('✅ Global initHamburgerMenu() invoked.');
                } catch (err) {
                    console.error('❌ Error calling global initHamburgerMenu(), falling back to local:', err);
                    initHamburgerMenu();
                }
            } else {
                initHamburgerMenu();
            }
        })
        .catch(error => {
            console.error('Error loading navigation:', error);
        });

    // Highlight the current page in navigation
    function highlightActivePage() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const links = document.querySelectorAll('.nav-link');

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Local fallback initializer: minimal toggling in case global isn't present
    function initHamburgerMenu() {
        const hamburger = document.querySelector('.hamburger');
        const sidebar = document.querySelector('.sidebar');

        if (!hamburger || !sidebar) {
            console.error('❌ Navigation elements not found!');
            return;
        }

        // Toggle menu
        hamburger.onclick = function (e) {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            sidebar.classList.toggle('active');
        };

        // Close when clicking outside
        document.onclick = function (e) {
            if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                sidebar.classList.remove('active');
            }
        };

        console.log('✅ Navigation loaded and initialized (fallback).');
    }
})();