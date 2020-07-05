/**
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState } from 'react';

import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  Image,
  View,
  Button,
  Text,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StackActions } from '@react-navigation/native';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage'
import Toast from 'react-native-simple-toast';
import AwesomeAlert from 'react-native-awesome-alerts';
import Spinner from 'react-native-loading-spinner-overlay';
import { colors } from '../../res/style/colors'
import USERAPIKit, { SHOPAPIKit, setUserClientToken, setShopClientToken } from '../../utils/apikit';
import Logo from "../../res/assets/images/logo.png"
import { ConfirmDialog } from 'react-native-simple-dialogs';
import { TouchableOpacity } from 'react-native-gesture-handler';
import icoHome from '../../res/assets/images/home.png'

const OrderSummaryScreen = ({ navigation, route }) => {
  const [shopInfo, setShopInfo] = useState({
    shopname: route.params.shopname,
    shopcode: route.params.shopcode,
    discount: route.params.discount,
    shopid: route.params.shopid,
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(route.params.orderProducts);
  const [subtotal, setSubTotal] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [total, setTotal] = useState(0);
  const [orderdiscount, setDiscount] = useState(0);
  const [alert, setAlert] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [time, setTime] = useState(new Date());  // not utc
  const [showTime, setShowTime] = useState(false);
  const [orderpickupdate, setOrderPickupDate] = useState(moment(new Date()).format("YYYY-MM-DD"));  // u
  const [orderpickuptime, setOrderPickupTime] = useState(moment(new Date()).format("HH:mm:ss")); // not utc

  const navigationiOptions = () => {
    navigation.setOptions({ 
      title: 'Order Summary',
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerRight: () => (
        <>
          <View style={{flexDirection: 'row', alignSelf: "center", marginRight: 5}}>
            <TouchableOpacity
              onPress={() => navigation.push('Home')}>
               <Image
                  source={icoHome}
                  style={styles.icoHome}
                />
            </TouchableOpacity>
            {/* <TouchableOpacity
              onPress={() => onPressMapView()}>
               <Image
                  source={icoShopmap}
                  style={styles.icoShopmap}
                />
            </TouchableOpacity> */}
          </View>
        </>
      ) 
    })
  }

  const onPressMapView = () => {
    navigation.popToTop('Home');
    navigation.navigate('Map View');
  }
  
  const updateOrderTime = () => {
    let currentDate = new Date();
    currentDate.setHours(currentDate.getHours(), currentDate.getMinutes()+30, 0); // plus 30 min to current time
    setDate(currentDate);
    setTime(currentDate);
    setOrderPickupDate(moment(currentDate).format("YYYY-MM-DD"));
    setOrderPickupTime(moment(currentDate).format("HH:mm:00"));
  }

  useEffect(() => {
    navigationiOptions();

    const unsubscribe = navigation.addListener('focus', () => {
      updateOrderTime();
      getTotalPrice(data.products);
    });
    return unsubscribe;
  }, [navigation]);
  
  const getTotalPrice = (data) => {
    var tempTotal = 0;
    var tempQuantity = 0;
    var orderdiscount = 0;
    data.forEach(element => {
      if (element.quantity != 'undefined' && element.quantity > 0) {
        var itemTotal = element.unitprice * element.quantity;
        element.total = itemTotal;
        tempTotal += itemTotal;
        tempQuantity += element.quantity;
        orderdiscount += shopInfo.discount*element.unitprice*element.quantity*0.01;
      }
    });

    orderdiscount = Number(orderdiscount.toFixed(2));  // float round
    setData(data);
    setQuantity(tempQuantity);
    setSubTotal(tempTotal);
    setTotal(Number((tempTotal - orderdiscount).toFixed(2)));
    setDiscount(orderdiscount);
  }

  // Confirm Place Order
  const confirmPlaceOrder = () => {
    let date = moment().add(2, 'hours');
    let formatedDate = orderpickupdate + ' ' + orderpickuptime;
    
    var products = {
       shopcode: shopInfo.shopcode,
       ordersubtotal: subtotal, 
       ordertax: 0, 
       orderdiscount: shopInfo.discount, 
       ordertotal: total, 
       orderquantity: data.length, 
       orderdescription: '', 
       orderpriorityid: 1, 
       orderpickuptime: formatedDate, 
       products: [] }

    data.forEach(element => {
      if (element.quantity != 'undefined' && element.quantity > 0) {
        products.products.push({ "productid": element.productid, "quantity": element.quantity, "unitprice": element.unitprice })
      }
    });

    const onSuccess = ({ data }) => {
      setLoading(false);

      navigation.dispatch(StackActions.popToTop());
      navigation.navigate('Home');
      Toast.show('Order placed successfully.');
    }
    const onFailure = error => {
      setLoading(false);
      console.log(error)
      Toast.show('Failed to place.');
    }
    setLoading(true);
    console.log(products);
    SHOPAPIKit.post('/userorder/place', products)
      .then(onSuccess)
      .catch(onFailure);

    setAlert(false)
  }

  const orderProduct = () => {
    setAlert(true);
  }

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

  const onDateChange = (event, selectedDate) => {
    setShowDate(Platform.OS === 'ios');
    if (selectedDate === undefined) {
      console.log('-------- date controller canceled! ------');
      return;
    }
    const currentDate = selectedDate || date;
    setDate(currentDate);
    setOrderPickupDate(moment(currentDate).format("YYYY-MM-DD"));
  };
 
  const showDatepicker = () => {
    setShowDate(true);
  };

  const onTimeChange = (event, selectedDate) => {
    setShowTime(Platform.OS === 'ios');
    if (selectedDate === undefined) {
      console.log('------- time controller canceled! --------');
      return;
    }

    const currentDate = selectedDate || date;
    setTime(currentDate); // only for datepicker here
    console.log(currentDate);
    setOrderPickupTime(moment(currentDate).format("HH:mm:00"));
  };
 
  const showTimepicker = () => {
    setShowTime(true);
  };

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
            <Text style={{ fontSize: 15, marginRight:10 }}>₹ {item.total}</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <>
      <View style={styles.container}>
        <Spinner
          visible={loading} size="large" style={styles.spinnerStyle} />
        <View style={{marginBottom: 10}}/>
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={data ? renderItem : null} />
        <View style={{ flexDirection: 'column', padding: 8, justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 16, alignSelf: "center" }}>{shopInfo.shopname}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 1}}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{ fontSize: 16 }}>Ready Date:</Text>
                <TouchableOpacity onPress={showDatepicker}>
                  <Text  style={{ fontSize: 16, color: 'rgba(0, 128, 200, 1))', textDecorationLine: "underline" }} onPress={showDatepicker}> {orderpickupdate}</Text>
                </TouchableOpacity>
                <View>
                  {showDate && (
                    <DateTimePicker
                      testID="datePicker"
                      value={date}
                      mode='date'
                      is24Hour={true}
                      display="default"
                      minimumDate={new Date()}
                      onChange={(event, date) => onDateChange(event, date)}
                    />
                  )}
                </View>
                </View>
              <Text style={{ fontSize: 16 }}>Sub Total: {subtotal}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 1}}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{ fontSize: 16 }}>Ready Time:</Text>
                <TouchableOpacity onPress={showTimepicker}>
                  <Text style={{ fontSize: 16, color: 'rgba(0, 128, 200, 1))', textDecorationLine: "underline", paddingHorizontal: 10}}> {orderpickuptime}</Text>
                </TouchableOpacity>
                <View>
                  {showTime && (
                    <DateTimePicker
                      testID="datePicker"
                      value={time}
                      mode='time'
                      is24Hour={true}
                      display="default"
                      onChange={(event, date) => onTimeChange(event, date)}
                    />
                  )}
                </View>
              </View>
              <Text style={{ fontSize: 16 }}>Discount: {orderdiscount}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 16 }}>Total Quantity: {quantity}</Text>
            <Text style={{ fontSize: 16 }}>Total Price: {total}</Text>
          </View>
        </View>
        {
          data.length != 0 ?
            <View style={styles.buttonContainer}>
              <Button title='Place Order' onPress={orderProduct} />
            </View> : null
        }
        <View>
            <ConfirmDialog
                dialogStyle={{ backgroundColor: "rgba(255,255,255,1)", borderRadius: 16, width: 260, height: 180, alignSelf: "center" }}
                titleStyle={{ textAlign: "center", marginTop: 30, fontSize: 16 }}
                title={"Place order to " + shopInfo.shopname + "?"}
                visible={alert}
            >
            <View style={{ flexDirection: 'row', marginTop: 20, marginHorizontal: 20, justifyContent: "space-between" }}>
                <View style={{width: 70}}>
                  <Button
                        title="Cancel"
                        color = "rgba(164, 164, 164,1)"
                        titleStyle={{ fontSize: 14 }}
                        onPress={() => setAlert(false)}
                    />
                </View>
                <View style={{width: 70}}>
                  <Button
                      title="Yes"
                      titleStyle={{ fontSize: 14 }}
                      onPress={() => confirmPlaceOrder()}
                  />
                </View>
            </View>
            </ConfirmDialog>
        </View>
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
    borderRadius: 4
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
  icoHome: {
    padding: 1,
    marginVertical: 10,
    marginHorizontal: 12,
    height: 23,
    width: 23,
    tintColor: '#fff',
    resizeMode: 'stretch',
  },
});

export default OrderSummaryScreen;