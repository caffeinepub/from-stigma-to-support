import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, CommunityPost, MoodEntry, StressQuizResponse, CommunityGuidelines, TherapySessionRequest, ReportedArea, Institution, AreaMonitoring, OutreachCamp, Message } from '../backend';
import { Principal } from '@dfinity/principal';

// User Profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Admin Check
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

// Check and Assign Admin - Called once after login
export function useCheckAndAssignAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.checkAndAssignAdmin();
      return result;
    },
    onSuccess: (wasPromoted) => {
      if (wasPromoted) {
        // Invalidate admin status queries to trigger immediate refetch
        queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      }
    },
  });
}

// Role Assignment
export function useAssignUserRole() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignUserRole(user, role);
    },
  });
}

// Community Posts
export function useGetAllCommunityPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<CommunityPost[]>({
    queryKey: ['communityPosts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCommunityPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCommunityPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, anonymous }: { content: string; anonymous: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCommunityPost(content, anonymous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    },
  });
}

export function useCheckContent() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.checkContent(text);
    },
  });
}

// Mood Tracking
export function useGetUserMoodEntries() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<MoodEntry[]>({
    queryKey: ['moodEntries', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getUserMoodEntries(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useAddMoodEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mood: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMoodEntry(mood);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moodEntries'] });
    },
  });
}

// Stress Quiz
export function useGetUserQuizResponse() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<StressQuizResponse | null>({
    queryKey: ['quizResponse', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      return actor.getUserQuizResponse(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSubmitStressQuiz() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ score, responses }: { score: bigint; responses: bigint[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitStressQuiz(score, responses);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizResponse'] });
    },
  });
}

// Community Guidelines
export function useGetCommunityGuidelines() {
  const { actor, isFetching } = useActor();

  return useQuery<CommunityGuidelines>({
    queryKey: ['communityGuidelines'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCommunityGuidelines();
    },
    enabled: !!actor && !isFetching,
  });
}

// Therapy Session Requests
export function useCreateTherapySessionRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ typeRequest, details }: { typeRequest: string; details: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTherapySessionRequest(typeRequest, details);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapyRequests'] });
    },
  });
}

// Rural Support and Outreach
export function useGetReportedAreas() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<ReportedArea[]>({
    queryKey: ['reportedAreas'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getReportedAreas();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useReportArea() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      regionName,
      connectivityStatus,
      description,
      linkedCampaigns,
      hasMentalHealthSupport,
    }: {
      regionName: string;
      connectivityStatus: string;
      description: string;
      linkedCampaigns: string[];
      hasMentalHealthSupport: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reportArea(regionName, connectivityStatus, description, linkedCampaigns, hasMentalHealthSupport);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportedAreas'] });
    },
  });
}

export function useUpdateAreaCampaigns() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ regionName, newCampaigns }: { regionName: string; newCampaigns: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAreaCampaigns(regionName, newCampaigns);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportedAreas'] });
    },
  });
}

// Institutional Awareness Mapping
export function useGetAllInstitutions() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Institution[]>({
    queryKey: ['institutions'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getAllInstitutions();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useAddInstitution() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      institutionType,
      region,
      contactInfo,
      infrastructureStatus,
      awarenessRating,
      relatedCampaigns,
    }: {
      name: string;
      institutionType: string;
      region: string;
      contactInfo: string;
      infrastructureStatus: string;
      awarenessRating: bigint;
      relatedCampaigns: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addInstitution(name, institutionType, region, contactInfo, infrastructureStatus, awarenessRating, relatedCampaigns);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
    },
  });
}

export function useUpdateInstitution() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      institutionType,
      region,
      contactInfo,
      infrastructureStatus,
      awarenessRating,
      relatedCampaigns,
    }: {
      id: bigint;
      name: string;
      institutionType: string;
      region: string;
      contactInfo: string;
      infrastructureStatus: string;
      awarenessRating: bigint;
      relatedCampaigns: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateInstitution(id, name, institutionType, region, contactInfo, infrastructureStatus, awarenessRating, relatedCampaigns);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
    },
  });
}

// Rural & Low-Access Area Monitoring
export function useGetAllAreaMonitoring() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<AreaMonitoring[]>({
    queryKey: ['areaMonitoring'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getAllAreaMonitoring();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useAddAreaMonitoring() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      regionName,
      connectivityStatus,
      accessLevel,
      description,
      linkedCampaigns,
    }: {
      regionName: string;
      connectivityStatus: string;
      accessLevel: bigint;
      description: string;
      linkedCampaigns: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addAreaMonitoring(regionName, connectivityStatus, accessLevel, description, linkedCampaigns);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areaMonitoring'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
    },
  });
}

export function useUpdateAreaMonitoring() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      regionName,
      connectivityStatus,
      accessLevel,
      description,
      linkedCampaigns,
    }: {
      regionName: string;
      connectivityStatus: string;
      accessLevel: bigint;
      description: string;
      linkedCampaigns: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAreaMonitoring(regionName, connectivityStatus, accessLevel, description, linkedCampaigns);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areaMonitoring'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
    },
  });
}

// Offline Outreach & Intervention
export function useGetAllOutreachCamps() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<OutreachCamp[]>({
    queryKey: ['outreachCamps'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getAllOutreachCamps();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useAddOutreachCamp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      location,
      eventType,
      startDate,
      endDate,
      assignedClinician,
      status,
      description,
    }: {
      name: string;
      location: string;
      eventType: string;
      startDate: bigint;
      endDate: bigint;
      assignedClinician: Principal | null;
      status: string;
      description: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addOutreachCamp(name, location, eventType, startDate, endDate, assignedClinician, status, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outreachCamps'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
    },
  });
}

export function useUpdateOutreachCamp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      location,
      eventType,
      startDate,
      endDate,
      assignedClinician,
      status,
      description,
    }: {
      id: bigint;
      name: string;
      location: string;
      eventType: string;
      startDate: bigint;
      endDate: bigint;
      assignedClinician: Principal | null;
      status: string;
      description: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOutreachCamp(id, name, location, eventType, startDate, endDate, assignedClinician, status, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outreachCamps'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
    },
  });
}

// Dashboard Analytics
export function useGetDashboardAnalytics() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['dashboardAnalytics'],
    queryFn: async () => {
      if (!actor || !identity) return null;
      return actor.getDashboardAnalytics();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// Active Users
export function useGetActiveUsers() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Array<[Principal, bigint]>>({
    queryKey: ['activeUsers'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getActiveUsers();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
}

export function useUpdateUserActivity() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUserActivity();
    },
  });
}

// Messaging System
export function useGetMessagesByUser() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Message[]>({
    queryKey: ['messages', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getMessagesByUser(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time messaging
  });
}

export function useGetAllMessages() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Message[]>({
    queryKey: ['allMessages'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getAllMessages();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipient, content, isSupport }: { recipient: Principal; content: string; isSupport: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(recipient, content, isSupport);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['allMessages'] });
    },
  });
}

export function useMarkMessageAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markMessageAsRead(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['allMessages'] });
    },
  });
}

