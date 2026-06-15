import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, UserPlus, FileText } from "lucide-react";
import logo from "@/assets/logo.png";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Intern Records", url: "/records", icon: Users },
  { title: "New Record", url: "/records/new", icon: UserPlus },
  { title: "Docs", url: "/docs", icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();

  const isActive = (url: string) => {
    if (pathname === url) return true;
    if (url === "/") return false;
    // Don't mark /records as active when on /records/new
    if (url === "/records" && pathname.startsWith("/records/new")) return false;
    return pathname.startsWith(url + "/");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <img src={logo} alt="Elephant House" className="h-9 w-9 shrink-0 object-contain" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight truncate">DocuFlow HR</p>
              <p className="text-[11px] text-muted-foreground leading-tight truncate">
                Ceylon Cold Stores
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && (
          <div className="px-2 py-2">
            <p className="text-[10px] text-muted-foreground mb-2">v1.0 · Internship Automation</p>
            <Button
              variant="ghost"
              onClick={async () => {
                try {
                  await signOut(auth);
                  // Redirect to login page
                  navigate({ to: "/login" });
                } catch (err) {
                  console.error("Sign-out failed", err);
                  toast.error("Failed to sign out");
                }
              }}
              className="w-full text-sm"
            >
              Logout
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
