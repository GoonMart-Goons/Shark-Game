import { drawScore, setBarNumber, setPlayerHealth, 
         setPlayerHunger, incScore, getPlayerHealth, getPlayerHunger } from "./hud";

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
    var playerHunger = getPlayerHunger()
    playerHunger = Math.min(maxHunger, playerHunger + hungerEvents.get(hungerEvent));
    setPlayerHunger(playerHunger)
}

export function updateHealth(healthEvent){
    var playerHealth = getPlayerHealth()
    playerHealth = Math.min(maxHealth, playerHealth + healthEvents.get(healthEvent));
    setPlayerHealth(playerHealth)
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
    drawScore()
}

function endGame(){
    activeGame = false;
}