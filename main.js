import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
const { createDevice } = RNBO;

let carrier, modulation, harmonicity, gain;

const startup = async () => {
    let context = listener.context;
    let sound3 = new THREE.PositionalAudio( listener );
    let rawPatcher = await fetch("basic-fm.export.json");
    let patcher = await rawPatcher.json();

    let device = await createDevice({ context, patcher });
    
    //get the params
    carrier = device.parametersById.get("carrier-frequency");
    harmonicity = device.parametersById.get("harmonicity-ratio");
    modulation = device.parametersById.get("modulation-index");
    gain = device.parametersById.get("gain");
    gain.value = 0.5;
    // This connects the device to audio output, but you may still need to call context.resume()
    // from a user-initiated function.
    //device.node.connect(context.destination);
    sound3.setNodeSource(device.node);
};
const scene = new THREE.Scene();
scene.background = new THREE.Color( 'black' );
scene.fog = new THREE.FogExp2( 0xefd1b5, 0.0025 );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
let controls;
const objects = [];
let raycaster;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();
const instructions = document.getElementById( 'instructions' );
instructions.addEventListener( 'click', function () {
    starty();
    controls.lock();
    instructions.style.display='none';

} );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.SphereGeometry( 1, 1, 1 );
const material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
cube.scale.set(3, 3, 3);
cube.position.set(0, 3, 0);
cube.receiveShadow = true;
scene.add( cube );

var light = new THREE.PointLight('red');
light.position.set(-3, 15, 50);
scene.add(light);

// Add fog to the scene
scene.fog = new THREE.Fog(0x000000, 0.1, 50);

const listener = new THREE.AudioListener();
camera.add( listener );

//const controls = new OrbitControls( camera, renderer.domElement );
controls = new PointerLockControls( camera, renderer.domElement );
scene.add( controls.getObject() );

				const onKeyDown = function ( event ) {

					switch ( event.code ) {

						case 'ArrowUp':
						case 'KeyW':
							moveForward = true;
							break;

						case 'ArrowLeft':
						case 'KeyA':
							moveLeft = true;
							break;

						case 'ArrowDown':
						case 'KeyS':
							moveBackward = true;
							break;

						case 'ArrowRight':
						case 'KeyD':
							moveRight = true;
							break;

						case 'Space':
							if ( canJump === true ) velocity.y += 350;
							canJump = false;
							break;

					}

				};

				const onKeyUp = function ( event ) {

					switch ( event.code ) {

						case 'ArrowUp':
						case 'KeyW':
							moveForward = false;
							break;

						case 'ArrowLeft':
						case 'KeyA':
							moveLeft = false;
							break;

						case 'ArrowDown':
						case 'KeyS':
							moveBackward = false;
							break;

						case 'ArrowRight':
						case 'KeyD':
							moveRight = false;
							break;

					}

				};

				document.addEventListener( 'keydown', onKeyDown );
				document.addEventListener( 'keyup', onKeyUp );
                raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
                // floor
                const directionalLight = new THREE.AmbientLight(0xffffff, .2);
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);
				const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000 ), new THREE.MeshPhongMaterial( { color: 'red', depthWrite: false } ) );
				mesh.rotation.x = - Math.PI / 2;
				mesh.receiveShadow = true;
				scene.add( mesh );

// Create Three.js positional audio source


startup();
/*
var oscillator = listener.context.createOscillator();
oscillator.type = 'sine';
oscillator.frequency.value = 1000;
*/



// Connect gain node to Three.js positional audio source


camera.position.x = 0;
camera.position.y = 3;
camera.position.z = 15;

function animate() {
	requestAnimationFrame( animate );
    const time = performance.now();

    if ( controls.isLocked === true ) {

        raycaster.ray.origin.copy( controls.getObject().position );
        raycaster.ray.origin.y -= 10;

        const intersections = raycaster.intersectObjects( objects, false );

        const onObject = intersections.length > 0;

        const delta = ( time - prevTime ) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveRight ) - Number( moveLeft );
        direction.normalize(); // this ensures consistent movements in all directions

        if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

        if ( onObject === true ) {

            velocity.y = Math.max( 0, velocity.y );
            canJump = true;

        }

        controls.moveRight( - velocity.x * delta );
        controls.moveForward( - velocity.z * delta );

        controls.getObject().position.y += ( velocity.y * delta ); // new behavior

        if ( controls.getObject().position.y < 10 ) {

            velocity.y = 0;
            controls.getObject().position.y = 10;

            canJump = true;

        }

    }

    prevTime = time;
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

	renderer.render( scene, camera );
}

animate();

function starty(){
    listener.context.resume();
    // Start oscillator
    //oscillator.start(0);
}

