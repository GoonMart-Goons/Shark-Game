import * as THREE from 'three';
// import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { PointerLockControls } from '../modules/PointerLockControls';

import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';

import {score, updateScore, updateHunger, updateHealth, setBarNumber, activeGame} from './components/gameLogic';

import { drawBars, drawTime, drawScore, initHUD } from './components/hud';
import { addPlane, planeGrid } from './components/terrain';

//G L O B A L   V A R I A B L E S =================================================================
//Camera and scene setup
let camera, scene, renderer, controls, oceanFloor, physicsWorld, cube, cubeBody, cannonDebugger
let movementArr = [false, false, false, false] //Up, Down, Left, Right
let raycaster, terrainRaycaster, terrainRaycasterDirection

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const col = new THREE.Color();
const timeStep = 1 / 200;

// ================================================================================================

// F U N C T I O N S ==============================================================================

//Temporary player 
function addCube(){
    let geometry = new THREE.BoxGeometry(10, 10, 10)
    let material = new THREE.MeshPhongMaterial({color: 0x55aaff})
    let cube = new THREE.Mesh(geometry, material)

    return cube
}


//Initialize scene
function init(){
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.y = 10

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xaaccff)
    scene.fog = new THREE.Fog(0x1010ff, 0, 750)

    physicsWorld = new CANNON.World()
    physicsWorld.gravity.set(0, -9.81, 0)
    cannonDebugger = new CannonDebugger(scene, physicsWorld)

    renderer = new THREE.WebGLRenderer()
    // renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth / window.innerHeight)
    document.body.appendChild(renderer.domElement)

    const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 2.5)
    light.position.set(0.5, 1, 0.75)
    scene.add(light)

    //For player movement
    controls = new PointerLockControls(camera, renderer.domElement)
    // controls.lock()
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

    scene.add(controls.getObject())

    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10)

    terrainRaycaster = new THREE.Raycaster()
    terrainRaycasterDirection = new THREE.Vector3(0, -1, 0) // Downward direction

    // Cube
    cube = addCube()
    cube.position.set(0, 0, 0) // Initialize the position
    cube.rotation.set(0, 0, 0)
    scene.add(cube)

    const cubeShape = new CANNON.Box(new CANNON.Vec3(5, 5, 5)) // Adjust the size as needed
    cubeBody = new CANNON.Body({ mass: 1, material: new CANNON.Material() })
    cubeBody.addShape(cubeShape)
    cubeBody.position.set(20, 100, -170) // Set the initial position of the cube
    physicsWorld.addBody(cubeBody)

    //Ocean floor
    oceanFloor = addPlane()
    oceanFloor.position.y = -150
    oceanFloor.rotation.set(162, 0, 0)
    scene.add(oceanFloor)

    window.addEventListener('resize', onWindowResize)
    addKeyListener()

    //HUD elements
    initHUD()
}

//Allows code to listen for keyboard input
function addKeyListener(){
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
}

//Handles player movement on key events
//When you press the keys
const onKeyDown = function(event) {
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
            updateScore("smallFish") //-----REMOVE-----
            break
        case 'ArrowDown':
        case 'KeyS':
            movementArr[1] = false
            updateHealth("bomb") //-----REMOVE-----
            break
        case 'ArrowLeft':
        case 'KeyA':
            movementArr[2] = false
            updateHealth("healthBoost") //-----REMOVE-----
            break
        case 'ArrowRight':
        case 'KeyD':
            movementArr[3] = false
            updateHunger("bigFish") //-----REMOVE-----
            break
    }
}

document.addEventListener( 'keydown', onKeyDown );
document.addEventListener( 'keyup', onKeyUp );

//Animation functions
function animate() {
    requestAnimationFrame(animate)

    //HUD element updates
    setBarNumber()
    drawBars()
    drawTime()
    drawScore(score)

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

    //Cube animation
    physicsWorld.step(timeStep);

    // Update Three.js objects based on Cannon.js body positions
    cube.position.copy(cubeBody.position);
    //player.rotation.copy(cubeBody.quaternion.setFromEuler(new CANNON.Vec3(0, 0, 0), 'XYZ'));
    // Convert the Cannon.js quaternion to Three.js quaternion
    const cannonQuaternion = cubeBody.quaternion.clone(); // Clone the Cannon.js quaternion
    const threeQuaternion = new THREE.Quaternion(
    cannonQuaternion.x,
    cannonQuaternion.y,
    cannonQuaternion.z,
    cannonQuaternion.w
    );

    // Set the Three.js player's rotation
    cube.rotation.setFromQuaternion(threeQuaternion);

    // Set the ray's origin to the player's current position
    terrainRaycaster.ray.origin.copy(cube.position);

    // Set the ray's direction
    terrainRaycaster.ray.direction.copy(terrainRaycasterDirection);

    // Set the maximum distance the ray can travel (adjust this according to your scene's scale)
    const maxRayDistance = 25; // Adjust as needed
    terrainRaycaster.far = maxRayDistance;

    // Perform the raycasting
    const intersections = terrainRaycaster.intersectObject(oceanFloor);

    // Check if there are any intersections
    if (intersections.length > 0) {
        // There is a collision with the terrain (oceanFloor)
        cubeBody.velocity.y = 0;
    } else {
        // No collision, you can continue updating the player's position
        cubeBody.velocity.y = -9.81;
    }

    cannonDebugger.update();

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