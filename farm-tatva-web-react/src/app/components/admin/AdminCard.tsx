import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";

interface AdminCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}

export function AdminCard({ title, children, className, headerAction }: AdminCardProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {headerAction && <div>{headerAction}</div>}
        </CardHeader>
      )}
      <CardContent className={title ? "pt-0" : ""}>
        {children}
      </CardContent>
    </Card>
  );
}