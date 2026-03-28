import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const SettingsScreen = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { strings, lang, toggleLang } = useLanguage();

  const SettingRow = ({ emoji, label, children, last }) => (
    <View style={[styles.row, { borderBottomColor: theme.border, borderBottomWidth: last ? 0 : 1 }]}>
      <Text style={styles.rowEmoji}>{emoji}</Text>
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      <View style={styles.rowControl}>{children}</View>
    </View>
  );

  const SectionHeader = ({ title }) => (
    <Text style={[styles.sectionHeader, { color: theme.subtext }]}>{title.toUpperCase()}</Text>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <Text style={[styles.screenTitle, { color: theme.text }]}>{strings.settings}</Text>

      <SectionHeader title="Appearance" />
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <SettingRow emoji="🌙" label={strings.darkMode} last>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#fff"
          />
        </SettingRow>
      </View>

      <SectionHeader title="Language" />
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <SettingRow emoji="🌐" label={strings.language} last>
          <TouchableOpacity
            onPress={toggleLang}
            style={[styles.langToggle, { backgroundColor: theme.primaryLight }]}
          >
            <View style={[styles.langPill, lang === 'en' && { backgroundColor: theme.primary }]}>
              <Text style={[styles.langText, { color: lang === 'en' ? '#fff' : theme.subtext }]}>EN</Text>
            </View>
            <View style={[styles.langPill, lang === 'de' && { backgroundColor: theme.primary }]}>
              <Text style={[styles.langText, { color: lang === 'de' ? '#fff' : theme.subtext }]}>DE</Text>
            </View>
          </TouchableOpacity>
        </SettingRow>
      </View>

      <SectionHeader title={strings.about} />
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <SettingRow emoji="📱" label="App Name">
          <Text style={[styles.valueText, { color: theme.subtext }]}>RemindMe</Text>
        </SettingRow>
        <SettingRow emoji="🔖" label={strings.version}>
          <Text style={[styles.valueText, { color: theme.subtext }]}>{strings.appVersion}</Text>
        </SettingRow>
        <SettingRow emoji="🎓" label="Project" last>
          <Text style={[styles.valueText, { color: theme.subtext, maxWidth: 140, textAlign: 'right' }]}>BMD Submission</Text>
        </SettingRow>
      </View>

      <View style={[styles.infoBox, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}>
        <Text style={[styles.infoText, { color: theme.primary }]}>
          {strings.appDescription}
        </Text>
        <Text style={[styles.infoSub, { color: theme.primary }]}>
          Stack: React Native · Node.js · MySQL
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  screenTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, paddingTop: 56, paddingBottom: 20 },
  sectionHeader: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  card: { borderRadius: 16, borderWidth: 1, marginBottom: 20, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  rowEmoji: { fontSize: 20, marginRight: 12 },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  rowControl: { alignItems: 'flex-end' },
  valueText: { fontSize: 14 },
  langToggle: { flexDirection: 'row', borderRadius: 10, padding: 3, gap: 2 },
  langPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  langText: { fontSize: 12, fontWeight: '700' },
  infoBox: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 8 },
  infoText: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  infoSub: { fontSize: 12, opacity: 0.75 },
});

export default SettingsScreen;
