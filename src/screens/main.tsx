import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import LevelViewer from "../components/level-viewer";
import Map from "../components/map";
import { DatabaseService } from "../services/database";
import {
  letUserExperience,
  selectExperienceNeeded,
  selectUser,
} from "../state/reducer";
import { AppDispatch } from "../state/store";
import { getUser, saveUser } from "../state/thunks";

export function MainScreen({ navigation }) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const experienceNeeded = useSelector(selectExperienceNeeded);

  useEffect(() => {
    (async () => {
      await DatabaseService.initializeDatabase();
      dispatch(getUser());
    })();
  }, []);

  useEffect(() => {
    if (user) {
      dispatch(saveUser(user));
    }
  }, [user]);

  const upXp = async () => {
    dispatch(letUserExperience(10));
  };

  return (
    <View style={{ flex: 1 }}>
      <Map style={styles.map} navigation={navigation} />

      <LevelViewer
        onTouchStart={upXp}
        styles={styles.levelViewer}
        level={user?.level}
        currentXp={user?.currentXp}
        targetXp={experienceNeeded}
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
