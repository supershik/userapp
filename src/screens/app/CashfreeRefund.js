import React, {useEffect, useState} from 'react';
import {Text, View, TouchableOpacity, StyleSheet, Image, Dimensions, Button, TextInput } from 'react-native';
import CashfreePG from 'cashfreereactnativepg';
import base64 from 'base-64';
import { or } from 'react-native-reanimated';
import Spinner from 'react-native-loading-spinner-overlay';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-community/async-storage'
import { colors } from '../../res/style/colors'
import { CASHFREEAPIKit, setCashFreeToken } from '../../utils/apikit';
import icon_refund from '../../res/assets/images/icon_refund.png'
import icon_error from '../../res/assets/images/icon_error.jpg'
import moment from 'moment';
import { ConfirmDialog } from 'react-native-simple-dialogs';

const CashfreeRefund = ({ navigation, route }) => {
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState('');
    const [showRefundDialog, setShowRefundDialog] = useState(false);
    const [refundReason, setRefundReason] = useState("");

    const [refundData, setRefund]  = useState({
        orderId: route.params.orderId,
        appId: undefined,
        secretKey:undefined,
        referenceId: "",
        refundAmount: route.params.orderAmount,
        refundNote: "needn't it",
        merchantRefundId: "",
        refundType: "",
        mode: "",
        accountNo: "",
        ifsc: "",
    })

    const [token, setToken] = useState(undefined);
    
    const navigationiOptions = () => {
        navigation.setOptions({ 
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
      })
    }

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            navigationiOptions();
            const bootstrapAsync = async () => {
                //getRefundInfo(refundData);
            };

            bootstrapAsync();
        });
        
        return unsubscribe;
    
    }, [navigation]);

    // from our server(api)
    const getRefundInfo = async(refundInfo)=> {
        let userToken = null;
        try {
          userToken = await AsyncStorage.getItem('userToken');
        } catch (e) {
          console.log(e);
        }
        if (userToken != null) {
          let orderres = refundInfo.orderId.split("-");
          const orderId = orderres[orderres.length-1];  // extract 1033 from VE2006-1033
          console.log(orderId);

          const onSuccess = ({ data }) => {
            setLoading(false);
            console.log(data);
          }

          const onFailure = (error) => {
            console.log(error);
            setLoading(false);
            Toast.show("Refund information can't get. \n\n   Please try again");
            setErrMsg("Refund information can't get. \n\n   Please try again");
          }
          
          setLoading(true);
          CASHFREEAPIKit.post('/transaction/cancel/order/refund/'+ orderId)
            .then(onSuccess)
            .catch(onFailure);
        }
    }

    // const onPressRefund = ()=> {
    //     const orderId = refundData.orderId;
    //     const referenceId = refundData.referenceId;
    //     const refundAmount = refundData.refundAmount;
    //     const refundNote = refundData.refundNote;
    //     const appId = refundData.appId;
    //     const secretKey = refundData.secretKey;

    //     if( orderId == undefined || 
    //         referenceId == undefined || 
    //         refundAmount == undefined || 
    //         refundNote == undefined || 
    //         appId == undefined || 
    //         secretKey == undefined 
    //         )
    //     {
    //         Toast.show("We need to get some parameters like referenceid from our server");
    //         return;
    //     }

    //     try{
    //         setLoading(true);
    //         console.log('-------- start Refund -----------');
    //         formData = new FormData();
    //         formData.append('appId', appId);
    //         formData.append('secretKey', secretKey);
    //         formData.append('orderId', orderId);
    //         formData.append('referenceId', referenceId);
    //         formData.append('refundAmount', refundAmount);
    //         formData.append('refundNote', refundNote);

    //         console.log(formData);
    //         const tokenUrl = "https://test.cashfree.com/api/v1/order/refund";
    //         fetch(tokenUrl, {
    //             method: 'POST',
    //             // cache: 'no-cache',
    //             headers:  {
    //                 'Content-Type': 'multipart/form-data'
    //             },
    //             body: formData
    //         })
    //         .then((result)=>{
    //             setLoading(false);
    //             console.log(result);
    //             return result.json()
    //         })
    //         .then((response)=>{
    //             setLoading(false);
    //             console.log(response);
    //             setErrMsg('Refund successfull');
    //             setShowRefundDialog(true);
    //             return response;
    //         })
    //         .catch((err)=>{
    //             setLoading(false);
    //             setErrMsg('Refund failed');
    //             setShowRefundDialog(true);
    //             console.log('============ Refund error ================');
    //             console.log("err caught");
    //             console.log(err);
    //         });
    //     }
    //     catch(err){
    //         setLoading(false);
    //         console.log('============ Refund failed ================');
    //         console.log(err);
    //     }
    // }

    const onPressCancel = () => {
        navigation.goBack();
    }
    const onPressRefund = async()=> {
        let userToken = null;
        try {
          userToken = await AsyncStorage.getItem('userToken');
        } catch (e) {
          console.log(e);
        }
        if (userToken != null) {
          let orderres = refundData.orderId.split("-");
          const orderId = orderres[orderres.length-1];  // extract 1033 from VE2006-1033
          console.log(orderId);

          const onSuccess = ({ data }) => {
            setLoading(false);
            console.log(data);
            setErrMsg("Refund successfull");
            Toast.show("Refund request is initiated successfully.\nIt will take upto 48 hrs to reflect in your account.");
            navigation.popToTop();
            navigation.navigate('Home');
            //setShowRefundDialog(true);
          }

          const onFailure = (error) => {
            console.log(error);
            setLoading(false);
            Toast.show("Refund failed");
            setErrMsg("Refund information can't get. \n\n   Please try again");
            //setShowRefundDialog(true);
            navigation.goBack();
          }
          
          setLoading(true);
          CASHFREEAPIKit.post('/transaction/cancel/order/refund/'+ orderId)
            .then(onSuccess)
            .catch(onFailure);
        }
    }

    const onPressSuccessOK = () => {
        navigation.popToTop();
        setShowRefundDialog(false);
    }

    const onChangeRefundReason = () => {

    }

    return (
      <>
        <Spinner
            visible={loading} size="large" style={styles.spinnerStyle} />
            <View style={{flex: 1, flexDirection: "column"}}>
                <View style={styles.imageConfirm}>
                    <Image
                        source={icon_refund}
                        style={styles.image}
                    />
                </View>
                <View style={styles.textSuccess}>
                    <Text style={{marginTop: 10, fontSize: 18, color: 'rgba(0,0,0,1)', textAlign: "center"}}>
                        15% will be deducted for service charge
                    </Text>
                    <View style={{flexDirection: "row", marginHorizontal: 30, marginTop: 100}}>
                        <View style={styles.buttonContainer}>
                            <Button title='Refund' onPress={onPressRefund}/>
                        </View>
                        <View style={styles.buttonContainerCancel}>
                            <Button title='Cancel' onPress={onPressCancel} color="#ababab"/>
                        </View>
                    </View>
                </View>
                <ConfirmDialog
                    dialogStyle={{ backgroundColor: "rgba(255,255,255,1)", borderRadius: 16, width: 260, alignSelf: "center" }}
                    titleStyle={{ textAlign: "center", marginTop: 30, fontSize: 16 }}
                    title = {errMsg}
                    visible={showRefundDialog}
                    // onTouchOutside={() => setShowRefundDialog(false)}
                    >
                    <View style = {{marginTop: 0, marginBottom: -40, marginHorizontal: 10 }}>
                        <View style={{marginTop: 0, marginHorizontal: 30}}>
                            <Button
                                buttonStyle={{backgroundColor: "rgba(130, 130, 128,1)" }}
                                title="Ok"
                                titleStyle={{ fontSize: 14 }}
                                onPress={() => onPressSuccessOK()}
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
      flex: 1,
      justifyContent: 'center',
    },
    button: {
      alignItems: 'center',
      backgroundColor: '#DDDDDD',
      padding: 10
    },
    countContainer: {
      alignItems: 'center',
      padding: 10
    },
    countText: {
      color: '#FF00FF'
    },
    errMsg: {
        flex: 1,
        alignSelf: "center",
        textAlignVertical: "center",
        paddingHorizontal: 10,
        fontSize: 16,
    },
    image: {
        marginTop: 100,
        width: Dimensions.get('window').width/3,
        height: Dimensions.get('window').height/8,
        // resizeMode: 'stretch'
    },

    imageConfirm: {
        flex: 1,
        alignItems: "center",
        backgroundColor: '#fff'
    },

    textSuccess: {
        flex: 1,
        alignItems: "center",
        backgroundColor: '#fff'
    },
    buttonContainer: {
        height: 35,
        marginHorizontal: 20,
        justifyContent: 'center',
        width: 100,
      },
    buttonContainerCancel: {
        height: 35,
        marginHorizontal: 20,
        justifyContent: 'center',
        width: 100,
      },
  })
/*
<Text>{JSON.stringify(urlResponse)}</Text>
            <Text>==========================================</Text>
            <Text>{JSON.stringify(order)}</Text>
            {this.displayCashFreeForm()}
            <Text>------------------------------------------</Text>
            <Text>{testData}</Text>
            <Text>\\\\\\\\\\\\\\\\\||||||||||||||||||||||||||||||///////////////</Text>
            <Text>{decode}</Text>
            <CashfreePG1></CashfreePG1>
            appId: '275432e3853bd165afbf5272',
*/ 

export default CashfreeRefund;