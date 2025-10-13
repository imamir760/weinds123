'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Education } from "./page";

type EducationCardProps = {
    index: number;
    education: Education;
    updateEducation: (index: number, field: keyof Education, value: string) => void;
    removeEducation: (index: number) => void;
};

export function EducationCard({ index, education, updateEducation, removeEducation }: EducationCardProps) {
    return (
        <div className="p-4 border rounded-lg relative bg-background/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor={`institution-${index}`}>Institution</Label>
                    <Input id={`institution-${index}`} value={education.institution} onChange={(e) => updateEducation(index, 'institution', e.target.value)} placeholder="e.g., IIT Bombay" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor={`degree-${index}`}>Degree</Label>
                    <Input id={`degree-${index}`} value={education.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} placeholder="e.g., B.Tech in Computer Science" />
                </div>
            </div>
            <div className="mt-4 space-y-1">
                <Label htmlFor={`year-${index}`}>Year</Label>
                <Input id={`year-${index}`} value={education.year} onChange={(e) => updateEducation(index, 'year', e.target.value)} placeholder="e.g., 2020-2024" />
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                onClick={() => removeEducation(index)}
                type="button"
            >
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
    )
}
