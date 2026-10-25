import { Metadata } from "next";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { ReviewsPageClient } from "@/components/dashboard/reviews/ReviewsPageClient";
import WrongAssignedProductManagement from "@/components/wrongAssignedProduct/Wrongassignedproductmanagement ";

export const metadata: Metadata = {
  title: "Review Management | FarinFusion",
  description: "Manage customer reviews and ratings for your products",
  keywords: "reviews, ratings, customer feedback, management",
};

export default function WrongAssignedProductsPage() {
  return (
    <main className="space-y-6">
      <DashboardPageHeader
        title="Wrong Assigned Products"
        subTitle="Manage and monitor all wrong assigned products"
      />
      <WrongAssignedProductManagement />
    </main>
  );
}
