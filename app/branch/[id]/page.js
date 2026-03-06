'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, MapPin, Phone, Home, Bed, ArrowLeft, 
  ChevronDown, ChevronUp, Wifi, UtensilsCrossed, Flame, 
  WashingMachine, Car, Dumbbell, Shield, Coffee, Sun, Moon,
  Users, User, UserCheck, IndianRupee, Navigation, MessageCircle,
  Refrigerator, Droplets, Zap, ThermometerSun, CookingPot, Camera,
  ChevronLeft, ChevronRight, ImageIcon, Mail
} from 'lucide-react';

// Complete facility icons mapping
const facilityIcons = {
  'Wifi': Wifi, 
  'WiFi': Wifi, 
  'Food': UtensilsCrossed, 
  'Hot Water': Flame,
  'Washing Machine': WashingMachine, 
  
  'Two Wheeler Parking': Car,   // changed

  'Gym': Dumbbell, 
  'Security': Shield,
  'Security / CCTV': Camera,
  'Refrigerator': Refrigerator,
  'Water Dispenser': Droplets,
  'Power Backup': Zap,
  'Geyser': ThermometerSun,
  'Kitchen': CookingPot,

  'Self Cooking': CookingPot,
  'Common Kitchen': CookingPot,
  'Daily Cleaning': Shield,
  'Water Dispenser Each Floor': Droplets,
  'Refrigerator Each Floor': Refrigerator,
  'Laundry': WashingMachine,
  'AC': ThermometerSun
};

const ExpandableSection = ({ title, subtitle, buttonText, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden transition-all duration-500 hover:border-white/20">
      <div className="p-6 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <Icon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="text-sm text-slate-400">{subtitle}</p>
            </div>
          </div>
          <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 gap-2" onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}>
            {buttonText}
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-6 pt-2 border-t border-white/5">{children}</div>
      </div>
    </div>
  );
};

