/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  MODERATOR = "MODERATOR",
  GENERALSTAFF = "GENERALSTAFF",
  TELESALES = "TELESALES",
  CUSTOMER = "CUSTOMER",
}

const roleRoutes: Record<string, UserRole[]> = {
  "/staff/dashboard/admin": [UserRole.ADMIN],

  "/staff/dashboard/admin/users-management": [UserRole.ADMIN],

  "/staff/dashboard/admin/courier-settings": [UserRole.ADMIN],

  "/staff/dashboard/admin/product-management": [
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.MODERATOR,
    UserRole.TELESALES,
  ],
  "/staff/dashboard/admin/category-management": [
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.MODERATOR,
    UserRole.TELESALES,
  ],
  "/staff/dashboard/admin/brand-management": [
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.MODERATOR,
    UserRole.TELESALES,
  ],
  "/staff/dashboard/orders-management": [
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.MODERATOR,
    UserRole.TELESALES,
  ],

  "/staff/dashboard/pos": [
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.MODERATOR,
    UserRole.GENERALSTAFF,
    UserRole.TELESALES,
  ],

  "/staff/dashboard/my-orders": [
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.MODERATOR,
    UserRole.GENERALSTAFF,
    UserRole.TELESALES,
  ],

    "/staff/dashboard/wrong-assigned-products": [
    UserRole.ADMIN,
    UserRole.MANAGER
  ],
};

function getDashboardRoute(role: UserRole) {
  switch (role) {
    case UserRole.ADMIN:
      return "/staff/dashboard";

    case UserRole.MANAGER:
      return "/staff/dashboard/orders-management";

    case UserRole.MODERATOR:
    case UserRole.TELESALES:
      return "/staff/dashboard/my-orders";

    default:
      return "/";
  }
}

async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);

    const { payload } = await jwtVerify(token, secret);

    return payload;
  } catch {
    return null;
  }
}

// export async function middleware(req: NextRequest) {
//   const pathname = req.nextUrl.pathname;

//   const accessToken = req.cookies.get("accessToken")?.value;

//   const protectedRoute = pathname.startsWith("/staff/dashboard");

//   if (!protectedRoute) {
//     return NextResponse.next();
//   }

//   if (!accessToken) {
//     return NextResponse.redirect(new URL("/?auth=login", req.url));
//   }

//   const payload: any = await verifyToken(accessToken);

//   if (!payload) {
//     return NextResponse.redirect(new URL("/?auth=login", req.url));
//   }

//   const role = payload?.role || payload?.user?.role;

//   if (!role) {
//     return NextResponse.redirect(new URL("/?auth=login", req.url));
//   }

//   for (const route in roleRoutes) {
//     if (pathname.startsWith(route)) {
//       const allowedRoles = roleRoutes[route];

//       if (!allowedRoles.includes(role)) {
//         return NextResponse.redirect(new URL(getDashboardRoute(role), req.url));
//       }
//     }
//   }

//   return NextResponse.next();
// }

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const accessToken = req.cookies.get("accessToken")?.value;

  const protectedRoute = pathname.startsWith("/staff/dashboard");
  if (!protectedRoute) return NextResponse.next();

  if (!accessToken) {
    return NextResponse.redirect(new URL("/?auth=login", req.url));
  }

  const payload: any = await verifyToken(accessToken);
  if (!payload) {
    return NextResponse.redirect(new URL("/?auth=login", req.url));
  }

  const role = payload?.role || payload?.user?.role;
  if (!role) {
    return NextResponse.redirect(new URL("/?auth=login", req.url));
  }

  // ✅ FIX: Sort routes by length (longest first) to prevent 
  // "/admin" from matching before "/admin/product-management"
  const sortedRoutes = Object.keys(roleRoutes).sort(
    (a, b) => b.length - a.length
  );

  for (const route of sortedRoutes) {
    if (pathname.startsWith(route)) {
      const allowedRoles = roleRoutes[route];
      if (!allowedRoles.includes(role)) {
        return NextResponse.redirect(
          new URL(getDashboardRoute(role), req.url)
        );
      }
      break; 
    }
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/staff/dashboard/:path*"],
};
