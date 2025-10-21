import React, { createContext, useState, useContext, useEffect } from 'react'; 
import { StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const themeColors = {
  light: {
    background: "#FFFFFF",
    cardBg: "#FFFFFF",
    text: "#1C1E1F",
    subtext: "#767676",
    positive: "#05A854",
    negative: "#F03737",
    border: "#E8EAEF",
    headerBg: "#1F6FEB",
    searchBg: "#F0F0F0",
    statusBg: "#E8F1FF",
  },
  dark: {
    background: "#0f0f1e",
    cardBg: "#1a1a2e",
    text: "#E0E0E0",
    subtext: "#A0A0A0",
    positive: "#05A854",
    negative: "#F03737",
    border: "#333",
    headerBg: "#1F6FEB",
    searchBg: "#252541",
    statusBg: "#1a2a4a",
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  React.useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem('appTheme', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const currentTheme = isDarkMode ? themeColors.dark : themeColors.light;

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        colors: currentTheme,
        loadTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useStyleSheet = (styleFactory) => {
  const { colors } = useTheme();
  
  const themeColors = {
    primary: colors.headerBg,
    darkBg: colors.background,
    cardBg: colors.cardBg,
    text: colors.text,
    textSecondary: colors.subtext,
    success: colors.positive,
    danger: colors.negative,
  };
  
  return StyleSheet.create(styleFactory(themeColors));
};

