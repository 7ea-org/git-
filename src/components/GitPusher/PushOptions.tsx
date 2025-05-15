import React from 'react';
import { GitBranch, MessageSquare, Zap } from 'lucide-react';

interface PushOptionsProps {
  commitMessage: string;
  setCommitMessage: (message: string) => void;
  branch: string;
  setBranch: (branch: string) => void;
  useSequential: boolean;
  setUseSequential: (sequential: boolean) => void;
}

export const PushOptions: React.FC<PushOptionsProps> = ({
  commitMessage,
  setCommitMessage,
  branch,
  setBranch,
  useSequential,
  setUseSequential
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Push Options</h2>
        <p className="mt-1 text-sm text-gray-500">
          Configure how your files will be committed to the repository
        </p>
      </div>

      <div>
        <label htmlFor="commit-message" className="block text-sm font-medium text-gray-700">
          Commit Message
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MessageSquare className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            id="commit-message"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Update files via GitPusher"
          />
        </div>
      </div>

      <div>
        <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
          Branch
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <GitBranch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            id="branch"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="main"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          If the branch doesn't exist, a new branch will be created from the default branch.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Upload Mode
        </label>
        <div className="mt-2 flex items-center space-x-4">
          <button
            type="button"
            onClick={() => setUseSequential(true)}
            className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
              useSequential
                ? 'border-blue-500 text-blue-700 bg-blue-50'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            Sequential
          </button>
          <button
            type="button"
            onClick={() => setUseSequential(false)}
            className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
              !useSequential
                ? 'border-blue-500 text-blue-700 bg-blue-50'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <Zap className="h-4 w-4 mr-2" />
            Concurrent
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Choose between sequential (one by one) or concurrent (batch) file uploads.
        </p>
      </div>
    </div>
  );
};