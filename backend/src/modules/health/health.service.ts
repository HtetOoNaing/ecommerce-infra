import { sequelize } from '@/config/db';
import { redisService } from '@/services/redis.service';

export class HealthService {
  async checkHealth() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: 'unknown',
        redis: 'unknown',
      },
    };

    // Check database
    try {
      await sequelize.authenticate();
      health.services.database = 'healthy';
    } catch (error) {
      health.status = 'unhealthy';
      health.services.database = 'unhealthy';
    }

    // Check Redis
    try {
      await redisService.ping();
      health.services.redis = 'healthy';
    } catch (error) {
      health.status = 'unhealthy';
      health.services.redis = 'unhealthy';
    }

    return health;

  }
}