'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useEffect, useState } from 'react';
import Layout from '@/app/components/Layout';

// Define types for profile data
interface LawyerProfileData {
  specialty?: string;
  barLicense?: string;
  bio?: string;
  yearsOfExperience?: number;
}

interface CustomerProfileData {
  companyName?: string;
  address?: string;
  phone?: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<LawyerProfileData | CustomerProfileData | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (session) {
        // This is a placeholder for a real API call to fetch profile data
        // In a real app, you would fetch this from your database
       
      }
    };
    fetchProfile();
  }, [session]);

  if (status === 'loading') {
    return (
      <Layout>
        <div className="container mx-auto">
          <div>Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <div className="container mx-auto">
          <div>You are not signed in.</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Name:</strong> {session.user.name}</p>
            <p><strong>Email:</strong> {session.user.email}</p>
            <p><strong>Role:</strong> {session.user.role}</p>
            
            {session.user.role === 'LAWYER' && profile && (
              <div className="mt-4">
                <h3 className="font-bold">Lawyer Profile</h3>
                <p><strong>Specialty:</strong> {(profile as LawyerProfileData).specialty}</p>
                <p><strong>Bar License:</strong> {(profile as LawyerProfileData).barLicense}</p>
                <p><strong>Bio:</strong> {(profile as LawyerProfileData).bio}</p>
                <p><strong>Years of Experience:</strong> {(profile as LawyerProfileData).yearsOfExperience}</p>
              </div>
            )}

            {session.user.role === 'CUSTOMER' && profile && (
              <div className="mt-4">
                <h3 className="font-bold">Customer Profile</h3>
                <p><strong>Company Name:</strong> {(profile as CustomerProfileData).companyName}</p>
                <p><strong>Address:</strong> {(profile as CustomerProfileData).address}</p>
                <p><strong>Phone:</strong> {(profile as CustomerProfileData).phone}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
