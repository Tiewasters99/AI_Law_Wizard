"use client";

import { useState, useEffect } from "react";
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center mb-4">
              <Globe className="w-12 h-12 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Attorney Miniverse™
              </h1>
            </div>
            <p className="text-center text-xl text-blue-100">
              Explore attorney profiles in 3D, read their articles, and connect
              instantly
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm text-gray-600">Active filters:</span>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            {filteredAttorneys.length}{" "}
            {filteredAttorneys.length === 1 ? "attorney" : "attorneys"} found
          </p>
        </div>

        {filteredAttorneys.length === 0 ? (
          <Card className="p-12 text-center">
            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No attorneys found
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search or filters
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedPracticeArea("all");
                setSelectedLocation("");
              }}
            >
              Clear Filters
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="p-6">
                    {/* Avatar and Name */}
                    <div className="flex items-start mb-4">
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mr-4 flex-shrink-0">
                        {attorney.image ? (
                          <img
                            src={attorney.image}
                            alt={attorney.name || "Attorney"}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-gray-500">
                            {attorney.name?.charAt(0) || "A"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {attorney.name || "Attorney"}
                        </h3>
                        {attorney.location && (
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-1" />
                            {attorney.location}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rating and Experience */}
                    <div className="flex items-center gap-4 mb-4">
                      {attorney.rating && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                          <span className="text-sm font-medium">
                            {attorney.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                      {attorney.yearsOfExperience && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Briefcase className="w-4 h-4 mr-1" />
                          {attorney.yearsOfExperience} years
                        </div>
                      )}
                      {attorney.casesHandled && (
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText className="w-4 h-4 mr-1" />
                          {attorney.casesHandled} cases
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    {attorney.bio && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
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
