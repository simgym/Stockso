import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useStyleSheet } from '../context/ThemeContext';
import Pagination from "../components/Pagination";

const ViewAllScreen = ({ route, navigation }) => {
  const {colors } = useTheme();
  const { data, type } = route.params;
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const themeColors = {
  ...colors,
  primary: colors.headerBg,
};

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1); 
    }
  }, [itemsPerPage, totalPages]);

  const styles = useStyleSheet((themeColors) => StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.3,
    color: themeColors.text,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  metricCard: {
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: themeColors.headerBg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  infoSection: { flex: 1 },
  stockTicker: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 2,
    letterSpacing: 0.5,
    color: themeColors.text,
  },
  stockName: {
    fontSize: 12,
    fontWeight: "500",
    color: themeColors.subtext,
  },
  priceSection: {
    alignItems: "flex-end",
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: themeColors.text,
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
}));


  const StockMetricCard = ({ item }) => {
    const initials = (item.name || item.ticker || "")
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 1)
      .toUpperCase();

    const changePercent = parseFloat(item.change_percentage || 0);
    const priceValue = parseFloat(item.price || 0).toFixed(2);
    const isPositive = changePercent >= 0;

    return (
      <TouchableOpacity
        style={[
          styles.metricCard,
          {
            backgroundColor: themeColors.cardBg,
            borderLeftColor: isPositive ? themeColors.positive : themeColors.negative,
          },
        ]}
        onPress={() =>
          navigation.navigate("Product", { symbol: item.ticker || item.symbol })
        }
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <LinearGradient
            colors={["#1F6FEB", "#1a54b8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <View style={styles.infoSection}>
            <Text style={[styles.stockTicker, { color: themeColors.text }]}>
              {item.ticker || item.symbol}
            </Text>
          </View>
          <View style={styles.priceSection}>
            <Text style={[styles.price, { color: themeColors.text }]}>
              ${priceValue}
            </Text>

            <LinearGradient
              colors={
                isPositive
                  ? ["#05A854", "#048540"]
                  : ["#F03737", "#D42D2D"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.changeBadge}
            >
              <Ionicons
                name={isPositive ? "arrow-up" : "arrow-down"}
                size={12}
                color="#FFFFFF"
                style={{ marginRight: 3 }}
              />
              <Text style={styles.changeText}>
                {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
              </Text>
            </LinearGradient>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: themeColors.background }]}>
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={themeColors.headerBg} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>
          {type === "gainers" ? "Top Gainers" : "Top Losers"}
        </Text>
        <View style={{ width: 24 }} />
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: themeColors.background },
      ]}
    >
      {renderHeader()}
       <FlatList
        data={paginatedData} 
        keyExtractor={(item, index) => item.ticker + index.toString()}
        renderItem={({ item }) => <StockMetricCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollIndicatorInsets={{ right: 1 }}
      />
      <Pagination 
        totalItems={data.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </SafeAreaView>
  );
};

export default ViewAllScreen;
