import { ReactNode } from "react";
import { Button } from "@/app/components/ui/button";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-gray-600">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
