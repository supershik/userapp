/**
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState, useContext } from 'react';
import MapView, { Marker } from 'react-native-maps'
import { Dialog } from 'react-native-simple-dialogs';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Button,
} from 'react-native';
import { Searchbar } from 'react-native-paper';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-community/async-storage'
import Spinner from 'react-native-loading-spinner-overlay';
import { ConfirmDialog } from 'react-native-simple-dialogs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import USERAPIKit, { SHOPAPIKit, setUserClientToken } from '../../utils/apikit';
import ic_homedeliveryok from '../../res/assets/images/ic_homedeliveryok.png'
import ic_homedeliveryno from '../../res/assets/images/ic_homedeliveryno.png'
import ic_exchangeok from '../../res/assets/images/ic_exchangeok.png'
import ic_exchangeno from '../../res/assets/images/ic_exchangeno.png'
import ic_discount from '../../res/assets/images/ic_discount.png'

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import Toast from 'react-native-simple-toast';

const MapViewScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [shopdata, setData] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [query, setQuery] = useState('');
  const [marginBottom, setMarginBottom] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [alertPassToSummary, setAlertPassToSummary] = useState(false);
  const [alertNoProduct, setAlertNoProduct] = useState(false);
  const [orderProductsbyShopid, setOrderProductsbyShopid] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [msgProductExchange, setMsgProductExchange] = useState ('');
  const [msgHomeDelivery, setMsgHomeDelivery] = useState ('');
  const [ismanaged, setManaged] = useState(0);
  const [minordervalue, setMinOrder] = useState(0);
  
  const [isDelivery, setDelivery] = useState(false);
  const [isExchange, setExchange] = useState(false);
  const [isAlertOnlineShop, setAlertOnlineShop] = useState(false);
  const [msgMinOrderValue, setMsgMinOrderValue] = useState ('');
  const [isMinOrderValue, setMinOrderValue] = useState(false);

  const [region, setRegion] = useState({
    latitude: 15.480808256,
    longitude: 73.82310486,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  })

  const [shop, setShop] = useState({
    index: 0,
    alert: false,
    wholesaler: 0,
    bulkorder: 0,
    shopname: '',
    year: 1990
  })
 
  useEffect(() => {
    setShop({
      alert: false
    });
    const unsubscribe = navigation.addListener('focus', () => {
      setQuery('');
      const bootstrapAsync = async (coords) => {
        let userToken = null;
        try {
          userToken = await AsyncStorage.getItem('userToken')
        } catch (e) {
          console.log(e);
        }
        if (userToken != null) {
          requestShops(coords);
        }
      };

      Geolocation.getCurrentPosition(
        //Will give you the current location
        (position) => {
            if(position.coords != undefined) {
              setRegion({latitude: position.coords.latitude, longitude: position.coords.longitude})                          
              bootstrapAsync(position.coords);
            }
        },
        (error) => {
          console.log(error);
        },
        {
           enableHighAccuracy: false, timeout: 20000, maximumAge: 1000
        }
     );
    });
    return unsubscribe;

  }, [navigation]);

  const requestShops = (coords) => {
    console.log(coords);
      const payload = { latitude: coords.latitude, longitude: coords.longitude };
      const onSuccess = ({ data }) => {
        console.log(data);
        setData(data.shops)
        updateShopList(data.shops);
        setLoading(false);

        if(data.shops.length < 1) {
          let message = 'No Nearest shop' // value = 1;
          Toast.show(message);
        }
      }
      const onFailure = error => {
        let message = 'No Nearest shop' // value = 1;
        console.log(error);
        setLoading(false);
        Toast.show(message);
      }
      setLoading(true);
      SHOPAPIKit.post('/shopoperation/near', payload)
        .then(onSuccess)
        .catch(onFailure);
  }

  const updateShopList = (shopData) => {
    let tempMarkers =[];
    shopData.forEach(element => {
      if (element.shopname != 'undefined') {
        tempMarkers.push({ latitude: element.latitude, longitude: element.longitude, title: element.shopname, subtitle: element.shopname, isonline: element.isonline })
      }
    });
    setMarkers(tempMarkers);
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

    setMessageContent(message);
    getProductbyShopid(index);
  }

  const onWholeSalerPressed = () => {
    setShop({
      alert: false
    });

  }

  const onMapReady = () => {
    console.log("map ready");
    setMarginBottom(1);
  }

  const handleSearch = (query) => {
    setQuery(query);
    if (query.length >= 3) {
      const onSuccess = ({ data }) => {                
        setData(data.shops)
        updateShopList(data.shops);
        console.log(data);
        if(data.shops.length < 1) {
          let message = 'No Nearest shop' // value = 1;
          Toast.show(message);
        }
      }
      const onFailure = error => {
        setData([]);
        updateShopList([]);
        console.log(error);
        let message = 'No Nearest shop' // value = 1;
        Toast.show(message);
      }
      SHOPAPIKit.get('/shopoperation/shops/' + query)
        .then(onSuccess)
        .catch(onFailure);
    }
    else if (query.length == 0) {
      requestShops(region);
    }
    else {
      setData([]);
      updateShopList([]);
    }
  }

  const openOrderSummary = () => {
    if( selectedIndex < 0 )
      return;

    setAlertPassToSummary(false);

    let shopInfo = shopdata[selectedIndex];
    console.log('pressed marker: ', {shopInfo: shopInfo, ismanaged: ismanaged, minordervalue: minordervalue, fromView: 'MapView'});
    navigation.navigate('Search Screen From Map', {shopInfo: shopInfo, ismanaged: ismanaged, minordervalue: minordervalue, fromView: 'MapView'});
  }

  // call only to get ismanaged
  const getProductbyShopid = async(index) => {
    let shopInfo = shopdata[index];
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

            console.log(shopInfo);
            updateShopInfo(shopInfo);
          
          }

          const onFailure = error => {
            console.log(error);
            setLoading(false);
            if(error.toString().includes('409')) { // no products
              updateShopInfo(shopInfo);
            }
            //setAlertNoProduct(true);
            //navigation.navigate('Search Screen From Map', {shopInfo: shopInfo, ismanaged: data.ismanaged, minordervalue: data.minordervalue, fromView: 'MapView'});
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

  const updateShopInfo = (shopInfo) => {
    console.log('------------------ shop id --------------');
    console.log(shopInfo);
    
    setManaged(shopInfo.ismanaged);
    setMinOrder(shopInfo.minordervalue);

    if( shopInfo.productexchange == 1 ) {
      setExchange(true);
      setMsgProductExchange("Product exchange is allowed as per shop policy");
    }
    else {
      setExchange(false);
      setMsgProductExchange("Product exchange is not allowed as per shop policy");
    }
    if( shopInfo.homedelivery == 1 ) {
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
    
    // let isProduct = true;
    // if( shopInfo.products.length < 1 )
    //   isProduct = false;

    // if( isProduct == false ) {  // move to search shop screen without any condition
    //   //setAlertNoProduct(true);
    //   navigation.navigate('Search Screen From Map', {shopInfo: shopInfo, ismanaged: shopInfo.ismanaged, minordervalue: shopInfo.minordervalue, fromView: 'MapView'});
    // }
    // else
      setAlertPassToSummary(true);
  }
  return (
    <>
      <View style={styles.container}>
        <Spinner
          visible={loading} size="large" style={styles.spinnerStyle} />
        <Searchbar
          placeholder="Shop Name"
          onChangeText={(query) => handleSearch(query)}
          value={query}
          style={styles.searchbar}
        />
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
                    <View >
                      <View
                        style={styles.markerOnline}>
                        <Text style={styles.titleText}>
                          {marker.title}
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
                    <View>
                      <View
                        style={styles.markerOffline}>
                        <Text style={styles.titleTextGray}>
                          {marker.title}
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
        <Dialog
          visible={shop.alert}
          title={shop.shopname}
          onTouchOutside={()=>onWholeSalerPressed()}>
          <View style={{flexDirection: 'column'}}>
              <Text>Since {shop.year}</Text>
              <View style={{marginTop: 10, flexDirection: 'row'}}>
                {shop.wholesaler == 0 ?<Text style={{backgroundColor: '#00ff00', padding: 4}}>Wholesaler</Text> : null}
                {shop.bulkorder == 0 ?<Text style={{backgroundColor: '#00ff00', padding: 4,marginLeft: 10}}>Bulkorder</Text> : null}
              </View>
          </View>
        </Dialog>
      </View>
      <View>
      <ConfirmDialog
          dialogStyle={{ backgroundColor: "rgba(255,255,255,1)", borderRadius: 16, width: 290, alignSelf: "center" }}
          titleStyle={{ textAlign: "center", marginTop: 30, fontSize: 16 }}
          title=""
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
    fontSize: 14,
    flex: 1,
  },
  titleTextGray: {
    paddingHorizontal: 10,
    color: "rgba(64,64,64,1)",
    textAlign: "center",
    fontSize: 14,
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
  searchbar: {
    margin: 4,
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
  }
});

export default MapViewScreen;