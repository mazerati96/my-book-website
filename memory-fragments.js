// ============================================
// MEMORY FRAGMENTS - ENHANCED WITH SECRETS
// ============================================

const memoryFragments = [
    {
        id: 'frag-001',
        type: 'quote',
        content: '"No sacrifice is worth giving if it is not for the living."',
        category: 'philosophy',
        riddleClue: 'What remains when all else fades?',
        riddleAnswer: 'soul',
        riddleHint: '(4 letters)'
    },
    {
        id: 'frag-002',
        type: 'memory',
        content: 'Ten years of war. Ten years of choices. All of them leading here.',
        category: 'past',
        riddleClue: 'What am I if not my memories?',
        riddleAnswer: 'mind',
        riddleHint: '(4 letters)'
    },
    {
        id: 'frag-003',
        type: 'thought',
        content: 'She wonders: Are these memories mine? Or am I just the echo of someone else?',
        category: 'android',
        riddleClue: 'Built, not born. What defines me?',
        riddleAnswer: 'choice',
        riddleHint: '(6 letters)'
    },
    {
        id: 'frag-004',
        type: 'signal',
        content: '36 Hertz. Constant. Eternal. A prayer against entropy.',
        category: 'frequency',
        riddleClue: 'The measure of all things.',
        riddleAnswer: 'souls',
        riddleHint: '(5 letters)'
    },
    {
        id: 'frag-005',
        type: 'quote',
        content: '"The measure of a soul is not what it is, but what it chooses to become."',
        category: 'philosophy',
        riddleClue: 'What you do when you decide.',
        riddleAnswer: 'choose',
        riddleHint: '(6 letters)'
    },
    {
        id: 'frag-006',
        type: 'vision',
        content: 'Gold. Everywhere gold. Visions that shouldn\'t exist in circuits and code.',
        category: 'android',
        riddleClue: 'What the frequency calls to.',
        riddleAnswer: 'minds',
        riddleHint: '(5 letters)'
    },
    {
        id: 'frag-007',
        type: 'memory',
        content: 'The soldier\'s last breath. The choice to continue. The transfer.',
        category: 'past',
        riddleClue: 'Without this, no choice matters.',
        riddleAnswer: 'purpose',
        riddleHint: '(7 letters)'
    },
    {
        id: 'frag-008',
        type: 'thought',
        content: 'The Brigade needs a leader. But can something built lead something born?',
        category: 'android',
        riddleClue: 'To show the way forward.',
        riddleAnswer: 'lead',
        riddleHint: '(4 letters)'
    },
    {
        id: 'frag-009',
        type: 'signal',
        content: 'The frequency whispers. It has been waiting. It knows.',
        category: 'frequency',
        riddleClue: 'Where consciousness meets circuitry.',
        riddleAnswer: 'her',
        riddleHint: '(3 letters)'
    },
    {
        id: 'frag-010',
        type: 'quote',
        content: '"Some choices define who you are. These will define what existence means."',
        category: 'philosophy',
        riddleClue: 'Everything that is.',
        riddleAnswer: 'existence',
        riddleHint: '(9 letters)'
    }
];

// THE ANSWER TO THE RIDDLE (lowercase for checking)
const RIDDLE_PASSWORD = 'soul mind choice souls choose minds purpose lead her existence';

class MemoryFragmentSystem {
    constructor() {
        this.useCloudStorage = false; // Will be set to true if user is logged in
        this.fragments = [];
        this.maxFragments = 5;
        this.spawnInterval = 15000;
        this.container = null;
        this.collectedFragments = this.loadCollectedFragments();
        this.solvedRiddles = this.loadSolvedRiddles();
        this.progressTracker = null;
        this.isMinimized = this.loadMinimizedState();
        this.konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowLeft', 'ArrowLeft', 'ArrowLeft', 'b', 'a'];
        this.konamiProgress = [];
        this.initKonamiListener();
    }

    loadCollectedFragments() {
        const saved = localStorage.getItem('collectedMemoryFragments');
        return saved ? JSON.parse(saved) : [];
    }

    saveCollectedFragments() {
        localStorage.setItem('collectedMemoryFragments', JSON.stringify(this.collectedFragments));

        // Also save to cloud if logged in
        if (window.authSystem && authSystem.isLoggedIn() && this.useCloudStorage) {
            authSystem.saveUserProgress('memoryFragments', this.collectedFragments);
        }
    }

