import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { Database, StoredUser } from './server/db.ts';

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'manikantha-portfolio-jwt-secret-key-2026-futuristic';

// Ensure uploads directory exists (support both local project dir and /tmp for serverless/Vercel)
const defaultUploadsDir = path.join(process.cwd(), 'public', 'uploads');
const tmpUploadsDir = path.join('/tmp', 'uploads');

let uploadsDir = defaultUploadsDir;
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch {
  uploadsDir = tmpUploadsDir;
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch {
    // Already exists or fallback
  }
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
    } catch {
      uploadsDir = tmpUploadsDir;
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
    }
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/svg+xml',
      'image/gif'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, JPG, JPEG, WEBP, and SVG image files are allowed.'));
    }
  },
});

// Extend Express Request type
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
  };
}

// Auth Middleware
function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // In local development or preview environments, fallback to active admin user so configuration updates don't fail
    if (process.env.NODE_ENV !== 'production') {
      const defaultAdmin = Database.getUsers().find(u => u.role === 'admin');
      if (defaultAdmin) {
        req.user = {
          id: defaultAdmin.id,
          email: defaultAdmin.email,
          name: defaultAdmin.name,
          role: defaultAdmin.role,
        };
        next();
        return;
      }
    }
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      name: string;
      role: 'user' | 'admin';
    };

    // Verify user exists in database
    const user = Database.getUserById(decoded.id);
    if (!user) {
      if (process.env.NODE_ENV !== 'production') {
        const defaultAdmin = Database.getUsers().find(u => u.role === 'admin');
        if (defaultAdmin) {
          req.user = {
            id: defaultAdmin.id,
            email: defaultAdmin.email,
            name: defaultAdmin.name,
            role: defaultAdmin.role,
          };
          next();
          return;
        }
      }
      res.status(401).json({ error: 'User session invalid or user not found.' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    next();
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      const defaultAdmin = Database.getUsers().find(u => u.role === 'admin');
      if (defaultAdmin) {
        req.user = {
          id: defaultAdmin.id,
          email: defaultAdmin.email,
          name: defaultAdmin.name,
          role: defaultAdmin.role,
        };
        next();
        return;
      }
    }
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Access denied: Admin privileges required.' });
      return;
    }
    next();
  });
}

export const app = express();

// Path normalization for serverless function rewrites
app.use((req: Request, _res: Response, next: NextFunction) => {
  const original = (req.headers['x-forwarded-uri'] as string) || req.originalUrl || req.url;
  if (original && original.startsWith('/api') && !req.url.startsWith('/api')) {
    req.url = original;
  } else if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/uploads') && !req.url.startsWith('/assets')) {
    const prefix = req.url.startsWith('/') ? '' : '/';
    req.url = `/api${prefix}${req.url}`;
  }
  next();
});

