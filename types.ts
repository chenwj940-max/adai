export interface Equipment {
  id: string;
  name: string;
  muscleGroups: string[]; // 对应的肌肉部位
}

export interface WorkoutSet {
  id: string;
  equipmentId: string;
  weight: number; // 重量（kg）
  reps: number; // 次数
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: number; // timestamp
  sets: WorkoutSet[];
  muscleGroupsHit: string[]; // 本次练到的部位
}

// 经典三分化
export type SplitType = 'push' | 'pull' | 'legs';

export const MUSCLE_GROUPS = {
  chest: '胸部',
  shoulders: '肩部',
  triceps: '三头肌',
  back: '背部',
  biceps: '二头肌',
  legs: '腿部',
  core: '核心'
} as const;

export const EQUIPMENT_DATABASE: Equipment[] = [
  // Push (胸/肩/三)
  { id: 'bench-press', name: '卧推', muscleGroups: ['chest', 'triceps'] },
  { id: 'incline-bench', name: '上斜卧推', muscleGroups: ['chest', 'shoulders'] },
  { id: 'shoulder-press', name: '肩推', muscleGroups: ['shoulders', 'triceps'] },
  { id: 'lateral-raise', name: '侧平举', muscleGroups: ['shoulders'] },
  { id: 'tricep-pushdown', name: '三头下压', muscleGroups: ['triceps'] },
  { id: 'chest-fly', name: '蝴蝶机夹胸', muscleGroups: ['chest'] },
  { id: 'overhead-press', name: '推举', muscleGroups: ['shoulders', 'triceps'] },
  
  // Pull (背/二)
  { id: 'pull-up', name: '引体向上', muscleGroups: ['back', 'biceps'] },
  { id: 'lat-pulldown', name: '高位下拉', muscleGroups: ['back'] },
  { id: 'seated-row', name: '坐姿划船', muscleGroups: ['back', 'biceps'] },
  { id: 'bicep-curl', name: '二头弯举', muscleGroups: ['biceps'] },
  { id: 'hammer-curl', name: '锤式弯举', muscleGroups: ['biceps'] },
  { id: 'face-pull', name: '面拉', muscleGroups: ['back', 'shoulders'] },
  { id: 'deadlift', name: '硬拉', muscleGroups: ['back', 'legs'] },
  
  // Legs
  { id: 'squat', name: '深蹲', muscleGroups: ['legs'] },
  { id: 'leg-press', name: '腿举', muscleGroups: ['legs'] },
  { id: 'leg-extension', name: '腿屈伸', muscleGroups: ['legs'] },
  { id: 'leg-curl', name: '腿弯举', muscleGroups: ['legs'] },
  { id: 'calf-raise', name: ' calf raise', muscleGroups: ['legs'] },
  { id: 'lunge', name: '箭步蹲', muscleGroups: ['legs'] },
  { id: 'romanian-deadlift', name: '罗马尼亚硬拉', muscleGroups: ['legs', 'back'] },
  
  // Core
  { id: 'plank', name: '平板支撑', muscleGroups: ['core'] },
  { id: 'crunch', name: '卷腹', muscleGroups: ['core'] },
  { id: 'hanging-leg-raise', name: '悬垂举腿', muscleGroups: ['core'] },
];
