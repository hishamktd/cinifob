#!/bin/bash

# Script to run E2E tests with the development server

echo "🚀 Starting development server..."

# Start the dev server in the background
npm run dev &
DEV_PID=$!

# Wait for the server to be ready
echo "⏳ Waiting for server to be ready..."
sleep 10

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Server failed to start"
    kill $DEV_PID 2>/dev/null
    exit 1
fi

echo "✅ Server is ready!"

# Run E2E tests
echo "🧪 Running E2E tests..."
npx playwright test "$@"
TEST_EXIT_CODE=$?

# Kill the dev server
echo "🛑 Stopping development server..."
kill $DEV_PID 2>/dev/null

# Exit with the test exit code
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All E2E tests passed!"
else
    echo "❌ Some E2E tests failed. Check the report for details."
fi

exit $TEST_EXIT_CODE