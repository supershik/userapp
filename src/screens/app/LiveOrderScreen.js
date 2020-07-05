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

const LiveOrderScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
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
            setOrders(data.liveorders);
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
    <>
      <View style={styles.container}>
        <Spinner
          visible={loading} size="large" style={styles.spinnerStyle} />
        <View style={{marginTop: 5}}/>
        <FlatList
          data={orders}
          keyExtractor={(item, index) => index.toString()}
          renderItem={orders ? renderItem : null} />
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