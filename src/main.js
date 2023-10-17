import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PointerLockControls } from '../modules/PointerLockControls';
import * as YUKA from 'yuka'; // Import the YUKA library
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';//fish 3d model helper
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';//fish 3d model helper

// Import any other required dependencies here, if any


import { setBarNumber, drawTime, initHUD, drawScore } from './components/hud';
import { addPlane, planeGrid } from './components/terrain';
import { initFish, animateFish} from './components/fish';

//G L O B A L   V A R I A B L E S =================================================================
//Camera and scene setup
let camera, scene, renderer, controls, oceanFloor, player, fish, physicsWorld, cube, cubeBody, cannonDebugger
let world, playerHB, fishHB
let movementArr = [false, false, false, false] //Up, Down, Left, Right
var debugRenderer

let fishArray = []; // An array to store fish objects
let vehicleArray = []// vehicle array
const numFish = 50; // Number of fish in the environment

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const col = new THREE.Color();

//assists with animations
let entityManager = new YUKA.EntityManager();
let time2 = new YUKA.Time()

// ================================================================================================

// F U N C T I O N S ==============================================================================
//assists with animations
function sync (entity, renderComponent) {
    renderComponent.matrix.copy(entity.worldMatrix);
}
//Initialize scene
function init(){
    //CANNON world for physics
    world = new CANNON.World()

    //Camera init & settings
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000)
    // camera.position.y = 10

    //Scene init
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xaaccff)
    scene.fog = new THREE.Fog(0x1010ff, 0, 750)

    //Renderer init
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth / window.innerHeight)
    document.body.appendChild(renderer.domElement)

    //Light source
    const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 2.5)
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
    
    playerHB = addCubeHB(controls.getObject().position)
    //Collision detection with fish
    playerHB.addEventListener("collide", function(event){
        if(event.body === fishHB){
            console.log('Hey, you hit me!')
            fish.material.color.set('red')
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
    oceanFloor.position.y = -150
    oceanFloor.rotation.set(162, 0, 0)
    scene.add(oceanFloor)

    //For debugging
    // debugRenderer = new THREE.CannonDebugRenderer(scene, world)

    window.addEventListener('resize', onWindowResize)
    addKeyListener()

    //HUD elements
    initHUD()
    onWindowResize()

    //Init fish
    const loader = new GLTFLoader ();
    let mixer;
    loader.load(' ./assets/fish.glb', function (glb){
        const model = glb.scene;
        const clips = glb.animations;

        for (let i = 0; i < numFish; i++) {
            const fishClone = SkeletonUtils.clone(model);
            fishArray.push(fishClone);
        }
        for(var i = 0; i < numFish; i++){
            scene.add(fishArray[i])


            //attempt to animate fish in world
            vehicleArray.push(new YUKA.Vehicle());
            vehicleArray[i].setRenderComponent(fishArray[i], sync) ;

            vehicleArray[i].maxSpeed = 5; // Change 5 to your desired speed

            const wanderBehavior = new YUKA.WanderBehavior();
            wanderBehavior.weight = 0.7; // Increase the weight to make the behavior more prominent
            vehicleArray[i].steering.add(wanderBehavior);


            entityManager.add(vehicleArray[i]) ;
            //vehicleArray[i].rotation.fromEuler(0, 2 * Math.PI * Math.random(),0);
            vehicleArray[i].fishRotation = new YUKA.Quaternion();
            vehicleArray[i].position.x=Math.random() * 1000 - 500;
            vehicleArray[i].position.y=Math.random() * 1000 - 500;
            vehicleArray[i].position.z=Math.random() * 200 - 150;

        }

    });


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

    playerHB.position.copy(controls.getObject().position)

    //Move fish
    const delta2 = time2.update().getDelta();
    for (let i = 0; i < numFish; i++) {
        vehicleArray[i].update(delta2); // Update the YUKA vehicle
        fishArray[i].position.copy(vehicleArray[i].position); // Update the fish's position
        // Update the fish's rotation to match the YUKA vehicle's orientation
        fishArray[i].quaternion.copy(vehicleArray[i].rotation);


    }


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