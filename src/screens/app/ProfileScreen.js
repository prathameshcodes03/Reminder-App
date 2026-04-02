import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const ProfileScreen = () => {
  const { theme } = useTheme();
  const { strings } = useLanguage();
  const { user, logout, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: '', phone: '', role: '' });
  const [saving, setSaving] = useState(false);

  const openEdit = () => {
    setDraft({ name: user?.name || '', phone: user?.phone || '', role: user?.role || '' });
    setEditing(true);
  };

  const handleSave = async () => {
    if (!draft.name.trim()) return Alert.alert('Error', 'Name cannot be empty');
    setSaving(true);
    try {
      await updateProfile(draft);
      setEditing(false);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const infoRow = (label, value, emoji) => (
    <View style={[st.infoRow, { borderBottomColor: theme.border }]} key={label}>
      <Text style={st.rowEmoji}>{emoji}</Text>
      <View style={st.rowContent}>
        <Text style={[st.rowLabel, { color: theme.subtext }]}>{label}</Text>
        <Text style={[st.rowValue, { color: theme.text }]}>{value || '—'}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={[st.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <View style={[st.headerBg, { backgroundColor: theme.primary }]}>
        <View style={st.avatarCircle}>
          <Text style={st.avatarText}>{user?.name?.charAt(0).toUpperCase() || '?'}</Text>
        </View>
        <Text style={st.headerName}>{user?.name}</Text>
        <Text style={st.headerRole}>{user?.role || 'Student'}</Text>
      </View>
      <View style={st.body}>
        <View style={[st.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[st.sectionTitle, { color: theme.text }]}>{strings.profile}</Text>
          {infoRow(strings.name, user?.name, '👤')}
          {infoRow(strings.email, user?.email, '✉️')}
          {infoRow(strings.phone, user?.phone, '📞')}
          {infoRow(strings.role, user?.role, '🎓')}
          {infoRow(strings.joined, user?.joined, '📅')}
        </View>
        <CustomButton title={strings.editProfile} onPress={openEdit} style={{ marginTop: 16 }} />
        <CustomButton
          title={strings.logout} variant="danger"
          onPress={() => Alert.alert(strings.logout, 'Are you sure?', [
            { text: strings.cancel, style: 'cancel' },
            { text: strings.logout, style: 'destructive', onPress: logout },
          ])}
          style={{ marginTop: 10, marginBottom: 32 }}
        />
      </View>
      <Modal visible={editing} animationType="slide" transparent>
        <KeyboardAvoidingView style={st.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[st.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[st.sectionTitle, { color: theme.text, marginBottom: 16 }]}>{strings.editProfile}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <CustomInput label={strings.name} value={draft.name} onChangeText={v => setDraft(p => ({ ...p, name: v }))} />
              <CustomInput label={strings.phone} value={draft.phone} onChangeText={v => setDraft(p => ({ ...p, phone: v }))} keyboardType="phone-pad" placeholder="+91 XXXXX XXXXX" />
              <CustomInput label={strings.role} value={draft.role} onChangeText={v => setDraft(p => ({ ...p, role: v }))} placeholder="e.g. CE Student" />
            </ScrollView>
            <View style={st.modalBtns}>
              <CustomButton title={strings.cancel} variant="ghost" onPress={() => setEditing(false)} style={{ flex: 1, marginRight: 8 }} />
              <CustomButton title={strings.save} onPress={handleSave} loading={saving} style={{ flex: 1 }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
};

const st = StyleSheet.create({
  container: { flex: 1 },
  headerBg: { alignItems: 'center', paddingTop: 60, paddingBottom: 36 },
  avatarCircle: { width: 84, height: 84, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 36, color: '#fff', fontWeight: '800' },
  headerName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerRole: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  body: { padding: 16 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  sectionTitle: { fontSize: 16, fontWeight: '700', padding: 16, paddingBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1 },
  rowEmoji: { fontSize: 20, marginRight: 12 },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  rowValue: { fontSize: 15, fontWeight: '500' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000060' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, maxHeight: '85%' },
  modalBtns: { flexDirection: 'row', marginTop: 16 },
});

export default ProfileScreen;
