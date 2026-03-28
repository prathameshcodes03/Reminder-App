import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ReminderCard = ({ item, onEdit, onDelete }) => {
  const { theme } = useTheme();

  const isPast = new Date(item.datetime) < new Date();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: isPast ? theme.subtext : theme.primary }]} />
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.desc, { color: theme.subtext }]} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={[styles.time, { color: isPast ? theme.subtext : theme.primary }]}>
          {item.datetime}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit} style={[styles.actionBtn, { backgroundColor: theme.primaryLight }]}>
          <Text style={[styles.actionText, { color: theme.primary }]}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={[styles.actionBtn, { backgroundColor: '#FEE2E2', marginTop: 6 }]}>
          <Text style={styles.actionText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 12, marginTop: 4, alignSelf: 'flex-start' },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  desc: { fontSize: 13, marginBottom: 5, lineHeight: 18 },
  time: { fontSize: 12, fontWeight: '600' },
  actions: { marginLeft: 10 },
  actionBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 15 },
});

export default ReminderCard;
