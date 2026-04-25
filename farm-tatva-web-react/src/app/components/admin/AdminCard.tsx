import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

interface AdminCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}

export function AdminCard({
  title,
  children,
  className,
  headerAction,
}: AdminCardProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {headerAction && (
            <div className="w-full sm:w-auto">{headerAction}</div>
          )}
        </CardHeader>
      )}
      <CardContent className={title ? "pt-0" : ""}>{children}</CardContent>
    </Card>
  );
}
