import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage'
// Create axios client, pre-configured with baseURL
let USERAPIKit = axios.create({
  baseURL: 'https://usermoduleapi1.herokuapp.com',
  timeout: 10000,
});
// Set JSON Web Token in Client to be included in all calls
export const setUserClientToken = () => {  
  USERAPIKit.interceptors.request.use(
    async config => {
        const token = await AsyncStorage.getItem('userToken')
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        // config.headers['Content-Type'] = 'application/json';
        return config;
    },
    error => {
        Promise.reject(error)
    });
};

export const SHOPAPIKit = axios.create({
  baseURL: 'https://ordermoduleapi1.herokuapp.com',
  timeout: 10000,
});

export const setShopClientToken = () => {
  SHOPAPIKit.interceptors.request.use(
    async config => {
        const token = await AsyncStorage.getItem('userToken')
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        // config.headers['Content-Type'] = 'application/json';
        return config;
    },
    error => {
        Promise.reject(error)
    });
};

export const CASHFREEAPIKit = axios.create({
  baseURL: 'https://paymentmoduleapi1.herokuapp.com',
  timeout: 10000,
});

export const setCashFreeToken = () => {
  CASHFREEAPIKit.interceptors.request.use(
    async config => {
        const token = await AsyncStorage.getItem('userToken')
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        // config.headers['Content-Type'] = 'application/json';
        return config;
    },
    error => {
        Promise.reject(error)
    });
};

export default USERAPIKit;