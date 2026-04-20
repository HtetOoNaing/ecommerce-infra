import { EventEmitter } from 'events';

interface MetricPoint {
  timestamp: number;
  value: number;
}

interface SystemHealth {
  status: string;
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
  cpu: {
    user: number;
    system: number;
  };
  uptime: number;
  eventLoopLag: number;
}

export class MonitoringService extends EventEmitter {
  private metrics: Map<string, MetricPoint[]> = new Map();
  
  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const points = this.metrics.get(name)!;
    points.push({ timestamp: Date.now(), value });
    
    // Keep last 1000 points
    if (points.length > 1000) {
      points.shift();
    }
    
    // Emit for real-time monitoring
    this.emit('metric', { name, value, timestamp: Date.now() });
  }
  
  getMetricStats(name: string) {
    const points = this.metrics.get(name) || [];
    if (points.length === 0) return null;
    
    const values = points.map(p => p.value);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      latest: values[values.length - 1],
      count: values.length,
    };
  }
  
  async checkSystemHealth(): Promise<SystemHealth> {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      status: 'healthy',
      memory: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        rss: memoryUsage.rss,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      uptime: process.uptime(),
      eventLoopLag: await this.measureEventLoopLag(),
    };
  }
  
  private async measureEventLoopLag(): Promise<number> {
    const start = Date.now();
    await new Promise(resolve => setImmediate(resolve));
    return Date.now() - start;
  }
}