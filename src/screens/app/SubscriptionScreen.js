/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState, useContext } from 'react';

import {
  SafeAreaView,
  StyleSheet,
  Button,
  FlatList,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';

import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage'
import Toast from 'react-native-simple-toast';
import USERAPIKit, { setUserClientToken } from '../../utils/apikit';
import { colors } from '../../res/style/colors';

const SubscriptionScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedindex, setSelectedIndex] = useState(0);

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
            // console.log(data);
            setLoading(false);
            getSubscriptions(data.usersubscriptions);
            let curIndex = 0;
            for( let i = 0; i < data.usersubscriptions.length; i++ ) {
              if( data.usersubscriptions[i].subscriptionid == data.usersubscriptionid ) {
                curIndex = i;
                break;
              }
            }
            setSelectedIndex(curIndex);
          }
          const onFailure = error => {
            console.log(error);
            setLoading(false);
          }
          setLoading(true);
          USERAPIKit.get('/user/allsubscription')
            .then(onSuccess)
            .catch(onFailure);
        }

      };
      bootstrapAsync();
    });
    return unsubscribe;

  }, [navigation]);

  const getSubscriptions = (subscriptions) => {
    setSubscriptions(subscriptions);
  }

  const onOrderPressed = (item, index) => {
    console.log(index)
    setSelectedIndex(index)
  }

  const updateSubscription = () => {
    let id = subscriptions[selectedindex].subscriptionid
    const payload = {usersubscriptionid: id };
    const onSuccess = ({ data }) => {
      setLoading(false);
      Toast.show('Successfully updated.');
      navigation.navigate('Home');
    }
    const onFailure = error => {
      console.log(error);
      setLoading(false);
      Toast.show('Failed to update.');
    }
    setLoading(true);
    USERAPIKit.patch('/user/update/subscription', payload)
      .then(onSuccess)
      .catch(onFailure);
  }

  const renderItem = ({ item, index }) => {
    return (
      <View style={selectedindex == index ? styles.selecteditem : styles.item}>
        <TouchableOpacity onPress={() => onOrderPressed(item, index)}>
          <View style={{ flexDirection: 'column', padding: 8, justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 15 }}>{item.subscription}</Text>
            <Text style={{ fontSize: 15 }}>{item.subscriptiondesc}</Text>
            {item.discountmprice != 0 ? 
              <View style={{flexDirection: 'row'}}>
                <Text style={{ fontSize: 15 }}>₹ </Text>
                <Text style={{ textDecorationLine: 'line-through', fontSize: 15 }}>{item.mprice}</Text>
                <Text style={{ fontSize: 15, fontWeight: 'bold'}}> {item.discountmprice}</Text>
                <Text style={{ fontSize: 15 }}> for montly</Text>
              </View> : null}
            {item.discountyprice != 0 ? 
              <View style={{flexDirection: 'row'}}>
                <Text style={{ fontSize: 15 }}>₹ </Text>
                <Text style={{ textDecorationLine: 'line-through', fontSize: 15 }}>{item.yprice}</Text>
                <Text style={{ fontSize: 15, fontWeight: 'bold'}}> {item.discountyprice}</Text>
                <Text style={{ fontSize: 15 }}> for montly</Text>
              </View> : null}
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <>
      <View style={styles.container}>
        <Spinner
          visible={loading} size="large" style={styles.spinnerStyle} />
        <FlatList
          data={subscriptions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={subscriptions ? renderItem : null} />
          {
          subscriptions.length != 0 ?
            <View style={styles.buttonContainer}>
              <Button title='Update' onPress={updateSubscription} />
            </View> : null
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
    margin: 10,
    flexDirection: 'row',
    backgroundColor: colors.white,
  },
  selecteditem: {
    flex: 1,
    margin: 10,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: '#00ff00',
  },
});

export default SubscriptionScreen;