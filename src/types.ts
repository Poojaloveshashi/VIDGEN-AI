/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ProjectStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: number;
}

export interface VideoProject {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  originalPrompt: string;
  status: ProjectStatus;
  thumbnailUrl?: string;
  videoUrl?: string; // Final exported video
  aspectRatio: '9:16' | '16:9' | '1:1';
  createdAt: number;
  updatedAt: number;
  metadata: {
    duration?: number;
    fileSize?: number;
    format?: string;
  };
}

export interface ProjectAsset {
  id: string;
  projectId: string;
  type: 'video' | 'audio' | 'image';
  url: string;
  name: string;
  role: 'source' | 'effect' | 'voiceover' | 'background' | 'overlay';
  createdAt: number;
}

export interface AIEditInstruction {
  timestamp: number;
  action: string;
  parameters: Record<string, any>;
  reasoning: string;
}
