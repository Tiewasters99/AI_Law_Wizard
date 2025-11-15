"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  profileComplete: boolean;
  specialty: string;
  barLicense: string;
  bio: string;
  yearsOfExperience: number;
  firmName: string;
  verified: boolean;
  phone: string;
  address: string;
  website: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    bio: "",
    specialty: "",
    barLicense: "",
    yearsOfExperience: "",
    firmName: "",
  });

  // Load profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user) return;

      try {
        setLoading(true);
        const response = await fetch("/api/attorney/profile");

        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const data = await response.json();
        setProfileData(data.profile);

        // Pre-fill form with existing data
        setFormData({
          name: data.profile.name || "",
          email: data.profile.email || "",
          phone: data.profile.phone || "",
          address: data.profile.address || "",
          website: data.profile.website || "",
          bio: data.profile.bio || "",
          specialty: data.profile.specialty || "",
          barLicense: data.profile.barLicense || "",
          yearsOfExperience: data.profile.yearsOfExperience?.toString() || "",
          firmName: data.profile.firmName || "",
        });
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [session?.user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/attorney/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Update local profile data
      setProfileData(data.profile);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="animate-pulse">
          <div className="h-16 bg-muted rounded mb-6"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header with profile status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage your attorney profile
            </p>
          </div>
        </div>
        {profileData && (
          <div className="flex items-center space-x-2">
            {profileData.verified ? (
              <Badge className="bg-accent text-primary border-primary/20">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-primary border-primary/20"
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                Pending Verification
              </Badge>
            )}
            <Badge variant="outline" className="text-primary border-primary/20">
              {profileData.role === "ATTORNEY" || profileData.role === "LAWYER"
                ? "Attorney"
                : "Client"}
            </Badge>
          </div>
        )}
      </div>

      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Your personal and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Full Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={e =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Website
                </label>
                <Input
                  value={formData.website}
                  onChange={e =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">
                  Address
                </label>
                <Input
                  value={formData.address}
                  onChange={e =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="123 Main St, City, State 12345"
                />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Professional Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
          <CardDescription>
            Your legal practice details and credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Legal Specialty
                </label>
                <Input
                  value={formData.specialty}
                  onChange={e =>
                    setFormData({ ...formData, specialty: e.target.value })
                  }
                  placeholder="Corporate Law, Criminal Defense, etc."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Bar License Number
                </label>
                <Input
                  value={formData.barLicense}
                  onChange={e =>
                    setFormData({ ...formData, barLicense: e.target.value })
                  }
                  placeholder="Bar License Number"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Years of Experience
                </label>
                <Input
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      yearsOfExperience: e.target.value,
                    })
                  }
                  placeholder="5"
                  min="0"
                  max="50"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Law Firm Name
                </label>
                <Input
                  value={formData.firmName}
                  onChange={e =>
                    setFormData({ ...formData, firmName: e.target.value })
                  }
                  placeholder="Smith & Associates"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Professional Bio
              </label>
              <Textarea
                value={formData.bio}
                onChange={e =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell us about your legal practice, areas of expertise, and professional background..."
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          className="bg-primary hover:bg-primary/90"
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
