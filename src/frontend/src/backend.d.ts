import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ReportedArea {
    description: string;
    linkedCampaigns: Array<string>;
    timestamp: Time;
    hasMentalHealthSupport: boolean;
    regionName: string;
    reporter: Principal;
    connectivityStatus: string;
}
export type Time = bigint;
export interface ContentFiltered {
    filteredText: string;
    passed: boolean;
}
export interface OutreachCamp {
    id: bigint;
    status: string;
    endDate: Time;
    assignedClinician?: Principal;
    name: string;
    description: string;
    location: string;
    startDate: Time;
    eventType: string;
}
export interface MoodEntry {
    mood: string;
    timestamp: Time;
}
export interface CommunityPost {
    id: bigint;
    moderationFlag: boolean;
    content: string;
    author: Principal;
    anonymous: boolean;
    timestamp: Time;
}
export interface TherapySessionRequest {
    typeRequest: string;
    user: Principal;
    timestamp: Time;
    details: string;
}
export interface Message {
    id: bigint;
    content: string;
    isSupport: boolean;
    recipient: Principal;
    readByRecipient: boolean;
    sender: Principal;
    timestamp: Time;
}
export interface Institution {
    id: bigint;
    region: string;
    infrastructureStatus: string;
    contactInfo: string;
    institutionType: string;
    relatedCampaigns: Array<string>;
    name: string;
    awarenessRating: bigint;
}
export interface CommunityGuidelines {
    acceptableConduct: Array<string>;
    corePrinciples: string;
    postingRules: Array<string>;
    prohibitedBehaviors: Array<string>;
    safetyGuidelines: Array<string>;
}
export interface StressQuizResponse {
    responses: Array<bigint>;
    user: Principal;
    score: bigint;
    timestamp: Time;
}
export interface AreaMonitoring {
    accessLevel: bigint;
    description: string;
    linkedCampaigns: Array<string>;
    timestamp: Time;
    regionName: string;
    connectivityStatus: string;
}
export interface Conversation {
    participants: Array<Principal>;
    messages: Array<Message>;
}
export interface UserProfile {
    age: bigint;
    languagePreference?: Language;
    username: string;
    name: string;
    email: string;
}
export enum Language {
    tamil = "tamil",
    hindi = "hindi",
    marathi = "marathi",
    spanish = "spanish",
    french = "french",
    kannada = "kannada",
    telugu = "telugu",
    english = "english"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAreaMonitoring(regionName: string, connectivityStatus: string, accessLevel: bigint, description: string, linkedCampaigns: Array<string>): Promise<void>;
    addInstitution(name: string, institutionType: string, region: string, contactInfo: string, infrastructureStatus: string, awarenessRating: bigint, relatedCampaigns: Array<string>): Promise<void>;
    addMoodEntry(mood: string): Promise<void>;
    addOutreachCamp(name: string, location: string, eventType: string, startDate: Time, endDate: Time, assignedClinician: Principal | null, status: string, description: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignUserRole(user: Principal, role: string): Promise<void>;
    checkAndAssignAdmin(): Promise<boolean>;
    checkContent(text: string): Promise<ContentFiltered>;
    createCommunityPost(content: string, anonymous: boolean): Promise<void>;
    createTherapySessionRequest(typeRequest: string, details: string): Promise<void>;
    deletePost(postId: bigint): Promise<void>;
    getActiveUsers(): Promise<Array<[Principal, Time]>>;
    getAdminConversations(): Promise<Array<Conversation>>;
    getAllAreaMonitoring(): Promise<Array<AreaMonitoring>>;
    getAllCommunityPosts(): Promise<Array<CommunityPost>>;
    getAllInstitutions(): Promise<Array<Institution>>;
    getAllMessages(): Promise<Array<Message>>;
    getAllOutreachCamps(): Promise<Array<OutreachCamp>>;
    getAllTherapyRequests(): Promise<Array<TherapySessionRequest>>;
    getAppUrl(): Promise<string>;
    getAreaByRegion(regionName: string): Promise<ReportedArea | null>;
    getAreaMonitoringByRegion(regionName: string): Promise<AreaMonitoring | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommunityGuidelines(): Promise<CommunityGuidelines>;
    getDashboardAnalytics(): Promise<{
        activeCampaigns: bigint;
        distressedRegions: bigint;
        totalAreas: bigint;
        totalCamps: bigint;
        upcomingEvents: bigint;
        avgAwarenessRating: bigint;
        lowAccessAreas: bigint;
        totalInstitutions: bigint;
    }>;
    getInstitutionById(id: bigint): Promise<Institution | null>;
    getMessagesByUser(user: Principal): Promise<Array<Message>>;
    getOutreachCampById(id: bigint): Promise<OutreachCamp | null>;
    getReportedAreas(): Promise<Array<ReportedArea>>;
    getUserConversations(user: Principal): Promise<Array<bigint>>;
    getUserLanguagePreference(): Promise<Language | null>;
    getUserMoodEntries(user: Principal): Promise<Array<MoodEntry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserQuizResponse(user: Principal): Promise<StressQuizResponse | null>;
    isCallerAdmin(): Promise<boolean>;
    markMessageAsRead(messageId: bigint): Promise<void>;
    moderatePost(postId: bigint, flag: boolean): Promise<void>;
    reportArea(regionName: string, connectivityStatus: string, description: string, linkedCampaigns: Array<string>, hasMentalHealthSupport: boolean): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(recipient: Principal, content: string, isSupport: boolean): Promise<void>;
    setAppUrl(url: string): Promise<void>;
    setUserLanguagePreference(language: Language): Promise<void>;
    submitStressQuiz(score: bigint, responses: Array<bigint>): Promise<void>;
    updateAreaCampaigns(regionName: string, newCampaigns: Array<string>): Promise<void>;
    updateAreaMonitoring(regionName: string, connectivityStatus: string, accessLevel: bigint, description: string, linkedCampaigns: Array<string>): Promise<void>;
    updateInstitution(id: bigint, name: string, institutionType: string, region: string, contactInfo: string, infrastructureStatus: string, awarenessRating: bigint, relatedCampaigns: Array<string>): Promise<void>;
    updateOutreachCamp(id: bigint, name: string, location: string, eventType: string, startDate: Time, endDate: Time, assignedClinician: Principal | null, status: string, description: string): Promise<void>;
    updateUserActivity(): Promise<void>;
}
