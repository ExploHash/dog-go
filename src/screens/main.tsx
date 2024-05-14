import React from "react";
import { View, StyleSheet } from "react-native";

import Map from "../components/map";

export function MainScreen({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <Map style={styles.map} navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  levelViewer: {
    position: "absolute",
    bottom: 15,
    left: 10,
  },
});
