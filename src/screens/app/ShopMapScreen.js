/**
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState, useContext, version } from 'react';
import MapView, { Marker, MAP_TYPES } from 'react-native-maps'
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
import imgDiscount from '../../res/assets/images/discount1.png'

const ShopMapScreen = ({ navigation, route }) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [alertPassToSummary, setAlertPassToSummary] = useState(false);
  const [alertNoProduct, setAlertNoProduct] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shopdata, setShopData] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [orderProductsbyShopid, setOrderProductsbyShopid] = useState([]);
  const [shopcategoryinfo] = useState(route.params.shopcategoryinfo);
  const [messageContent, setMessageContent] = useState('');
  const [msgProductExchange, setMsgProductExchange] = useState ('');
  const [msgHomeDelivery, setMsgHomeDelivery] = useState ('');
  const [textLoadMessage, setTextLoadMessage] = useState('');

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
            setPayload({latitude:info.coords.latitude, longitude: info.coords.longitude, shopcategoryid: shopcategoryinfo.shopcategoryid});
            bootstrapAsync(info.coords);
          }
        },
        (error) => {
          console.log(error); 
          bootstrapAsync();
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 });
    });
    return unsubscribe;

  }, [navigation]);

  const updateShopList = (shopData) => {
    let newMarks = [];
    shopData.forEach(element => {
      if (element.shopname != 'undefined') {
        newMarks.push({ latitude: element.latitude, longitude: element.longitude, title: element.shopname, distance: element.distance, discount: element.discount, rating: element.rating })
      }
    });
    setMarkers(newMarks);
  }

  const onPressMarker = (index) => {
    setSelectedIndex(index);
    let message = "Product price may vary as per shop";
    if( shopdata[index].shopcategoryid == 8 )
      message = "Product price may vary as per shop.\nAge proof will be asked at time of pickup (ONlY 18+ IS ALLOWED)";

    setMessageContent(message);
    getProductbyShopid(index);
  }
  
  const openOrderSummary = () => {
    if( selectedIndex < 0 )
      return;
      
    setAlertPassToSummary(false);
    navigation.navigate('Order Summary', {orderProducts: orderProductsbyShopid, shopname: shopdata[selectedIndex].shopname, shopcode: shopdata[selectedIndex].shopcode, discount: shopdata[selectedIndex].discount, shopid: shopdata[selectedIndex].shopid});
  }

  const getProductbyShopid = async(index) => {
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
            if( data.productexchange == 1 )
              setMsgProductExchange("Product exchange is allowed as per shop policy.");
            else
              setMsgProductExchange("Product exchange is not allowed as per shop policy.");
            if( data.homedelivery == 1 )
              setMsgHomeDelivery("Home delivery is available");
            else
              setMsgHomeDelivery("Home delivery is not available, Only shop pick up");
              
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
          setTextLoadMessage("");
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
    let myCoords = payload;
    if(coords != undefined ) {
      myCoords = {
        latitude:coords.latitude,
        longitude: coords.longitude,
        shopcategoryid: shopcategoryinfo.shopcategoryid
      };
    }

    const onSuccess = ({ data }) => {
      setShopData(data.shops)
      console.log("------------------ shop map data --------------------");
      console.log(data);

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
    setTextLoadMessage("");
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
          visible={loading} size="large" textStyle = {{ fontSize: 18, fontWeight: "bold", color: "rgba(255,255,255,1)" }} textContent={textLoadMessage} />
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
                <View >
                <View
                    style={styles.callout}>
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
              <View style = {{marginTop: 0, marginBottom: -40, marginHorizontal: 10 }}>
                <Text style={{textAlign: "center"}}>
                  {msgProductExchange}
                </Text>
                <Text style={{marginTop: 10, textAlign: "center"}}>
                  {msgHomeDelivery}
                </Text>

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
        </View>
        <SwitchSelector 
          textColor={'#4cb344'} //'#7a44cf'
          selectedColor={Colors.white}
          buttonColor={'#4cb344'}
          borderColor={'#4cb344'}
          backgroundColor={'rgba(255,255,255,1)'}
          style={{backgroundColor: 'rgba(255,255,255,1)', opacity: 1}}
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
  callout: {
    backgroundColor: "rgba(255,0,0,1)",
    borderRadius: 4,
    padding: 1,
    justifyContent: "center"
  },
  titleText: {
    paddingHorizontal: 20,
    color: "rgba(255,255,255,1)",
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
    resizeMode: 'stretch',
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
  icoShopmap: {
    padding: 1,
    marginVertical: 10,
    marginHorizontal: 12,
    height: 24,
    width: 18,
    tintColor: '#fff',
    resizeMode: 'stretch',
  },
});

export default ShopMapScreen;