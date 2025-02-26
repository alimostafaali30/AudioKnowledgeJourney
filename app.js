class Database {
    constructor() {
        // Load data from localStorage or initialize empty structures
        const savedData = this.loadFromLocalStorage();
        
        this.users = new Map(savedData.users || []);
        this.subjects = new Map(savedData.subjects || []);
        this.questions = new Map(savedData.questions || []);
        this.scores = new Map(savedData.scores || []);
        
        // Add default admin account if no users exist
        if (this.users.size === 0) {
            this.users.set('admin', {
                username: 'admin',
                password: 'admin123',
                role: 'teacher'
            });
            this.saveToLocalStorage();
        }
    }

    // Add method to save to localStorage
    saveToLocalStorage() {
        const data = {
            users: Array.from(this.users.entries()),
            subjects: Array.from(this.subjects.entries()),
            questions: Array.from(this.questions.entries()),
            scores: Array.from(this.scores.entries())
        };
        localStorage.setItem('audioGameData', JSON.stringify(data));
    }

    // Add method to load from localStorage
    loadFromLocalStorage() {
        const savedData = localStorage.getItem('audioGameData');
        return savedData ? JSON.parse(savedData) : {};
    }

    // User management
    addUser(username, password, role) {
        if (this.users.has(username)) {
            return false;
        }
        this.users.set(username, { username, password, role });
        this.saveToLocalStorage();
        return true;
    }

    validateUser(username, password) {
        const user = this.users.get(username);
        return user && user.password === password ? user : null;
    }

    // Subject management
    addSubject(name, teacherUsername, questionsPerTest = 10) {
        const subjectId = Date.now().toString();
        this.subjects.set(subjectId, {
            id: subjectId,
            name,
            teacherUsername,
            questions: [],
            questionsPerTest: questionsPerTest
        });
        this.saveToLocalStorage();
        return subjectId;
    }

    // Question management
    addQuestion(subjectId, question) {
        const subject = this.subjects.get(subjectId);
        if (subject) {
            question.id = Date.now().toString();
            subject.questions.push(question);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    getQuestionsBySubject(subjectId) {
        return this.subjects.get(subjectId)?.questions || [];
    }

    // Score management
    recordScore(studentUsername, subjectId, questionId, correct, attempts) {
        const scoreKey = `${studentUsername}-${subjectId}`;
        if (!this.scores.has(scoreKey)) {
            this.scores.set(scoreKey, []);
        }
        this.scores.get(scoreKey).push({
            questionId,
            correct,
            attempts,
            timestamp: new Date()
        });
        this.saveToLocalStorage();
    }

    getStudentScores(studentUsername, subjectId) {
        const scoreKey = `${studentUsername}-${subjectId}`;
        return this.scores.get(scoreKey) || [];
    }

    // Add method to update questions per test
    updateQuestionsPerTest(subjectId, count) {
        const subject = this.subjects.get(subjectId);
        if (subject) {
            subject.questionsPerTest = count;
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    // Add method to get random questions for a test
    getRandomQuestionsForTest(subjectId) {
        const subject = this.subjects.get(subjectId);
        if (!subject || !subject.questions.length) return [];

        const numQuestions = Math.min(subject.questionsPerTest, subject.questions.length);
        const shuffled = [...subject.questions].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, numQuestions);
    }

    // Add method to clear all data (useful for testing)
    clearAllData() {
        this.users = new Map();
        this.subjects = new Map();
        this.questions = new Map();
        this.scores = new Map();
        
        // Add default admin account back
        this.users.set('admin', {
            username: 'admin',
            password: 'admin123',
            role: 'teacher'
        });
        
        this.saveToLocalStorage();
    }
}

// Initialize database
const db = new Database();

// Add language translations
const translations = {
    en: {
        welcome: "Welcome to Voice Learning Platform",
        login: {
            title: "Welcome Back",
            subtitle: "Sign in to access your tests",
            username: "Username",
            password: "Password",
            signIn: "Sign In",
            createAccount: "Create Account",
            voiceHint: "Try saying 'login' or 'register'"
        },
        register: {
            title: "Create Account",
            subtitle: "Join the learning platform",
            username: "Username",
            password: "Password",
            role: "I am a:",
            student: "Student",
            teacher: "Teacher",
            submit: "Create Account",
            back: "Back to Login"
        },
        tutorial: {
            title: "Voice Learning Platform Tutorial",
            step1: {
                title: "Welcome!",
                narration: "Welcome to the Voice Learning Platform! This platform is designed to be fully accessible through voice commands."
            },
            step2: {
                title: "Voice Controls",
                narration: "To use voice commands, click the microphone icon or say 'start listening'."
            },
            step3: {
                title: "Basic Commands",
                narration: "Here are the basic commands you can use..."
            },
            step4: {
                title: "Ready!",
                narration: "Great! You're ready to start using the platform."
            }
        },
        commands: {
            login: ['login', 'sign in'],
            register: ['register', 'sign up', 'create account'],
            logout: ['logout', 'sign out'],
            next: ['next', 'continue'],
            back: ['back', 'previous'],
            repeat: ['repeat', 'say again'],
            help: ['help', 'commands'],
            darkMode: ['dark mode', 'dark theme'],
            lightMode: ['light mode', 'light theme']
        }
    },
    ar: {
        welcome: "مرحباً بك في منصة التعلم الصوتي",
        login: {
            title: "مرحباً بعودتك",
            subtitle: "سجل الدخول للوصول إلى الاختبارات",
            username: "اسم المستخدم",
            password: "كلمة المرور",
            signIn: "تسجيل الدخول",
            createAccount: "إنشاء حساب",
            voiceHint: "جرب أن تقول 'تسجيل الدخول' أو 'تسجيل'"
        },
        register: {
            title: "إنشاء حساب",
            subtitle: "انضم إلى منصة التعلم",
            username: "اسم المستخدم",
            password: "كلمة المرور",
            role: "أنا:",
            student: "طالب",
            teacher: "معلم",
            submit: "إنشاء حساب",
            back: "العودة لتسجيل الدخول"
        },
        tutorial: {
            title: "دليل منصة التعلم الصوتي",
            step1: {
                title: "مرحباً!",
                narration: "مرحباً بك في منصة التعلم الصوتي! هذه المنصة مصممة لتكون متاحة بالكامل من خلال الأوامر الصوتية."
            },
            step2: {
                title: "التحكم الصوتي",
                narration: "لاستخدام الأوامر الصوتية، انقر على أيقونة الميكروفون أو قل 'ابدأ الاستماع'."
            },
            step3: {
                title: "الأوامر الأساسية",
                narration: "إليك الأوامر الأساسية التي يمكنك استخدامها..."
            },
            step4: {
                title: "جاهز!",
                narration: "رائع! أنت جاهز لبدء استخدام المنصة."
            }
        },
        commands: {
            login: ['تسجيل الدخول', 'دخول'],
            register: ['تسجيل', 'إنشاء حساب'],
            logout: ['تسجيل خروج', 'خروج'],
            next: ['التالي', 'استمر'],
            back: ['رجوع', 'السابق'],
            repeat: ['تكرار', 'أعد'],
            help: ['مساعدة', 'الأوامر'],
            darkMode: ['الوضع الداكن', 'الوضع الليلي'],
            lightMode: ['الوضع الفاتح', 'الوضع النهاري']
        }
    }
};

class AudioGame {
    constructor() {
        this.currentLevel = 1;
        this.questions = [];  // Questions stored in memory
        this.currentQuestion = 0;
        this.speech = new SpeechSynthesisUtterance();
        this.speech.rate = 0.9; // Slightly slower speech rate for clarity
        this.speech.pitch = 1;
        this.speech.volume = 1;
        this.isPlaying = false;
        
        // Set up voice when voices are loaded
        speechSynthesis.addEventListener('voiceschanged', () => {
            const voices = speechSynthesis.getVoices();
            const englishVoice = voices.find(voice => voice.lang.startsWith('en-'));
            if (englishVoice) {
                this.speech.voice = englishVoice;
            }
        });
        
        // Initialize voice recognition
        this.setupVoiceRecognition();
        
        this.recognition = null;
        this.isListening = false;
        this.voiceButtonAdded = false;  // Add this flag
        
        this.currentUser = null;
        this.currentSubject = null;
        this.attempts = 0;
        
        // Add logout button functionality
        const logoutBtn = document.getElementById('logout-btn');
        logoutBtn.addEventListener('click', () => this.logout());
        
        // Initialize login and register event listeners
        this.initializeAuthEvents();
        
        // Show login screen instead of PIN screen
        this.showLoginScreen();
        
        // Check if this is the first visit
        if (!localStorage.getItem('tutorialShown')) {
            this.showVoiceTutorial();
        }
        
        // Set default language
        this.currentLang = localStorage.getItem('preferredLanguage') || 'en';
        document.documentElement.lang = this.currentLang;
        document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
        
        // Add language switcher
        this.addLanguageSwitcher();

        // Set default theme
        this.currentTheme = localStorage.getItem('preferredTheme') || 'light';
        this.applyTheme(this.currentTheme);
        
        // Add theme switcher
        this.addThemeSwitcher();
    }

    // Static property to store all questions across instances
    static allQuestions = [];

    initializeEventListeners() {
        // Button click listeners
        document.getElementById('start-tutorial').addEventListener('click', () => this.startTutorial());
        document.getElementById('play-question').addEventListener('click', () => this.playQuestion());
        document.getElementById('play-options').addEventListener('click', () => this.playOptions());
        document.getElementById('repeat-instructions').addEventListener('click', () => this.playInstructions());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.isPlaying) return; // Don't handle keypresses while speaking

            switch(e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault();
                    if (document.getElementById('instructions').style.display !== 'none') {
                        this.startTutorial();
                    }
                    break;
                case 'q':
                    this.playQuestion();
                    break;
                case 'o':
                    this.playOptions();
                    break;
                case 'h':
                    this.playInstructions();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                    this.checkAnswer(parseInt(e.key) - 1);
                    break;
            }
        });
    }

    setupTutorial() {
        const tutorialText = `
            Welcome to Audio Knowledge Journey! 
            This is an audio-based quiz game. 
            Press Space to start the tutorial.
            You can use keyboard shortcuts to control the game:
            Press Q to hear the question,
            Press O to hear the options,
            Press H for help,
            And use number keys 1 to 4 to select your answer.
        `;
        this.speak(tutorialText);
    }

    startTutorial() {
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        this.setupQuestion();
        this.playInstructions();
    }

    playInstructions() {
        const instructions = `
            You're on level ${this.currentLevel}.
            Press Q to hear the current question.
            Press O to hear the answer options.
            Use number keys 1 through 4 to select your answer.
            Press H anytime to hear these instructions again.
        `;
        this.speak(instructions);
    }

    setupQuestion() {
        const question = this.questions[this.currentQuestion];
        document.getElementById('level-info').textContent = `Level ${this.currentLevel}`;
        
        // Display question text
        const questionContainer = document.getElementById('question-container');
        questionContainer.textContent = question.question;
        
        // Display options
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = `${index + 1}. ${option}`;
            button.addEventListener('click', () => this.checkAnswer(index));
            optionsContainer.appendChild(button);
        });

        // Setup voice control if not already set up
        if (!this.voiceButtonAdded) {
            this.setupVoiceRecognition();
            this.addVoiceControlButton();
            this.addSpeechFeedback();
            this.voiceButtonAdded = true;
        }

        this.playQuestion();
    }

    playQuestion() {
        const question = this.questions[this.currentQuestion];
        this.speak(`Question: ${question.question}`);
    }

    playOptions() {
        const question = this.questions[this.currentQuestion];
        const optionsText = question.options.map((option, index) => {
            return `Option ${index + 1}: ${option}`;
        }).join('. ');
        this.speak(optionsText);
    }

    speak(text) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();

        // Split text into smaller chunks if it's too long
        const chunks = text.match(/[^.!?]+[.!?]+/g) || [text];
        
        const speakChunk = (index) => {
            if (index >= chunks.length) return;
            
            this.speech.text = chunks[index].trim();
        
        this.speech.onend = () => {
                if (index < chunks.length - 1) {
                    speakChunk(index + 1);
                }
        };
        
            speechSynthesis.speak(this.speech);
        };
        
        speakChunk(0);
    }

    checkAnswer(selectedIndex) {
        if (this.isPlaying) return;

        const question = this.questions[this.currentQuestion];
        const isCorrect = selectedIndex === question.correct;
        this.attempts++;

        // Record the score
        db.recordScore(
            this.currentUser.username,
            this.currentSubject,
            question.id,
            isCorrect,
            this.attempts
        );

        // Visual feedback
        const buttons = document.querySelectorAll('.option-btn');
        buttons[selectedIndex].classList.add(isCorrect ? 'correct' : 'incorrect');

        const feedback = isCorrect 
            ? "Correct! Well done!" 
            : "Incorrect. Moving to next question.";

        this.speak(feedback);

        // Always move to next question after first attempt
            setTimeout(() => {
            this.attempts = 0;
                this.currentQuestion++;
                if (this.currentQuestion >= this.questions.length) {
                this.showSuccessScreen();
            } else {
                this.setupQuestion();
            }
        }, 2000);
    }

    // Add new method for login screen
    showLoginScreen() {
        const loginScreen = document.getElementById('login-screen');
        loginScreen.style.display = 'block';
        loginScreen.innerHTML = this.getLoginScreenHTML();
        
        // Re-initialize auth events
        this.initializeAuthEvents();
        
        // Update available commands
        this.updateAvailableCommands();
    }

    // Modify validateLogin method
    validateLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (!username || !password) {
            this.speak("Please enter both username and password");
            return;
        }
        
        const user = db.validateUser(username, password);
        if (user) {
            this.currentUser = user;
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('logout-btn').style.display = 'block';
            
            if (user.role === 'teacher') {
                this.showTeacherDashboard();
            } else {
                this.showStudentDashboard();
            }
            this.updateAvailableCommands();
        } else {
            this.speak("Invalid username or password");
        }
    }

    showSuccessScreen() {
        // Remove speech feedback if it exists
        const speechFeedback = document.getElementById('speech-feedback');
        if (speechFeedback) {
            speechFeedback.remove();
        }
        
        // Remove voice control button if it exists
        const voiceButton = document.getElementById('voice-control');
        if (voiceButton) {
            voiceButton.remove();
            this.voiceButtonAdded = false;
        }
        
        // Stop voice recognition if it's running
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }

        document.getElementById('game-container').style.display = 'none';
        document.getElementById('success-screen').style.display = 'block';
        
        const successMessage = `
            Congratulations! You've completed all questions in level ${this.currentLevel}!
            Your final score: ${this.currentQuestion} questions completed.
            Press Space to play again, or press P to add more questions.
        `;
        
        this.speak(successMessage);
        
        // Add success screen keyboard controls
        const successHandler = (e) => {
            //if (this.isPlaying) return;
            
            switch(e.key.toLowerCase()) {
                case ' ':
                    // Reset and restart game
                    this.currentQuestion = 0;
                    this.currentLevel = 1;
                    document.getElementById('success-screen').style.display = 'none';
                    document.getElementById('game-container').style.display = 'block';
                    this.setupQuestion();
                    document.removeEventListener('keydown', successHandler);
                    break;
                case 'p':
                    // Go to PIN screen to add more questions
                    document.getElementById('success-screen').style.display = 'none';
                    this.showPinScreen();
                    document.removeEventListener('keydown', successHandler);
                    break;
            }
        };
        
        document.addEventListener('keydown', successHandler);
        
        // Add click handlers for buttons
        document.getElementById('play-again-btn').addEventListener('click', () => {
            const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
            successHandler(spaceEvent);
        });
        
        document.getElementById('add-more-btn').addEventListener('click', () => {
            const pEvent = new KeyboardEvent('keydown', { key: 'p' });
            successHandler(pEvent);
        });
    }

    // Add new method to set up voice
    setupVoice() {
        const voices = speechSynthesis.getVoices();
        
        // Try to find a good English voice in this order:
        // 1. Microsoft Zira (clear female voice)
        // 2. Google UK English Female
        // 3. Any English voice
        // 4. Default system voice
        
        let selectedVoice = voices.find(voice => voice.name === 'Microsoft Zira Desktop') ||
                           voices.find(voice => voice.name === 'Google UK English Female') ||
                           voices.find(voice => voice.lang.startsWith('en')) ||
                           voices[0];
        
        if (selectedVoice) {
            this.speech.voice = selectedVoice;
            console.log('Selected voice:', selectedVoice.name);
        }
    }

    // Add this method to the AudioGame class to help with testing available voices
    listAvailableVoices() {
        const voices = speechSynthesis.getVoices();
        console.log('Available voices:');
        voices.forEach(voice => {
            console.log(`- ${voice.name} (${voice.lang})`);
        });
    }

    // Modify setupVoiceRecognition method
    setupVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window)) {
            console.error('Speech recognition not supported');
            return;
        }

        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;

        this.recognition.onstart = () => {
            this.isListening = true;
            document.getElementById('voice-toggle').classList.add('listening');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            document.getElementById('voice-toggle').classList.remove('listening');
        };

        this.recognition.onresult = (event) => {
            const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
            this.handleVoiceCommand(command);
        };

        // Start listening automatically
        this.recognition.start();
    }

    // Modify handleVoiceCommand method
    handleVoiceCommand(command) {
        console.log('Voice command received:', command);
        
        // Convert command to lowercase and trim
        command = command.toLowerCase().trim();
        
        // Check command in both languages
        const checkCommand = (commandKey) => {
            const enCommands = translations.en.commands[commandKey];
            const arCommands = translations.ar.commands[commandKey];
            
            return enCommands.includes(command) || arCommands.includes(command);
        };

        // Handle theme commands
        if (checkCommand('darkMode')) {
            this.applyTheme('dark');
            this.speak(this.t('theme.darkEnabled'));
            return;
        }
        
        if (checkCommand('lightMode')) {
            this.applyTheme('light');
            this.speak(this.t('theme.lightEnabled'));
            return;
        }

        // Handle tutorial commands if active
        if (this.tutorialCommands) {
            if (checkCommand('next')) {
                this.tutorialCommands.next();
            } else if (checkCommand('back')) {
                this.tutorialCommands.back();
            } else if (checkCommand('finish')) {
                this.tutorialCommands.finish();
            } else if (checkCommand('repeat')) {
                this.tutorialCommands.repeat();
            }
            return;
        }

        // Handle other commands based on current screen
        switch (this.getCurrentScreen()) {
            case 'login':
                if (checkCommand('login')) {
                    document.getElementById('login-btn').click();
                } else if (checkCommand('register')) {
                    document.getElementById('register-btn').click();
                }
                break;
            // Add more command handlers for other screens
        }
    }

    // Modify startListening method
    startListening() {
        if (!this.recognition) {
            this.setupVoiceRecognition();
        }
        this.recognition.start();
        this.isListening = true;
        document.getElementById('voice-toggle')?.classList.add('listening');
    }

    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
        }
        this.isListening = false;
        document.getElementById('voice-toggle')?.classList.remove('listening');
    }

    // Add new method to add voice control button
    addVoiceControlButton() {
        const button = document.createElement('button');
        button.id = 'voice-control';
        button.className = 'voice-control-btn';
        button.innerHTML = '🎤';
        button.setAttribute('aria-label', 'Toggle Voice Control');
        
        button.addEventListener('click', () => {
            if (this.isListening) {
                this.recognition.stop();
                this.continuousListening = false;
            } else {
                this.continuousListening = true;
                this.startListening();
            }
        });
        
        document.body.appendChild(button);
    }

    // Add new method to show voice errors
    showVoiceError(message) {
        // Create error toast if it doesn't exist
        let errorToast = document.getElementById('voice-error');
        if (!errorToast) {
            errorToast = document.createElement('div');
            errorToast.id = 'voice-error';
            errorToast.className = 'voice-error';
            document.body.appendChild(errorToast);
        }

        // Show error message
        errorToast.textContent = message;
        errorToast.classList.add('show');

        // Hide after 5 seconds
        setTimeout(() => {
            errorToast.classList.remove('show');
        }, 5000);
    }

    // Add this method to the AudioGame class
    addSpeechFeedback() {
        const feedback = document.createElement('div');
        feedback.id = 'speech-feedback';
        feedback.className = 'speech-feedback';
        feedback.innerHTML = `
            <div class="speech-text"></div>
            <div class="speech-commands">
                <p>You can say:</p>
                <ul>
                    <li>"question" - to hear the question</li>
                    <li>"options" - to hear the choices</li>
                    <li>"help" - for instructions</li>
                    <li>"one/two/three/four" - to select answer</li>
                </ul>
            </div>
        `;
        document.body.appendChild(feedback);
    }

    // Add these methods to the AudioGame class
    initializeAuthEvents() {
        // Login button click
        document.getElementById('login-btn')?.addEventListener('click', () => this.validateLogin());
        
        // Register button click
        document.getElementById('register-btn')?.addEventListener('click', () => this.showRegisterForm());
        
        // Enter key on password field for login
        document.getElementById('password')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.validateLogin();
            }
        });

        // Voice toggle button
        document.getElementById('voice-toggle')?.addEventListener('click', () => {
            if (this.isListening) {
                this.stopListening();
            } else {
                this.startListening();
            }
        });

        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
    }

    showRegisterForm() {
        const loginScreen = document.getElementById('login-screen');
        loginScreen.innerHTML = `
            <h2>Create Account</h2>
            <p class="subtitle">Join the learning platform</p>
            <div class="form-group">
                <label for="reg-username">Username</label>
                <input type="text" id="reg-username" placeholder="Choose a username" minlength="3">
            </div>
            <div class="form-group">
                <label for="reg-password">Password</label>
                <input type="password" id="reg-password" placeholder="Choose a password" minlength="4">
            </div>
            <div class="form-group">
                <label for="user-role">I am a:</label>
                <select id="user-role" class="form-select">
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                </select>
            </div>
            <div class="button-group">
                <button id="submit-register" class="primary-btn">Create Account</button>
                <button id="back-to-login" class="secondary-btn">Back to Login</button>
            </div>
        `;

        // Add event listeners for the registration form
        document.getElementById('submit-register')?.addEventListener('click', () => this.registerUser());
        document.getElementById('back-to-login')?.addEventListener('click', () => {
            loginScreen.innerHTML = this.getLoginScreenHTML();
            this.initializeAuthEvents();
        });

        // Add enter key support for registration
        document.getElementById('reg-password')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.registerUser();
            }
        });
    }

    getLoginScreenHTML() {
        return `
            <h2>Welcome Back</h2>
            <p class="subtitle">Sign in to access your tests</p>
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" placeholder="Enter your username">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" placeholder="Enter your password">
            </div>
            <div class="button-group">
                <button id="login-btn" class="primary-btn">Sign In</button>
                <button id="register-btn" class="secondary-btn">Create Account</button>
            </div>
            <div class="voice-hint">
                <i class="fas fa-microphone"></i>
                <p>Try saying "login" or "register"</p>
            </div>
        `;
    }

    registerUser() {
        const username = document.getElementById('reg-username')?.value.trim();
        const password = document.getElementById('reg-password')?.value.trim();
        const role = document.getElementById('user-role')?.value;

        if (!username || !password) {
            this.speak("Please fill in all fields");
            return;
        }

        if (username.length < 3) {
            this.speak("Username must be at least 3 characters long");
            return;
        }

        if (password.length < 4) {
            this.speak("Password must be at least 4 characters long");
            return;
        }

        if (db.addUser(username, password, role)) {
            this.speak("Registration successful! Please log in.");
            this.showLoginScreen();
        } else {
            this.speak("Username already exists. Please choose another.");
        }
    }

    showTeacherDashboard() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('teacher-dashboard').style.display = 'block';
        
        // Initialize teacher dashboard buttons
        document.getElementById('add-subject-btn')?.addEventListener('click', () => this.showAddSubjectForm());
        document.getElementById('add-questions-btn')?.addEventListener('click', () => this.showQuestionForm());
        document.getElementById('view-scores-btn')?.addEventListener('click', () => this.showScoresView());
        
        this.updateSubjectsList();
        this.updateAvailableCommands();
    }

    setupTeacherEventListeners() {
        document.getElementById('add-subject-btn').addEventListener('click', () => this.showAddSubjectForm());
        document.getElementById('view-scores-btn').addEventListener('click', () => this.showScoresView());
        document.getElementById('add-questions-btn').addEventListener('click', () => this.showQuestionForm());
    }

    showAddSubjectForm() {
        const form = document.createElement('div');
        form.id = 'add-subject-form';
        form.innerHTML = `
            <h3>Add New Subject</h3>
            <div class="form-group">
                <label for="subject-name">Subject Name:</label>
                <input type="text" id="subject-name" placeholder="Enter subject name">
            </div>
            <div class="form-group">
                <label for="questions-per-test">Questions Per Test:</label>
                <input type="number" id="questions-per-test" min="1" value="10">
            </div>
            <button id="save-subject" class="main-btn">Save Subject</button>
        `;

        document.getElementById('teacher-dashboard').appendChild(form);
        
        document.getElementById('save-subject').addEventListener('click', () => {
            const name = document.getElementById('subject-name').value.trim();
            const questionsPerTest = parseInt(document.getElementById('questions-per-test').value);
            
            if (name && questionsPerTest > 0) {
                const subjectId = db.addSubject(name, this.currentUser.username, questionsPerTest);
                this.updateSubjectsList();
                form.remove();
            } else {
                this.speak("Please enter valid subject details");
            }
        });
    }

    updateSubjectsList() {
        const subjectsList = document.getElementById('subjects-list');
        subjectsList.innerHTML = '';

        db.subjects.forEach(subject => {
            if (subject.teacherUsername === this.currentUser.username) {
                const subjectCard = document.createElement('div');
                subjectCard.className = 'subject-card';
                subjectCard.innerHTML = `
                    <h3>${subject.name}</h3>
                    <p>Questions: ${subject.questions.length}</p>
                    <p>Questions per test: ${subject.questionsPerTest}</p>
                    <button onclick="game.editSubject('${subject.id}')" class="main-btn">Edit</button>
                `;
                subjectsList.appendChild(subjectCard);
            }
        });
    }

    editSubject(subjectId) {
        const subject = db.subjects.get(subjectId);
        if (!subject) return;

        const form = document.createElement('div');
        form.id = 'edit-subject-form';
        form.innerHTML = `
            <h3>Edit ${subject.name}</h3>
            <div class="form-group">
                <label for="edit-questions-per-test">Questions Per Test:</label>
                <input type="number" id="edit-questions-per-test" min="1" value="${subject.questionsPerTest}">
            </div>
            <button id="update-subject" class="main-btn">Update</button>
        `;

        document.getElementById('teacher-dashboard').appendChild(form);
        
        document.getElementById('update-subject').addEventListener('click', () => {
            const newCount = parseInt(document.getElementById('edit-questions-per-test').value);
            if (newCount > 0) {
                db.updateQuestionsPerTest(subjectId, newCount);
                this.updateSubjectsList();
                form.remove();
            }
        });
    }

    // Modify the student's subject selection to show test details
    showStudentDashboard() {
        document.getElementById('student-dashboard').style.display = 'block';
        this.updateAvailableTests();
        this.updateAvailableCommands();
    }

    updateAvailableTests() {
        const testsContainer = document.getElementById('available-tests');
        const subjects = Array.from(db.subjects.values());
        
        testsContainer.innerHTML = subjects.map(subject => `
            <div class="test-card">
                <h3>${subject.name}</h3>
                <p>Questions: ${subject.questionsPerTest}</p>
                <button onclick="game.startTest('${subject.id}')" class="primary-btn">
                    Start Test
                </button>
            </div>
        `).join('');
    }

    startTest(subjectId) {
        this.currentSubject = subjectId;
        this.questions = db.getRandomQuestionsForTest(subjectId);
        this.currentQuestion = 0;
        this.attempts = 0;
        
        // Remove subject selection screen
        const subjectSelection = document.getElementById('subject-selection');
        if (subjectSelection) {
            subjectSelection.remove();
        }
        
        // Hide all other screens and show game container
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('teacher-dashboard').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        
                this.setupQuestion();
        this.updateAvailableCommands();
    }

    // Add these methods to the AudioGame class
    showScoresView() {
        // Hide subjects list and any existing forms
        document.getElementById('subjects-list').style.display = 'none';
        const existingForms = document.querySelectorAll('#add-subject-form, #edit-subject-form');
        existingForms.forEach(form => form.remove());

        // Show scores view
        const scoresView = document.getElementById('scores-view');
        scoresView.style.display = 'block';

        // Get all subjects for this teacher
        const teacherSubjects = Array.from(db.subjects.values())
            .filter(subject => subject.teacherUsername === this.currentUser.username);

        // Get all scores for these subjects
        const scoresContainer = document.getElementById('scores-container');
        scoresContainer.innerHTML = '';

        teacherSubjects.forEach(subject => {
            const subjectScores = Array.from(db.scores.entries())
                .filter(([key]) => key.endsWith(subject.id))
                .map(([key, scores]) => ({
                    student: key.split('-')[0],
                    scores: scores
                }));

            if (subjectScores.length > 0) {
                const subjectCard = document.createElement('div');
                subjectCard.className = 'score-card';
                subjectCard.innerHTML = `
                    <h3>${subject.name}</h3>
                    <div class="student-scores">
                        ${subjectScores.map(studentScore => `
                            <div class="student-score">
                                <h4>Student: ${studentScore.student}</h4>
                                <p>Total Questions Attempted: ${studentScore.scores.length}</p>
                                <p>Correct Answers: ${studentScore.scores.filter(s => s.correct).length}</p>
                                <p>Score: ${Math.round((studentScore.scores.filter(s => s.correct).length / studentScore.scores.length) * 100)}%</p>
                            </div>
                        `).join('')}
                    </div>
                `;
                scoresContainer.appendChild(subjectCard);
            }
        });

        // Add back button
        const backButton = document.createElement('button');
        backButton.className = 'main-btn';
        backButton.textContent = 'Back to Subjects';
        backButton.onclick = () => this.hideScoresView();
        scoresContainer.appendChild(backButton);
    }

    hideScoresView() {
        document.getElementById('scores-view').style.display = 'none';
        document.getElementById('subjects-list').style.display = 'block';
    }

    showQuestionForm() {
        // Hide subjects list and any existing forms
        document.getElementById('subjects-list').style.display = 'none';
        const existingForms = document.querySelectorAll('#add-subject-form, #edit-subject-form');
        existingForms.forEach(form => form.remove());

        // Get teacher's subjects
        const teacherSubjects = Array.from(db.subjects.values())
            .filter(subject => subject.teacherUsername === this.currentUser.username);

        if (teacherSubjects.length === 0) {
            this.speak("Please create a subject first before adding questions");
            return;
        }

        // Create question form
        const form = document.createElement('div');
        form.id = 'add-question-form';
        form.innerHTML = `
            <h3>Add New Question</h3>
            <div class="form-group">
                <label for="select-subject">Select Subject:</label>
                <select id="select-subject">
                    ${teacherSubjects.map(subject => 
                        `<option value="${subject.id}">${subject.name}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="question-text">Question:</label>
                <input type="text" id="question-text" placeholder="Enter question">
            </div>
            <div class="form-group">
                <label for="option1">Option 1:</label>
                <input type="text" id="option1" placeholder="Enter option 1">
            </div>
            <div class="form-group">
                <label for="option2">Option 2:</label>
                <input type="text" id="option2" placeholder="Enter option 2">
            </div>
            <div class="form-group">
                <label for="option3">Option 3:</label>
                <input type="text" id="option3" placeholder="Enter option 3">
            </div>
            <div class="form-group">
                <label for="option4">Option 4:</label>
                <input type="text" id="option4" placeholder="Enter option 4">
            </div>
            <div class="form-group">
                <label for="correct-answer">Correct Answer (1-4):</label>
                <input type="number" id="correct-answer" min="1" max="4">
            </div>
            <button id="save-question" class="main-btn">Save Question</button>
            <button id="back-to-subjects" class="main-btn">Back to Subjects</button>
        `;

        document.getElementById('teacher-dashboard').appendChild(form);

        // Add event listeners
        document.getElementById('save-question').addEventListener('click', () => this.saveQuestion());
        document.getElementById('back-to-subjects').addEventListener('click', () => {
            form.remove();
            document.getElementById('subjects-list').style.display = 'block';
        });
    }

    saveQuestion() {
        const subjectId = document.getElementById('select-subject').value;
        const questionText = document.getElementById('question-text').value.trim();
        const options = [
            document.getElementById('option1').value.trim(),
            document.getElementById('option2').value.trim(),
            document.getElementById('option3').value.trim(),
            document.getElementById('option4').value.trim()
        ];
        const correctAnswer = parseInt(document.getElementById('correct-answer').value) - 1;

        if (!questionText || options.some(opt => !opt) || isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) {
            this.speak("Please fill in all fields correctly");
            return;
        }

        const question = {
            question: questionText,
            options: options,
            correct: correctAnswer
        };

        if (db.addQuestion(subjectId, question)) {
            this.speak("Question added successfully");
            // Clear form
            document.getElementById('question-text').value = '';
            options.forEach((_, i) => document.getElementById(`option${i + 1}`).value = '');
            document.getElementById('correct-answer').value = '';
            // Update subjects list in background
            this.updateSubjectsList();
        } else {
            this.speak("Error adding question");
        }
    }

    // Add method to handle logout
    logout() {
        this.currentUser = null;
        this.currentSubject = null;
        this.questions = [];
        this.currentQuestion = 0;
        this.attempts = 0;
        
        // Remove any existing screens
        const subjectSelection = document.getElementById('subject-selection');
        if (subjectSelection) {
            subjectSelection.remove();
        }
        
        // Hide all screens except login
        document.getElementById('teacher-dashboard').style.display = 'none';
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('success-screen').style.display = 'none';
        
        // Show login screen
        this.showLoginScreen();
    }

    // Add this method to AudioGame class
    updateAvailableCommands() {
        const commandsList = document.getElementById('available-commands');
        if (!commandsList) return;

        let commands = [];
        
        // Get current screen
        const currentScreen = this.getCurrentScreen();
        
        switch (currentScreen) {
            case 'login':
                commands = [
                    'Say "login" to sign in',
                    'Say "register" to create account',
                    'Say "username [your username]" to enter username',
                    'Say "password [your password]" to enter password'
                ];
                break;
            case 'register':
                commands = [
                    'Say "back" to return to login',
                    'Say "submit" to create account',
                    'Say "username [your username]" to enter username',
                    'Say "password [your password]" to enter password',
                    'Say "role student/teacher" to select role'
                ];
                break;
            case 'test':
                commands = [
                    'Say "repeat question" to hear the question again',
                    'Say "repeat options" to hear the choices',
                    'Say "option one/two/three/four" to select answer',
                    'Say "next" to go to next question'
                ];
                break;
            case 'teacher':
                commands = [
                    'Say "add subject" to create new subject',
                    'Say "add question" to add new question',
                    'Say "view scores" to see student results',
                    'Say "logout" to sign out'
                ];
                break;
            case 'student':
                commands = [
                    'Say "start test" followed by subject name',
                    'Say "list subjects" to hear available tests',
                    'Say "logout" to sign out'
                ];
                break;
        }

        // Update commands list
        commandsList.innerHTML = commands.map(cmd => `<li>${cmd}</li>`).join('');
    }

    // Add method to determine current screen
    getCurrentScreen() {
        if (document.getElementById('login-screen').style.display !== 'none') {
            return document.getElementById('register-form') ? 'register' : 'login';
        }
        if (document.getElementById('teacher-dashboard').style.display !== 'none') {
            return 'teacher';
        }
        if (document.getElementById('student-dashboard').style.display !== 'none') {
            return 'student';
        }
        if (document.getElementById('test-container').style.display !== 'none') {
            return 'test';
        }
        return 'login';
    }

    // Add these methods to the AudioGame class
    showVoiceTutorial() {
        const tutorial = document.createElement('div');
        tutorial.className = 'tutorial-overlay';
        tutorial.innerHTML = `
            <div class="tutorial-content">
                <h2>Voice Learning Platform Tutorial</h2>
                <div class="voice-status-indicator ${this.isListening ? 'listening' : ''}">
                    <i class="fas fa-microphone"></i>
                    <span>Voice Commands ${this.isListening ? 'Active' : 'Inactive'}</span>
                </div>
                <div class="tutorial-step active" data-step="1">
                    <i class="fas fa-microphone"></i>
                    <div class="step-content">
                        <div class="step-indicator">Step 1 of 4</div>
                        <h3>Welcome!</h3>
                        <div class="animation-container">
                            <div class="pulse-animation"></div>
                        </div>
                    </div>
                    <button class="next-step">Next Step</button>
                </div>
                <div class="tutorial-step" data-step="2">
                    <i class="fas fa-comment-alt"></i>
                    <div class="step-content">
                        <div class="step-indicator">Step 2 of 4</div>
                        <h3>Voice Controls</h3>
                        <div class="animation-container">
                            <div class="mic-animation"></div>
                        </div>
                    </div>
                    <button class="next-step">Next Step</button>
                </div>
                <div class="tutorial-step" data-step="3">
                    <i class="fas fa-list"></i>
                    <div class="step-content">
                        <div class="step-indicator">Step 3 of 4</div>
                        <h3>Basic Commands</h3>
                        <div class="animation-container">
                            <div class="command-list-animation"></div>
                        </div>
                    </div>
                    <button class="next-step">Next Step</button>
                </div>
                <div class="tutorial-step" data-step="4">
                    <i class="fas fa-check-circle"></i>
                    <div class="step-content">
                        <div class="step-indicator">Step 4 of 4</div>
                        <h3>Ready!</h3>
                        <div class="animation-container">
                            <div class="success-animation"></div>
                        </div>
                    </div>
                    <button class="finish-tutorial">Start Using Platform</button>
                </div>
            </div>
        `;

        document.body.appendChild(tutorial);

        // Tutorial narration content
        const tutorialSteps = [
            {
                narration: `Welcome to the Voice Learning Platform! This platform is designed to be fully accessible through voice commands. 
                           I'll guide you through how to use it. Press the Next Step button or say "next" to continue.`
            },
            {
                narration: `To use voice commands, click the microphone icon in the top right corner or say "start listening". 
                           The microphone will turn red when it's listening for your commands. You can say "stop listening" at any time.`
            },
            {
                narration: `Here are the basic commands you can use: 
                           Say "login" to sign in, 
                           "register" to create a new account, 
                           "help" to hear available commands, 
                           and "repeat" to hear something again.
                           You'll find more commands in the bottom left corner of the screen.`
            },
            {
                narration: `Great! You're ready to start using the platform. 
                           Remember, you can always say "help" to hear the available commands for any screen.
                           Press the Start Using Platform button or say "finish" to begin.`
            }
        ];

        let currentStep = 0;

        // Function to handle step navigation
        const navigateStep = (next = true) => {
            const steps = tutorial.querySelectorAll('.tutorial-step');
            steps[currentStep].classList.remove('active');
            
            if (next) {
                currentStep++;
            } else {
                currentStep--;
            }
            
            steps[currentStep].classList.add('active');
            this.speak(tutorialSteps[currentStep].narration);
        };

        // Add event listeners for tutorial navigation
        tutorial.addEventListener('click', (e) => {
            if (e.target.classList.contains('next-step')) {
                navigateStep(true);
            } else if (e.target.classList.contains('finish-tutorial')) {
                this.finishTutorial(tutorial);
            }
        });

        // Add voice commands for tutorial navigation
        this.addTutorialVoiceCommands(navigateStep);

        // Start the tutorial narration
        this.speak(tutorialSteps[0].narration);
    }

    // Add method for tutorial voice commands
    addTutorialVoiceCommands(navigateStep) {
        this.tutorialCommands = {
            next: () => navigateStep(true),
            back: () => navigateStep(false),
            finish: () => this.finishTutorial(document.querySelector('.tutorial-overlay')),
            repeat: () => {
                const currentStep = document.querySelector('.tutorial-step.active');
                const stepIndex = parseInt(currentStep.dataset.step) - 1;
                this.speak(this.tutorialSteps[stepIndex].narration);
            }
        };
    }

    // Update the finishTutorial method
    finishTutorial(tutorialElement) {
        localStorage.setItem('tutorialShown', 'true');
        tutorialElement.classList.add('fade-out');
        
        this.speak(`Tutorial completed! You can now use the platform. 
                    Try saying "login" to sign in or "register" to create a new account.`);
        
        setTimeout(() => {
            tutorialElement.remove();
            // Remove tutorial voice commands
            this.tutorialCommands = null;
        }, 500);
    }

    // Add language switcher
    addLanguageSwitcher() {
        const switcher = document.createElement('div');
        switcher.className = 'language-switcher';
        switcher.innerHTML = `
            <button class="lang-btn ${this.currentLang === 'en' ? 'active' : ''}" data-lang="en">English</button>
            <button class="lang-btn ${this.currentLang === 'ar' ? 'active' : ''}" data-lang="ar">عربي</button>
        `;

        switcher.addEventListener('click', (e) => {
            if (e.target.classList.contains('lang-btn')) {
                this.switchLanguage(e.target.dataset.lang);
            }
        });

        document.querySelector('.top-nav').appendChild(switcher);
    }

    // Switch language
    switchLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('preferredLanguage', lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        this.updateInterface();
    }

    // Get translated text
    t(key) {
        const keys = key.split('.');
        let value = translations[this.currentLang];
        for (const k of keys) {
            value = value[k];
        }
        return value || key;
    }

    // Update interface with current language
    updateInterface() {
        // Update navigation
        document.querySelector('.nav-brand').textContent = this.t('welcome');

        // Update current screen
        const currentScreen = this.getCurrentScreen();
        switch (currentScreen) {
            case 'login':
                this.showLoginScreen();
                break;
            case 'register':
                this.showRegisterForm();
                break;
            // Add more cases for other screens
        }

        // Update available commands
        this.updateAvailableCommands();
    }

    // Add these methods to AudioGame class
    addThemeSwitcher() {
        const switcher = document.createElement('button');
        switcher.className = 'theme-switcher icon-btn';
        switcher.innerHTML = `<i class="fas ${this.currentTheme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>`;
        
        switcher.addEventListener('click', () => {
            this.toggleTheme();
        });

        document.querySelector('.nav-controls').prepend(switcher);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    applyTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('preferredTheme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update theme switcher icon
        const themeIcon = document.querySelector('.theme-switcher i');
        if (themeIcon) {
            themeIcon.className = `fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`;
        }
    }
}

// Initialize the game
const game = new AudioGame(); 