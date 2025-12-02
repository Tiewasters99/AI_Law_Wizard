"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AttorneyProfileFormProps {
  onSubmit: (data: {
    barLicense: string;
    specialty?: string;
    yearsOfExperience?: number;
    bio?: string;
    location?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

const SPECIALTIES = [
  "Criminal Law",
  "Corporate Law",
  "Family Law",
  "Real Estate Law",
  "Immigration Law",
  "Personal Injury",
  "Employment Law",
  "Intellectual Property",
  "Tax Law",
  "Other",
];

export function AttorneyProfileForm({
  onSubmit,
  isLoading = false,
}: AttorneyProfileFormProps) {
  const [formData, setFormData] = useState({
    barLicense: "",
    specialty: "",
    yearsOfExperience: "",
    bio: "",
    location: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      // Clear error when user starts typing
      setErrors(prev => {
        if (prev[name]) {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        }
        return prev;
      });
    },
    []
  );

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.barLicense.trim()) {
      newErrors.barLicense = "Bar license number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.barLicense]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validate()) {
        return;
      }

      await onSubmit({
        barLicense: formData.barLicense.trim(),
        specialty: formData.specialty || undefined,
        yearsOfExperience: formData.yearsOfExperience
          ? parseInt(formData.yearsOfExperience, 10)
          : undefined,
        bio: formData.bio.trim() || undefined,
        location: formData.location.trim() || undefined,
      });
    },
    [formData, validate, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Bar License */}
      <div>
        <label
          htmlFor="barLicense"
          className="block text-sm font-semibold text-foreground mb-2"
        >
          Bar License Number <span className="text-destructive">*</span>
        </label>
        <Input
          id="barLicense"
          name="barLicense"
          type="text"
          value={formData.barLicense}
          onChange={handleChange}
          required
          className="w-full"
          placeholder="Enter your bar license number"
        />
        {errors.barLicense && (
          <p className="mt-1 text-sm text-destructive">{errors.barLicense}</p>
        )}
      </div>

      {/* Specialty */}
      <div>
        <label
          htmlFor="specialty"
          className="block text-sm font-semibold text-foreground mb-2"
        >
          Specialty
        </label>
        <select
          id="specialty"
          name="specialty"
          value={formData.specialty}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">Select a specialty</option>
          {SPECIALTIES.map(specialty => (
            <option key={specialty} value={specialty}>
              {specialty}
            </option>
          ))}
        </select>
      </div>

      {/* Years of Experience */}
      <div>
        <label
          htmlFor="yearsOfExperience"
          className="block text-sm font-semibold text-foreground mb-2"
        >
          Years of Experience
        </label>
        <Input
          id="yearsOfExperience"
          name="yearsOfExperience"
          type="number"
          min="0"
          max="50"
          value={formData.yearsOfExperience}
          onChange={handleChange}
          className="w-full"
          placeholder="0"
        />
      </div>

      {/* Bio */}
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-semibold text-foreground mb-2"
        >
          Bio
        </label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={4}
          className="w-full"
          placeholder="Tell us about your legal background and expertise..."
        />
      </div>

      {/* Location */}
      <div>
        <label
          htmlFor="location"
          className="block text-sm font-semibold text-foreground mb-2"
        >
          Location
        </label>
        <Input
          id="location"
          name="location"
          type="text"
          value={formData.location}
          onChange={handleChange}
          className="w-full"
          placeholder="City, State"
        />
      </div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-semibold shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              Creating Profile...
            </span>
          ) : (
            "Create Attorney Profile"
          )}
        </Button>
      </motion.div>
    </form>
  );
}



