"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Globe,
  Search,
  MapPin,
  Star,
  Briefcase,
  FileText,
  Send,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Attorney {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
  practiceAreas: string[];
  yearsOfExperience: number | null;
  location: string | null;
  rating: number | null;
  casesHandled: number | null;
  availability: string | null;
  hourlyRate: number | null;
}

export default function MiniversePage() {
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [filteredAttorneys, setFilteredAttorneys] = useState<Attorney[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPracticeArea, setSelectedPracticeArea] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("");

  // Fetch attorneys from database
  useEffect(() => {
    fetchAttorneys();
  }, []);

  const fetchAttorneys = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/client/attorneys");

      if (!response.ok) {
        throw new Error("Failed to fetch attorneys");
      }

      const data = await response.json();

      if (data.success) {
        setAttorneys(data.attorneys);
        setFilteredAttorneys(data.attorneys);
      }
    } catch (error) {
      console.error("Error fetching attorneys:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter attorneys based on search and filters
  useEffect(() => {
    let filtered = attorneys;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        attorney =>
          attorney.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attorney.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attorney.practiceAreas.some(area =>
            area.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Practice area filter
    if (selectedPracticeArea && selectedPracticeArea !== "all") {
      filtered = filtered.filter(attorney =>
        attorney.practiceAreas.includes(selectedPracticeArea)
      );
    }

    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter(attorney =>
        attorney.location
          ?.toLowerCase()
          .includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredAttorneys(filtered);
  }, [searchQuery, selectedPracticeArea, selectedLocation, attorneys]);

  // Get unique practice areas
  const practiceAreas = Array.from(
    new Set(attorneys.flatMap(a => a.practiceAreas))
  ).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Attorney Miniverse...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 sm:py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center mb-3 sm:mb-4 gap-2 sm:gap-3">
              <Globe className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center sm:text-left">
                Attorney Miniverse™
              </h1>
            </div>
            <p className="text-center text-sm sm:text-base md:text-lg lg:text-xl text-blue-100 px-4">
              Explore attorney profiles in 3D, read their articles, and connect
              instantly
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search attorneys..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Practice Area Filter */}
            <select
              value={selectedPracticeArea}
              onChange={e => setSelectedPracticeArea(e.target.value)}
              className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground text-sm sm:text-base focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="all">All Practice Areas</option>
              {practiceAreas.map(area => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>

            {/* Location Filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Location..."
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className="pl-10"
              />
              {selectedLocation && (
                <button
                  onClick={() => setSelectedLocation("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery ||
            selectedPracticeArea !== "all" ||
            selectedLocation) && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs sm:text-sm text-muted-foreground">
                Active filters:
              </span>
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchQuery}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setSearchQuery("")}
                  />
                </Badge>
              )}
              {selectedPracticeArea !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {selectedPracticeArea}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setSelectedPracticeArea("all")}
                  />
                </Badge>
              )}
              {selectedLocation && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Location: {selectedLocation}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setSelectedLocation("")}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Attorney Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-3 sm:mb-4 flex items-center justify-between">
          <p className="text-sm sm:text-base text-muted-foreground">
            {filteredAttorneys.length}{" "}
            {filteredAttorneys.length === 1 ? "attorney" : "attorneys"} found
          </p>
        </div>

        {filteredAttorneys.length === 0 ? (
          <Card className="p-6 sm:p-8 md:p-12 text-center">
            <Globe className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
              No attorneys found
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedPracticeArea("all");
                setSelectedLocation("");
              }}
              className="h-10 sm:h-9"
            >
              Clear Filters
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredAttorneys.map((attorney, index) => (
              <motion.div
                key={attorney.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  {/* 3D Preview Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
                    <Globe className="w-20 h-20 text-white opacity-50" />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-white text-blue-600">
                        3D Profile
                      </Badge>
                    </div>
                  </div>

                  {/* Attorney Info */}
                  <div className="p-4 sm:p-6">
                    {/* Avatar and Name */}
                    <div className="flex items-start mb-3 sm:mb-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                        {attorney.image ? (
                          <Image
                            src={attorney.image}
                            alt={attorney.name || "Attorney"}
                            width={64}
                            height={64}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg sm:text-2xl font-bold text-muted-foreground">
                            {attorney.name?.charAt(0) || "A"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-foreground mb-1 truncate">
                          {attorney.name || "Attorney"}
                        </h3>
                        {attorney.location && (
                          <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                            <span className="truncate">
                              {attorney.location}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rating and Experience */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                      {attorney.rating && (
                        <div className="flex items-center">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current mr-1" />
                          <span className="text-xs sm:text-sm font-medium">
                            {attorney.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                      {attorney.yearsOfExperience && (
                        <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                          <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          {attorney.yearsOfExperience} years
                        </div>
                      )}
                      {attorney.casesHandled && (
                        <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          {attorney.casesHandled} cases
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    {attorney.bio && (
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                        {attorney.bio}
                      </p>
                    )}

                    {/* Practice Areas */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {attorney.practiceAreas.slice(0, 3).map(area => (
                        <Badge
                          key={area}
                          variant="secondary"
                          className="text-xs"
                        >
                          {area}
                        </Badge>
                      ))}
                      {attorney.practiceAreas.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{attorney.practiceAreas.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        asChild
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <Link
                          href={`/client/directory?attorney=${attorney.id}`}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Request Consultation
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
