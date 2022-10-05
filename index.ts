/**
 * @license
 * Copyright 2021 Google LLC.
 * SPDX-License-Identifier: Apache-2.0
 */

 import {
  Mesh,
  VideoTexture,
  MeshBasicMaterial,
  FrontSide,
  PlaneGeometry
} from 'three';

import VIDEO_URL from "./BigBuckBunny.mp4";   
import ThreeJSOverlayView from '@ubilabs/threejs-overlay-view';

let map: google.maps.Map;

const SCREEN_SIZE = [50, 25];
const ALTITUDE_OFFSET = 3;
const SCREEN_POSITION = {
  lat: 42.331491,
  lng: -71.070327,
  altitude: SCREEN_SIZE[1] / 2 + ALTITUDE_OFFSET
};
const SCREEN_ROTATION = [Math.PI / 2, 0, Math.PI / 13];

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

  const overlay = new ThreeJSOverlayView({
    lat: 42.331491, lng: -71.070327
  })
  overlay.setMap(map);

  const scene = overlay.getScene();
  const video = document.createElement('video');

  video.src = VIDEO_URL;
  video.loop = true;
  video.muted = true;
  video.autoplay = true;
  video.load();
  video.play();

  const videoTexture = new VideoTexture(video);
  const videoMaterial = new MeshBasicMaterial({
    map: videoTexture,
    side: FrontSide
  });

  const screenGeometry = new PlaneGeometry(...SCREEN_SIZE);
  const screen = new Mesh(screenGeometry, videoMaterial);

  overlay.latLngAltToVector3(SCREEN_POSITION, screen.position);
  screen.rotation.order = 'ZYX';
  screen.rotation.set(...SCREEN_ROTATION);

  scene.add(screen);
  overlay.update = () => overlay.requestRedraw();
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


