import gsap from "gsap";
import { ReactNode, useEffect, useRef } from "react";

interface AppBackgroundProps {
  children: ReactNode;
}

const AppBackground = ({ children }: AppBackgroundProps) => {
  const blobOrangeRef = useRef<HTMLDivElement | null>(null);
  const blobBlueRef = useRef<HTMLDivElement | null>(null);
  const blobAmberRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const orange = blobOrangeRef.current;
    const blue = blobBlueRef.current;
    const amber = blobAmberRef.current;

    if (!orange || !blue || !amber) return;

    gsap.to(orange, {
      x: 60,
      y: -40,
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(blue, {
      x: -80,
      y: 50,
      duration: 10,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(amber, {
      x: 40,
      y: 70,
      duration: 9,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-10 -left-10 h-64 w-64 rounded-full bg-[#F37021]/30 blur-3xl" ref={blobOrangeRef} />
        <div className="absolute top-24 right-10 h-72 w-72 rounded-full bg-[#003A8F]/25 blur-3xl" ref={blobBlueRef} />
        <div className="absolute -bottom-16 left-1/3 h-72 w-72 rounded-full bg-[#FFB74D]/30 blur-3xl" ref={blobAmberRef} />
      </div>

      <div className="relative z-0">{children}</div>
    </div>
  );
};

export default AppBackground;
