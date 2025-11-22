"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Save,
  Loader2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
} from "lucide-react";
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

interface FormData {
  // Mandatory fields
  specialty: string;
  barLicense: string;
  yearsOfExperience: string;

  // Optional fields
  name: string;
  email: string;
  phone: string;
  barNumber: string;
  firmName: string;
  bio: string;
  location: string;
}

interface FormErrors {
  specialty?: string;
  barLicense?: string;
  yearsOfExperience?: string;
  email?: string;
}

export default function OnboardingPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    specialty: "",
    barLicense: "",
    yearsOfExperience: "",
    name: "",
    email: "",
    phone: "",
    barNumber: "",
    firmName: "",
    bio: "",
    location: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Load existing profile data if available
  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user) return;

      try {
        setLoading(true);
        const response = await fetch("/api/attorney/profile");

        if (response.ok) {
          const data = await response.json();
          const profile = data.profile;

          // Pre-fill form with existing data
          setFormData({
            specialty: profile.specialty || "",
            barLicense: profile.barLicense || "",
            yearsOfExperience: profile.yearsOfExperience?.toString() || "",
            name: profile.name || "",
            email: profile.email || "",
            phone: profile.phone || "",
            barNumber: profile.barNumber || "",
            firmName: profile.firmName || "",
            bio: profile.bio || "",
            location: profile.location || "",
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [session?.user]);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Validate mandatory fields
    if (!formData.specialty.trim()) {
      newErrors.specialty = "Specialty is required";
    }

    if (!formData.barLicense.trim()) {
      newErrors.barLicense = "Bar License is required";
    }

    if (!formData.yearsOfExperience.trim()) {
      newErrors.yearsOfExperience = "Years of Experience is required";
    } else {
      const years = parseInt(formData.yearsOfExperience, 10);
      if (isNaN(years) || years <= 0) {
        newErrors.yearsOfExperience = "Years of Experience must be a positive number";
      }
    }

    // Validate email format if provided
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle input change
  const handleChange = useCallback(
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      // Clear error for this field when user starts typing
      if (errors[field as keyof FormErrors]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field as keyof FormErrors];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        toast.error("Please fill in all required fields");
        return;
      }

      setSaving(true);

      try {
        const payload: any = {
          specialty: formData.specialty.trim(),
          barLicense: formData.barLicense.trim(),
          yearsOfExperience: parseInt(formData.yearsOfExperience, 10),
        };

        // Add optional fields if provided
        if (formData.name.trim()) payload.name = formData.name.trim();
        if (formData.email.trim()) payload.email = formData.email.trim();
        if (formData.phone.trim()) payload.phone = formData.phone.trim();
        if (formData.barNumber.trim()) payload.barNumber = formData.barNumber.trim();
        if (formData.firmName.trim()) payload.firmName = formData.firmName.trim();
        if (formData.bio.trim()) payload.bio = formData.bio.trim();
        if (formData.location.trim()) payload.location = formData.location.trim();

        const response = await fetch("/api/attorney/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update profile");
        }

        // Refresh session to update profileComplete status
        await updateSession();

        toast.success("Profile completed successfully!");
        
        // Redirect to dashboard
        router.push("/attorney/dashboard");
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to complete profile"
        );
      } finally {
        setSaving(false);
      }
    },
    [formData, validateForm, updateSession, router]
  );

  // Check if form has mandatory fields filled (for visual feedback)
  const hasMandatoryFields = useMemo(() => {
    return (
      formData.specialty.trim() !== "" &&
      formData.barLicense.trim() !== "" &&
      formData.yearsOfExperience.trim() !== ""
    );
  }, [formData]);

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
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
          <User className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-1">
            Fill in the required information to get started
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-2">
        <Badge
          variant={hasMandatoryFields ? "default" : "outline"}
          className={hasMandatoryFields ? "bg-primary text-primary-foreground" : ""}
        >
          {hasMandatoryFields ? "Ready to Submit" : "Required Fields Missing"}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {hasMandatoryFields ? "✓ All mandatory fields completed" : "Please complete mandatory fields"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Professional Information - Mandatory Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Professional Information
            </CardTitle>
            <CardDescription>
              These fields are required to complete your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Legal Specialty <span className="text-destructive">*</span>
                </label>
                <Input
                  value={formData.specialty}
                  onChange={handleChange("specialty")}
                  placeholder="e.g., Corporate Law, Criminal Defense, Family Law"
                  className={errors.specialty ? "border-destructive" : ""}
                  required
                />
                {errors.specialty && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.specialty}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Bar License Number <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={formData.barLicense}
                    onChange={handleChange("barLicense")}
                    placeholder="Enter your bar license number"
                    className={errors.barLicense ? "border-destructive" : ""}
                    required
                  />
                  {errors.barLicense && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.barLicense}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Years of Experience <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={handleChange("yearsOfExperience")}
                    placeholder="e.g., 5"
                    min="1"
                    max="50"
                    className={errors.yearsOfExperience ? "border-destructive" : ""}
                    required
                  />
                  {errors.yearsOfExperience && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.yearsOfExperience}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Bar Number <span className="text-muted-foreground text-xs">(Optional)</span>
                </label>
                <Input
                  value={formData.barNumber}
                  onChange={handleChange("barNumber")}
                  placeholder="Enter your bar number (if different from license)"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information - Optional Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Contact Information
            </CardTitle>
            <CardDescription>
              Optional contact details (you can skip these)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Full Name <span className="text-muted-foreground text-xs">(Optional)</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={handleChange("name")}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Email <span className="text-muted-foreground text-xs">(Optional)</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  placeholder="john@example.com"
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Phone <span className="text-muted-foreground text-xs">(Optional)</span>
                </label>
                <Input
                  value={formData.phone}
                  onChange={handleChange("phone")}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Location <span className="text-muted-foreground text-xs">(Optional)</span>
                </label>
                <Input
                  value={formData.location}
                  onChange={handleChange("location")}
                  placeholder="City, State"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Details - Optional Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Additional Details
            </CardTitle>
            <CardDescription>
              Optional information about your practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Law Firm Name <span className="text-muted-foreground text-xs">(Optional)</span>
                </label>
                <Input
                  value={formData.firmName}
                  onChange={handleChange("firmName")}
                  placeholder="Smith & Associates"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Professional Bio <span className="text-muted-foreground text-xs">(Optional)</span>
                </label>
                <Textarea
                  value={formData.bio}
                  onChange={handleChange("bio")}
                  placeholder="Tell us about your legal practice, areas of expertise, and professional background..."
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/attorney/dashboard")}
            disabled={saving}
          >
            Skip for Now
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 py-3 font-semibold shadow-sm transition-all duration-200"
            disabled={saving || !hasMandatoryFields}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Complete Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

