import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TextInput, View } from 'react-native';


const colors = {
  appFormLabel: '#374151',
  appInputBackground: '#f8fafc',
  appInputBorder: '#e2e8f0',
  appTextGray: '#64748b',
  errorRed: '#ef4444',
  errorRedLight: '#fef2f2',
  appSecondaryGreen: '#22c55e',
};

const TextField = ({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  keyboardType, 
  autoCapitalize, 
  secureTextEntry,
  hasError,
  multiline = false,
  maxLength,
  showCharacterCount = false,
  style
}) => {
  const errorAnimation = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (hasError) {
      Animated.timing(errorAnimation, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(errorAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [hasError]);

  return (
    <View style={[styles.textFieldContainer, style]}>
      {label && <Text style={styles.textFieldLabel}>{label}</Text>}
      <Animated.View
        style={{
          borderRadius: 12,
          borderWidth: hasError ? 2 : 1,
          borderColor: errorAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [colors.appInputBorder, colors.errorRed]
          }),
          backgroundColor: errorAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [colors.appInputBackground, colors.errorRedLight]
          }),
        }}
      >
        <TextInput
          style={[
            styles.textField,
            multiline && styles.multilineInput,
            {
              borderWidth: 0,
              backgroundColor: 'transparent'
            }
          ]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={autoCapitalize || 'sentences'}
          secureTextEntry={secureTextEntry}
          placeholderTextColor={colors.appTextGray}
          multiline={multiline}
          maxLength={maxLength}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </Animated.View>
      {showCharacterCount && maxLength && (
        <Text style={styles.characterCount}>{value?.length || 0}/{maxLength}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  textFieldContainer: {
    marginBottom: 20,
  },
  textFieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.appFormLabel,
    marginBottom: 8,
  },
  textField: {
    padding: 16,
    fontSize: 16,
    borderRadius: 12,
    color: colors.appFormLabel,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: colors.appTextGray,
    marginTop: 4,
  },
});

export default TextField;