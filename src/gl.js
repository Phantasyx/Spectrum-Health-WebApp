import { FRAG, VERT } from './shader.js';

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(log || 'Shader failed to compile.');
  }
  return shader;
}

function encodeCoord(value) {
  return Math.max(0, Math.min(255, Math.round(((value + 3) / 6) * 255)));
}

function encodeUnit(value) {
  return Math.max(0, Math.min(255, Math.round(value * 255)));
}

function boxTextureData(boxes) {
  const data = new Uint8Array(16 * 3 * 4);
  boxes.slice(0, 16).forEach((item, index) => {
    const pattern = Math.max(0, Math.min(3, item.pattern || 0)) / 3;
    const rows = [
      [encodeCoord(item.min[0]), encodeCoord(item.min[1]), encodeCoord(item.min[2]), encodeUnit(pattern)],
      [encodeCoord(item.max[0]), encodeCoord(item.max[1]), encodeCoord(item.max[2]), 255],
      [encodeUnit(item.color[0]), encodeUnit(item.color[1]), encodeUnit(item.color[2]), 255],
    ];
    rows.forEach((pixel, row) => {
      const offset = (row * 16 + index) * 4;
      data.set(pixel, offset);
    });
  });
  return data;
}

export function createRenderer(canvas) {
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    preserveDrawingBuffer: true,
    powerPreference: 'low-power',
  });
  if (!gl) return null;

  const program = gl.createProgram();
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || 'Shader program failed to link.');
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const boxTex = gl.createTexture();
  const photoTex = gl.createTexture();
  const uniform = (name) => gl.getUniformLocation(program, name);
  const loc = {
    resolution: uniform('uResolution'),
    yaw: uniform('uYaw'),
    pitch: uniform('uPitch'),
    fov: uniform('uFov'),
    equirect: uniform('uEquirect'),
    photo: uniform('uPhoto'),
    roomMin: uniform('uRoomMin'),
    roomMax: uniform('uRoomMax'),
    wall: uniform('uWall'),
    floorA: uniform('uFloorA'),
    floorB: uniform('uFloorB'),
    ceiling: uniform('uCeiling'),
    boxes: uniform('uBoxes'),
    photoTex: uniform('uPhotoTex'),
    count: uniform('uCount'),
  };

  let photoSource = null;

  function uploadBoxes(boxes) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, boxTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      16,
      3,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      boxTextureData(boxes),
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  function uploadPhoto(image) {
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, photoTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    photoSource = image;
  }

  return {
    draw(options) {
      const scene = options.scene;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      if (scene) uploadBoxes(scene.boxes);
      if (options.photo && options.photo !== photoSource) uploadPhoto(options.photo);

      gl.uniform2f(loc.resolution, canvas.width, canvas.height);
      gl.uniform1f(loc.yaw, options.yaw || 0);
      gl.uniform1f(loc.pitch, options.pitch || 0);
      gl.uniform1f(loc.fov, options.fov || 1.15);
      gl.uniform1f(loc.equirect, options.equirect ? 1 : 0);
      gl.uniform1f(loc.photo, options.photo ? 1 : 0);
      gl.uniform1f(loc.count, scene ? Math.min(scene.boxes.length, 16) : 0);
      if (scene) {
        gl.uniform3fv(loc.roomMin, scene.roomMin);
        gl.uniform3fv(loc.roomMax, scene.roomMax);
        gl.uniform3fv(loc.wall, scene.wall);
        gl.uniform3fv(loc.floorA, scene.floorA);
        gl.uniform3fv(loc.floorB, scene.floorB);
        gl.uniform3fv(loc.ceiling, scene.ceiling);
      }
      gl.uniform1i(loc.boxes, 0);
      gl.uniform1i(loc.photoTex, 1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose() {
      gl.deleteTexture(boxTex);
      gl.deleteTexture(photoTex);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    },
  };
}

const thumbCache = new Map();

export function thumbnailFor(scene) {
  if (thumbCache.has(scene.id)) return thumbCache.get(scene.id);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 420;
    const renderer = createRenderer(canvas);
    if (!renderer) {
      thumbCache.set(scene.id, '');
      return '';
    }
    renderer.draw({
      scene,
      yaw: scene.initialYaw,
      pitch: scene.initialPitch,
      fov: 1.15,
      equirect: false,
    });
    const url = canvas.toDataURL('image/jpeg', 0.86);
    renderer.dispose();
    thumbCache.set(scene.id, url);
    return url;
  } catch (error) {
    console.error(error);
    thumbCache.set(scene.id, '');
    return '';
  }
}