export default function BranchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [branch, setBranch] = useState(null);
  const [branchDetails, setBranchDetails] = useState(null);
  const [branchIndex, setBranchIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => { loadBranchDetails(); }, []);

  const loadBranchDetails = async () => {
    try {
      const branchRes = await fetch('/api/branches');
      if (branchRes.ok) {
        const branches = await branchRes.json();
        const foundBranch = branches.find(b => b.branchId === params.id);
        const foundIndex = branches.findIndex(b => b.branchId === params.id);
        setBranch(foundBranch);
        setBranchIndex(foundIndex >= 0 ? foundIndex : 0);
      }
      const detailsRes = await fetch(`/api/branch-details/${params.id}`);
      if (detailsRes.ok) setBranchDetails(await detailsRes.json());
    } catch (error) { console.error('Error:', error); } 
    finally { setLoading(false); }
  };
  
  // Get the branch image based on index (same logic as home page)
  const getBranchImage = () => `/vihari-${branchIndex === 0 ? 'grand' : 'luxury'}.png`;

  const getStartingRent = () => {
    if (branchDetails?.rent) {
      const rents = [branchDetails.rent.single, branchDetails.rent.double, branchDetails.rent.triple].filter(r => r && r > 0);
      if (rents.length > 0) return Math.min(...rents);
    }
    return 'Contact Us';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Branch Not Found</h1>
          <Button onClick={() => router.push('/')} className="bg-blue-500 hover:bg-blue-600">Back to Home</Button>
        </div>
      </div>
    );
  }

  const stats = branchDetails?.stats || { totalRooms: 0, totalBeds: 0, availableBeds: 0 };
  const facilities = branchDetails?.facilities || [];
  const foodMenu = branchDetails?.food || { breakfast: [], lunch: [], dinner: [] };
  const rentDetails = branchDetails?.rent || { single: 0, double: 0, triple: 0 };
  const acRentDetails = branchDetails?.acRent || { acSingleSharing: 0, acDoubleSharing: 0, acTripleSharing: 0 };
  
  // Safe gallery images handling - ensure it's always an array with valid strings
  const rawGalleryImages = branchDetails?.galleryImages;
  const galleryImages = Array.isArray(rawGalleryImages) 
    ? rawGalleryImages.filter(img => typeof img === 'string' && img.trim() !== '')
    : [];
  
  const startingRent = getStartingRent();
  const hasFoodData = foodMenu.breakfast.length > 0 || foodMenu.lunch.length > 0 || foodMenu.dinner.length > 0;
  const hasRentData = rentDetails.single > 0 || rentDetails.double > 0 || rentDetails.triple > 0;
  const hasAcRentData = acRentDetails.acSingleSharing > 0 || acRentDetails.acDoubleSharing > 0 || acRentDetails.acTripleSharing > 0;
  const hasGalleryImages = Array.isArray(galleryImages) && galleryImages.length > 0;
  const showStats = branchDetails?.showStatsOnLanding !== false;
  
  // Gallery slider logic (state moved to top of component)
  const showGallerySlider = hasGalleryImages && galleryImages.length > 3;
  const maxGalleryIndex = Math.max(0, galleryImages.length - 3);
  const safeGalleryIndex = Math.min(galleryIndex, maxGalleryIndex);
  const visibleGalleryImages = hasGalleryImages && showGallerySlider 
    ? galleryImages.slice(safeGalleryIndex, safeGalleryIndex + 3) 
    : galleryImages;
  
  const nextGallerySlide = () => {
    if (hasGalleryImages && galleryIndex < maxGalleryIndex) {
      setGalleryIndex(prev => prev + 1);
    }
  };
  
  const prevGallerySlide = () => {
    if (galleryIndex > 0) {
      setGalleryIndex(prev => prev - 1);
    }
  };

  const handleCall = () => window.open(`tel:${branch.phone}`, '_self');
  const handleWhatsApp = () => window.open(`https://wa.me/91${(branch.whatsappNumber || branch.phone).replace(/[^0-9]/g, '')}`, '_blank');
  const handleEmail = () => window.open(`mailto:${branch.email}`, '_self');
  const handleNavigate = () => {
    if (branch.googleMapLink) window.open(branch.googleMapLink, '_blank');
    else window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address + ', ' + branch.city)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-3">
          <Button variant="ghost" onClick={() => router.push('/')} className="text-slate-300 hover:text-white hover:bg-slate-700/50">
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Home
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Branch Image Section */}
        <div className="mb-6 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/20">
          <div className="relative h-64 md:h-80 lg:h-96">
            <img 
              src={getBranchImage()} 
              alt={branch.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg">{branch.name}</h1>
                  <p className="text-white/80 text-sm md:text-base">Branch Code: <span className="font-semibold">{branch.code}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-pink-600/90 p-8 md:p-12 shadow-2xl shadow-purple-500/20">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          </div>
          <div className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <MapPin className="h-5 w-5 text-white/80 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white/70 text-sm mb-1">Address</p>
                  <p className="text-white font-medium">{branch.address}</p>
                  <p className="text-white/90">{branch.city}</p>
                </div>
              </div>
              <div className="space-y-3">
                <button onClick={handleCall} className="w-full flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center"><Phone className="h-5 w-5 text-green-400" /></div>
                  <div className="text-left"><p className="text-white/70 text-sm">Call Now</p><p className="text-white font-medium">{branch.phone}</p></div>
                </button>
                <button onClick={handleWhatsApp} className="w-full flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center"><MessageCircle className="h-5 w-5 text-green-400" /></div>
                  <div className="text-left"><p className="text-white/70 text-sm">WhatsApp</p><p className="text-white font-medium">{branch.whatsappNumber || branch.phone}</p></div>
                </button>
                {branch.email && (
                  <button onClick={handleEmail} className="w-full flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center"><Mail className="h-5 w-5 text-blue-400" /></div>
                    <div className="text-left"><p className="text-white/70 text-sm">Email</p><p className="text-white font-medium truncate">{branch.email}</p></div>
                  </button>
                )}
              </div>
            </div>
            <Button onClick={handleNavigate} className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/20 rounded-xl px-6 py-3">
              <MapPin className="h-5 w-5 mr-2" />View on Map
            </Button>
          </div>
        </div>
      </div>

      {showStats && (
        <div className="container mx-auto px-4 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 backdrop-blur-xl">
              <CardContent className="p-6"><div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center"><Home className="h-6 w-6 text-blue-400" /></div>
                <div><p className="text-sm text-slate-400">Total Rooms</p><p className="text-2xl font-bold text-white">{stats.totalRooms}</p></div>
              </div></CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 backdrop-blur-xl">
              <CardContent className="p-6"><div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center"><Bed className="h-6 w-6 text-purple-400" /></div>
                <div><p className="text-sm text-slate-400">Total Beds</p><p className="text-2xl font-bold text-white">{stats.totalBeds}</p></div>
              </div></CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 backdrop-blur-xl">
              <CardContent className="p-6"><div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center"><Bed className="h-6 w-6 text-green-400" /></div>
                <div><p className="text-sm text-slate-400">Available</p><p className="text-2xl font-bold text-white">{stats.availableBeds}</p></div>
              </div></CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20 backdrop-blur-xl">
              <CardContent className="p-6"><div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center"><IndianRupee className="h-6 w-6 text-orange-400" /></div>
                <div><p className="text-sm text-slate-400">Starting</p><p className="text-2xl font-bold text-white">{typeof startingRent === 'number' ? `₹${startingRent.toLocaleString()}` : startingRent}</p></div>
              </div></CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 pb-8 space-y-4">
        <ExpandableSection title="Facilities" subtitle="Facilities Overview" buttonText="View Facilities" icon={Shield}>
          {facilities.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {facilities.map((facility, idx) => {
                const IconComponent = facilityIcons[facility] || Shield;
                return (
                  <div key={idx} className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-blue-400" />
                    </div>
                    <span className="text-white font-medium">{facility}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400"><p>Facilities not available yet.</p></div>
          )}
        </ExpandableSection>

        <ExpandableSection title="Food Details" subtitle="Food Details Overview" buttonText="View Food Menu" icon={UtensilsCrossed}>
          {hasFoodData ? (
            <div className="mt-4 space-y-6">
              {foodMenu.breakfast.length > 0 && (
                <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-xl p-5 border border-orange-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center"><Coffee className="h-5 w-5 text-orange-400" /></div>
                    <h4 className="text-lg font-semibold text-orange-400">Breakfast</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {foodMenu.breakfast.map((item, idx) => (<span key={idx} className="px-4 py-2 bg-orange-500/10 text-orange-300 rounded-full text-sm font-medium border border-orange-500/20">{item}</span>))}
                  </div>
                </div>
              )}
              {foodMenu.lunch.length > 0 && (
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-5 border border-green-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center"><Sun className="h-5 w-5 text-green-400" /></div>
                    <h4 className="text-lg font-semibold text-green-400">Lunch</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {foodMenu.lunch.map((item, idx) => (<span key={idx} className="px-4 py-2 bg-green-500/10 text-green-300 rounded-full text-sm font-medium border border-green-500/20">{item}</span>))}
                  </div>
                </div>
              )}
              {foodMenu.dinner.length > 0 && (
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-5 border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center"><Moon className="h-5 w-5 text-purple-400" /></div>
                    <h4 className="text-lg font-semibold text-purple-400">Dinner</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {foodMenu.dinner.map((item, idx) => (<span key={idx} className="px-4 py-2 bg-purple-500/10 text-purple-300 rounded-full text-sm font-medium border border-purple-500/20">{item}</span>))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400"><p>Food menu not available yet.</p></div>
          )}
        </ExpandableSection>

        <ExpandableSection title="Room Rent Details" subtitle="Room Rent Overview" buttonText="View Rent Details" icon={IndianRupee}>
          {(hasRentData || hasAcRentData) ? (
            <div className="space-y-6 mt-4">
              {/* Non-AC Rooms */}
              {hasRentData && (
                <div>
                  <h4 className="text-base font-semibold text-slate-300 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Non-AC Rooms
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {rentDetails.single > 0 && (
                      <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-6 border border-blue-500/20">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center"><User className="h-6 w-6 text-blue-400" /></div>
                          <div><p className="text-sm text-slate-400">Single Sharing (Non-AC)</p><p className="text-xs text-slate-500">1 Person per Room</p></div>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-white">₹{rentDetails.single?.toLocaleString()}</span>
                          <span className="text-slate-400 text-sm">per month</span>
                        </div>
                      </div>
                    )}
                    {rentDetails.double > 0 && (
                      <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl p-6 border border-purple-500/20 relative">
                        <div className="absolute top-2 right-2 bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full font-medium">Popular</div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center"><Users className="h-6 w-6 text-purple-400" /></div>
                          <div><p className="text-sm text-slate-400">Double Sharing (Non-AC)</p><p className="text-xs text-slate-500">2 Persons per Room</p></div>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-white">₹{rentDetails.double?.toLocaleString()}</span>
                          <span className="text-slate-400 text-sm">per month</span>
                        </div>
                      </div>
                    )}
                    {rentDetails.triple > 0 && (
                      <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-6 border border-green-500/20">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center"><UserCheck className="h-6 w-6 text-green-400" /></div>
                          <div><p className="text-sm text-slate-400">Triple Sharing (Non-AC)</p><p className="text-xs text-slate-500">3 Persons per Room</p></div>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-white">₹{rentDetails.triple?.toLocaleString()}</span>
                          <span className="text-slate-400 text-sm">per month</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AC Rooms */}
              {hasAcRentData && (
                <div className={hasRentData ? "pt-6 border-t border-white/10" : ""}>
                  <h4 className="text-base font-semibold text-slate-300 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                    AC Rooms
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {acRentDetails.acSingleSharing > 0 && (
                      <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-xl p-6 border border-cyan-500/20">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center"><User className="h-6 w-6 text-cyan-400" /></div>
                          <div><p className="text-sm text-slate-400">Single Sharing (AC)</p><p className="text-xs text-slate-500">1 Person per Room</p></div>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-white">₹{acRentDetails.acSingleSharing?.toLocaleString()}</span>
                          <span className="text-slate-400 text-sm">per month</span>
                        </div>
                      </div>
                    )}
                    {acRentDetails.acDoubleSharing > 0 && (
                      <div className="bg-gradient-to-br from-teal-500/10 to-teal-600/5 rounded-xl p-6 border border-teal-500/20">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center"><Users className="h-6 w-6 text-teal-400" /></div>
                          <div><p className="text-sm text-slate-400">Double Sharing (AC)</p><p className="text-xs text-slate-500">2 Persons per Room</p></div>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-white">₹{acRentDetails.acDoubleSharing?.toLocaleString()}</span>
                          <span className="text-slate-400 text-sm">per month</span>
                        </div>
                      </div>
                    )}
                    {acRentDetails.acTripleSharing > 0 && (
                      <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl p-6 border border-emerald-500/20">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center"><UserCheck className="h-6 w-6 text-emerald-400" /></div>
                          <div><p className="text-sm text-slate-400">Triple Sharing (AC)</p><p className="text-xs text-slate-500">3 Persons per Room</p></div>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-white">₹{acRentDetails.acTripleSharing?.toLocaleString()}</span>
                          <span className="text-slate-400 text-sm">per month</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400"><p>Rent details not available yet.</p></div>
          )}
        </ExpandableSection>

        {/* Photo Gallery Section */}
        {hasGalleryImages && galleryImages.length > 0 && (
          <ExpandableSection title="Photo Gallery" subtitle="Branch Photos" buttonText="View Photos" icon={ImageIcon} defaultOpen={true}>
            <div className="mt-4">
              {showGallerySlider ? (
                <div className="relative">
                  {/* Slider Navigation */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={prevGallerySlide}
                      disabled={galleryIndex === 0}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        galleryIndex === 0 
                          ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed' 
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      {visibleGalleryImages && visibleGalleryImages.length > 0 && visibleGalleryImages.map((image, idx) => {
                        const imgSrc = typeof image === 'string' ? image : (image?.filePath || image?.url || '');
                        console.log(`Landing gallery image ${idx}:`, imgSrc);
                        return imgSrc ? (
                          <div key={`gallery-${galleryIndex}-${idx}`} className="rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all">
                            <img
                              src={imgSrc}
                              alt={`Gallery ${galleryIndex + idx + 1}`}
                              className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </div>
                        ) : null;
                      })}
                    </div>
                    
                    <button
                      onClick={nextGallerySlide}
                      disabled={galleryIndex >= maxGalleryIndex}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        galleryIndex >= maxGalleryIndex 
                          ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed' 
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Pagination dots */}
                  {galleryImages.length > 3 && (
                    <div className="flex justify-center mt-4 gap-2">
                      {Array.from({ length: maxGalleryIndex + 1 }).map((_, idx) => (
                        <button
                          key={`dot-${idx}`}
                          onClick={() => setGalleryIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === galleryIndex ? 'bg-purple-500 w-4' : 'bg-white/30 hover:bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  
                  <p className="text-center text-slate-400 text-sm mt-3">
                    Showing {safeGalleryIndex + 1}-{Math.min(safeGalleryIndex + 3, galleryImages.length)} of {galleryImages.length} photos
                  </p>
                </div>
              ) : (
                <div className={`grid gap-4 ${
                  galleryImages.length === 1 ? 'grid-cols-1' : 
                  galleryImages.length === 2 ? 'grid-cols-2' : 
                  'grid-cols-1 md:grid-cols-3'
                }`}>
                  {galleryImages.map((image, idx) => {
                    const imgSrc = typeof image === 'string' ? image : (image?.filePath || image?.url || '');
                    return imgSrc ? (
                      <div key={`gallery-item-${idx}`} className="rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all">
                        <img
                          src={imgSrc}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </ExpandableSection>
        )}
      </div>

      <div className="container mx-auto px-4 pb-12">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-red-400" />
                  </div>
                  <div><h3 className="text-lg font-semibold text-white">Branch Location</h3><p className="text-sm text-slate-400">{branch.address}, {branch.city}</p></div>
                </div>
                <Button onClick={handleNavigate} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl px-6">
                  <Navigation className="h-4 w-4 mr-2" />Navigate
                </Button>
              </div>
            </div>
            <div className="h-[300px] md:h-[400px] bg-slate-800/50">
              <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(branch.address + ', ' + branch.city)}&z=15&output=embed`} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"></iframe>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <Card className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border-white/10 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Interested in this Branch?</h3>
            <p className="text-slate-400 mb-6">Contact us now to book your bed</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleCall} className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-8 py-3"><Phone className="h-5 w-5 mr-2" />Call Now</Button>
              <Button onClick={handleWhatsApp} className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl px-8 py-3"><MessageCircle className="h-5 w-5 mr-2" />WhatsApp</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="py-8 px-4 border-t border-slate-800">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"><Building2 className="w-5 h-5 text-white" /></div>
            <span className="text-lg font-bold text-white">Hostel ERP</span>
          </div>
          <p className="text-slate-500 text-sm">© 2024 Hostel ERP. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}