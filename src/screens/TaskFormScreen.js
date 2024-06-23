import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SERVER_IP } from '../common/config';
import { useNavigation } from '@react-navigation/native';


const TaskFormScreen = ({ route }) => {
  const { task, onSave } = route.params;
  const [title, setTitle] = useState(task ? task.title : '');
  const [description, setDescription] = useState(task ? task.description : '');
  const navigation = useNavigation();

  // Function to save or update task
  const saveOrUpdateTask = () => {
    const updatedTask = {
      title: title.trim(),
      description: description.trim(),
    };

    if (task) {
      // If task exists, update it
      updatedTask.id = task._id; // Ensure to include the task ID for update
      console.log(updatedTask.id,"updatedTask.id")
      updateTask(updatedTask);
    } else {
      // Otherwise, save a new task
      saveTask(updatedTask);
    }
  };

  // Function to save a new task
  const saveTask = (newTask) => {
    fetch(`http://${SERVER_IP}:3000/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTask),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to save task');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Task saved:', data);
        navigation.goBack(); // Navigate back after successful save
      })
      .catch((error) => {
        console.error('Error saving task:', error);
      });
  };

  // Function to update an existing task
  const updateTask = (updatedTask) => {
    fetch(`http://${SERVER_IP}:3000/tasks/${updatedTask.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedTask),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update task');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Task updated:', data);
        navigation.goBack(); // Navigate back after successful update
      })
      .catch((error) => {
        console.error('Error updating task:', error);
      });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={title}
        placeholder="Title"
        onChangeText={(text) => setTitle(text)}
      />
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={description}
        placeholder="Description"
        multiline
        onChangeText={(text) => setDescription(text)}
      />
      <TouchableOpacity onPress={saveOrUpdateTask}>
        <View style={styles.button}>
          <Text style={styles.buttonText}>{task ? 'Update' : 'Save'}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default TaskFormScreen;
