"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession, signOut, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  Scale,
  Briefcase,
  Loader2,
  LogOut,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

type Role = "ATTORNEY" | "CUSTOMER" | null;

interface AttorneyFormData {
  barLicense: string;
  specialty?: string;
  yearsOfExperience?: number;
  bio?: string;
  location?: string;
}

interface ClientFormData {
  companyName?: string;
  industry?: string;
  location?: string;
  phone?: string;
}

export default function RoleSelectionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [attorneyFormData, setAttorneyFormData] = useState<AttorneyFormData>({
    barLicense: "",
    specialty: "",
    yearsOfExperience: undefined,
    bio: "",
    location: "",
  });
  const [clientFormData, setClientFormData] = useState<ClientFormData>({
    companyName: "",
    industry: "",
    location: "",
    phone: "",
  });

  // Track redirect state to prevent infinite loops
  const redirectInitiated = useRef(false);

  // All hooks must be called before any early returns
  const handleRoleSelect = useCallback((role: "ATTORNEY" | "CUSTOMER") => {
    setSelectedRole(role);
    setError("");
  }, []);

  const handleAttorneyFormChange = useCallback(
    (field: keyof AttorneyFormData, value: string | number | undefined) => {
      setAttorneyFormData(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleClientFormChange = useCallback(
    (field: keyof ClientFormData, value: string) => {
      setClientFormData(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  const validateAttorneyForm = useCallback((): boolean => {
    if (!attorneyFormData.barLicense.trim()) {
      setError("Bar license is required");
      return false;
    }
    return true;
  }, [attorneyFormData.barLicense]);

  const validateClientForm = useCallback((): boolean => {
    // Client form has no required fields, all optional
    return true;
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!selectedRole) {
        setError("Please select a role");
        return;
      }

      if (selectedRole === "ATTORNEY" && !validateAttorneyForm()) {
        return;
      }

      if (selectedRole === "CUSTOMER" && !validateClientForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        const profileData =
          selectedRole === "ATTORNEY"
            ? {
                barLicense: attorneyFormData.barLicense.trim(),
                specialty: attorneyFormData.specialty?.trim() || undefined,
                yearsOfExperience: attorneyFormData.yearsOfExperience
                  ? parseInt(attorneyFormData.yearsOfExperience.toString())
                  : undefined,
                bio: attorneyFormData.bio?.trim() || undefined,
                location: attorneyFormData.location?.trim() || undefined,
              }
            : {
                companyName: clientFormData.companyName?.trim() || undefined,
                industry: clientFormData.industry?.trim() || undefined,
                location: clientFormData.location?.trim() || undefined,
                phone: clientFormData.phone?.trim() || undefined,
              };

        const response = await fetch("/api/user/role/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: selectedRole,
            profileData,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Check if error is about user already having a role
          const errorMessage = data.error || "Failed to create profile";
          if (
            errorMessage.includes("already has a role") ||
            errorMessage.includes("User already has a role")
          ) {
            // User already has a role - refresh session and redirect
            const freshSession = await getSession();
            if (freshSession?.user?.role) {
              if (freshSession.user.role === "ATTORNEY") {
                router.push("/attorney/dashboard");
              } else if (freshSession.user.role === "CUSTOMER") {
                router.push("/client/dashboard");
              }
              return;
            }
          }
          throw new Error(errorMessage);
        }

        toast.success("Profile created successfully!");

        // Refresh session to get updated role
        await getSession();

        // Redirect to appropriate dashboard
        if (selectedRole === "ATTORNEY") {
          router.push("/attorney/dashboard");
        } else {
          router.push("/client/dashboard");
        }
      } catch (error) {
        console.error("Profile creation error:", error);
        setError(
          error instanceof Error ? error.message : "Failed to create profile"
        );
        toast.error("Failed to create profile");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      selectedRole,
      attorneyFormData,
      clientFormData,
      validateAttorneyForm,
      validateClientForm,
      router,
    ]
  );

  const handleLogout = useCallback(async () => {
    await signOut({ callbackUrl: "/auth/login" });
  }, []);

  // Memoized callbacks for inline functions
  const handleBackToSelection = useCallback(() => {
    setSelectedRole(null);
  }, []);

  const handleSelectAttorney = useCallback(() => {
    handleRoleSelect("ATTORNEY");
  }, [handleRoleSelect]);

  const handleSelectCustomer = useCallback(() => {
    handleRoleSelect("CUSTOMER");
  }, [handleRoleSelect]);

  // Redirect if user already has a role or not authenticated
  // Refresh session to ensure we have the latest role data from database
  useEffect(() => {
    // Prevent multiple redirect attempts
    if (redirectInitiated.current) {
      return;
    }

    const checkUserRole = async () => {
      if (status === "unauthenticated") {
        redirectInitiated.current = true;
        router.push("/auth/login");
        return;
      }

      if (status === "authenticated") {
        // Refresh session to get latest role from database
        const freshSession = await getSession();

        if (freshSession?.user?.role) {
          // User already has a role set - redirect to appropriate dashboard
          redirectInitiated.current = true;
          if (freshSession.user.role === "ATTORNEY") {
            router.push("/attorney/dashboard");
          } else if (freshSession.user.role === "CUSTOMER") {
            router.push("/client/dashboard");
          }
        }
        // If no role, user can stay on this page to select role
      }
    };

    checkUserRole();
  }, [status, router]);

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Logout Button */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Select Your Role
            </h1>
            <p className="text-muted-foreground mt-2">
              Choose your role to get started
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-destructive/10 border-l-4 border-destructive text-destructive p-4 rounded-xl"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Role Selection Cards */}
        {!selectedRole && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                onClick={handleSelectAttorney}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Scale className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Attorney</CardTitle>
                  </div>
                  <CardDescription>
                    Legal professionals providing services to clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Document analysis and review
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Client consultation management
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Legal research tools
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                onClick={handleSelectCustomer}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Client</CardTitle>
                  </div>
                  <CardDescription>
                    Individuals or businesses seeking legal services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Find qualified attorneys
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Request consultations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Manage legal projects
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Attorney Form */}
        <AnimatePresence>
          {selectedRole === "ATTORNEY" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">
                        Attorney Profile
                      </CardTitle>
                      <CardDescription>
                        Complete your attorney profile to get started
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={handleBackToSelection}
                      className="text-muted-foreground"
                    >
                      Back
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Bar License Number{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="text"
                        value={attorneyFormData.barLicense}
                        onChange={e =>
                          handleAttorneyFormChange("barLicense", e.target.value)
                        }
                        placeholder="Enter your bar license number"
                        required
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Specialty
                        </label>
                        <Input
                          type="text"
                          value={attorneyFormData.specialty || ""}
                          onChange={e =>
                            handleAttorneyFormChange(
                              "specialty",
                              e.target.value
                            )
                          }
                          placeholder="e.g., Corporate Law, Criminal Defense"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Years of Experience
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          value={attorneyFormData.yearsOfExperience || ""}
                          onChange={e =>
                            handleAttorneyFormChange(
                              "yearsOfExperience",
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined
                            )
                          }
                          placeholder="0"
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Location
                      </label>
                      <Input
                        type="text"
                        value={attorneyFormData.location || ""}
                        onChange={e =>
                          handleAttorneyFormChange("location", e.target.value)
                        }
                        placeholder="City, State"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Professional Bio
                      </label>
                      <Textarea
                        value={attorneyFormData.bio || ""}
                        onChange={e =>
                          handleAttorneyFormChange("bio", e.target.value)
                        }
                        placeholder="Tell us about your legal practice and areas of expertise..."
                        rows={4}
                        className="w-full"
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBackToSelection}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Profile"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Client Form */}
        <AnimatePresence>
          {selectedRole === "CUSTOMER" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Client Profile</CardTitle>
                      <CardDescription>
                        Complete your client profile to get started
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={handleBackToSelection}
                      className="text-muted-foreground"
                    >
                      Back
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Company Name
                      </label>
                      <Input
                        type="text"
                        value={clientFormData.companyName || ""}
                        onChange={e =>
                          handleClientFormChange("companyName", e.target.value)
                        }
                        placeholder="Enter your company name"
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Industry
                        </label>
                        <Input
                          type="text"
                          value={clientFormData.industry || ""}
                          onChange={e =>
                            handleClientFormChange("industry", e.target.value)
                          }
                          placeholder="e.g., Technology, Healthcare"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Phone
                        </label>
                        <Input
                          type="tel"
                          value={clientFormData.phone || ""}
                          onChange={e =>
                            handleClientFormChange("phone", e.target.value)
                          }
                          placeholder="+1 (555) 000-0000"
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Location
                      </label>
                      <Input
                        type="text"
                        value={clientFormData.location || ""}
                        onChange={e =>
                          handleClientFormChange("location", e.target.value)
                        }
                        placeholder="City, State"
                        className="w-full"
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBackToSelection}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Profile"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
