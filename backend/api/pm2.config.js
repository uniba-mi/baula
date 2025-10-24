module.exports = {
    apps: [
      {
        name: 'api',
        script: 'src/app.js',
        env: {
          DOTENV_PATH: '.env'
        }
      }
    ]
  };
  