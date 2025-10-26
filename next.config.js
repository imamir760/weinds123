const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Ensure alias "@" always resolves to ./src (defensive for cloud builds)
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      ['@']: path.resolve(__dirname, 'src'),
    };

    // Exclude gRPC from the client-side bundle (keep your existing behavior)
    if (!isServer) {
      config.externals = config.externals || [];
      try {
        // if externals is an array (default), push the module
        if (Array.isArray(config.externals)) {
          config.externals.push('@grpc/grpc-js');
        } else if (typeof config.externals === 'function') {
          // leave function externals alone (unlikely), but try to preserve behavior
          // no-op
        } else if (typeof config.externals === 'object') {
          config.externals['@grpc/grpc-js'] = '@grpc/grpc-js';
        }
      } catch (e) {
        // if anything weird happens, still continue — alias is most important
        console.warn('could not modify externals for grpc:', e);
      }
    }

    return config;
  },
};

module.exports = nextConfig;
