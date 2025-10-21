import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, useStyleSheet } from '../context/ThemeContext';
import { Ionicons } from "@expo/vector-icons";

const WatchlistScreen = ({ navigation, route }) => {
  const [watchlists, setWatchlists] = useState([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState(null);
  const [watchlistStocks, setWatchlistStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isDarkMode, colors } = useTheme();

  const themeColors = { 
  primary: colors.headerBg,
  darkBg: colors.background,
  background: colors.background,
  cardBg: colors.cardBg,
  text: colors.text,
  textSecondary: colors.subtext,
  success: colors.positive,
  danger: colors.negative,
};

  const styles = useStyleSheet((themeColors) => StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.cardBg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: themeColors.text,
    textAlign: 'center',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.cardBg,
  },
  backButton: {
    fontSize: 16,
    color: themeColors.primary,
    fontWeight: '600',
  },
  detailsHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: themeColors.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  deleteHeaderButton: { padding: 8 },
  deleteHeaderButtonText: {
    fontSize: 18,
    color: themeColors.danger,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: { fontSize: 64, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: themeColors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: themeColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  watchlistCard: {
    backgroundColor: themeColors.cardBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: themeColors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  watchlistCardContent: { flex: 1 },
  watchlistCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: themeColors.text,
    marginBottom: 4,
  },
  watchlistCardCount: {
    fontSize: 13,
    color: themeColors.textSecondary,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 24,
    color: themeColors.primary,
    marginLeft: 12,
    fontWeight: '700',
  },
  stockListContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stockItem: {
    backgroundColor: themeColors.cardBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: themeColors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stockContent: { flex: 1 },
  stockSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: themeColors.text,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: themeColors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  removeButtonText: {
    color: themeColors.text,
    fontSize: 18,
    fontWeight: '700',
  },
}));

  const loadWatchlists = useCallback(async () => {
    try {
      setLoading(true);
      const stored = (await AsyncStorage.getItem('watchlists')) || '{}';
      const allWatchlists = JSON.parse(stored);
      
      const watchlistArray = Object.keys(allWatchlists).map(name => ({
        name,
        count: allWatchlists[name]?.length || 0,
      }));
      
      setWatchlists(watchlistArray);
      setWatchlistStocks([]);
    } catch (error) {
      console.error('Error loading watchlists:', error);
      Alert.alert('Error', 'Failed to load watchlists');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadWatchlistStocks = useCallback(async (watchlistName) => {
    try {
      setLoading(true);
      const stored = (await AsyncStorage.getItem('watchlists')) || '{}';
      const allWatchlists = JSON.parse(stored);
      
      setSelectedWatchlist(watchlistName);
      setWatchlistStocks(allWatchlists[watchlistName] || []);
    } catch (error) {
      console.error('Error loading watchlist stocks:', error);
      Alert.alert('Error', 'Failed to load watchlist stocks');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (selectedWatchlist) {
      await loadWatchlistStocks(selectedWatchlist);
    } else {
      await loadWatchlists();
    }
    setRefreshing(false);
  }, [selectedWatchlist, loadWatchlistStocks, loadWatchlists]);

  const removeStockFromWatchlist = useCallback(async (symbol) => {
    try {
      Alert.alert(
        'Remove Stock',
        `Are you sure you want to remove ${symbol} from this watchlist?`,
        [
          { text: 'Cancel', onPress: () => {} },
          {
            text: 'Remove',
            onPress: async () => {
              const stored = (await AsyncStorage.getItem('watchlists')) || '{}';
              const allWatchlists = JSON.parse(stored);
              
              if (allWatchlists[selectedWatchlist]) {
                allWatchlists[selectedWatchlist] = allWatchlists[selectedWatchlist].filter(
                  s => s.symbol !== symbol
                );
                
                await AsyncStorage.setItem('watchlists', JSON.stringify(allWatchlists));
                if (allWatchlists[selectedWatchlist].length === 0) {
                setSelectedWatchlist(null);
                await loadWatchlists(); 
              } else {
                await loadWatchlists();
                await loadWatchlistStocks(selectedWatchlist); 
              }
                
                Alert.alert('Success', 'Stock removed from watchlist');
              }
            },
            style: 'destructive',
          },
        ]
      );
    } catch (error) {
      console.error('Error removing stock:', error);
      Alert.alert('Error', 'Failed to remove stock');
    }
  }, [selectedWatchlist, loadWatchlistStocks, loadWatchlists]);

  const deleteWatchlist = useCallback(async () => {
    try {
      Alert.alert(
        'Delete Watchlist',
        `Are you sure you want to delete "${selectedWatchlist}"? This action cannot be undone.`,
        [
          { text: 'Cancel', onPress: () => {} },
          {
            text: 'Delete',
            onPress: async () => {
              const stored = (await AsyncStorage.getItem('watchlists')) || '{}';
              const allWatchlists = JSON.parse(stored);
              
              if (allWatchlists[selectedWatchlist]) {
                delete allWatchlists[selectedWatchlist];
                await AsyncStorage.setItem('watchlists', JSON.stringify(allWatchlists));
                
                setSelectedWatchlist(null);
                await loadWatchlists();
                Alert.alert('Success', 'Watchlist deleted');
              }
            },
            style: 'destructive',
          },
        ]
      );
    } catch (error) {
      console.error('Error deleting watchlist:', error);
      Alert.alert('Error', 'Failed to delete watchlist');
    }
  }, [selectedWatchlist, loadWatchlists]);

  const goToStockDetails = useCallback((symbol) => {
    navigation.navigate("Product", { symbol})
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
    setSelectedWatchlist(null);
    setWatchlistStocks([]);
    loadWatchlists();
  });

  return unsubscribe;
  }, []);

  if (selectedWatchlist === null) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.darkBg }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Watchlists</Text>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={themeColors.primary} />
          </View>
        ) : watchlists.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}><Ionicons
                name="bookmark-outline"
                size={80}
                color={themeColors.textSecondary}
              /></Text>
            <Text style={styles.emptyTitle}>No Watchlists Yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first watchlist by adding a stock
            </Text>
          </View>
        ) : (
          <FlatList
            data={watchlists}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.watchlistCard}
                onPress={() => loadWatchlistStocks(item.name)}
              >
                <View style={styles.watchlistCardContent}>
                  <Text style={styles.watchlistCardName}>{item.name}</Text>
                  <Text style={styles.watchlistCardCount}>
                    {item.count} stock{item.count !== 1 ? 's' : ''}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                colors={[themeColors.primary]}
                tintColor={themeColors.primary}
              />
            }
          />
        )}
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.darkBg }]}>
      <View style={styles.detailsHeader}>
        <TouchableOpacity 
          onPress={() => {
            setSelectedWatchlist(null);
            setWatchlistStocks([]);
          }}
        >
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.detailsHeaderTitle}>{selectedWatchlist}</Text>
        <TouchableOpacity onPress={deleteWatchlist} style={styles.deleteHeaderButton}>
          <Text style={styles.deleteHeaderButtonText}><Ionicons
                name="trash-outline"
                size={20}
                color={themeColors.textSecondary}
              /></Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : watchlistStocks.length === 0 ? (
        <View style={styles.centerContainer}>
          {/* <Text style={styles.emptyText}>📈</Text> */}
          <Ionicons name="bar-chart-outline" size={80} color={themeColors.textSecondary}/>
          <Text style={styles.emptyTitle}>No Stocks Yet</Text>
          <Text style={styles.emptySubtext}>
            Add stocks to this watchlist from the stock details screen
          </Text>
        </View>
      ) : (
        <FlatList
          data={watchlistStocks}
          keyExtractor={(item) => item.symbol}
          renderItem={({ item }) => (
            <View style={styles.stockItem}>
              <TouchableOpacity
                style={styles.stockContent}
                onPress={() => goToStockDetails(item.symbol)}
              >
                <Text style={styles.stockSymbol}>{item.symbol}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => removeStockFromWatchlist(item.symbol)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.stockListContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={[themeColors.primary]}
              tintColor={themeColors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default WatchlistScreen;