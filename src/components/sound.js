//THIS IS THE CODE THAT IS USED TO IMPLEMENT SOUND

import * as THREE from 'three';
const audioLoader = new THREE.AudioLoader();
//const audioLoaderShort = new THREE.AudioLoader();
const listener = new THREE.AudioListener();
//const listenerShort = new THREE.AudioListener();
const music = new THREE.Audio(listener);
const underwaterEffect = new THREE.Audio(listener);
const bite = new THREE.Audio(listener);
const explosion = new THREE.Audio(listener);

//loads sound into audio loader
export function addSounds(camera){
    camera.add(listener);
    //camera.add(listenerShort);
    audioLoader.load('../sounds/interface.mp3', function(buffer){
        music.setBuffer(buffer);
        music.setLoop(true);
        music.setVolume(0.4);
    });
    audioLoader.load('../sounds/underwater-ambience-6201.mp3', function(buffer){
        underwaterEffect.setBuffer(buffer);
        underwaterEffect.setLoop(true);
        underwaterEffect.setVolume(1.5);      
    });
    audioLoader.load('../sounds/eating-sound-effect-36186.mp3', function(buffer){
        bite.setBuffer(buffer);
        bite.setLoop(false);
        bite.setVolume(1);
    });
    audioLoader.load('../sounds/hq-explosion-6288.mp3', function(buffer){
        explosion.setBuffer(buffer);
        explosion.setLoop(false);
        explosion.setVolume(0.4);
});
}

//sound on for the settings
export function turnMusicOff(){
    populateNullLocalStorage()
    var soundOn = localStorage.getItem("musicOn")
    if(soundOn === "true"){
        localStorage.setItem("musicOn", "false")
    }
}

//sound on for the settings
export function turnMusicOn(){
    populateNullLocalStorage()
    var soundOn = localStorage.getItem("musicOn")
    if(soundOn === "false"){
        localStorage.setItem("musicOn", "true")
    }
}

//sound on for the settings
export function turnFXOff(){
    populateNullLocalStorage()
    var soundOn = localStorage.getItem("fxOn")
    if(soundOn === "true"){
        localStorage.setItem("fxOn", "false")
    }
}

//sound on for the settings
export function turnFXOn(){
    populateNullLocalStorage()
    var soundOn = localStorage.getItem("fxOn")
    if(soundOn === "false"){
        localStorage.setItem("fxOn", "true")
    }
}

//code that plays bite sound
export function playBite(){
    populateNullLocalStorage()
    // console.log("Bite happening")
    var soundOn = localStorage.getItem("fxOn")
    if(soundOn==="true"){
        bite.play();
    }
}

export function playExplosion(){
    populateNullLocalStorage()
    // console.log("Bite happening")
    var soundOn = localStorage.getItem("fxOn")
    if(soundOn==="true"){
        explosion.play();
    }
}

//sets sound
export function populateNullLocalStorage(){
    if (localStorage.getItem("musicOn") === null) {
        localStorage.setItem("musicOn", "true")
    }
    if (localStorage.getItem("fxOn") === null) {
        localStorage.setItem("fxOn", "true")
    }
}

//plays background music and hides the button that activates it
export function playBackgroundMusic(){
    populateNullLocalStorage()
    var soundOn = localStorage.getItem("musicOn")
    if(soundOn==="true"){
        music.play();
        underwaterEffect.play();
    }
}