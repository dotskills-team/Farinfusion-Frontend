import {
  Users,
  LayoutDashboardIcon,
  ToolCase,
  StoreIcon,
  ListOrdered,
  Gift,
  ShoppingBag,
} from "lucide-react";

export const moderatorSidebar = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Dashboard",
        url: "/staff/dashboard",
        icon: LayoutDashboardIcon,
      },
      { title: "Leads", url: "/staff/dashboard/leads", icon: ListOrdered },
      {
        title: "My Customers",
        url: "/staff/dashboard/my-customers",
        icon: Users,
      },
      {
        title: "Facebook",
        items: [
          {
            title: "Facebook Inbox",
            url: "/staff/dashboard/facebook-inbox",
            icon: ListOrdered,
          },
        ],
      },
      { title: "POS", url: "/staff/dashboard/pos", icon: StoreIcon },
      {
        title: "My Orders",
        url: "/staff/dashboard/my-orders",
        icon: ListOrdered,
      },
    ],
  },
];

export const adminSidebar = [
  {
    title: "Core",
    items: [
      {
        title: "Dashboard",
        url: "/staff/dashboard",
        icon: LayoutDashboardIcon,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Products",
        url: "/staff/dashboard/admin/product-management",
        icon: ToolCase,
      },
      {
        title: "Categories",
        url: "/staff/dashboard/admin/category-management",
        icon: ToolCase,
      },
      {
        title: "Brands",
        url: "/staff/dashboard/admin/brand-management",
        icon: ToolCase,
      },
      {
        title: "Coupons",
        url: "/staff/dashboard/coupons",
        icon: Gift,
      },
      {
        title: "Staffs",
        url: "/staff/dashboard/admin/user-management",
        icon: Users,
      },
      {
        title: "Customers",
        url: "/staff/dashboard/admin/customer-management",
        icon: Users,
      },
      {
        title: "My Customers",
        url: "/staff/dashboard/my-customers",
        icon: Users,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        title: "Orders",
        url: "/staff/dashboard/orders-management",
        icon: ListOrdered,
      },
      // { title: "My Orders", url: "/staff/dashboard/my-orders", icon: ListOrdered },
      { title: "Leads", url: "/staff/dashboard/leads", icon: ListOrdered },
      {
        title: "My Orders",
        url: "/staff/dashboard/my-orders",
        icon: ListOrdered,
      },
      { title: "POS", url: "/staff/dashboard/pos", icon: StoreIcon },
    ],
  },
  {
    title: "Facebook",
    items: [
      {
        title: "Facebook Inbox",
        url: "/staff/dashboard/facebook-inbox",
        icon: ListOrdered,
      },
    ],
  },
];

export const telecallerSidebar = [
  {
    title: "Work",
    items: [
      {
        title: "Dashboard",
        url: "/staff/dashboard",
        icon: LayoutDashboardIcon,
      },
      {
        title: "Customers",
        url: "/staff/dashboard/admin/customer-management",
        icon: Users,
      },
      {
        title: "Orders",
        url: "/staff/dashboard/orders-management",
        icon: ListOrdered,
      },
      {
        title: "My Orders",
        url: "/staff/dashboard/my-orders",
        icon: ListOrdered,
      },
      {
        title: "My Customers",
        url: "/staff/dashboard/my-customers",
        icon: Users,
      },
      { title: "POS", url: "/staff/dashboard/pos", icon: StoreIcon },
      { title: "Leads", url: "/staff/dashboard/leads", icon: ListOrdered },
    ],
  },
];

export const managerSidebar = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Dashboard",
        url: "/staff/dashboard",
        icon: LayoutDashboardIcon,
      },
      {
        title: "Products",
        url: "/staff/dashboard/admin/product-management",
        icon: ToolCase,
      },
      {
        title: "Categories",
        url: "/staff/dashboard/admin/category-management",
        icon: ToolCase,
      },
      {
        title: "Brands",
        url: "/staff/dashboard/admin/brand-management",
        icon: ShoppingBag,
      },
      {
        title: "Coupons",
        url: "/staff/dashboard/coupons",
        icon: Gift,
      },
      {
        title: "My Orders",
        url: "/staff/dashboard/my-orders",
        icon: ListOrdered,
      },
      {
        title: "Orders",
        url: "/staff/dashboard/orders-management",
        icon: ListOrdered,
      },
      {
        title: "My Customers",
        url: "/staff/dashboard/my-customers",
        icon: Users,
      },
      { title: "Leads", url: "/staff/dashboard/leads", icon: ListOrdered },
      { title: "POS", url: "/staff/dashboard/pos", icon: StoreIcon },
      // { title: "My Orders", url: "/staff/dashboard/my-orders", icon: ListOrdered },
      {
        title: "Facebook",
        items: [
          {
            title: "Facebook Inbox",
            url: "/staff/dashboard/facebook-inbox",
            icon: ListOrdered,
          },
        ],
      },
      {
        title: "Facebook",
        items: [
          {
            title: "Facebook Inbox",
            url: "/staff/dashboard/facebook-inbox",
            icon: ListOrdered,
          },
        ],
      },
    ],
  },
];

export const customerSidebar = [
  {
    title: "Dashboard",
    items: [
      { title: "Overview", url: "/staff/dashboard", icon: ToolCase },
      {
        title: "My Orders",
        url: "/staff/dashboard/customer/my-orders",
        icon: ToolCase,
      },
    ],
  },
];

export const generalStaffSidebar = [
  {
    title: "Dashboard",
    items: [{ title: "Overview", url: "/staff/dashboard", icon: ToolCase }],
  },
];
