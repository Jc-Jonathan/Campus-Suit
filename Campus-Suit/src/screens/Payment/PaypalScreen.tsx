import React, { useEffect, useState } from 'react';
import {
  View,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { StoreStackParamList } from '../../navigation/types.d.ts';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const BACKEND_URL = 'https://campus-suit-szub.onrender.com'; // REPLACE WITH YOUR IP

const PayPalScreen = () => {
  const route = useRoute<RouteProp<StoreStackParamList, 'PaypalScreen'>>();
  const navigation = useNavigation<NativeStackNavigationProp<StoreStackParamList>>();
  const [paypalUrl, setPaypalUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [captured, setCaptured] = useState<boolean>(false); // prevent duplicate capture
  const [exchangeRate, setExchangeRate] = useState<number>(0.012); // Default fallback rate
  const [converting, setConverting] = useState<boolean>(true);

  // Get amount from route params
  const amountInINR = route.params?.amount || 0;

  // 🔹 Get current exchange rate from API
  const getExchangeRate = async () => {
    try {
      setConverting(true);
      // Using a free exchange rate API
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      
      if (data.rates && data.rates.INR) {
        // Convert USD to INR rate (1 USD = X INR)
        const usdToInrRate = data.rates.INR;
        // Convert to INR to USD rate (1 INR = X USD)
        const inrToUsdRate = 1 / usdToInrRate;
        setExchangeRate(inrToUsdRate);
        console.log('Current exchange rate: 1 INR =', inrToUsdRate, 'USD');
      }
    } catch (error) {
      console.log('Failed to fetch exchange rate, using fallback:', error);
      // Fallback to a reasonable rate if API fails
      setExchangeRate(0.012);
    } finally {
      setConverting(false);
    }
  };

  // 🔹 Convert INR to USD
  const convertToUSD = (inrAmount: number): number => {
    const usdAmount = inrAmount * exchangeRate;
    // Round to 2 decimal places
    return Math.round(usdAmount * 100) / 100;
  };

  // 🔹 Create PayPal Order
  const createOrder = async () => {
    try {
      const usdAmount = convertToUSD(amountInINR);
      console.log(`Creating PayPal order: ₹${amountInINR} = $${usdAmount}`);
      
      const response = await fetch(`${BACKEND_URL}/api/paypal/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: usdAmount.toString() }),
      });

      const data = await response.json();

      if (data.url) {
        setPaypalUrl(data.url);
      } else {
        Alert.alert('Error', 'Failed to get PayPal URL');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  // 🔹 Capture Payment
  const capturePayment = async (orderId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/paypal/capture-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (data.status === 'COMPLETED') {
        // Navigate to OrderDisplay and show success popup
        navigation.navigate('OrderDisplay');
        setTimeout(() => {
          Alert.alert(
            'Payment Successful',
            'Successfully paid! Your order has been placed.',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('OrderDisplay')
              }
            ]
          );
        }, 500);
      } else {
        // Navigate to StoreHome and show failure popup
        navigation.navigate('StoreHome');
        setTimeout(() => {
          Alert.alert(
            'Payment Failed',
            'Payment failed or canceled. Pay again.',
            [{ text: 'OK' }]
          );
        }, 500);
      }
    } catch (error) {
      console.log(error);
      // Navigate to StoreHome and show error popup
      navigation.navigate('StoreHome');
      setTimeout(() => {
        Alert.alert(
          'Payment Failed',
          'Payment failed or canceled. Pay again.',
          [{ text: 'OK' }]
        );
      }, 500);
    }
  };

  // 🔹 Handle Navigation Changes
  const handleNavigation = (navState: WebViewNavigation) => {
    const url = navState.url;

    // ✅ SUCCESS
    if (url.includes('success') && !captured) {
      setCaptured(true); // prevent multiple calls

      try {
        const parsedUrl = new URL(url);
        const orderId = parsedUrl.searchParams.get('token');

        if (orderId) {
          capturePayment(orderId);
        }
      } catch (error) {
        console.log('URL Parse Error:', error);
      }
    }

    // ❌ CANCEL
    if (url.includes('cancel')) {
      // Navigate to StoreHome and show cancellation popup
      navigation.navigate('StoreHome');
      setTimeout(() => {
        Alert.alert(
          'Payment Canceled',
          'Payment failed or canceled. Pay again.',
          [{ text: 'OK' }]
        );
      }, 500);
    }
  };

  useEffect(() => {
    // First get the current exchange rate, then create the order
    const initializePayment = async () => {
      await getExchangeRate();
      await createOrder();
    };
    
    initializePayment();
  }, []);

  return (
    <View style={styles.container}>
      {(loading || converting) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0070ba" />
          {converting ? (
            <Text style={styles.loadingText}>Getting current exchange rate...</Text>
          ) : (
            <Text style={styles.loadingText}>Loading PayPal...</Text>
          )}
          {!converting && amountInINR > 0 && (
            <Text style={styles.conversionText}>
              ₹{amountInINR.toFixed(2)} = ${convertToUSD(amountInINR).toFixed(2)}
            </Text>
          )}
        </View>
      )}

      {paypalUrl && !converting && (
        <WebView
          source={{ uri: paypalUrl }}
          onLoad={() => setLoading(false)}
          onNavigationStateChange={handleNavigation}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
        />
      )}
    </View>
  );
};

export default PayPalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  conversionText: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#0070ba',
    textAlign: 'center',
  },
});