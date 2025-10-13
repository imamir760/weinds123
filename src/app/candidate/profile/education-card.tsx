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
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        updateEducation(index, id as keyof Education, value);
    }

    return (
        <div className="p-4 border rounded-lg relative bg-background/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor={`institution-${index}`}>Institution</Label>
                    <Input id="institution" value={education.institution} onChange={handleInputChange} placeholder="e.g., IIT Bombay" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor={`degree-${index}`}>Degree</Label>
                    <Input id="degree" value={education.degree} onChange={handleInputChange} placeholder="e.g., B.Tech in Computer Science" />
                </div>
            </div>
            <div className="mt-4 space-y-1">
                <Label htmlFor={`year-${index}`}>Year</Label>
                <Input id="year" value={education.year} onChange={handleInputChange} placeholder="e.g., 2020-2024" />
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
