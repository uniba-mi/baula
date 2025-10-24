module.exports = {
    apps: [
      {
        name: 'api-local',
        script: 'ts-node',
        args: 'src/app.ts',
        env: {
          NODE_ENV: 'local',
          DOTENV_PATH: '.env.local'
        }
      },
      {
        name: 'api-test',
        script: 'src/app.js',
        env: {
          NODE_ENV: 'test',
          DOTENV_PATH: '.env.test'
        }
      },
      {
        name: 'api-prod',
        script: 'src/app.js',
        env: {
          NODE_ENV: 'prod',
          DOTENV_PATH: '.env.prod'
        }
      }
    ]
  };
  