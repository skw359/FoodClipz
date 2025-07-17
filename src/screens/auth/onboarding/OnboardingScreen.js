// components/OnboardingScreen.js

import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';

import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const colors = {
  appDarkGreen: '#00241b',
  appMediumGreen: '#003d2e',
  appPrimaryGreen: '#4ade80',
  appSecondaryGreen: '#22c55e',
  appTextGray: '#64748b',
  appFeatureTitle: '#1e293b',
  appOnboardingBackground: '#f3f7f5',
};

//UPDATE THE ONBOARDING DATA WITH FONT AWESOME ICON NAMES RN
const onboardingData = [
  {
    id: 1,
    icon: 'utensils',
    title: 'Welcome to FoodClipz',
    subtitle: 'The social platform for food lovers. Track, share, and discover amazing dining experiences.',
    features: null,
    primaryButtonText: 'Get Started',
    secondaryButtonText: 'I have an account'
  },
  {
    id: 2,
    icon: 'map-marker-alt',
    title: 'Track Your Food Journey',
    subtitle: null,
    features: [
      { icon: 'camera', title: 'Create Food Clips', description: 'Rate and review every meal' },
      { icon: 'map-marked-alt', title: 'Interactive Map', description: 'See everywhere you\'ve eaten' },
      { icon: 'trophy', title: 'Earn Achievements', description: 'Unlock badges and streaks' }
    ],
    primaryButtonText: 'Continue',
    secondaryButtonText: 'Skip'
  },
  {
    id: 3,
    icon: 'users',
    title: 'Connect & Discover',
    subtitle: null,
    features: [
      { icon: 'heart', title: 'Follow Friends', description: 'See what your friends are eating' },
      { icon: 'search', title: 'Find New Places', description: 'Discover trending restaurants' },
      { icon: 'star', title: 'Trusted Reviews', description: 'Read reviews from real foodies' }
    ],
    primaryButtonText: 'Join FoodClipz',

  }
];

// list of features
const FeatureListView = ({ features }) => {
  const fadeAnims = useRef(features.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = fadeAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    );

    Animated.stagger(100, animations).start();
  }, []);

  return (
    <View style={styles.featuresContainer}>
      {features.map((feature, index) => {
        // handle solid icons like 'heart' and 'star'
        const isSolid = ['heart', 'star'].includes(feature.icon);
        return (
            <Animated.View 
              key={index} 
              style={[
                styles.featureItem,
                { opacity: fadeAnims[index] }
              ]}
            >
              <LinearGradient
                colors={[colors.appPrimaryGreen, colors.appSecondaryGreen]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.featureIconContainer}
              >
                {/* REPLACE THETEXT WITH FONT AWESOME */}
                <FontAwesome5 
                    name={feature.icon} 
                    size={18} 
                    color={colors.appDarkGreen} 
                    solid={isSolid} 
                />
              </LinearGradient>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </Animated.View>
        )
      })}
    </View>
  );
};

// make a page loader like progress tracker sorta
const PageIndicator = ({ pageCount, currentPage }) => {
  const scaleAnims = useRef(Array.from({ length: pageCount }, () => new Animated.Value(1))).current;

  useEffect(() => {
    scaleAnims.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: index === currentPage ? 1.2 : 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }).start();
    });
  }, [currentPage]);

  return (
    <View style={styles.pageIndicatorContainer}>
      {Array.from({ length: pageCount }).map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.pageIndicatorDot,
            {
              backgroundColor: index === currentPage ? colors.appPrimaryGreen : '#e3e8f1',
              transform: [{ scale: scaleAnims[index] }]
            }
          ]}
        />
      ))}
    </View>
  );
};

