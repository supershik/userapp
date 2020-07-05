/**
 * @format
 * @flow strict-local
 */

import React, {useEffect} from 'react';
import {
  StyleSheet,
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DrawContent } from './DrawerContent';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import LiveOrderScreen from './LiveOrderScreen';
import LiveOrderDetailScreen from './LiveOrderDetailScreen';
import CartScreen from './CartScreen';
import OrderSummaryScreen from './OrderSummaryScreen';
import SearchScreen from './SearchScreen';
import OrderHistoryScreen from './OrderHistoryScreen';
import OrderDetailScreen from './OrderDetailScreen';
import SubscriptionScreen from './SubscriptionScreen';
import USERAPIKit, { setUserClientToken, setShopClientToken } from '../../utils/apikit';
import {fcmService} from '../../fcm/FCMService';
import {localNotificationService} from '../../fcm/LocalNotificationService';
import { colors } from '../../res/style/colors'
import RewardScreen from './RewardScreen';
import MapViewScreen from './MapViewScreen';
import ShopMapScreen from './ShopMapScreen';
import SearchScreenFromMap from './SearchScreenFromMap';
import CartScreenFromMap from './CartScreenFromMap';
import OrderSummaryScreenFromMap from './OrderSummaryScreenFromMap';
import CartScreenFromCategoriesHome from './CartScreenFromCategoriesHome';
import ShopMapScreenFromCart from './ShopMapScreenFromCart';
import OrderSummaryScreenFromCart from './OrderSummaryScreenFromCart';
import CashfreePayment from './CashfreePayment';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();


const HomeStackScreen = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Categories(Home)"
        component={HomeScreen}
      />
      <Stack.Screen
          name="Search Product"
          component={SearchScreen}
      />
      <Stack.Screen
        name="CartFromCategoriesHome"
        component={CartScreenFromCategoriesHome}
      />
      <Stack.Screen
        name="Shop Map"
        component={ShopMapScreen}
      />
      <Stack.Screen
        name="Order Summary"
        component={OrderSummaryScreen}
      />
    </Stack.Navigator>
  );
};

const MapViewStackScreen = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Map View"
        component={MapViewScreen}
        options={{
          title: 'Shops',
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <MaterialCommunityIcons.Button name="menu" size={25}
              backgroundColor={colors.primary}
              onPress={() => navigation.openDrawer()}
            ></MaterialCommunityIcons.Button>
          ),
        }}
      />
      <Stack.Screen
        name="Search Screen From Map"
        component={SearchScreenFromMap}
      />
      <Stack.Screen
        name="Cart Screen From Map"
        component={CartScreenFromMap}
      />
      <Stack.Screen
        name="Order Summary From Map"
        component={OrderSummaryScreenFromMap}
      />

    </Stack.Navigator>
  );
};

const LiveOrderStackScreen = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="LiveOrder"
        component={LiveOrderScreen}
        options={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <MaterialCommunityIcons.Button name="menu" size={25}
              backgroundColor={colors.primary}
              onPress={() => navigation.openDrawer()}
            ></MaterialCommunityIcons.Button>
          )
        }}
      />
      <Stack.Screen
        name="Live Order Detail"
        component={LiveOrderDetailScreen}
        options={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="Cashfree"
        component={CashfreePayment}
      />
    </Stack.Navigator>
  );
};

const CartStackScreen = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Cart"
        component={CartScreen}
      />
      <Stack.Screen
        name="Shop Map From Cart"
        component={ShopMapScreenFromCart}
      />
      <Stack.Screen
        name="Order Summary From Cart"
        component={OrderSummaryScreenFromCart}
      />
    </Stack.Navigator>

  );
};

const OrderHistoryStackScreen = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Order History"
        component={OrderHistoryScreen}
        options={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <MaterialCommunityIcons.Button name="menu" size={25}
              backgroundColor={colors.primary}
              onPress={() => navigation.openDrawer()}
            ></MaterialCommunityIcons.Button>
          )
        }}
      />
      <Stack.Screen
        name="Order Detail"
        component={OrderDetailScreen}
      />
    </Stack.Navigator>
  );
};

const SubscriptionStackScreen = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <MaterialCommunityIcons.Button name="menu" size={25}
              backgroundColor={colors.primary}
              onPress={() => navigation.openDrawer()}
            ></MaterialCommunityIcons.Button>
          )
        }}
      />
    </Stack.Navigator>
  );
};

