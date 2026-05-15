import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { fetchCountries, characterService } from '../services/api';
import { LogOut, User as UserIcon, MapPin, Award, Lightbulb, RefreshCw } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function MainGameScreen({ onManageCharacters }) {
  const { user, token, activeCharacter, logout, setActiveCharacter } = useAuth();
  const [countries, setCountries] = useState([]);
  const [currentRound, setCurrentRound] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState('Detectando...');
  const [resultMessage, setResultMessage] = useState({ text: '', color: '' });

  useEffect(() => {
    initGame();
    getUserLocation();
  }, []);

  const initGame = async () => {
    try {
      const data = await fetchCountries();
      setCountries(data);
      generateRound(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os países.');
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationName('Permissão negada');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        setLocationName(reverseGeocode[0].country || 'Desconhecido');
      }
    } catch (error) {
      setLocationName('Erro ao detectar');
    }
  };

  const generateRound = (allCountries = countries) => {
    if (allCountries.length === 0) return;

    const randomIndex = Math.floor(Math.random() * allCountries.length);
    const correct = allCountries[randomIndex];
    const correctName = correct.translations?.por?.common || correct.name.common;

    let options = [correctName];
    while (options.length < 4) {
      const randomDecoy = allCountries[Math.floor(Math.random() * allCountries.length)];
      const decoyName = randomDecoy.translations?.por?.common || randomDecoy.name.common;
      if (!options.includes(decoyName)) {
        options.push(decoyName);
      }
    }

    setCurrentRound({
      country: correct,
      correctName,
      options: options.sort(() => Math.random() - 0.5),
    });
    setResultMessage({ text: '', color: '' });
  };

  const checkAnswer = async (selected) => {
    if (selected === currentRound.correctName) {
      setResultMessage({ text: 'Acertou! 🎉', color: '#2ecc71' });
      if (activeCharacter) {
        await updateScore();
      } else {
        Alert.alert('Atenção', 'Você acertou, mas está sem personagem ativo. Pontos não salvos.');
      }
      
      // Delay next round
      setTimeout(() => generateRound(), 1500);
    } else {
      setResultMessage({ text: `Errado! Era ${currentRound.correctName} ❌`, color: '#e74c3c' });
      setTimeout(() => generateRound(), 2000);
    }
  };

  const updateScore = async () => {
    const newScore = activeCharacter.score + 10;
    let newLevel = activeCharacter.level;

    if (newScore >= activeCharacter.level * 50) {
      newLevel += 1;
      Alert.alert('⭐ Level Up!', `Seu personagem ${activeCharacter.name} subiu para o nível ${newLevel}!`);
    }

    try {
      await characterService.updateScore(token, activeCharacter._id, newScore, newLevel);
      setActiveCharacter({ ...activeCharacter, score: newScore, level: newLevel });
    } catch (error) {
      console.error('Error updating score');
    }
  };

  const getHint = () => {
    if (!activeCharacter) return "Selecione um personagem para ter dicas!";
    const { country, correctName } = currentRound;

    switch (activeCharacter.avatarStyle) {
      case 'estudioso':
        return `Dica de Estudioso: Começa com a letra '${correctName.charAt(0).toUpperCase()}'`;
      case 'viajante':
        return `Dica de Viajante: Fica no continente '${country.region}'`;
      case 'explorador':
        const capital = country.capital && country.capital.length > 0 ? country.capital[0] : 'Desconhecida';
        return `Dica de Explorador: A capital é '${capital}'`;
      default:
        return "Sem dicas disponíveis.";
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4facfe" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.userInfo}>
          <Text style={styles.welcome}>Olá, {user.username}</Text>
          <View style={styles.locationContainer}>
            <MapPin size={14} color="#94a3b8" />
            <Text style={styles.locationText}>{locationName}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={logout} style={styles.iconBtn}>
          <LogOut size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeCharacter ? (
          <View style={styles.activeCharCard}>
            <View style={[styles.charColor, { backgroundColor: activeCharacter.favoriteColor }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.charName}>{activeCharacter.name}</Text>
              <View style={styles.charStats}>
                <Award size={14} color="#f1c40f" />
                <Text style={styles.statText}>Lvl {activeCharacter.level} | {activeCharacter.score} pts</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onManageCharacters} style={styles.manageBtn}>
              <Text style={styles.manageBtnText}>Trocar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.noCharCard} onPress={onManageCharacters}>
            <UserIcon size={24} color="#4facfe" />
            <Text style={styles.noCharText}>Selecione um Personagem</Text>
          </TouchableOpacity>
        )}

        <View style={styles.gameCard}>
          <Text style={styles.gameTitle}>Qual país é este?</Text>
          
          <View style={styles.flagContainer}>
            {currentRound && (
              <Image 
                source={{ uri: currentRound.country.flags.png }} 
                style={styles.flag}
                resizeMode="contain"
              />
            )}
          </View>

          {resultMessage.text ? (
            <Text style={[styles.resultText, { color: resultMessage.color }]}>{resultMessage.text}</Text>
          ) : (
            <View style={styles.hintContainer}>
              <Lightbulb size={18} color="#f1c40f" />
              <Text style={styles.hintText}>{getHint()}</Text>
            </View>
          )}

          <View style={styles.optionsGrid}>
            {currentRound?.options.map((option, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.optionBtn} 
                onPress={() => checkAnswer(option)}
                disabled={!!resultMessage.text}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.refreshBtn} onPress={() => generateRound()}>
            <RefreshCw size={20} color="#94a3b8" />
            <Text style={styles.refreshText}>Pular</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: 12,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  activeCharCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  charColor: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  charName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  charStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  manageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(79, 172, 254, 0.2)',
    borderRadius: 8,
  },
  manageBtnText: {
    color: '#4facfe',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noCharCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#4facfe',
    gap: 12,
  },
  noCharText: {
    color: '#4facfe',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  flagContainer: {
    width: width - 96,
    height: 180,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  flag: {
    width: '100%',
    height: '100%',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(241, 196, 15, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
    width: '100%',
  },
  hintText: {
    color: '#f1c40f',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  resultText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsGrid: {
    width: '100%',
    gap: 12,
  },
  optionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  refreshText: {
    color: '#94a3b8',
    fontSize: 16,
  },
});
