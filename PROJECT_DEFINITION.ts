/**
 * DROPVID - Core Project Definition
 * This file serves as the source of truth for the app's core purpose and functionality.
 * Reference this when making architectural decisions or adding new features.
 */

export interface CorePurpose {
  /** Primary goal of the application */
  primary: "Connect performers/artists with their fans for event video sharing and management";
  
  /** Key value propositions */
  valueProps: {
    forCreatives: [
      "Easily collect fan-recorded videos from events",
      "Organize and store videos in personal cloud",
      "Share best moments with wider audience",
      "Build stronger fan engagement"
    ];
    forFans: [
      "Share their event recordings directly with artists",
      "Discover and follow favorite performers",
      "Access exclusive content from followed artists",
      "Contribute to artist's content library"
    ];
  };
}

export interface UserTypes {
  creative: {
    definition: "Artists, DJs, performers, and other entertainment professionals";
    capabilities: [
      "Create and manage events",
      "Generate and share upload links",
      "View and download fan-submitted videos",
      "Organize videos into playlists",
      "Select showcase videos for profile",
      "Store personal videos in cloud",
      "Control video visibility and sharing"
    ];
  };
  
  fan: {
    definition: "Event attendees and supporters of creatives";
    capabilities: [
      "Follow creatives",
      "View and save upcoming events",
      "Upload event videos (via shared link)",
      "View showcase videos of followed creatives",
      "See preview snapshots of non-followed creatives"
    ];
  };
}

export interface CoreWorkflows {
  eventManagement: {
    creation: {
      step1: "Creative inputs event details (title, location, date/time, tickets)";
      step2: "Event is added to creative's schedule";
      step3: "Event becomes visible to fans";
    };
    postEvent: {
      step1: "Creative generates upload link";
      step2: "Link is shared with event attendees";
      step3: "Fans upload videos through link (requires account)";
      step4: "Creative receives and organizes videos";
    };
  };

  videoManagement: {
    upload: {
      quality: "Full quality, uncompressed video uploads";
      storage: "Secure cloud storage per creative";
      organization: "Playlist-based organization system";
    };
    showcase: {
      limit: "Up to 10 featured videos on profile";
      visibility: "Full videos for followers, snapshots for non-followers";
      purpose: "Convert viewers to followers";
    };
    playlists: {
      eventPlaylists: "Collection of videos from specific events";
      thematicPlaylists: "Custom playlists across events";
      showcasePlaylist: "Top 10 videos for public viewing";
      visibility: "Event and thematic playlists for followers only";
    };
    sharing: {
      download: "Full quality download for creative's use";
      directShare: "Quick share to social platforms";
      platforms: "Instagram, TikTok, Twitter, YouTube integration";
      tracking: "Share analytics and follower conversion";
    };
  };

  userEngagement: {
    fanActions: {
      following: "Follow creatives to access full content";
      discovery: "Browse creative profiles and events";
      contribution: "Upload videos to support creatives";
    };
    creativeActions: {
      community: "Build and engage with fan base";
      content: "Curate and share best fan moments";
      growth: "Convert video uploaders to followers";
      showcase: "Display best content to attract followers";
    };
  };
}

export interface SecurityModel {
  videoPrivacy: {
    access: "Videos only accessible to intended creative";
    storage: "Secure, isolated storage per creative";
    sharing: "Creative controls all video distribution";
  };

  uploadLinks: {
    purpose: "Dual-purpose as sharing and user acquisition tool";
    security: "Requires authentication to upload";
    expiry: "Can be time-limited or upload-count limited";
  };

  userAccess: {
    creative: {
      ownContent: "Full control over own content and events";
      fanContent: "Exclusive access to fan-submitted videos";
      type: "Display type (e.g., DJ, Artist, Producer, Club, Festival)";
    };
    fan: {
      following: "Access to full videos of followed creatives";
      nonFollowing: "Access to video snapshots only";
    };
  };

  sharingControls: {
    download: "Full quality available to creative only";
    directShare: "Creative controls platform sharing";
    playlist: "Creative controls playlist visibility";
    showcase: "Public access to showcase playlist only";
  };
}

export interface SharingAnalytics {
  videoMetrics: {
    views: "Track video view counts";
    shares: "Track share counts per platform";
    downloads: "Track creative downloads";
    engagement: "Track watch time and interactions";
  };
  playlistMetrics: {
    followers: "Track follower conversion rate";
    engagement: "Track playlist completion rate";
    growth: "Track audience growth over time";
  };
  showcaseMetrics: {
    conversion: "Track showcase to follower conversion";
    effectiveness: "Track most effective videos";
    reach: "Track showcase visibility";
  };
}

/**
 * Feature Flag Interface
 * Used to control feature rollout and maintain focus on core functionality
 */
export interface FeatureFlags {
  readonly CORE_FEATURES: {
    EVENT_MANAGEMENT: true;
    VIDEO_UPLOAD: true;
    CREATIVE_PROFILES: true;
    FAN_FOLLOWING: true;
    VIDEO_SHOWCASE: true;
    PLAYLIST_MANAGEMENT: true;
    DIRECT_SHARING: true;
  };

  readonly FUTURE_FEATURES: {
    LIVE_STREAMING: false;
    MONETIZATION: false;
    ANALYTICS_DASHBOARD: false;
    COLLABORATIVE_PLAYLISTS: false;
  };
}

/**
 * Development Principles
 * Core guidelines for development decisions
 */
export const DevelopmentPrinciples = {
  SIMPLICITY: "Favor simple, focused solutions over complex, multi-purpose ones",
  SECURITY: "Protect creative's content and fan's contributions",
  PERFORMANCE: "Optimize for video upload and playback experience",
  ENGAGEMENT: "Foster creative-fan connections through content sharing",
  SCALABILITY: "Design for growing creative and fan bases",
} as const;

/**
 * Creative Types
 * Available types for creative profiles
 */
export const CreativeTypes = {
  DJ: 'dj',
  ARTIST: 'artist',
  PRODUCER: 'producer',
  INFLUENCER: 'influencer',
  CLUB: 'club',
  FESTIVAL: 'festival'
} as const;

export type CreativeType = typeof CreativeTypes[keyof typeof CreativeTypes];

/**
 * Sharing Platforms
 * Supported social media platforms for direct sharing
 */
export const SharingPlatforms = {
  INSTAGRAM: 'instagram',
  TIKTOK: 'tiktok',
  TWITTER: 'twitter',
  YOUTUBE: 'youtube'
} as const;

export type SharingPlatform = typeof SharingPlatforms[keyof typeof SharingPlatforms];

/**
 * Playlist Types
 * Different types of playlists available in the system
 */
export const PlaylistTypes = {
  EVENT: 'event',
  THEMATIC: 'thematic',
  SHOWCASE: 'showcase'
} as const;

export type PlaylistType = typeof PlaylistTypes[keyof typeof PlaylistTypes];

// Export a type-safe config object
export const ProjectConfig = {
  APP_NAME: "DropVid",
  CORE_PURPOSE: "Video-based creative-fan engagement platform",
  TARGET_USERS: ["Performers", "DJs", "Artists", "Event Attendees"],
  MAX_SHOWCASE_VIDEOS: 10,
  VIDEO_PRIVACY: "creative-only",
  UPLOAD_REQUIRES_AUTH: true,
  SHARING_ENABLED: true,
  PLAYLIST_ENABLED: true,
} as const; 