// utils/DeepLinkHandler.js
import { useEffect } from 'react';
import { Linking } from 'react-native';

const DeepLinkHandler = ({ onVerificationSuccess, onVerificationError }) => {
  useEffect(() => {
    // Handle initial URL if app was opened from a link
    const handleInitialURL = async () => {
      try {
        const initialURL = await Linking.getInitialURL();
        if (initialURL) {
          handleDeepLink(initialURL);
        }
      } catch (error) {
        console.error('Error getting initial URL:', error);
      }
    };

    // Handle URLs when app is already running
    const handleURLChange = (url) => {
      handleDeepLink(url);
    };

    // Set up listeners
    handleInitialURL();
    const subscription = Linking.addEventListener('url', ({ url }) => handleURLChange(url));

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleDeepLink = async (url) => {
    try {
      console.log('Received deep link:', url);
      
      // Handle success deep link: foodclipz://auth/success?user=...
      if (url.includes('foodclipz://auth/success')) {
        const urlObj = new URL(url);
        const userParam = urlObj.searchParams.get('user');
        
        if (userParam) {
          try {
            const user = JSON.parse(decodeURIComponent(userParam));
            console.log('Parsed user from deep link:', user);
            onVerificationSuccess(user);
          } catch (parseError) {
            console.error('Error parsing user data from deep link:', parseError);
            onVerificationError?.('Invalid user data received');
          }
        }
      }
      
      // Handle error deep link: foodclipz://auth/error
      else if (url.includes('foodclipz://auth/error')) {
        onVerificationError?.('Verification failed');
      }
      
    } catch (error) {
      console.error('Error handling deep link:', error);
      onVerificationError?.('Error processing verification');
    }
  };

  return null; // This component doesn't render anything
};

export default DeepLinkHandler;