import { NavigationContainer, StackActions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { useEffect } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import { Provider } from "react-redux";

import Map from "./components/map";
import { CatcherScreen } from "./src/screens/catcher";
import { MainScreen } from "./src/screens/main";
import { DatabaseService } from "./src/services/database";
import store from "./src/state/store";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen name="Catcher" component={CatcherScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  createButton: {
    marginRight: 16,
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
