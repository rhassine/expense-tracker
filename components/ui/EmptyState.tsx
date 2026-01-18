"use client";

import { Card, CardBody, Button } from "@heroui/react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card
      className="w-full max-w-md mx-auto border-none bg-transparent shadow-none"
      aria-labelledby="empty-state-title"
      aria-describedby="empty-state-description"
    >
      <CardBody className="flex flex-col items-center justify-center py-12 px-6 text-center gap-4">
        <div
          className="flex items-center justify-center w-16 h-16 rounded-full bg-default-100"
          aria-hidden="true"
        >
          <Icon className="w-8 h-8 text-default-400" />
        </div>

        <div className="space-y-2">
          <h3
            id="empty-state-title"
            className="text-xl font-semibold text-default-900"
          >
            {title}
          </h3>
          <p
            id="empty-state-description"
            className="text-default-500 text-sm max-w-xs"
          >
            {description}
          </p>
        </div>

        {action && (
          <Button
            color="primary"
            onPress={action.onClick}
            startContent={action.icon}
            className="mt-2"
          >
            {action.label}
          </Button>
        )}
      </CardBody>
    </Card>
  );
}
