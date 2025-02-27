import React from 'react';
import * as Location from 'expo-location';

const useLocation = () => {
  const [errorMsg, setErrorMsg] = React.useState('');
  const [longitude, setLongitude] = React.useState(null);
  const [latitude, setLatitude] = React.useState(null);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({});

      if (coords) {
        setLongitude(coords.longitude);
        setLatitude(coords.latitude);
        return coords;
      }
    } catch (error) {
      setErrorMsg('An error occurred while fetching the location');
    }
  };

  React.useEffect(() => {
    getUserLocation();
  }, []);

  return { getUserLocation, longitude, latitude, errorMsg };
};

export { useLocation };
