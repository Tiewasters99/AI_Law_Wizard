'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Settings, Plus, Edit, Trash2, Save, X, DollarSign, Coins, Users, BarChart3, Shield } from 'lucide-react';
import Layout from '../components/Layout';
import { TokenPackage, formatPrice } from '../lib/stripe';

interface CreatePackageData {
  name: string;
  tokens: number;
  priceInCents: number;
  description: string;
}

const AdminPage = () => {
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TokenPackage | null>(null);
  const [createData, setCreateData] = useState<CreatePackageData>({
    name: '',
    tokens: 10,
    priceInCents: 1000,
    description: '',
  });
  
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.role !== 'LAWYER') {
      router.push('/');
      return;
    }
    loadPackages();
  }, [session, router]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/token-packages');
      if (!response.ok) throw new Error('Failed to load packages');
      
      const data = await response.json();
      setPackages(data.packages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePackage = async () => {
    try {
      const response = await fetch('/api/token-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData),
      });

      if (!response.ok) throw new Error('Failed to create package');

      await loadPackages();
      setShowCreateForm(false);
      setCreateData({ name: '', tokens: 10, priceInCents: 1000, description: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create package');
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      const response = await fetch(`/api/token-packages/${packageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete package');

      await loadPackages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete package');
    }
  };

  const handleToggleActive = async (packageId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/token-packages/${packageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!response.ok) throw new Error('Failed to update package');

      await loadPackages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update package');
    }
  };

  if (session?.user?.role !== 'LAWYER') {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You need admin privileges to access this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage token packages and system configuration</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <Coins className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Packages</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {packages.filter(p => p.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">$0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Conversions</p>
                  <p className="text-2xl font-bold text-gray-900">0%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Token Packages Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Coins className="w-5 h-5" />
                  <span>Token Packages</span>
                </CardTitle>
                <CardDescription>
                  Manage pricing and token packages for users
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Package
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-24"></div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">{error}</div>
            ) : (
              <div className="space-y-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Coins className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                          <Badge variant={pkg.isActive ? "default" : "secondary"}>
                            {pkg.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{pkg.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span>{pkg.tokens} tokens</span>
                          <span>{formatPrice(pkg.priceInCents)}</span>
                          <span>{formatPrice(pkg.priceInCents / pkg.tokens)} per token</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(pkg.id, pkg.isActive)}
                      >
                        {pkg.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPackage(pkg)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Package Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Create Token Package</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateForm(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Package Name</label>
                  <Input
                    value={createData.name}
                    onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                    placeholder="e.g., Starter Pack"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Tokens</label>
                  <Input
                    type="number"
                    value={createData.tokens}
                    onChange={(e) => setCreateData({ ...createData, tokens: parseInt(e.target.value) || 0 })}
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Price (in cents)</label>
                  <Input
                    type="number"
                    value={createData.priceInCents}
                    onChange={(e) => setCreateData({ ...createData, priceInCents: parseInt(e.target.value) || 0 })}
                    placeholder="1000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formatPrice(createData.priceInCents)} total
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={createData.description}
                    onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                    placeholder="Package description..."
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={handleCreatePackage}
                    className="flex-1"
                    disabled={!createData.name || createData.tokens <= 0 || createData.priceInCents <= 0}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Create Package
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminPage;
