import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import LevelViewer from "../components/level-viewer";
import Map from "../components/map";
import { UserModel } from "../models/user";
import { DatabaseService } from "../services/database";

export function MainScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      await DatabaseService.initializeDatabase();
      const user = await UserModel.get();
      setUser(user);
    })();
  }, []);

  const upXp = async () => {
    user.experience(10);
    await user.save();
    setUser(user.copy());
  };

  return (
    <View style={{ flex: 1 }}>
      <Map style={styles.map} navigation={navigation} />

      <LevelViewer
        onTouchStart={upXp}
        styles={styles.levelViewer}
        level={user?.level}
        currentXp={user?.currentXp}
        targetXp={user?.experienceNeeded}
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
