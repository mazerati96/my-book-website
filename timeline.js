// ============================================
// TIMELINE PAGE - FILTER LOGIC
// ============================================

function initTimeline() {
    console.log('📅 Initializing timeline...');

    const filterButtons = document.querySelectorAll('.timeline-filter');
    const timelineEvents = document.querySelectorAll('.timeline-event');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;

            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Filter events
            timelineEvents.forEach(event => {
                if (filter === 'all') {
                    event.classList.remove('hidden');
                } else if (event.classList.contains(filter)) {
                    event.classList.remove('hidden');
                } else {
                    event.classList.add('hidden');
                }
            });
        });
    });

    console.log('✅ Timeline ready!');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTimeline);
} else {
    initTimeline();
}