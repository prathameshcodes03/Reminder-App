import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const RegisterScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { strings } = useLanguage();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) return Alert.alert('Error', 'Please fill in all fields');
    if (password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');
    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      Alert.alert('Account Created!', 'Please login with your credentials.', [
        { text: 'Login', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (e) {
      Alert.alert('Registration Failed', e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}>
            <Text style={styles.iconText}>🔔</Text>
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>RemindMe</Text>
          <Text style={[styles.tagline, { color: theme.subtext }]}>{strings.createAcc}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow, borderColor: theme.border }]}>
          <Text style={[styles.heading, { color: theme.text }]}>{strings.register}</Text>
          <CustomInput label={strings.fullName} placeholder="John Doe" value={name} onChangeText={setName} />
          <CustomInput label={strings.email} placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <CustomInput label={strings.password} placeholder="Min. 6 characters" value={password} onChangeText={setPassword} secureTextEntry />
          <CustomButton title={strings.register} onPress={handleRegister} loading={loading} style={styles.btn} />
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.switchRow}>
            <Text style={[styles.switchText, { color: theme.subtext }]}>{strings.hasAccount} </Text>
            <Text style={[styles.switchLink, { color: theme.primary }]}>{strings.login}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  iconCircle: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  iconText: { fontSize: 34 },
  appName: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { fontSize: 14, marginTop: 4 },
  card: { borderRadius: 20, padding: 24, borderWidth: 1, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 5 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  btn: { marginTop: 6 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  switchText: { fontSize: 14 },
  switchLink: { fontSize: 14, fontWeight: '700' },
});

export default RegisterScreen;
