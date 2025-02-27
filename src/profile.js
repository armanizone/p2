import React from "react";
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TextInput, Button } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Device from 'expo-device'

import { useAuth } from "./useAuth";
import { pb } from "./pocketbase";

import * as ImagePicker from "expo-image-picker";
import { ActivityIndicator } from "react-native-paper";

export const Profile = ({ navigation }) => {

  const { login, getUser, authData, logout } = useAuth();

  const [page, setPage] = React.useState("login");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleLogin = () => {
    setError("");
    if (!email || !password) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    setLoading(true);

    login(email, password)
      .then(async (response) => {

        let newDevices = response?.record?.devices ?? []

        if (!response?.record?.devices?.some(device => device?.deviceName === Device.deviceName)) {
          newDevices.push({...Device});
        }

        console.log('newDevies', newDevices);

        await pb.collection('users').update(response?.record?.id, {
          devices: [...newDevices]
        })
        alert("Успешный вход");
        // Navigate to home page
        navigation.navigate("Карта");
      })
      .catch((error) => {
        console.error("erro1", error?.originalError);
        setError("Неверная почта или пароль");
      })
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    if (authData) {
      setPage("profile");
    } else {
      setPage("login");
    }
  }, [authData]);

  if (page === "profile") return <ProfileScreen navigation={navigation} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Вход</Text>
      <TextInput
        style={styles.input}
        placeholder="Почта"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? (
        <Text style={{ color: "red", marginBottom: 12 }}>{error}</Text>
      ) : null}
      <View style={{ width: "100%", marginTop: 10 }}>
        <Button
          title={loading ? "Загрузка..." : "Войти"}
          onPress={handleLogin}
          disabled={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    backgroundColor: "#fff",
  },
});

const ProfileScreen = () => {

  const { authData, logout } = useAuth();

  const [user, setUser] = React.useState(null);
  const [avatar, setAvatar] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    setUser(authData);

    if (authData?.avatar) {
      setAvatar(pb.files.getURL(authData, authData?.avatar))
    }
  }, [authData]);

  const pickImage = async () => {
    setError("");
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Требуется разрешение",
        "Пожалуйста, предоставьте доступ к вашей галерее."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  // Upload avatar to PocketBase
  const uploadAvatar = async (imageUri) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("avatar", {
        uri: imageUri,
        name: "avatar.jpg",
        type: "image/jpeg",
      });

      const updatedUser = await pb
        .collection("users")
        .update(user.id, formData);
      setAvatar(
        `${pb.baseURL}/api/files/users/${user.id}/${updatedUser.avatar}`
      );
    } catch (err) {
      setError("Не удалось загрузить картинку");
    } finally {
      setLoading(false);
    }
  };

  // Save profile data
  const saveProfile = async () => {
    if ((authData?.name === user?.name) && (authData?.phone === user?.phone)) return
    try {
      setLoading(true);
      await pb.collection("users").update(authData.id, {
        name: user?.name,
        phone: user?.phone
      });
      Alert.alert("Успешно", "Профиль обновлен!");
    } catch (err) {
      setError("Не удалось сохранить профиль");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Сохранение профиля...</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f9f9f9",
      }}
    >
      {/* Avatar Upload */}
      <TouchableOpacity
        onPress={pickImage}
        style={{ marginBottom: 20, marginTop: 30 }}
      >
        <Image
          source={avatar ? { uri: avatar } : require("../assets/avatar.jpg")}
          style={{
            width: 100,
            height: 100,
            borderRadius: 60,
          }}
        />
        <Text style={{ textAlign: "center", color: "#007bff", marginTop: 5 }}>
          Аватар
        </Text>
      </TouchableOpacity>

      {/* Name Input */}
      <View style={{ width: "100%" }}>
        <Text>Имя</Text>
        <TextInput
          value={user?.name ?? ""}
          onChangeText={(e) => setUser({ ...user, name: e })}
          style={styles.input}
          placeholder="Введите ваше имя"
          error={!!error}
        />
      </View>
      <View style={{ width: "100%" }}>
        <Text>Номер телефона</Text>
        <TextInput
          value={user?.phone ?? ""}
          onChangeText={(e) => setUser({ ...user, phone: e })}
          style={{ ...styles.input }}
          placeholder="Введите номер телефона"
          error={!!error}
        />
      </View>
      {error && <Text style={{ color: "red" }}>{error.message}</Text>}

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <Button
          title="Сохранить"
          mode="contained"
          onPress={saveProfile}
          style={{ marginTop: 10 }}
        />
      )}

      <View
        style={{
          backgroundColor: "white",
          width: "100%",
          padding: 4,
          marginTop: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            width: "100%",
          }}
        >
          <Ionicons name="lock-closed" size={40} color="green" />
          <Text
            style={{
              fontWeight: "600",
              fontSize: 16,
              marginLeft: 5,
            }}
          >
            Защищен
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            width: "100%",
            marginTop: 15,
          }}
        >
          <Ionicons name="filter-circle" size={40} color="hotpink" />
          <Text
            style={{
              fontWeight: "600",
              fontSize: 16,
              marginLeft: 5,
            }}
          >
            Отслеживается
          </Text>
        </View>
      </View>

      <Pressable style={stylez.button} onPress={logout}>
        <Text style={stylez.text}>Выйти</Text>
      </Pressable>
    </View>
  );
};

const stylez = StyleSheet.create({
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 'auto',
    marginLeft: 'auto'
  },
  text: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
});