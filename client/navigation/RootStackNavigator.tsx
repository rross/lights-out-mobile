import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "@/screens/HomeScreen";
import LevelSelectScreen from "@/screens/LevelSelectScreen";
import GameScreen from "@/screens/GameScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import HowToPlayScreen from "@/screens/HowToPlayScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Home: undefined;
  LevelSelect: undefined;
  Game: { level: number };
  Settings: undefined;
  HowToPlay: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const opaqueOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LevelSelect"
        component={LevelSelectScreen}
        options={{
          ...opaqueOptions,
          headerTitle: "Select Level",
        }}
      />
      <Stack.Screen
        name="Game"
        component={GameScreen}
        options={{
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          ...opaqueOptions,
          headerTitle: "Settings",
        }}
      />
      <Stack.Screen
        name="HowToPlay"
        component={HowToPlayScreen}
        options={{
          ...opaqueOptions,
          headerTitle: "How to Play",
        }}
      />
    </Stack.Navigator>
  );
}
