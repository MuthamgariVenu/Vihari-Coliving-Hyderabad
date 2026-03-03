'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { apiCall, paymentAPI } from '@/lib/api';
import { format } from 'date-fns';
import { Search, Wallet, X, ChevronDown, CreditCard, Coins } from 'lucide-react';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function PaymentDuePage() {
  const [dueTenants, setDueTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalDue, setTotalDue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [paymentType, setPaymentType] = useState('full'); // 'full' or 'partial'
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    month: months[new Date().getMonth()],
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'CASH',
  });

  useEffect(() => {
    loadDueTenants();
  }, []);

  const loadDueTenants = async () => {
    try {
      const data = await apiCall('/tenants/due');
      setDueTenants(data.tenants || []);
      setTotalDue(data.totalDue || 0);
    } catch (error) {
      console.error('Error loading due tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter tenants by search query
  const filteredTenants = dueTenants.filter(tenant => {
    const query = searchQuery.toLowerCase();
    return (
      tenant.name?.toLowerCase().includes(query) ||
      tenant.mobile?.includes(query)
    );
  });

  // Open payment dialog for Full Pay
  const handleFullPayClick = (tenant) => {
    setSelectedTenant(tenant);
    setPaymentType('full');
    setPaymentForm({
      amount: tenant.dueAmount?.toString() || '',
      month: months[new Date().getMonth()],
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'CASH',
    });
    setPaymentDialogOpen(true);
  };

  // Open payment dialog for Partial Pay
  const handlePartialPayClick = (tenant) => {
    setSelectedTenant(tenant);
    setPaymentType('partial');
    setPaymentForm({
      amount: '',
      month: months[new Date().getMonth()],
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'CASH',
    });
    setPaymentDialogOpen(true);
  };

  // Calculate remaining due for partial payment
  const getRemainingDue = () => {
    if (!selectedTenant) return 0;
    const payAmount = parseFloat(paymentForm.amount) || 0;
    const remaining = (selectedTenant.dueAmount || 0) - payAmount;
    return Math.max(0, remaining);
  };

  // Submit payment
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTenant) return;

    const payAmount = parseFloat(paymentForm.amount);
    
    // Validation
    if (payAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (paymentType === 'partial' && payAmount >= selectedTenant.dueAmount) {
      alert('Partial payment amount must be less than the due amount. Use Full Pay for complete payment.');
      return;
    }

    try {
      await paymentAPI.create({
        tenantId: selectedTenant.tenantId,
        amount: payAmount,
        paymentDate: paymentForm.paymentDate,
        paymentMode: paymentForm.paymentMode,
        month: months.indexOf(paymentForm.month) + 1,
        year: new Date().getFullYear(),
        type: 'RENT',
        remarks: paymentType === 'partial' 
          ? `Partial rent payment for ${paymentForm.month} (Remaining: ₹${getRemainingDue().toLocaleString()})`
          : `Full rent payment for ${paymentForm.month}`,
      });
      
      setPaymentDialogOpen(false);
      setSelectedTenant(null);
      loadDueTenants(); // Refresh the list
      
      if (paymentType === 'partial') {
        alert(`Partial payment of ₹${payAmount.toLocaleString()} recorded successfully!\n\nRemaining Due: ₹${getRemainingDue().toLocaleString()}`);
      } else {
        alert('Full payment recorded successfully!');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="MANAGER">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="MANAGER">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Payment Due</h2>
            <p className="text-slate-600 mt-1">Tenants with pending payment for current month</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">Total Due Amount</p>
            <p className="text-2xl font-bold text-red-600">₹{totalDue.toLocaleString()}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {searchQuery 
                ? `${filteredTenants.length} of ${dueTenants.length} Tenants` 
                : `${dueTenants.length} Tenants with Payment Due`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTenants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Mobile</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Join Date</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Monthly Rent</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Paid This Month</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Due Amount</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTenants.map((tenant) => (
                      <tr key={tenant.tenantId} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4 text-sm font-medium text-slate-800">{tenant.name}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{tenant.mobile}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {tenant.joinDate ? format(new Date(tenant.joinDate), 'MMM dd, yyyy') : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-800 text-right">₹{tenant.monthlyRent?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm text-green-600 text-right">₹{tenant.paidThisMonth?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm font-medium text-red-600 text-right">₹{tenant.dueAmount?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          {/* Pay Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Wallet className="h-4 w-4 mr-1" />
                                Pay
                                <ChevronDown className="h-4 w-4 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleFullPayClick(tenant)}
                                className="cursor-pointer"
                              >
                                <CreditCard className="h-4 w-4 mr-2 text-green-600" />
                                Full Pay
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handlePartialPayClick(tenant)}
                                className="cursor-pointer"
                              >
                                <Coins className="h-4 w-4 mr-2 text-orange-600" />
                                Partial Pay
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                {searchQuery ? (
                  <p className="text-slate-500">No tenants found matching "{searchQuery}"</p>
                ) : (
                  <p className="text-slate-500">No pending payments. All tenants are up to date!</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Dialog */}
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {paymentType === 'full' ? (
                  <>
                    <CreditCard className="h-5 w-5 text-green-500" /> Full Pay
                  </>
                ) : (
                  <>
                    <Coins className="h-5 w-5 text-orange-500" /> Partial Pay
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            {selectedTenant && (
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                {/* Tenant Info */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="font-medium text-slate-800">{selectedTenant.name}</p>
                  <p className="text-sm text-slate-500">{selectedTenant.mobile}</p>
                </div>

                {/* Payment Details Card for Partial Pay */}
                {paymentType === 'partial' ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total Due Amount:</span>
                      <span className="font-semibold text-red-600">₹{selectedTenant.dueAmount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Amount Paying:</span>
                      <span className="font-semibold text-green-600">
                        ₹{(parseFloat(paymentForm.amount) || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t border-orange-200 pt-2 flex justify-between text-sm">
                      <span className="text-slate-700 font-medium">Remaining Due:</span>
                      <span className="font-bold text-orange-600">₹{getRemainingDue().toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total Due Amount:</span>
                      <span className="font-semibold text-red-600">₹{selectedTenant.dueAmount?.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-green-700 mt-2">Full payment will clear all dues for this month.</p>
                  </div>
                )}

                <div>
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    placeholder={paymentType === 'partial' ? 'Enter partial amount' : 'Full amount'}
                    max={paymentType === 'partial' ? selectedTenant.dueAmount - 1 : undefined}
                    required
                  />
                  {paymentType === 'partial' && (
                    <p className="text-xs text-slate-500 mt-1">
                      Enter amount less than ₹{selectedTenant.dueAmount?.toLocaleString()}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Month *</Label>
                  <Select 
                    value={paymentForm.month} 
                    onValueChange={(value) => setPaymentForm({ ...paymentForm, month: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Payment Date *</Label>
                  <Input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>Payment Mode *</Label>
                  <Select 
                    value={paymentForm.paymentMode} 
                    onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentMode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="CARD">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className={`w-full ${paymentType === 'partial' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {paymentType === 'partial' ? 'Record Partial Payment' : 'Record Full Payment'}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
