"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
} from "@heroui/react";
import { Wallet, Plus, Settings } from "lucide-react";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

interface HeaderProps {
  onAddExpense: () => void;
  onOpenSettings: () => void;
}

export function Header({ onAddExpense, onOpenSettings }: HeaderProps) {
  return (
    <Navbar
      maxWidth="xl"
      position="sticky"
      isBordered
      aria-label="Main navigation"
      classNames={{
        base: "bg-background/70 backdrop-blur-md",
        wrapper: "px-4 sm:px-6",
      }}
    >
      <NavbarBrand className="gap-2">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary"
          aria-hidden="true"
        >
          <Wallet className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-inherit text-lg hidden sm:block">
          Expense Tracker
        </span>
        <span className="font-bold text-inherit text-lg sm:hidden">
          Expenses
        </span>
      </NavbarBrand>

      <NavbarContent justify="end" className="gap-2">
        <NavbarItem>
          <Button
            isIconOnly
            variant="light"
            onPress={onOpenSettings}
            aria-label="Open settings"
            className="text-default-600 hover:text-foreground"
          >
            <Settings className="w-5 h-5" aria-hidden="true" />
          </Button>
        </NavbarItem>
        <NavbarItem>
          <ThemeSwitcher />
        </NavbarItem>
        <NavbarItem>
          <Button
            color="primary"
            onPress={onAddExpense}
            startContent={<Plus className="w-4 h-4" aria-hidden="true" />}
            className="font-medium"
            aria-label="Add new expense"
          >
            <span className="hidden sm:inline">Add Expense</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
