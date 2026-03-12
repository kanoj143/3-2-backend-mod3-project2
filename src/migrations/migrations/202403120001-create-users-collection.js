const User = require('../../models/User');

module.exports = {
  async up() {
    console.log('Creating users collection with initial data...');
    
    // Create initial users
    const users = [
      {
        username: 'john_doe',
        email: 'john@example.com',
        age: 25,
        address: {
          street: '123 Main St',
          city: 'New York',
          country: 'USA'
        }
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        age: 30,
        address: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          country: 'USA'
        }
      }
    ];

    await User.insertMany(users);
    console.log(`✅ Created ${users.length} users`);
  },

  async down() {
    console.log('Dropping users collection...');
    await User.deleteMany({});
    console.log('✅ Users collection cleared');
  }
};