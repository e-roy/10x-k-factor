import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Palette, FileText, MessageSquare } from "lucide-react";

const demos = [
  {
    title: "XP Tracker",
    description: "Test the XP system by manually tracking events and viewing level progression",
    href: "/app/demos/xp-tracker",
    icon: Award,
  },
  {
    title: "Theme System",
    description: "Preview persona-based theme customization and color schemes",
    href: "/app/demos/theme",
    icon: Palette,
  },
  {
    title: "Transcript Challenge",
    description: "Interactive transcript-based challenge system with animations",
    href: "/app/demos/transcript-challenge",
    icon: FileText,
  },
  {
    title: "Modal System",
    description: "Test the modal management system with various modal types",
    href: "/app/demos/modals",
    icon: MessageSquare,
  },
];

export default function DemosPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold">Demos &amp; Testing</h1>
        <p className="text-muted-foreground mt-2">
          Interactive demos for testing and showcasing features
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {demos.map((demo) => {
          const Icon = demo.icon;
          return (
            <Link key={demo.href} href={demo.href}>
              <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-persona-primary" />
                    {demo.title}
                  </CardTitle>
                  <CardDescription>{demo.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