    loadSolvedRiddles() {
        const saved = localStorage.getItem('solvedRiddles');
        return saved ? JSON.parse(saved) : [];
    }

    saveSolvedRiddles() {
        localStorage.setItem('solvedRiddles', JSON.stringify(this.solvedRiddles));

        // Also save to cloud if logged in
        if (window.authSystem && authSystem.isLoggedIn() && this.useCloudStorage) {
            authSystem.saveUserProgress('riddlesSolved', this.solvedRiddles);
        }
    }

    loadMinimizedState() {
        return localStorage.getItem('fragmentTrackerMinimized') === 'true';
    }

    saveMinimizedState(isMinimized) {
        localStorage.setItem('fragmentTrackerMinimized', isMinimized.toString());
    }

    // KONAMI CODE LISTENER
    initKonamiListener() {
        document.addEventListener('keydown', (e) => {
            this.konamiProgress.push(e.key);

            // Keep only last 10 keys
            if (this.konamiProgress.length > 10) {
                this.konamiProgress.shift();
            }

            // Check if konami code matches
            if (this.konamiProgress.join(',') === this.konamiCode.join(',')) {
                this.activateKonamiCode();
                this.konamiProgress = []; // Reset
            }
        });
    }

    activateKonamiCode() {
        // Unlock all fragments AND riddles
        const allFragmentIds = memoryFragments.map(f => f.id);
        this.collectedFragments = allFragmentIds;
        this.solvedRiddles = allFragmentIds;
        this.saveCollectedFragments();
        this.saveSolvedRiddles();
        this.updateProgressTracker();

        // Show special message
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';

        const modal = document.createElement('div');
        modal.className = 'memory-modal';
        modal.style.borderColor = 'var(--accent-gold)';
        modal.innerHTML = `
            <div style="color: var(--accent-gold); font-size: 2rem; font-weight: bold; margin-bottom: 1rem; text-align: center;">
                ⚡ DEVELOPER ACCESS GRANTED ⚡
            </div>
            <div class="memory-modal-content" style="font-style: normal; color: var(--accent-gold);">
                All memory fragments have been unlocked via Konami Code.<br><br>
                All riddles have been solved automatically.<br>
                The secret page is now accessible.
            </div>
            <button class="memory-modal-close" style="background-color: var(--accent-gold);">ACCESS GRANTED</button>
        `;

        document.body.appendChild(backdrop);
        document.body.appendChild(modal);

        const closeModal = () => {
            backdrop.remove();
            modal.remove();
        };

        modal.querySelector('.memory-modal-close').addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);

