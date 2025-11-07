"use client";

import { useState } from "react";
import { TallModal } from "./TallModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Heart, Share2, Download, MessageCircle } from "lucide-react";

interface ProudParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentProgress?: {
    studentName: string;
    subject: string;
    milestones: string[];
    streak: number;
    level: number;
  };
}

export function ProudParentModal({ isOpen, onClose, studentProgress }: ProudParentModalProps) {
  const [includeDetails, setIncludeDetails] = useState(true);

  const handleShare = (method: "link" | "whatsapp" | "download") => {
    // TODO: Implement actual sharing logic
    console.log("Sharing via:", method);
  };

  return (
    <TallModal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Your Pride!"
      icon={<Heart className="h-6 w-6 text-persona-primary" />}
      footer={
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Privacy-safe sharing • No personal info included
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              className="btn-persona"
              onClick={() => handleShare("link")}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Create Share Card
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Progress Preview Card */}
        <Card className="card-persona border-2">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-20 h-20 mx-auto rounded-full bg-persona-gradient flex items-center justify-center text-4xl">
                🎓
              </div>
              <h3 className="text-xl font-bold">
                {studentProgress?.studentName || "Your Student"} is on fire! 🔥
              </h3>
              <p className="text-muted-foreground">
                Amazing progress in {studentProgress?.subject || "Algebra"}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-4 rounded-xl bg-persona-overlay">
                <p className="text-3xl font-bold text-persona-primary">
                  {studentProgress?.streak || 7}
                </p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-persona-overlay">
                <p className="text-3xl font-bold text-persona-secondary">
                  {studentProgress?.level || 5}
                </p>
                <p className="text-sm text-muted-foreground">Level</p>
              </div>
            </div>

            {/* Milestones */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Recent Achievements:</h4>
              <div className="space-y-2">
                {(studentProgress?.milestones || [
                  "Completed 20 practice problems",
                  "Earned Math Master badge",
                  "Maintained 7-day streak",
                ]).map((milestone, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-persona-overlay">
                      ✓
                    </Badge>
                    <span className="text-sm">{milestone}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Options */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Share Options</h3>

          {/* Privacy Toggle */}
          <div className="flex items-center space-x-2 p-3 rounded-lg border border-border">
            <Checkbox
              id="include-details"
              checked={includeDetails}
              onCheckedChange={(checked) => setIncludeDetails(checked as boolean)}
            />
            <Label htmlFor="include-details" className="text-sm cursor-pointer">
              Include achievement details in share card
            </Label>
          </div>

          {/* Share Methods */}
          <div className="grid gap-3">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => handleShare("whatsapp")}
            >
              <MessageCircle className="mr-3 h-5 w-5 text-green-500" />
              <div className="text-left">
                <p className="font-semibold">Share via WhatsApp</p>
                <p className="text-xs text-muted-foreground">
                  One-tap share with friends & family
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => handleShare("download")}
            >
              <Download className="mr-3 h-5 w-5 text-blue-500" />
              <div className="text-left">
                <p className="font-semibold">Download as Image</p>
                <p className="text-xs text-muted-foreground">
                  Save and share on social media
                </p>
              </div>
            </Button>
          </div>
        </div>

        {/* Preview Note */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground text-center">
              💡 Share cards are privacy-safe and contain no personal information.
              Perfect for celebrating wins with your community!
            </p>
          </CardContent>
        </Card>
      </div>
    </TallModal>
  );
}
