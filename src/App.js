import React from 'react'
import { TabNavigatior } from './tab-navigator';

import { View, Text, Button, Alert, ActivityIndicator } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

import { AuthProvider } from './useAuth';
import Toast from 'react-native-toast-message';

export default function App() {

  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    authenticateUser();
  }, []);

  // Biometric authentication function
  const authenticateUser = async () => {
    const hasBiometrics = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasBiometrics || !isEnrolled) {
      Alert.alert('Ошибка', 'Верификация не поддерживается на вашем устройстве');
      setIsLoading(false);
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Верификация требуется для продолжения',
      fallbackLabel: 'Использовать пароль',
      disableDeviceFallback: false,
    });

    if (result.success) {
      setIsAuthenticated(true);
    } else {
      Alert.alert('Верификация не пройдена', 'Пожалуйста попробуйте еще раз');
      authenticateUser();
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Проверка верификации...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Верификация обязательна для продолжения</Text>
        <Button title="Пройти верификацию" onPress={authenticateUser} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <TabNavigatior/>
      <Toast/>
    </AuthProvider>
  );
}