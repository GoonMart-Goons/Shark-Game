//THIS IS THE CODE THAT IS USED TO IMPLEMENT SOUND

import * as THREE from 'three';
const audioLoader = new THREE.AudioLoader();
const audioLoaderShort = new THREE.AudioLoader();
const listener = new THREE.AudioListener();
const listenerShort = new THREE.AudioListener();
const music = new THREE.Audio(listener);
const underwaterEffect = new THREE.Audio(listener);
const bite = new THREE.Audio(listener);
const button = document.getElementById("startGame");

//loads sound into audio loader
export function addSounds(camera){
    camera.add(listener);
    camera.add(listenerShort);
    audioLoader.load('./sounds/interface.mp3', function(buffer){
        music.setBuffer(buffer);
        music.setLoop(true);
        music.setVolume(0.4);
    });
    audioLoader.load('./sounds/underwater-ambience-6201.mp3', function(buffer){
        underwaterEffect.setBuffer(buffer);
        underwaterEffect.setLoop(true);
        underwaterEffect.setVolume(1.5);      
    });
    audioLoaderShort.load('./sounds/eating-sound-effect-36186.mp3', function(buffer){
        bite.setBuffer(buffer);
        bite.setLoop(false);
        bite.setVolume(1);
    });
}

//sound on for the settings
export function turnSoundOff(){
    populateNullLocalStorage()
    var soundOn = localStorage.getItem("soundOn")
    if(soundOn === "true"){
        localStorage.setItem("soundOn", "false")
    }
}

//sound on for the settings
export function turnSoundOn(){
    populateNullLocalStorage()
    var soundOn = localStorage.getItem("soundOn")
    if(soundOn === "false"){
        localStorage.setItem("soundOn", "true")
    }
}

//code that plays bite sound
export function playBite(){
    populateNullLocalStorage()
    console.log("Bite happening")
    var soundOn = localStorage.getItem("soundOn")
    if(soundOn==="true"){
        bite.play();
    }
}

//sets sound
function populateNullLocalStorage(){
    if (localStorage.getItem("soundOn") === null) {
        localStorage.setItem("soundOn", "true")
    }
}

//plays background music and hides the button that activates it
export function playBackgroundMusic(){
    populateNullLocalStorage()
    var soundOn = localStorage.getItem("soundOn")
    if(soundOn==="true"){
        music.play();
        underwaterEffect.play();
    }
}