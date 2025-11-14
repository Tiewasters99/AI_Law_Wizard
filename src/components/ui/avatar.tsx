"use client";

import * as React from "react";
import Image from "next/image";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${
          className || ""
        }`}
        {...props}
      />
    );
  }
);

Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  HTMLDivElement,
  React.ImgHTMLAttributes<HTMLImageElement> & { src?: string; alt?: string }
>(({ className, src, alt = "", ...props }, ref) => {
  if (!src) return null;

  return (
    <div ref={ref} className={`relative w-full h-full ${className || ""}`}>
      <Image src={src} alt={alt} fill className="object-cover rounded-full" />
    </div>
  );
});

AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground font-medium ${
        className || ""
      }`}
      {...props}
    >
      {children}
    </div>
  );
});

AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
