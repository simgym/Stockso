import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { searchSymbols } from "../api/alphavantage";
import { useTheme } from "../context/ThemeContext";

const SearchBar = ({ navigation, placeholder = "Search stocks...", onDropdownStateChange }) => {
  const { colors, isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      setIsSearching(true);
      searchTimeout.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 600);

      return () => {
        if (searchTimeout.current) {
          clearTimeout(searchTimeout.current);
        }
      };
    } else {
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
    }
  }, [searchQuery]);

   useEffect(() => {
    onDropdownStateChange?.(showDropdown);
  }, [showDropdown]);

  const performSearch = async (query) => {
    try {
      const results = await searchSymbols(query);
      setSearchResults(results);
      setShowDropdown(results.length > 0);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectStock = (item) => {
    const symbol = item["1. symbol"];
    const name = item["2. name"];
    
    setSearchQuery("");
    setShowDropdown(false);
    setSearchResults([]);
    Keyboard.dismiss();

    navigation.navigate("Product", { 
      symbol: symbol,
      name: name 
    });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

   const renderSearchResult = (item, index) => {
    const symbol = item["1. symbol"];
    const name = item["2. name"];
    const type = item["3. type"];
    const region = item["4. region"];

    return (
      <View key={`${symbol}-${index}`}>
        <TouchableOpacity
          style={[styles.resultItem, { backgroundColor: colors.cardBg }]}
          onPress={() => handleSelectStock(item)}
          activeOpacity={0.7}
        >
          <View style={styles.resultLeft}>
            <View
              style={[
                styles.symbolBadge,
                { backgroundColor: `${colors.headerBg}20` },
              ]}
            >
              <Text style={[styles.symbolText, { color: colors.headerBg }]}>
                {symbol}
              </Text>
            </View>
            <View style={styles.resultInfo}>
              <Text
                style={[styles.resultName, { color: colors.text }]}
                numberOfLines={1}
              >
                {name}
              </Text>
              <Text style={[styles.resultMeta, { color: colors.subtext }]}>
                {type} • {region}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
        </TouchableOpacity>
        {index < searchResults.length - 1 && (
          <View
            style={[styles.separator, { backgroundColor: colors.border }]}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.searchBg,
              borderColor: showDropdown ? colors.headerBg : colors.border,
            },
          ]}
        >
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={placeholder}
            placeholderTextColor={colors.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="never"
            editable={true}
            selectTextOnFocus={false}
          />
          {isSearching && (
            <ActivityIndicator size="small" color={colors.headerBg} />
          )}
          {searchQuery.length > 0 && !isSearching && (
            <TouchableOpacity
              onPress={clearSearch}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={20} color={colors.subtext} />
            </TouchableOpacity>
          )}
        </View>

        {/* stock options */}
        {showDropdown && searchResults.length > 0 && (
          <View
            style={[
              styles.dropdown,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
                shadowColor: isDarkMode ? "#000" : "#000",
              },
            ]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <ScrollView
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              scrollEnabled={true}
              bounces={true}
              keyboardShouldPersistTaps="handled"
              onScrollBeginDrag={(e) => e.stopPropagation()}
            >
              {searchResults.map((item, index) =>
                renderSearchResult(item, index)
              )}
            </ScrollView>
          </View>
        )}

        {showDropdown &&
          !isSearching &&
          searchResults.length === 0 &&
          searchQuery.length > 1 && (
            <View
              style={[
                styles.dropdown,
                styles.noResultsContainer,
                {
                  backgroundColor: colors.cardBg,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="search-outline"
                size={40}
                color={colors.subtext}
              />
              <Text style={[styles.noResultsText, { color: colors.text }]}>
                No stocks found
              </Text>
              <Text style={[styles.noResultsHint, { color: colors.subtext }]}>
                Try searching with ticker symbol or company name
              </Text>
            </View>
          )}
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  container: {
    position: "relative",
    zIndex: 1000,
    elevation: Platform.OS === 'android' ? 1000 : 0,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    paddingVertical: 0,
    height: 48,
  },
  dropdown: {
    position: "absolute",
    top: 54,
    left: 0,
    right: 0,
    maxHeight: 300,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    overflow: "hidden",
    zIndex: 2000,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  resultLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  symbolBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 55,
    alignItems: "center",
  },
  symbolText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  resultInfo: {
    flex: 1,
    paddingRight: 8,
  },
  resultName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 3,
  },
  resultMeta: {
    fontSize: 11,
    fontWeight: "500",
  },
  separator: {
    height: 1,
    marginHorizontal: 14,
  },
  footerHint: {
    padding: 14,
    alignItems: "center",
  },
  footerText: {
    fontSize: 11,
    fontWeight: "500",
    fontStyle: "italic",
  },
  noResultsContainer: {
    padding: 40,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 12,
  },
  noResultsHint: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
    textAlign: "center",
  },
});

export default SearchBar;