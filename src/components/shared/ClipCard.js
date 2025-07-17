import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const colors = {
  white: '#ffffff',
  appDarkText: '#1e293b',
  appTextGray: '#64748b',
  appPrimaryGreen: '#4ade80',
  appSecondaryGreen: '#22c55e',
  appDarkGreen: '#00241b',
  appLightGray: '#f1f5f9',
  appBorder: '#e2e8f0',
  likesRed: '#ef4444',
};

const API_BASE_URL = 'https://foodclipz.ddns.net/api';

// Helper functions (these will be moved to utils later)
const generateInitials = (firstName, lastName) => {
  if (firstName && lastName) {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  } else if (firstName) {
    return firstName.charAt(0).toUpperCase();
  }
  return 'FC';
};

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
    // animate heart
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

const styles = StyleSheet.create({
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
  
  // image styles
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
});

export default ClipCard;
