import { hitboxFromPoint } from './coords.js';

function hex(value) {
  const n = Number.parseInt(value.slice(1), 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function box(min, max, color, pattern = 0) {
  return { min, max, color: hex(color), pattern };
}

function point(roomId, id, text, sub, at) {
  return {
    id,
    roomId,
    text,
    sub,
    at,
    ...hitboxFromPoint(at),
  };
}

export const SCENES = [
  {
    id: 'operating',
    roomName: 'Operating room',
    summary: 'The lights, table, and machines a procedure room is built around.',
    initialYaw: -0.05,
    initialPitch: -0.08,
    wall: hex('#d5e0e2'),
    floorA: hex('#c5d0d2'),
    floorB: hex('#b4c2c4'),
    ceiling: hex('#f4f7f7'),
    roomMin: [-2.4, -1.2, -2.3],
    roomMax: [2.4, 1.45, 2.6],
    boxes: [
      box([-0.16, -1.2, 0.55], [0.16, -0.72, 0.95], '#c5d0d4'),
      box([-0.46, -0.78, 0.15], [0.46, -0.62, 1.45], '#d5dee2'),
      box([-0.38, -0.62, 0.25], [0.38, -0.48, 1.35], '#1f7a78'),
      box([-0.42, 0.52, 0.65], [0.42, 0.7, 1.28], '#fff1d8', 2),
      box([-0.05, 0.7, 0.9], [0.05, 1.45, 1.02], '#b7c2c6'),
      box([-1.35, -1.2, 0.85], [-0.75, -0.15, 1.5], '#314049'),
      box([-1.22, -0.15, 1.08], [-0.88, 0.25, 1.22], '#9ee0d4', 2),
      box([0.72, -0.4, 0.55], [1.38, -0.28, 1.15], '#d5dee2'),
      box([0.98, -1.2, 0.78], [1.1, -0.28, 0.9], '#b7c2c6'),
      box([0.55, -1.2, 1.35], [0.66, 0.72, 1.46], '#aeb9bd'),
      box([0.4, 0.32, 1.22], [0.8, 0.7, 1.55], '#e7f3f4'),
      box([-2.35, -0.15, 1.15], [-2.18, 1.2, 2.05], '#0f5c62'),
      box([2.15, 0.05, 0.35], [2.4, 0.95, 1.35], '#ffffff', 3),
      box([-2.4, -1.2, -0.85], [-2.18, 0.55, 0.05], '#8aa0a4'),
    ],
    hotspots: [
      point(
        'sample-operating',
        'or-table',
        'Operating table',
        'The padded table in the center of the room. The care team helps you onto it and explains what will happen before anything starts.',
        [0, -0.5, 0.95],
      ),
      point(
        'sample-operating',
        'or-light',
        'Surgical light',
        'The large light above the table. It is bright so the team can see clearly. It may move, and it should not shine straight into your eyes for long.',
        [0, 0.6, 0.95],
      ),
      point(
        'sample-operating',
        'or-anesthesia',
        'Anesthesia workstation',
        'Equipment the anesthesia clinician uses to watch breathing and comfort during a procedure. They stay with you and can explain the monitors.',
        [-1.05, -0.05, 1.15],
      ),
      point(
        'sample-operating',
        'or-mayo',
        'Instrument stand',
        'A tray that keeps sterile tools within reach of the team. You will not need to touch anything on it.',
        [1.05, -0.32, 0.85],
      ),
      point(
        'sample-operating',
        'or-iv',
        'IV pole',
        'A stand that can hold fluid bags. If you need an IV, the team will tell you before they place it.',
        [0.6, 0.45, 1.38],
      ),
    ],
  },
  {
    id: 'treatment',
    roomName: 'Treatment room',
    summary: 'An exam table, supplies, and a seat for someone who came with you.',
    initialYaw: 0.08,
    initialPitch: -0.08,
    wall: hex('#e6ddd2'),
    floorA: hex('#d9cbb8'),
    floorB: hex('#cfc0ad'),
    ceiling: hex('#f7f4ef'),
    roomMin: [-2.3, -1.15, -2.2],
    roomMax: [2.3, 1.4, 2.5],
    boxes: [
      box([-0.42, -1.15, -0.15], [0.42, -0.55, 1.05], '#d9d3cb'),
      box([-0.5, -0.58, -0.25], [0.5, -0.4, 1.2], '#f6f3ee'),
      box([-0.28, -0.4, 0.85], [0.28, -0.22, 1.2], '#e7e2da'),
      box([-2.05, -1.15, -0.2], [-1.35, 0.45, 0.85], '#8b6244'),
      box([1.15, -0.55, -0.4], [2.15, -0.38, 0.55], '#e7e1d8'),
      box([1.4, -0.38, -0.1], [1.9, -0.22, 0.3], '#c5d0d4'),
      box([-0.95, -1.15, -1.15], [-0.25, -0.45, -0.55], '#3f6f74'),
      box([-0.95, -0.45, -1.15], [-0.25, 0.15, -0.95], '#3f6f74'),
      box([0.95, -1.15, 0.85], [1.5, -0.25, 1.35], '#314049'),
      box([1.02, -0.25, 0.95], [1.42, 0.15, 1.08], '#9ee0d4', 2),
      box([-0.45, 1.12, 0.15], [0.45, 1.26, 0.85], '#fff1d8', 2),
      box([2.05, 0.1, -0.55], [2.3, 1.0, 0.45], '#ffffff', 3),
    ],
    hotspots: [
      point(
        'sample-treatment',
        'tx-table',
        'Exam table',
        'You will usually sit or lie here. Paper or linen covers the pad, and the clinician tells you how to settle before an exam starts.',
        [0, -0.35, 0.5],
      ),
      point(
        'sample-treatment',
        'tx-cabinet',
        'Supply cabinet',
        'Gloves, gauze, and other supplies are kept here so they are close at hand. Drawers stay closed unless a staff member opens them.',
        [-1.7, 0.0, 0.3],
      ),
      point(
        'sample-treatment',
        'tx-sink',
        'Sink',
        'Staff wash their hands here when they come into the room. You can ask where you may wash your hands too.',
        [1.65, -0.25, 0.1],
      ),
      point(
        'sample-treatment',
        'tx-chair',
        'Visitor chair',
        'A seat for a family member or friend. If the room feels crowded, staff can help them step out and come back.',
        [-0.6, -0.2, -0.9],
      ),
      point(
        'sample-treatment',
        'tx-vitals',
        'Vitals monitor',
        'A small screen that can show heart rate, blood pressure, or oxygen. A cuff or clip may be used, and it should not hurt.',
        [1.22, 0.0, 1.05],
      ),
    ],
  },
  {
    id: 'patient',
    roomName: 'Patient room',
    summary: 'The bed, window, and monitors you would see on a stay.',
    initialYaw: 0.18,
    initialPitch: -0.04,
    wall: hex('#e4e7ef'),
    floorA: hex('#cbb89a'),
    floorB: hex('#c0ad90'),
    ceiling: hex('#f6f5f2'),
    roomMin: [-2.45, -1.15, -2.15],
    roomMax: [2.45, 1.4, 2.7],
    boxes: [
      box([-0.55, -1.15, -0.2], [0.55, -0.62, 1.55], '#5c6b73'),
      box([-0.62, -0.66, -0.28], [0.62, -0.42, 1.65], '#f7f5f1'),
      box([-0.32, -0.42, 1.15], [0.32, -0.22, 1.6], '#ffffff'),
      box([-0.58, -0.42, -0.2], [0.58, -0.28, 0.95], '#7f9ea4'),
      box([-0.7, -0.5, 1.55], [0.7, 0.45, 1.72], '#5c6b73'),
      box([0.75, -1.15, 1.05], [1.35, -0.45, 1.6], '#8d6a45'),
      box([0.88, -0.45, 1.15], [1.28, 0.05, 1.32], '#243036'),
      box([0.92, -0.28, 1.28], [1.24, 0.02, 1.34], '#9ee0d4', 2),
      box([-1.55, -1.15, 0.15], [-0.9, -0.42, 0.75], '#8d5b4c'),
      box([-1.55, -0.42, 0.15], [-0.9, 0.2, 0.38], '#8d5b4c'),
      box([-0.15, -0.35, 0.25], [0.85, -0.25, 0.7], '#d5dee2'),
      box([0.55, -1.15, 0.4], [0.68, -0.25, 0.52], '#b7c2c6'),
      box([2.2, 0.0, -0.2], [2.45, 0.95, 0.85], '#ffffff', 3),
      box([-0.4, 1.15, 0.3], [0.4, 1.28, 1.0], '#fff1d8', 2),
    ],
    hotspots: [
      point(
        'sample-patient',
        'pt-bed',
        'Hospital bed',
        'The bed raises and lowers. Side rails can be up while you rest. Controls are usually in the rail, and a nurse can show you which buttons call for help.',
        [0, -0.3, 0.6],
      ),
      point(
        'sample-patient',
        'pt-window',
        'Window',
        'Daylight and a view outside. Blinds can be closed when you want the room dimmer.',
        [2.15, 0.45, 0.3],
      ),
      point(
        'sample-patient',
        'pt-monitor',
        'Bedside monitor',
        'A screen near the head of the bed. It may beep. Staff can tell you which sounds need attention and which are routine.',
        [1.08, -0.05, 1.25],
      ),
      point(
        'sample-patient',
        'pt-chair',
        'Chair',
        'A place for a visitor to sit. Some chairs recline if someone is staying overnight.',
        [-1.2, -0.15, 0.4],
      ),
      point(
        'sample-patient',
        'pt-table',
        'Overbed table',
        'A table that rolls over the bed for water, a phone, or a meal tray. It locks in place so it does not slide.',
        [0.3, -0.2, 0.45],
      ),
    ],
  },
];

export function sceneById(id) {
  return SCENES.find((scene) => scene.id === id) || null;
}

export function sampleCatalog() {
  return {
    buildings: [
      {
        id: 'sample-facility',
        name: 'Demonstration facility',
        sample: true,
      },
    ],
    rooms: SCENES.map((scene) => ({
      id: `sample-${scene.id}`,
      buildingId: 'sample-facility',
      name: scene.roomName,
      summary: scene.summary,
      imageFile: '',
      scene: scene.id,
      sample: true,
    })),
    hitboxes: SCENES.flatMap((scene) =>
      scene.hotspots.map(({ at, ...hitbox }) => hitbox),
    ),
  };
}
