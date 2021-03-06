/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState, useContext } from 'react';
import MapView, { Marker } from 'react-native-maps'
import {
  SafeAreaView,
  StyleSheet,
  Image,
  View,
  Text,
  Button,
  TouchableOpacity,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-community/async-storage'
import Spinner from 'react-native-loading-spinner-overlay';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import USERAPIKit, { SHOPAPIKit, setUserClientToken } from '../../utils/apikit';
import { colors } from '../../res/style/colors'
import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import SwitchSelector from 'react-native-switch-selector';
import { ConfirmDialog } from 'react-native-simple-dialogs';
import icoHome from '../../res/assets/images/home.png'
import icoShopmap from '../../res/assets/images/shopmap.png'
import ic_homedeliveryok from '../../res/assets/images/ic_homedeliveryok.png'
import ic_homedeliveryno from '../../res/assets/images/ic_homedeliveryno.png'
import ic_exchangeok from '../../res/assets/images/ic_exchangeok.png'
import ic_exchangeno from '../../res/assets/images/ic_exchangeno.png'
import ic_discount from '../../res/assets/images/ic_discount.png'

const ShopMapScreenFromCart = ({ navigation, route }) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [alertPassToSummary, setAlertPassToSummary] = useState(false);
  const [alertNoProduct, setAlertNoProduct] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shopdata, setShopData] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [orderProductsbyShopid, setOrderProductsbyShopid] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [msgProductExchange, setMsgProductExchange] = useState ('');
  const [msgHomeDelivery, setMsgHomeDelivery] = useState ('');
  const [isAlertOnlineShop, setAlertOnlineShop] = useState(false);
  const [isDelivery, setDelivery] = useState(false);
  const [isExchange, setExchange] = useState(false);
  const [msgMinOrderValue, setMsgMinOrderValue] = useState ('');
  const [isMinOrderValue, setMinOrderValue] = useState(false);

  const [region, setRegion] = useState({
    latitude: 15.480808256,
    longitude: 73.82310486,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  })
  const [options] = useState([
    { label: 'Discount', value: '0' },
    { label: 'Distance', value: '1' },
    { label: 'Wholesaler', value: '2' }
  ]);

  const [marginBottom, setMarginBottom] = useState(0);
  const [payload, setPayload] = useState({ latitude: 15.475840, longitude: 73.819714, area: 0 });

  const navigationiOptions = () => {
    navigation.setOptions({ 
      title: 'Select Shop',
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

  useEffect(() => {
    navigationiOptions();

    const unsubscribe = navigation.addListener('focus', () => {

      const bootstrapAsync = async (coords) => {
        let userToken = null;
        try {
          userToken = await AsyncStorage.getItem('userToken')
        } catch (e) {
          console.log(e);
        }
        if(userToken != null) {
          onSwitchChange(1, coords);
        }
      };
      Geolocation.getCurrentPosition(info => 
        {
          if(info.coords != undefined) {
            setRegion({latitude: info.coords.latitude, longitude: info.coords.longitude});
            setPayload({latitude:info.coords.latitude, longitude: info.coords.longitude});
            bootstrapAsync(info.coords);
          }
        },
        (error) => {
          console.log(error); 
          bootstrapAsync();
        },
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 });
    });
    return unsubscribe;

  }, [navigation]);

  const updateShopList = (shopData) => {
    let newMarks = [];
    shopData.forEach(element => {
      if (element.shopname != 'undefined') {
        newMarks.push({ latitude: element.latitude, longitude: element.longitude, title: element.shopname, distance: element.distance, discount: element.discount, rating: element.rating, isonline: element.isonline })
      }
    });
    setMarkers(newMarks);
  }

  const onPressMarker = (index) => {
    if( shopdata[index].isonline == 0 ) {
      setAlertOnlineShop(true);
      return;
    }

    setSelectedIndex(index);
    let message = "Product price may vary as per shop";
    if( shopdata[index].shopcategoryid == 8 )
      message = "Product price may vary as per shop.\nAge proof will be asked at time of pickup (ONlY 18+ IS ALLOWED)";

    console.log(shopdata[index]);
    setMessageContent(message);

    getProductbyShopid(index);
  }
  
  const openOrderSummary = () => {
    if( selectedIndex < 0 )
      return;
      
    setAlertPassToSummary(false);
    navigation.navigate('Order Summary From Cart', {orderProducts: orderProductsbyShopid, shopname: shopdata[selectedIndex].shopname, shopcode: shopdata[selectedIndex].shopcode, discount: shopdata[selectedIndex].discount, shopid: shopdata[selectedIndex].shopid});
  }
  
  const getProductbyShopid = async(index) => {
    let shopInfo = shopdata[index];
    console.log(shopInfo);
    let userToken = null;
        try {
          userToken = await AsyncStorage.getItem('userToken')
        } catch (e) {
          console.log(e);
        }
        if (userToken != null) {
          const onSuccess = ({ data }) => {
            setLoading(false);
            setOrderProductsbyShopid(data);
            
            console.log('------------------ shop id --------------');
            console.log(data);
            if( data.productexchange == 1 ) {
              setExchange(true);
              setMsgProductExchange("Product exchange is allowed as per shop policy");
            }
            else {
              setExchange(false);
              setMsgProductExchange("Product exchange is not allowed as per shop policy");
            }

            if( data.homedelivery == 1 ) {
              setDelivery(true);
              setMsgHomeDelivery("Home delivery is available");
            }
            else {
              setDelivery(false);
              setMsgHomeDelivery("Home delivery is not available, Only shop pick up");
            }

            if( shopInfo.discount > 0 && shopInfo.minordervalue > 0 ) {
              setMinOrderValue(true);
              setMsgMinOrderValue(Number(shopInfo.discount.toFixed(2)) + "% Discount available for order above ₹" + Number(shopInfo.minordervalue.toFixed(2)));
            }
            else if( shopInfo.discount > 0 && shopInfo.minordervalue == 0 ) {
              setMinOrderValue(true);
              setMsgMinOrderValue(Number(shopInfo.discount.toFixed(2)) + "% Discount available");
            }
            else {
              setMinOrderValue(true);
              setMsgMinOrderValue("No Discount available");
            }

            let isProduct = true;
            if( data.products.length < 1 )
              isProduct = false;

            if( isProduct == false )
              setAlertNoProduct(true);
            else
              setAlertPassToSummary(true);
          }

          const onFailure = error => {
            setLoading(false);
            setAlertNoProduct(true);
            setOrderProductsbyShopid([]);
          }
          
          setLoading(true);
          USERAPIKit.get('/user/cart/detail/shop/' + shopdata[index].shopid)
            .then(onSuccess)
            .catch(onFailure);
        }
        else {
          setOrderProductsbyShopid([]);
        }
  }

  const onMapReady = () => {
    console.log("map ready");
    setMarginBottom(1);
  }
  const onRegionChange = (region) => {
    setRegion(region);
  }
  const onSwitchChange = (value, coords) => {
    console.log(value);
    let myCoords = payload;

    if(coords != undefined ) {
      myCoords = {
        latitude:coords.latitude,
        longitude: coords.longitude,
        // shopcategoryid: shopcategoryinfo.shopcategoryid  // optional
      };
    }

    const onSuccess = ({ data }) => {
      setShopData(data.shops)
      updateShopList(data.shops);
      setLoading(false);

      if(data.shops.length < 1) {
        let message = 'No Nearest shop' // value = 1;
        if(value == 0) 
          message = 'No Discounted shop near by';
        else if(value == 2) 
          message = 'No wholesaler near by';

        Toast.show(message);
      }
    }

    const onFailure = error => {
      console.log(error);
      setLoading(false);
      let message = 'No Nearest shop' // value = 1;
      if(value == 0) 
        message = 'No Discounted shop near by';
      else if(value == 2) 
        message = 'No wholesaler near by';

      setShopData([]);
      Toast.show(message);
    }

    setLoading(true);
    var requestUrl = '/shopoperation/discount';
    if(value == 0){
      requestUrl = '/shopoperation/discount';
    } 
    else if(value == 1){
      requestUrl = '/shopoperation/near';
    }
    else{
      requestUrl = '/shopoperation/wholesaler';
    }
   SHOPAPIKit.post(requestUrl, myCoords)
   .then(onSuccess)
   .catch(onFailure);

  }
  return (
    <>
      <View style={styles.container}>
        <Spinner
          visible={loading} size="large" style={styles.spinnerStyle} />
        <MapView
          style={{ flex: 1, marginBottom: marginBottom }}
          onMapReady={onMapReady}
          initialRegion={{
            latitude :region.latitude != null ? region.latitude : 15.480808256,
            longitude: region.longitude != null ? region.longitude : 73.82310486,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03
          }}
          region={{
            latitude :region.latitude != null ? region.latitude : 15.480808256,
            longitude: region.longitude != null ? region.longitude : 73.82310486,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03
          }}
          showsMyLocationButton={true}
          showsUserLocation={true}>
          {
            markers.map((marker, index) => (
              <Marker
                key={index}
                coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}                
                onPress={() => onPressMarker(index)}>
                { marker.isonline == 1 ? 
                  <View>
                    <View
                      style={styles.markerOnline}>
                      <Text style={styles.titleText}>
                        {marker.title}
                      </Text>
                      <Text style={styles.shopMarkInfo}>
                        {marker.distance}Km  {marker.discount}%  {marker.rating}
                      </Text>
                    </View>              
                    <View
                      style={{alignSelf:'center'}}>
                      <MaterialCommunityIcons
                          name="map-marker"
                          color="red"
                          size={40}
                        />
                    </View>
                  </View>
                  : 
                  <View >
                    <View
                      style={styles.markerOffline}>
                      <Text style={styles.titleTextGray}>
                        {marker.title}
                      </Text>
                      <Text style={styles.shopMarkInfoOffile}>
                        {marker.distance}Km  {marker.discount}%  {marker.rating}
                      </Text>
                    </View>              
                    <View
                      style={{alignSelf:'center'}}>
                      <MaterialCommunityIcons
                          name="map-marker"
                          color="rgba(160,160,160,1)"
                          size={40}
                        />
                    </View>
                  </View>
                }
                <MapView.Callout
                  tooltip={true}
                  />
              </Marker>
            )
            )}
        </MapView>
        <View>
            <ConfirmDialog
                dialogStyle={{ backgroundColor: "rgba(255,255,255,1)", borderRadius: 16, width: 260, alignSelf: "center" }}
                titleStyle={{ textAlign: "center", marginTop: 30, fontSize: 16 }}
                title={messageContent}
                visible={alertPassToSummary}
                onTouchOutside={() => setAlertPassToSummary(false)}
            >
              <View style = {{marginTop: 10, marginBottom: -40, marginHorizontal: 0 }}>
                <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                  <View>
                    {isExchange == true ?
                      <Image
                        style={styles.icoexchange}
                        source={ic_exchangeok}
                      />
                    :
                      <Image
                        style={styles.icoexchange}
                        source={ic_exchangeno}
                      />
                    }
                  </View>
                  <Text style={{flex: 10, textAlign: "center"}}>
                    {msgProductExchange}
                  </Text>
                </View>
                <View style={{flexDirection: "row", marginTop: 10}}>
                  <View>
                    {isDelivery == true ?
                      <Image
                        style={styles.icodelivery}
                        source={ic_homedeliveryok}
                      />  
                      :
                      <Image
                        style={styles.icodelivery}
                        source={ic_homedeliveryno}
                      />  
                    }
                  </View>
                  <Text style={{flex: 10, marginTop: 10, textAlign: "center"}}>
                    {msgHomeDelivery}
                  </Text>
                </View>
                {isMinOrderValue == true ?
                  <View style={{flexDirection: "row", marginTop: 10}}>
                    <Image
                      style={styles.icdiscount}
                      source={ic_discount}
                    />
                    <Text style={{flex: 10, marginTop: 10, textAlign: "center"}}>
                      {msgMinOrderValue}
                    </Text>
                  </View>
                  :
                  null
                }

                <View style={{marginTop: 20, marginHorizontal: 30}}>
                    <Button
                      buttonStyle={{backgroundColor: "rgba(130, 130, 128,1)" }}
                      title="Ok"
                      titleStyle={{ fontSize: 14 }}
                      onPress={() => openOrderSummary()}
                  />
                </View>
              </View>
            </ConfirmDialog>

            <ConfirmDialog
                dialogStyle={{ backgroundColor: "rgba(255,255,255,1)", borderRadius: 16, width: 260, alignSelf: "center" }}
                titleStyle={{ textAlign: "center", marginTop: 30, fontSize: 16 }}
                title="No product for this shop in cart."
                visible={alertNoProduct}
                onTouchOutside={() => setAlertNoProduct(false)}
            >
              <View style = {{marginTop: 0, marginBottom: -40, marginHorizontal: 10 }}>
                <View style={{marginTop: 0, marginHorizontal: 30}}>
                    <Button
                      buttonStyle={{backgroundColor: "rgba(130, 130, 128,1)" }}
                      title="Ok"
                      titleStyle={{ fontSize: 14 }}
                      onPress={() => setAlertNoProduct(false)}
                  />
                </View>
              </View>
            </ConfirmDialog>
            <ConfirmDialog
                  dialogStyle={{ backgroundColor: "rgba(255,255,255,1)", borderRadius: 16, width: 260, alignSelf: "center" }}
                  titleStyle={{ textAlign: "center", marginTop: 30, fontSize: 16 }}
                  title="Shop is not accepting orders"
                  visible={isAlertOnlineShop}
                  onTouchOutside={() => setAlertOnlineShop(false)}
              >
                <View style = {{marginTop: 0, marginBottom: -40, marginHorizontal: 10 }}>
                  <View style={{marginTop: 10, marginHorizontal: 30}}>
                      <Button
                        buttonStyle={{backgroundColor: "rgba(130, 130, 128,1)" }}
                        title="Ok"
                        titleStyle={{ fontSize: 14 }}
                        onPress={() => setAlertOnlineShop(false)}
                    />
                  </View>
                </View>
            </ConfirmDialog>
        </View>
        <SwitchSelector
          textColor={'#2396f3'} //'#7a44cf'
          selectedColor={Colors.white}
          buttonColor={'#2396f3'}
          borderColor={'#146fb9'}
          backgroundColor={'rgba(255,255,255,1)'}
          style={{backgroundColor: '#f2f2f2', opacity: 1}}
          hasPadding
          options={options}
          initial={1}
          onPress={value => onSwitchChange(value)}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerOnline: {
    backgroundColor: "rgba(255,0,0,1)",
    borderRadius: 4,
    padding: 1,
    justifyContent: "center"
  },
  markerOffline: {
    backgroundColor: "lightgray",
    borderRadius: 4,
    padding: 1,
    justifyContent: "center"
  },
  titleText: {
    paddingHorizontal: 10,
    color: "rgba(255,255,255,1)",
    textAlign: "center",
    fontSize: 12,
    flex: 1,
  },
  titleTextGray: {
    paddingHorizontal: 10,
    color: "rgba(64,64,64,1)",
    textAlign: "center",
    fontSize: 12,
    flex: 1,
  },
  shopMarkInfo: {
    paddingHorizontal: 10,
    color: "rgba(255,255,255,1)",
    fontSize: 12,
    textAlign: "right",
    flex: 1,
  },
  shopMarkInfoOffile: {
    paddingHorizontal: 10,
    color: "rgba(64,64,64,1)",
    fontSize: 12,
    textAlign: "right",
    flex: 1,
  },
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
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
  icoHome: {
    padding: 1,
    marginVertical: 10,
    marginHorizontal: 12,
    height: 23,
    width: 23,
    tintColor: '#fff',
    // tintColor: 'rgba(255,0,0,1)',
    resizeMode: 'stretch',
  },
  icoShopmap: {
    padding: 1,
    marginVertical: 10,
    marginHorizontal: 12,
    height: 24,
    width: 18,
    tintColor: '#fff',
    // tintColor: 'rgba(255,0,0,1)',
    resizeMode: 'stretch',
  },
  icodelivery: {
    marginTop: 10,
    width: 38,
    height: 28,
    resizeMode: 'stretch',
    marginRight: 10,
  },
  icoexchange: {
    marginTop: 0,
    width: 40,
    height: 32,
    resizeMode: 'stretch',
    marginRight: 0,
  },
  icdiscount: {
    marginTop: 0,
    width: 35,
    height: 35,
    resizeMode: 'stretch',
    marginRight: 0,
  },
});

export default ShopMapScreenFromCart;