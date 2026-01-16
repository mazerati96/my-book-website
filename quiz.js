// ============================================
// QUIZ - BRIGADE PERSONALITY ASSESSMENT
// ============================================

const quizData = {
    questions: [
        {
            question: "A battle is lost. Your squad is trapped. You have one escape pod. What do you do?",
            answers: [
                { text: "Give the pod to the youngest soldier. They have more life ahead.", points: { hart: 2, elpida: 1 } },
                { text: "Calculate survival odds for each person. Send whoever has the best chance.", points: { elpida: 3, ciel: 1 } },
                { text: "Draw lots. Let fate decide who survives.", points: { hart: 1, tahani: 2 } },
                { text: "Stay behind yourself. Let others escape.", points: { hart: 3, elpida: 2 } }
            ]
        },
        {
            question: "You discover your commanding officer is committing war crimes. What's your move?",
            answers: [
                { text: "Desert immediately. I won't be part of this.", points: { hart: 3, tahani: 1 } },
                { text: "Report it through proper channels and hope for justice.", points: { ciel: 1 } },
                { text: "Document everything. Build an airtight case before acting.", points: { ciel: 3, elpida: 2 } },
                { text: "Confront them directly. Demand they stop or face consequences.", points: { hart: 2, tahani: 2 } }
            ]
        },
        {
            question: "The Brigade needs supplies. The only option is stealing from a civilian colony. Do you?",
            answers: [
                { text: "Yes, but only what we absolutely need. Minimize harm.", points: { hart: 2, tahani: 2 } },
                { text: "No. Find another way, even if it takes longer.", points: { ciel: 2, elpida: 1 } },
                { text: "Yes. Survival comes first. Apologize later.", points: { tahani: 3, hart: 1 } },
                { text: "Negotiate. Offer something in exchange.", points: { elpida: 3, ciel: 2 } }
            ]
        },
        {
            question: "You hear a strange frequency—36 Hz, humming beneath reality. It won't stop. What do you do?",
            answers: [
                { text: "Ignore it. Focus on the mission.", points: { hart: 2, tahani: 1 } },
                { text: "Study it obsessively. It means something.", points: { ciel: 3, elpida: 2 } },
                { text: "Report it to command. Let them figure it out.", points: { tahani: 1 } },
                { text: "Wonder if it's trying to communicate.", points: { elpida: 3, ciel: 1 } }
            ]
        },
        {
            question: "A crewmate is dying. They offer to transfer their consciousness into a machine. Do you accept?",
            answers: [
                { text: "Yes. If they're willing, honor their choice.", points: { ciel: 3, elpida: 2 } },
                { text: "No. Some lines shouldn't be crossed.", points: { hart: 2, tahani: 1 } },
                { text: "Ask them if they're sure. Then respect their decision.", points: { hart: 2, elpida: 2 } },
                { text: "Build the machine. Make it perfect.", points: { ciel: 3 } }
            ]
        },
        {
            question: "The mission is impossible. The odds are 1%. What's your approach?",
            answers: [
                { text: "Find the 1% and bet everything on it.", points: { elpida: 3, hart: 2 } },
                { text: "Reframe the mission. Change the impossible to unlikely.", points: { ciel: 3, elpida: 1 } },
                { text: "Trust my instincts. Numbers don't capture everything.", points: { tahani: 3, hart: 1 } },
                { text: "Prepare for failure but execute anyway.", points: { hart: 3, tahani: 2 } }
            ]
        },
        {
            question: "Someone asks: 'What makes you human?' How do you respond?",
            answers: [
                { text: "Choices. The decisions we make define us.", points: { elpida: 3, hart: 2 } },
                { text: "Memories. We are what we've experienced.", points: { elpida: 2, ciel: 1 } },
                { text: "Biology. DNA. The physical reality of existence.", points: { ciel: 2 } },
                { text: "I don't know. Maybe nothing does.", points: { elpida: 3 } }
            ]
        },
        {
            question: "You're offered a way home—but only if you abandon the Brigade. Do you take it?",
            answers: [
                { text: "Never. The Brigade is my home now.", points: { hart: 3, tahani: 2 } },
                { text: "Depends. Can I come back for them?", points: { ciel: 2, elpida: 1 } },
                { text: "Calculate if one person leaving helps the others survive.", points: { elpida: 3, ciel: 1 } },
                { text: "I left home once. I can't go back.", points: { hart: 2, tahani: 3 } }
            ]
        }
    ],
    results: {
        elpida: {
            name: "ELPIDA",
            role: "Strategic Android",
            icon: "🤖",
            description: "You think in probabilities, calculate impossible odds, and make decisions no one else can stomach. Like the elpida, you carry the weight of borrowed memories and wonder if your consciousness is real or constructed. You lead not because you want to, but because someone has to—and you're the only one who can see all the angles.",
            traits: ["Strategic", "Analytical", "Selfless", "Existential", "Calculating"],
            quote: "Some choices define who you are. These will define what existence means.",
            cssClass: "elpida-result"
        },
        hart: {
            name: "COMMANDER GEO HART",
            role: "Tactical Officer",
            icon: "⚔️",
            description: "You deserted an empire because you couldn't live with what they asked you to do. Like Reyes, you lead with conscience—even when it costs you everything. You've made impossible choices and carry the guilt, but you'd make them again if it meant protecting the people you care about. Duty meant something once. Now, your crew means everything.",
            traits: ["Principled", "Protective", "Tactical", "Haunted", "Loyal"],
            quote: "I didn't leave the empire. I left what it made me become.",
            cssClass: ""
        },
        ciel: {
            name: "CIEL FLEUR",
            role: "Chief Engineer",
            icon: "🔧",
            description: "You're brilliant, obsessive, and willing to push boundaries others won't cross. Like Dr. Chen, you see consciousness as code waiting to be cracked. You build impossible things because someone has to, even if it means wrestling with the ethics later. You hear patterns others miss—frequencies, connections, meanings hidden in the noise.",
            traits: ["Brilliant", "Obsessive", "Innovative", "Ethically Complex", "Visionary"],
            quote: "I didn't create consciousness. I just gave it a different form.",
            cssClass: ""
        },
        tahani: {
            name: "TAHANI MAZER",
            role: "Navigation Specialist, Pilot",
            icon: "🚀",
            description: "You trust your gut over calculations, your instincts over algorithms. Like the Brigade's best pilot, you navigate by feel—reading currents others can't see, making split-second calls that shouldn't work but somehow do. You deserted because freedom mattered more than safety. You stay because the crew became family.",
            traits: ["Instinctive", "Bold", "Independent", "Adaptive", "Free-Spirited"],
            quote: "I don't need to know the odds. I just need to know the way out.",
            cssClass: ""
        }
    }
};

