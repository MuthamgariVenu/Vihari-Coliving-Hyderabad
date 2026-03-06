'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { branchDetailsAPI, roomAPI, bedAPI } from '@/lib/api';
import { 
  Settings, Wifi, UtensilsCrossed, Flame, WashingMachine, Car, Dumbbell, Shield,
  Save, Home, Bed, IndianRupee, Coffee, Sun, Moon, CheckCircle, Loader2, RefreshCw,
  Refrigerator, Droplets, Zap, ThermometerSun, CookingPot, Camera, Eye, Bike, Sparkles,
  ImagePlus, Trash2, Replace, X, ChevronLeft, ChevronRight, MapPin, Link
} from 'lucide-react';

// Complete PG Facilities list
const AVAILABLE_FACILITIES = [
  { id: 'Wifi', label: 'Wifi', icon: Wifi },
  { id: 'Food', label: 'Food', icon: UtensilsCrossed },
  { id: 'Hot Water', label: 'Hot Water', icon: Flame },
  { id: 'Washing Machine', label: 'Washing Machine', icon: WashingMachine },
  { id: 'Parking', label: 'Parking', icon: Car },
  { id: 'Gym', label: 'Gym', icon: Dumbbell },
  { id: 'Security / CCTV', label: 'Security / CCTV', icon: Camera },
  { id: 'Refrigerator', label: 'Refrigerator', icon: Refrigerator },
  { id: 'Water Dispenser', label: 'Water Dispenser', icon: Droplets },
  { id: 'Power Backup', label: 'Power Backup', icon: Zap },
  { id: 'Geyser', label: 'Geyser', icon: ThermometerSun },
  { id: 'Kitchen', label: 'Kitchen', icon: CookingPot },
  { id: 'Two Wheeler Parking', label: 'Two Wheeler Parking', icon: Bike },
  { id: 'Water Dispenser Each Floor', label: 'Water Dispenser Each Floor', icon: Droplets },
  { id: 'Refrigerator Each Floor', label: 'Refrigerator Each Floor', icon: Refrigerator },
  { id: 'Self Cooking', label: 'Self Cooking', icon: Flame },
  { id: 'Common Kitchen', label: 'Common Kitchen', icon: CookingPot },
  { id: 'Daily Cleaning', label: 'Daily Cleaning', icon: Sparkles },
];

