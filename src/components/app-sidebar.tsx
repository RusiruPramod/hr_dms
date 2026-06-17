import { Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, UserPlus, FileText, Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-responsive";
import { useSwipeGestures } from "@/hooks/use-gestures";

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
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Handle swipe to open sidebar on mobile
  useSwipeGestures(
    {
      onSwipeRight: () => {
        if (isMobile && collapsed) {
          toggleSidebar();
        }
      },
      onSwipeLeft: () => {
        if (isMobile && !collapsed) {
          toggleSidebar();
        }
      },
    },
    true
  );

  const isActive = (url: string) => {
    if (pathname === url) return true;
    if (url === "/") return false;
    // Don't mark /records as active when on /records/new
    if (url === "/records" && pathname.startsWith("/records/new")) return false;
    return pathname.startsWith(url + "/");
  };

  return (
    <Sidebar 
      collapsible={isMobile ? "icon" : "icon"}
      className="transition-all duration-300"
    >
      <SidebarHeader className="border-b border-sidebar-border flex flex-row items-center justify-between md:justify-start">
        <div className="flex items-center gap-2.5 px-2 py-2 flex-1">
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
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="ml-auto md:hidden"
          >
            {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>
        )}
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)} 
                    tooltip={item.title}
                    onClick={() => {
                      // Close sidebar on mobile after navigation
                      if (isMobile && !collapsed) {
                        toggleSidebar();
                      }
                    }}
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
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
          <div className="px-2 py-2 space-y-2">
            <p className="text-[10px] text-muted-foreground">v1.0 · Internship Automation</p>
            <Button
              variant="ghost"
              onClick={async () => {
                try {
                  await signOut(auth);
                  // Redirect to login page
                  navigate("/login");
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
