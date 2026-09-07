import type { TechnologyExhibit } from '@/lib/technology-screen';
import type { LightingId, BuildingId } from '@/lib/buildings';
import type { RefObject } from 'react';
import type { AvatarId, PaletteId } from '@/lib/island';
import type { Controller } from './use-controller';
export type RoomSceneProps = {
  identity: string;
  exhibit?: TechnologyExhibit;
  lighting?: LightingId;
  building: BuildingId;
  avatar: AvatarId;
  palette: PaletteId;
  controller: RefObject<Controller>;
  reducedMotion: boolean;
  onInteract: (index: number) => void;
};
