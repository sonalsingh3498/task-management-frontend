import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, Alert } from 'react-native';
import { SERVER_IP } from '../common/config';
import { getTasksFromStorage, saveTasksToStorage } from '../utils/storage'; // Adjust the path as per your project structure

const TaskDetailScreen = ({ route }) => {
  const { taskId } = route.params;
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState(false); // Assume status is boolean (true/false)
  const [offlineMode, setOfflineMode] = useState(false); // Flag to indicate offline mode

  useEffect(() => {
    const fetchTaskDetails = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`http://${SERVER_IP}:3000/tasks/${taskId._id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch task details');
        }
        const data = await response.json();
        setTask(data);
        setStatus(data.completed); // Set initial status (boolean)
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching task details:', error);

        // Handle offline mode
        Alert.alert('Offline Mode', 'Unable to connect to the server. Viewing offline data.');
        const offlineTasks = await getTasksFromStorage();
        const offlineTask = offlineTasks.find(t => t._id === taskId);
        if (offlineTask) {
          setTask(offlineTask);
          setStatus(offlineTask.completed);
        } else {
          Alert.alert('Offline Mode', 'Task not found in offline storage.');
        }

        setIsLoading(false);
        setOfflineMode(true); // Offline mode
      }
    };

    fetchTaskDetails();
  }, [taskId]);

  const toggleStatus = () => {
    const newStatus = !status; // Toggle the status (true <-> false)

    if (offlineMode) {
      // Update task locally in offline mode
      const updatedTask = { ...task, completed: newStatus };
      updateTaskOffline(updatedTask);
    } else {
      // Update task on the server and then update locally
      fetch(`http://${SERVER_IP}:3000/tasks/${taskId._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...task, completed: newStatus }),
      })
        .then((response) => response.json())
        .then((data) => {
          setTask(data); // Update the task with new status
          setStatus(newStatus); // Update local status state
        })
        .catch((error) => {
          console.error('Error updating task status:', error);
          Alert.alert('Error', 'Failed to update task status.');
        });
    }
  };

  const updateTaskOffline = async (updatedTask) => {
    try {
      const offlineTasks = await getTasksFromStorage();
      const updatedOfflineTasks = offlineTasks.map(t => (t._id === updatedTask._id ? updatedTask : t));
      await saveTasksToStorage(updatedOfflineTasks);
      setTask(updatedTask);
      setStatus(updatedTask.completed);
    } catch (error) {
      console.error('Error updating task offline:', error);
      Alert.alert('Offline Mode', 'Failed to update task offline.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Task not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.description}>{task.description}</Text>
      <Text style={styles.status}>Status: {status ? 'Completed' : 'Pending'}</Text>
      <Pressable
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? 'rgb(210, 230, 255)' : 'rgb(255, 255, 255)',
            opacity: pressed ? 0.5 : 1,
          },
          styles.pressableButton
        ]}
        onPress={toggleStatus}
      >
        {({ pressed }) => (
          <Text style={styles.pressableText}>
            {status ? 'Mark as Pending' : 'Mark as Completed'}
          </Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#555',
  },
  status: {
    fontSize: 16,
    color: 'green',
    marginTop: 10,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  pressableButton: {
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    minWidth: 150,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  pressableText: {
    fontSize: 16,
    color: '#007AFF',
  },
});

export default TaskDetailScreen;
