# From Stigma to Support   Academic Wellness Support Application

## Overview
A web application providing academic wellness support with community features, therapy resources, mood tracking tools, comprehensive rural outreach management with institutional awareness mapping, and social sharing capabilities. The application uses a calming design theme with blue, green, and lavender tones.

## Multilingual Support System
- Comprehensive multilingual interface supporting English (default), Hindi, Marathi, Kannada, Tamil, Telugu, Spanish, and French
- Language selector component in header allowing users to switch languages seamlessly
- User language preference persisted in backend user profile data
- Automatic browser language detection for initial language selection when user is not authenticated
- Translation system using JSON dictionaries for each supported language
- All static text elements translated including navigation, buttons, section titles, page headers, disclaimers, and form labels
- Core pages fully localized: HomePage (including breathing animation text), CommunityPage, TherapyPage, MoodTrackerPage, StressQuizPage, GuidelinesPage, HelplinePage, and OutreachDashboardPage
- Backend stores user language preference and returns localized content where applicable
- Language switching updates interface immediately without page refresh

## User Authentication & Role Management
- Internet Identity authentication system
- User registration with fields: Email, Name, Age, Username, Language Preference
- Privacy disclaimer and community guidelines displayed during signup in user's selected language
- Option for anonymous posting in community features
- First user to log in via Internet Identity is automatically assigned the admin role
- Subsequent users receive standard user role by default
- Admin promotion banner displays once per login session when user becomes admin
- Admins can assign roles to other users: admin, moderator, or clinician
- Role-based access control for different features and management capabilities

## Admin Auto-Assignment System
- Backend tracks if any admin user exists in the system using `adminExists` flag
- `checkAndAssignAdmin` function runs exactly once during initial login completion
- If no admin exists, the first authenticated user becomes admin automatically and `adminExists` flag is set to true
- Frontend calls `checkAndAssignAdmin()` immediately after successful Internet Identity authentication in `App.tsx`
- Login state flag prevents duplicate admin promotion calls and race conditions
- AdminPromotionBanner displays "✅ Admin Mode Activated — Outreach Dashboard Unlocked" immediately upon successful admin assignment
- Banner appears without requiring page refresh or reload
- Header navigation updates instantly to include admin-only links (Outreach Dashboard, Institutional Mapping) when admin role is granted
- Confirmation toast message displays confirming admin privileges have been granted
- All admin-only pages become accessible immediately after admin assignment

## Social Sharing System
- "Share Website" feature accessible from both header and footer
- Sharing options include: WhatsApp, Facebook, Instagram, Twitter (X), and Messenger
- Each sharing option opens the appropriate native or web sharing dialog
- Shares the application URL with a brief description about the wellness support platform
- Uses social media platform icons from react-icons library

## Active User Tracking System
- Real-time tracking of active users displayed in Admin Dashboard
- Shows number of currently logged-in users
- Displays most recent activity timestamps for each active user
- Backend maintains active user sessions and activity logs
- Updates user activity on page interactions and API calls
- Admin-only feature for monitoring platform engagement

## Messaging System
- Direct messaging between users (text-only chat)
- User-to-admin and admin-to-user messaging capabilities
- Message threads organized by conversation participants
- Real-time message delivery and read status
- Backend stores all messages with sender, recipient, timestamp, and content
- Access control ensures only involved users or admins can view specific messages
- Admin access to view all messages for moderation and support purposes

## Community Support System
- Users can create posts about emotional concerns (stress, anxiety, academic pressure)
- Posts display anonymously with timestamps
- Content filtering system to prevent harmful, abusive, or inappropriate content
- Visible disclaimer before posting
- Backend stores all community posts with moderation flags
- Moderators and admins have verification controls for content management
- Post deletion functionality:
  - Admins can delete any post for moderation or rule violations
  - Users can only delete their own posts
  - Backend `deletePost(postId: Nat)` function verifies caller is admin or post author before deletion
  - Frontend displays delete buttons under each post with role-based visibility
  - Confirmation dialog before deletion
  - Dynamic post list refresh after successful deletion

## Enhanced Rural Support and Outreach Module
- Comprehensive Outreach Dashboard with tabbed interface for different management areas
- Map and list hybrid dashboard for admins to manage rural areas and campaigns
- Users and volunteers can report areas with poor connectivity or lacking mental health support
- Admins can view, edit, and tag regions with existing awareness campaigns or wellness camps
- Map view loads lightweight markers with fallback to list view for low network connectivity
- Backend stores reported areas in a map keyed by region name with attributes:
  - Connectivity status
  - Description
  - Linked campaigns
  - Reporter information
  - Timestamp

## Institutional Awareness Mapping System
- Comprehensive database of institutions requiring mental health support
- Institution types: hospitals, clinics, colleges, educational institutions, training institutes, community centers
- Backend stores institutional data with fields:
  - Institution name
  - Type
  - Region
  - Contact information
  - Infrastructure status
  - Awareness rating
  - Related outreach campaigns
