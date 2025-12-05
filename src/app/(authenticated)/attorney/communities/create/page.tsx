// Create Community Page

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateCommunityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    visibility: "PUBLIC" as "PUBLIC" | "PRIVATE",
    allowClientPosts: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/attorney/communities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create community");
      }

      const data = await response.json();
      router.push(`/attorney/communities/${data.community.id}`);
    } catch (error: any) {
      alert(error.message || "Failed to create community");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Link href="/attorney/communities" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Communities
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Community</CardTitle>
          <CardDescription>
            Create a community to share knowledge and connect with others
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Community Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Corporate Law Discussion"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your community..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <select
                id="visibility"
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value as "PUBLIC" | "PRIVATE" })}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
              >
                <option value="PUBLIC">Public - Anyone can join</option>
                <option value="PRIVATE">Private - Invite only</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowClientPosts">Allow Clients to Post</Label>
                <p className="text-sm text-muted-foreground">
                  Let clients create posts in this community
                </p>
              </div>
              <Switch
                id="allowClientPosts"
                checked={formData.allowClientPosts}
                onCheckedChange={(checked) => setFormData({ ...formData, allowClientPosts: checked })}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.name}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? "Creating..." : "Create Community"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
















