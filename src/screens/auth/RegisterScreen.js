import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-simple-toast';
import Autocomplete from 'react-native-autocomplete-input';
import USERAPIKit, { setUserClientToken, setShopClientToken } from '../../utils/apikit';
import Spinner from 'react-native-loading-spinner-overlay';
import {
    Button,
    Icon,
} from 'react-native-elements';
import auth from '@react-native-firebase/auth';
import { Dialog, ConfirmDialog } from 'react-native-simple-dialogs';
import { AuthContext } from '../../utils/authContext';

const RegisterScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [address, setAddress] = useState('');
    const [landmark, setLandmark] = useState('');
    const [city, setCity] = useState('');
    const [query, setQuery] = useState('');
    const [cityData, setCityData] = useState([]);
    const [state, setState] = useState('');
    const [pincode, setPinCode] = useState('');
    const [icEye, setIcEye] = useState('visibility');
    const [isPassword, setIsPassword] = useState(true);
    const [isPhoneVerifyDialog, setPhoneVerifyDialog] = useState(false);
    const [verifyCode, setVerifyCode] = useState('');
    const [confirm, setConfirm] = useState(null);
    const [alert, setAlert] = useState(false);
    const [verificationId, setVerificationId] = useState('');
    const [autoVerified, setAutoVerified] = useState(false);
    const [dialing] = useState('+91');

    const [errorData, setErrorData] = useState(
        {
            isValidName: true,
            isValidEmail: true,
            isValidMobile: true,
            isValidPassword: true,
            isValidAddress: true,
            email: '',
            mobile: '',
            password: '',
            name: '',
            address: '',
        });

    const { signIn, signOut } = useContext(AuthContext); // should be signUp

    const handleSignUp = () => {
        // https://indicative.adonisjs.com
        if (onNameChanged() == false){
            Toast.show('Enter your name');
            return;
        }
        if (checkMobileNumber() == false){
            Toast.show('Please check your mobile number');
            return;
        }
        if (onPasswordChanged() == false){
            Toast.show('Please check your password');
            return;
        }
        if (onAddressChanged() == false) {
            Toast.show('Please check your address');
            return;
        }
        setVerifyCode('');
        setVerificationId('');
        setAutoVerified(false);
        sendPhoneNumber(dialing + mobile);
    };

    useEffect(() => { }, [errorData]);
    const validateEmail = email => {
        var re = /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    const onNameChanged = () => {
        if (name.length < 3) {
            setErrorData({
                ...errorData,
                isValidName: false,
                name: 'Enter the valid name',
            });
            return false;
        }
        else {
            setErrorData({
                ...errorData,
                isValidName: true
            });
            return true;
        }
    }
    const onMobileChanged = () => {
        if (mobile.length >= 8) {
            setErrorData({
                ...errorData,
                isValidMobile: true
            });
            const onSuccessMobile = ({ data }) => {
                setErrorData({
                    ...errorData,
                    isValidMobile: true,
                });
                setLoading(false);
            }
            const onFailureMobile = error => {
                setErrorData({
                    ...errorData,
                    isValidMobile: false,
                    mobile: 'Already existing mobile',
                });
                setLoading(false);
            }
            setLoading(true);
            USERAPIKit.get('/validation/mobile/' + mobile)
                .then(onSuccessMobile)
                .catch(onFailureMobile);
        }
        else {
            setErrorData({
                ...errorData,
                isValidMobile: false,
                mobile: 'Enter the valid phone number',
            });
        }
    }
    const checkMobileNumber = () => {
        if (mobile.length >= 8) {
            setErrorData({
                ...errorData,
                isValidMobile: true
            });
            return true;
        }
        else {
            setErrorData({
                ...errorData,
                isValidMobile: false,
                mobile: 'Enter the valid phone number',
            });
            return false;
        }
    }
    const checkEmail = () => {
        if (validateEmail(email)) {
            setErrorData({
                ...errorData,
                isValidEmail: true
            });
            return true;
        }
        else {
            setErrorData({
                ...errorData,
                isValidEmail: false,
                email: 'Enter the valid email',
            });
            return false;
        }
    }
    const onEmailChanged = () => {
        if (validateEmail(email)) {
            setErrorData({
                ...errorData,
                isValidEmail: true
            });
            const onSuccessEmail = ({ data }) => {
                setErrorData({
                    ...errorData,
                    isValidEmail: false,
                    email: 'Already existing email',
                });
                setLoading(false);
            }
            const onFailureEmail = error => {
                setErrorData({
                    ...errorData,
                    isValidEmail: true,
                });
                setLoading(false);
            }
            setLoading(true);
            USERAPIKit.get('/validation/email/' + email)
                .then(onSuccessEmail)
                .catch(onFailureEmail);
        }
        else {
            if (email.length > 0) {
                setErrorData({
                    ...errorData,
                    isValidEmail: false,
                    email: 'Enter the valid email',
                });
            }
            else {
                setErrorData({
                    ...errorData,
                    isValidEmail: true,
                });
            }
        }
    }
    const onPasswordChanged = () => {
        if (password.length < 5) {
            setErrorData({
                ...errorData,
                isValidPassword: false,
                password: 'Password length should be greater than 5',
            });
            return false;
        }
        else {
            setErrorData({
                ...errorData,
                isValidPassword: true
            });
            return true;
        }
    }
    const onAddressChanged = () => {
        if (address.length < 3) {
            setErrorData({
                ...errorData,
                isValidAddress: false,
                address: 'Enter the valid address',
            });
            console.log(errorData);
            return false;
        }
        else {
            setErrorData({
                ...errorData,
                isValidAddress: true
            });
            return true;
        }
    }
    const onChangeCity = (city) => {
        console.log(city);
        setCity(city);
        const onSuccessEmail = ({ data }) => {
            setCityData(data.usercities);
        }
        const onFailureEmail = error => {
            setCityData([]);
        }
        USERAPIKit.get('/validation/city/' + city)
            .then(onSuccessEmail)
            .catch(onFailureEmail);
    }
    const onSelectedCity = (item) => {
        setCity(item.city);
        setQuery(item.city);
        setState(item.state);
        setPinCode(item.pincode.toString());
        setCityData([]);
    }
    
    const changePwdType = () => {
        if (!isPassword)
            setIcEye("visibility");
        else
            setIcEye("visibility-off");
        setIsPassword(!isPassword);
    };
    const sendPhoneNumber = (mobile) => {
        if (mobile.length < 10)
            return;

        setLoading(true);
        auth().verifyPhoneNumber(mobile).on('state_changed', (phoneAuthSnapshot) => {

            setLoading(false);
            switch (phoneAuthSnapshot.state) {
                case auth.PhoneAuthState.CODE_SENT: // or 'sent'
                    console.log('code sent');
                    console.log(phoneAuthSnapshot);

                    if (autoVerified == false) {
                        setVerificationId(phoneAuthSnapshot.verificationId);
                        setPhoneVerifyDialog(true);
                    }
                    break;
                case auth.PhoneAuthState.ERROR: // or 'error'
                    console.log('verification error');
                    console.log(phoneAuthSnapshot);
                    //Toast.show('verification error');
                    break;
                // ---------------------
                // ANDROID ONLY EVENTS
                // ---------------------
                case auth.PhoneAuthState.AUTO_VERIFY_TIMEOUT: // or 'timeout'
                    console.log('auto verify on android timed out');
                    console.log(phoneAuthSnapshot);
                    //Toast.show('auto verify timed out');
                    break;
                case auth.PhoneAuthState.AUTO_VERIFIED: // or 'verified'
                    console.log('auto verified on android');
                    console.log(phoneAuthSnapshot);
                    const { verificationId, code } = phoneAuthSnapshot;
                    //Toast.show('Auto verified');
                    requestRegister();
                    setAutoVerified(true);
                    setPhoneVerifyDialog(false);
                    break;
            }
        }, (error) => {
            console.log('something error');
            //if( error.toString().includes('[auth/app-not-authorized]') )
            Toast.show(error.toString());
            console.log(error);
        }, (phoneAuthSnapshot) => {
            console.log(phoneAuthSnapshot);
        });
    }
    const requestRegister = () => {
        console.log('success sign in');
        const payload = { mobile, password, email, name, address, landmark, city, state, pincode };
        const onSuccess = ({ data }) => {
            setLoading(false);
            if (data.hasError == false) {
                Toast.show('Successfully registered');
                signOut();
            }
            else
                Toast.show('Failed to register');
        }
        const onFailure = error => {
            setLoading(false);
            console.log(error && error.response);
            Toast.show('Failed to register');
        }
        setLoading(true);
        USERAPIKit.post('/user/signup', payload)
            .then(onSuccess)
            .catch(onFailure);
    }
    const onPressVerify = async () => {

        if( verifyCode.length < 1 ) {
            Toast.show('Input the verification code.')
            return;
        }
        
        console.log(verifyCode);
        confirmCode(verificationId, verifyCode);
    }

    const confirmCode = (verificationId, code) => {
        setLoading(true);

        const credential = auth.PhoneAuthProvider.credential(
            verificationId,
            code
        );

        auth().signInWithCredential(credential)
            .then((userCredential) => {
                // successful
                setLoading(false);
                //Toast.show('Verified!');
                console.log(userCredential);

                if( autoVerified == false ) {
                    setPhoneVerifyDialog(false);
                    requestRegister();
                    setAutoVerified(true);
                }

                return auth().signOut().catch(err => { console.error('Ignored sign out error: ', err)});
            })
            .catch((error) => {
                // failed
                setLoading(false);
                //setPhoneVerifyDialog(false);
                let userErrorMessage;
                if (error.code === 'auth/invalid-verification-code') {
                    userErrorMessage = 'Invalid Verification Code.'
                } else if (error.code === 'auth/user-disabled') {
                    userErrorMessage = 'Sorry, this phone number has been blocked.';
                } else if (error.toString().includes('[auth/session-expired]'))
                {
                    userErrorMessage = 'Sorry, that session was expired. Try again'
                    // if( autoVerified == false ) {
                    //     //Toast.show('Verified!');
                    //     setPhoneVerifyDialog(false);
                    //     requestRegister();
                    //     setAutoVerified(true);

                    //     return;
                    // }
                } else {
                    // userErrorMessage = 'Sorry, we couldn\'t verify that phone number at the moment. '
                    // + 'Please try again later. '
                    // + '\n\nIf the issue persists, please contact support.'
                    userErrorMessage = error.toString();
                }
                console.log(error);
                Toast.show(userErrorMessage);
            })
      }
    return (
        <View style={styles.container}>
            <Spinner
                visible={loading} size="large" style={styles.spinnerStyle} />
            <ScrollView
                style={styles.scrollView}>
                <View style={styles.inputView}>
                    <View
                        style={{ flexDirection: 'column', marginTop: 10 }}>
                        <Text>
                            Name
                        </Text>
                        <TextInput
                            style={styles.textInput}
                            label={'Name'}
                            placeholder="Name"
                            value={name}
                            onChangeText={setName}
                            onBlur={() => onNameChanged()}
                        />
                        {
                            errorData.isValidName ? null : <Text style={{ color: 'red' }}>{errorData.name}</Text>
                        }
                    </View>
                    <View
                        style={{ flexDirection: 'column', marginTop: 10 }}>
                        <Text>
                            Email
                        </Text>
                        <TextInput
                            style={styles.textInput}
                            label={'Email'}
                            placeholder="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            onBlur={() => onEmailChanged()}
                        />
                        {
                            errorData.isValidEmail ? null : <Text style={{ color: 'red' }}>{errorData.email}</Text>
                        }
                    </View>
                    <View
                        style={{ flexDirection: 'column', marginTop: 10 }}>
                        <Text>
                            Mobile
                        </Text>
                        <TextInput
                            underlineColorAndroid='transparent'  
                            keyboardType={'phone-pad'}
                            style={styles.textInput}
                            label={'Mobile'}
                            placeholder="Mobile Number"
                            value={mobile}
                            onChangeText={setMobileNumber}
                            maxLength = {10}
                            onBlur={() => onMobileChanged()}
                        />
                        {
                            errorData.isValidMobile ? null : <Text style={{ color: 'red' }}>{errorData.mobile}</Text>
                        }
                    </View>
                    <View
                        style={{ flexDirection: 'column', marginTop: 10 }}>
                        <Text>
                            Password
                        </Text>
                        <View style={styles.password}>
                            <TextInput
                                style={styles.textInput}                            
                                label={'Password'}
                                placeholder="Password"
                                value={password}
                                maxLength={50}
                                onChangeText={setPassword}
                                secureTextEntry={isPassword}
                                onBlur={() => onPasswordChanged()}
                            />
                            <View style={styles.icon}>
                                <Icon
                                    name={icEye}
                                    color={'#222222'}
                                    onPress={changePwdType}
                                />
                            </View>
                        </View>
                        {
                            errorData.isValidPassword ? null : <Text style={{ color: 'red' }}>{errorData.password}</Text>
                        }
                    </View>
                    <View
                        style={{ flexDirection: 'column', marginTop: 10 }}>
                        <Text>
                            Address
                        </Text>
                        <TextInput
                            style={styles.textInput}
                            label={'Landmark'}
                            placeholder="Address"
                            value={address}
                            onChangeText={setAddress}
                            onBlur={() => onAddressChanged()}
                        />
                        {
                            errorData.isValidAddress ? null : <Text style={{ color: 'red' }}>{errorData.address}</Text>
                        }
                    </View>
                    <View
                        style={{ flexDirection: 'column', marginTop: 10 }}>
                        <Text>
                            Landmark
                        </Text>
                        <TextInput
                            style={styles.textInput}
                            label={'Landmark'}
                            placeholder="Landmark"
                            value={landmark}
                            onChangeText={setLandmark}
                        />
                    </View>
                    <View
                        style={{ flexDirection: 'column', marginTop: 10 }}>
                        <Text>
                            City
                        </Text>
                        <Autocomplete
                            style={styles.textInput}
                            label={'City'}
                            placeholder="City"
                            data={cityData}
                            defaultValue={query}
                            value={city}
                            onChangeText={text => onChangeCity(text)}
                            renderItem={({ item, i }) => (
                                <TouchableOpacity onPress={() => onSelectedCity(item)}>
                                    <Text>{item.city}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                    <View
                        style={{ flexDirection: 'column', marginTop: 10 }}>
                        <Text>
                            State
                        </Text>
                        <TextInput
                            style={styles.textInput}
                            label={'State'}
                            placeholder="State"
                            value={state}
                            onChangeText={setState}
                        />
                    </View>
                    <View
                        style={{ flexDirection: 'column', marginTop: 10 }}>
                        <Text>
                            Pincode
                        </Text>
                        <TextInput
                            style={styles.textInput}
                            label={'Pincode'}
                            placeholder="Pincode"
                            value={pincode}
                            onChangeText={setPinCode}
                        />
                    </View>

                    <Button
                        buttonStyle={styles.registerButton}
                        backgroundColor="#03A9F4"
                        title="Register"
                        onPress={() => handleSignUp()}
                    />
                    <View style={{flexDirection: 'row', alignSelf: "center", marginBottom: 80}}>
                        <Text style = {{textAlign: "center", color: "rgba(64,64,64,1)"}}>Already Registered? </Text>
                        <TouchableOpacity 
                            onPress={() => signIn()}>
                            <Text
                                style={styles.underLineText}>
                                Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>  
                <View>
                    <ConfirmDialog
                        dialogStyle={{ backgroundColor: "rgba(255,255,255,1)", borderRadius: 16, width: 260, height: 180, alignSelf: "center" }}
                        titleStyle={{ textAlign: "center", marginTop: 20, fontSize: 16 }}
                        title="Enter the verification code"
                        message="Are you sure about that?"

                        visible={isPhoneVerifyDialog}
                    >
                        <View style={{ marginTop: -30, alignItems: "center" }}>
                            <TextInput
                                style={styles.verifyCode}
                                keyboardType={'phone-pad'}
                                label={'Code'}
                                placeholder="code"
                                value={verifyCode}
                                maxLength={6}
                                onChangeText={setVerifyCode}
                            />
                            <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: "space-between" }}>
                                <Button
                                    buttonStyle={{ width: 70, height: 36, marginRight: 40, backgroundColor: "rgba(130, 130, 128,1)" }}
                                    title="Cancel"
                                    titleStyle={{ fontSize: 14 }}
                                    onPress={() => setPhoneVerifyDialog(false)}
                                />
                                <Button
                                    buttonStyle={{ width: 70, height: 36, backgroundColor: "rgba(220, 64, 64,1)" }}
                                    title="Verify"
                                    titleStyle={{ fontSize: 14 }}
                                    onPress={() => onPressVerify()}
                                />
                            </View>

                        </View>
                    </ConfirmDialog>
                </View>

                <Dialog
                    dialogStyle={{ backgroundColor: "rgba(255,255,255,1)", borderRadius: 16 }}
                    titleStyle={{ textAlign: "center", marginVertical: 50 }}
                    title="OTP Error Report. This Alert will be removed in the next version."
                    message="Are you sure about that?"
                    visible={alert}
                    onTouchOutside={() => setAlert(false)}
                    positiveButton={{
                        title: "YES",
                        onPress: () => setAlert(false)
                    }}
                >
                    <View>
                        <View style={{ flexDirection: 'row', marginHorizontal: 0, marginTop: 80, marginBottom: -20, justifyContent: "space-evenly" }}>
                            <Button
                                buttonStyle={{ width: 80, backgroundColor: "rgba(220, 64, 64,1)" }}
                                title="Close"
                                onPress={() => setAlert(false)}
                            />
                        </View>

                    </View>
                </Dialog>

        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
    },
    spinnerStyle: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        marginTop: 50,
    },
    inputView: {
        borderRadius: 25,
        marginBottom: 20,
        justifyContent: "center",
        paddingLeft: 30,
        paddingRight: 30,
    },
    loginButton: {
        margin: 10,
        marginTop: 30,
    },
    registerButton: {
        margin: 10,
        marginTop: 30,
    },
    textInput: {
        borderWidth: 1,
        borderColor: 'gray',
        paddingLeft: 8,
        height: 40,
        textAlignVertical: "center"
    },
    password: {
        position: 'relative',
    },
    icon: {
        position: 'absolute',
        top: 5,
        right: 10,
    },
    verifyCode: {
        borderWidth: 1,
        borderColor: 'rgba(128, 128, 128, 1)',
        marginTop: 30,
        width: 100,
        paddingLeft: 8,
        fontSize: 14,
        height: 40,
        textAlign: "center"
    },
    underLineText: {
        fontSize: 14,
        textDecorationLine: 'underline',
        color: "rgba(34,137,220,1)",
        // fontWeight: 'bold',
        textAlign: 'center',
    },

})
export default RegisterScreen;