import { Encounter } from "src/app/feature-modules/administration/model/encounter.model";

export class KeyPoint {
  id!: number;
  tourId!: number;
  name!: string;
  description!: string;
  imageUrl!: string;
  secret!: string;
  latitude!: number;
  longitude!: number;
  encounterId?: number | null
  encounter?: Encounter | null = null;
}