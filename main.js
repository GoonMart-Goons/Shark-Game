import * as THREE from '/node_modules/three';
import * as CANNON from '/node_modules/cannon-es';

import { PointerLockControls } from '/modules/PointerLockControls';
import * as YUKA from '/node_modules/yuka'; // Import the YUKA library
import {GLTFLoader} from '/node_modules/three/examples/jsm/loaders/GLTFLoader';//fish 3d model helper
import * as SkeletonUtils from '/node_modules/three/examples/jsm/utils/SkeletonUtils';

import { setBarNumber, drawTime, initHUD, incPlayerHealth, updateCountdown } from './components/hud';
import { addPlane } from './components/terrain';
import { playBackgroundMusic, playBite, addSounds, playExplosion } from './components/sound';
import { addSkyBox } from './components/skybox';
import { addNavalMine } from './components/mine';
import {addCoralGroup1} from './components/coral';

import { updateScore} from './components/gameLogic';
import { initLevel } from './components/levelManager';
import { pauseGameTrigger, resumeGameTrigger } from './components/gameEvents';

//G L O B A L   V A R I A B L E S =================================================================
//Camera and scene setup
let camera, scene, renderer, controls
let oceanFloor, player, fish, world, playerHB, fishHB, skyBox
let movementArr = [false, false, false, false] //Up, Down, Left, Right
let isRunning = true

let fishArray = [], mineArray = []; // An array to store fish objects
let fishHBArray = [], mineHBArray = []
let vehicleArray = []// vehicle array
var numFish, numMines // Number of fish in the environment

let level = 2 //level to load

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

//assists with animations
let entityManager
let time2

// F U N C T I O N S ==============================================================================
//assists with animations
function sync (entity, renderComponent) {
    renderComponent.matrix.copy(entity.worldMatrix);
}
let mixer

//Get fish and mine numbers
export function setGameSettings(fishNum, mineNum){
    numFish = fishNum
    numMines = mineNum
}

