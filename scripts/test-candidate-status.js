const fetch = require('node-fetch');

async function testCandidateStatus() {
  try {
    console.log('🧪 Testing candidate status functionality...\n');
    
    // Test 1: Fetch all candidates
    console.log('1️⃣ Testing GET /api/candidates');
    const response = await fetch('http://localhost:3000/api/candidates');
    const data = await response.json();
    
    if (data.success && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      console.log('✅ Successfully fetched candidates');
      console.log(`   Sample candidate: ${candidate.first_name} ${candidate.last_name}`);
      console.log(`   Status columns: is_read=${candidate.is_read}, is_starred=${candidate.is_starred}, is_archived=${candidate.is_archived}`);
      
      // Test 2: Update read status
      console.log('\n2️⃣ Testing PUT /api/candidates/[id] - mark as read');
      const updateResponse = await fetch(`http://localhost:3000/api/candidates/${candidate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read', value: true })
      });
      
      const updateResult = await updateResponse.json();
      if (updateResult.success) {
        console.log('✅ Successfully updated read status');
        console.log(`   Updated candidate is_read: ${updateResult.candidate.is_read}`);
      } else {
        console.log('❌ Failed to update read status:', updateResult.error);
      }
      
      // Test 3: Update star status
      console.log('\n3️⃣ Testing PUT /api/candidates/[id] - star candidate');
      const starResponse = await fetch(`http://localhost:3000/api/candidates/${candidate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'star', value: true })
      });
      
      const starResult = await starResponse.json();
      if (starResult.success) {
        console.log('✅ Successfully updated star status');
        console.log(`   Updated candidate is_starred: ${starResult.candidate.is_starred}`);
      } else {
        console.log('❌ Failed to update star status:', starResult.error);
      }
      
    } else {
      console.log('❌ No candidates found or API error:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the development server is running: npm run dev');
  }
}

testCandidateStatus();
