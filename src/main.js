import * as THREE from 'three';
import { FlyControls } from '../modules/FlyControls';
import { FirstPersonControls } from '../modules/FirstPersonControls';

//G L O B A L   V A R I A B L E S =================================================================
//Camera and scene setup
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)
let controls //For camera movement

let mouseMoved = false //For camera rotations
let keydown = false //For movement

//Components
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1)
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 5)
let player
let ground //Placeholder for now

//For movement
// const playerSpeed = 0.0325
// const playerPos = new THREE.Vector3(0, 0, 0)
// const playerDir = new THREE.Vector3()
// ================================================================================================

// F U N C T I O N S ==============================================================================
//Initialize scene
function init(){
    //Camera controller
    controls = new FirstPersonControls(camera, renderer.domElement)
    controls.movementSpeed = 0.25

    //Scene elements
    //Lights
    scene.add(ambientLight)

    directionalLight.position.set(0, 10, 0)
    scene.add(directionalLight)
    directionalLight.castShadow = true

    //Ground + Player
    ground = addPlane()
    ground.position.y = -.5
    ground.rotation.set(Math.PI/2, 0, 0)
    scene.add(ground)
    //Test cube as player for now
    player = addCube()
    scene.add(player)
    // camera.add(player)
    player.position.set(0, 0, -10)
}

//Animation functions
function animate(){
    requestAnimationFrame(animate)

    if(mouseMoved){
        controls.lookSpeed = 0.005
        controls.update(0.5)
        mouseMoved = false
    }
    controls.lookSpeed = 0


    if(keydown)
        controls.update(0.5)

    renderer.render(scene, camera)
}

//Only change camera position when mouse is moved
document.addEventListener('mousemove', () => {
    mouseMoved = true
})

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
        case 's':
        case 'ArrowDown':
        case 'a':
        case 'ArrowLeft':
        case 'd':
        case 'ArrowRight':
            keydown = true
            break
    }
}
const handleKeyUp = (e) => {
    switch (e.key){
        case 'w':
        case 's':
        case 'ArrowUp':
        case 'ArrowDown':
        case 'a':
        case 'd':
        case 'ArrowLeft':
        case 'ArrowRight':
            keydown = false
            break
    }
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

// ================================================================================================

// M A I N ========================================================================================

//Call functions
init()
animate()
addKeyListener()

// ================================================================================================