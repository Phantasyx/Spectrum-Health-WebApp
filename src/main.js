import './style.css';
import {
  clamp,
  hitboxAroundUv,
  hitboxCenterDirection,
  hitboxCenterUv,
  hitboxesOverlap,
  imageRectToHitbox,
  lookYawPitch,
  projectDirection,
} from './coords.js';
import { sampleCatalog, sceneById } from './scenes.js';
import {
  applySampleEdits,
  cleanText,
  emptyAdditions,
  loadAdditions,
  loadSampleEdits,
  resetSampleEdits,
  saveAdditions,
  saveSampleEdit,
} from './store.js';
import { readUpload } from './upload.js';
import { EXAMPLE_PASSWORD, EXAMPLE_USER, isSignedIn, signIn, signOut } from './auth.js';

const content = document.querySelector('#content');
const navLinks = [...document.querySelectorAll('[data-nav]')];
let viewAbort = new AbortController();
let frame = 0;

function nextSignal() {
  viewAbort.abort();
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  viewAbort = new AbortController();
  return viewAbort.signal;
}

function catalog() {
  const extra = loadAdditions();
  const base = sampleCatalog();
  return {
    buildings: [...base.buildings, ...extra.buildings],
    rooms: [...base.rooms, ...extra.rooms],
    hitboxes: [...applySampleEdits(base.hitboxes, loadSampleEdits()), ...extra.hitboxes],
  };
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value == null || value === false) return;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else node.setAttribute(key, value === true ? '' : value);
  });
  children.flat().filter((child) => child != null && child !== false).forEach((child) => {
    node.append(typeof child === 'string' ? document.createTextNode(child) : child);
  });
  return node;
}

function setTitle(title) {
  document.title = title
    ? `${title} · First Look`
    : 'First Look';
}

