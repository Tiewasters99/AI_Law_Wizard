// Client Community Discovery Page

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { verifyClientAccess } from "@/lib/backend/utils/clientAuth";
import { listCommunities } from "@/lib/backend/services/client/community/communityService";

export default async function ClientCommunitiesPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/login");
  }

  let communities: Awaited<ReturnType<typeof listCommunities>> = [];
  try {
    const client = await verifyClientAccess(session.user?.id);
    communities = await listCommunities(client.id);
  } catch (error) {
    console.error("Failed to fetch communities:", error);
    communities = [];
  }
  const publicCommunities = communities.filter((c: any) => !c.isMember && c.visibility === "PUBLIC");
  const joinedCommunities = communities.filter((c: any) => c.isMember);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Communities</h1>
        <p className="text-muted-foreground mt-2">
          Explore communities to learn and connect with attorneys
        </p>
      </div>

      {joinedCommunities.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">My Communities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {joinedCommunities.map((community: any) => (
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
                  </div>
                  <Link href={`/client/communities/${community.id}`}>
                    <Button variant="outline" className="w-full">
                      View Community
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">Public Communities</h2>
        {publicCommunities.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No public communities available at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicCommunities.map((community: any) => (
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
                  </div>
                  <Link href={`/client/communities/${community.id}`}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      View Community
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
















