class Snake {
    #position = [{ x: 20, y: 20 }];
    direction = "left";
    apple_x;
    apple_y;
    #score = 1;
    #highscore = 1;
    #gameInterval = null;
    isTpBorder = true;

    get score() {
        return this.#score;
    }

    set score(value) {
        this.#score = value;
        this.score_el.innerText = this.#score;
    }

    get highscore() {
        return this.#highscore;
    }

    set highscore(value) {
        this.#highscore = value;
        this.highscore_el.innerText = this.#highscore;
        setCookie('highscore', this.#highscore);
    }

    createSnake(args) {
        try {
            args.canvas.width = args.canvasSize;
            args.canvas.height = args.canvasSize;
            this.canvasSize = args.canvasSize;
            this.ctx = args.canvas.getContext("2d");
            this.gridSize = args.gridSize;
            this.score_el = args.score;
            this.highscore_el = args.highscore;
            this.ceils = args.canvasSize / args.gridSize;
            this.isTpBorder = args.isTpBorder;
            this.start_pos_x = args.start_pos_x;
            this.start_pos_y = args.start_pos_y;
            this.snakeColor = args.snakeColor;
            this.appleColor = args.appleColor;
            this.borderColor = args.borderColor;
            this.speed = args.speed;
            args.canvas.style.background = args.canvasColor;
    
            const savedHighscore = this.getCookie('highscore');
            if (savedHighscore) {
                this.highscore = parseInt(savedHighscore, 10);
            }
        } catch (error) {
            console.error("Error initializing the game:", error);
        }
    }

    createApple() {
        let validPosition = false;
        while (!validPosition) {
            this.apple_x = Math.floor(Math.random() * this.ceils);
            this.apple_y = Math.floor(Math.random() * this.ceils);

            validPosition = true;
            for (let i = 0; i < this.#position.length; i++) {
                if (this.#position[i].x === this.apple_x && this.#position[i].y === this.apple_y) {
                    validPosition = false;
                    break;
                }
            }
        }
    }

    start() {
        this.createApple();
        this.gameLoop();
        this.listenerKeys();
    }

    move() {
        let newHead = { ...this.#position[0] };
    
        switch (this.direction) {
            case "top":
                newHead.y -= 1;
                break;
            case "bottom":
                newHead.y += 1;
                break;
            case "left":
                newHead.x -= 1;
                break;
            case "right":
                newHead.x += 1;
                break;
        }
    
        this.#position.unshift(newHead);
    
        if (newHead.x === this.apple_x && newHead.y === this.apple_y) {
            this.createApple();
            this.collectApple();
        } else {
            this.#position.pop();
        }
    }

    collectApple() {
        if (this.#score === 0) {
            this.#score = 1;
        } else {
            this.#score++;
        }
    
        this.score_el.innerText = this.#score;
    
        if (this.#score > this.#highscore) {
            this.#highscore = this.#score;
            this.highscore_el.innerText = this.#highscore;
            setCookie('highscore', this.#highscore);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);

        this.ctx.strokeStyle = this.borderColor;
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.canvasSize / this.gridSize; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.gridSize, 0);
            this.ctx.lineTo(x * this.gridSize, this.canvasSize);
            this.ctx.stroke();
        }

        for (let y = 0; y <= this.canvasSize / this.gridSize; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.gridSize);
            this.ctx.lineTo(this.canvasSize, y * this.gridSize);
            this.ctx.stroke();
        }

        this.ctx.fillStyle = this.appleColor;
        this.ctx.fillRect(this.apple_x * this.gridSize, this.apple_y * this.gridSize, this.gridSize, this.gridSize);
        this.ctx.strokeRect(this.apple_x * this.gridSize, this.apple_y * this.gridSize, this.gridSize, this.gridSize);

        this.ctx.fillStyle = this.snakeColor;
        this.#position.forEach(el => {
            this.ctx.fillRect(el.x * this.gridSize, el.y * this.gridSize, this.gridSize, this.gridSize);
            this.ctx.strokeRect(el.x * this.gridSize, el.y * this.gridSize, this.gridSize, this.gridSize);
        });
    }

    listenerKeys() {
        const keyMap = {
            "ArrowUp": "top",
            "KeyW": "top",
            "ArrowDown": "bottom",
            "KeyS": "bottom",
            "ArrowLeft": "left",
            "KeyA": "left",
            "ArrowRight": "right",
            "KeyD": "right"
        };
    
        document.addEventListener("keydown", (event) => {
            const newDirection = keyMap[event.code];
            if (newDirection) {
                snake.changeDirection(newDirection);
            }
        });
    }

    death() {
        let head = this.#position[0];
    
        if (this.isTpBorder) {
            if (head.x >= this.ceils) this.#position[0].x = 0;
            else if (head.x < 0) this.#position[0].x = this.ceils - 1;
            else if (head.y >= this.ceils) this.#position[0].y = 0;
            else if (head.y < 0) this.#position[0].y = this.ceils - 1;
        } else {
            if (head.x < 0 || head.x >= this.ceils || head.y < 0 || head.y >= this.ceils) {
                this.resetGame();
                return;
            }
        }
    
        for (let i = 1; i < this.#position.length; i++) {
            if (this.#position[i].x === head.x && this.#position[i].y === head.y) {
                this.resetGame();
                return;
            }
        }
    }

    resetGame() {
        this.playSound();
        clearInterval(this.#gameInterval);
        this.#gameInterval = null;

        this.#score = 1;
        this.direction = "left";
        this.#position = [{ x: 9, y: 9 }];
        this.score_el.innerText = this.#score;

        setTimeout(() => this.gameLoop(), 1000);
    }

    gameLoop() {
        if (this.#gameInterval) clearInterval(this.#gameInterval);

        this.#gameInterval = setInterval(() => {
            this.move();
            this.death();
            this.draw();
        }, this.speed);
    }

    changeDirection(newDirection) {
        if (
            (this.direction === "left" && newDirection !== "right") ||
            (this.direction === "right" && newDirection !== "left") ||
            (this.direction === "top" && newDirection !== "bottom") ||
            (this.direction === "bottom" && newDirection !== "top")
        ) {
            this.direction = newDirection;
        }
    }

    getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) return match[2];
        return null;
    }

    setCookie(name, value) {
        document.cookie = `${name}=${value}; path=/`;
    }

    playSound() {
        const audio = new Audio();
        audio.src = "audio/1.mp3";
        audio.play();
    }
}

class Apple {
    constructor(x, y, type = "normal") {
        this.x = x;
        this.y = y;
        this.type = type;
    }

    draw(ctx, gridSize, appleColor) {
        ctx.fillStyle = appleColor;
        ctx.fillRect(this.x * gridSize, this.y * gridSize, gridSize, gridSize);
        ctx.strokeRect(this.x * gridSize, this.y * gridSize, gridSize, gridSize);
    }
}

let snake = new Snake();
let canvas = document.getElementById("gameCanvas");
let score = document.getElementById("score");
let highscore = document.getElementById("highscore");

snake.createSnake({
    canvas: canvas,
    score: score,
    highscore: highscore,
    snakeColor: "#288ADA",
    appleColor: "#E3311D",
    borderColor: "#050507",
    canvasColor: "#121212",
    speed: 50,
    isTpBorder: true,
    gridSize: 10,
    canvasSize: 600,
    start_pos_x: 20,
    start_pos_y: 20
});

snake.start();