import React from "react";
import { useCart } from "../cart/CartContext";

export function Toast() {
  const { toast } = useCart();
  return <div className={`toast ${toast.show ? "show" : ""}`}>{toast.msg}</div>;
}