function render() {
  const signal = nextSignal();
  const path = (location.hash || '#/').replace(/^#/, '') || '/';
  const explore = path === '/' || path === '';
  const admin = path === '/admin';
  document.body.classList.toggle('is-admin', admin);
  const signOutButton = document.querySelector('#sign-out');
  if (signOutButton) signOutButton.hidden = !(admin && isSignedIn());
  navLinks.forEach((link) => {
    const current = link.dataset.nav === 'explore' && explore;
    if (current) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  content.replaceChildren();
  if (path.startsWith('/room/')) {
    renderRoom(decodeURIComponent(path.slice('/room/'.length)), signal);
  } else if (admin) {
    if (!isSignedIn()) renderLogin(signal);
    else renderAdmin(signal);
  } else {
    renderExplore();
  }
}

function renderExplore() {
  setTitle('');
  const data = catalog();
  const hero = el('section', { class: 'hero' }, [
    el('div', {}, [
      el('p', { class: 'kicker', text: 'Browser room tours' }),
      el('h1', { text: 'See the room before you arrive' }),
      el('p', {
        class: 'lede',
        text: 'Look around a 360° photograph and read labeled points of interest. First Look is for orientation, training, and facility walkthroughs.',
      }),
      el('div', { class: 'actions' }, [
        el('a', { class: 'button', href: '#/room/sample-operating', text: 'Start in the operating room' }),
        el('a', { class: 'button secondary', href: '#/room/sample-office', text: 'Try a sample' }),
      ]),
    ]),
    el('aside', {
      class: 'note',
      text: 'Sample photographs are ready to open, so you can look around without uploading a file.',
    }),
  ]);

  const blocks = data.buildings.map((building) => {
    const rooms = data.rooms.filter((room) => room.buildingId === building.id);
    return el('section', { class: 'catalog-block' }, [
      el('div', { class: 'section-head' }, [
        el('h2', { text: building.name }),
        el('p', { text: `${rooms.length} room${rooms.length === 1 ? '' : 's'}` }),
      ]),
      el('div', { class: 'cards' }, rooms.map((room) => roomCard(room, data))),
    ]);
  });

  content.append(hero, ...blocks);
}

function roomCard(room, data) {
  const count = data.hitboxes.filter((hitbox) => hitbox.roomId === room.id).length;
    const scene = sceneById(room.scene);
    const media = el('div', { class: 'card-media', role: 'img', 'aria-label': `${room.name} preview` });
    const preview = room.poster || room.imageFile;
    if (preview) {
      media.style.backgroundImage = `url("${preview}")`;
    } else if (scene) {
      import('./gl.js').then(({ thumbnailFor }) => {
        try {
          const thumb = thumbnailFor(scene);
          if (thumb) media.style.backgroundImage = `url("${thumb}")`;
        } catch (error) {
          console.error(error);
        }
      }).catch((error) => console.error(error));
    }
  return el('article', { class: 'card' }, [
    media,
    el('div', { class: 'card-body' }, [
      el('h3', { text: room.name }),
      el('p', { text: room.summary || 'Uploaded panorama.' }),
      room.credit ? el('p', { text: room.credit }) : null,
      el('p', { text: `${count} point${count === 1 ? '' : 's'} of interest` }),
      el('a', { class: 'button', href: `#/room/${encodeURIComponent(room.id)}`, text: 'Look around' }),
    ]),
  ]);
}

function renderRoom(roomId, signal) {
  const data = catalog();
  const room = data.rooms.find((item) => item.id === roomId);
  if (!room) {
    setTitle('Room not found');
    content.append(
      el('h1', { text: 'That room is not in this browser' }),
      el('p', { text: 'It may have been cleared from this browser.' }),
      el('a', { class: 'button', href: '#/', text: 'Back to rooms' }),
    );
    return;
  }

  setTitle(room.name);
  const hitboxes = data.hitboxes.filter((hitbox) => hitbox.roomId === room.id);
  const scene = sceneById(room.scene);
  const camera = {
    yaw: scene ? scene.initialYaw : 0,
    pitch: scene ? scene.initialPitch : 0,
    fov: 1.15,
  };
  let activeId = hitboxes[0] ? hitboxes[0].id : '';
  let photo = null;
  let renderer = null;
  let sky = null;

  const caption = el('p', { class: 'stage-caption', 'aria-hidden': 'true' });
  const stage = el('div', { class: 'stage' }, [
    el('div', { class: 'reticle', 'aria-hidden': 'true' }),
    caption,
  ]);
  if (room.poster) {
    stage.prepend(el('img', {
      class: 'stage-poster',
      alt: '',
      decoding: 'async',
      src: room.poster,
    }));
  }
  let canvas = null;
  if (!room.imageFile) {
    canvas = el('canvas', { width: '1280', height: '720' });
    canvas.setAttribute('aria-hidden', 'true');
    stage.prepend(canvas);
  }
  const detail = el('div', { class: 'detail', 'aria-live': 'polite' });
  const list = el('ul', { class: 'poi-list' });
  const panel = el('aside', { class: 'panel' }, [
    el('h2', { text: 'Points of interest' }),
    el('p', { class: 'hint', text: 'Choose an item to turn toward it and read what it is. You can also drag the view.' }),
    list,
    detail,
  ]);

  const markers = new Map();
  hitboxes.forEach((hitbox) => {
    const button = el('button', { type: 'button', class: 'marker' }, [
      el('span', { class: 'marker-dot', 'aria-hidden': 'true' }),
      el('span', { class: 'label', text: hitbox.text }),
    ]);
    button.addEventListener('click', () => select(hitbox.id, true), { signal });
    stage.append(button);
    markers.set(hitbox.id, button);

    const row = el('li', {}, [
      el('button', { type: 'button', text: hitbox.text }),
    ]);
    row.querySelector('button').addEventListener('click', () => select(hitbox.id, true), { signal });
    list.append(row);
  });

  if (!hitboxes.length) {
    list.append(el('li', { text: 'No points of interest have been marked in this room yet.' }));
  }

  function select(id, aim) {
    activeId = id;
    const hitbox = hitboxes.find((item) => item.id === id);
    if (!hitbox) return;
    if (aim) {
      if (sky) sky.aim(hitbox);
      else {
        const look = lookYawPitch(hitboxCenterDirection(hitbox));
        camera.yaw = look.yaw;
        camera.pitch = clamp(look.pitch, -1.05, 1.05);
      }
    }
    caption.textContent = hitbox.text;
    detail.replaceChildren(
      el('h3', { text: hitbox.text }),
      el('p', { text: hitbox.sub || 'No description was added for this point.' }),
    );
    markers.forEach((marker, markerId) => {
      marker.setAttribute('aria-pressed', markerId === id ? 'true' : 'false');
    });
    list.querySelectorAll('button').forEach((button) => {
      const current = button.textContent === hitbox.text;
      if (current) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    drawFrame();
  }

  function drawFrame() {
    if (sky) {
      const viewport = stage.getBoundingClientRect();
      markers.forEach((marker, id) => {
        const hitbox = hitboxes.find((item) => item.id === id);
        const point = sky.project(hitbox, viewport);
        placeMarker(marker, point, viewport);
      });
      return;
    }
    if (!canvas) return;
    if (renderer) {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(2, Math.floor(rect.width * dpr));
      const height = Math.max(2, Math.floor(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      renderer.draw({
        scene,
        photo,
        yaw: camera.yaw,
        pitch: camera.pitch,
        fov: camera.fov,
      });
    }
    const viewport = canvas.getBoundingClientRect();
    markers.forEach((marker, id) => {
      const hitbox = hitboxes.find((item) => item.id === id);
      const point = projectDirection(hitboxCenterDirection(hitbox), camera, {
        width: viewport.width,
        height: viewport.height,
      });
      placeMarker(marker, point, viewport);
    });
  }

  function placeMarker(marker, point, viewport) {
    if (!point) {
      marker.hidden = true;
      return;
    }
    marker.hidden = false;
    marker.style.left = `${point.x}px`;
    marker.style.top = `${point.y}px`;
    marker.classList.toggle('label-flip', point.x > viewport.width * 0.62);
  }

  function loop() {
    drawFrame();
    frame = requestAnimationFrame(loop);
  }

  const look = (yawDelta, pitchDelta) => {
    if (sky) {
      sky.nudge(yawDelta, pitchDelta);
      return;
    }
    camera.yaw += yawDelta;
    camera.pitch = clamp(camera.pitch + pitchDelta, -1.05, 1.05);
  };

  const controls = el('div', { class: 'look-controls', role: 'group', 'aria-label': 'Look around' }, [
    control('Left', () => look(-0.18, 0)),
    control('Right', () => look(0.18, 0)),
    control('Up', () => look(0, 0.12)),
    control('Down', () => look(0, -0.12)),
  ]);

  content.append(
    el('div', { class: 'viewer-top' }, [
      el('div', {}, [
        el('p', { class: 'kicker', text: '360° room' }),
        el('h1', { text: room.name }),
      ]),
      el('a', { class: 'button secondary', href: '#/', text: 'All rooms' }),
    ]),
    el('div', { class: 'viewer-layout' }, [stage, panel]),
    room.credit ? el('p', { class: 'credit', text: room.credit }) : null,
    controls,
    el('p', {
      class: 'hint',
      text: 'Drag to look around the 360° photo, or use the arrow keys. Enter VR for a headset.',
    }),
  );

  if (window.DeviceOrientationEvent) {
    const orient = el('button', { class: 'button secondary', type: 'button', text: 'Use device orientation' });
    orient.addEventListener('click', async () => {
      const eventType = window.DeviceOrientationEvent;
      if (typeof eventType.requestPermission === 'function') {
        const result = await eventType.requestPermission();
        if (result !== 'granted') return;
      }
      if (sky) sky.useDeviceOrientation();
      else {
        window.addEventListener('deviceorientation', (event) => {
          if (event.beta == null) return;
          camera.pitch = clamp(((event.beta - 70) * Math.PI) / 180, -1.05, 1.05);
          if (event.alpha != null) camera.yaw = (event.alpha * Math.PI) / 180;
        }, { signal });
      }
      orient.disabled = true;
      orient.textContent = 'Device orientation on';
    }, { signal });
    controls.append(orient);
  }

  if (canvas) bindLook(stage, canvas, camera, signal);
  window.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 0.08 : 0.16;
    if (event.key === 'ArrowLeft') look(-step, 0);
    else if (event.key === 'ArrowRight') look(step, 0);
    else if (event.key === 'ArrowUp') look(0, step);
    else if (event.key === 'ArrowDown') look(0, -step);
    else return;
    event.preventDefault();
  }, { signal });
  window.addEventListener('resize', drawFrame, { signal });

  if (room.imageFile) {
    import('./sky.js').then(({ mountPanorama }) => {
      if (signal.aborted) return;
      sky = mountPanorama(stage, room.imageFile);
      signal.addEventListener('abort', () => sky.pause());
      return sky.ready;
    }).then(() => {
      if (signal.aborted || !sky) return;
      stage.classList.add('is-ready');
      if (hitboxes[0]) select(hitboxes[0].id, true);
      else drawFrame();
      loop();
    }).catch((error) => {
      console.error(error);
      stage.append(el('p', { class: 'fallback', text: 'The 360 view could not start in this browser. The point-of-interest list still works.' }));
      if (hitboxes[0]) select(hitboxes[0].id, false);
    });
    return;
  }

  import('./gl.js').then(({ createRenderer }) => {
    if (signal.aborted) return null;
    try {
      return createRenderer(canvas);
    } catch (error) {
      console.error(error);
      return null;
    }
  }).then((next) => {
    if (signal.aborted) return;
    renderer = next;
    if (!renderer) {
      stage.append(el('p', { class: 'fallback', text: 'The 360 view could not start in this browser. The point-of-interest list still works.' }));
      if (hitboxes[0]) select(hitboxes[0].id, false);
      return;
    }
    if (hitboxes[0]) select(hitboxes[0].id, !scene);
    else drawFrame();
    loop();
  }).catch((error) => {
    console.error(error);
    if (signal.aborted) return;
    stage.append(el('p', { class: 'fallback', text: 'The 360 view could not start in this browser. The point-of-interest list still works.' }));
    if (hitboxes[0]) select(hitboxes[0].id, false);
  });
}

function control(label, onClick) {
  const button = el('button', { type: 'button', class: 'button secondary', text: label });
  button.addEventListener('click', onClick);
  return button;
}

function bindLook(stage, canvas, camera, signal) {
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  stage.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.marker')) return;
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    stage.setPointerCapture(event.pointerId);
  }, { signal });
  stage.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    camera.yaw -= dx / Math.max(rect.width, 1) * camera.fov;
    camera.pitch = clamp(camera.pitch + dy / Math.max(rect.height, 1) * camera.fov, -1.05, 1.05);
  }, { signal });
  const stop = () => {
    dragging = false;
  };
  stage.addEventListener('pointerup', stop, { signal });
  stage.addEventListener('pointercancel', stop, { signal });
  stage.addEventListener('wheel', (event) => {
    event.preventDefault();
    camera.fov = clamp(camera.fov + Math.sign(event.deltaY) * 0.06, 0.7, 1.5);
  }, { signal, passive: false });
}

function renderLogin(signal) {
  setTitle('Sign in');
  const status = el('p', { class: 'status', role: 'status' });
  const user = el('input', { id: 'admin-user', type: 'text', autocomplete: 'username', required: 'required' });
  const password = el('input', { id: 'admin-password', type: 'password', autocomplete: 'current-password', required: 'required' });
  const form = el('form', {}, [
    el('label', {}, ['Name', user]),
    el('label', {}, ['Password', password]),
    el('button', { class: 'button', type: 'submit', text: 'Sign in' }),
    status,
  ]);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!signIn(user.value, password.value)) {
      status.textContent = 'That name or password does not match the example account.';
      status.classList.add('error');
      return;
    }
    render();
  }, { signal });
  content.append(el('section', { class: 'login-card' }, [
    el('p', { class: 'kicker', text: 'Annotate' }),
    el('h1', { text: 'Sign in' }),
    el('p', { text: 'Sign in to edit points of interest and add rooms. Changes stay in this browser.' }),
    el('p', { class: 'hint', text: `Example account: ${EXAMPLE_USER} / ${EXAMPLE_PASSWORD}` }),
    form,
  ]));
}

