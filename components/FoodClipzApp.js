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

const colors = {
  appDarkGreen: '#00241b',
  appScreenBackgroundStart: '#f2f7f5',
  appScreenBackgroundEnd: '#e2e8f0',
  appPrimaryGreen: '#4ade80',
  appTextGray: '#64748b',
  appInputBackground: '#f8fafc',
};

// screens that simply doesn't exist yet
const MapScreen = ({ user, onNavigate, onAddClip }) => {
  return (
    <View style={[styles.container, styles.center]}>
      <Text style={styles.placeholderText}>Map Screen Coming Soon</Text>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => onNavigate('feed')}
      >
        <Text style={styles.backButtonText}>Back to Feed</Text>
      </TouchableOpacity>
    </View>
  );
};

const ProfileScreen = ({ user, onNavigate, onLogout }) => {
  return (
    <View style={[styles.container, styles.center]}>
      <Text style={styles.placeholderText}>Profile Screen Coming Soon</Text>
      <Text style={styles.userInfo}>Welcome, {user?.firstName || user?.first_name}!</Text>
      <TouchableOpacity style={styles.backButton} onPress={onLogout}>
        <Text style={styles.backButtonText}>Logout</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => onNavigate('feed')}
      >
        <Text style={styles.backButtonText}>Back to Feed</Text>
      </TouchableOpacity>
    </View>
  );
};

const CreateClipScreen = ({ user, onNavigate, onClipAdded }) => {
  return (
    <View style={[styles.container, styles.center]}>
      <Text style={styles.placeholderText}>Add Clip Screen Coming Soon</Text>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => onNavigate('feed')}
      >
        <Text style={styles.backButtonText}>Back to Feed</Text>
      </TouchableOpacity>
    </View>
  );
};

