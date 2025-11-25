import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeSelector() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme("light")}
                className={cn(
                    "flex-1 gap-2 h-8 rounded-md transition-all",
                    theme === "light"
                        ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                )}
            >
                <Sun className="h-4 w-4" />
                <span className="text-xs font-medium">Claro</span>
            </Button>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme("dark")}
                className={cn(
                    "flex-1 gap-2 h-8 rounded-md transition-all",
                    theme === "dark"
                        ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-600 dark:text-indigo-300"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                )}
            >
                <Moon className="h-4 w-4" />
                <span className="text-xs font-medium">Escuro</span>
            </Button>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme("system")}
                className={cn(
                    "flex-1 gap-2 h-8 rounded-md transition-all",
                    theme === "system"
                        ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-600 dark:text-indigo-300"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                )}
            >
                <Monitor className="h-4 w-4" />
                <span className="text-xs font-medium">Sistema</span>
            </Button>
        </div>
    );
}
