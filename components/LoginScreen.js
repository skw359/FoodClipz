import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
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

const colors = {
  appDarkGreen: '#00241b',
  appMediumGreen: '#003d2e',
  appPrimaryGreen: '#4ade80',
  appSecondaryGreen: '#22c55e',
  appTextGray: '#64748b',
  appFormLabel: '#374151',
  appInputBorder: '#e3e8f1',
  appInputBackground: '#f8fafc',
  white: '#ffffff',
  errorRed: '#ef4444',
  errorRedLight: '#fef2f2',
  errorRedDark: '#dc2626'
};

const CoolTextField = ({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  keyboardType, 
  autoCapitalize, 
  secureTextEntry,
  hasError,
  errorAnimation
}) => {
  return (
    <View style={styles.textFieldContainer}>
      <Text style={styles.textFieldLabel}>{label}</Text>
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
        />
      </Animated.View>
    </View>
  );
};

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
      Alert.alert('email required', 'pls enter your email address.');
      return;
    }

    setUserNotFoundError(false);
    setErrorMessage('');
    setLoading(true);
    
    try {
      await AuthService.sendMagicLink(email.trim());
      onEmailSent(email.trim());
    } catch (error) {
      // uhhh imma check if it's the specific "user not found" error n then show the error
      if (error.message && error.message.includes('USER_NOT_FOUND')) {
        setUserNotFoundError(true);
        setErrorMessage('No account found with this email address.');
      } else {
        // Show popup for other errors cuz idk
        Alert.alert('Error', error.message || 'Failed to send magic link. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // when the user clicks "Sign uP"
  const handleCreateAccount = () => {
    onSwitchToRegister();
    // I wanna add pre-fill the email but I might need to pass it
    // depending on how the registration screen is set up
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
                <CoolTextField
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
                  errorAnimation={errorAnim}
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
    color: colors.black,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'bold',
  },
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