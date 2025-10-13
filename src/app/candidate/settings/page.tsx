'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import CandidateDashboardLayout from '../dashboard/page';

export default function CandidateSettingsPage() {
  const PageContent = (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your account and notification preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="font-medium">Account Information</h3>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="john.doe@example.com" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
            <Button>Change Password</Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Notification Settings</h3>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="job-alerts" className="font-normal">Job Alerts</Label>
                <p className="text-xs text-muted-foreground">Receive emails about new jobs that match your profile.</p>
              </div>
              <Switch id="job-alerts" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="application-updates" className="font-normal">Application Status Updates</Label>
                <p className="text-xs text-muted-foreground">Get notified when there's an update on your applications.</p>
              </div>
              <Switch id="application-updates" defaultChecked />
            </div>
             <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="disha-updates" className="font-normal">Disha AI Tips</Label>
                <p className="text-xs text-muted-foreground">Receive occasional career tips from our AI mentor.</p>
              </div>
              <Switch id="disha-updates" />
            </div>
          </div>
          
          <Separator />

           <div className="space-y-4">
            <h3 className="font-medium text-destructive">Danger Zone</h3>
             <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg">
              <div>
                <Label htmlFor="delete-account" className="font-normal">Delete Account</Label>
                <p className="text-xs text-destructive">Permanently delete your account and all associated data.</p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );

  return <CandidateDashboardLayout>{PageContent}</CandidateDashboardLayout>;
}
