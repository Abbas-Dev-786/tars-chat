const PageLoader = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="animate-pulse flex space-x-2">
        <div className="h-3 w-3 bg-primary rounded-full"></div>
        <div className="h-3 w-3 bg-primary rounded-full"></div>
        <div className="h-3 w-3 bg-primary rounded-full"></div>
      </div>
    </div>
  );
};

export default PageLoader;
