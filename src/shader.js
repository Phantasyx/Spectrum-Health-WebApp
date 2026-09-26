export const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

// UV convention matches src/coords.js: v = 0 is the top of the panorama,
// u = 0.5 looks down +Z. Camera basis matches projectDirection().
export const FRAG = `
precision mediump float;
uniform vec2 uResolution;
uniform float uYaw;
uniform float uPitch;
uniform float uFov;
uniform float uEquirect;
uniform float uPhoto;
uniform vec3 uRoomMin;
uniform vec3 uRoomMax;
uniform vec3 uWall;
uniform vec3 uFloorA;
uniform vec3 uFloorB;
uniform vec3 uCeiling;
uniform sampler2D uBoxes;
uniform sampler2D uPhotoTex;
uniform float uCount;

const float PI = 3.14159265359;
const float TAU = 6.28318530718;

vec3 rayFromUv(vec2 uv) {
  float lon = (uv.x - 0.5) * TAU;
  float lat = (0.5 - uv.y) * PI;
  float c = cos(lat);
  return vec3(sin(lon) * c, sin(lat), cos(lon) * c);
}

vec2 uvFromDir(vec3 d) {
  d = normalize(d);
  float lon = atan(d.x, d.z);
  float lat = asin(clamp(d.y, -1.0, 1.0));
  return vec2(lon / TAU + 0.5, 0.5 - lat / PI);
}

float dec(float e) {
  return e * 6.0 - 3.0;
}

bool hitBox(vec3 rd, vec3 bmin, vec3 bmax, out float t, out vec3 n) {
  vec3 inv = 1.0 / rd;
  vec3 t0 = bmin * inv;
  vec3 t1 = bmax * inv;
  vec3 tsm = min(t0, t1);
  vec3 tbg = max(t0, t1);
  float tmin = max(max(tsm.x, tsm.y), tsm.z);
  float tmax = min(min(tbg.x, tbg.y), tbg.z);
  if (tmax < max(tmin, 0.0)) return false;
  t = tmin > 0.001 ? tmin : tmax;
  if (t <= 0.001) return false;
  vec3 p = rd * t;
  vec3 c = (bmin + bmax) * 0.5;
  vec3 he = max((bmax - bmin) * 0.5, vec3(0.0001));
  vec3 d = (p - c) / he;
  n = vec3(0.0);
  if (abs(d.x) >= abs(d.y) && abs(d.x) >= abs(d.z)) n.x = sign(d.x);
  else if (abs(d.y) >= abs(d.z)) n.y = sign(d.y);
  else n.z = sign(d.z);
  return true;
}

vec3 shade(vec3 albedo, vec3 n, float pattern) {
  if (pattern > 2.5) {
    float h = clamp(n.y * 0.15 + 0.62, 0.0, 1.0);
    return mix(vec3(0.97, 0.93, 0.86), vec3(0.52, 0.73, 0.84), h);
  }
  if (pattern > 1.5) {
    return albedo;
  }
  vec3 key = normalize(vec3(0.2, 0.95, 0.28));
  vec3 fill = normalize(vec3(-0.55, 0.4, -0.2));
  float ndl = max(dot(n, key), 0.0);
  float ndf = max(dot(n, fill), 0.0);
  return albedo * (0.5 + 0.36 * ndl + 0.14 * ndf);
}

void main() {
  vec3 rd;
  if (uEquirect > 0.5) {
    rd = rayFromUv(gl_FragCoord.xy / uResolution);
  } else {
    float cosP = cos(uPitch);
    vec3 forward = vec3(sin(uYaw) * cosP, sin(uPitch), cos(uYaw) * cosP);
    vec3 right = normalize(vec3(-forward.z, 0.0, forward.x));
    vec3 up = cross(right, forward);
    vec2 ndc = (gl_FragCoord.xy / uResolution) * 2.0 - 1.0;
    float aspect = uResolution.x / uResolution.y;
    float scale = tan(uFov * 0.5);
    rd = normalize(forward + right * (ndc.x * aspect * scale) + up * (ndc.y * scale));
  }

  if (uPhoto > 0.5) {
    vec2 uv = uvFromDir(rd);
    // Photo textures are uploaded with UNPACK_FLIP_Y so v=0 is the bottom
    // of the file. Panorama v=0 is the top, so flip again here.
    vec3 col = texture2D(uPhotoTex, vec2(uv.x, 1.0 - uv.y)).rgb;
    gl_FragColor = vec4(col, 1.0);
    return;
  }

  float bestT = 1e9;
  vec3 bestN = vec3(0.0, 1.0, 0.0);
  vec3 bestColor = uWall;
  float bestPattern = 0.0;
  bool found = false;

  for (int i = 0; i < 16; i++) {
    if (float(i) < uCount) {
      float u = (float(i) + 0.5) / 16.0;
      vec4 row0 = texture2D(uBoxes, vec2(u, 0.5 / 3.0));
      vec4 row1 = texture2D(uBoxes, vec2(u, 1.5 / 3.0));
      vec4 row2 = texture2D(uBoxes, vec2(u, 2.5 / 3.0));
      vec3 bmin = vec3(dec(row0.r), dec(row0.g), dec(row0.b));
      vec3 bmax = vec3(dec(row1.r), dec(row1.g), dec(row1.b));
      float t;
      vec3 n;
      if (hitBox(rd, bmin, bmax, t, n)) {
        if (t < bestT) {
          bestT = t;
          bestN = n;
          bestColor = row2.rgb;
          bestPattern = floor(row0.a * 3.0 + 0.5);
          found = true;
        }
      }
    }
  }

  vec3 inv = 1.0 / rd;
  vec3 t0s = uRoomMin * inv;
  vec3 t1s = uRoomMax * inv;
  vec3 tsm = min(t0s, t1s);
  vec3 tbg = max(t0s, t1s);
  float tmax = min(min(tbg.x, tbg.y), tbg.z);
  vec3 shellP = rd * tmax;
  vec3 shellC = (uRoomMin + uRoomMax) * 0.5;
  vec3 shellHe = max((uRoomMax - uRoomMin) * 0.5, vec3(0.0001));
  vec3 sd = (shellP - shellC) / shellHe;
  vec3 shellN = vec3(0.0);
  if (abs(sd.x) >= abs(sd.y) && abs(sd.x) >= abs(sd.z)) shellN.x = sign(sd.x);
  else if (abs(sd.y) >= abs(sd.z)) shellN.y = sign(sd.y);
  else shellN.z = sign(sd.z);
  if (dot(shellN, rd) > 0.0) shellN = -shellN;

  vec3 color;
  if (found && bestT < tmax) {
    color = shade(bestColor, bestN, bestPattern);
  } else if (shellN.y > 0.5) {
    vec2 tile = floor(shellP.xz * 1.7);
    float check = mod(tile.x + tile.y, 2.0);
    vec3 albedo = mix(uFloorA, uFloorB, check);
    color = shade(albedo, shellN, 0.0);
  } else if (shellN.y < -0.5) {
    color = shade(uCeiling, shellN, 0.0);
  } else {
    float h = clamp((shellP.y - uRoomMin.y) / (uRoomMax.y - uRoomMin.y), 0.0, 1.0);
    color = shade(mix(uWall * 0.9, uWall, h), shellN, 0.0);
    float edge = max(abs(sd.x), abs(sd.z));
    color *= mix(1.0, 0.86, smoothstep(0.82, 1.0, edge));
  }

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;
