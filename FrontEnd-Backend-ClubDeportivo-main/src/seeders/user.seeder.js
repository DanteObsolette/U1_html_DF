const { User } = require('../models');

async function seedUsers() {
  const count = await User.count();
  if (count > 0) return;

  await User.bulkCreate(
    [
      {
        full_name: 'Demo User 1',
        email: 'user1@demo.cl',
        password: '12345678',
        role: 'user',
        must_change_password: false,
        birth_date: '2000-01-10',
        metadata: {
          sports: [
            {
              name: 'football',
              frequency_per_week: 3
            }
          ]
        }
      },
      {
        full_name: 'Demo User 2',
        email: 'user2@demo.cl',
        password: '12345678',
        role: 'user',
        must_change_password: false,
        birth_date: '2001-03-22',
        metadata: {
          sports: [
            {
              name: 'basketball',
              frequency_per_week: 2
            }
          ]
        }
      },
      {
        full_name: 'Demo Coach 1',
        email: 'coach1@demo.cl',
        password: '12345678',
        role: 'coach',
        must_change_password: false,
        birth_date: '1995-05-18',
        metadata: {
          sports: [
            {
              name: 'crossfit',
              frequency_per_week: 5
            }
          ],
          specialty: 'functional training'
        }
      },
      {
        full_name: 'Demo Coach 2',
        email: 'coach2@demo.cl',
        password: '12345678',
        role: 'coach',
        must_change_password: false,
        birth_date: '1993-11-08',
        metadata: {
          sports: [
            {
              name: 'swimming',
              frequency_per_week: 4
            }
          ],
          specialty: 'endurance'
        }
      },
      {
        full_name: 'Demo Admin 1',
        email: 'admin1@demo.cl',
        password: '12345678',
        role: 'admin',
        must_change_password: true,
        birth_date: '1990-09-01',
        metadata: {
          position: 'coordinator',
          campus: 'Santiago'
        }
      },
      {
        full_name: 'Demo Admin 2',
        email: 'admin2@demo.cl',
        password: '12345678',
        role: 'admin',
        must_change_password: true,
        birth_date: '1988-02-14',
        metadata: {
          position: 'academic manager',
          campus: 'Maipu'
        }
      }
    ],
    { individualHooks: true }
  );
}

module.exports = { seedUsers };