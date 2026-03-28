import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Modal, KeyboardAvoidingView, Platform
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const ProfileScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { strings } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Pratham Kulkarni',
    email: 'pratham@example.com',
    phone: '+91 98765 43210',
    role: 'Computer Engineering Student',
    joined: 'March 2025',
  });
  const [draft, setDraft] = useState({ ...profile });

  const handleSave = () => {
    setProfile({ ...draft });
    setEditing(false);
  };

  const infoRow = (label, value, emoji) => (
    <View style={[styles.infoRow, { borderBottomColor: theme.border }]} key={label}>
      <Text style={styles.rowEmoji}>{emoji}</Text>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: theme.subtext }]}>{label}</Text>
        <Text style={[styles.rowValue, { color: theme.text }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.headerBg, { backgroundColor: theme.primary }]}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{profile.name.charAt(0)}</Text>
        </View>
        <Text style={styles.headerName}>{profile.name}</Text>
        <Text style={styles.headerRole}>{profile.role}</Text>
      </View>

      <View style={styles.body}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{strings.profile}</Text>
          {infoRow(strings.name, profile.name, '👤')}
          {infoRow(strings.email, profile.email, '✉️')}
          {infoRow(strings.phone, profile.phone, '📞')}
          {infoRow(strings.role, profile.role, '🎓')}
          {infoRow(strings.joined, profile.joined, '📅')}
        </View>

        <CustomButton
          title={strings.editProfile}
          onPress={() => { setDraft({ ...profile }); setEditing(true); }}
          style={{ marginTop: 16 }}
        />

        <CustomButton
          title={strings.logout}
          variant="danger"
          onPress={() => navigation.replace('Login')}
          style={{ marginTop: 10, marginBottom: 32 }}
        />
      </View>

      <Modal visible={editing} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 16 }]}>{strings.editProfile}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <CustomInput label={strings.name} value={draft.name} onChangeText={v => setDraft(p => ({ ...p, name: v }))} />
              <CustomInput label={strings.email} value={draft.email} onChangeText={v => setDraft(p => ({ ...p, email: v }))} keyboardType="email-address" />
              <CustomInput label={strings.phone} value={draft.phone} onChangeText={v => setDraft(p => ({ ...p, phone: v }))} keyboardType="phone-pad" />
              <CustomInput label="Role" value={draft.role} onChangeText={v => setDraft(p => ({ ...p, role: v }))} />
            </ScrollView>
            <View style={styles.modalBtns}>
              <CustomButton title={strings.cancel} variant="ghost" onPress={() => setEditing(false)} style={{ flex: 1, marginRight: 8 }} />
              <CustomButton title={strings.save} onPress={handleSave} style={{ flex: 1 }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBg: { alignItems: 'center', paddingTop: 60, paddingBottom: 36 },
  avatarCircle: {
    width: 84, height: 84, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
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
  modalCard: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderWidth: 1, maxHeight: '85%',
  },
  modalBtns: { flexDirection: 'row', marginTop: 16 },
});

export default ProfileScreen;
