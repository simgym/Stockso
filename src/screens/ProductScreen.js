import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCompanyOverview, fetchIntradayData,
  fetchDailyData,
  fetchWeeklyData,
  fetchMonthlyData, fetchGlobalQuote} from '../api/alphavantage';
import WatchlistModal from '../components/WatchlistModal';
import { useTheme, useStyleSheet } from '../context/ThemeContext';
import { Ionicons } from "@expo/vector-icons";
import { getCachedData, cacheData } from '../utils/cache';

const getChartWidth = (labelCount) => {
  const baseWidth = Dimensions.get('window').width - 40;
  const extraWidthPerLabel = 45;
  return Math.max(baseWidth, labelCount * extraWidthPerLabel);
};

const StockDetailsScreen = ({ route, navigation }) => {
  const { symbol } = route.params;
  const {colors } = useTheme();
  const [data, setData] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('1H');
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);

  const themeColors = {
    primary: colors.headerBg,
    primaryLight: '#3B82F6',
    darkBg: colors.background,
    cardBg: colors.cardBg,
    text: colors.text,
    textSecondary: colors.subtext,
    success: colors.positive,
    danger: colors.negative,
  };

 const styles = useStyleSheet((themeColors) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    fontSize: 16,
    color: themeColors.primary,
    fontWeight: '600',
  },
  iconButton: {
    padding: 8,
  },
  stockHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  symbol: {
    fontSize: 32,
    fontWeight: '700',
    color: themeColors.text,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    color: themeColors.textSecondary,
    marginBottom: 20,
  },
  priceContainer: {
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 40,
    fontWeight: '700',
    color: themeColors.text,
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceChange: {
    fontSize: 18,
    fontWeight: '600',
  },
  changePercent: {
    fontSize: 16,
    fontWeight: '600',
  },
  chartSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: themeColors.text,
    marginBottom: 16,
  },
  scrollableChartContainer: {
    backgroundColor: themeColors.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingLeft: 0,
  },
  chartWrapper: {
    minWidth: getChartWidth(10),
  },
  scrollableChart: {
    borderRadius: 16,
  },
  chartContainer: {
    backgroundColor: themeColors.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 10,
  },
  chart: {
    borderRadius: 16,
  },
  chartPlaceholder: {
    height: 240,
    backgroundColor: themeColors.cardBg,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: themeColors.primary,
  },
  filterButtonActive: {},
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  metricsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: themeColors.cardBg,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: themeColors.primary,
  },
  metricLabel: {
    fontSize: 13,
    color: themeColors.textSecondary,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: themeColors.text,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 30,
  },
  infoRow: {
    backgroundColor: themeColors.cardBg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 14,
    color: themeColors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: themeColors.text,
    fontWeight: '600',
  },
}));

