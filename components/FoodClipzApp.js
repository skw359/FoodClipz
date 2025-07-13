import React, { useRef, useState } from 'react';
import {
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AuthService from '../services/AuthService';
import DeepLinkHandler from '../utils/DeepLinkHandler';
import DiscoverFeed from './DiscoverFeed';
import EmailVerificationScreen from './EmailVerificationScreen';
import LoginScreen from './LoginScreen';
import OnboardingScreen from './OnboardingScreen';
import ProfileSetupScreen from './ProfileSetupScreen';
import RegisterScreen from './RegisterScreen';

//this should prob be in a sep file soon
const COLORS = {
  appDarkGreen: '#00241b',
  appScreenBackgroundStart: '#f2f7f5',
  appScreenBackgroundEnd: '#e2e8f0',
  appPrimaryGreen: '#4ade80',
  appTextGray: '#64748b',
  appInputBackground: '#f8fafc',
};

const ANIMATION_DURATION = 300;
const SLIDE_DISTANCE = 50;

// Map Screen
const MapScreen = ({ user, onNavigate, onAddClip }) => {
  const handleBackToFeed = () => onNavigate('feed');

  return (
    <View style={[styles.container, styles.center]}>
      <Text style={styles.placeholderText}>Map Screen Coming Soon</Text>
      <TouchableOpacity style={styles.backButton} onPress={handleBackToFeed}>
        <Text style={styles.backButtonText}>Back to Feed</Text>
      </TouchableOpacity>
    </View>
  );
};

// ProfileScreen
const ProfileScreen = ({ user, onNavigate, onLogout }) => {
  const handleBackToFeed = () => onNavigate('feed');
  const userName = user?.firstName || user?.first_name;

  return (
    <View style={[styles.container, styles.center]}>
      <Text style={styles.placeholderText}>Profile Screen Coming Soon</Text>
      <Text style={styles.userInfo}>Welcome, {userName}!</Text>
      <TouchableOpacity style={styles.backButton} onPress={onLogout}>
        <Text style={styles.backButtonText}>Logout</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={handleBackToFeed}>
        <Text style={styles.backButtonText}>Back to Feed</Text>
      </TouchableOpacity>
    </View>
  );
};

// Component: CreateClipScreen
const CreateClipScreen = ({ user, onNavigate, onClipAdded }) => {
  const handleBackToFeed = () => onNavigate('feed');

  return (
    <View style={[styles.container, styles.center]}>
      <Text style={styles.placeholderText}>Add Clip Screen Coming Soon</Text>
      <TouchableOpacity style={styles.backButton} onPress={handleBackToFeed}>
        <Text style={styles.backButtonText}>Back to Feed</Text>
      </TouchableOpacity>
    </View>
  );
};

// FoodClipzApp
const FoodClipzApp = () => {
  const [currentScreen, setCurrentScreen] = useState('onboarding');
  const [userEmail, setUserEmail] = useState('');
  const [userData, setUserData] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Animations
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Animation helper
  const animateScreenTransition = (toScreen) => {
    if (isTransitioning) {
      return;
    }

    setIsTransitioning(true);

    const slideOutValue = SLIDE_DISTANCE;
    const slideInStartValue = -SLIDE_DISTANCE;

    // Slide out animation
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: slideOutValue,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset animation values
      slideAnim.setValue(slideInStartValue);
      opacityAnim.setValue(0);
      setCurrentScreen(toScreen);

      // Slide in animation
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsTransitioning(false);
        });
      });
    });
  };

  // Navigation handlers
  const handleNavigateToLogin = () => {
    animateScreenTransition('login');
  };

  const handleNavigateToRegister = () => {
    animateScreenTransition('register');
  };

  const handleBackToOnboarding = () => {
    animateScreenTransition('onboarding');
  };

  const handleSwitchToLogin = () => {
    animateScreenTransition('login');
  };

  const handleSwitchToRegister = () => {
    animateScreenTransition('register');
  };

  const handleEmailSent = (email, firstName = null, lastName = null) => {
    setUserEmail(email);
    if (firstName && lastName) {
      setRegistrationData({ firstName, lastName });
    }
    animateScreenTransition('emailVerification');
  };

  const handleVerificationSuccess = (user) => {
    console.log('Verification success called with user:', user);
    setUserData(user);
    
    const isProfileCompleted = user.profileCompleted || user.profile_completed;
    if (isProfileCompleted) {
      animateScreenTransition('feed');
    } else {
      animateScreenTransition('profileSetup');
    }
  };

  const handleProfileSetupComplete = (completedUser) => {
    const updatedUser = {
      ...completedUser,
      profileCompleted: true,
      profile_completed: true,
    };
    setUserData(updatedUser);
    animateScreenTransition('feed');
  };

  const handleMainAppNavigation = (destination) => {
    animateScreenTransition(destination);
  };

  const handleAddClip = () => {
    animateScreenTransition('addClip');
  };

  const handleLogout = () => {
    setUserData(null);
    setUserEmail('');
    setRegistrationData(null);
    animateScreenTransition('onboarding');
  };

  const handleClipAdded = () => {
    animateScreenTransition('feed');
  };

  // Email resend handler
  const resendEmail = async () => {
    if (registrationData) {
      return AuthService.sendMagicLink(
        userEmail,
        registrationData.firstName,
        registrationData.lastName
      );
    } else {
      return AuthService.sendMagicLink(userEmail);
    }
  };

  // Deep link handlers
  const handleVerificationError = (error) => {
    console.error('Verification error:', error);
  };

  // Screen renderer
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return (
          <OnboardingScreen
            onNavigateToLogin={handleNavigateToLogin}
            onNavigateToRegister={handleNavigateToRegister}
          />
        );

      case 'login':
        return (
          <LoginScreen
            onBack={handleBackToOnboarding}
            onSwitchToRegister={handleSwitchToRegister}
            onEmailSent={handleEmailSent}
          />
        );

      case 'register':
        return (
          <RegisterScreen
            onBack={handleBackToOnboarding}
            onSwitchToLogin={handleSwitchToLogin}
            onEmailSent={handleEmailSent}
          />
        );

      case 'emailVerification':
        return (
          <EmailVerificationScreen
            email={userEmail}
            onVerificationSuccess={handleVerificationSuccess}
            onBack={handleBackToOnboarding}
            onResend={resendEmail}
          />
        );

      case 'profileSetup':
        return (
          <ProfileSetupScreen
            user={userData}
            onComplete={handleProfileSetupComplete}
          />
        );

      case 'discover':
      case 'feed':
        return (
          <DiscoverFeed
            user={userData}
            onNavigate={handleMainAppNavigation}
            onAddClip={handleAddClip}
            initialTab={currentScreen === 'feed' ? 'feed' : 'discover'}
          />
        );

      case 'map':
        return (
          <MapScreen
            user={userData}
            onNavigate={handleMainAppNavigation}
            onAddClip={handleAddClip}
          />
        );

      case 'profile':
        return (
          <ProfileScreen
            user={userData}
            onNavigate={handleMainAppNavigation}
            onLogout={handleLogout}
          />
        );

      case 'addClip':
        return (
          <CreateClipScreen
            user={userData}
            onNavigate={handleMainAppNavigation}
            onClipAdded={handleClipAdded}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.appDarkGreen} />
      
      <DeepLinkHandler 
        onVerificationSuccess={handleVerificationSuccess}
        onVerificationError={handleVerificationError}
      />
      
      <View style={styles.screenContainer}>
        <Animated.View
          style={[
            styles.contentWrapper,
            {
              opacity: opacityAnim,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {renderCurrentScreen()}
        </Animated.View>
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.appInputBackground,
  },
  screenContainer: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.appInputBackground,
  },
  placeholderText: {
    fontSize: 18,
    color: COLORS.appTextGray,
    marginBottom: 20,
    fontWeight: '600',
  },
  userInfo: {
    fontSize: 16,
    color: COLORS.appDarkGreen,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: COLORS.appPrimaryGreen,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  backButtonText: {
    color: COLORS.appDarkGreen,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default FoodClipzApp;