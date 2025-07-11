import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';


import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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

// format time
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

// clip card part
const ClipCard = ({ clip, onLike, onComment, onShare, currentUserId }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(clip.likes_count || 0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const userInitials = generateInitials(clip.first_name, clip.last_name);
  
  // parse tags if they're stored as JSON string
  const tags = typeof clip.tags === 'string' ? JSON.parse(clip.tags) : (clip.tags || []);
  
  // parse photos if they're stored as JSON string
  const photos = typeof clip.photos === 'string' ? JSON.parse(clip.photos) : (clip.photos || []);
  const hasPhoto = photos.length > 0;

  const handleLike = () => {
    // animate heart? idk
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    
    if (onLike) {
      onLike(clip.id, !isLiked);
    }
  };

  // render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Text key={i} style={styles.star}>★</Text>);
    }
    
    if (hasHalfStar) {
      stars.push(<Text key="half" style={styles.star}>☆</Text>);
    }
    
    return stars;
  };

  return (
    <View style={styles.clipCard}>
      {/* header */}
      <View style={styles.clipHeader}>
        <View style={styles.userAvatar}>
          {clip.profile_picture ? (
            <Image 
              source={{ uri: `${API_BASE_URL.replace('/api', '')}/${clip.profile_picture}` }} 
              style={styles.avatarImage} 
            />
          ) : (
            <LinearGradient
              colors={[colors.appPrimaryGreen, colors.appSecondaryGreen]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>{userInitials}</Text>
            </LinearGradient>
          )}
        </View>
        
        <View style={styles.clipUserInfo}>
          <Text style={styles.username}>{clip.first_name} {clip.last_name}</Text>
          <View style={styles.locationContainer}>
            <FontAwesome name="map-marker" size={12} color={colors.appTextGray} />
            <Text style={styles.location}>{clip.restaurant_name}</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.moreBtn}>
          <FontAwesome name="ellipsis-v" size={16} color={colors.appTextGray} />
        </TouchableOpacity>
      </View>

      {/* image */}
      {hasPhoto ? (
        <View style={styles.clipImage}>
          <Image 
            source={{ uri: `${API_BASE_URL.replace('/api', '')}/${photos[0]}` }} 
            style={styles.foodImage}
            resizeMode="cover"
          />
          <View style={styles.ratingOverlay}>
            <View style={styles.starsContainer}>
              {renderStars(clip.rating)}
            </View>
            <Text style={styles.ratingText}>{clip.rating}</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.clipImage, styles.noImagePlaceholder]}>
          <FontAwesome5 name="utensils" size={48} color={colors.appTextGray} />
          <View style={styles.ratingOverlay}>
            <View style={styles.starsContainer}>
              {renderStars(clip.rating)}
            </View>
            <Text style={styles.ratingText}>{clip.rating}</Text>
          </View>
        </View>
      )}

      {/* content */}
      <View style={styles.clipContent}>
        <Text style={styles.restaurantName}>{clip.restaurant_name}</Text>
        {clip.address && (
          <Text style={styles.restaurantAddress}>{clip.address}</Text>
        )}
        
        {clip.review && (
          <Text style={styles.clipText}>{clip.review}</Text>
        )}
        
        {tags.length > 0 && (
          <View style={styles.tags}>
            {tags.slice(0, 4).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {tags.length > 4 && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>+{tags.length - 4}</Text>
              </View>
            )}
          </View>
        )}
        
        {/* actions */}
        <View style={styles.clipActions}>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionBtn, isLiked && styles.actionBtnLiked]} 
              onPress={handleLike}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <FontAwesome 
                  name={isLiked ? "heart" : "heart-o"} 
                  size={18} 
                  color={isLiked ? colors.likesRed : colors.appTextGray} 
                />
              </Animated.View>
              <Text style={[styles.actionText, isLiked && styles.actionTextLiked]}>
                {likesCount}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionBtn} onPress={() => onComment?.(clip.id)}>
              <FontAwesome name="comment-o" size={18} color={colors.appTextGray} />
              <Text style={styles.actionText}>{clip.comments_count || 0}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionBtn} onPress={() => onShare?.(clip)}>
              <FontAwesome name="share" size={16} color={colors.appTextGray} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.timestamp}>{formatTimestamp(clip.created_at)}</Text>
        </View>
      </View>
    </View>
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
  
  // hedaer Styles
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
  
  // clip card styles probably
  clipCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.appBorder,
  },
  clipHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.appDarkGreen,
  },
  clipUserInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.appDarkText,
    marginBottom: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: colors.appTextGray,
  },
  moreBtn: {
    padding: 4,
  },
  
  // image sttyles
  clipImage: {
    width: '100%',
    height: 280,
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    backgroundColor: colors.appLightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)',
    padding: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    color: '#fbbf24',
    fontSize: 14,
  },
  ratingText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // content styles
  clipContent: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.appDarkText,
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    color: colors.appTextGray,
    marginBottom: 8,
  },
  clipText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.appFormLabel,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: colors.appLightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.appTextGray,
  },
  
  // action styles
  clipActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnLiked: {
    // eventual styling for liking state
  },
  actionText: {
    fontSize: 14,
    color: colors.appTextGray,
  },
  actionTextLiked: {
    color: colors.likesRed,
  },
  timestamp: {
    fontSize: 13,
    color: colors.appTextGray,
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
  
  // empty state stles
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