const MetricCard = ({ label, value }) => (
  <View style={styles.metricCard}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

  useEffect(() => {
    loadStockData();
    checkWatchlistStatus();
  }, [symbol]);

  useEffect(() => {
    if (data) {
      loadChartData(selectedTimeFilter);
    }
  }, [selectedTimeFilter,data]);

const loadStockData = async () => {
  try {
    setLoading(true);

    // check cache for company overview
    const overviewCacheKey = `stock_${symbol}`;
    let overviewData = await getCachedData(overviewCacheKey);
    if (!overviewData) {
      overviewData = await fetchCompanyOverview(symbol);

      if (!overviewData || !overviewData.Symbol) {
        // navigating back to screen if stock not found
        navigation.goBack();
        Alert.alert('Error', 'Stock not found');
        return;
      }
      await cacheData(overviewCacheKey, overviewData, 3600000);
    }
    setData(overviewData);

    // Check cache for price data
    const priceCacheKey = `price_${symbol}`;
    let priceData = await getCachedData(priceCacheKey);

    if (!priceData) {
      const quoteData = await fetchGlobalQuote(symbol);
      if (quoteData && quoteData['05. price']) {
        priceData = {
          price: parseFloat(quoteData['05. price']) || 0,
          change: parseFloat(quoteData['09. change']) || 0,
          changePercent: parseFloat(quoteData['10. change percent'].replace('%', '')) || 0,
        };
        await cacheData(priceCacheKey, priceData, 300000);
      } else {
        throw new Error('No price data available');
      }
    }
    setPriceData(priceData);
  } catch (error) {
    console.error('Error loading stock data:', error);
    Alert.alert('Error', 'Failed to load stock data');
  } finally {
    setLoading(false);
  }
};

const loadChartData = async (timeFilter) => {
  try {
    setChartLoading(true);

    const chartCacheKey = `chart_${symbol}_${timeFilter}`;
    let cachedChart = await getCachedData(chartCacheKey);

    if (cachedChart) {
      setChartData(cachedChart);
      return;
    }

    let timeSeriesKey = '';
    let dataLimit = 10;
    let res;

    switch (timeFilter) {
      case '1H':
        res = await fetchIntradayData(symbol, '60min');
        timeSeriesKey = 'Time Series (60min)';
        dataLimit = 10;
        break;
      case '1D':
        res = await fetchDailyData(symbol);
        timeSeriesKey = 'Time Series (Daily)';
        dataLimit = 10;
        break;
      case '1W':
        res = await fetchWeeklyData(symbol);
        timeSeriesKey = 'Weekly Time Series';
        dataLimit = 7;
        break;
      case '1M':
        res = await fetchMonthlyData(symbol);
        timeSeriesKey = 'Monthly Time Series';
        dataLimit = 7;
        break;
      default:
        res = await fetchIntradayData(symbol, '60min');
        timeSeriesKey = 'Time Series (60min)';
    }

    const timeSeries = res?.[timeSeriesKey];

    if (!timeSeries) throw new Error('No time series data found');

    const entries = Object.entries(timeSeries)
      .slice(0, dataLimit)
      .reverse(); 

    const labels = entries.map(([time], index) => {
      const date = new Date(time);
      if (timeFilter === '1H' || timeFilter === '1D') {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    });

    const dataset = entries.map(([, values]) =>
      parseFloat(values['4. close'])
    );

    const formattedChartData = {
      labels: labels,
      datasets: [{ data: dataset }],
    };

     await cacheData(chartCacheKey, formattedChartData, 300000);

    setChartData(formattedChartData);
  } catch (error) {
    console.error('Error loading chart data:', error);
    Alert.alert('Error', 'Failed to load chart data');
  } finally {
    setChartLoading(false);
  }
};

const getSpacedLabels = (labels, timeFilter) => {
  const maxLabels = {
    '1H': 6,
    '1D': 6,
    '1W': 5,
    '1M': 5,
  }[timeFilter] || 6;

  if (labels.length <= maxLabels) return labels;

  const spacedLabels = [];
  const step = Math.floor(labels.length / maxLabels);

  for (let i = 0; i < labels.length; i += step) {
    spacedLabels.push(labels[i]);
  }

  if (spacedLabels[spacedLabels.length - 1] !== labels[labels.length - 1]) {
    spacedLabels.push(labels[labels.length - 1]);
  }

  return spacedLabels.slice(0, maxLabels);
};

const checkWatchlistStatus = async () => {
  try {
    const stored = await AsyncStorage.getItem('watchlists');
    const allWatchlists = stored ? JSON.parse(stored) : {};
    
    const isInAnyWatchlist = Object.values(allWatchlists).some(stocks =>
      Array.isArray(stocks) && stocks.some(s => s.symbol === symbol)
    );
    
    setInWatchlist(isInAnyWatchlist);
  } catch (error) {
    console.error('❌ Error checking watchlist:', error);
    setInWatchlist(false);
  }
};

  if (loading || !data) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.darkBg }]}>
        <ActivityIndicator size="large" color={themeColors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const isPositive = priceData?.change >= 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.darkBg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
  onPress={() => setShowWatchlistModal(true)} 
  style={styles.iconButton}
>
  <Ionicons
    name={inWatchlist ? "bookmark" : "bookmark-outline"}
    size={20}
    color={themeColors.textSecondary}
  />
</TouchableOpacity>
        </View>
        <View style={styles.stockHeader}>
          <Text style={{ color: themeColors.text }}>{symbol}</Text>
          <Text style={{ color: themeColors.textSecondary }}>{data.Name}</Text>

          <View style={styles.priceContainer}>
            <Text style={{ color: themeColors.text }}>
              ${priceData?.price.toFixed(2)}
            </Text>
            <View style={styles.changeContainer}>
              <Text
                style={[
                  styles.priceChange,
                  { color: isPositive ? themeColors.success : themeColors.danger },
                ]}
              >
                {isPositive ? '+' : ''}${priceData?.change.toFixed(2)}
              </Text>
              <Text
                style={[
                  styles.changePercent,
                  { color: isPositive ? themeColors.success : themeColors.danger },
                ]}
              >
                ({isPositive ? '+' : ''}{priceData?.changePercent.toFixed(2)}%)
              </Text>
            </View>
          </View>
        </View>
<View style={styles.chartSection}>
  <Text style={[styles.sectionTitle,{ color: themeColors.text }]}>Price Chart ({selectedTimeFilter})</Text>

  {chartData && !chartLoading ? (
    <View style={styles.scrollableChartContainer}>
      <ScrollView 
        horizontal={true} 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.chartWrapper}>
          <LineChart
            data={{
              ...chartData,
              labels: getSpacedLabels(chartData.labels, selectedTimeFilter)
            }}
            width={getChartWidth(chartData.labels.length)} 
            height={240}
            chartConfig={{
              backgroundColor: themeColors.cardBg,
              backgroundGradientFrom: themeColors.cardBg,
              backgroundGradientTo: themeColors.cardBg,
              decimalPlaces: 2,
              color: () => themeColors.primary,
              labelColor: () => themeColors.textSecondary,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '3',
                strokeWidth: '2',
                stroke: themeColors.primary,
              },
              propsForVerticalLabels: {
                fontSize: 10, 
              },
            }}
            bezier
            style={styles.scrollableChart}
          />
        </View>
      </ScrollView>
    </View>
  ) : (
    <View style={styles.chartPlaceholder}>
      <ActivityIndicator color={themeColors.primary} />
    </View>
  )}
  <View style={styles.timeFilterContainer}>
    {['1H', '1D', '1W', '1M'].map((filter) => (
      <TouchableOpacity
        key={filter}
        style={[
          styles.filterButton,
          selectedTimeFilter === filter && styles.filterButtonActive,
          {
            backgroundColor:
              selectedTimeFilter === filter ? themeColors.primary : themeColors.cardBg,
          },
        ]}
        onPress={() => setSelectedTimeFilter(filter)}
        disabled={chartLoading}
      >
        <Text
          style={[
            styles.filterButtonText,
            {
              color:
                selectedTimeFilter === filter ? '#FFF' : themeColors.textSecondary,
            },
          ]}
        >
          {filter}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
</View>

        <View style={styles.metricsSection}>
          <Text style={[ styles.sectionTitle , { color: themeColors.text }]}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              label="Market Cap"
              value={
                data.MarketCapitalization
                  ? `$${(parseInt(data.MarketCapitalization) / 1000000).toFixed(0)}M`
                  : 'N/A'
              }
            />
            <MetricCard
              label="P/E Ratio"
              value={data.PERatio || 'N/A'}
            />
            <MetricCard
              label="52W High"
              value={`$${data['52WeekHigh'] || 'N/A'}`}
            />
            <MetricCard
              label="52W Low"
              value={`$${data['52WeekLow'] || 'N/A'}`}
            />
            <MetricCard
              label="Beta"
              value={data.Beta || 'N/A'}
            />
            <MetricCard
              label="EPS"
              value={data.EPS || 'N/A'}
            />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle ,{ color: themeColors.text }]}>Company Information</Text>
          <InfoRow label="Industry" value={data.Industry} />
          <InfoRow label="Sector" value={data.Sector} />
          <InfoRow label="Exchange" value={data.Exchange} />
          <InfoRow label="Country" value={data.Country} />
          {data.OfficialSite && (
            <InfoRow label="Website" value={data.OfficialSite} />
          )}
        </View>
      </ScrollView>
      <WatchlistModal
  visible={showWatchlistModal}
  onClose={() => setShowWatchlistModal(false)}
  symbol={symbol}
  onWatchlistUpdate={() => {
    checkWatchlistStatus();
  }}
/>
    </SafeAreaView>
  );
};

export default StockDetailsScreen;