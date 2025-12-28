#!/bin/bash
# tests/run-tests.sh
# Complete load testing suite for PioneerPulse

set -e  # Exit on error

echo "PioneerPulse Load Testing Suite"
echo "===================================="
echo ""

# Detect Docker environment
if [ -f /.dockerenv ]; then
    echo "Running inside Docker container"
    BACKEND_URL=${BACKEND_URL:-"http://backend:3000"}
    QUERY_SERVICE_URL=${QUERY_SERVICE_URL:-"http://query-service:3001"}
else
    echo "Running on host machine"
    BACKEND_URL=${BACKEND_URL:-"http://localhost:3000"}
    QUERY_SERVICE_URL=${QUERY_SERVICE_URL:-"http://localhost:3001"}
fi

echo "Backend URL: $BACKEND_URL"
echo "Query Service URL: $QUERY_SERVICE_URL"
echo ""

# Install dependencies
echo "Installing dependencies..."
if ! command -v artillery &> /dev/null; then
    npm install -g artillery@latest
fi

if [ ! -d "node_modules" ]; then
    npm install pg
fi
echo ""

# Create results directory
mkdir -p test-results

# Wait for services to be ready
echo "Waiting for services to be ready..."
for i in {1..30}; do
    if curl -s "${BACKEND_URL}/health" > /dev/null 2>&1; then
        echo "Backend is ready"
        break
    fi
    echo "Waiting for backend... ($i/30)"
    sleep 2
done

for i in {1..30}; do
    if curl -s "${QUERY_SERVICE_URL}/health" > /dev/null 2>&1; then
        echo "Query service is ready"
        break
    fi
    echo "Waiting for query service... ($i/30)"
    sleep 2
done
echo ""

# Pre-load service IDs
echo "Pre-loading service IDs from database..."
node -e "
const helpers = require('./helpers.js');
helpers.loadServiceIds()
  .then(() => console.log('Service IDs loaded successfully'))
  .catch(err => {
    console.error('Failed to load service IDs:', err.message);
    process.exit(1);
  });
"
echo ""

# Test 1: Write Load
echo "===================="
echo "Test 1: Write Load"
echo "===================="
BACKEND_URL=$BACKEND_URL artillery run write-load.yml -o test-results/write-load.json
echo "Write load test complete"
echo ""

sleep 5

# Test 2: Read Load
echo "===================="
echo "Test 2: Read Load"
echo "===================="
QUERY_SERVICE_URL=$QUERY_SERVICE_URL artillery run read-load.yml -o test-results/read-load.json
echo "Read load test complete"
echo ""

sleep 5

# Test 3: Mixed Load
echo "===================="
echo "Test 3: Mixed Load (90% reads, 10% writes)"
echo "===================="
BACKEND_URL=$BACKEND_URL QUERY_SERVICE_URL=$QUERY_SERVICE_URL artillery run mixed-load.yml -o test-results/mixed-load.json
echo "Mixed load test complete"
echo ""

# Generate HTML reports
echo "Generating HTML reports..."
artillery report test-results/write-load.json -o test-results/write-load-report.html
artillery report test-results/read-load.json -o test-results/read-load-report.html
artillery report test-results/mixed-load.json -o test-results/mixed-load-report.html

echo ""
echo "All tests complete!"
echo "Results saved in: test-results/"
echo "HTML reports:"
echo "   - test-results/write-load-report.html"
echo "   - test-results/read-load-report.html"
echo "   - test-results/mixed-load-report.html"
echo ""
echo "Done!"
