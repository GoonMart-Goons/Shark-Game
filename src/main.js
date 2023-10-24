import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PointerLockControls } from '../modules/PointerLockControls';
import * as YUKA from 'yuka'; // Import the YUKA library
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';//fish 3d model helper
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import { Water } from 'three/addons/objects/Water2.js';//water reflections


import { setBarNumber, drawTime, initHUD } from './components/hud';
import { addPlane, planeGrid } from './components/terrain';
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
let vehicleArray = []// vehicle array
const numFish = 20; // Number of fish in the environment

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
let mixer
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

    // water
    const waterGeometry = new THREE.PlaneGeometry(1000, 1000);
    const water = new Water(waterGeometry, {
        textureWidth: 512,
        textureHeight: 512,
        alpha: 1.0,
        sunDirection: new THREE.Vector3(1, 1, 1),
        waterColor: 0x001e0f,
        flowDirection: new THREE.Vector2( 1,1 ),
    });
    water.position.y = 175;
    water.rotation.x = Math.PI / 2;
    scene.add(water);


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

    const loader1 = new GLTFLoader();
    loader1.load(' ./assets/megalodon/source/high_quality_shark_animation.glb',function (gltf){
        const model = gltf.scene;
        // Play the animation
        mixer = new THREE.AnimationMixer(model);
        console.log(mixer);
        const clips = gltf.animations;
        console.log(clips);
        const clip = THREE.AnimationClip. findByName (clips, 'swimming');
        const action = mixer.clipAction(clip);
        action.play();
        animate();
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
        // Play the animation
        camera.add(sharkClone);
        //scene.add(sharkClone);
    });
    //Make player object child of camera + add them to scene
    //player = addCube()
    //player.position.set(0, -1, -2)
    
    const offset = controls.getObject().position.add(new THREE.Vector3(0,-1,-2))
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
            handleFishEaten(fishIdx)
            // fishArray[fishIdx].material.color.set('red')
        }
    }) 

    controls.getObject().add(player)
    scene.add(controls.getObject())
    world.addBody(playerHB)

    //Ocean floor
    oceanFloor = addPlane()
    oceanFloor.position.y = -250
    oceanFloor.rotation.set(162, 0, 0)
    scene.add(oceanFloor)

    //Skybox
    skyBox = addSkyBox()
    scene.add(skyBox)

    window.addEventListener('resize', onWindowResize)
    addKeyListener()

    //HUD elements
    initHUD()
    onWindowResize()

    //Add sounds to game
    addSounds(camera)

    //Init fish
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

function handleFishEaten(eatenFishIndex) {
    // Respawn the eaten fish in a random location
    const newX = Math.random() * 200 - 100;
    const newY = Math.random() * 200 - 100;
    const newZ = Math.random() * 200 - 100;

    // Update the fish's position
    vehicleArray[eatenFishIndex].position.set(newX, newY, newZ);

    // Reset the fish's rotation
    vehicleArray[eatenFishIndex].rotation.set(0, 0, 0);
}

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
const clock = new THREE.Clock()
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
    playerHB.position.set(controls.getObject().position.x,controls.getObject().position.y,controls.getObject().position.z) //Player hit box
    //player.position.set(controls.getObject().position.x,controls.getObject().position.y,controls.getObject().position.z-4)//kudzai
    //Move fish
    const delta2 = time2.update().getDelta();
    for (let i = 0; i < numFish; i++) {
        vehicleArray[i].update(delta2); // Update the YUKA vehicle
        fishArray[i].position.copy(vehicleArray[i].position); // Update the fish's position
        // Update the fish's rotation to match the YUKA vehicle's orientation
        fishArray[i].quaternion.copy(vehicleArray[i].rotation);
        fishHBArray[i].position.copy(fishArray[i].position)
    }
    //shark animation
    const delta3 = clock.getDelta();
    if(mixer){
        console.log('Updating mixer');
        mixer.update( delta3 );
        console.log(mixer);

    }

    world.step(1 / 60)


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