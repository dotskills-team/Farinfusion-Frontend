// import Navbar from "@/components/modules/Navbar";

import AnnouncementBar from "@/components/modules/AnnouncementBar";
import Navbar from "@/components/modules/Navbar";
import ReduxProvider from "@/providers/ReduxProvider";
import React from "react";
import NavbarMenu from "@/components/modules/NavbarMenu";
import FarinFusionFooter from "@/components/public-view/common/FarinFusionFooter";
import {TooltipProvider} from "@/components/ui/tooltip";


export default async function CommonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <ReduxProvider>
        <TooltipProvider>
            <AnnouncementBar />
            <Navbar />
            <NavbarMenu />
            <main>{children}</main>
            <FarinFusionFooter />
            {/* </UserProvider> */}
        </TooltipProvider>
    // </ReduxProvider>
  );
}
