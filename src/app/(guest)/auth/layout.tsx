"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRegisterPage = pathname?.includes("/register");
  const isLoginPage = pathname?.includes("/login");
  const isWideLayout = isRegisterPage || isLoginPage;
  const maxWidth = isWideLayout ? "max-w-5xl" : "max-w-md";
  // Floating background shapes
  const floatingShapes = [
    {
      size: 300,
      x: [0, 100, 0],
      y: [0, -50, 0],
      duration: 20,
      color: "bg-primary/10",
      blur: "blur-3xl",
    },
    {
      size: 200,
      x: [0, -80, 0],
      y: [0, 60, 0],
      duration: 25,
      color: "bg-accent/10",
      blur: "blur-2xl",
    },
    {
      size: 250,
      x: [0, 60, 0],
      y: [0, 80, 0],
      duration: 30,
      color: "bg-primary/15",
      blur: "blur-3xl",
    },
    {
      size: 180,
      x: [0, -50, 0],
      y: [0, -40, 0],
      duration: 22,
      color: "bg-accent/10",
      blur: "blur-2xl",
    },
    {
      size: 220,
      x: [0, 70, 0],
      y: [0, 50, 0],
      duration: 28,
      color: "bg-primary/10",
      blur: "blur-3xl",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-background">
      {/* Floating Background Shapes */}
      {floatingShapes.map((shape, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full ${shape.color} ${shape.blur}`}
          style={{
            width: shape.size,
            height: shape.size,
            top: `${10 + index * 20}%`,
            left: `${5 + index * 18}%`,
          }}
          animate={{
            x: shape.x,
            y: shape.y,
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className={`w-full ${maxWidth} relative z-10`}>
        {/* Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="relative bg-card rounded-3xl p-6 shadow-lg border border-border"
        >
          <div className="relative z-10">{children}</div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          By continuing, you agree to our{" "}
          <Link
            href="/terms"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Privacy Policy
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
