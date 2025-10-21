import AsyncStorage from '@react-native-async-storage/async-storage';

export const cacheData = async (key, data, ttl = 3600000) => { // cached for 1 hour
  const item = { data, expiry: Date.now() + ttl };
  await AsyncStorage.setItem(key, JSON.stringify(item));
};

export const getCachedData = async (key) => {
  const item = await AsyncStorage.getItem(key);
  if (!item) return null;
  const parsed = JSON.parse(item);
  if (Date.now() > parsed.expiry) {
    await AsyncStorage.removeItem(key);
    return null;
  }
  return parsed.data;
};
