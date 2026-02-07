import React from 'react';
import { useFocusEffect } from '@react-navigation/native';

import {

  View,

  Text,

  StyleSheet,

  Image,

  FlatList,

  TouchableOpacity,

  Platform,

  StatusBar

} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import { useCart } from '../../contexts/CartContext';

import { AppButton } from '../../components/AppButton';

import { theme } from '../../theme/theme';

import { useNavigation } from '@react-navigation/native';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { StoreStackParamList } from '../../navigation/types';

import { useAuth } from '../../contexts/AuthContext';



export const CartScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StoreStackParamList>>();
  const { user } = useAuth();
  const { cart, incrementQty, removeFromCart, switchUser, currentUserId } = useCart();

  // Filter cart items to show only those belonging to the logged-in user
  const userCart = currentUserId && user?.email 
    ? cart.filter(item => {
        // This assumes cart items are already filtered by user ID in CartContext
        // If you need additional email filtering, you can add it here
        return true;
      })
    : cart;

  const totalItems = userCart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = userCart.reduce(
    (sum, i) => sum + i.newPrice * i.quantity,
    0
  );

  // Switch to logged-in user if not already switched
  React.useEffect(() => {
    if (user?.email && currentUserId && currentUserId !== user.email) {
      switchUser(user.email);
    }
  }, [user?.email, currentUserId, switchUser]);

  // Automatically refresh cart when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // This will be called whenever the screen comes into focus
      // CartContext automatically handles cart persistence and loading
      console.log('CartScreen focused - cart items:', userCart.length);
    }, [userCart.length])
  );

  // Listen for cart changes in real-time (even when screen is not focused)
  React.useEffect(() => {
    console.log('Cart updated in real-time - items:', userCart.length);
  }, [cart, userCart.length]);



  return (

    <SafeAreaView style={styles.safeArea}>

      <View style={styles.container}>

        <View style={styles.header}>

          <Text style={styles.title}>My Cart</Text>

          <Text style={styles.itemCount}>({totalItems} {totalItems === 1 ? 'item' : 'items'})</Text>

        </View>



        {userCart.length === 0 ? (

          <View style={styles.emptyContainer}>

            <Ionicons name="cart-outline" size={80} color={theme.colors.primary} />

            <Text style={styles.emptyTitle}>Your cart is empty</Text>

            <Text style={styles.emptyText}>Looks like you haven't added anything to your cart yet</Text>

            <AppButton 

              label="Add Products"

              onPress={() => navigation.navigate('StoreHome')}

              style={styles.addButton}

              textStyle={styles.buttonText}

            />

          </View>

        ) : (

          <>

            <FlatList

              data={userCart}

              keyExtractor={item => item.productId.toString()}

              showsVerticalScrollIndicator={false}

              contentContainerStyle={styles.listContent}

              renderItem={({ item }) => (

                <View style={styles.card}>

                  <Image 

                    source={{ uri: item.imageUrl }} 

                    style={styles.image} 

                    resizeMode="cover"

                  />



                  <View style={styles.infoContainer}>

                    <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">

                      {item.name}

                    </Text>

                    

                    <View style={styles.priceContainer}>

                      <Text style={styles.price}>₹{item.newPrice.toFixed(2)}</Text>

                      {item.oldPrice && (

                        <Text style={styles.oldPrice}>₹{item.oldPrice.toFixed(2)}</Text>

                      )}

                    </View>

                    

                    <View style={styles.quantityContainer}>

                      <TouchableOpacity 

                        style={styles.quantityButton}

                        onPress={() => removeFromCart(item.productId)}

                      >

                        <Ionicons name="remove" size={16} color={theme.colors.primary} />

                      </TouchableOpacity>

                      

                      <Text style={styles.quantity}>

                        {item.quantity}

                      </Text>

                      

                      <TouchableOpacity 

                        style={styles.quantityButton}

                        onPress={() => incrementQty(item.productId)}

                      >

                        <Ionicons name="add" size={16} color={theme.colors.primary} />

                      </TouchableOpacity>

                      

                      <TouchableOpacity 

                        style={styles.deleteButton}

                        onPress={() => removeFromCart(item.productId, true)}

                      >

                        <Ionicons name="trash-outline" size={18} color="#e74c3c" />

                      </TouchableOpacity>

                    </View>

                    

                    <Text style={styles.itemTotal}>

                      ₹{(item.newPrice * item.quantity).toFixed(2)}

                    </Text>

                  </View>

                </View>

              )}

            />



            <View style={styles.summary}>

              <View style={styles.summaryRow}>

                <Text style={styles.summaryLabel}>Subtotal</Text>

                <Text style={styles.summaryValue}>₹{totalPrice.toFixed(2)}</Text>

              </View>

              <View style={styles.summaryRow}>

                <Text style={styles.summaryLabel}>Shipping</Text>

                <Text style={styles.summaryValue}>

                  {totalPrice > 0 ? 'Free' : '₹0.00'}

                </Text>

              </View>

              <View style={styles.divider} />

              <View style={[styles.summaryRow, { marginBottom: 16 }]}>

                <Text style={styles.totalLabel}>Total</Text>

                <Text style={styles.totalValue}>₹{totalPrice.toFixed(2)}</Text>

              </View>

              

              <AppButton 
                label="Proceed to Checkout" 
                textStyle={styles.buttonText}
                onPress={() => navigation.navigate('Checkout', { 
                  cartItems: userCart, 
                  totalPrice: totalPrice, 
                  source: 'cart' as const 
                })} 
                style={styles.checkoutButton}
              />

              <AppButton 
                label="Check Your Basket" 
                textStyle={styles.outlineButtonText}
                variant="outline"
                onPress={() => {
                  navigation.navigate('OrderDisplay');
                }} 
                style={styles.basketButton}
              />

            </View>

          </>

        )}

      </View>

    </SafeAreaView>

  );

};



