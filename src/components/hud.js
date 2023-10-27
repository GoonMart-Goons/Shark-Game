import { endGameTrigger, pauseGameEvent, resumeGameEvent } from "./gameEvents";

//HUD
var playerHealth = 100; // Player's actual health
var maxHealth = 100; // Maximum health

var playerHunger = 100; // Player's actual hunger level
var maxHunger = 100; 

var score = 0;
var scoreToWin = 100;

const canvasHealth = document.getElementById("healthBar");
const contextHealth = canvasHealth.getContext("2d");

const canvasScore = document.getElementById("score");
const contextScore = canvasScore.getContext("2d");

const canvasTime = document.getElementById("time");
const contextTime = canvasTime.getContext("2d");

const canvasHunger = document.getElementById("hungerBar");
const contextHunger = canvasHunger.getContext("2d");

var maxGameTime = 5 //minutes
var endTime;
var displayTime
var lastTimeStamp = null

var gameIsActive = true
var pausedTime = 0

var hungerDecay = 0.01  //0.05
var healthDecay = 0.025 //0.025

export function levelSettings(pointsToWin, totalTime, hunger, health){
    scoreToWin = pointsToWin
    maxGameTime = totalTime
    hungerDecay = hunger
    healthDecay = health
}

export function drawVariableBar(context, canvas, health, maxHealth, colour) {
    context.clearRect(0, 0, canvas.width, canvas.height);
  
    // Draw the background
    context.fillStyle = "gray";
    context.fillRect(0, 0, canvas.width, canvas.height);
  
    // Draw the health portion
    const healthWidth = (health / maxHealth) * canvas.width;
    context.fillStyle = colour;
    context.fillRect(0, 0, healthWidth, canvasHealth.height);
}
  
export function setTextStyle(context){
    context.fillStyle = "white";
    context.font = "20px Comic Sans MS";
    context.strokeStyle = "white";
}

export function incPlayerHealth(health){
    playerHealth += health

    if(playerHealth > maxHealth)
        playerHealth = 100
}

export function incPlayerHunger(hunger){
    // if(playerHealth + hunger > maxHealth){
    //     playerHealth = maxHealth
    //     playerHunger += hunger
    // } 
    // else if(playerHealth < maxHealth)
    //     incPlayerHealth(hunger)
    // else
    //     playerHunger += hunger
    playerHunger += hunger

    if(playerHunger > maxHunger)
        playerHunger = 100
}

export function incScore(points){
    score += points
}

export function getPlayerHealth(){
    return playerHealth
}

export function getPlayerHunger(){
    return playerHunger
}

export function drawScore(){
    contextScore.clearRect(0, 0, canvasScore.width, canvasScore.height)
    setTextStyle(contextScore);
    const stringScore = "Score: "+ score;
    contextScore.strokeText(stringScore, 10, 20);
    contextScore.fillText(stringScore, 10, 20);
}

export function drawTime(){
    contextTime.clearRect(0, 0, canvasTime.width, canvasTime.height);
    setTextStyle(contextTime);
    if(gameIsActive){
        // const stringTime = updateCountdown();
        contextTime.strokeText(displayTime, 10, 20);
        contextTime.fillText(displayTime, 10, 20);
    }
}

export function setBarNumber(){
    if(gameIsActive){
        if(playerHunger > 0){
            playerHunger = Math.max(0, playerHunger - hungerDecay);
        }
        if(playerHunger <= 0){
            playerHealth = Math.max(0, playerHealth - healthDecay);
        }
        //console.log(playerHunger);
        const currTime = new Date();
        const isEvenSecond = currTime.getSeconds() % 2 === 0;
    
        let healthColor = "green";
        let hungerColor = "purple";
    
        if (playerHealth <= 20) {
            healthColor = isEvenSecond ? "red" : "green";
        }
    
        if (playerHunger <= 20) {
            hungerColor = isEvenSecond ? "red" : "purple";
        }
    
        drawVariableBar(contextHealth, canvasHealth, playerHealth, maxHealth, healthColor);
        drawVariableBar(contextHunger, canvasHunger, playerHunger, maxHunger, hungerColor);
        
        if(playerHealth <= 0){
            showGameOverScreen('Game Over, Ran out of health')
            return
        }
        const currentTime = new Date().getTime();
        if(endTime <= 0){
            showGameOverScreen('Game Over, Ran out of time')
            return
        }
        if(score >= scoreToWin){
            showGameOverScreen('You Win!')
            return
        }
    }
}

