//Skybox, texture from https://jkhub.org/files/file/3216-underwater-skybox/
let materialArray = [];
let texture_ft = new THREE.TextureLoader().load('./Images/uw_ft.jpg');
let texture_bk = new THREE.TextureLoader().load('./Images/uw_bk.jpg');
let texture_up = new THREE.TextureLoader().load('./Images/uw_up.jpg');
let texture_dn = new THREE.TextureLoader().load('./Images/uw_dn.jpg');
let texture_rt = new THREE.TextureLoader().load('./Images/uw_rt.jpg');
let texture_lf = new THREE.TextureLoader().load('./Images/uw_lf.jpg');

materialArray.push(new THREE.MeshBasicMaterial({map: texture_ft}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_bk}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_up}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_dn}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_rt}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_lf}));

let skyBoxShape = new THREE.BoxGeometry(1000, 1000, 1000);
let skyBox = new THREE.Mesh(skyBoxShape, materialArray);

for (let i = 0; i < 6; i++){
    materialArray[i].side = THREE.BackSide;
}