import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import db from './src/server/db.ts';
import multer from 'multer';

// Dummy endpoints since real integration requests environment variables
// that need to be manually configured by the user.
async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(cors());
  app.use(express.json());

  const upload = multer({ storage: multer.memoryStorage() });

  // === AI API ===
  // GET: Dashboard Stats
  app.get('/api/stats', (req, res) => {
    try {
      const stats = db.prepare(`
        SELECT status, COUNT(*) as count 
        FROM tasks 
        GROUP BY status
      `).all();
      
      const workloads = db.prepare(`
        SELECT 
           tasks.picId, 
           users.name,
           COUNT(*) as tasksCount 
        FROM tasks 
        LEFT JOIN users ON users.id = tasks.picId 
        GROUP BY picId
      `).all();

      res.json({ stats, workloads });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET: Users
  app.get('/api/users', (req, res) => {
    try {
      const users = db.prepare('SELECT * FROM users').all();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET: Tasks
  app.get('/api/tasks', (req, res) => {
    try {
      const tasks = db.prepare(`
        SELECT tasks.*, users.name as picName 
        FROM tasks 
        LEFT JOIN users ON users.id = tasks.picId
        ORDER BY tasks.createdAt DESC
      `).all();
      
      // Fetch attachments & comments per task to be nested
      for(const task of tasks as any[]) {
        task.comments = db.prepare('SELECT * FROM comments WHERE taskId = ? ORDER BY createdAt ASC').all(task.id);
        task.attachments = db.prepare('SELECT * FROM attachments WHERE taskId = ?').all(task.id);
      }
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // CREATE: Task
  app.post('/api/tasks', (req, res) => {
    try {
      const { id, title, description, status, picId, milestone, dueDate } = req.body;
      const stmt = db.prepare(`
        INSERT INTO tasks (id, title, description, status, picId, milestone, dueDate)
        VALUES (@id, @title, @description, @status, @picId, @milestone, @dueDate)
      `);
      stmt.run({ id, title, description, status: status || 'not yet', picId, milestone, dueDate });
      res.status(201).json({ success: true, id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // UPDATE: Task
  app.put('/api/tasks/:id', (req, res) => {
    try {
      const { title, description, status, picId, milestone, dueDate } = req.body;
      const stmt = db.prepare(`
        UPDATE tasks 
        SET title = @title, description = @description, status = @status, picId = @picId, milestone = @milestone, dueDate = @dueDate
        WHERE id = @id
      `);
      stmt.run({ id: req.params.id, title, description, status, picId, milestone, dueDate });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE: Task
  app.delete('/api/tasks/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ADD COMMENT
  app.post('/api/tasks/:taskId/comments', (req, res) => {
    try {
      const { id, content, userId } = req.body;
      db.prepare(`
        INSERT INTO comments (id, taskId, userId, content) 
        VALUES (@id, @taskId, @userId, @content)
      `).run({ id, taskId: req.params.taskId, userId, content });
      res.status(201).json({ success: true });
    } catch(error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // UPLOAD FILE
  app.post('/api/tasks/:taskId/upload', upload.single('document'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
      // Mocked Google Drive upload response for preview
      const fakeUrl = 'https://drive.google.com/open?id=mock_' + Date.now();
      const attachId = 'att_' + Date.now();
      
      db.prepare(`
        INSERT INTO attachments (id, taskId, fileName, url)
        VALUES (@id, @taskId, @fileName, @url)
      `).run({ id: attachId, taskId: req.params.taskId, fileName: req.file.originalname, url: fakeUrl });

      res.status(201).json({ success: true, url: fakeUrl });
    } catch(error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port \${PORT}`);
  });
}

startServer();
