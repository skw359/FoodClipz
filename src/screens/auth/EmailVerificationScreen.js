import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const colors = {
  appDarkGreen: '#00241b',
  appMediumGreen: '#003d2e',
  appPrimaryGreen: '#4ade80',
  appSecondaryGreen: '#22c55e',
  appTextGray: '#64748b',
  white: '#ffffff',
  appSuccessGreen: '#10b981',
  appErrorRed: '#ef4444'
};

// animated check icon component
const AnimatedCheckIcon = () => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.successIconContainer,
        {
          transform: [
            { scale: scaleAnim },
            { rotate: rotate }
          ]
        }
      ]}
    >
      <LinearGradient
        colors={[colors.appSuccessGreen, colors.appPrimaryGreen]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.successIconGradient}
      >
        <Ionicons name="checkmark" size={48} color={colors.white} />
      </LinearGradient>
    </Animated.View>
  );
};

// ripple effect
const LoadingSpinner = () => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const TOTAL_INTERVAL = 60000;
    const ANIMATION_DURATION = 1800;
    const DELAY_DURATION = TOTAL_INTERVAL - ANIMATION_DURATION;

    // Create a looping animation that plays a sequence, 1. run the ripple animation and then wait for the remaining time
    const animation = Animated.loop(
      Animated.sequence([
        // so this is the ripple animation that expands and fades
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        // n then this creates a pause before the next loop iteration
        Animated.delay(DELAY_DURATION)
      ])
    );
    
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  // interpolate the animation value to control scale and opacity
  // when pulseAnim goes from 0 to 1, the ripple expands and fades out
  // it will then hold at 1 during the Animated.delay period
  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.3, 0],
  });

  return (
    <View style={styles.loadingContainer}>
      {/* the green ripple effect, positioned behind the icon */}
      <Animated.View
        style={[
          styles.ripple,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      />
      {/* this is the actual static mail icon */}
      <LinearGradient
        colors={[colors.appPrimaryGreen, colors.appSecondaryGreen]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.loadingGradient}
      >
        <Ionicons name="mail" size={32} color={colors.appDarkGreen} />
      </LinearGradient>
    </View>
  );
};

// primary button component
const PrimaryButton = ({ title, onPress, style }) => {
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
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
          colors={[colors.appPrimaryGreen, colors.appSecondaryGreen]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>{title}</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

// main verification screen
const EmailVerificationScreen = ({ email, onVerificationSuccess, onBack, onResend }) => {
  const [status, setStatus] = useState('waiting'); // 'waiting', 'checking', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

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

    // now start countdown for resend button
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  useEffect(() => {
    let pollInterval;
    if (status === 'waiting') {
      pollInterval = setInterval(async () => {
        // ig i could implement a status check endpoint on your backend but i'm lazy so we'll use deep linking
      }, 3000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [status]);

  const resendEmail = async () => {
    if (!canResend) return;

    try {
      setStatus('checking');
      await onResend();
      setCountdown(60);
      setCanResend(false);
      setStatus('waiting');

      // restart countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'Failed to resend email');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'waiting':
        return (
          <>
            <LoadingSpinner />
            <Text style={styles.title}>Check Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a magic login link to{'\n'}
              <Text style={styles.email}>{email}</Text>
            </Text>
            <Text style={styles.description}>
              Click the link in your email to verify your account and continue to FoodClipz.
            </Text>
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the email?</Text>
              {canResend ? (
                <TouchableOpacity onPress={resendEmail}>
                  <Text style={styles.resendLink}>Resend</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.resendCountdown}>
                  Resend in {countdown}s
                </Text>
              )}
            </View>
          </>
        );

      case 'checking':
        return (
          <>
            <LoadingSpinner />
            <Text style={styles.title}>Verifying...</Text>
            <Text style={styles.subtitle}>
              Please wait while we verify your email.
            </Text>
          </>
        );

      case 'success':
        return (
          <>
            <AnimatedCheckIcon />
            <Text style={styles.title}>Email Verified!</Text>
            <Text style={styles.subtitle}>
              Your account has been successfully verified.
            </Text>
            <PrimaryButton
              title="Continue to Profile Setup"
              onPress={onVerificationSuccess}
              style={{ marginTop: 20 }}
            />
          </>
        );

      case 'error':
        return (
          <>
            <View style={styles.errorIconContainer}>
              <LinearGradient
                colors={[colors.appErrorRed, '#dc2626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.errorIconGradient}
              >
                <Ionicons name="close" size={48} color={colors.white} />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Verification Failed</Text>
            <Text style={styles.subtitle}>
              {errorMessage || 'Something went wrong during verification.'}
            </Text>
            <PrimaryButton
              title="Try Again"
              onPress={() => setStatus('waiting')}
              style={{ marginTop: 20, marginBottom: 12 }}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.appDarkGreen, colors.appMediumGreen]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={16} color={colors.white} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <View style={styles.headerTitles}>
              <Text style={styles.headerTitle}>FoodClipz</Text>
              <Text style={styles.headerSubtitle}>Email Verification</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.contentInner}>
          {renderContent()}

          {status !== 'success' && status !== 'checking' && (
            <TouchableOpacity onPress={onBack} style={styles.backToLoginButton}>
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  // header styles
  header: {
    height: 200,
  },
  headerSafeArea: {
    flex: 1,
  },
  headerContent: {
    flex: 1,
    paddingTop: 60,
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
  headerTitles: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
  },
  // Content Styles
  content: {
    flex: 1,
  },
  contentInner: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  // icon styles
  loadingContainer: {
    width: 100,
    height: 100,
    marginBottom: 40,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  ripple: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.appPrimaryGreen,
    position: 'absolute',
  },
  loadingGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 40,
  },
  successIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIconContainer: {
    marginBottom: 40,
  },
  errorIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Text Styles
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.appDarkGreen,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.appTextGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  email: {
    fontWeight: '600',
    color: colors.appDarkGreen,
  },
  description: {
    fontSize: 14,
    color: colors.appTextGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  // Resend Styles
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: colors.appTextGray,
    marginRight: 4,
  },
  resendLink: {
    fontSize: 14,
    color: colors.appPrimaryGreen,
    fontWeight: '600',
  },
  resendCountdown: {
    fontSize: 14,
    color: colors.appTextGray,
  },
  // Button Styles
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
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
  backToLoginButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: 14,
    color: colors.appTextGray,
    fontWeight: '500',
  },
});

export default EmailVerificationScreen;