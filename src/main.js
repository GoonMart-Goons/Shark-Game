import * as THREE from 'three';
import { FlyControls } from '../modules/FlyControls';
import { FirstPersonControls } from '../modules/FirstPersonControls';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';

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
const playerDir = new THREE.Vector3()

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

//Makes a cube
function addCube(){
    let geometry = new THREE.BoxGeometry(1, 1, 1)
    let material = new THREE.MeshPhongMaterial({color: 0x55aaff})
    let cube = new THREE.Mesh(geometry, material)

    return cube
}

//Make a plane [ground]
function addPlane(){
    /*let geometry = new THREE.PlaneGeometry(15, 15)
    let material = new THREE.MeshPhongMaterial({color: 0x5500ff, side: THREE.DoubleSide})
    let plane = new THREE.Mesh(geometry, material);
    
    return plane*/

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

// Extract the height data from the pixel data
/*function extractHeightData(context, width, height) {
  const terrainData = [];
  const data = context.getImageData(0, 0, width, height).data;

  const yourHeightRange = 1.0;

  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      // Since heightmap textures typically use grayscale, we can use a single channel (red)
      const index = (i + j * width) * 4;
      const red = data[index];
      // Map the grayscale value (0-255) to your desired height range
      const heightValue = (red / 255) * yourHeightRange; // Replace with your actual height range
      terrainData.push(heightValue);

      // Debugging: Log the extracted height value
      console.log(`Pixel at (${i}, ${j}): Red=${red}, Height=${heightValue}`);

    }
  }

  return terrainData;
}

// Define a function to handle heightmap loading
function handleHeightmapLoad() {
    // Access the image data (pixels)
    const imageData = height.image;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    context.drawImage(imageData, 0, 0, canvas.width, canvas.height);
  
    // Extract the height data from the pixel data
    terrainData = extractHeightData(context, canvas.width, canvas.height);
  
    // Now you can create the Cannon.js heightfield with terrainData
    const terrainShape = new CANNON.Heightfield(terrainData, {
      elementSize: 1, // Adjust this based on your terrain scale
    });
  
    // Create the Cannon.js body for the terrain and add it to the world
    const terrainBody = new CANNON.Body({ mass: 0 }); // Mass 0 because it's static
    terrainBody.addShape(terrainShape);
    terrainBody.position.copy(oceanFloor.position); // Match the position
    terrainBody.quaternion.copy(oceanFloor.quaternion); // Match the rotation
    world.addBody(terrainBody);
  }*/
  


// ================================================================================================

// M A I N ========================================================================================

//Physics
// Physics materials
const groundMaterial = new CANNON.Material();
const cubeMaterial = new CANNON.Material();

// Ground
/*const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
groundBody.addShape(groundShape);
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2); // Rotate the ground
world.addBody(groundBody);*/

// Cube
const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)); // Adjust the size as needed
const cubeBody = new CANNON.Body({ mass: 1, material: cubeMaterial });
cubeBody.addShape(cubeShape);
cubeBody.position.set(0, 5, -10); // Set the initial position of the cube
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

// Check if the heightmap image is already loaded
/*if (height.image) {
    // If it's already loaded, call the handler immediately
    handleHeightmapLoad();
  } else {
    // If it's not loaded yet, set the onload event handler
    height.image.onload = handleHeightmapLoad;
  }*/


//Test cube as player for now
player = addCube()
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
    player.rotation.copy(cubeBody.quaternion);
    cannonDebugger.update();

    renderer.render(scene, camera);
}

//Call function
animate()
//renderer.setAnimationLoop(animate)
addKeyListener()

// ================================================================================================