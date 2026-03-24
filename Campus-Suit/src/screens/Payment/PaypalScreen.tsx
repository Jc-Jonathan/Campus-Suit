import React, { useEffect, useState } from 'react';
import {
  View,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';

const BACKEND_URL = 'https://campus-suit-szub.onrender.com'; // 🔴 REPLACE WITH YOUR IP

const PayPalScreen = () => {
  const [paypalUrl, setPaypalUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [captured, setCaptured] = useState<boolean>(false); // prevent duplicate capture

  // 🔹 Create PayPal Order
  const createOrder = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/paypal/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: '10.00' }), // 💰 change dynamically if needed
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
        Alert.alert('Success', 'Payment Successful ✅');
      } else {
        Alert.alert('Error', 'Payment not completed');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Capture failed');
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
      Alert.alert('Cancelled', 'Payment Cancelled ❌');
    }
  };

  useEffect(() => {
    createOrder();
  }, []);

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" />}

      {paypalUrl && (
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
});