import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { redirect } from "next/navigation";
import RoleSelectionClient from "./RoleSelectionClient";
import Loading from "./loading";

export default async function RoleSelectionPage() {
  // Fetch session server-side
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Validate access conditions: profileComplete must be false AND role must be null
  const profileComplete = session.user.profileComplete ?? false;
  const role = session.user.role;

  // If profileComplete is true OR role is not null, redirect to appropriate dashboard
  if (profileComplete === true || role !== null) {
    if (role === "ATTORNEY") {
      redirect("/attorney/dashboard");
    } else if (role === "CUSTOMER") {
      redirect("/client/dashboard");
    } else {
      // Fallback: redirect to login if role is unexpected
      redirect("/auth/login");
    }
  }

  // User is authenticated, profileComplete is false, and role is null
  // Allow access to role-selection page
  return (
    <Suspense fallback={<Loading />}>
      <RoleSelectionClient />
    </Suspense>
  );
}
