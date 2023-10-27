import { setGameSettings } from "../main"
import { levelSettings } from "./hud"

export function initLevel(level){
    var scoreToWin
    var totalGameTime //in minutes
    var numFish
    var numMines
    var healthDecay
    var hungerDecay

    switch(level){
        case 1:
            scoreToWin = 100
            totalGameTime = 2.5
            numFish = 35
            numMines = 0
            healthDecay = 0.025
            hungerDecay = 0.01
        case 2:
            scoreToWin = 100
            totalGameTime = 2.5
            numFish = 25
            numMines = 50
            healthDecay = 0.03
            hungerDecay = 0.01
    }

    levelSettings(scoreToWin, totalGameTime, hungerDecay, healthDecay)
    setGameSettings(numFish, numMines)
}