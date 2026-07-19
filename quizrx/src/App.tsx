import { NavLink, Outlet } from "react-router-dom";
import { BookOpen, Home, Play, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "首页", icon: Home, end: true },
  { to: "/quiz", label: "刷题", icon: Play, end: false },
  { to: "/subjects", label: "科目", icon: BookOpen, end: false },
  { to: "/search", label: "搜索", icon: Search, end: false },
];

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Outlet />
      </main>
      {/* 底部导航（移动端友好） */}
      <nav className="sticky bottom-0 border-t bg-background/95 backdrop-blur">
        <div className="max-w-3xl mx-auto grid grid-cols-4">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 py-2 text-xs transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
