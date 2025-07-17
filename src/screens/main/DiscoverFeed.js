import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { ClipCard } from '../../components';
import ProfileComponent from './ProfileComponent';

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

// function to generate initials from name
const generateInitials = (firstName, lastName) => {
  if (firstName && lastName) {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  } else if (firstName) {
    return firstName.charAt(0).toUpperCase();
  }
  return 'FC';
};

// header
const DiscoverHeader = ({ activeTab, onTabChange, user, onProfilePress }) => {
  const userInitials = generateInitials(user?.firstName || user?.first_name, user?.lastName || user?.last_name);
  
  return (
    <LinearGradient
      colors={[colors.white, colors.appInputBackground]}
      style={styles.header}
    >
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.headerTop}>
          <Text style={styles.appTitle}>FoodClipz</Text>
          <TouchableOpacity style={styles.profileBtn} onPress={onProfilePress}>
            {user?.profilePicture || user?.profile_picture ? (
              <Image 
                source={{ uri: `${API_BASE_URL.replace('/api', '')}/${user.profilePicture || user.profile_picture}` }} 
                style={styles.profileImage} 
              />
            ) : (
              <Text style={styles.profileInitials}>{userInitials}</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.tabNav}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'feed' && styles.tabActive]} 
            onPress={() => onTabChange('feed')}
          >
            <Text style={[styles.tabText, activeTab === 'feed' && styles.tabTextActive]}>Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'following' && styles.tabActive]} 
            onPress={() => onTabChange('following')}
          >
            <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>Following</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'discover' && styles.tabActive]} 
            onPress={() => onTabChange('discover')}
          >
            <Text style={[styles.tabText, activeTab === 'discover' && styles.tabTextActive]}>Discover</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