const ProfileStackScreen = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <MaterialCommunityIcons.Button name="menu" size={25}
              backgroundColor={colors.primary}
              onPress={() => navigation.openDrawer()}
            ></MaterialCommunityIcons.Button>
          )
        }}
      />
    </Stack.Navigator>
  );
};

const RewardStackScreen = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Rewards"
        component={RewardScreen}
        options={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <MaterialCommunityIcons.Button name="menu" size={25}
              backgroundColor={colors.primary}
              onPress={() => navigation.openDrawer()}
            ></MaterialCommunityIcons.Button>
          )
        }}
      />
    </Stack.Navigator>
  );
};

const DashboardScreen = ({ navigation }) => {

  useEffect(() => {
    fcmService.registerAppWithFCM();
    fcmService.register(onRegister, onNotification, onOpenNotification);
    localNotificationService.configure(onOpenNotification)

    function onRegister(token) {
      console.log("[App] onRegister: ", token);
      const payload = {devicetoken: token};
      const onSuccess = ({ data }) => {
          console.log("FCM token updated: " + data);
      }
      const onFailure = error => {
          console.log("FCM token updated: error");
          console.log(error && error.response);
      }
      USERAPIKit.patch('/user/update/token', payload)
          .then(onSuccess)
          .catch(onFailure);
    }

    function onNotification(notify) {
      console.log("[App] onNotification: ", notify);
      const options = {
        soundName: 'default',
        playSound: true
      }
      localNotificationService.showNotification(
        0,
        notify.title,
        notify.body,
        notify,
        options
      )
    }

    function onOpenNotification(notify) {
      console.log("[App] onOpenNotification: ", notify);
      //alert("Open Notification: " + notify.body);
    }

    return () => {
      console.log("[App] unRegister");
      fcmService.unRegister();
      localNotificationService.unregister();

    }
  }, [])
  
  return (
    <>
      <Drawer.Navigator
        initialRouteName="Home"
        drawerContent={props => <DrawContent {...props} />}>
        <Drawer.Screen
          name="Home"
          component={HomeStackScreen} />
        <Drawer.Screen
          name="Profile"
          component={ProfileStackScreen} />
        <Drawer.Screen
          name="Subscription"
          component={SubscriptionStackScreen} />
        <Drawer.Screen
          name="Cart"
          component={CartStackScreen} />
        <Drawer.Screen
          name="Order History"
          component={OrderHistoryStackScreen} />
        <Drawer.Screen
          name="Live Order"
          component={LiveOrderStackScreen} />
        <Drawer.Screen
          name="Rewards"
          component={RewardStackScreen} />
        <Drawer.Screen
          name="Map View"
          component={MapViewStackScreen} />

      </Drawer.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  searchbar: {
    margin: 4,
  },
  searchIcon: {
    padding: 1,
    marginVertical: 12,
    marginHorizontal: 15,
    height: 24,
    width: 24,
    tintColor: '#fff',
    // tintColor: 'rgba(255,0,0,1)',
    resizeMode: 'stretch',
  },

  repeatIcon: {
    padding: 1,
    marginVertical: 12,
    marginHorizontal: 15,
    height: 24,
    width: 30,
    tintColor: '#fff',
    // tintColor: 'rgba(255,0,0,1)',
    resizeMode: 'stretch',
  },

  addCartIcon: {
    padding: 1,
    marginVertical: 10,
    marginHorizontal: 15,
    height: 25,
    width: 24,
    tintColor: '#fff',
    // tintColor: 'rgba(255,0,0,1)',
    resizeMode: 'stretch',
  },
  orderCartIcon: {
    padding: 1,
    marginVertical: 11,
    marginHorizontal: 10,
    height: 25,
    width: 28,
    tintColor: '#fff',
    // tintColor: 'rgba(255,0,0,1)',
    resizeMode: 'stretch',
  },
   cleanIcon: {
    padding: 10,
    marginVertical: 12,
    marginHorizontal: 15,
    height: 25,
    width: 27,
    tintColor: '#fff',
    // tintColor: 'rgba(255,0,0,1)',
    resizeMode: 'stretch',
  },
});
export default DashboardScreen;