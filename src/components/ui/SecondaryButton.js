import { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';

const colors = {
  appInputBackground: '#f8fafc',
  appInputBorder: '#e2e8f0',
  appTextGray: '#64748b',
};

const SecondaryButton = ({ title, onPress, style }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={style}
    >
      <Animated.View style={[styles.secondaryButton, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.secondaryButtonText}>{title}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: colors.appInputBackground,
    borderWidth: 1,
    borderColor: colors.appInputBorder,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.appTextGray,
  },
});

export default SecondaryButton;
