"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Box,
  Users,
  MessageCircle,
  Globe,
  Zap,
  Shield,
  ArrowRight,
  LogIn,
  UserPlus,
  Star,
  Clock,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

export default function MiniverseComingSoonPage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleLogin = () => {
    router.push("/auth/login");
  };

  const handleRegister = () => {
    router.push("/auth/register");
  };

  const features = [
    {
      icon: <Box className="w-8 h-8" />,
      title: "3D Virtual Spaces",
      description:
        "Immersive 3D environments where attorneys and clients can meet, collaborate, and discuss cases in virtual reality.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Real-time Collaboration",
      description:
        "Interactive avatars and real-time communication tools for seamless attorney-client interactions.",
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Secure Communication",
      description:
        "End-to-end encrypted messaging and video calls within the virtual environment for confidential discussions.",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Accessibility",
      description:
        "Connect with legal professionals and clients from anywhere in the world through our virtual platform.",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "AI-Powered Assistance",
      description:
        "Integrated AI tools that provide real-time legal research, document analysis, and case insights during meetings.",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Privacy & Security",
      description:
        "Bank-level security with advanced encryption to protect all virtual interactions and sensitive legal data.",
    },
  ];

  const benefits = [
    "Reduce travel costs and time for consultations",
    "Enhanced client engagement through immersive experiences",
    "Secure document sharing and collaboration",
    "24/7 virtual office availability",
    "Multi-language support for global clients",
    "Integration with existing legal workflows",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <Badge
                variant="secondary"
                className="mb-4 px-4 py-2 text-sm font-medium bg-accent text-primary border-primary/20"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Coming Soon
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-primary">
                Miniverse™
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                The Future of Legal Practice is Here
              </p>
              <p className="text-lg text-muted-foreground mb-12 max-w-4xl mx-auto">
                Experience the next generation of legal services through
                immersive 3D virtual spaces where attorneys and clients can
                collaborate, communicate, and build stronger relationships in a
                secure, interactive environment.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Button
                size="lg"
                onClick={handleLogin}
                className="px-8 py-4 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign In to Preview
                <ArrowRight
                  className={`w-5 h-5 ml-2 transition-transform ${isHovered ? "translate-x-1" : ""}`}
                />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleRegister}
                className="px-8 py-4 text-lg font-semibold border-2 border-primary text-primary hover:bg-accent transition-all duration-300"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Get Early Access
              </Button>
            </motion.div>

            {/* Preview Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative max-w-4xl mx-auto"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-background border border-border p-8">
                <div className="aspect-video bg-accent/50 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Box className="w-24 h-24 mx-auto text-primary mb-4" />
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      3D Virtual Environment
                    </h3>
                    <p className="text-muted-foreground">
                      Interactive preview coming soon
                    </p>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-accent text-primary border-primary/20">
                    <Clock className="w-3 h-3 mr-1" />
                    In Development
                  </Badge>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Revolutionary Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the cutting-edge capabilities that will transform how
              legal professionals interact with their clients and manage their
              practice.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border bg-background/80 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="text-primary mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose Miniverse™?
            </h2>
            <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
              Join the legal revolution and experience unprecedented benefits
              for both attorneys and clients in our virtual ecosystem.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-white text-lg">{benefit}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex items-center justify-center"
            >
              <div className="relative">
                <div className="w-80 h-80 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center">
                    <Users className="w-32 h-32 text-white/80 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Virtual Collaboration
                    </h3>
                    <p className="text-primary-foreground/80">Coming Soon</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4">
                  <Badge className="bg-accent text-primary border-primary/20">
                    <Clock className="w-3 h-3 mr-1" />
                    Beta Testing
                  </Badge>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Experience the Future?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Be among the first to experience Miniverse™ and revolutionize
              your legal practice. Sign up now for early access and exclusive
              previews.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleRegister}
                className="px-12 py-4 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Join the Waitlist
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleLogin}
                className="px-12 py-4 text-lg font-semibold border-2 border-border text-foreground hover:bg-muted transition-all duration-300"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign In for Updates
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-12 bg-card text-card-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground mb-4">
            © 2025 AI Law Wizard. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Miniverse™ is a trademark of AI Law Wizard. Coming soon to
            revolutionize legal practice.
          </p>
        </div>
      </div>
    </div>
  );
}
