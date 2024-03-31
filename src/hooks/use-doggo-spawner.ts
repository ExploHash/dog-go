import dayjs from "dayjs";
import * as weekOfYear from "dayjs/plugin/weekOfYear";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import seedrandom from "seedrandom";

import { DogConfigVariant, doggosConfig } from "../../config/doggos";
import { selectUser } from "../state/reducer";
import { GeoPoint, SpawnedDog } from "../types";

dayjs.extend(weekOfYear.default);

const anchorGeoPoint = {
  lat: 50,
  long: 3,
};

export function useDoggoSpawner(location) {
  const user = useSelector(selectUser);
  const [latestGeoPoint, setLatestGeoPoint] = useState<GeoPoint | null>(null);

  useEffect(() => {
    if (location) {
      const newGeoPoint = {
        lat: location.coords.latitude,
        long: location.coords.longitude,
      };

      // Calculate distance between anchor point and new point
      const distance = calculateDistanceCrow(anchorGeoPoint, newGeoPoint);
      console.log("Distance: ", distance);
    }
  }, [location]);
}

export function calculateCurrentShownDoggos(
  currentGeoPoint: GeoPoint,
  currentTimeMs: number,
  playerLevel: number,
) {
  // Calculate the random seed points
  const randomSeedPoints = calculateRandomSeedPoints(
    currentGeoPoint,
    currentTimeMs,
  );

  // First create array of all variants and parents
  const variantList = createVariantList();

  // Calculate the actual spawn rate
  const actualSpawnRate = calculateActualSpawnRate(
    randomSeedPoints.currentWeekNumber,
    randomSeedPoints.latKmIndex,
    randomSeedPoints.longKmIndex,
    variantList,
  );

  // Create random list of doggos based on spawn rate
  const randomList = generateRandomList(actualSpawnRate);

  // Calculate the actual doggos to spawn
  const doggosToSpawn = grabRandomDoggos(
    randomList,
    randomSeedPoints.fiveMinuteTimeIndex + 4,
    randomSeedPoints.latGridIndex,
    randomSeedPoints.longGridIndex,
    playerLevel,
    currentGeoPoint,
  );

  // Epand the doggos to spawn

  console.log(JSON.stringify(doggosToSpawn, null, 2));

  return doggosToSpawn;
}

function grabRandomDoggos(
  randomList: DogConfigVariant[],
  fiveMinuteTimeIndex: number,
  latGridIndex: number,
  longGridIndex: number,
  playerLevel: number,
  currentGeoPoint: GeoPoint,
): SpawnedDog[] {
  // Create random generator
  const randomGenerator = seedrandom(
    `${fiveMinuteTimeIndex}-${latGridIndex}-${longGridIndex}`,
  );

  // Grab random doggos
  const amountDoggos = Math.floor(randomGenerator() * 3) + 1;
  const doggosToSpawn: DogConfigVariant[] = [];

  // Choose random doggos
  for (let i = 0; i < amountDoggos; i++) {
    const randomIndex = Math.floor(randomGenerator() * randomList.length);
    doggosToSpawn.push(randomList[randomIndex]);
  }

  // Turn into spawned dog
  const spawnedDoggos: SpawnedDog[] = [];

  for (const doggo of doggosToSpawn) {
    // Randomize the level of the doggo
    const average = playerLevel * 20;
    const min = average > 200 ? average - 200 : 0;
    const max = average + 200;
    const level = Math.floor(randomGenerator() * (max - min)) + min;

    // Randomnize the distance
    const distance = randomGenerator() * 25;

    // Randomize the heading
    const heading = randomGenerator() * 360;

    const { newLat, newLon } = addDistanceToLatLng(
      currentGeoPoint.lat,
      currentGeoPoint.long,
      distance,
      heading,
    );

    spawnedDoggos.push({
      id: `${newLat}-${newLon}-${doggo.parentName}-${doggo.name}`,
      name: doggo.parentName,
      variantName: doggo.name,
      level,
      imgSrc: doggo.imageSrc,
      geoPoint: {
        lat: newLat,
        long: newLon,
      },
      spawnedAt: new Date().toISOString(),
    });
  }

  return spawnedDoggos;
}

