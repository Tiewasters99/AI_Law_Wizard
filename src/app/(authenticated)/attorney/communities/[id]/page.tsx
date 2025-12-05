// Attorney Community Detail Page

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Users,
  FileText,
  Settings,
  Trash2,
  UserPlus,
  Shield,
  Ban,
} from "lucide-react";
import { verifyAttorneyAccess } from "@/lib/backend/utils/attorneyAuth";
import { getCommunityDetails } from "@/lib/backend/services/attorney/community/communityService";
import { findCommunityMembers } from "@/lib/backend/repositories/community/communityMemberRepository";
import { findPostsByCommunity } from "@/lib/backend/repositories/community/communityPostRepository";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AttorneyCommunityDetailPage({
  params,
}: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/login");
  }

  const { id } = await params;
  let community;
  let members = [];
  let posts = [];

  try {
    const attorney = await verifyAttorneyAccess(session.user?.id);
    community = await getCommunityDetails(id, attorney.id);
    members = await findCommunityMembers(id);
    posts = await findPostsByCommunity(id, { take: 10 });
  } catch (error: any) {
    if (error.name === "NotFoundError" || error.message?.includes("not found")) {
      notFound();
    }
    console.error("Failed to fetch community:", error);
    redirect("/attorney/communities");
  }

  if (!community) {
    notFound();
  }

  const activeMembers = members.filter((m) => m.status === "ACTIVE");
  const bannedMembers = members.filter((m) => m.status === "BANNED");

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back Navigation */}
      <Link
        href="/attorney/communities"
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Communities
      </Link>

      {/* Community Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {community.name}
            </h1>
            <p className="text-muted-foreground">
              {community.description || "No description"}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/attorney/communities/${id}/settings`}>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <Badge
            variant={
              community.visibility === "PUBLIC" ? "default" : "secondary"
            }
            className="capitalize"
          >
            {community.visibility.toLowerCase()}
          </Badge>
          {community.allowClientPosts && (
            <Badge variant="outline">Clients Can Post</Badge>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              {bannedMembers.length > 0
                ? `${bannedMembers.length} banned`
                : "All active"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {community._count?.posts || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(community.createdAt).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">Community created</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Members</CardTitle>
              <Link href={`/attorney/communities/${id}/invite`}>
                <Button size="sm" variant="outline">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite
                </Button>
              </Link>
            </div>
            <CardDescription>
              Manage community members and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeMembers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No members yet
              </p>
            ) : (
              <div className="space-y-2">
                {activeMembers.slice(0, 10).map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {member.user.name || member.user.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.role}
                        </p>
                      </div>
                    </div>
                    {member.role !== "OWNER" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Ban className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {activeMembers.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    +{activeMembers.length - 10} more members
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Posts Section */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>
              Latest posts in this community
            </CardDescription>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No posts yet
              </p>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold line-clamp-1">
                        {post.title}
                      </h4>
                      {post.isPinned && (
                        <Badge variant="secondary" className="ml-2">
                          Pinned
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        By {post.author.name || post.author.email} •{" "}
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      <span>{post._count?.comments || 0} comments</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

