import React, {useContext, useEffect, useState} from 'react';
import {
    StyleSheet,
    View,
    Image
} from 'react-native';
import {
    Avatar,
    Title,
    Caption,
    Drawer,
} from 'react-native-paper';
import {
    DrawerContentScrollView,
    DrawerItem
} from '@react-navigation/drawer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Logo from '../../res/assets/images/logo.png';
import { AuthContext } from '../../utils/authContext';
import AsyncStorage from '@react-native-community/async-storage'
import USERAPIKit, { setUserClientToken } from '../../utils/apikit';

export function DrawContent(props) {
    const [username, setUserName] = useState('')
    const [phonenumber, setPhoneNumber] = useState('')
    const [showProfile, setShowProfile] = useState(false);
    const { signOut } = useContext(AuthContext);

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
                    console.log(data)
                    setUserName(data.name);
                    setPhoneNumber(data.mobile);
                    
                    AsyncStorage.setItem('userName', data.name);
                    if(data.email == null)
                        AsyncStorage.setItem('userEmail', '');
                    else
                        AsyncStorage.setItem('userEmail', data.email);
                }
                const onFailure = error => {
                    console.log(error);
                }                
                USERAPIKit.get('/user/get')
                    .then(onSuccess)
                    .catch(onFailure);
            }
            else {
                
            }
        };
        bootstrapAsync();

    }, []);

    const handleProfile = () => {
        setShowProfile(!showProfile)
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <DrawerContentScrollView {...props}>
                <View style={styles.drawerContent}>
                    <View style={styles.userInfoSection}>
                        <View style={{ flexDirection: 'row', marginTop: 15 }}>
                        {/* <Avatar.Image
                            source={Logo}
                                size={50} /> */}
                            <Image
                                source={Logo}
                                style={{marginTop: 8, width: 40, height: 45, resizeMode: 'stretch'}}
                            />
                            <View style={{ marginLeft: 15, flexDirection: 'column' }}>
                                <Title style={styles.title}>{username}</Title>
                                <Caption style={styles.caption}>{phonenumber}</Caption>
                            </View>
                        </View>
                    </View>
                    <Drawer.Section style={styles.drawerSection}>
                        <DrawerItem
                            icon={({ color, size }) => (
                                <MaterialCommunityIcons
                                    name="home-outline"
                                    color={color}
                                    size={size}
                                />
                            )}
                            label="Home"
                            onPress={() => {props.navigation.navigate('Home') }}>
                        </DrawerItem>
                        <DrawerItem
                            icon={({ color, size }) => (
                                <MaterialCommunityIcons
                                    name="face-profile"
                                    color={color}
                                    size={size}
                                />
                            )}
                            label="Profile"
                            onPress={() => handleProfile()}>
                        </DrawerItem>
                        {
                            showProfile ? (
                                <Drawer.Section style={styles.drawerSubSection}>
                                <DrawerItem
                                    icon={({ color, size }) => (
                                        <MaterialCommunityIcons
                                            name="account-outline"
                                            color={color}
                                            size={size}
                                        />
                                    )}
                                    label="User Profile"
                                    onPress={() => {props.navigation.navigate('Profile') }}>
                                </DrawerItem>
                                <DrawerItem
                                    icon={({ color, size }) => (
                                        <MaterialCommunityIcons
                                            name="coins"
                                            color={color}
                                            size={size}
                                        />
                                    )}
                                    label="Rewards"
                                    onPress={() => {props.navigation.navigate('Rewards') }}>
                                </DrawerItem>

                                <DrawerItem
                                    icon={({ color, size }) => (
                                        <MaterialCommunityIcons
                                            name="update"
                                            color={color}
                                            size={size}
                                        />
                                    )}
                                    label="Subscription"
                                    onPress={() => {props.navigation.navigate('Subscription') }}>
                                </DrawerItem>
                                </Drawer.Section>
                            ) : null
                        }
                        <DrawerItem
                            icon={({ color, size }) => (
                                <MaterialCommunityIcons
                                    name="google-maps"
                                    color={color}
                                    size={size}
                                />
                            )}
                            label="Search Shop"
                            onPress={() => {props.navigation.navigate('Map View') }}>
                        </DrawerItem>      
                        <DrawerItem
                            icon={({ color, size }) => (
                                <MaterialCommunityIcons
                                    name="cart-outline"
                                    color={color}
                                    size={size}
                                />
                            )}
                            label="Cart"
                            onPress={() => {props.navigation.navigate('Cart') }}>
                        </DrawerItem>
                        <DrawerItem
                            icon={({ color, size }) => (
                                <MaterialCommunityIcons
                                    name="history"
                                    color={color}
                                    size={size}
                                />
                            )}
                            label="Order History"
                            onPress={() => {props.navigation.navigate('Order History') }}>
                        </DrawerItem>
                        <DrawerItem
                            icon={({ color, size }) => (
                                <MaterialCommunityIcons
                                    name="cards-outline"
                                    color={color}
                                    size={size}
                                />
                            )}
                            label="Live Order"
                            onPress={() => {props.navigation.navigate('Live Order') }}>
                        </DrawerItem>
                    </Drawer.Section>
                </View>
            </DrawerContentScrollView>
            <Drawer.Section style={styles.bottomDrawerSection}>
                <DrawerItem
                    icon={({ color, size }) => (
                        <MaterialCommunityIcons
                            name="exit-to-app"
                            color={color}
                            size={size}
                        />
                    )}
                    label="Sign out"
                    onPress={() => signOut()}>
                </DrawerItem>
            </Drawer.Section>
        </View>
    )
}

const styles = StyleSheet.create({
    drawerContent: {
        flex: 1,
    },
    userInfoSection: {
        paddingLeft: 20,
    },
    title: {
        fontSize: 16,
        marginTop: 3,
        fontWeight: 'bold',
    },
    caption: {
        fontSize: 14,
        lineHeight: 14,
    },
    row: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    section: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    paragraph: {
        fontWeight: 'bold',
        marginRight: 3,
    },
    drawerSection: {
        marginTop: 15,
    },
    bottomDrawerSection: {
        marginBottom: 15,
        borderTopColor: '#f4f4f4',
        borderTopWidth: 1
    },
    preference: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    drawerSubSection: {
        marginLeft: 15,
    },
});