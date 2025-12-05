"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ClientProfileFormProps {
  onSubmit: (data: {
    companyName?: string;
    industry?: string;
    location?: string;
    phone?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Real Estate",
  "Retail",
  "Manufacturing",
  "Education",
  "Legal Services",
  "Consulting",
  "Other",
];

export function ClientProfileForm({
  onSubmit,
  isLoading = false,
}: ClientProfileFormProps) {
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    location: "",
    phone: "",
  });

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      await onSubmit({
        companyName: formData.companyName.trim() || undefined,
        industry: formData.industry || undefined,
        location: formData.location.trim() || undefined,
        phone: formData.phone.trim() || undefined,
      });
    },
    [formData, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Company Name */}
      <div>
        <label
          htmlFor="companyName"
          className="block text-sm font-semibold text-foreground mb-2"
        >
          Company Name
        </label>
        <Input
          id="companyName"
          name="companyName"
          type="text"
          value={formData.companyName}
          onChange={handleChange}
          className="w-full"
          placeholder="Your company name (optional)"
        />
      </div>

      {/* Industry */}
      <div>
        <label
          htmlFor="industry"
          className="block text-sm font-semibold text-foreground mb-2"
        >
          Industry
        </label>
        <select
          id="industry"
          name="industry"
          value={formData.industry}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">Select an industry (optional)</option>
          {INDUSTRIES.map(industry => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
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
          placeholder="City, State (optional)"
        />
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-semibold text-foreground mb-2"
        >
          Phone
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          className="w-full"
          placeholder="(555) 123-4567 (optional)"
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
            "Create Client Profile"
          )}
        </Button>
      </motion.div>
    </form>
  );
}







