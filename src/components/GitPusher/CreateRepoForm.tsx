import React, { useState } from 'react';
import { GitHubService } from '../../services/GitHubService';
import { Book, FileCode, Scale, AlertCircle } from 'lucide-react';

interface CreateRepoFormProps {
  token: string;
  onRepoCreated: (owner: string, repo: string) => void;
}

export const CreateRepoForm: React.FC<CreateRepoFormProps> = ({ token, onRepoCreated }) => {
  const [repoName, setRepoName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [readme, setReadme] = useState(true);
  const [gitignore, setGitignore] = useState('Node');
  const [license, setLicense] = useState('mit');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const gitignoreTemplates = ['None', 'Node', 'Python', 'Java', 'Ruby', 'Go', 'Rust', 'C++'];
  const licenseTemplates = [
    { value: 'none', label: 'None' },
    { value: 'mit', label: 'MIT License' },
    { value: 'apache-2.0', label: 'Apache License 2.0' },
    { value: 'gpl-3.0', label: 'GNU GPLv3' },
    { value: 'bsd-2-clause', label: 'BSD 2-Clause' },
    { value: 'bsd-3-clause', label: 'BSD 3-Clause' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const github = new GitHubService(token, '');
      const result = await github.createRepository({
        name: repoName,
        description,
        private: isPrivate,
        auto_init: readme,
        gitignore_template: gitignore !== 'None' ? gitignore : undefined,
        license_template: license !== 'none' ? license : undefined,
      });

      onRepoCreated(result.owner.login, result.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create repository');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Create New Repository</h2>
        <p className="mt-1 text-sm text-gray-500">
          Set up a new GitHub repository with your preferred settings
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error creating repository</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="repo-name" className="block text-sm font-medium text-gray-700">
            Repository Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="repo-name"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description (optional)
          </label>
          <div className="mt-1">
            <textarea
              id="description"
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="private"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            <label htmlFor="private" className="ml-2 block text-sm text-gray-900">
              Private repository
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="readme"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={readme}
              onChange={(e) => setReadme(e.target.checked)}
            />
            <label htmlFor="readme" className="ml-2 block text-sm text-gray-900">
              Initialize with README
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="gitignore" className="block text-sm font-medium text-gray-700">
            Add .gitignore template
          </label>
          <select
            id="gitignore"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={gitignore}
            onChange={(e) => setGitignore(e.target.value)}
          >
            {gitignoreTemplates.map((template) => (
              <option key={template} value={template}>
                {template}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="license" className="block text-sm font-medium text-gray-700">
            Add a license
          </label>
          <select
            id="license"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={license}
            onChange={(e) => setLicense(e.target.value)}
          >
            {licenseTemplates.map((template) => (
              <option key={template.value} value={template.value}>
                {template.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {loading ? 'Creating Repository...' : 'Create Repository'}
        </button>
      </form>
    </div>
  );
};