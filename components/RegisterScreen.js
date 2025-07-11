import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import AuthService from '../services/AuthService';

// Colors
const colors = {
  appDarkGreen: '#00241b',
  appMediumGreen: '#003d2e',
  appPrimaryGreen: '#4ade80',
  appSecondaryGreen: '#22c55e',
  appTextGray: '#64748b',
  appFormLabel: '#374151',
  appInputBorder: '#e3e8f1',
  appInputBackground: '#f8fafc',
  white: '#ffffff'
};

// custom textfield for email
const CustomTextField = ({ label, placeholder, value, onChangeText, keyboardType, autoCapitalize, secureTextEntry }) => (
  <View style={styles.textFieldContainer}>
    <Text style={styles.textFieldLabel}>{label}</Text>
    <TextInput
      style={styles.textField}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType || 'default'}
      autoCapitalize={autoCapitalize || 'sentences'}
      secureTextEntry={secureTextEntry}
      placeholderTextColor={colors.appTextGray}
    />
  </View>
);

// auth header
const AuthHeader = ({ authMode, onBack }) => (
  <LinearGradient
    colors={[colors.appDarkGreen, colors.appMediumGreen]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.authHeader}
  >
    <SafeAreaView style={styles.authHeaderSafeArea}>
      <View style={styles.authHeaderContent}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={16} color={colors.white} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <View style={styles.authHeaderTitles}>
          <Text style={styles.authHeaderTitle}>FoodClipz</Text>
          <Text style={styles.authHeaderSubtitle}>
            {authMode === 'login' ? 'Welcome back!' : 'Join the community!'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  </LinearGradient>
);

// primary button
const PrimaryButton = ({ title, onPress, style, disabled, loading }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      disabled={disabled}
      style={style}
    >
      <Animated.View 
        style={[
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim }
        ]}
      >
        <LinearGradient
          colors={[colors.appPrimaryGreen, colors.appSecondaryGreen]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? 'Sending...' : title}
          </Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

// register screen
const RegisterScreen = ({ onBack, onSwitchToLogin, onEmailSent }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleTermsPress = () => {
    Linking.openURL('');
  };

  const handlePrivacyPress = () => {
    Linking.openURL('');
  };

  const handleContinue = async () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert('Required Fields', 'Please enter your full name and email.');
      return;
    }

    const nameParts = fullName.trim().split(' ');
    if (nameParts.length < 2) {
      Alert.alert('Full Name Required', 'Please enter both your first and last name.');
      return;
    }

    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    setLoading(true);

    try {
      await AuthService.sendMagicLink(email.trim(), firstName, lastName);
      onEmailSent(email.trim(), firstName, lastName);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView 
        style={styles.authScreenContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <AuthHeader authMode="register" onBack={onBack} />
        
        <Animated.View 
          style={[
            styles.authContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.authContent}>
            <View>
              <View style={styles.authTitleContainer}>
                <Text style={styles.authTitle}>Create Account</Text>
                <Text style={styles.authSubtitle}>Enter your name and email to get started.</Text>
              </View>
              
              <View style={styles.formContainer}>
                <CustomTextField
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChangeText={setFullName}
                />
                <CustomTextField
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <PrimaryButton
                title="Continue with Email"
                onPress={handleContinue}
                loading={loading}
                disabled={!fullName.trim() || !email.trim() || loading}
                style={{ marginBottom: 16 }}
              />

              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By creating an account, you agree to our{' '}
                  <Text style={styles.termsLink} onPress={handleTermsPress}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink} onPress={handlePrivacyPress}>Privacy Policy</Text>
                </Text>
              </View>
            </View>

            <View style={styles.switchAuthContainer}>
              <Text style={styles.switchAuthText}>Already have an account? </Text>
              <TouchableOpacity onPress={onSwitchToLogin}>
                <Text style={styles.switchAuthLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  // Auth Header Styles
  authHeader: {
    height: 280,
  },
  authHeaderSafeArea: {
    flex: 1,
  },
  authHeaderContent: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
    marginLeft: 8,
  },
  authHeaderTitles: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  authHeaderTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.white,
    marginBottom: 12,
  },
  authHeaderSubtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
  },
  
  // Auth Screen Styles
  authScreenContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },

  authContainer: {
    flex: 1,
  },

  authContent: {
    flex: 1, 
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingTop: 40,
    paddingBottom: 20,
  },
  authTitleContainer: {
    marginBottom: 40,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.appDarkGreen,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: colors.appTextGray,
  },
  
  // Form Styles
  formContainer: {
    marginBottom: 32,
  },
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
    backgroundColor: colors.appInputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.appInputBorder,
    color: colors.appFormLabel,
  },
  
  // Button Styles
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.appPrimaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.appDarkGreen,
  },
  
  // Switch Auth Styles
  switchAuthContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

  },
  switchAuthText: {
    fontSize: 14,
    color: colors.appTextGray,
    paddingBottom: 40,
  },
  switchAuthLink: {
    fontSize: 14,
    color: colors.appPrimaryGreen,
    fontWeight: '600',
    paddingBottom: 40,
  },
  
  // Terms Styles
  termsContainer: {
  },
  termsText: {
    fontSize: 12,
    color: colors.appTextGray,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: colors.appPrimaryGreen,
  },
});

export default RegisterScreen;