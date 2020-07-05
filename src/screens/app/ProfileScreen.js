import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage'
import Toast from 'react-native-simple-toast';
import Autocomplete from 'react-native-autocomplete-input';
import USERAPIKit, { setUserClientToken } from '../../utils/apikit';
import Spinner from 'react-native-loading-spinner-overlay';
import {
    Button
} from 'react-native-elements';

const ProfileScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [landmark, setLandmark] = useState('');
    const [city, setCity] = useState('');
    const [query, setQuery] = useState('');
    const [cityData, setCityData] = useState([]);
    const [state, setState] = useState('');
    const [pincode, setPinCode] = useState('');

    const [errorData, setErrorData] = useState(
        {
            isValidName: true,
            isValidEmail: true,
            isValidAddress: true,
            email: '',
            name: '',
            mobile: '',
            address: '',
        });

    const handleUpdate = () => {
        const payload = { email, name, address, landmark, city, state, pincode };
        const onSuccess = ({ data }) => {
            setLoading(false);
            Toast.show('Successfully updated.');
        }
        const onFailure = error => {
            setLoading(false);
            console.log(error && error.response);
            Toast.show('Failed to update');
        }
        setLoading(true);
        USERAPIKit.patch('/user/update', payload)
            .then(onSuccess)
            .catch(onFailure)
    };

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
                    setName(data.name);
                    setEmail(data.email);
                    setAddress(data.address);
                    setLandmark(data.landmark);
                    setState(data.state);
                    setCity(data.city);
                    setPinCode(data.pincode.toString());
                }
                const onFailure = error => {
                    console.log(error);
                    setLoading(false);
                }
                setLoading(true);
                USERAPIKit.get('/user/get')
                    .then(onSuccess)
                    .catch(onFailure);
            }
            else {

            }
        };
        bootstrapAsync();

    }, []);

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
        }
        else {
            setErrorData({
                ...errorData,
                isValidName: true
            });
            console.log(errorData);
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
                    email: 'Already existing',
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
            setErrorData({
                ...errorData,
                isValidEmail: false,
                email: 'Enter the valid email',
            });

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
        }
        else {
            setErrorData({
                ...errorData,
                isValidAddress: true
            });
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
                            style={{ borderWidth: 1, borderColor: 'gray', paddingLeft: 8 }}
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
                            style={{ borderWidth: 1, borderColor: 'gray', paddingLeft: 8 }}
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
                            Address
                        </Text>
                        <TextInput
                            style={{ borderWidth: 1, borderColor: 'gray', paddingLeft: 8 }}
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
                            style={{ borderWidth: 1, borderColor: 'gray', paddingLeft: 8 }}
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
                            style={{ borderWidth: 1, borderColor: 'gray', paddingLeft: 8 }}
                            label={'City'}
                            placeholder="City"
                            data={cityData}
                            defaultValue={query}
                            value={city}
                            onChangeText={text=> onChangeCity(text)}
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
                            style={{ borderWidth: 1, borderColor: 'gray', paddingLeft: 8 }}
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
                            style={{ borderWidth: 1, borderColor: 'gray', paddingLeft: 8 }}
                            label={'Pincode'}
                            placeholder="Pincode"
                            value={pincode}
                            onChangeText={setPinCode}
                        />
                    </View>
                    <Button
                        buttonStyle={styles.updateButton}
                        backgroundColor="#03A9F4"
                        title="Update"
                        onPress={() => handleUpdate()}
                    />
                </View>
            </ScrollView>
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
    scrollView: {
        marginTop: 10,
    },
    inputView: {
        borderRadius: 25,
        marginBottom: 20,
        justifyContent: "center",
        paddingLeft: 30,
        paddingRight: 30,
    },
    updateButton: {
        margin: 10,
        marginTop: 20,
    }

})

export default ProfileScreen;