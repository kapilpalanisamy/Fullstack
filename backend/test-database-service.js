const { testConnection } = require('./src/services/databaseService');

console.log('🧪 Testing Database Service Connection...\n');

testConnection()
    .then((success) => {
        if (success) {
            console.log('\n✅ Database service connection successful!');
            console.log('🎯 Ready to start the backend server.');
        } else {
            console.log('\n❌ Database service connection failed!');
        }
        process.exit(success ? 0 : 1);
    })
    .catch((error) => {
        console.error('\n❌ Database service error:', error.message);
        process.exit(1);
    });
