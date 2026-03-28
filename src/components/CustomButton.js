import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const CustomButton = ({ title, onPress, variant = 'primary', loading = false, style }) => {
  const { theme } = useTheme();

  const bg =
    variant === 'primary'
      ? theme.primary
      : variant === 'danger'
      ? theme.danger
      : theme.inputBg;

  const color =
    variant === 'ghost' ? theme.primary : '#FFFFFF';

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bg }, style]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Text style={[styles.text, { color }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontSize: 15, fontWeight: '700', letterSpacing: 0.4 },
});

export default CustomButton;
