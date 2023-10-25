import * as THREE from 'three';

const loader = new THREE.TextureLoader();
const ballTexture = loader.load('../assets/images/coral/red_star.jpg');
const baseTexture1 = loader.load('../assets/images/coral/light_texture.jpg');
const baseTexture2 = loader.load('../assets/images/coral/light_texture_2.jpg');
const diskTexture = loader.load('../assets/images/coral/pink_circle.jpg');
const pilarTexture = loader.load('../assets/images/coral/green_maze.jpg');

function addPilar(length, radius, materialTexture) {
    // Create a group to hold the compound object
    const pilar = new THREE.Group();
  
    // Create the cylinder
    const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, length, 32);
    const cylinderMaterial = new THREE.MeshBasicMaterial({ map: materialTexture });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  
    // Position the cylinder
    cylinder.position.set(0, 0, 0);
    cylinder.rotateX(-Math.PI / 2);
  
    const torusGeometry = new THREE.TorusGeometry(radius*1.2, radius*0.4, 16, 100);
    const torusMaterial = new THREE.MeshBasicMaterial({ map: materialTexture });

    // Create the torus on one end
    const torus1 = new THREE.Mesh(torusGeometry, torusMaterial);
    torus1.position.set(0, 0, -length / 2 - radius*1.2 / 3.5);

    // Create the torus on the other end
    const torus2 = new THREE.Mesh(torusGeometry, torusMaterial);
    torus2.position.set(0, 0, length / 2 + radius*1.2 / 3.5);
 
  
    // Add the cylinder and tori to the compound object
    pilar.add(cylinder);
    pilar.add(torus1);
    pilar.add(torus2);
    pilar.rotateX(-Math.PI / 2);

    return pilar;
  }
  
  //const pilar = addPilar(4, 0.5, texture);
  //scene.add(pilar);

function addPilarCoral(length, radius, baseMaterial, pilarMaterial) {
    const coralGroup = new THREE.Group();

    // Parameters for the base and pilars
    const baseRadius = radius*8; // Radius of the semi-circle base
    const numPilars = 7;
    const pilarParams = [
        { length: length*1.8, radius: radius*1.3 },
        { length: length*1.7, radius: radius*1.6 },
        { length: length*2.05, radius: radius*1.8},
        { length: length*1.98, radius: radius*1.4 },
        { length: length*3.0, radius: radius*1.5 },
        { length: length*2.6, radius: radius*1.8 },
        { length: length*2.1, radius: radius*1.6 },
    ];

    // Create the base (semi-circle)
    const baseGeometry = new THREE.SphereGeometry(baseRadius, 32, 32, Math.PI, Math.PI * 2);
    const baseMaterialMap = new THREE.MeshBasicMaterial({ map: baseMaterial });
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterialMap);
    baseMesh.position.set(0,-radius*1, 0)
    coralGroup.add(baseMesh);

    const pilar0 = addPilar(pilarParams[0].length, pilarParams[0].radius, pilarMaterial);
    pilar0.position.set(0, baseRadius + pilarParams[0].length/2, 0)
    coralGroup.add(pilar0)

    const pilar1 = addPilar(pilarParams[1].length, pilarParams[1].radius, pilarMaterial);
    pilar1.rotateY(Math.PI /4)
    pilar1.position.set(9, baseRadius + 3, 0)
    coralGroup.add(pilar1)

    const pilar2 = addPilar(pilarParams[2].length, pilarParams[2].radius, pilarMaterial);
    pilar2.rotateX(Math.PI /4)
    pilar2.position.set(3, baseRadius , 5)
    coralGroup.add(pilar2)

    const pilar3 = addPilar(pilarParams[3].length, pilarParams[3].radius, pilarMaterial);
    pilar3.rotateY(-Math.PI /3)
    pilar3.position.set(-5, baseRadius , 2)
    coralGroup.add(pilar3)

    const pilar4 = addPilar(pilarParams[4].length, pilarParams[4].radius, pilarMaterial);
    pilar4.rotateY(Math.PI /5)
    pilar4.rotateX(-Math.PI /5)
    pilar4.position.set(1, baseRadius , -8)
    coralGroup.add(pilar4)

    const pilar5 = addPilar(pilarParams[5].length, pilarParams[5].radius, pilarMaterial);
    pilar5.rotateY(-Math.PI /8)
    pilar5.rotateX(Math.PI /5)
    pilar5.position.set(-2, baseRadius , 8)
    coralGroup.add(pilar5)

    const pilar6 = addPilar(pilarParams[6].length, pilarParams[6].radius, pilarMaterial);
    //pilar6.rotateY(-Math.PI /8)
    pilar6.rotateX(-Math.PI /8)
    pilar6.position.set(-3, baseRadius , -4)
    coralGroup.add(pilar6)

    return coralGroup;
}

