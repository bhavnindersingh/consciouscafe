/* Example wiring. Drop these <Route>s into your existing react-router tree,
   OR mount <ConsciousApp/> as-is if you want a self-contained app.

   IMPORTANT: <CartProvider> must wrap every page that reads the cart, and a
   react-router <BrowserRouter> must be an ancestor (index.js usually has one).

   To mount Story at the app's existing /about route instead of /story:
     1. change the Story <Route path> below to "/about"
     2. in nav.js change the "story" case to navigate("/about")
   ...and delete the old AboutUs route/component. */

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./cart/CartContext";
import { ConsciousLayout } from "./ConsciousLayout";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Dish from "./pages/Dish";
import Story from "./pages/Story";
import Visit from "./pages/Visit";
import "./styles/conscious.css";

/* These are the five routes + the shared layout. Paste this <Routes> block
   into your existing <BrowserRouter>, or use <ConsciousApp/> below standalone. */
export function ConsciousRoutes() {
  return (
    <Routes>
      <Route element={<ConsciousLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/menu/:id" element={<Dish />} />
        <Route path="/story" element={<Story />} />
        <Route path="/visit" element={<Visit />} />
      </Route>
    </Routes>
  );
}

export default function ConsciousApp() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ConsciousRoutes />
      </CartProvider>
    </BrowserRouter>
  );
}
