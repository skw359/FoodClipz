import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { AuthHeader, PrimaryButton, TextField } from '../../components';
import AuthService from '../../services/AuthService';

const colors = {
  appDarkGreen: '#00241b',
  appTextGray: '#64748b',
  appPrimaryGreen: '#4ade80',
  white: '#ffffff',
  errorRed: '#ef4444',
  errorRedLight: '#fef2f2',
  errorRedDark: '#dc2626'
};

const LoginScreen = ({ onBack, onSwitchToRegister, onEmailSent }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [userNotFoundError, setUserNotFoundError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const errorAnim = useRef(new Animated.Value(0)).current;

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

  // animate error state
  useEffect(() => {
    if (userNotFoundError) {
      Animated.timing(errorAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(errorAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [userNotFoundError]);

  const handleSendLink = async () => {
    if (!email.trim()) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    setUserNotFoundError(false);
    setErrorMessage('');
    setLoading(true);
    
    try {
      await AuthService.sendMagicLink(email.trim());
      onEmailSent(email.trim());
    } catch (error) {
      if (error.message && error.message.includes('USER_NOT_FOUND')) {
        setUserNotFoundError(true);
        setErrorMessage('No account found with this email address.');
      } else {
        Alert.alert('Error', error.message || 'Failed to send magic link. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    onSwitchToRegister();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView 
        style={styles.authScreenContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <AuthHeader authMode="login" onBack={onBack} />
        
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
                <Text style={styles.authTitle}>Sign In</Text>
                <Text style={styles.authSubtitle}>Enter your email to receive a login link.</Text>
              </View>
              
              <View style={styles.formContainer}>
                <TextField
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (userNotFoundError) {
                      setUserNotFoundError(false);
                      setErrorMessage('');
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  hasError={userNotFoundError}
                />
                
                {/* error msg */}
                {userNotFoundError && (
                  <Animated.View 
                    style={[
                      styles.errorContainer,
                      {
                        opacity: errorAnim,
                        transform: [{
                          translateY: errorAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-10, 0]
                          })
                        }]
                      }
                    ]}
                  >
                    <Text style={styles.errorText}>
                      {errorMessage}
                    </Text>
                    <TouchableOpacity onPress={handleCreateAccount}>
                      <Text style={styles.registerButtonText}>
                       Tap to register.
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>
              
              <PrimaryButton
                title="Send Login Link"
                onPress={handleSendLink}
                loading={loading}
                disabled={!email.trim() || loading}
                style={{ marginBottom: 24 }}
              />
            </View>
            
            <View style={styles.switchAuthContainer}>
              <Text style={styles.switchAuthText}>Don't have an account? </Text>
              <TouchableOpacity onPress={onSwitchToRegister}>
                <Text style={styles.switchAuthLink}>Sign up</Text>
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
  errorContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.errorRedLight,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.errorRed,
  },
  errorText: {
    color: colors.errorRedDark,
    fontSize: 14,
    marginBottom: 8,
  },
  registerButtonText: {
    color: colors.appDarkGreen,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
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
});

export default LoginScreen;