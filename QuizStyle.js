import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Image,
  Animated,
  PanResponder,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Container,
  Header,
  Content,
  Card,
  CardItem,
  Thumbnail,
  Button,
  Icon,
  Left,
  Body,
  Right,
  Title,
} from 'native-base';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default class QuizStyle extends Component {
  constructor(props) {
    super(props);
    this.position = new Animated.ValueXY();
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderMove: (evt, gestureState) => {
        // this.position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 120) {
          // Animated.spring(this.position, {
          //   toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy }
          // }).start(() => {
          //   this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
          //     this.position.setValue({ x: 0, y: 0 })
          //   })
          // })
        } else if (gestureState.dx < -120) {
          // Animated.spring(this.position, {
          //   toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy }
          // }).start(() => {
          //   this.setState({ currentIndex: this.state.currentIndex - 1 }, () => {
          //     this.position.setValue({ x: 0, y: 0 })
          //   })
          // })
        }
      },
    });

    this.state = {
      currentIndex: 0,
      lastPage: false,
      Foods: [
        {
          id: '1',
          uri: {
            uri:
              'https://2.bp.blogspot.com/-PQ6LRPuxrRU/WhVybrjjzBI/AAAAAAAAAT8/bW3PYMAmLs4GrarIL-F5LzE_ME4OHVcIQCLcBGAs/s1600/tom%2Bcruise1.jpg',
          },
          liked: false,
        },
        {
          id: '2',
          uri: {
            uri: 'https://wallpapershome.com/images/pages/pic_h/18573.jpg',
          },
          liked: false,
        },
        {
          id: '3',
          uri: {
            uri: 'https://images7.alphacoders.com/677/thumb-350-677798.jpg',
          },
          liked: false,
        },
        {
          id: '4',
          uri: {
            uri: 'https://images4.alphacoders.com/819/thumb-350-819996.jpg',
          },
          liked: false,
        },
        {
          id: '5',
          uri: {
            uri: 'https://images3.alphacoders.com/813/thumb-350-813503.jpg',
          },
          liked: false,
        },
      ],
    };

    this.rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ['-10deg', '0deg', '10deg'],
      extrapolate: 'clamp',
    });

    this.rotateAndTranslate = {
      transform: [
        {
          rotate: this.rotate,
        },
        ...this.position.getTranslateTransform(),
      ],
    };

    this.nextCardOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0, 1],
      extrapolate: 'clamp',
    });

    this.nextCardScale = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0.8, 1],
      extrapolate: 'clamp',
    });
  }

  renderFoods = () => {
    return this.state.Foods.map((item, i) => {
      if (i < this.state.currentIndex) {
        return null;
      } else if (i == this.state.currentIndex) {
        return (
          <Animated.View
            {...this._panResponder.panHandlers}
            key={i}
            style={[
              this.rotateAndTranslate,
              {
                height: SCREEN_HEIGHT - 120,
                width: SCREEN_WIDTH,
                padding: 10,
                position: 'absolute',
              },
            ]}>
            <Image
              style={{
                flex: 1,
                height: null,
                width: null,
                resizeMode: 'cover',
                borderRadius: 20,
              }}
              source={item.uri}
            />

            <Animated.View
              style={{
                zIndex: 1000,
                position: 'absolute',
                bottom: 30,
                left: 50,
              }}>
              <TouchableOpacity
                onPress={() => {
                  item.liked = !item.liked;
                  let index = this.state.Foods.indexOf(item);
                  this.state.Foods[index] = item;
                  this.setState({
                    Foods: this.state.Foods,
                  });
                  // alert(JSON.stringify(this.state.Foods));
                  Animated.timing(this.position, {
                    toValue: {x: -SCREEN_WIDTH - 100, y: -SCREEN_HEIGHT},
                  }).start(() => {
                    this.setState(
                      {
                        currentIndex: this.state.currentIndex + 1,
                        lastPage:
                          this.state.currentIndex + 2 > this.state.Foods.length
                            ? true
                            : false,
                      },
                      () => {
                        this.position.setValue({x: 0, y: 0});
                      },
                    );
                  }, 300);
                }}>
                <Text style={{color: 'white', fontSize: 20}}>Like</Text>
              </TouchableOpacity>
            </Animated.View>
            <Animated.View
              style={{
                zIndex: 1000,
                position: 'absolute',
                bottom: 30,
                right: 50,
              }}>
              <TouchableOpacity
                onPress={() => {
                  Animated.timing(this.position, {
                    toValue: {x: SCREEN_WIDTH + 100, y: SCREEN_HEIGHT},
                  }).start(() => {
                    this.setState(
                      {
                        currentIndex: this.state.currentIndex + 1,
                        lastPage:
                          this.state.currentIndex + 2 > this.state.Foods.length
                            ? true
                            : false,
                      },
                      () => {
                        this.position.setValue({x: 0, y: 0});
                      },
                    );
                  }, 300);
                }}>
                <Text style={{color: 'white', fontSize: 20}}>Dislike</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        );
      } else {
        return (
          <Animated.View
            key={i}
            style={{
              opacity: this.nextCardOpacity,
              transform: [{scale: this.nextCardScale}],
              height: SCREEN_HEIGHT - 120,
              width: SCREEN_WIDTH,
              padding: 10,
              position: 'absolute',
            }}>
            <Image
              style={{
                flex: 1,
                height: null,
                width: null,
                resizeMode: 'cover',
                borderRadius: 20,
              }}
              source={item.uri}
            />
          </Animated.View>
        );
      }
    }).reverse();
  };

  renderLastPage() {
    return (
      <Content>
        <View>
          <Body
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
            }}>
            <Title style={{color: 'red'}}>Wedding Style From Quiz</Title>
          </Body>
        </View>
        <Card>
          <CardItem>
            <Left>
              <Thumbnail source={require('../images/3.jpg')} />
              <Body>
                <Text>Classic / Royal </Text>
                {/* <Text note>GeekyAnts</Text> */}
              </Body>
            </Left>
          </CardItem>
          <CardItem cardBody>
            <Image
              source={require('../images/3.jpg')}
              style={{height: 200, width: null, flex: 1}}
            />
          </CardItem>
          <CardItem>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
              }}>
              <TouchableOpacity
                onPress={() => {
                  alert(JSON.stringify(this.state.Foods));
                }}>
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'green',
                    padding: 20,
                  }}>
                  <Text
                    style={{fontWeight: '600', fontSize: 18, color: 'white'}}>
                    Finish
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.state.Foods.map(item => {
                    item.liked = false;
                  });
                  this.setState({
                    Foods: this.state.Foods,
                  });
                  this.setState({
                    lastPage: false,
                    currentIndex: 0,
                  });
                }}>
                <View
                  style={{
                    opacity: 0.7,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'red',
                    padding: 20,
                    paddingRight: 30,
                  }}>
                  <Text
                    style={{fontWeight: '600', fontSize: 18, color: 'white'}}>
                    Quiz Again
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </CardItem>
        </Card>
      </Content>
    );
  }

  render() {
    return (
      <Container>
        <View style={{height: 60}} />
        <View style={{flex: 1}}>
          {this.state.lastPage ? this.renderLastPage() : this.renderFoods()}
        </View>
        <View style={{height: 60}} />
      </Container>
    );
  }
}

const styles = StyleSheet.create({});
