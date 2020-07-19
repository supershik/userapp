import React, { useEffect, useState, useContext } from 'react';
import { View, TextInput, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-simple-toast';
import { validateAll } from 'indicative/validator';
import USERAPIKit, { setUserClientToken, setShopClientToken, setCashFreeToken } from '../../utils/apikit';
import { colors } from '../../res/style/colors'
import Spinner from 'react-native-loading-spinner-overlay';
import Logo from "../../res/assets/images/logo.png"
import { Dialog, ConfirmDialog } from 'react-native-simple-dialogs';
import auth from '@react-native-firebase/auth';

import {
    Input,
    Button,
    Icon
} from 'react-native-elements';
import { AuthContext } from '../../utils/authContext';

const LoginScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [mobile, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [SignUpErrors, setSignUpErrors] = useState({});
    const [isPassword, setIsPassword] = useState(true);
    const [icEye, setIcEye] = useState('visibility');
    const { signIn, signUp } = useContext(AuthContext);

    const [isVerifyCodeDialog, setVerifyCodeDialog] = useState(false);
    const [verifyCode, setVerifyCode] = useState('');
    const [isForgotDialog, setForgotDialog] = useState(false);
    const [verificationId, setVerificationId] = useState('');
    const [autoVerified, setAutoVerified] = useState(false);
    const [dialing] = useState('+91');
    const [newPassword, setNewPassword] = useState('');
    const [newPassword2, setNewPassword2] = useState('');

    const handleSignIn = () => {
        // https://indicative.adonisjs.com
        const rules = {
            mobile: 'required|min:8',
            password: 'required|min:6',
        };

        const data = {
            mobile: mobile,
            password: password
        };

        const messages = {
            required: field => `${field} is required`,
            'password.min': 'Please enter a password',
            'mobile': 'Please enter a valid phone number',
        };

        validateAll(data, rules, messages)
            .then(() => {
                console.log('success sign in');
                const payload = {mobile, password};
                const onSuccess = ({ data }) => {
                    setLoading(false); 
                    setUserClientToken(data.token);
                    setShopClientToken(data.token);
                    setCashFreeToken(data.token);
                    signIn({ mobile, password, token: data.token });
                }
                const onFailure = error => {
                    setLoading(false);
                    console.log(error && error.response);
                    Toast.show('Invalid email or password');
                }
                setLoading(true);
                USERAPIKit.post('/user/login', payload)
                    .then(onSuccess)
                    .catch(onFailure);                
            })
            .catch(err => {
                const formatError = {};
                err.forEach(err => {
                    formatError[err.field] = err.message;
                });
                setSignUpErrors(formatError);
            });
    };

    const changePwdType = () => {
        if(!isPassword)
            setIcEye("visibility");
        else
            setIcEye("visibility-off");
        setIsPassword(!isPassword);
    };

    const requestPasswordReset = () => {
        console.log('success sign in');
        let password = newPassword;
        let code = verifyCode;
        let verificationid = verificationId;
        const payload = { mobile, password, verificationid, code};
        console.log(payload);
        const onSuccess = ({ data }) => {
            setLoading(false);
            console.log('------Password reset sucessful-----------');
            setForgotDialog(false);
            Toast.show("Password updated successfully");
        }
        const onFailure = error => {
            setLoading(false);
            Toast.show("Invalid authentication, Please try again");
        }
        setLoading(true);
        USERAPIKit.post('/user/password/reset', payload)
            .then(onSuccess)
            .catch(onFailure);
    }

    const onPressPasswordReset = () => {
        if( verifyCode.length < 1 ) {
            Toast.show('Enter the verification code');
            return;
        }
        if(newPassword.length < 1 || newPassword2.length < 1) {
            Toast.show('Enter a password')
            return;
        }
        if(newPassword.length < 1 || newPassword2.length < 1) {
            Toast.show('Enter a password')
            return;
        }
        if(newPassword != newPassword2) {
            Toast.show('Password is not matched');
            return;
        }

        requestPasswordReset();
    };
    
    const onPressForgotPassword = () => {
        
        if (mobile.length < 1) {
            Toast.show("Input your mobile number")
            return;
        }
        if (mobile.length < 10) {
            Toast.show("Input mobile number enoughly")
            return;
        }

        //check whether mobile number does not exist in our server or not
        const onSuccessMobile = ({ data }) => {
            setLoading(false);

            Toast.show(data.message);
        }
        const onFailureMobile = error => {
            setLoading(false);
            if(error.toString().includes('409')) {  // mobile already is registered
                setVerifyCode('');
                setVerificationId('');
                setAutoVerified(false);
                setNewPassword("");
                setNewPassword2("");
                sendPhoneNumberToFirebase(mobile);
            }
            //Toast.show("Mobile is registered");
            //Toast.show(error & error.response.data.message);
        }

        setLoading(true);
        console.log('------------------------');
        USERAPIKit.get('/validation/mobile/' + mobile)
            .then(onSuccessMobile)
            .catch(onFailureMobile);
    }

    const sendPhoneNumberToFirebase = (mobile) => {
        if (mobile.length < 10)
            return;

        let mobileNumber = dialing + mobile;
        
        setLoading(true);
        auth().verifyPhoneNumber(mobileNumber).on('state_changed', (phoneAuthSnapshot) => {

            setLoading(false);
            switch (phoneAuthSnapshot.state) {
                case auth.PhoneAuthState.CODE_SENT: // or 'sent'
                    console.log('code sent');
                    console.log(phoneAuthSnapshot);

                    if (autoVerified == false) {
                        setVerificationId(phoneAuthSnapshot.verificationId);
                        //setVerifyCodeDialog(true); // verifycode dialog
                        setForgotDialog(true);
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
                    if(phoneAuthSnapshot.code == null || phoneAuthSnapshot.code == undefined)
                    {
                        //Toast.show('Auto verified!, code =   NULL');
                        setVerifyCode("");
                    }
                    else {
                        //Toast.show('Auto verified!, code = ' + phoneAuthSnapshot.code);   
                        setVerifyCode(phoneAuthSnapshot.code);
                    }
                    if(phoneAuthSnapshot.verificationId == null || phoneAuthSnapshot.verificationId == undefined)
                    {
                        //Toast.show('Auto verified!, code =   NULL');    
                        setVerificationId("");
                    }
                    else {
                        //Toast.show('Auto verified!, VerificationID = ' + phoneAuthSnapshot.verificationId);    
                        setVerificationId(phoneAuthSnapshot.verificationId);
                    }

                    setForgotDialog(true);
                    setAutoVerified(true);
                    //setVerifyCodeDialog(false);
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

    const onPressVerify = async () => {

        if( verifyCode.length < 1 ) {
            Toast.show('Input the verification code.')
            return;
        }
        
        console.log(verifyCode);
        setForgotDialog(true);
        //confirmCode(verificationId, verifyCode);
    }

    // const confirmCode = (verificationId, code) => {
    //     setLoading(true);

    //     console.log("-------------------------------");
    //     console.log(verificationId);

    //     const credential = auth.PhoneAuthProvider.credential(
    //         verificationId,
    //         code
    //     );

    //     auth().signInWithCredential(credential)
    //         .then((userCredential) => {
    //             // successful
    //             setLoading(false);
    //             //Toast.show('Verified!');
    //             console.log(userCredential);

    //             if( autoVerified == false ) {
    //                 setForgotDialog(true);
    //                 setAutoVerified(true);
    //                 setVerifyCodeDialog(false);
    //             }

    //             return auth().signOut().catch(err => { console.error('Ignored sign out error: ', err)});
    //         })
    //         .catch((error) => {
    //             // failed
    //             setLoading(false);
    //             //setVerifyCodeDialog(false);
    //             let userErrorMessage;
    //             if (error.code === 'auth/invalid-verification-code') {
    //                 userErrorMessage = 'Invalid Verification Code.'
    //             } else if (error.code === 'auth/user-disabled') {
    //                 userErrorMessage = 'Sorry, this phone number has been blocked.';
    //             } else if (error.toString().includes('[auth/session-expired]'))
    //             {
    //                 userErrorMessage = 'Sorry, that session was expired. Try again'
    //                 // if( autoVerified == false ) {
    //                 //     //Toast.show('Verified!');
    //                 //     setVerifyCodeDialog(false);
    //                 //     requestRegister();
    //                 //     setAutoVerified(true);

    //                 //     return;
    //                 // }
    //             } else {
    //                 // userErrorMessage = 'Sorry, we couldn\'t verify that phone number at the moment. '
    //                 // + 'Please try again later. '
    //                 // + '\n\nIf the issue persists, please contact support.'
    //                 userErrorMessage = error.toString();
    //             }
    //             console.log(error);
    //             Toast.show(userErrorMessage);
    //         })
    // }

    return (
        <View style={styles.container}>
            <Spinner
                visible={loading} size="large" style={styles.spinnerStyle} />
            <Image style={styles.logoContainer} source={Logo} />
            <View style={styles.inputView}>
                <Input
                    label={'Mobile'}
                    placeholder="Mobile"
                    value={mobile}
                    keyboardType="phone-pad"
                    onChangeText={setMobileNumber}
                    maxLength={10}
                    errorStyle={{ color: 'red' }}
                    errorMessage={SignUpErrors ? SignUpErrors.mobile : null}
                />
                <View style={styles.password}>
                    <Input
                        label={'Password'}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={isPassword}
                        errorStyle={{ color: 'red' }}
                        maxLength={50}
                        // errorMessage={SignUpErrors ? SignUpErrors.password : null}
                    />
                    <View  style = {styles.icon}>
                        <Icon 
                            name={icEye}
                            color={'#222222'}
                            onPress={changePwdType}
                        />
                    </View>
                </View>
                <TouchableOpacity 
                    style={{flexDirection: "row", marginRight: 10, marginTop: -15, alignSelf: "flex-end"}}
                    onPress={() => onPressForgotPassword()}>
                    <Text
                        style={styles.forgotPassword}>
                        Forgot password?
                    </Text>
                </TouchableOpacity>
                <Button
                    buttonStyle={styles.loginButton}
                    title="Login"
                    onPress={() => handleSignIn()}
                />
                {/* <Button
                    buttonStyle={styles.registerButton}
                    title="Register"
                    onPress={() => signUp()}
                /> */}
                <TouchableOpacity 
                    onPress={() => signUp()}>
                    <Text 
                        style={styles.underLineText}>
                        Register
                    </Text>
                </TouchableOpacity>
            </View>
            <View>
                <ConfirmDialog
                    dialogStyle = {{backgroundColor: "rgba(255,255,255,1)", borderRadius: 16, width: 290, alignSelf: "center"}}
                    titleStyle ={{textAlign: "center", marginTop : 20, fontSize: 18}}
                    title="Forgot Password?"
                    visible={isForgotDialog}
                >
                    <View style={{marginTop: 0, alignItems: "center"}}>
                        <TextInput
                            style={styles.verifyCode}
                            keyboardType={'phone-pad'}
                            label={'Code'}
                            placeholder="OTP code"
                            value={verifyCode}
                            maxLength={6}
                            onChangeText={setVerifyCode}
                        />
                        <View style={styles.newPassword}>
                            <Input
                                inputStyle={{fontSize: 16}}
                                      placeholder="New Password"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={isPassword}
                                maxLength={10}
                            />
                            <View  style = {styles.eyeicon2}>
                                <Icon 
                                    name={icEye}
                                    color={'#222222'}
                                    onPress={changePwdType}
                                />
                            </View>
                        </View>
                        <View style={styles.newPassword}>
                            <Input
                                inputStyle={{fontSize: 16}}
                                placeholder="Confirm New Password"
                                value={newPassword2}
                                onChangeText={setNewPassword2}
                                secureTextEntry={true}
                                maxLength={10}
                            />
                        </View>
                        
                        <View style={{flexDirection: 'row', marginTop: 10,  marginBottom: -30, justifyContent: "space-between"}}>
                            <Button
                                buttonStyle={{width: 70, height: 36, marginRight: 40, backgroundColor: "rgba(130, 130, 128,1)"}}
                                title="Cancel"
                                titleStyle={{fontSize: 14}}
                                onPress={() => setForgotDialog(false)}
                            />
                            <Button
                                buttonStyle={{width: 70, height: 36}}
                                title="Reset"
                                titleStyle={{fontSize: 14}}
                                onPress={() => onPressPasswordReset()}
                            />
                        </View>
                    </View>
                </ConfirmDialog>
                {/* <ConfirmDialog
                    dialogStyle={{ backgroundColor: "rgba(255,255,255,1)", borderRadius: 16, width: 260, height: 180, alignSelf: "center" }}
                    titleStyle={{ textAlign: "center", marginTop: 20, fontSize: 16 }}
                    title="Enter the verification code"
                    message="Are you sure about that?"

                    visible={isVerifyCodeDialog}
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
                                onPress={() => setVerifyCodeDialog(false)}
                            />
                            <Button
                                buttonStyle={{ width: 70, height: 36, backgroundColor: "rgba(220, 64, 64,1)" }}
                                title="Verify"
                                titleStyle={{ fontSize: 14 }}
                                onPress={() => onPressVerify()}
                            />
                        </View>
                    </View>
                </ConfirmDialog> */}
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinnerStyle: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        width: 160,
        height: 182,
        resizeMode: "stretch",
        marginVertical: 20,
    },
    inputView: {
        width: "90%",
        borderRadius: 25,
        marginBottom: 20,
        justifyContent: "center",
        padding: 20
    },
    loginButton: {
        margin: 10,
        marginTop: 30,
    },
    registerButton: {
        margin: 10,
        marginTop: 10,
    },
    forgotPassword: {
        fontSize: 14,
        textDecorationLine: 'underline',
        color: "rgba(34,137,220,1)",
    },
    underLineText: {
        fontSize: 16,
        textDecorationLine: 'underline',
        color: "rgba(34,137,220,1)",
        // fontWeight: 'bold',
        textAlign: 'center',
    },
    password: {
        position: 'relative',
    },
    icon: {
        position: 'absolute',
        top: 33,
        right: 10,
    },
    eyeicon2: {
        position: 'absolute',
        top: 15,
        right: 10,
    },
    emailAddress: {
        borderWidth: 1,
        borderColor: 'rgba(128, 128, 128, 1)',
        marginTop: 30,
        paddingLeft: 8,
        fontSize: 14,
        height: 40,
        textAlign: "center"
    },
    verifyCode: {
        borderWidth: 1,
        borderColor: 'rgba(128, 128, 128, 1)',
        marginTop: 10,
        marginBottom: 20,
        width: 100,
        paddingLeft: 8,
        fontSize: 14,
        height: 40,
        textAlign: "center"
    },
    newPassword: {
        width: 200,
    }
})
export default LoginScreen;