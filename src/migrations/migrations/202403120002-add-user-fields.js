const mongoose = require('mongoose');
const User = require('../../models/User');

module.exports = {
  async up() {
    console.log('Adding new fields to users...');
    
    // Add new fields to existing users
    await User.updateMany(
      {},
      {
        $set: {
          phoneNumber: '',
          isActive: true,
          lastLogin: null
        }
      }
    );
    
    console.log('✅ Added phoneNumber, isActive, and lastLogin fields to users');
  },

  async down() {
    console.log('Removing added fields from users...');
    
    await User.updateMany(
      {},
      {
        $unset: {
          phoneNumber: "",
          isActive: "",
          lastLogin: ""
        }
      }
    );
    
    console.log('✅ Removed additional fields from users');
  }
};