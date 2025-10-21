import { StatusBar} from "react-native";
import { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as NavigationBar from 'expo-navigation-bar';
import { useTheme } from '../context/ThemeContext';
import TabNavigator from "./TabNavigator";
import ProductScreen from "../screens/ProductScreen";
import ViewAllScreen from "../screens/ViewAllScreen";

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    const { isDarkMode } = useTheme();

    useEffect(() => {
        const setNavigationBar = async () => {
            await NavigationBar.setBackgroundColorAsync(
                isDarkMode ? "#000000" : "#FFFFFF"
            );
            
            await NavigationBar.setButtonStyleAsync(
                isDarkMode ? "light" : "dark"
            );
        };

        setNavigationBar();
    }, [isDarkMode]);

    return(
        <> 
        <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={isDarkMode ? "#000000" : "#FFFFFF"}
        translucent={false}
        animated={true}
      />
        <Stack.Navigator
        screenOptions={{
      }}>
            <Stack.Screen
            name="MainTabs"
            component={TabNavigator}
            options={{ headerShown: false }}
            />
            <Stack.Screen name="Product" component={ProductScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="ViewAll" component={ViewAllScreen} options={{ headerShown: false }}/>
        </Stack.Navigator>
        </>
        
 
);
}

export default RootNavigator;