function showGameOverScreen(text){
    //Deactivate game
    gameIsActive = false

    //Hide game canvas
    document.getElementById('game-container').style.display = 'none'

    //Game over sceen 
    const gameOverScreen = document.getElementById('game-over')
    const gameOverText = document.getElementById('game-over-text')
    const gameOverScore = document.getElementById('game-over-score')
    //Display "stats"
    gameOverText.textContent = text
    gameOverScore.textContent = score; // Set the final score
    //Show game over
    gameOverScreen.style.display = 'block'

    endGameTrigger() //Event trigger to end game
}

// Add an event listener for the main menu button
document.getElementById('restart-button').addEventListener('click', () => {
    // Hide the game over screen
    document.getElementById('game-over').style.display = 'none';

    // Reset the game variables (e.g., player health, hunger, score, and time)
    playerHealth = maxHealth;
    playerHunger = maxHunger;
    score = 0;
    // Reset other game-related variables as needed

    // Display the main menu
    document.getElementById('app').style.display = 'block';

    // Hide the game container (if it's visible)
    document.getElementById('game-container').style.display = 'none';

    // You may need to perform any additional cleanup or logic to return to the main menu state
});

// export const timerInterval = setInterval(updateCountdown, 1000)

export function updateCountdown(timeStamp) {
    if(!gameIsActive){
        lastTimeStamp = timeStamp
        requestAnimationFrame(updateCountdown)
        return
    }

    if(!lastTimeStamp)
        lastTimeStamp = timeStamp

    const delta = (timeStamp - lastTimeStamp)

    const mins = Math.floor(endTime / 3600)
    const secs = Math.floor(endTime / 60 % 60)
    const formattedSecs = secs < 10 ? `0${secs}` : secs

        // Check if the timer has reached zero
    if (endTime <= 0) {
        clearInterval(timerInterval); // Stop the timer
        console.log("Time's up!");
    } else {
        endTime -= 0.5; // Decrement the time remaining
    }

    displayTime = `Time: ${mins}: ${formattedSecs}`

    // console.log('Game is ranning:', gameIsActive)
    // if(!gameIsActive)
    //     pausedTime = new Date().getTime()
    // if(gameIsActive){
    //     const currentTime = new Date().getTime();
    //     const timeRemaining = endTime - currentTime + pausedTime;
    
    //     if (timeRemaining <= 0) {
    //       clearInterval(interval);
    //       return 'Countdown expired!';
    //       //document.getElementById('time').innerHTML = 'Countdown expired!';
    //     } else {
    //       const minutes = Math.floor((timeRemaining / 1000) / 60);
    //       const seconds = Math.floor((timeRemaining / 1000) % 60);

    //       // Use string formatting to ensure seconds has two digits
    //       const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    //       `Time remaining: ${minutes} minutes ${formattedSeconds} seconds`
    //       return `Time: 0${minutes}: ${formattedSeconds}`;
    //     }
    // }
}

export function initHUD(){
    gameIsActive = true

    playerHealth = maxHealth
    playerHunger = maxHunger
    // endTime = maxGameTime * 60 * 1000;
    endTime = 300 * 60
    score = 0

    canvasHealth.style.position = "absolute";
    canvasHealth.style.top = "10px";
    canvasHealth.style.left = "50px";

    canvasHunger.style.position = "absolute";
    canvasHunger.style.top = "60px";
    canvasHunger.style.left = "50px";
    
    canvasScore.style.position = "absolute";
    canvasScore.style.top = "10px";
    canvasScore.style.right = "10px";

    canvasTime.style.position = "absolute";
    canvasTime.style.top = "50px";
    canvasTime.style.right = "20px";

    drawScore(0)
    setBarNumber()
}

//Adds event listeners for the game
document.addEventListener('pauseGameEvent', function(event){
    console.log('Pause event called')
    gameIsActive = false
})
document.addEventListener('resumeGameEvent', function(event){
    console.log('Resume event called')
    gameIsActive = true
    lastTimeStamp = null
})