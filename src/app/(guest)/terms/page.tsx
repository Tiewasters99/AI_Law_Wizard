"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TermsPage() {
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
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Terms of Service
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
          {/* Introduction and Acceptance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  1. Introduction and Acceptance
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>
                    Welcome to AI Law Wizard ("we," "our," or "us"). These Terms
                    of Service ("Terms") govern your access to and use of the AI
                    Law Wizard platform, website, and services (collectively, the
                    "Service") available at{" "}
                    <span className="font-semibold">ailawwizard.com</span>.
                  </p>
                  <p>
                    By accessing or using our Service, you agree to be bound by
                    these Terms. If you do not agree to these Terms, you may not
                    access or use the Service. These Terms constitute a legally
                    binding agreement between you and AI Law Wizard.
                  </p>
                  <p>
                    We reserve the right to modify these Terms at any time. We
                    will notify users of any material changes by posting the new
                    Terms on this page and updating the "Last updated" date. Your
                    continued use of the Service after such modifications
                    constitutes acceptance of the updated Terms.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Service Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  2. Service Description
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>
                    AI Law Wizard is an AI-powered legal consultation platform
                    that provides:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Legal research and consultation services powered by
                      artificial intelligence
                    </li>
                    <li>
                      Document analysis and processing tools for legal documents
                    </li>
                    <li>
                      Attorney directory and client matching services
                    </li>
                    <li>
                      Legal blog and educational content
                    </li>
                    <li>
                      Community features and legal miniverse platform
                    </li>
                    <li>
                      Token-based access to premium AI features
                    </li>
                  </ul>
                  <p>
                    Our Service is designed to assist legal professionals and
                    clients with legal research, document analysis, and general
                    legal information. However, our Service does not constitute
                    legal advice, and we do not establish an attorney-client
                    relationship through the use of our platform.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Accounts and Registration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  3. User Accounts and Registration
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>
                    To access certain features of the Service, you must create an
                    account. You agree to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Provide accurate, current, and complete information during
                      registration
                    </li>
                    <li>
                      Maintain and promptly update your account information
                    </li>
                    <li>
                      Maintain the security of your password and account
                      credentials
                    </li>
                    <li>
                      Accept responsibility for all activities that occur under
                      your account
                    </li>
                    <li>
                      Notify us immediately of any unauthorized use of your
                      account
                    </li>
                  </ul>
                  <p>
                    You must be at least 18 years old to create an account. By
                    creating an account, you represent and warrant that you meet
                    this age requirement and have the legal capacity to enter
                    into these Terms.
                  </p>
                  <p>
                    We reserve the right to suspend or terminate your account at
                    any time if you violate these Terms or engage in any
                    fraudulent, abusive, or illegal activity.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Acceptable Use Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  4. Acceptable Use Policy
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>You agree not to use the Service to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Violate any applicable laws, regulations, or legal
                      obligations
                    </li>
                    <li>
                      Infringe upon the intellectual property rights of others
                    </li>
                    <li>
                      Transmit any harmful, offensive, or illegal content
                    </li>
                    <li>
                      Attempt to gain unauthorized access to the Service or
                      related systems
                    </li>
                    <li>
                      Interfere with or disrupt the Service or servers
                    </li>
                    <li>
                      Use automated systems (bots, scrapers) to access the
                      Service without permission
                    </li>
                    <li>
                      Impersonate any person or entity or misrepresent your
                      affiliation
                    </li>
                    <li>
                      Collect or harvest information about other users without
                      consent
                    </li>
                    <li>
                      Use the Service for any commercial purpose not expressly
                      permitted
                    </li>
                  </ul>
                  <p>
                    Violation of this Acceptable Use Policy may result in
                    immediate termination of your account and legal action.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Intellectual Property Rights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  5. Intellectual Property Rights
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>
                    The Service, including all content, features, functionality,
                    software, and materials, is owned by AI Law Wizard and
                    protected by copyright, trademark, and other intellectual
                    property laws.
                  </p>
                  <p>
                    You are granted a limited, non-exclusive, non-transferable,
                    revocable license to access and use the Service for your
                    personal or professional use, subject to these Terms.
                  </p>
                  <p>
                    You may not:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Copy, modify, or create derivative works of the Service
                    </li>
                    <li>
                      Reverse engineer, decompile, or disassemble any part of the
                      Service
                    </li>
                    <li>
                      Remove any copyright, trademark, or proprietary notices
                    </li>
                    <li>
                      Use our trademarks, logos, or branding without written
                      permission
                    </li>
                  </ul>
                  <p>
                    Any content you submit to the Service remains your property,
                    but you grant us a worldwide, royalty-free, perpetual
                    license to use, modify, and display such content in
                    connection with the Service.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Terms and Token System */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  6. Payment Terms and Token System
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>
                    Certain features of the Service require the purchase of
                    tokens or subscription plans. By purchasing tokens or a
                    subscription, you agree to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Pay all fees and charges associated with your purchase
                    </li>
                    <li>
                      Provide accurate payment information
                    </li>
                    <li>
                      Authorize us to charge your payment method for all fees
                    </li>
                  </ul>
                  <p>
                    <strong>Token System:</strong> Tokens are consumed when you
                    use premium AI features. Token costs vary by feature and are
                    displayed before use. Tokens do not expire, but are
                    non-refundable once purchased, except as required by law.
                  </p>
                  <p>
                    <strong>Pricing:</strong> We reserve the right to modify
                    pricing at any time. Price changes will not affect tokens or
                    subscriptions already purchased.
                  </p>
                  <p>
                    <strong>Refunds:</strong> All sales are final unless
                    otherwise stated or required by applicable law. Refund
                    requests will be evaluated on a case-by-case basis.
                  </p>
                  <p>
                    <strong>Payment Processing:</strong> Payments are processed
                    through secure third-party payment processors. We do not
                    store your complete payment information.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Content and Submissions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  7. User Content and Submissions
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>
                    You retain ownership of any content you submit, post, or
                    upload to the Service ("User Content"). However, by
                    submitting User Content, you grant us:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      A worldwide, royalty-free, perpetual, irrevocable license
                      to use, reproduce, modify, and distribute your User Content
                    </li>
                    <li>
                      The right to use your User Content for the purpose of
                      providing and improving the Service
                    </li>
                  </ul>
                  <p>
                    You represent and warrant that:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      You own or have the right to submit the User Content
                    </li>
                    <li>
                      Your User Content does not violate any third-party rights
                    </li>
                    <li>
                      Your User Content complies with these Terms and applicable
                      laws
                    </li>
                  </ul>
                  <p>
                    We reserve the right to remove any User Content that violates
                    these Terms or is otherwise objectionable, at our sole
                    discretion.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Disclaimers and Limitations of Liability */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  8. Disclaimers and Limitations of Liability
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>
                    <strong>No Legal Advice:</strong> The Service provides
                    general legal information and AI-powered assistance but does
                    not constitute legal advice. The Service is not a substitute
                    for professional legal counsel. You should consult with a
                    qualified attorney for specific legal matters.
                  </p>
                  <p>
                    <strong>No Attorney-Client Relationship:</strong> Use of the
                    Service does not create an attorney-client relationship
                    between you and AI Law Wizard or any attorneys featured on
                    the platform.
                  </p>
                  <p>
                    <strong>Service "As Is":</strong> The Service is provided
                    "as is" and "as available" without warranties of any kind,
                    either express or implied, including but not limited to
                    warranties of merchantability, fitness for a particular
                    purpose, or non-infringement.
                  </p>
                  <p>
                    <strong>Limitation of Liability:</strong> To the maximum
                    extent permitted by law, AI Law Wizard shall not be liable
                    for any indirect, incidental, special, consequential, or
                    punitive damages, or any loss of profits or revenues, whether
                    incurred directly or indirectly, or any loss of data, use,
                    goodwill, or other intangible losses resulting from your use
                    of the Service.
                  </p>
                  <p>
                    Our total liability to you for all claims arising from or
                    related to the Service shall not exceed the amount you paid us
                    in the twelve (12) months preceding the claim.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Indemnification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.9 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  9. Indemnification
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>
                    You agree to indemnify, defend, and hold harmless AI Law
                    Wizard, its officers, directors, employees, agents, and
                    affiliates from and against any claims, liabilities, damages,
                    losses, costs, and expenses (including reasonable attorneys'
                    fees) arising out of or relating to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Your use or misuse of the Service
                    </li>
                    <li>
                      Your violation of these Terms
                    </li>
                    <li>
                      Your violation of any third-party rights
                    </li>
                    <li>
                      Any User Content you submit
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Termination */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.0 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  10. Termination
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>
                    You may terminate your account at any time by contacting us or
                    using the account deletion features in your account settings.
                  </p>
                  <p>
                    We may suspend or terminate your access to the Service
                    immediately, without prior notice, if you:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Violate these Terms or our Acceptable Use Policy
                    </li>
                    <li>
                      Engage in fraudulent, abusive, or illegal activity
                    </li>
                    <li>
                      Fail to pay required fees
                    </li>
                    <li>
                      Use the Service in a manner that could harm us or other
                      users
                    </li>
                  </ul>
                  <p>
                    Upon termination, your right to use the Service will cease
                    immediately. We may delete your account and User Content at
                    any time after termination. Provisions of these Terms that
                    by their nature should survive termination will survive.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Governing Law and Dispute Resolution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  11. Governing Law and Dispute Resolution
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>
                    These Terms shall be governed by and construed in accordance
                    with the laws of the United States, without regard to its
                    conflict of law provisions.
                  </p>
                  <p>
                    <strong>Dispute Resolution:</strong> Any disputes arising out
                    of or relating to these Terms or the Service shall be
                    resolved through binding arbitration in accordance with the
                    rules of the American Arbitration Association, except where
                    prohibited by law.
                  </p>
                  <p>
                    You agree to waive any right to a jury trial and to
                    participate in class action lawsuits. If arbitration is not
                    permitted by law, any legal action shall be brought in the
                    federal or state courts located in the United States.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Changes to Terms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.2 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  12. Changes to Terms
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>
                    We reserve the right to modify these Terms at any time. We
                    will notify you of material changes by:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Posting the updated Terms on this page
                    </li>
                    <li>
                      Updating the "Last updated" date
                    </li>
                    <li>
                      Sending an email notification to registered users (for
                      significant changes)
                    </li>
                  </ul>
                  <p>
                    Your continued use of the Service after such modifications
                    constitutes acceptance of the updated Terms. If you do not
                    agree to the modified Terms, you must stop using the Service
                    and may terminate your account.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.3 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  13. Contact Information
                </h2>
                <div className="space-y-4 text-base text-foreground">
                  <p>
                    If you have any questions about these Terms, please contact
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
                        href="mailto:legal@ailawwizard.com"
                        className="text-primary hover:underline"
                      >
                        legal@ailawwizard.com
                      </a>
                    </p>
                  </div>
                  <p>
                    We will respond to your inquiries within a reasonable time
                    frame.
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

