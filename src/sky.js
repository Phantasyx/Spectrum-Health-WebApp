import 'aframe';
import { hitboxCenterDirection, panoramaPoint, uvFromDirection } from './coords.js';

const THREE = window.AFRAME.THREE;

export function mountPanorama(stage, imageUrl) {
  const scene = document.createElement('a-scene');
  scene.setAttribute('embedded', '');
  scene.setAttribute('vr-mode-ui', 'enabled: true');
  scene.setAttribute('device-orientation-permission-ui', 'enabled: false');
  scene.setAttribute('loading-screen', 'enabled: false');
  scene.setAttribute('renderer', 'antialias: true; colorManagement: true');
  scene.setAttribute('background', 'color: #d5e0e2');

  const sky = document.createElement('a-sky');
  sky.setAttribute('src', imageUrl);
  sky.setAttribute('rotation', '0 -90 0');

  const cameraEl = document.createElement('a-entity');
  cameraEl.setAttribute('camera', 'fov: 66; near: 0.1');
  cameraEl.setAttribute('look-controls', 'reverseMouseDrag: false; magicWindowTrackingEnabled: false');
  cameraEl.setAttribute('wasd-controls', 'enabled: false');
  cameraEl.setAttribute('position', '0 0 0');

  scene.append(sky, cameraEl);
  stage.prepend(scene);

  const point = new THREE.Vector3();
  const forward = new THREE.Vector3();

  function controls() {
    return cameraEl.components && cameraEl.components['look-controls'];
  }

  function worldPoint(hitbox) {
    const dir = hitboxCenterDirection(hitbox);
    const uv = uvFromDirection(dir[0], dir[1], dir[2]);
    return panoramaPoint(uv.u, uv.v, 8);
  }

  return {
    scene,
    ready: new Promise((resolve) => {
      if (scene.hasLoaded) resolve();
      else scene.addEventListener('loaded', () => resolve(), { once: true });
    }),
    aim(hitbox) {
      const look = controls();
      if (!look) return;
      const [x, y, z] = worldPoint(hitbox);
      const len = Math.hypot(x, y, z) || 1;
      const px = x / len;
      const py = y / len;
      const pz = z / len;
      look.pitchObject.rotation.x = Math.asin(Math.max(-1, Math.min(1, py)));
      look.yawObject.rotation.y = Math.atan2(-px, -pz);
    },
    nudge(yawDelta, pitchDelta) {
      const look = controls();
      if (!look) return;
      look.yawObject.rotation.y -= yawDelta;
      look.pitchObject.rotation.x = Math.max(-1.05, Math.min(1.05, look.pitchObject.rotation.x + pitchDelta));
    },
    useDeviceOrientation() {
      cameraEl.setAttribute('look-controls', 'reverseMouseDrag: false; magicWindowTrackingEnabled: true');
    },
    project(hitbox, viewport) {
      const cam = cameraEl.getObject3D('camera');
      if (!cam) return null;
      cam.updateMatrixWorld();
      const [x, y, z] = worldPoint(hitbox);
      cam.getWorldDirection(forward);
      point.set(x, y, z).normalize();
      if (forward.dot(point) < 0.08) return null;
      point.set(x, y, z).project(cam);
      if (point.x < -1.05 || point.x > 1.05 || point.y < -1.05 || point.y > 1.05) return null;
      return {
        x: (point.x * 0.5 + 0.5) * viewport.width,
        y: (0.5 - point.y * 0.5) * viewport.height,
      };
    },
    pause() {
      if (scene.pause) scene.pause();
    },
  };
}
