import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import fs from 'fs';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server, {
    cors: { origin: '*' }
  });

  const DB_PATH = './data/tasks.json';
  
  // Default tasks to show
  const defaultTasks = [
    { id: '1', title: 'Design the homepage layout', description: 'Create wireframes and mockups', status: 'DONE', order: 0 },
    { id: '2', title: 'Build the TaskCard component', description: 'Implement drag and drop functionality', status: 'DONE', order: 1 },
    { id: '3', title: 'Integrate API endpoints', description: 'Connect frontend to backend', status: 'IN_PROGRESS', order: 0 },
    { id: '4', title: 'Write unit tests', description: 'Ensure code quality', status: 'IN_PROGRESS', order: 1 },
    { id: '5', title: 'Deploy to production', description: 'Set up hosting and domains', status: 'TODO', order: 0 },
    { id: '6', title: 'Set up CI/CD pipeline', description: 'Automate testing and deployment', status: 'TODO', order: 1 },
  ];

  // Helper to read/write from local "DB"
  const getTasksFromDB = () => {
    try {
      if (fs.existsSync(DB_PATH)) {
        const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch(e) {}
    
    // If we reach here, no valid data exists. Write default tasks and return them.
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultTasks, null, 2));
    } catch(e) {}
    
    return [...defaultTasks];
  };
  
  const saveTasksToDB = (tasks) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(tasks, null, 2));
  };

  let currentTasks = getTasksFromDB();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send the current fully updated task list upon connection
    socket.emit('initTasks', currentTasks);

    // Initial broadcasting when tasks change
    socket.on('taskMoved', (data) => {
      // Find and update local array
      const taskIndex = currentTasks.findIndex(t => t.id === data.id);
      if (taskIndex !== -1) {
        const [task] = currentTasks.splice(taskIndex, 1);
        const updatedTask = { ...task, status: data.status };
        const columnTasks = currentTasks
          .filter(t => t.status === data.status)
          .sort((a, b) => a.order - b.order);
        columnTasks.splice(data.order, 0, updatedTask);
        columnTasks.forEach((t, i) => t.order = i);
        
        currentTasks = [...currentTasks.filter(t => t.status !== data.status), ...columnTasks];
        saveTasksToDB(currentTasks);
      }
      
      socket.broadcast.emit('taskMoved', data);
    });

    socket.on('taskAdded', (newTask) => {
      currentTasks.push(newTask);
      saveTasksToDB(currentTasks);
      socket.broadcast.emit('taskAdded', newTask);
    });

    socket.on('taskUpdated', (updatedTask) => {
      currentTasks = currentTasks.map(t => t.id === updatedTask.id ? updatedTask : t);
      saveTasksToDB(currentTasks);
      socket.broadcast.emit('taskUpdated', updatedTask);
    });

    socket.on('taskDeleted', (id) => {
      currentTasks = currentTasks.filter(t => t.id !== id);
      saveTasksToDB(currentTasks);
      socket.broadcast.emit('taskDeleted', id);
    });

    // Real-time user presence
    socket.on('userJoined', (user) => {
      socket.broadcast.emit('userJoined', user);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      socket.broadcast.emit('userLeft', socket.id);
    });
  });

  server.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
