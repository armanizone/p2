import React from 'react'
import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import { useLocation } from './useLocation';
import { useAuth } from './useAuth';

export const Map = () => {

  const {latitude, longitude} = useLocation()

  const {authData} = useAuth() 
  
  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        region={{
          latitude: latitude ?? 1,
          longitude: longitude ?? 1,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation
        showsMyLocationButton
      />
      {/* <Button
        title='Кнопка'
        onPress={() => {
          writeUserLocation(authData?.id);
        }}
      /> */}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
