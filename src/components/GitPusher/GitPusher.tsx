import React, { useState } from 'react';
import { GitHubCredentialsForm } from './GitHubCredentialsForm';
import { RepoSelector } from './RepoSelector';
import { CreateRepoForm } from './CreateRepoForm';
import { FileSelector } from './FileSelector';
import { PushOptions } from './PushOptions';
import { PushStatus } from './PushStatus';
import { RepoViewer } from './RepoViewer';
import { GitHubService } from '../../services/GitHubService';
import { AlertCircle, Github, Plus } from 'lucide-react';
import { 
  AuthData, 
  FileSelection, 
  PushState, 
  RepoDetails 
} from '../../types/github-types';

const GitPusher: React.FC = () => {
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [repoDetails, setRepoDetails] = useState<RepoDetails | null>(null);
  const [fileSelections, setFileSelections] = useState<FileSelection[]>([]);
  const [commitMessage, setCommitMessage] = useState<string>('Update files via GitPusher');
  const [branch, setBranch] = useState<string>('main');
  const [showCreateRepo, setShowCreateRepo] = useState(false);
  const [useSequential, setUseSequential] = useState(true);
  const [pushState, setPushState] = useState<PushState>({
    status: 'idle',
    progress: 0,
    message: '',
    error: null
  });

  const handleAuthSubmit = (data: AuthData) => {
    setAuthData(data);
  };

  const handleRepoSelect = (repo: RepoDetails) => {
    setRepoDetails(repo);
    setShowCreateRepo(false);
  };

  const handleFileSelect = (files: FileSelection[]) => {
    setFileSelections(files);
  };

  const handlePush = async () => {
    if (!authData || !repoDetails || fileSelections.length === 0) {
      setPushState({
        status: 'error',
        progress: 0,
        message: 'Missing required information',
        error: 'Please provide all required information before pushing'
      });
      return;
    }

    try {
      setPushState({
        status: 'pushing',
        progress: 0,
        message: 'Preparing files...',
        error: null
      });

      const gitHubService = new GitHubService(authData.token, authData.email);
      gitHubService.setUploadMode(useSequential);
      
      gitHubService.onProgressUpdate((progress, message) => {
        setPushState(prev => ({
          ...prev,
          progress,
          message
        }));
      });

      await gitHubService.pushFiles(
        repoDetails,
        fileSelections,
        commitMessage,
        branch
      );

      setPushState({
        status: 'success',
        progress: 100,
        message: 'Successfully pushed to GitHub!',
        error: null
      });
    } catch (error) {
      setPushState({
        status: 'error',
        progress: 0,
        message: 'Failed to push to GitHub',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

  const reset = () => {
    setPushState({
      status: 'idle',
      progress: 0,
      message: '',
      error: null
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Github className="mx-auto h-12 w-12 text-gray-900" />
          <h1 className="mt-3 text-3xl font-extrabold text-gray-900">GitHub Pusher</h1>
          <p className="mt-2 text-lg text-gray-600">
            Push files and folders directly to GitHub repositories
          </p>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {pushState.status === 'success' ? (
            <div className="p-6">
              <PushStatus state={pushState} />
              <button
                onClick={reset}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
              >
                Push More Files
              </button>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {!authData ? (
                <GitHubCredentialsForm onSubmit={handleAuthSubmit} />
              ) : (
                <>
                  <div className="border-b pb-4">
                    <h2 className="text-lg font-medium text-gray-900 mb-2">Authentication</h2>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Authenticated with token</span>
                      <button
                        onClick={() => setAuthData(null)}
                        className="text-sm text-blue-500 hover:text-blue-700"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  {!repoDetails ? (
                    <>
                      <div className="flex justify-end mb-4">
                        <button
                          onClick={() => setShowCreateRepo(!showCreateRepo)}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {showCreateRepo ? 'Select Existing Repo' : 'Create New Repo'}
                        </button>
                      </div>
                      {showCreateRepo ? (
                        <CreateRepoForm token={authData.token} onRepoCreated={handleRepoSelect} />
                      ) : (
                        <RepoSelector onSelect={handleRepoSelect} token={authData.token} />
                      )}
                    </>
                  ) : (
                    <>
                      <div className="border-b pb-4">
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Repository</h2>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {repoDetails.owner}/{repoDetails.repo}
                          </span>
                          <button
                            onClick={() => setRepoDetails(null)}
                            className="text-sm text-blue-500 hover:text-blue-700"
                          >
                            Change
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <RepoViewer
                            token={authData.token}
                            owner={repoDetails.owner}
                            repo={repoDetails.repo}
                            email={authData.email}
                          />
                        </div>
                        <div className="space-y-6">
                          <FileSelector 
                            onSelect={handleFileSelect} 
                            selections={fileSelections} 
                          />

                          <PushOptions
                            commitMessage={commitMessage}
                            setCommitMessage={setCommitMessage}
                            branch={branch}
                            setBranch={setBranch}
                            useSequential={useSequential}
                            setUseSequential={setUseSequential}
                          />

                          {pushState.status === 'pushing' && (
                            <PushStatus state={pushState} />
                          )}

                          {pushState.status === 'error' && (
                            <div className="rounded-md bg-red-50 p-4 mb-4">
                
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <AlertCircle className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                  <h3 className="text-sm font-medium text-red-800">
                                    Error pushing to GitHub
                                  </h3>
                                  <div className="mt-2 text-sm text-red-700">
                                    {pushState.error}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <button
                            onClick={handlePush}
                            disabled={
                              fileSelections.length === 0 || 
                              pushState.status === 'pushing'
                            }
                            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                              ${fileSelections.length === 0 || pushState.status === 'pushing'
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                              }
                            `}
                          >
                            {pushState.status === 'pushing' 
                              ? 'Pushing...' 
                              : 'Push to GitHub'}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GitPusher;