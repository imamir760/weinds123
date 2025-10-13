'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function CreateWalkInPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Walk-in Drive</CardTitle>
          <CardDescription>Set up the details for your walk-in event.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="drive-title">Drive Title</Label>
                <Input id="drive-title" placeholder="e.g., Engineering Hiring Event" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="drive-description">Description</Label>
                <Textarea id="drive-description" placeholder="Provide details about the event, roles available, etc." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="location">Location / Venue</Label>
                    <Input id="location" placeholder="e.g., Bengaluru Office" />
                </div>
            </div>
            <div className="flex justify-end">
                <Button>Create Drive</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
