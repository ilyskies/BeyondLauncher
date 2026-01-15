import { JSX, ReactNode } from "react";
import { Frame } from "./frame";
import Particles from "../ui/particles";
import { ToastContainer } from "../ui/toast-container";

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <Particles quantity={90} staticity={70} ease={50} />
      <ToastContainer />
      <div className="relative z-10 flex h-full flex-col">
        <Frame />
        {children}
      </div>
    </div>
  );
}
