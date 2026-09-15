import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { LogoutButton } from "@/components/settings/logout-button";
import { PLANS } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { getCreditBalance } from "@/lib/credits";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
  let email: string | null = null;
  let planId = "free";
  let balance: number | null = null;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;

    if (user) {
      const { data: profile } = await supabase.from("profiles").select("plan_id").eq("id", user.id).single();
      planId = profile?.plan_id ?? "free";
      balance = await getCreditBalance(user.id);
    }
  }

  const currentPlan = PLANS.find((p) => p.id === planId) ?? PLANS[0];

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="text-sm font-medium">{email ?? "Not signed in"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan & Credits</CardTitle>
          <CardDescription>Manage how much you can create each month.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{currentPlan.name}</p>
              <Badge variant="secondary">{currentPlan.credits} credits / month</Badge>
            </div>
            {balance !== null && <p className="mt-1 text-xs text-muted-foreground">{balance} credits remaining</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  );
}