function calculateRandomSeedPoints(
  currentGeoPoint: GeoPoint,
  currentTimeMs: number,
) {
  const kmDistanceLat = calculateDistanceCrow(
    { lat: anchorGeoPoint.lat, long: currentGeoPoint.long },
    { lat: currentGeoPoint.lat, long: currentGeoPoint.long },
  );
  const kmDistanceLong = calculateDistanceCrow(
    { lat: currentGeoPoint.lat, long: anchorGeoPoint.long },
    { lat: currentGeoPoint.lat, long: currentGeoPoint.long },
  );
  // Calculate the current latKmIndex and longKmIndex
  const latKmIndex = Math.floor(kmDistanceLat);
  const longKmIndex = Math.floor(kmDistanceLong);

  // Calculate the current 50m grid lat and long index
  const latGridIndex = Math.floor((kmDistanceLat * 1000) / 50);
  const longGridIndex = Math.floor((kmDistanceLong * 1000) / 50);

  // Current 5 minute time index
  const fiveMinuteTimeIndex = Math.floor(currentTimeMs / 300000);

  return {
    latKmIndex,
    longKmIndex,
    latGridIndex,
    longGridIndex,
    currentWeekNumber: dayjs(currentTimeMs).week(),
    fiveMinuteTimeIndex,
  };
}

function createVariantList(): DogConfigVariant[] {
  const variants: DogConfigVariant[] = [];
  for (const doggoConfig of doggosConfig) {
    for (const variant of doggoConfig.variants) {
      variants.push({
        ...variant,
        parentName: doggoConfig.name,
      });
    }
  }

  return variants;
}

function generateRandomList(variants: DogConfigVariant[]) {
  const randomList: DogConfigVariant[] = [];

  for (const variant of variants) {
    for (let i = 0; i < variant.actualSpawnRate; i++) {
      randomList.push(variant);
    }
  }

  return randomList;
}

function calculateActualSpawnRate(
  weekNumber: number,
  latKmIndex: number,
  longKmIndex: number,
  variants: DogConfigVariant[],
): DogConfigVariant[] {
  const actualSpawnRate: DogConfigVariant[] = [];

  for (const variant of variants) {
    const randomGenerator = seedrandom(
      `${weekNumber}-${latKmIndex}-${longKmIndex}-${variant.parentName}-${variant.name}`,
    );

    // Calculate the spawn rate based on mean and variance
    const spawnRate = generateRandomNormal(
      randomGenerator,
      variant.spawnRate,
      Math.sqrt(variant.spawnRateVariance),
    );

    actualSpawnRate.push({
      ...variant,
      actualSpawnRate: Math.round(spawnRate),
    });
  }

  return actualSpawnRate;
}

function calculateDistanceCrow(geoPointA: GeoPoint, geoPointB: GeoPoint) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(geoPointB.lat - geoPointA.lat);
  const dLon = deg2rad(geoPointB.long - geoPointA.long);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(geoPointA.lat)) *
      Math.cos(deg2rad(geoPointB.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

function generateRandomNormal(
  randomGenerator: () => number,
  mean: number,
  stdDev: number,
) {
  let u = 0,
    v = 0;
  while (u === 0) u = randomGenerator(); // Converting [0,1) to (0,1)
  while (v === 0) v = randomGenerator();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * stdDev;
}

function addDistanceToLatLng(
  lat: number,
  lon: number,
  distance: number,
  heading: number,
): { newLat: number; newLon: number } {
  const earthRadius = 6378137; // Earth's radius in meters

  // Convert distance to radians
  const distRadians = distance / earthRadius;

  // Convert heading to radians
  const headingRadians = (heading * Math.PI) / 180;

  // Convert latitude and longitude to radians
  const latRadians = (lat * Math.PI) / 180;
  const lonRadians = (lon * Math.PI) / 180;

  // Calculate new latitude
  const newLatRadians = Math.asin(
    Math.sin(latRadians) * Math.cos(distRadians) +
      Math.cos(latRadians) * Math.sin(distRadians) * Math.cos(headingRadians),
  );

  // Calculate new longitude
  const newLonRadians =
    lonRadians +
    Math.atan2(
      Math.sin(headingRadians) * Math.sin(distRadians) * Math.cos(latRadians),
      Math.cos(distRadians) - Math.sin(latRadians) * Math.sin(newLatRadians),
    );

  // Convert new latitude and longitude to degrees
  const newLat = (newLatRadians * 180) / Math.PI;
  const newLon = (newLonRadians * 180) / Math.PI;

  return { newLat, newLon };
}
