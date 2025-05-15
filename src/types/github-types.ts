export interface AuthData {
  token: string;
  email: string;
  name: string;
}

export interface RepoDetails {
  owner: string;
  repo: string;
}

export interface FileSelection {
  file: File;
  path: string;
  type: string;
}

export interface PushState {
  status: 'idle' | 'pushing' | 'success' | 'error';
  progress: number;
  message: string;
  error: string | null;
}

export interface SavedToken {
  id: string;
  name: string;
  token: string;
  email: string;
}