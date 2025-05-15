import React from 'react';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { PushState } from '../../types/github-types';

interface PushStatusProps {
  state: PushState;
}

export const PushStatus: React.FC<PushStatusProps> = ({ state }) => {
  const getStatusIcon = () => {
    switch (state.status) {
      case 'pushing':
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (state.status) {
      case 'pushing':
        return 'Pushing to GitHub...';
      case 'success':
        return 'Successfully pushed to GitHub!';
      case 'error':
        return 'Error pushing to GitHub';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (state.status) {
      case 'pushing':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getProgressBarColor = () => {
    switch (state.status) {
      case 'pushing':
        return 'bg-blue-500';
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <div className={`p-4 rounded-md border ${getStatusColor()}`}>
      <div className="flex">
        <div className="flex-shrink-0">{getStatusIcon()}</div>
        <div className="ml-3 w-full">
          <h3 className="text-sm font-medium">{getStatusText()}</h3>
          <div className="mt-2 text-sm">{state.message}</div>
          
          {state.status === 'pushing' && (
            <div className="mt-3">
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                  <div
                    style={{ width: `${state.progress}%` }}
                    className={`${getProgressBarColor()} rounded transition-all duration-300 ease-in-out`}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-right">
                  {state.progress}%
                </div>
              </div>
            </div>
          )}
          
          {state.error && (
            <div className="mt-2 text-sm text-red-700">{state.error}</div>
          )}
        </div>
      </div>
    </div>
  );
};