export default function ManagerBranchDetailsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [branchId, setBranchId] = useState(null);
  const [branchName, setBranchName] = useState('');

  // Form states
  const [facilities, setFacilities] = useState([]);
  const [breakfast, setBreakfast] = useState('');
  const [lunch, setLunch] = useState('');
  const [dinner, setDinner] = useState('');
  const [singleRent, setSingleRent] = useState('');
  const [doubleRent, setDoubleRent] = useState('');
  const [tripleRent, setTripleRent] = useState('');
  const [acSingleSharing, setAcSingleSharing] = useState('');
  const [acDoubleSharing, setAcDoubleSharing] = useState('');
  const [acTripleSharing, setAcTripleSharing] = useState('');
  const [showStatsOnLanding, setShowStatsOnLanding] = useState(true);
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState(null);

  // ✅ NEW: Google Map Link state
  const [googleMapLink, setGoogleMapLink] = useState('');

  // Stats (auto-calculated)
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalBeds: 0,
    availableBeds: 0
  });

  useEffect(() => {
    loadManagerBranch();
  }, []);

  const loadManagerBranch = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      const user = JSON.parse(userStr);
      if (!user.branchId) {
        console.error('Manager has no assigned branch');
        setLoading(false);
        return;
      }

      setBranchId(user.branchId);
      setBranchName(user.branchName || 'My Branch');

      const branchDetails = await branchDetailsAPI.getByBranchId(user.branchId);
      
      if (branchDetails) {
        setFacilities(branchDetails.facilities || []);
        
        if (branchDetails.food) {
          setBreakfast((branchDetails.food.breakfast || []).join('\n'));
          setLunch((branchDetails.food.lunch || []).join('\n'));
          setDinner((branchDetails.food.dinner || []).join('\n'));
        }
        
        if (branchDetails.rent) {
          setSingleRent(branchDetails.rent.single?.toString() || '');
          setDoubleRent(branchDetails.rent.double?.toString() || '');
          setTripleRent(branchDetails.rent.triple?.toString() || '');
        }
        
        if (branchDetails.acRent) {
          setAcSingleSharing(branchDetails.acRent.acSingleSharing?.toString() || '');
          setAcDoubleSharing(branchDetails.acRent.acDoubleSharing?.toString() || '');
          setAcTripleSharing(branchDetails.acRent.acTripleSharing?.toString() || '');
        }
        
        if (branchDetails.stats) {
          setStats(branchDetails.stats);
        }

        setShowStatsOnLanding(branchDetails.showStatsOnLanding !== false);
        setGalleryImages(branchDetails.galleryImages || []);

        // ✅ NEW: Load Google Map Link
        setGoogleMapLink(branchDetails.googleMapLink || '');
      }

      await loadStats(user.branchId);

    } catch (error) {
      console.error('Error loading branch details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (branchIdParam) => {
    try {
      const [rooms, beds] = await Promise.all([
        roomAPI.getAll(),
        bedAPI.getAll()
      ]);

      const branchRooms = rooms.filter(r => r.branchId === branchIdParam && r.status === 'ACTIVE');
      const branchBeds = beds.filter(b => b.branchId === branchIdParam && b.status === 'ACTIVE');
      const available = branchBeds.filter(b => !b.isOccupied).length;

      setStats({
        totalRooms: branchRooms.length,
        totalBeds: branchBeds.length,
        availableBeds: available
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFacilityChange = (facilityId, checked) => {
    if (checked) {
      setFacilities([...facilities, facilityId]);
    } else {
      setFacilities(facilities.filter(f => f !== facilityId));
    }
  };

  const handleSave = async () => {
    if (!branchId) return;

    setSaving(true);
    setSaveSuccess(false);

    try {
      const breakfastItems = breakfast.split('\n').map(s => s.trim()).filter(s => s);
      const lunchItems = lunch.split('\n').map(s => s.trim()).filter(s => s);
      const dinnerItems = dinner.split('\n').map(s => s.trim()).filter(s => s);

      const data = {
        branchId,
        facilities,
        food: {
          breakfast: breakfastItems,
          lunch: lunchItems,
          dinner: dinnerItems
        },
        rent: {
          single: parseInt(singleRent) || 0,
          double: parseInt(doubleRent) || 0,
          triple: parseInt(tripleRent) || 0
        },
        acRent: {
          acSingleSharing: parseInt(acSingleSharing) || 0,
          acDoubleSharing: parseInt(acDoubleSharing) || 0,
          acTripleSharing: parseInt(acTripleSharing) || 0
        },
        showStatsOnLanding,
        galleryImages,
        // ✅ NEW: Save Google Map Link
        googleMapLink: googleMapLink.trim(),
      };

      await branchDetailsAPI.create(data);
      setSaveSuccess(true);

      await loadStats(branchId);

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving branch details:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('branchId', branchId);

        const token = localStorage.getItem('token');
        const response = await fetch('/api/upload/gallery', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) throw new Error('Upload failed');
        const result = await response.json();
        console.log('Upload result:', result);
        return result.filePath;
      });

      const newImages = await Promise.all(uploadPromises);
      console.log('New images uploaded:', newImages);
      setGalleryImages(prev => [...prev, ...newImages]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleReplaceImage = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReplacingIndex(index);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('branchId', branchId);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload/gallery', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      const result = await response.json();
      
      const updatedImages = [...galleryImages];
      updatedImages[index] = result.filePath;
      setGalleryImages(updatedImages);
    } catch (error) {
      console.error('Error replacing image:', error);
      alert('Failed to replace image. Please try again.');
    } finally {
      setReplacingIndex(null);
      e.target.value = '';
    }
  };

  const handleDeleteImage = (index) => {
    const updatedImages = galleryImages.filter((_, i) => i !== index);
    setGalleryImages(updatedImages);
  };

  if (loading) {
    return (
      <DashboardLayout role="MANAGER">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading branch details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!branchId) {
    return (
      <DashboardLayout role="MANAGER">
        <div className="flex items-center justify-center h-64">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <Settings className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Branch Assigned</h3>
              <p className="text-slate-500">Please contact admin to assign you to a branch.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="MANAGER">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <Settings className="h-7 w-7 text-blue-500" />
              Branch Details
            </h1>
            <p className="text-slate-500 mt-1">Manage {branchName} details for landing page</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className={`${saveSuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'} text-white px-6`}
            data-testid="save-branch-details-btn"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Branch Statistics (Auto-calculated) */}
        <Card className="border-2 border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-500" />
              Branch Statistics
            </CardTitle>
            <CardDescription>Auto-calculated from Rooms & Beds. Cannot be edited manually.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Home className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Total Rooms</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.totalRooms}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Bed className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600">Total Beds</p>
                    <p className="text-2xl font-bold text-purple-800">{stats.totalBeds}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Bed className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600">Available Beds</p>
                    <p className="text-2xl font-bold text-green-800">{stats.availableBeds}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Show on Landing Page Checkbox */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={showStatsOnLanding}
                  onCheckedChange={(checked) => setShowStatsOnLanding(checked)}
                  data-testid="show-stats-checkbox"
                />
                <div>
                  <p className="font-medium text-slate-700">Show Branch Statistics on Landing Page</p>
                  <p className="text-sm text-slate-500">When enabled, room and bed statistics will be visible to visitors on the branch details page</p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* ✅ NEW: Google Map Link Section */}
        <Card className="border-2 border-blue-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              Google Map Location
            </CardTitle>
            <CardDescription>
              Add your Google Maps link so visitors can navigate directly to your branch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="font-medium text-slate-700">Google Maps Link</Label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="url"
                  placeholder="https://maps.google.com/maps?q=..."
                  value={googleMapLink}
                  onChange={(e) => setGoogleMapLink(e.target.value)}
                  className="pl-10"
                  data-testid="google-map-link-input"
                />
              </div>
              <p className="text-sm text-slate-500">
                Go to Google Maps → find your branch → click Share → Copy link → paste here
              </p>
            </div>

            {/* Preview */}
            {googleMapLink && (
              <div className="mt-2">
                <a
                  href={googleMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <MapPin className="h-4 w-4" />
                  Preview link →
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Facilities Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Facilities
            </CardTitle>
            <CardDescription>Select the facilities available at your branch</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {AVAILABLE_FACILITIES.map((facility) => {
                const Icon = facility.icon;
                const isChecked = facilities.includes(facility.id);
                return (
                  <label
                    key={facility.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isChecked 
                        ? 'bg-blue-50 border-blue-400 shadow-md' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => handleFacilityChange(facility.id, checked)}
                      data-testid={`facility-${facility.id.toLowerCase().replace(' ', '-')}`}
                    />
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isChecked ? 'bg-blue-500/20' : 'bg-slate-100'
                    }`}>
                      <Icon className={`h-4 w-4 ${isChecked ? 'text-blue-600' : 'text-slate-500'}`} />
                    </div>
                    <span className={`font-medium ${isChecked ? 'text-blue-700' : 'text-slate-700'}`}>
                      {facility.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Food Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-orange-500" />
              Food Details
            </CardTitle>
            <CardDescription>Enter food items (one item per line)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Breakfast */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Coffee className="h-4 w-4 text-orange-600" />
                  </div>
                  <Label className="text-base font-semibold text-orange-700">Breakfast</Label>
                </div>
                <Textarea
                  placeholder="Idli/Dosa
Poha/Upma
Tea/Coffee
Bread & Butter"
                  value={breakfast}
                  onChange={(e) => setBreakfast(e.target.value)}
                  className="min-h-[150px] border-orange-200 focus:border-orange-400"
                  data-testid="breakfast-input"
                />
              </div>

              {/* Lunch */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Sun className="h-4 w-4 text-green-600" />
                  </div>
                  <Label className="text-base font-semibold text-green-700">Lunch</Label>
                </div>
                <Textarea
                  placeholder="Rice
Dal
Sabzi
Roti
Salad"
                  value={lunch}
                  onChange={(e) => setLunch(e.target.value)}
                  className="min-h-[150px] border-green-200 focus:border-green-400"
                  data-testid="lunch-input"
                />
              </div>

              {/* Dinner */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Moon className="h-4 w-4 text-purple-600" />
                  </div>
                  <Label className="text-base font-semibold text-purple-700">Dinner</Label>
                </div>
                <Textarea
                  placeholder="Rice/Roti
Dal
Sabzi
Curd
Sweet"
                  value={dinner}
                  onChange={(e) => setDinner(e.target.value)}
                  className="min-h-[150px] border-purple-200 focus:border-purple-400"
                  data-testid="dinner-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Room Rent Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-green-500" />
              Room Rent Details
            </CardTitle>
            <CardDescription>Set monthly rent prices for different sharing types</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Non-AC Rooms */}
            <div className="mb-6">
              <h4 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Non-AC Rooms
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-slate-700">Single Sharing (Non-AC)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                    <Input
                      type="number"
                      placeholder="10000"
                      value={singleRent}
                      onChange={(e) => setSingleRent(e.target.value)}
                      className="pl-8 text-lg font-semibold"
                      data-testid="single-rent-input"
                    />
                  </div>
                  <p className="text-sm text-slate-500">1 Person per Room</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold text-slate-700">Double Sharing (Non-AC)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                    <Input
                      type="number"
                      placeholder="7500"
                      value={doubleRent}
                      onChange={(e) => setDoubleRent(e.target.value)}
                      className="pl-8 text-lg font-semibold"
                      data-testid="double-rent-input"
                    />
                  </div>
                  <p className="text-sm text-slate-500">2 Persons per Room</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold text-slate-700">Triple Sharing (Non-AC)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                    <Input
                      type="number"
                      placeholder="5500"
                      value={tripleRent}
                      onChange={(e) => setTripleRent(e.target.value)}
                      className="pl-8 text-lg font-semibold"
                      data-testid="triple-rent-input"
                    />
                  </div>
                  <p className="text-sm text-slate-500">3 Persons per Room</p>
                </div>
              </div>
            </div>

            {/* AC Rooms */}
            <div className="pt-6 border-t border-slate-200">
              <h4 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                AC Rooms
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-slate-700">Single Sharing (AC)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                    <Input
                      type="number"
                      placeholder="12000"
                      value={acSingleSharing}
                      onChange={(e) => setAcSingleSharing(e.target.value)}
                      className="pl-8 text-lg font-semibold"
                      data-testid="ac-single-rent-input"
                    />
                  </div>
                  <p className="text-sm text-slate-500">1 Person per Room (AC)</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold text-slate-700">Double Sharing (AC)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                    <Input
                      type="number"
                      placeholder="9500"
                      value={acDoubleSharing}
                      onChange={(e) => setAcDoubleSharing(e.target.value)}
                      className="pl-8 text-lg font-semibold"
                      data-testid="ac-double-rent-input"
                    />
                  </div>
                  <p className="text-sm text-slate-500">2 Persons per Room (AC)</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold text-slate-700">Triple Sharing (AC)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                    <Input
                      type="number"
                      placeholder="7500"
                      value={acTripleSharing}
                      onChange={(e) => setAcTripleSharing(e.target.value)}
                      className="pl-8 text-lg font-semibold"
                      data-testid="ac-triple-rent-input"
                    />
                  </div>
                  <p className="text-sm text-slate-500">3 Persons per Room (AC)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo Gallery Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-purple-500" />
              Photo Gallery
            </CardTitle>
            <CardDescription>Upload and manage branch photos for the landing page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <label className="cursor-pointer">
                <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl hover:border-purple-400 hover:bg-purple-50/50 transition-all">
                  {uploadingImage ? (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <ImagePlus className="h-8 w-8" />
                      <span className="text-sm font-medium">Click to upload images</span>
                      <span className="text-xs text-slate-400">JPG, PNG (Max 5MB each)</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  data-testid="gallery-upload-input"
                />
              </label>
            </div>

            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((image, index) => {
                  const imgSrc = typeof image === 'string' ? image : (image?.filePath || image?.url || '');
                  return (
                    <div key={index} className="relative group rounded-xl border-2 border-slate-200 hover:border-purple-400 transition-all">
                      <img
                        src={imgSrc}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl">
                        {replacingIndex === index ? (
                          <Loader2 className="h-5 w-5 text-white animate-spin" />
                        ) : (
                          <>
                            <label className="cursor-pointer">
                              <div className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors" title="Replace">
                                <Replace className="h-4 w-4 text-white" />
                              </div>
                              <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                className="hidden"
                                onChange={(e) => handleReplaceImage(e, index)}
                                data-testid={`replace-image-${index}`}
                              />
                            </label>
                            <button
                              onClick={() => handleDeleteImage(index)}
                              className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
                              title="Delete"
                              data-testid={`delete-image-${index}`}
                            >
                              <Trash2 className="h-4 w-4 text-white" />
                            </button>
                          </>
                        )}
                      </div>
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                        {index + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No images uploaded yet</p>
                <p className="text-sm">Upload photos to showcase your branch</p>
              </div>
            )}

            {galleryImages.length > 0 && (
              <p className="text-sm text-slate-500 mt-4">
                {galleryImages.length} image{galleryImages.length !== 1 ? 's' : ''} uploaded. Hover over images to replace or delete.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Save Button (Bottom) */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className={`${saveSuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'} text-white px-8`}
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Saved Successfully!
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}