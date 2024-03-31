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
  altitude: 1000,
  zoom: 19.2,
};

export default function Map({ navigation, style }) {
  const [mapView, setMapView] = useState(null);
  const [location, setLocation] = useState(null);
  const [camera, setRawCamera] = useState(initialCamera);
  const [previousDragX, setPreviousDragX] = useState(null);
  const [dragResetTimeoutId, setDragResetTimeoutId] = useState(null);
  const [spawnedDogs, setSpawnedDogs] = useState<SpawnedDog[]>([]); // [SpawnedDog]

  const [dog, setDog] = useState({
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    (async () => {
      await initializeLocationTracking();
    })();
  }, []);

  useEffect(() => {
    if (location) {
      setCamera({
        center: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        pitch: 60,
        heading: camera ? camera.heading : location.coords.heading,
        altitude: 1000,
        zoom: 19.2,
      });

      setSpawnedDogs(
        calculateCurrentShownDoggos(
          {
            lat: location.coords.latitude,
            long: location.coords.longitude,
          },
          Date.now(),
          1,
        ),
      );
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

  const dogPress = () => {
    navigation.navigate("Catcher");
  };

  return (
    <MapView
      ref={setMapView}
      style={style}
      rotateEnabled
      scrollEnabled={false}
      zoomEnabled={false}
      onPanDrag={rotate}
      customMapStyle={mapConfig}
      initialCamera={initialCamera}
      showsUserLocation
      showsBuildings
      showsCompass={false}
      showsMyLocationButton={false}
      liteMode
    >
      <MapMarker coordinate={dog} onPress={dogPress}>
        <View>
          <Image
            source={require("../../assets/dog.png")}
            style={{ width: 40, height: 40 }}
          />
        </View>
      </MapMarker>

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

const styles = StyleSheet.create({
  map: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
});
