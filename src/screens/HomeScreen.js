import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import TaskItem from './TaskItem';
import { SERVER_IP } from '../common/config';
import { getTasksFromStorage, saveTasksToStorage } from '../utils/storage';

const HomeScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(() => {
    fetch(`http://${SERVER_IP}:3000/tasks`)
      .then((response) => response.json())
      .then((data) => {
        setTasks(data);
        setIsLoading(false);
        saveTasksToStorage(data); // Save fetched tasks to AsyncStorage
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
        setIsLoading(false);
        Alert.alert('Offline Mode', 'Failed to fetch tasks from server. Loading offline data.');
        getTasksFromStorage().then((offlineTasks) => {
          setTasks(offlineTasks);
        });
      });
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTasks();
    });

    return unsubscribe;
  }, [navigation, fetchTasks]);

  const deleteTask = (id) => {
    fetch(`http://${SERVER_IP}:3000/tasks/${id}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          setTasks(tasks.filter((task) => task.id !== id));
        } else {
          throw new Error('Failed to delete task');
        }
      })
      .catch((error) => console.error('Error deleting task:', error));
  };

  const saveTask = (task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
  };

  const addTask = (task) => {
    setTasks([...tasks, { ...task, id: Date.now().toString() }]);
  };

  const renderItem = ({ item }) => (
    <TaskItem
      task={item}
      onView={(taskId) => navigation.navigate('TaskDetail', { taskId, onEdit: handleEdit, onDelete: deleteTask })}
      onEdit={(task) => navigation.navigate('TaskForm', { task, onSave: saveTask })}
      onDelete={(id) => {
        deleteTask(id);
        setTimeout(fetchTasks, 100);
      }}
    />
  );

  const handleEdit = (task) => {
    navigation.navigate('TaskForm', { task, onSave: saveTask });
  };

  return (
    <View style={styles.container}>
      <FlatList data={tasks} keyExtractor={(item) => item.id} renderItem={renderItem} />
      <Pressable style={styles.addButton} onPress={() => navigation.navigate('TaskForm', { onSave: saveTask })}>
        <Text style={styles.addButtonText}>Add Task</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
