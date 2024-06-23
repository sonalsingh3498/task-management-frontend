import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

const EditTaskScreen = ({ route, navigation }) => {
  const { task, onSave } = route.params;
  const [title, setTitle] = useState(task.title);

  const saveTask = () => {
    onSave({ ...task, title });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />
      <Button title="Save" onPress={saveTask} />
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
});

export default EditTaskScreen;
