//HUD
import {playerHealth, playerHunger, maxHealth, maxHunger, activeGame, endGame} from './gameLogic';

const canvasHealth = document.getElementById("healthBar");
const contextHealth = canvasHealth.getContext("2d");

const canvasScore = document.getElementById("score");
const contextScore = canvasScore.getContext("2d");

const canvasTime = document.getElementById("time");
const contextTime = canvasTime.getContext("2d");

const canvasHunger = document.getElementById("hungerBar");
const contextHunger = canvasHunger.getContext("2d");

const endTime = new Date().getTime() + 5 * 60 * 1000;

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

export function drawScore(score){
    contextScore.clearRect(0, 0, canvasScore.width, canvasScore.height);
    setTextStyle(contextScore);
    const stringScore = "Score: "+ score;
    contextScore.strokeText(stringScore, 10, 20);
    contextScore.fillText(stringScore, 10, 20);
}

export function drawTime(){
    contextTime.clearRect(0, 0, canvasTime.width, canvasTime.height);
    setTextStyle(contextTime);
    let stringTime = updateCountdown();
    if (stringTime == 'Countdown expired!'){
        endGame();
    } 
    if(activeGame == false){
        stringTime = 'Game over!';
    }
    contextTime.strokeText(stringTime, 10, 20);
    contextTime.fillText(stringTime, 10, 20);
}

export function drawBars(){
    const currentTime = new Date();
    const isEvenSecond = currentTime.getSeconds() % 2 === 0;

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

}

export function updateCountdown() {
    const currentTime = new Date().getTime();
    const timeRemaining = endTime - currentTime;

    if (timeRemaining <= 0) {
      //clearInterval(interval);
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
    canvasScore.style.right = "20px";

    canvasTime.style.position = "absolute";
    canvasTime.style.top = "60px";
    canvasTime.style.right = "20px";

}