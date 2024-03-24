import { StatusBar, StyleSheet, Text, View } from "react-native";
import * as React from "react";
import { NavigationContainer, StackActions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {  useEffect } from "react";
import Map from "./screens/map";
import { Catcher } from "./screens/catcher";


const Stack = createNativeStackNavigator();


export default function App() {

  return (
    <>
       <NavigationContainer>
        <Stack.Navigator
          screenOptions={
            {
             headerShown: false
            }
          }
          >
            <Stack.Screen
          name="Map"
          component={Map}
        />
        <Stack.Screen
          name="Catcher"
          component={Catcher} 
        />
          </Stack.Navigator>
          
        </NavigationContainer>
    </>
       
  );
}

const styles = StyleSheet.create({
  createButton: {
    marginRight: 16,
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff"
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
