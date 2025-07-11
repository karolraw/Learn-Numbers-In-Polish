// Basic game logic: show a random colorful number on the canvas when Start Game is clicked

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('acrylic-canvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('start-btn');

    // Acrylic brush style colors
    const colors = [
        '#e57373', '#f06292', '#ba68c8', '#64b5f6', '#4dd0e1',
        '#81c784', '#ffd54f', '#ffb74d', '#a1887f', '#90a4ae'
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

    function showRandomNumber() {
        const number = Math.floor(Math.random() * 10); // 0-9 for now
        drawAcrylicNumber(number);
    }

    startBtn.addEventListener('click', showRandomNumber);
});
