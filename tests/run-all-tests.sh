
echo " Starting PioneerPulse Stress Tests"
echo "======================================"

# Create results directory
mkdir -p test-results

echo ""
echo " Test 1: Write Load (50-200 req/sec)"
artillery run tests/write-load.yml -o test-results/write-load.json
echo " Write load test complete"

sleep 10

echo ""
echo " Test 2: Read Load (200-1000 req/sec)"
artillery run tests/read-load.yml -o test-results/read-load.json
echo " Read load test complete"

sleep 10

echo ""
echo "Test 3: Mixed Load (90% reads, 10% writes)"
artillery run tests/mixed-load.yml -o test-results/mixed-load.json
echo "Mixed load test complete"

echo ""
echo "Generating HTML Reports..."
artillery report test-results/write-load.json -o test-results/write-load-report.html
artillery report test-results/read-load.json -o test-results/read-load-report.html
artillery report test-results/mixed-load.json -o test-results/mixed-load-report.html

echo ""
echo "All tests complete!"
echo "Results saved in: test-results/"
echo "Open HTML reports to view graphs"