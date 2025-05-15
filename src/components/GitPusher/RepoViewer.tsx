import React, { useState, useEffect } from 'react';
import { Folder, File, Upload, RefreshCw, AlertCircle, ChevronRight, ChevronDown } from 'lucide-react';
import { GitHubService } from '../../services/GitHubService';
import { FileSelector } from './FileSelector';

interface RepoViewerProps {
  token: string;
  owner: string;
  repo: string;
  email: string;
}

interface TreeItem {
  path: string;
  type: 'tree' | 'blob';
  sha: string;
  url: string;
}

interface TreeState {
  [path: string]: boolean;
}

export const RepoViewer: React.FC<RepoViewerProps> = ({ token, owner, repo, email }) => {
  const [tree, setTree] = useState<TreeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<TreeState>({});
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'tree' | 'blob' | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchRepoContents();
  }, [owner, repo, refreshKey]);

  const fetchRepoContents = async () => {
    try {
      setLoading(true);
      setError(null);
      const github = new GitHubService(token, email);
      const contents = await github.getRepoContents(owner, repo);
      setTree(contents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch repository contents');
    } finally {
      setLoading(false);
    }
  };

  const togglePath = (path: string) => {
    setExpandedPaths(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleUpload = async (files: { file: File; path: string; type: string }[]) => {
    try {
      const github = new GitHubService(token, email);
      
      // Handle the target path based on whether we're uploading to a file or directory
      const targetPath = selectedType === 'tree' 
        ? (selectedPath?.endsWith('/') ? selectedPath : `${selectedPath}/`)
        : selectedPath?.substring(0, selectedPath.lastIndexOf('/') + 1) || '';

      const mappedFiles = files.map(f => ({
        ...f,
        path: selectedType === 'tree' 
          ? targetPath + f.path // For directories, keep the original behavior
          : targetPath + f.file.name // For files, just use the file name
      }));

      await github.pushFiles(
        { owner, repo },
        mappedFiles,
        `Update ${selectedPath} via GitPusher`,
        'main'
      );

      setShowUploadModal(false);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files');
    }
  };

  const renderTree = (items: TreeItem[], parentPath: string = '') => {
    return items
      .filter(item => {
        const itemPath = item.path;
        const itemParts = itemPath.split('/');
        const parentParts = parentPath ? parentPath.split('/') : [];
        
        // Only show items that are direct children of the parent path
        return parentPath === '' ? 
          itemParts.length === 1 : // Root level items
          itemPath.startsWith(parentPath + '/') && itemParts.length === parentParts.length + 1;
      })
      .sort((a, b) => {
        if (a.type === b.type) return a.path.localeCompare(b.path);
        return a.type === 'tree' ? -1 : 1;
      })
      .map(item => {
        const isFolder = item.type === 'tree';
        const isExpanded = expandedPaths[item.path];
        
        // Check for direct children only
        const hasChildren = tree.some(child => {
          const childParts = child.path.split('/');
          const itemParts = item.path.split('/');
          return child.path.startsWith(item.path + '/') && childParts.length === itemParts.length + 1;
        });

        return (
          <div key={item.path} className="select-none">
            <div 
              className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer ${
                selectedPath === item.path ? 'bg-blue-50' : ''
              }`}
              style={{ paddingLeft: `${parentPath.split('/').length * 1.5 + 0.5}rem` }}
              onClick={() => {
                if (isFolder && hasChildren) togglePath(item.path);
                setSelectedPath(item.path);
                setSelectedType(item.type);
              }}
            >
              {isFolder && hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500 mr-1" />
                )
              ) : (
                <span className="w-5" />
              )}
              {isFolder ? (
                <Folder className="h-4 w-4 text-blue-500 mr-2" />
              ) : (
                <File className="h-4 w-4 text-gray-500 mr-2" />
              )}
              <span className="text-sm">{item.path.split('/').pop()}</span>
            </div>
            {isExpanded && hasChildren && renderTree(tree, item.path)}
          </div>
        );
      });
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b px-4 py-2 flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Repository Contents</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="p-1 text-gray-500 hover:text-gray-700"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          {selectedPath && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="p-1 text-gray-500 hover:text-gray-700"
              title="Upload to this location"
            >
              <Upload className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Loading repository contents...
          </div>
        ) : tree.length > 0 ? (
          renderTree(tree)
        ) : (
          <div className="p-4 text-center text-sm text-gray-500">
            Repository is empty
          </div>
        )}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Upload to {selectedPath}
            </h2>
            <FileSelector
              onSelect={handleUpload}
              selections={[]}
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};