const PrimaryButton = ({ title, onPress, style }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
 // add a press in effect too cuz it'd prob look cool
  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 0.98, tension: 300, friction: 10, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0.8, duration: 100, useNativeDriver: true })
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();
  };

  return (
    <TouchableOpacity onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={1} style={style}>
      <Animated.View style={[{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
        <LinearGradient colors={[colors.appPrimaryGreen, colors.appSecondaryGreen]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{title}</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const SecondaryButton = ({ title, onPress, style }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => { Animated.spring(scaleAnim, { toValue: 0.98, tension: 300, friction: 10, useNativeDriver: true }).start(); };
  const handlePressOut = () => { Animated.spring(scaleAnim, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }).start(); };
  return (
    <TouchableOpacity onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={1} style={style}>
      <Animated.View style={[styles.secondaryButton, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.secondaryButtonText}>{title}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const OnboardingPageContent = ({ data, onPrimaryPress, onSecondaryPress, isActive }) => {
  const iconScaleAnim = useRef(new Animated.Value(0)).current;
  const titleFadeAnim = useRef(new Animated.Value(0)).current;
  const contentSlideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (isActive) {
      iconScaleAnim.setValue(0);
      titleFadeAnim.setValue(0);
      contentSlideAnim.setValue(50);
      Animated.sequence([
        Animated.timing(iconScaleAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(titleFadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
          Animated.spring(contentSlideAnim, { toValue: 0, tension: 250, friction: 12, useNativeDriver: true })
        ])
      ]).start();
    }
  }, [isActive]);

  return (
    <View style={styles.onboardingPage}>
      <View style={styles.onboardingContent}>
        <Animated.View 
          style={[
            styles.onboardingIconContainer,
            { transform: [{ scale: iconScaleAnim }] }
          ]}
        >
          <LinearGradient
            colors={[colors.appPrimaryGreen, colors.appSecondaryGreen]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.onboardingIconGradient}
          >
            <FontAwesome5 name={data.icon} size={48} color={colors.appDarkGreen} />
          </LinearGradient>
        </Animated.View>
        
        <Animated.Text 
          style={[ styles.onboardingTitle, { opacity: titleFadeAnim } ]}
        >
          {data.title}
        </Animated.Text>
        
        <Animated.View 
          style={[
            styles.onboardingSubContent,
            { opacity: titleFadeAnim, transform: [{ translateY: contentSlideAnim }] }
          ]}
        >
          {data.subtitle ? (
            <Text style={styles.onboardingSubtitle}>{data.subtitle}</Text>
          ) : data.features ? (
            <FeatureListView features={data.features} />
          ) : null}
        </Animated.View>
      </View>
      
      <Animated.View 
        style={[ styles.onboardingButtons, { opacity: titleFadeAnim } ]}
      >
        <PrimaryButton 
          title={data.primaryButtonText} 
          onPress={onPrimaryPress} 
          style={{ marginBottom: data.secondaryButtonText ? 12 : 0 }}
        />
        {data.secondaryButtonText && (
          <SecondaryButton title={data.secondaryButtonText} onPress={onSecondaryPress}/>
        )}
      </Animated.View>
    </View>
  );
};

const OnboardingScreen = ({ onNavigateToLogin, onNavigateToRegister }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 20,
    onPanResponderMove: (_, gestureState) => { slideAnim.setValue(-currentPage * screenWidth + gestureState.dx); },
    onPanResponderRelease: (_, gestureState) => {
      const threshold = screenWidth * 0.25;
      let targetPage = currentPage;
      if (gestureState.dx > threshold && currentPage > 0) {
        targetPage = currentPage - 1;
      } else if (gestureState.dx < -threshold && currentPage < onboardingData.length - 1) {
        targetPage = currentPage + 1;
      }
      animateToPage(targetPage);
    },
  });

  const animateToPage = (pageIndex) => {
    setCurrentPage(pageIndex);
    Animated.spring(slideAnim, { toValue: -pageIndex * screenWidth, tension: 300, friction: 12, useNativeDriver: true }).start();
  };

  const handleOnboardingPrimary = () => {
    if (currentPage < onboardingData.length - 1) {
      animateToPage(currentPage + 1);
    } else {
      onNavigateToRegister();
    }
  };

  const handleOnboardingSecondary = () => { onNavigateToLogin(); };

  useEffect(() => { slideAnim.setValue(-currentPage * screenWidth); }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.appOnboardingBackground, colors.appOnboardingBackground]} style={styles.onboardingBackground}>
        <View style={styles.carouselContainer} {...panResponder.panHandlers}>
          <Animated.View style={[ styles.slidingContainer, { width: screenWidth * onboardingData.length, transform: [{ translateX: slideAnim }] } ]}>
            {onboardingData.map((data, index) => (
              <View key={data.id} style={[styles.slideWrapper, { width: screenWidth }]}>
                <OnboardingPageContent data={data} onPrimaryPress={handleOnboardingPrimary} onSecondaryPress={handleOnboardingSecondary} isActive={index === currentPage} />
              </View>
            ))}
          </Animated.View>
        </View>
        <PageIndicator pageCount={onboardingData.length} currentPage={currentPage}/>
      </LinearGradient>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  onboardingBackground: {
    flex: 1,
  },
  carouselContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  slidingContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  slideWrapper: {
    flex: 1,
  },
  onboardingPage: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 40,
  },
  onboardingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onboardingIconContainer: {
    marginBottom: 40,
    shadowColor: colors.appPrimaryGreen,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  onboardingIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  onboardingTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.appDarkGreen,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  onboardingSubContent: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  onboardingSubtitle: {
    fontSize: 18,
    color: colors.appTextGray,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  onboardingButtons: {
    paddingBottom: 20,
  },
  featuresContainer: {
    marginTop: 20,
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.appFeatureTitle,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.appTextGray,
  },
  pageIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 40,
  },
  pageIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
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
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#f2f7f5',
    borderWidth: 1,
    borderColor: '#e3e8f1',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.appTextGray,
  },
});

export default OnboardingScreen;