const styles = StyleSheet.create({

  safeArea: {

    flex: 1,

    backgroundColor: '#fff',

    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,

  },

  container: {

    flex: 1,

    backgroundColor: '#f8f9fa',

    marginTop:-30,

    padding: 16,

  },

  header: {

    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 20,

  },

  title: {

    fontSize: 20,

    fontWeight: '700',

    color: theme.colors.text,

    marginRight: 8,

  },

  itemCount: {

    fontSize: 14,

    color: '#e20808ff',

  },

  listContent: {

    paddingBottom: 16,

  },

  card: {

    flexDirection: 'row',

    backgroundColor: '#fff',

    borderRadius: 12,

    padding: 12,

    marginBottom: 12,

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.1,

    shadowRadius: 4,

    elevation: 3,

  },

  image: {

    width: 90,

    height: 90,

    borderRadius: 8,

    marginRight: 12,

  },

  infoContainer: {

    flex: 1,

    justifyContent: 'space-between',

  },

  name: {

    fontSize: 13,

    fontWeight: '600',

    color: theme.colors.text,

    marginBottom: 4,

  },

  priceContainer: {

    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 8,

  },

  price: {

    fontSize: 14,

    fontWeight: '700',

    color: theme.colors.primary,

    marginRight: 8,

  },

  oldPrice: {

    fontSize: 11,

    color: '#e30707ff',

    textDecorationLine: 'line-through',

  },

  quantityContainer: {

    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 8,

  },

  quantityButton: {

    width: 28,

    height: 28,

    borderRadius: 14,

    borderWidth: 1,

    borderColor: theme.colors.primary,

    justifyContent: 'center',

    alignItems: 'center',

  },

  quantity: {

    fontSize: 14,

    fontWeight: '600',

    marginHorizontal: 12,

    minWidth: 20,

    textAlign: 'center',

  },

  deleteButton: {

    marginLeft: 'auto',

    padding: 4,

  },

  itemTotal: {

    fontSize: 14,

    fontWeight: '700',

    color: theme.colors.text,

    textAlign: 'right',

  },

  summary: {

    backgroundColor: '#fff',

    marginTop:10,

    borderTopLeftRadius: 20,

    borderTopRightRadius: 20,

    padding: 20,

    shadowColor: '#000',

    shadowOffset: { width: 0, height: -2 },

    shadowOpacity: 0.1,

    shadowRadius: 8,

    elevation: 5,

  },

  summaryRow: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    marginBottom: 8,

  },

  summaryLabel: {

    fontSize: 13,

    color: '#666',

  },

  summaryValue: {

    fontSize: 13,

    fontWeight: '500',

  },

  totalLabel: {

    fontSize: 16,

    fontWeight: '700',

    color: theme.colors.text,

  },

  totalValue: {

    fontSize: 16,

    fontWeight: '700',

    color: theme.colors.primary,

  },

  divider: {

    height: 1,

    backgroundColor: '#eee',

    marginVertical: 12,

  },

  checkoutButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 38,
  },

  basketButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },

  emptyContainer: {

    flex: 1,

    justifyContent: 'center',

    alignItems: 'center',

    padding: 40,

  },

  emptyTitle: {

    fontSize: 18,

    fontWeight: '600',

    marginTop: 16,

    marginBottom: 8,

    color: theme.colors.text,

    textAlign: 'center',

  },

  emptyText: {

    fontSize: 13,

    color: '#666',

    textAlign: 'center',

    lineHeight: 18,

    marginBottom: 20,

  },

  addButton: {
    width: '50%',
    minHeight: 40,
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  outlineButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },

});
