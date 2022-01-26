import React, { useState, useEffect  } from 'react';
import { StyleSheet, View, Button, Image } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';

import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

import { manipulateAsync, FlipType } from 'expo-image-manipulator';
import { ImageBackground } from 'react-native-web';



export default function Add({ navigation }) {
  const [cameraPermission, setCameraPermission] = useState(null);
  const [galleryPermission, setGalleryPermission] = useState(null);

  const [camera, setCamera] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  const [editorVisible, setEditorVisible] = useState(false);

  const imgRef = React.useRef(null);

  // rectangle draw

  const [start, setStart] = useState(null);
  const [end, setEnd] = useState({ x: 0, y: 0});
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

  const onPress = (event) => {
    const { x, y, translationX, translationY } = event.nativeEvent;
    //console.log(event.nativeEvent);

    setEnd({ x: 0, y: 0});

    if (!start) 
      setStart({ x: y, y: x });

      
    setDimensions({ w: translationX, h: translationY });
  };


  const canCrop = () => {
    return (end && end.x > 0) && (dimensions && dimensions.w > 0 && dimensions.h > 0);
  }



  const onEnd = () => {
    if (!start) return;

    setEnd(start);
    setStart(null);
  };


  // end rectangle draw

  

  // expo-image-manipulator methods
  const rotate90 = async () => {
    const manipResult = await manipulateAsync(
      imageUri,
      [{ rotate: 90 },],
    );
    setImageUri(manipResult.uri);
  };

  const flip = async () => {
    const manipResult = await manipulateAsync(
      imageUri,
      [{ rotate: 180 },
        { flip: FlipType.Vertical },],
    );
    setImageUri(manipResult.uri);
  };

  const resize = async () => {

    Image.getSize(imageUri, async (w, h) => {
      console.log("size", w, h)
      const manipResult = await manipulateAsync(
        imageUri,
        [{ resize: { height: Math.round(h/0.9), width: Math.round(w/0.87) } },],
      );
      setImageUri(manipResult.uri);
    
    }, (error)=>{"Error:", console.log(error)});

    
  };

  const crop = async () => {

  
    console.log({ originX: end?.x, height: dimensions?.h, originY: end?.y, width: dimensions?.w });

    if (!dimensions || dimensions.h <= 0 || dimensions.w <= 0)
      return;

    console.log("crop");
    console.log({ originX: end?.y, height: dimensions?.w, originY: end?.x, width: dimensions?.h });


    const manipResult = await manipulateAsync(
      imageUri,
      [{ crop: { originX: end?.y, height: dimensions?.w, originY: end?.x, width: dimensions?.h } },],
    ).catch((error)=>{});

    if (manipResult){
      setImageUri(manipResult.uri);
    }
    clearRectangle();

  };

  const clearRectangle = () =>{
    setStart(null);
    setDimensions(null);
    setEnd({x:0, y:0});
  }

  /*
  let animatedValue = new Animated.Value(0);
  let currentValue = 0;

  animatedValue.addListener(({ value }) => {
    currentValue = value;
  });

  const flipAnimation = () => {
    if (currentValue >= 90) {
      Animated.spring(animatedValue, {
        toValue: 0,
        tension: 10,
        friction: 8,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.spring(animatedValue, {
        toValue: 180,
        tension: 10,
        friction: 8,
        useNativeDriver: false,
      }).start();
    }
  };

  const setInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const rotateYAnimatedStyle = {
    transform: [{ rotateY: setInterpolate }],
  };
  */


  const permisionFunction = async () => {
    // here is how you can get the camera permission
    //const cameraPermission = await Camera.requestCameraPermissionsAsync();

    //setCameraPermission(cameraPermission.status === 'granted');

    setCameraPermission(true);


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
      //console.log(data.uri);
      setImageUri(data.uri);
      clearRectangle();

    }
  };


  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    //console.log(result);
    if (!result.cancelled) {
      setImageUri(result.uri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.title}>
        <h3> Welcome to the Amber Expo PoC</h3>
      </View>
      <View style={styles.cameraContainer}>
        <Camera
          ref={(ref) => setCamera(ref)}
          style={styles.fixedRatio}
          type={type}
          ratio='1:1'
        />
      </View>

      <View style={styles.meow}>
        <Button style={styles.mew} title={'Take Picture'} onPress={takePicture} />
        <Button style={styles.mew} title={'Gallery'} onPress={pickImage} />
       
      </View>
      {
      
      /*imageUri && <Animated.Image source={{ uri: imageUri }} 
      style={[rotateYAnimatedStyle, styles.cameraContainer]}/>
      */
      imageUri && 
        <PanGestureHandler onGestureEvent={onPress} onEnded={onEnd} >
            <ImageBackground source={{ uri: imageUri }} style={styles.cameraContainer} imageRef={imgRef}>
              <View
              style={{
                position: 'absolute',
                borderWidth: 5,
                borderColor: 'orange',
                backgroundColor: 'blue',
                opacity: 0.1,
                top: start?.x ?? end?.x,
                left: start?.y ?? end?.y,
                width: dimensions?.w ?? 0,
                height: dimensions?.h ?? 0,
                }}
              />
            </ImageBackground>
          </PanGestureHandler>
      }
      

      {imageUri &&
      
      <View style={styles.meow}>
        <Button style={styles.mew} onPress={rotate90} title={'Rotate'}/>
        <Button style={styles.mew} onPress={flip} title={'Flip'}/>
        <Button style={styles.mew} onPress={resize} title={'Resize'}/>
        <Button style={styles.mew} onPress={crop} title={'Crop'} disabled={!canCrop()}/>
      </View>
      }
      
 

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
    //flex: 0.3,
    aspectRatio: 1,
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