export default () => ({
  port:
    parseInt(process.env.APP_PORT ?? '3000', 10) ||
    parseInt(process.env.PORT ?? '3000', 10) ||
    3500,
  nodeEnv:
    process.env.ENVIRONMENT ??
    process.env.NODE_ENV ??
    process.env.BACKEND_ENV ??
    'development',

  cors: {
    origin:
      process.env.CORS_ORIGIN_URL ??
      process.env.CORS_ORIGIN ??
      process.env.FRONTEND_URL ??
      '*',
  },

  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    username: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    name: process.env.DB_DATABASE ?? process.env.DB_NAME ?? 'test',
    connectionName: process.env.DB_CONNECTION_NAME ?? 'default',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING !== 'false',
    logger: process.env.DB_LOGGER ?? 'advanced-console',
    maxQueryExecutionTime: parseInt(
      process.env.DB_MAX_QUERY_EXECUTION_TIME ?? '1000',
      10,
    ),
    connectionLimit: parseInt(
      process.env.DB_CONNECTION_LIMIT ?? '10',
      10,
    ),
    acquireTimeout: parseInt(
      process.env.DB_ACQUIRE_TIMEOUT ?? '60000',
      10,
    ),
    timeout: parseInt(process.env.DB_TIMEOUT ?? '60000', 10),
    debug: false,
    ssl: {
      ca: process.env.DB_SSL_CA ?? '',
      cert: process.env.DB_SSL_CERT ?? '',
      key: process.env.DB_SSL_KEY ?? '',
    },
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },

  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD ?? '',
    db: parseInt(process.env.REDIS_DB ?? '0', 10),
    keyPrefix: process.env.REDIS_KEY_PREFIX ?? 'online-voting:',
  },

  logging: {
    level: process.env.LOG_LEVEL ?? 'info',
    format: process.env.LOG_FORMAT ?? 'json',
    serviceName: process.env.LOG_SERVICE_NAME ?? 'online-voting',
  },

  devTools: {
    swagger: process.env.ENABLE_SWAGGER === 'true',
    healthCheck: process.env.ENABLE_HEALTH_CHECK === 'true',
    metrics: process.env.ENABLE_METRICS === 'true',
  },

  security: {
    rateLimiting: {
      enabled: process.env.ENABLE_RATE_LIMITING === 'true',
      max: parseInt(process.env.RATE_LIMIT_MAX ?? '1000', 10),
      windowMs: parseInt(
        process.env.RATE_LIMIT_WINDOW_MS ?? '900000',
        10,
      ),
    },
  },

  helmet: {
    enabled: process.env.ENABLE_HELMET === 'true',
    contentSecurityPolicy: {
      enabled: process.env.ENABLE_CSP === 'true',
    },
    hsts: {
      enabled: process.env.ENABLE_HSTS === 'true',
      maxAge: parseInt(process.env.HSTS_MAX_AGE ?? '31536000', 10),
    },
  },

  s3: {
    endpoint: process.env.MINIO_ENDPOINT ?? '127.0.0.1',
    accessKey: process.env.MINIO_ACCESS_KEY ?? '',
    secretKey: process.env.MINIO_SECRET_KEY ?? '',
    bucket: process.env.MINIO_BUCKET_NAME ?? '',
    region: process.env.MINIO_REGION ?? 'us-east-1',
  },

  committee: {
    requiredCastePercentage: parseInt(
      process.env.COMMITTEE_REQUIRED_CASTE_PERCENTAGE ?? '50',
      10,
    ),
  },
});