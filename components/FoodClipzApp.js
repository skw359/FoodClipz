import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  Animated,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import { Easing } from 'react-native';
import LoginScreen from './LoginScreen';
import OnboardingScreen from './OnboardingScreen';
import RegisterScreen from './RegisterScreen';

const colors = {
  appDarkGreen: '#00241b',
  appScreenBackgroundStart: '#f2f7f5',
  appScreenBackgroundEnd: '#e2e8f0',
};

// main app stuff idk
const FoodClipzApp = () => {
  const [currentScreen, setCurrentScreen] = useState('onboarding');
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
  Animated.timing(slideAnim, {
  toValue: 0,
  duration: 500,
  easing: Easing.inOut(Easing.ease),
  useNativeDriver: true,
})

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
          />
        );
      case 'register':
        return (
          <RegisterScreen
            onBack={handleBackToOnboarding}
            onSwitchToLogin={handleSwitchToLogin}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.appDarkGreen} />
      
      <LinearGradient
        colors={[colors.appScreenBackgroundStart, colors.appScreenBackgroundEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
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
});

export default FoodClipzApp;