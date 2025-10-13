'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Experience } from "./page";

type ExperienceCardProps = {
    index: number;
    experience: Experience;
    updateExperience: (index: number, field: keyof Experience, value: string) => void;
    removeExperience: (index: number) => void;
};

export function ExperienceCard({ index, experience, updateExperience, removeExperience }: ExperienceCardProps) {
    return (
        <div className="p-4 border rounded-lg relative bg-background/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor={`jobTitle-${index}`}>Job Title</Label>
                    <Input id={`jobTitle-${index}`} value={experience.jobTitle} onChange={(e) => updateExperience(index, 'jobTitle', e.target.value)} placeholder="e.g., Software Engineer" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor={`company-${index}`}>Company</Label>
                    <Input id={`company-${index}`} value={experience.company} onChange={(e) => updateExperience(index, 'company', e.target.value)} placeholder="e.g., Google" />
                </div>
            </div>
            <div className="mt-4 space-y-1">
                <Label htmlFor={`duration-${index}`}>Duration</Label>
                <Input id={`duration-${index}`} value={experience.duration} onChange={(e) => updateExperience(index, 'duration', e.target.value)} placeholder="e.g., Jan 2022 - Present" />
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                onClick={() => removeExperience(index)}
                type="button"
            >
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
    )
}
