import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  appFormLabel: '#374151',
  appInputBorder: '#e2e8f0',
  appInputBackground: '#f8fafc',
  white: '#ffffff',
  appLightGray: '#f1f5f9',
  appDarkText: '#1e293b',
  appBorder: '#e2e8f0',
  errorRed: '#ef4444',
};

const API_BASE_URL = 'https://foodclipz.ddns.net/api';

//interests with categories and more inclusive options probably
const interestCategories = {
  regionalCuisines: {
    title: "Regional Cuisines",
    items: [
      { id: 'italian', name: 'Italian', icon: 'cutlery', iconSet: 'FontAwesome', color: '#e74c3c' },
      { id: 'japanese', name: 'Japanese', icon: 'leaf', iconSet: 'FontAwesome', color: '#3498db' },
      { id: 'mexican', name: 'Mexican', icon: 'pepper-hot', iconSet: 'FontAwesome5', color: '#e67e22' },
      { id: 'chinese', name: 'Chinese', icon: 'fire', iconSet: 'FontAwesome', color: '#e74c3c' },
      { id: 'indian', name: 'Indian', icon: 'fire', iconSet: 'FontAwesome', color: '#f39c12' },
      { id: 'thai', name: 'Thai', icon: 'pepper-hot', iconSet: 'FontAwesome5', color: '#27ae60' },
      { id: 'french', name: 'French', icon: 'glass', iconSet: 'FontAwesome', color: '#9b59b6' },
      { id: 'korean', name: 'Korean', icon: 'fire', iconSet: 'FontAwesome', color: '#e74c3c' },
      { id: 'vietnamese', name: 'Vietnamese', icon: 'leaf', iconSet: 'FontAwesome', color: '#27ae60' },
      { id: 'mediterranean', name: 'Mediterranean', icon: 'leaf', iconSet: 'FontAwesome', color: '#3498db' },
      { id: 'middle_eastern', name: 'Middle Eastern', icon: 'star', iconSet: 'FontAwesome', color: '#f39c12' },
      { id: 'ethiopian', name: 'Ethiopian', icon: 'fire', iconSet: 'FontAwesome', color: '#e67e22' },
      { id: 'brazilian', name: 'Brazilian', icon: 'fire', iconSet: 'FontAwesome', color: '#27ae60' },
      { id: 'caribbean', name: 'Caribbean', icon: 'sun-o', iconSet: 'FontAwesome', color: '#f39c12' },
      { id: 'greek', name: 'Greek', icon: 'leaf', iconSet: 'FontAwesome', color: '#3498db' },
      { id: 'turkish', name: 'Turkish', icon: 'star', iconSet: 'FontAwesome', color: '#e67e22' },
      { id: 'lebanese', name: 'Lebanese', icon: 'leaf', iconSet: 'FontAwesome', color: '#27ae60' },
      { id: 'moroccan', name: 'Moroccan', icon: 'star', iconSet: 'FontAwesome', color: '#e67e22' },
      { id: 'spanish', name: 'Spanish', icon: 'cutlery', iconSet: 'FontAwesome', color: '#e74c3c' },
      { id: 'peruvian', name: 'Peruvian', icon: 'leaf', iconSet: 'FontAwesome', color: '#27ae60' }
    ]
  },
  
  dietaryPreferences: {
    title: "Dietary Preferences",
    items: [
      { id: 'vegetarian', name: 'Vegetarian', icon: 'leaf', iconSet: 'FontAwesome', color: '#27ae60' },
      { id: 'vegan', name: 'Vegan', icon: 'leaf', iconSet: 'FontAwesome', color: '#2ecc71' },
      { id: 'plant_based', name: 'Plant-Based', icon: 'seedling', iconSet: 'FontAwesome5', color: '#27ae60' },
      { id: 'gluten_free', name: 'Gluten-Free', icon: 'ban', iconSet: 'FontAwesome', color: '#f39c12' },
      { id: 'keto', name: 'Keto/Low-Carb', icon: 'fire', iconSet: 'FontAwesome', color: '#e74c3c' },
      { id: 'paleo', name: 'Paleo', icon: 'apple', iconSet: 'FontAwesome', color: '#27ae60' },
      { id: 'halal', name: 'Halal', icon: 'star-and-crescent', iconSet: 'FontAwesome5', color: '#27ae60' },
      { id: 'kosher', name: 'Kosher', icon: 'star-of-david', iconSet: 'FontAwesome5', color: '#3498db' },
      { id: 'raw_food', name: 'Raw Food', icon: 'leaf', iconSet: 'FontAwesome', color: '#2ecc71' },
      { id: 'organic', name: 'Organic/Farm-to-Table', icon: 'seedling', iconSet: 'FontAwesome5', color: '#27ae60' },
      { id: 'healthy', name: 'Healthy/Clean Eating', icon: 'heart', iconSet: 'FontAwesome', color: '#e74c3c' }
    ]
  },
  
  foodTypes: {
    title: "Food Types & Styles",
    items: [
      { id: 'american', name: 'American', icon: 'hamburger', iconSet: 'FontAwesome5', color: '#f39c12' },
      { id: 'pizza', name: 'Pizza', icon: 'pizza-slice', iconSet: 'FontAwesome5', color: '#e74c3c' },
      { id: 'bbq', name: 'BBQ/Grilled', icon: 'fire', iconSet: 'FontAwesome', color: '#e67e22' },
      { id: 'seafood', name: 'Seafood', icon: 'fish', iconSet: 'FontAwesome', color: '#3498db' },
      { id: 'street_food', name: 'Street Food', icon: 'road', iconSet: 'FontAwesome', color: '#f39c12' },
      { id: 'comfort_food', name: 'Comfort Food', icon: 'heart', iconSet: 'FontAwesome', color: '#e91e63' },
      { id: 'fusion', name: 'Fusion', icon: 'magic', iconSet: 'FontAwesome', color: '#9b59b6' },
      { id: 'fine_dining', name: 'Fine Dining', icon: 'star', iconSet: 'FontAwesome', color: '#f39c12' },
      { id: 'fast_food', name: 'Fast Food', icon: 'clock-o', iconSet: 'FontAwesome', color: '#e67e22' },
      { id: 'burgers', name: 'Burgers', icon: 'hamburger', iconSet: 'FontAwesome5', color: '#e67e22' },
      { id: 'sandwiches', name: 'Sandwiches', icon: 'cutlery', iconSet: 'FontAwesome', color: '#95a5a6' },
      { id: 'salads', name: 'Salads', icon: 'leaf', iconSet: 'FontAwesome', color: '#27ae60' },
      { id: 'soups', name: 'Soups', icon: 'coffee', iconSet: 'FontAwesome', color: '#e67e22' },
      { id: 'noodles', name: 'Noodles/Pasta', icon: 'cutlery', iconSet: 'FontAwesome', color: '#f39c12' }
    ]
  },
  
  beveragesAndSweets: {
    title: "Beverages & Sweets",
    items: [
      { id: 'coffee', name: 'Coffee', icon: 'coffee', iconSet: 'FontAwesome', color: '#8b4513' },
      { id: 'tea', name: 'Tea', icon: 'coffee', iconSet: 'FontAwesome', color: '#27ae60' },
      { id: 'cocktails', name: 'Cocktails', icon: 'glass', iconSet: 'FontAwesome', color: '#9b59b6' },
      { id: 'wine', name: 'Wine', icon: 'glass', iconSet: 'FontAwesome', color: '#8e44ad' },
      { id: 'beer', name: 'Beer', icon: 'beer', iconSet: 'FontAwesome', color: '#f39c12' },
      { id: 'desserts', name: 'Desserts', icon: 'birthday-cake', iconSet: 'FontAwesome', color: '#e91e63' },
      { id: 'ice_cream', name: 'Ice Cream', icon: 'snowflake-o', iconSet: 'FontAwesome', color: '#3498db' },
      { id: 'bakery', name: 'Bakery/Pastries', icon: 'birthday-cake', iconSet: 'FontAwesome', color: '#e67e22' },
      { id: 'chocolate', name: 'Chocolate', icon: 'heart', iconSet: 'FontAwesome', color: '#8b4513' }
    ]
  },
  
  mealTimes: {
    title: "Meal Times",
    items: [
      { id: 'breakfast', name: 'Breakfast', icon: 'sun-o', iconSet: 'FontAwesome', color: '#f39c12' },
      { id: 'brunch', name: 'Brunch', icon: 'clock-o', iconSet: 'FontAwesome', color: '#e67e22' },
      { id: 'lunch', name: 'Lunch', icon: 'cutlery', iconSet: 'FontAwesome', color: '#3498db' },
      { id: 'dinner', name: 'Dinner', icon: 'moon-o', iconSet: 'FontAwesome', color: '#8e44ad' },
      { id: 'late_night', name: 'Late Night', icon: 'moon-o', iconSet: 'FontAwesome', color: '#2c3e50' }
    ]
  }
};

