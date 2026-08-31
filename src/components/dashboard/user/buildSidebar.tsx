// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// import {
//   type PageAccess,
//   type UserRole,
//   defaultRolePermissions,
//   availablePages,
// } from "@/lib/permissions";
// import {
//   LayoutDashboard,
//   Package,
//   Users,
//   User,
//   ShoppingCart,
//   LogOut,
//   Folder,
//   Tag,
//   Ticket,
//   ListOrdered,
//   Target,
//   Store,
//   Box,
//   ArrowLeft,
//   Settings,
//   Star,
// } from "lucide-react";

// export interface SidebarItem {
//   id: PageAccess;
//   title: string;
//   href: string;
//   icon: React.ReactNode;
//   badge?: string;
//   description?: string;
//   children?: SidebarItem[];
// }

// const iconMap: Record<PageAccess, React.ReactNode> = {
//   dashboard: <LayoutDashboard className="h-5 w-5" />,
//   "my-orders": <Package className="h-5 w-5" />,
//   "orders-management": <ListOrdered className="h-5 w-5" />,
//   "user-management": <Users className="h-5 w-5" />,
//   "product-stock-adjustment": <Box className="h-5 w-5" />,
//   "product-verifications": <Box className="h-5 w-5" />,
//   "staff-management": <Users className="h-5 w-5" />,
//   "customer-management": <User className="h-5 w-5" />,
//   "reviews-management": <Star className="h-5 w-5" />,
//   "my-customers": <User className="h-5 w-5" />,
//   "product-management": <ShoppingCart className="h-5 w-5" />,
//   returns: <ArrowLeft className="h-5 w-5" />,
//   "purchase-products": <Box className="h-5 w-5" />,
//   "category-management": <Folder className="h-5 w-5" />,
//   "brand-management": <Tag className="h-5 w-5" />,

//   coupons: <Ticket className="h-5 w-5" />,
//   blogs: <ListOrdered className="h-5 w-5" />,
//   leads: <Target className="h-5 w-5" />,
//   pos: <Store className="h-5 w-5" />,
//   "courier-settings": <Settings className="h-5 w-5" />,
// };

// const pageHrefMap: Record<any, string> = {
//   dashboard: "/staff/dashboard",
//   "product-management": "/staff/dashboard/admin/product-management",
//   "category-management": "/staff/dashboard/admin/category-management",
//   "brand-management": "/staff/dashboard/admin/brand-management",
//   "purchase-products": "/staff/dashboard/purchase-products",
//   "product-verifications": "/staff/dashboard/product-verifications",
//   returns: "/staff/dashboard/returns",

//   coupons: "/staff/dashboard/coupons",
//   blogs: "/staff/dashboard/blog",
//   "staff-management": "/staff/dashboard/admin/user-management",
//   "reviews-management": "/staff/dashboard/reviews",
//   "customer-management": "/staff/dashboard/admin/customer-management",
//   "my-customers": "/staff/dashboard/my-customers",
//   "orders-management": "/staff/dashboard/orders-management",
//   leads: "/staff/dashboard/leads",
//   "my-orders": "/staff/dashboard/my-orders",
//   pos: "/staff/dashboard/pos",
//   "courier-settings": "/staff/dashboard/admin/courier-settings",
// };

// export const buildSidebarItems = (
//   userRole: UserRole,
//   customPermissions?: PageAccess[],
// ): SidebarItem[] => {
//   const permittedPages =
//     userRole === "ADMIN"
//       ? availablePages.map((p) => p.id)
//       : customPermissions?.length
//         ? customPermissions
//         : defaultRolePermissions[userRole];

//   const sections: Record<string, PageAccess[]> = {
//     core: ["dashboard"],
//     management: [
//       "product-management",
//       "purchase-products",
//       "returns",
//       "category-management",
//       "product-verifications",
//       "reviews-management",
//       "brand-management",
//       "coupons",
//       "blogs",
//       "staff-management",
//       "customer-management",
//       "my-customers",
//     ],
//     operations: [
//       "orders-management",
//       "leads",
//       "my-orders",
//       "pos",
//       "courier-settings",
//     ],
//   };

//   // Build sidebar items organized by sections, then add profile and logout
//   const sidebarItems: SidebarItem[] = [];

//   // Add items in priority order (maintaining section organization)
//   Object.entries(sections).forEach(([_section, pageIds]) => {
//     pageIds.forEach((pageId) => {
//       if (permittedPages.includes(pageId)) {
//         const page = availablePages.find((p) => p.id === pageId);
//         if (page) {
//           sidebarItems.push({
//             id: page.id,
//             title: page.label,
//             href: pageHrefMap[page.id],
//             icon: iconMap[page.id],
//             description: `Access ${page.label.toLowerCase()}`,
//           });
//         }
//       }
//     });
//   });

//   return sidebarItems;
// };

// export const getSidebarItemsByRole = (userRole: UserRole): SidebarItem[] => {
//   return buildSidebarItems(userRole);
// };

