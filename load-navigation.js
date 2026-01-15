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

            // Initialize hamburger menu
            initHamburgerMenu();
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

    // Initialize hamburger menu
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

        console.log('✅ Navigation loaded and initialized!');
    }
})();