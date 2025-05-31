import { Header } from "./Header";
import { Outlet } from "react-router-dom";
import type { ReactNode } from "react";

interface MainLayoutProps {
  children?: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <Header />
      <main>
        {children ?? <Outlet />}
      </main>
    </>
  );
}
