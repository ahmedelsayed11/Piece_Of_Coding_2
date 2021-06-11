import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import Contacts from 'react-native-contacts';
import {
  Container,
  Header,
  Icon,
  Input,
  Item,
  Button,
  Right,
  Left,
  Body,
  Title,
  Content,
  List,
  Thumbnail,
  ListItem,
  CheckBox,
} from 'native-base';

import {SearchBar} from 'react-native-elements';
import {RecyclerListView, DataProvider, LayoutProvider} from 'recyclerlistview';

const ViewTypes = {
  FULL: 0,
  HALF_LEFT: 1,
  HALF_RIGHT: 2,
};

var {width, height} = Dimensions.get('window');

export default class ContactsView extends Component {
  constructor(args) {
    super(args);

    this._layoutProvider = new LayoutProvider(
      index => {
        return ViewTypes.FULL;
      },
      (type, dim) => {
        switch (type) {
          case ViewTypes.FULL:
            dim.width = width;
            dim.height = 83;
            break;
          default:
            dim.width = 1;
            dim.height = 1;
        }
      },
    );

    this.state = {
      dataProvider: new DataProvider((r1, r2) => {
        return r1 !== r2;
      }).cloneWithRows([]),
      searchValue: '',
    //  loading: true,
      filteredData: new DataProvider((r1, r2) => {
        return r1 !== r2;
      }).cloneWithRows([]),
    };

    this._rowRenderer = this._rowRenderer.bind(this);
  }

  componentDidMount() {
    Contacts.checkPermission((err, permission) => {
      // Contacts.PERMISSION_AUTHORIZED || Contacts.PERMISSION_UNDEFINED || Contacts.PERMISSION_DENIED
      if (permission === 'undefined') {
        Contacts.requestPermission((err, permission) => {
          if (err) {
            console.log(err);
          }
          Contacts.getAll((err, contacts) => {
            if (err) {
              console.log(err);
            }
            // contacts returned
            // alert(JSON.stringify(contacts[55].phoneNumbers[0].number));
            contacts = contacts.map(item => {
              item.isSelect = false;
              item.selectedClass = styles.list;
              return item;
            });

            // alert(JSON.stringify(contacts));
            this.setState({
              dataProvider: new DataProvider((r1, r2) => {
                return r1 !== r2;
              }).cloneWithRows(contacts),
              loading: false,
            });
          });
        });
      }
      if (permission === 'authorized') {
        // alert('authorized');
        Contacts.getAll((err, contacts) => {
          if (err) {
            console.log(err);
          }
          // contacts returned
          // alert(JSON.stringify(contacts[55].phoneNumbers[0].number));
          contacts = contacts.map(item => {
            item.isSelect = false;
            item.selectedClass = styles.list;
            return item;
          });

          // alert(JSON.stringify(contacts));
          this.setState({
            dataProvider: new DataProvider((r1, r2) => {
              return r1 !== r2;
            }).cloneWithRows(contacts),
            loading: false,
          });
        });
      }
      if (permission === 'denied') {
        Contacts.requestPermission((err, permission) => {
          if (err) {
            console.log(err);
          } else {
            Contacts.getAll((err, contacts) => {
              if (err) {
                console.log(err);
              }
              // contacts returned
              // alert(JSON.stringify(contacts[55].phoneNumbers[0].number));
              contacts = contacts.map(item => {
                item.isSelect = false;
                item.selectedClass = styles.list;
                return item;
              });

              // alert(JSON.stringify(contacts));
              this.setState({
                dataProvider: new DataProvider((r1, r2) => {
                  return r1 !== r2;
                }).cloneWithRows(contacts),
                loading: false,
              });
            });
          }
        });
      }
    });
  }

  searchContacts = searchText => {
    this.setState({searchValue: searchText});
    var filteredData = [];
    const Contacts = this.state.dataProvider._data;
    if (searchText != '') {
      for (let i = 0; i < searchText.length; i++) {
        searchText = searchText.replace(' ', '');
        filteredData = Contacts.filter(item => {
          let textBeforeSearch = (
            item.givenName + item.familyName
          ).toUpperCase();
          if (textBeforeSearch.includes(searchText.toUpperCase())) {
            return item;
          }
          // return item.givenName.includes(searchText);
        });
      }
    }

    this.setState({
      filteredData: new DataProvider((r1, r2) => {
        return r1 !== r2;
      }).cloneWithRows(filteredData),
    });
  };

