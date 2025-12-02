"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Privacy Policy
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  1. Introduction
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>
                    AI Law Wizard ("we," "our," or "us") is committed to
                    protecting your privacy. This Privacy Policy explains how we
                    collect, use, disclose, and safeguard your information when
                    you use our website and services (collectively, the
                    "Service") available at{" "}
                    <span className="font-semibold">ailawwizard.com</span>.
                  </p>
                  <p>
                    Please read this Privacy Policy carefully. By using our
                    Service, you agree to the collection and use of information
                    in accordance with this policy. If you do not agree with our
                    policies and practices, please do not use our Service.
                  </p>
                  <p>
                    We may update this Privacy Policy from time to time. We will
                    notify you of any changes by posting the new Privacy Policy
                    on this page and updating the "Last updated" date. You are
                    advised to review this Privacy Policy periodically for any
                    changes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Information We Collect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  2. Information We Collect
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>
                    We collect several types of information from and about users
                    of our Service:
                  </p>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      2.1 Personal Information
                    </h3>
                    <p>
                      When you register for an account or use our Service, we
                      may collect:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                      <li>Name and contact information (email address, phone number)</li>
                      <li>Account credentials (username, password)</li>
                      <li>Profile information (role, professional details, bio)</li>
                      <li>Payment information (processed through secure third-party processors)</li>
                      <li>Billing address and transaction history</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      2.2 Usage Information
                    </h3>
                    <p>
                      We automatically collect information about how you use our
                      Service, including:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                      <li>Pages visited and features used</li>
                      <li>Time and date of access</li>
                      <li>Device information (type, operating system, browser)</li>
                      <li>IP address and location data</li>
                      <li>Token usage and feature consumption</li>
                      <li>Search queries and interactions with AI features</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      2.3 Cookies and Tracking Technologies
                    </h3>
                    <p>
                      We use cookies, web beacons, and similar tracking
                      technologies to collect information about your browsing
                      activities. See Section 7 for more details.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      2.4 User Content
                    </h3>
                    <p>
                      We collect content you submit to the Service, including:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                      <li>Legal documents and files you upload</li>
                      <li>Chat messages and consultation requests</li>
                      <li>Blog posts and community contributions</li>
                      <li>Profile information and attorney directory listings</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* How We Use Your Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  3. How We Use Your Information
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Provide, maintain, and improve our Service
                    </li>
                    <li>
                      Process transactions and manage your account
                    </li>
                    <li>
                      Deliver AI-powered legal research and document analysis
                    </li>
                    <li>
                      Facilitate attorney-client matching and directory services
                    </li>
                    <li>
                      Send you service-related communications and updates
                    </li>
                    <li>
                      Respond to your inquiries and provide customer support
                    </li>
                    <li>
                      Monitor and analyze usage patterns to improve our Service
                    </li>
                    <li>
                      Detect, prevent, and address technical issues and security
                      threats
                    </li>
                    <li>
                      Enforce our Terms of Service and protect our rights
                    </li>
                    <li>
                      Comply with legal obligations and respond to legal requests
                    </li>
                    <li>
                      Send marketing communications (with your consent, where
                      required)
                    </li>
                  </ul>
                  <p>
                    We do not sell your personal information to third parties.
                    We may use aggregated, anonymized data for analytics and
                    research purposes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Information Sharing and Disclosure */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  4. Information Sharing and Disclosure
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>
                    We may share your information in the following
                    circumstances:
                  </p>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      4.1 Service Providers
                    </h3>
                    <p>
                      We may share information with third-party service
                      providers who perform services on our behalf, such as:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                      <li>Payment processing (Stripe and similar services)</li>
                      <li>Cloud hosting and data storage</li>
                      <li>AI and machine learning services</li>
                      <li>Email delivery and communication services</li>
                      <li>Analytics and performance monitoring</li>
                    </ul>
                    <p className="mt-2">
                      These service providers are contractually obligated to
                      protect your information and use it only for the purposes
                      we specify.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      4.2 Attorney Directory and Matching
                    </h3>
                    <p>
                      If you are an attorney, your profile information may be
                      displayed in our attorney directory to help clients find
                      legal professionals. If you are a client, your consultation
                      requests may be shared with attorneys to facilitate
                      matching.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      4.3 Legal Requirements
                    </h3>
                    <p>
                      We may disclose your information if required by law, court
                      order, or government regulation, or if we believe such
                      disclosure is necessary to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                      <li>Comply with legal obligations</li>
                      <li>Protect our rights, property, or safety</li>
                      <li>Protect the rights, property, or safety of our users</li>
                      <li>Prevent fraud or security threats</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      4.4 Business Transfers
                    </h3>
                    <p>
                      In the event of a merger, acquisition, or sale of assets,
                      your information may be transferred to the acquiring entity
                      as part of the transaction.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      4.5 With Your Consent
                    </h3>
                    <p>
                      We may share your information with third parties when you
                      explicitly consent to such sharing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Data Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  5. Data Security
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>
                    We implement appropriate technical and organizational
                    security measures to protect your information against
                    unauthorized access, alteration, disclosure, or destruction.
                    These measures include:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Encryption of data in transit and at rest
                    </li>
                    <li>
                      Secure authentication and access controls
                    </li>
                    <li>
                      Regular security assessments and updates
                    </li>
                    <li>
                      Employee training on data protection
                    </li>
                    <li>
                      Secure payment processing through certified providers
                    </li>
                  </ul>
                  <p>
                    However, no method of transmission over the Internet or
                    electronic storage is 100% secure. While we strive to use
                    commercially acceptable means to protect your information, we
                    cannot guarantee absolute security.
                  </p>
                  <p>
                    You are responsible for maintaining the confidentiality of
                    your account credentials. Please notify us immediately if you
                    suspect any unauthorized access to your account.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Your Rights and Choices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  6. Your Rights and Choices
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>
                    Depending on your location, you may have certain rights
                    regarding your personal information:
                  </p>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      6.1 Access and Portability
                    </h3>
                    <p>
                      You have the right to access, update, and correct your
                      personal information through your account settings. You may
                      also request a copy of your data in a portable format.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      6.2 Deletion
                    </h3>
                    <p>
                      You may request deletion of your account and personal
                      information. We will honor such requests subject to our
                      legal obligations to retain certain information (e.g., for
                      tax, legal, or security purposes).
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      6.3 Opt-Out Rights
                    </h3>
                    <p>
                      You may opt out of:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                      <li>Marketing communications (via unsubscribe links or account settings)</li>
                      <li>Certain cookies and tracking technologies (see Section 7)</li>
                      <li>Location tracking (via device settings)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      6.4 California Privacy Rights
                    </h3>
                    <p>
                      If you are a California resident, you have additional
                      rights under the California Consumer Privacy Act (CCPA),
                      including the right to know what personal information we
                      collect and the right to opt out of the sale of personal
                      information (we do not sell personal information).
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      6.5 European Privacy Rights
                    </h3>
                    <p>
                      If you are located in the European Economic Area (EEA),
                      you have rights under the General Data Protection
                      Regulation (GDPR), including the right to object to
                      processing, restrict processing, and data portability.
                    </p>
                  </div>

                  <p>
                    To exercise your rights, please contact us using the
                    information provided in Section 12.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cookies and Tracking Technologies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  7. Cookies and Tracking Technologies
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>
                    We use cookies and similar tracking technologies to enhance
                    your experience on our Service. Cookies are small text files
                    stored on your device that help us:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Remember your preferences and settings
                    </li>
                    <li>
                      Authenticate your identity
                    </li>
                    <li>
                      Analyze how you use our Service
                    </li>
                    <li>
                      Provide personalized content and features
                    </li>
                  </ul>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Types of Cookies We Use
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        <strong>Essential Cookies:</strong> Required for the
                        Service to function properly (e.g., authentication,
                        security)
                      </li>
                      <li>
                        <strong>Functional Cookies:</strong> Remember your
                        preferences and enhance functionality
                      </li>
                      <li>
                        <strong>Analytics Cookies:</strong> Help us understand
                        how users interact with our Service
                      </li>
                      <li>
                        <strong>Advertising Cookies:</strong> Used to deliver
                        relevant advertisements (if applicable)
                      </li>
                    </ul>
                  </div>

                  <p>
                    You can control cookies through your browser settings.
                    However, disabling certain cookies may limit your ability to
                    use some features of our Service.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Third-Party Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  8. Third-Party Services
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>
                    Our Service may contain links to third-party websites or
                    integrate with third-party services. We are not responsible
                    for the privacy practices of these third parties. We
                    encourage you to review their privacy policies before
                    providing any information.
                  </p>
                  <p>
                    Third-party services we use include:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Payment processors (Stripe, etc.)
                    </li>
                    <li>
                      Cloud hosting providers
                    </li>
                    <li>
                      AI and machine learning platforms
                    </li>
                    <li>
                      Analytics services
                    </li>
                    <li>
                      Email delivery services
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Children's Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.9 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  9. Children's Privacy
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>
                    Our Service is not intended for children under the age of 18.
                    We do not knowingly collect personal information from
                    children under 18. If you are a parent or guardian and
                    believe your child has provided us with personal information,
                    please contact us immediately.
                  </p>
                  <p>
                    If we become aware that we have collected personal
                    information from a child under 18 without parental consent,
                    we will take steps to delete such information from our
                    systems.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* International Data Transfers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.0 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  10. International Data Transfers
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>
                    Your information may be transferred to and processed in
                    countries other than your country of residence. These
                    countries may have data protection laws that differ from
                    those in your country.
                  </p>
                  <p>
                    By using our Service, you consent to the transfer of your
                    information to countries outside your country of residence,
                    including the United States, where our servers and service
                    providers may be located.
                  </p>
                  <p>
                    We take appropriate measures to ensure that your information
                    receives an adequate level of protection in the countries
                    where we process it, including through contractual
                    safeguards and compliance with applicable data protection
                    laws.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Changes to Privacy Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  11. Changes to Privacy Policy
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>
                    We may update this Privacy Policy from time to time to
                    reflect changes in our practices, technology, legal
                    requirements, or other factors. We will notify you of
                    material changes by:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Posting the updated Privacy Policy on this page
                    </li>
                    <li>
                      Updating the "Last updated" date
                    </li>
                    <li>
                      Sending an email notification to registered users (for
                      significant changes)
                    </li>
                    <li>
                      Displaying a notice on our Service (for major changes)
                    </li>
                  </ul>
                  <p>
                    Your continued use of the Service after such changes
                    constitutes acceptance of the updated Privacy Policy. We
                    encourage you to review this Privacy Policy periodically.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.2 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  12. Contact Information
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>
                    If you have any questions, concerns, or requests regarding
                    this Privacy Policy or our data practices, please contact
                    us:
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-semibold mb-2">AI Law Wizard</p>
                    <p>
                      Website:{" "}
                      <a
                        href="https://ailawwizard.com"
                        className="text-primary hover:underline"
                      >
                        ailawwizard.com
                      </a>
                    </p>
                    <p>
                      Email:{" "}
                      <a
                        href="mailto:privacy@ailawwizard.com"
                        className="text-primary hover:underline"
                      >
                        privacy@ailawwizard.com
                      </a>
                    </p>
                    <p>
                      Data Protection Officer:{" "}
                      <a
                        href="mailto:dpo@ailawwizard.com"
                        className="text-primary hover:underline"
                      >
                        dpo@ailawwizard.com
                      </a>
                    </p>
                  </div>
                  <p>
                    We will respond to your inquiries within a reasonable time
                    frame, typically within 30 days.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