// Flatten all interests for easy access (maintains compatibility with existing code)
const interests = Object.values(interestCategories).flatMap(category => 
  category.items.map(item => ({ ...item, category: category.title }))
);

// Suggested users to follow
const suggestedUsers = [
  { id: '1', name: 'James Chen', username: '@jamesc', description: 'Food critic • 2.3K followers', avatar: 'JC', isFollowing: false },
  { id: '2', name: 'Sofia Rodriguez', username: '@sofiar', description: 'Michelin contributor • 4.1K followers', avatar: 'SR', isFollowing: true },
  { id: '3', name: 'Mike Kim', username: '@mikekim', description: 'Local blogger • 890 followers', avatar: 'MK', isFollowing: false },
  { id: '4', name: 'Emma Brown', username: '@emmab', description: 'Restaurant reviewer • 1.8K followers', avatar: 'EB', isFollowing: false },
  { id: '5', name: 'David Lee', username: '@davidlee', description: 'Chef & influencer • 3.2K followers', avatar: 'DL', isFollowing: true },
];

// API Functions
const checkUsernameAvailability = async (username, excludeUserId = null) => {
  try {
    if (username.length < 3) return true;
    
    const url = excludeUserId 
      ? `${API_BASE_URL}/users/check-username/${username}?excludeUserId=${excludeUserId}`
      : `${API_BASE_URL}/users/check-username/${username}`;
      
    const response = await fetch(url);
    const data = await response.json();
    return data.available;
  } catch (error) {
    console.error('Error checking username:', error);
    return false;
  }
};

