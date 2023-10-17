import * as dat from 'dat.gui'
import * as THREE from 'three';

//Plane constants
const planeX = 1000;
const planeY = 1000;
const loader = new THREE.TextureLoader();
const height = loader.load('../assets/images/map.jpg');
const texture = loader.load('../assets/images/mountain.jpg');
const alpha = loader.load('../assets/images/map.jpg');

//Make a plane [ground]
export function addPlane(){
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

export function planeGrid() {
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