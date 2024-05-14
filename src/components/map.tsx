import * as Location from "expo-location";
import React, { useState, useEffect } from "react";
import { ToastAndroid } from "react-native";
import MapView from "react-native-maps";

const initialCamera = {
  center: {
    latitude: 37.78825,
    longitude: -122.4324,
  },
  pitch: 60,
  heading: 0,
  zoom: 19.2,
};

export default function Map({ style }) {
  const [mapView, setMapView] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Initialize location tracking
    (async () => {
      await initializeLocationTracking();
    })();
  }, []);

  useEffect(() => {
    if (location) {
      mapView.animateCamera({
        center: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        heading: location.coords.heading, // Copy heading
        zoom: 19.2,
      });
    }
  }, [location]);

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

  return (
    <MapView
      provider="google"
      ref={setMapView}
      style={style}
      rotateEnabled={false}
      scrollEnabled={false}
      zoomEnabled={false}
      initialCamera={initialCamera}
      showsUserLocation
      showsBuildings={false}
      showsCompass={false}
      showsMyLocationButton={false}
    />
  );
}
