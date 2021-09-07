module.exports = {
  apps: [
    {
      name: "Caching",
      script: "./server.js",
      watch: true,
      ignore_watch: ["node_modules", "logs"],
      env_production: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
  ],
};
