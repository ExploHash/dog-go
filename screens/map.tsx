import React, { useState, useEffect } from 'react';
import MapView, { MapMarker } from 'react-native-maps';
import { Image, StyleSheet, View, ToastAndroid } from 'react-native';
import * as Location from 'expo-location';
import mapConfig from '../mapconfig.json';

export default function Map({ navigation }) {
  const [mapView, setMapView] = useState(null);
  const [location, setLocation] = useState(null);
  const [camera, setRawCamera] = useState(null);
  const [previousDragX, setPreviousDragX] = useState(null);
  const [dragResetTimeoutId, setDragResetTimeoutId] = useState(null);
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
    }
  }, [location]);

  const setCamera = (newCamera, animate = true) => {
    setRawCamera(newCamera);
    if (animate) {
      mapView.animateCamera(newCamera);
    } else {
      mapView.setCamera(newCamera);
    }
      
  }

  const initializeLocationTracking = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      ToastAndroid.show('Permission to access location was denied', ToastAndroid.SHORT);
      return;
    }

    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1
      },
      (location) => {
        setLocation(location);
      }
    );
  };


  const rotate = (e) => {
    if(!camera) return;

    if (dragResetTimeoutId) {
      clearInterval(dragResetTimeoutId);
    }

    if (previousDragX) {
      const diff = e.nativeEvent.position.x - previousDragX;
      const newHeading = camera.heading + diff / 5;

      setCamera({
        ...camera,
        heading: newHeading,
      }, false);
    }
    
    setPreviousDragX(e.nativeEvent.position.x);

    // Reset drag after 1 second
    const timeoutId = setTimeout(() => {
      setPreviousDragX(null);
    }, 50);

    setDragResetTimeoutId(timeoutId);
  }

  const onPress = (e) => {
    console.log(e.nativeEvent);
  }

  const dogPress = () => {
    console.log('dog');
    navigation.navigate('Catcher');
  }

  const createDog = (lat, long) => {
    setDog({
      latitude: lat,
      longitude: long,
    });
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={setMapView}
        style={styles.map}
        rotateEnabled={true}
        scrollEnabled={false}
        zoomEnabled={false}
        onPanDrag={rotate}
        onLongPress={onPress}
        customMapStyle={mapConfig}
        // zoomTapEnabled={false}
        // showsPointsOfInterest={false}
        // // scrollEnabled={false}
        showsUserLocation={true}
        showsBuildings={true}
        
        showsCompass={false}
        showsMyLocationButton={false}
        // rotateEnabled={true}
        // scrollDuringRotateOrZoomEnabled={false}
        // pitchEnabled={true}
      >
        <MapMarker
          coordinate={dog}
          onPress={dogPress}
        >
          <View>
            <Image
              source={require('../assets/dog.png')}
              style={{ width: 40, height: 40 }}
            />
          </View>
        </MapMarker>
      </MapView>
     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
