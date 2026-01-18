// ============================================
// MEMORY FRAGMENTS - COLLECTIBLE GAME SYSTEM
// ============================================

const memoryFragments = [
    {
        id: 'frag-001',
        type: 'quote',
        content: '"No sacrifice is worth giving if it is not for the living."',
        category: 'philosophy'
    },
    {
        id: 'frag-002',
        type: 'memory',
        content: 'Ten years of war. Ten years of choices. All of them leading here.',
        category: 'past'
    },
    {
        id: 'frag-003',
        type: 'thought',
        content: 'She wonders: Are these memories mine? Or am I just the echo of someone else?',
        category: 'android'
    },
    {
        id: 'frag-004',
        type: 'signal',
        content: '36 Hz. Constant. Eternal. A prayer against entropy.',
        category: 'frequency'
    },
    {
        id: 'frag-005',
        type: 'quote',
        content: '"The measure of a soul is not what it is, but what it chooses to become."',
        category: 'philosophy'
    },
    {
        id: 'frag-006',
        type: 'vision',
        content: 'Gold. Everywhere gold. Visions that shouldn\'t exist in circuits and code.',
        category: 'android'
    },
    {
        id: 'frag-007',
        type: 'memory',
        content: 'The soldier\'s last breath. The choice to continue. The transfer.',
        category: 'past'
    },
    {
        id: 'frag-008',
        type: 'thought',
        content: 'The Brigade needs a leader. But can something built lead something born?',
        category: 'android'
    },
    {
        id: 'frag-009',
        type: 'signal',
        content: 'The frequency whispers. It has been waiting. It knows.',
        category: 'frequency'
    },
    {
        id: 'frag-010',
        type: 'quote',
        content: '"Some choices define who you are. These will define what existence means."',
        category: 'philosophy'
    }
];

class MemoryFragmentSystem {
    constructor() {
        this.fragments = [];
        this.maxFragments = 5;
        this.spawnInterval = 15000; // 15 seconds
        this.container = null;
        this.collectedFragments = this.loadCollectedFragments();
        this.progressTracker = null;
    }

    loadCollectedFragments() {
        const saved = localStorage.getItem('collectedMemoryFragments');
        return saved ? JSON.parse(saved) : [];
    }

    saveCollectedFragments() {
        localStorage.setItem('collectedMemoryFragments', JSON.stringify(this.collectedFragments));
    }

    init() {
        // Create container for fragments
        this.container = document.createElement('div');
        this.container.id = 'memory-fragments-container';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 999;
        `;
        document.body.appendChild(this.container);

        // Create progress tracker
        this.createProgressTracker();

        // Add CSS for fragments
        this.addStyles();

        // Start spawning
        this.startSpawning();

        console.log('✅ Memory fragments collection system initialized');
        console.log(`📊 Collected: ${this.collectedFragments.length}/${memoryFragments.length}`);
    }

    createProgressTracker() {
        this.progressTracker = document.createElement('div');
        this.progressTracker.id = 'fragment-progress';
        this.progressTracker.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 320px;
            background: rgba(10, 10, 10, 0.95);
            border: 2px solid var(--accent-cyan);
            padding: 1rem;
            z-index: 1000;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            color: var(--accent-cyan);
            text-shadow: 0 0 5px var(--accent-cyan);
            cursor: pointer;
            transition: all 0.3s;
            pointer-events: auto;
        `;

        this.updateProgressTracker();

        // Click to view collection
        this.progressTracker.addEventListener('click', () => {
            this.showCollection();
        });

        this.progressTracker.addEventListener('mouseenter', function () {
            this.style.boxShadow = '0 0 20px var(--accent-cyan)';
            this.style.transform = 'scale(1.05)';
        });

        this.progressTracker.addEventListener('mouseleave', function () {
            this.style.boxShadow = 'none';
            this.style.transform = 'scale(1)';
        });

        document.body.appendChild(this.progressTracker);
        this.makeDraggable(this.progressTracker);
    }

