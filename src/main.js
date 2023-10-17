import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PointerLockControls } from '../modules/PointerLockControls';

import { setBarNumber, drawTime, initHUD } from './components/hud';
import { addPlane } from './components/terrain';
import { initFish, animateFish } from './components/fish';
import { updateScore} from './components/gameLogic';
import { playBackgroundMusic, playBite, addSounds } from './components/sound';
import { addSkyBox } from './components/skybox';

//G L O B A L   V A R I A B L E S =================================================================
//Camera and scene setup
let camera, scene, renderer, controls
let oceanFloor, player, fish, world, playerHB, fishHB, skyBox
let movementArr = [false, false, false, false] //Up, Down, Left, Right

let fishArray = []; // An array to store fish objects
let fishHBArray = []
const numFish = 20; // Number of fish in the environment

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const col = new THREE.Color();


// ================================================================================================

// F U N C T I O N S ==============================================================================
//Initialize scene
function init(){
    //CANNON world for physics
    world = new CANNON.World()

    //Camera init & settings
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000)
    // camera.position.y = 10
    const gameContainer = document.getElementById('game-container');

    //Scene init
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xaaccff)
    scene.fog = new THREE.Fog(0x99bbff, 0, 750)

    //Renderer init
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth / window.innerHeight)
    //document.body.appendChild(renderer.domElement)
    gameContainer.appendChild(renderer.domElement)

    //Light source
    const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 20)
    light.position.set(0.5, 1, 0.75)
    scene.add(light)

    //For player movement
    controls = new PointerLockControls(camera, renderer.domElement)
    // Add an event listener for when the pointer is locked
    controls.addEventListener('lock', () => {
        console.log('Pointer is now locked.')
    })

    // Add an event listener for when the pointer is unlocked
    controls.addEventListener('unlock', () => {
        console.log('Pointer is now unlocked.')
    })

    // Lock the pointer when the user clicks on the renderer
    renderer.domElement.addEventListener('click', () => {
        controls.lock()
    })

    //Make player object child of camera + add them to scene
    player = addCube()
    player.position.set(0, -1, -2)
    
    const offset = controls.getObject().position.add(new THREE.Vector3(0, -1, -2))
    playerHB = addCubeHB(offset)
    //Collision detection with fish
    playerHB.addEventListener("collide", function(event){
        if(event.body === fishHB){
            updateScore('bigFish')
            playBite()
            fish.material.color.set('red')
        }

        if(fishHBArray.includes(event.body)){
            const fishIdx = fishHBArray.indexOf(event.body)
            updateScore('smallFish')
            playBite()
            fishArray[fishIdx].material.color.set('red')
        }
    }) 

    controls.getObject().add(player)
    scene.add(controls.getObject())
    world.addBody(playerHB)

    //Add fish to random parts of the world
    fish = addCube()
    fish.position.set(3, 2, 5)
    fishHB = addCubeHB(fish.position)
    fish.material.color.set('green')
    scene.add(fish)
    world.addBody(fishHB)

    //Ocean floor
    oceanFloor = addPlane()
    oceanFloor.position.y = -250
    oceanFloor.rotation.set(162, 0, 0)
    scene.add(oceanFloor)

    //Skybox
    skyBox = addSkyBox()
    scene.add(skyBox)

    //For debugging
    // debugRenderer = new THREE.CannonDebugRenderer(scene, world)

    window.addEventListener('resize', onWindowResize)


    addKeyListener()

    //HUD elements
    initHUD()
    onWindowResize()

    //Add sounds to game
    addSounds(camera)
    

    //Init fish
    initFish(fishArray, numFish)

    for(var i = 0; i < numFish; i++){
        scene.add(fishArray[i])
        const fshHB = addCubeHB(fishArray[i].position)
        fishHBArray.push(fshHB)
        world.addBody(fishHBArray[i])
    }
}

//Allows code to listen for keyboard input
function addKeyListener(){
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    //MISO's code
    window.addEventListener('g', playBite)
}

//Handles player movement on key events
//When you press the keys
const onKeyDown = function(event) {
    playBackgroundMusic()
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            movementArr[0] = true
            break
        case 'ArrowDown':
        case 'KeyS':
            movementArr[1] = true
            break
        case 'ArrowLeft':
        case 'KeyA':
            movementArr[2] = true
            break
        case 'ArrowRight':
        case 'KeyD':
            movementArr[3] = true
            break
    }
}
//When you let go of the keys
const onKeyUp = function(event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            movementArr[0] = false
            break
        case 'ArrowDown':
        case 'KeyS':
            movementArr[1] = false
            break
        case 'ArrowLeft':
        case 'KeyA':
            movementArr[2] = false
            break
        case 'ArrowRight':
        case 'KeyD':
            movementArr[3] = false
            break
    }
}

document.addEventListener('keydown', onKeyDown)
document.addEventListener('keyup', onKeyUp) 

function addCube(){
    const geom = new THREE.BoxGeometry(1, 1, 1)
    const mat = new THREE.MeshBasicMaterial({color: 0x7788ff})
    const cube = new THREE.Mesh(geom, mat)

    return cube
}

function addCubeHB(objPosision){
    const cubeHB = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
    })
    cubeHB.position.copy(objPosision)

    return cubeHB
}

//Animation functions
function animate() {
    requestAnimationFrame(animate)

    //HUD element updates
    setBarNumber()
    drawTime()

    //Camera movement 
    const time = performance.now()
    if (controls.isLocked === true) {

        const delta = (time - prevTime) / 1000

        velocity.x -= velocity.x * 10.0 * delta
        velocity.z -= velocity.z * 10.0 * delta
        velocity.y -= 9.8 * 100.0 * delta // 100.0 = mass

        direction.z = Number( movementArr[0] ) - Number( movementArr[1] )
        direction.x = Number( movementArr[3] ) - Number( movementArr[2] )
        direction.normalize() // this ensures consistent movements in all directions

        if (movementArr[0] || movementArr[1]) 
            velocity.z -= direction.z * 400.0 * delta
        if (movementArr[2] || movementArr[3])
            velocity.x -= direction.x * 400.0 * delta

        controls.moveRight(-velocity.x * delta)
        controls.moveForward(-velocity.z * delta)
    }
    prevTime = time

    if(controls.getObject().position.x > 450)
        controls.getObject().position.x = 450
    if(controls.getObject().position.x < -450)
        controls.getObject().position.x = -450

    if(controls.getObject().position.y > 175)
        controls.getObject().position.y = 175
    if(controls.getObject().position.y < -175)
        controls.getObject().position.y = -175

    if(controls.getObject().position.z > 450)
        controls.getObject().position.z = 450
    if(controls.getObject().position.z < -450)
        controls.getObject().position.z = -450
    playerHB.position.copy(controls.getObject().position) //Player hit box

    //Move fish
    animateFish(fishArray)

    world.step(1 / 60)

    // console.log("rotation =", player.rotation)
    // console.log("position =", player.position)
    // console.log("controls =", controls.getObject().position)
    // console.log("player =", player.position)
    

    // debugRenderer.update()
    renderer.render(scene, camera)
}

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

window.addEventListener('resize', onWindowResize)

// ================================================================================================

// M A I N ========================================================================================

//Call functions
init()
animate()

// ================================================================================================