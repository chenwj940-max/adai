import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutSession, SplitType } from './types';

const STORAGE_KEYS = {
  WORKOUTS: '@adai-fitness:workouts',
};

export const storage = {
  async getWorkouts(): Promise<WorkoutSession[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load workouts:', e);
      return [];
    }
  },

  async saveWorkout(workout: WorkoutSession): Promise<void> {
    try {
      const workouts = await this.getWorkouts();
      workouts.unshift(workout); // 新的在最前面
      await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
    } catch (e) {
      console.error('Failed to save workout:', e);
    }
  },

  async deleteWorkout(id: string): Promise<void> {
    try {
      const workouts = await this.getWorkouts();
      const filtered = workouts.filter(w => w.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete workout:', e);
    }
  },

  // 确定下次该练什么（三分化逻辑）
  getNextSplit(workouts: WorkoutSession[]): SplitType {
    if (workouts.length === 0) return 'push'; // 第一次练 push
    
    // 找到最近一次有记录的分化
    const lastWorkout = workouts[0];
    const muscles = lastWorkout.muscleGroupsHit;
    
    // 简单判断上次练了什么
    const hasPush = muscles.includes('chest') || muscles.includes('shoulders') || muscles.includes('triceps');
    const hasPull = muscles.includes('back') || muscles.includes('biceps');
    const hasLegs = muscles.includes('legs');
    
    // 三分化循环：push -> pull -> legs -> push...
    if (hasPush && !hasPull && !hasLegs) return 'pull';
    if (hasPull && !hasLegs) return 'legs';
    return 'push'; // 其他情况都回到 push
  },

  getSplitName(split: SplitType): string {
    const names: Record<SplitType, string> = {
      push: '推日 (胸/肩/三头)',
      pull: '拉日 (背/二头)',
      legs: '腿日',
    };
    return names[split];
  }
};
