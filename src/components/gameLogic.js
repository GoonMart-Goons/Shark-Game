export let activeGame = true;
export let score = 0;

export let playerHealth = 100; // Player's actual health
export const maxHealth = 100; // Maximum health

export let playerHunger = 100; // Player's actual hunger level
export const maxHunger = 100;

const hungerDecay = 0.05
const healthDecay = 0.025

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
    //console.log("playerHunger before: ", playerHunger);
    playerHunger = Math.min(maxHunger, playerHunger + hungerEvents.get(hungerEvent));
    //console.log("playerHunger after: ", playerHunger);  
}

export function updateHealth(healthEvent){
    //console.log("playerHealth before: ", playerHealth); 
    playerHealth = Math.min(maxHealth, playerHealth + healthEvents.get(healthEvent));
    //console.log("playerHealth after: ", playerHealth);  
}

export function setBarNumber(){
    if(playerHunger > 0){
        playerHunger = Math.max(0, playerHunger - hungerDecay);
    }
    if(playerHunger <= 0){
        playerHealth = Math.max(0, playerHealth - healthDecay);
    }
    if (playerHealth == 0){
        endGame();
        //console.log("activeGame: ", activeGame);
    }
}

export function updateScore(event){
    score += scoreEvents.get(event);
}

export function endGame(){
    activeGame = false;
}