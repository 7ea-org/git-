import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { RepoDetails } from '../../types/github-types';
import { GitHubService } from '../../services/GitHubService';

interface RepoSelectorProps {
  onSelect: (repo: RepoDetails) => void;
  token: string;
}

interface Repository {
  id: number;
  full_name: string;
  owner: {
    login: string;
  };
  name: string;
}

export const RepoSelector: React.FC<RepoSelectorProps> = ({ onSelect, token }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualRepo, setManualRepo] = useState({ owner: '', repo: '' });

  useEffect(() => {
    const fetchRepositories = async () => {
      if (!token) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const github = new GitHubService(token, '');
        const repos = await github.getRepositories();
        setRepositories(repos as Repository[]);
      } catch (err) {
        setError('Failed to fetch repositories. Please check your token and try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, [token]);

  const filteredRepos = repositories.filter(repo => 
    repo.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRepoSelect = (repo: Repository) => {
    onSelect({
      owner: repo.owner.login,
      repo: repo.name
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualRepo.owner && manualRepo.repo) {
      onSelect(manualRepo);
    } else {
      setError('Please provide both owner and repository name');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Select Repository</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose a repository to push your files to
        </p>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setManualEntry(false)}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            !manualEntry ? 
            'bg-blue-50 text-blue-700 border border-blue-200' : 
            'text-gray-700 hover:text-blue-700'
          }`}
        >
          My Repositories
        </button>
        <button
          type="button"
          onClick={() => setManualEntry(true)}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            manualEntry ? 
            'bg-blue-50 text-blue-700 border border-blue-200' : 
            'text-gray-700 hover:text-blue-700'
          }`}
        >
          Manual Entry
        </button>
      </div>

      {manualEntry ? (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label htmlFor="owner" className="block text-sm font-medium text-gray-700">
              Repository Owner
            </label>
            <input
              type="text"
              id="owner"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={manualRepo.owner}
              onChange={(e) => setManualRepo({ ...manualRepo, owner: e.target.value })}
              placeholder="e.g., octocat"
            />
          </div>
          <div>
            <label htmlFor="repo" className="block text-sm font-medium text-gray-700">
              Repository Name
            </label>
            <input
              type="text"
              id="repo"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={manualRepo.repo}
              onChange={(e) => setManualRepo({ ...manualRepo, repo: e.target.value })}
              placeholder="e.g., hello-world"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Use This Repository
          </button>
        </form>
      ) : (
        <>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="overflow-y-auto max-h-60 rounded-md border border-gray-200">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                <span className="ml-2 text-sm text-gray-500">Loading repositories...</span>
              </div>
            ) : filteredRepos.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {filteredRepos.map(repo => (
                  <li key={repo.id}>
                    <button
                      type="button"
                      onClick={() => handleRepoSelect(repo)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-900">{repo.full_name}</div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center text-sm text-gray-500">
                {searchTerm ? 'No matching repositories found' : 'No repositories found'}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};