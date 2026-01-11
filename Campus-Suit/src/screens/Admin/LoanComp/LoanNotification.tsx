import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../../theme/theme';

export const LoanNotification = () => {
  const [message, setMessage] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>

      <TextInput
        placeholder="Enter notification"
        style={styles.input}
        value={message}
        onChangeText={setMessage}
      />

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: 8,
  },
  btnText: { color: '#fff', textAlign: 'center' },
});
