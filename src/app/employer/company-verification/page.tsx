'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';

export default function CompanyVerificationPage() {
  return (
    <div className="container mx-auto py-12 px-4 flex justify-center items-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Company Verification</CardTitle>
          <CardDescription>Verify your company to gain full access to Weinds features.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="doc-type">Document Type</Label>
                <p className="text-sm text-muted-foreground">e.g., Certificate of Incorporation, GST Certificate</p>
                <Input id="doc-type" placeholder="Certificate of Incorporation" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="company-doc">Upload Document</Label>
                <div className="flex items-center justify-center w-full">
                    <Label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PDF, PNG, JPG (MAX. 5MB)</p>
                        </div>
                        <Input id="dropzone-file" type="file" className="hidden" />
                    </Label>
                </div> 
            </div>
            <Button className="w-full">Submit for Verification</Button>
            <p className="text-xs text-center text-muted-foreground">Verification may take up to 24-48 hours.</p>
        </CardContent>
      </Card>
    </div>
  );
}