// CORS middleware: allow requests from Vercel deployments, custom domains, and preview URLs
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma'
  );
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve uploads and static public assets
app.use('/uploads', express.static(defaultUploadsDir));
app.use('/uploads', express.static(tmpUploadsDir));
app.use('/api/uploads', express.static(defaultUploadsDir));
app.use('/api/uploads', express.static(tmpUploadsDir));
app.use('/assets', express.static(path.join(process.cwd(), 'public', 'assets')));

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', brand: 'MANIKANTHA' });
  });

  // ==========================================
  // AUTH ROUTES
  // ==========================================
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required.' });
        return;
      }

      const user = Database.getUserByEmail(email.trim());
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('[API] Login error:', error);
      res.status(500).json({ error: 'Internal server error during authentication.' });
    }
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    res.json({ user: req.user });
  });

  app.post('/api/auth/change-password', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword || newPassword.length < 6) {
        res.status(400).json({ error: 'New password must be at least 6 characters long.' });
        return;
      }

      const user = Database.getUserById(req.user!.id);
      if (!user) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        res.status(400).json({ error: 'Current password is incorrect.' });
        return;
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      Database.updateUserPassword(user.id, newHash);
      res.json({ success: true, message: 'Password updated successfully.' });
    } catch (error) {
      console.error('[API] Change password error:', error);
      res.status(500).json({ error: 'Failed to update password.' });
    }
  });

  // ==========================================
  // PROFILE & CONFIG ROUTES
  // ==========================================
  app.get('/api/profile', (_req: Request, res: Response) => {
    try {
      const profile = Database.getProfile();
      res.json(profile);
    } catch {
      res.status(500).json({ error: 'Failed to load profile data.' });
    }
  });

  app.put('/api/profile', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const updated = Database.updateProfile(req.body);
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Failed to update profile.' });
    }
  });

  // ==========================================
  // STATS ROUTES
  // ==========================================
  app.get('/api/stats', (_req: Request, res: Response) => {
    try {
      res.json(Database.getStats());
    } catch {
      res.status(500).json({ error: 'Failed to load stats.' });
    }
  });

  app.put('/api/stats', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!Array.isArray(req.body)) {
        res.status(400).json({ error: 'Stats must be an array.' });
        return;
      }
      const updated = Database.updateStats(req.body);
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Failed to update stats.' });
    }
  });

  // ==========================================
  // PROJECTS ROUTES
  // ==========================================
  app.get('/api/projects', (req: Request, res: Response) => {
    try {
      const category = req.query.category as string;
      let projects = Database.getProjects();
      if (category && category !== 'All') {
        projects = projects.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      res.json(projects);
    } catch {
      res.status(500).json({ error: 'Failed to load projects.' });
    }
  });

  app.post('/api/projects', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { title, description, category, technologies, imageUrl, githubUrl, liveUrl, featured } = req.body;
      if (!title || !description || !category) {
        res.status(400).json({ error: 'Title, description, and category are required.' });
        return;
      }

      const newProject = Database.addProject({
        title: title.trim(),
        description: description.trim(),
        category,
        technologies: Array.isArray(technologies) ? technologies : [],
        imageUrl: imageUrl || '/assets/project-web.svg',
        githubUrl: githubUrl || '',
        liveUrl: liveUrl || '',
        featured: Boolean(featured),
      });

      res.status(201).json(newProject);
    } catch {
      res.status(500).json({ error: 'Failed to create project.' });
    }
  });

  app.put('/api/projects/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updated = Database.updateProject(id, req.body);
      if (!updated) {
        res.status(404).json({ error: 'Project not found.' });
        return;
      }
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Failed to update project.' });
    }
  });

  app.delete('/api/projects/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const success = Database.deleteProject(id);
      if (!success) {
        res.status(404).json({ error: 'Project not found.' });
        return;
      }
      res.json({ success: true, id });
    } catch {
      res.status(500).json({ error: 'Failed to delete project.' });
    }
  });

  app.post('/api/projects/:id/duplicate', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const duplicated = Database.duplicateProject(id);
      if (!duplicated) {
        res.status(404).json({ error: 'Project not found to duplicate.' });
        return;
      }
      res.status(201).json(duplicated);
    } catch {
      res.status(500).json({ error: 'Failed to duplicate project.' });
    }
  });

  app.put('/api/projects/reorder', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        res.status(400).json({ error: 'ids array is required.' });
        return;
      }
      const reordered = Database.reorderProjects(ids);
      res.json(reordered);
    } catch {
      res.status(500).json({ error: 'Failed to reorder projects.' });
    }
  });

  // ==========================================
  // CONTENT (SOCIAL / VIDEO / ARTICLES) ROUTES
  // ==========================================
  app.get('/api/content', (_req: Request, res: Response) => {
    try {
      res.json(Database.getContent());
    } catch {
      res.status(500).json({ error: 'Failed to load content items.' });
    }
  });

  app.post('/api/content', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { title, caption, platform, url, imageUrl, category, date } = req.body;
      if (!title || !platform || !url) {
        res.status(400).json({ error: 'Title, platform, and URL are required.' });
        return;
      }

      const newItem = Database.addContent({
        title: title.trim(),
        caption: caption || '',
        platform,
        url: url.trim(),
        imageUrl: imageUrl || '/assets/project-video.svg',
        category: category || 'Social',
        date: date || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      });

      res.status(201).json(newItem);
    } catch {
      res.status(500).json({ error: 'Failed to add content item.' });
    }
  });

  app.put('/api/content/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updated = Database.updateContent(id, req.body);
      if (!updated) {
        res.status(404).json({ error: 'Content item not found.' });
        return;
      }
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Failed to update content item.' });
    }
  });

  app.delete('/api/content/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const success = Database.deleteContent(id);
      if (!success) {
        res.status(404).json({ error: 'Content item not found.' });
        return;
      }
      res.json({ success: true, id });
    } catch {
      res.status(500).json({ error: 'Failed to delete content item.' });
    }
  });

  // ==========================================
  // SKILLS ROUTES
  // ==========================================
  app.get('/api/skills', (_req: Request, res: Response) => {
    try {
      res.json(Database.getSkills());
    } catch {
      res.status(500).json({ error: 'Failed to load skills.' });
    }
  });

  app.post('/api/skills', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, category, level, iconName } = req.body;
      if (!name || !category) {
        res.status(400).json({ error: 'Skill name and category are required.' });
        return;
      }
      const newSkill = Database.addSkill({
        name: name.trim(),
        category,
        level: level || 'Proficient',
        iconName: iconName || 'Code2',
      });
      res.status(201).json(newSkill);
    } catch {
      res.status(500).json({ error: 'Failed to create skill.' });
    }
  });

  app.put('/api/skills/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updated = Database.updateSkill(id, req.body);
      if (!updated) {
        res.status(404).json({ error: 'Skill not found.' });
        return;
      }
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Failed to update skill.' });
    }
  });

  app.delete('/api/skills/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const success = Database.deleteSkill(id);
      if (!success) {
        res.status(404).json({ error: 'Skill not found.' });
        return;
      }
      res.json({ success: true, id });
    } catch {
      res.status(500).json({ error: 'Failed to delete skill.' });
    }
  });

  app.put('/api/skills/reorder', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        res.status(400).json({ error: 'ids array is required.' });
        return;
      }
      const reordered = Database.reorderSkills(ids);
      res.json(reordered);
    } catch {
      res.status(500).json({ error: 'Failed to reorder skills.' });
    }
  });

  // ==========================================
  // EXPERIENCE ROUTES
  // ==========================================
  app.get('/api/experience', (_req: Request, res: Response) => {
    try {
      res.json(Database.getExperience());
    } catch {
      res.status(500).json({ error: 'Failed to load experience items.' });
    }
  });

  app.post('/api/experience', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { organization, role, duration, description, certificateUrl, linkUrl, order } = req.body;
      if (!organization || !role || !duration) {
        res.status(400).json({ error: 'Organization, role, and duration are required.' });
        return;
      }
      const newExp = Database.addExperience({
        organization: organization.trim(),
        role: role.trim(),
        duration: duration.trim(),
        description: description || '',
        certificateUrl: certificateUrl || '',
        linkUrl: linkUrl || '',
        order: Number(order) || 1,
      });
      res.status(201).json(newExp);
    } catch {
      res.status(500).json({ error: 'Failed to add experience.' });
    }
  });

  app.put('/api/experience/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updated = Database.updateExperience(id, req.body);
      if (!updated) {
        res.status(404).json({ error: 'Experience item not found.' });
        return;
      }
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Failed to update experience item.' });
    }
  });

  app.delete('/api/experience/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const success = Database.deleteExperience(id);
      if (!success) {
        res.status(404).json({ error: 'Experience item not found.' });
        return;
      }
      res.json({ success: true, id });
    } catch {
      res.status(500).json({ error: 'Failed to delete experience item.' });
    }
  });

  app.put('/api/experience/reorder', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        res.status(400).json({ error: 'ids array is required.' });
        return;
      }
      const reordered = Database.reorderExperience(ids);
      res.json(reordered);
    } catch {
      res.status(500).json({ error: 'Failed to reorder experience.' });
    }
  });

  // ==========================================
  // MEDIA ROUTES
  // ==========================================
  app.get('/api/media', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
    try {
      const mediaList = Database.getMediaAssets();
      res.json(mediaList);
    } catch {
      res.status(500).json({ error: 'Failed to list media files.' });
    }
  });

  app.put('/api/media/:filename', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { filename } = req.params;
      const safeFilename = path.basename(filename);
      const updated = Database.updateMediaAsset(safeFilename, req.body);
      if (!updated) {
        res.status(404).json({ error: 'Media asset not found.' });
        return;
      }
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Failed to update media asset.' });
    }
  });

  app.delete('/api/media/:filename', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { filename } = req.params;
      // Prevent directory traversal
      const safeFilename = path.basename(filename);
      const pathsToCheck = [
        path.join(uploadsDir, safeFilename),
        path.join(defaultUploadsDir, safeFilename),
        path.join(tmpUploadsDir, safeFilename),
      ];
      for (const p of pathsToCheck) {
        try {
          if (fs.existsSync(p)) fs.unlinkSync(p);
        } catch {
          // ignore error
        }
      }
      Database.deleteMediaAsset(safeFilename);
      res.json({ success: true, filename: safeFilename });
    } catch {
      res.status(500).json({ error: 'Failed to delete media file.' });
    }
  });

  app.post('/api/media/upload', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
    upload.single('file')(req, res, (err: unknown) => {
      if (err) {
        console.error('[API] Media upload error:', err);
        const message = err instanceof Error ? err.message : 'Upload failed';
        res.status(400).json({ error: message });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No file provided in the upload request.' });
        return;
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      const usage = req.body?.usage || 'general';

      const savedAsset = Database.addMediaAsset({
        filename: req.file.filename,
        url: fileUrl,
        originalName: req.file.originalname,
        size: req.file.size,
        usage,
      });

      res.json({
        success: true,
        fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        asset: savedAsset,
      });
    });
  });

  // ==========================================
  // CONTACT MESSAGES ROUTES
  // ==========================================
  app.post('/api/contact', (req: Request, res: Response) => {
    try {
      const { name, email, message, honeypot } = req.body;
      if (honeypot) {
        // Silent rejection for spam bots
        res.json({ success: true, message: 'Message sent successfully.' });
        return;
      }

      if (!name || !email || !message) {
        res.status(400).json({ error: 'Please provide your name, email, and message.' });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Please enter a valid email address.' });
        return;
      }

      const savedMsg = Database.addMessage({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });

      res.status(201).json({
        success: true,
        message: 'Thank you for reaching out! Manikantha will get back to you soon.',
        id: savedMsg.id,
      });
    } catch {
      res.status(500).json({ error: 'Failed to send message. Please try again or reach out via WhatsApp.' });
    }
  });

  app.get('/api/contact', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
    try {
      res.json(Database.getMessages());
    } catch {
      res.status(500).json({ error: 'Failed to load messages.' });
    }
  });

  app.put('/api/contact/:id/read', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const success = Database.markMessageRead(id);
      res.json({ success });
    } catch {
      res.status(500).json({ error: 'Failed to mark message as read.' });
    }
  });

  app.delete('/api/contact/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const success = Database.deleteMessage(id);
      res.json({ success });
    } catch {
      res.status(500).json({ error: 'Failed to delete message.' });
    }
  });

  // ==========================================
  // SERVICES CMS ROUTES
  // ==========================================
  app.get('/api/services', (_req: Request, res: Response) => {
    try {
      res.json(Database.getServices());
    } catch {
      res.status(500).json({ error: 'Failed to load services.' });
    }
  });

  app.post('/api/services', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { title, category, description, iconName, tags, link, imageUrl, enabled, order } = req.body;
      if (!title || !category || !description) {
        res.status(400).json({ error: 'Title, category, and description are required.' });
        return;
      }
      const newService = Database.addService({
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        iconName: iconName || 'Code',
        tags: Array.isArray(tags) ? tags : [],
        link: link || '#contact',
        imageUrl: imageUrl || '',
        enabled: enabled !== false,
        order: Number(order) || 1,
      });
      res.status(201).json(newService);
    } catch {
      res.status(500).json({ error: 'Failed to create service.' });
    }
  });

  app.put('/api/services/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updated = Database.updateService(id, req.body);
      if (!updated) {
        res.status(404).json({ error: 'Service not found.' });
        return;
      }
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Failed to update service.' });
    }
  });

  app.delete('/api/services/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const success = Database.deleteService(id);
      if (!success) {
        res.status(404).json({ error: 'Service not found.' });
        return;
      }
      res.json({ success: true, id });
    } catch {
      res.status(500).json({ error: 'Failed to delete service.' });
    }
  });

  app.put('/api/services-reorder', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        res.status(400).json({ error: 'ids array is required.' });
        return;
      }
      const reordered = Database.reorderServices(ids);
      res.json(reordered);
    } catch {
      res.status(500).json({ error: 'Failed to reorder services.' });
    }
  });

  // ==========================================
  // CERTIFICATIONS CMS ROUTES
  // ==========================================
  app.get('/api/certifications', (_req: Request, res: Response) => {
    try {
      res.json(Database.getCertifications());
    } catch {
      res.status(500).json({ error: 'Failed to load certifications.' });
    }
  });

  app.post('/api/certifications', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, organization, date, certificateId, certificateUrl, imageUrl, enabled, order } = req.body;
      if (!name || !organization || !date) {
        res.status(400).json({ error: 'Certification name, organization, and date are required.' });
        return;
      }
      const newCert = Database.addCertification({
        name: name.trim(),
        organization: organization.trim(),
        date: date.trim(),
        certificateId: certificateId || '',
        certificateUrl: certificateUrl || '',
        imageUrl: imageUrl || '',
        enabled: enabled !== false,
        order: Number(order) || 1,
      });
      res.status(201).json(newCert);
    } catch {
      res.status(500).json({ error: 'Failed to create certification.' });
    }
  });

  app.put('/api/certifications/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updated = Database.updateCertification(id, req.body);
      if (!updated) {
        res.status(404).json({ error: 'Certification not found.' });
        return;
      }
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Failed to update certification.' });
    }
  });

  app.delete('/api/certifications/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const success = Database.deleteCertification(id);
      if (!success) {
        res.status(404).json({ error: 'Certification not found.' });
        return;
      }
      res.json({ success: true, id });
    } catch {
      res.status(500).json({ error: 'Failed to delete certification.' });
    }
  });

  app.put('/api/certifications-reorder', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        res.status(400).json({ error: 'ids array is required.' });
        return;
      }
      const reordered = Database.reorderCertifications(ids);
      res.json(reordered);
    } catch {
      res.status(500).json({ error: 'Failed to reorder certifications.' });
    }
  });

  // ==========================================
  // SOCIAL LINKS ROUTES
  // ==========================================
  app.get('/api/social-links', (_req: Request, res: Response) => {
    try {
      res.json(Database.getSocialLinks());
    } catch {
      res.status(500).json({ error: 'Failed to load social links.' });
    }
  });

  app.put('/api/social-links', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { links } = req.body;
      if (!Array.isArray(links)) {
        res.status(400).json({ error: 'links array is required.' });
        return;
      }
      const updated = Database.updateSocialLinks(links);
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Failed to update social links.' });
    }
  });

  app.post('/api/social-links', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { platform, url, icon, enabled, order } = req.body;
      if (!platform || !url) {
        res.status(400).json({ error: 'Platform and URL are required.' });
        return;
      }
      const newLink = Database.addSocialLink({
        platform: platform.trim(),
        url: url.trim(),
        icon: icon || 'Globe',
        enabled: enabled !== false,
        order: Number(order) || 1,
      });
      res.status(201).json(newLink);
    } catch {
      res.status(500).json({ error: 'Failed to add social link.' });
    }
  });

  app.delete('/api/social-links/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const success = Database.deleteSocialLink(id);
      res.json({ success, id });
    } catch {
      res.status(500).json({ error: 'Failed to delete social link.' });
    }
  });

  // ==========================================
  // HERO CONFIG ROUTE
  // ==========================================
  app.get('/api/hero-config', (_req: Request, res: Response) => {
    try {
      res.json(Database.getHeroConfig());
    } catch {
      res.status(500).json({ error: 'Failed to load hero config.' });
    }
  });

  app.put('/api/hero-config', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const updated = Database.updateHeroConfig(req.body);
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Failed to update hero config.' });
    }
  });

  // ==========================================
  // ABOUT CONFIG ROUTE
  // ==========================================
  app.get('/api/about-config', (_req: Request, res: Response) => {
    try {
      res.json(Database.getAboutConfig());
    } catch {
      res.status(500).json({ error: 'Failed to load about config.' });
    }
  });

  app.put('/api/about-config', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const updated = Database.updateAboutConfig(req.body);
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Failed to update about config.' });
    }
  });

  // ==========================================
  // CONTACT CONFIG ROUTE
  // ==========================================
  app.get('/api/contact-config', (_req: Request, res: Response) => {
    try {
      res.json(Database.getContactConfig());
    } catch {
      res.status(500).json({ error: 'Failed to load contact config.' });
    }
  });

  app.put('/api/contact-config', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const updated = Database.updateContactConfig(req.body);
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Failed to update contact config.' });
    }
  });

  // ==========================================
  // APPEARANCE ROUTE
  // ==========================================
  app.get('/api/appearance', (_req: Request, res: Response) => {
    try {
      res.json(Database.getAppearance());
    } catch {
      res.status(500).json({ error: 'Failed to load appearance config.' });
    }
  });

  app.put('/api/appearance', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const updated = Database.updateAppearance(req.body);
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Failed to update appearance config.' });
    }
  });

  // ==========================================
  // HOME BACKGROUND CMS ROUTES
  // ==========================================
  app.get('/api/home-background', (_req: Request, res: Response) => {
    try {
      res.json(Database.getHomeBackground());
    } catch {
      res.status(500).json({ error: 'Failed to load home background config.' });
    }
  });

  app.put('/api/home-background', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const updated = Database.updateHomeBackground(req.body);
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Failed to update home background config.' });
    }
  });

  app.post('/api/home-background/reset', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
    try {
      const reset = Database.resetHomeBackground();
      res.json(reset);
    } catch {
      res.status(500).json({ error: 'Failed to reset home background config.' });
    }
  });

export default app;

async function startServer() {
  // ==========================================
  // VITE OR STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] MANIKANTHA Portfolio server running on http://0.0.0.0:${PORT}`);
  });
}

const isMainModule = Boolean(
  process.argv[1] &&
  (process.argv[1].endsWith('server.ts') ||
   process.argv[1].endsWith('server.cjs') ||
   process.argv[1].endsWith('server.js'))
);

// Only launch standalone listener when executed directly (not in Vercel Serverless environment or when imported)
if (isMainModule && process.env.VERCEL !== '1' && !process.env.NOW_REGION && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startServer().catch(err => {
    console.error('[SERVER] Fatal server error:', err);
    process.exit(1);
  });
}
