import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

//G L O B A L   V A R I A B L E S =================================================================
//Camera and scene setup
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

//Components
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1)
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 5)
let player
let ground

//For movement
const playerSpeed = 0.0325
const playerPos = new THREE.Vector3(0, 0, 0)
const playerDir = new THREE.Vector3()

//HUD
var playerHealth = 100; // Player's actual health
var maxHealth = 100; // Maximum health

var playerHunger = 100; // Player's actual hunger level
var maxHunger = 100; 

const canvasHealth = document.getElementById("healthBar");
const contextHealth = canvasHealth.getContext("2d");

const canvasScore = document.getElementById("score");
const contextScore = canvasScore.getContext("2d");

const canvasTime = document.getElementById("time");
const contextTime = canvasTime.getContext("2d");

const canvasHunger = document.getElementById("hungerBar");
const contextHunger = canvasHunger.getContext("2d");

const endTime = new Date().getTime() + 5 * 60 * 1000;

//Skybox, texture from https://jkhub.org/files/file/3216-underwater-skybox/
let materialArray = [];
let texture_ft = new THREE.TextureLoader().load('./Images/uw_ft.jpg');
let texture_bk = new THREE.TextureLoader().load('./Images/uw_bk.jpg');
let texture_up = new THREE.TextureLoader().load('./Images/uw_up.jpg');
let texture_dn = new THREE.TextureLoader().load('./Images/uw_dn.jpg');
let texture_rt = new THREE.TextureLoader().load('./Images/uw_rt.jpg');
let texture_lf = new THREE.TextureLoader().load('./Images/uw_lf.jpg');

materialArray.push(new THREE.MeshBasicMaterial({map: texture_ft}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_bk}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_up}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_dn}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_rt}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_lf}));

let skyBoxShape = new THREE.BoxGeometry(1000, 1000, 1000);
let skyBox = new THREE.Mesh(skyBoxShape, materialArray);

for (let i = 0; i < 6; i++){
    materialArray[i].side = THREE.BackSide;
}


// ================================================================================================

// F U N C T I O N S ==============================================================================
//Animation functions
function animate(){
    requestAnimationFrame(animate)

    //Player movement
    playerPos.addScaledVector(playerDir, playerSpeed)
    player.position.copy(playerPos)
    camFollowPlayer()
    
    renderer.render(scene, camera)
    setBarNumber();
    drawTime();
    //renderer.render(sceneHUD, cameraHUD);
    // movePlayer()
}

//Allows code to listen for keyboard input
function addKeyListener(){
    //Keydown = active input 
    window.addEventListener('keydown', handleKeyDown)
    //When key is released, input !active
    window.addEventListener('keyup', handleKeyUp)
}

//Handles player movement on key events
const handleKeyDown = (e) => {
    switch(e.key){
        case 'w':
        case 'ArrowUp':
            playerDir.z = -1
            break
        case 's':
        case 'ArrowDown':
            playerDir.z = 1
            break
        case 'a':
        case 'ArrowLeft':
            playerDir.x = -1
            break
        case 'd':
        case 'ArrowRight':
            playerDir.x = 1
            break
    }
}
const handleKeyUp = (e) => {
    switch (e.key){
        case 'w':
        case 's':
        case 'ArrowUp':
        case 'ArrowDown':
            playerDir.z = 0
            break
        case 'a':
        case 'd':
        case 'ArrowLeft':
        case 'ArrowRight':
            playerDir.x = 0
            break
        //
        case 'j':
            playerHunger = Math.max(100, playerHunger);
            playerHunger = Math.min(playerHunger, 100);
    }
}

//Keeps cam following the player with some offset
function camFollowPlayer(){
    const camOffset = new THREE.Vector3(0, 1, 5)
    let newCamPos = playerPos.clone().add(camOffset)

    camera.position.lerp(newCamPos, 0.2)
}

