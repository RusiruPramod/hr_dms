import { Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function MobileHeader() {
  const { state, toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOpen = state === "expanded";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
      toast.success("Signed out");
    } catch (err) {
      console.error("Sign-out failed", err);
      toast.error("Failed to sign out");
    }
  };

  const userInitials = user?.email
    ?.split("@")[0]
    ?.split(".")
    .map((part) => part[0].toUpperCase())
    .join("")
    .slice(0, 2) || "U";

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-sidebar-border">
      <div className="flex items-center justify-between px-4 py-3 gap-2">
        {/* Hamburger Menu - with hover feedback */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="flex-shrink-0 active:scale-95 transition-transform hover:bg-accent"
          aria-label={isOpen ? "Close menu" : "Open menu or swipe right"}
          title={isOpen ? "Close menu" : "Open menu or swipe right"}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Logo & Brand */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <img src={logo} alt="Logo" className="h-7 w-7 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight truncate">DocuFlow HR</p>
            <p className="text-[10px] text-muted-foreground leading-tight truncate">
              Ceylon Cold Stores
            </p>
          </div>
        </div>

        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="flex-shrink-0" aria-label="User menu">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col space-y-1 py-2">
              <p className="text-sm font-medium text-foreground">User Account</p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