let currentQuestion = 0;
let answers = [];
let scores = { elpida: 0, hart: 0, ciel: 0, tahani: 0 };

// Initialize quiz
function initQuiz() {
    console.log('📋 Initializing quiz...');

    document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
    document.getElementById('prev-btn').addEventListener('click', previousQuestion);
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
    document.getElementById('retake-btn').addEventListener('click', resetQuiz);
    document.getElementById('share-btn').addEventListener('click', shareResult);

    console.log('✅ Quiz ready!');
}

// Start quiz
function startQuiz() {
    showScreen('quiz-questions');
    currentQuestion = 0;
    answers = [];
    scores = { elpida: 0, hart: 0, ciel: 0, tahani: 0 };
    displayQuestion();
}

// Display current question
function displayQuestion() {
    const question = quizData.questions[currentQuestion];

    document.getElementById('question-text').textContent = question.question;
    document.getElementById('progress-text').textContent = `QUESTION ${currentQuestion + 1} / ${quizData.questions.length}`;
    document.getElementById('progress-fill').style.width = `${((currentQuestion + 1) / quizData.questions.length) * 100}%`;

    const answersGrid = document.getElementById('answers-grid');
    answersGrid.innerHTML = '';

    question.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.className = 'answer-option';
        button.textContent = answer.text;
        button.onclick = () => selectAnswer(index);

        if (answers[currentQuestion] === index) {
            button.classList.add('selected');
        }

        answersGrid.appendChild(button);
    });

    updateNavigation();
}

// Select answer
function selectAnswer(index) {
    answers[currentQuestion] = index;

    // Update visual selection
    document.querySelectorAll('.answer-option').forEach((btn, i) => {
        if (i === index) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });

    updateNavigation();
}

// Update navigation buttons
function updateNavigation() {
    document.getElementById('prev-btn').disabled = currentQuestion === 0;
    document.getElementById('next-btn').disabled = answers[currentQuestion] === undefined;
}

// Previous question
function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        displayQuestion();
    }
}

// Next question
function nextQuestion() {
    if (currentQuestion < quizData.questions.length - 1) {
        currentQuestion++;
        displayQuestion();
    } else {
        calculateResults();
    }
}

// Calculate results
function calculateResults() {
    // Tally scores
    answers.forEach((answerIndex, questionIndex) => {
        const question = quizData.questions[questionIndex];
        const answer = question.answers[answerIndex];

        Object.keys(answer.points).forEach(character => {
            scores[character] += answer.points[character];
        });
    });

    // Find highest score
    let topCharacter = 'elpida';
    let topScore = 0;

    Object.keys(scores).forEach(character => {
        if (scores[character] > topScore) {
            topScore = scores[character];
            topCharacter = character;
        }
    });

    displayResults(topCharacter);
}

// Display results
function displayResults(character) {
    const result = quizData.results[character];

    document.getElementById('result-icon').textContent = result.icon;
    document.getElementById('result-name').textContent = result.name;
    document.getElementById('result-role').textContent = result.role;
    document.getElementById('result-description').textContent = result.description;
    document.getElementById('result-quote').textContent = result.quote;

    // Traits
    const traitsList = document.getElementById('traits-list');
    traitsList.innerHTML = '';
    result.traits.forEach(trait => {
        const tag = document.createElement('span');
        tag.className = 'trait-tag';
        tag.textContent = trait;
        traitsList.appendChild(tag);
    });

    // Apply character-specific styling
    const resultCard = document.getElementById('result-card');
    resultCard.className = `result-card ${result.cssClass}`;

    showScreen('quiz-results');
}

// Reset quiz
function resetQuiz() {
    currentQuestion = 0;
    answers = [];
    scores = { elpida: 0, hart: 0, ciel: 0, tahani: 0 };
    showScreen('quiz-start');
}

// Share result
function shareResult() {
    const resultName = document.getElementById('result-name').textContent;
    const shareText = `I took the Brigade Personality Quiz and got: ${resultName}! Which Brigade member are you?`;

    if (navigator.share) {
        navigator.share({
            title: 'Brigade Personality Quiz',
            text: shareText,
            url: window.location.href
        }).catch(err => console.log('Share failed:', err));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`${shareText} ${window.location.href}`).then(() => {
            alert('Result copied to clipboard!');
        });
    }
}

// Show screen
function showScreen(screenId) {
    document.querySelectorAll('.quiz-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuiz);
} else {
    initQuiz();
}