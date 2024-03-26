import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import LevelViewer from "../components/level-viewer";
import Map from "../components/map";
import { UserModel } from "../models/user";
import { DatabaseService } from "../services/database";

export function MainScreen({ navigation }) {
  const [level, setLevel] = useState(0);
  const [currentXp, setCurrentXp] = useState(0);
  const [targetXp, setTargetXp] = useState(0);

  useEffect(() => {
    (async () => {
      await DatabaseService.initializeDatabase();
      await upXp();
    })();
  }, []);

  const upXp = async () => {
    // TODO: maybe static is a better way to handle this
    const user = await UserModel.get();
    user.experience(10);
    await user.save();
    setLevel(user.level);
    setCurrentXp(user.currentXp);
    setTargetXp(user.experienceNeeded);
  };

  return (
    <View style={{ flex: 1 }}>
      <Map style={styles.map} navigation={navigation} />

      <LevelViewer
        onTouchStart={upXp}
        styles={styles.levelViewer}
        level={level}
        currentXp={currentXp}
        targetXp={targetXp}
      />
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
