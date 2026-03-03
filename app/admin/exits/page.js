'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { exitRequestAPI, tenantAPI, branchAPI } from '@/lib/api';
import { LogOut, CheckCircle, XCircle, Clock, Building } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminExitsPage() {
  const [exitRequests, setExitRequests] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [exitsData, tenantsData, branchesData] = await Promise.all([
        exitRequestAPI.getAll(),
        tenantAPI.getAll(),
        branchAPI.getAll(),
      ]);
      setExitRequests(exitsData);
      setTenants(tenantsData);
      setBranches(branchesData);
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

  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.branchId === branchId);
    return branch ? branch.name : 'Unknown Branch';
  };

  const handleApprove = async (exitRequestId) => {
    if (!confirm('Approve this exit request? Manager will be able to complete the exit process.')) return;
    try {
      await exitRequestAPI.update(exitRequestId, { status: 'ADMIN_APPROVED' });
      loadData();
      alert('Exit request approved! Manager can now complete the exit process.');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleReject = async (exitRequestId) => {
    if (!confirm('Reject this exit request?')) return;
    try {
      await exitRequestAPI.update(exitRequestId, { status: 'REJECTED' });
      loadData();
      alert('Exit request rejected.');
    } catch (error) {
      alert(error.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
            <Clock className="h-4 w-4" /> Pending Approval
          </span>
        );
      case 'ADMIN_APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
            <CheckCircle className="h-4 w-4" /> Approved
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

  // Filter pending requests for approval section
  const pendingRequests = exitRequests.filter(e => e.status === 'PENDING');
  const otherRequests = exitRequests.filter(e => e.status !== 'PENDING');

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Exit Requests</h2>
          <p className="text-slate-600 mt-1">Approve or reject tenant exit requests</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Pending Approval Section */}
            {pendingRequests.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" /> 
                  Pending Approval ({pendingRequests.length})
                </h3>
                {pendingRequests.map((exit) => (
                  <Card key={exit.exitRequestId} className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                            <LogOut className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg text-slate-800">{getTenantName(exit.tenantId)}</h4>
                            <p className="text-sm text-slate-500">{getTenantMobile(exit.tenantId)}</p>
                            <div className="flex items-center gap-2 mt-1 text-sm text-blue-600">
                              <Building className="h-4 w-4" />
                              <span>{getBranchName(exit.branchId)}</span>
                            </div>
                            {exit.reason && (
                              <p className="text-sm text-slate-600 mt-2 bg-white p-2 rounded">
                                <strong>Reason:</strong> {exit.reason}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                              <span>Expected Exit: <strong>{format(new Date(exit.expectedExitDate), 'MMM dd, yyyy')}</strong></span>
                              <span>•</span>
                              <span>Requested: {format(new Date(exit.requestDate), 'MMM dd, yyyy')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(exit.exitRequestId)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(exit.exitRequestId)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="mr-2 h-4 w-4" /> Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Other Requests */}
            {otherRequests.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-800">
                  {pendingRequests.length > 0 ? 'Other Requests' : 'All Requests'}
                </h3>
                {otherRequests.map((exit) => (
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
                            <div className="flex items-center gap-2 mt-1 text-sm text-blue-600">
                              <Building className="h-4 w-4" />
                              <span>{getBranchName(exit.branchId)}</span>
                            </div>
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
                            <div className="mt-3">
                              {getStatusBadge(exit.status)}
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          {exit.status === 'ADMIN_APPROVED' && (
                            <p className="text-sm text-green-600 text-center">Waiting for Manager<br/>to complete exit</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {exitRequests.length === 0 && (
              <div className="text-center py-12">
                <LogOut className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No exit requests found</p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