//Initialize scene
function init(){
    initLevel(level)
    console.log('Level:', level)
    console.log('Num Fish:', numFish)
    console.log('Num Mines:', numMines)
    
    isRunning = true

    //CANNON world for physics
    world = new CANNON.World()

    //Camera init & settings
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000)
    const gameContainer = document.getElementById('game-container');

    //Scene init
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xaaccff)
    scene.fog = new THREE.Fog(0x99bbff, 0, 750);    

    //Renderer init
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth / window.innerHeight)
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

    const loader1 = new GLTFLoader();
    loader1.load(' ./assets/megalodon/source/high_quality_shark_animation.glb',function (gltf){
        const model = gltf.scene;
        // Play the animation

        const sharkClone = SkeletonUtils.clone(model);
        player=sharkClone;
        player.position.set(0,-0.4,-5.7);
        player.scale.set(0.4,0.4,0.4);
        player.rotateY(Math.PI);
        //Create a new material with the desired color and reflectivity properties
        const material = new THREE.MeshStandardMaterial({
            color: 0x555566,  // Set the color (red in this example)
            roughness: 0.5,   // Adjust the roughness (0.0 to 1.0)
            metalness: 0.3   // Adjust the metalness (0.0 to 1.0)
        });

        // Assign the new material to the model
        sharkClone.traverse(function (child) {
            if (child.isMesh) {
                child.material = material;
            }
        });
        mixer = new THREE.AnimationMixer(sharkClone);
        const clips = gltf.animations;
        const clip = THREE.AnimationClip. findByName (clips, 'swimming');
        const action = mixer.clipAction(clip);
        action.play();
        // Play the animation
        camera.add(sharkClone);
        animate();

        //scene.add(sharkClone);
    });
    
    //Make player object child of camera + add them to scene    
    const offset = controls.getObject().position.add(new THREE.Vector3(0,-1,-2))
    playerHB = addCubeHB(offset)
    //Collision detection with fish
    playerHB.addEventListener("collide", function(event){
        if(fishHBArray.includes(event.body)){
            const fishIdx = fishHBArray.indexOf(event.body)
            updateScore('smallFish')
            playBite()
            handleFishEaten(fishIdx)
            // fishArray[fishIdx].material.color.set('red')
        }

        if(mineHBArray.includes(event.body)){
            const mineIdx = mineHBArray.indexOf(event.body)
            playExplosion()
            mineArray[mineIdx].visible = false
            mineHBArray[mineIdx] = null
            incPlayerHealth(-30)
        }
    })
    controls.getObject().add(player)
    scene.add(controls.getObject())
    world.addBody(playerHB)

    //Ocean floor
    oceanFloor = addPlane()
    oceanFloor.rotateX(-Math.PI/2)
    oceanFloor.position.y = -230
    scene.add(oceanFloor)

    //Add coral 
    for (let i = 0; i < 7; i++) {
            // Generate random X and Y positions within the scene dimensions
            const randomX = Math.floor(Math.random() * 900) - 450;
            const randomZ = Math.floor(Math.random() * 900) - 450;
            const randomScale = 1 + Math.random() * 2;

        
            // Create a coral and set its position
            const coral = addCoralGroup1(4, 9);
            coral.position.set(randomX, -210, randomZ);
            coral.scale.set(randomScale, randomScale, randomScale)
            scene.add(coral);
    }

    //Skybox
    skyBox = addSkyBox()
    scene.add(skyBox)
    
    //HUD elements
    initHUD()
    onWindowResize()
    addKeyListener()

    //Add sounds to game
    addSounds(camera)

    //Init fish
    fishArray = []
    fishHBArray = []
    entityManager = new YUKA.EntityManager();
    time2 = new YUKA.Time()
    const loader = new GLTFLoader ();
    loader.load(' ./assets/fish.glb', function (glb){
        const model = glb.scene;
        for (let i = 0; i < numFish; i++) {
            const fishClone = SkeletonUtils.clone(model);
            fishArray.push(fishClone);
        }
        for(var i = 0; i < numFish; i++){
            scene.add(fishArray[i])
            const fshHB = addCubeHB(fishArray[i].position)
            fishHBArray.push(fshHB)
            world.addBody(fishHBArray[i])


            //attempt to animate fish in world
            vehicleArray.push(new YUKA.Vehicle());
            vehicleArray[i].setRenderComponent(fishArray[i], sync) ;

            vehicleArray[i].maxSpeed = 10; // Change 5 to your desired speed

            const wanderBehavior = new YUKA.WanderBehavior();
            wanderBehavior.weight = 0.7; // Increase the weight to make the behavior more prominent
            vehicleArray[i].steering.add(wanderBehavior);

            entityManager.add(vehicleArray[i]) ;
            //vehicleArray[i].rotation.fromEuler(0, 2 * Math.PI * Math.random(),0);
            vehicleArray[i].fishRotation = new YUKA.Quaternion();
            vehicleArray[i].position.x=Math.random() * 500 - 250;
            vehicleArray[i].position.y=Math.random() * 250 - 125;
            vehicleArray[i].position.z=Math.random() * 500 - 250;
        }

    });

    mineArray = []
    mineHBArray = []
    for(var i = 0; i < numMines; i++){
        const navalMine = addNavalMine(5, 2, 0.6);
        navalMine.position.x = Math.random() * 1000 - 500
        navalMine.position.y = Math.random() * 250 - 125
        navalMine.position.z = Math.random() * 1000 - 500
        mineArray.push(navalMine)
        scene.add(mineArray[i]);
        mineHBArray.push(addCubeHB(mineArray[i].position))
        world.addBody(mineHBArray[i])
    }
}

//Allows code to listen for keyboard input
function addKeyListener(){
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    //MISO's code
    window.addEventListener('g', playExplosion)
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
        case 'Digit1':
            player.visible = true
            player.position.set(0, -2.5, -0.5)
            // controls.getObject().position.set(controls.getObject().position + new THREE.Vector3(0, 0, -4))
            break
        case 'Digit3':
            player.visible = true
            player.position.set(0, -0.4, -5.7)
            // controls.getObject().position.set(controls.getObject().position + new THREE.Vector3(0, 0, 4))
            break
    }
}

