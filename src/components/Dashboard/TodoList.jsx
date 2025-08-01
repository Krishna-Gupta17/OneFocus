import React, { useState, useEffect, useRef } from 'react';
import { PlusIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { gsap } from 'gsap';

const TodoList = ({ tasks = [], onUpdateTasks }) => {
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('medium');
  const listRef = useRef(null);

  useEffect(() => {
    // Animate list items
    gsap.fromTo(
      listRef.current?.children || [],
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, stagger: 0.1 }
    );
  }, [tasks]);

  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now().toString(),
        title: newTask,
        completed: false,
        priority,
        createdAt: new Date()
      };
      
      onUpdateTasks([...tasks, task]);
      setNewTask('');
      
      // Animate new task addition
      setTimeout(() => {
        const newTaskElement = listRef.current?.lastElementChild;
        if (newTaskElement) {
          gsap.fromTo(newTaskElement,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
          );
        }
      }, 0);
    }
  };

  const toggleTask = (id) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    onUpdateTasks(updatedTasks);
  };

  const deleteTask = (id) => {
    const taskElement = document.querySelector(`[data-task-id="${id}"]`);
    if (taskElement) {
      gsap.to(taskElement, {
        x: 100,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          const updatedTasks = tasks.filter(task => task.id !== id);
          onUpdateTasks(updatedTasks);
        }
      });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-green-500 bg-green-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="backdrop-blur-lg bg-white/10 p-6 rounded-2xl border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Study Tasks</h3>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
        />
        
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="low" className="bg-gray-800">Low</option>
          <option value="medium" className="bg-gray-800">Medium</option>
          <option value="high" className="bg-gray-800">High</option>
        </select>
        
        <button
          onClick={addTask}
          className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transform hover:scale-110 transition-all duration-200"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>

      <div ref={listRef} className="space-y-3 max-h-64 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-white/60 text-center py-8">No tasks yet. Add one above!</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              data-task-id={task.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${getPriorityColor(task.priority)} transition-all duration-200 hover:scale-[1.02]`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  task.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-white/30 hover:border-green-500'
                }`}
              >
                {task.completed && <CheckIcon className="w-4 h-4 text-white" />}
              </button>
              
              <span
                className={`flex-1 text-white ${
                  task.completed ? 'line-through opacity-60' : ''
                }`}
              >
                {task.title}
              </span>
              
              <span className={`text-xs px-2 py-1 rounded-full ${
                task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-green-500/20 text-green-300'
              }`}>
                {task.priority}
              </span>
              
              <button
                onClick={() => deleteTask(task.id)}
                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-all duration-200"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-sm text-white/60">
        Total: {tasks.length} | Completed: {tasks.filter(t => t.completed).length}
      </div>
    </div>
  );
};

export default TodoList;