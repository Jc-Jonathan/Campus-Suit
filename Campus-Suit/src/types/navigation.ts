import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabsParamList } from '../navigation/MainTabs';
import { ProfileStackParamList } from '../navigation/ProfileStack';

// Define your root stack param list
export type RootStackParamList = {
  MainTabs: {
    screen?: keyof MainTabsParamList;
    params?: {
      screen?: keyof ProfileStackParamList;
    };
  };
  AdminStack: undefined;
  AddProduct: undefined;
  ProductDetail: { productId: number };  // Added ProductDetail screen type
  EditProduct: { product: { 
    productId: number; 
    name: string; 
    imageUrl: string; 
    newPrice: number; 
    oldPrice?: number 
  }};
};


// Re-export the AdminStackParamList from AdminStack
export * from '../navigation/AdminStack';

// This helps with type checking the navigation prop in your components
export type RootNavigationProp = NativeStackScreenProps<RootStackParamList>['navigation'];

// Add this if you need to type the route prop
export type RootRouteProp<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>['route'];

// Add type for the navigation prop when using useNavigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
