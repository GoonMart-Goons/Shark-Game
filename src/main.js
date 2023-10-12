import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

import { setBarNumber, drawTime, initHUD } from './components/hud';
import { addPlane, planeGrid } from './components/terrain';

//G L O B A L   V A R I A B L E S =================================================================
//Camera and scene setup
let camera, scene, renderer, controls, oceanFloor
let movementArr = [false, false, false, false] //Up, Down, Left, Right
let raycaster

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const col = new THREE.Color();


// ================================================================================================

// F U N C T I O N S ==============================================================================
//Initialize scene
function init(){
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.y = 10

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xaaccff)
    scene.fog = new THREE.Fog(0x1010ff, 0, 750)

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
    //Keydown = active input 
    window.addEventListener('keydown', onKeyDown)
    //When key is released, input !active
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

document.addEventListener( 'keydown', onKeyDown );
document.addEventListener( 'keyup', onKeyUp );

//Animation functions
function animate() {
    requestAnimationFrame(animate)

    //HUD element updates
    setBarNumber()
    drawTime()
    const time = performance.now()

    if (controls.isLocked === true) {
        raycaster.ray.origin.copy(controls.getObject().position)
        raycaster.ray.origin.y -= 10

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