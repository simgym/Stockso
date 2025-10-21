import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import TabNavigator from "./navigation/TabNavigator";
import RootNavigator from './navigation/RootNavigator';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
       <RootNavigator />
     </NavigationContainer>
    </ThemeProvider>
  );
}