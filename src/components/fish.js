import * as THREE from 'three';

// Function to create a single fish object
export function createFish() {
    const geometry = new THREE.BoxGeometry(1, 1, 1); // Adjust size as needed
    const material = new THREE.MeshPhongMaterial({ color: 'lime' }); // Adjust color
    const fish = new THREE.Mesh(geometry, material);

    // Set initial position for the fish
    fish.position.set(Math.random() * 500 - 250, 5, Math.random() * 500 - 250);

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

// Function to update fish positions
export function updateFish(fishArray, numFish) {
    for(var i = 0; i < numFish; i++){
        // Add random motion to the fish
        const fishSpeed = 0.5;
        fishArray[i].position.x += (Math.random() - 0.5) * fishSpeed;
        fishArray[i].position.z += (Math.random() - 0.5) * fishSpeed;

        // add more complex motion behaviors here

        // Wrap the fish within the boundaries ( using a 1000x1000 area)
        const boundary = 500;
        if (fishArray[i].position.x < -boundary) fishArray[i].position.x = boundary;
        if (fishArray[i].position.x > boundary) fishArray[i].position.x = -boundary;
        if (fishArray[i].position.z < -boundary) fishArray[i].position.z = boundary;
        if (fishArray[i].position.z > boundary) fishArray[i].position.z = -boundary;
    };
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
    updateFish();
    // add more behaviors or interactions

    // Replace fish when eaten by the shark
    // Replace only when the shark collides with a fish, add collision detection logic here

    // Call the function recursively for animation
    requestAnimationFrame(animateFish);
}