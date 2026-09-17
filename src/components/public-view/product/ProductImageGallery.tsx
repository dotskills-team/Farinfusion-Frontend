// "use client";

// import React, { useState } from "react";
// import Image from "next/image";
// import { cn } from "@/lib/utils";
// import Zoom from "react-medium-image-zoom";
// import "react-medium-image-zoom/dist/styles.css";
// import { ZoomIn } from "lucide-react";

// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
//   type CarouselApi,
// } from "@/components/ui/carousel";

// interface Props {
//   images: string[];
//   title: string;
// }

// const ProductImageGallery: React.FC<Props> = ({ images = [], title }) => {
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [api, setApi] = useState<CarouselApi>();

//   const handleThumbClick = (index: number) => {
//     setActiveIndex(index);
//     api?.scrollTo(index);
//   };

//   return (
//     <div className="flex flex-col sm:flex-row gap-4">
//       <div className="p-2 bg-amber-50 flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible order-2 sm:order-1">
//         {images.map((img, i) => (
//           <button
//             key={i}
//             onClick={() => handleThumbClick(i)}
//             className={cn(
//               "w-14 sm:w-[150] h-14 sm:h-[150] rounded-lg overflow-hidden border-2 shrink-0",
//               activeIndex === i ? "border-amber-500" : "border-gray-200",
//             )}
//           >
//             <Image
//               src={img || ""}
//               alt={`thumb-${i}`}
//               width={80}
//               height={80}
//               className="object-cover w-full h-full"
//             />
//           </button>
//         ))}
//       </div>

//       {/* 🔥 Carousel */}
//       <div className="relative flex-1 order-1 sm:order-2">
//         <Carousel setApi={setApi} className="relative">
//           <CarouselContent>
//             {images.map((img, i) => (
//               <CarouselItem key={i}>
//                 <div className="relative w-full h-87.5 md:h-110 bg-gray-50 rounded-xl overflow-hidden">
//                   <Zoom>
//                     <Image
//                       src={img || ""}
//                       alt={title}
//                       fill
//                       className="object-cover"
//                       sizes="(max-width: 768px) 100vw, 50vw"
//                       priority={i === 0}
//                     />
//                   </Zoom>
//                 </div>
//               </CarouselItem>
//             ))}
//           </CarouselContent>

//           <CarouselPrevious className="left-2 z-10" />
//           <CarouselNext className="right-2 z-10" />
//         </Carousel>

//         {/* Zoom icon */}
//         <div className="absolute bottom-3 left-3 bg-white/90 p-2 rounded-full shadow pointer-events-none z-10">
//           <ZoomIn size={25} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductImageGallery;



"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { ZoomIn } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

interface Props {
  images: string[];
  title: string;
  isOutOfStock?: boolean;
}

const ProductImageGallery: React.FC<Props> = ({
  images = [],
  title,
  isOutOfStock = false,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  const handleThumbClick = (index: number) => {
    setActiveIndex(index);
    api?.scrollTo(index);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="p-2 bg-amber-50 flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible order-2 sm:order-1">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => handleThumbClick(i)}
            className={cn(
              "w-14 sm:w-[150] h-14 sm:h-[150] rounded-lg overflow-hidden border-2 shrink-0",
              activeIndex === i ? "border-amber-500" : "border-gray-200",
            )}
          >
            <Image
              src={img || ""}
              alt={`thumb-${i}`}
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          </button>
        ))}
      </div>

      {/* 🔥 Carousel */}
      <div className="relative flex-1 order-1 sm:order-2">
        <Carousel setApi={setApi} className="relative">
          <CarouselContent>
            {images.map((img, i) => (
              <CarouselItem key={i}>
                <div className="relative w-full h-87.5 md:h-110 bg-gray-50 rounded-xl overflow-hidden">
                  {isOutOfStock && (
                    <span className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-bold uppercase tracking-wide shadow-md">
                      Out of Stock
                    </span>
                  )}

                  <Zoom>
                    <Image
                      src={img || ""}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={i === 0}
                    />
                  </Zoom>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="left-2 z-10" />
          <CarouselNext className="right-2 z-10" />
        </Carousel>

        {/* Zoom icon */}
        <div className="absolute bottom-3 left-3 bg-white/90 p-2 rounded-full shadow pointer-events-none z-10">
          <ZoomIn size={25} />
        </div>
      </div>
    </div>
  );
};

export default ProductImageGallery;