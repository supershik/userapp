/**
 * @format
 * @flow strict-local
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  Button,
  View,
  Image,
  Text,
  TouchableOpacity,
} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import Toast from 'react-native-simple-toast';
import NumericInput from 'react-native-numeric-input'
import AwesomeAlert from 'react-native-awesome-alerts';
import { Searchbar } from 'react-native-paper';
import { colors } from '../../res/style/colors'
import USERAPIKit, { SHOPAPIKit, setShopClientToken } from '../../utils/apikit';
import Logo from "../../res/assets/images/logo.png"
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import addcart from '../../res/assets/images/cart.png'

const SearchScreenFromMap = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [query, setQuery] = useState('');
  const [alert, setAlert] = useState(false);
  const [shopInfo] = useState(route.params.shopInfo);
  const [fromView] = useState(route.params.fromView);
  const [ismanaged] = useState(route.params.ismanaged);
  const [minordervalue] = useState(route.params.minordervalue);
  

  const navigationiOptions = () => {
    navigation.setOptions({ 
      title: 'Search Product',
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
            onPress={() => navigation.navigate('Cart Screen From Map', {shopInfo: shopInfo, ismanaged: ismanaged, minordervalue: minordervalue, fromView: fromView})}>
            <Image
              source={addcart}
              style={styles.addCartIcon}
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
        setQuery('');
        onPressLatestProducts();
      }
      bootstrapAsync();
    });
    
    return unsubscribe;
  }, [navigation]);

  const handleSearch = (query) => {
    setQuery(query);
    if (query.length >= 3) {
      const onSuccess = ({ data }) => {
        setData(data.products);
      }
      const onFailure = error => {
        setData([]);

      }
      
      SHOPAPIKit.get('/product/search/products/shopcategory/' + shopInfo.shopcategoryid + '/' + query)
        .then(onSuccess)
        .catch(onFailure);
    }
    else if (query.length == 0) {
      onPressLatestProducts();
    }
    else {
      setData([]);
    }
  }

  const confirmProduct = () => {
    var products = { products: []}
    data.forEach(element => {
      if(element.quantity != 'undefined' && element.quantity > 0 && element.available != undefined && element.available == true) 
      {
        products.products.push({"productid": element.productid, "quantity": element.quantity})
      }
    });

    if(products.products.length < 1)
    {
      Toast.show('Please select product first and add to cart', Toast.SHORT);
      return;
    }

    const onSuccess = ({ data }) => {
      setLoading(false);
      Toast.show('Successfully added');
    }
    const onFailure = error => {
      setLoading(false);
      Toast.show('Failed to add.');
    }
    setLoading(true);
    USERAPIKit.post('/user/cart/update', products)
      .then(onSuccess)
      .catch(onFailure);
    setAlert(false)
  }
  const updateProduct = () => {

    confirmProduct();

    return;

    var count = 0;
    data.forEach(element => {
      if(element.quantity != 'undefined' && element.quantity > 0) 
      {
        count++;
      }
    });
    if(count == 0){
        Toast.show('Please select product first', Toast.SHORT);
    }
    else{
      setAlert(true);
    }
  }
  const renderCircleView = (item) => {
    if(item.symbol == 'G'){
      return(
        <View style={styles.circleview_green} />
      )  
    }
    else if(item.symbol == 'R'){
      return(
        <View style={styles.circleview_red} />
      )  
    }
    else if(item.symbol == 'Y'){
      return(
        <View style={styles.circleview_yellow} />
      )  
    }
    else if(item.symbol == 'B'){
      return(
        <View style={styles.circleview_brown} />
      )  
    }
    else{
      return(
        <View style={styles.circleview_white} />
      )
    }
  }

  const onPressLatestProducts = () => {
    const onSuccess = ({ data }) => {    
      setLoading(false);        
      setProductData(data.products);
    }
    const onFailure = error => {
        setLoading(false);
        setData([]);
        if(error.toString().includes('409')) {
          console.log( "message: No Latest products");
        }
        else if(error.toString().includes('401')) {
          console.log( "error: Authentication failed");
          //reSignIn();
          //Toast.show("error: Authentication failed");
        }
        else
          console.log(error);
    }

    setLoading(true);
    setData([]);
    // SHOPAPIKit.get('/product/products/latest')
    SHOPAPIKit.get('/product/all/products/shop/' + shopInfo.shopid)
      .then(onSuccess)
      .catch(onFailure);
  }

  const setProductData = (data) => {
    let products = [];
    data.forEach(item => {
        let quantity = 0;
        let available = false;
        if(item.quantity != undefined)
          quantity = item.quantity;

        if(item.available != undefined)
          available = item.available;

        products.push({
          "productid": item.productid,
          "product": item.product,
          "description": item.description,
          "brand": item.brand,
          "unitprice": item.unitprice,
          "weight": item.weight,
          "weightunit": item.weightunit,
          "category": item.category,
          "symbol": item.symbol,
          "imageurl": item.imageurl,
          "quantity": quantity,
          "available": available,
      });
    });
    setData(products);
  }

  const onAvailablePressed = (item, index) => {
    var tempdata = [];
    const newitem = {
      ...item,
      available: !item.available
    }

    data.forEach(element => {
      tempdata.push(element);
    })

    tempdata[index] = newitem;
    setProductData(tempdata);
  }

  const setAvailable = (item, index, selected) => {
    var tempdata = [];
    const newitem = {
      ...item,
      available: selected
    }

    data.forEach(element => {
      tempdata.push(element);
    })

    tempdata[index] = newitem;

    setProductData(tempdata);
  }

  const onChangeQuantity = (value, item, index)=> {
    console.log(value);
    var tempdata = [];
    var new_quantity = value;
    
    const newitem = {
      ...item,
      quantity: new_quantity
    }

    data.forEach(element => {
      tempdata.push(element);
    })

    tempdata[index] = newitem;

    setProductData(tempdata);

    if( new_quantity> 0 )
      setAvailable(newitem, index, true); // don't use item, instead of this do use newitem, because quantity not changed yet in item .
    else
      setAvailable(newitem, index, false);
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
          <View style={{ marginTop: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ flex:1, fontSize: 15 }}>{item.brand}</Text>
            <Text style={{ flex:1, fontSize: 15, marginLeft: 10 }}>{item.weight} {item.weightunit}</Text>            
            {
              renderCircleView(item)
            }            
          </View>
          <View style={{ flexDirection: 'row', marginTop: 1, justifyContent: 'space-between' }}>
            <Text style={{ marginTop: 1, fontSize: 15 }}>₹ {item.unitprice}</Text>
            <View style={{height:20, marginRight: 10, marginBottom: 5}}>
              <NumericInput
                minValue={0}
                maxValue={100000}
                valueType={"integer"}
                value={item.quantity}
                totalHeight={22}
                rounded={true}
                inputStyle={{fontSize: 14}}
                leftButtonBackgroundColor={colors.primary}
                rightButtonBackgroundColor={colors.primary}
                onChange={value=> onChangeQuantity(value, item, index)}
                onLimitReached={()=>console.log('LIMIT')}
                />
            </View>
            {/* <TouchableOpacity onPress={() => onAvailablePressed(item, index)}> */}
            {item.available ? (
                <MaterialCommunityIcons
                style = {{paddingRight: 5}}
                name="check-circle-outline"
                color="green"
                size={22}/>
              ) : (
                  <MaterialCommunityIcons
                  style = {{paddingRight: 5}}
                  name="cart-plus"
                  color="green"
                  size={22}/>
              )
            }
          {/* </TouchableOpacity> */}
          </View>
        </View>
      </View>
    )
  }
  return (
    <>
      <SafeAreaView style={styles.container}>
        <Searchbar
          placeholder="Product Name"
          onChangeText={(query) => handleSearch(query)}
          value={query}
          style={styles.searchbar}
        />
        <View
          style={styles.listContainer}>
          <FlatList
              removeClippedSubviews={false}
              data={data}
              keyExtractor={(item, index) => index.toString()}
              renderItem={data ? renderItem : null} />
              {
                data.length != 0 ? 
                <View style={styles.buttonContainer}>
                  <Button title='Add to Cart' uppercase={false} onPress={updateProduct}/>
                </View> : null  
              }
        </View>
        <Spinner
          visible={loading} size="large" style={styles.spinnerStyle} />
        <AwesomeAlert
          show={alert}
          showProgress={false}
          title="Alert"
          message="Are you sure?"
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={false}
          showCancelButton={true}
          showConfirmButton={true}
          cancelText="No"
          confirmText="Yes"
          confirmButtonColor="#DD6B55"
          onCancelPressed={() => {
            setAlert(false);
          }}
          onConfirmPressed={() => {
            confirmProduct();
          }}
        />
      </SafeAreaView>
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
  addCartIcon: {
    padding: 1,
    marginVertical: 10,
    marginHorizontal: 15,
    height: 24,
    width: 30,
    tintColor: '#fff',
    resizeMode: 'stretch',
  },
});

export default SearchScreenFromMap;