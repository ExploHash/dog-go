import * as Location from "expo-location";
import React, { useState, useEffect } from "react";
import { Image, StyleSheet, View, ToastAndroid } from "react-native";
import MapView, { MapMarker } from "react-native-maps";

import mapConfig from "../../config/mapconfig.json";
import {
  calculateCurrentShownDoggos,
  useDoggoSpawner,
} from "../hooks/use-doggo-spawner";
import { SpawnedDog } from "../types";

const initialCamera = {
  center: {
    latitude: 37.78825,
    longitude: -122.4324,
  },
  pitch: 60,
  heading: 0,
  zoom: 19.2,
};

let spawnIntervalId;

export default function Map({ navigation, style }) {
  const [mapView, setMapView] = useState(null);
  const [location, setLocation] = useState(null);
  const [camera, setRawCamera] = useState(initialCamera);
  const [previousDragX, setPreviousDragX] = useState(null);
  const [dragResetTimeoutId, setDragResetTimeoutId] = useState(null);
  const [spawnedDogs, setSpawnedDogs] = useState<SpawnedDog[]>([]); // [SpawnedDog]
  const [updateNeeded, setUpdateNeeded] = useState(false);

  useEffect(() => {
    // Initialize location tracking
    (async () => {
      await initializeLocationTracking();
    })();

    // Create timer
    if (spawnIntervalId) {
      clearInterval(spawnIntervalId);
    }

    spawnIntervalId = setInterval(() => {
      setUpdateNeeded(true);
    }, 1000);
  }, []);

  useEffect(() => {
    if (updateNeeded) {
      updateDoggos();
      setUpdateNeeded(false);
    }
  }, [updateNeeded]);

  useEffect(() => {
    if (location) {
      setCamera({
        center: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        pitch: 60,
        heading: camera ? camera.heading : location.coords.heading,
        zoom: 19.2,
      });
    }
  }, [location]);

  const setCamera = (newCamera, animate = true) => {
    setRawCamera(newCamera);
    if (animate) {
      mapView.animateCamera(newCamera);
    } else {
      mapView.setCamera(newCamera);
    }
  };

  const initializeLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      ToastAndroid.show(
        "Permission to access location was denied",
        ToastAndroid.SHORT,
      );
      return;
    }

    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (location) => {
        setLocation(location);
      },
    );
  };

  const rotate = (e) => {
    // if(!camera) return;

    if (dragResetTimeoutId) {
      clearInterval(dragResetTimeoutId);
    }

    if (previousDragX) {
      const diff = e.nativeEvent.position.x - previousDragX;
      const newHeading = camera.heading + diff / 5;

      setCamera(
        {
          ...camera,
          heading: newHeading,
        },
        false,
      );
    }

    setPreviousDragX(e.nativeEvent.position.x);

    // Reset drag after 1 second
    const timeoutId = setTimeout(() => {
      setPreviousDragX(null);
    }, 50);

    setDragResetTimeoutId(timeoutId);
  };

  const updateDoggos = () => {
    // If not location, return
    if (!location) return;

    // Working with a copy of the current doggos
    let updateNeeded = false;
    let updatedDogs = [...spawnedDogs];

    // Remove doggos older than 5 minutes
    const currentTime = Date.now();

    const expiredDoggos = spawnedDogs.filter((dog) => {
      const dogTime = new Date(dog.spawnedAt).getTime();
      return currentTime - dogTime > 300000;
    });

    if (expiredDoggos.length > 0) {
      updateNeeded = true;
      updatedDogs = updatedDogs.filter(
        (dog) => !expiredDoggos.find((expiredDog) => expiredDog.id === dog.id),
      );
    }

    // First calculate the doggos for the area
    const doggosForArea = calculateCurrentShownDoggos(
      {
        lat: location.coords.latitude,
        long: location.coords.longitude,
      },
      Date.now(),
      1,
    );

    // Check if there are new doggos
    const newDoggos = doggosForArea.filter(
      (dog) => !updatedDogs.find((updatedDog) => updatedDog.id === dog.id),
    );

    if (newDoggos.length > 0) {
      updateNeeded = true;
      updatedDogs = updatedDogs.concat(newDoggos);
    }

    // Update the doggos if needed
    if (updateNeeded) {
      setSpawnedDogs(updatedDogs);
    }
  };

  return (
    <MapView
      provider="google"
      ref={setMapView}
      style={style}
      rotateEnabled={false}
      scrollEnabled={false}
      zoomEnabled={false}
      onPanDrag={rotate}
      customMapStyle={mapConfig}
      initialCamera={initialCamera}
      showsUserLocation
      showsBuildings
      showsCompass={false}
      showsMyLocationButton={false}
    >
      {spawnedDogs.map((dog) => (
        <MapMarker
          key={dog.id}
          coordinate={{
            latitude: dog.geoPoint.lat,
            longitude: dog.geoPoint.long,
          }}
          onPress={() => {
            navigation.navigate("Catcher", { dog });
          }}
        >
          <View>
            <Image
              source={{ uri: dog.imgSrc }}
              style={{ width: 40, height: 40 }}
            />
          </View>
        </MapMarker>
      ))}
    </MapView>
  );
}
