// services/AuthService.js
const API_BASE_URL = 'https://foodclipz.ddns.net/api';

class AuthService {
  static async sendMagicLink(email, firstName = null, lastName = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-magic-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send magic link');
      }

      return data;
    } catch (error) {
      console.error('Error sending magic link:', error);
      throw error;
    }
  }

  static async verifyMagicLink(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify magic link');
      }

      return data;
    } catch (error) {
      console.error('Error verifying magic link:', error);
      throw error;
    }
  }

  static async updateUserProfile(email, firstName, lastName, bio) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          bio
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  static async uploadProfilePicture(email, imageUri) {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('profilePic', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });

      const response = await fetch(`${API_BASE_URL}/users/upload-profile-picture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload profile picture');
      }

      return data;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }
}

export default AuthService;