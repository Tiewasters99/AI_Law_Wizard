import React from "react";
import { UserData } from "../hooks/useContentModal";

interface ContentModalProps {
  selectedContent: UserData | null;
  onClose: () => void;
}

export const ContentModal: React.FC<ContentModalProps> = ({
  selectedContent,
  onClose,
}) => {
  if (!selectedContent) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-11/12 max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 bg-red-800 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold hover:bg-red-900"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-5">
          {selectedContent.label}
        </h2>

        {selectedContent.type === "video" && (
          <div>
            <h3 className="text-lg font-bold text-red-800 mb-3">
              Featured Firm Videos
            </h3>
            <a
              href="https://www.youtube.com/watch?v=FUnCvHnitPQ"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-red-800 text-white py-4 px-6 rounded-xl mb-3 font-bold text-center hover:bg-red-900"
            >
              Watch Our Featured Video
            </a>
            <p className="text-center text-gray-600 text-sm mb-4">
              Click to open video in new tab
            </p>
          </div>
        )}

        {selectedContent.type === "art" && (
          <div>
            <p className="text-gray-700 mb-4">
              Display your firm artwork gallery
            </p>
            <a
              href="https://i.imgur.com/Gc59Q6K.png"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-800 text-white py-4 px-6 rounded-xl mb-3 font-bold text-center hover:bg-green-900"
            >
              Artwork #1
            </a>
            <a
              href="https://i.imgur.com/6YKVvhG.png"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-800 text-white py-4 px-6 rounded-xl mb-3 font-bold text-center hover:bg-green-900"
            >
              Artwork #2
            </a>
          </div>
        )}

        {/* Book content types */}
        {selectedContent.type === "book" &&
          selectedContent.label === "Agentic Theory" && (
            <div>
              <a
                href="https://drive.google.com/file/d/1ebvUaV9y3LvxpmgItgSTkMmHa4Ls_ZIZ/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Read: Agentic Theory
              </a>
            </div>
          )}

        {selectedContent.type === "book" &&
          selectedContent.label === "Agentic AI and Law" && (
            <div>
              <h3 className="text-lg font-bold text-yellow-800 mb-3">
                Agentic AI and the Practice of Law
              </h3>
              <a
                href="https://docs.google.com/document/d/1kby4LMs0PVUCy8IA0qWD5LWh54jr5Vxb1hftmfPw4Uk/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl mb-4 font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Read Full Paper
              </a>
              <p className="text-gray-600 italic">
                Trust, Imagination, and the New Calculus of Liability
              </p>
            </div>
          )}

        {selectedContent.type === "book" &&
          selectedContent.label === "Law's Empire" && (
            <div>
              <a
                href="https://drive.google.com/file/d/18_1XREv0fHn_3exOWgMntjd-jWnE_SED/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Read: Law&apos;s Empire
              </a>
            </div>
          )}

        {selectedContent.type === "book" &&
          selectedContent.label === "Russia Company" && (
            <div>
              <a
                href="https://drive.google.com/file/d/1RcVU6tKOYtABxR4hlMUdXmRPjI8ZxHeP/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Read: The Origin and Early History of the Russia or Muscovy
                Company
              </a>
            </div>
          )}

        {selectedContent.type === "book" &&
          selectedContent.label === "Superintelligence" && (
            <div>
              <a
                href="https://drive.google.com/file/d/1YikBAleixDVc2fCMhPTCAhFEkNZYV04i/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Read: Superintelligence
              </a>
            </div>
          )}

        {selectedContent.type === "book" &&
          selectedContent.label === "Alignment Problem" && (
            <div>
              <a
                href="https://drive.google.com/file/d/1wNTyTDzbx_dsP7mlOo_7-6BLVjMJDVHU/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Read: The Alignment Problem
              </a>
            </div>
          )}

        {selectedContent.type === "book" &&
          selectedContent.label === "Liberation Theologies" && (
            <div>
              <a
                href="https://drive.google.com/file/d/1GjVSJ0q-7Y7IcEPxaUk8G88nXHX9I8k2/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Read: Decolonizing Liberation Theologies
              </a>
            </div>
          )}

        {selectedContent.type === "book" &&
          selectedContent.label === "You Might be a Robot" && (
            <div>
              <a
                href="https://drive.google.com/file/d/1bjgLlKHPQCEGNykgBPN2CuORnalP4929/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Read: You Might be a Robot
              </a>
            </div>
          )}

        {selectedContent.type === "book" &&
          selectedContent.label === "Black Box Society" && (
            <div>
              <a
                href="https://drive.google.com/file/d/1ZgrAtpCpWWStD8mtx5bayV93w232Uard/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Read: The Black Box Society
              </a>
            </div>
          )}

        {selectedContent.type === "book" &&
          selectedContent.label === "AI Legal Personhood" && (
            <div>
              <a
                href="https://drive.google.com/file/d/1Cw9hBnjo9QR-blGMizc1CQp-MwG7Rjsp/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Read: The Ethics and Challenges of Legal Personhood for AI
              </a>
            </div>
          )}

        {selectedContent.type === "book" &&
          selectedContent.label === "Unknowable Unknown" && (
            <div>
              <h3 className="text-lg font-bold text-yellow-800 mb-3">
                The Unknowable Unknown
              </h3>
              <a
                href="https://docs.google.com/document/d/1pB10z2YfGgHVYPf5kl9Pj62NMVvlPoGs/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl mb-4 font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Read Full Paper
              </a>
              <p className="text-gray-600 italic">
                The Case for AI Arms Control
              </p>
            </div>
          )}

        {selectedContent.type === "book" &&
          selectedContent.label === "Logical Calculus" && (
            <div>
              <h3 className="text-lg font-bold text-yellow-800 mb-3">
                Featured Paper
              </h3>
              <a
                href="https://drive.google.com/file/d/1iBAI7spq1vJiP7PNzal3d4yY-VaHOWHQ/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl mb-4 font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                A Logical Calculus of Ideas Immanent in Nervous Activity
              </a>
              <p className="text-gray-600">McCulloch & Pitts (1943)</p>
            </div>
          )}

        {selectedContent.type === "book" &&
          selectedContent.label === "Augmenting LLMs" && (
            <div>
              <h3 className="text-lg font-bold text-yellow-800 mb-3">
                Featured Research Paper
              </h3>
              <a
                href="https://arxiv.org/pdf/2306.07174"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-yellow-800 to-yellow-700 text-white py-6 px-6 rounded-xl mb-4 font-bold text-center text-lg hover:from-yellow-900 hover:to-yellow-800"
              >
                Augmenting Language Models with Long-Term Memory
              </a>
              <p className="text-gray-600">
                &ldquo;LONGMEM: Enabling LLMs to memorize long history&rdquo;
              </p>
            </div>
          )}

        {selectedContent.type === "ideaVault" && (
          <div>
            <div className="p-12 bg-gradient-to-br from-yellow-400 to-yellow-300 rounded-2xl text-center mb-6">
              <div className="text-7xl mb-4">💡</div>
              <h3 className="text-3xl font-bold text-gray-800 mb-3">
                Coming Soon
              </h3>
              <p className="text-gray-700 text-lg">
                The Idea Vault will let you capture and save thoughts as you
                explore the Miniverse
              </p>
            </div>
          </div>
        )}

        {selectedContent.type === "profile" && (
          <div>
            <div className="p-8 bg-gray-100 rounded-xl text-center">
              <p className="text-gray-700 text-lg">
                Videos, articles, testimonials from team members, partners,
                clients and more.
              </p>
            </div>
          </div>
        )}

        {selectedContent.type === "ourwall" && (
          <div>
            <h3 className="text-xl font-bold text-blue-800 mb-4">
              Our Wall - Firm Updates & Information
            </h3>
            <a
              href="#testimonials"
              className="block w-full bg-purple-700 text-white py-4 px-6 rounded-xl mb-3 font-bold text-center hover:bg-purple-800"
            >
              Client Testimonials
            </a>
            <a
              href="#cases"
              className="block w-full bg-red-800 text-white py-4 px-6 rounded-xl mb-3 font-bold text-center hover:bg-red-900"
            >
              Featured Cases
            </a>
          </div>
        )}

        {selectedContent.type === "legal" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Supreme Court Resources
              </h3>
              <a
                href="https://www.oyez.org"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-blue-900 text-white py-3 px-4 rounded-lg mb-2 text-center hover:bg-blue-950"
              >
                Oyez Project - SCOTUS Arguments (1955-Present)
              </a>
              <a
                href="https://www.supremecourt.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-blue-900 text-white py-3 px-4 rounded-lg mb-2 text-center hover:bg-blue-950"
              >
                Supreme Court Official Audio & Transcripts
              </a>
              <a
                href="https://podcasts.apple.com/us/podcast/the-supreme-court-oral-arguments/id1649139910"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-blue-900 text-white py-3 px-4 rounded-lg mb-2 text-center hover:bg-blue-950"
              >
                SCOTUS Oral Arguments Podcast
              </a>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Federal Circuit Courts
              </h3>
              <a
                href="https://www.courtlistener.com/audio/"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-700 text-white py-3 px-4 rounded-lg mb-2 text-center hover:bg-gray-800"
              >
                CourtListener - All Federal Circuit Courts
              </a>
              <a
                href="https://www.ca9.uscourts.gov/media/"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-700 text-white py-3 px-4 rounded-lg mb-2 text-center hover:bg-gray-800"
              >
                9th Circuit Oral Arguments
              </a>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Law School Podcasts
              </h3>
              <a
                href="https://law.stanford.edu/stanford-legal-podcast/"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-red-800 text-white py-3 px-4 rounded-lg mb-2 text-center hover:bg-red-900"
              >
                Stanford Legal Podcast
              </a>
              <a
                href="https://hls.harvard.edu/communications-office/podcast-conversations-from-harvard-law-school/"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-red-800 text-white py-3 px-4 rounded-lg mb-2 text-center hover:bg-red-900"
              >
                Conversations from Harvard Law School
              </a>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Live Trials & Courtrooms
              </h3>
              <a
                href="https://www.courttv.com/title/court-tv-live-stream-web/"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-green-800 text-white py-3 px-4 rounded-lg mb-2 text-center hover:bg-green-900"
              >
                Court TV - Live Trial Coverage
              </a>
              <a
                href="https://cvn.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-green-800 text-white py-3 px-4 rounded-lg mb-2 text-center hover:bg-green-900"
              >
                Courtroom View Network (CVN)
              </a>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Legal Skills Training
              </h3>
              <a
                href="https://www.nita.org"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-yellow-800 text-white py-3 px-4 rounded-lg mb-2 text-center hover:bg-yellow-900"
              >
                NITA - National Institute for Trial Advocacy
              </a>
              <a
                href="https://www.nacdl.org"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-yellow-800 text-white py-3 px-4 rounded-lg mb-2 text-center hover:bg-yellow-900"
              >
                NACDL - Criminal Defense Trial Skills
              </a>
            </div>
          </div>
        )}

        {(selectedContent.type === "rightArt" ||
          selectedContent.type === "certificate" ||
          selectedContent.type === "tableItem" ||
          selectedContent.type === "deskItem" ||
          selectedContent.type === "personalImages") && (
          <div>
            <div className="p-6 bg-gray-100 rounded-xl">
              <p className="text-gray-700">
                Add your content via URL embeds (Vimeo, SoundCloud, Imgur,
                Google Drive, PDFs, etc.)
              </p>
            </div>
          </div>
        )}

        {selectedContent.type === "book" &&
          ![
            "Agentic Theory",
            "Agentic AI and Law",
            "Law's Empire",
            "Russia Company",
            "Superintelligence",
            "Alignment Problem",
            "Liberation Theologies",
            "You Might be a Robot",
            "Black Box Society",
            "AI Legal Personhood",
            "Unknowable Unknown",
            "Logical Calculus",
            "Augmenting LLMs",
          ].includes(selectedContent.label) && (
            <div>
              <div className="p-6 bg-gray-100 rounded-xl">
                <p className="text-gray-700">
                  Legal resources and documents available via Google Drive or
                  your website hosting
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
