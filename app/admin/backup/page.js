'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Database, Download, RefreshCw, Clock, Calendar, Hash, Filter, FileArchive } from 'lucide-react';

export default function BackupPage() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  // Date range filter
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/backup/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBackups(data);
      }
    } catch (error) {
      console.error('Error loading backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/backup/create', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromDate: fromDate || null,
          toDate: toDate || null
        })
      });
      if (res.ok) {
        const data = await res.json();
        const dateRangeInfo = data.dateRange ? `\nDate Range: ${data.dateRange}` : '';
        const countsInfo = data.recordCounts ? `\nRecords: ${data.recordCounts.tenants} tenants, ${data.recordCounts.payments} payments, ${data.recordCounts.expenses} expenses` : '';
        alert(`Backup created successfully!\n\nBackup ID: ${data.backupId}\nDate: ${data.backupDate}\nTime: ${data.backupTime}${dateRangeInfo}${countsInfo}`);
        loadBackups();
        // Clear date filters after successful backup
        setFromDate('');
        setToDate('');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create backup');
      }
    } catch (error) {
      alert('Error creating backup');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (fileName) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/backup/download/${fileName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Error downloading backup');
      }
    } catch (error) {
      alert('Error downloading backup');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const clearDateFilters = () => {
    setFromDate('');
    setToDate('');
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Database Backup</h2>
            <p className="text-slate-600 mt-1">Create and manage database backups</p>
          </div>
        </div>

        {/* Date Range Filter Card */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5 text-blue-500" />
              Date Range Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-slate-600">From Date</Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label className="text-slate-600">To Date</Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="flex gap-2">
                {(fromDate || toDate) && (
                  <Button variant="outline" onClick={clearDateFilters}>
                    Clear
                  </Button>
                )}
                <Button
                  onClick={handleCreateBackup}
                  disabled={creating}
                  className="bg-gradient-to-r from-blue-500 to-purple-500"
                >
                  {creating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Create Backup
                    </>
                  )}
                </Button>
              </div>
            </div>
            {(fromDate || toDate) && (
              <p className="text-sm text-blue-600 mt-3">
                <span className="font-medium">Note:</span> Backup will include data from {fromDate || 'start'} to {toDate || 'today'}. 
                Leave empty for full backup.
              </p>
            )}
            {!fromDate && !toDate && (
              <p className="text-sm text-slate-500 mt-3">
                Leave dates empty to create a full backup of all data.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Backup Contents Info */}
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <FileArchive className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Backup Contents</p>
                <ul className="text-sm text-green-700 mt-1 list-disc list-inside">
                  <li>Full tenant details with branch, room, and bed information</li>
                  <li>Tenant ID proof files (Aadhaar, PAN, etc.)</li>
                  <li>All payments, expenses, and financial data</li>
                  <li>Complaints, exit requests, and operational data</li>
                  <li>Organized JSON files for easy data access</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backup History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Backup History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center py-12">
                <Database className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No backups found. Create your first backup!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-600">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          Backup ID
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Date
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Time
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600">Date Range</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600">Size</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backups.map((backup) => (
                      <tr key={backup.backupId} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">
                            {backup.backupId}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{backup.backupDate}</td>
                        <td className="py-3 px-4 text-slate-700">{backup.backupTime}</td>
                        <td className="py-3 px-4 text-slate-600 text-sm">{backup.dateRange || 'All Data'}</td>
                        <td className="py-3 px-4 text-slate-600">{formatFileSize(backup.size)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            backup.status === 'COMPLETED' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {backup.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(backup.fileName)}
                            className="gap-1"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
