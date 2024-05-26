import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/fetchListing`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTask = { title, description, status };
    fetch(`${process.env.REACT_APP_API_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTask),
    })
    .then(response => response.json())
    .then(data => {
      setTasks([...tasks, { ...newTask, _id: data.taskId }]);
      setTitle('');
      setDescription('');
      setStatus('To Do');
    })
    .catch(error => console.error('Error adding task:', error));
  };

  const handleStatusChange = (title) => {
    const task = tasks.find(t => t.title === title);
    const newStatus = task.status === 'To Do' ? 'In Progress' : task.status === 'In Progress' ? 'Done' : 'To Do';
    fetch(`${process.env.REACT_APP_API_URL}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: task.title, status: newStatus }),
    })
    .then(response => response.json())
    .then(() => {
      const updatedTasks = tasks.map(t => t.title === title ? { ...t, status: newStatus } : t);
      setTasks(updatedTasks);
    })
    .catch(error => console.error('Error updating task:', error));
  };

  const handleDelete = (title) => {
    fetch(`${process.env.REACT_APP_API_URL}/delete/${title}`, {
      method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
      if (data.msg === "Task deleted successfully") {
        const updatedTasks = tasks.filter(t => t.title !== title);
        setTasks(updatedTasks);
      } else {
        console.error('Error deleting task:', data.msg);
      }
    })
    .catch(error => console.error('Error deleting task:', error));
  };
  

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(task => task.status === filter);

  return (
    <div className="container">
      <h1>Task Management App</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required></textarea>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <button type="submit">Add Task</button>
      </form>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="To Do">To Do</option>
        <option value="In Progress">In Progress</option>
        <option value="Done">Done</option>
      </select>
      <div>
        {filteredTasks.map((task) => (
          <div key={task._id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Status: {task.status}</p>
            <button onClick={() => handleStatusChange(task.title)}>Change Status</button>
            <button onClick={() => handleDelete(task._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
