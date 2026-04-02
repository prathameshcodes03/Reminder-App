import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView, Alert, KeyboardAvoidingView, Platform,
  Animated,
} from 'react-native';
import { Audio } from 'expo-av';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

// ─── Scroll Wheel Picker ──────────────────────────────────────────────────────
const ITEM_H = 46;
const VISIBLE = 3;

const ScrollPicker = ({ data, selected, onSelect, width = 64 }) => {
  const { theme } = useTheme();
  const ref = useRef(null);
  const idx = data.indexOf(String(selected));

  useEffect(() => {
    if (ref.current && idx >= 0) {
      setTimeout(() => ref.current?.scrollTo({ y: idx * ITEM_H, animated: false }), 50);
    }
  }, []);

  return (
    <View style={[sp.wrap, { width, height: ITEM_H * VISIBLE, backgroundColor: theme.inputBg, borderColor: theme.border }]}>
      <View pointerEvents="none" style={[sp.highlight, { top: ITEM_H, height: ITEM_H, borderColor: theme.primary, backgroundColor: theme.primaryLight }]} />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onMomentumScrollEnd={e => {
          const newIdx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
          const clamped = Math.max(0, Math.min(newIdx, data.length - 1));
          onSelect(data[clamped]);
        }}
        contentContainerStyle={{ paddingVertical: ITEM_H }}
      >
        {data.map(item => (
          <View key={item} style={[sp.item, { height: ITEM_H }]}>
            <Text style={[sp.txt, {
              color: String(item) === String(selected) ? theme.primary : theme.subtext,
              fontWeight: String(item) === String(selected) ? '700' : '400',
              fontSize: String(item) === String(selected) ? 17 : 15,
            }]}>
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const sp = StyleSheet.create({
  wrap: { borderRadius: 14, borderWidth: 1, overflow: 'hidden', position: 'relative' },
  highlight: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1.5, borderBottomWidth: 1.5, zIndex: 1 },
  item: { alignItems: 'center', justifyContent: 'center' },
  txt: {},
});

// ─── Reminder Card ────────────────────────────────────────────────────────────
const ReminderCard = ({ item, onComplete, onDelete, theme }) => {
  const isOverdue = new Date(item.isoDate || item.iso_date) < new Date() && !item.done;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleComplete = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => onComplete(item.id));
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <View style={[
        rc.card,
        {
          backgroundColor: theme.card,
          borderColor: isOverdue ? theme.danger : item.done ? theme.success + '66' : theme.border,
          borderWidth: isOverdue ? 1.5 : 1,
        },
      ]}>
        <View style={[rc.bar, { backgroundColor: isOverdue ? theme.danger : item.done ? theme.success : theme.primary }]} />
        <View style={rc.info}>
          <Text style={[rc.title, { color: theme.text }, item.done && rc.strikethrough]} numberOfLines={1}>
            {item.title}
          </Text>
          {!!item.description && (
            <Text style={[rc.desc, { color: theme.subtext }]} numberOfLines={1}>{item.description}</Text>
          )}
          <View style={rc.timeRow}>
            <Text style={[rc.time, { color: isOverdue ? theme.danger : item.done ? theme.success : theme.primary }]}>
              {isOverdue ? '⚠ ' : ''}{item.displayDate} · {item.displayTime}
            </Text>
            {isOverdue && (
              <View style={[rc.overdueTag, { backgroundColor: theme.danger + '22' }]}>
                <Text style={[rc.overdueText, { color: theme.danger }]}>Overdue</Text>
              </View>
            )}
          </View>
        </View>
        <View style={rc.actions}>
          {!item.done && (
            <TouchableOpacity onPress={handleComplete} style={[rc.aBtn, { backgroundColor: theme.success + '22' }]}>
              <Text style={{ fontSize: 16 }}>✓</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => onDelete(item.id)} style={[rc.aBtn, { backgroundColor: '#FEE2E2', marginTop: item.done ? 0 : 6 }]}>
            <Text style={{ fontSize: 14 }}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const rc = StyleSheet.create({
  card: { flexDirection: 'row', borderRadius: 16, marginBottom: 10, overflow: 'hidden' },
  bar: { width: 4 },
  info: { flex: 1, padding: 12 },
  title: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  desc: { fontSize: 12, marginBottom: 4 },
  strikethrough: { textDecorationLine: 'line-through', opacity: 0.5 },
  timeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  time: { fontSize: 11, fontWeight: '600' },
  overdueTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  overdueText: { fontSize: 10, fontWeight: '700' },
  actions: { padding: 10, justifyContent: 'center' },
  aBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});

// ─── Picker data ──────────────────────────────────────────────────────────────
const HOURS = ['01','02','03','04','05','06','07','08','09','10','11','12'];
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const PERIODS = ['AM', 'PM'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const YEARS = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() + i));

// ─── Main Screen ──────────────────────────────────────────────────────────────
const NotificationsScreen = () => {
  const { theme } = useTheme();
  const { strings } = useLanguage();
  const { user, getReminders, saveReminder, markComplete, removeReminder } = useAuth();

  const [reminders, setReminders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [step, setStep] = useState(1);

  // Step 1 fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Step 2 — scroll wheel state
  const today = new Date();
  const [selHour, setSelHour] = useState(String(today.getHours() % 12 || 12).padStart(2, '0'));
  const [selMin, setSelMin] = useState(String(today.getMinutes()).padStart(2, '0'));
  const [selPeriod, setSelPeriod] = useState(today.getHours() < 12 ? 'AM' : 'PM');
  const [selDay, setSelDay] = useState(String(today.getDate()));
  const [selMonth, setSelMonth] = useState(MONTHS[today.getMonth()]);
  const [selYear, setSelYear] = useState(String(today.getFullYear()));

  const getDays = () => {
    const moIdx = MONTHS.indexOf(selMonth);
    const count = new Date(Number(selYear), moIdx + 1, 0).getDate();
    return Array.from({ length: count }, (_, i) => String(i + 1));
  };

  useEffect(() => { loadReminders(); }, [user]);

  const loadReminders = async () => {
    try {
      const data = await getReminders();
      setReminders(data);
    } catch (e) {
      console.log('Load reminders error:', e.message);
    }
  };

  const buildIsoDate = () => {
    let h = parseInt(selHour, 10);
    if (selPeriod === 'PM' && h !== 12) h += 12;
    if (selPeriod === 'AM' && h === 12) h = 0;
    const moIdx = MONTHS.indexOf(selMonth);
    const d = new Date(Number(selYear), moIdx, Number(selDay), h, parseInt(selMin, 10));
    return d.toISOString();
  };

  const formatDisplay = isoDate => {
    const d = new Date(isoDate);
    return {
      displayDate: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      displayTime: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
  };

  const resetModal = () => {
    setModalVisible(false);
    setStep(1);
    setTitle('');
    setDescription('');
  };

  const handleNextStep = () => {
    if (!title.trim()) return Alert.alert('Error', 'Please enter a title');
    setStep(2);
  };

  const handleSave = async () => {
    const isoDate = buildIsoDate();
    const { displayDate, displayTime } = formatDisplay(isoDate);
    try {
      const saved = await saveReminder({
        title: title.trim(),
        description: description.trim(),
        iso_date: isoDate,
        display_date: displayDate,
        display_time: displayTime,
      });
      setReminders(prev => [{ ...saved, isoDate: saved.iso_date, displayDate: saved.display_date, displayTime: saved.display_time }, ...prev]);
      resetModal();
    } catch (e) {
      Alert.alert('Error', 'Could not save reminder. Check your connection.');
    }
  };

  const playCheckSound = async () => {
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
        { shouldPlay: true, volume: 1.0 }
      );
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) sound.unloadAsync();
      });
    } catch (e) {
      console.log('Sound error:', e);
    }
  };

  const handleComplete = async id => {
    playCheckSound();
    try {
      await markComplete(id);
      setReminders(prev => prev.map(r => r.id === id ? { ...r, done: true, is_done: 1 } : r));
    } catch (e) {
      Alert.alert('Error', 'Could not complete reminder.');
    }
  };

  const handleDelete = id => {
    Alert.alert('Delete', 'Remove this reminder?', [
      { text: strings.cancel, style: 'cancel' },
      {
        text: strings.delete, style: 'destructive',
        onPress: async () => {
          try {
            await removeReminder(id);
            setReminders(prev => prev.filter(r => r.id !== id));
          } catch (e) {
            Alert.alert('Error', 'Could not delete reminder.');
          }
        },
      },
    ]);
  };

  const filtered = reminders
    .filter(r => {
      const isPast = new Date(r.isoDate) < new Date();
      return activeTab === 'upcoming' ? !isPast && !r.done : isPast || r.done;
    })
    .sort((a, b) =>
      activeTab === 'upcoming'
        ? new Date(a.isoDate) - new Date(b.isoDate)
        : new Date(b.isoDate) - new Date(a.isoDate)
    );

  const overdueCount = reminders.filter(r => new Date(r.isoDate) < new Date() && !r.done).length;
  const pendingCount = reminders.filter(r => !r.done).length;

  return (
    <View style={[s.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={s.topBar}>
        <Text style={[s.screenTitle, { color: theme.text }]}>{strings.reminders}</Text>
        {pendingCount > 0 && (
          <View style={[s.badge, { backgroundColor: theme.primaryLight }]}>
            <Text style={[s.badgeText, { color: theme.primary }]}>{pendingCount}</Text>
          </View>
        )}
        {overdueCount > 0 && (
          <View style={[s.badge, { backgroundColor: theme.danger + '22' }]}>
            <Text style={[s.badgeText, { color: theme.danger }]}>⚠ {overdueCount}</Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={[s.tabRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {['upcoming', 'past'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.tabPill, activeTab === tab && { backgroundColor: theme.primary }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabText, { color: activeTab === tab ? '#fff' : theme.subtext }]}>
              {tab === 'upcoming' ? strings.upcoming : strings.past}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 44 }}>📭</Text>
          <Text style={[s.emptyText, { color: theme.subtext }]}>{strings.noReminders}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ReminderCard item={item} onComplete={handleComplete} onDelete={handleDelete} theme={theme} />
          )}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB — bottom right */}
      <TouchableOpacity
        style={[s.fab, { backgroundColor: theme.primary }]}
        onPress={() => { setStep(1); setModalVisible(true); }}
        activeOpacity={0.85}
      >
        <Text style={s.fabText}>＋</Text>
      </TouchableOpacity>

      {/* 2-Step Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={resetModal}>
        <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[s.sheet, { backgroundColor: theme.card, borderColor: theme.border }]}>

            {/* Step indicator dots */}
            <View style={s.stepRow}>
              <View style={[s.stepDot, { backgroundColor: theme.primary }]} />
              <View style={[s.stepLine, { backgroundColor: step === 2 ? theme.primary : theme.border }]} />
              <View style={[s.stepDot, { backgroundColor: step === 2 ? theme.primary : theme.border }]} />
            </View>

            {step === 1 ? (
              /* ── Step 1: Title & Description ── */
              <>
                <Text style={[s.sheetTitle, { color: theme.text }]}>{strings.addReminder}</Text>
                <Text style={[s.stepLabel, { color: theme.subtext }]}>Step 1 of 2 — What's the reminder?</Text>
                <CustomInput
                  label={strings.title}
                  placeholder="e.g. Team Meeting"
                  value={title}
                  onChangeText={setTitle}
                  autoFocus
                />
                <CustomInput
                  label={`${strings.description} (optional)`}
                  placeholder="Details..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={2}
                  style={{ textAlignVertical: 'top', minHeight: 56 }}
                />
                <View style={s.modalBtns}>
                  <CustomButton title={strings.cancel} onPress={resetModal} variant="ghost" style={{ flex: 1, marginRight: 8 }} />
                  <CustomButton title="Next →" onPress={handleNextStep} style={{ flex: 1 }} />
                </View>
              </>
            ) : (
              /* ── Step 2: Scroll Wheel Date & Time ── */
              <>
                <Text style={[s.sheetTitle, { color: theme.text }]} numberOfLines={1}>{title}</Text>
                <Text style={[s.stepLabel, { color: theme.subtext }]}>Step 2 of 2 — When?</Text>

                {/* Date row */}
                <View style={s.pickerRow}>
                  <ScrollPicker data={getDays()} selected={selDay} onSelect={setSelDay} width={52} />
                  <ScrollPicker data={MONTHS} selected={selMonth} onSelect={setSelMonth} width={66} />
                  <ScrollPicker data={YEARS} selected={selYear} onSelect={setSelYear} width={74} />
                </View>

                <View style={[s.divider, { backgroundColor: theme.border }]} />

                {/* Time row */}
                <View style={s.pickerRow}>
                  <ScrollPicker data={HOURS} selected={selHour} onSelect={setSelHour} width={60} />
                  <Text style={[s.colon, { color: theme.text }]}>:</Text>
                  <ScrollPicker data={MINUTES} selected={selMin} onSelect={setSelMin} width={60} />
                  <ScrollPicker data={PERIODS} selected={selPeriod} onSelect={setSelPeriod} width={58} />
                </View>

                <View style={s.modalBtns}>
                  <CustomButton title="← Back" onPress={() => setStep(1)} variant="ghost" style={{ flex: 1, marginRight: 8 }} />
                  <CustomButton title={strings.save} onPress={handleSave} style={{ flex: 1 }} />
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 14, gap: 8 },
  screenTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginRight: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  tabRow: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 4, marginBottom: 14 },
  tabPill: { flex: 1, paddingVertical: 7, borderRadius: 9, alignItems: 'center' },
  tabText: { fontSize: 12, fontWeight: '600' },
  list: { paddingBottom: 100 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 80 },
  emptyText: { fontSize: 13, textAlign: 'center', maxWidth: 220, lineHeight: 20 },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8,
    shadowColor: '#4F6EF7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  fabText: { fontSize: 30, color: '#fff', lineHeight: 34 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000055' },
  sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 24, borderWidth: 1, paddingBottom: 40 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  stepDot: { width: 10, height: 10, borderRadius: 5 },
  stepLine: { flex: 1, height: 2, marginHorizontal: 6 },
  sheetTitle: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  stepLabel: { fontSize: 12, marginBottom: 14 },
  modalBtns: { flexDirection: 'row', marginTop: 16 },
  pickerRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center' },
  divider: { height: 1, marginVertical: 12 },
  colon: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
});

export default NotificationsScreen;
