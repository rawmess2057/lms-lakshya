import axios from 'axios';

// CONFIG
const API_URL = 'http://localhost:5000/api/auth';
const EMAIL = 'test_limit_' + Math.floor(Math.random() * 10000) + '@example.com';
const PASSWORD = 'password123';

// Colors for output
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m"
};

const log = (msg, color = colors.reset) => console.log(`${color}${msg}${colors.reset}`);

async function runTest() {
    log('🚀 Starting Device Limit Verification...', colors.blue);
    log(`Target: ${API_URL}`, colors.blue);

    try {
        // 1. Register User
        log(`\n[1] Registering test user: ${EMAIL}...`);
        try {
            await axios.post(`${API_URL}/register`, {
                name: 'Test Limit User',
                email: EMAIL,
                password: PASSWORD,
                role: 'student'
            });
            log('✅ Registration successful', colors.green);
        } catch (e) {
            if (e.code === 'ECONNREFUSED') {
                log('❌ Connection Refused. Is the server running on port 5000?', colors.red);
                process.exit(1);
            }
            log(`❌ Registration failed: ${e.response?.data?.error || e.message}`, colors.red);
            // Attempt login if user already exists
        }

        // 2. Login Device A
        log('\n[2] Logging in Device A (ID: dev-a)...');
        let tokenA;
        try {
            const res = await axios.post(`${API_URL}/login`, {
                email: EMAIL,
                password: PASSWORD,
                deviceId: 'dev-a'
            });
            tokenA = res.data.data.token;
            log('✅ Device A Login Successful', colors.green);
        } catch (e) {
            log(`❌ Device A Login Failed: ${e.response?.data?.error || e.message}`, colors.red);
        }

        // 3. Login Device B
        log('\n[3] Logging in Device B (ID: dev-b)...');
        try {
            await axios.post(`${API_URL}/login`, {
                email: EMAIL,
                password: PASSWORD,
                deviceId: 'dev-b'
            });
            log('✅ Device B Login Successful', colors.green);
        } catch (e) {
            log(`❌ Device B Login Failed: ${e.response?.data?.error || e.message}`, colors.red);
        }

        // 4. Login Device C (Should Fail)
        log('\n[4] Logging in Device C (ID: dev-c) - EXPECTING FAILURE...');
        try {
            await axios.post(`${API_URL}/login`, {
                email: EMAIL,
                password: PASSWORD,
                deviceId: 'dev-c'
            });
            log('❌ Device C Login SUCCEEDED (Should have failed!)', colors.red);
        } catch (e) {
            if (e.response && e.response.status === 403) {
                log('✅ Device C Login BLOCKED (As expected)', colors.green);
                log(`   Error: ${e.response.data.error}`, colors.yellow);
            } else {
                log(`❌ Device C Login Failed but with wrong error: ${e.message}`, colors.red);
            }
        }

        // 5. Logout Device A
        log('\n[5] Logging out Device A...');
        try {
            await axios.post(`${API_URL}/logout`, {}, {
                headers: { Authorization: `Bearer ${tokenA}` }
            });
            log('✅ Device A Logout Successful', colors.green);
        } catch (e) {
            log(`❌ Device A Logout Failed: ${e.message}`, colors.red);
        }

        // 6. Login Device C Again (Should Success)
        log('\n[6] Logging in Device C again (ID: dev-c) - EXPECTING SUCCESS...');
        try {
            await axios.post(`${API_URL}/login`, {
                email: EMAIL,
                password: PASSWORD,
                deviceId: 'dev-c'
            });
            log('✅ Device C Login Successful', colors.green);
        } catch (e) {
            log(`❌ Device C Login Failed: ${e.response?.data?.error || e.message}`, colors.red);
        }

        // 7. Verify Re-login Device B (Should Success - Same Device)
        log('\n[7] Re-logging in Device B (ID: dev-b) - Should Success...');
        try {
            await axios.post(`${API_URL}/login`, {
                email: EMAIL,
                password: PASSWORD,
                deviceId: 'dev-b'
            });
            log('✅ Device B Re-login Successful', colors.green);
        } catch (e) {
            log(`❌ Device B Re-login Failed: ${e.response?.data?.error || e.message}`, colors.red);
        }

        log('\n✨ ALL TESTS COMPLETED ✨', colors.blue);

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('\n❌ ERROR: Could not connect to backend server at http://localhost:5000');
            console.log('please make sure the server involves running `npm start` or `npm run dev` in the backend directory.');
        } else {
            console.error('Test Execution Error:', error);
        }
    }
}

runTest();
