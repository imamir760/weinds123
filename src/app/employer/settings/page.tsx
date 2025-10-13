'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function EmployerSettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your employer account and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="font-medium">Account Security</h3>
            <div className="space-y-2">
              <Label htmlFor="email">Login Email</Label>
              <Input id="email" type="email" defaultValue="hr@techcorp.com" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
            <Button>Update Password</Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Notifications</h3>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="new-applicants" className="font-normal">New Applicants</Label>
                <p className="text-xs text-muted-foreground">Notify me when a new candidate applies to a job.</p>
              </div>
              <Switch id="new-applicants" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="pipeline-updates" className="font-normal">Pipeline Updates</Label>
                <p className="text-xs text-muted-foreground">Get daily summaries of your hiring pipelines.</p>
              </div>
              <Switch id="pipeline-updates" />
            </div>
          </div>
          
          <Separator />

           <div className="space-y-4">
            <h3 className="font-medium text-destructive">Danger Zone</h3>
             <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg">
              <div>
                <Label htmlFor="delete-account" className="font-normal">Deactivate Company Account</Label>
                <p className="text-xs text-destructive">This will disable your company profile and all job posts.</p>
              </div>
              <Button variant="destructive">Deactivate</Button>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
