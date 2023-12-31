//Start the game
export const startGameEvent = new CustomEvent('startGameEvent', function(event){
    detail: {message: 'Starting the game'}
})
export function startGameTrigger(){
    document.dispatchEvent(startGameEvent)
}

//End the game
export const endGameEvent = new CustomEvent('endGameEvent', function(event){
    detail: {message: 'Ending the game'}
})
export function endGameTrigger(){
    document.dispatchEvent(endGameEvent)
}

//Pause the game
export const pauseGameEvent = new CustomEvent('pauseGameEvent', function(event){
    detail: {message: 'Game is paused'}
})
export function pauseGameTrigger(){
    document.dispatchEvent(pauseGameEvent)
}

//Resume the game
export const resumeGameEvent = new CustomEvent('resumeGameEvent', function(event){
    detail: {message: 'Resumed the game'}
})
export function resumeGameTrigger(){
    document.dispatchEvent(resumeGameEvent)
}