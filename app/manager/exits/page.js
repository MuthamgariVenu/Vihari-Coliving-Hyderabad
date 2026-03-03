'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { exitRequestAPI, tenantAPI } from '@/lib/api';
import { LogOut, Send, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function ManagerExitsPage() {
  const [exitRequests, setExitRequests] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [exitsData, tenantsData] = await Promise.all([
        exitRequestAPI.getAll(),
        tenantAPI.getAll(),
      ]);
      setExitRequests(exitsData);
      setTenants(tenantsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTenantName = (tenantId) => {
    const tenant = tenants.find(t => t.tenantId === tenantId);
    return tenant ? tenant.name : 'Unknown Tenant';
  };

  const getTenantMobile = (tenantId) => {
    const tenant = tenants.find(t => t.tenantId === tenantId);
    return tenant ? tenant.mobile : '';
  };

  const handleSendToAdmin = async (exitRequestId) => {
    if (!confirm('Send this exit request to Admin for approval?')) return;
    try {
      await exitRequestAPI.update(exitRequestId, { status: 'PENDING' });
      loadData();
      alert('Exit request sent to Admin for approval!');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleComplete = async (exitRequestId) => {
    if (!confirm('Complete exit process? This will free the bed and mark tenant as EXITED.')) return;
    try {
      await exitRequestAPI.complete(exitRequestId);
      loadData();
      alert('Exit process completed successfully! Tenant has been exited and bed is now available.');
    } catch (error) {
      alert(error.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
            <Clock className="h-4 w-4" /> Pending Admin Approval
          </span>
        );
      case 'ADMIN_APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
            <CheckCircle className="h-4 w-4" /> Admin Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
            <XCircle className="h-4 w-4" /> Rejected
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
            <CheckCircle className="h-4 w-4" /> Completed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">{status}</span>
        );
    }
  };

  return (
    <DashboardLayout role="MANAGER">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Exit Requests</h2>
          <p className="text-slate-600 mt-1">Manage tenant exit requests</p>
        </div>

        {/* Workflow Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-blue-800">
              <strong>Workflow:</strong> Exit requests require Admin approval before you can complete the exit process.
            </p>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {exitRequests.map((exit) => (
              <Card key={exit.exitRequestId}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                        <LogOut className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-slate-800">{getTenantName(exit.tenantId)}</h4>
                        <p className="text-sm text-slate-500">{getTenantMobile(exit.tenantId)}</p>
                        {exit.reason && (
                          <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded">
                            <strong>Reason:</strong> {exit.reason}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                          <span>Expected Exit: <strong>{format(new Date(exit.expectedExitDate), 'MMM dd, yyyy')}</strong></span>
                          <span>•</span>
                          <span>Requested: {format(new Date(exit.requestDate), 'MMM dd, yyyy')}</span>
                        </div>
                        {exit.refundAmount > 0 && (
                          <p className="text-sm text-green-600 mt-2">Refund Amount: ₹{exit.refundAmount.toLocaleString()}</p>
                        )}
                        <div className="mt-3">
                          {getStatusBadge(exit.status)}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col gap-2">
                      {exit.status === 'PENDING' && (
                        <Button
                          size="sm"
                          onClick={() => handleSendToAdmin(exit.exitRequestId)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="mr-2 h-4 w-4" /> Send to Admin
                        </Button>
                      )}
                      
                      {/* Exit Button - Only enabled when Admin Approved */}
                      <Button
                        size="sm"
                        onClick={() => handleComplete(exit.exitRequestId)}
                        disabled={exit.status !== 'ADMIN_APPROVED'}
                        className={exit.status === 'ADMIN_APPROVED' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-slate-300 cursor-not-allowed'
                        }
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Exit Tenant
                      </Button>
                      
                      {exit.status !== 'ADMIN_APPROVED' && exit.status !== 'COMPLETED' && exit.status !== 'REJECTED' && (
                        <p className="text-xs text-slate-500 text-center">Waiting for Admin approval</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {exitRequests.length === 0 && (
              <div className="text-center py-12">
                <LogOut className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No exit requests found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
