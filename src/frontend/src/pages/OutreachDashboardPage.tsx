import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetReportedAreas,
  useReportArea,
  useUpdateAreaCampaigns,
  useIsCallerAdmin,
  useGetAllInstitutions,
  useAddInstitution,
  useUpdateInstitution,
  useGetAllAreaMonitoring,
  useAddAreaMonitoring,
  useUpdateAreaMonitoring,
  useGetAllOutreachCamps,
  useAddOutreachCamp,
  useUpdateOutreachCamp,
  useGetDashboardAnalytics,
  useAssignUserRole,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, List, Plus, Edit, Wifi, WifiOff, Heart, AlertCircle, Shield, Building2, TrendingUp, Calendar, Users, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { ReportedArea, Institution, AreaMonitoring, OutreachCamp } from '../backend';
import { Principal } from '@dfinity/principal';

// Type declaration for Network Information API
interface NetworkInformation extends EventTarget {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

export default function OutreachDashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: areas = [], isLoading: areasLoading } = useGetReportedAreas();
  const { data: institutions = [], isLoading: institutionsLoading } = useGetAllInstitutions();
  const { data: areaMonitoring = [], isLoading: monitoringLoading } = useGetAllAreaMonitoring();
  const { data: camps = [], isLoading: campsLoading } = useGetAllOutreachCamps();
  const { data: analytics, isLoading: analyticsLoading } = useGetDashboardAnalytics();

  const reportAreaMutation = useReportArea();
  const updateCampaignsMutation = useUpdateAreaCampaigns();
  const addInstitutionMutation = useAddInstitution();
  const updateInstitutionMutation = useUpdateInstitution();
  const addAreaMonitoringMutation = useAddAreaMonitoring();
  const updateAreaMonitoringMutation = useUpdateAreaMonitoring();
  const addCampMutation = useAddOutreachCamp();
  const updateCampMutation = useUpdateOutreachCamp();
  const assignRoleMutation = useAssignUserRole();

  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [institutionDialogOpen, setInstitutionDialogOpen] = useState(false);
  const [editInstitutionDialogOpen, setEditInstitutionDialogOpen] = useState(false);
  const [monitoringDialogOpen, setMonitoringDialogOpen] = useState(false);
  const [editMonitoringDialogOpen, setEditMonitoringDialogOpen] = useState(false);
  const [campDialogOpen, setCampDialogOpen] = useState(false);
  const [editCampDialogOpen, setEditCampDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<ReportedArea | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [selectedMonitoring, setSelectedMonitoring] = useState<AreaMonitoring | null>(null);
  const [selectedCamp, setSelectedCamp] = useState<OutreachCamp | null>(null);
  const [networkStrength, setNetworkStrength] = useState<'good' | 'poor'>('good');

  // Form states for reporting
  const [regionName, setRegionName] = useState('');
  const [connectivityStatus, setConnectivityStatus] = useState('');
  const [description, setDescription] = useState('');
  const [linkedCampaigns, setLinkedCampaigns] = useState('');
  const [hasMentalHealthSupport, setHasMentalHealthSupport] = useState(false);
  const [editCampaigns, setEditCampaigns] = useState('');

  // Institution form states
  const [instName, setInstName] = useState('');
  const [instType, setInstType] = useState('');
  const [instRegion, setInstRegion] = useState('');
  const [instContact, setInstContact] = useState('');
  const [instInfrastructure, setInstInfrastructure] = useState('');
  const [instAwareness, setInstAwareness] = useState('3');
  const [instCampaigns, setInstCampaigns] = useState('');

  // Area monitoring form states
  const [monRegion, setMonRegion] = useState('');
  const [monConnectivity, setMonConnectivity] = useState('');
  const [monAccessLevel, setMonAccessLevel] = useState('3');
  const [monDescription, setMonDescription] = useState('');
  const [monCampaigns, setMonCampaigns] = useState('');

  // Camp form states
  const [campName, setCampName] = useState('');
  const [campLocation, setCampLocation] = useState('');
  const [campEventType, setCampEventType] = useState('');
  const [campStartDate, setCampStartDate] = useState('');
  const [campEndDate, setCampEndDate] = useState('');
  const [campClinician, setCampClinician] = useState('');
  const [campStatus, setCampStatus] = useState('Upcoming');
  const [campDescription, setCampDescription] = useState('');

  // Role assignment form states
  const [rolePrincipal, setRolePrincipal] = useState('');
  const [roleType, setRoleType] = useState('user');

  const isAuthenticated = !!identity;

  // Network strength detection
  useEffect(() => {
    const checkNetwork = () => {
      const nav = navigator as NavigatorWithConnection;
      if (nav.connection) {
        const effectiveType = nav.connection.effectiveType;
        setNetworkStrength(effectiveType === 'slow-2g' || effectiveType === '2g' ? 'poor' : 'good');
      }
    };

    checkNetwork();
    const nav = navigator as NavigatorWithConnection;
    if (nav.connection) {
      nav.connection.addEventListener('change', checkNetwork);
      return () => nav.connection?.removeEventListener('change', checkNetwork);
    }
  }, []);

  useEffect(() => {
    if (networkStrength === 'poor' && viewMode === 'map') {
      setViewMode('list');
      toast.info('Switched to list view due to low network strength');
    }
  }, [networkStrength, viewMode]);

  const handleReportArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to report an area');
      return;
    }

    try {
      const campaigns = linkedCampaigns.split(',').map(c => c.trim()).filter(c => c);
      await reportAreaMutation.mutateAsync({
        regionName,
        connectivityStatus,
        description,
        linkedCampaigns: campaigns,
        hasMentalHealthSupport,
      });
      toast.success('Area reported successfully');
      setReportDialogOpen(false);
      setRegionName('');
      setConnectivityStatus('');
      setDescription('');
      setLinkedCampaigns('');
      setHasMentalHealthSupport(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to report area');
    }
  };

  const handleUpdateCampaigns = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArea) return;

    try {
      const campaigns = editCampaigns.split(',').map(c => c.trim()).filter(c => c);
      await updateCampaignsMutation.mutateAsync({
        regionName: selectedArea.regionName,
        newCampaigns: campaigns,
      });
      toast.success('Campaigns updated successfully');
      setEditDialogOpen(false);
      setSelectedArea(null);
      setEditCampaigns('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update campaigns');
    }
  };

  const handleAddInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const campaigns = instCampaigns.split(',').map(c => c.trim()).filter(c => c);
      await addInstitutionMutation.mutateAsync({
        name: instName,
        institutionType: instType,
        region: instRegion,
        contactInfo: instContact,
        infrastructureStatus: instInfrastructure,
        awarenessRating: BigInt(instAwareness),
        relatedCampaigns: campaigns,
      });
      toast.success('Institution added successfully');
      setInstitutionDialogOpen(false);
      setInstName('');
      setInstType('');
      setInstRegion('');
      setInstContact('');
      setInstInfrastructure('');
      setInstAwareness('3');
      setInstCampaigns('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add institution');
    }
  };

  const handleUpdateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstitution) return;

    try {
      const campaigns = instCampaigns.split(',').map(c => c.trim()).filter(c => c);
      await updateInstitutionMutation.mutateAsync({
        id: selectedInstitution.id,
        name: instName,
        institutionType: instType,
        region: instRegion,
        contactInfo: instContact,
        infrastructureStatus: instInfrastructure,
        awarenessRating: BigInt(instAwareness),
        relatedCampaigns: campaigns,
      });
      toast.success('Institution updated successfully');
      setEditInstitutionDialogOpen(false);
      setSelectedInstitution(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update institution');
    }
  };

  const handleAddAreaMonitoring = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const campaigns = monCampaigns.split(',').map(c => c.trim()).filter(c => c);
      await addAreaMonitoringMutation.mutateAsync({
        regionName: monRegion,
        connectivityStatus: monConnectivity,
        accessLevel: BigInt(monAccessLevel),
        description: monDescription,
        linkedCampaigns: campaigns,
      });
      toast.success('Area monitoring added successfully');
      setMonitoringDialogOpen(false);
      setMonRegion('');
      setMonConnectivity('');
      setMonAccessLevel('3');
      setMonDescription('');
      setMonCampaigns('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add area monitoring');
    }
  };

  const handleUpdateAreaMonitoring = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMonitoring) return;

    try {
      const campaigns = monCampaigns.split(',').map(c => c.trim()).filter(c => c);
      await updateAreaMonitoringMutation.mutateAsync({
        regionName: selectedMonitoring.regionName,
        connectivityStatus: monConnectivity,
        accessLevel: BigInt(monAccessLevel),
        description: monDescription,
        linkedCampaigns: campaigns,
      });
      toast.success('Area monitoring updated successfully');
      setEditMonitoringDialogOpen(false);
      setSelectedMonitoring(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update area monitoring');
    }
  };

  const handleAddCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startDate = new Date(campStartDate).getTime() * 1000000;
      const endDate = new Date(campEndDate).getTime() * 1000000;
      const clinician = campClinician ? Principal.fromText(campClinician) : null;

      await addCampMutation.mutateAsync({
        name: campName,
        location: campLocation,
        eventType: campEventType,
        startDate: BigInt(startDate),
        endDate: BigInt(endDate),
        assignedClinician: clinician,
        status: campStatus,
        description: campDescription,
      });
      toast.success('Outreach camp added successfully');
      setCampDialogOpen(false);
      setCampName('');
      setCampLocation('');
      setCampEventType('');
      setCampStartDate('');
      setCampEndDate('');
      setCampClinician('');
      setCampStatus('Upcoming');
      setCampDescription('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add camp');
    }
  };

  const handleUpdateCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCamp) return;

    try {
      const startDate = new Date(campStartDate).getTime() * 1000000;
      const endDate = new Date(campEndDate).getTime() * 1000000;
      const clinician = campClinician ? Principal.fromText(campClinician) : null;

      await updateCampMutation.mutateAsync({
        id: selectedCamp.id,
        name: campName,
        location: campLocation,
        eventType: campEventType,
        startDate: BigInt(startDate),
        endDate: BigInt(endDate),
        assignedClinician: clinician,
        status: campStatus,
        description: campDescription,
      });
      toast.success('Outreach camp updated successfully');
      setEditCampDialogOpen(false);
      setSelectedCamp(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update camp');
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const principal = Principal.fromText(rolePrincipal);
      await assignRoleMutation.mutateAsync({
        user: principal,
        role: roleType,
      });
      toast.success(`Role ${roleType} assigned successfully`);
      setRoleDialogOpen(false);
      setRolePrincipal('');
      setRoleType('user');
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign role');
    }
  };

  const openEditDialog = (area: ReportedArea) => {
    setSelectedArea(area);
    setEditCampaigns(area.linkedCampaigns.join(', '));
    setEditDialogOpen(true);
  };

  const openEditInstitutionDialog = (inst: Institution) => {
    setSelectedInstitution(inst);
    setInstName(inst.name);
    setInstType(inst.institutionType);
    setInstRegion(inst.region);
    setInstContact(inst.contactInfo);
    setInstInfrastructure(inst.infrastructureStatus);
    setInstAwareness(inst.awarenessRating.toString());
    setInstCampaigns(inst.relatedCampaigns.join(', '));
    setEditInstitutionDialogOpen(true);
  };

  const openEditMonitoringDialog = (mon: AreaMonitoring) => {
    setSelectedMonitoring(mon);
    setMonRegion(mon.regionName);
    setMonConnectivity(mon.connectivityStatus);
    setMonAccessLevel(mon.accessLevel.toString());
    setMonDescription(mon.description);
    setMonCampaigns(mon.linkedCampaigns.join(', '));
    setEditMonitoringDialogOpen(true);
  };

  const openEditCampDialog = (camp: OutreachCamp) => {
    setSelectedCamp(camp);
    setCampName(camp.name);
    setCampLocation(camp.location);
    setCampEventType(camp.eventType);
    setCampStartDate(new Date(Number(camp.startDate) / 1000000).toISOString().split('T')[0]);
    setCampEndDate(new Date(Number(camp.endDate) / 1000000).toISOString().split('T')[0]);
    setCampClinician(camp.assignedClinician ? camp.assignedClinician.toString() : '');
    setCampStatus(camp.status);
    setCampDescription(camp.description);
    setEditCampDialogOpen(true);
  };

  const getInstitutionIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('hospital')) return '/assets/generated/hospital-icon.dim_64x64.png';
    if (lowerType.includes('clinic')) return '/assets/generated/clinic-icon.dim_64x64.png';
    if (lowerType.includes('college') || lowerType.includes('educational')) return '/assets/generated/college-icon.dim_64x64.png';
    if (lowerType.includes('training')) return '/assets/generated/training-institute-icon.dim_64x64.png';
    if (lowerType.includes('community')) return '/assets/generated/community-center-icon.dim_64x64.png';
    return '/assets/generated/hospital-icon.dim_64x64.png';
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Rural Support and Outreach
            </CardTitle>
            <CardDescription>Please login to access the outreach dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This module allows users to report rural areas needing mental health support and admins to manage outreach campaigns.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (adminLoading || areasLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Admin Access Required
            </CardTitle>
            <CardDescription>This dashboard is only accessible to administrators</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need admin privileges to access the outreach dashboard. Please contact an administrator.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative mb-8 rounded-2xl overflow-hidden">
        <img
          src="/assets/generated/rural-outreach-hero.dim_800x400.png"
          alt="Rural Outreach"
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/80 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
              <Shield className="w-10 h-10" />
              Admin Outreach Dashboard
            </h1>
            <p className="text-lg">Comprehensive management for rural mental health support</p>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          ✅ Admin Mode Activated — Full Outreach Dashboard Access Granted
        </AlertDescription>
      </Alert>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-6">
          <TabsTrigger value="overview">
            <Activity className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="institutions">
            <Building2 className="w-4 h-4 mr-2" />
            Institutions
          </TabsTrigger>
          <TabsTrigger value="rural">
            <MapPin className="w-4 h-4 mr-2" />
            Rural Areas
          </TabsTrigger>
          <TabsTrigger value="camps">
            <Calendar className="w-4 h-4 mr-2" />
            Camps
          </TabsTrigger>
          <TabsTrigger value="intelligence">
            <TrendingUp className="w-4 h-4 mr-2" />
            Intelligence
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Institutions</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics ? Number(analytics.totalInstitutions) : 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monitored Areas</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics ? Number(analytics.totalAreas) : 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Camps</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics ? Number(analytics.totalCamps) : 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Distressed Regions</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{analytics ? Number(analytics.distressedRegions) : 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage users and system settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="outline">
                      <Users className="w-4 h-4 mr-2" />
                      Assign User Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign User Role</DialogTitle>
                      <DialogDescription>Assign admin, moderator, or clinician roles to users</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAssignRole} className="space-y-4">
                      <div>
                        <Label htmlFor="rolePrincipal">User Principal ID *</Label>
                        <Input
                          id="rolePrincipal"
                          value={rolePrincipal}
                          onChange={(e) => setRolePrincipal(e.target.value)}
                          placeholder="Enter principal ID"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="roleType">Role *</Label>
                        <Select value={roleType} onValueChange={setRoleType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="guest">Guest</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setRoleDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={assignRoleMutation.isPending}>
                          {assignRoleMutation.isPending ? 'Assigning...' : 'Assign Role'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates across all modules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{institutions.length} Institutions</Badge>
                    <span className="text-muted-foreground">registered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{areaMonitoring.length} Areas</Badge>
                    <span className="text-muted-foreground">monitored</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{camps.length} Camps</Badge>
                    <span className="text-muted-foreground">scheduled</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Institutions Tab */}
        <TabsContent value="institutions" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Institutional Awareness Mapping</h2>
              <p className="text-muted-foreground">Track institutions needing mental health partnerships</p>
            </div>
            <Dialog open={institutionDialogOpen} onOpenChange={setInstitutionDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Institution
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Institution</DialogTitle>
                  <DialogDescription>Register a new institution for mental health outreach</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddInstitution} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="instName">Institution Name *</Label>
                      <Input
                        id="instName"
                        value={instName}
                        onChange={(e) => setInstName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="instType">Type *</Label>
                      <Select value={instType} onValueChange={setInstType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hospital">Hospital</SelectItem>
                          <SelectItem value="Clinic">Clinic</SelectItem>
                          <SelectItem value="College">College</SelectItem>
                          <SelectItem value="Educational Institution">Educational Institution</SelectItem>
                          <SelectItem value="Training Institute">Training Institute</SelectItem>
                          <SelectItem value="Community Center">Community Center</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="instRegion">Region *</Label>
                      <Input
                        id="instRegion"
                        value={instRegion}
                        onChange={(e) => setInstRegion(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="instContact">Contact Info *</Label>
                      <Input
                        id="instContact"
                        value={instContact}
                        onChange={(e) => setInstContact(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="instInfrastructure">Infrastructure Status *</Label>
                    <Input
                      id="instInfrastructure"
                      value={instInfrastructure}
                      onChange={(e) => setInstInfrastructure(e.target.value)}
                      placeholder="e.g., Good, Needs Improvement"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="instAwareness">Awareness Rating (1-5) *</Label>
                    <Select value={instAwareness} onValueChange={setInstAwareness}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Very Low</SelectItem>
                        <SelectItem value="2">2 - Low</SelectItem>
                        <SelectItem value="3">3 - Medium</SelectItem>
                        <SelectItem value="4">4 - High</SelectItem>
                        <SelectItem value="5">5 - Very High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="instCampaigns">Related Campaigns (comma-separated)</Label>
                    <Input
                      id="instCampaigns"
                      value={instCampaigns}
                      onChange={(e) => setInstCampaigns(e.target.value)}
                      placeholder="e.g., Campus Wellness 2025"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setInstitutionDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addInstitutionMutation.isPending}>
                      {addInstitutionMutation.isPending ? 'Adding...' : 'Add Institution'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {institutions.map((inst) => (
              <Card key={Number(inst.id)} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <img
                        src={getInstitutionIcon(inst.institutionType)}
                        alt={inst.institutionType}
                        className="w-12 h-12"
                      />
                      <div className="flex-1">
                        <CardTitle className="text-lg">{inst.name}</CardTitle>
                        <CardDescription>{inst.institutionType}</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditInstitutionDialog(inst)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{inst.region}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Contact:</span>
                    <span>{inst.contactInfo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Awareness:</span>
                    <Badge variant={Number(inst.awarenessRating) >= 4 ? 'default' : 'destructive'}>
                      {Number(inst.awarenessRating)}/5
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Infrastructure:</span>
                    <Badge variant="outline">{inst.infrastructureStatus}</Badge>
                  </div>
                  {inst.relatedCampaigns.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs font-semibold mb-1">Campaigns:</p>
                      <div className="flex flex-wrap gap-1">
                        {inst.relatedCampaigns.map((campaign, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {campaign}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {institutions.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Building2 className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-muted-foreground">No institutions registered yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Rural Areas Tab */}
        <TabsContent value="rural" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Rural & Low-Access Area Monitoring</h2>
              <p className="text-muted-foreground">Track digitally disconnected and underserved regions</p>
            </div>
            <Dialog open={monitoringDialogOpen} onOpenChange={setMonitoringDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Area
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Area Monitoring</DialogTitle>
                  <DialogDescription>Register a new area for monitoring and support</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddAreaMonitoring} className="space-y-4">
                  <div>
                    <Label htmlFor="monRegion">Region Name *</Label>
                    <Input
                      id="monRegion"
                      value={monRegion}
                      onChange={(e) => setMonRegion(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="monConnectivity">Connectivity Status *</Label>
                    <Input
                      id="monConnectivity"
                      value={monConnectivity}
                      onChange={(e) => setMonConnectivity(e.target.value)}
                      placeholder="e.g., Poor, No Internet"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="monAccessLevel">Access Level (1-5) *</Label>
                    <Select value={monAccessLevel} onValueChange={setMonAccessLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Very Low</SelectItem>
                        <SelectItem value="2">2 - Low</SelectItem>
                        <SelectItem value="3">3 - Medium</SelectItem>
                        <SelectItem value="4">4 - High</SelectItem>
                        <SelectItem value="5">5 - Very High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="monDescription">Description *</Label>
                    <Textarea
                      id="monDescription"
                      value={monDescription}
                      onChange={(e) => setMonDescription(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="monCampaigns">Linked Campaigns (comma-separated)</Label>
                    <Input
                      id="monCampaigns"
                      value={monCampaigns}
                      onChange={(e) => setMonCampaigns(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setMonitoringDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addAreaMonitoringMutation.isPending}>
                      {addAreaMonitoringMutation.isPending ? 'Adding...' : 'Add Area'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Heatmap Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Access Level Heatmap</CardTitle>
              <CardDescription>Visual representation of area access levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gradient-to-br from-red-100 via-yellow-100 to-green-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8 min-h-[400px]">
                <img
                  src="/assets/generated/heatmap-overlay-transparent.dim_200x200.png"
                  alt="Heatmap overlay"
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
                <div className="relative grid grid-cols-6 grid-rows-4 gap-4 h-full">
                  {areaMonitoring.slice(0, 24).map((area, index) => {
                    const accessLevel = Number(area.accessLevel);
                    const color = accessLevel <= 2 ? 'bg-red-500' : accessLevel === 3 ? 'bg-yellow-500' : 'bg-green-500';
                    return (
                      <div
                        key={area.regionName}
                        className={`${color} rounded-full w-8 h-8 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-110 transition-transform`}
                        title={`${area.regionName}: Level ${accessLevel}`}
                      >
                        {accessLevel}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span>Low Access (1-2)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span>Medium (3)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>High Access (4-5)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {areaMonitoring.map((area) => (
              <Card key={area.regionName} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        {area.regionName}
                      </CardTitle>
                      <CardDescription>
                        {new Date(Number(area.timestamp) / 1000000).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditMonitoringDialog(area)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    {Number(area.accessLevel) <= 2 ? (
                      <>
                        <WifiOff className="w-4 h-4 text-red-500" />
                        <Badge variant="destructive">Access Level: {Number(area.accessLevel)}</Badge>
                      </>
                    ) : (
                      <>
                        <Wifi className="w-4 h-4 text-green-500" />
                        <Badge variant="secondary">Access Level: {Number(area.accessLevel)}</Badge>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{area.connectivityStatus}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{area.description}</p>
                  {area.linkedCampaigns.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold">Campaigns:</p>
                      <div className="flex flex-wrap gap-1">
                        {area.linkedCampaigns.map((campaign, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {campaign}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {areaMonitoring.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <MapPin className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-muted-foreground">No areas monitored yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Camps Tab */}
        <TabsContent value="camps" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Offline Outreach & Intervention</h2>
              <p className="text-muted-foreground">Manage mental health camps and awareness events</p>
            </div>
            <Dialog open={campDialogOpen} onOpenChange={setCampDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Camp
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Outreach Camp</DialogTitle>
                  <DialogDescription>Schedule a new mental health camp or awareness event</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddCamp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="campName">Camp Name *</Label>
                      <Input
                        id="campName"
                        value={campName}
                        onChange={(e) => setCampName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="campLocation">Location *</Label>
                      <Input
                        id="campLocation"
                        value={campLocation}
                        onChange={(e) => setCampLocation(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="campEventType">Event Type *</Label>
                      <Select value={campEventType} onValueChange={setCampEventType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Wellness Camp">Wellness Camp</SelectItem>
                          <SelectItem value="Awareness Drive">Awareness Drive</SelectItem>
                          <SelectItem value="Fair">Fair</SelectItem>
                          <SelectItem value="Festival">Festival</SelectItem>
                          <SelectItem value="Community Gathering">Community Gathering</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="campStatus">Status *</Label>
                      <Select value={campStatus} onValueChange={setCampStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Upcoming">Upcoming</SelectItem>
                          <SelectItem value="Ongoing">Ongoing</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="campStartDate">Start Date *</Label>
                      <Input
                        id="campStartDate"
                        type="date"
                        value={campStartDate}
                        onChange={(e) => setCampStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="campEndDate">End Date *</Label>
                      <Input
                        id="campEndDate"
                        type="date"
                        value={campEndDate}
                        onChange={(e) => setCampEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="campClinician">Assigned Clinician (Principal ID)</Label>
                    <Input
                      id="campClinician"
                      value={campClinician}
                      onChange={(e) => setCampClinician(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="campDescription">Description *</Label>
                    <Textarea
                      id="campDescription"
                      value={campDescription}
                      onChange={(e) => setCampDescription(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setCampDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addCampMutation.isPending}>
                      {addCampMutation.isPending ? 'Adding...' : 'Add Camp'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {camps.map((camp) => (
              <Card key={Number(camp.id)} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <img
                        src="/assets/generated/awareness-camp.dim_64x64.png"
                        alt="Camp"
                        className="w-12 h-12"
                      />
                      <div className="flex-1">
                        <CardTitle className="text-lg">{camp.name}</CardTitle>
                        <CardDescription>{camp.eventType}</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditCampDialog(camp)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{camp.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {new Date(Number(camp.startDate) / 1000000).toLocaleDateString()} -{' '}
                      {new Date(Number(camp.endDate) / 1000000).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        camp.status === 'Ongoing'
                          ? 'default'
                          : camp.status === 'Upcoming'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {camp.status}
                    </Badge>
                  </div>
                  {camp.assignedClinician && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs truncate">Clinician assigned</span>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2 pt-2">{camp.description}</p>
                </CardContent>
              </Card>
            ))}

            {camps.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Calendar className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-muted-foreground">No camps scheduled yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Intelligence Tab */}
        <TabsContent value="intelligence" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Admin Intelligence Dashboard</h2>
            <p className="text-muted-foreground">Analytics, insights, and recommendations</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <img src="/assets/generated/analytics-dashboard.dim_400x300.png" alt="Analytics" className="w-8 h-8" />
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Campaigns</span>
                  <Badge variant="default">{analytics ? Number(analytics.activeCampaigns) : 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Awareness Rating</span>
                  <Badge variant="secondary">{analytics ? Number(analytics.avgAwarenessRating) : 0}/5</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Low Access Areas</span>
                  <Badge variant="destructive">{analytics ? Number(analytics.lowAccessAreas) : 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Upcoming Events</span>
                  <Badge variant="outline">{analytics ? Number(analytics.upcomingEvents) : 0}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Alert System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics && Number(analytics.distressedRegions) > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {Number(analytics.distressedRegions)} distressed regions detected requiring immediate attention
                    </AlertDescription>
                  </Alert>
                )}
                {analytics && Number(analytics.lowAccessAreas) > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {Number(analytics.lowAccessAreas)} areas with very low access levels need intervention
                    </AlertDescription>
                  </Alert>
                )}
                {analytics && Number(analytics.distressedRegions) === 0 && Number(analytics.lowAccessAreas) === 0 && (
                  <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      No critical alerts at this time
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <img src="/assets/generated/recommendation-card.dim_300x200.png" alt="Recommendations" className="w-8 h-8" />
                Recommendations
              </CardTitle>
              <CardDescription>AI-powered suggestions for offline interventions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics && Number(analytics.distressedRegions) > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Priority Action Required</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Schedule wellness camps in {Number(analytics.distressedRegions)} distressed regions. Consider mobile clinics for areas with access level below 2.
                  </p>
                </div>
              )}
              {institutions.length > 0 && institutions.filter(i => Number(i.awarenessRating) < 3).length > 0 && (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Institutional Outreach</h4>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    {institutions.filter(i => Number(i.awarenessRating) < 3).length} institutions have low awareness ratings. Recommend partnership programs and training sessions.
                  </p>
                </div>
              )}
              {analytics && Number(analytics.upcomingEvents) > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Event Coordination</h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    {Number(analytics.upcomingEvents)} upcoming events scheduled. Ensure clinician assignments and resource allocation are complete.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regional Coverage Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Institutional Coverage</span>
                    <span className="font-semibold">{institutions.length} registered</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${Math.min((institutions.length / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Area Monitoring</span>
                    <span className="font-semibold">{areaMonitoring.length} areas</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min((areaMonitoring.length / 30) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Active Interventions</span>
                    <span className="font-semibold">{camps.filter(c => c.status === 'Ongoing').length} camps</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      style={{ width: `${Math.min((camps.filter(c => c.status === 'Ongoing').length / 20) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialogs */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Campaigns</DialogTitle>
            <DialogDescription>Edit the linked campaigns for {selectedArea?.regionName}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCampaigns} className="space-y-4">
            <div>
              <Label htmlFor="editCampaigns">Campaigns (comma-separated)</Label>
              <Textarea
                id="editCampaigns"
                value={editCampaigns}
                onChange={(e) => setEditCampaigns(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateCampaignsMutation.isPending}>
                {updateCampaignsMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editInstitutionDialogOpen} onOpenChange={setEditInstitutionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Institution</DialogTitle>
            <DialogDescription>Update institution information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateInstitution} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editInstName">Institution Name *</Label>
                <Input
                  id="editInstName"
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editInstType">Type *</Label>
                <Select value={instType} onValueChange={setInstType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hospital">Hospital</SelectItem>
                    <SelectItem value="Clinic">Clinic</SelectItem>
                    <SelectItem value="College">College</SelectItem>
                    <SelectItem value="Educational Institution">Educational Institution</SelectItem>
                    <SelectItem value="Training Institute">Training Institute</SelectItem>
                    <SelectItem value="Community Center">Community Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editInstRegion">Region *</Label>
                <Input
                  id="editInstRegion"
                  value={instRegion}
                  onChange={(e) => setInstRegion(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editInstContact">Contact Info *</Label>
                <Input
                  id="editInstContact"
                  value={instContact}
                  onChange={(e) => setInstContact(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editInstInfrastructure">Infrastructure Status *</Label>
              <Input
                id="editInstInfrastructure"
                value={instInfrastructure}
                onChange={(e) => setInstInfrastructure(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="editInstAwareness">Awareness Rating (1-5) *</Label>
              <Select value={instAwareness} onValueChange={setInstAwareness}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Very Low</SelectItem>
                  <SelectItem value="2">2 - Low</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="5">5 - Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editInstCampaigns">Related Campaigns (comma-separated)</Label>
              <Input
                id="editInstCampaigns"
                value={instCampaigns}
                onChange={(e) => setInstCampaigns(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditInstitutionDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateInstitutionMutation.isPending}>
                {updateInstitutionMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editMonitoringDialogOpen} onOpenChange={setEditMonitoringDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Area Monitoring</DialogTitle>
            <DialogDescription>Update area monitoring information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateAreaMonitoring} className="space-y-4">
            <div>
              <Label>Region Name</Label>
              <Input value={monRegion} disabled />
            </div>
            <div>
              <Label htmlFor="editMonConnectivity">Connectivity Status *</Label>
              <Input
                id="editMonConnectivity"
                value={monConnectivity}
                onChange={(e) => setMonConnectivity(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="editMonAccessLevel">Access Level (1-5) *</Label>
              <Select value={monAccessLevel} onValueChange={setMonAccessLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Very Low</SelectItem>
                  <SelectItem value="2">2 - Low</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="5">5 - Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editMonDescription">Description *</Label>
              <Textarea
                id="editMonDescription"
                value={monDescription}
                onChange={(e) => setMonDescription(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div>
              <Label htmlFor="editMonCampaigns">Linked Campaigns (comma-separated)</Label>
              <Input
                id="editMonCampaigns"
                value={monCampaigns}
                onChange={(e) => setMonCampaigns(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditMonitoringDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateAreaMonitoringMutation.isPending}>
                {updateAreaMonitoringMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editCampDialogOpen} onOpenChange={setEditCampDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Outreach Camp</DialogTitle>
            <DialogDescription>Update camp information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCamp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editCampName">Camp Name *</Label>
                <Input
                  id="editCampName"
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editCampLocation">Location *</Label>
                <Input
                  id="editCampLocation"
                  value={campLocation}
                  onChange={(e) => setCampLocation(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editCampEventType">Event Type *</Label>
                <Select value={campEventType} onValueChange={setCampEventType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wellness Camp">Wellness Camp</SelectItem>
                    <SelectItem value="Awareness Drive">Awareness Drive</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Festival">Festival</SelectItem>
                    <SelectItem value="Community Gathering">Community Gathering</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editCampStatus">Status *</Label>
                <Select value={campStatus} onValueChange={setCampStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editCampStartDate">Start Date *</Label>
                <Input
                  id="editCampStartDate"
                  type="date"
                  value={campStartDate}
                  onChange={(e) => setCampStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editCampEndDate">End Date *</Label>
                <Input
                  id="editCampEndDate"
                  type="date"
                  value={campEndDate}
                  onChange={(e) => setCampEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editCampClinician">Assigned Clinician (Principal ID)</Label>
              <Input
                id="editCampClinician"
                value={campClinician}
                onChange={(e) => setCampClinician(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="editCampDescription">Description *</Label>
              <Textarea
                id="editCampDescription"
                value={campDescription}
                onChange={(e) => setCampDescription(e.target.value)}
                rows={4}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditCampDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateCampMutation.isPending}>
                {updateCampMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
