import { clamp } from './coords.js';

function photoPoint(roomId, id, text, sub, u, v, halfU = 0.045, halfV = 0.055) {
  const vTop = clamp(v - halfV, 0, 1);
  const vBottom = clamp(v + halfV, 0, 1);
  return {
    id,
    roomId,
    text,
    sub,
    left: clamp(u - halfU, 0, 1),
    right: clamp(u + halfU, 0, 1),
    top: 1 - vTop,
    bottom: 1 - vBottom,
  };
}

const ROOMS = [
  {
    id: 'operating',
    roomName: 'Operating room',
    summary: 'A photographed operating room: the table, the light, and the machines beside them.',
    imageFile: '/photos/surgery.jpg',
    poster: '/photos/surgery-card.jpg',
    hotspots: [
      photoPoint(
        'sample-operating',
        'or-table',
        'Operating table',
        'The table in the center of the room. The care team helps you onto it and explains what will happen before anything starts.',
        0.5,
        0.56,
        0.07,
        0.06,
      ),
      photoPoint(
        'sample-operating',
        'or-light',
        'Surgical light',
        'The large light above the table. It is bright so the team can see clearly. It may move, and it should not shine straight into your eyes for long.',
        0.5,
        0.38,
        0.06,
        0.07,
      ),
      photoPoint(
        'sample-operating',
        'or-anesthesia',
        'Anesthesia machine',
        'The machine and screens to one side of the table. The anesthesia clinician uses them to watch breathing and comfort, and stays with you.',
        0.35,
        0.5,
      ),
      photoPoint(
        'sample-operating',
        'or-cart',
        'Equipment cart',
        'A cart of supplies and devices kept within reach of the team. You will not need to handle what is on it.',
        0.8,
        0.55,
      ),
    ],
  },
  {
    id: 'treatment',
    roomName: 'Treatment room',
    summary: 'A photographed treatment room with an exam table, cabinets, and monitors.',
    imageFile: '/photos/hospital-room.jpg',
    poster: '/photos/hospital-room-card.jpg',
    hotspots: [
      photoPoint(
        'sample-treatment',
        'tx-table',
        'Exam table',
        'You will usually sit or lie here. The clinician tells you how to settle before an exam starts.',
        0.5,
        0.58,
        0.08,
        0.07,
      ),
      photoPoint(
        'sample-treatment',
        'tx-light',
        'Exam light',
        'The light over the table. It can be aimed at the area being examined and turned away when it is not needed.',
        0.5,
        0.4,
        0.05,
        0.06,
      ),
      photoPoint(
        'sample-treatment',
        'tx-cabinet',
        'Supply cabinet',
        'Cabinets along the wall hold gloves, gauze, and other supplies. Drawers stay closed unless a staff member opens them.',
        0.1,
        0.5,
        0.06,
        0.08,
      ),
      photoPoint(
        'sample-treatment',
        'tx-chair',
        'Visitor chair',
        'A seat near the foot of the table for a family member or friend.',
        0.92,
        0.62,
      ),
    ],
  },
  {
    id: 'patient',
    roomName: 'Patient room',
    summary: 'A photographed children’s ward with a bed, a chair, and windows.',
    imageFile: '/photos/childrens-ward.jpg',
    poster: '/photos/childrens-ward-card.jpg',
    hotspots: [
      photoPoint(
        'sample-patient',
        'pt-bed',
        'Hospital bed',
        'The bed in the middle of the ward. Side rails can be up while you rest, and a nurse can show you how to call for help.',
        0.5,
        0.58,
        0.08,
        0.07,
      ),
      photoPoint(
        'sample-patient',
        'pt-window',
        'Window',
        'Daylight from the windows along the wall. Curtains can be closed when you want the room dimmer.',
        0.9,
        0.45,
        0.07,
        0.08,
      ),
      photoPoint(
        'sample-patient',
        'pt-chair',
        'Chair',
        'A chair beside the bed for a visitor. Some rooms have a place for someone to stay with you.',
        0.1,
        0.62,
      ),
      photoPoint(
        'sample-patient',
        'pt-wall',
        'Wall panels',
        'Color on the wall, within sight of the bed. It is part of the room, not a screen you need to operate.',
        0.08,
        0.38,
        0.05,
        0.07,
      ),
    ],
  },
];

export function sceneById() {
  return null;
}

export function sampleCatalog() {
  return {
    buildings: [
      {
        id: 'sample-facility',
        name: 'Sample rooms',
        sample: true,
      },
    ],
    rooms: ROOMS.map((room) => ({
      id: `sample-${room.id}`,
      buildingId: 'sample-facility',
      name: room.roomName,
      summary: room.summary,
      imageFile: room.imageFile,
      poster: room.poster,
      scene: '',
      sample: true,
    })),
    hitboxes: ROOMS.flatMap((room) => room.hotspots),
  };
}
