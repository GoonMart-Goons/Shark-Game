import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui';


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

//Plane constants
const planeX = 500;
const planeY = 500;
const loader = new THREE.TextureLoader();
const height = loader.load('/map.jpg');
const texture = loader.load('/mountain.jpg');
const alpha = loader.load('/map.jpg');

//Debug
const gui = new dat.GUI();
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
    /*let geometry = new THREE.PlaneGeometry(planeX, planeY)
    let material = new THREE.MeshPhongMaterial({color: 0x5500ff, side: THREE.DoubleSide})
    let plane = new THREE.Mesh(geometry, material);
    
    return plane*/

    const groundGeo = new THREE.PlaneGeometry(planeX, planeY, 64, 64);
    const material = new THREE.MeshStandardMaterial({
        color: 'brown',
        map: texture,
        displacementMap: height,
        displacementScale: 30,
        alphaMap: alpha,
        transparent: true,
        opacity: 3
        //depthTest: false
    });

    const plane = new THREE.Mesh(groundGeo, material);

    return plane;
}

function planeGrid() {
    const group = new THREE.Group(); // Create a group to hold the planes

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const ground = addPlane();
            ground.position.x = i * planeX;
            ground.position.y = j * planeY;
            //ground.position.y = -0.2 * j * planeY;
            //ground.rotation.set(162, 0, 0);
            group.add(ground); // Add the individual plane to the group
        }
    }

    return group; // Return the group containing all the planes
}


// ================================================================================================

// M A I N ========================================================================================

//Scene elements
scene.add(ambientLight)

directionalLight.position.set(0, 10, 0)
scene.add(directionalLight)
directionalLight.castShadow = true

const oceanFloor = addPlane() //planeGrid();
//oceanFloor.position.y = -2
//oceanFloor.position.x = -planeX/2
oceanFloor.position.y = -150 //planeY
oceanFloor.rotation.set(162, 0, 0)
//oceanFloor.position.y = planeY
scene.add(oceanFloor); // Add the entire grid of planes to your Three.js scene



//Test cube as player for now
player = addCube()
scene.add(player)

//Set camera pos
camera.position.set(0, 1, 5)

//Debug
gui.add(oceanFloor.rotation, 'x').min(0).max(180);
gui.add(oceanFloor.rotation, 'y').min(0).max(180);
gui.add(oceanFloor.rotation, 'z').min(0).max(180);



//Call function
animate()
addKeyListener()

// ================================================================================================