import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { AuthHeader, PrimaryButton, TextField } from '../../components';
import AuthService from '../../services/AuthService';

// Colors
const colors = {
  appDarkGreen: '#00241b',
  appPrimaryGreen: '#4ade80',
  appTextGray: '#64748b',
  white: '#ffffff'
};

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
                <TextField
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChangeText={setFullName}
                />
                <TextField
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
  formContainer: {
    marginBottom: 32,
  },
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