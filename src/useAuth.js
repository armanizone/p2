import React from 'react';
import { pb } from "./pocketbase";

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = React.useState(null);

  React.useEffect(() => {
    const loadAuthData = () => {
      const storedAuthData = pb.authStore.record;
      if (storedAuthData) {
        setAuthData(storedAuthData);
      }
    };

    loadAuthData();
  }, [pb.authStore.record]);

  const login = async (email, password) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      setAuthData(authData);
      return authData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      pb.authStore.clear();
      setAuthData(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const getUser = () => {
    return pb.authStore.record;
  };

  return (
    <AuthContext.Provider value={{ authData, login, logout, getUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return React.useContext(AuthContext);
};
