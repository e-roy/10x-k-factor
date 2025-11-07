import { Badge } from "@/components/ui/badge";

interface UpdatedBadgeProps {
  date: string;
}

export function UpdatedBadge({ date }: UpdatedBadgeProps) {
  return (
    <Badge variant="outline" className="text-xs">
      Last updated: {date}
    </Badge>
  );
}
