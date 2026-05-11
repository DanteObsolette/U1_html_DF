const fs = require('fs');
const path = require('path');
const app = require('./app');
const env = require('./config/env');
const sequelize = require('./config/database');
require('./models');
const { seedUsers } = require('./seeders/user.seeder');

async function bootstrap() {
  try {
    if (env.db.dialect === 'sqlite') {
      fs.mkdirSync(path.dirname(env.db.storage), { recursive: true });
    }

    await sequelize.authenticate();
    await sequelize.sync();
    await seedUsers();

    app.listen(env.port, () => {
      console.log(`Servidor corriendo en ${env.appUrl}`);
      console.log(`Base de datos activa con dialecto: ${env.db.dialect}`);
    });
  } catch (error) {
    console.error('No fue posible iniciar el servidor:', error);
    process.exit(1);
  }
}

bootstrap();
