/**
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState, useContext } from 'react';

import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage'
import { SHOPAPIKit, setShopClientToken } from '../../utils/apikit';
import SwitchSelector from 'react-native-switch-selector';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const LiveOrderScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [ordersAll, setOrders] = useState([]);
  const [ordersProcessing, setOrdersProcessing] = useState([]);
  const [ordersReady, setOrdersReady] = useState([]);
  const [switchIndex, setSwitchIndex] = useState(0);
  const [options] = useState([
    { label: 'All', value: "0" },
    { label: 'Processing', value: "1" },
    { label: 'Ready', value: "2" }
  ]);
  
  useEffect(() => {
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
            setPartialOrders(data.liveorders);
            // console.log(data);
          }
          const onFailure = error => {
            console.log(error);
            setLoading(false);
          }
          setLoading(true);
          SHOPAPIKit.get('/userorder/orders/live')
            .then(onSuccess)
            .catch(onFailure);
        }
      };
      bootstrapAsync();
    });
    return unsubscribe;

  }, [navigation]);

  const setPartialOrders = (orders) => {
    let processingOrders = [];
    let readyOrders = [];
    orders.forEach(element => {
      if( element.orderstatus == "Processing" )
        processingOrders.push(element);
      else if( element.orderstatus == "Ready" )
        readyOrders.push(element);
    });

    setOrders(orders);
    setOrdersProcessing(processingOrders);
    setOrdersReady(readyOrders);

    onSwitchChange(0);  // All data
  }

  const onSwitchChange = (value) => {
    if(switchIndex == value)
      return;
    console.log(value);
    setSwitchIndex(value);
  }

  const onOrderPressed = (item) => {
    console.log(item.orderref);
    navigation.navigate('Live Order Detail', item)
  }

  const renderItem = ({ item }) => {
    return (
        <View style={styles.item}>
          <View style={{flex: 3 }}>
            <TouchableOpacity onPress={() => onOrderPressed(item)}>
                <View style={styles.itemGroup}>
                  <View style={{flexDirection: "row", justifyContent: 'space-around', paddingVertical: 3}}>
                    <Text style={{ flex: 2, fontSize: 15, textDecorationLine: "underline",textAlign: "center" }}>{item.orderref}</Text>
                    <Text style={{ flex: 2, fontSize: 15, textAlign: "center" }}>{item.orderdate}</Text>
                    <Text style={{ flex: 4, fontSize: 15, textAlign: "center" }}>{item.ordershop}</Text>
                  </View>
                  <View style={{flexDirection: "row", justifyContent: "space-around", paddingVertical: 3}}>
                    <Text style={{flex: 2,  fontSize: 15, textAlign: "center" }}>₹ {item.ordertotal}</Text>
                    <Text style={{flex: 2,  fontSize: 15, textAlign: "center" }}>{item.orderquantity} pc</Text>
                    <Text style={{flex: 4,  fontSize: 15, textAlign: "center" }}>{item.orderstatus}</Text>
                  </View>
                </View>
            </TouchableOpacity>
          </View>
      </View>
    )
  }
  return (
      <View style={styles.container}>
        <Spinner
          visible={loading} size="large" style={styles.spinnerStyle} />
        <View style={{marginTop: 5}}/>
        {
          switchIndex == 1 ?
            <FlatList
            data={ordersProcessing}
            keyExtractor={(item, index) => index.toString()}
            renderItem={ordersProcessing ? renderItem : null} />
          : switchIndex == 2 ?
            <FlatList
            data={ordersReady}
            keyExtractor={(item, index) => index.toString()}
            renderItem={ordersReady ? renderItem : null} />
            : 
            <FlatList
              data={ordersAll}
              keyExtractor={(item, index) => index.toString()}
              renderItem={ordersAll ? renderItem : null} />
        }
        <SwitchSelector
          textColor={'#2396f3'} //'#7a44cf'
          selectedColor={Colors.white}
          buttonColor={'#2396f3'}
          borderColor={'#146fb9'}
          backgroundColor={'rgba(255,255,255,1)'}
          style={{backgroundColor: '#f2f2f2', opacity: 1}}
          hasPadding
          options={options}
          initial={0}
          onPress={value => onSwitchChange(value)}
        />
      </View>
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
    flexDirection: "row",
    marginVertical: 5,
    marginHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(62,163,244,1)',
    flexDirection: 'row',
    backgroundColor: 'rgba(210,240,255,1)',
  },
  itemGroup: {
    flexDirection: 'column',
    paddingHorizontal: 5,
    justifyContent: 'space-between',
  },
});

export default LiveOrderScreen;