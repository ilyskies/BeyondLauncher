import { Frame } from "./components/layout/frame";
import { Background } from "./components/shared/background";

export default function Home() {
  return (
    <div className="relative h-screen w-full bg-background overflow-hidden">
      <Background />

      <div className="relative z-10 flex h-full flex-col">
        <Frame />
      </div>
    </div>
  );
}
