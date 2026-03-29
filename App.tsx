import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { storage } from './storage';
import { WorkoutSession, WorkoutSet, EQUIPMENT_DATABASE, MUSCLE_GROUPS, SplitType } from './types';

type Screen = 'home' | 'workout' | 'history';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutSession | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [weight, setWeight] = useState<string>('');
  const [reps, setReps] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    const data = await storage.getWorkouts();
    setWorkouts(data);
  };

  const startWorkout = () => {
    const nextSplit = storage.getNextSplit(workouts);
    const newWorkout: WorkoutSession = {
      id: Date.now().toString(),
      date: Date.now(),
      sets: [],
      muscleGroupsHit: [],
    };
    setCurrentWorkout(newWorkout);
    setScreen('workout');
  };

  const addSet = () => {
    if (!currentWorkout || !selectedEquipment || !weight || !reps) {
      Alert.alert('请填写完整信息');
      return;
    }

    const equipment = EQUIPMENT_DATABASE.find(e => e.id === selectedEquipment);
    if (!equipment) return;

    const newSet: WorkoutSet = {
      id: Date.now().toString(),
      equipmentId: selectedEquipment,
      weight: parseFloat(weight),
      reps: parseInt(reps),
      notes: notes || undefined,
    };

    const updatedWorkout: WorkoutSession = {
      ...currentWorkout,
      sets: [...currentWorkout.sets, newSet],
      muscleGroupsHit: Array.from(new Set([...currentWorkout.muscleGroupsHit, ...equipment.muscleGroups])),
    };

    setCurrentWorkout(updatedWorkout);
    setWeight('');
    setReps('');
    setNotes('');
  };

  const removeSet = (setId: string) => {
    if (!currentWorkout) return;
    const updatedSets = currentWorkout.sets.filter(s => s.id !== setId);
    const muscleGroupsHit = Array.from(new Set(
      updatedSets.flatMap(s => {
        const eq = EQUIPMENT_DATABASE.find(e => e.id === s.equipmentId);
        return eq ? eq.muscleGroups : [];
      })
    );
    setCurrentWorkout({ ...currentWorkout, sets: updatedSets, muscleGroupsHit });
  };

  const finishWorkout = async () => {
    if (!currentWorkout || currentWorkout.sets.length === 0) {
      Alert.alert('请至少添加一组训练');
      return;
    }
    await storage.saveWorkout(currentWorkout);
    await loadWorkouts();
    setCurrentWorkout(null);
    setScreen('home');
  };

  const deleteWorkout = async (id: string) => {
    Alert.alert(
      '确认删除',
      '确定要删除这条训练记录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除', style: 'destructive', onPress: async () => {
            await storage.deleteWorkout(id);
            await loadWorkouts();
          }
        }
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getEquipmentName = (id: string) => {
    return EQUIPMENT_DATABASE.find(e => e.id === id)?.name || id;
  };

  const renderHome = () => {
    const nextSplit = storage.getNextSplit(workouts);
    const nextSplitName = storage.getSplitName(nextSplit);

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💪 阿呆健身</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>下次训练</Text>
            <Text style={styles.nextWorkout}>{nextSplitName}</Text>
            <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
              <Text style={styles.startButtonText}>开始训练</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>最近训练</Text>
            {workouts.length === 0 ? (
              <Text style={styles.emptyText}>还没有训练记录，开始你的第一次训练吧！</Text>
            ) : (
              workouts.slice(0, 3).map(workout => (
              <View key={workout.id} style={styles.historyItem}>
                <Text style={styles.historyDate}>{formatDate(workout.date)}</Text>
                <Text style={styles.historyMuscles}>
                  {workout.muscleGroupsHit.map(m => MUSCLE_GROUPS[m as keyof typeof MUSCLE_GROUPS]).join(' · ')}
                </Text>
                <Text style={styles.historySets}>{workout.sets.length} 组</Text>
              </View>
            )))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderWorkout = () => {
    if (!currentWorkout) return null;

    const availableEquipment = EQUIPMENT_DATABASE.filter(e => {
      const nextSplit = storage.getNextSplit(workouts);
      if (nextSplit === 'push') return e.muscleGroups.some(m => ['chest', 'shoulders', 'triceps'].includes(m));
      if (nextSplit === 'pull') return e.muscleGroups.some(m => ['back', 'biceps'].includes(m));
      return e.muscleGroups.includes('legs');
    });

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setScreen('home')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>训练中</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>添加训练组</Text>
            
            <Text style={styles.label}>选择器械</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.equipmentList}>
              {availableEquipment.map(eq => (
                <TouchableOpacity
                  key={eq.id}
                  style={[
                    styles.equipmentChip,
                    selectedEquipment === eq.id && styles.equipmentChipSelected
                  ]}
                  onPress={() => setSelectedEquipment(eq.id)}
                >
                  <Text style={[
                    styles.equipmentChipText,
                    selectedEquipment === eq.id && styles.equipmentChipTextSelected
                  ]}>{eq.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>重量 (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>次数</Text>
                <TextInput
                  style={styles.input}
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            </View>

            <Text style={styles.label}>备注 (可选)</Text>
            <TextInput
              style={styles.input}
              value={notes}
              onChangeText={setNotes}
              placeholder="添加备注..."
            />

            <TouchableOpacity style={styles.addButton} onPress={addSet}>
              <Text style={styles.addButtonText}>添加组</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>本次训练</Text>
            {currentWorkout.sets.length === 0 ? (
              <Text style={styles.emptyText}>还没有添加任何组</Text>
            ) : (
              currentWorkout.sets.map(set => (
              <View key={set.id} style={styles.setItem}>
                <View style={styles.setInfo}>
                  <Text style={styles.setEquipment}>{getEquipmentName(set.equipmentId)}</Text>
                  <Text style={styles.setDetails}>{set.weight}kg × {set.reps}次</Text>
                  {set.notes && <Text style={styles.setNotes}>{set.notes}</Text>}
                </View>
                <TouchableOpacity onPress={() => removeSet(set.id)}>
                  <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
            )))}
          </View>

          <TouchableOpacity style={styles.finishButton} onPress={finishWorkout}>
            <Text style={styles.finishButtonText}>完成训练</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const renderHistory = () => {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>训练历史</Text>
        </View>

        <ScrollView style={styles.content}>
          {workouts.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.emptyText}>还没有训练记录</Text>
            </View>
          ) : (
            workouts.map(workout => (
              <View key={workout.id} style={styles.card}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>{formatDate(workout.date)}</Text>
                  <TouchableOpacity onPress={() => deleteWorkout(workout.id)}>
                    <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.historyMuscles}>
                  部位: {workout.muscleGroupsHit.map(m => MUSCLE_GROUPS[m as keyof typeof MUSCLE_GROUPS]).join(' · ')}
                </Text>
                <Text style={styles.historySets}>总组数: {workout.sets.length}</Text>
                {workout.sets.map(set => (
                  <View key={set.id} style={styles.historySetItem}>
                    <Text style={styles.historySetName}>{getEquipmentName(set.equipmentId)}</Text>
                    <Text style={styles.historySetDetails}>{set.weight}kg × {set.reps}次</Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      {screen === 'home' && renderHome()}
      {screen === 'workout' && renderWorkout()}
      {screen === 'history' && renderHistory()}
      
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setScreen('home')}
        >
          <Ionicons
            name={screen === 'home' ? 'home' : 'home-outline'}
            size={24}
            color={screen === 'home' ? '#6366f1' : '#9ca3af'}
          />
          <Text style={[styles.tabText, screen === 'home' && styles.tabTextActive]}>首页</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setScreen('history')}
        >
          <Ionicons
            name={screen === 'history' ? 'list' : 'list-outline'}
            size={24}
            color={screen === 'history' ? '#6366f1' : '#9ca3af'}
          />
          <Text style={[styles.tabText, screen === 'history' && styles.tabTextActive]}>历史</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#6366f1',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1f2937',
  },
  nextWorkout: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 20,
  },
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  historyMuscles: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  historySets: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  historySetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    marginTop: 8,
  },
  historySetName: {
    fontSize: 14,
    color: '#1f2937',
  },
  historySetDetails: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  equipmentList: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  equipmentChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  equipmentChipSelected: {
    backgroundColor: '#6366f1',
  },
  equipmentChipText: {
    color: '#374151',
    fontSize: 14,
  },
  equipmentChipTextSelected: {
    color: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#10b981',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  setItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  setInfo: {
    flex: 1,
  },
  setEquipment: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  setDetails: {
    fontSize: 14,
    color: '#6366f1',
    marginTop: 2,
  },
  setNotes: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  finishButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 80,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 20,
    paddingTop: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  tabTextActive: {
    color: '#6366f1',
    fontWeight: '500',
  },
});
