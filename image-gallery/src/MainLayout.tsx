import { Header } from "./Header.tsx";
import { Outlet } from "react-router-dom";

export function MainLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}
