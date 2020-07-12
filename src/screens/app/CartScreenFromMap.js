/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
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
  TouchableOpacity
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-community/async-storage'
import Toast from 'react-native-simple-toast';
import AwesomeAlert from 'react-native-awesome-alerts';
import Spinner from 'react-native-loading-spinner-overlay';
import { colors } from '../../res/style/colors'
import USERAPIKit, { SHOPAPIKit, setUserClientToken } from '../../utils/apikit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Logo from "../../res/assets/images/logo.png"
import cleancart from '../../res/assets/images/clean_cart.png'

const CartScreenFromMap = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [products, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [deleteItem, setDeleteItem] = useState([]);
  const [alertOneItem, setAlertOneItem] = useState(false);
  const [alertAllItem, setAlertAllItem] = useState(false);
  const [shopInfo] = useState(route.params?.shopInfo);
  const [fromView] = useState(route.params?.fromView);
  const [ismanaged] = useState(route.params.ismanaged);

  const navigationiOptions = () => {
    navigation.setOptions({ 
        title: 'Cart',
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
                onPress={() => onPressAllDelete()}
              >
              <Image
                source={cleancart}
                style={styles.cleanIcon}
              />
            </TouchableOpacity>
          </View>
        )
    })
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
            setLoading(false);
            // console.log(data);
            getTotalPrice(data.products);
          }
          const onFailure = error => {
            setLoading(false);
            setData([]);
            //console.log(error);
          }
          setLoading(true);
          USERAPIKit.get('/user/cart/detail/shop/' + shopInfo.shopid)
            .then(onSuccess)
            .catch(onFailure);
        }
        else {
          setData([]);
        }
      };
      bootstrapAsync();
      console.log('Focused effect')
  
    });
    return unsubscribe;
  }, [navigation]);

  const cleanAllProducts = () => {
    setAlertAllItem(false);

    if( products.length > 0 ) {
      const onSuccess = ({ data }) => {
        setLoading(false);         
        // console.log(data);
        //Toast.show(data.message);
        Toast.show("All carts cleaned successfully");
        setData([]);
      }
      const onFailure = error => {
          console.log(error);
          setLoading(false);
          if(error.toString().includes('409')) {
            console.log( "message: Fail to delete.");
            Toast.show('Fail to delete.');
          }
          else if(error.toString().includes('401')) {
            console.log( "error: Authentication failed");
            //reSignIn();
            //Toast.show("error: Authentication failed");
          }
          else
            console.log(error);
      }

      console.log('clean all carts: ');
      setLoading(true);
      USERAPIKit.delete('/user/cart/remove')
          .then(onSuccess)
          .catch(onFailure);
      }
  }

  const getTotalPrice = (products) => {
    var tempTotal = 0;
    products.forEach(element => {
      if (element.quantity != 'undefined' && element.quantity > 0) {
        var itemTotal = element.unitprice * element.quantity;
        element.total = itemTotal;
        tempTotal += itemTotal;
      }
    });
    setData(products);
    setTotal(tempTotal);
  }

  const orderProduct = () => {
    if( fromView == 'MapView' )
      navigation.navigate('Order Summary From Map', {orderProducts: products, shopInfo: shopInfo, ismanaged: ismanaged, fromView: fromView});
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

  const confirmOneDelete = () => {
    setAlertOneItem(false);
    if(deleteItem.length < 1)
      return;

    const item = deleteItem.item;
    const index = deleteItem.index;

    console.log(index);
    console.log(item);

    if( item.productid != null ) {
      const onSuccess = ({ data }) => {
        setLoading(false);         
        // console.log(data);
        //Toast.show(data.message);
        Toast.show("One cart removed successfully");
        // delete from data list for displaying
        var tempdata = [];
        products.forEach(element => {
          if(element.productid != item.productid)
            tempdata.push(element);
        })

        getTotalPrice(tempdata);
      }
      const onFailure = error => {
          console.log(error);
          setLoading(false);
          if(error.toString().includes('409')) {
            console.log( "message: Failed");
            Toast.show('Fail to delete.');
          }
          else if(error.toString().includes('401')) {
            console.log( "error: Authentication failed");
            //reSignIn();
            //Toast.show("error: Authentication failed");
          }
          else
            console.log(error);
      }

      console.log(item.productid);

      setLoading(true);
      USERAPIKit.delete('/user/cart/remove/' + item.productid)
          .then(onSuccess)
          .catch(onFailure);
      }
  }

  const onDeletePressed = (item, index) => {
    let data = {
      item: item,
      index: index
    }

    setDeleteItem(data);
    setAlertOneItem(true);
  }

  const onPressAllDelete = () => {
    
    setAlertAllItem(true);
  }

  const onMinusQuantityPressed = (item, index) => {
    var tempdata = [];
    var new_quantity = item.quantity;
    new_quantity--;
    if(new_quantity < 1 )  new_quantity = 1;

    const newitem = {
      ...item,
      quantity: new_quantity
    }

    products.forEach(element => {
      tempdata.push(element);
    })
    tempdata[index] = newitem;
    getTotalPrice(tempdata);
  }

  const onPlusQuantityPressed = (item, index) => {
    var tempdata = [];
    var maxQuantity = 0;
    var maxQuantity = 10000000;
    var new_quantity = item.quantity;
    new_quantity++;
    if(new_quantity > maxQuantity )  new_quantity = maxQuantity;

    const newitem = {
      ...item,
      quantity: new_quantity
    }

    products.forEach(element => {
      tempdata.push(element);
    })

    tempdata[index] = newitem;
    getTotalPrice(tempdata);
  }

  const onOneUpdatePressed = (item, index) => {
    if( item.productid != null ) {
      const onSuccess = ({ data }) => {                
        // console.log(data);
        Toast.show(data.message);
      }
      const onFailure = error => {
        if(error.toString().includes('409')) {
          console.log( "message: Failed");
          Toast.show('Fail to update.');
        }
        else if(error.toString().includes('401')) {
          console.log( "error: Authentication failed");
          // reSignIn();
          //Toast.show("error: Authentication failed");
        }
        else
          console.log(error);
      }
  
      const payload = {
          "productid": item.productid,
          "quantity": item.quantity,
      }

      let updateProducts = {"products": []};
      updateProducts.products.push(payload);

      USERAPIKit.post('/user/cart/update', updateProducts)
      .then(onSuccess)
      .catch(onFailure);
    }
  }
  
  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.item}>
        <Image
          style={styles.image}
          source={item.imageurl ? { uri: item.imageurl } : Logo}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ marginTop: 1, fontSize: 16 }}>{item.product}</Text>
          <View style={{ marginTop: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 15 }}>{item.brand}</Text>
            <Text style={{ flex: 1, fontSize: 15, marginLeft: 10 }}>{item.weight} {item.weightunit}</Text>
            {
              renderCircleView(item)
            }
          </View>
          <View style={{ flexDirection: 'row', marginTop: 1, justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 15 }}>PRICE: ₹ {item.unitprice}</Text>
            <View style={{ flexDirection: 'row', marginTop: 0}}>
                <TouchableOpacity onPress={() => onMinusQuantityPressed(item, index)} >
                    <MaterialCommunityIcons
                        style = {{paddingRight: 5}}
                        name="minus-box"
                        color="rgba(32, 128, 164,1)"
                        size={22}
                    />
                </TouchableOpacity>
                <View style={{ height: 20, marginRight: 10, marginBottom: 5, }}>
                  <Text style={{ fontSize: 15 }}>{item.quantity}</Text>
                </View>
                <TouchableOpacity onPress={() => onPlusQuantityPressed(item, index)}>
                    <MaterialCommunityIcons
                        style = {{paddingRight: 5}}
                        name="plus-box"
                        color="rgba(32, 128, 164,1)"
                        size={22}
                    />
                </TouchableOpacity>
              </View>
            <Text style={{ fontSize: 15 }}>₹ {item.total}</Text>
            <TouchableOpacity onPress={() => onDeletePressed(item, index)}>
                  <MaterialCommunityIcons
                        style = {{paddingRight: 6}}
                        name="delete-circle-outline"
                        color="red"
                        size={22}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onOneUpdatePressed(item, index)}>
                    <MaterialCommunityIcons
                          style = {{paddingRight: 5}}
                          name="backup-restore"
                          color="green"
                          size={22}/>
              </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  return (
    <>
      <View style={styles.container}>
      { loading ? 
          <Spinner
            visible={loading} size="large" style={styles.spinnerStyle} />
          : 
          <View style={styles.container}>
            { products.length == 0 ? 
                <View  style={styles.emptyData}> 
                  <Text style={{fontSize: 20, marginTop: 0, color: "rgba(128, 128, 128, 1)"}}>
                    Search product to add into cart
                  </Text>
                </View>
                : <>
                    <View style={{marginTop: 10}}/>
                    <View style={{flex: 10}}>
                      <FlatList
                        data={products}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={products ? renderItem : null} />
                    </View>
                    <View style={{flex: 1}}>
                      {
                        products.length != 0 ?
                          <View style={styles.buttonContainer}>
                            <Button title='Proceed' onPress={orderProduct} />
                          </View> : null
                      }
                    </View>
                  </>
              }
            </View>
         }
         <AwesomeAlert
            show={alertOneItem}
            showProgress={false}
            title="Remove product from cart?"
            titleStyle={{fontSize: 16}}
            message=""
            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            showConfirmButton={true}
            cancelText="No"
            confirmText="Yes"
            cancelButtonStyle={{width: 60, marginRight: 20, alignItems: "center"}}
            confirmButtonStyle={{width: 60, marginLeft: 20, alignItems: "center"}}
            confirmButtonColor="#DD6B55"
            onCancelPressed={() => {
              setAlertOneItem(false);
            }}
            onConfirmPressed={() => {
              confirmOneDelete();
            }}
        />
        <AwesomeAlert
            show={alertAllItem}
            showProgress={false}
            title="Remove all products from cart?"
            titleStyle={{fontSize: 16, marginBottom: 0, marginHorizontal: -10}}
            message=""
            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            showConfirmButton={true}
            cancelText="No"
            confirmText="Yes"
            cancelButtonStyle={{width: 60, marginRight: 20, alignItems: "center"}}
            confirmButtonStyle={{width: 60, marginLeft: 20, alignItems: "center"}}
            confirmButtonColor="#DD6B55"
            onCancelPressed={() => {
              setAlertAllItem(false);
            }}
            onConfirmPressed={() => {
              cleanAllProducts();
            }}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column"
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
  emptyData: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cleanIcon: {
    padding: 10,
    marginVertical: 12,
    marginHorizontal: 15,
    height: 24,
    width: 28,
    tintColor: '#fff',
    resizeMode: 'stretch',
  },
});

export default CartScreenFromMap;