import React, { useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome icons from Expo
import { SERVER_IP } from '../common/config';

const TaskItem = ({ task, onEdit, onDelete }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false); // State for view modal
  const [status, setStatus] = useState(task.completed); // Initialize status with task completed status
  const [offlineMode, setOfflineMode] = useState(false); // Assume an offline mode flag
  const [taskData, setTaskData] = useState(task); // Initialize task data
console.log(task,"task")
  const openViewModal = () => {
    setViewModalVisible(true);
  };

  const closeViewModal = () => {
    setViewModalVisible(false);
  };

  const confirmDelete = () => {
    onDelete(task._id);
    setModalVisible(false);
  };

  const handleEdit = () => {
    onEdit(task); // Directly invoke onEdit here if needed
    closeViewModal(); // Close the view modal
    // Optionally, you can navigate to TaskForm screen after closing view modal
    // navigation.navigate('TaskForm', { taskId: task._id });
  };

  const toggleStatus = () => {
    const newStatus = !status; // Toggle the status (true <-> false)
    if (offlineMode) {
      // Update task locally in offline mode
      const updatedTask = { ...taskData, completed: newStatus };
      updateTaskOffline(updatedTask);
    } else {
      console.log(task._id, "task._id")
      // Update task on the server and then update locally
      fetch(`http://${SERVER_IP}:3000/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...taskData, completed: newStatus }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          setTaskData(data); // Update the task with new status
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
      setTaskData(updatedTask);
      setStatus(updatedTask.completed);
    } catch (error) {
      console.error('Error updating task offline:', error);
      Alert.alert('Offline Mode', 'Failed to update task offline.');
    }
  };

  return (
    <View style={styles.taskContainer} key={task._id}>
      <View style={styles.taskInfo} >
        <Text style={styles.taskTitle} >{task.title}</Text>
        <Text style={styles.taskDescription}>{task.description}</Text>
      </View>
      <View style={styles.buttonContainer} key={task._id} >
        <Pressable style={styles.button} onPress={openViewModal} role="button">
          <FontAwesome name="eye" size={20} color="white" />
        </Pressable>
        <Pressable style={styles.button} onPress={() => onEdit(task)} role="button">
          <FontAwesome name="edit" size={20} color="white" />
        </Pressable>
        <Pressable style={[styles.button, styles.buttonDelete]} onPress={() => setModalVisible(true)} role="button">
          <FontAwesome name="trash" size={20} color="white" />
        </Pressable>
      </View>

      {/* View Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={viewModalVisible}
        onRequestClose={closeViewModal}
       
      >
        <View style={styles.modalContainer}  key={task.title}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{task.title}</Text>
            <Text style={styles.modalDescription}>{task.description}</Text>
            <Text style={styles.modalStatus}>Status: {status ? 'Completed' : 'Pending'}</Text>
            <View style={styles.modalButtonRow}>
              <Pressable style={styles.iconButton} onPress={handleEdit}>
                <Text style={styles.buttonText}>Edit</Text>
              </Pressable>
              <Pressable style={styles.iconButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.buttonText}>Delete</Text>
              </Pressable>
            </View>
            <Pressable style={styles.iconButton} onPress={toggleStatus}>
              <Text style={styles.buttonText}>
                {status ? 'Mark as Pending' : 'Mark as Completed'}
              </Text>
            </Pressable>
            <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={closeViewModal}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Are you sure you want to delete this task?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonDelete]}
                onPress={confirmDelete}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  taskInfo: {
    flex: 1,
    pointerEvents: 'none',
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskDescription: {
    fontSize: 14,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    pointerEvents: 'none',
    // marginTop: 5,
  },
  button: {
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
    backgroundColor: '#007AFF',
  },
  buttonDelete: {
    backgroundColor: '#ff0000',
  },
  buttonCancel: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  modalStatus: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 20,
  },
  iconButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginBottom: 10,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
    marginBottom: 10,
  },
});

export default TaskItem;
