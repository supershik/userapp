import React, { useEffect, useState, useContext } from 'react';
import { View, TextInput, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-simple-toast';
import { validateAll } from 'indicative/validator';
import USERAPIKit, { setUserClientToken, setShopClientToken, setCashFreeToken } from '../../utils/apikit';
import { colors } from '../../res/style/colors'
import Spinner from 'react-native-loading-spinner-overlay';
import Logo from "../../res/assets/images/logo.png"
import { Dialog, ConfirmDialog } from 'react-native-simple-dialogs';

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
    const [email, setEmail] = useState('');
    const [isForgotDialog, setForgotDialog] = useState(false);
    const [errorData, setErrorData] = useState(
        {
            isValidEmail: true,
            email: '',
        });

    const handleSignIn = () => {
        // https://indicative.adonisjs.com
        const rules = {
            mobile: 'required|min:8',
        };

        const data = {
            mobile: mobile,
            password: password
        };

        const messages = {
            required: field => `${field} is required`,
            'username.alpha': 'Username contains unallowed characters',
            'mobile.min': 'Please enter a valid phone number',
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

    const sendEmail = () => {
        if(errorData.isValidEmail == false)
        {
            Toast.show('Enter the valid email')
            return;
        }
        setForgotDialog(false);

    };
    
    const validateEmail = email => {
        var re = /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    const onEmailChanged = () => {
        if (validateEmail(email)) {
            setErrorData({
                ...errorData,
                isValidEmail: true
            });
        }
        else {
            if(email.length > 0){
                setErrorData({
                    ...errorData,
                    isValidEmail: false,
                    email: 'Enter the valid email',
                }); 
                return false;
            }
            if(email.length < 1){
                setErrorData({
                    ...errorData,
                    isValidEmail: false,
                    email: 'Enter your email',
                }); 
                return false;
            }
            else{
                setErrorData({
                    ...errorData,
                    isValidEmail: true,
                });
                return true;
            }
        }
    };

    const onPressForgotPassword = () => {
        setEmail('');
        setForgotDialog(true);
    }
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
                    dialogStyle = {{backgroundColor: "rgba(255,255,255,1)", borderRadius: 16, width: 260, height: 180, alignSelf: "center"}}
                    titleStyle ={{textAlign: "center", marginTop : 20, fontSize: 16}}
                    title="Forgot Password?"
                    message="Enter your email address to request a password reset."
                    
                    visible={isForgotDialog}
                >
                    <View style={{marginTop: -30, alignItems: "center"}}>
                        <TextInput
                            style={styles.emailAddress}
                            label={'Email'}
                            placeholder="Enter your emial address"
                            value={email}
                            maxLength = {50}
                            onChangeText={setEmail}
                            onBlur={() => onEmailChanged()}
                        />
                        {
                            errorData.isValidEmail ? null : <Text style={{ color: 'red' }}>{errorData.email}</Text>
                        }
                        <View style={{flexDirection: 'row', marginTop: 10, justifyContent: "space-between"}}>
                            <Button
                                buttonStyle={{width: 70, height: 36, marginRight: 40, backgroundColor: "rgba(130, 130, 128,1)"}}
                                title="Cancel"
                                titleStyle={{fontSize: 14}}
                                onPress={() => setForgotDialog(false)}
                            />
                            <Button
                                buttonStyle={{width: 70, height: 36, backgroundColor: "rgba(220, 64, 64,1)"}}
                                title="Request"
                                titleStyle={{fontSize: 14}}
                                onPress={() => sendEmail()}
                            />
                        </View>
                        
                    </View>
                </ConfirmDialog>
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
    emailAddress: {
        borderWidth: 1,
        borderColor: 'rgba(128, 128, 128, 1)',
        marginTop: 30,
        paddingLeft: 8,
        fontSize: 14,
        height: 40,
        textAlign: "center"
    }
})
export default LoginScreen;