  selectItem = data => {
    data.isSelect = !data.isSelect;

    const index = this.state.dataProvider._data.findIndex(
      item => data.recordID === item.recordID,
    );
    // alert(index);
    this.state.dataProvider._data[index] = data;
    this.setState({
      dataProvider: new DataProvider((r1, r2) => {
        return r1 !== r2;
      }).cloneWithRows(this.state.dataProvider._data),
    });
  };

  _rowRenderer(type, data) {
    return (
      <List>
        <ListItem avatar>
          <Left></Left>
          <Body>
            <Text
              style={{
                marginRight: 15,
                fontWeight: 'bold',
                fontSize: 19,
              }}>
              {data.givenName} {data.familyName}
            </Text>
            {data.phoneNumbers.map(i => {
              // alert(JSON.stringify(i));s
              if (data.phoneNumbers.indexOf(i) == 0) {
                return (
                  <Text note key={i.id} style={{marginTop: 5}}>
                    {i.number.trim()}
                  </Text>
                );
              }
            })}
          </Body>
          <CheckBox
            checked={data.isSelect}
            color="green"
            style={{marginRight: 50}}
            onPress={() => {
              this.selectItem(data);
            }}
          />
        </ListItem>
      </List>
    );
  }

  SaveContactsSelected = () => {
    const ContactsSelected = this.state.dataProvider._data.filter(item => {
  
      if (item.isSelect == true) {
        return item;
      }
    });
    for(var i=0;i<ContactsSelected.length;i++){
      alert(JSON.stringify(ContactsSelected[i].phoneNumbers))
    }
    console.log((ContactsSelected));
   
  };

  render() {
    return (
      <Container>
        <Header transparent style={{backgroundColor: 'transparent'}}>
          <StatusBar backgroundColor="white" />

          <Left style={{flex: 1}}>
            <TouchableOpacity>
              <Text style={{fontWeight: 'bold', color: 'red'}}>Cancel</Text>
            </TouchableOpacity>
          </Left>
          <Body style={{justifyContent: 'center', alignItems: 'center'}}>
            <Title style={{color: '#B9C0CB'}}>Contacts</Title>
          </Body>
          <Right>
            <TouchableOpacity
              onPress={() => {
                this.SaveContactsSelected();
              }}>
              <Text style={{fontWeight: 'bold', color: 'green'}}>Done</Text>
            </TouchableOpacity>
          </Right>
        </Header>

        {this.state.loading ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size={30} color="#F35C6F" />
          </View>
        ) : (
          <View>
            <SearchBar
              // showLoading
              containerStyle={{backgroundColor: 'transparent'}}
              inputContainerStyle={{backgroundColor: '#ddd'}}
              rightIconContainerStyle={{display: 'none'}}
              round
              lightTheme
              searchIcon={{size: 24}}
              onChangeText={text => this.searchContacts(text)}
              onClear={text => this.searchContacts(text)}
              placeholder="Type Here..."
              value={this.state.searchValue}
            />
            <View
              style={{
                minWidth: 1,
                minHeight: '100%',
              }}>
              <RecyclerListView
                layoutProvider={this._layoutProvider}
                dataProvider={
                  this.state.filteredData._data.length !== 0
                    ? this.state.filteredData
                    : this.state.dataProvider
                }
                rowRenderer={this._rowRenderer}
                extendedState={this.state}
                // renderFooter={() => (
                //   <ActivityIndicator
                //     size={25}
                //     color="red"
                //     style={{paddingTop: 15}}
                //   />
                // )}
              />
            </View>
          </View>
        )}
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,  
  },
  list: {
    backgroundColor: 'white',
  },
  containerGridLeft: {
    paddingTop: 50,
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffbb00',
  },
});
