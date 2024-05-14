import { DogConfig } from "../config/doggos";

export type Lat = number;
export type Long = number;

export type GeoPoint = {
  lat: Lat;
  long: Long;
};

export type SpawnedDog = {
  id: string;
  name: string;
  variantName: string;
  level: number;
  imgSrc?: string;
  image?: any;
  geoPoint: GeoPoint;
  spawnedAt: string;
};

export type StoreAction = {
  type: string;
  payload: any;
};

export type User = {
  level: number;
  currentXp: number;
};
