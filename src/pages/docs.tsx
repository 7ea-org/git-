import React from 'react';
import { Book, Shield, AlertTriangle } from 'lucide-react';

export default function Documentation() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-8">
            Documentation
          </h1>

          <div className="prose prose-blue max-w-none">
            <h2 className="flex items-center gap-2 text-2xl font-bold mb-4">
              <Book className="h-6 w-6" />
              Getting Started
            </h2>
            <p className="text-gray-600 mb-8">
              GitPusher is a powerful tool for managing your GitHub repositories. Follow these steps to get started:
            </p>
            <ol className="list-decimal pl-6 mb-12 space-y-4">
              <li>Create a GitHub personal access token with 'repo' scope</li>
              <li>Enter your token and email in the authentication form</li>
              <li>Select or create a repository</li>
              <li>Choose files to upload</li>
              <li>Configure commit options</li>
              <li>Push your changes</li>
            </ol>

            <h2 className="flex items-center gap-2 text-2xl font-bold mb-4">
              <Shield className="h-6 w-6" />
              Privacy Policy
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                At GitPusher, we take your privacy seriously. Here's how we handle your data:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Data Collection:</strong> We only collect essential information needed for GitHub integration.
                </li>
                <li>
                  <strong>Temporary Storage:</strong> Your data is stored temporarily and automatically deleted after processing.
                </li>
                <li>
                  <strong>No Permanent Records:</strong> We don't maintain permanent records of your tokens or personal information.
                </li>
                <li>
                  <strong>Secure Transmission:</strong> All data is transmitted using secure, encrypted connections.
                </li>
              </ul>
            </div>

            <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-1" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      We respect human rights and privacy. Our service is designed to help developers while maintaining ethical standards and protecting user data.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-12 mb-4">Data Handling</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Our server maintains logs and data temporarily for operational purposes only. This data is automatically deleted after a short period to ensure your privacy.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Server logs are retained for 24 hours maximum</li>
                <li>Authentication tokens are encrypted and never stored permanently</li>
                <li>All temporary data is automatically purged from our systems</li>
                <li>We use secure, industry-standard protocols for all operations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}