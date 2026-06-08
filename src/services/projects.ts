/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { VideoProject, ProjectStatus, ProjectAsset } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const createProject = async (projectData: Partial<VideoProject>) => {
  const path = 'projects';
  try {
    const newProjectRef = doc(collection(db, path));
    const project: VideoProject = {
      id: newProjectRef.id,
      ownerId: auth.currentUser?.uid || 'guest-session',
      title: projectData.title || 'Untitled Project',
      description: projectData.description || '',
      originalPrompt: projectData.originalPrompt || '',
      status: ProjectStatus.DRAFT,
      aspectRatio: projectData.aspectRatio || '16:9',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {},
      ...projectData,
    };

    await setDoc(newProjectRef, project);
    return project;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getUserProjects = async () => {
  const path = 'projects';
  try {
    const userId = auth.currentUser?.uid || 'guest-session';
    const q = query(
      collection(db, path), 
      where('ownerId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as VideoProject);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const createAsset = async (projectId: string, assetData: Partial<ProjectAsset>) => {
  const path = `projects/${projectId}/assets`;
  try {
    const assetRef = doc(collection(db, 'projects', projectId, 'assets'));
    const asset: ProjectAsset = {
      id: assetRef.id,
      projectId,
      type: assetData.type || 'video',
      url: assetData.url || '',
      name: assetData.name || 'Untitled Asset',
      role: assetData.role || 'source',
      createdAt: Date.now(),
      ...assetData,
    };

    await setDoc(assetRef, asset);
    return asset;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getProjectAssets = async (projectId: string) => {
  const path = `projects/${projectId}/assets`;
  try {
    const q = query(collection(db, 'projects', projectId, 'assets'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as ProjectAsset);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const updateProject = async (projectId: string, updates: Partial<VideoProject>) => {
  const path = `projects/${projectId}`;
  try {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      ...updates,
      updatedAt: Date.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const seedSampleProject = async () => {
  const project = await createProject({
    title: 'Cyberpunk Tokyo Drive',
    description: 'A cinematic exploration of neon-lit night streets in Tokyo.',
    originalPrompt: 'Edit my footage to look like a high-octane cyberpunk anime opening.',
    status: ProjectStatus.COMPLETED,
    aspectRatio: '16:9',
  });

  if (project) {
    await createAsset(project.id, {
      name: 'tokyo_night_drive.mp4',
      type: 'video',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', // Fallback sample
      role: 'source'
    });
    
    await createAsset(project.id, {
      name: 'synthwave_bass.wav',
      type: 'audio',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      role: 'background'
    });

    await createAsset(project.id, {
      name: 'neon_glitch_overlay.png',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fab35',
      role: 'overlay'
    });
  }
  return project;
};
