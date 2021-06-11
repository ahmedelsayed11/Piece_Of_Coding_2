import React, {useRef, useEffect, Component} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  FlatList,
  Dimensions,
  LayoutAnimation,
  Easing,
  UIManager,
  YellowBox,
  Animated,
  Modal,
  TextInput,
  AsyncStorage,
  RefreshControl,
  PermissionsAndroid,
  Switch,
  NativeModules,
} from 'react-native';

import {
  Container,
  Header,
  Left,
  Body,
  Input,
  Text,
  Spinner,
  Badge,
  Right,
  Title,
} from 'native-base';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import GetLocation from 'react-native-get-location';
import RNRestart from 'react-native-restart';
import IconVector from 'react-native-vector-icons/FontAwesome5';

// import Geolocation from '@react-native-community/geolocation';
import RadioGroup from 'react-native-radio-buttons-group';
// import StarRating from 'react-native-star-rating'
import NetInfo from '@react-native-community/netinfo';
import {Rating, AirbnbRating} from 'react-native-ratings';
import AwesomeAlert from 'react-native-awesome-alerts';
import numbro from 'numbro';
import IconModal from 'react-native-vector-icons/FontAwesome5';
import ModalCart from 'react-native-modalbox';
import axios from 'axios';
import PushNotification from 'react-native-push-notification';
import * as domainData from './domain';
var domain = domainData.domain;
import * as Animatable from 'react-native-animatable';

import RNAndroidLocationEnabler from 'react-native-android-location-enabler';

import ImageZoom from 'react-native-image-pan-zoom';

var saveLocation = async position => {
  await AsyncStorage.setItem('location', JSON.stringify(position.coords));
};

const {width, height} = Dimensions.get('window');

const FadeInView = props => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        ...props.style,
        opacity: fadeAnim,
      }}>
      {props.children}
    </Animated.View>
  );
};

