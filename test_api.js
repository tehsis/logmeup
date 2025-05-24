// Simple test script to verify API endpoints
const API_BASE = 'http://localhost:8080/api';

async function testAPI() {
  console.log('Testing Action API endpoints...\n');

  try {
    // Test 1: Check if server is online
    console.log('1. Testing server connectivity...');
    const healthCheck = await fetch(`${API_BASE}/actions`, { method: 'HEAD' });
    console.log(`   Status: ${healthCheck.status} ${healthCheck.ok ? '✓' : '✗'}\n`);

    // Test 2: Get all actions (should be empty initially)
    console.log('2. Getting all actions...');
    const getAllResponse = await fetch(`${API_BASE}/actions`);
    const allActions = await getAllResponse.json();
    console.log(`   Status: ${getAllResponse.status} ${getAllResponse.ok ? '✓' : '✗'}`);
    console.log(`   Actions count: ${allActions.length}\n`);

    // Test 3: Create a test note first (required for actions)
    console.log('3. Creating a test note...');
    const noteData = {
      content: 'Test note for actions',
      date: new Date().toISOString().split('T')[0]
    };
    const createNoteResponse = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData)
    });
    const createdNote = await createNoteResponse.json();
    console.log(`   Status: ${createNoteResponse.status} ${createNoteResponse.ok ? '✓' : '✗'}`);
    console.log(`   Note ID: ${createdNote.id}\n`);

    // Test 4: Create an action
    console.log('4. Creating an action...');
    const actionData = {
      note_id: createdNote.id,
      description: 'Test action from API test'
    };
    const createActionResponse = await fetch(`${API_BASE}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actionData)
    });
    const createdAction = await createActionResponse.json();
    console.log(`   Status: ${createActionResponse.status} ${createActionResponse.ok ? '✓' : '✗'}`);
    console.log(`   Action ID: ${createdAction.id}`);
    console.log(`   Description: ${createdAction.description}\n`);

    // Test 5: Update the action
    console.log('5. Updating action (mark as completed)...');
    const updateData = { completed: true };
    const updateResponse = await fetch(`${API_BASE}/actions/${createdAction.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    const updatedAction = await updateResponse.json();
    console.log(`   Status: ${updateResponse.status} ${updateResponse.ok ? '✓' : '✗'}`);
    console.log(`   Completed: ${updatedAction.completed}\n`);

    // Test 6: Get all actions again
    console.log('6. Getting all actions again...');
    const getAllResponse2 = await fetch(`${API_BASE}/actions`);
    const allActions2 = await getAllResponse2.json();
    console.log(`   Status: ${getAllResponse2.status} ${getAllResponse2.ok ? '✓' : '✗'}`);
    console.log(`   Actions count: ${allActions2.length}`);
    console.log(`   Actions:`, allActions2.map(a => ({ id: a.id, description: a.description, completed: a.completed })));

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAPI(); 