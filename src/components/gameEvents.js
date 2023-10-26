//Start the game
const startGameEvent = new CustomEvent('startGameEvent', function(event){
    detail: {message: 'Starting the game'}
})
export function startGameTrigger(){
    document.dispatchEvent(startGameEvent)
}

//End the game
const endGameEvent = new CustomEvent('endGameEvent', function(event){
    detail: {message: 'Ending the game'}
})
export function endGameTrigger(){
    document.dispatchEvent(endGameEvent)
}

const pauseGameEvent = new CustomEvent('pauseGameEvent', function(event){
    detail: {message: 'Game is paused'}
})
export function pauseGameTrigger(){
    document.dispatchEvent(pauseGameEvent)
}