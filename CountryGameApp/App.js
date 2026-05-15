import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthScreen from './src/screens/AuthScreen';
import MainGameScreen from './src/screens/MainGameScreen';
import CharacterScreen from './src/screens/CharacterScreen';

function RootNavigation() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState('game'); // game or characters

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4facfe" />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (screen === 'characters') {
    return <CharacterScreen onBack={() => setScreen('game')} />;
  }

  return <MainGameScreen onManageCharacters={() => setScreen('characters')} />;
}

export default function App() {
  return (
    <AuthProvider>
      <View style={styles.container}>
        <StatusBar style="light" />
        <RootNavigation />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
});
