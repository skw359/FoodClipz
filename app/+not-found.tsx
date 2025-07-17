import { Stack } from 'expo-router';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NotFoundScreen() {
  const handleGoHome = () => {
    // Since you're using a custom navigation system, you could:
    // 1. Just close the app (not ideal)
    // 2. Or reload the app to start fresh
    Linking.openURL('foodclipz://');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>
        <TouchableOpacity onPress={handleGoHome} style={styles.button}>
          <Text style={styles.buttonText}>Go to home screen!</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e293b',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  button: {
    marginTop: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#4ade80',
    borderRadius: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#4ade80',
    fontWeight: '600',
  },
  buttonText: {
    fontSize: 14,
    color: '#00241b',
    fontWeight: '600',
    textAlign: 'center',
  },
});