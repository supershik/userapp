/**
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState, useContext } from 'react';

import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage'
import USERAPIKit, { SHOPAPIKit, setShopClientToken } from '../../utils/apikit';
import { colors } from '../../res/style/colors'
import imgRepeatOrder from '../../res/assets/images/repeat_order.png'

const OrderDetailScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [orderRef, setOrderRef] = useState(route.params.orderref);
  const [orderdetails, setData] = useState([]);
  const [order, setOrder] = useState({
    orderref: '',
    shopname: 0,
    totalquantity: 0,
    ordertotal: 0,
    status: 0,
    orderpickuptime: '',
    shopcategoryid: 0,
    orderdetails: [],
  })

  const navigationiOptions = () => {
    navigation.setOptions({ 
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },

      headerRight: () => (
        <View style={{flexDirection: 'row', alignSelf: "center", marginRight: 5}}>
          <TouchableOpacity
            onPress={() => reorderProducts()}>
            <Image
              source={imgRepeatOrder}
              style={styles.repeatIcon}
            />
          </TouchableOpacity>
        </View>
      )
    })
  }
  
  const reorderProducts = async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken')
      } catch (e) {
        console.log(e);
      }
      if (userToken != null) {
        const onSuccess = ({ data }) => {
          setLoading(false);
          // console.log(data);
          Toast.show(data.message);
          
          let shopcategoryinfo = {
            "imageurl": "",
            "shopcategory": "Grocery",
            "shopcategorydesc": "Grocery shop",
            "shopcategoryid": order.shopcategoryid  // important !
          }

          navigation.popToTop('Order History');
          navigation.navigate('CartFromCategoriesHome', {shopcategoryinfo: shopcategoryinfo, fromView: 'reorder'});
        }

        const onFailure = error => {
          console.log(error);
          setLoading(false);
        }

        setLoading(true);
        console.log(orderRef);
        USERAPIKit.post('/user/cart/update/order/' + orderRef)
          .then(onSuccess)
          .catch(onFailure);
      }
  }

  useEffect(() => {
    navigationiOptions();

    const unsubscribe = navigation.addListener('focus', () => {

      const bootstrapAsync = async () => {
        let userToken = null;
        try {
          userToken = await AsyncStorage.getItem('userToken')
        } catch (e) {
          console.log(e);
        }
        if (userToken != null) {
          const onSuccess = ({ data }) => {
            console.log(data);
            setLoading(false);
            setOrder(data);
            setData(data.orderdetails);
          }
          const onFailure = error => {
            console.log(error);
            setLoading(false);
          }
          setLoading(true);
          SHOPAPIKit.get('/userorder/order/' + orderRef)
            .then(onSuccess)
            .catch(onFailure);
        }
      };
      bootstrapAsync();
    });
    return unsubscribe;

  }, [navigation, order]);

  const renderCircleView = (item) => {
    if (item.symbol == 'G') {
      return (
        <View style={styles.circleview_green} />
      )
    }
    else if (item.symbol == 'R') {
      return (
        <View style={styles.circleview_red} />
      )
    }
    else if (item.symbol == 'Y') {
      return (
        <View style={styles.circleview_yellow} />
      )
    }
    else if (item.symbol == 'B') {
      return (
        <View style={styles.circleview_brown} />
      )
    }
    else {
      return (
        <View style={styles.circleview_white} />
      )
    }
  }

  const renderItem = ({ item }) => {
    return (
      <View style={styles.item}>
        <Image
          style={styles.image}
          source={item.imageurl ? { uri: item.imageurl } : Logo}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ marginTop: 1, fontSize: 16 }}>{item.product}</Text>
          <View style={{ marginTop: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 15 }}>{item.brand}</Text>
            <Text style={{ flex: 1, fontSize: 15, marginLeft: 10 }}>{item.weight} {item.weightunit}</Text>
            {
              renderCircleView(item)
            }
          </View>
          <View style={{ flexDirection: 'row', marginTop: 4, justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 15 }}>₹ {item.unitprice}</Text>
            <View style={{ height: 20, marginRight: 10, marginBottom: 5, }}>
              <Text style={{ fontSize: 15 }}>{item.quantity} pc</Text>
            </View>
            {item.available ? (
                <MaterialCommunityIcons
                style = {{paddingRight: 8}}
                name="check-circle-outline"
                color="green"
                size={20}/>
              ) : (
                  <MaterialCommunityIcons
                  style = {{paddingRight: 8}}
                  name="checkbox-blank-circle-outline"
                  color="green"
                  size={20}/>
              )
            }
          </View>
        </View>
      </View>
    )
  }

  return (
    <>
      <View style={styles.container}>
        {loading ? 
        <Spinner
        visible={loading} size="large" style={styles.spinnerStyle} />
        :
        <View style={{flex: 3}}>
          <View style={{ flexDirection: 'column', padding: 8, justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 17, alignSelf: "center" }}>Overview for {order.orderref}</Text>
          </View>
          <FlatList
            data={orderdetails}
            keyExtractor={(item, index) => index.toString()}
            renderItem={orderdetails ? renderItem : null} />
          <View style={{ flexDirection: 'column', padding: 8, marginHorizontal: 8, justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 17, alignSelf: "center" }}>{order.shopname}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{ fontSize: 16 }}>Total Quantity: {order.orderquantity}</Text>
              <Text style={{ fontSize: 16 }}>Sub Total: {order.ordersubtotal}</Text>                    
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{ fontSize: 16 }}>Pickup Date: {moment.utc(order.orderpickuptime).format("YYYY-MM-DD")}</Text>
              <Text style={{ fontSize: 16 }}>Discount: {order.orderdiscount}</Text>                    
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{ fontSize: 16 }}>Pickup Time: {moment.utc(order.orderpickuptime).format("HH:mm:ss")}</Text>
              <Text style={{ fontSize: 16, marginLeft: 30}}>Total: {order.ordertotal}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{ fontSize: 16, alignSelf: "center" }}>Order Status: {order.status}</Text>
              <Text style={{ fontSize: 16, alignSelf: "center" }}>Points: {order.orderpoints}</Text>
            </View>
          </View>
        </View>
      }
      </View>
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
  item: {
    flex: 1,
    marginHorizontal: 10,
    marginVertical: 1,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderColor: "rgba(0, 0, 0,1)",
    borderWidth: 1,
    borderRadius: 4,
  },
  image: {
    width: 90,
    marginVertical: 0,
    marginRight: 5,
    resizeMode: 'stretch'
  },
  circleview_green: {
    marginRight: 10,
    width: 14,
    height: 14,
    borderRadius: 14 / 2,
    backgroundColor: '#32CD32'
  },
  circleview_red: {
    marginRight: 10,
    width: 14,
    height: 14,
    borderRadius: 14 / 2,
    backgroundColor: '#8B0000'
  },
  circleview_brown: {
    marginRight: 10,
    width: 14,
    height: 14,
    borderRadius: 14 / 2,
    backgroundColor: '#D2691E'
  },
  circleview_white: {
    marginRight: 10,
    width: 14,
    height: 14,
    borderRadius: 14 / 2,
    backgroundColor: '#FFFFFF'
  },
  circleview_yellow: {
    marginRight: 10,
    width: 14,
    height: 14,
    borderRadius: 14 / 2,
    backgroundColor: '#808000'
  },
  buttonContainer: {
    height: 35,
    justifyContent: 'center',
    marginLeft: 25,
    marginRight: 25,
    marginTop: 10,
    marginBottom: 10,
  },
  repeatIcon: {
    padding: 1,
    marginVertical: 12,
    marginHorizontal: 15,
    height: 24,
    width: 30,
    tintColor: 'rgba(255,255,2555,1)',
    resizeMode: 'stretch',
  },
});

export default OrderDetailScreen;