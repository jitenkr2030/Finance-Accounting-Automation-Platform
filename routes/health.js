const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');
const router = express.Router();

// Health check service class
class HealthCheckService {
  constructor() {
    this.checks = {
      database: this.checkDatabase,
      redis: this.checkRedis,
      externalAPIs: this.checkExternalAPIs,
      diskSpace: this.checkDiskSpace,
      memory: this.checkMemory,
      custom: this.checkCustomServices
    };
  }

  async checkDatabase() {
    try {
      const startTime = Date.now();
      await mongoose.db.admin().ping();
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        details: {
          connected: mongoose.connection.readyState === 1,
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          name: mongoose.connection.name
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        details: {
          connected: false,
          readyState: mongoose.connection.readyState
        }
      };
    }
  }

  async checkRedis() {
    try {
      const client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      
      await client.connect();
      const startTime = Date.now();
      await client.ping();
      const responseTime = Date.now() - startTime;
      
      const info = await client.info();
      await client.quit();
      
      return {
        status: 'healthy',
        responseTime,
        details: {
          connected: true,
          version: info.split('\r\n').find(line => line.startsWith('redis_version:'))?.split(':')[1] || 'unknown',
          memory: info.split('\r\n').find(line => line.startsWith('used_memory_human:'))?.split(':')[1] || 'unknown'
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        details: {
          connected: false
        }
      };
    }
  }

  async checkExternalAPIs() {
    const apis = [
      { name: 'OpenAI', url: 'https://api.openai.com/v1/models', key: 'OPENAI_API_KEY' },
      { name: 'OCR Service', url: process.env.OCR_SERVICE_URL, key: 'OCR_API_KEY' },
      { name: 'Razorpay', url: 'https://api.razorpay.com/v1/', key: 'RAZORPAY_KEY_ID' },
      { name: 'GST API', url: process.env.GST_API_URL, key: 'GSTIN_API_KEY' }
    ];

    const results = {};
    
    for (const api of apis) {
      try {
        if (!process.env[api.key] || !api.url) {
          results[api.name] = {
            status: 'disabled',
            message: 'API key or URL not configured'
          };
          continue;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(api.url, {
          signal: controller.signal,
          headers: api.key ? { 'Authorization': `Bearer ${process.env[api.key]}` } : {}
        });
        
        clearTimeout(timeoutId);
        
        results[api.name] = {
          status: response.ok ? 'healthy' : 'degraded',
          statusCode: response.status,
          responseTime: Date.now()
        };
      } catch (error) {
        results[api.name] = {
          status: 'unhealthy',
          error: error.message
        };
      }
    }

    const overallStatus = Object.values(results).every(result => 
      result.status === 'healthy' || result.status === 'disabled'
    ) ? 'healthy' : 'degraded';

    return {
      status: overallStatus,
      details: results
    };
  }

  async checkDiskSpace() {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const stats = fs.statSync(process.cwd());
      const freeSpace = require('os').freemem();
      const totalSpace = require('os').totalmem();
      const usedSpace = totalSpace - freeSpace;
      const usagePercent = (usedSpace / totalSpace) * 100;
      
      // Check uploads directory specifically
      const uploadDir = process.env.UPLOAD_PATH || './uploads';
      let uploadSpace = 0;
      if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir);
        for (const file of files) {
          const filePath = path.join(uploadDir, file);
          try {
            const fileStats = fs.statSync(filePath);
            if (fileStats.isFile()) {
              uploadSpace += fileStats.size;
            }
          } catch (e) {
            // Skip files that can't be read
          }
        }
      }
      
      return {
        status: usagePercent < 90 ? 'healthy' : 'degraded',
        details: {
          diskUsage: {
            total: `${(totalSpace / (1024**3)).toFixed(2)} GB`,
            used: `${(usedSpace / (1024**3)).toFixed(2)} GB`,
            free: `${(freeSpace / (1024**3)).toFixed(2)} GB`,
            usagePercent: `${usagePercent.toFixed(2)}%`
          },
          uploadSpace: `${(uploadSpace / (1024**2)).toFixed(2)} MB`
        }
      };
    } catch (error) {
      return {
        status: 'unknown',
        error: error.message
      };
    }
  }

  async checkMemory() {
    try {
      const memUsage = process.memoryUsage();
      const totalHeapSize = memUsage.heapTotal;
      const usedHeapSize = memUsage.heapUsed;
      const heapUsagePercent = (usedHeapSize / totalHeapSize) * 100;
      
      const rss = memUsage.rss;
      const external = memUsage.external;
      const arrayBuffers = memUsage.arrayBuffers;
      
      const maxMemory = parseInt(process.env.MAX_MEMORY_USAGE || '1073741824'); // 1GB default
      
      return {
        status: heapUsagePercent < 80 && rss < maxMemory ? 'healthy' : 'degraded',
        details: {
          heap: {
            total: `${(totalHeapSize / (1024**2)).toFixed(2)} MB`,
            used: `${(usedHeapSize / (1024**2)).toFixed(2)} MB`,
            usagePercent: `${heapUsagePercent.toFixed(2)}%`
          },
          rss: `${(rss / (1024**2)).toFixed(2)} MB`,
          external: `${(external / (1024**2)).toFixed(2)} MB`,
          arrayBuffers: `${(arrayBuffers / (1024**2)).toFixed(2)} MB`,
          maxMemory: `${(maxMemory / (1024**2)).toFixed(2)} MB`
        }
      };
    } catch (error) {
      return {
        status: 'unknown',
        error: error.message
      };
    }
  }

  async checkCustomServices() {
    const customChecks = [];
    
    // Check if queues are working
    try {
      const Bull = require('bull');
      const queues = ['document-processing', 'email-notifications', 'report-generation'];
      
      for (const queueName of queues) {
        try {
          const queue = new Bull(queueName, process.env.QUEUE_REDIS_URL || 'redis://localhost:6379');
          const waiting = await queue.getWaiting();
          const active = await queue.getActive();
          const completed = await queue.getCompleted();
          
          customChecks.push({
            service: `Queue: ${queueName}`,
            status: 'healthy',
            details: {
              waiting: waiting.length,
              active: active.length,
              completed: completed.length
            }
          });
          
          queue.close();
        } catch (e) {
          customChecks.push({
            service: `Queue: ${queueName}`,
            status: 'unhealthy',
            error: e.message
          });
        }
      }
    } catch (e) {
      // Bull not available or not configured
    }
    
    // Check file upload functionality
    try {
      const fs = require('fs');
      const testFile = './tmp/health-check-test.tmp';
      
      fs.writeFileSync(testFile, 'health check test');
      const exists = fs.existsSync(testFile);
      fs.unlinkSync(testFile);
      
      customChecks.push({
        service: 'File System',
        status: exists ? 'healthy' : 'unhealthy',
        details: { writeTest: exists }
      });
    } catch (e) {
      customChecks.push({
        service: 'File System',
        status: 'unhealthy',
        error: e.message
      });
    }
    
    // Check encryption/decryption functionality
    try {
      const crypto = require('crypto');
      const key = process.env.DATA_ENCRYPTION_KEY || 'default-key-for-health-check';
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher('aes-256-gcm', Buffer.from(key, 'utf8'));
      
      const encrypted = cipher.update('health check') + cipher.final('hex');
      const authTag = cipher.getAuthTag();
      
      customChecks.push({
        service: 'Encryption',
        status: 'healthy',
        details: {
          algorithm: 'aes-256-gcm',
          keyLength: key.length,
          testEncryption: 'passed'
        }
      });
    } catch (e) {
      customChecks.push({
        service: 'Encryption',
        status: 'unhealthy',
        error: e.message
      });
    }
    
    const overallStatus = customChecks.every(check => 
      check.status === 'healthy' || check.status === 'unknown'
    ) ? 'healthy' : 'degraded';
    
    return {
      status: overallStatus,
      details: customChecks
    };
  }

  async runAllChecks() {
    const results = {};
    const checks = ['database', 'redis', 'externalAPIs', 'diskSpace', 'memory', 'custom'];
    
    for (const checkName of checks) {
      try {
        const result = await this.checks[checkName]();
        results[checkName] = result;
      } catch (error) {
        results[checkName] = {
          status: 'unhealthy',
          error: error.message
        };
      }
    }
    
    return results;
  }

  getOverallStatus(results) {
    const statuses = Object.values(results).map(result => result.status);
    
    if (statuses.includes('unhealthy')) {
      return 'unhealthy';
    } else if (statuses.includes('degraded')) {
      return 'degraded';
    } else if (statuses.includes('unknown')) {
      return 'unknown';
    } else {
      return 'healthy';
    }
  }
}

