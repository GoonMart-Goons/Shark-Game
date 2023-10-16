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

const endTime = new Date().getTime() + 5 * 60 * 1000;

const hungerDecay = 0.05
const healthDecay = 0.025

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

export function setPlayerHealth(health){
    playerHealth = health
}

export function setPlayerHunger(hunger){
    playerHunger = hunger
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
    if(playerHunger > 0){
        playerHunger = Math.max(0, playerHunger - hungerDecay);
    }
    if(playerHunger <= 0){
        playerHealth = Math.max(0, playerHealth - healthDecay);
    }
    //console.log(playerHunger);
    drawVariableBar(contextHealth, canvasHealth, playerHealth, maxHealth, "green");
    drawVariableBar(contextHunger, canvasHunger, playerHunger, maxHunger, "orange");  
}

export function updateCountdown() {
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

export function initHUD(){
    canvasHealth.style.position = "absolute";
    canvasHealth.style.top = "10px";
    canvasHealth.style.left = "200px";

    canvasHunger.style.position = "absolute";
    canvasHunger.style.top = "60px";
    canvasHunger.style.left = "200px";
    
    canvasScore.style.position = "absolute";
    canvasScore.style.top = "10px";
    canvasScore.style.left = "10px";

    canvasTime.style.position = "absolute";
    canvasTime.style.top = "10px";
    canvasTime.style.right = "20px";

    drawScore(0)
}