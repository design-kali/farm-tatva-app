import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
  cancelLabel?: string;
  contentClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  isLoading,
  submitLabel = "Save",
  onCancel,
  cancelLabel = "Cancel",
  contentClassName,
  bodyClassName,
  footerClassName,
}: FormDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={contentClassName}>
        <form onSubmit={handleSubmit} className="flex max-h-[inherit] flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className={cn("mt-4 min-h-0 flex-1 overflow-y-auto pr-1", bodyClassName)}>
            {children}
          </div>
          <DialogFooter className={cn("mt-4", footerClassName)}>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel || (() => onOpenChange(false))}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
