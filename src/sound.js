//THIS IS THE CODE THAT IS USED TO IMPLEMENT SOUND

import * as THREE from 'three';
localStorage.setItem("soundOn", "true")
const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();
const music = new THREE.Audio(listener);
const underwaterEffect = new THREE.Audio(listener);
const bite = new THREE.Audio(listener);
const button = document.getElementById("startGame");
button.onclick = hide;
const buttonSettings = document.getElementById("settings_button");
button.style.position = "absolute";
button.style.top = "80px";
button.style.right = "80px";

buttonSettings.style.position = "absolute";
buttonSettings.style.top = "100px";
buttonSettings.style.right = "80px";

buttonSettings.addEventListener("click", () =>{
    window.location = "settings";
});


//loads sound into audio loader
export function playBackground(camera){
    camera.add(listener);
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
    audioLoader.load('./sounds/eating-sound-effect-36186.mp3', function(buffer){
        bite.setBuffer(buffer);
        bite.setLoop(false);
        bite.setVolume(5);
    });
}

//sound on for the settings
export function turnSoundOff(){
    var soundOn = localStorage.getItem("soundOn")
    if(soundOn === "true"){
        localStorage.setItem("soundOn", "false")
    }
}

//sound on for the settings
export function turnSoundOn(){
    var soundOn = localStorage.getItem("soundOn")
    if(soundOn === "false"){
        localStorage.setItem("soundOn", "true")
    }
}

//code that plays bite sound
export function playBite(){
    console.log("Bite happening")
    if(soundOn==="true"){
        bite.play();
    }
}

//plays background music and hides the button that activates it
export function hide(){
    var soundOn = localStorage.getItem("soundOn")
    if(soundOn==="true"){
        music.play();
        underwaterEffect.play();
    }
}