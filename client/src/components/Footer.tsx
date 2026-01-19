const Footer = () => (
  <footer className="border-t border-slate-300 bg-slate-950 text-slate-200 dark:border-slate-800 dark:bg-slate-950">
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-3">
        <img
          src="/images/Indian_Oil_Logo.svg.png"
          alt="Indian Oil Corporation Limited"
          className="h-8 w-auto object-contain"
        />
        <span>© Indian Oil Corporation Limited. All rights reserved.</span>
      </div>
      <span className="text-slate-400">RefineryIQ • Smart Refinery Intelligence Platform</span>
    </div>
  </footer>
);

export default Footer;
