// "use client";

// import { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";
// import { COURIER_PROVIDERS } from "@/lib/constants/courierProviders";
// import { CheckCircle2, Truck } from "lucide-react";
// import { CourierProvider } from "@/types";

// interface AssignCourierModalProps {
//   open: boolean;
//   onClose: () => void;
//   onSubmit: (courierName: CourierProvider) => void;
//   loading?: boolean;
// }

// export function AssignCourierModal({
//   open,
//   onClose,
//   onSubmit,
//   loading,
// }: AssignCourierModalProps) {
// const [selected, setSelected] =
//   useState<CourierProvider>("STEADFAST");

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-xl overflow-hidden border border-gray-200 bg-white p-0 shadow-xl rounded-xl">
//         {/* Header */}
//         <div className="border-b border-gray-200 px-6 py-5">
//           <div className="flex items-center gap-3 mb-1">
//             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-amber-400 to-amber-500 shadow-sm">
//               <Truck className="h-4 w-4 text-white" />
//             </div>
//             <DialogTitle className="text-base font-semibold text-gray-900 tracking-tight">
//               Select Courier Provider
//             </DialogTitle>
//           </div>
//           <DialogDescription className="text-xs text-gray-500 pl-11 leading-relaxed">
//             Choose a delivery partner for this shipment. Coverage and pricing
//             may vary.
//           </DialogDescription>
//         </div>

//         {/* Provider List */}
//         <div className="px-5 py-4 space-y-2.5">
//           {COURIER_PROVIDERS.map((provider) => {
//             const isSelected = selected === provider.value;

//             return (
//               <button
//                 key={provider.value}
//                onClick={() => setSelected(provider.value as CourierProvider)}
//                 className={cn(
//                   "group hover:cursor-pointer w-full rounded-lg border text-left transition-all duration-150",
//                   "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1",
//                   isSelected
//                     ? "border-amber-400 bg-amber-50 shadow-sm"
//                     : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/40",
//                 )}
//               >
//                 <div className="flex items-start gap-4 p-4">
//                   {/* Radio indicator */}
//                   <div className="mt-0.5 shrink-0">
//                     {isSelected ? (
//                       <CheckCircle2 className="h-5 w-5 text-amber-500" />
//                     ) : (
//                       <div className="h-5 w-5 rounded-full border-2 border-gray-300 group-hover:border-amber-400 transition-colors" />
//                     )}
//                   </div>

//                   {/* Content */}
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center justify-between gap-2 mb-1">
//                       <span
//                         className={cn(
//                           "text-sm font-semibold transition-colors",
//                           isSelected ? "text-amber-700" : "text-gray-800",
//                         )}
//                       >
//                         {provider.name}
//                       </span>
//                       <span
//                         className={cn(
//                           "shrink-0 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
//                           isSelected
//                             ? "bg-amber-100 text-amber-600 border border-amber-300"
//                             : "bg-gray-100 text-gray-500 border border-gray-200",
//                         )}
//                       >
//                         {provider.badge}
//                       </span>
//                     </div>

//                     <p className="text-xs text-gray-500 mb-3 leading-relaxed">
//                       {provider.description}
//                     </p>

//                     {/* Features */}
//                     <div className="flex flex-wrap gap-x-4 gap-y-1.5">
//                       {provider.features.map((feature, idx) => {
//                         const Icon = feature.icon;
//                         return (
//                           <div key={idx} className="flex items-center gap-1.5">
//                             <Icon
//                               className={cn(
//                                 "h-3 w-3 shrink-0 transition-colors",
//                                 isSelected
//                                   ? "text-amber-500"
//                                   : "text-gray-400 group-hover:text-amber-400",
//                               )}
//                             />
//                             <span className="text-xs text-gray-500">
//                               {feature.title}
//                             </span>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 </div>
//               </button>
//             );
//           })}
//         </div>

//         {/* Footer */}
//         <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-2 space-y-3">
//           <Button
//             onClick={() => onSubmit(selected as CourierProvider)}
//             disabled={loading}
//             className={cn(
//               "w-full hover:cursor-pointer h-10 rounded-lg font-semibold text-sm tracking-wide border-0",
//               "bg-linear-to-b from-amber-400 to-amber-600 hover:from-amber-600 hover:to-amber-500",
//               "text-white shadow-sm hover:shadow-md transition-all duration-150",
//               "disabled:opacity-50 disabled:cursor-not-allowed",
//             )}
//           >
//             {loading ? (
//               <span className="flex items-center justify-center gap-2">
//                 <svg
//                   className="h-4 w-4 animate-spin"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   />
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
//                   />
//                 </svg>
//                 Assigning courier…
//               </span>
//             ) : (
//               "Confirm & Assign Courier"
//             )}
//           </Button>

