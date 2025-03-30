module.exports = {
  experimental: {
    allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
  }
  ,
  rewrites: async () => {
    return [

      {
        source: '/apibot/:path*',
        destination: 'http://localhost:4765/:path*',
      },
    ];
  },
};
