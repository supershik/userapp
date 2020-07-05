/* *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState, useContext } from 'react';
import moment from 'moment';
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  View,
  Text,
  Image,
  Button,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage'
import Toast from 'react-native-simple-toast';
import { SHOPAPIKit, setShopClientToken } from '../../utils/apikit';
import { colors } from '../../res/style/colors'
import { AuthContext } from '../../utils/authContext';
import imgEmpty from '../../res/assets/images/empty.png';
import icoLiveOrder from '../../res/assets/images/liveorder.png'
import icoCart from '../../res/assets/images/cart.png'
import { NativeViewGestureHandler } from 'react-native-gesture-handler';

const HomeScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [numColumns] = useState(3);
  const { signIn } = useContext(AuthContext);

  const navigationOptions = () => {
    navigation.setOptions({
      title: 'Shop Categories',
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerLeft: () => (
        <MaterialCommunityIcons.Button name="menu" size={25}
          backgroundColor={colors.primary}
          onPress={() => navigation.openDrawer()}
        ></MaterialCommunityIcons.Button>
      ),
      headerRight: () => (
          <>
          <View style={{flexDirection: 'row', alignSelf: "center", marginRight: 5}}>
            <TouchableOpacity
                onPress={() => navigation.navigate('Live Order')}>
                <Image
                  source={icoLiveOrder}
                  style={styles.icoLiveOrder}
                />
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => navigation.navigate('Cart')}>
                <Image
                  source={icoCart}
                  style={styles.icoCart}
                />
            </TouchableOpacity>              
          </View>
        </>
      )
     });
  }

  const RefreshProducts = async() => {
    let userToken = null;
        try {
          userToken = await AsyncStorage.getItem('userToken');
        } catch (e) {
          console.log(e);
        }
        if (userToken != null) {
          const onSuccess = ({ data }) => {
            setLoading(false);
            setCategories(data.shopcategories);
            console.log('success');
          }
          const onFailure = (error) => {
            setLoading(false);
            if(error.toString().includes('409')) {
              console.log( "message: No categories");
              // Toast.show("message: No categories");
            }
            else if(error.toString().includes('401')) {
              console.log( "error: Authentication failed");
              //reSignIn();
              //Toast.show("error: Authentication failed");
            }
            else
              console.log(error);
            
            setCategories([]);
          }
          
          setLoading(true);
          SHOPAPIKit.get('/shopoperation/allcategory/')
            .then(onSuccess)
            .catch(onFailure);
        }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      navigationOptions();
      const bootstrapAsync = async () => {
        RefreshProducts();
      };
      bootstrapAsync();
    });
    return unsubscribe;

  }, [navigation]);

  const onPressedCategory = (item) => {
    navigation.navigate('Search Product', {shopcategoryinfo: item, fromView: 'CategoriesHome'});
  }

  // Adjust(fill) end item of row in FlatList Grid
  const formatData = (data, numColumns) => {
    let tempData = {
      imgrul: '',
      shopcategory: '',
      empty: true
    }
    const numberOfFullRows = Math.floor(data.length/numColumns);
    let numberOfElementsLastRow = data.length-(numberOfFullRows*numColumns);
    while (numberOfElementsLastRow !== numColumns && numberOfElementsLastRow !== 0) {
      data.push(tempData);
      numberOfElementsLastRow = numberOfElementsLastRow + 1;
    }

    return data;
  }

  const onPressSearchShop = () => {
    navigation.navigate('Map View');
  }
  const onPressCashfree = () => {
    navigation.navigate('Cashfree');
  }
  const renderItem = ({ item, index }) => {
    if(item.empty === true) {
      return <View style = {[styles.listItemEmpty, styles.itemInvisible]} />;
    }
    return (
        <View style={styles.listItem}>
          <TouchableOpacity onPress={() => onPressedCategory(item, index)}>
                    <Image
                      style={styles.image}
                      source={item.imageurl ? { uri: item.imageurl } : imgEmpty}
                    />
                  <View>
                      <Text style={{alignSelf: 'center'}}>{item.shopcategory}</Text>
                  </View>
          </TouchableOpacity>
        </View>
      )
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        { loading ? 
          <Spinner
            visible={loading} size="large" style={styles.spinnerStyle} />
          : (
            <View style={styles.listContainer}>
                { categories.length == 0 ? 
                  <View  style={styles.noShops}> 
                    <Text style={{fontSize: 20, alignItems: "center", color: "rgba(128, 128, 128, 1)"}}>
                      No Shop
                    </Text>
                  </View>
                  : <View style={styles.listContainer}>
                      <FlatList
                          style={{marginHorizontal: 10, marginTop: 10}}
                          data={formatData(categories, numColumns)}
                          renderItem={categories ? renderItem : null}
                          numColumns={numColumns}
                          keyExtractor={(item, index) => index.toString()}
                        />
                        <View style={styles.buttonContainer}>
                          <Button title='Search Shop' uppercase={false} onPress={onPressSearchShop}/>
                        </View>
                    </View>
                  }
            </View>
          )
        }
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 10,

  },
  title: {
    margin: 10,
    alignSelf: "center",
    fontSize: 16,
  },
  item: {
    margin: 10,
    flexDirection: 'row',
    backgroundColor: colors.white,
  },
  selecteditem: {
    margin: 10,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: '#00ff00',
  },
  card: {
    flexDirection: 'column',
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
  },
  noShops: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listItem: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: "center",
    marginVertical: 3,
    marginHorizontal: 1,
  },
  listItemEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: "center",
    marginVertical: 3,
    marginHorizontal: 1,
  },
  image: {
    justifyContent: 'center',
    alignSelf: 'center',
    height: 60,
    width: 100,
    marginVertical: 0,
    resizeMode: 'stretch'
  },
  itemInvisible: {
    backgroundColor: 'transparent',
  },
  icoLiveOrder: {
    padding: 1,
    marginVertical: 10,
    marginHorizontal: 12,
    height: 24,
    width: 23,
    tintColor: '#fff',
    resizeMode: 'stretch',
  },
  icoCart: {
    padding: 1,
    marginVertical: 10,
    marginHorizontal: 15,
    height: 24,
    width: 30,
    tintColor: '#fff',
    resizeMode: 'stretch',
  },
  buttonContainer: {
    height: 35,
    justifyContent: 'center',
    marginLeft: 25,
    marginRight: 25,
    marginTop: 10,
    marginBottom: 10,
  },
});

export default HomeScreen;