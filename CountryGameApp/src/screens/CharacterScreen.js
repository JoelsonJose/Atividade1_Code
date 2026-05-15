import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Modal, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { characterService } from '../services/api';
import { Plus, X, Edit2, Trash2, Check, ArrowLeft, User, Palette, Sparkles } from 'lucide-react-native';

const AVATAR_STYLES = [
  { id: 'explorador', label: 'Explorador', hint: 'Dica de Capital' },
  { id: 'viajante', label: 'Viajante', hint: 'Dica de Continente' },
  { id: 'estudioso', label: 'Estudioso', hint: 'Dica de Primeira Letra' },
];

const PRESET_COLORS = ['#4facfe', '#00f2fe', '#f093fb', '#f5576c', '#43e97b', '#fa709a', '#f1c40f'];

export default function CharacterScreen({ onBack }) {
  const { token, selectCharacter, activeCharacter } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form state
  const [charId, setCharId] = useState(null);
  const [name, setName] = useState('');
  const [style, setStyle] = useState('explorador');
  const [color, setColor] = useState('#4facfe');

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      const data = await characterService.getAll(token);
      setCharacters(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar personagens');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name) return Alert.alert('Atenção', 'Dê um nome ao personagem!');
    
    try {
      await characterService.save(token, { _id: charId, name, avatarStyle: style, favoriteColor: color });
      setModalVisible(false);
      resetForm();
      loadCharacters();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar');
    }
  };

  const handleEdit = (char) => {
    setCharId(char._id);
    setName(char.name);
    setStyle(char.avatarStyle);
    setColor(char.favoriteColor);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Deletar Personagem',
      'Tem certeza que deseja excluir este personagem?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Deletar', style: 'destructive', onPress: async () => {
          try {
            await characterService.delete(token, id);
            loadCharacters();
          } catch (e) { Alert.alert('Erro', 'Não foi possível deletar'); }
        }}
      ]
    );
  };

  const resetForm = () => {
    setCharId(null);
    setName('');
    setStyle('explorador');
    setColor('#4facfe');
  };

  const renderCharItem = ({ item }) => {
    const isActive = activeCharacter?._id === item._id;
    return (
      <View style={[styles.charCard, isActive && styles.activeCard]}>
        <View style={[styles.charIcon, { backgroundColor: item.favoriteColor }]}>
          <User size={24} color="#fff" />
        </View>
        <View style={styles.charInfo}>
          <Text style={styles.charName}>{item.name}</Text>
          <Text style={styles.charDetails}>{item.avatarStyle} • Nível {item.level}</Text>
        </View>
        <View style={styles.charActions}>
          <TouchableOpacity onPress={() => selectCharacter(item)} style={styles.actionBtn}>
            <Check size={20} color={isActive ? '#4facfe' : '#94a3b8'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionBtn}>
            <Edit2 size={18} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.actionBtn}>
            <Trash2 size={18} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Personagens</Text>
        <TouchableOpacity 
          onPress={() => { resetForm(); setModalVisible(true); }}
          style={styles.addBtn}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={characters}
        keyExtractor={item => item._id}
        renderItem={renderCharItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Sparkles size={48} color="rgba(255,255,255,0.1)" />
            <Text style={styles.emptyText}>Nenhum personagem encontrado.</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{charId ? 'Editar' : 'Novo'} Personagem</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex: Explorador XP"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <Text style={styles.label}>Habilidade Especial</Text>
              <View style={styles.stylesGrid}>
                {AVATAR_STYLES.map(s => (
                  <TouchableOpacity 
                    key={s.id} 
                    style={[styles.styleBtn, style === s.id && styles.activeStyleBtn]}
                    onPress={() => setStyle(s.id)}
                  >
                    <Text style={[styles.styleBtnText, style === s.id && styles.activeStyleText]}>{s.label}</Text>
                    <Text style={styles.styleHint}>{s.hint}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Cor Favorita</Text>
              <View style={styles.colorsGrid}>
                {PRESET_COLORS.map(c => (
                  <TouchableOpacity 
                    key={c} 
                    style={[styles.colorCircle, { backgroundColor: c }, color === c && styles.activeColorCircle]}
                    onPress={() => setColor(c)}
                  >
                    {color === c && <Check size={16} color="#fff" />}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.saveGradient}>
                  <Text style={styles.saveText}>Salvar Personagem</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  backBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  addBtn: {
    padding: 8,
    backgroundColor: '#4facfe',
    borderRadius: 12,
  },
  listContent: {
    padding: 24,
  },
  charCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeCard: {
    borderColor: 'rgba(79, 172, 254, 0.5)',
    backgroundColor: 'rgba(79, 172, 254, 0.05)',
  },
  charIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  charInfo: {
    flex: 1,
  },
  charName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  charDetails: {
    color: '#94a3b8',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  charActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
    opacity: 0.5,
  },
  emptyText: {
    color: '#94a3b8',
    marginTop: 16,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  stylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  styleBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activeStyleBtn: {
    borderColor: '#4facfe',
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
  },
  styleBtnText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeStyleText: {
    color: '#4facfe',
  },
  styleHint: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
  colorsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeColorCircle: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  saveBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  saveGradient: {
    padding: 18,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
