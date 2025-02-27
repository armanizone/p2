import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Map } from './map';
import { Profile } from './profile';
import { pb } from './pocketbase';
import { useLocation } from './useLocation';
import { useAuth } from './useAuth';
import Toast from 'react-native-toast-message';

const Tab = createBottomTabNavigator();

async function getLocationRecord (userId) {
  return await pb.collection('locations').getFirstListItem(`user = '${userId}'`);
}

async function getNotifications (userId) {
  return await pb.collection('notifications').getOne(userId)
}

export const TabNavigatior = () => {
  
  const {getUserLocation} = useLocation()
  const {authData} = useAuth() 

  async function handleNotifications (userId) {
    getNotifications(userId ?? authData?.id)
    .then(async res => {
      if (res?.status === 'sent') {
        Toast.show({
          type: 'info',
          text1: 'Уведомелние',
          text2: res?.message ?? '',
          position: 'top',
          visibilityTime: 5000
        }) 
        console.log('asd');
        await pb.collection('notifications').update(res?.id, {
          status: 'read'
        })
      }
    })
  }

  async function writeUserLocation (userId) {

    await getUserLocation()
    .then(async (coords) => {
      if (coords) {
        console.log('coords', coords);
        console.log('userId', userId);
        console.log('q', );
        
        if (!userId) return
        getLocationRecord(userId ?? authData?.id)
        .then(async (record) => {
          if (record) {
            await pb.collection('locations').update(record.id, {
              data: {
                ...coords,
                ram: Math.random()
              }
            })
            .catch((error) => {
              console.error('Failed to update location:', error);
            })
          }
        })
        .catch((error) => {
          console.error('Failed to get location record:', error);
        })
      }
    })
  }

  React.useEffect(() => {
    const intervalId = setInterval(async () => {
      await writeUserLocation(pb.authStore.record?.id);
      handleNotifications(pb.authStore.record?.id)
    }, 15000);

    return () => clearInterval(intervalId);
  }, [])

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Карта') {
              iconName = 'map';
            } else if (route.name === 'Профиль') {
              iconName = 'person';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'hotpink',
          tabBarInactiveTintColor: 'gray',
          headerShown: false, 
        })}
      >
        <Tab.Screen name="Карта" component={Map} />
        <Tab.Screen name="Профиль" component={Profile} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