// export const getSidebarItemsWithCustomPermissions = (
//   userRole: UserRole,
//   customPermissions: PageAccess[],
// ): SidebarItem[] => {
//   return buildSidebarItems(userRole, customPermissions);
// };


/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  type PageAccess,
  type UserRole,
  defaultRolePermissions,
  availablePages,
} from "@/lib/permissions";
import {
  LayoutDashboard,
  Package,
  Users,
  User,
  ShoppingCart,
  LogOut,
  Folder,
  Tag,
  Ticket,
  ListOrdered,
  Target,
  Store,
  Box,
  ArrowLeft,
  Settings,
  Star,
} from "lucide-react";

export interface SidebarItem {
  id: PageAccess;
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  description?: string;
  children?: SidebarItem[];
}

const iconMap: Record<PageAccess, React.ReactNode> = {
  dashboard: <LayoutDashboard className="h-5 w-5" />,
  "my-orders": <Package className="h-5 w-5" />,
  "orders-management": <ListOrdered className="h-5 w-5" />,
  "user-management": <Users className="h-5 w-5" />,
  "product-stock-adjustment": <Box className="h-5 w-5" />,
  "product-verifications": <Box className="h-5 w-5" />,
  "staff-management": <Users className="h-5 w-5" />,
  "customer-management": <User className="h-5 w-5" />,
  "reviews-management": <Star className="h-5 w-5" />,
  "my-customers": <User className="h-5 w-5" />,
  "product-management": <ShoppingCart className="h-5 w-5" />,
  returns: <ArrowLeft className="h-5 w-5" />,
  "purchase-products": <Box className="h-5 w-5" />,
  "category-management": <Folder className="h-5 w-5" />,
  "brand-management": <Tag className="h-5 w-5" />,
  "low-stock-products": <Box className="h-5 w-5" />,

  coupons: <Ticket className="h-5 w-5" />,
  blogs: <ListOrdered className="h-5 w-5" />,
  leads: <Target className="h-5 w-5" />,
  pos: <Store className="h-5 w-5" />,
  "courier-settings": <Settings className="h-5 w-5" />,
};

const pageHrefMap: Record<any, string> = {
  dashboard: "/staff/dashboard",
  "product-management": "/staff/dashboard/admin/product-management",
  "category-management": "/staff/dashboard/admin/category-management",
  "brand-management": "/staff/dashboard/admin/brand-management",
  "purchase-products": "/staff/dashboard/purchase-products",
  "product-verifications": "/staff/dashboard/product-verifications",
  "low-stock-products": "/staff/dashboard/low-stock-products",
  returns: "/staff/dashboard/returns",

  coupons: "/staff/dashboard/coupons",
  blogs: "/staff/dashboard/blog",
  "staff-management": "/staff/dashboard/admin/user-management",
  "reviews-management": "/staff/dashboard/reviews",
  "customer-management": "/staff/dashboard/admin/customer-management",
  "my-customers": "/staff/dashboard/my-customers",
  "orders-management": "/staff/dashboard/orders-management",
  leads: "/staff/dashboard/leads",
  "my-orders": "/staff/dashboard/my-orders",
  pos: "/staff/dashboard/pos",
  "courier-settings": "/staff/dashboard/admin/courier-settings",
};

export const buildSidebarItems = (
  userRole: UserRole,
  customPermissions?: PageAccess[],
): SidebarItem[] => {
  const permittedPages =
    userRole === "ADMIN"
      ? availablePages.map((p) => p.id)
      : customPermissions?.length
        ? customPermissions
        : defaultRolePermissions[userRole];

  const sections: Record<string, PageAccess[]> = {
    core: ["dashboard"],
    management: [
      "product-management",
      "purchase-products",
      "returns",
      "category-management",
      "product-verifications",
      "reviews-management",
      "brand-management",
      "coupons",
      "blogs",
      "staff-management",
      "customer-management",
      "my-customers",
      "low-stock-products"
    ],
    operations: [
      "orders-management",
      "leads",
      "my-orders",
      "pos",
      "courier-settings",
    ],
  };

  // Build sidebar items organized by sections, then add profile and logout
  const sidebarItems: SidebarItem[] = [];

  // Add items in priority order (maintaining section organization)
  Object.entries(sections).forEach(([_section, pageIds]) => {
    pageIds.forEach((pageId) => {
      if (permittedPages.includes(pageId)) {
        const page = availablePages.find((p) => p.id === pageId);
        if (page) {
          sidebarItems.push({
            id: page.id,
            title: page.label,
            href: pageHrefMap[page.id],
            icon: iconMap[page.id],
            description: `Access ${page.label.toLowerCase()}`,
          });
        }
      }
    });
  });

  return sidebarItems;
};

export const getSidebarItemsByRole = (userRole: UserRole): SidebarItem[] => {
  return buildSidebarItems(userRole);
};

export const getSidebarItemsWithCustomPermissions = (
  userRole: UserRole,
  customPermissions: PageAccess[],
): SidebarItem[] => {
  return buildSidebarItems(userRole, customPermissions);
};
