import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
// Function to create a single fish object


const loader = new GLTFLoader ();
loader.load(' ./assets/fish.glb', function (glb){
    const model = glb. scene;
});
export function createFish() {
    const geometry = new THREE.BoxGeometry(5, 5, 5); // Adjust size as needed
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000 }); // Adjust color
    const fish = new THREE.Mesh(geometry, material);

    // Return the fish object
    return fish;
}

// Function to initialize the fish
export function initFish(fishArray, numFish) {
    for (let i = 0; i < numFish; i++) {
        const fish = createFish();
        fishArray.push(fish);
    }

    return fishArray
}



// Function to handle fish eaten by the shark
export function fishEaten(fish) {
    // Remove the fish from the scene
    scene.remove(fish);

    // Create a new fish and add it to the array
    const newFish = createFish();
    fishArray[fishArray.indexOf(fish)] = newFish;
}

// Call this function to update fish positions
export function animateFish() {
    // add more behaviors or interactions

    // Replace fish when eaten by the shark
    // Replace only when the shark collides with a fish, add collision detection logic here

    // Call the function recursively for animation
    requestAnimationFrame(animateFish);
}