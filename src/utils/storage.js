// utils/storage.js

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@tasks';

// Function to retrieve tasks from AsyncStorage
export const getTasksFromStorage = async () => {
  try {
    const tasksJSON = await AsyncStorage.getItem(STORAGE_KEY);
    console.log(tasksJSON,"tasksJSON")
    return tasksJSON ? JSON.parse(tasksJSON) : [];
  } catch (error) {
    console.error('Error getting tasks from AsyncStorage:', error);
    return [];
  }
};

// Function to save tasks to AsyncStorage
export const saveTasksToStorage = async (tasks) => {
  try {
    const tasksJSON = JSON.stringify(tasks);
    await AsyncStorage.setItem(STORAGE_KEY, tasksJSON);
  } catch (error) {
    console.error('Error saving tasks to AsyncStorage:', error);
  }
};

// Function to clear tasks from AsyncStorage (optional)
export const clearTasksFromStorage = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing tasks from AsyncStorage:', error);
  }
};