        console.log('🎮 KONAMI CODE ACTIVATED - All fragments unlocked!');
    }

    init() {
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

        this.createProgressTracker();
        this.addStyles();
        this.startSpawning();

        console.log('✅ Memory fragments collection system initialized');
        console.log(`📊 Collected: ${this.collectedFragments.length}/${memoryFragments.length}`);
        console.log('🎮 Konami Code enabled: ↑↑↓↓←←←←BA');
    }

    async loadCloudProgress() {
        if (!window.authSystem || !authSystem.isLoggedIn()) return;

        this.useCloudStorage = true;

        // Load from cloud
        const cloudFragments = await authSystem.getUserProgress('memoryFragments');
        const cloudRiddles = await authSystem.getUserProgress('riddlesSolved');

        if (cloudFragments) {
            this.collectedFragments = cloudFragments;
            this.saveCollectedFragments(); // Sync to localStorage
        }

        if (cloudRiddles) {
            this.solvedRiddles = cloudRiddles;
            this.saveSolvedRiddles(); // Sync to localStorage
        }

        this.updateProgressTracker();
        console.log('✅ Loaded progress from cloud');
    }

    createProgressTracker() {
        this.progressTracker = document.createElement('div');
        this.progressTracker.id = 'fragment-progress';
        this.progressTracker.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 380px;
            background: rgba(10, 10, 10, 0.95);
            border: 2px solid var(--accent-cyan);
            padding: 1rem;
            z-index: 1000;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            color: var(--accent-cyan);
            text-shadow: 0 0 5px var(--accent-cyan);
            cursor: move;
            transition: all 0.3s;
            pointer-events: auto;
            min-width: 180px;
        `;

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            display: flex;
            gap: 0.3rem;
            z-index: 10;
        `;

        const minimizeBtn = document.createElement('button');
        minimizeBtn.innerHTML = '−';
        minimizeBtn.title = 'Minimize';
        minimizeBtn.style.cssText = `
            background: transparent;
            border: 1px solid var(--accent-cyan);
            color: var(--accent-cyan);
            width: 20px;
            height: 20px;
            cursor: pointer;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            font-weight: bold;
            padding: 0;
        `;

        minimizeBtn.addEventListener('mouseenter', function () {
            this.style.background = 'var(--accent-cyan)';
            this.style.color = '#0a0a0a';
        });

        minimizeBtn.addEventListener('mouseleave', function () {
            this.style.background = 'transparent';
            this.style.color = 'var(--accent-cyan)';
        });

        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMinimize();
        });

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.title = 'Close';
        closeBtn.style.cssText = `
            background: transparent;
            border: 1px solid #ff0033;
            color: #ff0033;
            width: 20px;
            height: 20px;
            cursor: pointer;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            font-weight: bold;
            padding: 0;
        `;

        closeBtn.addEventListener('mouseenter', function () {
            this.style.background = '#ff0033';
            this.style.color = 'white';
            this.style.transform = 'rotate(90deg)';
        });

        closeBtn.addEventListener('mouseleave', function () {
            this.style.background = 'transparent';
            this.style.color = '#ff0033';
            this.style.transform = 'rotate(0deg)';
        });

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeTracker();
        });

        buttonContainer.appendChild(minimizeBtn);
        buttonContainer.appendChild(closeBtn);

        this.contentContainer = document.createElement('div');
        this.contentContainer.id = 'fragment-content';
        this.updateProgressTracker();

        this.progressTracker.appendChild(buttonContainer);
        this.progressTracker.appendChild(this.contentContainer);

        if (this.isMinimized) {
            this.applyMinimizedState();
        }

        let clickTimeout;
        let isDragging = false;

        this.progressTracker.addEventListener('mousedown', () => {
            isDragging = false;
            clickTimeout = setTimeout(() => {
                isDragging = true;
            }, 150);
        });

        this.progressTracker.addEventListener('mouseup', (e) => {
            clearTimeout(clickTimeout);

            if (!isDragging &&
                e.target !== minimizeBtn &&
                e.target !== closeBtn &&
                !e.target.classList.contains('minimized-indicator')) {
                this.showCollection();
            }

            isDragging = false;
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
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') {
                return;
            }

            e.preventDefault();
            isDragging = true;

            const rect = element.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            startX = e.clientX;
            startY = e.clientY;

            element.style.bottom = 'auto';
            element.style.right = 'auto';
            element.style.top = initialTop + 'px';
            element.style.left = initialLeft + 'px';

            element.style.cursor = 'grabbing';

            document.addEventListener('mousemove', dragMove);
            document.addEventListener('mouseup', dragEnd);
        }

        function dragMove(e) {
            if (!isDragging) return;

            e.preventDefault();

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            let newLeft = initialLeft + deltaX;
            let newTop = initialTop + deltaY;

            const maxLeft = window.innerWidth - element.offsetWidth;
            const maxTop = window.innerHeight - element.offsetHeight;

            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));

            element.style.left = newLeft + 'px';
            element.style.top = newTop + 'px';
        }

        function dragEnd() {
            if (!isDragging) return;

            isDragging = false;
            element.style.cursor = 'move';

            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('mouseup', dragEnd);
        }
    }

    updateProgressTracker() {
        const collected = this.collectedFragments.length;
        const total = memoryFragments.length;
        const solvedCount = this.solvedRiddles.length;
        const percentage = Math.round((collected / total) * 100);

        this.contentContainer.innerHTML = `
            <div style="margin-bottom: 0.5rem;">📦 MEMORY FRAGMENTS</div>
            <div style="font-size: 1.2rem; font-weight: bold;">${collected} / ${total}</div>
            <div style="font-size: 0.75rem; opacity: 0.7; margin-top: 0.3rem;">${percentage}% Complete</div>
            <div style="font-size: 0.7rem; opacity: 0.5; margin-top: 0.3rem;">🔐 Riddles: ${solvedCount}/${total}</div>
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
                0% { transform: scale(0) rotate(0deg); }
                50% { transform: scale(1.8) rotate(180deg); }
                100% { transform: scale(1) rotate(360deg); }
            }

            @keyframes float-fragment {
                0%, 100% { transform: translateY(0) translateX(0); }
                25% { transform: translateY(-30px) translateX(20px); }
                50% { transform: translateY(-10px) translateX(-20px); }
                75% { transform: translateY(-40px) translateX(10px); }
            }

            @keyframes pulse-fragment {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
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

            .riddle-section {
                background: rgba(255, 170, 0, 0.1);
                border: 1px solid var(--accent-gold);
                padding: 1rem;
                margin-top: 1.5rem;
            }

            .riddle-question {
                color: var(--accent-gold);
                font-size: 0.9rem;
                margin-bottom: 0.8rem;
                font-style: italic;
            }

            .riddle-input-wrapper {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
            }

            .riddle-input {
                flex: 1;
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid var(--accent-gold);
                color: var(--accent-gold);
                padding: 0.5rem;
                font-family: 'Courier New', monospace;
                text-align: center;
            }

            .riddle-input:focus {
                outline: none;
                box-shadow: 0 0 10px var(--accent-gold);
            }

            .riddle-submit {
                background: var(--accent-gold);
                color: var(--bg-black);
                border: none;
                padding: 0.5rem 1rem;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s;
            }

            .riddle-submit:hover {
                box-shadow: 0 0 15px var(--accent-gold);
            }

            .riddle-feedback {
                font-size: 0.8rem;
                margin-top: 0.5rem;
                font-weight: bold;
                display: none;
            }

            .riddle-feedback.correct {
                color: #00ff88;
                display: block;
            }

            .riddle-feedback.wrong {
                color: #ff0033;
                display: block;
            }

            .riddle-solved {
                background: rgba(0, 255, 136, 0.2);
                border: 1px solid #00ff88;
                padding: 1rem;
                margin-top: 1.5rem;
                text-align: center;
            }

            .riddle-answer-display {
                color: #00ff88;
                font-size: 1.1rem;
                font-weight: bold;
                margin-top: 0.5rem;
            }
        `;
        document.head.appendChild(style);
    }

    startSpawning() {
        this.spawnFragment();

        setInterval(() => {
            if (this.fragments.length < this.maxFragments) {
                this.spawnFragment();
            }
        }, this.spawnInterval);
    }

    spawnFragment() {
        const uncollected = memoryFragments.filter(
            f => !this.collectedFragments.includes(f.id)
        );

        const pool = uncollected.length > 0 ? uncollected : memoryFragments;
        const memory = pool[Math.floor(Math.random() * pool.length)];

        const fragment = document.createElement('div');
        fragment.className = `memory-fragment ${memory.category}`;
        fragment.dataset.fragmentId = memory.id;

        if (!this.collectedFragments.includes(memory.id)) {
            fragment.classList.add('new-fragment');
        }

        const x = Math.random() * (window.innerWidth - 100) + 50;
        const y = Math.random() * (window.innerHeight - 100) + 50;
        fragment.style.left = `${x}px`;
        fragment.style.top = `${y}px`;

        fragment.addEventListener('click', () => {
            this.revealMemory(memory, fragment);
        });

        this.container.appendChild(fragment);
        this.fragments.push({ element: fragment, memory });

        setTimeout(() => {
            this.removeFragment(fragment);
        }, 30000);
    }

    revealMemory(memory, fragmentElement) {
        const isNew = !this.collectedFragments.includes(memory.id);
        const isSolved = this.solvedRiddles.includes(memory.id);

        this.removeFragment(fragmentElement);

        if (isNew) {
            this.collectedFragments.push(memory.id);
            this.saveCollectedFragments();
            this.updateProgressTracker();
            this.checkMilestones();
        }

        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';

        const modal = document.createElement('div');
        modal.className = 'memory-modal';

        let riddleSection = '';

        if (isSolved) {
            // Already solved - show the answer
            riddleSection = `
                <div class="riddle-solved">
                    <div style="color: #00ff88; font-weight: bold; margin-bottom: 0.5rem;">✓ RIDDLE SOLVED</div>
                    <div style="color: var(--dark-white); font-size: 0.85rem; margin-bottom: 0.5rem;">${memory.riddleClue}</div>
                    <div class="riddle-answer-display">${memory.riddleAnswer.toUpperCase()}</div>
                </div>
            `;
        } else {
            // Not solved - show riddle input
            riddleSection = `
                <div class="riddle-section">
                    <div class="riddle-question">🔐 ${memory.riddleClue} ${memory.riddleHint}</div>
                    <div class="riddle-input-wrapper">
                        <input type="text" class="riddle-input" id="riddleInput-${memory.id}" placeholder="Your answer..." autocomplete="off">
                        <button class="riddle-submit" id="riddleSubmit-${memory.id}">CHECK</button>
                    </div>
                    <div class="riddle-feedback" id="riddleFeedback-${memory.id}"></div>
                </div>
            `;
        }

        modal.innerHTML = `
            ${isNew ? '<div class="new-fragment-badge">✨ NEW FRAGMENT COLLECTED!</div>' : ''}
            <div class="memory-modal-content">${memory.content}</div>
            ${riddleSection}
            <button class="memory-modal-close">CLOSE</button>
        `;

        document.body.appendChild(backdrop);
        document.body.appendChild(modal);

        // Setup riddle checking if not solved
        if (!isSolved) {
            const input = document.getElementById(`riddleInput-${memory.id}`);
            const submitBtn = document.getElementById(`riddleSubmit-${memory.id}`);
            const feedback = document.getElementById(`riddleFeedback-${memory.id}`);

            const checkAnswer = () => {
                const userAnswer = input.value.trim().toLowerCase();

                if (userAnswer === memory.riddleAnswer.toLowerCase()) {
                    // CORRECT!
                    this.solvedRiddles.push(memory.id);
                    this.saveSolvedRiddles();
                    this.updateProgressTracker();

                    feedback.className = 'riddle-feedback correct';
                    feedback.textContent = `✓ CORRECT! The answer is: ${memory.riddleAnswer.toUpperCase()}`;
                    input.disabled = true;
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'SOLVED';

                    // Check if all riddles are solved
                    if (this.solvedRiddles.length === memoryFragments.length) {
                        setTimeout(() => {
                            this.showAllRiddlesSolved();
                        }, 2000);
                    }
                } else {
                    // WRONG
                    feedback.className = 'riddle-feedback wrong';
                    feedback.textContent = '✗ Try again. Think about the fragment\'s meaning...';

                    setTimeout(() => {
                        feedback.style.display = 'none';
                    }, 3000);
                }
            };

            submitBtn.addEventListener('click', checkAnswer);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') checkAnswer();
            });
        }

        const closeModal = () => {
            backdrop.remove();
            modal.remove();
        };

        modal.querySelector('.memory-modal-close').addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);

        console.log(`Memory revealed: ${memory.content} ${isNew ? '(NEW!)' : '(DUPLICATE)'}`);
    }

    showAllRiddlesSolved() {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';

        const modal = document.createElement('div');
        modal.className = 'memory-modal';
        modal.style.borderColor = 'var(--accent-gold)';
        modal.innerHTML = `
            <div style="color: var(--accent-gold); font-size: 2rem; font-weight: bold; margin-bottom: 1rem; text-align: center;">
                🎉 ALL RIDDLES SOLVED! 🎉
            </div>
            <div class="memory-modal-content" style="font-style: normal; color: var(--primary-white);">
                You have collected all memory fragments and solved every riddle.<br><br>
                The secret page is now accessible.<br><br>
                Visit <span style="color: var(--accent-cyan);">/fragments-complete.html</span> to see the truth assembled.
            </div>
            <button class="memory-modal-close" style="background-color: var(--accent-gold);">CONTINUE</button>
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

    checkMilestones() {
        const collected = this.collectedFragments.length;
        const total = memoryFragments.length;

        if (collected === Math.floor(total * 0.25) || collected === Math.floor(total * 0.5) ||
            collected === Math.floor(total * 0.75) || collected === total) {
            this.showMilestoneReward(collected, total);
        }
    }

    showMilestoneReward(collected, total) {
        let message = '';
        let reward = '';

        if (collected === Math.floor(total * 0.25)) {
            message = '25% COMPLETE';
            reward = 'You\'ve begun to piece together the fragments of memory...';
        } else if (collected === Math.floor(total * 0.5)) {
            message = '50% COMPLETE';
            reward = 'Half the truth revealed. But truth is never whole, is it?';
        } else if (collected === Math.floor(total * 0.75)) {
            message = '75% COMPLETE';
            reward = 'The pattern emerges. The signal strengthens.';
        } else if (collected === total) {
            message = '🎉 COLLECTION COMPLETE! 🎉';
            reward = 'All fragments recovered. Now solve the riddles to unlock the secret page.';
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
        modal.style.maxWidth = '900px';
        modal.style.maxHeight = '70vh';
        modal.style.overflowY = 'auto';

        const gridHtml = memoryFragments.map(frag => {
            const isCollected = this.collectedFragments.includes(frag.id);
            const isSolved = this.solvedRiddles.includes(frag.id);
            return `
                <div class="collection-item ${isCollected ? 'collected' : 'locked'}">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">
                        ${isCollected ? (isSolved ? '✓' : '🔐') : '🔒'}
                    </div>
                    <div style="font-size: 0.8rem; opacity: 0.7;">
                        ${frag.category.toUpperCase()}
                    </div>
                    ${isCollected ? `
                        <div style="font-size: 0.75rem; margin-top: 0.5rem; font-style: italic;">"${frag.content.substring(0, 50)}..."</div>
                        ${isSolved ? `
                            <div style="margin-top: 0.5rem; padding: 0.3rem; background: rgba(0, 255, 136, 0.2); border: 1px solid #00ff88; font-size: 0.7rem; color: #00ff88;">
                                RIDDLE SOLVED: ${frag.riddleAnswer.toUpperCase()}
                            </div>
                        ` : `
                            <div style="margin-top: 0.5rem; padding: 0.3rem; background: rgba(255, 170, 0, 0.2); border: 1px solid var(--accent-gold); font-size: 0.7rem; color: var(--accent-gold);">
                                ${frag.riddleClue}
                            </div>
                        `}
                    ` : ''}
                </div>
            `;
        }).join('');

        modal.innerHTML = `
            <div style="color: var(--accent-cyan); font-size: 1.3rem; font-weight: bold; margin-bottom: 1rem; text-align: center;">
                MEMORY FRAGMENT COLLECTION
            </div>
            <div style="text-align: center; margin-bottom: 1rem; color: var(--dark-white);">
                ${this.collectedFragments.length} / ${memoryFragments.length} Collected • 
                ${this.solvedRiddles.length} / ${memoryFragments.length} Riddles Solved
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

    applyMinimizedState() {
        this.contentContainer.style.display = 'none';
        this.progressTracker.style.minWidth = '60px';
        this.progressTracker.style.cursor = 'pointer';

        const miniIndicator = document.createElement('div');
        miniIndicator.className = 'minimized-indicator';
        miniIndicator.style.cssText = `
            font-size: 1.5rem;
            text-align: center;
            padding: 0.5rem;
        `;
        miniIndicator.innerHTML = '📦';
        miniIndicator.title = 'Click to restore';
        this.progressTracker.insertBefore(miniIndicator, this.contentContainer);
    }

    toggleMinimize() {
        if (this.contentContainer.style.display === 'none') {
            // Maximize
            this.contentContainer.style.display = 'block';
            this.progressTracker.style.minWidth = '180px';
            this.progressTracker.style.cursor = 'move';

            // Remove minimized indicator
            const existingMini = this.progressTracker.querySelector('.minimized-indicator');
            if (existingMini) {
                existingMini.remove();
            }

            this.isMinimized = false;
            this.saveMinimizedState(false);
        } else {
            // Minimize
            this.applyMinimizedState();
            this.isMinimized = true;
            this.saveMinimizedState(true);
        }
    }

    closeTracker() {
        const confirmed = confirm('Close Memory Fragment tracker? You can re-enable it by refreshing the page.');
        if (confirmed) {
            this.progressTracker.style.opacity = '0';
            this.progressTracker.style.transform = 'scale(0)';
            setTimeout(() => {
                this.progressTracker.remove();
            }, 300);
        }
    }
}

// Initialize memory fragments system
const memoryFragmentSystem = new MemoryFragmentSystem();

// Start when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        memoryFragmentSystem.init();
        // Load cloud progress after auth initializes
        if (window.authSystem) {
            authSystem.onAuthStateChange(async (user) => {
                if (user) {
                    await memoryFragmentSystem.loadCloudProgress();
                }
            });
        }
    });
} else {
    memoryFragmentSystem.init();
    // Load cloud progress if already initialized
    if (window.authSystem && authSystem.isLoggedIn()) {
        memoryFragmentSystem.loadCloudProgress();
    }
}