# Stockso - Stock Trading Platform

A stock tracking application built with React Native and Expo, featuring real-time market data, watchlist management, and an intuitive user interface.

## Features

### Core Functionality
- Explore Screen: View top gainers and losers in a grid layout
- Watchlist Management: Create, manage, and organize multiple watchlists
- Stock Detail Screen: Comprehensive stock information with interactive price charts
- Search Functionality: Quick search for stocks with debouncing
- Add to Watchlist: Seamlessly add/remove stocks from watchlists
- View All Screen: Browse complete lists with pagination support
- Real-time Data: Integration with Alpha Vantage API

### Advanced Features
- Dark/Light Theme: Dynamic theme switching
- Smart Caching: API response caching with expiration on Explore and Product screens
- State Management: Proper handling of Loading, Error, and Empty states
- Debounced Search: Optimized search with debouncing to reduce API calls

---

## Tech Stack

- **Framework**: React Native 0.81.4 with Expo SDK 54
- **Navigation**: React Navigation (Native Stack & Bottom Tabs)
- **State Management**: React Context API with AsyncStorage for persistence
- **API Integration**: Alpha Vantage API
- **Charts**: React Native Chart Kit
- **UI Components**: React Native Paper
- **Storage**: AsyncStorage for local data persistence
- **Theme Support**: Custom implementation with Expo Linear Gradient
- **Safe Area Handling**: React Native Safe Area Context

---

## Getting Started

### Prerequisites

Before running this project, ensure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go App on your Android device (Download from Play Store)

### Installation

1. Clone the repository
```bash
   git clone https://github.com/simgym/Stockso.git    
   cd Stockso
```

2. Install dependencies
```bash
   npm install
```

3. Configure API Key
   
   Get your free API key from Alpha Vantage: https://www.alphavantage.co/support/#api-key
   
   Create a `.env` file in the root directory and add your API key:
```
   EXPO_PUBLIC_ALPHA_KEY=your_api_key_here
```

4. Start the development server
```bash
   npm start
```

5. Run on your device
   - Scan the QR code with the Expo Go app (Android)
   - Or press 'a' to open in Android emulator

---

## Caching Implementation

The app implements smart caching to optimize API usage and improve performance:

- **Explore Screen**: Top gainers/losers data cached with expiration
- **Product Screen**: Stock details and price data cached with expiration
- Cache stored in AsyncStorage with timestamp-based expiration
- Automatic cache invalidation on expiry
- Cache-first strategy to minimize API calls

---

## API Endpoints Used

- **TOP_GAINERS_LOSERS**: Fetch top gainers and losers for the explore screen
- **OVERVIEW**: Get company overview and fundamental data
- **SYMBOL_SEARCH**: Search for stocks by keywords
- **GLOBAL_QUOTE**: Fetch real-time quote data for stocks
- **TIME_SERIES_INTRADAY**: Get intraday price data with configurable intervals
- **TIME_SERIES_DAILY**: Get daily historical price data for charts
- **TIME_SERIES_WEEKLY**: Get weekly historical price data
- **TIME_SERIES_MONTHLY**: Get monthly historical price data

---

## Search Functionality

The search feature includes debouncing implementation to optimize API usage and improve user experience by reducing unnecessary API calls while typing.

---

## Theme Support

- Light and Dark mode support
- Manual theme toggle
- Smooth transitions between themes

---

## API Rate Limiting

Alpha Vantage Free Tier limitations:
- 25 requests per day
- 5 requests per minute
- Implemented caching to minimize API calls
- User-friendly error messages for rate limit exceeded

---

## Known Limitations

- Alpha Vantage free tier has strict rate limits (25 requests/day)
- Real-time data updates require premium API access
- Some stocks may not have complete data available
- Chart data limited to daily timeframes

---