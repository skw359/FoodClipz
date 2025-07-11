import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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
  likesRed: '#ef4444',
};

const API_BASE_URL = 'https://foodclipz.ddns.net/api';

// Helper function to generate initials from name
const generateInitials = (firstName, lastName) => {
  if (firstName && lastName) {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  } else if (firstName) {
    return firstName.charAt(0).toUpperCase();
  }
  return 'FC';
};

// Helper function to format timestamp
const formatTimestamp = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now - date;
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays === 1) {
    return '1d ago';
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Achievement definitions
const ACHIEVEMENTS = [
  {
    id: 'burger_master',
    icon: '🍔',
    title: 'Burger Master',
    description: 'Try 10 burgers',
    requirement: { type: 'tag_count', tag: 'burger', count: 10 }
  },
  {
    id: 'heat_seeker',
    icon: '🌶️',
    title: 'Heat Seeker',
    description: 'Spicy food lover',
    requirement: { type: 'tag_count', tag: 'spicy', count: 5 }
  },
  {
    id: 'explorer',
    icon: '📍',
    title: 'Explorer',
    description: 'Visit 50 places',
    requirement: { type: 'unique_places', count: 50 }
  },
  {
    id: 'ramen_runner',
    icon: '🍜',
    title: 'Ramen Runner',
    description: 'Try 15 ramen',
    requirement: { type: 'tag_count', tag: 'ramen', count: 15 }
  },
  {
    id: 'coffee_connoisseur',
    icon: '☕',
    title: 'Coffee Connoisseur',
    description: 'Rate 20 cafes',
    requirement: { type: 'tag_count', tag: 'coffee', count: 20 }
  },
  {
    id: 'food_critic',
    icon: '🏆',
    title: 'Food Critic',
    description: '100 detailed reviews',
    requirement: { type: 'total_clips', count: 100 }
  }
];

const ProfileHeader = ({ user, userStats, onEditProfile, onShareProfile }) => {
  const userInitials = generateInitials(user?.firstName || user?.first_name, user?.lastName || user?.last_name);
  const fullName = `${user?.firstName || user?.first_name || ''} ${user?.lastName || user?.last_name || ''}`.trim();
  
  return (
    <LinearGradient
      colors={[colors.appDarkGreen, colors.appMediumGreen]}
      style={styles.profileHeaderGradient}
    >
      <View style={styles.profileAvatarContainer}>
        {user?.profilePicture || user?.profile_picture ? (
          <Image 
            source={{ uri: `${API_BASE_URL.replace('/api', '')}/${user.profilePicture || user.profile_picture}` }} 
            style={styles.profileAvatar} 
          />
        ) : (
          <LinearGradient
            colors={[colors.appPrimaryGreen, colors.appSecondaryGreen]}
            style={styles.profileAvatar}
          >
            <Text style={styles.profileAvatarText}>{userInitials}</Text>
          </LinearGradient>
        )}
      </View>
      
      <Text style={styles.profileName}>{fullName}</Text>
      <Text style={styles.profileBio}>
        {user?.bio || 'Food explorer • Coffee enthusiast • Always hungry'}
      </Text>
      
      <View style={styles.profileStats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{userStats.totalClips}</Text>
          <Text style={styles.statLabel}>Clips</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{userStats.following}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{userStats.followers}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const ActionButtons = ({ onEditProfile, onShareProfile }) => {
  return (
    <View style={styles.actionButtons}>
      <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]} onPress={onEditProfile}>
        <Text style={styles.primaryBtnText}>Edit Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionBtn, styles.secondaryBtn]} onPress={onShareProfile}>
        <Text style={styles.secondaryBtnText}>Share Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const AchievementCard = ({ achievement, earned, progress }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
  const handlePress = () => {
    if (earned) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };
  
  return (
    <TouchableOpacity onPress={handlePress}>
      <Animated.View style={[
        styles.achievement,
        earned && styles.achievementEarned,
        { transform: [{ scale: scaleAnim }] }
      ]}>
        <Text style={styles.achievementIcon}>{achievement.icon}</Text>
        <Text style={styles.achievementTitle}>{achievement.title}</Text>
        <Text style={styles.achievementDesc}>{achievement.description}</Text>
        {!earned && progress && (
          <Text style={styles.achievementProgress}>{progress}%</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const Achievements = ({ userClips, userStats }) => {
  const checkAchievement = (achievement) => {
    const req = achievement.requirement;
    
    switch (req.type) {
      case 'total_clips':
        return userStats.totalClips >= req.count;
      case 'unique_places':
        return userStats.uniquePlaces >= req.count;
      case 'tag_count':
        const tagCount = userClips.reduce((count, clip) => {
          const tags = typeof clip.tags === 'string' ? JSON.parse(clip.tags) : (clip.tags || []);
          return count + tags.filter(tag => tag.toLowerCase().includes(req.tag.toLowerCase())).length;
        }, 0);
        return tagCount >= req.count;
      default:
        return false;
    }
  };
  
  const getProgress = (achievement) => {
    const req = achievement.requirement;
    
    switch (req.type) {
      case 'total_clips':
        return Math.min(100, Math.floor((userStats.totalClips / req.count) * 100));
      case 'unique_places':
        return Math.min(100, Math.floor((userStats.uniquePlaces / req.count) * 100));
      case 'tag_count':
        const tagCount = userClips.reduce((count, clip) => {
          const tags = typeof clip.tags === 'string' ? JSON.parse(clip.tags) : (clip.tags || []);
          return count + tags.filter(tag => tag.toLowerCase().includes(req.tag.toLowerCase())).length;
        }, 0);
        return Math.min(100, Math.floor((tagCount / req.count) * 100));
      default:
        return 0;
    }
  };
  
  return (
    <View style={styles.achievements}>
      <Text style={styles.sectionTitle}>Achievements</Text>
      <View style={styles.achievementsGrid}>
        {ACHIEVEMENTS.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            earned={checkAchievement(achievement)}
            progress={getProgress(achievement)}
          />
        ))}
      </View>
    </View>
  );
};

const FoodJourney = ({ userStats, userClips }) => {
  const [progressAnim] = useState(new Animated.Value(0));
  const progressPercentage = Math.min(100, Math.floor((userStats.uniquePlaces / 100) * 100));
  const streakDays = 47; // This would come from server data
  
  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progressPercentage]);
  
  return (
    <View style={styles.foodJourney}>
      <Text style={styles.sectionTitle}>Food Journey</Text>
      <View style={styles.journeyMap}>
        <View style={styles.journeyStats}>
          <View style={styles.journeyStat}>
            <Text style={styles.journeyStatValue}>{streakDays}</Text>
            <Text style={styles.journeyStatLabel}>Days streak</Text>
          </View>
          <View style={styles.journeyStat}>
            <Text style={styles.journeyStatValue}>{userStats.uniquePlaces}</Text>
            <Text style={styles.journeyStatLabel}>Unique places</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {userStats.uniquePlaces}/100 restaurants to next level
          </Text>
        </View>
      </View>
    </View>
  );
};

const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'rating': return '⭐';
      case 'clip': return '📸';
      case 'follow': return '👥';
      case 'achievement': return '🏆';
      case 'favorite': return '❤️';
      default: return '📱';
    }
  };
  
  return (
    <View style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <Text style={styles.activityIconText}>{getActivityIcon(activity.type)}</Text>
      </View>
      <View style={styles.activityInfo}>
        <Text style={styles.activityText}>{activity.text}</Text>
        <Text style={styles.activityTime}>{formatTimestamp(activity.timestamp)}</Text>
      </View>
    </View>
  );
};

