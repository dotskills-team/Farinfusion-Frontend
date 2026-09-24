"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Category {
  slug: string;
  title: string;
}

interface CategoryNavProps {
  categories: Category[];
  isSticky?: boolean;
  onNavigate?: () => void;
}

const GAP = 16; // px, matches gap-4
const MORE_BUTTON_WIDTH = 110; // px, "More ⌄" button width + safety margin

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  isSticky,
  onNavigate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(categories.length);

  useLayoutEffect(() => {
    const calculate = () => {
      const container = containerRef.current;
      const measure = measureRef.current;
      if (!container || !measure) return;

      const containerWidth = container.offsetWidth;
      const children = Array.from(measure.children) as HTMLElement[];

      let totalWidth = 0;
      let count = 0;

      for (let i = 0; i < children.length; i++) {
        const w = children[i].offsetWidth;
        const gapWidth = count > 0 ? GAP : 0; // gap before this item
        const remaining = children.length - (i + 1);
        const projected =
          totalWidth + gapWidth + w + (remaining > 0 ? GAP + MORE_BUTTON_WIDTH : 0);

        if (projected > containerWidth) break;

        totalWidth += gapWidth + w;
        count++;
      }

      setVisibleCount(count);
    };

    calculate();

    const ro = new ResizeObserver(calculate);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", calculate);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", calculate);
    };
  }, [categories, isSticky]);

  const visibleCategories = categories.slice(0, visibleCount);
  const hiddenCategories = categories.slice(visibleCount);

  const linkClass = `text-gray-100 whitespace-nowrap capitalize hover:text-[#c9a84c] transition-colors ${
    isSticky ? "text-[12px]" : "text-[14px]"
  }`;

  return (
    <div ref={containerRef} className="relative w-full min-w-0 overflow-hidden">
      {/* Hidden clone — used only to measure natural widths of every item */}
      <div
        ref={measureRef}
        className="flex items-center gap-4 absolute top-0 left-0 invisible pointer-events-none -z-10"
        aria-hidden="true"
      >
        {categories.map((category) => (
          <span key={category.slug} className={`${linkClass} px-1`}>
            {category.title}
          </span>
        ))}
      </div>

      {/* Actual visible nav */}
      <ul className="flex items-center gap-4">
        {visibleCategories.map((category) => (
          <li key={category.slug} className="shrink-0">
            <Link
              href={`/shop?category=${category.slug}`}
              className={linkClass}
              onClick={onNavigate}
            >
              {category.title}
            </Link>
          </li>
        ))}

        {hiddenCategories.length > 0 && (
          <li className="shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`${linkClass} flex items-center gap-1 outline-none whitespace-nowrap`}
                >
                  More
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="max-h-80 overflow-y-auto no-scrollbar bg-[#2D3436] border-white/10"
              >
                {hiddenCategories.map((category) => (
                  <DropdownMenuItem key={category.slug} asChild>
                    <Link
                      href={`/shop?category=${category.slug}`}
                      className="capitalize text-gray-100  focus:bg-white/10 focus:text-yellow-500/80  cursor-pointer"
                      onClick={onNavigate}
                    >
                      {category.title}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        )}
      </ul>
    </div>
  );
};