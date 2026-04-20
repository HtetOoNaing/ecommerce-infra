export const cookieConfig = {
  accessToken: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
    domain: process.env.NODE_ENV === 'production' 
      ? '.infra-pro.com' 
      : undefined,
  },
  refreshToken: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/v1/auth',
    domain: process.env.NODE_ENV === 'production'
      ? '.infra-pro.com'
      : undefined,
  },
};