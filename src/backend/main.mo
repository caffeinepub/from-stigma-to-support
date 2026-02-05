import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Iter "mo:core/Iter";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Text "mo:core/Text";
import Set "mo:core/Set";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  var adminExists : Bool = false;
  var firstAdminPrincipal : ?Principal = null;
  var postIdCounter = 0;
  var institutionIdCounter = 0;
  var campIdCounter = 0;
  var messageIdCounter = 0;

  // Data Types
  type Language = {
    #english;
    #hindi;
    #marathi;
    #kannada;
    #tamil;
    #telugu;
    #spanish;
    #french;
  };

  type UserProfile = {
    email : Text;
    name : Text;
    age : Nat;
    username : Text;
    languagePreference : ?Language;
  };

  type CommunityPost = {
    id : Nat;
    content : Text;
    timestamp : Time.Time;
    anonymous : Bool;
    moderationFlag : Bool;
    author : Principal;
  };

  type TherapySessionRequest = {
    user : Principal;
    typeRequest : Text;
    details : Text;
    timestamp : Time.Time;
  };

  type MoodEntry = {
    mood : Text;
    timestamp : Time.Time;
  };

  type StressQuizResponse = {
    user : Principal;
    score : Nat;
    responses : [Nat];
    timestamp : Time.Time;
  };

  // Messaging Types
  type Message = {
    id : Nat;
    sender : Principal;
    recipient : Principal;
    content : Text;
    timestamp : Time.Time;
    readByRecipient : Bool;
    isSupport : Bool;
  };

  type Conversation = {
    participants : [Principal];
    messages : [Message];
  };

  let messages = Map.empty<Nat, Message>();
  let userConversations = Map.empty<Principal, List.List<Nat>>();
  let adminConversations = Map.empty<Nat, Conversation>();

  // Rural Support and Outreach Types
  type ReportedArea = {
    regionName : Text;
    connectivityStatus : Text;
    description : Text;
    linkedCampaigns : [Text];
    reporter : Principal;
    timestamp : Time.Time;
    hasMentalHealthSupport : Bool;
  };

  // Institutional Awareness Mapping Types
  type Institution = {
    id : Nat;
    name : Text;
    institutionType : Text;
    region : Text;
    contactInfo : Text;
    infrastructureStatus : Text;
    awarenessRating : Nat;
    relatedCampaigns : [Text];
  };

  // Rural & Low-Access Area Monitoring Types
  type AreaMonitoring = {
    regionName : Text;
    connectivityStatus : Text;
    accessLevel : Nat;
    description : Text;
    linkedCampaigns : [Text];
    timestamp : Time.Time;
  };

  // Offline Outreach & Intervention Types
  type OutreachCamp = {
    id : Nat;
    name : Text;
    location : Text;
    eventType : Text;
    startDate : Time.Time;
    endDate : Time.Time;
    assignedClinician : ?Principal;
    status : Text;
    description : Text;
  };

  // Storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let communityPosts = Map.empty<Nat, CommunityPost>();
  let therapyRequests = Map.empty<Principal, TherapySessionRequest>();
  let userMoods = Map.empty<Principal, List.List<MoodEntry>>();
  let quizResponses = Map.empty<Principal, StressQuizResponse>();
  let reportedAreas = Map.empty<Text, ReportedArea>();
  let institutions = Map.empty<Nat, Institution>();
  let areaMonitoring = Map.empty<Text, AreaMonitoring>();
  let outreachCamps = Map.empty<Nat, OutreachCamp>();

  var sharedAppUrl : Text = "";
  let activeUsers = Map.empty<Principal, Time.Time>();

  type ContentFiltered = {
    passed : Bool;
    filteredText : Text;
  };

  type CommunityGuidelines = {
    corePrinciples : Text;
    acceptableConduct : [Text];
    prohibitedBehaviors : [Text];
    safetyGuidelines : [Text];
    postingRules : [Text];
  };

  // Language Management (Backend)
  public shared ({ caller }) func setUserLanguagePreference(language : Language) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can set language preference");
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("User profile not found. Please create a profile first.");
      };
      case (?profile) {
        let updatedProfile = {
          email = profile.email;
          name = profile.name;
          age = profile.age;
          username = profile.username;
          languagePreference = ?language;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getUserLanguagePreference() : async ?Language {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get language preference");
    };

    switch (userProfiles.get(caller)) {
      case (null) { null };
      case (?profile) { profile.languagePreference };
    };
  };

  // Admin Check and Role Assignment - SECURED WITH RACE CONDITION PROTECTION
  public shared ({ caller }) func checkAndAssignAdmin() : async Bool {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot become admin");
    };

    if (adminExists) {
      switch (firstAdminPrincipal) {
        case (?adminPrincipal) {
          return Principal.equal(caller, adminPrincipal);
        };
        case (null) {
          return false;
        };
      };
    };

    if (AccessControl.isAdmin(accessControlState, caller)) {
      adminExists := true;
      firstAdminPrincipal := ?caller;
      return true;
    };

    if (not adminExists) {
      adminExists := true;
      firstAdminPrincipal := ?caller;

      AccessControl.assignRole(accessControlState, caller, caller, #admin);
      return true;
    };

    false;
  };

  public shared ({ caller }) func setAppUrl(url : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can set app URL");
    };
    sharedAppUrl := url;
  };

  public query func getAppUrl() : async Text {
    sharedAppUrl;
  };

  // Role Assignment - Admin only
  public shared ({ caller }) func assignUserRole(user : Principal, role : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can assign roles");
    };

    let userRole = switch (role) {
      case ("admin") { #admin };
      case ("user") { #user };
      case ("guest") { #guest };
      case (_) { Runtime.trap("Invalid role type") };
    };

    AccessControl.assignRole(accessControlState, caller, user, userRole);
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not Principal.equal(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    userProfiles.add(caller, profile);
    activeUsers.add(caller, Time.now());
  };

  // Community Post Management
  public shared ({ caller }) func createCommunityPost(content : Text, anonymous : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    let post : CommunityPost = {
      id = postIdCounter;
      content;
      timestamp = Time.now();
      anonymous;
      moderationFlag = false;
      author = caller;
    };

    communityPosts.add(postIdCounter, post);
    postIdCounter += 1;
    activeUsers.add(caller, Time.now());
  };

  public query ({ caller }) func getAllCommunityPosts() : async [CommunityPost] {
    // Allow authenticated users and guests to view community posts
    // This is a public community feature
    communityPosts.values().toArray();
  };

  public shared ({ caller }) func moderatePost(postId : Nat, flag : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can moderate posts");
    };

    switch (communityPosts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let updatedPost = {
          id = post.id;
          content = post.content;
          timestamp = post.timestamp;
          anonymous = post.anonymous;
          moderationFlag = flag;
          author = post.author;
        };
        communityPosts.add(postId, updatedPost);
      };
    };
    activeUsers.add(caller, Time.now());
  };

  public shared ({ caller }) func deletePost(postId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can delete posts");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    switch (communityPosts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        if (not isAdmin) {
          if (not Principal.equal(caller, post.author)) {
            Runtime.trap("Unauthorized: Only the post author or an admin can delete this post");
          };
        };
        communityPosts.remove(postId);
      };
    };
    activeUsers.add(caller, Time.now());
  };

  // Therapy Session Requests
  public shared ({ caller }) func createTherapySessionRequest(typeRequest : Text, details : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can request therapy sessions");
    };

    let request : TherapySessionRequest = {
      user = caller;
      typeRequest;
      details;
      timestamp = Time.now();
    };

    therapyRequests.add(caller, request);
    activeUsers.add(caller, Time.now());
  };

  public query ({ caller }) func getAllTherapyRequests() : async [TherapySessionRequest] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all therapy requests");
    };
    therapyRequests.values().toArray();
  };

  // Mood Tracking
  public shared ({ caller }) func addMoodEntry(mood : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add moods");
    };

    let entry : MoodEntry = {
      mood;
      timestamp = Time.now();
    };

    let updatedMoodList = switch (userMoods.get(caller)) {
      case (null) { List.singleton<MoodEntry>(entry) };
      case (?existingList) {
        let newList = List.fromArray<MoodEntry>([entry]);
        newList.add(entry);
        newList;
      };
    };

    userMoods.add(caller, updatedMoodList);
    activeUsers.add(caller, Time.now());
  };

  public query ({ caller }) func getUserMoodEntries(user : Principal) : async [MoodEntry] {
    if (not Principal.equal(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own mood entries");
    };

    switch (userMoods.get(user)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  // Stress Quiz Responses
  public shared ({ caller }) func submitStressQuiz(score : Nat, responses : [Nat]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can submit quizzes");
    };

    let quiz : StressQuizResponse = {
      user = caller;
      score;
      responses;
      timestamp = Time.now();
    };

    quizResponses.add(caller, quiz);
    activeUsers.add(caller, Time.now());
  };

  public query ({ caller }) func getUserQuizResponse(user : Principal) : async ?StressQuizResponse {
    if (not Principal.equal(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own quiz responses");
    };

    quizResponses.get(user);
  };

  // Content Filtering - Available to users for post validation
  public query ({ caller }) func checkContent(text : Text) : async ContentFiltered {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can check content");
    };

    let badWords = ["badword1", "badword2", "badword3"];
    let containsBad = badWords.any(
      func(word) {
        text.contains(#text word);
      }
    );
    { passed = not containsBad; filteredText = text };
  };

  // Community Guidelines Retrieval - Public access
  public query func getCommunityGuidelines() : async CommunityGuidelines {
    {
      corePrinciples = "Welcome to 'From Stigma to Support'! Our goal is to create a safe, supportive environment centered around academic wellness and mental health.";
      acceptableConduct = [
        "Be respectful and considerate when interacting.",
        "Listen actively and provide constructive feedback.",
        "Share thoughts anonymously and supportively.",
        "Maintain confidentiality and privacy.",
        "Seek assistance from our moderation team if needed.",
      ];
      prohibitedBehaviors = [
        "No hate speech, discrimination, or bullying.",
        "No sharing of harmful or triggering content.",
        "No personal attacks or harassment.",
        "No unauthorized sharing of sensitive information.",
      ];
      safetyGuidelines = [
        "This platform is NOT a substitute for professional help.",
        "For emergencies, please contact local helplines.",
        "Posts may be monitored for safety and well-being.",
        "If you feel unsafe, reach out to moderators or crisis resources.",
      ];
      postingRules = [
        "Use respectful language and avoid inappropriate content.",
        "Stay on topic with mental health and wellness discussions.",
        "No spam, advertisements, or self-promotion.",
        "Violations may result in post removal or account suspension.",
      ];
    };
  };

  // Rural Support and Outreach Module
  public shared ({ caller }) func reportArea(
    regionName : Text,
    connectivityStatus : Text,
    description : Text,
    linkedCampaigns : [Text],
    hasMentalHealthSupport : Bool,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can report areas");
    };

    let area : ReportedArea = {
      regionName;
      connectivityStatus;
      description;
      linkedCampaigns;
      reporter = caller;
      timestamp = Time.now();
      hasMentalHealthSupport;
    };

    reportedAreas.add(regionName, area);
    activeUsers.add(caller, Time.now());
  };

  public query ({ caller }) func getReportedAreas() : async [ReportedArea] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view reported areas");
    };
    reportedAreas.values().toArray();
  };

  public shared ({ caller }) func updateAreaCampaigns(
    regionName : Text,
    newCampaigns : [Text],
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update area campaigns");
    };

    switch (reportedAreas.get(regionName)) {
      case (null) { Runtime.trap("Area not found") };
      case (?area) {
        let updatedArea = {
          regionName = area.regionName;
          connectivityStatus = area.connectivityStatus;
          description = area.description;
          linkedCampaigns = newCampaigns;
          reporter = area.reporter;
          timestamp = area.timestamp;
          hasMentalHealthSupport = area.hasMentalHealthSupport;
        };
        reportedAreas.add(regionName, updatedArea);
      };
    };
    activeUsers.add(caller, Time.now());
  };

  public query ({ caller }) func getAreaByRegion(regionName : Text) : async ?ReportedArea {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access area details");
    };
    reportedAreas.get(regionName);
  };

  // Institutional Awareness Mapping System
  public shared ({ caller }) func addInstitution(
    name : Text,
    institutionType : Text,
    region : Text,
    contactInfo : Text,
    infrastructureStatus : Text,
    awarenessRating : Nat,
    relatedCampaigns : [Text],
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add institutions");
    };

    let institution : Institution = {
      id = institutionIdCounter;
      name;
      institutionType;
      region;
      contactInfo;
      infrastructureStatus;
      awarenessRating;
      relatedCampaigns;
    };

    institutions.add(institutionIdCounter, institution);
    institutionIdCounter += 1;
    activeUsers.add(caller, Time.now());
  };

  public shared ({ caller }) func updateInstitution(
    id : Nat,
    name : Text,
    institutionType : Text,
    region : Text,
    contactInfo : Text,
    infrastructureStatus : Text,
    awarenessRating : Nat,
    relatedCampaigns : [Text],
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update institutions");
    };

    switch (institutions.get(id)) {
      case (null) { Runtime.trap("Institution not found") };
      case (?_) {
        let updatedInstitution = {
          id;
          name;
          institutionType;
          region;
          contactInfo;
          infrastructureStatus;
          awarenessRating;
          relatedCampaigns;
        };
        institutions.add(id, updatedInstitution);
      };
    };
    activeUsers.add(caller, Time.now());
  };

  public query ({ caller }) func getAllInstitutions() : async [Institution] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view institutions");
    };
    institutions.values().toArray();
  };

  public query ({ caller }) func getInstitutionById(id : Nat) : async ?Institution {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access institution details");
    };
    institutions.get(id);
  };

  // Rural & Low-Access Area Monitoring
  public shared ({ caller }) func addAreaMonitoring(
    regionName : Text,
    connectivityStatus : Text,
    accessLevel : Nat,
    description : Text,
    linkedCampaigns : [Text],
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add area monitoring");
    };

    let area : AreaMonitoring = {
      regionName;
      connectivityStatus;
      accessLevel;
      description;
      linkedCampaigns;
      timestamp = Time.now();
    };

    areaMonitoring.add(regionName, area);
    activeUsers.add(caller, Time.now());
  };

  public shared ({ caller }) func updateAreaMonitoring(
    regionName : Text,
    connectivityStatus : Text,
    accessLevel : Nat,
    description : Text,
    linkedCampaigns : [Text],
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update area monitoring");
    };

    switch (areaMonitoring.get(regionName)) {
      case (null) { Runtime.trap("Area not found") };
      case (?_) {
        let updatedArea = {
          regionName;
          connectivityStatus;
          accessLevel;
          description;
          linkedCampaigns;
          timestamp = Time.now();
        };
        areaMonitoring.add(regionName, updatedArea);
      };
    };
    activeUsers.add(caller, Time.now());
  };

  public query ({ caller }) func getAllAreaMonitoring() : async [AreaMonitoring] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view area monitoring");
    };
    areaMonitoring.values().toArray();
  };

  public query ({ caller }) func getAreaMonitoringByRegion(regionName : Text) : async ?AreaMonitoring {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access area monitoring details");
    };
    areaMonitoring.get(regionName);
  };

  // Offline Outreach & Intervention System
  public shared ({ caller }) func addOutreachCamp(
    name : Text,
    location : Text,
    eventType : Text,
    startDate : Time.Time,
    endDate : Time.Time,
    assignedClinician : ?Principal,
    status : Text,
    description : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add outreach camps");
    };

    let camp : OutreachCamp = {
      id = campIdCounter;
      name;
      location;
      eventType;
      startDate;
      endDate;
      assignedClinician;
      status;
      description;
    };

    outreachCamps.add(campIdCounter, camp);
    campIdCounter += 1;
    activeUsers.add(caller, Time.now());
  };

  public shared ({ caller }) func updateOutreachCamp(
    id : Nat,
    name : Text,
    location : Text,
    eventType : Text,
    startDate : Time.Time,
    endDate : Time.Time,
    assignedClinician : ?Principal,
    status : Text,
    description : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update outreach camps");
    };

    switch (outreachCamps.get(id)) {
      case (null) { Runtime.trap("Camp not found") };
      case (?_) {
        let updatedCamp = {
          id;
          name;
          location;
          eventType;
          startDate;
          endDate;
          assignedClinician;
          status;
          description;
        };
        outreachCamps.add(id, updatedCamp);
      };
    };
    activeUsers.add(caller, Time.now());
  };

  public query ({ caller }) func getAllOutreachCamps() : async [OutreachCamp] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view outreach camps");
    };
    outreachCamps.values().toArray();
  };

  public query ({ caller }) func getOutreachCampById(id : Nat) : async ?OutreachCamp {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access outreach camp details");
    };
    outreachCamps.get(id);
  };

  // Active User Tracking
  public shared ({ caller }) func updateUserActivity() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can update activity");
    };
    activeUsers.add(caller, Time.now());
  };

  public query ({ caller }) func getActiveUsers() : async [(Principal, Time.Time)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view active users");
    };
    activeUsers.toArray();
  };

  // Messaging System
  public query ({ caller }) func getUserConversations(user : Principal) : async [Nat] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can access conversations");
    };

    if (not Principal.equal(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own conversations");
    };

    switch (userConversations.get(user)) {
      case (null) { List.empty<Nat>().toArray() };
      case (?list) { list.toArray() };
    };
  };

  public shared ({ caller }) func sendMessage(
    recipient : Principal,
    content : Text,
    isSupport : Bool,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can send messages");
    };

    let message : Message = {
      id = messageIdCounter;
      sender = caller;
      recipient;
      content;
      timestamp = Time.now();
      readByRecipient = false;
      isSupport;
    };

    messages.add(messageIdCounter, message);

    let updateConversations = func(user : Principal) {
      switch (userConversations.get(user)) {
        case (null) {
          let newList = List.empty<Nat>();
          newList.add(messageIdCounter);
          userConversations.add(user, newList);
        };
        case (?existingList) {
          existingList.add(messageIdCounter);
        };
      };
    };

    updateConversations(caller);
    updateConversations(recipient);

    messageIdCounter += 1;
    activeUsers.add(caller, Time.now());
  };

  public query ({ caller }) func getMessagesByUser(user : Principal) : async [Message] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can access messages");
    };

    if (not Principal.equal(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own messages or admin can view all");
    };

    switch (userConversations.get(user)) {
      case (null) { [] };
      case (?messageIds) {
        messageIds.toArray().map(
          func(id) {
            switch (messages.get(id)) {
              case (?msg) { msg };
              case (null) {
                Runtime.trap("Message not found");
              };
            };
          }
        );
      };
    };
  };

  public shared ({ caller }) func markMessageAsRead(messageId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can mark messages as read");
    };

    switch (messages.get(messageId)) {
      case (null) { Runtime.trap("Message not found") };
      case (?msg) {
        if (not Principal.equal(caller, msg.recipient)) {
          Runtime.trap("Unauthorized: Only the recipient can mark a message as read");
        };

        let updatedMessage = {
          id = msg.id;
          sender = msg.sender;
          recipient = msg.recipient;
          content = msg.content;
          timestamp = msg.timestamp;
          readByRecipient = true;
          isSupport = msg.isSupport;
        };
        messages.add(messageId, updatedMessage);
      };
    };
    activeUsers.add(caller, Time.now());
  };

  public query ({ caller }) func getAllMessages() : async [Message] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all messages");
    };
    messages.values().toArray();
  };

  public query ({ caller }) func getAdminConversations() : async [Conversation] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access admin conversations");
    };

    let getAllConversationsIter = adminConversations.values();
    getAllConversationsIter.toArray();
  };

  // Analytics
  public query ({ caller }) func getDashboardAnalytics() : async {
    totalInstitutions : Nat;
    totalAreas : Nat;
    totalCamps : Nat;
    activeCampaigns : Nat;
    avgAwarenessRating : Nat;
    distressedRegions : Nat;
    lowAccessAreas : Nat;
    upcomingEvents : Nat;
  } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access dashboard analytics");
    };

    let institutionList = institutions.toArray();
    let areaList = areaMonitoring.toArray();
    let campList = outreachCamps.toArray();

    let totalInstitutions = institutionList.size();
    let totalAreas = areaList.size();
    let totalCamps = campList.size();

    let activeCampaigns = areaList.filter(
      func((_, area)) {
        area.connectivityStatus == "Active";
      }
    ).size();

    let totalAwarenessRating = institutionList.foldLeft(
      0,
      func(acc, (_, inst)) {
        acc + inst.awarenessRating;
      },
    );
    let avgAwarenessRating = if (totalInstitutions > 0) { totalAwarenessRating / totalInstitutions } else {
      0;
    };

    let distressedRegions = areaList.filter(
      func((_, area)) {
        area.accessLevel < 3;
      }
    ).size();

    let lowAccessAreas = areaList.filter(
      func((_, area)) {
        area.accessLevel == 1;
      }
    ).size();

    let upcomingEvents = campList.filter(
      func((_, camp)) {
        camp.status == "Upcoming";
      }
    ).size();

    {
      totalInstitutions;
      totalAreas;
      totalCamps;
      activeCampaigns;
      avgAwarenessRating;
      distressedRegions;
      lowAccessAreas;
      upcomingEvents;
    };
  };
};
