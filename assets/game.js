    // Caption and auto-read toggles
    const captionDiv = document.getElementById('caption');
    const captionToggle = document.getElementById('caption-toggle');
    const readToggle = document.getElementById('read-toggle');
    let captionsEnabled = false;
    let autoReadEnabled = false;

    // Polish text for numbers 0-99
    function polishText(num) {
        // 0-19
        const basic = [
            'zero', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć',
            'dziesięć', 'jedenaście', 'dwanaście', 'trzynaście', 'czternaście', 'piętnaście', 'szesnaście', 'siedemnaście', 'osiemnaście', 'dziewiętnaście'
        ];
        // 20, 30, ... 90
        const tens = [ '', '', 'dwadzieścia', 'trzydzieści', 'czterdzieści', 'pięćdziesiąt', 'sześćdziesiąt', 'siedemdziesiąt', 'osiemdziesiąt', 'dziewięćdziesiąt' ];
        if (num < 20) return basic[num];
        if (num < 100) {
            const ten = Math.floor(num / 10);
            const one = num % 10;
            return one === 0 ? tens[ten] : tens[ten] + ' ' + basic[one];
        }
        return num.toString();
    }

    captionToggle.addEventListener('click', () => {
        captionsEnabled = !captionsEnabled;
        captionToggle.classList.toggle('active', captionsEnabled);
        captionToggle.textContent = captionsEnabled ? 'Hide Captions' : 'Show Captions';
        captionDiv.style.display = captionsEnabled ? 'block' : 'none';
    });
    readToggle.addEventListener('click', () => {
        autoReadEnabled = !autoReadEnabled;
        readToggle.classList.toggle('active', autoReadEnabled);
        readToggle.textContent = autoReadEnabled ? 'Stop Reading' : 'Read Aloud';
    });
// Basic game logic: show a random colorful number on the canvas when Start Game is clicked

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('acrylic-canvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const restartBtn = document.getElementById('restart-btn');
    const timerDiv = document.getElementById('timer');

    let timer = null;
    let timeLeft = 5;
    let gameActive = false;
    let round = 0;
    let maxRounds = 10;
    let paused = false;
    let numberRange = 10;
    let speed = 5;
    let prevNumber = null;

    // Acrylic brush style colors
    const colors = [
        '#e57373', '#f06292', '#ba68c8', '#64b5f6', '#4dd0e1',
        '#81c784', '#ffd54f', '#ffb74d', '#a1887f', '#90a4ae'
    ];

    // Polish words for digits 0-9
    const polishNumbers = [
        'zero', 'jeden', 'dwa', 'trzy', 'cztery',
        'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć'
    ];

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function drawAcrylicNumber(number) {
        clearCanvas();
        // Pick a random color for the number
        const color = colors[Math.floor(Math.random() * colors.length)];
        ctx.save();
        ctx.font = 'bold 120px Brush Script MT, Comic Sans MS, cursive, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = color;
        ctx.shadowBlur = 18;
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#fff8';
        ctx.strokeText(number, canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.92;
        ctx.fillText(number, canvas.width / 2, canvas.height / 2);
        ctx.restore();
    }

    function speakPolishNumber(number) {
        if (!('speechSynthesis' in window)) return;
        const utter = new window.SpeechSynthesisUtterance(polishNumbers[number]);
        utter.lang = 'pl-PL';
        utter.rate = 0.95;
        utter.pitch = 1.1;
        // Try to use a Polish voice if available
        const voices = window.speechSynthesis.getVoices();
        const polishVoice = voices.find(v => v.lang.startsWith('pl'));
        if (polishVoice) utter.voice = polishVoice;
        window.speechSynthesis.speak(utter);
    }



    // Controls
    const readBtn = document.getElementById('read-btn');
    const userInput = document.getElementById('user-input');
    const rangeSelect = document.getElementById('range-select');
    const speedRange = document.getElementById('speed-range');
    const speedValue = document.getElementById('speed-value');

    rangeSelect.addEventListener('change', () => {
        numberRange = parseInt(rangeSelect.value, 10);
    });
    speedRange.addEventListener('input', () => {
        speed = parseInt(speedRange.value, 10);
        speedValue.textContent = speed + 's / digit';
    });
    // Initialize values
    numberRange = parseInt(rangeSelect.value, 10);
    speed = parseInt(speedRange.value, 10);
    speedValue.textContent = speed + 's / digit';

    function speakPolishAnyNumber(num) {
        // For now, only 0-9 supported, but can be extended
        let text = '';
        if (num >= 0 && num <= 9) {
            text = polishNumbers[num];
        } else {
            text = num.toString(); // fallback: just read the number
        }
        if (!('speechSynthesis' in window)) return;
        const utter = new window.SpeechSynthesisUtterance(text);
        utter.lang = 'pl-PL';
        utter.rate = 0.95;
        utter.pitch = 1.1;
        const voices = window.speechSynthesis.getVoices();
        const polishVoice = voices.find(v => v.lang.startsWith('pl'));
        if (polishVoice) utter.voice = polishVoice;
        window.speechSynthesis.speak(utter);
    }

    readBtn.addEventListener('click', () => {
        const val = userInput.value.trim();
        if (val === '' || isNaN(val)) return;
        speakPolishAnyNumber(Number(val));
    });


    function updateTimerDisplay() {
        timerDiv.textContent = timeLeft;
    }

    function startTimer() {
        if (timer) clearInterval(timer);
        timer = setInterval(() => {
            if (paused) return;
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timer);
                timer = null;
                nextRound();
            }
        }, 1000);
    }

    function pauseGame() {
        if (paused) {
            paused = false;
            startTimer();
            pauseBtn.textContent = 'Pause';
        } else {
            // Pause
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
            paused = true;
            pauseBtn.textContent = 'Resume';
        }
    }
    
    function restartGame() {
        if (timer) {
        clearInterval(timer);
        timer = null;
    }
    gameActive = false;
    round = 0;
    timerDiv.textContent = 5;
    startBtn.disabled = false;
    clearCanvas();
    paused = false;
    pauseBtn.textContent = 'Pause';
    }

    function nextRound() {
        round++;
        if (round < maxRounds) {
            showRandomNumber();
        } else {
            gameActive = false;
            timerDiv.textContent = '✔️';
            startBtn.disabled = false;
        }
    }

    function getRandomNumber() {
        let num;
        do {
            num = Math.floor(Math.random() * numberRange);
        } while (num === prevNumber && numberRange > 1);
        prevNumber = num;
        return num;
    }

    function showRandomNumber() {
        timeLeft = speedRange.value;
        updateTimerDisplay();
        const number = getRandomNumber();
        drawAcrylicNumber(number);
        // Caption logic
        if (captionsEnabled) {
            captionDiv.textContent = polishText(number);
        } else {
            captionDiv.textContent = '';
        }
        // Auto-read logic
        if (autoReadEnabled) {
            speakPolishAnyNumber(number);
        }
        startTimer();
    }

    function startGame() {
        // if (gameActive) return;
        // gameActive = true;
        // round = 0;
        // startBtn.disabled = true;
        showRandomNumber();
    }

    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', pauseGame);
    restartBtn.addEventListener('click', restartGame);
});
