import * as THREE from 'three'

const loader = new THREE.TextureLoader()
const mineTexture = loader.load('../assets/images/metal.jpg');
console.log('Mine texture:', mineTexture)

export function addNavalMine(radius, spikeLength, spikeRadius) {
    const navalMineGroup = new THREE.Group();

    // Create the sphere
    const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ map: mineTexture });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    navalMineGroup.add(sphere);

    // Define the positions for the prongs relative to the sphere
    const positions = [
      { x: 0, y: radius + spikeLength / 2, z: 0 }, // Top
      { x: 0, y: -radius - spikeLength / 2, z: 0 }, // Bottom
      { x: radius + spikeLength / 2, y: 0, z: 0 }, // Right
      { x: -radius - spikeLength / 2, y: 0, z: 0 }, // Left
      { x: 0, y: 0, z: radius + spikeLength / 2 }, // Front
      { x: 0, y: 0, z: -radius - spikeLength / 2 }, // Back
  ];

   // Add spikes to the sphere at the specified positions
   positions.forEach(position => {
    const cylinderGeometry = new THREE.CylinderGeometry(spikeRadius, spikeRadius, spikeLength, 32);
    const spike = new THREE.Mesh(cylinderGeometry, sphereMaterial);
    
    navalMineGroup.add(spike);

    // Calculate the rotation angles to align the torus end with the surface
    const angleY = Math.atan2(position.x, -position.z); // Rotate around Y-axis
    const angleX = Math.atan2(position.y, Math.sqrt(position.x * position.x + position.z * position.z)); // Rotate around X-axis

    spike.rotation.set(angleX + Math.PI/2, angleY , 0);
    if(position.y == 0 && position.z == 0){
      spike.rotation.set(0 , 0, Math.PI/2);
    }
    spike.position.set(position.x, position.y, position.z);
  });

  return navalMineGroup;
}