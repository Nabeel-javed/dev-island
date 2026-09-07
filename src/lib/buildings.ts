import { seed, type Project, type PaletteId, PALETTES } from './island';
export const BUILDINGS = {
  cottage: {
    name: 'Cottage',
    roof: '#b97556',
    wall: '#f2e8ce',
    accent: '#537e63',
    floor: '#dbc5a1',
  },
  cafe: { name: 'Café', roof: '#b66f6a', wall: '#fae6d4', accent: '#a35656', floor: '#d8b89b' },
  observatory: {
    name: 'Observatory',
    roof: '#748cae',
    wall: '#dce4ed',
    accent: '#5d729a',
    floor: '#b9c8d2',
  },
  workshop: {
    name: 'Workshop',
    roof: '#728777',
    wall: '#e4d5b4',
    accent: '#667c57',
    floor: '#bea787',
  },
  library: {
    name: 'Library',
    roof: '#977a59',
    wall: '#efe2c4',
    accent: '#866845',
    floor: '#d0b487',
  },
  arcade: { name: 'Arcade', roof: '#8a719f', wall: '#e7def0', accent: '#80559b', floor: '#c8bbd4' },
} as const;
export type BuildingId = keyof typeof BUILDINGS;
export const BUILDING_IDS = Object.keys(BUILDINGS) as BuildingId[];
export function validBuilding(value: string): value is BuildingId {
  return Object.hasOwn(BUILDINGS, value);
}
export function buildingFor(project: Pick<Project, 'owner' | 'name' | 'building'>): BuildingId {
  return project.building && validBuilding(project.building)
    ? project.building
    : BUILDING_IDS[seed(`${project.owner}/${project.name}`.toLowerCase()) % BUILDING_IDS.length];
}
export type LightingId = 'day' | 'night';
export function scenePalette(palette: PaletteId, lighting: LightingId = 'day') {
  const base = PALETTES[palette];
  const nights = {
    lagoon: {
      water: '#172b40',
      deep: '#0d1c2f',
      grass: '#506d62',
      light: '#698677',
      tree: '#355f58',
    },
    sunset: {
      water: '#352b39',
      deep: '#231d2b',
      grass: '#736f61',
      light: '#908372',
      tree: '#635e58',
    },
    lavender: {
      water: '#252c43',
      deep: '#171e34',
      grass: '#5e6d70',
      light: '#7c8890',
      tree: '#465f68',
    },
  };
  return lighting === 'night' ? { ...base, ...nights[palette] } : base;
}
