import AsyncStorage from '@react-native-community/async-storage'

export const saveUserInfo = key => {
    return AsyncStorage.setItem('USER_DATA', key)
}

export const loadUserData = callback => {
    return AsyncStorage.getItem('USER_DATA', callback)
}