// bottom nav part
const BottomNavigation = ({ activeTab, onTabChange, onAddClip }) => {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity 
        style={[styles.navItem, activeTab === 'feed' && styles.navItemActive]} 
        onPress={() => onTabChange('feed')}
      >
        <Ionicons 
          name={activeTab === 'feed' ? "home" : "home-outline"} 
          size={24} 
          color={activeTab === 'feed' ? colors.appDarkGreen : colors.appTextGray} 
        />
        <Text style={[styles.navLabel, activeTab === 'feed' && styles.navLabelActive]}>Feed</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navItem, activeTab === 'map' && styles.navItemActive]} 
        onPress={() => onTabChange('map')}
      >
        <Ionicons 
          name={activeTab === 'map' ? "location" : "location-outline"} 
          size={24} 
          color={activeTab === 'map' ? colors.appDarkGreen : colors.appTextGray} 
        />
        <Text style={[styles.navLabel, activeTab === 'map' && styles.navLabelActive]}>Map</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navItem, activeTab === 'discover' && styles.navItemActive]} 
        onPress={() => onTabChange('discover')}
      >
        <Ionicons 
          name={activeTab === 'discover' ? "search" : "search-outline"} 
          size={24} 
          color={activeTab === 'discover' ? colors.appDarkGreen : colors.appTextGray} 
        />
        <Text style={[styles.navLabel, activeTab === 'discover' && styles.navLabelActive]}>Discover</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navItem, activeTab === 'profile' && styles.navItemActive]} 
        onPress={() => onTabChange('profile')}
      >
        <Ionicons 
          name={activeTab === 'profile' ? "person" : "person-outline"} 
          size={24} 
          color={activeTab === 'profile' ? colors.appDarkGreen : colors.appTextGray} 
        />
        <Text style={[styles.navLabel, activeTab === 'profile' && styles.navLabelActive]}>Profile</Text>
      </TouchableOpacity>
      
      {/* floating action Button */}
      <TouchableOpacity style={styles.fab} onPress={onAddClip}>
        <LinearGradient
          colors={[colors.appPrimaryGreen, colors.appSecondaryGreen]}
          style={styles.fabGradient}
        >
          <FontAwesome name="plus" size={24} color={colors.appDarkGreen} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const DiscoverFeed = ({ user, onNavigate, onAddClip, initialTab = 'feed' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState('feed');

  useEffect(() => {
    if (activeNavTab !== 'profile') {
      loadClips();
    }
  }, [activeTab]);

  const loadClips = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    
    try {
      let endpoint = '';
      switch (activeTab) {
        case 'feed':
          endpoint = '/clips/feed';
          break;
        case 'following':
          endpoint = `/users/${user.id}/following-feed`;
          break;
        case 'discover':
        default:
          endpoint = '/clips/feed';
          break;
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json();
      
      if (response.ok) {
        setClips(data);
      } else {
        throw new Error(data.error || 'Failed to load clips');
      }
    } catch (error) {
      console.error('Error loading clips:', error);
      Alert.alert('Error', 'Failed to load clips. Please try again.');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadClips(true);
  };

  const handleLike = async (clipId, isLiked) => {
    try {
      const response = await fetch(`${API_BASE_URL}/clips/${clipId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          reactionType: isLiked ? 'like' : 'unlike'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update like');
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleComment = (clipId) => {
    // nav to comment screen
    console.log('Comment on clip:', clipId);
  };

  const handleShare = (clip) => {
    // uhhh implement share functionality
    console.log('Share clip:', clip);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    loadClips();
  };

  const handleNavTabChange = (tab) => {
    setActiveNavTab(tab);
    if (tab === 'profile') {
    } else if (tab !== 'feed') {
      onNavigate?.(tab);
    }
  };

  const handleProfilePress = () => {
    setActiveNavTab('profile');
  };

  const handleEditProfile = () => {
    onNavigate?.('editProfile');
  };

  const renderClip = ({ item }) => (
    <ClipCard
      clip={item}
      onLike={handleLike}
      onComment={handleComment}
      onShare={handleShare}
      currentUserId={user.id}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <FontAwesome5 name="utensils" size={64} color={colors.appTextGray} />
      <Text style={styles.emptyStateTitle}>No clips yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        {activeTab === 'following' 
          ? 'Follow some food lovers to see their clips here!'
          : 'Be the first to share your food experience!'
        }
      </Text>
    </View>
  );

  // show profile when profile tab is active
  if (activeNavTab === 'profile') {
    return (
      <View style={styles.container}>
        <ProfileComponent 
          user={user}
          onNavigate={onNavigate}
          onEditProfile={handleEditProfile}
        />
        <BottomNavigation 
          activeTab={activeNavTab}
          onTabChange={handleNavTabChange}
          onAddClip={onAddClip}
        />
      </View>
    );
  }

  // origin feed content for other tabs
  return (
    <View style={styles.container}>
      <DiscoverHeader 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={user}
        onProfilePress={handleProfilePress}
      />
      
      <FlatList
        data={clips}
        renderItem={renderClip}
        keyExtractor={(item) => item.id.toString()}
        style={styles.feed}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.appPrimaryGreen]}
            tintColor={colors.appPrimaryGreen}
          />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
        contentContainerStyle={clips.length === 0 ? styles.emptyContainer : styles.feedContent}
      />
      
      <BottomNavigation 
        activeTab={activeNavTab}
        onTabChange={handleNavTabChange}
        onAddClip={onAddClip}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appInputBackground,
  },
  
  // header Styles
  header: {
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.appBorder,
  },
  headerSafeArea: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.appDarkGreen,
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  profileInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.appDarkGreen,
    backgroundColor: colors.appPrimaryGreen,
    width: 36,
    height: 36,
    borderRadius: 18,
    textAlign: 'center',
    lineHeight: 36,
  },
  tabNav: {
    flexDirection: 'row',
    gap: 20,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.appPrimaryGreen,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.appTextGray,
  },
  tabTextActive: {
    color: colors.appDarkGreen,
  },
  
  // what the feed will look like
  feed: {
    flex: 1,
  },
  feedContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  
  // bottom nav styles
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.appBorder,
    paddingVertical: 12,
    paddingBottom: 32,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navItemActive: {
    // active styling prob handled by color props
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.appTextGray,
  },
  navLabelActive: {
    color: colors.appDarkGreen,
  },
  fab: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: colors.appPrimaryGreen,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // empty state styles
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.appTextGray,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: colors.appTextGray,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 40,
  },
});

export default DiscoverFeed;
