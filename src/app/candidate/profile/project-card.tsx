'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Project } from "./page";
import { Textarea } from "@/components/ui/textarea";

type ProjectCardProps = {
    index: number;
    project: Project;
    updateProject: (index: number, field: keyof Project, value: string) => void;
    removeProject: (index: number) => void;
};

export function ProjectCard({ index, project, updateProject, removeProject }: ProjectCardProps) {
    return (
        <div className="p-4 border rounded-lg relative bg-background/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor={`project-title-${index}`}>Project Title</Label>
                    <Input id={`project-title-${index}`} value={project.title} onChange={(e) => updateProject(index, 'title', e.target.value)} placeholder="e.g., E-commerce Website" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor={`project-url-${index}`}>Project URL</Label>
                    <Input id={`project-url-${index}`} value={project.url} onChange={(e) => updateProject(index, 'url', e.target.value)} placeholder="https://github.com/user/repo" />
                </div>
            </div>
            <div className="mt-4 space-y-1">
                <Label htmlFor={`project-description-${index}`}>Description</Label>
                <Textarea id={`project-description-${index}`} value={project.description} onChange={(e) => updateProject(index, 'description', e.target.value)} placeholder="Describe your project..." />
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                onClick={() => removeProject(index)}
                type="button"
            >
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
    )
}
