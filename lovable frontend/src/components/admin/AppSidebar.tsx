import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  Tags,
  Boxes,
  BadgePercent,
  ShoppingCart,
  BarChart3,
  Users,
  Bike,
  Leaf,
} from "lucide-react";

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

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Orders", url: "/orders", icon: ShoppingCart },
  { title: "Products", url: "/products", icon: Package },
  { title: "Categories", url: "/categories", icon: Tags },
  { title: "Inventory", url: "/inventory", icon: Boxes },
  { title: "Offers", url: "/offers", icon: BadgePercent },
  { title: "Sales Reports", url: "/reports", icon: BarChart3 },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Delivery Partners", url: "/delivery-partners", icon: Bike },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Leaf className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate font-display text-base font-bold leading-tight text-sidebar-accent-foreground">
                GroceryMart
              </p>
              <p className="text-xs text-sidebar-foreground/60">Store Admin</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPath === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 py-3">
        {!collapsed && (
          <p className="text-xs text-sidebar-foreground/50">Open · 7 AM – 10 PM</p>
        )}
        <button className="mt-2 w-full rounded-md border px-2 py-1.5 text-sm" onClick={() => { localStorage.removeItem("admin_token"); localStorage.removeItem("admin_refresh_token"); window.location.reload(); }}>Logout</button>
      </SidebarFooter>
    </Sidebar>
  );
}
