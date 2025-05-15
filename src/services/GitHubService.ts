import { RepoDetails, FileSelection } from '../types/github-types';

export class GitHubService {
  private token: string;
  private email: string;
  private onProgress: (progress: number, message: string) => void = () => {};
  private readonly CONCURRENT_UPLOADS = 3;
  private useSequential: boolean = true;

  constructor(token: string, email: string) {
    this.token = token;
    this.email = email;
  }

  public setUploadMode(sequential: boolean) {
    this.useSequential = sequential;
  }

  public onProgressUpdate(callback: (progress: number, message: string) => void) {
    this.onProgress = callback;
  }

  public async getRepoContents(owner: string, repo: string, path: string = ''): Promise<any[]> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
        {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.tree || [];
    } catch (error) {
      console.error('Error fetching repository contents:', error);
      throw error;
    }
  }

  public async createRepository(options: {
    name: string;
    description?: string;
    private?: boolean;
    auto_init?: boolean;
    gitignore_template?: string;
    license_template?: string;
  }) {
    try {
      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create repository');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating repository:', error);
      throw error;
    }
  }

  public async getRepositories() {
    try {
      const response = await fetch('https://api.github.com/user/repos?per_page=100', {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching repositories:', error);
      throw error;
    }
  }

  public async getDefaultBranch(owner: string, repo: string): Promise<string> {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const repoData = await response.json();
      return repoData.default_branch || 'main';
    } catch (error) {
      console.error('Error fetching default branch:', error);
      throw error;
    }
  }

  private async getRef(owner: string, repo: string, ref: string): Promise<{ sha: string, ref: string }> {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${ref}`, {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (response.status === 404) {
        const defaultBranch = await this.getDefaultBranch(owner, repo);
        const defaultBranchResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${defaultBranch}`, {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        if (!defaultBranchResponse.ok) {
          throw new Error(`GitHub API error: ${defaultBranchResponse.status} ${defaultBranchResponse.statusText}`);
        }

        const defaultBranchData = await defaultBranchResponse.json();
        return { sha: defaultBranchData.object.sha, ref };
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const refData = await response.json();
      return { sha: refData.object.sha, ref };
    } catch (error) {
      console.error('Error fetching ref:', error);
      throw error;
    }
  }

  private async createBlob(owner: string, repo: string, content: string | ArrayBuffer): Promise<string> {
    const base64Content = typeof content === 'string' 
      ? btoa(unescape(encodeURIComponent(content)))
      : this.arrayBufferToBase64(content);

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: base64Content,
        encoding: 'base64'
      })
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.sha;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return btoa(binary);
  }

  private async createTree(
    owner: string, 
    repo: string, 
    baseTreeSha: string, 
    files: { path: string, sha: string }[]
  ): Promise<string> {
    const tree = files.map(file => ({
      path: this.normalizePath(file.path),
      mode: '100644',
      type: 'blob',
      sha: file.sha
    }));

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree
      })
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.sha;
  }

  private normalizePath(path: string): string {
    // Remove any double slashes and leading/trailing slashes
    return path.replace(/\/+/g, '/').replace(/^\/+|\/+$/g, '');
  }

  private async createCommit(
    owner: string,
    repo: string,
    message: string,
    treeSha: string,
    parentSha: string
  ): Promise<string> {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        tree: treeSha,
        parents: [parentSha],
        author: {
          name: 'GitPusher',
          email: this.email
        }
      })
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.sha;
  }

  private async updateRef(
    owner: string,
    repo: string,
    ref: string,
    sha: string,
    force: boolean = false,
    retryCount: number = 0
  ): Promise<void> {
    try {
      const { sha: latestSha } = await this.getRef(owner, repo, ref);
      
      const updateResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${ref}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sha,
          force: true,
          previous_sha: latestSha
        })
      });

      if (updateResponse.ok) {
        return;
      }

      if (updateResponse.status === 404) {
        const createResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
          method: 'POST',
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ref: `refs/heads/${ref}`,
            sha
          })
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(`GitHub API error: ${createResponse.status} ${createResponse.statusText} - ${JSON.stringify(errorData)}`);
        }

        return;
      }

      if (updateResponse.status === 422 && retryCount < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.updateRef(owner, repo, ref, sha, true, retryCount + 1);
      }

      const errorData = await updateResponse.json();
      throw new Error(`GitHub API error: ${updateResponse.status} ${updateResponse.statusText} - ${JSON.stringify(errorData)}`);
    } catch (error) {
      console.error('Error updating ref:', error);
      throw error;
    }
  }

  private async processBatch(
    owner: string,
    repo: string,
    batch: { file: File, path: string }[],
    processedSize: number,
    totalSize: number
  ): Promise<{ path: string, sha: string }[]> {
    const blobPromises = batch.map(async ({ file, path }) => {
      const content = await file.arrayBuffer();
      const blobSha = await this.createBlob(owner, repo, content);
      return { path: this.normalizePath(path), sha: blobSha };
    });

    return Promise.all(blobPromises);
  }

  private async processSequential(
    owner: string,
    repo: string,
    files: { file: File, path: string }[],
    totalSize: number
  ): Promise<{ path: string, sha: string }[]> {
    const fileBlobs = [];
    let processedSize = 0;

    for (const [index, { file, path }] of files.entries()) {
      this.onProgress(
        10 + Math.round((processedSize / totalSize) * 60),
        `Creating blob for file ${index + 1} of ${files.length}: ${path}`
      );
      
      const content = await file.arrayBuffer();
      const blobSha = await this.createBlob(owner, repo, content);
      fileBlobs.push({ path: this.normalizePath(path), sha: blobSha });
      
      processedSize += file.size;
    }

    return fileBlobs;
  }

  public async pushFiles(
    repoDetails: { owner: string, repo: string },
    files: { file: File, path: string, type: string }[],
    commitMessage: string,
    branch: string
  ): Promise<void> {
    const { owner, repo } = repoDetails;
    
    this.onProgress(5, 'Getting repository information...');
    
    const { sha: parentSha, ref } = await this.getRef(owner, repo, branch);
    
    this.onProgress(10, 'Processing files...');
    
    const totalSize = files.reduce((acc, { file }) => acc + file.size, 0);
    let processedSize = 0;
    
    let fileBlobs: { path: string, sha: string }[] = [];

    if (this.useSequential) {
      fileBlobs = await this.processSequential(owner, repo, files, totalSize);
    } else {
      for (let i = 0; i < files.length; i += this.CONCURRENT_UPLOADS) {
        const batch = files.slice(i, i + this.CONCURRENT_UPLOADS);
        
        this.onProgress(
          10 + Math.round((processedSize / totalSize) * 60),
          `Processing batch ${Math.floor(i / this.CONCURRENT_UPLOADS) + 1} of ${Math.ceil(files.length / this.CONCURRENT_UPLOADS)}`
        );

        const batchResults = await this.processBatch(owner, repo, batch, processedSize, totalSize);
        fileBlobs.push(...batchResults);

        processedSize += batch.reduce((acc, { file }) => acc + file.size, 0);
      }
    }
    
    this.onProgress(70, 'Creating tree...');
    
    const treeSha = await this.createTree(owner, repo, parentSha, fileBlobs);
    
    this.onProgress(80, 'Creating commit...');
    
    const commitSha = await this.createCommit(owner, repo, commitMessage, treeSha, parentSha);
    
    this.onProgress(90, `Updating branch: ${ref}...`);
    
    await this.updateRef(owner, repo, ref, commitSha, true);
    
    this.onProgress(100, 'Successfully pushed files to GitHub!');
  }
}