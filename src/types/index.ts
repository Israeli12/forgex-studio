export type Framework = 'flutter' | 'react-native' | 'cordova' | 'ionic' | 'capacitor';
export type BuildStatus = 'pending' | 'queued' | 'running' | 'success' | 'failed' | 'cancelled';
export type BuildType = 'apk' | 'aab';
export type SourceType = 'github' | 'zip';
export type UserRole = 'user' | 'admin';
export type PlanTier = 'free' | 'pro' | 'team';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  github_username?: string;
  role: UserRole;
  plan: PlanTier;
  builds_used_this_month: number;
  storage_used_bytes: number;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  framework: Framework;
  source_type: SourceType;
  github_repo_url?: string;
  github_branch: string;
  zip_storage_path?: string;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Build {
  id: string;
  project_id: string;
  user_id: string;
  build_type: BuildType;
  status: BuildStatus;
  github_run_id?: string;
  github_run_url?: string;
  branch: string;
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
  error_message?: string;
  created_at: string;
}

export interface BuildLog {
  id: string;
  build_id: string;
  log_line: string;
  level: 'info' | 'error' | 'success' | 'warning';
  timestamp: string;
}

export interface Artifact {
  id: string;
  build_id: string;
  user_id: string;
  file_name: string;
  file_size_bytes: number;
  artifact_type: BuildType;
  r2_key: string;
  download_token?: string;
  expires_at?: string;
  download_count: number;
  created_at: string;
}
