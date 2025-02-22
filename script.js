// Initialize EmailJS
(function() {
    emailjs.init("j3iI4CegnLO8hDhJt");
})();

// Game data with terms and definitions
const gameData = [
    { term: "State", response: "A political organization with a permanent population, defined territory, and government recognized by others." },
    { term: "Nation", response: "A group of people with a common identity based on culture, language, history, or ethnicity." },
    { term: "Regime", response: "The rules and institutions that govern political power in a state (e.g., democratic regime, authoritarian regime)." },
    { term: "Government", response: "The leadership or elite in charge of running the state." },
    { term: "Sovereignty", response: "The ability of a state to govern its territory free from external interference." },
    { term: "Legitimacy", response: "The right to rule, as determined by a country's own citizens. Can be traditional, charismatic, or rational-legal." },
    { term: "Democracy", response: "A system of government where power is vested in the people, who rule either directly or through freely elected representatives." },
    { term: "Authoritarianism", response: "A regime type where political power is concentrated in a single leader, party, or institution with limited political freedoms." },
    { term: "Totalitarianism", response: "An extreme version of authoritarianism where the state seeks to control every aspect of public and private life." },
    { term: "Illiberal Democracy", response: "A regime where elections take place but civil liberties, rule of law, and political competition are restricted." },
    { term: "Theocracy", response: "A government controlled by religious leaders or based on religious law." },
    { term: "Unicameral Legislature", response: "A legislature with one chamber." },
    { term: "Bicameral Legislature", response: "A legislature with two chambers (e.g., House of Commons and House of Lords in the UK)." },
    { term: "Head of State", response: "The chief public representative (e.g., monarch, president) who may have ceremonial duties." },
    { term: "Head of Government", response: "The official who runs the government and directs the operation of the executive branch (e.g., prime minister)." },
    { term: "Cabinet", response: "A body of advisors to the head of state or government, typically the top leaders of the executive branch." },
    { term: "Judiciary", response: "The branch of government responsible for interpreting laws." },
    { term: "Political Parties", response: "Organized groups that attempt to influence government by electing their members to important government offices." },
    { term: "Civil Society", response: "Organizations outside of the state that help people define and advance their interests (e.g., NGOs, labor unions)." },
    { term: "Interest Groups", response: "Organizations that seek to influence government policy without seeking election themselves." },
    { term: "Pluralism", response: "A system where multiple groups compete for influence and power." },
    { term: "Corporatism", response: "A system where the government includes specific groups in the policy-making process." },
    { term: "Revolution", response: "A fundamental and rapid change in political power or organizational structures." },
    { term: "Coup d'état", response: "A sudden overthrow of the government by a small group, typically the military." },
    { term: "Democratization", response: "The transition from an authoritarian regime to a democratic regime." },
    { term: "Political Socialization", response: "The process by which individuals develop their political attitudes, beliefs, and values." },
    { term: "Devolution", response: "The transfer of powers from the national government to subnational levels of government." },
    { term: "Rentier State", response: "A state that derives a significant portion of its revenues from renting natural resources to external clients." },
    { term: "Neoliberalism", response: "A policy model that emphasizes the value of free market competition, deregulation, and reduction in government spending." },
    { term: "Keynesianism", response: "An economic theory advocating for government intervention in the economy to achieve stable growth." },
    { term: "Subsidies", response: "Financial assistance granted by a government to support a desired industry or activity." },
    { term: "Austerity Measures", response: "Policies aimed at reducing government budget deficits through spending cuts and/or tax increases." },
    { term: "Political Culture", response: "The set of attitudes, beliefs, and sentiments that shape political behavior within a particular country." },
    { term: "Cleavages", response: "Divisions in society that have political significance (e.g., ethnic, religious, regional, class-based)." },
    { term: "Federalism", response: "A system of government in which power is divided between a central authority and constituent political units." },
    { term: "Unitary State", response: "A state governed as a single entity where the central government holds most of the power." },
    { term: "Political Efficacy", response: "The belief that one's political participation makes a difference." }
];

let currentUser = null;
let matches = new Map();
let timerInterval = null;
const GAME_TIME_MINUTES = 30;

// Timer management
function startTimer() {
    let timeLeft = GAME_TIME_MINUTES * 60; // Convert to seconds
    const timerDisplay = document.getElementById('timer');
    const timerContainer = document.querySelector('.timer');
    
    clearInterval(timerInterval); // Clear any existing timer
    
    timerInterval = setInterval(() => {
        timeLeft--;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeUp();
            return;
        }
        
        // Add warning class when less than 5 minutes remaining
        if (timeLeft <= 300) {
            timerContainer.classList.add('warning');
        }
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    document.getElementById('timer').textContent = '30:00';
    document.querySelector('.timer').classList.remove('warning');
}

function handleTimeUp() {
    showNotification('Time\'s up! Checking your answers...', 'warning');
    checkAnswers();
    document.getElementById('checkAnswers').disabled = true;
}

// Notification management
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    setTimeout(() => {
        notification.className = 'notification';
    }, 5000);
}

