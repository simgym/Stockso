import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ExploreScreen from "../screens/ExploreScreen";
import WatchlistScreen from "../screens/WatchlistScreen";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    const { colors } = useTheme();
    const themeColors = { 
    text: colors.text,
    background: colors.background,
  };
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: themeColors.text,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle: {
          backgroundColor: themeColors.background,
          borderTopColor: colors.border,
          paddingBottom: 5,
          height: 60,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Explore") iconName = "trending-up";
          else if (route.name === "Watchlist") iconName = "star";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Watchlist" component={WatchlistScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