const RecentActivity = ({ userClips }) => {
  const generateActivities = (clips) => {
    const activities = [];
    
    // Generate activities from recent clips
    clips.slice(0, 5).forEach(clip => {
      activities.push({
        type: 'clip',
        text: `Posted clip at ${clip.restaurant_name}`,
        timestamp: clip.created_at
      });
      
      if (clip.rating >= 4) {
        activities.push({
          type: 'rating',
          text: `Rated ${clip.restaurant_name} ${clip.rating} stars`,
          timestamp: clip.created_at
        });
      }
    });
    
    // Sort by timestamp
    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
  };
  
  const activities = generateActivities(userClips);
  
  return (
    <View style={styles.recentActivity}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {activities.map((activity, index) => (
        <ActivityItem key={index} activity={activity} />
      ))}
    </View>
  );
};

const ProfileComponent = ({ user, onNavigate, onEditProfile, onLogout, onSettings }) => {
  const [userClips, setUserClips] = useState([]);
  const [userStats, setUserStats] = useState({
    totalClips: 0,
    uniquePlaces: 0,
    following: 0,
    followers: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [user.id]);

  const loadUserData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    
    try {
      // Load user clips
      const clipsResponse = await fetch(`${API_BASE_URL}/clips/user/${user.id}`);
      const clipsData = await clipsResponse.json();
      
      if (clipsResponse.ok) {
        setUserClips(clipsData);
      }
      
      // Load user profile with stats
      const profileResponse = await fetch(`${API_BASE_URL}/users/profile/${user.id}`);
      const profileData = await profileResponse.json();
      
      if (profileResponse.ok) {
        setUserStats({
          totalClips: profileData.total_clips || 0,
          uniquePlaces: profileData.unique_places || 0,
          following: 284, // These would come from server
          followers: 1200 // These would come from server
        });
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUserData(true);
  };

  const handleEditProfile = () => {
    if (onEditProfile) {
      onEditProfile();
    } else {
      // Fallback to navigate to edit profile
      onNavigate?.('editProfile');
    }
  };

  const handleShareProfile = () => {
    Alert.alert('Share Profile', 'Profile sharing functionality coming soon!');
  };

  const handleSettingsPress = () => {
    if (onSettings) {
      onSettings();
    } else {
      // Fallback to navigate to settings
      onNavigate?.('settings');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Settings Button */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsBtn} onPress={handleSettingsPress}>
            <FontAwesome name="cog" size={20} color={colors.appTextGray} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.appPrimaryGreen]}
            tintColor={colors.appPrimaryGreen}
          />
        }
      >
        {/* Profile Header */}
        <ProfileHeader 
          user={user}
          userStats={userStats}
          onEditProfile={handleEditProfile}
          onShareProfile={handleShareProfile}
        />

        {/* Action Buttons */}
        <ActionButtons 
          onEditProfile={handleEditProfile}
          onShareProfile={handleShareProfile}
        />

        {/* Achievements */}
        <Achievements userClips={userClips} userStats={userStats} />

        {/* Food Journey */}
        <FoodJourney userStats={userStats} userClips={userClips} />

        {/* Recent Activity */}
        <RecentActivity userClips={userClips} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appInputBackground,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.appTextGray,
  },
  
  // Header Styles
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.appBorder,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.appDarkGreen,
  },
  settingsBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.appInputBackground,
  },
  
  // Scroll View
  scrollView: {
    flex: 1,
  },
  
  // Profile Header Styles
  profileHeaderGradient: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  profileAvatarContainer: {
    marginBottom: 20,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileAvatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.appDarkGreen,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 20,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
  },
  
  // Action Buttons Styles
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: colors.appPrimaryGreen,
  },
  secondaryBtn: {
    backgroundColor: colors.appLightGray,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.appDarkGreen,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.appTextGray,
  },
  
  // Achievements Styles
  achievements: {
    padding: 20,
    backgroundColor: colors.appInputBackground,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.appDarkText,
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievement: {
    backgroundColor: colors.white,
    width: (screenWidth - 64) / 3,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  achievementEarned: {
    borderColor: colors.appPrimaryGreen,
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.appDarkText,
    marginBottom: 4,
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: 10,
    color: colors.appTextGray,
    textAlign: 'center',
  },
  achievementProgress: {
    fontSize: 10,
    color: colors.appPrimaryGreen,
    fontWeight: '600',
    marginTop: 4,
  },
  
  // Food Journey Styles
  foodJourney: {
    padding: 20,
    backgroundColor: colors.appInputBackground,
  },
  journeyMap: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
  },
  journeyStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  journeyStat: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.appInputBackground,
    borderRadius: 12,
  },
  journeyStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.appPrimaryGreen,
    marginBottom: 4,
  },
  journeyStatLabel: {
    fontSize: 14,
    color: colors.appTextGray,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    backgroundColor: colors.appLightGray,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.appPrimaryGreen,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.appTextGray,
    textAlign: 'center',
  },
  
  // Recent Activity Styles
  recentActivity: {
    padding: 20,
    paddingBottom: 100,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.appBorder,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.appPrimaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIconText: {
    fontSize: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityText: {
    fontSize: 15,
    color: colors.appDarkText,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 13,
    color: colors.appTextGray,
  },
});

export default ProfileComponent;