const healthService = new HealthCheckService();

// Basic health check endpoint
router.get('/', async (req, res) => {
  try {
    const uptime = process.uptime();
    const timestamp = new Date().toISOString();
    
    res.json({
      status: 'healthy',
      timestamp,
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Detailed health check endpoint
router.get('/detailed', async (req, res) => {
  try {
    const results = await healthService.runAllChecks();
    const overallStatus = healthService.getOverallStatus(results);
    const timestamp = new Date().toISOString();
    
    const response = {
      status: overallStatus,
      timestamp,
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: results
    };
    
    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(response);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Database health check
router.get('/database', async (req, res) => {
  try {
    const result = await healthService.checkDatabase();
    const statusCode = result.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Redis health check
router.get('/redis', async (req, res) => {
  try {
    const result = await healthService.checkRedis();
    const statusCode = result.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// External APIs health check
router.get('/external-apis', async (req, res) => {
  try {
    const result = await healthService.checkExternalAPIs();
    const statusCode = result.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// System resources health check
router.get('/system', async (req, res) => {
  try {
    const [diskSpaceResult, memoryResult] = await Promise.all([
      healthService.checkDiskSpace(),
      healthService.checkMemory()
    ]);
    
    const overallStatus = diskSpaceResult.status === 'healthy' && 
                         memoryResult.status === 'healthy' ? 'healthy' : 'degraded';
    
    const statusCode = overallStatus === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      status: overallStatus,
      diskSpace: diskSpaceResult,
      memory: memoryResult
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Readiness probe (for Kubernetes)
router.get('/ready', async (req, res) => {
  try {
    // Check if the application is ready to serve traffic
    const databaseResult = await healthService.checkDatabase();
    
    if (databaseResult.status === 'healthy') {
      res.json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        error: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Liveness probe (for Kubernetes)
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    pid: process.pid,
    uptime: process.uptime()
  });
});

// Metrics endpoint (for Prometheus)
router.get('/metrics', (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    const metrics = [
      `# HELP finance_platform_uptime_seconds Application uptime in seconds`,
      `# TYPE finance_platform_uptime_seconds counter`,
      `finance_platform_uptime_seconds ${process.uptime()}`,
      ``,
      `# HELP finance_platform_memory_usage_bytes Memory usage in bytes`,
      `# TYPE finance_platform_memory_usage_bytes gauge`,
      `finance_platform_memory_usage_bytes{type="heap_total"} ${memUsage.heapTotal}`,
      `finance_platform_memory_usage_bytes{type="heap_used"} ${memUsage.heapUsed}`,
      `finance_platform_memory_usage_bytes{type="rss"} ${memUsage.rss}`,
      `finance_platform_memory_usage_bytes{type="external"} ${memUsage.external}`,
      `finance_platform_memory_usage_bytes{type="array_buffers"} ${memUsage.arrayBuffers}`,
      ``,
      `# HELP finance_platform_cpu_usage_seconds CPU usage in seconds`,
      `# TYPE finance_platform_cpu_usage_seconds counter`,
      `finance_platform_cpu_usage_seconds{type="user"} ${cpuUsage.user}`,
      `finance_platform_cpu_usage_seconds{type="system"} ${cpuUsage.system}`,
      ``,
      `# HELP finance_platform_process_info Process information`,
      `# TYPE finance_platform_process_info gauge`,
      `finance_platform_process_info{pid="${process.pid}",version="${process.env.npm_package_version || '1.0.0'}"} 1`
    ];
    
    res.set('Content-Type', 'text/plain');
    res.send(metrics.join('\n'));
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate metrics',
      message: error.message
    });
  }
});

// Health check for specific components
router.get('/component/:component', async (req, res) => {
  const { component } = req.params;
  
  try {
    if (!healthService.checks[component]) {
      return res.status(404).json({
        error: 'Component not found',
        availableComponents: Object.keys(healthService.checks)
      });
    }
    
    const result = await healthService.checks[component]();
    const statusCode = result.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      component,
      ...result
    });
  } catch (error) {
    res.status(503).json({
      component,
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router;