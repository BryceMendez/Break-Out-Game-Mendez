const cvs = document.getElementById("breakout");
const ctx = cvs.getContext("2d");

cvs.style.border = "5px solid #000000";

cvs.lineWidth = 3; 

const PADDLE_WIDTH = 100;
const PADDLE_MARGIN_BOTTOM = 50;
const PADDLE_HEIGHT = 20
const BALL_RADIUS = 8;
let LIFE = 3;
let SCORE = 0;
const SCORE_UNIT = 10;
let LEVEL = 1;
const MAX_LEVEL = 3;
let GAME_OVER = false;
let leftArrow = false;
let rightArrow = false;

const paddle = {
    x : cvs.width/2 - PADDLE_WIDTH/2,
    y : cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT,
    width : PADDLE_WIDTH,
    height : PADDLE_HEIGHT,
    dx : 5
}

function drawPaddle(){
    ctx.fillStyle = "#FF007F";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    ctx.strokeStyle = "#FF69B4";
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

document.addEventListener("keydown", function(event){
    if(event.keyCode == 37){
        leftArrow = true;
    }else if(event.keyCode == 39){
        rightArrow = true;
    }
});

document.addEventListener("keyup", function(event){
    if(event.keyCode == 37){
        leftArrow = false;
    }else if(event.keyCode == 39){
        rightArrow = false;
    }
});

function movePaddle(){
    if(rightArrow && paddle.x + paddle.width < cvs.width){
        paddle.x += paddle.dx;
    }else if(leftArrow && paddle.x > 0){
        paddle.x -= paddle.dx;
    }
}

const ball = {
    x : cvs.width/2,
    y : paddle.y - BALL_RADIUS,
    radius : BALL_RADIUS,
    speed : 4,
    dx : 3 * (Math.random() * 2 - 1),
    dy : -3
}

function drawBall(){
    ctx.beginPath();

    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = "#FF6EC7";
    ctx.fill();

    ctx.strokeStyle = "#FF6EC7";
    ctx.stroke();

    ctx.closePath();

}

function moveBall(){
    ball.x += ball.dx;
    ball.y += ball.dy;
}

function ballWallCollision(){
    if(ball.x + ball.radius > cvs.width || ball.x - ball.radius < 0){
        ball.dx = - ball.dx;
        WALL_HIT.play();
    }

    if(ball.y - ball.radius < 0){
        ball.dy = - ball.dy;
        WALL_HIT.play();
    }

    if(ball.y + ball.radius > cvs.height){
        LIFE--;
        LIFE_LOST.play();
        resetBall();
    }
}

function resetBall(){
    ball.x = cvs.width/2;
    ball.y = paddle.y - BALL_RADIUS;
    ball.dx = 3 * (Math.random() * 2 - 1);
    ball.dy = -3;
}

function ballPaddleCollision(){
    if(ball.x < paddle.x + paddle.width && ball.x > paddle.x && paddle.y < paddle.y +
        paddle.height && ball.y > paddle.y){

            PADDLE_HIT.play();

            let collidePoint = ball.x - (paddle.x + paddle.width/2);

            collidePoint = collidePoint / (paddle.width/2);

            let angle = collidePoint * Math.PI/3;

            ball.dx = ball.speed * Math.sin(angle);
            ball.dy = - ball.speed * Math.cos(angle);
        }
}

const brick = {
    row : 1,
    column: 5,
    width: 55,
    height : 20,
    offSetLeft : 20,
    offSetTop : 20,
    marginTop : 40,
    fillColor : "#FFC1CC",
    strokeColor : "#FF07F"
}

let bricks = [];

function createBricks(){
    for(let r = 0; r < brick.row; r++){
        bricks[r] = [];
        for(let c = 0; c < brick.column; c++){
            bricks[r][c] = {
                x : c * (brick.offSetLeft + brick.width) + brick.offSetLeft,
                y : r * (brick.offSetTop + brick.height) + brick.offSetTop + brick.marginTop,
                status : true
            }
        }
    }
}
createBricks();

function drawBricks(){
    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            let b = bricks[r][c];
            if(b.status){
                ctx.fillStyle = brick.fillColor;
                ctx.fillRect(b.x, b.y, brick.width, brick.height);

                ctx.strokeStyle = brick.strokeColor;
                ctx.strokeRect(b.x, b.y, brick.width, brick.height);
            }
        }
    }
}

function ballBrickCollision(){
    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            let b = bricks[r][c];

            if(b.status){
                if(b.status){
                    if(ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + brick.width &&
                        ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + brick.height){
                            BRICK_HIT.play();
                            ball.dy = - ball.dy;
                            b.status = false;
                            SCORE += SCORE_UNIT;
                        }
                }
            }
        }
    } 
}

function showGameStats(text, textX, textY, img, imgX, imgY){
    ctx.fillStyle = "#FFF";
    ctx.font = "25px Germania One";
    ctx.fillText(text, textX, textY);

    ctx.drawImage(img, imgX, imgY, width = 25, height = 25)
}

function draw(){
    drawPaddle();

    drawBall();

    drawBricks();

    showGameStats(SCORE, 35, 25, SCORE_IMG, 5, 5);

    showGameStats(LIFE, cvs.width - 25, 25, LIFE_IMG, cvs.width - 55, 5);

    showGameStats(LEVEL, cvs.width/2, 25, LEVEL_IMG, cvs.width/2 - 30, 5);

}

function gameOver(){
    if(LIFE <= 0){
        showYouLose();
        GAME_OVER = true;
    }
}

function levelUp(){
    let isLevelDone = true;

    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            isLevelDone = isLevelDone && ! bricks[r][c].status;
        }
    }

    if(isLevelDone){
        WIN.play();

        if(LEVEL >= MAX_LEVEL){
            showYouWin();
            
            GAME_OVER = true;
            return;
        }
        brick.row++;
        createBricks();
        ball.Speed += 0.5
        resetBall();
        LEVEL++;
    }
}

function update(){
    movePaddle();

    moveBall();

    ballWallCollision();

    ballPaddleCollision();

    ballBrickCollision();

    gameOver();

    levelUp()
}

function loop(){

    ctx.drawImage(BG_IMG, 0, 0);

    draw();

    update();

    if(! GAME_OVER){
        requestAnimationFrame(loop);
    }
}
loop();

const soundElement = document.getElementById("sound");

soundElement.addEventListener("click", audioManager);

function audioManager(){
    let imgSrc = soundElement.getAttribute("src");
    let SOUND_IMG = imgSrc == "soundOn.jpg" ? "soundOff.jpg" : 
    "soundOn.jpg";

    soundElement.setAttribute("src", SOUND_IMG);
    WALL_HIT.muted = WALL_HIT.muted ? false : true;
    PADDLE_HIT.muted = PADDLE_HIT.muted ? false : true;
    BRICK_HIT.muted = BRICK_HIT.muted ? false : true;
    WIN.muted = WIN.muted ? false : true;
    LIFE_LOST.muted = LIFE_LOST.muted ? false : true;
}

const gameover = document.getElementById("gameover");
const youwin = document.getElementById("youwin");
const youlose = document.getElementById("youlose");
const restart = document.getElementById("restart");

restart.addEventListener("click", function(){
    location.reload();
})

function showYouWin(){
    gameover.style.display = "block";
    youwon.style.display = "block";
}

function showYouLose(){
    gameover.style.display = "block";
    youlose.style.display = "block";
}