import * as THREE from 'three';
//sound
//var soundOn = false;
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
}

/*export function turnSoundOff(){
    if(soundOn){
        soundOn = false;
    }
}

export function turnSoundOn(){
    if(!soundOn){
        soundOn = true;
    }
}*/

export function playBite(camera){
    camera.add(listener);
    audioLoader.load('./sounds/eating-sound-effect-36186.mp3', function(buffer){
        bite.setBuffer(buffer);
        bite.setLoop(false);
        bite.setVolume(5);
    });
}

export function hide(){
    document.getElementById("startGame").style.display = "none";
    var soundOn = localStorage.getItem("soundOn")
    if(soundOn==="true"){
        music.play();
        underwaterEffect.play();
    }
}