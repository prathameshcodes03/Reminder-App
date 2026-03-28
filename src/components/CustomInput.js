import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const CustomInput = ({ label, ...props }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[styles.label, { color: theme.subtext }]}>{label}</Text>
      ) : null}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.inputBg,
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        placeholderTextColor={theme.subtext}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, letterSpacing: 0.3 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
  },
});

export default CustomInput;
