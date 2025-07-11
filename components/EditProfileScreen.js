import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AuthService from '../services/AuthService';

const API_BASE_URL = 'https://foodclipz.ddns.net/api';

const EditProfileScreen = ({ user, onNavigate, onUserUpdate }) => {
  // const navigation = useNavigation();
  // const { user, updateUser } = useContext(AuthContext); 
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    bio: user?.bio || '',
    email: user?.email || '',
    favoriteCuisine: user?.favoriteCuisine || '',
    location: user?.location || '',
    profileImage: user?.profilePicture || null,
  });

  const usernameTimeoutRef = useRef(null);

  const checkUsernameAvailability = async (username) => {
    if (!username || username === user?.username) {
      setUsernameAvailable(true);
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/check-username/${encodeURIComponent(username)}?excludeUserId=${user?.id}`
      );
      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(false);
    }
    setCheckingUsername(false);
  };

  const handleUsernameChange = (username) => {
    setFormData(prev => ({ ...prev, username }));
    
    if (usernameTimeoutRef.current) {
      clearTimeout(usernameTimeoutRef.current);
    }
    
    usernameTimeoutRef.current = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 500);
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({ 
          ...prev, 
          profileImage: result.assets[0].uri 
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    if (!formData.username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    if (!usernameAvailable) {
      Alert.alert('Error', 'Username is not available');
      return;
    }

    setLoading(true);

    try {
      // first, update basic profile using AuthService
      await AuthService.updateUserProfile(
        formData.email.trim(),
        formData.firstName.trim(),
        formData.lastName.trim(),
        formData.bio.trim()
      );

      // then upload upload profile image if changed
      if (formData.profileImage && formData.profileImage.startsWith('file://')) {
        await AuthService.uploadProfilePicture(formData.email.trim(), formData.profileImage);
      }

      // then update extended profile info using direct API call
      const extendedProfileData = new FormData();
      extendedProfileData.append('userId', user.id.toString());
      extendedProfileData.append('username', formData.username.trim());
      extendedProfileData.append('bio', formData.bio.trim());
      extendedProfileData.append('favoriteCuisine', formData.favoriteCuisine.trim());
      extendedProfileData.append('location', formData.location.trim());
      extendedProfileData.append('firstName', formData.firstName.trim());
      extendedProfileData.append('lastName', formData.lastName.trim());
      extendedProfileData.append('email', formData.email.trim());

      if (formData.profileImage && formData.profileImage.startsWith('file://')) {
        extendedProfileData.append('profileImage', {
          uri: formData.profileImage,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
      }

      const response = await fetch(`${API_BASE_URL}/users/profile-detailed`, {
        method: 'PUT',
        body: extendedProfileData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const responseData = await response.json();

      if (response.ok) {
        // UPDATE USER WITH NEW DATA
        onUserUpdate?.(responseData.user);
        
        Alert.alert(
          'Success', 
          'Profile updated successfully!',
          [{ text: 'OK', onPress: () => onNavigate?.('settings') }]
        );
      } else {
        throw new Error(responseData.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    }

    setLoading(false);
  };

//  onUserUpdate?.(responseData.user);
        
  //      Alert.alert(
    //      'Success', 
      //    'Profile updated successfully!',
        //  [{ text: 'OK', onPress: () => onNavigate?.('settings') }]
      //  );
   //  } else {
   //     throw new Error(responseData.error || 'Failed to update profile');
   //   }
  //  } catch (error) {
  //    console.error('Error updating profile:', error);
  //    Alert.alert('Error', error.message || 'Failed to update profile');
  //  }

   // setLoading(false);
  // };

  const FormSection = ({ title, children }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const FormItem = ({ label, value, onChangeText, placeholder, multiline = false, keyboardType = 'default', maxLength }) => (
    <View style={styles.formItem}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        style={[styles.formInput, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        multiline={multiline}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={label === 'Email' ? 'none' : 'sentences'}
        autoCorrect={label === 'Email' ? false : true}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* the header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => onNavigate?.('settings')}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity 
          style={[styles.headerButton, (!usernameAvailable || loading) && styles.disabledButton]}
          onPress={handleSave}
          disabled={!usernameAvailable || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#4ADE80" />
          ) : (
            <Text style={[styles.saveButtonText, (!usernameAvailable || loading) && styles.disabledButtonText]}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* profile picture section */}
        <View style={styles.profilePictureSection}>
          <TouchableOpacity style={styles.profilePictureContainer} onPress={pickImage}>
            {formData.profileImage ? (
              <Image source={{ uri: formData.profileImage }} style={styles.profilePicture} />
            ) : (
              <View style={styles.profilePicturePlaceholder}>
                <Text style={styles.profilePictureText}>
                  {formData.firstName?.[0]?.toUpperCase()}{formData.lastName?.[0]?.toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.cameraIconContainer}>
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Tap to change photo</Text>
        </View>

        {/* basic information */}
        <FormSection title="Basic Information">
          <FormItem
            label="First Name"
            value={formData.firstName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
            placeholder="Enter your first name"
            maxLength={50}
          />
          <FormItem
            label="Last Name"
            value={formData.lastName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
            placeholder="Enter your last name"
            maxLength={50}
          />
          <View style={styles.formItem}>
            <Text style={styles.formLabel}>Username</Text>
            <View style={styles.usernameContainer}>
              <TextInput
                style={[
                  styles.formInput, 
                  styles.usernameInput,
                  !usernameAvailable && styles.errorInput
                ]}
                value={formData.username}
                onChangeText={handleUsernameChange}
                placeholder="Choose a unique username"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={30}
              />
              {checkingUsername && (
                <ActivityIndicator size="small" color="#4ADE80" style={styles.usernameCheck} />
              )}
              {!checkingUsername && formData.username && formData.username !== user?.username && (
                <Ionicons 
                  name={usernameAvailable ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={usernameAvailable ? "#10B981" : "#EF4444"}
                  style={styles.usernameCheck}
                />
              )}
            </View>
            {!usernameAvailable && formData.username && (
              <Text style={styles.errorText}>Username is not available</Text>
            )}
            <Text style={styles.formDescription}>This is how others will find you</Text>
          </View>
          <FormItem
            label="Bio"
            value={formData.bio}
            onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
            placeholder="Tell people about yourself..."
            multiline
            maxLength={150}
          />
        </FormSection>

        {/* contact infomration */}
        <FormSection title="Contact Information">
          <FormItem
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
            placeholder="Enter your email"
            keyboardType="email-address"
            maxLength={100}
          />
        </FormSection>

        {/* preferences */}
        <FormSection title="Preferences">
          <FormItem
            label="Favorite Cuisine"
            value={formData.favoriteCuisine}
            onChangeText={(text) => setFormData(prev => ({ ...prev, favoriteCuisine: text }))}
            placeholder="e.g., Italian, Thai, Mexican"
            maxLength={50}
          />
          <FormItem
            label="Location"
            value={formData.location}
            onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
            placeholder="e.g., New York, NY"
            maxLength={100}
          />
        </FormSection>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#4ADE80',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: '#94A3B8',
  },
  scrollView: {
    flex: 1,
  },
  profilePictureSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePicturePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4ADE80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePictureText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#00241B',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4ADE80',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  changePhotoText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  sectionHeader: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  sectionContent: {
    backgroundColor: 'white',
  },
  formItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  formInput: {
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  usernameContainer: {
    position: 'relative',
  },
  usernameInput: {
    paddingRight: 40,
  },
  usernameCheck: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  errorInput: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  formDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  bottomPadding: {
    height: 40,
  },
});

export default EditProfileScreen;