function handleFishEaten(eatenFishIndex) {
    // Respawn the eaten fish in a random location
    const newX = Math.random() * 500 - 250
    const newY = Math.random() * 250 - 125
    const newZ = Math.random() * 500 - 250

    vehicleArray[eatenFishIndex].position.set(newX, newY, newZ);
    fishArray[eatenFishIndex].position.copy(vehicleArray[eatenFishIndex].position)
    fishArray[eatenFishIndex].quaternion.copy(vehicleArray[eatenFishIndex].rotation)
    fishHBArray[eatenFishIndex].position.copy(fishArray[eatenFishIndex].position)
    console.log('Ate fish', eatenFishIndex)
}

function addCubeHB(objPosision){
    const cubeHB = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
    })
    cubeHB.position.copy(objPosision)
    return cubeHB
}

//Animation functions
const clock = new THREE.Clock()
function animate() {
    requestAnimationFrame(animate)
    const delta2 = time2.update().getDelta();
    const delta3 = clock.getDelta();
    
    if(isRunning){
        requestAnimationFrame(updateCountdown)
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
        if(controls.getObject().position.y < -175) //-175
            controls.getObject().position.y = -175

        if(controls.getObject().position.z > 450)
            controls.getObject().position.z = 450
        if(controls.getObject().position.z < -450)
            controls.getObject().position.z = -450
        playerHB.position.set(controls.getObject().position.x,controls.getObject().position.y,controls.getObject().position.z) //Player hit box
        //player.position.set(controls.getObject().position.x,controls.getObject().position.y,controls.getObject().position.z-4)//kudzai
        
        //Move fish
        
        for (let i = 0; i < numFish; i++) {
            vehicleArray[i].update(delta2); // Update the YUKA vehicle
            fishArray[i].position.copy(vehicleArray[i].position); // Update the fish's position
            // Update the fish's rotation to match the YUKA vehicle's orientation
            fishArray[i].quaternion.copy(vehicleArray[i].rotation);
            fishHBArray[i].position.copy(fishArray[i].position)
        }
        //shark animation
        
        if(mixer){
            mixer.update( delta3 );
        }

        world.step(1 / 60)

        renderer.render(scene, camera)
    }
}

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

// E V E N T   L I S T E N E R S ==================================================================
window.addEventListener('resize', onWindowResize)
document.addEventListener('keydown', onKeyDown)
document.addEventListener('keyup', onKeyUp) 

//When "Start" button pressed, run init()
const startGameBtn = document.getElementById('startButton')
startGameBtn.addEventListener('click', function(event){
    console.log('Start game button pressed')
    isRunning = true
    controls.getObject().position.set(0, 0, 0)
    console.log(controls.getObject())
    controls.getObject().rotation.y = 0
    controls.getObject().rotation.z = 0
    controls.getObject().rotation.x = 0
    player.position.set(0, -0.4, -5.7)
    initLevel(level)
    initHUD()
})

const pauseBtn = document.getElementById('pauseBtn')
pauseBtn.addEventListener('click', function(event){
    pauseGameTrigger()
    isRunning = false
    console.log('Is running:', isRunning)
})
const resumeBtn = document.getElementById('menu-resume')
resumeBtn.addEventListener('click', function(event){
    resumeGameTrigger()
    isRunning = true
    console.log('Is running:', isRunning)
})

const restartGameBtn = document.getElementById('menu-restart')
restartGameBtn.addEventListener('click', function(event){
    isRunning = true
    controls.getObject().position.set(0, 0, 0)
    controls.getObject().rotation.y = 0
    controls.getObject().rotation.z = 0
    controls.getObject().rotation.x = 0
    player.position.set(0, -0.4, -5.7)
    initHUD()
    console.log('Restart game button pressed')
})

// G A M E   E V E N T S ==========================================================================

// document.addEventListener('endGameEvent', endGame)

// M A I N ========================================================================================

//Call functions
init()
animate()
// timerInterval = setInterval(updateCountdown, 1000)