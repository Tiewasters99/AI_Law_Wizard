// Attorney Community Management Dashboard

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

async function getCommunities() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return [];
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/attorney/communities`, {
      headers: {
        Cookie: `next-auth.session-token=${session.user.id}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.communities || [];
  } catch (error) {
    console.error("Failed to fetch communities:", error);
    return [];
  }
}

export default async function AttorneyCommunitiesPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/login");
  }

  const communities = await getCommunities();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Communities</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage communities to share knowledge
          </p>
        </div>
        <Link href="/attorney/communities/create">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Create Community
          </Button>
        </Link>
      </div>

      {communities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t created any communities yet.
            </p>
            <Link href="/attorney/communities/create">
              <Button>Create Your First Community</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community: any) => (
            <Card key={community.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{community.name}</CardTitle>
                <CardDescription>
                  {community.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Members:</span>
                    <span className="font-semibold">{community._count?.members || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Posts:</span>
                    <span className="font-semibold">{community._count?.posts || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Visibility:</span>
                    <span className="font-semibold capitalize">{community.visibility.toLowerCase()}</span>
                  </div>
                </div>
                <Link href={`/attorney/communities/${community.id}`}>
                  <Button variant="outline" className="w-full">
                    Manage Community
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}












