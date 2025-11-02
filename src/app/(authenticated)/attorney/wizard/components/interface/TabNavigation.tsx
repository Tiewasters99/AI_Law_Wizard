"use client";

import { motion } from "framer-motion";
import { Search, FolderOpen, History, Library } from "lucide-react";
import { Button } from "@/components/ui/button";

type Tab = "analysis" | "files" | "history" | "library";

interface TabNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: Array<{ id: Tab; label: string; icon: any }> = [
  { id: "analysis", label: "Analysis", icon: Search },
  { id: "files", label: "Files", icon: FolderOpen },
  { id: "history", label: "History", icon: History },
  { id: "library", label: "Library", icon: Library },
];

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <motion.div
      className="flex items-center space-x-1 rounded-xl p-1.5 bg-muted"
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {tabs.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          variant={activeTab === id ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange(id)}
          className={`flex items-center space-x-1.5 px-3 sm:px-4 h-8 transition-all duration-200 ${
            activeTab === id
              ? "bg-background text-primary font-semibold shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline text-sm">{label}</span>
        </Button>
      ))}
    </motion.div>
  );
};
