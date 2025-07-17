import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const colors = {
  appDarkGreen: '#00241b',
  appMediumGreen: '#003d2e',
  white: '#ffffff',
};

const AuthHeader = ({ authMode, onBack, title = 'FoodClipz' }) => (
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
          <Text style={styles.authHeaderTitle}>{title}</Text>
          <Text style={styles.authHeaderSubtitle}>
            {authMode === 'login' ? 'Welcome back!' : 'Join the community!'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  </LinearGradient>
);

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
});

export default AuthHeader;