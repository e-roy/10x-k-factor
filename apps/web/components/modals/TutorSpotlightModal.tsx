"use client";

import { useState } from "react";
import { TallModal } from "./TallModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Star, Users, TrendingUp, Share2, Copy, CheckCircle } from "lucide-react";

interface TutorSpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutorStats?: {
    name: string;
    sessionsThisMonth: number;
    studentCount: number;
    avgRating: number;
    specialties: string[];
  };
}

export function TutorSpotlightModal({ isOpen, onClose, tutorStats }: TutorSpotlightModalProps) {
  const [customMessage, setCustomMessage] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerateSpotlight = () => {
    // TODO: Call API to generate spotlight card
    const mockLink = `https://${process.env.NEXT_PUBLIC_APP_URL}/tutor-spotlight/${Math.random().toString(36).slice(2, 9)}`;
    setShareLink(mockLink);
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <TallModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Tutor Spotlight"
      icon={<BookOpen className="h-6 w-6 text-persona-primary" />}
      footer={
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Share your teaching impact & attract new students
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              className="btn-persona"
              onClick={handleGenerateSpotlight}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Create Spotlight
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Preview Card */}
        <Card className="card-persona border-2">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-persona-gradient flex items-center justify-center text-3xl">
                📚
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {tutorStats?.name || "Your Teaching Stats"}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-semibold">{tutorStats?.avgRating || 4.9}</span>
                  <span className="text-sm text-muted-foreground">rating</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-persona-overlay">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="h-4 w-4 text-persona-primary" />
                </div>
                <p className="text-2xl font-bold text-persona-primary">
                  {tutorStats?.studentCount || 24}
                </p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-persona-overlay">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <BookOpen className="h-4 w-4 text-persona-secondary" />
                </div>
                <p className="text-2xl font-bold text-persona-secondary">
                  {tutorStats?.sessionsThisMonth || 42}
                </p>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-persona-overlay">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600">
                  95%
                </p>
                <p className="text-xs text-muted-foreground">Success</p>
              </div>
            </div>

            {/* Specialties */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Specialties:</h4>
              <div className="flex flex-wrap gap-2">
                {(tutorStats?.specialties || ["Algebra", "Geometry", "Calculus"]).map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="bg-persona-overlay">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Message */}
        <div className="space-y-2">
          <Label htmlFor="custom-message">Add a Personal Message (Optional)</Label>
          <Textarea
            id="custom-message"
            placeholder="Share your teaching philosophy or a success story..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={4}
            maxLength={280}
          />
          <p className="text-xs text-muted-foreground text-right">
            {customMessage.length}/280 characters
          </p>
        </div>

        {/* Share Link Section */}
        {shareLink && (
          <Card className="bg-muted/50">
            <CardContent className="pt-4 space-y-3">
              <Label>Your Spotlight Link</Label>
              <div className="flex gap-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this link on your website, social media, or with potential students
              </p>
            </CardContent>
          </Card>
        )}

        {/* Benefits */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-semibold text-sm mb-3 text-blue-900 dark:text-blue-100">
              Why share your spotlight?
            </h4>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">✓</span>
                <span>Attract new students with your proven track record</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">✓</span>
                <span>Build trust through transparent success metrics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">✓</span>
                <span>Earn referral rewards when students join through your link</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </TallModal>
  );
}
