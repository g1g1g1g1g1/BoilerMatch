import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Pressable, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from 'react-native-vector-icons/Feather';
import { Avatar } from '@rneui/themed';
import axios from 'axios'

import * as SecureStore from 'expo-secure-store';


export default function Profile({navigation}){
  const [username, setUsername] = useState("")
  const [profilePic, setProfilePic] = useState('')
  const [profilePicExists, setProfilePicExists] = useState(false)
  const [discoverability, setDiscoverability] = useState(false)
  
  const iconProps = () => {
      return (
        <Icon name="edit-1" color='red'></Icon>
      );
  };

  useEffect(() => {
    if (!profilePicExists) {
      checkPfpExist()
    }
    fetchUsername()
  },[]);

  useEffect(()=> {
    getDiscoverability()
  },[])

  const fetchUsername = async () => {
    const userVal = await SecureStore.getItemAsync('username')
    setUsername(userVal)
    setProfilePic('https://boilermatch.blob.core.windows.net/pfp/' + userVal + '.jpg')
  }

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0,
    }, [profilePic]);

    if (!result.canceled) {
      const imageToUpload = result.assets[0].uri;
      sendImage(imageToUpload)
    }
  };

  const toggleDiscoverability = async () => {
    const tokenVal = await SecureStore.getItemAsync('token')
      console.log(tokenVal)
      const response = await axios.post(`http://localhost:3000/api/user/updateDiscoverability`, {
        token: tokenVal
      }
      ).catch(error => {
        console.log("Error occured while searching:", error)
      })
      
      setDiscoverability(response.data.userUpdated.discoverable)
    }
  const getDiscoverability = async () => {
    const tokenVal = await SecureStore.getItemAsync('token')
      console.log(tokenVal)
      const response = await axios.post(`http://localhost:3000/api/user/getDiscoverability`, {
        token: tokenVal
      }
      ).catch(error => {
        console.log("Error occured while searching:", error)
      })
        console.log("updated")
      setDiscoverability(response.data.discoverability)
      return response.data.user;
    }


  const navigateToManagePreferences = () => {
    navigation.navigate('ManagePreferences');
  };

  const navigateToManagePreferenceRankings = () => {
    navigation.navigate('ManagePreferenceRankings');
  };

  
  const sendImage = async (imageToUpload) => {
    if (!imageToUpload) {
      // Image is null for some reason
      return
    }
    const formData = new FormData();
    formData.append('image', {
      uri: imageToUpload,
      type: 'image/jpeg',
      name: 'testImage.jpg',
    });
    const tokenVal = await SecureStore.getItemAsync('token')
    formData.append('token', tokenVal)
    // TODO: Errors need to be caught here (server down/no connection, etc.)
    const apiAddr = 'http://localhost:3000/api/user/pfp/update/' + tokenVal
    await axios.post(apiAddr, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    }).catch(err => {
        if (err.response) {
          return err.response.data;
        }
    });

    setProfilePic(imageToUpload)
    setProfilePicExists(true)
  }



    const navigateToManageInformation = () => {
      navigation.navigate('ManageInformation')
    }
    
    const navigateToManageHousingInformation = () => {
      navigation.navigate('ManageHousingInformation')
    }

  const checkPfpExist = async () => {
    const userVal = await SecureStore.getItemAsync('username')
    const pfpUrl = 'https://boilermatch.blob.core.windows.net/pfp/' + userVal + '.jpg'
    console.log(pfpUrl)
    const response = await axios.get(pfpUrl).catch((error) => {
      return error.response
    })
    setProfilePicExists(response.status === 200)
  }
  
   const handleLogout = async () => {
        await SecureStore.deleteItemAsync('token')
        await SecureStore.deleteItemAsync('username')
        navigation.navigate("Landing")
    }

  const ProfilePic = () => {
    return (
      <Avatar
        size='xlarge'
        rounded
        source={profilePicExists ? {uri: profilePic} : {}}
        containerStyle={{backgroundColor: 'grey'}}
        onPress={() => pickImage()}
        activeOpacity={0.8}
        
      >
        <Avatar.Accessory {...iconProps} size={35} onPress={pickImage}/>
      </Avatar>
    )
  }

  return(
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
        <View style={{flex: 'column', width: "90%", alignItems: 'center'}}>
              <ProfilePic />
          <Text style={styles.title}>{username}</Text>

          <TouchableOpacity style={styles.button} onPress={navigateToManageInformation}>
          <Text style={styles.buttonText}>Manage Information</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={navigateToManageHousingInformation}>
          <Text style={styles.buttonText}>Manage Housing Info</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={navigateToManagePreferences}>
          <Text style={styles.buttonText}>Manage Preferences</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={navigateToManagePreferenceRankings}>
          <Text style={styles.buttonText}>Manage Preference Rank</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={toggleDiscoverability}>
          <Text style={styles.buttonText}>{discoverability ? 'Go Private' : 'Go Public!'}</Text>
          <TouchableOpacity style={styles.button} onPress={confirmDeactivation}>
            <Text style={styles.buttonText}> Deactivate Account</Text>
          </TouchableOpacity>

          <Pressable style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </Pressable>

        </View>

        </ScrollView>
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  button: {
      width: "40%",
      height: 50,
      backgroundColor: "gold",
      borderRadius: 6,
      justifyContent: 'center',
      
    },
    buttonText: {
      fontSize: 20,
      alignSelf: "center"
    },
    otherText: {
      fontSize: 16,
      paddingLeft: 5
    },
    inputFieldBox: {   
      flexDirection: 'row',
      height: 40,
      width: '100%',
      justifyContent: 'flex-end',
      alignItems: 'center',
      padding: 10,
      marginBottom: 10,
      borderColor: 'black',
      borderWidth: 1,
      borderRadius: 5,        
    },
    inputField: {
      width: "100%",
    },
    title: {
      fontSize: 25,
      fontWeight: 'bold',
      textAlign: 'center',
      lineHeight: 25,
      marginVertical: 14,
    },
    subtitle: {
      fontSize: 15,
      fontWeight: 'bold',
      textAlign: 'left',
      marginBottom: 8,
    },
    button: {
      width: "99%",
      height: 50,
      backgroundColor: "gold",
      borderRadius: 6,
      justifyContent: 'center',
      margin:10,
      
    },
    buttonText: {
      fontSize: 15,
      alignSelf: "center",
      textAlign:"center",
    },
    errorMes: {
      fontSize: 15,
      fontWeight: 'bold',
      textAlign: 'center',
      paddingHorizontal: 10,
      marginBottom: 8,
      color: 'red',
      marginHorizontal: 'auto'
    }
  });