//           <p className="text-center text-[11px] text-gray-400">
//             You can reassign the courier before the order is picked up
//           </p>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { COURIER_PROVIDERS } from "@/lib/constants/courierProviders";
import { CheckCircle2, Truck } from "lucide-react";
import { CourierProvider } from "@/types";

interface AssignCourierModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (courierName: CourierProvider) => void;
  loading?: boolean;
}

export function AssignCourierModal({
  open,
  onClose,
  onSubmit,
  loading,
}: AssignCourierModalProps) {
  const [selected, setSelected] = useState<CourierProvider>("STEADFAST");

  // Extra guard on top of the `loading` prop: React state updates aren't
  // synchronous, so a fast double-click can fire onSubmit twice before the
  // parent's `loading` actually flips to true. This local flag closes that
  // gap immediately on click.
  const [submitting, setSubmitting] = useState(false);
  const isBusy = loading || submitting;

  // On success the parent closes the modal by flipping the `open` prop
  // directly (not via onOpenChange), so it never reaches handleOpenChange
  // below. Without this effect, `submitting` from the previous assignment
  // stays true and the button opens the next time already disabled/stuck.
  // Resetting on every `open` transition means each fresh open starts clean.
  useEffect(() => {
    setSubmitting(false);
  }, [open]);

  const handleSubmit = () => {
    if (isBusy) return;
    setSubmitting(true);
    onSubmit(selected as CourierProvider);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden border border-gray-200 bg-white p-0 shadow-xl rounded-xl">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-amber-400 to-amber-500 shadow-sm">
              <Truck className="h-4 w-4 text-white" />
            </div>
            <DialogTitle className="text-base font-semibold text-gray-900 tracking-tight">
              Select Courier Provider
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-gray-500 pl-11 leading-relaxed">
            Choose a delivery partner for this shipment. Coverage and pricing
            may vary.
          </DialogDescription>
        </div>

        {/* Provider List */}
        <div className="px-5 py-4 space-y-2.5">
          {COURIER_PROVIDERS.map((provider) => {
            const isSelected = selected === provider.value;

            return (
              <button
                key={provider.value}
                disabled={isBusy}
                onClick={() => setSelected(provider.value as CourierProvider)}
                className={cn(
                  "group hover:cursor-pointer w-full rounded-lg border text-left transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  isSelected
                    ? "border-amber-400 bg-amber-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/40",
                )}
              >
                <div className="flex items-start gap-4 p-4">
                  {/* Radio indicator */}
                  <div className="mt-0.5 shrink-0">
                    {isSelected ? (
                      <CheckCircle2 className="h-5 w-5 text-amber-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 group-hover:border-amber-400 transition-colors" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={cn(
                          "text-sm font-semibold transition-colors",
                          isSelected ? "text-amber-700" : "text-gray-800",
                        )}
                      >
                        {provider.name}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                          isSelected
                            ? "bg-amber-100 text-amber-600 border border-amber-300"
                            : "bg-gray-100 text-gray-500 border border-gray-200",
                        )}
                      >
                        {provider.badge}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                      {provider.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                      {provider.features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                          <div key={idx} className="flex items-center gap-1.5">
                            <Icon
                              className={cn(
                                "h-3 w-3 shrink-0 transition-colors",
                                isSelected
                                  ? "text-amber-500"
                                  : "text-gray-400 group-hover:text-amber-400",
                              )}
                            />
                            <span className="text-xs text-gray-500">
                              {feature.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-2 space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={isBusy}
            className={cn(
              "w-full hover:cursor-pointer h-10 rounded-lg font-semibold text-sm tracking-wide border-0",
              "bg-linear-to-b from-amber-400 to-amber-600 hover:from-amber-600 hover:to-amber-500",
              "text-white shadow-sm hover:shadow-md transition-all duration-150",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {isBusy ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Assigning courier…
              </span>
            ) : (
              "Confirm & Assign Courier"
            )}
          </Button>

          <p className="text-center text-[11px] text-gray-400">
            You can reassign the courier before the order is picked up
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

