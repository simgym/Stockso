const EXPO_PUBLIC_ALPHA_KEY = process.env.EXPO_PUBLIC_ALPHA_KEY;

const BASE_URL = "https://www.alphavantage.co/query";

export const fetchTopGainersLosers = async () => {
  try {
    const res = await fetch(
      `${BASE_URL}?function=TOP_GAINERS_LOSERS&apikey=${EXPO_PUBLIC_ALPHA_KEY}`
    );
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching top gainers/losers:", err);
    return null;
  }
};

export const fetchCompanyOverview = async (symbol) => {
  try {
    const res = await fetch(
      `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${EXPO_PUBLIC_ALPHA_KEY}`
    );
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching company overview:", err);
    return null;
  }
};

export const fetchIntradayData = async (symbol, interval = '60min') => {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${EXPO_PUBLIC_ALPHA_KEY}`;
  const res = await fetch(url);
  return res.json();
};

export const fetchDailyData = async (symbol) => {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${EXPO_PUBLIC_ALPHA_KEY}`;
  const res = await fetch(url);
  return res.json();
};

export const fetchWeeklyData = async (symbol) => {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${symbol}&apikey=${EXPO_PUBLIC_ALPHA_KEY}`;
  const res = await fetch(url);
  return res.json();
};

export const fetchMonthlyData = async (symbol) => {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${EXPO_PUBLIC_ALPHA_KEY}`;
  const res = await fetch(url);
  return res.json();
};

export const searchSymbols = async (keywords) => {
  try {
    const res = await fetch(
      `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(keywords)}&apikey=${EXPO_PUBLIC_ALPHA_KEY}`
    );
    const data = await res.json();
    return data.bestMatches || [];
  } catch (err) {
    console.error("Error searching symbols:", err);
    return [];
  }
};

export const fetchGlobalQuote = async (symbol) => {
  try {
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${EXPO_PUBLIC_ALPHA_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data['Global Quote'] && Object.keys(data['Global Quote']).length > 0) {
      return data['Global Quote'];
    }
    console.error('No data found for GLOBAL_QUOTE');
    return null;
  } catch (err) {
    console.error('Error fetching global quote:', err);
    return null;
  }
};