function renderAdmin(signal) {
  setTitle('Annotate');
  const data = catalog();
  const drafts = [];
  let draftRect = null;
  let image = null;
  let prepared = null;
  let activeSample = null;
  const status = el('p', { class: 'status', role: 'status' });

  const buildingSelect = el('select', { id: 'building', required: 'required' }, [
    el('option', { value: '', text: 'Select a building' }),
    ...data.buildings.map((building) => el('option', { value: building.id, text: building.name })),
    el('option', { value: '__new', text: 'Add a new building' }),
  ]);
  const newBuildingWrap = el('label', { id: 'new-building-label' }, [
    'New building name',
    el('input', { id: 'new-building', type: 'text', maxlength: '255', autocomplete: 'off' }),
  ]);
  newBuildingWrap.hidden = true;
  buildingSelect.addEventListener('change', () => {
    newBuildingWrap.hidden = buildingSelect.value !== '__new';
  }, { signal });

  const roomName = el('input', { id: 'room-name', type: 'text', maxlength: '255', required: 'required', autocomplete: 'off' });
  const fileInput = el('input', {
    id: 'panorama',
    type: 'file',
    accept: 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp',
  });
  const titleInput = el('input', { id: 'poi-title', type: 'text', maxlength: '255', autocomplete: 'off' });
  const bodyInput = el('textarea', { id: 'poi-body', maxlength: '1000' });
  const canvas = el('canvas', {
    class: 'annotate-canvas',
    width: '960',
    height: '480',
    'aria-label': 'Panorama preview. Drag a rectangle around an item, or add a point without drawing to place one in the middle.',
  });
  const draftList = el('ul', { class: 'draft-list' });

  function showImage(img) {
    image = img;
    const maxWidth = 960;
    const scale = Math.min(1, maxWidth / img.width);
    canvas.width = Math.max(2, Math.round(img.width * scale));
    canvas.height = Math.max(2, Math.round(img.height * scale));
    draftRect = null;
    drafts.splice(0, drafts.length);
    paint();
    refreshDrafts();
  }

  function useSample(room) {
    const img = new Image();
    img.onload = () => {
      prepared = null;
      activeSample = room;
      fileInput.value = '';
      showImage(img);
      if (!cleanText(roomName.value, 255)) roomName.value = `${room.name} notes`;
      if (!buildingSelect.value) {
        buildingSelect.value = room.buildingId;
        newBuildingWrap.hidden = true;
      }
      setStatus(`Using the sample photograph “${room.name}”. Mark a point and save it in this browser. No upload is required.`);
    };
    img.onerror = () => setStatus('That sample photograph could not be loaded.', true);
    img.src = room.imageFile;
  }

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    const result = await readUpload(file);
    if (!result.ok) {
      image = null;
      prepared = null;
      activeSample = null;
      fileInput.value = '';
      paint();
      return setStatus(result.error, true);
    }
    const preview = new Image();
    preview.onload = () => {
      activeSample = null;
      prepared = { dataUrl: result.dataUrl };
      showImage(preview);
      const wide = result.width / Math.max(result.height, 1);
      const shape = wide > 1.85 && wide < 2.15
        ? 'It will be shown as a 360° photo.'
        : 'It is not about twice as wide as it is tall, so the room view will stretch it.';
      setStatus(`Ready. ${shape} JPEG, PNG, and WebP are accepted up to 8 MB. The copy kept here is a JPEG, so the file name and camera data are dropped. Nothing is sent to a server.`);
    };
    preview.onerror = () => setStatus('The image could not be read. It may be truncated or damaged.', true);
    preview.src = result.dataUrl;
  }, { signal });

  function paint() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (image) ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(15, 92, 98, 0.35)';
    drafts.forEach((hitbox) => strokeHitbox(ctx, hitbox));
    if (draftRect) {
      ctx.strokeStyle = '#9a4d12';
      ctx.lineWidth = 2;
      ctx.strokeRect(draftRect.x, draftRect.y, draftRect.w, draftRect.h);
      ctx.fillRect(draftRect.x, draftRect.y, draftRect.w, draftRect.h);
    }
  }

  function strokeHitbox(ctx, hitbox) {
    const x = hitbox.left * canvas.width;
    const y = (1 - hitbox.top) * canvas.height;
    const w = (hitbox.right - hitbox.left) * canvas.width;
    const h = (hitbox.top - hitbox.bottom) * canvas.height;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#0f5c62';
    ctx.strokeRect(x, y, w, h);
  }

  let drag = null;
  canvas.addEventListener('pointerdown', (event) => {
    if (!image) {
      setStatus('Choose a panorama or try a sample before marking a point.', true);
      return;
    }
    const point = canvasPoint(event, canvas);
    drag = point;
    draftRect = { x: point.x, y: point.y, w: 0, h: 0 };
    canvas.setPointerCapture(event.pointerId);
  }, { signal });
  canvas.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const point = canvasPoint(event, canvas);
    draftRect = {
      x: Math.min(drag.x, point.x),
      y: Math.min(drag.y, point.y),
      w: Math.abs(point.x - drag.x),
      h: Math.abs(point.y - drag.y),
    };
    paint();
  }, { signal });
  canvas.addEventListener('pointerup', () => {
    drag = null;
  }, { signal });

  function refreshDrafts() {
    draftList.replaceChildren();
    if (!drafts.length) {
      draftList.append(el('li', { text: 'No points yet.' }));
      return;
    }
    drafts.forEach((hitbox, index) => {
      const remove = el('button', { type: 'button', class: 'button quiet', text: 'Remove' });
      remove.addEventListener('click', () => {
        drafts.splice(index, 1);
        paint();
        refreshDrafts();
      }, { signal });
      draftList.append(el('li', {}, [el('span', { text: hitbox.text }), remove]));
    });
  }

  const addPoint = el('button', { type: 'button', class: 'button secondary', text: 'Add point of interest' });
  addPoint.addEventListener('click', () => {
    const title = cleanText(titleInput.value, 255);
    const sub = cleanText(bodyInput.value, 1000);
    if (!image) return setStatus('Choose a panorama or try a sample first.', true);
    if (!title) return setStatus('Add a title for this point.', true);
    let hitbox;
    if (draftRect && draftRect.w >= 8 && draftRect.h >= 8) {
      hitbox = imageRectToHitbox(draftRect.x, draftRect.y, draftRect.x + draftRect.w, draftRect.y + draftRect.h, canvas.width, canvas.height);
    } else {
      const shift = (drafts.length % 3) * 0.14;
      hitbox = imageRectToHitbox(
        canvas.width * (0.4 + shift),
        canvas.height * 0.38,
        canvas.width * (0.56 + shift),
        canvas.height * 0.62,
        canvas.width,
        canvas.height,
      );
    }
    const candidate = { ...hitbox, text: title, sub, id: `draft-${drafts.length}` };
    if (drafts.some((existing) => hitboxesOverlap(existing, candidate))) {
      return setStatus('That area overlaps a point you already added. Draw a different region.', true);
    }
    drafts.push(candidate);
    draftRect = null;
    titleInput.value = '';
    bodyInput.value = '';
    paint();
    refreshDrafts();
    setStatus(`Added “${title}”.`);
  }, { signal });

  const sampleButtons = data.rooms.filter((room) => room.sample).map((room) => {
    const button = el('button', { type: 'button', class: 'button secondary', text: room.name });
    button.addEventListener('click', () => useSample(room), { signal });
    return button;
  });

  const form = el('form', { class: 'form-grid', id: 'admin-form' }, [
    el('h2', { text: 'Add a room' }),
    el('p', {
      class: 'hint',
      text: 'Try a sample photograph, or upload your own equirectangular 360° image. JPEG, PNG, and WebP only, up to 8 MB. The file has to be a complete image, and the contents have to match the type. First Look redraws an upload as a JPEG in this browser, which drops the file name and camera data. Nothing is sent to a server.',
    }),
    el('div', { class: 'sample-row' }, [
      el('p', { class: 'hint', text: 'Try a sample' }),
      ...sampleButtons,
    ]),
    el('label', {}, ['Your panorama, if you have one', fileInput]),
    canvas,
    el('label', {}, ['Building', buildingSelect]),
    newBuildingWrap,
    el('label', {}, ['Room name', roomName]),
    el('label', {}, ['Point title', titleInput]),
    el('label', {}, ['Description', bodyInput]),
    el('div', { class: 'form-actions' }, [addPoint]),
    draftList,
    el('button', { class: 'button', type: 'submit', text: 'Save room in this browser' }),
    status,
  ]);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = cleanText(roomName.value, 255);
    if (!image || (!activeSample && !prepared)) return setStatus('Choose a panorama or try a sample.', true);
    if (!name) return setStatus('Enter a room name.', true);

    let buildingId = buildingSelect.value;
    const additions = loadAdditions();
    if (buildingId === '__new') {
      const buildingName = cleanText(newBuildingWrap.querySelector('input').value, 255);
      if (!buildingName) return setStatus('Enter a name for the new building.', true);
      buildingId = `local-b-${crypto.randomUUID()}`;
      additions.buildings.push({ id: buildingId, name: buildingName, sample: false });
    }
    if (!buildingId) return setStatus('Select a building.', true);

    const imageFile = activeSample ? activeSample.imageFile : prepared.dataUrl;

    const roomId = `local-r-${crypto.randomUUID()}`;
    additions.rooms.push({
      id: roomId,
      buildingId,
      name,
      summary: 'Added in this browser.',
      imageFile,
      scene: '',
      sample: false,
    });
    drafts.forEach((hitbox) => {
      additions.hitboxes.push({
        ...hitbox,
        id: `local-h-${crypto.randomUUID()}`,
        roomId,
      });
    });
    saveAdditions(additions);
    location.hash = `#/room/${encodeURIComponent(roomId)}`;
  }, { signal });

  const manage = el('aside', { class: 'panel stack' }, [
    el('h2', { text: 'Rooms in this browser' }),
    el('p', { class: 'hint', text: 'Edit a sample point to change its name, description, or place in the photograph. Rooms you add can be removed here. Deleting a building also removes the rooms and points saved under it.' }),
  ]);
  const editorHost = el('div', { id: 'poi-editor' });
  manage.append(editorHost);
  data.buildings.forEach((building) => {
    const rooms = data.rooms.filter((room) => room.buildingId === building.id);
    const block = el('section', {}, [el('h3', { text: building.name })]);
    rooms.forEach((room) => {
      const row = el('div', { class: 'room-row' }, [
        el('a', { href: `#/room/${encodeURIComponent(room.id)}`, text: room.name }),
      ]);
      if (room.sample) {
        const points = data.hitboxes.filter((hitbox) => hitbox.roomId === room.id);
        const list = el('ul', { class: 'poi-list' });
        points.forEach((hitbox) => {
          const edit = el('button', { type: 'button', class: 'button quiet', text: 'Edit' });
          edit.addEventListener('click', () => openPointEditor(hitbox, room), { signal });
          list.append(el('li', { class: 'room-row' }, [
            el('span', { text: hitbox.text }),
            edit,
          ]));
        });
        block.append(list);
      }
      if (!room.sample) {
        const remove = el('button', { type: 'button', class: 'button quiet', text: 'Delete' });
        remove.addEventListener('click', () => {
          if (!window.confirm(`Delete ${room.name}? Points of interest in that room are removed too.`)) return;
          const additions = loadAdditions();
          additions.rooms = additions.rooms.filter((item) => item.id !== room.id);
          additions.hitboxes = additions.hitboxes.filter((item) => item.roomId !== room.id);
          saveAdditions(additions);
          render();
        }, { signal });
        row.append(remove);
      }
      block.append(row);
    });
    if (!building.sample) {
      const removeBuilding = el('button', { type: 'button', class: 'button quiet', text: 'Delete this building' });
      removeBuilding.addEventListener('click', () => {
        if (!window.confirm(`Delete ${building.name} and every room saved under it?`)) return;
        const additions = loadAdditions();
        const roomIds = new Set(additions.rooms.filter((room) => room.buildingId === building.id).map((room) => room.id));
        additions.buildings = additions.buildings.filter((item) => item.id !== building.id);
        additions.rooms = additions.rooms.filter((room) => room.buildingId !== building.id);
        additions.hitboxes = additions.hitboxes.filter((hitbox) => !roomIds.has(hitbox.roomId));
        saveAdditions(additions);
        render();
      }, { signal });
      block.append(removeBuilding);
    }
    manage.append(block);
  });

  function openPointEditor(hitbox, room) {
    const center = hitboxCenterUv(hitbox);
    let placement = { u: center.u, v: center.v };
    const title = el('input', { type: 'text', maxlength: '255', value: hitbox.text });
    const body = el('textarea', { maxlength: '1000' });
    body.value = hitbox.sub || '';
    const canvas = el('canvas', { width: '640', height: '320', 'aria-label': `Photograph of ${room.name}. Click where this point should sit.` });
    const note = el('p', { class: 'status', role: 'status' });
    const img = new Image();
    img.onload = () => {
      const maxWidth = 640;
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = Math.max(2, Math.round(img.width * scale));
      canvas.height = Math.max(2, Math.round(img.height * scale));
      drawPlacement();
    };
    img.alt = '';
    img.src = room.imageFile;

    function drawPlacement() {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (img.complete && img.naturalWidth) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const x = placement.u * canvas.width;
      const y = placement.v * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#0f5c62';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#f4efe4';
      ctx.stroke();
    }

    canvas.addEventListener('pointerdown', (event) => {
      const point = canvasPoint(event, canvas);
      placement = {
        u: clamp(point.x / canvas.width, 0.02, 0.98),
        v: clamp(point.y / canvas.height, 0.02, 0.98),
      };
      drawPlacement();
    }, { signal });

    const save = el('button', { type: 'button', class: 'button', text: 'Save point' });
    save.addEventListener('click', () => {
      const nextTitle = cleanText(title.value, 255);
      if (!nextTitle) {
        note.textContent = 'Add a title for this point.';
        note.classList.add('error');
        return;
      }
      const box = hitboxAroundUv(placement.u, placement.v);
      saveSampleEdit({
        ...box,
        id: hitbox.id,
        roomId: hitbox.roomId,
        text: nextTitle,
        sub: cleanText(body.value, 1000),
      });
      render();
    }, { signal });
    const cancel = el('button', { type: 'button', class: 'button secondary', text: 'Cancel' });
    cancel.addEventListener('click', () => {
      editorHost.replaceChildren();
    }, { signal });

    editorHost.replaceChildren(el('div', { class: 'poi-edit' }, [
      el('h3', { text: `Edit ${hitbox.text}` }),
      el('p', { class: 'hint', text: `Click the photograph to move this point in ${room.name}.` }),
      canvas,
      el('label', {}, ['Title', title]),
      el('label', {}, ['Description', body]),
      el('div', { class: 'form-actions' }, [save, cancel]),
      note,
    ]));
    editorHost.scrollIntoView({ block: 'nearest' });
  }

  const resetSamples = el('button', { type: 'button', class: 'button secondary', text: 'Reset sample points' });
  resetSamples.addEventListener('click', () => {
    if (!window.confirm('Put every sample point back to its original name, description, and place?')) return;
    resetSampleEdits();
    render();
  }, { signal });
  manage.append(resetSamples);

  const reset = el('button', { type: 'button', class: 'button secondary', text: 'Clear rooms added in this browser' });
  reset.addEventListener('click', () => {
    if (!window.confirm('Remove every room added in this browser? The sample tour stays.')) return;
    saveAdditions(emptyAdditions());
    render();
  }, { signal });
  manage.append(reset);

  content.append(
    el('div', {}, [
      el('p', { class: 'kicker', text: 'Annotate' }),
      el('h1', { text: 'Rooms and points' }),
      el('p', {
        class: 'lede',
        text: 'Edit a sample point, or add a room from a sample photograph or your own panorama. What you save stays in this browser.',
      }),
    ]),
    el('div', { class: 'layout-admin' }, [form, manage]),
  );
  refreshDrafts();
  paint();
}

function canvasPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) * canvas.width) / Math.max(rect.width, 1),
    y: ((event.clientY - rect.top) * canvas.height) / Math.max(rect.height, 1),
  };
}

function setStatus(message, isError) {
  const node = document.querySelector('.status');
  if (!node) return;
  node.textContent = message;
  node.classList.toggle('error', Boolean(isError));
}

document.querySelector('#sign-out')?.addEventListener('click', () => {
  signOut();
  if ((location.hash || '#/') === '#/admin') render();
  else location.hash = '#/admin';
});

window.addEventListener('hashchange', render);
render();
