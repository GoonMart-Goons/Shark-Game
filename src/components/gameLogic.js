import { drawScore, setBarNumber, incPlayerHealth, 
         incPlayerHunger, incScore, getPlayerHealth, getPlayerHunger } from "./hud";

export let activeGame = true;
export let score = 0;

export const maxHealth = 100; // Maximum health

export const maxHunger = 100; // Maximum hunger

const scoreEvents = new Map([
    ["smallFish", 5],
    ["bigFish", 10]
])

const hungerEvents = new Map([
    ["smallFish", 5],
    ["bigFish", 10]
])

const healthEvents = new Map([
    ["jellyfish", -5],
    ["bomb", -10],
    ["healthBoost", 10]
])

export function updateHunger(hungerEvent){
    var hungerInc = hungerEvents.get(hungerEvent)
    incPlayerHunger(hungerInc)
}

export function updateHealth(healthEvent){
    var playerHealth = getPlayerHealth()
    const healthInc = healthEvents.get(healthEvent)
    playerHealth = Math.min(maxHealth, playerHealth + healthInc);
    incPlayerHealth(healthInc)
}

// export function setBarNumber(){
//     if(playerHunger > 0){
//         playerHunger = Math.max(0, playerHunger - hungerDecay);
//     }
//     if(playerHunger <= 0){
//         playerHealth = Math.max(0, playerHealth - healthDecay);
//     }
//     if (playerHealth == 0){
//         endGame();
//         //console.log("activeGame: ", activeGame);
//     }
// }

export function updateScore(event){
    incScore(scoreEvents.get(event))
    updateHunger(event)
    drawScore()
}

function endGame(){
    activeGame = false;
}