import './style.css';
import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

// Debug
const gui = new dat.GUI();
const world = {
  plane: {
    width: 400,
    height: 400,
    widthSegments: 50,
    heightSegments: 50,
  },
};
gui.add(world.plane, 'width', 1, 500).onChange(generatePlane);

gui.add(world.plane, 'height', 1, 500).onChange(generatePlane);

gui.add(world.plane, 'widthSegments', 1, 100).onChange(generatePlane);

gui.add(world.plane, 'heightSegments', 1, 100).onChange(generatePlane);

// Ocean blue RGB colors
const initialXColor = 0;
const initialYColor = 0.19;
const initialZColor = 0.4;

function generatePlane() {
  planeMesh.geometry.dispose();
  planeMesh.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
  );

  randomizeVerticePosition();
  setColorsToGeometry();
}

// Raycaster
const raycaster = new THREE.Raycaster();

// Scene
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);

document.body.appendChild(renderer.domElement);

new OrbitControls(camera, renderer.domElement);

camera.position.z = 50;

const planeGeometry = new THREE.PlaneGeometry(
  world.plane.width,
  world.plane.height,
  world.plane.widthSegments,
  world.plane.heightSegments
);
const planeMaterial = new THREE.MeshPhongMaterial({
  // color: 0xff0000,
  side: THREE.DoubleSide,
  flatShading: THREE.FlatShading,
  vertexColors: true,
});

const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);
generatePlane();

function randomizeVerticePosition() {
  // Vertice position randomization
  const { array } = planeMesh.geometry.attributes.position;
  const randomValuesForVertices = [];
  for (let i = 0; i < array.length; i++) {
    if (i % 3 === 0) {
      const x = array[i];
      const y = array[i + 1];
      const z = array[i + 2];

      array[i] = x + (Math.random() - 0.5) * 4;
      array[i + 1] = y + (Math.random() - 0.5) * 3;
      array[i + 2] = z + (Math.random() - 0.5) * 3.5;
    }

    randomValuesForVertices.push(Math.random() * Math.PI * 2);
  }

  // Adds customer 'randomValuesForVertices' and 'originalPosition' arrays to the mesh
  planeMesh.geometry.attributes.position.randomValuesForVertices = randomValuesForVertices;

  planeMesh.geometry.attributes.position.originalPosition = [
    ...planeMesh.geometry.attributes.position.array,
  ];
}

// Color Attribute Addition
function setColorsToGeometry() {
  const colors = [];

  for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
    colors.push(initialXColor, initialYColor, initialZColor);
  }

  planeMesh.geometry.setAttribute(
    'color',
    new THREE.BufferAttribute(new Float32Array(colors), 3)
  );
}

// setColorsToGeometry();

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, -1, 1);
scene.add(light);

const backLight = new THREE.DirectionalLight(0xffffff, 1);
backLight.position.set(0, 0, -1);
scene.add(backLight);

const mouse = {
  x: undefined,
  y: undefined,
};

let frame = 0;

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  raycaster.setFromCamera(mouse, camera);
  frame += 0.01;

  const {
    array,
    originalPosition,
    randomValuesForVertices,
  } = planeMesh.geometry.attributes.position;
  for (let i = 0; i < array.length; i += 3) {
    // x coordinate
    array[i] =
      originalPosition[i] + Math.cos(frame + randomValuesForVertices[i]) * 0.28;

    // y coordinate
    array[i + 1] =
      originalPosition[i + 1] +
      Math.sin(frame + randomValuesForVertices[i + 1]) * 0.28;
  }

  planeMesh.geometry.attributes.position.needsUpdate = true;

  const intersects = raycaster.intersectObject(planeMesh);
  if (intersects.length > 0) {
    // Light blue RGB color
    const xColor = 0.1;
    const yColor = 0.5;
    const zColor = 1;

    setVerticesColor(intersects[0], xColor, yColor, zColor);

    const initialColor = {
      r: initialXColor,
      g: initialYColor,
      b: initialZColor,
    };

    const hoverColor = {
      r: xColor,
      g: yColor,
      b: zColor,
    };

    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      onUpdate: () => {
        setVerticesColor(
          intersects[0],
          hoverColor.x,
          hoverColor.g,
          hoverColor.b
        );
      },
    });
  }
}

function setVerticesColor(intersects, xColor, yColor, zColor) {
  const { color } = intersects.object.geometry.attributes;
  const { a, b, c } = intersects.face;

  // vertice 1
  color.setX(a, xColor);
  color.setY(a, yColor);
  color.setZ(a, zColor);

  // vertice 2
  color.setX(b, xColor);
  color.setY(b, yColor);
  color.setZ(b, zColor);

  // vertice 3
  color.setX(c, xColor);
  color.setY(c, yColor);
  color.setZ(c, zColor);

  color.needsUpdate = true;
}

animate();

addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
});