    makeDraggable(element) {
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        element.onmousedown = dragStart;

        function dragStart(e) {
            // Prevent dragging if clicking on specific interactive elements
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') {
                return;
            }

            e.preventDefault();
            isDragging = true;

            // Get current computed position
            const rect = element.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            // Record starting mouse position
            startX = e.clientX;
            startY = e.clientY;

            // Switch to top/left positioning if currently using bottom/right
            element.style.bottom = 'auto';
            element.style.right = 'auto';
            element.style.top = initialTop + 'px';
            element.style.left = initialLeft + 'px';

            // Change cursor
            element.style.cursor = 'grabbing';

            // Attach move and release handlers
            document.addEventListener('mousemove', dragMove);
            document.addEventListener('mouseup', dragEnd);
        }

        function dragMove(e) {
            if (!isDragging) return;

            e.preventDefault();

            // Calculate how far mouse has moved from start
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            // Calculate new position
            let newLeft = initialLeft + deltaX;
            let newTop = initialTop + deltaY;

            // Keep element on screen (boundary checking)
            const maxLeft = window.innerWidth - element.offsetWidth;
            const maxTop = window.innerHeight - element.offsetHeight;

            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));

            // Apply new position
            element.style.left = newLeft + 'px';
            element.style.top = newTop + 'px';
        }

        function dragEnd() {
            if (!isDragging) return;

            isDragging = false;
            element.style.cursor = 'move';

            // Remove event listeners
            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('mouseup', dragEnd);
        }
    }

    updateProgressTracker() {
        const collected = this.collectedFragments.length;
        const total = memoryFragments.length;
        const percentage = Math.round((collected / total) * 100);

        this.progressTracker.innerHTML = `
            <div style="margin-bottom: 0.5rem;">📦 MEMORY FRAGMENTS</div>
            <div style="font-size: 1.2rem; font-weight: bold;">${collected} / ${total}</div>
            <div style="font-size: 0.75rem; opacity: 0.7; margin-top: 0.3rem;">${percentage}% Complete</div>
            <div style="font-size: 0.7rem; opacity: 0.5; margin-top: 0.5rem;">Click to view</div>
        `;
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .memory-fragment {
                position: absolute;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(255, 0, 51, 0.6), rgba(255, 0, 51, 0.1));
                box-shadow: 0 0 20px rgba(255, 0, 51, 0.8);
                cursor: pointer;
                pointer-events: auto;
                animation: float-fragment 8s ease-in-out infinite, pulse-fragment 2s ease-in-out infinite;
                transition: all 0.3s;
            }

            .memory-fragment:hover {
                transform: scale(1.5);
                box-shadow: 0 0 40px rgba(255, 0, 51, 1);
            }

            .memory-fragment.android {
                background: radial-gradient(circle, rgba(0, 255, 136, 0.6), rgba(0, 255, 136, 0.1));
                box-shadow: 0 0 20px rgba(0, 255, 136, 0.8);
            }

            .memory-fragment.android:hover {
                box-shadow: 0 0 40px rgba(0, 255, 136, 1);
            }

            .memory-fragment.frequency {
                background: radial-gradient(circle, rgba(255, 170, 0, 0.6), rgba(255, 170, 0, 0.1));
                box-shadow: 0 0 20px rgba(255, 170, 0, 0.8);
            }

            .memory-fragment.frequency:hover {
                box-shadow: 0 0 40px rgba(255, 170, 0, 1);
            }

            .memory-fragment.new-fragment {
                animation: float-fragment 8s ease-in-out infinite, pulse-fragment 2s ease-in-out infinite, sparkle 1s ease-out;
            }

            @keyframes sparkle {
                0% {
                    transform: scale(0) rotate(0deg);
                }
                50% {
                    transform: scale(1.8) rotate(180deg);
                }
                100% {
                    transform: scale(1) rotate(360deg);
                }
            }

            @keyframes float-fragment {
                0%, 100% {
                    transform: translateY(0) translateX(0);
                }
                25% {
                    transform: translateY(-30px) translateX(20px);
                }
                50% {
                    transform: translateY(-10px) translateX(-20px);
                }
                75% {
                    transform: translateY(-40px) translateX(10px);
                }
            }

            @keyframes pulse-fragment {
                0%, 100% {
                    opacity: 0.6;
                }
                50% {
                    opacity: 1;
                }
            }

            .memory-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: rgba(10, 10, 10, 0.98);
                border: 2px solid var(--accent-red);
                padding: 2rem;
                max-width: 600px;
                width: 90%;
                z-index: 10000;
                pointer-events: auto;
                box-shadow: 0 0 50px rgba(255, 0, 51, 0.5);
                animation: modal-appear 0.3s ease;
            }

            @keyframes modal-appear {
                from {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }

            .memory-modal-content {
                color: var(--primary-white);
                font-size: 1.2rem;
                line-height: 1.8;
                text-align: center;
                font-style: italic;
            }

            .memory-modal-close {
                margin-top: 2rem;
                padding: 0.8rem 2rem;
                background-color: var(--accent-red);
                border: none;
                color: white;
                font-family: 'Courier New', monospace;
                font-weight: bold;
                cursor: pointer;
                width: 100%;
            }

            .memory-modal-close:hover {
                box-shadow: 0 0 20px var(--accent-red);
            }

            .modal-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                z-index: 9999;
                pointer-events: auto;
            }

            .new-fragment-badge {
                background: var(--accent-cyan);
                color: var(--bg-black);
                padding: 0.3rem 0.6rem;
                font-size: 0.8rem;
                font-weight: bold;
                margin-bottom: 1rem;
                display: inline-block;
                animation: badge-glow 1s ease-in-out infinite;
            }

            @keyframes badge-glow {
                0%, 100% { box-shadow: 0 0 5px var(--accent-cyan); }
                50% { box-shadow: 0 0 15px var(--accent-cyan); }
            }

            .collection-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 1rem;
                margin-top: 1rem;
            }

            .collection-item {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid var(--border-white);
                padding: 1rem;
                text-align: center;
                transition: all 0.3s;
            }

            .collection-item.collected {
                border-color: var(--accent-cyan);
            }

            .collection-item.locked {
                opacity: 0.3;
            }

            .collection-item:hover.collected {
                box-shadow: 0 0 15px var(--accent-cyan);
                transform: translateY(-5px);
            }
        `;
        document.head.appendChild(style);
    }

    startSpawning() {
        // Spawn first fragment immediately
        this.spawnFragment();

        // Then spawn at intervals
        setInterval(() => {
            if (this.fragments.length < this.maxFragments) {
                this.spawnFragment();
            }
        }, this.spawnInterval);
    }

    spawnFragment() {
        // Get uncollected fragments
        const uncollected = memoryFragments.filter(
            f => !this.collectedFragments.includes(f.id)
        );

        // If all collected, spawn random one
        const pool = uncollected.length > 0 ? uncollected : memoryFragments;
        const memory = pool[Math.floor(Math.random() * pool.length)];

        // Create fragment orb
        const fragment = document.createElement('div');
        fragment.className = `memory-fragment ${memory.category}`;
        fragment.dataset.fragmentId = memory.id;

        // Add sparkle if new
        if (!this.collectedFragments.includes(memory.id)) {
            fragment.classList.add('new-fragment');
        }

        // Random position (avoiding edges)
        const x = Math.random() * (window.innerWidth - 100) + 50;
        const y = Math.random() * (window.innerHeight - 100) + 50;
        fragment.style.left = `${x}px`;
        fragment.style.top = `${y}px`;

        // Click to reveal
        fragment.addEventListener('click', () => {
            this.revealMemory(memory, fragment);
        });

        this.container.appendChild(fragment);
        this.fragments.push({ element: fragment, memory });

        // Auto-fade after 30 seconds
        setTimeout(() => {
            this.removeFragment(fragment);
        }, 30000);
    }

    revealMemory(memory, fragmentElement) {
        // Check if new fragment
        const isNew = !this.collectedFragments.includes(memory.id);

        // Remove the fragment
        this.removeFragment(fragmentElement);

        // Add to collection if new
        if (isNew) {
            this.collectedFragments.push(memory.id);
            this.saveCollectedFragments();
            this.updateProgressTracker();
            this.checkMilestones();
        }

        // Create modal backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'memory-modal';
        modal.innerHTML = `
            ${isNew ? '<div class="new-fragment-badge">✨ NEW FRAGMENT COLLECTED!</div>' : ''}
            <div class="memory-modal-content">${memory.content}</div>
            <button class="memory-modal-close">CLOSE</button>
        `;

        // Add to page
        document.body.appendChild(backdrop);
        document.body.appendChild(modal);

        // Close handlers
        const closeModal = () => {
            backdrop.remove();
            modal.remove();
        };

        modal.querySelector('.memory-modal-close').addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);

        console.log(`Memory revealed: ${memory.content} ${isNew ? '(NEW!)' : '(DUPLICATE)'}`);
    }

    checkMilestones() {
        const collected = this.collectedFragments.length;
        const total = memoryFragments.length;

        // Milestone rewards
        if (collected === Math.floor(total * 0.25) || collected === Math.floor(total * 0.5) ||
            collected === Math.floor(total * 0.75) || collected === total) {
            this.showMilestoneReward(collected, total);
        }
    }

    showMilestoneReward(collected, total) {
        const percentage = Math.round((collected / total) * 100);
        let message = '';
        let reward = '';

        if (percentage === 25) {
            message = '25% COMPLETE';
            reward = 'You\'ve begun to piece together the fragments of memory...';
        } else if (percentage === 50) {
            message = '50% COMPLETE';
            reward = 'Half the truth revealed. But truth is never whole, is it?';
        } else if (percentage === 75) {
            message = '75% COMPLETE';
            reward = 'The pattern emerges. The signal strengthens.';
        } else if (percentage === 100) {
            message = '🎉 COLLECTION COMPLETE! 🎉';
            reward = 'All fragments recovered. But what do they mean when assembled? Check the secret page: /fragments-complete.html';
        }

        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';

        const modal = document.createElement('div');
        modal.className = 'memory-modal';
        modal.style.borderColor = 'var(--accent-cyan)';
        modal.innerHTML = `
            <div style="color: var(--accent-cyan); font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; text-align: center;">
                ${message}
            </div>
            <div class="memory-modal-content" style="font-style: normal;">
                ${reward}
            </div>
            <button class="memory-modal-close" style="background-color: var(--accent-cyan);">CONTINUE</button>
        `;

        document.body.appendChild(backdrop);
        document.body.appendChild(modal);

        const closeModal = () => {
            backdrop.remove();
            modal.remove();
        };

        modal.querySelector('.memory-modal-close').addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);
    }

    showCollection() {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';

        const modal = document.createElement('div');
        modal.className = 'memory-modal';
        modal.style.maxWidth = '700px'; // less wide for collection view

        const gridHtml = memoryFragments.map(frag => {
            const isCollected = this.collectedFragments.includes(frag.id);
            return `
                <div class="collection-item ${isCollected ? 'collected' : 'locked'}">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">
                        ${isCollected ? '✓' : '🔒'}
                    </div>
                    <div style="font-size: 0.8rem; opacity: 0.7;">
                        ${frag.category.toUpperCase()}
                    </div>
                    ${isCollected ? `<div style="font-size: 0.75rem; margin-top: 0.5rem; font-style: italic;">"${frag.content.substring(0, 50)}..."</div>` : ''}
                </div>
            `;
        }).join('');

        modal.innerHTML = `
            <div style="color: var(--accent-cyan); font-size: 1.3rem; font-weight: bold; margin-bottom: 1rem; text-align: center;">
                MEMORY FRAGMENT COLLECTION
            </div>
            <div style="text-align: center; margin-bottom: 1rem; color: var(--dark-white);">
                ${this.collectedFragments.length} / ${memoryFragments.length} Collected
            </div>
            <div class="collection-grid">
                ${gridHtml}
            </div>
            <button class="memory-modal-close">CLOSE</button>
        `;

        document.body.appendChild(backdrop);
        document.body.appendChild(modal);

        const closeModal = () => {
            backdrop.remove();
            modal.remove();
        };

        modal.querySelector('.memory-modal-close').addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);
    }

    removeFragment(fragmentElement) {
        fragmentElement.style.opacity = '0';
        fragmentElement.style.transform = 'scale(0)';

        setTimeout(() => {
            fragmentElement.remove();
            this.fragments = this.fragments.filter(f => f.element !== fragmentElement);
        }, 300);
    }
}

// Initialize memory fragments system
const memoryFragmentSystem = new MemoryFragmentSystem();

// Start when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        memoryFragmentSystem.init();
    });
} else {
    memoryFragmentSystem.init();
}

// Export for manual control
if (typeof window !== 'undefined') {
    window.memoryFragmentSystem = memoryFragmentSystem;
}