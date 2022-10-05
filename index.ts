/**
 * @license
 * Copyright 2021 Google LLC.
 * SPDX-License-Identifier: Apache-2.0
 */

 import {
  Mesh,
  MeshStandardMaterial,
  Vector3,
  Shape,
  ExtrudeGeometry,
  TextureLoader,
  MeshBasicMaterial,
  PlaneGeometry
} from 'three';

import {LineSegmentsGeometry} from 'three/examples/jsm/lines/LineSegmentsGeometry';
import {Line2} from 'three/examples/jsm/lines/Line2.js';
import {LineMaterial} from 'three/examples/jsm/lines/LineMaterial.js';
import UBI_ICON from './ubi-icon.png';
import ThreeJSOverlayView from '@ubilabs/threejs-overlay-view';

let map: google.maps.Map;

const mapOptions = {
  center: {
    lat: 53.55493986295417,
    lng: 10.007137126703523
  },
  heading: 324.66666666666674,
  tilt: 65.66666666666667,
  zoom: 19.43375,
  mapId: "15431d2b469f209e",
  disableDefaultUI: true,
  backgroundColor: 'transparent',
  gestureHandling: 'greedy',
};

const BUILDING_HEIGHT = 31;
const BUILDING_LINE_COLOR = 0xffffff;
const BUILDING_FILL_COLOR = 0x000000;
const Z_FIGHTING_OFFSET = 0.001;
const LOGO_SIZE = [16, 16];
const LOGO_POSITION = {
  lat: 53.55463986295417,
  lng: 10.007317126703523,
  altitude: BUILDING_HEIGHT + Z_FIGHTING_OFFSET
};
const LOGO_ROTATION_Z = Math.PI / 12;
const COLOR_CHANGE_DURATION = 30; // completes one hue cycle in x seconds

function initMap(): void {
  const mapDiv = document.getElementById("map") as HTMLElement;
  map = new google.maps.Map(mapDiv, mapOptions);

  const overlay = new ThreeJSOverlayView(mapOptions.center);
  overlay.setMap(map);

  initScene(overlay).then(() => overlay.requestRedraw());
}

async function initScene(overlay) {
  const scene = overlay.getScene();

  const wireframePath = [
    [10.00787808793857, 53.554574397774715],
    [10.006971374559072, 53.55444226566294],
    [10.006565280581388, 53.55467172811441],
    [10.006569569754523, 53.55471724470295],
    [10.007768697370686, 53.554874083634],
    [10.007848668422987, 53.554846301309745],
    [10.007913475744536, 53.554604563663226]
  ];
  const points = wireframePath.map(([lng, lat]) =>
    overlay.latLngAltToVector3({lat, lng})
  );

  const line = getWireframe(points);
  scene.add(line);
  scene.add(getBuilding(points));
  scene.add(await getLogo(overlay));

  overlay.update = () => {
    const time = performance.now();

    line.material.resolution.copy(overlay.getViewportSize());
    line.material.color.setHSL(
      ((time * 0.001) / COLOR_CHANGE_DURATION) % 1,
      0.69,
      0.5
    );

    overlay.requestRedraw();
  };
}

function getWireframe(points) {
  const positions = new Float32Array(18 * points.length).fill(0);

  const offset = new Vector3(0, 0, BUILDING_HEIGHT);
  const pointsTop = points.map(p => p.clone().add(offset));

  for (let i = 0, n = points.length; i < n; i++) {
    points[i].toArray(positions, 6 * i);
    points[(i + 1) % n].toArray(positions, 6 * i + 3);
  }

  let topOffset = points.length * 6;
  for (let i = 0, n = pointsTop.length; i < n; i++) {
    pointsTop[i].toArray(positions, topOffset + 6 * i);
    pointsTop[(i + 1) % n].toArray(positions, topOffset + 6 * i + 3);
  }

  let vertEdgeOffset = points.length * 12;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const pTop = pointsTop[i];

    p.toArray(positions, vertEdgeOffset + 6 * i);
    pTop.toArray(positions, vertEdgeOffset + 6 * i + 3);
  }

  const lineGeometry = new LineSegmentsGeometry();
  lineGeometry.instanceCount = 3 * points.length;
  lineGeometry.setPositions(positions);
  const lineMaterial = new LineMaterial({
    color: BUILDING_LINE_COLOR,
    linewidth: 3
  });

  const line = new Line2(lineGeometry, lineMaterial);
  line.computeLineDistances();
  return line;
}

function getBuilding(points) {
  const buildingMaterial = new MeshStandardMaterial({
    transparent: true,
    opacity: 0.5,
    color: BUILDING_FILL_COLOR
  });

  const buildingShape = new Shape();
  points.forEach((p, i) => {
    i === 0 ? buildingShape.moveTo(p.x, p.y) : buildingShape.lineTo(p.x, p.y);
  });

  const extrudeSettings = {
    depth: BUILDING_HEIGHT,
    bevelEnabled: false
  };
  const buildingGeometry = new ExtrudeGeometry(buildingShape, extrudeSettings);
  return new Mesh(buildingGeometry, buildingMaterial);
}

function getLogo(overlay) {
  return new Promise(resolve => {
    const loader = new TextureLoader();
    loader.load(UBI_ICON, texture => {
      const logoGeometry = new PlaneGeometry(...LOGO_SIZE);
      const logoMaterial = new MeshBasicMaterial({
        map: texture,
        transparent: true
      });
      const logo = new Mesh(logoGeometry, logoMaterial);
      overlay.latLngAltToVector3(LOGO_POSITION, logo.position);
      logo.rotateZ(LOGO_ROTATION_Z);
      resolve(logo);
    });
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