// main app stuff idk
const FoodClipzApp = () => {
  const [currentScreen, setCurrentScreen] = useState('onboarding');
  const [userEmail, setUserEmail] = useState('');
  const [userData, setUserData] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const [isTransitioning, setIsTransitioning] = useState(false);

  const animateScreenTransition = (toScreen, direction = 'forward') => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const slideDirection = direction === 'forward' ? (toScreen === 'onboarding' ? -50 : 50) : (toScreen === 'onboarding' ? 50 : -50);

    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: slideDirection,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start(() => {
      setCurrentScreen(toScreen);
      slideAnim.setValue(-slideDirection);
      
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start(() => {
        setIsTransitioning(false);
      });
    });
  };

  const handleNavigateToLogin = () => {
    animateScreenTransition('login');
  };

  const handleNavigateToRegister = () => {
    animateScreenTransition('register');
  };

  const handleBackToOnboarding = () => {
    animateScreenTransition('onboarding', 'backward');
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
  console.log('🔍 Verification success called with user:', user);
  setUserData(user);
  
  // first do a check if profile is already completed
  const isProfileCompleted = user.profileCompleted || user.profile_completed;
  
  console.log('Profile completed status:', isProfileCompleted);
  console.log('User data keys:', Object.keys(user));
  
  if (isProfileCompleted) {
    console.log('profile already completed, going to feed now');
    animateScreenTransition('feed');
  } else {
    console.log('profile not completed, going to setup');
    animateScreenTransition('profileSetup');
  }
};

  const handleProfileSetupComplete = (completedUser) => {
  const updatedUser = {
    ...completedUser, profileCompleted: true, profile_completed: true
  };
  
  setUserData(updatedUser);
  console.log('PROFILE COMPLETE:', updatedUser);
  
  // nav to main feed
  animateScreenTransition('feed');
};

  const resendEmail = async () => {
    if (registrationData) {
      return AuthService.sendMagicLink(userEmail, registrationData.firstName, registrationData.lastName);
    } else {
      return AuthService.sendMagicLink(userEmail);
    }
  };

  // Handle navigation from DiscoverFeed and other main app screens
  const handleMainAppNavigation = (destination) => {
    switch (destination) {
      case 'feed':
        animateScreenTransition('feed');
        break;
      case 'map':
        animateScreenTransition('map');
        break;
      case 'discover':
        animateScreenTransition('discover');
        break;
      case 'profile':
        animateScreenTransition('profile');
        break;
      case 'add':
        animateScreenTransition('addClip');
        break;
      default:
        animateScreenTransition('feed'); // Default to feed instead of discover
    }
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

  const handleEmailSent = (email, firstName = null, lastName = null) => {
    setUserEmail(email);
    if (firstName && lastName) {
      setRegistrationData({ firstName, lastName });
    }
    animateScreenTransition('emailVerification');
  };

  const handleVerificationSuccess = (user) => {
  console.log('🔍 Verification success called with user:', user);
  setUserData(user);
  
  // first do a check if profile is already completed
  const isProfileCompleted = user.profileCompleted || user.profile_completed;
  
  console.log('Profile completed status:', isProfileCompleted);
  console.log('User data keys:', Object.keys(user));
  
  if (isProfileCompleted) {
    console.log('profile already completed, going to feed now');
    animateScreenTransition('feed');
  } else {
    console.log('profile not completed, going to setup');
    animateScreenTransition('profileSetup');
  }
};

  const handleProfileSetupComplete = (completedUser) => {
  const updatedUser = {
    ...completedUser, profileCompleted: true, profile_completed: true
  };
  
  setUserData(updatedUser);
  console.log('PROFILE COMPLETE:', updatedUser);
  
  // nav to main feed
  animateScreenTransition('feed');
};

  const resendEmail = async () => {
    if (registrationData) {
      return AuthService.sendMagicLink(userEmail, registrationData.firstName, registrationData.lastName);
    } else {
      return AuthService.sendMagicLink(userEmail);
    }
  };

  // Handle navigation from DiscoverFeed and other main app screens
  const handleMainAppNavigation = (destination) => {
    switch (destination) {
      case 'feed':
        animateScreenTransition('feed');
        break;
      case 'map':
        animateScreenTransition('map');
        break;
      case 'discover':
        animateScreenTransition('discover');
        break;
      case 'profile':
        animateScreenTransition('profile');
        break;
      case 'add':
        animateScreenTransition('addClip');
        break;
      default:
        animateScreenTransition('feed'); // Default to feed instead of discover
    }
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
            onClipAdded={() => animateScreenTransition('feed')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.appDarkGreen} />

      <DeepLinkHandler 
        onVerificationSuccess={handleVerificationSuccess}
        onVerificationError={(error) => {
          console.error('Verification error:', error);
          // prob show an error here but lazy
        }}

      <DeepLinkHandler 
        onVerificationSuccess={handleVerificationSuccess}
        onVerificationError={(error) => {
          console.error('Verification error:', error);
          // prob show an error here but lazy
        }}
      />

      <Animated.View
        style={[
          styles.screenContainer,
          {
            opacity: opacityAnim,
            transform: [{ translateX: slideAnim }]
          }
        ]}
      >
        {renderCurrentScreen()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  screenContainer: {
    flex: 1,
  },
  // stupid syles for placeholder screens
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.appInputBackground,
  },
  placeholderText: {
    fontSize: 18,
    color: colors.appTextGray,
    marginBottom: 20,
    fontWeight: '600',
  },
  userInfo: {
    fontSize: 16,
    color: colors.appDarkGreen,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: colors.appPrimaryGreen,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  backButtonText: {
    color: colors.appDarkGreen,
    fontWeight: '600',
    fontSize: 16,
  },
  // stupid syles for placeholder screens
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.appInputBackground,
  },
  placeholderText: {
    fontSize: 18,
    color: colors.appTextGray,
    marginBottom: 20,
    fontWeight: '600',
  },
  userInfo: {
    fontSize: 16,
    color: colors.appDarkGreen,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: colors.appPrimaryGreen,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  backButtonText: {
    color: colors.appDarkGreen,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default FoodClipzApp;