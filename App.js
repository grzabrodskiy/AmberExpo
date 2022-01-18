import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

export default function Add({ navigation }) {
  const [cameraPermission, setCameraPermission] = useState(null);
  const [galleryPermission, setGalleryPermission] = useState(null);

  const [camera, setCamera] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  const permisionFunction = async () => {
    // here is how you can get the camera permission
    const cameraPermission = await Camera.requestPermissionsAsync();

    setCameraPermission(cameraPermission.status === 'granted');

    const imagePermission = await ImagePicker.getMediaLibraryPermissionsAsync();
    console.log(imagePermission.status);

    setGalleryPermission(imagePermission.status === 'granted');

    if (
      imagePermission.status !== 'granted' &&
      cameraPermission.status !== 'granted'
    ) {
      alert('Permission for media access needed.');
    }
  };

  useEffect(() => {
    permisionFunction();
  }, []);

  const takePicture = async () => {
    if (camera) {
      const data = await camera.takePictureAsync(null);
      console.log(data.uri);
      setImageUri(data.uri);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    console.log(result);
    if (!result.cancelled) {
      setImageUri(result.uri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.title}>
        <h3> Welcome to the Imagine PoC</h3>
      </View>
      <View style={styles.cameraContainer}>
        <Camera
          ref={(ref) => setCamera(ref)}
          style={styles.fixedRatio}
          type={type}
          ratio={'1:1'}
        />
      </View>

      <View style={styles.meow}>
        <Button style={styles.mew} title={'Take Picture'} onPress={takePicture} />
        <Button style={styles.mew} title={'Gallery'} onPress={pickImage} />
      </View>

      {imageUri && <Image source={{ uri: imageUri }} style={styles.cameraContainer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  meow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mew: {
    flex: 1,
    width: '40%',
    margin: '1rem',
  },

  container: {
    flex: 1,
    padding: '1rem',
  },
  cameraContainer: {
    flex: 0.3,
    flexDirection: 'row',
    width: 'auto',
    borderWidth: 4,
    borderColor: "#61DBFB",
    borderRadius: 6,
    
  },
  fixedRatio: {
    flex: 1,
    aspectRatio: 1,
    objectFit: "contain",

  },
  button: {
    flex: 0.1,
    padding: 10,
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: "#fffde7",
    color: "#61DBFB",
    borderColor: "#61DBFB",

  },
  title: {
    borderWidth: 4,
    borderColor: "#61DBFB",
    borderRadius: 6,
    backgroundColor: "#fffde7",
    color: "#61DBFB",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "bold"
  },
});