
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Menu, Gift, Heart, ShoppingCart, Search, X } from "lucide-react";
import Image from "next/image";
import { NavbarDropdown } from "@/components/modules/NavbarDropdown";
import { CategoryNav } from "@/components/modules/CategoryNav";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/SignupForm";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { usePathname, useRouter } from "next/navigation";
import { useGetAllCategoriesQuery } from "@/redux/features/category/category.api";
import { SearchDropdown } from "./SearchDropdown";
import { Input } from "../ui/input";

const NavbarMenu: React.FC = () => {
  const [isSticky, setIsSticky] = useState(false);
  const router = useRouter();
  const { user, logout } = useUser();
  const { data: categoriesData } = useGetAllCategoriesQuery({ limit: 100 });
  const categories = categoriesData?.data ?? [];

  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [SearchModalOpen, setSearchModalOpen] = useState(false);

  const cartCount = useSelector((state: RootState) => state.cart.items.length);
  const wishCount = useSelector((state: RootState) => state.wish.items.length);
  const pathname = usePathname();

  const handleSpecialBeautyDeal = () => {
    if (pathname === "/") {
      const section = document.getElementById("best-selling");

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
      return;
    }

    router.push("/#best-selling");
  };

  function closeAll() {
    setLoginOpen(false);
    setSignupOpen(false);
  }

  function openLogin() {
    setSignupOpen(false);
    setLoginOpen(true);
  }

  function openSignup() {
    setLoginOpen(false);
    setSignupOpen(true);
  }

  const [navHeight, setNavHeight] = useState(0);
  const navRef = useRef<HTMLElement>(null);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setSearchOpen(val.trim().length >= 2);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchOpen(false);
  };

  const handleSearchSubmit = () => {
    const query = searchQuery.trim();

    if (query) {
      router.push(`/shop?search=${encodeURIComponent(query)}`);
    } else {
      router.push(`/shop`);
    }

    setSearchOpen(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit();
    }

    if (e.key === "Escape") {
      setSearchOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchModalOpen(false);
        setSearchOpen(false);
      }
    };

    if (SearchModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [SearchModalOpen]);

  return (
    <>
      {isSticky && <div style={{ height: navHeight }} />}

      <nav
        ref={navRef}
        className={`bg-[#2D3436] py-3 shadow-md transition-all duration-500 ease-in-out
                    ${
                      isSticky
                        ? "fixed top-0 left-0 w-full z-50 shadow-lg animate-fadeIn"
                        : "relative"
                    }`}
      >
        <div className="max-w-354 flex items-center justify-between gap-12 container mx-auto px-5">
          {/* LEFT */}
          <div className="xl:hidden flex items-center gap-5">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-neutral-300"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          {isSticky && (
            <Link href={"/"}>
              <Image
                src={"/assets/FRN-Logo-scaled.webp"}
                alt="Farin Fusion"
                width={140}
                height={48}
                className="h-12 w-40 sm:w-auto object-contain"
                priority
              />
            </Link>
          )}

          {/* CENTER */}
          <div className="hidden xl:flex flex-1 min-w-0 mx-4">
            <CategoryNav categories={categories} isSticky={isSticky} />
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-1">
            {/* SEARCH */}
            <div className="lg:hidden block relative">
              <button
                onClick={() => setSearchModalOpen((prev) => !prev)}
                className="flex items-center bg-white/10 hover:bg-white/20 transition rounded-full p-2"
              >
                <Search size={20} className="text-white" />
              </button>
            </div>
            {SearchModalOpen && (
              <div
                ref={searchContainerRef}
                className="absolute right-5 left-5 mx-auto top-full mt-3 w-[90vw] md:w-125  z-50"
              >
                <div className="relative">
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    onFocus={() =>
                      searchQuery.trim().length >= 2 && setSearchOpen(true)
                    }
                    placeholder="Search for products"
                    autoComplete="off"
                    className="w-full rounded-full py-5 pl-5 pr-24 bg-white text-sm "
                  />

                  {/* Clear button */}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-12 top-1/2 -translate-y-1/2 transition-colors p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}

                  {/* Divider + Search icon */}
                  <span className="absolute right-11 top-1/2 -translate-y-1/2 h-5 w-px bg-slate-600" />
                  <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    aria-label="Search"
                    className="absolute right-0 top-0 bottom-0 flex w-11 items-center justify-center rounded-r-full text-slate-400 hover:text-yellow-500 transition-colors duration-200"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>

                {/* Search dropdown */}
                {searchOpen && (
                  <SearchDropdown
                    query={searchQuery}
                    onClose={() => setSearchOpen(false)}
                  />
                )}
              </div>
            )}

            {isSticky ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => router.push("/wishlist")}
                  className="cursor-pointer relative flex h-9 w-9 items-center justify-center text-white hover:text-[#c9a84c]"
                >
                  <Heart className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#c9a84c] text-[9px] font-bold text-black">
                    {wishCount}
                  </span>
                </button>

                <button
                  onClick={() => router.push("/cart")}
                  className="cursor-pointer relative flex h-9 w-9 items-center justify-center text-white hover:text-[#c9a84c]"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#c9a84c] text-[9px] font-bold text-black">
                    {cartCount}
                  </span>
                </button>

                {user ? (
                  <NavbarDropdown user={user} onLogout={logout} />
                ) : (
                  <div className="hidden lg:block">
                    <div className="flex items-center text-sm font-semibold text-white">
                      <Button
                        variant="ghost"
                        onClick={openLogin}
                        className="px-2 text-white hover:text-[#c9a84c] hover:bg-transparent"
                      >
                        Login
                      </Button>

                      <span className="text-[#96999A]">/</span>

                      <Button
                        variant="ghost"
                        onClick={openSignup}
                        className="px-2 text-white hover:text-[#c9a84c] hover:bg-transparent"
                      >
                        Register
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={handleSpecialBeautyDeal} className="text-white">
                <div className="hover:cursor-pointer flex items-center gap-2.5 px-6 py-2 rounded-full fusion-offer">
                  <Gift className="w-5 h-5" />
                  <span className="text-[13px] font-bold">
                    BEST SELLING PRODUCTS
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* MOBILE SHEET */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-70 p-0 flex flex-col h-full">
            {/* Scrollable category list */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
              <h2 className="text-lg font-semibold mb-4">Menu</h2>

              <ul className="flex flex-col gap-2">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/shop?category=${category.slug}`}
                      className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sticky footer — always visible, never scrolls away */}
            <div className="shrink-0 border-t p-4 bg-white">
              {user ? (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openLogin();
                    }}
                  >
                    Login
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openSignup();
                    }}
                  >
                    Register
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* AUTH MODALS */}
        <LoginForm
          isOpen={loginOpen}
          onClose={closeAll}
          onSwitchToSignup={openSignup}
          onSwitchToForgot={closeAll}
        />

        <RegisterForm
          isOpen={signupOpen}
          onClose={closeAll}
          onSwitchToLogin={openLogin}
        />
      </nav>
    </>
  );
};

export default NavbarMenu;