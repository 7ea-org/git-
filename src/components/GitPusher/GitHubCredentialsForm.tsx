import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Github, Plus, Trash2 } from 'lucide-react';
import { AuthData, SavedToken } from '../../types/github-types';
import { ApiService } from '../../services/api';

interface GitHubCredentialsFormProps {
  onSubmit: (data: AuthData) => void;
}

const STORAGE_KEY = 'github_tokens';

export const GitHubCredentialsForm: React.FC<GitHubCredentialsFormProps> = ({ onSubmit }) => {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [errors, setErrors] = useState<{ token?: string; email?: string; name?: string }>({});
  const [savedTokens, setSavedTokens] = useState<SavedToken[]>([]);
  const [showAddNew, setShowAddNew] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const tokens = localStorage.getItem(STORAGE_KEY);
    if (tokens) {
      setSavedTokens(JSON.parse(tokens));
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: { token?: string; email?: string; name?: string } = {};
    let isValid = true;

    if (!token.trim()) {
      newErrors.token = 'GitHub token is required';
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!name.trim() && showAddNew) {
      newErrors.name = 'Token name is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setSaving(true);
        
        // Save to API
        await ApiService.saveGitHubCredentials({ token, email, name });

        if (showAddNew) {
          const newToken: SavedToken = {
            id: crypto.randomUUID(),
            name,
            token,
            email
          };
          
          const updatedTokens = [...savedTokens, newToken];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTokens));
          setSavedTokens(updatedTokens);
          
          // Reset form
          setToken('');
          setEmail('');
          setName('');
          setShowAddNew(false);
        }
        
        onSubmit({ token, email, name });
      } catch (error) {
        console.error('Error saving credentials:', error);
        setErrors(prev => ({
          ...prev,
          token: 'Failed to save credentials. Please try again.'
        }));
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeleteToken = (id: string) => {
    const updatedTokens = savedTokens.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTokens));
    setSavedTokens(updatedTokens);
  };

  const handleSelectToken = (savedToken: SavedToken) => {
    onSubmit({
      token: savedToken.token,
      email: savedToken.email,
      name: savedToken.name
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">GitHub Authentication</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your GitHub tokens and authenticate with GitHub.
        </p>
      </div>

      {savedTokens.length > 0 && !showAddNew && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">Saved Tokens</h3>
            <button
              type="button"
              onClick={() => setShowAddNew(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add New Token
            </button>
          </div>

          <div className="grid gap-4">
            {savedTokens.map((savedToken) => (
              <div
                key={savedToken.id}
                className="border rounded-lg p-4 bg-white shadow-sm hover:shadow transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-900">{savedToken.name}</h4>
                    <p className="text-sm text-gray-500">{savedToken.email}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleSelectToken(savedToken)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Use Token
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteToken(savedToken.id)}
                      className="inline-flex items-center px-2 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {showAddNew && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Token Name
            </label>
            <input
              type="text"
              id="name"
              className={`mt-1 block w-full py-2 px-3 border ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="Personal Token"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700">
              GitHub Token
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Github className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type={showToken ? "text" : "password"}
                id="token"
                className={`block w-full pl-10 pr-10 py-2 sm:text-sm border ${
                  errors.token ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 
                  'border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                } placeholder-gray-400`}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button 
                  type="button" 
                  onClick={() => setShowToken(!showToken)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {errors.token && (
              <p className="mt-1 text-sm text-red-600">{errors.token}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Need a token? <a 
                href="https://github.com/settings/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                Create one
              </a> with 'repo' scope.
            </p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1">
              <input
                type="email"
                id="email"
                className={`block w-full py-2 px-3 sm:text-sm ${
                  errors.email ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 
                  'border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                } placeholder-gray-400`}
                placeholder="your-email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="flex space-x-3">
            {savedTokens.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAddNew(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                saving 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {saving ? 'Saving...' : 'Save & Authenticate'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};