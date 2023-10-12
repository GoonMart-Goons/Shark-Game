import * as THREE from 'three';
import { FlyControls } from '../modules/FlyControls';
import { FirstPersonControls } from '../modules/FirstPersonControls';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';
import * as dat from 'dat.gui';

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
const playerSpeed = 0.0325
const playerPos = new THREE.Vector3(0, 0, 0)
const playerDir = new THREE.Vector3(0, 0, 0)

//Plane constants
const planeX = 1000;
const planeY = 1000;
const loader = new THREE.TextureLoader();
const height = loader.load('/Noisemaps.png');
const texture = loader.load('/mountain.jpg');
const alpha = loader.load('/Noisemaps.png');

//Physics

// Create a Cannon.js world
const timeStep = 1 / 200;
const world = new CANNON.World();
world.gravity.set(0, -9.81, 0);

//Raycasting
const raycaster = new THREE.Raycaster();
const raycastDirection = new THREE.Vector3(0, -1, 0); // Downward direction


const cannonDebugger = new CannonDebugger(scene, world)
//cannonDebugger.enable();
let terrainData


//Debug
const gui = new dat.GUI();
// ================================================================================================

// F U N C T I O N S ==============================================================================


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

//Keeps cam following the player with some offset
function camFollowPlayer(){
    const camOffset = new THREE.Vector3(0, 1, 5)
    let newCamPos = playerPos.clone().add(camOffset)

    camera.position.lerp(newCamPos, 0.2)
}


//Makes a cube
function addCube(){
    let geometry = new THREE.BoxGeometry(10, 10, 10)
    let material = new THREE.MeshPhongMaterial({color: 0x55aaff})
    let cube = new THREE.Mesh(geometry, material)

    return cube
}

//Make a plane [ground]
function addPlane(){

    const groundGeo = new THREE.PlaneGeometry(planeX, planeY, 64, 64);
    const material = new THREE.MeshStandardMaterial({
        color: 'brown',
        map: texture,
        displacementMap: height,
        displacementScale: 40,
        alphaMap: alpha,
        transparent: true,
        opacity: 3
        //depthTest: false
    });

    const plane = new THREE.Mesh(groundGeo, material);

    return plane;
}


// ================================================================================================

// M A I N ========================================================================================

//Physics
// Physics materials

const cubeMaterial = new CANNON.Material();


// Cube
const cubeShape = new CANNON.Box(new CANNON.Vec3(5, 5, 5)); // Adjust the size as needed
const cubeBody = new CANNON.Body({ mass: 1, material: cubeMaterial });
cubeBody.addShape(cubeShape);
cubeBody.position.set(20, 5, -170); // Set the initial position of the cube
world.addBody(cubeBody);



//Scene elements
scene.add(ambientLight)

directionalLight.position.set(0, 10, 0)
scene.add(directionalLight)
directionalLight.castShadow = true

const oceanFloor = addPlane() //planeGrid();
//oceanFloor.position.y = -2
oceanFloor.position.z = -planeX/2
oceanFloor.position.y = -50// planeY
oceanFloor.rotation.set(162, 0, 0)
//oceanFloor.position.y = planeY
scene.add(oceanFloor); // Add the entire grid of planes to your Three.js scene

//Test cube as player for now
player = addCube()
player.position.set(0, 0, 0); // Initialize the position
player.rotation.set(0, 0, 0);
scene.add(player)

//Set camera pos
camera.position.set(0, 1, 5)

//Debug
/*gui.add(oceanFloor.rotation, 'x').min(0).max(180);
gui.add(oceanFloor.rotation, 'y').min(0).max(180);
gui.add(oceanFloor.rotation, 'z').min(0).max(180);*/

//Animation functions
function animate() {
    requestAnimationFrame(animate);

    // Update physics simulation
    world.step(timeStep);

    // Player movement
    playerPos.addScaledVector(playerDir, playerSpeed);
    player.position.copy(playerPos);
    camFollowPlayer();

    // Update Three.js objects based on Cannon.js body positions
    player.position.copy(cubeBody.position);
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
    player.rotation.setFromQuaternion(threeQuaternion);
    
    // Set the ray's origin to the player's current position
    raycaster.ray.origin.copy(player.position);

    // Set the ray's direction
    raycaster.ray.direction.copy(raycastDirection);

    // Set the maximum distance the ray can travel (adjust this according to your scene's scale)
    const maxRayDistance = 20; // Adjust as needed
    raycaster.far = maxRayDistance;

    // Perform the raycasting
    const intersections = raycaster.intersectObject(oceanFloor);

    // Check if there are any intersections
    if (intersections.length > 0) {
        // There is a collision with the terrain (oceanFloor)
        // You can handle the collision here, e.g., by stopping the player's downward movement
        //playerDir.y = 0; // Set the player's vertical movement to 0 to prevent falling through the terrain
        cubeBody.velocity.y = 0;
        //cubeBody.position.copy(player.position);
        //world.gravity.set(0, 0, 0);
        //console.log("intersecting")
        //cubeBody.mass = 0;
    } else {
        // No collision, you can continue updating the player's position
        //playerDir.y = -0.5; // Apply gravity to the player (if needed)
        cubeBody.velocity.y = -9.81;
        //console.log("not")
        //world.gravity.set(0, -9.81, 0);
        //cubeBody.mass = 1;
    }


    cannonDebugger.update();

    renderer.render(scene, camera);
}

//Call function
animate()
//renderer.setAnimationLoop(animate)
addKeyListener()

// ================================================================================================