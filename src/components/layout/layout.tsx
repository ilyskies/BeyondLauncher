import { JSX, ReactNode } from "react";
import { Frame } from "./frame";
import { Background } from "../shared/background";
import { ErrorBanner } from "../shared/banners/error_banner";

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="relative h-screen w-full bg-background overflow-hidden">
      <Background />
      <ErrorBanner />
      <div className="relative z-10 flex h-full flex-col">
        <Frame />
        {children}
      </div>
    </div>
  );
}
