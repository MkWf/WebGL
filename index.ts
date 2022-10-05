/**
 * @license
 * Copyright 2021 Google LLC.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Mesh,
  BoxGeometry,
  MechBasicMaterial,
  MeshStandardMaterial,
  Vector3,
  Shape,
  ExtrudeGeometry,
  TextureLoader,
  MeshBasicMaterial,
  PlaneGeometry,
  AmbientLight,
  DirectionalLight,
  Matrix4,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  Vector2
} from "three";

import ThreeJSOverlayView from '@ubilabs/threejs-overlay-view';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";


let map: google.maps.Map;

const mapOptions = {
  tilt: 70,
  heading: 180,
  zoom: 19,
  center: { lat: 42.331491, lng: -71.070327 },
  mapId: "15431d2b469f209e",
  //backgroundColor: 'transparent',
  //disableDefaultUI: true,
  //gestureHandling: "none",
  //keyboardShortcuts: false,
};

function initMap(): void {
  const mapDiv = document.getElementById("map") as HTMLElement;
  map = new google.maps.Map(mapDiv, mapOptions);

  const DEFAULT_COLOR = 0xffffff;
  const HIGHLIGHT_COLOR = 0x00ffff;

  let highlightedObject = null;
    
  const overlay = new ThreeJSOverlayView({
    lat: 42.331491, lng: -71.070327
  })

  const scene = overlay.getScene();
  const box = new Mesh(
    new BoxGeometry(50, 50, 50),
    new MeshBasicMaterial({color: 0xff0000})
  );
  scene.add(box);

  overlay.setMap(map);

  overlay.update = () => {
    const intersections = overlay.raycast(mousePosition);
    if (highlightedObject) {
      highlightedObject.material.color.setHex(DEFAULT_COLOR);
    }

    if (intersections.length === 0) return;

    highlightedObject = intersections[0].object;
    highlightedObject.material.color.setHex(HIGHLIGHT_COLOR);
  }

  const mousePosition = new Vector2();

  map.addListener('mousemove', ev => {
    const {domEvent} = ev;
    const {left, top, width, height} = mapDiv.getBoundingClientRect();

    const x = domEvent.clientX - left;
    const y = domEvent.clientY - top;

    mousePosition.x = 2 * (x / width) - 1;
    mousePosition.y = 1 - 2 * (y / height);

    // since the actual raycasting is happening in the update function,
    // we have to make sure that it will be called for the next frame.
    overlay.requestRedraw();
  });
}



/*function initWebglOverlayView(map: google.maps.Map): void {
  let scene, renderer, camera, loader;
  const webglOverlayView = new google.maps.WebGLOverlayView();

  webglOverlayView.onAdd = () => {
    // Set up the scene.
    scene = new Scene();
    camera = new PerspectiveCamera();

    const ambientLight = new AmbientLight(0xffffff, 0.75); // Soft white light.
    scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 0.25);
    directionalLight.position.set(0.5, -1, 0.5);
    scene.add(directionalLight);

    // Load the model.
    loader = new GLTFLoader();
    const source =
      "https://raw.githubusercontent.com/googlemaps/js-samples/main/assets/pin.gltf";
    loader.load(source, (gltf) => {
      gltf.scene.scale.set(4, 4, 4);
      gltf.scene.rotation.x = Math.PI; // Rotations are in radians.
      scene.add(gltf.scene);
    });
  };

  webglOverlayView.onContextRestored = ({ gl }) => {
    // Create the js renderer, using the
    // maps's WebGL rendering context.
    renderer = new WebGLRenderer({
      canvas: gl.canvas,
      context: gl,
      ...gl.getContextAttributes(),
    });
    renderer.autoClear = false;

    // Wait to move the camera until the 3D model loads.
    loader.manager.onLoad = () => {
      renderer.setAnimationLoop(() => {
        /*webglOverlayView.requestRedraw();
        const { tilt, heading, zoom } = mapOptions;
        map.moveCamera({ tilt, heading, zoom });

        // Rotate the map 360 degrees.
        if (mapOptions.tilt < 67.5) {
          mapOptions.tilt += 0.5;
        } else if (mapOptions.heading <= 360) {
          mapOptions.heading += 0.2;
          mapOptions.zoom -= 0.0005;
        } else {
          renderer.setAnimationLoop(null);
        }
      });
    };
  };

  webglOverlayView.onDraw = ({ gl, transformer }): void => {
    const latLngAltitudeLiteral: google.maps.LatLngAltitudeLiteral = {
      lat: mapOptions.center.lat,
      lng: mapOptions.center.lng,
      altitude: 30,
    };

    // Update camera matrix to ensure the model is georeferenced correctly on the map.
    const matrix = transformer.fromLatLngAltitude(latLngAltitudeLiteral);
    camera.projectionMatrix = new Matrix4().fromArray(matrix);

    webglOverlayView.requestRedraw();
    renderer.render(scene, camera);

    // Sometimes it is necessary to reset the GL state.
    renderer.resetState();
  };
  webglOverlayView.setMap(map);
}*/

declare global {
  interface Window {
    initMap: () => void;
  }
}
window.initMap = initMap;
export {};


