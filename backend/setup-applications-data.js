const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

async function createSampleApplications() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Get existing user ID
    const userResult = await client.query('SELECT id FROM users LIMIT 1');
    const userId = userResult.rows[0]?.id;
    
    if (!userId) {
      console.log('❌ No users found. Please ensure you have at least one user in the database.');
      return;
    }

    // Get existing job IDs
    const jobsResult = await client.query('SELECT id, title FROM jobs LIMIT 3');
    if (jobsResult.rows.length === 0) {
      console.log('❌ No jobs found. Please run setup-jobs-data.js first.');
      return;
    }

    // Check current applications count
    const appCount = await client.query('SELECT COUNT(*) FROM applications');
    console.log(`📊 Current applications count: ${appCount.rows[0].count}`);

    if (appCount.rows[0].count === '0') {
      console.log('📄 Creating sample applications...');

      // Create applications with different statuses
      const applications = [
        {
          id: uuidv4(),
          user_id: userId,
          job_id: jobsResult.rows[0].id,
          status: 'pending',
          cover_letter: 'I am very interested in this frontend developer position. I have 3 years of experience with React and modern web technologies.',
          resume_url: 'https://example.com/resume1.pdf'
        },
        {
          id: uuidv4(),
          user_id: userId,
          job_id: jobsResult.rows[1].id,
          status: 'reviewed',
          cover_letter: 'I would love to join your backend engineering team. I have extensive experience with Node.js and database design.',
          resume_url: 'https://example.com/resume2.pdf'
        },
        {
          id: uuidv4(),
          user_id: userId,
          job_id: jobsResult.rows[2].id,
          status: 'accepted',
          cover_letter: 'Full stack development is my passion. I am excited about the opportunity to work with your innovative team.',
          resume_url: 'https://example.com/resume3.pdf'
        }
      ];

      for (const app of applications) {
        try {
          await client.query(`
            INSERT INTO applications (id, user_id, job_id, status, cover_letter, resume_url, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          `, [app.id, app.user_id, app.job_id, app.status, app.cover_letter, app.resume_url]);
          
          console.log(`✅ Created application for job: ${jobsResult.rows.find(j => j.id === app.job_id)?.title} (Status: ${app.status})`);
        } catch (error) {
          console.error(`❌ Error creating application:`, error.message);
        }
      }

      // Check final count
      const finalCount = await client.query('SELECT COUNT(*) FROM applications');
      console.log(`📊 New applications count: ${finalCount.rows[0].count}`);
    } else {
      console.log('📋 Applications already exist, skipping creation.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

createSampleApplications();
