//HUD
var playerHealth = 100; // Player's actual health
var maxHealth = 100; // Maximum health

var playerHunger = 100; // Player's actual hunger level
var maxHunger = 100; 

var score = 0;

const canvasHealth = document.getElementById("healthBar");
const contextHealth = canvasHealth.getContext("2d");

const canvasScore = document.getElementById("score");
const contextScore = canvasScore.getContext("2d");

const canvasTime = document.getElementById("time");
const contextTime = canvasTime.getContext("2d");

const canvasHunger = document.getElementById("hungerBar");
const contextHunger = canvasHunger.getContext("2d");

const maxGameTime = 5 //minutes
var endTime;

var gameIsActive = true

const hungerDecay = 0.05  //0.05
const healthDecay = 0.025 //0.025

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
    if(playerHealth + hunger > maxHealth){
        playerHealth = maxHealth
        playerHunger += hunger
    } 
    else if(playerHealth < maxHealth)
        incPlayerHealth(hunger)
    else
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
    const stringTime = updateCountdown();
    contextTime.strokeText(stringTime, 10, 20);
    contextTime.fillText(stringTime, 10, 20);
}

export function setBarNumber(){
    if(true){
        if(playerHunger > 0){
            playerHunger = Math.max(0, playerHunger - hungerDecay);
        }
        if(playerHunger <= 0){
            playerHealth = Math.max(0, playerHealth - healthDecay);
        }
        //console.log(playerHunger);
        drawVariableBar(contextHealth, canvasHealth, playerHealth, maxHealth, "green");
        drawVariableBar(contextHunger, canvasHunger, playerHunger, maxHunger, "orange"); 
        
        if(playerHealth <= 0){
            showGameOverScreen('Game Over, Ran out of health')
            return
        }
        const currentTime = new Date().getTime();
        if(endTime - currentTime <= 0){
            showGameOverScreen('Game Over, Ran out of time')
            return
        }
        if(score >= 200){
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


export function updateCountdown() {
    if(gameIsActive){
        const currentTime = new Date().getTime();
        const timeRemaining = endTime - currentTime;
    
        if (timeRemaining <= 0) {
          clearInterval(interval);
          return 'Countdown expired!';
          //document.getElementById('time').innerHTML = 'Countdown expired!';
        } else {
          const minutes = Math.floor((timeRemaining / 1000) / 60);
          const seconds = Math.floor((timeRemaining / 1000) % 60);
          `Time remaining: ${minutes} minutes ${seconds} seconds`
          return `Time: 0${minutes}: ${seconds}`;
        }
    }
}

export function initHUD(){
    gameIsActive = true

    playerHealth = maxHealth
    playerHunger = maxHunger
    endTime = new Date().getTime() + maxGameTime * 60 * 1000;
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
}