import React, {useEffect, useState} from 'react';
import {Text, View, TouchableOpacity, StyleSheet, Image, Dimensions, Button } from 'react-native';
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
import moment from 'moment';

const CashfreePayment = ({ navigation, route }) => {
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState('');
    const [pickDateTime] = useState(route.params.orderpickuptime);
    const [order, setOrder]  = useState({
        //appId: '19149069bd004065084653ce894191',
        // orderId: "1030",
        // orderAmount: "59",
        //source: "reactsdk", // important, only use reactsdk
        appId: "",  // obtained from server
        orderId: route.params.orderId,
        orderAmount: route.params.orderAmount.toString(),
        customerName: "",
        customerEmail: "",
        customerPhone: "",
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
          console.log('------ get token ------');
          let orderres = newOrder.orderId.split("-");
          const orderId = orderres[orderres.length-1];  // extract 1033 from VE2006-1033
          console.log(orderId);

          const onSuccess = ({ data }) => {
            setLoading(false);
            console.log(data);
            if(data.appid == undefined || data.token == undefined)
            {
                //Toast.show("Token or appId failed. \n Please try again");
                setErrMsg("Token or appId failed. \n Please try again");
                setShowPaymentFailedDialog(true);
                // setTimeout ( () => {
                //     navigation.goBack();
                //     setShowPaymentFailedDialog(false);
                // }, 3000)

                return;
            }

            const tempOrder = newOrder;
            tempOrder.tokenData = data.token;
            tempOrder.appId = data.appid;
            tempOrder.orderId = orderId;    // orderId is integer
            setOrder(tempOrder);
            setToken(data.token);   // go ahead Cashfre
            console.log('---------------------- Token successfull -------------------');
            console.log(data);
            console.log('---------------------- Cashfree data to pay -------------------');
            console.log(tempOrder);
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
            //Toast.show("Token failed. \n Please try again");
            setErrMsg("Token failed. \n Please try again");
            setShowPaymentFailedDialog(true);
            // setTimeout ( () => {
            //     navigation.goBack();
            //     setShowPaymentFailedDialog(false);
            // }, 3000)
          }
          
          setLoading(true);
         
          CASHFREEAPIKit.post('/transaction/token/'+ orderId)
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
                //Toast.show(jsondata.txStatus);
                setErrMsg('Payment failed \n\n'+ msg);

                setShowPaymentFailedDialog(true);
                // setTimeout ( () => {
                //     navigation.goBack();
                //     setShowPaymentFailedDialog(false);
                // }, 3000)
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
        console.log('---------------------- 1 -------------------');
        setToken(undefined);    // only call CashfreePG one time in render function
        console.log('---------------------- 1 -------------------');
        if( data == null || data == undefined )
            return;
        if( jsondata.txStatus == undefined || jsondata.txStatus == "" )
            return;
        if(confirmation === true)
            return;
        
        console.log('-------- confirmation --------');
        console.log(data);
        // When is succeeded from Cashfree server
        if( jsondata.txStatus == "SUCCESS") {
            requestPaymentConfirmation(jsondata);
            return;
        }
        else {
            console.log('---------------------- 6 (confirmation failed)-------------------');
            console.log(jsondata);
            if( jsondata.txStatus == "FAILED" ) {
                //Toast.show(jsondata.txStatus);
                //setErrMsg('Payment failed \n\n Please try again');
                setErrMsg(jsondata.txMsg);
            }
            else if( jsondata.txStatus == "CANCELLED" ) {
                //Toast.show(jsondata.txStatus);
                // setErrMsg('Payment cancelled \n\n Please try again');
                setErrMsg(jsondata.txMsg);
            }
            else {
                //Toast.show(jsondata.txStatus);
                // setErrMsg('Payment confirmation failed \n\n Please try again');
                setErrMsg(jsondata.txMsg);
            }

            setShowPaymentFailedDialog(true);
            // setTimeout ( () => {
            //     navigation.goBack();
            //     setShowPaymentFailedDialog(false);
            // }, 5000)
        }
    }

    const requestPaymentConfirmation = (jsondata) => {
        const onSuccess = ({ data }) => {   // And also succeeded from our server (confirmation api, duplicated check)
            setLoading(false);
            console.log('---------------------- 4 -------------------');
            console.log(data);
            //Toast.show("Payment successfully completed");

            let currentDate = new Date();
            let date = moment.utc(pickDateTime).format("YYYY-MM-DD");
            let time = moment.utc(pickDateTime).format("HH:mm:ss");
            var p1 = date.split("-");
            var p2 = time.split(":");
            var datetime = new Date(p1[0],p1[1]-1,p1[2],p2[0],p2[1],p2[2]);

            console.log('-------------- Date time -------------------');
            console.log(moment(currentDate).format("YYYY-MM-DD HH:mm:ss"));
            console.log(moment(datetime).format("YYYY-MM-DD HH:mm:ss"));
            
            var msDiff = datetime.getTime() - currentDate.getTime(); 
            var remainHoursTillCurrent = msDiff / (1000 * 60 * 60 ); // hour difference
            console.log(remainHoursTillCurrent);
            
            datetime.setHours(datetime.getHours(), datetime.getMinutes()-60, 0); // plus 30 min to current time
            let cancellationdatatime = moment(datetime).format("YYYY-MM-DD HH:mm:ss");
            let msg = "";
            if( remainHoursTillCurrent < 1 )
                msg = "Order placed successfully.\n You will be notified for order updates. \n No cancellation is allowed. \n Pickup time: " + pickDateTime;
            else
                msg = "Order placed successfully.\n You will be notified for order updates. \n Cancellation is only allowed till " + cancellationdatatime + " and 15% will be deducted for service charge, After that no cancellation is allowed. \n Pickup time: " + pickDateTime;
            
            setErrMsg(msg);
            setShowPaymentSuccessDialog(true);
            // setTimeout ( () => {
            //     navigation.popToTop();
            //     navigation.navigate('Home');
            //     setShowPaymentSuccessDialog(false);
            // }, 3000)
        }
        const onFailure = error => {    // succeeded from Cashfree server but failed from our server(Network error)
            console.log(error);
            setLoading(false);
            console.log('---------------------- 5 -------------------');
            setErrMsg('Payment confirmation failed');
            setShowPaymentFailedDialog(true);
            // setTimeout ( () => {
            //     navigation.goBack();
            //     setShowPaymentFailedDialog(false);
            // }, 3000)
        }

        const payload = {
            "orderid": jsondata.orderId,
            "orderamount": jsondata.orderAmount,
            "referenceid": jsondata.referenceId
        }

        setLoading(true);
        setConfirmation(true);
        console.log('---------------------- 3 -------------------');
        CASHFREEAPIKit.post('/transaction/status/confirmation/user', payload)
        .then(onSuccess)
        .catch(onFailure);
    }

    const onPressSuccessOK = () => {
        navigation.popToTop();
        navigation.navigate('Home');
        setShowPaymentSuccessDialog(false);
    }
    
    const onPressFailedOK = () => {
        navigation.goBack();
        setShowPaymentFailedDialog(false);
    }
    
    return (
      <>
        <Spinner
            visible={loading} size="large" style={styles.spinnerStyle} />
        { token != undefined ? 
            <View style={styles.container}>
                <CashfreePG
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
                />
            </View> : null
        }
        { showPaymentSuccess ? 
            <View style={{flex: 1, flexDirection: "column"}}>
                <View style={styles.imageConfirm}>
                    <Image
                        source={icon_confirmation}
                        style={styles.image}
                    />
                </View>
                <View style={styles.textSuccess}>
                    <Text style={{marginTop: 0, fontSize: 24, fontWeight: "bold", color: 'rgba(0,182,0,1)', textAlign: "center"}}>
                        PAYMENT SUCCESSFULL
                    </Text>
                    <Text style={{lineHeight: 25, marginTop: 20, fontSize: 16, color: 'rgba(0,0,0,1)', textAlign: "center"}}>
                        {errMsg}
                    </Text>
                    <View style={styles.buttonContainer}>
                        <Button title='Ok' onPress={onPressSuccessOK}/>
                    </View>
                </View>
            </View> : null
        }
        { showPaymentFailed ? 
            <View style={{flex: 1, flexDirection: "column"}}>
                <View style={styles.imageConfirm}>
                    <Image
                        source={icon_error}
                        style={styles.image}
                    />
                </View>
                <View style={styles.textSuccess}>
                    <Text style={{marginTop: 10, fontSize: 24, fontWeight: "bold", color: 'rgba(0,0,0,0.7)', textAlign: "center"}}>
                        PAYMENT FAILED
                    </Text>
                    <Text style={{lineHeight: 25, marginTop: 50, fontSize: 16, color: 'rgba(0,0,0,1)', textAlign: "center"}}>
                        {errMsg}
                    </Text>
                    <View style={styles.buttonContainer}>
                        <Button title='Ok' onPress={onPressFailedOK}/>
                    </View>
                </View>
            </View> : null
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
    },
    buttonContainer: {
        flex: 1,
        height: 35,
        justifyContent: 'center',
        width: 80,
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

export default CashfreePayment;