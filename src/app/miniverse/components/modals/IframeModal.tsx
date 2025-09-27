"use client";

import React, { useEffect, useRef } from 'react';
import { useMiniverseStore } from '../../data/store';

const IframeModal: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isMemoModalOpen, closeMemoModal } = useMiniverseStore();

  useEffect(() => {
    if (isMemoModalOpen && iframeRef.current) {
      // Create the modal content HTML
      const modalHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Legal Network Communication</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
            .modal-container { 
              width: 100vw; 
              height: 100vh; 
              background: rgba(0, 0, 0, 0.5); 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              padding: 16px;
              box-sizing: border-box;
            }
            .modal-content { 
              background: white; 
              border-radius: 8px; 
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); 
              max-width: 600px; 
              width: 100%; 
              max-height: 90vh; 
              overflow-y: auto;
            }
          </style>
        </head>
        <body>
          <div class="modal-container">
            <div class="modal-content">
              <div class="bg-blue-600 text-white p-4 rounded-t-lg">
                <div class="flex justify-between items-center">
                  <h2 class="text-xl font-bold">Legal Network Communication</h2>
                  <button onclick="window.parent.postMessage({type: 'close'}, '*')" class="text-white hover:text-gray-200 text-2xl">&times;</button>
                </div>
              </div>
              <div class="p-6" id="modal-body">
                <!-- Content will be dynamically inserted here -->
              </div>
            </div>
          </div>
          <script>
            let userType = null;
            let selectedAttorney = '';
            let subject = '';
            let message = '';
            let rating = 5;

            const attorneys = [
              { id: 'john_smith', name: 'John Smith, Esq. - Corporate Law' },
              { id: 'sarah_johnson', name: 'Sarah Johnson, Esq. - Family Law' },
              { id: 'michael_brown', name: 'Michael Brown, Esq. - Criminal Defense' },
              { id: 'lisa_davis', name: 'Lisa Davis, Esq. - Personal Injury' },
              { id: 'robert_wilson', name: 'Robert Wilson, Esq. - Real Estate' },
              { id: 'emily_garcia', name: 'Emily Garcia, Esq. - Immigration' }
            ];

            function renderContent() {
              const body = document.getElementById('modal-body');
              
              if (!userType) {
                body.innerHTML = \`
                  <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-4">Please select your role:</h3>
                    <div class="flex gap-4">
                      <button onclick="setUserType('client')" class="flex-1 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        <div class="text-lg font-medium">Client</div>
                        <div class="text-sm text-gray-600">Leave a review for an attorney</div>
                      </button>
                      <button onclick="setUserType('attorney')" class="flex-1 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        <div class="text-lg font-medium">Attorney</div>
                        <div class="text-sm text-gray-600">Send a memo to colleague</div>
                      </button>
                    </div>
                  </div>
                \`;
              } else {
                body.innerHTML = \`
                  <div class="space-y-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                      <div class="text-sm text-gray-600 mb-2">
                        \${userType === 'client' ? 'ATTORNEY REVIEW FORM' : 'INTER-OFFICE MEMORANDUM'}
                      </div>
                      <div class="text-xs text-gray-500">Date: \${new Date().toLocaleDateString()}</div>
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        To: \${userType === 'client' ? 'Attorney to Review' : 'Recipient Attorney'}
                      </label>
                      <select onchange="setSelectedAttorney(this.value)" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                        <option value="">Select an attorney...</option>
                        \${attorneys.map(attorney => \`
                          <option value="\${attorney.id}">\${attorney.name}</option>
                        \`).join('')}
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Re: \${userType === 'client' ? 'Review Subject' : 'Subject Matter'}
                      </label>
                      <input type="text" onchange="setSubject(this.value)" placeholder="\${userType === 'client' ? 'Brief description of your experience...' : 'Legal matter or case reference...'}" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                    </div>

                    \${userType === 'client' ? \`
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Rating:</label>
                        <div class="flex items-center space-x-2">
                          \${[1, 2, 3, 4, 5].map(star => \`
                            <button onclick="setRating(\${star})" class="text-2xl \${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors">★</button>
                          \`).join('')}
                          <span class="ml-2 text-sm text-gray-600">(\${rating}/5)</span>
                        </div>
                      </div>
                    \` : ''}

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        \${userType === 'client' ? 'Review Details:' : 'Message:'}
                      </label>
                      <textarea onchange="setMessage(this.value)" placeholder="\${userType === 'client' ? 'Please describe your experience with this attorney...' : 'Enter your memo content here...'}" rows="6" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" required></textarea>
                    </div>

                    <div class="flex gap-3 pt-4">
                      <button onclick="setUserType(null)" class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">Back</button>
                      <button onclick="window.parent.postMessage({type: 'close'}, '*')" class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">Cancel</button>
                      <button onclick="handleSubmit()" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        \${userType === 'client' ? 'Submit Review' : 'Send Memo'}
                      </button>
                    </div>
                  </div>
                \`;
              }
            }

            function setUserType(type) {
              userType = type;
              renderContent();
            }

            function setSelectedAttorney(value) {
              selectedAttorney = value;
            }

            function setSubject(value) {
              subject = value;
            }

            function setMessage(value) {
              message = value;
            }

            function setRating(value) {
              rating = value;
              renderContent();
            }

            function handleSubmit() {
              if (!selectedAttorney || !subject || !message) return;
              
              const data = {
                userType,
                attorney: selectedAttorney,
                subject,
                message,
                rating: userType === 'client' ? rating : null,
                date: new Date().toISOString()
              };

              window.parent.postMessage({type: 'submit', data: data}, '*');
            }

            // Listen for messages from parent
            window.addEventListener('message', (event) => {
              if (event.data.type === 'close') {
                window.parent.postMessage({type: 'close'}, '*');
              }
            });

            renderContent();
          </script>
        </body>
        </html>
      `;

      // Set the iframe content
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(modalHTML);
        doc.close();
      }
    }
  }, [isMemoModalOpen]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'close') {
        closeMemoModal();
      } else if (event.data.type === 'submit') {
        const { userType, attorney, subject, message, rating } = event.data.data;
        if (userType === 'client') {
          console.log('Client Review Submitted:', event.data.data);
          alert('Review submitted successfully!');
        } else {
          console.log('Attorney Memo Sent:', event.data.data);
          alert('Memo sent successfully!');
        }
        closeMemoModal();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [closeMemoModal]);

  if (!isMemoModalOpen) return null;

  return (
    <iframe
      ref={iframeRef}
      className="fixed inset-0 w-full h-full border-0 z-50"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        border: 'none',
        zIndex: 9999,
        backgroundColor: 'transparent'
      }}
      title="Legal Network Communication Modal"
    />
  );
};

export default IframeModal;
