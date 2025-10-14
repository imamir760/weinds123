'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Achievement } from "./page";
import { Textarea } from "@/components/ui/textarea";

type AchievementCardProps = {
    index: number;
    achievement: Achievement;
    updateAchievement: (index: number, field: keyof Achievement, value: string) => void;
    removeAchievement: (index: number) => void;
};

export function AchievementCard({ index, achievement, updateAchievement, removeAchievement }: AchievementCardProps) {
    return (
        <div className="p-4 border rounded-lg relative bg-background/50">
            <div className="space-y-1">
                <Label htmlFor={`achievement-description-${index}`}>Achievement / Award</Label>
                <Textarea id={`achievement-description-${index}`} value={achievement.description} onChange={(e) => updateAchievement(index, 'description', e.target.value)} placeholder="e.g., Won 1st place at XYZ Hackathon" />
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                onClick={() => removeAchievement(index)}
                type="button"
            >
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
    )
}