//Makes a cube
function addCube(){
    let geometry = new THREE.BoxGeometry(1, 1, 1)
    let material = new THREE.MeshPhongMaterial({color: 0x55aaff})
    let cube = new THREE.Mesh(geometry, material)

    return cube
}

//Make a plane [ground]
function addPlane(){
    let geometry = new THREE.PlaneGeometry(15, 15)
    let material = new THREE.MeshPhongMaterial({color: 0x5500ff, side: THREE.DoubleSide})
    let plane = new THREE.Mesh(geometry, material);
    
    return plane
}

//MISO HUD STUFF

function drawVariableBar(context, canvas, health, maxHealth, colour) {
    context.clearRect(0, 0, canvas.width, canvas.height);
  
    // Draw the background
    context.fillStyle = "gray";
    context.fillRect(0, 0, canvas.width, canvas.height);
  
    // Draw the health portion
    const healthWidth = (health / maxHealth) * canvas.width;
    context.fillStyle = colour;
    context.fillRect(0, 0, healthWidth, canvasHealth.height);
  }
  
function setTextStyle(context){
    context.fillStyle = "white";
    context.font = "20px Comic Sans MS";
    context.strokeStyle = "white";
}

function drawScore(score){
    setTextStyle(contextScore);
    const stringScore = "Score: "+ score;
    contextScore.strokeText(stringScore, 10, 20);
    contextScore.fillText(stringScore, 10, 20);
}

function drawTime(){
    contextTime.clearRect(0, 0, canvasTime.width, canvasTime.height);
    setTextStyle(contextTime);
    const stringTime = updateCountdown();
    contextTime.strokeText(stringTime, 10, 20);
    contextTime.fillText(stringTime, 10, 20);
}

function setBarNumber(){
    if(playerHunger > 0){
        playerHunger = Math.max(0, playerHunger - 0.15);
    }
    if(playerHunger <= 0){
        playerHealth = Math.max(0, playerHealth - 0.05);
    }
    //console.log(playerHunger);
    drawVariableBar(contextHealth, canvasHealth, playerHealth, maxHealth, "green");
    drawVariableBar(contextHunger, canvasHunger, playerHunger, maxHunger, "orange");  
}

function updateCountdown() {
    const currentTime = new Date().getTime();
    const timeRemaining = endTime - currentTime;

    if (timeRemaining <= 0) {
      clearInterval(interval);
      return 'Countdown expired!';
      //document.getElementById('time').innerHTML = 'Countdown expired!';
    } else {
      const minutes = Math.floor((timeRemaining / 1000) / 60);
      const seconds = Math.floor((timeRemaining / 1000) % 60);
      `Time remaining: ${minutes} minutes ${seconds} seconds`
      return `Time: 0${minutes}: ${seconds}`;
    }
}

// ================================================================================================

// M A I N ========================================================================================

//Scene elements
scene.add(ambientLight)
//scene.add(health)

directionalLight.position.set(0, 10, 0)
scene.add(directionalLight)
directionalLight.castShadow = true

ground = addPlane()
ground.position.y = -2
ground.rotation.set(90, 0, 0)
scene.add(ground)
//Test cube as player for now
player = addCube()
scene.add(skyBox)
scene.add(player)

//Set camera pos
camera.position.set(0, 1, 5)
// Call this whenever the player's health changes

//=============================================================
//MISO STUFF



// Example of updating the health bar
// Maximum hunger

// Call this whenever the player's health changes
drawScore(80);
canvasHealth.style.position = "absolute";
canvasHealth.style.top = "10px";
canvasHealth.style.left = "200px";

canvasScore.style.position = "absolute";
canvasScore.style.top = "10px";
canvasScore.style.left = "10px";

canvasTime.style.position = "absolute";
canvasTime.style.top = "10px";
canvasTime.style.right = "20px";

canvasHunger.style.position = "absolute";
canvasHunger.style.top = "60px";
canvasHunger.style.left = "200px";
//====================================================================

//Call function
animate()
addKeyListener()

// ================================================================================================