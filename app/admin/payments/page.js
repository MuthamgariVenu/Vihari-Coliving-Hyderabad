'use client';

import { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { paymentAPI, tenantAPI, branchAPI, apiCall } from '@/lib/api';
import { Plus, Receipt, Search, X, ChevronDown, Wallet, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const searchRef = useRef(null);
  
  // Dialog states for each payment type
  const [rentDialogOpen, setRentDialogOpen] = useState(false);
  const [advanceDialogOpen, setAdvanceDialogOpen] = useState(false);
  const [dayWiseDialogOpen, setDayWiseDialogOpen] = useState(false);

  // Form data for each payment type
  const [rentForm, setRentForm] = useState({
    tenantId: '',
    amount: '',
    month: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'CASH',
    branchId: '',
  });

  const [advanceForm, setAdvanceForm] = useState({
    tenantId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'CASH',
    isNewPerson: false,
    personName: '',
    personMobile: '',
    branchId: '',
  });

  const [dayWiseForm, setDayWiseForm] = useState({
    tenantId: '',
    numberOfDays: '',
    perDayAmount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    isNewPerson: false,
    personName: '',
    personMobile: '',
    branchId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    try {
      const [paymentsData, tenantsData, branchesData] = await Promise.all([
        paymentAPI.getAll(),
        tenantAPI.getAll(),
        branchAPI.getAll(),
      ]);
      setPayments(paymentsData);
      setTenants(tenantsData.filter(t => t.status === 'ACTIVE'));
      setBranches(branchesData.filter(b => b.status === 'ACTIVE'));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter tenants by selected branch
  const getFilteredTenants = (branchId) => {
    let filtered = tenants;
    if (branchId) {
      filtered = tenants.filter(t => t.branchId === branchId);
    }
    const query = searchQuery.toLowerCase();
    return filtered.filter(tenant => 
      tenant.name.toLowerCase().includes(query) || 
      tenant.mobile.includes(query)
    );
  };

  const handleTenantSelect = (tenant, formType) => {
    setSelectedTenant(tenant);
    setSearchQuery(tenant.name + ' - ' + tenant.mobile);
    setShowSearchResults(false);
    
    if (formType === 'rent') {
      setRentForm({ ...rentForm, tenantId: tenant.tenantId, amount: tenant.monthlyRent?.toString() || '' });
    } else if (formType === 'advance') {
      setAdvanceForm({ ...advanceForm, tenantId: tenant.tenantId });
    } else if (formType === 'daywise') {
      setDayWiseForm({ ...dayWiseForm, tenantId: tenant.tenantId });
    }
  };

  const clearTenantSelection = () => {
    setSelectedTenant(null);
    setSearchQuery('');
  };

  const resetForms = () => {
    setSelectedTenant(null);
    setSearchQuery('');
    setSelectedBranchId('');
    setRentForm({
      tenantId: '',
      amount: '',
      month: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'CASH',
      branchId: '',
    });
    setAdvanceForm({
      tenantId: '',
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'CASH',
      isNewPerson: false,
      personName: '',
      personMobile: '',
      branchId: '',
    });
    setDayWiseForm({
      tenantId: '',
      numberOfDays: '',
      perDayAmount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      isNewPerson: false,
      personName: '',
      personMobile: '',
      branchId: '',
    });
  };

  // Handle Rent Payment
  const handleRentSubmit = async (e) => {
    e.preventDefault();
    if (!rentForm.tenantId) {
      alert('Please select a tenant');
      return;
    }
    try {
      await paymentAPI.create({
        tenantId: rentForm.tenantId,
        amount: parseFloat(rentForm.amount),
        paymentDate: rentForm.paymentDate,
        paymentMode: rentForm.paymentMode,
        month: rentForm.month ? months.indexOf(rentForm.month) + 1 : new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        type: 'RENT',
        remarks: `Rent payment for ${rentForm.month || months[new Date().getMonth()]}`,
      });
      setRentDialogOpen(false);
      resetForms();
      loadData();
      alert('Rent payment recorded successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  // Handle Advance Payment
  const handleAdvanceSubmit = async (e) => {
    e.preventDefault();
    
    // Validate - either tenant selected OR manual entry
    if (!advanceForm.isNewPerson && !advanceForm.tenantId) {
      alert('Please select a tenant or enter person details');
      return;
    }
    if (advanceForm.isNewPerson && (!advanceForm.personName || !advanceForm.personMobile)) {
      alert('Please enter name and mobile number');
      return;
    }
    if (advanceForm.isNewPerson && !advanceForm.branchId) {
      alert('Please select a branch');
      return;
    }
    
    try {
      // Create payment record
      const paymentData = {
        amount: parseFloat(advanceForm.amount),
        paymentDate: advanceForm.paymentDate,
        paymentMode: advanceForm.paymentMode,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        type: 'ADVANCE',
      };
      
      if (advanceForm.isNewPerson) {
        paymentData.personName = advanceForm.personName;
        paymentData.personMobile = advanceForm.personMobile;
        paymentData.branchId = advanceForm.branchId;
        paymentData.remarks = `Advance from ${advanceForm.personName} (${advanceForm.personMobile})`;
      } else {
        paymentData.tenantId = advanceForm.tenantId;
        paymentData.remarks = 'Advance payment';
        // Update tenant's advance amount
        await apiCall(`/tenants/${advanceForm.tenantId}/advance`, {
          method: 'PUT',
          body: JSON.stringify({ advanceAmount: parseFloat(advanceForm.amount) }),
        });
      }
      
      await paymentAPI.create(paymentData);
      
      setAdvanceDialogOpen(false);
      resetForms();
      loadData();
      alert('Advance payment recorded successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  // Handle Day-wise Payment
  const handleDayWiseSubmit = async (e) => {
    e.preventDefault();
    
    // Validate - either tenant selected OR manual entry
    if (!dayWiseForm.isNewPerson && !dayWiseForm.tenantId) {
      alert('Please select a tenant or enter person details');
      return;
    }
    if (dayWiseForm.isNewPerson && (!dayWiseForm.personName || !dayWiseForm.personMobile)) {
      alert('Please enter name and mobile number');
      return;
    }
    if (dayWiseForm.isNewPerson && !dayWiseForm.branchId) {
      alert('Please select a branch');
      return;
    }
    
    const totalAmount = parseInt(dayWiseForm.numberOfDays) * parseFloat(dayWiseForm.perDayAmount);
    try {
      const paymentData = {
        amount: totalAmount,
        paymentDate: dayWiseForm.paymentDate,
        paymentMode: 'CASH',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        type: 'DAYWISE',
      };
      
      if (dayWiseForm.isNewPerson) {
        paymentData.personName = dayWiseForm.personName;
        paymentData.personMobile = dayWiseForm.personMobile;
        paymentData.branchId = dayWiseForm.branchId;
        paymentData.remarks = `Day-wise: ${dayWiseForm.numberOfDays} days @ ₹${dayWiseForm.perDayAmount}/day - ${dayWiseForm.personName}`;
      } else {
        paymentData.tenantId = dayWiseForm.tenantId;
        paymentData.remarks = `Day-wise payment: ${dayWiseForm.numberOfDays} days @ ₹${dayWiseForm.perDayAmount}/day`;
      }
      
      await paymentAPI.create(paymentData);
      setDayWiseDialogOpen(false);
      resetForms();
      loadData();
      alert('Day-wise payment recorded successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  const getTenantName = (tenantId) => tenants.find(t => t.tenantId === tenantId)?.name || 'Unknown';
  const getPaymentPerson = (payment) => {
    if (payment.tenantId) {
      return getTenantName(payment.tenantId);
    }
    return payment.personName || 'Unknown';
  };
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Tenant Search Component with Branch Filter
  const TenantSearch = ({ formType, branchId }) => (
    <div ref={searchRef} className="relative">
      <Label>Tenant Name *</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by name or mobile..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearchResults(true);
            if (selectedTenant && e.target.value !== `${selectedTenant.name} - ${selectedTenant.mobile}`) {
              setSelectedTenant(null);
            }
          }}
          onFocus={() => setShowSearchResults(true)}
          className="pl-10 pr-10"
        />
        {selectedTenant && (
          <button
            type="button"
            onClick={clearTenantSelection}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {showSearchResults && searchQuery && !selectedTenant && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {getFilteredTenants(branchId).length > 0 ? (
            getFilteredTenants(branchId).map((tenant) => (
              <div
                key={tenant.tenantId}
                className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                onClick={() => handleTenantSelect(tenant, formType)}
              >
                <p className="font-medium text-slate-800">{tenant.name}</p>
                <p className="text-sm text-slate-500">{tenant.mobile} • Rent: ₹{tenant.monthlyRent}</p>
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-slate-500 text-sm">No tenants found</div>
          )}
        </div>
      )}
      {selectedTenant && (
        <p className="text-xs text-green-600 mt-1">Selected: {selectedTenant.name}</p>
      )}
    </div>
  );

  // Branch Selection Component
  const BranchSelect = ({ value, onChange, label = "Branch", required = false }) => (
    <div>
      <Label>{label} {required && '*'}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select branch" />
        </SelectTrigger>
        <SelectContent>
          {branches.map((branch) => (
            <SelectItem key={branch.branchId} value={branch.branchId}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Payments</h2>
            <p className="text-slate-600 mt-1">Track tenant payments</p>
          </div>
          
          {/* Dropdown Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                <Plus className="mr-2 h-4 w-4" /> Add Payment <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => { resetForms(); setRentDialogOpen(true); }} className="cursor-pointer">
                <Wallet className="mr-2 h-4 w-4" /> Pay Rent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { resetForms(); setAdvanceDialogOpen(true); }} className="cursor-pointer">
                <Receipt className="mr-2 h-4 w-4" /> Pay Advance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { resetForms(); setDayWiseDialogOpen(true); }} className="cursor-pointer">
                <Clock className="mr-2 h-4 w-4" /> Pay Day-wise
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Pay Rent Dialog */}
        <Dialog open={rentDialogOpen} onOpenChange={(open) => { setRentDialogOpen(open); if (!open) resetForms(); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-500" /> Pay Rent
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRentSubmit} className="space-y-4">
              <BranchSelect 
                value={rentForm.branchId} 
                onChange={(value) => { setRentForm({ ...rentForm, branchId: value, tenantId: '' }); clearTenantSelection(); }}
                label="Filter by Branch"
              />
              <TenantSearch formType="rent" branchId={rentForm.branchId} />
              <div>
                <Label>Amount *</Label>
                <Input 
                  type="number" 
                  value={rentForm.amount} 
                  onChange={(e) => setRentForm({ ...rentForm, amount: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <Label>Month *</Label>
                <Select value={rentForm.month} onValueChange={(value) => setRentForm({ ...rentForm, month: value })}>
                  <SelectTrigger><SelectValue placeholder="Select month" /></SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (<SelectItem key={month} value={month}>{month}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Date *</Label>
                <Input type="date" value={rentForm.paymentDate} onChange={(e) => setRentForm({ ...rentForm, paymentDate: e.target.value })} required />
              </div>
              <div>
                <Label>Payment Mode *</Label>
                <Select value={rentForm.paymentMode} onValueChange={(value) => setRentForm({ ...rentForm, paymentMode: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Save Payment</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Pay Advance Dialog */}
        <Dialog open={advanceDialogOpen} onOpenChange={(open) => { setAdvanceDialogOpen(open); if (!open) resetForms(); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-green-500" /> Pay Advance
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdvanceSubmit} className="space-y-4">
              {/* Toggle between Existing Tenant and New Person */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => { setAdvanceForm({ ...advanceForm, isNewPerson: false, personName: '', personMobile: '' }); clearTenantSelection(); }}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    !advanceForm.isNewPerson ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Existing Tenant
                </button>
                <button
                  type="button"
                  onClick={() => { setAdvanceForm({ ...advanceForm, isNewPerson: true, tenantId: '' }); clearTenantSelection(); }}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    advanceForm.isNewPerson ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  New Person
                </button>
              </div>

              <BranchSelect 
                value={advanceForm.branchId} 
                onChange={(value) => { setAdvanceForm({ ...advanceForm, branchId: value, tenantId: '' }); clearTenantSelection(); }}
                label={advanceForm.isNewPerson ? "Branch" : "Filter by Branch"}
                required={advanceForm.isNewPerson}
              />

              {!advanceForm.isNewPerson ? (
                <TenantSearch formType="advance" branchId={advanceForm.branchId} />
              ) : (
                <>
                  <div>
                    <Label>Name *</Label>
                    <Input 
                      value={advanceForm.personName} 
                      onChange={(e) => setAdvanceForm({ ...advanceForm, personName: e.target.value })} 
                      placeholder="Enter person name"
                      required 
                    />
                  </div>
                  <div>
                    <Label>Mobile Number *</Label>
                    <Input 
                      value={advanceForm.personMobile} 
                      onChange={(e) => setAdvanceForm({ ...advanceForm, personMobile: e.target.value })} 
                      placeholder="Enter mobile number"
                      maxLength={10}
                      required 
                    />
                  </div>
                </>
              )}
              <div>
                <Label>Advance Amount *</Label>
                <Input 
                  type="number" 
                  value={advanceForm.amount} 
                  onChange={(e) => setAdvanceForm({ ...advanceForm, amount: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <Label>Payment Date *</Label>
                <Input type="date" value={advanceForm.paymentDate} onChange={(e) => setAdvanceForm({ ...advanceForm, paymentDate: e.target.value })} required />
              </div>
              <div>
                <Label>Payment Mode *</Label>
                <Select value={advanceForm.paymentMode} onValueChange={(value) => setAdvanceForm({ ...advanceForm, paymentMode: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Save Payment</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Pay Day-wise Dialog */}
        <Dialog open={dayWiseDialogOpen} onOpenChange={(open) => { setDayWiseDialogOpen(open); if (!open) resetForms(); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" /> Pay Day-wise
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleDayWiseSubmit} className="space-y-4">
              {/* Toggle between Existing Tenant and New Person */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => { setDayWiseForm({ ...dayWiseForm, isNewPerson: false, personName: '', personMobile: '' }); clearTenantSelection(); }}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    !dayWiseForm.isNewPerson ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Existing Tenant
                </button>
                <button
                  type="button"
                  onClick={() => { setDayWiseForm({ ...dayWiseForm, isNewPerson: true, tenantId: '' }); clearTenantSelection(); }}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    dayWiseForm.isNewPerson ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  New Person
                </button>
              </div>

              <BranchSelect 
                value={dayWiseForm.branchId} 
                onChange={(value) => { setDayWiseForm({ ...dayWiseForm, branchId: value, tenantId: '' }); clearTenantSelection(); }}
                label={dayWiseForm.isNewPerson ? "Branch" : "Filter by Branch"}
                required={dayWiseForm.isNewPerson}
              />

              {!dayWiseForm.isNewPerson ? (
                <TenantSearch formType="daywise" branchId={dayWiseForm.branchId} />
              ) : (
                <>
                  <div>
                    <Label>Name *</Label>
                    <Input 
                      value={dayWiseForm.personName} 
                      onChange={(e) => setDayWiseForm({ ...dayWiseForm, personName: e.target.value })} 
                      placeholder="Enter person name"
                      required 
                    />
                  </div>
                  <div>
                    <Label>Mobile Number *</Label>
                    <Input 
                      value={dayWiseForm.personMobile} 
                      onChange={(e) => setDayWiseForm({ ...dayWiseForm, personMobile: e.target.value })} 
                      placeholder="Enter mobile number"
                      maxLength={10}
                      required 
                    />
                  </div>
                </>
              )}
              <div>
                <Label>Number of Days *</Label>
                <Input 
                  type="number" 
                  value={dayWiseForm.numberOfDays} 
                  onChange={(e) => setDayWiseForm({ ...dayWiseForm, numberOfDays: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <Label>Per Day Amount *</Label>
                <Input 
                  type="number" 
                  value={dayWiseForm.perDayAmount} 
                  onChange={(e) => setDayWiseForm({ ...dayWiseForm, perDayAmount: e.target.value })} 
                  required 
                />
              </div>
              <div className="bg-slate-100 p-3 rounded-lg">
                <Label className="text-slate-600">Total Amount</Label>
                <p className="text-2xl font-bold text-slate-800">
                  ₹{((parseInt(dayWiseForm.numberOfDays) || 0) * (parseFloat(dayWiseForm.perDayAmount) || 0)).toLocaleString()}
                </p>
              </div>
              <div>
                <Label>Payment Date *</Label>
                <Input type="date" value={dayWiseForm.paymentDate} onChange={(e) => setDayWiseForm({ ...dayWiseForm, paymentDate: e.target.value })} required />
              </div>
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">Save Payment</Button>
            </form>
          </DialogContent>
        </Dialog>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">No payments recorded yet</p>
              </div>
            ) : (
              payments.map((payment) => (
                <Card key={payment.paymentId}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                          payment.type === 'ADVANCE' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                          payment.type === 'DAYWISE' ? 'bg-gradient-to-br from-orange-500 to-amber-500' :
                          'bg-gradient-to-br from-blue-500 to-indigo-500'
                        }`}>
                          {payment.type === 'ADVANCE' ? <Receipt className="h-6 w-6" /> :
                           payment.type === 'DAYWISE' ? <Clock className="h-6 w-6" /> :
                           <Wallet className="h-6 w-6" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-slate-800">
                            {getPaymentPerson(payment)}
                            {!payment.tenantId && payment.personMobile && (
                              <span className="text-sm font-normal text-slate-500 ml-2">({payment.personMobile})</span>
                            )}
                          </h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              payment.type === 'ADVANCE' ? 'bg-green-100 text-green-700' :
                              payment.type === 'DAYWISE' ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {payment.type || 'RENT'}
                            </span>
                            {!payment.tenantId && <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700">Guest</span>}
                            <span>{payment.paymentMode}</span>
                            <span>•</span>
                            <span>{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</span>
                          </div>
                          {payment.remarks && <p className="text-xs text-slate-500 mt-1">{payment.remarks}</p>}
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-green-600">₹{payment.amount.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
