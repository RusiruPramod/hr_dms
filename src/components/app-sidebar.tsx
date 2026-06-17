import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, UserPlus, FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-responsive";

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
import logo from "@/assets/logo.png";

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
  const isMobile = useIsMobile();

  const isActive = (url: string) => {
    if (pathname === url) return true;
    if (url === "/") return false;
    // Don't mark /records as active when on /records/new
    if (url === "/records" && pathname.startsWith("/records/new")) return false;
    return pathname.startsWith(url + "/");
  };

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (isMobile && !collapsed) {
      toggleSidebar();
    }
  };

  return (
    <Sidebar 
      collapsible="icon"
      className="transition-all duration-300"
    >
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
                    onClick={handleNavClick}
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
          <div className="px-2 py-2">
            <p className="text-[10px] text-muted-foreground">v1.0 · Internship Automation</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