export default class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchInputValue: '',
      searchBorderColor: '#ddd',
      searchBorderWidth: 0.4,
      openShoppingCartModal: false,
      Delivery: 0,
      Total: 0,
      shoppingCartItems: [],
      filterCategories: [{fiter_id: 1, filter_name: 'All', selected: true}],
      DishAndKitchensData: {
        dishOfDay: {},
        Kitchens: [],
      },
      loading_kitchens: 'loading',
      see_more_loading: false,
      requestCategory: 'all',
      serverDataCount: 0,
      xValue: new Animated.Value(0),
      position: 0,
      show: false,
      connection_Status: 'Online',
      searchFor: '',
      user_name: '',
      user_id: '',
      refresh: false,
      lan: '',
      lat: '',
      show_search: false,
      switchValue: true,
      makeSearch: false,
      kitchen_data: [
        {
          food_items: [],
        },
      ],
      meals_serverDataCount: 0,
      loading_meals: '',
      loading_kitchens_search: 'loading',
      open_search: false,
      show_delete: false,
      mealsSearch: [],
      kitchensSearch: [],
      show_Archife: false,
      UserStatus: '',
      model_loding: false,
      model_erorrs: false,
      worning_text: '',
      go_kitchen_data: '',
      openitem: -1,
      showImageInModal: false,
      imageUrlInModal: '',
      meals_see_more_loading: false,
    };
    UIManager.setLayoutAnimationEnabledExperimental(true);
    if (
      Platform.OS === 'android' &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  async getMealsHistory(pass_key) {
    let mealsSearch = await AsyncStorage.getItem('mealsSearch');
    if (mealsSearch) {
      mealsSearch = JSON.parse(mealsSearch);
      //  mealsSearch=mealsSearch.revrse()
    } else {
      mealsSearch = [];
    }
    let reversedArr = [];
    for (let i = mealsSearch.length - 1; i >= 0; i--) {
      reversedArr.push(mealsSearch[i]);
    }

    console.log(mealsSearch);
    // mealsSearch=mealsSearch.revrse

    this.setState({mealsSearch: reversedArr.slice(0, 15)});
  }

  async saveMealsHistory(pass_key) {
    let mealsSearch = await AsyncStorage.getItem('mealsSearch');
    if (mealsSearch) {
      mealsSearch = JSON.parse(mealsSearch);
    } else {
      mealsSearch = [];
    }

    mealsSearch.push(pass_key);

    await AsyncStorage.setItem('mealsSearch', JSON.stringify(mealsSearch));
    // mealsSearch= mealsSearch.reverse()
  }

  historygetMeals(passedText) {
    this.setState({searchInputValue: passedText});

    this.setState({
      meals_serverDataCount: 0,
      loading_meals: 'loading',
      makeSearch: true,
      searchFor: 'food_item',
    });
    let data_to_send = {
      search_key: passedText,
      init_record_no: 0,
    };
    if (this.state.connection_Status == 'Online') {
      axios.post(domain + `search_food_items.php`, data_to_send).then(res => {
        // console.log(JSON.stringify(res.data))
        if (res.status == 200) {
          this.setState({meals_see_more_loading: false});
          if (res.data != 'error') {
            if (res.data.food_items.length > 0) {
              let lastData = this.state.kitchen_data[0].food_items;
              lastData = lastData.concat(res.data.food_items);
              this.setState({
                kitchen_data: [{food_items: lastData}],
                meals_serverDataCount: res.data.count,
                loading_meals: 'have_data',
              });
            } else {
              this.setState({loading_meals: 'no_data'});
            }
          } else {
            this.setState({loading_meals: 'no_data'});

            // Alert.alert('تسلم', 'something is wrong');
            this.setState({worning_text: 'حدث خطأ ما', model_erorrs: true});
          }
        } else {
          this.setState({loading_kitchens: 'no_data'});

          // Alert.alert('تسلم', 'something is wrong');
          this.setState({worning_text: 'حدث خطأ ما', model_erorrs: true});
        }
      });
    } else {
      this.setState({meals_see_more_loading: false});
      // Alert.alert('Check your internet connection please');
    }
  }

  async saveToken(token, user_id) {
    await AsyncStorage.setItem('userToken', token);

    let data_to_send = {
      token: token,
      user_id: user_id,
    };

    // alert(user_id)
    axios.post(domain + 'save_token_for_first.php', data_to_send).then(res => {
      console.log('Save Token Result ' + res.data);
      // alert(JSON.stringify(res.data))
    });
  }

  async checkUserToken(token) {
    // await AsyncStorage.setItem('userToken', '');
    let user_id = JSON.parse(await AsyncStorage.getItem('userData')).user_id;
    let userToken = await AsyncStorage.getItem('userToken');

    console.log('Token ' + token);
    console.log('Async Token ' + userToken);

    if (user_id * 0 == 0) {
      if (token == userToken) {
        return;
      } else {
        this.saveToken(token, user_id);
      }
    }
  }

  async pushNotification() {
    // Must be outside of any component LifeCycle (such as `componentDidMount`).
    var _this = this;

    PushNotification.subscribeToTopic('Teslm_User');

    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: async token => {
        console.log('TOKEN:', token);
        this.checkUserToken(token.token);
      },

      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: function(notification) {
        if (notification.userInteraction) {
          if (notification.data.action == 'Order_Details') {
            _this.makeNavigationToOrderDetails(
              notification.data.order_id,
              notification.data.notification_id,
            );
          } else if (notification.data.action == 'Hot_Deals') {
            _this.props.navigation.navigate('HotDealsPage');
          }
        }
      },

      onAction: function(notification) {
        // console.log('ACTION:', notification.action);
        // console.log('NOTIFICATION:', notification);
      },

      onRegistrationError: function(err) {
        // console.error(err.message, err);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      requestPermissions: true,
    });
  }

  getCart = async () => {
    const UserStatus = await AsyncStorage.getItem('UserStatus');
    let FoodCart = await AsyncStorage.getItem('food_cart_store');
    if (FoodCart) {
      FoodCart = JSON.parse(FoodCart);
    } else {
      FoodCart = [];
    }

    this.setState({shoppingCartItems: FoodCart, UserStatus: UserStatus});

    this.calculateTotal(FoodCart);
    //  alert(FoodCart )
  };

  async componentDidMount() {
    console.disableYellowBox = true;

    NetInfo.addEventListener(state => {
      if (state.isConnected == true) {
        this.setState({
          connection_Status: 'Online',
        });

        this.getLocation();
        this.getFilters();
        // this.getDishOfDay();
        // this.getKitchens();
        this.getCart();
        this.get_user_data();
      } else {
        this.setState({
          connection_Status: 'Offline',
        });
      }
    });

    this.pushNotification();
  }

  makeNavigationToOrderDetails(order_id, notification_id) {
    axios
      .post(domain + 'notifcations/update_notification_open.php', {
        notification_id: notification_id,
      })
      .then(res => {
        // console.log(res.data)

        this.props.navigation.navigate('OrderInfoPage', {
          order_id: order_id,
        });
      });
  }

  getLocation = async () => {
    let location = await AsyncStorage.getItem('location');
    if (location) {
      location = JSON.parse(location);
      const currentLongitude = JSON.stringify(location.longitude);
      //getting the Longitude from the location json
      const currentLatitude = JSON.stringify(location.latitude);

      this.setState({lan: currentLongitude, lat: currentLatitude});
      // this.getFilters()
      this.getDishOfDay();
      this.getKitchens('', currentLongitude, currentLatitude);
      // this.getCart();
      // this.get_user_data();
    } else {
      //  this.getFilters()
      this.getDishOfDay();
      this.getKitchens();
      // this.getCart();
      // this.get_user_data();
    }

    //  alert(FoodCart )
  };

  get_user_data = async () => {
    let user_data = await AsyncStorage.getItem('userData');
    if (user_data) {
      user_data = JSON.parse(user_data);
    } else {
      user_data = {};
    }

    this.setState({user_id: user_data.user_id, user_name: user_data.name});
    // alert(JSON.stringify(user_data))
  };

  async setCart(passedCart) {
    await AsyncStorage.setItem('food_cart_store', JSON.stringify(passedCart));
  }

  getDishOfDay() {
    axios.get(domain + `select_dish_of_day.php`).then(res => {
      if (res.status == 200) {
        if (res.data != 'error') {
          let DishAndKitchensDataObj = this.state.DishAndKitchensData;
          DishAndKitchensDataObj.dishOfDay = res.data;
          this.setState({DishAndKitchensData: DishAndKitchensDataObj});
        } else {
          this.setState({worning_text: 'حدث خطأ ما', model_erorrs: true});
        }
      } else {
        this.setState({worning_text: 'حدث خطأ ما', model_erorrs: true});
      }
    });
  }

  getFilters() {
    axios.get(domain + `admin/select_food_filters.php`).then(res => {
      if (res.status == 200) {
        if (res.data != 'error') {
          let arr = res.data;
          for (let i = 0; i < arr.length; i++) {
            arr[i].selected = false;
          }
          arr.unshift({fiter_id: 0, filter_name: 'All', selected: true});
          this.setState({filterCategories: arr});
        } else {
        }
      } else {
      }
    });
  }

  getKitchens(category, passed_lang, passed_lat) {
    let lang = passed_lang ? passed_lang : this.state.lan;
    let lat = passed_lat ? passed_lat : this.state.lat;

    // alert(passed_lang)
    let categoryValue = '';
    if (category) {
      categoryValue = category;
    } else {
      categoryValue = this.state.requestCategory;
    }
    let data_to_send = {
      category: categoryValue.toLowerCase(),
      search_key: 'all',
      init_record_no: category
        ? 0
        : this.state.DishAndKitchensData.Kitchens.length,
      lat: 30.591819,
      // lat,
      lan: 31.509496,
      // lang,
    };
    // console.log(data_to_send)
    axios.post(domain + `select_kitchens.php`, data_to_send).then(res => {
      this.setState({see_more_loading: false});
      if (res.status == 200) {
        if (res.data != 'error') {
          if (res.data.kitchens) {
            if (res.data.kitchens_count > 0) {
              this.setState({loading_kitchens: 'have_data'});
            } else {
              this.setState({loading_kitchens: 'no_data'});
            }
            // let lastArr=this.state.DishAndKitchensData.Kitchens
            // lastArr=lastArr.concat(res.data.kitchens)
            let DishAndKitchensDataObj = this.state.DishAndKitchensData;
            let lastKitchens = category ? [] : DishAndKitchensDataObj.Kitchens;
            lastKitchens = lastKitchens.concat(res.data.kitchens);
            DishAndKitchensDataObj.Kitchens = lastKitchens;

            this.setState({
              DishAndKitchensData: DishAndKitchensDataObj,
              serverDataCount: res.data.kitchens_count,
            });
          } else {
            this.setState({loading_kitchens: 'no_data'});
          }
        } else {
          this.setState({loading_kitchens: 'no_data'});
        }
      } else {
        this.setState({worning_text: 'حدث خطأ ما', model_erorrs: true});
      }
    });
  }

  chackTime(startTime, endTime) {
    if (startTime == '' || endTime == '') {
      return true;
    }

    startTime = new Date(startTime * 1).toString().slice(16, 21);
    endTime = new Date(endTime * 1).toString().slice(16, 21);

    console.log(startTime);

    let timeStart = startTime;
    timeStart =
      parseInt(timeStart.substr(0, 2)) * 60 + parseInt(timeStart.substr(3, 2));

    let timeEnd = endTime;
    timeEnd =
      parseInt(timeEnd.substr(0, 2)) * 60 + parseInt(timeEnd.substr(3, 2));
    let new_time = new Date();
    let now = new_time.getMinutes() + new_time.getHours() * 60;

    if (now < timeStart || now > timeEnd) {
      return false;
    } else {
      return true;
    }
  }

  chackEndTime(passedTime) {
    if (passedTime == '') {
      return true;
    }
    let time = passedTime;
    time = parseInt(time.substr(0, 2)) * 60 + parseInt(time.substr(3, 2));
    let new_time = new Date();
    let now = new_time.getMinutes() + new_time.getHours() * 60;

    if (now > time) {
      console.log('sdfg');

      return false;
    } else {
      return true;
    }
  }

  updateRadioButtonsOptions1(options, food_item_index, category_index) {
    let kitchenData = this.state.kitchen_data;

    kitchenData[category_index].food_items[food_item_index].options = options;

    let price_to_add = this.calculateItemPrice(options);
    kitchenData[category_index].food_items[food_item_index].originalPrice =
      kitchenData[category_index].food_items[food_item_index].purePrice +
      price_to_add;

    kitchenData[category_index].food_items[food_item_index].priceForRender =
      kitchenData[category_index].food_items[food_item_index].quantity *
      kitchenData[category_index].food_items[food_item_index].originalPrice;

    this.setState({kitchen_data: kitchenData});

    console.log(
      JSON.stringify(
        kitchenData[category_index].food_items[food_item_index].options,
      ),
    );
  }

  refresh_getKitchens() {
    this.setState({refresh: true});
    let categoryValue = this.state.requestCategory;

    let data_to_send = {
      category: categoryValue.toLowerCase(),
      search_key: 'all',
      init_record_no: 0,
      lat: this.state.lat,
      lan: this.state.lan,
    };

    axios.post(domain + `select_kitchens.php`, data_to_send).then(res => {
      this.setState({refresh: false});
      if (res.status == 200) {
        if (res.data != 'error') {
          if (res.data.kitchens) {
            if (res.data.kitchens_count > 0) {
            } else {
            }

            let DishAndKitchensDataObj = this.state.DishAndKitchensData;
            let lastKitchens = [];
            lastKitchens = lastKitchens.concat(res.data.kitchens);
            DishAndKitchensDataObj.Kitchens = lastKitchens;

            this.setState({
              DishAndKitchensData: DishAndKitchensDataObj,
              serverDataCount: res.data.kitchens_count,
            });
            console.log(lastKitchens);
          } else {
            // this.setState({ loading_kitchens: 'no_data' });
          }
        } else {
          // Alert.alert('تسلم', 'something is wrong');
          // this.setState({ loading_kitchens: 'no_data' });
        }
      } else {
        // Alert.alert('تسلم', 'something is wrong');
        this.setState({worning_text: 'حدث خطأ ما', model_erorrs: true});
      }
    });
  }

  async go_login() {
    await AsyncStorage.setItem('checkout', 'go_CheckOut');
    this.props.navigation.navigate('Authentications');
  }

  calculateTotal(passShoppingCart) {
    let shoppingCardItems = [];
    if (passShoppingCart) {
      shoppingCardItems = passShoppingCart;
    } else {
      shoppingCardItems = this.state.shoppingCartItems;
    }

    let Total = 0;

    for (let i = 0; i < shoppingCardItems.length; i++) {
      Total += parseFloat(shoppingCardItems[i].item_price_quantity);
    }

    this.setState({
      Total,
    });
  }

  renderAllFilters = () => {
    this.state.filterCategories.map(filterItem => {
      return (
        <View
          style={{
            height: 70,
            borderWidth: 1,
            borderColor: '#2fcc70',
            backgroundColor: filterItem.selected == true ? '#2fcc70' : '#fff',
          }}>
          <TouchableOpacity style={{height: '100%'}} onPress={() => {}}>
            <Text>{filterItem.filter_name}</Text>
          </TouchableOpacity>
        </View>
      );
    });
  };

  getMeals(click) {
    this.saveMealsHistory(this.state.searchInputValue);
    this.setState({meals_serverDataCount: 0, loading_meals: 'loading'});
    let data_to_send = {
      search_key: this.state.searchInputValue,
      init_record_no: click ? 0 : this.state.kitchen_data[0].food_items.length,
    };

    if (this.state.connection_Status == 'Online') {
      axios.post(domain + `search_food_items.php`, data_to_send).then(res => {
        if (res.status == 200) {
          this.setState({meals_see_more_loading: false});
          if (res.data != 'error') {
            if (res.data.food_items.length > 0) {
              res.data.food_items.map(item => {
                item.showAllOption = false;

                if (item.options != undefined) {
                  let twoOptionArray = [];
                  item.options.map((option, index) => {
                    if (index == 0 || index == 1) {
                      twoOptionArray.push(option);
                    }
                  });

                  item.twoArrayOptions = twoOptionArray;
                }
              });

              let lastData = this.state.kitchen_data[0].food_items;
              lastData = lastData.concat(res.data.food_items);
              this.setState({
                kitchen_data: [{food_items: res.data.food_items}],
                meals_serverDataCount: res.data.count,
                loading_meals: 'have_data',
              });
            } else {
              this.setState({loading_meals: 'no_data'});
            }
          } else {
            this.setState({loading_meals: 'no_data'});

            // Alert.alert('تسلم', 'حدث خطأ ما');
            this.setState({worning_text: 'حدث خطأ ما', model_erorrs: true});
          }
        } else {
          this.setState({loading_kitchens: 'no_data'});

          // Alert.alert('تسلم', 'حدث خطأ ما');
          this.setState({worning_text: 'حدث خطأ ما', model_erorrs: true});
        }
      });
    } else {
      this.setState({meals_see_more_loading: false});
      // Alert.alert('Check your internet connection please');
    }
  }

  seeMoreButton = () => {
    this.setState({meals_see_more_loading: true});
    let data_to_send = {
      search_key: this.state.searchInputValue,
      init_record_no: this.state.kitchen_data[0].food_items.length,
    };

    if (this.state.connection_Status == 'Online') {
      axios.post(domain + `search_food_items.php`, data_to_send).then(res => {
        // alert(JSON.stringify(res.data));
        if (res.status == 200) {
          this.setState({meals_see_more_loading: false});
          if (res.data != 'error') {
            if (res.data.food_items.length > 0) {
              res.data.food_items.map(item => {
                item.showAllOption = false;

                if (item.options != undefined) {
                  let twoOptionArray = [];
                  item.options.map((option, index) => {
                    if (index == 0 || index == 1) {
                      twoOptionArray.push(option);
                    }
                  });

                  item.twoArrayOptions = twoOptionArray;
                }
              });

              let lastData = this.state.kitchen_data[0].food_items;
              lastData = lastData.concat(res.data.food_items);
              this.setState({
                kitchen_data: [{food_items: lastData}],
                meals_serverDataCount: res.data.count,
                loading_meals: 'have_data',
              });
            } else {
              this.setState({loading_meals: 'no_data'});
            }
          } else {
            this.setState({loading_meals: 'no_data'});

            // Alert.alert('تسلم', 'حدث خطأ ما');
            this.setState({worning_text: 'حدث خطأ ما', model_erorrs: true});
          }
        } else {
          this.setState({loading_kitchens: 'no_data'});

          // Alert.alert('تسلم', 'حدث خطأ ما');
          this.setState({worning_text: 'حدث خطأ ما', model_erorrs: true});
        }
      });
    } else {
      this.setState({meals_see_more_loading: false});
      // Alert.alert('Check your internet connection please');
    }
  };

  makeSearchFun() {
    if (this.state.searchInputValue == '') {
      null;
    } else {
      if (this.state.switchValue == false) {
        this.setState({
          searchFor: 'kitchen_item',
          makeSearch: true,
          Kitchens: [],
          // show_search: true
        });
        this.getKitchens_search(1);
      } else {
        this.setState({
          searchFor: 'food_item',
          makeSearch: true,
          kitchen_data: [{food_items: []}],
          // show_search: true
        });
        this.getMeals(1);
      }
    }
  }

  async getKitchensHistory() {
    let kitchensSearch = await AsyncStorage.getItem('kitchensSearch');
    if (kitchensSearch) {
      kitchensSearch = JSON.parse(kitchensSearch);
    } else {
      kitchensSearch = [];
    }
    let reversedArr = [];
    for (let i = kitchensSearch.length - 1; i >= 0; i--) {
      reversedArr.push(kitchensSearch[i]);
    }

    console.log(kitchensSearch);
    this.setState({kitchensSearch: reversedArr.slice(0, 20)});
  }

  async getMealsHistory(pass_key) {
    let mealsSearch = await AsyncStorage.getItem('mealsSearch');
    if (mealsSearch) {
      mealsSearch = JSON.parse(mealsSearch);
      //  mealsSearch=mealsSearch.revrse()
    } else {
      mealsSearch = [];
    }
    let reversedArr = [];
    for (let i = mealsSearch.length - 1; i >= 0; i--) {
      reversedArr.push(mealsSearch[i]);
    }

    console.log(mealsSearch);
    // mealsSearch=mealsSearch.revrse

    this.setState({mealsSearch: reversedArr.slice(0, 20)});
  }

  async saveKitchensHistory(pass_key) {
    let kitchensSearch = await AsyncStorage.getItem('kitchensSearch');
    if (kitchensSearch) {
      kitchensSearch = JSON.parse(kitchensSearch);
    } else {
      kitchensSearch = [];
    }

    kitchensSearch.push(pass_key);

    await AsyncStorage.setItem(
      'kitchensSearch',
      JSON.stringify(kitchensSearch),
    );
    // mealsSearch= mealsSearch.reverse()

    console.log(kitchensSearch);
    // this.setState({mealsSearch:mealsSearch.slice(0,10) });
  }

  getKitchens_search(click) {
    this.saveKitchensHistory(this.state.searchInputValue);
    let data_to_send = {
      category: 'all',
      search_key: this.state.searchInputValue,
      init_record_no: click ? 0 : this.state.Kitchens.length,
      lat: this.state.lat,
      lan: this.state.lan,
    };
    this.setState({
      serverDataCount: 0,
      loading_kitchens_search: 'loading',
    });
    if (this.state.connection_Status == 'Online') {
      axios.post(domain + `select_kitchens.php`, data_to_send).then(res => {
        this.setState({see_more_loading: false});
        if (res.status == 200) {
          if (res.data != 'error') {
            if (res.data.kitchens) {
              if (res.data.kitchens_count > 0) {
                this.setState({loading_kitchens_search: 'have_data'});
              } else {
                this.setState({loading_kitchens_search: 'no_data'});
              }

              this.setState({
                Kitchens: [...this.state.Kitchens, ...res.data.kitchens],
                serverDataCount: res.data.kitchens_count,
              });
            } else {
              this.setState({loading_kitchens_search: 'no_data'});
            }
          } else {
            this.setState({worning_text: 'حدث خطأ ما', model_erorrs: true});

            this.setState({loading_kitchens_search: 'no_data'});
          }
        } else {
          this.setState({worning_text: 'حدث خطأ ما', model_erorrs: true});
        }
      });
    } else {
      this.setState({meals_see_more_loading: false});
    }
  }

  historygetKitchens(pass_text) {
    this.setState({searchInputValue: pass_text});

    let data_to_send = {
      category: 'all',
      search_key: pass_text,
      init_record_no: 0,
      lat: this.state.lat,
      lan: this.state.lan,
    };
    this.setState({
      serverDataCount: 0,
      loading_kitchens: 'loading',
      makeSearch: true,
      searchFor: 'kitchen_item',
    });
    if (this.state.connection_Status == 'Online') {
      axios.post(domain + `select_kitchens.php`, data_to_send).then(res => {
        this.setState({see_more_loading: false});
        if (res.status == 200) {
          if (res.data != 'error') {
            if (res.data.kitchens) {
              if (res.data.kitchens_count > 0) {
                this.setState({loading_kitchens: 'have_data'});
              } else {
                this.setState({loading_kitchens: 'no_data'});
              }
             
              console.log(JSON.stringify(res.data));
              this.setState({
                Kitchens: [...this.state.Kitchens, ...res.data.kitchens],
                serverDataCount: res.data.kitchens_count,
              });
            } else {
              this.setState({loading_kitchens: 'no_data'});
            }
          } else {
            // Alert.alert('تسلم', 'حدث خطأ ما');
            this.setState({worning_text: 'حدث خطأ ما', model_erorrs: true});

            this.setState({loading_kitchens: 'no_data'});
          }
        } else {
          // Alert.alert('تسلم', 'حدث خطأ ما');
          this.setState({worning_text: 'حدث خطأ ما', model_erorrs: true});
        }
      });
    } else {
      this.setState({meals_see_more_loading: false});
      // Alert.alert('Check your internet connection please');
    }
  }

  selectCategoryFromHorizntalScrollView = (name, index) => {
    // alert(index)
    // alert(filterIt)

    let DishAndKitchensDataObj = this.state.DishAndKitchensData;

    DishAndKitchensDataObj.Kitchens = [];
    // alert(JSON.stringify(res.data.kitchens[0]))
    // console.log("hi")

    this.setState({
      DishAndKitchensData: DishAndKitchensDataObj,
      serverDataCount: 0,
    });

    let filterCategories = this.state.filterCategories;
    this.setState({loading_kitchens: 'loading'});

    let dishAndKitchensDataObj = this.state.DishAndKitchensData;
    dishAndKitchensDataObj.Kitchens = [];
    this.setState({
      requestCategory: filterCategories[index].filter_name,
      DishAndKitchensData: dishAndKitchensDataObj,
      serverDataCount: 0,
    });
    this.getKitchens(filterCategories[index].filter_name);

    for (var i = 0; i < filterCategories.length; i++) {
      if (i == index) {
        filterCategories[i].selected = true;
      } else {
        filterCategories[i].selected = false;
        this.setState({
          filterCategories: filterCategories,
        });
      }
    }
    this.setState({
      filterCategories: filterCategories,
    });
  };
  openDrawer() {
    this.props.navigation.openDrawer();
  }

  calculateItemPrice(options) {
    // let item_data=this.state.FoodItem

    // let price=item_data.purePrice;

    // for(let i=0;i<item_data.food_item_props.length;i++){
    let price = 0;
    for (let x = 0; x < options.length; x++) {
      if (options[x].selected) {
        price += parseFloat(options[x].price);
      }
    }

    return price;

    // }

    // FoodItem.originalPrice * quantity
    // FoodItem.priceForRender = price

    // item_data.originalPrice=price

    // item_data.priceForRender=price * item_data.quantity

    // this.setState({FoodItem:item_data})
  }

  // update state
  updateRadioButtonsOptions = options => {
    let DishAndKitchensData = this.state.DishAndKitchensData;
    DishAndKitchensData.dishOfDay.options = options;
    // optionsx = options

    let price_to_add = this.calculateItemPrice(options);
    DishAndKitchensData.dishOfDay.originalPrice =
      DishAndKitchensData.dishOfDay.purePrice + price_to_add;

    DishAndKitchensData.dishOfDay.priceForRender =
      DishAndKitchensData.dishOfDay.quantity *
      DishAndKitchensData.dishOfDay.originalPrice;

    this.setState({
      DishAndKitchensData,
    });
    this.setState({DishAndKitchensData});
  };

  quantityButton = value => {
    let DishAndKitchensData = this.state.DishAndKitchensData;
    let quantity = DishAndKitchensData.dishOfDay.quantity;

    if (value == 'add') {
      DishAndKitchensData.dishOfDay.quantity = parseInt(quantity) + 1;
      DishAndKitchensData.dishOfDay.priceForRender =
        DishAndKitchensData.dishOfDay.quantity *
        DishAndKitchensData.dishOfDay.originalPrice;
    } else {
      if (quantity == 1) {
        // Alert.alert('تسلم', ' يجب أن تكون الكمية أكبر من واحد');
        this.setState({
          worning_text: 'يجب أن تكون الكمية أكبر من واحد',
          model_erorrs: true,
        });
      } else {
        DishAndKitchensData.dishOfDay.quantity = parseInt(quantity) - 1;
        DishAndKitchensData.dishOfDay.priceForRender =
          DishAndKitchensData.dishOfDay.quantity *
          DishAndKitchensData.dishOfDay.originalPrice;
      }
    }
    this.setState({
      DishAndKitchensData,
    });
  };

  quantityButton_insearch = (IndexOfKitchenItem, itemIndex, type) => {
    let kitchen_data = this.state.kitchen_data;
    let category = kitchen_data[IndexOfKitchenItem];
    let itemData = category.food_items[itemIndex];
    let quantity = parseInt(itemData.quantity);

    if (type == 'add') {
      // alert(quantity)
      quantity++;
      let quantityPrice =
        parseFloat(itemData.originalPrice) * parseInt(quantity);
      itemData.quantity = quantity;
      itemData.priceForRender = quantityPrice;
    } else {
      if (itemData.quantity == 1) {
      } else {
        quantity--;
        // alert(quantity)
        let quantityPrice =
          parseFloat(itemData.originalPrice) * parseInt(quantity);
        itemData.quantity = quantity;
        itemData.priceForRender = quantityPrice;
      }
    }

    kitchen_data[IndexOfKitchenItem].food_items[itemIndex] = itemData;
    this.setState({
      kitchen_data,
    });
  };

  addToCart(food_item_index, category_index) {
    // let dishOfDay = this.state.DishAndKitchensData.dishOfDay

    let kitchenData = this.state.kitchen_data;

    let food_item = kitchenData[category_index].food_items[food_item_index];

    let newCartItem = {
      // item_id: this.state.shoppingCartItems.length,
      food_item_id: food_item.food_item_id,
      kitchen_name: food_item.kitchen_name,
      kitchen_id: food_item.kitchen_id,
      available_count: food_item.available_count,
      required_time: food_item.required_time,
      item_img: {uri: food_item.image_url},
      item_name: food_item.name,
      item_price_original: food_item.originalPrice,
      item_price_quantity: food_item.priceForRender,
      quantity: food_item.quantity,
      special_request: '',

      food_item_props:
        food_item.food_item_props.length > 0
          ? [
              {
                property_title: food_item.food_item_props[0].property_title,
                choice: '',
              },
            ]
          : [],
    };
    if (food_item.options) {
      for (let i = 0; i < food_item.options.length; i++) {
        if (food_item.options[i].selected == true) {
          newCartItem.food_item_props[0].choice = food_item.options[i].label;
        }
      }
    }

    for (let i = 1; i < food_item.food_item_props.length; i++) {
      newCartItem.food_item_props.push({
        property_title: food_item.food_item_props[i].property_title,
        choice: food_item.food_item_props[i].choices[0].label,
      });
    }

    let shoppingCart = this.state.shoppingCartItems;

    let found = false;

    // /**
    //  *  {"food_item_id": "1",
    //  * "food_item_props": [{"choice": "spicy", "property_title": "flavour"},
    //  *  {"choice": "small", "property_title": "size"}],
    //  *  "item_img": {"uri": "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/delish-202001-mozzarella-stuffed-chicken-parm-0266-portrait-pf-1583438260.jpg"},
    //  * "item_name": "Mozzarella Stuffed Chicken Parm",
    //  *  "item_price_original": 45, "item_price_quantity": 90, "quantity": 2, "special_request": ""}
    //  */

    for (
      var found_index = 0;
      found_index < shoppingCart.length;
      found_index++
    ) {
      if (
        newCartItem.food_item_id == shoppingCart[found_index].food_item_id &&
        JSON.stringify(newCartItem.food_item_props) ==
          JSON.stringify(shoppingCart[found_index].food_item_props)
      ) {
        // shoppingCart[found_index].quantity+=newCartItem.quantity;
        newCartItem.quantity += shoppingCart[found_index].quantity;
        newCartItem.item_price_quantity =
          newCartItem.item_price_original * newCartItem.quantity;

        found = true;
        break;
      }
    }

    shoppingCart.splice(found_index, 1, newCartItem);

    // if(found==false){
    //   shoppingCart.push(newCartItem);
    // }

    this.setState({shoppingCardItems: shoppingCart});

    this.calculateTotal(shoppingCart);

    this.setCart(shoppingCart);

    this.setState({successAlrt: true});
  }

  addDishOfDayToCart() {
    let dishOfDay = this.state.DishAndKitchensData.dishOfDay;

    // alert(JSON.stringify(dishOfDay));
    let newCartItem = {
      // item_id: this.state.shoppingCartItems.length,
      food_item_id: dishOfDay.food_item_id,
      kitchen_name: dishOfDay.kitchen_name,
      kitchen_id: dishOfDay.kitchen_id,
      available_count: dishOfDay.available_count,
      item_img: {uri: dishOfDay.image_url},
      item_name: dishOfDay.name,
      item_price_original: dishOfDay.originalPrice,
      item_price_quantity: dishOfDay.priceForRender,
      quantity: dishOfDay.quantity,
      special_request: '',

      food_item_props:
        dishOfDay.food_item_props.length > 0
          ? [
              {
                property_title: dishOfDay.food_item_props[0].property_title,
                choice: '',
              },
            ]
          : [],
    };

    if (dishOfDay.options) {
      for (let i = 0; i < dishOfDay.options.length; i++) {
        if (dishOfDay.options[i].selected == true) {
          newCartItem.food_item_props[0].choice = dishOfDay.options[i].label;
        }
      }
    }

    for (let i = 1; i < dishOfDay.food_item_props.length; i++) {
      newCartItem.food_item_props.push({
        property_title: dishOfDay.food_item_props[i].property_title,
        choice: dishOfDay.food_item_props[i].choices[0],
      });
    }

    let shoppingCart = this.state.shoppingCartItems;

    let found = false;

    /**
     *  {"food_item_id": "1",
     * "food_item_props": [{"choice": "spicy", "property_title": "flavour"},
     *  {"choice": "small", "property_title": "size"}],
     *  "item_img": {"uri": "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/delish-202001-mozzarella-stuffed-chicken-parm-0266-portrait-pf-1583438260.jpg"},
     * "item_name": "Mozzarella Stuffed Chicken Parm",
     *  "item_price_original": 45, "item_price_quantity": 90, "quantity": 2, "special_request": ""}
     */

    for (
      var found_index = 0;
      found_index < shoppingCart.length;
      found_index++
    ) {
      if (
        newCartItem.food_item_id == shoppingCart[found_index].food_item_id &&
        JSON.stringify(newCartItem.food_item_props) ==
          JSON.stringify(shoppingCart[found_index].food_item_props)
      ) {
        // shoppingCart[found_index].quantity+=newCartItem.quantity;

        newCartItem.quantity += shoppingCart[found_index].quantity;
        newCartItem.item_price_quantity =
          newCartItem.item_price_original * newCartItem.quantity;

        found = true;
        break;
      }
    }

    shoppingCart.splice(found_index, 1, newCartItem);

    // if(found==false){
    //   shoppingCart.push(newCartItem);
    // }

    this.setState({shoppingCardItems: shoppingCart});

    this.calculateTotal(shoppingCart);

    this.setState({successAlrt: true});

    this.setCart(shoppingCart);
  }

  /*
        {
      "kitchen_id": "1",
      "name": "Chiken Eldawly",
      "services": "Chiken Salads",
      "address": "Elzeraa square 23 st",
      "lat": "30.5855",
      "lng": "31.5207",
      "date": "2020-05-21 01:55:13.057846",
      "image": "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/190313-creamy-lemon-parmesan-chicken-horizontal-1553026901.png",
      "badge": "none",
      "rating": {
        "no_of_rating": "6",
        "rating_score": "4.5000"
      }
    },
        
        */

  toggleSwitch = value => {
    this.setState({
      switchValue: value,
      kitchen_data: [{food_items: []}],
      Kitchens: [],
      makeSearch: false,
    });
  };

  _renderAllItemsWithCategories = ({item, index}) => (
    <View>
      {item.food_items.map(innerItem => {
        return (
          <>
            <View
              style={styles.itemsContentStyles}
              key={innerItem.food_item_id}>
              <TouchableOpacity
                style={{width: '40%'}}
                onPress={() => {
                  this.props.navigation.navigate('FoodItemDetailsPage', {
                    food_item_data: JSON.stringify(innerItem),
                  });
                }}>
                <View style={{flex: 1}}>
                  <Image
                    source={{uri: innerItem.image_url}}
                    style={{
                      flex: 1,
                      width: null,
                      height: null,
                      paddingBottom: 15,
                      borderTopLeftRadius: 20,
                      borderBottomLeftRadius: 20,
                    }}
                  />

                  {innerItem.badge != 'none' ? (
                    <Badge
                      style={{
                        position: 'absolute',
                        left: 5,
                        top: 5,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#EB3762',
                      }}>
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: 13,
                        }}>
                        {innerItem.badge == 'discount'
                          ? '-' + innerItem.discount + '%'
                          : innerItem.badge == 'new'
                          ? 'new'
                          : null}
                      </Text>
                    </Badge>
                  ) : null}
                </View>
              </TouchableOpacity>
              <View
                style={{
                  // backgroundColor: '#ff0',
                  paddingLeft: 10,
                  width: '60%',
                }}>
                <View
                  style={{
                    // marginLeft: 10,
                    // width: '75.3%',
                    justifyContent: 'center',
                    // alignItems: 'center',
                    paddingBottom: 15,
                    // backgroundColor: '#f0f',
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      // width:'90%',
                      // fontWeight: '600',
                      fontSize: 14,
                      fontFamily: 'Janna LT Bold',
                      color: '#969696',
                      marginTop: 5,
                      paddingLeft: 0,
                      // backgroundColor: '#00f'
                    }}>
                    {innerItem.kitchen_name}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={{fontSize: 16, fontFamily: 'Janna LT Bold'}}>
                    {innerItem.name}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'column',
                    paddingBottom: 10,
                    marginTop: -10,
                    // alignItems: 'center',
                    // justifyContent: 'space-between',
                  }}>
                  {/* <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                      width: '100%',
                      overflow: 'hidden',
                      // backgroundColor: '#f0f',
                    }}>
                    {innerItem.options ? (
                      <>
                        <>
                          {innerItem.showAllOption == false ? (
                            <RadioGroup
                              style={{justifyContent: 'felx-start'}}
                              radioButtons={innerItem.twoArrayOptions}
                              onPress={options => {
                                this.updateRadioButtonsOptions1(
                                  options,
                                  item.food_items.indexOf(innerItem),
                                  index,
                                );
                              }}
                            />
                          ) : null}
                        </>

                        {innerItem.showAllOption == true ? (
                          <RadioGroup
                            style={{justifyContent: 'felx-start'}}
                            radioButtons={innerItem.options}
                            onPress={options => {
                              this.updateRadioButtonsOptions1(
                                options,
                                item.food_items.indexOf(innerItem),
                                index,
                              );
                            }}
                          />
                        ) : innerItem.options.length > 1 ? (
                          <TouchableOpacity
                            style={{
                              // backgroundColor: '#0fff',
                              marginTop: 15,
                              marginLeft: 10,
                            }}
                            onPress={() => {
                              this.props.navigation.navigate(
                                'FoodItemDetailsPage',
                                {
                                  food_item_data: JSON.stringify(innerItem),
                                },
                              );
                            }}>
                            <Text
                              style={{
                                color: '#2fcc70',
                                borderBottomColor: '#0f0',
                                fontFamily: 'Janna LT Bold',
                                textAlign: 'center',
                              }}>
                              عرض المزيد
                            </Text>
                          </TouchableOpacity>
                        ) : null}
                      </>
                    ) : null}
                  </View> */}

                  <View
                    style={{
                      width: '50%',
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <TouchableOpacity
                        onPress={() => {
                          let indexOfItemData = item.food_items.indexOf(
                            innerItem,
                          );

                          let indexofKitchenData = this.state.kitchen_data.indexOf(
                            item,
                          );

                          this.quantityButton_insearch(
                            indexofKitchenData,
                            indexOfItemData,
                            'remove',
                          );
                        }}
                        style={{
                          // margin: 10,
                          width: 30,
                          height: 30,
                          borderRadius: 50,
                          borderWidth: 1,
                          borderColor: '#ddd',
                          // backgroundColor: '#ddd',
                          justifyContent: 'center',
                          alignItems: 'center',
                          // padding: 5,
                        }}>
                        <IconVector
                          name="minus"
                          style={{textAlign: 'center'}}
                          size={16}
                        />
                      </TouchableOpacity>

                      <View style={{marginLeft: 5, marginRight: 5}}>
                        <Text style={{fontWeight: '600', fontSize: 18}}>
                          {innerItem.quantity}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          let indexOfItemData = item.food_items.indexOf(
                            innerItem,
                          );
                          // alert(JSON.stringify(item ))
                          // alert(x)
                          let indexofKitchenData = this.state.kitchen_data.indexOf(
                            item,
                          );
                          this.quantityButton_insearch(
                            indexofKitchenData,
                            indexOfItemData,
                            'add',
                          );
                        }}
                        style={{
                          // margin: 10,
                          width: 30,
                          height: 30,
                          borderRadius: 50,
                          borderWidth: 1,
                          borderColor: '#ddd',
                          // backgroundColor: '#ddd',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: 5,
                        }}>
                        <IconVector name="plus" />
                      </TouchableOpacity>
                    </View>
                    <Text
                      style={{
                        // fontWeight: '600',
                        fontFamily: 'Janna LT Bold',
                        fontSize: 16,
                        alignSelf: 'center',
                        // marginLeft: -20,
                      }}>
                      {numbro(innerItem.priceForRender).format({
                        thousandSeparated: true,
                        mantissa: 2, // number of decimals displayed
                      })}{' '}
                      جنية
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  this.addToCart(item.food_items.indexOf(innerItem), index);
                }}
                style={{
                  position: 'absolute',
                  right: -10,
                  top: -10,
                  backgroundColor: '#2fcc70',
                  // padding: 10,
                  width: 45,
                  height: 45,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 45,
                }}>
                <View>
                  <IconVector
                    name="shopping-cart"
                    size={25}
                    style={{color: 'white'}}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </>
        );
      })}
    </View>
  );

  _renderKitchenData_search = ({item}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          // alert(item.kitchen_id)
          if (item.open == '1') {
            this.props.navigation.navigate('KitchenDetailsPage', {
              kitchenData: JSON.stringify(item),
            });
          } else {
            // Alert.alert(
            //   'المطبخ مغلق',
            //   'نحن آسفون ' +
            //     item.name +
            //     ' مغلق حاليًا ولا يقبل الطلبات في الوقت الحالي. يمكنك الاستمرار في إضافة عناصر إلى سلة التسوق الخاصة بك وطلبها عندما يكون المطعم مفتوحًا لتلقي الحجوزات.',
            //   [
            //     {text: 'إلغاء', onPress: () => console.log('cansel')},
            //     {
            //       text: 'حسناّ الذهاب',
            //       onPress: () => {
            //         this.props.navigation.navigate('KitchenDetailsPage', {
            //           kitchenData: JSON.stringify(item),
            //         });
            //       },
            //     },
            //   ],
            // );
            this.setState({
              worning_text:
                'نحن آسفون ' +
                item.name +
                ' مغلق حاليًا ولا يقبل الطلبات في الوقت الحالي. يمكنك الاستمرار في إضافة عناصر إلى سلة التسوق الخاصة بك وطلبها عندما يكون المطعم مفتوحًا لتلقي الحجوزات.',
              model_erorrs: true,
              go_kitchen_data: JSON.stringify(item),
            });
          }
        }}>
        <View
          style={{
            width: '90%',
            margin: '5%',
            // height: 150,
            backgroundColor: '#fff',
            flexDirection: 'row',
            borderRadius: 20,
            // overflow: 'hidden',
            borderBottomLeftRadius: 20,
            borderTopRightRadius: 20,
          }}>
          <View
            style={{
              width: '33.3%',
              borderBottomLeftRadius: 20,
              borderTopRightRadius: 20,
            }}>
            <Image
              // width={100}
              source={{uri: item.image}}
              // source={{uri: 'http://placehold.it/350x150'}}
              style={{
                flex: 1,
                width: '100%',
                // resizeMode: 'cover',
                height: '100%',
                borderBottomLeftRadius: 20,
                borderTopRightRadius: 20,
              }}
            />
            {item.open == '1' ? (
              <>
                {item.badge == 'new' ? (
                  <Badge
                    style={{
                      position: 'absolute',
                      left: 5,
                      top: 5,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#EB3762',
                    }}>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 13,
                      }}>
                      جديد
                    </Text>
                  </Badge>
                ) : null}
              </>
            ) : (
              <>
                <View
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#000',
                    opacity: 0.6,
                    borderBottomLeftRadius: 20,
                    borderTopRightRadius: 20,
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',

                    borderBottomLeftRadius: 20,
                    borderTopRightRadius: 20,
                  }}>
                  <Text
                    style={{
                      position: 'absolute',
                      color: '#f04',
                      textAlign: 'center',
                      fontSize: 20,
                      fontWeight: 'bold',
                    }}>
                    مفلق
                  </Text>
                </View>
              </>
            )}
          </View>
          <View style={{marginLeft: 20, width: '59.6%', marginTop: 10}}>
            <Text style={{fontWeight: '600', fontSize: 15}}>{item.name}</Text>
            {item.services ? (
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                length={80}
                style={{
                  fontWeight: '400',
                  fontSize: 15,
                  color: '#969696',
                  marginTop: 10,
                  width: '85%',
                  // height:46,
                  // lineHeight:23,
                  // backgroundColor:'#f00'
                  // textAlign: 'justify',
                }}>
                {item.services}
                {/* {item.services.length>=35?"...":null} */}
              </Text>
            ) : (
              <Text> </Text>
            )}
            <View
              style={{
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                flexDirection: 'row',
              }}>
              <Rating
                readonly={true}
                type="star"
                // ratingImage={WATER_IMAGE}
                ratingColor="#3498db"
                ratingBackgroundColor="#c8c7c8"
                ratingCount={5}
                imageSize={25}
                startingValue={item.rating.rating_score}
                // onFinishRating={this.ratingCompleted}
                style={{paddingVertical: 10}}
              />
              <Text style={{margin: 10, fontWeight: '800'}}>
                ({item.rating.no_of_rating})
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  openDishOfDayDetails() {
    let dishOfDay = this.state.DishAndKitchensData.dishOfDay;
    let item_data = {
      food_item_id: dishOfDay.food_item_id,
      name: dishOfDay.name,
      image_url: dishOfDay.image_url,
      price: dishOfDay.price,
      ingredient: dishOfDay.ingredient,
      discount: dishOfDay.discount,
      category_id: dishOfDay.category_id,
      kitchen_id: dishOfDay.kitchen_id,
      date: dishOfDay.date,
      available_count: '1000',
      quantity: 1,
      originalPrice: dishOfDay.purePrice,
      priceForRender: dishOfDay.purePrice,
      purePrice: dishOfDay.purePrice,
      badge: dishOfDay.badge,
      options: dishOfDay.options,
      food_item_props: dishOfDay.food_item_props,
      kitchen_name: dishOfDay.kitchen_name,
    };

    this.props.navigation.navigate('FoodItemDetailsPage', {
      food_item_data: JSON.stringify(item_data),
    });
  }

  _renderDishOfDay = () => {
    return (
      <>
        <FadeInView>
          <Text style={styles.dishOfTheDayText}>طبق اليوم </Text>
          <View style={styles.dishOfTheDayContent}>
            <TouchableOpacity
              style={{width: '33.3%'}}
              onPress={() => {
                this.openDishOfDayDetails();
              }}>
              <View style={{flex: 1}}>
                <Image
                  source={{
                    uri: this.state.DishAndKitchensData.dishOfDay.image_url,
                  }}
                  style={{
                    flex: 1,
                    width: null,
                    height: null,
                    paddingBottom: 15,
                    borderTopLeftRadius: 20,
                    borderBottomLeftRadius: 20,
                  }}
                />

                {this.state.DishAndKitchensData.dishOfDay.badge != 'none' ? (
                  <Badge
                    style={{
                      position: 'absolute',
                      left: 5,
                      top: 5,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#EB3762',
                    }}>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 13,
                      }}>
                      {this.state.DishAndKitchensData.dishOfDay.badge ==
                      'discount'
                        ? '-' +
                          this.state.DishAndKitchensData.dishOfDay.discount +
                          '%'
                        : this.state.DishAndKitchensData.dishOfDay.badge ==
                          'new'
                        ? 'new'
                        : null}
                    </Text>
                  </Badge>
                ) : null}
              </View>
            </TouchableOpacity>
            <View
              style={{
                // backgroundColor: '#ff0',
                paddingLeft: 10,
                width: '66.3%',
              }}>
              <View
                style={{
                  // marginLeft: 10,
                  width: '70.3%',
                  justifyContent: 'center',
                  // alignItems: 'center',
                  paddingBottom: 15,
                  // backgroundColor: '#fff'
                }}>
                <Text
                  numberOfLines={2}
                  style={{
                    // width:'90%',
                    // fontWeight: '600',
                    fontSize: 14,
                    color: '#969696',
                    marginTop: 5,
                    paddingLeft: 0,
                    // backgroundColor: '#00f'
                  }}>
                  {this.state.DishAndKitchensData.dishOfDay.kitchen_name}
                </Text>
                <Text
                  numberOfLines={2}
                  style={{fontWeight: '800', fontSize: 16}}>
                  {this.state.DishAndKitchensData.dishOfDay.name}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  paddingBottom: 10,
                  // alignItems: 'center',
                  // justifyContent: 'space-between',
                }}>
                <View
                  style={{
                    // marginTop: 20,

                    // alignItems: 'center',
                    // justifyContent: 'center',
                    width: '60%',
                    overflow: 'hidden',
                    // marginLeft: -35,
                  }}>
                  {this.state.DishAndKitchensData.dishOfDay.options ? (
                    <RadioGroup
                      // style={{ width:'30%' }}
                      radioButtons={
                        this.state.DishAndKitchensData.dishOfDay.options
                      }
                      onPress={this.updateRadioButtonsOptions}
                    />
                  ) : null}
                </View>
                <View
                  style={{
                    //   flexDirection: 'row',
                    //   marginTop: 75,
                    // marginLeft: -10,
                    marginLeft: '-12%',
                    //   justifyContent: 'flex-end',
                    //   alignItems: 'flex-end',
                    width: '50%',
                    //   backgroundColor: 'red',
                    justifyContent: 'center',
                    alignItems: 'center',
                    // backgroundColor: '#0f0',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      // marginTop: 60,
                      // marginLeft: -30,
                      justifyContent: 'center',
                      alignItems: 'center',
                      //   alignItems: 'flex-end',
                      //   backgroundColor: 'red',
                    }}>
                    <TouchableOpacity
                      onPress={() => this.quantityButton_insearch('minus')}
                      style={{
                        margin: 10,
                        width: 30,
                        height: 30,
                        borderRadius: 50,
                        borderWidth: 1,
                        borderColor: '#ddd',
                        // backgroundColor: '#ddd',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 5,
                      }}>
                      <IconVector name="minus" style={{textAlign: 'center'}} />
                    </TouchableOpacity>
                    <Text style={{fontWeight: '600', fontSize: 18}}>
                      {this.state.DishAndKitchensData.dishOfDay.quantity}
                    </Text>
                    <TouchableOpacity
                      onPress={() => this.quantityButton_insearch('add')}
                      style={{
                        margin: 10,
                        width: 30,
                        height: 30,
                        borderRadius: 50,
                        borderWidth: 1,
                        borderColor: '#ddd',
                        // backgroundColor: '#ddd',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 5,
                      }}>
                      <IconVector name="plus" style={{textAlign: 'center'}} />
                    </TouchableOpacity>
                  </View>
                  <Text
                    style={{
                      fontWeight: '600',
                      fontSize: 16,
                      alignSelf: 'center',
                      // marginLeft: -20,
                    }}>
                    {numbro(
                      this.state.DishAndKitchensData.dishOfDay.priceForRender,
                    ).format({
                      thousandSeparated: true,
                      mantissa: 2, // number of decimals displayed
                    })}{' '}
                    جنيه
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              this.addDishOfDayToCart();
            }}
            style={{
              position: 'absolute',
              right: 0,
              top: 20,
              backgroundColor: '#2fcc70',
              // padding: 10,
              width: 45,
              height: 45,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 45,
            }}>
            <View>
              <IconVector name="shopping-cart" style={{color: 'white'}} />
            </View>
          </TouchableOpacity>
        </FadeInView>
      </>
    );
  };

  openModalToShowImage = image => {
    if (image != '') {
      this.setState({
        showImageInModal: true,
        imageUrlInModal: image,
      });
    }
  };

  _renderKitchenData = ({item}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          // alert(item.kitchen_id)
          this.setState({openitem: item.open});
          if (item.open == '1') {
            this.props.navigation.navigate('KitchenDetailsPage', {
              kitchenData: JSON.stringify(item),
            });
          } else {
            this.setState({
              worning_text:
                'نحن آسفون ' +
                item.name +
                ' مغلق حاليًا ولا يقبل الطلبات في الوقت الحالي. يمكنك الاستمرار في إضافة عناصر إلى سلة التسوق الخاصة بك وطلبها عندما يكون المطعم مفتوحًا لتلقي الحجوزات.',
              model_erorrs: true,
              go_kitchen_data: JSON.stringify(item),
            });
          }
        }}>
        <View
          style={{
            width: '90%',
            margin: '3%',
            // height: 150,
            backgroundColor: '#fff',
            flexDirection: 'row',
            borderRadius: 20,
            minHeight: 150,
            // overflow: 'hidden',
            // elevation: .5,
            borderBottomLeftRadius: 20,
            borderTopRightRadius: 20,
            alignSelf: 'center',
            borderWidth: 0.5,
            borderColor: '#ddd',
          }}>
          <TouchableOpacity
            onPress={() => {
              this.openModalToShowImage(item.image);
            }}
            style={{
              width: '50%',
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              borderTopRightRadius: 20,
              borderTopLeftRadius: 20,
              // backgroundColor: 'red',
            }}>
            <Image
              // width={100}
              source={
                item.image
                  ? {uri: item.image}
                  : require('./images/logo-home.png')
              }
              // source={{uri: 'http://placehold.it/350x150'}}
              style={{
                flex: 1,
                width: '100%',
                // resizeMode: 'cover',
                height: '100%',
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
                borderTopRightRadius: 20,
                borderTopLeftRadius: 20,
              }}
            />
            {item.open == '1' &&
            this.chackTime(item.kitchen_start_time, item.kitchen_end_time) ? (
              <>
                {item.badge == 'new' ? (
                  <Badge
                    style={{
                      position: 'absolute',
                      left: 5,
                      top: 5,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#EB3762',
                    }}>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 13,
                      }}>
                      جديد
                    </Text>
                  </Badge>
                ) : null}
              </>
            ) : (
              <>
                <View
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#000',
                    opacity: 0.6,
                    borderBottomLeftRadius: 20,
                    borderTopRightRadius: 20,
                    // borderBottomLeftRadius:20
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',

                    borderBottomLeftRadius: 20,
                    borderTopRightRadius: 20,
                  }}>
                  <Image source={require('./images/close2.png')} />
                </View>
              </>
            )}
          </TouchableOpacity>
          <View
            style={{
              // marginLeft: 20,
              width: '50%',
              // backgroundColor: 'red',
              padding: 10,
              justifyContent: 'space-around',
              // marginTop: 5,
              // flexWrap: 'wrap',
            }}>
            <View>
              <Text
                numberOfLines={1}
                style={{
                  // fontWeight: '600',
                  fontFamily: 'Janna LT Bold',
                  fontSize: 18,
                  // paddingVertical: 20,
                  // textAlign: 'center',
                }}>
                {item.name}
              </Text>
            </View>

            {item.services ? (
              <View>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  length={80}
                  style={{
                    fontWeight: '400',
                    fontSize: 15,
                    color: '#969696',
                    marginTop: 0,
                    width: '85%',
                    // height:46,
                    // lineHeight:23,
                    // backgroundColor:'#f00'
                    // textAlign: 'justify',
                  }}>
                  {item.services}
                  {/* {item.services.length>=35?"...":null} */}
                </Text>
              </View>
            ) : null}

            {item.city ? (
              <View>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  // length={80}
                  style={{
                    fontWeight: '400',
                    fontSize: 15,
                    color: '#969696',
                    marginTop: 3,
                    width: '85%',
                    // height:46,
                    // lineHeight:23,
                    // backgroundColor: '#f00',
                    // textAlign: 'justify',
                  }}>
                  {item.city}
                  {/* {item.services.length>=35?"...":null} */}
                </Text>
              </View>
            ) : null}
            <View
              style={{
                // justifyContent: 'flex-start',
                // alignItems: 'flex-start',
                flexWrap: 'wrap',
                flexDirection: 'row',
                // marginBottom: 5,
                // marginRight:20
              }}>
              <Rating
                readonly={true}
                type="star"
                // ratingImage={WATER_IMAGE}
                ratingColor="#3498db"
                ratingBackgroundColor="#c8c7c8"
                ratingCount={5}
                imageSize={22}
                startingValue={item.rating.rating_score}
                // onFinishRating={this.ratingCompleted}
                style={{}}
              />
              <Text style={{fontWeight: '800'}}>
                ({item.rating.no_of_rating}){' '}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  shoppingQuantityButton = (kind, index) => {
    let shoppingCartItems = this.state.shoppingCartItems;
    let Total = parseFloat(this.state.Total);

    if (kind == 'add') {
      if (
        shoppingCartItems[index].available_count >
        shoppingCartItems[index].quantity
      ) {
        shoppingCartItems[index].quantity =
          shoppingCartItems[index].quantity + 1;
        shoppingCartItems[index].item_price_quantity =
          shoppingCartItems[index].quantity *
          shoppingCartItems[index].item_price_original;
        Total += parseFloat(shoppingCartItems[index].item_price_original);
      } else {
        Alert.alert(
          'تسلم',
          'العدد المتاح لهذا العنصر هو ' +
            shoppingCartItems[index].available_count,
        );
      }
    } else {
      if (shoppingCartItems[index].quantity == 1) {
        Alert.alert('تسلم', 'يجب أن تكون الكمية أكبر من واحد');
      } else {
        Total -= parseFloat(shoppingCartItems[index].item_price_original);
        shoppingCartItems[index].quantity =
          shoppingCartItems[index].quantity - 1;
        shoppingCartItems[index].item_price_quantity =
          shoppingCartItems[index].quantity *
          shoppingCartItems[index].item_price_original;

        // alert(shoppingCartItems[index].item_price_quantity)
      }
    }

    this.setState({
      shoppingCartItems,
      Total,
    });
    this.setCart(shoppingCartItems);
    // this.calculateTotal()
  };

  removeShoppingItem = index => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
    let shoppingCardItems = this.state.shoppingCartItems;
    // alert(shoppingCardItems[index].item_price_quantity)
    let Total =
      parseFloat(this.state.Total) -
      parseFloat(shoppingCardItems[index].item_price_quantity);
    shoppingCardItems.splice(index, 1);

    this.setState({
      shoppingCardItems,
      Total,
    });
    this.setCart(shoppingCardItems);
    // this.calculateTotal()
  };

  render() {
    //assign styles
    const {
      container,
      iconHeaderStyle,
      viewOfSearchBar,
      dishOftheDayStyle,
      dishOfTheDayText,
      dishOfTheDayContent,
      kitchenText,
    } = styles;

    // let selectedButton = this.state.DishAndKitchensData.dishOfDay.options.find(
    //   e => e.selected == true,
    // )
    // selectedButton = selectedButton
    //   ? selectedButton.value
    //   : this.state.DishAndKitchensData.dishOfDay.options[0].label

    return (
      <Container
        style={{
          backgroundColor:
            this.state.model_loding == false ? '#F9F9F9' : '#ddd',
          opacity: this.state.model_loding == false ? null : 0.2,
        }}>
        {/* <Text>Value = {selectedButton}</Text> */}
        <Header
          androidStatusBarColor="#2fcc70"
          style={{backgroundColor: 'transparent', elevation: 0}}>
          <Body>
            <View style={{flexDirection: 'row'}}>
              <Left style={{}}>
                <TouchableOpacity
                  onPress={() => {
                    // if (this.state.UserStatus == null || this.state.UserStatus == 'intro_null') {
                    //   this.setState({ model_loding: true })
                    // } else {
                    // }
                    this.openDrawer();
                    // alert(JSON.stringify(this.props.navigation))
                  }}>
                  <IconVector name="bars" style={iconHeaderStyle} size={25} />
                </TouchableOpacity>
              </Left>

              {this.state.open_search == false ? (
                <>
                  <Title
                    style={{alignSelf: 'center', justifyContent: 'center'}}>
                    <Text
                      style={{
                        fontSize: 16,
                        letterSpacing: 1.5,
                        color: '#333',
                        fontFamily: 'Metropolis',
                        // textAlign: 'center',

                        // marginHorizontal: 15,
                        // lineHeight: 25,
                      }}>
                      <Text
                        style={{
                          color: '#2fcc70',
                          fontSize: 20,
                          fontFamily: 'Janna LT Bold',
                        }}>
                        Teslm
                      </Text>
                    </Text>
                  </Title>
                  <Right>
                    <TouchableOpacity
                      onPress={() => {
                        LayoutAnimation.configureNext(
                          LayoutAnimation.Presets.linear,
                        );

                        this.setState({open_search: true});
                        this.getMealsHistory();
                        this.getKitchensHistory();
                      }}
                      style={{marginRight: 10}}>
                      <IconVector
                        name="search"
                        style={{
                          alignSelf: 'center',
                          color: '#777',
                          fontSize: 18,
                          marginLeft: 15,
                        }}
                      />
                    </TouchableOpacity>
                  </Right>
                </>
              ) : (
                <>
                  <Animatable.View
                    animation="fadeInLeft"
                    style={[
                      styles.viewOfSearchBar,
                      {
                        borderColor: this.state.searchBorderColor,
                        borderWidth: this.state.searchBorderWidth,
                      },
                    ]}>
                    <TouchableOpacity
                      onPress={() => {
                        if (this.state.searchInputValue.length > 0) {
                          this.setState({
                            searchInputValue: '',
                            makeSearch: false,
                          });
                          this.getKitchens();
                        } else {
                          this.setState({
                            open_search: false,
                            show_Archife: false,
                          });
                          LayoutAnimation.configureNext(
                            LayoutAnimation.Presets.linear,
                          );
                        }
                      }}
                      style={{alignItems: 'center', justifyContent: 'center'}}>
                      <IconVector
                        name="times-circle"
                        style={{
                          alignSelf: 'center',
                          color: '#777',
                          fontSize: 18,
                          marginLeft: 15,
                        }}
                      />
                    </TouchableOpacity>

                    <Input
                      onFocus={() => {
                        this.setState({
                          searchBorderColor: '#2fcc70',
                          searchBorderWidth: 1,
                        });
                      }}
                      onBlur={() => {
                        this.setState({
                          searchBorderColor: '#ddd',
                          searchBorderWidth: 0.4,
                        });
                      }}
                      placeholder="بحث"
                      value={this.state.searchInputValue}
                      onChangeText={value => {
                        setTimeout(() => {
                          this.makeSearchFun();
                        }, 2);

                        this.setState({
                          searchInputValue: value,
                          makeSearch: false,
                        });
                        if (value.length > 0) {
                          this.setState({show_delete: true});
                        }
                      }}
                      placeholderTextColor="#ddd"
                      style={{
                        //   justifyContent: 'center',
                        alignSelf: 'center',
                        //   marginTop: -10,
                        paddingLeft: 10,
                        fontWeight: 'bold',
                        marginRight: 10,
                      }}
                    />
                  </Animatable.View>
                </>
              )}
            </View>
          </Body>
        </Header>
        {/* make filter categories */}
        <View>
          {this.state.open_search == true ? (
            <>
              <Animatable.View
                animation="zoomIn"
                delay={300}
                style={{
                  alignSelf: 'center',
                  width: '100%',
                  justifyContent: 'center',
                  marginTop: 10,
                  flexDirection: 'row',
                }}>
                <View
                  style={{
                    alignSelf: 'center',
                    width: '50%',
                    marginHorizontal: '5%',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    // backgroundColor:"#f00"
                  }}>
                  <Text
                    style={{color: !this.state.switchValue ? '#999' : '#000'}}>
                    وجبات
                  </Text>
                  <Switch
                    trackColor={{true: '#81b0ff', false: '#81b0ff'}}
                    thumbColor={this.state.switchValue ? '#2fcc70' : '#f9bb3f'}
                    onValueChange={this.toggleSwitch.bind(this)}
                    value={this.state.switchValue}
                  />

                  <Text
                    style={{color: this.state.switchValue ? '#999' : '#000'}}>
                    مطابخ
                  </Text>
                </View>
              </Animatable.View>

              {this.state.kitchensSearch.length > 0 ||
              this.state.mealsSearch.length > 0 ? (
                this.state.show_Archife == false ? (
                  <Animatable.View animation="flipInY" delay={600} />
                ) : null
              ) : null}

              {this.state.show_Archife ? (
                this.state.switchValue ? (
                  this.state.mealsSearch.length > 0 ? (
                    <ScrollView>
                      <View
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                        }}>
                        {this.state.mealsSearch.map((mealSearchKey, index) => (
                          <>
                            <Animatable.View animation="bounceIn">
                              <TouchableOpacity
                                onPress={() => {
                                  // this.getMealsHistory(mealSearchKey)
                                  // alert(mealSearchKey)
                                  this.historygetMeals(mealSearchKey);
                                }}
                                style={{
                                  // borderWidth:2,
                                  borderRadius: 20,
                                  backgroundColor: '#2fcc70',
                                  padding: 5,
                                  paddingHorizontal: 10,
                                  margin: 10,
                                  flexDirection: 'row',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  alignSelf: 'center',
                                }}>
                                <IconVector
                                  name="history"
                                  color={'#fff'}
                                  style={{
                                    fontWeight: 'bold',
                                    fontSize: 17,
                                  }}
                                />

                                <Text
                                  style={{
                                    color: '#fff',
                                    marginLeft: 5,
                                  }}>
                                  {mealSearchKey}
                                </Text>
                              </TouchableOpacity>
                            </Animatable.View>
                          </>
                        ))}
                      </View>

                      <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                        <TouchableOpacity
                          onPress={() => {
                            this.setState({
                              open_search: false,
                              makeSearch: false,
                              searchInputValue: '',
                              show_Archife: false,
                            });
                            this.getKitchens();
                            LayoutAnimation.configureNext(
                              LayoutAnimation.Presets.linear,
                            );
                          }}
                          style={{
                            // borderWidth:2,
                            borderRadius: 20,
                            backgroundColor: '#f00',
                            paddingHorizontal: 20,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                            padding: 5,
                          }}>
                          <IconVector
                            name="times-circle"
                            color={'#fff'}
                            style={{
                              fontWeight: 'bold',
                              fontSize: 17,
                            }}
                          />

                          <Text
                            style={{
                              color: '#fff',
                              marginLeft: 5,
                            }}>
                            الغاء
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </ScrollView>
                  ) : (
                    <Text
                      style={{
                        marginTop: 10,
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#969696',
                        fontSize: 16,
                      }}>
                      فقط اكتب ما تريد البحث عنه
                    </Text>
                  )
                ) : this.state.kitchensSearch.length > 0 ? (
                  <ScrollView>
                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                      }}>
                      {this.state.kitchensSearch.map(kitchenSearchKey => (
                        <>
                          <Animatable.View animation="pulse">
                            <TouchableOpacity
                              onPress={() => {
                                this.historygetKitchens(kitchenSearchKey);
                                // alert('0')
                              }}
                              style={{
                                // borderWidth:2,
                                borderRadius: 20,
                                backgroundColor: '#2fcc70',
                                padding: 5,
                                paddingHorizontal: 10,
                                margin: 10,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                              }}>
                              <IconVector
                                name="history"
                                color={'#fff'}
                                style={{
                                  fontWeight: 'bold',
                                  fontSize: 17,
                                }}
                              />
                              <Text
                                style={{
                                  color: '#fff',
                                  marginLeft: 5,
                                }}>
                                {kitchenSearchKey}
                              </Text>
                            </TouchableOpacity>
                          </Animatable.View>
                        </>
                      ))}
                    </View>
                    <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                      <TouchableOpacity
                        onPress={() => {
                          this.setState({
                            open_search: false,
                            makeSearch: false,
                            searchInputValue: '',
                            show_Archife: false,
                          });
                          this.getKitchens();
                          LayoutAnimation.configureNext(
                            LayoutAnimation.Presets.linear,
                          );
                        }}
                        style={{
                          // borderWidth:2,
                          borderRadius: 20,
                          backgroundColor: '#f00',
                          paddingHorizontal: 20,
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignSelf: 'center',
                          padding: 5,
                        }}>
                        <IconVector
                          name="times-circle"
                          color={'#fff'}
                          style={{
                            fontWeight: 'bold',
                            fontSize: 17,
                          }}
                        />

                        <Text
                          style={{
                            color: '#fff',
                            marginLeft: 5,
                          }}>
                          الغاء
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                ) : (
                  <Text
                    style={{
                      marginTop: 10,
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#969696',
                      fontSize: 16,
                    }}>
                    فقط اكتب ما تريد البحث عنه{' '}
                  </Text>
                )
              ) : null}
            </>
          ) : null}

          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {this.state.filterCategories.map(filterItem => {
              return (
                <TouchableOpacity
                  key={filterItem.fiter_id}
                  onPress={() => {
                    let indexofItem = this.state.filterCategories.indexOf(
                      filterItem,
                    );
                    this.selectCategoryFromHorizntalScrollView(
                      filterItem.filter_name,
                      indexofItem,
                    );
                  }}
                  style={{
                    height: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 15,
                    margin: 10,
                    borderWidth: 1,
                    borderColor: '#2fcc70',
                    borderRadius: 50,
                    backgroundColor:
                      filterItem.selected == true ? '#2fcc70' : '#fff',
                  }}>
                  <View
                    style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Text
                      style={{
                        alignSelf: 'center',
                        fontFamily: 'Janna LT Bold',
                      }}>
                      {filterItem.filter_name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refresh}
              onRefresh={() => {
                this.refresh_getKitchens();
                console.log('hi');
              }}
            />
          }>
          <View
            style={{
              paddingBottom: 50,
            }}>
            <View style={dishOftheDayStyle}>
              {this.state.DishAndKitchensData.dishOfDay.name
                ? this._renderDishOfDay()
                : null}
            </View>

            {/* Render All Kitchens  */}

            {this.state.open_search == false ? (
              <View style={{width: '90%', margin: '5%'}}>
                <Text style={[kitchenText]}>المطابخ </Text>
              </View>
            ) : null}

            {this.state.connection_Status == 'Online' ? (
              this.state.loading_kitchens == 'loading' ? (
                <>
                  <Image
                    source={require('./images/cooking_loader_0.gif')}
                    style={{width: '100%'}}
                  />
                  <Text
                    style={{
                      color: '#2fcc70',
                      textAlign: 'center',
                      fontSize: 18,
                      marginTop: 10,
                      fontWeight: 'bold',
                    }}>
                    جاري تحميل المطابخ......
                  </Text>
                </>
              ) : this.state.loading_kitchens == 'have_data' ? (
                this.state.makeSearch == false ? (
                  <>
                    <>
                      <FlatList
                        data={this.state.DishAndKitchensData.Kitchens}
                        renderItem={this._renderKitchenData}
                        keyExtractor={item => item.kitchen_id}
                        extraData={this.state.DishAndKitchensData.Kitchens}
                      />

                      {this.state.serverDataCount >
                      this.state.DishAndKitchensData.Kitchens.length ? (
                        <TouchableOpacity
                          disabled={this.state.see_more_loading}
                          onPress={() => {
                            this.setState({see_more_loading: true});
                            this.getKitchens();
                          }}
                          style={{
                            width: '60%',
                            height: 40,
                            backgroundColor: '#2fcc70',
                            borderRadius: 20,
                            alignSelf: 'center',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: 20,
                          }}>
                          {this.state.see_more_loading == false ? (
                            <Text style={{color: '#fff', fontSize: 16}}>
                              شاهد اكثر
                            </Text>
                          ) : (
                            <Spinner color={'#fff'} />
                          )}
                        </TouchableOpacity>
                      ) : null}
                    </>
                  </>
                ) : (
                  <>
                    {this.state.searchFor == 'food_item' ? (
                      <>
                        <ScrollView style={styles.fill}>
                          <View style={{width: '90%', margin: '5%'}}>
                            <Text style={kitchenText}>الوجبات</Text>
                          </View>
                          {this.state.connection_Status == 'Online' ? (
                            this.state.loading_meals == 'loading' ? (
                              <>
                                <Image
                                  source={require('./images/cooking_loader_0.gif')}
                                  style={{
                                    width: '100%',
                                    height: 300,
                                    marginTop: 20,
                                  }}
                                />
                                <Text
                                  style={{
                                    color: '#2fcc70',
                                    textAlign: 'center',
                                    fontSize: 18,
                                    marginTop: 10,
                                    fontWeight: 'bold',
                                  }}>
                                  جاري تحميل الوجبات ....
                                </Text>
                              </>
                            ) : this.state.loading_meals == 'have_data' ? (
                              <>
                                <FlatList
                                  style={{marginTop: 0}}
                                  data={this.state.kitchen_data}
                                  renderItem={(item, index) =>
                                    this._renderAllItemsWithCategories(
                                      item,
                                      index,
                                    )
                                  }
                                  extraData={this.state.kitchen_data}
                                  keyExtractor={item => item.category_id}
                                />
                              </>
                            ) : (
                              <>
                                <Image
                                  source={require('./images/not_found.png')}
                                  style={{
                                    width: '100%',
                                    height: 250,
                                    resizeMode: 'contain',
                                    marginTop: 20,
                                  }}
                                />
                                <Text
                                  style={{
                                    color: '#2fcc70',
                                    textAlign: 'center',
                                    fontSize: 18,
                                    marginTop: 20,
                                    fontWeight: 'bold',
                                  }}>
                                  لا يوجد وجبات .....😕
                                </Text>
                              </>
                            )
                          ) : (
                            <View
                              style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: height / 12,
                              }}>
                              <Image
                                source={require('./images/not_found.png')}
                                style={{
                                  width: '100%',
                                  height: 250,
                                  resizeMode: 'contain',
                                  marginTop: 20,
                                }}
                              />
                              <Text style={{fontSize: 18}}>غير متصل </Text>
                            </View>
                          )}

                          {this.state.meals_serverDataCount >
                          this.state.kitchen_data[0].food_items.length ? (
                            <TouchableOpacity
                              disabled={this.state.meals_see_more_loading}
                              onPress={() => {
                                // this.setState({meals_see_more_loading: true});
                                this.seeMoreButton();
                                // this.getMeals();
                              }}
                              style={{
                                width: '90%',
                                margin: '5%',
                                height: 50,
                                backgroundColor: '#2fcc70',
                                borderRadius: 50,
                                alignSelf: 'center',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: 20,
                              }}>
                              {this.state.meals_see_more_loading == false ? (
                                <Text
                                  style={{
                                    color: '#fff',
                                    fontSize: 16,
                                    fontFamily: 'Janna LT Bold',
                                  }}>
                                  عرض المزيد
                                </Text>
                              ) : (
                                <Spinner color={'#fff'} />
                              )}
                            </TouchableOpacity>
                          ) : null}
                        </ScrollView>
                      </>
                    ) : (
                      <>
                        {/* Render All Kitchens  */}
                        <ScrollView style={styles.fill}>
                          {this.state.searchFor == 'kitchen_item' ? (
                            <View style={{width: '90%', margin: '5%'}}>
                              <Text style={kitchenText}>مطابخ </Text>
                            </View>
                          ) : null}

                          {this.state.connection_Status == 'Online' ? (
                            this.state.loading_kitchens_search == 'loading' ? (
                              <>
                                <Image
                                  source={require('./images/cooking_loader_0.gif')}
                                  style={{width: '100%'}}
                                />
                                <Text
                                  style={{
                                    color: '#2fcc70',
                                    textAlign: 'center',
                                    fontSize: 18,
                                    marginTop: 10,
                                    fontWeight: 'bold',
                                  }}>
                                  جاري تحميل المطابخ .....
                                </Text>
                              </>
                            ) : this.state.loading_kitchens_search ==
                              'have_data' ? (
                              <>
                                <FlatList
                                  data={this.state.Kitchens}
                                  renderItem={this._renderKitchenData_search}
                                  keyExtractor={item => item.kitchen_id}
                                  extraData={this.state.Kitchens}
                                />

                                {this.state.serverDataCount >
                                this.state.Kitchens.length ? (
                                  <TouchableOpacity
                                    disabled={this.state.see_more_loading}
                                    onPress={() => {
                                      this.setState({see_more_loading: true});
                                      // this.getKitchens();
                                    }}
                                    style={{
                                      width: '60%',
                                      height: 40,
                                      backgroundColor: '#2fcc70',
                                      borderRadius: 20,
                                      alignSelf: 'center',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      marginTop: 20,
                                    }}>
                                    {this.state.see_more_loading == false ? (
                                      <Text
                                        style={{color: '#fff', fontSize: 16}}>
                                        شاهد اكثر .....
                                      </Text>
                                    ) : (
                                      <Spinner color={'#fff'} />
                                    )}
                                  </TouchableOpacity>
                                ) : null}
                              </>
                            ) : (
                              <>
                                <Image
                                  source={require('./images/not_found.png')}
                                  style={{
                                    width: '100%',
                                    height: 250,
                                    resizeMode: 'contain',
                                    marginTop: 20,
                                  }}
                                />
                                <Text
                                  style={{
                                    color: '#2fcc70',
                                    textAlign: 'center',
                                    fontSize: 18,
                                    marginTop: 20,
                                    fontWeight: 'bold',
                                  }}>
                                  لا يوجد مطابخ 😕
                                </Text>
                              </>
                            )
                          ) : (
                            <View
                              style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: height / 12,
                              }}>
                              <Image
                                source={require('./images/not_found.png')}
                                style={{
                                  width: '100%',
                                  height: 250,
                                  resizeMode: 'contain',
                                  marginTop: 20,
                                }}
                              />
                              <Text style={{fontSize: 18}}>غير متصل </Text>
                            </View>
                          )}
                        </ScrollView>
                      </>
                    )}
                    {/* end food items */}
                  </>
                )
              ) : (
                <>
                  <Image
                    source={require('./images/not_found.png')}
                    style={{width: '100%', height: 250, resizeMode: 'contain'}}
                  />
                  <Text
                    style={{
                      color: '#2fcc70',
                      textAlign: 'center',
                      fontSize: 18,
                      marginTop: 20,
                      fontWeight: 'bold',
                    }}>
                    لا يوجد مطابخ 😕
                  </Text>
                </>
              )
            ) : (
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: height / 12,
                }}>
                <Image
                  source={require('./images/not_found.png')}
                  style={{width: '100%', height: 250, resizeMode: 'contain'}}
                />
                <Text style={{fontSize: 18}}>غير متصل </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <ModalCart
          style={{
            height: height / 1.6,
            // maxHeight: height / 1.2,
            borderTopRightRadius: 15,
            borderTopLeftRadius: 15,
            backgroundColor: '#F9F9F9',
          }}
          backdropPressToClose={() => true}
          isOpen={this.state.openShoppingCartModal}
          //   isOpen={true}
          backdrop={true}
          onClosed={() => {
            this.setState({
              openShoppingCartModal: false,
            });
          }}
          swipeArea={50}
          position="bottom"
          useNativeDriver={false}>
          {/* <Text>Modal with backdrop content</Text> */}
          <View style={{flexDirection: 'row', width: '90%', margin: '5%'}}>
            {/* <Icon name="md-cart" style={{color: '#D8D8D8'}} />
             */}
            <Image
              source={require('./images/cart.png')}
              style={{height: 35, width: 35, resizeMode: 'stretch'}}
            />

            <Text
              style={{
                marginLeft: 30,
                fontWeight: '800',
                fontSize: 20,
                fontFamily: 'Janna LT Bold',
              }}>
              طلباتك
            </Text>
          </View>

          {this.state.shoppingCartItems.length > 0 ? (
            <ScrollView style={{paddingBottom: 150}}>
              {this.state.shoppingCartItems.map(item => {
                return (
                  <View
                    style={{
                      width: '90%',
                      margin: '5%',
                      flexDirection: 'row',
                      // borderWidth: 1,
                      borderColor: '#ddd',
                      borderRadius: 15,
                      backgroundColor: 'white',
                      // justifyContent:'space-between'
                      // overflow: 'hidden',
                    }}>
                    <View style={{width: '30%'}}>
                      <Image
                        source={item.item_img}
                        style={{
                          flex: 1,
                          width: null,
                          height: null,
                          //   borderTopRightRadius: 15,
                          borderBottomLeftRadius: 15,
                        }}
                      />
                    </View>

                    <View
                      style={{
                        width: '38%',
                        height: '100%',
                        marginLeft: 10,
                        paddingBottom: 10,
                        paddingRight: 20,
                        // backgroundColor:'#f00'
                      }}>
                      <Text
                        numberOfLines={2}
                        style={{
                          fontWeight: '700',
                          marginBottom: 10,
                          marginTop: 10,
                          fontSize: 14,
                          // paddingRight:10
                        }}>
                        {item.item_name}
                      </Text>
                      <Text
                        style={{
                          fontWeight: '500',
                          color: '#474554',
                          marginBottom: 10,
                        }}>
                        {item.food_item_props.length > 0
                          ? item.food_item_props[0].choice
                          : null}
                      </Text>
                      <Text style={{fontWeight: '500', fontSize: 14}}>
                        {numbro(item.item_price_quantity).format({
                          thousandSeparated: true,
                          mantissa: 2, // number of decimals displayed
                        })}{' '}
                        جنيه
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        // bottom: 0,
                        width: '28%',
                        marginLeft: '-5%',
                        paddingTop: 15,
                        // right:0,
                        justifyContent: 'center',
                        // backgroundColor: "#ff0",
                        alignItems: 'center',
                        //   backgroundColor: 'red',
                      }}>
                      <TouchableOpacity
                        onPress={() =>
                          this.shoppingQuantityButton(
                            'minus',
                            this.state.shoppingCartItems.indexOf(item),
                          )
                        }
                        style={{
                          margin: 5,
                          width: 30,
                          height: 30,
                          borderRadius: 50,
                          borderWidth: 1,
                          borderColor: '#ddd',
                          // backgroundColor: '#ddd',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: 5,
                        }}>
                        <IconVector
                          name="minus"
                          style={{textAlign: 'center'}}
                        />
                      </TouchableOpacity>
                      <Text
                        style={{
                          // marginTop: 10,
                          fontWeight: '700',
                          fontSize: 18,
                        }}>
                        {item.quantity}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          this.shoppingQuantityButton(
                            'add',
                            this.state.shoppingCartItems.indexOf(item),
                          )
                        }
                        style={{
                          margin: 5,
                          width: 30,
                          height: 30,
                          borderRadius: 50,
                          borderWidth: 1,
                          borderColor: '#ddd',
                          // backgroundColor: '#ddd',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: 5,
                        }}>
                        <IconVector name="plus" style={{textAlign: 'center'}} />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        this.removeShoppingItem(
                          this.state.shoppingCartItems.indexOf(item),
                        );
                      }}
                      style={{
                        width: 30,
                        height: 30,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'red',
                        borderRadius: 50,
                        position: 'absolute',
                        top: -10,
                        left: -10,
                      }}>
                      <View>
                        <IconVector name="times" style={{color: 'white'}} />
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{fontFamily: 'Janna LT Bold', fontSize: 15}}>
                عربة التسوق الخاصه بك فارغه , تابع التسوق
              </Text>
            </View>
          )}

          <View style={{height: 40}}>
            <View
              style={{
                flexDirection: 'row',
                width: '90%',
                margin: '5%',
                justifyContent: 'space-between',
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                width: '90%',
                margin: '5%',
                justifyContent: 'space-between',
                marginTop: -15,
              }}>
              <Text style={{fontWeight: 'bold'}}>المجموع </Text>

              <Text style={{fontWeight: 'bold'}}>
                {/* {this.state.Total} EGP */}
                {/* {numbro(this.state.Total).format()} */}
                {numbro(this.state.Total).format({
                  thousandSeparated: true,
                  mantissa: 2, // number of decimals displayed
                })}{' '}
                جنيه
              </Text>
            </View>
          </View>

          <View style={{}}>
            <TouchableOpacity
              disabled={this.state.shoppingCartItems.length == 0}
              onPress={() => {
                this.setState({openShoppingCartModal: false});
                if (
                  this.state.UserStatus == null ||
                  this.state.UserStatus == 'intro_null'
                ) {
                  this.setState({model_loding: true});
                  // LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
                } else {
                  this.props.navigation.navigate('CheckOutPage');
                }
              }}
              style={{
                width: '90%',
                margin: '5%',
                alignItems: 'center',

                justifyContent: 'center',
                backgroundColor: '#2fcc70',
                padding: 10,
                borderRadius: 50,
              }}>
              <View>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 18,
                    fontFamily: 'Janna LT Bold',
                  }}>
                  الدفع{' '}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ModalCart>

        <Modal
          animationType="slide"
          transparent={true}
          // presentationStyle={"fullScreen"}
          // statusBarTranslucent={true}
          visible={this.state.model_loding}
          onRequestClose={() => {
            this.setState({model_loding: false});
          }}>
          <View style={{flex: 1}}>
            <View
              style={{
                height: height,
                width: width,
                alignContent: 'center',
                justifyContent: 'center',
              }}>
              <View
                style={{
                  alignSelf: 'center',
                  justifyContent: 'center',
                  width: '80%',
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  elevation: 5,
                  paddingVertical: 10,
                  marginBottom: 10,
                }}>
                <Text
                  style={{
                    color: '#2fcc70',
                    fontWeight: 'bold',
                    fontSize: 22,
                    textAlign: 'center',
                  }}>
                  Teslm
                </Text>
                <Text style={{padding: 15, fontSize: 18}}>
                  برجاء تسجيل الدخول للمتابعة
                </Text>

                <TouchableOpacity
                  style={{
                    width: '90%',
                    alignSelf: 'center',
                    padding: 10,
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    elevation: 3,
                    marginBottom: 20,
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    this.go_login();
                  }}>
                  <MaterialCommunityIcons
                    name="arrow-right-bold-box"
                    size={30}
                    color={'#2fcc70'}
                  />
                  <Text
                    style={{fontWeight: 'bold', color: '#000', fontSize: 16}}>
                    التسجيل
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    width: '90%',
                    alignSelf: 'center',
                    padding: 10,
                    backgroundColor: '#f00',
                    borderRadius: 10,
                    elevation: 3,
                    marginBottom: 20,
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    this.setState({model_loding: false});
                  }}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      textAlign: 'center',
                      color: '#fff',
                      fontSize: 18,
                    }}>
                    إلغاء
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <TouchableOpacity
          style={{
            // borderTopWidth:0.8,
            justifyContent: 'center',
            alignItems: 'center',
            height: 50,
            borderTopLeftRadius: 50,
            borderTopRightRadius: 50,
            backgroundColor: 'white',
          }}
          onPress={() => {
            //   this._panel.show()
            this.getCart();
            this.setState({
              openShoppingCartModal: true,
            });
          }}>
          {/* <Text>Show Slide</Text> */}
          <View style={{width: 20, height: 2, backgroundColor: '#ccc'}} />
          {/* <Icon
            name="md-cart"
            style={{
              color: '#AFAFAF',
              // borderTopWidth: 1,
              // borderTopColor: '#2fcc70',
            }}
          /> */}
          <View style={{flexDirection: 'row'}}>
            {this.state.shoppingCartItems.length != 0 ? (
              <View
                style={{
                  backgroundColor: '#2fcc70',
                  height: 20,
                  width: 20,
                  borderRadius: 50,
                  justifyContent: 'center',
                  alignContent: 'center',
                }}>
                <Text style={{textAlign: 'center', color: '#FFF'}}>
                  {this.state.shoppingCartItems.length}
                </Text>
              </View>
            ) : null}

            <Image
              source={require('./images/cart.png')}
              style={{height: 35, width: 35, resizeMode: 'stretch'}}
            />
          </View>
        </TouchableOpacity>
        {this.state.show ? (
          <TouchableOpacity
            style={{
              zIndex: 400,
              // flex: 5,
              // backgroundColor: '#f00',
              position: 'absolute',
              width: width,
              height: height,
              // marginRight:1000
            }}
            activeOpacity={1}
            onPress={() => {
              this.props.navigation.closeDrawer();
            }}
          />
        ) : null}

        <AwesomeAlert
          show={this.state.successAlrt}
          showProgress={false}
          // progressSize={50}
          title="Success"
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={true}
          showCancelButton={false}
          showConfirmButton={true}
          onDismiss={() => {
            this.setState({successAlrt: false});
          }}
          onConfirmPressed={() => {
            this.setState({successAlrt: false});
          }}
          confirmText="Ok, thanks"
          confirmButtonColor="#50dcc2"
          contentContainerStyle={{borderRadius: 5}}
          // overlayStyle={{ width: '120%', height: '120%' }}
          customView={
            <>
              <Text>تم اضافه العنصر بنجاح </Text>
              <Image
                source={require('./images/cooking_loader_3.gif')}
                style={{
                  width: 250,
                  height: 150,
                  borderRadius: 0,
                  marginTop: 20,
                }}
              />
            </>
          }
        />
        <Modal
          animationType="slide"
          transparent={true}
          // presentationStyle={"fullScreen"}
          // statusBarTranslucent={true}
          visible={this.state.model_erorrs}
          onRequestClose={() => {
            this.setState({model_erorrs: false});
          }}>
          <View style={{flex: 1}}>
            <View
              style={{
                height: height,
                width: width,
                alignContent: 'center',
                justifyContent: 'center',
              }}>
              <View
                style={{
                  alignSelf: 'center',
                  justifyContent: 'center',
                  width: '80%',
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  elevation: 5,
                  paddingVertical: 10,
                  marginBottom: 10,
                }}>
                <Text
                  style={{
                    color: '#2fcc70',
                    fontWeight: 'bold',
                    fontSize: 22,
                    textAlign: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: '#ddd',
                  }}>
                  Teslm
                </Text>
                <Text style={{padding: 15, fontSize: 16, marginBottom: 5}}>
                  {this.state.worning_text}
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                  }}>
                  {this.state.openitem == 0 ? (
                    <TouchableOpacity
                      style={{
                        width: '40%',
                        alignSelf: 'center',
                        padding: 10,
                        backgroundColor: '#2fcc70',
                        borderRadius: 10,
                        elevation: 3,
                        marginBottom: 20,
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                      }}
                      onPress={() => {
                        this.props.navigation.navigate('KitchenDetailsPage', {
                          kitchenData: this.state.go_kitchen_data,
                        });
                        this.setState({model_erorrs: false});
                      }}>
                      {/* <MaterialCommunityIcons
                    name="arrow-right-bold-box"
                    size={30}
                    color={'#2fcc70'}
                  /> */}
                      <Text
                        style={{
                          fontWeight: 'bold',
                          color: '#fff',
                          fontSize: 16,
                        }}>
                        حسناً الذهاب
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    style={{
                      width: '40%',
                      alignSelf: 'center',
                      padding: 10,
                      backgroundColor: '#f00',
                      borderRadius: 10,
                      elevation: 3,
                      marginBottom: 20,
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      this.setState({model_erorrs: false});
                    }}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        textAlign: 'center',
                        color: '#fff',
                        fontSize: 18,
                      }}>
                      إلغاء
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={this.state.showImageInModal}
          transparent={true}
          onRequestClose={() => {
            this.setState({
              showImageInModal: false,
            });
          }}>
          <ImageZoom
            cropWidth={Dimensions.get('window').width}
            cropHeight={Dimensions.get('window').height}
            imageWidth={Dimensions.get('window').width}
            imageHeight={Dimensions.get('window').height}
            enableSwipeDown={true}
            onSwipeDown={() => {
              this.setState({
                showImageInModal: false,
              });
            }}
            useNativeDriver={true}>
            <Image
              style={{width: '100%', height: '100%', resizeMode: 'contain'}}
              source={{
                uri: this.state.imageUrlInModal,
              }}
            />
          </ImageZoom>
        </Modal>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: 'green',

    zIndex: 222,
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    backgroundColor: 'white',
  },
  iconHeaderStyle: {
    marginLeft: 5,
    color: '#2fcc70',
  },
  viewOfSearchBar: {
    // flex: 2,
    flexDirection: 'row',
    height: 40,
    // backgroundColor: 'red',
    // borderWidth: 0.4,
    width: '85%',
    // marginLeft: 20,
    borderRadius: 50,
    // borderColor: this.state.searchBorderColor,
    // paddingRight: 25,
    shadowColor: '#0000',
    shadowOffset: {width: 4, height: 5},
    backgroundColor: '#fff',
    // elevation: 0.2,
  },
  dishOftheDayStyle: {
    width: '90%',
    margin: '5%',
    marginBottom: 0,
  },
  dishOfTheDayText: {
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 5,
  },
  dishOfTheDayContent: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 15,
    backgroundColor: '#fff',
    // borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    shadowOffset: {width: 10, height: 10},
    shadowColor: '#ddd',
    shadowOpacity: 0.8,
    // paddingBottom: 15,
    // elevation: 1,
  },
  kitchenText: {
    fontSize: 18,
    marginLeft: 5,
    fontFamily: 'Janna LT Bold',
  },
  bottomSheet: {
    zIndex: 500,
    position: 'absolute',
    width: width - 100,
    height: height,
    backgroundColor: 'white',
    paddingBottom: 23,
    // marginLeft: (width - 100) * -1,
    shadowOffset: {width: 0.5, height: 0.5},
    shadowOpacity: 0.7,
    elevation: 1,
  },
  itemsContentStyles: {
    flexDirection: 'row',
    width: '90%',
    margin: '5%',
    marginTop: 15,
    backgroundColor: '#fff',
    // borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    shadowOffset: {width: 10, height: 10},
    shadowColor: '#ddd',
    shadowOpacity: 0.8,
    elevation: 1,
    alignSelf: 'center',
  },
});
