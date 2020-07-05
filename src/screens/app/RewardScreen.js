import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage'
import USERAPIKit, { setUserClientToken } from '../../utils/apikit';
import Spinner from 'react-native-loading-spinner-overlay';

const RewardScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [rewardPoints, setRewardPoints] = useState(0);

    useEffect(() => {
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
                    setRewardPoints(data.rewardpoints);
                }
                const onFailure = error => {
                    console.log(error);
                    setLoading(false);
                }
                setLoading(true);
                USERAPIKit.get('/user/rewards')
                    .then(onSuccess)
                    .catch(onFailure);
            }
            else {

            }
        };
        bootstrapAsync();

    }, []);

    return (
        <View style={styles.container}>
            <Spinner
                visible={loading} size="large" style={styles.spinnerStyle} />
            <View  style={{ backgroundColor: "rgba(242,242,242,1)"}}>
                <Text style={{ backgroundColor: "transparent", alignSelf: "center", fontSize: 26, marginHorizontal: 20, textAlign: "center", marginTop: 100}}>
                    You have earned total {rewardPoints} reward points for all orders
                </Text>
                <Text style={{ backgroundColor: "rgba(0,0,0,0)", alignSelf: "center", fontSize: 10, marginHorizontal: 20, textAlign: "center", marginTop: 30}}>
                    * For completed order, it may take upto 48 hours to reflect reward points
                </Text>
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
    },
    autocompleteContainer: {
        flex: 1,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 1
    },
    spinnerStyle: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
})

export default RewardScreen;