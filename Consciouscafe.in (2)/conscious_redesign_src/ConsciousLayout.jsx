import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Nav } from "./components/Nav";
import { MobileMenu } from "./components/MobileMenu";
import { CartDrawer } from "./components/CartDrawer";
import { Footer } from "./components/Footer";
import { Toast } from "./components/Toast";

/* Persistent chrome around every routed page. Use it as a layout route
   (a parent <Route element={<ConsciousLayout/>}> with child routes). */
export function ConsciousLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <React.Fragment>
      <Nav onBurger={() => setMobileOpen((o) => !o)} mobileOpen={mobileOpen} />
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Outlet />
      <Footer />
      <CartDrawer />
      <Toast />
    </React.Fragment>
  );
}
