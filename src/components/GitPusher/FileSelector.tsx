import React, { useState, useRef } from 'react';
import { Folder, File, X, Upload, FolderPlus, FilePlus, Trash2, ArrowUpDown } from 'lucide-react';
import { FileSelection } from '../../types/github-types';

interface FileSelectorProps {
  onSelect: (files: FileSelection[]) => void;
  selections: FileSelection[];
}

export const FileSelector: React.FC<FileSelectorProps> = ({ onSelect, selections }) => {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newSelections = Array.from(e.target.files).map(file => {
      return {
        file,
        path: file.webkitRelativePath || file.name,
        type: 'file'
      };
    });
    
    onSelect([...selections, ...newSelections]);
    
    // Reset the input
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    const newSelections = [...selections];
    newSelections.splice(index, 1);
    onSelect(newSelections);
  };

  const handleDeselectAll = () => {
    onSelect([]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      const newSelections = Array.from(e.dataTransfer.files).map(file => {
        return {
          file,
          path: file.webkitRelativePath || file.name,
          type: 'file'
        };
      });
      
      onSelect([...selections, ...newSelections]);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const sortedSelections = [...selections].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.file.size - b.file.size;
    }
    return b.file.size - a.file.size;
  });

  const totalFileSize = selections.reduce(
    (total, { file }) => total + file.size, 
    0
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Select Files</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose files or folders to push to the repository
        </p>
      </div>

      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm font-medium text-gray-900">
          Drag files here, or select files below
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Files will retain their relative paths when pushed to GitHub
        </p>

        <div className="mt-4 flex space-x-3 justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FilePlus className="h-4 w-4 mr-2" />
            Select Files
          </button>
          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            Select Folder
          </button>
          <input
            ref={folderInputRef}
            type="file"
            webkitdirectory=""
            directory=""
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {selections.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-700">
                Selected Files ({selections.length})
              </h3>
              <button
                onClick={toggleSortOrder}
                className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowUpDown className="h-3 w-3 mr-1" />
                Size {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                Total size: {formatFileSize(totalFileSize)}
              </span>
              <button
                onClick={handleDeselectAll}
                className="inline-flex items-center px-2 py-1 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Deselect All
              </button>
            </div>
          </div>
          <div className="border rounded-md overflow-hidden">
            <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
              {sortedSelections.map((selection, index) => (
                <li key={index} className="p-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center">
                    {selection.file.webkitRelativePath ? (
                      <Folder className="h-5 w-5 text-blue-500 mr-2" />
                    ) : (
                      <File className="h-5 w-5 text-gray-500 mr-2" />
                    )}
                    <span className="text-sm truncate max-w-xs">
                      {selection.path}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {formatFileSize(selection.file.size)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};