// Usage
const coralStructure =  addPilarCoral(baseTexture1,pilarTexture );
//coralStructure.position.set(0,-20,0)
//scene.add(coralStructure);

function addDiskCoral1(length, radius, diskTexture, poleTexture) {
    // Create a group to hold the compound object
    const pilar = new THREE.Group();
  
    // Create the cylinder
    const cylinderGeometry = new THREE.CylinderGeometry(radius*0.1, radius*0.1, length, 32);
    const cylinderMaterial = new THREE.MeshBasicMaterial({ map: poleTexture });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  
    // Position the cylinder
    cylinder.position.set(0, 0, 0);
  
    const diskGeo = new THREE.CylinderGeometry(radius, radius, 0.3, 16, 100);
    const diskMaterial = new THREE.MeshBasicMaterial({ map: diskTexture });

    // Create the flat disk
    const disk = new THREE.Mesh(diskGeo, diskMaterial);
    disk.position.set(radius/5 *3, length / 2 ,0);

  
    // Add the cylinder and tori to the compound object
    pilar.add(cylinder);
    pilar.add(disk);
    
    return pilar;
  }


  function addDiskCoral2(length, radius, diskTexture, poleTexture) {
    // Create a group to hold the compound object
    const combinedPilar = new THREE.Group();

    const pilar1 = addDiskCoral1(length, radius, diskTexture, poleTexture);
    const pilar2 = addDiskCoral1(length*1.4, radius*0.8, diskTexture, poleTexture);
    pilar2.position.set(0,length,0)
    pilar2.rotateY((Math.random() * Math.PI * 2) - (Math.PI ))
  
    combinedPilar.add(pilar1)
    combinedPilar.add(pilar2)
    
    return combinedPilar;
  }

  function addDiskCoral3(length, radius, diskTexture, poleTexture) {
    // Create a group to hold the compound object
    const combinedPilar = new THREE.Group();

    const pilar1 = addDiskCoral1(length, radius, diskTexture, poleTexture);
    
    const pilar2 = addDiskCoral1(length*1.4, radius*0.8, diskTexture, poleTexture);
    pilar2.position.set(0,length,0)
    pilar2.rotateY((Math.random() * Math.PI * 2) - (Math.PI ))
    
    const pilar3 = addDiskCoral1(length*0.8, radius, diskTexture, poleTexture);
    pilar3.position.set(0,length + length*1.1 ,0)
    pilar3.rotateY((Math.random() * Math.PI * 2) - (Math.PI ))
  
    combinedPilar.add(pilar1)
    combinedPilar.add(pilar2)
    combinedPilar.add(pilar3)
    
    return combinedPilar;
  }

  /*function addDiskCoralGroup(length, radius, baseTexture, coralTexture) {
    // Create a group to hold the compound object
    const combinedCoral = new THREE.Group();

    const baseGeo1 = new THREE.BoxGeometry(length, length*2, length*0.5);
    const baseMaterial1 = new THREE.MeshBasicMaterial({ map: baseTexture });

    const base1 = new THREE.Mesh(baseGeo1, baseMaterial1);
    base1.position.set(-length, 0, 0);

    const baseGeo2 = new THREE.BoxGeometry(length*0.7, length, length);
    const baseMaterial2 = new THREE.MeshBasicMaterial({ map: baseTexture });

    const base2 = new THREE.Mesh(baseGeo2, baseMaterial2);
    base2.position.set(length/2, 0, 0);
    
  
    combinedCoral.add(base1)
    combinedCoral.add(base2)
    //combinedCoral.add(coral1)
    //combinedCoral.add(coral2)
    //combinedCoral.add(coral3)
    
    return combinedCoral;
  }*/

  //const pilar2 = addDiskCoral3(3, 8, diskTexture, baseTexture2);
  //scene.add(pilar2);
  
  function addBalls(radius, materialTexture) {
    // Create a group to hold the compound object
    const ball = new THREE.Group();
  
    // Create the spheres
    const sphereGeometry = new THREE.SphereGeometry(radius, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ map: materialTexture });
    const sphere1 = new THREE.Mesh(sphereGeometry, sphereMaterial);
    const sphere2 = new THREE.Mesh(sphereGeometry, sphereMaterial);
    const sphere3 = new THREE.Mesh(sphereGeometry, sphereMaterial);
    const sphere4 = new THREE.Mesh(sphereGeometry, sphereMaterial);
  
    // Position the cylinder
    sphere1.position.set(0, 0, 0);
    sphere2.position.set(-radius*1.2, radius*0.2, -radius*0.5);
    sphere3.position.set(radius*1.4, radius*0.7, -radius*1.2);
    sphere4.position.set(-radius*0.2, radius*0.8, -radius*1.4);
  
    ball.add(sphere1)
    ball.add(sphere2)
    ball.add(sphere3)
    ball.add(sphere4)

    return ball;
  }

  //const pilar2 = addBalls(3, texture);
  //scene.add(pilar2)

  function addBalls2(radius, materialTexture) {
    // Create a group to hold the compound object
    const balls = new THREE.Group();
  

    const sphere1 = addBalls(radius, materialTexture)
    const sphere2 = addBalls(radius, materialTexture)
    const sphere3 = addBalls(radius, materialTexture)
    const sphere4 = addBalls(radius, materialTexture)
  
    sphere2.position.set(-radius*1.3,radius*1.5, 0)
    sphere3.position.set(radius*0.9, radius*2, 0)
    //sphere4.rotateZ(Math.PI/2)
    sphere4.rotateX(-Math.PI/2 *3.4)
    sphere4.position.set(0,radius*0.8, -radius*3)
    
    balls.add(sphere1)
    balls.add(sphere2)
    balls.add(sphere3)
    balls.add(sphere4)

    return balls;
  }

  function addBallCoral(radius, ballMaterial, stemMaterial){
    const coral = new THREE.Group();

    const balls = addBalls2(radius, ballMaterial)
    balls.position.set(-radius*3, radius*2, radius)
    balls.rotateY(Math.PI/2 *3)
    balls.scale.set(1.3,1.3,1.3)

    const cylinderGeometry = new THREE.CylinderGeometry(radius*0.3, 0.3*radius, radius*7 ,32);
    const cylinderMaterial = new THREE.MeshBasicMaterial({ map:  stemMaterial });

    const cylinder1 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    const cylinder2 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

    cylinder1.rotateZ(-Math.PI/10)
    cylinder2.rotateZ(Math.PI/10)
    cylinder2.position.set(-radius*1.8, 0, 0)

    coral.add(balls)
    coral.add(cylinder1)
    coral.add(cylinder2)

    return coral;

  }

  //const pilar2 = addBallCoral(3, ballTexture, baseTexture1);
  //scene.add(pilar2)

  /*export function addCoralGroup1(length, radius, baseMaterial1, baseMaterial2, pilarMaterial, diskMaterial, ballMaterial){
    const coralGroup = new THREE.Group();

    const pilarCoral =  addPilarCoral(length*3.5, radius/radius, baseMaterial1,pilarMaterial )
    const diskCoral = addDiskCoral3(length*1.5, radius, diskMaterial, baseMaterial2)
    const diskCoral2 = addDiskCoral2(length*1.5, radius*1.3, diskMaterial, baseMaterial2)
    const ballCoral = addBallCoral(radius/3, ballMaterial, baseMaterial2)
    const ballCoral2 = addBallCoral(radius/2, ballMaterial, baseMaterial2)
    const diskCoral3 = addDiskCoral2(length*2.5, radius*1.5, diskMaterial, baseMaterial2)
    const pilarCoral2 =  addPilarCoral(length*1.8, radius/radius*0.7, baseMaterial1,pilarMaterial )
    const ballCoral3 = addBallCoral(radius/4.5, ballMaterial, baseMaterial2)

    diskCoral.position.set(length*4, 0, length*4)
    ballCoral.position.set(-length*4, length*2, -length*3)
    diskCoral2.position.set(-length*5, -length, length*3)
    ballCoral2.position.set(length*6, length*2, -length*3)
    diskCoral3.position.set(-length, length*4, -length*5.5)
    pilarCoral2.position.set(-length*8, length*2, length)
    ballCoral3.position.set(0, length/2, length*5)

    coralGroup.add(pilarCoral)
    coralGroup.add(diskCoral)
    coralGroup.add(ballCoral)
    coralGroup.add(diskCoral2)
    coralGroup.add(ballCoral2)
    coralGroup.add(diskCoral3)
    coralGroup.add(pilarCoral2)
    coralGroup.add(ballCoral3)

    return coralGroup;
  }*/

  export function addCoralGroup1(length, radius){
    const coralGroup = new THREE.Group();

    const pilarCoral =  addPilarCoral(length*3.5, radius/radius, baseTexture1,pilarTexture )
    const diskCoral = addDiskCoral3(length*1.5, radius, diskTexture, baseTexture2)
    const diskCoral2 = addDiskCoral2(length*1.5, radius*1.3, diskTexture, baseTexture2)
    const ballCoral = addBallCoral(radius/3, ballTexture, baseTexture2)
    const ballCoral2 = addBallCoral(radius/2, ballTexture, baseTexture2)
    const diskCoral3 = addDiskCoral2(length*2.5, radius*1.5, diskTexture, baseTexture2)
    const pilarCoral2 =  addPilarCoral(length*1.8, radius/radius*0.7, baseTexture1,pilarTexture )
    const ballCoral3 = addBallCoral(radius/4.5, ballTexture, baseTexture2)

    diskCoral.position.set(length*4, 0, length*4)
    ballCoral.position.set(-length*4, length*2, -length*3)
    diskCoral2.position.set(-length*5, -length, length*3.5)
    ballCoral2.position.set(length*7, length*2, -length*3.5)
    diskCoral3.position.set(-length, length*4, -length*5.5)
    pilarCoral2.position.set(-length*8, length*2, length)
    ballCoral3.position.set(0, length/2, length*6)

    coralGroup.add(pilarCoral)
    coralGroup.add(diskCoral)
    coralGroup.add(ballCoral)
    coralGroup.add(diskCoral2)
    coralGroup.add(ballCoral2)
    coralGroup.add(diskCoral3)
    coralGroup.add(pilarCoral2)
    coralGroup.add(ballCoral3)

    return coralGroup;
  }

  export function addBallCoralTest(radius){
    const coral = new THREE.Group();

    const balls = addBalls2(radius, ballTexture)
    balls.position.set(-radius*3, radius*2, radius)
    balls.rotateY(Math.PI/2 *3)
    balls.scale.set(1.3,1.3,1.3)

    const cylinderGeometry = new THREE.CylinderGeometry(radius*0.3, 0.3*radius, radius*7 ,32);
    const cylinderMaterial = new THREE.MeshBasicMaterial({ map:  baseTexture2 });

    const cylinder1 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    const cylinder2 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

    cylinder1.rotateZ(-Math.PI/10)
    cylinder2.rotateZ(Math.PI/10)
    cylinder2.position.set(-radius*1.8, 0, 0)

    coral.add(balls)
    coral.add(cylinder1)
    coral.add(cylinder2)

    return coral;

  }

  //const coralGroup = addCoralGroup1(4, 8, baseTexture1, baseTexture2, pilarTexture, diskTexture, ballTexture )
  //coralGroup.position.set(0,-20,0)
  //scene.add(coralGroup)