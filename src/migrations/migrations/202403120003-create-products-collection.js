const Product = require('../../models/Product');

module.exports = {
  async up() {
    console.log('Creating products collection with sample data...');
    
    const products = [
      {
        name: 'Laptop',
        price: 999.99,
        category: 'Electronics',
        inStock: true
      },
      {
        name: 'Smartphone',
        price: 699.99,
        category: 'Electronics',
        inStock: true
      },
      {
        name: 'Headphones',
        price: 199.99,
        category: 'Audio',
        inStock: false
      }
    ];

    await Product.insertMany(products);
    console.log(`✅ Created ${products.length} products`);
  },

  async down() {
    console.log('Dropping products collection...');
    await Product.deleteMany({});
    console.log('✅ Products collection cleared');
  }
};