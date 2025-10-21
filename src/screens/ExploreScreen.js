import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { fetchTopGainersLosers } from "../api/alphavantage";
import { getCachedData, cacheData } from "../utils/cache";
import { useTheme } from "../context/ThemeContext";
import SearchBar from "../components/SearchBar";

const ExploreScreen = ({ navigation }) => {
    const { isDarkMode, toggleTheme, colors } = useTheme();
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

  const loadData = async () => {
    try {
      setError(null);
      const cached = await getCachedData("explore");

      if (cached && cached.top_gainers && cached.top_losers) {


        setGainers(cached.top_gainers);
        setLosers(cached.top_losers || []);
        setLoading(false);
        return;
      }

      const data = await fetchTopGainersLosers();

      if (data && data.top_gainers) {
        setGainers(data.top_gainers);
        setLosers(data.top_losers || []);

        await cacheData("explore", data);
      } else {
        setError("No data received from API");
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load market data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const ModernStockCard = ({ item, isGainer }) => {
    const initials = (item.name || item.ticker || "")
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 1)
      .toUpperCase();

    const changePercent = Math.abs(parseFloat(item.change_percentage || 0)).toFixed(2);
    const priceValue = parseFloat(item.price || 0).toFixed(2);
    

    return (
      <TouchableOpacity
        style={[
          styles.modernCard,
          {
            backgroundColor: colors.cardBg,
            shadowColor: isDarkMode ? "#000" : colors.headerBg,
            borderColor: colors.border,
          },
        ]}
        onPress={() =>
          navigation.navigate("Product", { symbol: item.ticker || item.symbol })
        }
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={isGainer ? ["#1F6FEB20", "#1F6FEB05"] : ["#F0373720", "#F0373705"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBg}
        />
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={[colors.headerBg, "#1a54b8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.avatarGradient,
              {
                shadowColor: colors.headerBg,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
        </View>
        <View style={styles.contentWrapper}>
          <Text style={[styles.stockSymbol, { color: colors.text }]}>
            {item.ticker || item.symbol}
          </Text>
          <View style={styles.priceWrapper}>
            <Text style={[styles.stockPrice, { color: colors.text }]}>
              ${priceValue}
            </Text>
          </View>
          <LinearGradient
            colors={
              isGainer
                ? [colors.positive, "#048540"] 
                : [colors.negative, "#D42D2D"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.modernChangeBadge,
              {
                shadowColor: isDarkMode ? "#000" : "#000",
              },
            ]}
          >
            <Ionicons
              name={isGainer ? "arrow-up" : "arrow-down"}
              size={14}
              color="#FFFFFF"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.stockChangeText}>
              {changePercent}%
            </Text>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };
  if (loading && gainers.length === 0) {
    return (
      <View
        style={[
          styles.container,
        { backgroundColor: colors.background }, 
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.headerBg} />
          <Text
            style={[
              styles.loadingText,
            { color: colors.text, marginTop: 15 },
            ]}
          >
            Loading market data...
          </Text>
        </View>
      </View>
    );
  }

  if (error && gainers.length === 0) {
    return (
      <View
        style={[
          styles.container,
        { backgroundColor: colors.background },
        ]}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>Error</Text>
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn,{ backgroundColor: colors.headerBg }]}
            onPress={loadData}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={!isSearchDropdownOpen}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.headerBg}
            colors={[colors.headerBg]}
          />
        }
      >
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <View style={styles.headerTop}>
            <Text style={[styles.appTitle, { color: colors.text }]}>Stockso</Text>
            <TouchableOpacity
              style={[
                styles.themeBtn,
                { backgroundColor: isDarkMode ? "#333" : colors.searchBg },
              ]}
            onPress={toggleTheme}

            >
              <Ionicons
                name={isDarkMode ? "moon" : "sunny"}
                size={18}
                color={isDarkMode ? "#FFD700" : "#FFA500"}
              />
              <Text style={[styles.themeBtnText, { color: colors.text }]}>
                {isDarkMode ? "Dark" : "Light"}
              </Text>
            </TouchableOpacity>
          </View>
          <View>
          <SearchBar navigation={navigation} onDropdownStateChange={setIsSearchDropdownOpen}/>
          </View>
        </View>

        {/* Top gainers */}
        {gainers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Top Gainers
              </Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ViewAll", {
                    data: gainers,
                    type: "gainers",
                  })
                }
              >
                <Text style={[styles.viewMoreText, { color: colors.headerBg }]}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modernGridContainer}>
              {gainers.slice(0, 4).map((item, idx) => (
                <ModernStockCard
                  key={idx}
                  item={item}
                  isGainer={true}
                />
              ))}
            </View>
          </View>
        )}

        {/* top losers */}
        {losers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Top Losers
              </Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ViewAll", {
                    data: losers,
                    type: "losers",
                  })
                }
              >
                <Text style={[styles.viewMoreText, { color: colors.headerBg }]}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modernGridContainer}>
              {losers.slice(0, 4).map((item, idx) => (
                <ModernStockCard
                  key={idx}
                  item={item}
                  isGainer={false}
                />
              ))}
            </View>
          </View>
        )}

        {/* for empty state */}
        {gainers.length === 0 && losers.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No data available
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={loadData}
            >
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  themeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  themeBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "500",
  },
  modernStatusContainer: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D0E0FF",
  },
  statusContent: {
    flex: 1,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1F6FEB",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F6FEB",
  },
  statusTime: {
    fontSize: 11,
    fontWeight: "500",
    color: "#1F6FEB",
  },
  section: {
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  viewMoreText: {
    fontSize: 13,
    fontWeight: "700",
  },
  modernGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  modernCard: {
    width: "48%",
    borderRadius: 16,
    padding: 14,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  gradientBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  avatarContainer: {
    marginBottom: 14,
    zIndex: 1,
  },
  avatarGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1F6FEB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  contentWrapper: {
    zIndex: 1,
  },
  stockSymbol: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  stockName: {
    fontSize: 11,
    marginBottom: 12,
    fontWeight: "500",
  },
  priceWrapper: {
    marginBottom: 10,
  },
  stockPrice: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  modernChangeBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  stockChangeText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  retryBtn: {
    backgroundColor: "#1F6FEB",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 5,
    shadowColor: "rgba(31, 111, 235, 0.3)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginTop: 20,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 25,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },
});

export default ExploreScreen;