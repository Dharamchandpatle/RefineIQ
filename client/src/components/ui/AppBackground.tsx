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
    <div className="relative min-h-screen w-full overflow-hidden bg-white dark:bg-[#0B1220]">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F37021]/20 via-white/70 to-[#003A8F]/20 dark:from-[#F37021]/15 dark:via-[#0B1220]/70 dark:to-[#7FB0FF]/20" />
        <div className="absolute inset-0 bg-white/30 backdrop-blur-2xl dark:bg-slate-900/20" />
        <div className="absolute -top-10 -left-10 h-64 w-64 rounded-full bg-[#F37021]/30 dark:bg-[#F37021]/20 blur-3xl" ref={blobOrangeRef} />
        <div className="absolute top-24 right-10 h-72 w-72 rounded-full bg-[#003A8F]/25 dark:bg-[#7FB0FF]/20 blur-3xl" ref={blobBlueRef} />
        <div className="absolute -bottom-16 left-1/3 h-72 w-72 rounded-full bg-[#FFB74D]/30 dark:bg-[#FFB74D]/20 blur-3xl" ref={blobAmberRef} />
      </div>

      <div className="relative z-0">{children}</div>
    </div>
  );
};

export default AppBackground;