const completeProfileSetup = async (profileData) => {
  try {
    const formData = new FormData();
    
    // Add all profile data
    formData.append('userId', profileData.userId.toString());
    formData.append('username', profileData.username);
    formData.append('bio', profileData.bio);
    formData.append('favoriteCuisine', profileData.favoriteCuisine);
    formData.append('location', profileData.location);
    formData.append('interests', JSON.stringify(profileData.interests));
    formData.append('privacySettings', JSON.stringify(profileData.privacySettings));
    formData.append('followingUsers', JSON.stringify(profileData.followingUsers));
    
    // Add profile image if exists
    if (profileData.profileImage) {
      const imageUri = profileData.profileImage;
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('profileImage', {
        uri: imageUri,
        name: filename,
        type: type,
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/users/complete-profile-setup`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to complete profile setup');
    }
    
    return data;
  } catch (error) {
    console.error('Error completing profile setup:', error);
    throw error;
  }
};

// Progress bar component with animation
const ProgressBar = ({ currentStep, totalSteps }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const targetProgress = (currentStep / totalSteps) * 100;
    Animated.timing(progressAnim, {
      toValue: targetProgress,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [currentStep, totalSteps]);
  
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <Animated.View 
          style={[
            styles.progressFill, 
            { 
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              })
            }
          ]} 
        />
      </View>
    </View>
  );
};

// Helper function to generate initials from user's name
const generateInitials = (user) => {
  if (!user) return 'FC';
  
  const firstName = user.firstName || user.first_name || '';
  const lastName = user.lastName || user.last_name || '';
  
  if (firstName && lastName) {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  } else if (firstName) {
    return firstName.charAt(0).toUpperCase();
  } else if (user.email) {
    return user.email.charAt(0).toUpperCase();
  }
  
  return 'FC';
};

// Header component
const StepHeader = ({ currentStep, totalSteps, title, subtitle }) => (
  <LinearGradient
    colors={[colors.appDarkGreen, colors.appMediumGreen]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.header}
  >
    <SafeAreaView style={styles.headerSafeArea}>
      <View style={styles.headerContainer}>
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        <View style={styles.headerContent}>
          <Text style={styles.stepIndicator}>Step {currentStep} of {totalSteps}</Text>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>
      </View>
    </SafeAreaView>
  </LinearGradient>
);

// Custom button components
const PrimaryButton = ({ title, onPress, disabled, loading, style }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled && !loading) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      disabled={disabled || loading}
      style={[styles.buttonContainer, style]}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <LinearGradient
          colors={disabled ? [colors.appLightGray, colors.appLightGray] : [colors.appPrimaryGreen, colors.appSecondaryGreen]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primaryButton}
        >
          <Text style={[styles.primaryButtonText, disabled && styles.primaryButtonTextDisabled]}>
            {loading ? 'Completing...' : title}
          </Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const SecondaryButton = ({ title, onPress, style }) => (
  <TouchableOpacity onPress={onPress} style={[styles.secondaryButton, style]}>
    <Text style={styles.secondaryButtonText}>{title}</Text>
  </TouchableOpacity>
);

// Step 1: Profile Photo
const ProfilePhotoStep = ({ profileImage, setProfileImage, user }) => {
  const pickImage = async () => {
  try {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photo library to select a profile picture.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => {
              try {
                Linking.openSettings();
              } catch (error) {
                console.log('Could not open settings:', error);
              }
            }
          }
        ]
      );
      return;
    }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need access to your camera to take a photo.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Profile Photo',
      'Choose how you\'d like to add your photo',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const userInitials = generateInitials(user);

  return (
    <View style={styles.stepContent}>
      <View style={styles.photoUploadContainer}>
        <TouchableOpacity onPress={showPhotoOptions} style={styles.avatarContainer}>
          <View style={styles.avatarPreview}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <LinearGradient
                colors={[colors.appPrimaryGreen, colors.appSecondaryGreen]}
                style={styles.avatarPlaceholder}
              >
                <Text style={styles.avatarInitials}>{userInitials}</Text>
              </LinearGradient>
            )}
          </View>
          <View style={styles.cameraButton}>
            <FontAwesome name="camera" size={20} color={colors.appDarkGreen} />
          </View>
        </TouchableOpacity>

        <View style={styles.photoOptions}>
          <TouchableOpacity style={styles.photoOption} onPress={takePhoto}>
            <Ionicons name="camera" size={16} color={colors.appTextGray} />
            <Text style={styles.photoOptionText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoOption} onPress={pickImage}>
            <Ionicons name="images" size={16} color={colors.appTextGray} />
            <Text style={styles.photoOptionText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Step 2: Personal Info with enhanced username validation
const PersonalInfoStep = ({ 
  formData, 
  setFormData, 
  usernameAvailable, 
  setUsernameAvailable, 
  checkingUsername, 
  setCheckingUsername 
}) => {
  const usernameCheckTimeout = useRef(null);
  const spinValue = useRef(new Animated.Value(0)).current;

  // Add rotation animation for spinner
  useEffect(() => {
    if (checkingUsername) {
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();
      return () => spinAnimation.stop();
    }
  }, [checkingUsername, spinValue]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Check username availability when username changes
    if (field === 'username' && value.length >= 3) {
      // Clear previous timeout
      if (usernameCheckTimeout.current) {
        clearTimeout(usernameCheckTimeout.current);
      }
      
      setCheckingUsername(true);
      
      // Set new timeout to avoid too many API calls
      usernameCheckTimeout.current = setTimeout(() => {
        checkUsername(value);
      }, 1); // debounce to avoid excessive api calls
    } else if (field === 'username' && value.length < 3) {
      setUsernameAvailable(true);
      setCheckingUsername(false);
    }
  };

  const checkUsername = async (username) => {
    try {
      const available = await checkUsernameAvailability(username);
      setUsernameAvailable(available);
    } catch (error) {
      console.error('Username check error:', error);
      setUsernameAvailable(false);
    } finally {
      setCheckingUsername(false);
    }
  };

  const sanitizeUsername = (value) => {
    // Only allow lowercase letters, numbers, and underscores
    return value.toLowerCase().replace(/[^a-z0-9_]/g, '');
  };

  // Get the validation icon and state
  const getValidationIcon = () => {
    if (formData.username.length < 3) return null;
    
    if (checkingUsername) {
      const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      });
      
      return (
        <View style={styles.validationIconContainer}>
          <Animated.View style={[styles.loadingSpinner, { transform: [{ rotate: spin }] }]}>
            <FontAwesome name="spinner" size={16} color={colors.appTextGray} />
          </Animated.View>
        </View>
      );
    }
    
    if (usernameAvailable) {
      return (
        <View style={[styles.validationIconContainer, styles.validationIconSuccess]}>
          <FontAwesome name="check" size={16} color={colors.appSecondaryGreen} />
        </View>
      );
    } else {
      return (
        <View style={[styles.validationIconContainer, styles.validationIconError]}>
          <FontAwesome name="times" size={16} color={colors.errorRed} />
        </View>
      );
    }
  };

  return (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag">
      <View style={styles.formSection}>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Set Your Username</Text>
          <View style={styles.usernameInputContainer}>
            <TextInput
              style={[
                styles.formInput,
                styles.usernameInput,
                !usernameAvailable && formData.username.length >= 3 && styles.formInputError,
                usernameAvailable && formData.username.length >= 3 && !checkingUsername && styles.formInputSuccess
              ]}
              placeholder="Choose a unique username"
              placeholderTextColor={colors.appTextGray}
              value={formData.username}
              onChangeText={(value) => updateField('username', sanitizeUsername(value))}
              autoCapitalize="none"
              maxLength={30}
            />
            {getValidationIcon()}
          </View>
          
          {formData.username.length >= 3 && (
            <Text style={[
              styles.validationText,
              usernameAvailable ? styles.validationSuccess : styles.validationError
            ]}>
              {checkingUsername ? 'Checking availability...' : 
               usernameAvailable ? '✓ Username available' : '✗ Username already taken'}
            </Text>
          )}
          
          {formData.username.length > 0 && formData.username.length < 3 && (
            <Text style={styles.validationInfo}>
              Username must be at least 3 characters
            </Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Bio</Text>
          <TextInput
            style={[styles.formInput, styles.formTextarea]}
            placeholder="Tell everyone about your food interests..."
            placeholderTextColor={colors.appTextGray}
            value={formData.bio}
            onChangeText={(value) => updateField('bio', value)}
            multiline
            maxLength={150}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{formData.bio.length}/150</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Favorite Cuisine</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g., Italian, Japanese, Mexican"
            placeholderTextColor={colors.appTextGray}
            value={formData.favoriteCuisine}
            onChangeText={(value) => updateField('favoriteCuisine', value)}
          />
        </View>
      </View>
    </ScrollView>
  );
};

// Step 3: Food Interests with Categories and Search
const FoodInterestsStep = ({ selectedInterests, setSelectedInterests }) => {
  const [selectedCategory, setSelectedCategory] = useState('regionalCuisines');
  const [searchQuery, setSearchQuery] = useState('');
  
  const toggleInterest = (interestId) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        return prev.filter(id => id !== interestId);
      } else {
        return [...prev, interestId];
      }
    });
  };

  const renderCategoryTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs}>
      {Object.entries(interestCategories).map(([key, category]) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.categoryTab,
            selectedCategory === key && styles.categoryTabActive
          ]}
          onPress={() => setSelectedCategory(key)}
        >
          <Text style={[
            styles.categoryTabText,
            selectedCategory === key && styles.categoryTabTextActive
          ]}>
            {category.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <FontAwesome name="search" size={16} color={colors.appTextGray} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search for cuisines or food types..."
        placeholderTextColor={colors.appTextGray}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
          <FontAwesome name="times" size={14} color={colors.appTextGray} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderInterest = ({ item, index }) => {
    const isSelected = selectedInterests.includes(item.id);
    const IconComponent = item.iconSet === 'FontAwesome5' ? FontAwesome5 : FontAwesome;
    
    return (
      <TouchableOpacity
        style={[styles.interestItem, isSelected && styles.interestItemSelected]}
        onPress={() => toggleInterest(item.id)}
      >
        <View style={[styles.interestIconContainer, isSelected && styles.interestIconContainerSelected]}>
          <IconComponent 
            name={item.icon} 
            size={24} 
            color={item.color} 
          />
        </View>
        <Text style={[styles.interestName, isSelected && styles.interestNameSelected]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // Filter data based on search or category
  const getFilteredData = () => {
    if (searchQuery.trim().length > 0) {
      // Search across all categories
      return interests.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      // Show current category
      return interestCategories[selectedCategory]?.items || [];
    }
  };

  const filteredData = getFilteredData();

  return (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Select your favorite cuisines & food preferences</Text>
      
      {renderSearchBar()}
      
      {searchQuery.trim().length === 0 ? (
        <>
          {renderCategoryTabs()}
          <Text style={styles.categorySubtitle}>
            {interestCategories[selectedCategory]?.title}
          </Text>
        </>
      ) : (
        <Text style={styles.categorySubtitle}>
          Search Results ({filteredData.length} found)
        </Text>
      )}
      
      <FlatList
        data={filteredData}
        renderItem={renderInterest}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={filteredData.length > 1 ? styles.interestsRow : null}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.interestsGrid}
        ListEmptyComponent={() => (
          <View style={styles.emptySearchContainer}>
            <FontAwesome name="search" size={48} color={colors.appTextGray} />
            <Text style={styles.emptySearchText}>No results found</Text>
            <Text style={styles.emptySearchSubtext}>Try searching for something else</Text>
          </View>
        )}
      />
      
      {selectedInterests.length > 0 && (
        <View style={styles.selectedCount}>
          <Text style={styles.selectedCountText}>
            {selectedInterests.length} selected
          </Text>
        </View>
      )}
    </View>
  );
};

// Step 4: Location & Privacy
const LocationPrivacyStep = ({ formData, setFormData, privacySettings, setPrivacySettings }) => {
  const [locationLoading, setLocationLoading] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePrivacySetting = (setting) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const useCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need location permissions to detect your current location.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const { city, region } = reverseGeocode[0];
        updateField('location', `${city}, ${region}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not detect your location. Please enter it manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const ToggleSwitch = ({ value, onToggle }) => (
    <TouchableOpacity style={[styles.toggleSwitch, value && styles.toggleSwitchActive]} onPress={onToggle}>
      <Animated.View style={[styles.toggleKnob, value && styles.toggleKnobActive]} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag">
      <View style={styles.locationSection}>
        <Text style={styles.sectionTitle}>Your Location</Text>
        <View style={styles.locationInput}>
          <FontAwesome name="map-marker" size={20} color={colors.appTextGray} style={styles.locationIcon} />
          <TextInput
            style={[styles.formInput, styles.locationField]}
            placeholder="Enter your city"
            value={formData.location}
            onChangeText={(value) => updateField('location', value)}
          />
        </View>
        <TouchableOpacity 
          style={styles.currentLocationButton} 
          onPress={useCurrentLocation}
          disabled={locationLoading}
        >
          <FontAwesome name="crosshairs" size={16} color={colors.appDarkGreen} />
          <Text style={styles.currentLocationText}>
            {locationLoading ? 'Detecting...' : 'Use Current Location'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.privacySection}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        <View style={styles.privacyOptions}>
          <View style={styles.privacyItem}>
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyTitle}>Profile Visibility</Text>
              <Text style={styles.privacyDesc}>Allow others to find your profile</Text>
            </View>
            <ToggleSwitch 
              value={privacySettings.profileVisibility} 
              onToggle={() => togglePrivacySetting('profileVisibility')} 
            />
          </View>

          <View style={styles.privacyItem}>
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyTitle}>Location Sharing</Text>
              <Text style={styles.privacyDesc}>Share your location in posts</Text>
            </View>
            <ToggleSwitch 
              value={privacySettings.locationSharing} 
              onToggle={() => togglePrivacySetting('locationSharing')} 
            />
          </View>

          <View style={styles.privacyItem}>
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyTitle}>Push Notifications</Text>
              <Text style={styles.privacyDesc}>Get notified about likes and comments</Text>
            </View>
            <ToggleSwitch 
              value={privacySettings.pushNotifications} 
              onToggle={() => togglePrivacySetting('pushNotifications')} 
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Step 5: Follow Suggestions
const FollowSuggestionsStep = ({ followingUsers, setFollowingUsers }) => {
  const toggleFollow = (userId) => {
    setFollowingUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const renderUser = ({ item }) => {
    const isFollowing = followingUsers.includes(item.id);
    return (
      <View style={styles.followItem}>
        <View style={styles.followAvatar}>
          <Text style={styles.followAvatarText}>{item.avatar}</Text>
        </View>
        <View style={styles.followInfo}>
          <Text style={styles.followName}>{item.name}</Text>
          <Text style={styles.followDesc}>{item.description}</Text>
        </View>
        <TouchableOpacity
          style={[styles.followButton, isFollowing && styles.followButtonActive]}
          onPress={() => toggleFollow(item.id)}
        >
          <Text style={[styles.followButtonText, isFollowing && styles.followButtonTextActive]}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.stepContent}>
      <FlatList
        data={suggestedUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.followSuggestions}
      />
    </View>
  );
};

// Completion Screen
const CompletionScreen = ({ followingCount, onStartApp }) => (
  <View style={styles.completionContent}>
    <View style={styles.completionIcon}>
      <FontAwesome name="check-circle" size={60} color={colors.white} />
    </View>
    <Text style={styles.completionTitle}>You're All Set!</Text>
    <Text style={styles.completionSubtitle}>
      Welcome to FoodClipz! Your food journey starts now. Ready to discover amazing restaurants and share your experiences?
    </Text>
    
    <View style={styles.completionStats}>
      <View style={styles.statItem}>
        <FontAwesome5 name="camera" size={20} color={colors.appPrimaryGreen} style={styles.statIcon} />
        <Text style={styles.statValue}>0</Text>
        <Text style={styles.statLabel}>Clips</Text>
      </View>
      <View style={styles.statItem}>
        <FontAwesome name="users" size={20} color={colors.appPrimaryGreen} style={styles.statIcon} />
        <Text style={styles.statValue}>{followingCount}</Text>
        <Text style={styles.statLabel}>Following</Text>
      </View>
      <View style={styles.statItem}>
        <FontAwesome name="heart" size={20} color={colors.appPrimaryGreen} style={styles.statIcon} />
        <Text style={styles.statValue}>0</Text>
        <Text style={styles.statLabel}>Followers</Text>
      </View>
    </View>
    
    <PrimaryButton
      title="Start Exploring"
      onPress={onStartApp}
      style={{ width: '100%' }}
    />
  </View>
);

// Main ProfileSetupScreen component
const ProfileSetupScreen = ({ user, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    favoriteCuisine: '',
    location: '',
  });
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    locationSharing: true,
    pushNotifications: true,
  });
  const [followingUsers, setFollowingUsers] = useState(['2', '5']);
  const [loading, setLoading] = useState(false);
  
  // Username validation states - moved here so they're accessible to isStepValid
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const totalSteps = 5;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      completeSetup();
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeSetup = async () => {
    setLoading(true);
    try {
      const profileSetupData = {
        userId: user.id,
        username: formData.username,
        bio: formData.bio,
        favoriteCuisine: formData.favoriteCuisine,
        location: formData.location,
        interests: selectedInterests,
        privacySettings: privacySettings,
        followingUsers: followingUsers,
        profileImage: profileImage
      };
      
      const result = await completeProfileSetup(profileSetupData);
      console.log('Profile setup completed:', result);
      setCurrentStep(6);
    } catch (error) {
      console.error('Profile setup error:', error);
      Alert.alert('Error', error.message || 'Failed to complete setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startApp = () => {
  const completedUserData = {
    ...user,
    ...formData,
    profileImage,
    interests: selectedInterests,
    privacySettings,
    following: followingUsers,
    profileCompleted: true
  };
  
  // call onComplete which will handle saving and navigation to discover
  onComplete(completedUserData);
};

  const isStepValid = () => {
    switch (currentStep) {
      case 2:
        return formData.username.trim().length >= 3 && usernameAvailable && !checkingUsername;
      case 3:
        return selectedInterests.length >= 1;
      default:
        return true;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Add Profile Photo';
      case 2: return 'Tell Us About You';
      case 3: return 'Your Food Interests';
      case 4: return 'Location & Privacy';
      case 5: return 'Follow Food Experts';
      default: return '';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1: return 'Help friends recognize you on FoodClipz';
      case 2: return 'Share a bit about your food journey';
      case 3: return 'Help us personalize your experience';
      case 4: return 'Set your preferences';
      case 5: return 'Get great recommendations from the start';
      default: return '';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ProfilePhotoStep 
          profileImage={profileImage} 
          setProfileImage={setProfileImage} 
          user={user}
        />;
      case 2:
        return <PersonalInfoStep 
          formData={formData} 
          setFormData={setFormData}
          usernameAvailable={usernameAvailable}
          setUsernameAvailable={setUsernameAvailable}
          checkingUsername={checkingUsername}
          setCheckingUsername={setCheckingUsername}
        />;
      case 3:
        return <FoodInterestsStep 
          selectedInterests={selectedInterests} 
          setSelectedInterests={setSelectedInterests} 
        />;
      case 4:
        return <LocationPrivacyStep 
          formData={formData} 
          setFormData={setFormData}
          privacySettings={privacySettings}
          setPrivacySettings={setPrivacySettings}
        />;
      case 5:
        return <FollowSuggestionsStep 
          followingUsers={followingUsers} 
          setFollowingUsers={setFollowingUsers} 
        />;
      case 6:
        return <CompletionScreen 
          followingCount={followingUsers.length} 
          onStartApp={startApp} 
        />;
      default:
        return null;
    }
  };

  if (currentStep === 6) {
    return (
      <View style={styles.container}>
        {renderStepContent()}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StepHeader 
        currentStep={currentStep} 
        totalSteps={totalSteps} 
        title={getStepTitle()}
        subtitle={getStepSubtitle()}
      />
      
      {renderStepContent()}
    
      <View style={styles.setupBottom}>
        <View style={styles.setupActions}>
          {currentStep > 1 ? (
            <SecondaryButton title="Back" onPress={previousStep} style={{ flex: 1 }} />
          ) : (
            <SecondaryButton title="Skip" onPress={nextStep} style={{ flex: 1 }} />
          )}
          <PrimaryButton
            title={currentStep === totalSteps ? 'Complete Setup' : 'Continue'}
            onPress={nextStep}
            disabled={!isStepValid()}
            loading={loading}
            style={{ flex: 1.5 }}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  
  // Header Styles
  header: {
    minHeight: 200,
    paddingHorizontal: 20,
  },
  headerSafeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  headerContainer: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  progressContainer: {
    marginBottom: 0,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.appPrimaryGreen,
    borderRadius: 2,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 20,
  },
  stepIndicator: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    lineHeight: 22,
  },
  
  // Step Content
  stepContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  
  // Photo Upload Styles
  photoUploadContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.appDarkGreen,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    backgroundColor: colors.appPrimaryGreen,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.white,
    shadowColor: colors.appPrimaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  photoOptions: {
    flexDirection: 'row',
    gap: 16,
  },
  photoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.appInputBackground,
    borderWidth: 1,
    borderColor: colors.appInputBorder,
    borderRadius: 20,
    gap: 8,
  },
  photoOptionText: {
    fontSize: 14,
    color: colors.appTextGray,
    fontWeight: '500',
  },
  
  // Form Styles
  formSection: {
    marginBottom: 32,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.appFormLabel,
    marginBottom: 8,
  },
  formInput: {
    padding: 16,
    fontSize: 16,
    backgroundColor: colors.appInputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.appInputBorder,
    color: colors.appFormLabel,
  },
  formInputError: {
    borderColor: colors.errorRed,
    borderWidth: 2,
  },
  formInputSuccess: {
    borderColor: colors.appSecondaryGreen,
    borderWidth: 2,
  },
  formTextarea: {
    height: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: colors.appTextGray,
    marginTop: 4,
  },
  
  // Username Input Styles
  usernameInputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  usernameInput: {
    flex: 1,
    paddingRight: 50, // Make room for the icon
  },
  
  // Validation icon styles
  validationIconContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -12, // Half of icon container height
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.appInputBackground,
  },
  validationIconSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  validationIconError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  
  // Loading spinner animation
  loadingSpinner: {
    // Animation handled in component
  },
  
  // Validation Styles
  validationText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  validationSuccess: {
    color: colors.appSecondaryGreen,
  },
  validationError: {
    color: colors.errorRed,
  },
  validationInfo: {
    fontSize: 12,
    marginTop: 4,
    color: colors.appTextGray,
  },
  
  // Search Styles
  searchContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: 18,
    zIndex: 1,
  },
  searchInput: {
    padding: 16,
    paddingLeft: 48,
    paddingRight: 48,
    fontSize: 16,
    backgroundColor: colors.appInputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.appInputBorder,
    color: colors.appFormLabel,
  },
  clearSearchButton: {
    position: 'absolute',
    right: 16,
    top: 19,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Category Tabs
  categoryTabs: {
    marginBottom: 20,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: colors.appInputBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.appInputBorder,
  },
  categoryTabActive: {
    backgroundColor: colors.appPrimaryGreen,
    borderColor: colors.appPrimaryGreen,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.appTextGray,
    whiteSpace: 'nowrap',
  },
  categoryTabTextActive: {
    color: colors.appDarkGreen,
    fontWeight: '600',
  },
  categorySubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.appDarkText,
    marginBottom: 16,
  },
  
  // Interests Styles - Fixed color overlay issue
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.appDarkText,
    marginBottom: 16,
  },
  interestsGrid: {
    paddingBottom: 20,
  },
  interestsRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  interestItem: {
    width: (screenWidth - 52) / 2,
    padding: 16,
    backgroundColor: colors.appInputBackground,
    borderWidth: 2,
    borderColor: colors.appInputBorder,
    borderRadius: 16,
    alignItems: 'center',
  },
  interestItemSelected: {
    borderColor: colors.appPrimaryGreen,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  interestIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  interestIconContainerSelected: {
    backgroundColor: colors.white, // Keep background white when selected
  },
  interestName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.appDarkText,
    textAlign: 'center',
  },
  interestNameSelected: {
    color: colors.appDarkText, // Keep original text color when selected
  },
  
  // Selected count
  selectedCount: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.appDarkGreen,
  },
  
  // Empty search state
  emptySearchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptySearchText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.appTextGray,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySearchSubtext: {
    fontSize: 14,
    color: colors.appTextGray,
    textAlign: 'center',
  },
  
  // Location Styles
  locationSection: {
    marginBottom: 32,
  },
  locationInput: {
    position: 'relative',
    marginBottom: 12,
  },
  locationIcon: {
    position: 'absolute',
    left: 16,
    top: 18,
    zIndex: 1,
  },
  locationField: {
    paddingLeft: 48,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderWidth: 1,
    borderColor: colors.appPrimaryGreen,
    borderRadius: 12,
    gap: 8,
  },
  currentLocationText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.appDarkGreen,
  },
  
  // Privacy Styles
  privacySection: {
    marginBottom: 20,
  },
  privacyOptions: {
    gap: 16,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: colors.appInputBackground,
    borderWidth: 1,
    borderColor: colors.appInputBorder,
    borderRadius: 16,
  },
  privacyInfo: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.appDarkText,
    marginBottom: 4,
  },
  privacyDesc: {
    fontSize: 14,
    color: colors.appTextGray,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    backgroundColor: colors.appInputBorder,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleSwitchActive: {
    backgroundColor: colors.appPrimaryGreen,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  toggleKnobActive: {
    transform: [{ translateX: 22 }],
  },
  
  // Follow Suggestions Styles
  followSuggestions: {
    paddingBottom: 20,
  },
  followItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.appInputBackground,
    borderWidth: 1,
    borderColor: colors.appInputBorder,
    borderRadius: 16,
    marginBottom: 16,
    gap: 12,
  },
  followAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.appPrimaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.appDarkGreen,
  },
  followInfo: {
    flex: 1,
  },
  followName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.appDarkText,
    marginBottom: 4,
  },
  followDesc: {
    fontSize: 14,
    color: colors.appTextGray,
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.appPrimaryGreen,
    borderRadius: 20,
  },
  followButtonActive: {
    backgroundColor: colors.appLightGray,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.appDarkGreen,
  },
  followButtonTextActive: {
    color: colors.appTextGray,
  },
  
  // Completion Styles
  completionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  completionIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.appPrimaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: colors.appPrimaryGreen,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.appDarkGreen,
    marginBottom: 16,
    textAlign: 'center',
  },
  completionSubtitle: {
    fontSize: 18,
    color: colors.appTextGray,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
  },
  completionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  statItem: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.appInputBackground,
    borderRadius: 16,
    minWidth: 80,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.appPrimaryGreen,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.appTextGray,
  },
  
  // Bottom Section
  setupBottom: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: colors.appLightGray,
  },
  setupActions: {
    flexDirection: 'row',
    gap: 12,
  },
  
  // Button Styles
  buttonContainer: {
    // Container for button animations
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
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
  primaryButtonTextDisabled: {
    color: colors.appTextGray,
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: colors.appInputBackground,
    borderWidth: 1,
    borderColor: colors.appInputBorder,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.appTextGray,
  },
});

export default ProfileSetupScreen;