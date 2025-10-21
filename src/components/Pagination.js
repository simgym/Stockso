import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, useStyleSheet } from '../context/ThemeContext';

const Pagination = ({ totalItems, itemsPerPage, onPageChange, onItemsPerPageChange }) => {
  const { colors } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);

  const themeColors = {
    ...colors,
    primary: colors.headerBg,
  };

  const itemsPerPageOptions = [5, 10, 15, 20];

  const styles = useStyleSheet((themeColors) => StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
      backgroundColor: themeColors.background,
    },
    navButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: themeColors.primary,
      minWidth: 60,
      alignItems: 'center',
    },
    navButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    disabledNavButton: {
      opacity: 0.4,
      backgroundColor: themeColors.border,
    },
    pageInfo: {
      fontSize: 12,
      fontWeight: '600',
      color: themeColors.text,
      alignSelf: 'center',
      marginHorizontal: 8,
    },
    itemsPerPageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.cardBg,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: themeColors.border,
      overflow: 'hidden',
    },
    itemsPerPageButton: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedItemsPerPageButton: {
      backgroundColor: themeColors.primary,
    },
    itemsPerPageText: {
      fontSize: 12,
      fontWeight: '500',
      color: themeColors.text,
    },
    selectedItemsPerPageText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
  }));

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      onPageChange(newPage);
    }
  };

  const handleItemsPerPageChange = (value) => {
    setCurrentPage(1);
    onItemsPerPageChange(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.itemsPerPageContainer}>
        {itemsPerPageOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.itemsPerPageButton,
              itemsPerPage === option && styles.selectedItemsPerPageButton,
            ]}
            onPress={() => handleItemsPerPageChange(option)}
          >
            <Text
              style={[
                styles.itemsPerPageText,
                itemsPerPage === option && styles.selectedItemsPerPageText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          style={[styles.navButton, currentPage === 1 && styles.disabledNavButton]}
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Text style={styles.navButtonText}>Prev</Text>
        </TouchableOpacity>
        <Text style={styles.pageInfo}>
          {currentPage}/{totalPages}
        </Text>
        <TouchableOpacity
          style={[styles.navButton, currentPage === totalPages && styles.disabledNavButton]}
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Text style={styles.navButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Pagination;