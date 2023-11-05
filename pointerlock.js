import * as THREE from 'three';
import { PointerLockControls } from '../modules/PointerLockControls';
import { Vector3 } from 'three';

//G L O B A L   V A R I A B L E S =================================================================
//Camera and scene setup
let camera, scene, renderer, controls
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

    const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 2.5)
    light.position.set(0.5, 1, 0.75)
    scene.add(light)

    controls = new PointerLockControls(camera, document.body)
    controls.unlock()

    scene.add(controls.getObject())

    //Key listeners
    const onKeyDown = function (e) {
        switch (e.code) {
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

    const onKeyUp = function (e) {
        switch (e.code) {
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

    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10)

    //Floor for testing
    let floorGeom = new THREE.PlaneGeometry(2000, 2000, 100, 100)
    floorGeom.rotateX( -Math.PI / 2)
    let pos = floorGeom.attributes.position

    for(let i = 0, l = pos.count; i < l; i ++) {
        vertex.fromBufferAttribute( pos, i )

        vertex.x += Math.random() * 20 - 10
        vertex.y += Math.random() * 2
        vertex.z += Math.random() * 20 - 10

        pos.setXYZ( i, vertex.x, vertex.y, vertex.z )
    }
    floorGeom = floorGeom.toNonIndexed() // ensure each face has unique vertices

    pos = floorGeom.attributes.position
    const floorCols = []
    for(let i = 0, l = pos.count; i < l; i++){
        col.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75, THREE.SRGBColorSpace)
        floorCols.push( col.r, col.g, col.b)
    }
    floorGeom.setAttribute('color', new THREE.Float32BufferAttribute(floorCols, 3))

    let floorMat = new THREE.MeshBasicMaterial({vertexColors: true})
    const floor = new THREE.Mesh(floorGeom, floorMat)
    scene.add(floor)

    renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth / window.innerHeight)
    document.body.appendChild(renderer.domElement)

    window.addEventListener('resize', onWindowResize)
}

//Animation functions
function animate() {
    requestAnimationFrame( animate )
    const time = performance.now()

    if (controls.isLocked === true) {
        raycaster.ray.origin.copy(controls.getObject().position)
        raycaster.ray.origin.y -= 10

        const intersections = raycaster.intersectObjects(objects, false)

        const onObject = intersections.length > 0

        const delta = (time - prevTime) / 1000

        velocity.x -= velocity.x * 10.0 * delta
        velocity.z -= velocity.z * 10.0 * delta
        velocity.y -= 9.8 * 100.0 * delta // 100.0 = mass

        direction.z = Number( movementArr[0] ) - Number( movementArr[1] )
        direction.x = Number( movementArr[3] ) - Number( movementArr[2] )
        direction.normalize() // this ensures consistent movements in all directions

        if (movementArr[0] || movementArr[1]) velocity.z -= direction.z * 400.0 * delta
        if (movementArr[2] || movementArr[3]) velocity.x -= direction.x * 400.0 * delta

        controls.movementArr[3]( - velocity.x * delta )
        controls.movementArr[0]( - velocity.z * delta )

        controls.getObject().position.y += ( velocity.y * delta ) // new behavior

        if ( controls.getObject().position.y < 10 ) {
            velocity.y = 0
            controls.getObject().position.y = 10
        }
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

// ================================================================================================