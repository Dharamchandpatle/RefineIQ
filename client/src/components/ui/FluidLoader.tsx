type FluidLoaderProps = {
  size?: number;
  className?: string;
};

const FluidLoader = ({ size = 96, className = "" }: FluidLoaderProps) => {
  return (
    <div
      className={`fluid-loader ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      <div className="fluid-loader__ring" />
      <div className="fluid-loader__liquid">
        <div className="fluid-loader__wave fluid-loader__wave--one" />
        <div className="fluid-loader__wave fluid-loader__wave--two" />
      </div>
    </div>
  );
};

export default FluidLoader;
