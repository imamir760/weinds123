'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function TpoSettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Institution Settings</CardTitle>
          <CardDescription>Manage your institution's account and notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="font-medium">Account</h3>
            <div className="space-y-2">
              <Label htmlFor="email">Login Email</Label>
              <Input id="email" type="email" defaultValue="tpo@iitb.ac.in" disabled />
            </div>
            <Button>Change Password</Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Notifications</h3>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="drive-invites" className="font-normal">Drive Invitations</Label>
                <p className="text-xs text-muted-foreground">Notify when employers invite you to a hiring drive.</p>
              </div>
              <Switch id="drive-invites" defaultChecked />
            </div>
             <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="application-summary" className="font-normal">Weekly Summary</Label>
                <p className="text-xs text-muted-foreground">Receive a weekly summary of student application stats.</p>
              </div>
              <Switch id="application-summary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
