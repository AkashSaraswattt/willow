const DiscoverSkeleton = ({ count = 6, layout = 'grid' }) => {
  if (layout === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-base-100 rounded-2xl p-4 border border-base-300/50">
            <div className="flex items-center gap-4">
              <div className="skeleton w-12 h-12 rounded-full"></div>
              <div className="flex-1">
                <div className="skeleton h-4 w-24 mb-2"></div>
                <div className="skeleton h-3 w-32"></div>
              </div>
              <div className="skeleton h-9 w-24 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-base-100 rounded-2xl p-4 border border-base-300/50">
          <div className="flex items-center gap-4">
            <div className="skeleton w-12 h-12 rounded-full"></div>
            <div className="flex-1">
              <div className="skeleton h-4 w-24 mb-2"></div>
              <div className="skeleton h-3 w-32"></div>
            </div>
            <div className="skeleton h-9 w-24 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DiscoverSkeleton;