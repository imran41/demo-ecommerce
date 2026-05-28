import React from 'react';

// Product Grid Card Skeleton loader
export const ProductCardSkeleton = () => {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4.5 space-y-4 animate-pulse">
      {/* Image */}
      <div className="aspect-square w-full rounded-xl bg-slate-200"></div>

      {/* Info lines */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-3 w-1/4 rounded bg-slate-200"></div>
          <div className="h-3 w-1/6 rounded bg-slate-200"></div>
        </div>
        <div className="h-4.5 w-3/4 rounded bg-slate-200"></div>
        <div className="h-5 w-1/3 rounded bg-slate-200"></div>
      </div>

      {/* Button */}
      <div className="h-9 w-full rounded-xl bg-slate-200"></div>
    </div>
  );
};

// Details page loading screen
export const ProductDetailsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 animate-pulse">
      {/* Left Gallery */}
      <div className="space-y-4">
        <div className="aspect-square w-full rounded-3xl bg-slate-200"></div>
        <div className="flex gap-3 justify-center">
          <div className="h-14 w-14 rounded-xl bg-slate-200"></div>
          <div className="h-14 w-14 rounded-xl bg-slate-200"></div>
          <div className="h-14 w-14 rounded-xl bg-slate-200"></div>
        </div>
      </div>

      {/* Right details panel */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-3 w-1/6 rounded bg-slate-200"></div>
          <div className="h-8 w-3/4 rounded bg-slate-200"></div>
          <div className="h-4 w-1/3 rounded bg-slate-200"></div>
        </div>

        <div className="h-20 w-full rounded bg-slate-200"></div>

        <div className="h-16 w-full rounded-2xl bg-slate-200"></div>

        <div className="space-y-4 pt-4">
          <div className="h-10 w-1/2 rounded bg-slate-200"></div>
          <div className="h-12 w-full rounded-xl bg-slate-200"></div>
        </div>
      </div>
    </div>
  );
};