- Purpose: Identify and mark institutions needing mental health sessions or partnerships
- Map visualization with institution markers and filtering capabilities

## Rural & Low-Access Area Monitoring
- Tracking system for digitally disconnected regions
- Monitoring of underserved rural areas and low-awareness zones
- Backend stores area data with connectivity and access metrics
- Map visualization with heatmaps showing coverage and access levels
- Admin dashboard displays distress-prone and poorly connected areas

## Offline Outreach & Intervention System
- Management system for mental health camps and awareness events
- Tracking of ongoing and upcoming interventions
- Event scheduling for fairs, festivals, and community gatherings
- Clinician assignment system for location-based visits
- Backend stores event data with scheduling and assignment information

## Admin Intelligence Dashboard
- Heat maps marking distress-prone and poorly connected areas
- Graphs summarizing institutional engagement and region coverage
- Alert system for detecting spikes in distress or unserved areas
- Recommendation cards for offline interventions
- Analytics and reporting features for outreach effectiveness
- Real-time active user tracking with engagement metrics
- Backend processes data to generate insights and recommendations

## Safety Features
- Dedicated Community Guidelines page explaining acceptable conduct
- Content filtering logic applied before post submission
- Emergency helpline information page with static list of crisis hotlines
- User verification controls for admins and moderators

## Support & Therapy Resources
- Informational pages covering:
  - Relaxation and breathing exercises
  - Art and music therapy techniques
  - Physiotherapy-based stress relief methods
- Session request form for therapy interest
- External platform integration links (Google Meet, Jitsi) for sessions
- Backend stores therapy session requests
- Clinician management and assignment system

## Wellness Tools
- Mood tracker with selectable mood icons/dropdown
- Backend stores recent mood entries per user
- Stress assessment quiz with scoring system
- Quiz results provide personalized suggestions
- Backend stores quiz responses and scores

## Breathing Animation Feature
- HomePage includes a prominent "Breathe In / Breathe Out" calming breathing animation
- Positioned in the hero section below the main headline and hero image
- Features a circular element (soft blue or lavender orb) that gently expands and contracts
- Text alternates between "Breathe In…" and "Breathe Out…" every few seconds in user's selected language
- Continuous looping animation with smooth ease-in-out transitions
- Optional subtle background gradient pulse animation
- Mobile-friendly responsive design
- Maintains consistency with the app's calming color palette

## Data Storage Requirements
- User profiles and authentication data with role management (admin, moderator, clinician, user) and language preference
- Admin existence tracking and role assignment history with race condition prevention
- Active user sessions and activity timestamps for real-time tracking
- Direct messages between users with sender, recipient, timestamp, and content data
- Message threads and conversation metadata
- Community posts with timestamps, moderation status, and post authorship tracking for deletion permissions
- Rural outreach reports with region mapping and campaign data
- Institutional database with comprehensive facility information
- Rural and low-access area monitoring data
- Offline outreach event scheduling and clinician assignments
- Intelligence dashboard analytics and alert data
- Therapy session requests with clinician assignments
- Individual mood tracking entries
- Stress quiz responses and scores
- User language preferences for multilingual support

## Design Requirements
- Mobile-friendly responsive layout
- Calming color scheme: blue, green, and lavender tones
- Clean, accessible interface design
- Intuitive navigation structure
- Language selector dropdown in header with flag icons or language names
- Social sharing buttons in header and footer with platform-specific icons
- Enhanced Outreach Dashboard with tabbed interface:
  - Institutions tab for institutional awareness mapping
  - Rural Areas tab for area monitoring and heatmaps
  - Camps tab for offline outreach management
  - Intelligence tab for analytics and recommendations
- Messages tab for users showing their direct conversations
- Messages & Support tab for admins with access to all conversations and moderation tools
- Active user tracking display in admin dashboard with real-time updates
- Chat interface with message bubbles, timestamps, and read status indicators
- Map interface with lightweight marker loading and heatmap overlays
- Network-aware UI with graceful fallbacks
- Admin promotion banner styling with green checkmark and clear messaging that appears instantly
- Confirmation toast messages for admin privilege assignment
- Confirmation messages and clear callouts for each dashboard section
- Role-based UI elements showing appropriate controls for each user type
- Dynamic header navigation that updates immediately when admin role is assigned without page refresh
- Login state management to prevent duplicate admin promotion calls
- Community post delete buttons with role-based visibility (admins see all, users see own posts only)
- Confirmation dialogs for post deletion with seamless UX refresh
- Breathing animation component with smooth CSS transitions and mobile optimization
- Gradient pulse background animation synchronized with breathing rhythm
- Consistent typography and spacing for breathing animation text elements
- Multilingual interface elements with proper text direction and character encoding support
- Language switching interface that updates all text immediately without page refresh
- Responsive design considerations for different text lengths across languages
