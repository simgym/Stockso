import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const WatchlistModal = ({ visible, onClose, symbol, onWatchlistUpdate }) => {
  const [watchlists, setWatchlists] = useState([]);
  const [selectedWatchlists, setSelectedWatchlists] = useState([]);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const { colors } = useTheme();

  useEffect(() => {
    if (visible) {
      loadWatchlists();
    }
  }, [visible]);

  const loadWatchlists = async () => {
    try {
      const stored = (await AsyncStorage.getItem('watchlists')) || '{}';
      const allWatchlists = JSON.parse(stored);
      
      const watchlistArray = Object.keys(allWatchlists).map(name => ({
        name,
        stocks: allWatchlists[name] || [],
      }));
      
      setWatchlists(watchlistArray);

      const containing = Object.keys(allWatchlists).filter(name =>
        allWatchlists[name].some(s => s.symbol === symbol)
      );
      setSelectedWatchlists(containing);
    } catch (error) {
      console.error('Error loading watchlists:', error);
    }
  };

  const toggleWatchlist = async (watchlistName) => {
    try {
      const stored = (await AsyncStorage.getItem('watchlists')) || '{}';
      const allWatchlists = JSON.parse(stored);

      if (!allWatchlists[watchlistName]) {
        allWatchlists[watchlistName] = [];
      }

      const isSelected = selectedWatchlists.includes(watchlistName);

      if (isSelected) {
        allWatchlists[watchlistName] = allWatchlists[watchlistName].filter(
          s => s.symbol !== symbol
        );
        setSelectedWatchlists(selectedWatchlists.filter(w => w !== watchlistName));
      } else {
        const stockExists = allWatchlists[watchlistName].some(s => s.symbol === symbol);
        if (!stockExists) {
          allWatchlists[watchlistName].push({ symbol });
        }
        setSelectedWatchlists([...selectedWatchlists, watchlistName]);
      }

      await AsyncStorage.setItem('watchlists', JSON.stringify(allWatchlists));
      onWatchlistUpdate();
      await loadWatchlists();
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      Alert.alert('Error', 'Failed to update watchlist');
    }
  };

  const createNewWatchlist = async () => {
    if (!newWatchlistName.trim()) {
      Alert.alert('Error', 'Please enter a watchlist name');
      return;
    }

    try {
      const watchlistNameTrim = newWatchlistName.trim();
      const stored = (await AsyncStorage.getItem('watchlists')) || '{}';
      const allWatchlists = JSON.parse(stored);

      if (allWatchlists[watchlistNameTrim]) {
        Alert.alert('Error', 'Watchlist already exists');
        return;
      }

      allWatchlists[watchlistNameTrim] = [{ symbol }];
      
      await AsyncStorage.setItem('watchlists', JSON.stringify(allWatchlists));

      setWatchlists([...watchlists, { name: watchlistNameTrim, stocks: [{ symbol }] }]);
      setSelectedWatchlists([...selectedWatchlists, watchlistNameTrim]);
      setNewWatchlistName('');
      setIsCreatingNew(false);
      onWatchlistUpdate();
      Alert.alert('Success', `Watchlist "${watchlistNameTrim}" created and stock added`);
    } catch (error) {
      console.error('Error creating watchlist:', error);
      Alert.alert('Error', 'Failed to create watchlist');
    }
  };

  const deleteWatchlist = async (watchlistName) => {
    try {
      Alert.alert(
        'Delete Watchlist',
        `Are you sure you want to delete "${watchlistName}"?`,
        [
          { text: 'Cancel', onPress: () => {} },
          {
            text: 'Delete',
            onPress: async () => {
              const stored = (await AsyncStorage.getItem('watchlists')) || '{}';
              const allWatchlists = JSON.parse(stored);
              delete allWatchlists[watchlistName];
              await AsyncStorage.setItem('watchlists', JSON.stringify(allWatchlists));
              loadWatchlists();
              onWatchlistUpdate();
              Alert.alert('Success', 'Watchlist deleted');
            },
            style: 'destructive',
          },
        ]
      );
    } catch (error) {
      console.error('Error deleting watchlist:', error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexContainer}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />        
        <View style={[styles.modalContainer, { backgroundColor: colors.cardBg }]}>
          <View style={[styles.handleBar, { backgroundColor: colors.subtext }]} />
          
          <View style={styles.headerContainer}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Manage Watchlists
            </Text>
            {!isCreatingNew && (
              <TouchableOpacity
                style={[styles.headerCreateButton, { backgroundColor: colors.headerBg }]}
                onPress={() => setIsCreatingNew(true)}
              >
                <Text style={styles.headerCreateButtonText}>+ Add</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {isCreatingNew && (
              <View style={[styles.createInputContainer, { backgroundColor: colors.background }]}>
                <TextInput
                  style={[
                    styles.createInput,
                    {
                      backgroundColor: colors.cardBg,
                      color: colors.text,
                      borderColor: colors.headerBg,
                    }
                  ]}
                  placeholder="Watchlist name"
                  placeholderTextColor={colors.subtext}
                  value={newWatchlistName}
                  onChangeText={setNewWatchlistName}
                  autoFocus
                  autoCorrect={false}
                />
                <View style={styles.createButtonGroup}>
                  <TouchableOpacity
                    style={[styles.confirmButton, { backgroundColor: colors.positive }]}
                    onPress={createNewWatchlist}
                  >
                    <Text style={styles.confirmButtonText}>Create</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmButton, { backgroundColor: colors.negative }]}
                    onPress={() => {
                      setIsCreatingNew(false);
                      setNewWatchlistName('');
                    }}
                  >
                    <Text style={styles.confirmButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {watchlists.length === 0 && !isCreatingNew ? (
              <View style={styles.emptyWatchlistContainer}>
                <Text style={[styles.emptyWatchlistText, { color: colors.subtext }]}>
                  No watchlists yet
                </Text>
                <Text style={[styles.emptyWatchlistSubtext, { color: colors.subtext }]}>
                  Tap + Add to create one
                </Text>
              </View>
            ) : (
              watchlists.map((watchlist) => (
                <View
                  key={watchlist.name}
                  style={[
                    styles.watchlistItem,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={styles.watchlistContent}
                    onPress={() => toggleWatchlist(watchlist.name)}
                  >
                    <View style={styles.checkboxContainer}>
                      <View
                        style={[
                          styles.checkbox,
                          { borderColor: colors.headerBg },
                          selectedWatchlists.includes(watchlist.name) && {
                            backgroundColor: colors.headerBg,
                          },
                        ]}
                      >
                        {selectedWatchlists.includes(watchlist.name) && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                      <View style={styles.watchlistInfo}>
                        <Text style={[styles.watchlistName, { color: colors.text }]}>
                          {watchlist.name}
                        </Text>
                        <Text style={[styles.watchlistCount, { color: colors.subtext }]}>
                          {watchlist.stocks.length} stock
                          {watchlist.stocks.length !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.deleteButton, { backgroundColor: colors.negative }]}
                    onPress={() => deleteWatchlist(watchlist.name)}
                  >
                    <Text style={styles.deleteButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>

          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: colors.headerBg }]}
            onPress={onClose}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerCreateButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  headerCreateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  watchlistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  watchlistContent: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  watchlistInfo: {
    flex: 1,
  },
  watchlistName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  watchlistCount: {
    fontSize: 12,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  createInputContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  createInput: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  createButtonGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  doneButton: {
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyWatchlistContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyWatchlistText: {
    fontSize: 16,
    marginBottom: 8,
  },
  emptyWatchlistSubtext: {
    fontSize: 13,
    opacity: 0.7,
  },
});

export default WatchlistModal;