import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RootState } from "@/redux/store";
import { IProduct } from "@/types";
import { ShoppingCart, Facebook, Twitter, Linkedin, Send } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

// ─── Quick View Modal ───
const QuickViewModal = ({
  product,
  open,
  onClose,
  onAddToCart,
}: {
  product: IProduct;
  open: boolean;
  onClose: () => void;
  onAddToCart: (qty: number) => void;
}) => {
  const cartList = useSelector((state: RootState) => state.cart.items);
  const cartItem = cartList.find(
    (item) => item?.slug === product?.slug || item?._id === product?._id,
  );
  const isOutOfStock = !product?.availableStock || product?.availableStock <= 0;
  const availableStock = product?.availableStock || 0;
  const isMaxQtyReached = cartItem && cartItem.quantity >= availableStock;

  const [qty, setQty] = useState(1);
  const router = useRouter();

  const displayImage = product.images?.[0] ?? "/placeholder.png";
  const hasDiscount =
    !!product.discountPrice && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice! : product.price;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareLinks = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      bg: "bg-blue-600",
      icon: <Facebook size={13} className="text-white" />,
    },
    {
      label: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?url=${shareUrl}`,
      bg: "bg-black",
      icon: <Twitter size={13} className="text-white" />,
    },
    {
      label: "Pinterest",
      href: `https://pinterest.com/pin/create/button/?url=${shareUrl}`,
      bg: "bg-red-600",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
        </svg>
      ),
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      bg: "bg-blue-700",
      icon: <Linkedin size={13} className="text-white" />,
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${shareUrl}`,
      bg: "bg-sky-500",
      icon: <Send size={13} className="text-white" />,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
      w-[95vw] max-w-3xl md:max-w-4xl
      p-0 overflow-hidden rounded-2xl
      max-h-[90vh] overflow-y-auto
    "
      >
        <DialogTitle className="sr-only">{product.title}</DialogTitle>

        <div className="flex flex-col lg:flex-row">
          {/* ───── IMAGE SECTION ───── */}
          <div
            className="
        w-full lg:w-1/2
        bg-gray-50
        p-4 sm:p-6
        flex items-center justify-center
        min-h-[260px] sm:min-h-[320px] lg:min-h-[420px]
      "
          >
            <Image
              src={displayImage}
              alt={product.title}
              width={500}
              height={500}
              className="
            w-full max-w-65 sm:max-w-[320px] lg:max-w-95
            h-auto object-contain rounded-xl
          "
            />
          </div>

          {/* ───── INFO SECTION ───── */}
          <div
            className="
        w-full lg:w-1/2
        p-5 sm:p-6 lg:p-8
        flex flex-col gap-4 sm:gap-5
      "
          >
            {/* TITLE */}
            <h2
              className="
          text-base sm:text-lg lg:text-xl
          font-bold text-gray-900 leading-snug
        "
            >
              {product.title}
            </h2>

            {/* PRICE */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xl sm:text-2xl font-bold text-[#F5A623]">
                ৳ {displayPrice?.toLocaleString()}.00
              </span>

              {hasDiscount && (
                <span className="text-xs sm:text-sm text-gray-400 line-through">
                  ৳ {product.price.toLocaleString()}.00
                </span>
              )}
            </div>

            {/* QUANTITY + BUTTONS */}
            <div
              className="
          flex flex-wrap sm:flex-row
          gap-2 sm:gap-3
          items-stretch sm:items-center
        "
            >
              {/* QTY */}
              <div
                className="
            flex items-center
            border border-gray-200 rounded-lg
            overflow-hidden
           
          "
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-none"
                  disabled={qty <= 1}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  -
                </Button>

                <span
                  className="
              w-12 h-10 flex items-center justify-center
              text-sm font-semibold
              border-x border-gray-200
            "
                >
                  {qty}
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-none"
                  onClick={() => {
                    const existingQty = cartItem?.quantity || 0;
                    if (existingQty + qty < availableStock) {
                      setQty((q) => q + 1);
                    } else {
                      toast.error("Stock limit reached");
                    }
                  }}
                >
                  +
                </Button>
              </div>

              {/* ACTION BUTTONS */}
              {isOutOfStock ? (
                <button
                  disabled
                  className="
                w-full sm:flex-1
                h-10
                rounded-md
                bg-red-100 border border-red-300
                text-red-500
                text-sm font-semibold
                cursor-not-allowed
              "
                >
                  Out of Stock
                </button>
              ) : (
                <>
                  <Button
                    onClick={() => onAddToCart(qty)}
                    className="
                  w-full sm:flex-1
                  h-10
                  bg-blue-600 hover:bg-blue-700
                  text-white font-bold
                  text-sm
                "
                  >
                    <ShoppingCart size={14} />
                    Add To Cart
                  </Button>

                  <Button
                    onClick={() => {
                      if (isMaxQtyReached) {
                        router.push("/checkout");
                      } else {
                        onAddToCart(qty);
                        router.push("/checkout");
                      }
                    }}
                    className="
                  w-full sm:flex-1
                  h-10
                  bg-green-600 hover:bg-green-700
                  text-white font-bold
                  text-sm
                "
                  >
                    Buy Now
                  </Button>
                </>
              )}
            </div>

            <Separator />

            {/* CATEGORY */}
            <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
              <span className="font-semibold text-gray-700">Category:</span>
              <Badge variant="secondary" className="text-xs">
                {product.category[0]?.title}
              </Badge>
            </div>

            {/* SHARE */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-semibold text-gray-700">
                Share:
              </span>

              {shareLinks.map(({ label, href, bg, icon }) => (
                <Tooltip key={label}>
                  <TooltipTrigger asChild>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className={`
                    w-8 h-8 rounded-full ${bg}
                    flex items-center justify-center
                  `}
                    >
                      {icon}
                    </a>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>{label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;
