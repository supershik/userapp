import React, { useEffect, useState, useContext } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage'
import USERAPIKit, { setUserClientToken, setShopClientToken, setCashFreeToken } from '../utils/apikit';
import Logo from "../res/assets/images/logo.png"
import { AuthContext } from '../utils/authContext';

const SplashScreen = props => {
  const { signIn } = useContext(AuthContext);
  useEffect(() => {
    setTimeout(() => {
      bootstrapAsync();
    }, 1500);
    const bootstrapAsync = async () => {
      let userToken = null;
      let mobile = null;
      let password = null;
      try {
        userToken = await AsyncStorage.getItem('userToken')
        mobile = await AsyncStorage.getItem('mobile')
        password = await AsyncStorage.getItem('password')

      } catch (e) {
        console.log(e);
      }
      if (userToken != null && mobile != null && password != null) {
        const payload = { mobile, password };
        const onSuccess = ({ data }) => {
          setUserClientToken(data.token);
          setShopClientToken(data.token);
          setCashFreeToken(data.token);
          console.log("Splash Screen Success");
          console.log('--------------token--------------------');
          console.log(data.token);
          signIn({ mobile, password, token: data.token });
        }
        const onFailure = error => {
          signIn({ mobile, password });
        }
        USERAPIKit.post('/user/login', payload)
          .then(onSuccess)
          .catch(onFailure);
      }
      else {
        signIn({ mobile, password });
      }
    };
  }, []);

  return (
    <View
      style={[
        styles.container,
        { justifyContent: 'center', alignItems: 'center' }
      ]}
    >
      <Image style={{ width: 250, height: 250, resizeMode: 'contain' }} source={Logo} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
})
export default SplashScreen