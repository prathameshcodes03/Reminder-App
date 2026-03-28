import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import ReminderCard from '../../components/ReminderCard';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const SAMPLE_DATA = [
  { id: '1', title: 'Team Meeting', description: 'Weekly sync with the dev team', datetime: '2025-06-10 10:00 AM' },
  { id: '2', title: 'Doctor Appointment', description: 'Annual checkup at clinic', datetime: '2025-05-01 09:00 AM' },
];

const NotificationsScreen = () => {
  const { theme } = useTheme();
  const { strings } = useLanguage();
  const [reminders, setReminders] = useState(SAMPLE_DATA);
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [datetime, setDatetime] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

  const openAdd = () => {
    setEditItem(null);
    setTitle(''); setDescription(''); setDatetime('');
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setTitle(item.title); setDescription(item.description); setDatetime(item.datetime);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!title.trim()) return Alert.alert('Error', 'Title is required');
    if (editItem) {
      setReminders(prev => prev.map(r => r.id === editItem.id ? { ...r, title, description, datetime } : r));
    } else {
      setReminders(prev => [...prev, { id: Date.now().toString(), title, description, datetime }]);
    }
    setModalVisible(false);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Remove this reminder?', [
      { text: strings.cancel, style: 'cancel' },
      { text: strings.delete, style: 'destructive', onPress: () => setReminders(prev => prev.filter(r => r.id !== id)) },
    ]);
  };

  const filtered = reminders.filter(r => {
    const isPast = new Date(r.datetime) < new Date();
    return activeTab === 'upcoming' ? !isPast : isPast;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.topBar}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>{strings.reminders}</Text>
        <TouchableOpacity onPress={openAdd} style={[styles.fab, { backgroundColor: theme.primary }]}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.tabRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {['upcoming', 'past'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && { backgroundColor: theme.primary }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? '#fff' : theme.subtext }]}>
              {tab === 'upcoming' ? strings.upcoming : strings.past}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 40 }}>📭</Text>
          <Text style={[styles.emptyText, { color: theme.subtext }]}>{strings.noReminders}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ReminderCard item={item} onEdit={() => openEdit(item)} onDelete={() => handleDelete(item.id)} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editItem ? strings.editReminder : strings.addReminder}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <CustomInput label={strings.title} placeholder="Meeting, Task..." value={title} onChangeText={setTitle} />
              <CustomInput
                label={strings.description} placeholder="Details..." value={description}
                onChangeText={setDescription} multiline numberOfLines={3}
                style={{ textAlignVertical: 'top', minHeight: 80 }}
              />
              <CustomInput
                label={strings.date} placeholder="YYYY-MM-DD HH:MM AM"
                value={datetime} onChangeText={setDatetime}
              />
            </ScrollView>
            <View style={styles.modalBtns}>
              <CustomButton title={strings.cancel} onPress={() => setModalVisible(false)} variant="ghost" style={{ flex: 1, marginRight: 8 }} />
              <CustomButton title={strings.save} onPress={handleSave} style={{ flex: 1 }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingBottom: 16 },
  screenTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  fab: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  fabText: { fontSize: 24, color: '#fff', lineHeight: 28 },
  tabRow: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '600' },
  list: { paddingBottom: 24 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyText: { fontSize: 14, textAlign: 'center', maxWidth: 220 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000060' },
  modalCard: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderWidth: 1, maxHeight: '85%',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 18 },
  modalBtns: { flexDirection: 'row', marginTop: 16 },
});

export default NotificationsScreen;
