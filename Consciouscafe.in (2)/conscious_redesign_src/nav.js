/* useGoNav — maps the prototype's nav ids to react-router navigation.
   "gather" (Sanctuary) is a section on Home, so we route home then scroll. */
import { useNavigate } from "react-router-dom";

// Story is mounted at /story by default. To use the app's existing /about
// route instead, change "story" below to "/about" AND mount <Story/> there.
export function useGoNav() {
  const navigate = useNavigate();
  return (id) => {
    switch (id) {
      case "menu": navigate("/menu"); break;
      case "story": navigate("/story"); break;
      case "visit": navigate("/visit"); break;
      case "gather":
        navigate("/");
        setTimeout(() => {
          const el = document.getElementById("gather");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 90);
        break;
      case "home":
      default: navigate("/"); window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
}