// Send score email
function sendScoreEmail(studentEmail, score, totalQuestions) {
    const templateParams = {
        to_email: 'walsha@esdallas.org',
        student_email: studentEmail,
        score: score,
        total_questions: totalQuestions,
        date: new Date().toLocaleString()
    };

    emailjs.send('service_i7kq4gn', 'template_0yu0jbe', templateParams)
        .then(() => {
            showNotification('Score has been sent to the teacher!', 'success');
        })
        .catch(() => {
            showNotification('Failed to send score to teacher. Please try again.', 'error');
        });
}

// User score management
function getUserHighScore(email) {
    const scoresData = localStorage.getItem('userScores');
    const scores = scoresData ? JSON.parse(scoresData) : {};
    return scores[email] || 0;
}

function updateUserHighScore(email, newScore) {
    const scoresData = localStorage.getItem('userScores');
    const scores = scoresData ? JSON.parse(scoresData) : {};
    
    if (!scores[email] || newScore > scores[email]) {
        scores[email] = newScore;
        localStorage.setItem('userScores', JSON.stringify(scores));
        
        // Send email when there's a new high score
        sendScoreEmail(email, newScore, gameData.length);
    }
    
    updateScoreDisplay();
}

function updateScoreDisplay() {
    const totalQuestions = gameData.length;
    document.getElementById('total-questions').textContent = totalQuestions;
    
    if (currentUser) {
        const highScore = getUserHighScore(currentUser);
        document.getElementById('highest-score').textContent = highScore;
    }
}

// Check if user is logged in
function checkLoginStatus() {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        currentUser = userEmail;
        showGame(userEmail);
    } else {
        showLogin();
    }
}

// Show login screen
function showLogin() {
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('game-container').style.display = 'none';
    currentUser = null;
    stopTimer();
}

// Show game screen
function showGame(email) {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    document.getElementById('user-email').textContent = email;
    document.getElementById('checkAnswers').disabled = false;
    currentUser = email;
    initializeGame();
    updateScoreDisplay();
    startTimer();
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    if (email) {
        localStorage.setItem('userEmail', email);
        showGame(email);
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('userEmail');
    showLogin();
    document.getElementById('email').value = '';
}

// Initialize the game
function initializeGame() {
    const termsContainer = document.getElementById('terms');
    const responsesContainer = document.getElementById('responses');
    
    // Clear containers
    termsContainer.innerHTML = '';
    responsesContainer.innerHTML = '';
    
    // Reset matches
    matches = new Map();
    
    // Shuffle the responses
    const shuffledResponses = [...gameData].sort(() => Math.random() - 0.5);
    
    // Create and append terms
    gameData.forEach((item, index) => {
        const termDiv = createDraggableElement(item.term, 'term', index);
        termsContainer.appendChild(termDiv);
    });
    
    // Create and append responses
    shuffledResponses.forEach((item, index) => {
        const responseDiv = createDraggableElement(item.response, 'response', index);
        responsesContainer.appendChild(responseDiv);
    });
    
    updateScoreDisplay();
}

// Create draggable elements
function createDraggableElement(text, className, index) {
    const div = document.createElement('div');
    div.className = className;
    div.textContent = text;
    div.draggable = true;
    div.dataset.index = index;
    
    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragend', handleDragEnd);
    div.addEventListener('dragover', handleDragOver);
    div.addEventListener('drop', handleDrop);
    
    return div;
}

// Drag and drop handlers
function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.textContent);
    e.dataTransfer.setData('source-class', e.target.className);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    
    const draggedText = e.dataTransfer.getData('text/plain');
    const sourceClass = e.dataTransfer.getData('source-class');
    const targetElement = e.target;
    
    // Only allow drops between terms and responses
    if (sourceClass !== targetElement.className && 
        (sourceClass === 'term' || sourceClass === 'response') &&
        (targetElement.className === 'term' || targetElement.className === 'response')) {
        
        // Store the match
        const term = sourceClass === 'term' ? draggedText : targetElement.textContent;
        const response = sourceClass === 'response' ? draggedText : targetElement.textContent;
        matches.set(term, response);
    }
}

// Check answers
function checkAnswers() {
    let score = 0;
    const terms = document.querySelectorAll('.term');
    
    terms.forEach(term => {
        term.classList.remove('correct', 'incorrect');
        const userResponse = matches.get(term.textContent);
        
        const correctPair = gameData.find(item => item.term === term.textContent);
        
        if (correctPair && userResponse === correctPair.response) {
            score++;
            term.classList.add('correct');
        } else {
            term.classList.add('incorrect');
        }
    });
    
    // Update user's high score if necessary
    if (currentUser) {
        updateUserHighScore(currentUser, score);
    }
    
    // Stop the timer after checking answers
    stopTimer();
}

// Event listeners
document.getElementById('login-form').addEventListener('submit', handleLogin);
document.getElementById('logout').addEventListener('click', handleLogout);
document.getElementById('checkAnswers').addEventListener('click', checkAnswers);
document.getElementById('resetGame').addEventListener('click', () => {
    initializeGame();
    startTimer();
    document.getElementById('checkAnswers').disabled = false;
});

// Initialize the login check when the page loads
window.addEventListener('load', checkLoginStatus); 