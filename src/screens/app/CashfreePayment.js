import React, {useEffect, useState} from 'react';
import {Text, View, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import CashfreePG from 'cashfreereactnativepg';
import base64 from 'base-64';
import { or } from 'react-native-reanimated';
import Spinner from 'react-native-loading-spinner-overlay';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-community/async-storage'
import { colors } from '../../res/style/colors'
import { CASHFREEAPIKit, setCashFreeToken } from '../../utils/apikit';
import icon_confirmation from '../../res/assets/images/icon_confirmation.gif'
import icon_error from '../../res/assets/images/icon_error.jpg'

const CashfreePayment = ({ navigation, route }) => {
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState('');
    const [payload] = useState(route.params.payload);
    const [order, setOrder]  = useState({
        //appId: '19149069bd004065084653ce894191',
        // orderId: "1030",
        // orderAmount: "59",
        //source: "reactsdk", // important, only use reactsdk
        appId: "",  // obtained from server
        orderId: route.params.orderId,
        orderAmount: route.params.orderAmount.toString(),
        customerName: "Salah",
        customerEmail: "noemail@vay.com",
        customerPhone: "9177777321",
        tokenData: undefined, // obtained from server
        orderCurrency: "INR",
        orderNote: "This is an order note",
        source: "reactsdk",
        notifyUrl: "https://paymentmoduleapi1.herokuapp.com/transaction/confirmation",
        paymentModes: "",
        env: "Test",
    })

    const [refund, setRefund]  = useState({
        orderId: "6166",
        referenceId: "380781",
        refundAmount: "35",
        refundNote: "needn't it",
        merchantRefundId: "",
        refundType: "",
        mode: "",
        accountNo: "",
        ifsc: "",
    })

    const [token, setToken] = useState(undefined);
    const [responseData, setEventData] = useState(null);
    const [confirmation, setConfirmation] = useState(false);
    const [showPaymentSuccess, setShowPaymentSuccessDialog] = useState(false);
    const [showPaymentFailed, setShowPaymentFailedDialog] = useState(false);
    
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
        checkPaymentStatus(responseData);
        const unsubscribe = navigation.addListener('focus', () => {
            navigationiOptions();
            const bootstrapAsync = async () => {
                getUserProfile();

                // setShowPaymentSuccessDialog(true);
                // setTimeout ( () => {
                //     navigation.popToTop();
                //     navigation.navigate('Home');
                //     setShowPaymentSuccessDialog(false);
                // }, 3000)
                // setErrMsg('Payment confirmation failed');
                // setShowPaymentFailedDialog(true);
                // setTimeout ( () => {
                //     navigation.goBack();
                //     setShowPaymentFailedDialog(false);
                // }, 3000)
                
            };

            bootstrapAsync();
        });
        
        return unsubscribe;
    
    }, [navigation, responseData]);

    // from our server(api)
    const getToken = async(newOrder)=> {
        let userToken = null;
        try {
          userToken = await AsyncStorage.getItem('userToken');
        } catch (e) {
          console.log(e);
        }
        if (userToken != null) {
          const onSuccess = ({ data }) => {
            setLoading(false);
            if(data.appId == undefined || data.token == undefined)
            {
                Toast.show("Token or appId failed. \n Try again");
                setErrMsg("Token or appId failed. \n Try again");
                setShowPaymentFailedDialog(true);
                setTimeout ( () => {
                    navigation.goBack();
                    setShowPaymentFailedDialog(false);
                }, 3000)
                return;
            }

            const tempOrder = newOrder;
            tempOrder.tokenData = data.token;
            tempOrder.appId = data.appid;
            setOrder(tempOrder);
            setToken(data.token);
            console.log(data);
          }
          const onFailure = (error) => {
            console.log(error);
            setLoading(false);
            if(error.toString().includes('401')) {
              console.log( "error: Authentication failed");
            }
            else
              console.log(error);
              
            console.log('------ token failed ------');
            Toast.show("Token failed. \n Try again");
            setErrMsg("Token failed. \n Try again");
            setShowPaymentFailedDialog(true);
            setTimeout ( () => {
                navigation.goBack();
                setShowPaymentFailedDialog(false);
            }, 3000)
          }
          
          setLoading(true);
          
          console.log('------ get token ------');
          CASHFREEAPIKit.post('/transaction/token/'+ newOrder.orderId)
            .then(onSuccess)
            .catch(onFailure);
        }
    }

    // from Cashfree server
    // const getToken = (newOrder)=> {
    //     try{
    //         const orderId = newOrder.orderId;
    //         const orderAmount = newOrder.orderAmount;
    //         const orderCurrency = newOrder.orderCurrency;

    //         setLoading(true);
    //         //const tokenUrl = "http://172.18.20.167:80/api/v2/cftoken/order";
    //         const tokenUrl = "https://test.cashfree.com/api/v2/cftoken/order";
    //         fetch(tokenUrl, {
    //             method: 'POST',
    //             cache: 'no-cache',
    //             headers:  {
    //                 'Content-Type': 'application/json',
    //                 'x-client-id': '19149069bd004065084653ce894191',
    //                 'x-client-secret': 'dcb40d50fd7d7562c24b271f89b38be3b0100aa1'
    //             },
    //             body:JSON.stringify({
    //                 orderId,
    //                 orderAmount,
    //                 orderCurrency
    //             })
    //         })
    //         .then((result)=>{
    //             setLoading(false);
    //             console.log(result);
    //             setErrMsg(result.message);
    //             return result.json()
    //         })
    //         .then((response)=>{
    //             setLoading(false);
    //             setErrMsg(response.message);
    //             return response;
    //         }).then((response)=>{
    //             setLoading(false);
    //             console.log(response);
    //             setErrMsg(response.message);
    //             if(response.status === 'OK' && response.message === 'Token generated'){
    //                 const tempOrder = newOrder;
    //                 tempOrder.tokenData = response.cftoken;
    //                 setOrder(tempOrder);
    //                 setToken(response.cftoken);

    //                 console.log('===================== token OK ================ ');
    //                 console.log(tempOrder);
    //                 console.log('===================== Resoponse ================ ');
    //                 console.log(response);

    //                 return
    //             }
    //             throw {name:'response not success', message:'response was not successfull \n',response};
    //         }).catch((err)=>{
    //             setLoading(false);
    //             console.log("err caught");
    //             console.log(err);
    //             setErrMsg(err.message);
    //         });
    //     }
    //     catch(err){
    
    //     }
    // }

    const requestRefund = ()=> {
        try{
            const orderId = refund.orderId;
            const referenceId = refund.referenceId;
            const refundAmount = refund.refundAmount;
            const refundNote = refund.refundNote;
            const appId = '19149069bd004065084653ce894191';
            const secretKey = 'dcb40d50fd7d7562c24b271f89b38be3b0100aa1';

            setLoading(true);
            // setCashFree();

            console.log('-------- start Refund -----------');

            formData = new FormData();
            formData.append('appId', appId);
            formData.append('secretKey', secretKey);
            formData.append('orderId', orderId);
            formData.append('referenceId', referenceId);
            formData.append('refundAmount', refundAmount);
            formData.append('refundNote', refundNote);

            console.log(formData);
            const tokenUrl = "https://test.cashfree.com/api/v1/order/refund";
            fetch(tokenUrl, {
                method: 'POST',
                // cache: 'no-cache',
                headers:  {
                    'Content-Type': 'multipart/form-data'
                },
                body: formData
            })
            .then((result)=>{
                setLoading(false);
                console.log(result);
                return result.json()
            })
            .then((response)=>{
                setLoading(false);
                console.log(response);
                return response;
            })
            .catch((err)=>{
                setLoading(false);
                console.log('============ Refund error ================');
                console.log("err caught");
                console.log(err);
            });
        }
        catch(err){
            setLoading(false);
            console.log('============ Refund failed ================');
            console.log(err);
        }
    }

    const getUserProfile = async() => {
        try {
            let msg = '';
            let userName = await AsyncStorage.getItem('userName');
            let userEmail = await AsyncStorage.getItem('userEmail');
            let usrePhone = await AsyncStorage.getItem('mobile');

            if( userEmail == null )
                userEmail = 'noemail@vay.com';  //default
            if( userName == null )
                msg = msg + 'user name is not exist. \n';
            if( usrePhone == null )
                msg = msg + 'phone number is not exist. \n';

            setErrMsg(msg);
            if( msg.length > 0 )
            {
                Toast.show(jsondata.txStatus);
                setErrMsg('Payment failed \n\n'+ msg);

                setShowPaymentFailedDialog(true);
                setTimeout ( () => {
                    navigation.goBack();
                    setShowPaymentFailedDialog(false);
                }, 3000)
                return;
            }

            const newOrder = {
                ...order,
                customerName: userName,
                customerEmail: userEmail,
                customerPhone: usrePhone,
            }

            console.log('---------------- order -------------------');
            console.log(newOrder);
            
            setOrder(newOrder);
            getToken(newOrder);
            
            //getToken(order);
        } catch (e) {
            console.log(e);
        }
    }

    const checkPaymentStatus = (data)=> {
        const jsondata = JSON.parse(data);

        if( data == null || data == undefined )
            return;
        if( jsondata.txStatus == undefined || jsondata.txStatus == "" )
            return;
        if(confirmation === true)
            return;
        // When is succeeded from Cashfree server
        if( jsondata.txStatus == "SUCCESS") {
            requestPaymentConfirmation();
            return;
        }
        else {
            if( jsondata.txStatus == "FAILED" ) {
                Toast.show(jsondata.txStatus);
                setErrMsg('Payment failed \n\n Please try again');
            }
            else if( jsondata.txStatus == "CANCELLED" ) {
                Toast.show(jsondata.txStatus);
                setErrMsg('Payment cancelled \n\n Please try again');
            }
            else {
                Toast.show(jsondata.txStatus);
                setErrMsg('Payment confirmation failed');
            }

            setShowPaymentFailedDialog(true);
            setTimeout ( () => {
                navigation.goBack();
                setShowPaymentFailedDialog(false);
            }, 3000)
        }
    }

    const requestPaymentConfirmation = () => {
        const onSuccess = ({ data }) => {   // And also succeeded from our server (confirmation api, duplicated check)
            setLoading(false);
            console.log(data);
            Toast.show("Payment successfully completed");

            setShowPaymentSuccessDialog(true);
            setTimeout ( () => {
                navigation.popToTop();
                navigation.navigate('Home');
                setShowPaymentSuccessDialog(false);
            }, 3000)
        }
        const onFailure = error => {    // succeeded from Cashfree server but failed from our server(Network error)
            console.log(error);
            setLoading(false);

            setErrMsg('Payment confirmation failed');
            setShowPaymentFailedDialog(true);
            setTimeout ( () => {
                navigation.goBack();
                setShowPaymentFailedDialog(false);
            }, 3000)
        }

        const payload = {
            "orderid": jsondata.orderId,
            "orderamount": jsondata.orderAmount,
            "referenceid": jsondata.referenceId
        }

        setLoading(true);
        setConfirmation(true);
        CASHFREEAPIKit.post('/transaction/status/confirmation/user', payload)
        .then(onSuccess)
        .catch(onFailure);
    }

    return (
        <>
        <Spinner
          visible={loading} size="large" style={styles.spinnerStyle} />
        {
            token == undefined ? 
                <Text style={styles.errMsg}>{errMsg}</Text>
            :
            <View style={styles.container}>
                {/* <CashfreePG
                    appId={order.appId}
                    orderId={order.orderId}
                    orderAmount ={order.orderAmount}
                    orderCurrency = "INR"
                    orderNote = "This is an order note"
                    source = "reactsdk" // important!! (only use this "reactsdk")
                    customerName = {order.customerName}
                    customerEmail = {order.customerEmail}
                    customerPhone = {order.customerPhone}
                    notifyUrl = {order.notifyUrl}
                    paymentModes = ""
                    env = "test"
                    card_number= "4111111111111111"
                    card_holder=  "Test"
                    card_cvv= "123"
                    card_expiryMonth="07"
                    card_expiryYear="2023"
                    tokenData = {order.tokenData}

                    callback = {(eventData)=>{
                        console.log('===================== event data in callback function ================ ')
                        console.log(eventData);
                        setEventData(eventData);
                    }}
                    //paymentOption = "nb" //nb,card,upi,wallet
                    paymentCode = "3333"
                    //paymentCode = "4001"
                    upi_vpa="testsuccess@gocash"
                /> */}
                {showPaymentSuccess ? 
                    <View style={{flex: 1, flexDirection: "column"}}>
                        <View style={styles.imageConfirm}>
                            <Image
                                source={icon_confirmation}
                                style={styles.image}
                            />
                        </View>
                        <View style={styles.textSuccess}>
                            <Text style={{marginTop: 50, fontSize: 24, fontWeight: "bold", color: 'rgba(0,182,0,1)', textAlign: "center"}}>
                                PAYMENT SUCCESSFULL
                            </Text>
                        </View>
                    </View>
                    // <Text style={styles.errMsg}>{responseData}</Text>
                : null
                }
                {showPaymentFailed ? 
                    <View style={{flex: 1, flexDirection: "column"}}>
                        <View style={styles.imageConfirm}>
                            <Image
                                source={icon_error}
                                style={styles.image}
                            />
                        </View>
                        <View style={styles.textSuccess}>
                            <Text style={{marginTop: 50, fontSize: 24, fontWeight: "bold", color: 'rgba(0,0,0,0.5)', textAlign: "center"}}>
                                {errMsg}
                            </Text>
                        </View>
                    </View>
                    // <Text style={styles.errMsg}>{responseData}</Text>
                : null
                }
                
            </View>
        }
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
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height/2,
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
    }
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

export default CashfreePayment;