#!/bin/bash

# Validate that all test scripts follow cleanup standards
# Usage: ./validate-tests.sh

echo "🔍 Validating test scripts for cleanup compliance..."
echo ""

VALIDATION_ERRORS=0

# Check each test script
for test_file in test-*.sh; do
    if [ "$test_file" = "test-template.sh" ]; then
        continue  # Skip the template
    fi
    
    echo "Checking: $test_file"
    
    # Check for required cleanup patterns
    HAS_CLEANUP_ARRAY=false
    HAS_CLEANUP_FUNCTION=false
    HAS_TRAP=false
    HAS_DELETE_MUTATION=false
    
    if grep -q "CREATED_RESTROOMS\|CREATED_IDS" "$test_file"; then
        HAS_CLEANUP_ARRAY=true
    fi
    
    if grep -q "cleanup()" "$test_file"; then
        HAS_CLEANUP_FUNCTION=true
    fi
    
    if grep -q "trap.*cleanup.*EXIT" "$test_file"; then
        HAS_TRAP=true
    fi
    
    if grep -q "DeleteRestroom" "$test_file"; then
        HAS_DELETE_MUTATION=true
    fi
    
    # Report findings
    if [ "$HAS_CLEANUP_ARRAY" = true ] && [ "$HAS_CLEANUP_FUNCTION" = true ] && [ "$HAS_TRAP" = true ] && [ "$HAS_DELETE_MUTATION" = true ]; then
        echo "  ✅ Cleanup compliance: PASS"
    else
        echo "  ❌ Cleanup compliance: FAIL"
        VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
        
        if [ "$HAS_CLEANUP_ARRAY" = false ]; then
            echo "    - Missing: Resource tracking array (CREATED_RESTROOMS or CREATED_IDS)"
        fi
        
        if [ "$HAS_CLEANUP_FUNCTION" = false ]; then
            echo "    - Missing: cleanup() function"
        fi
        
        if [ "$HAS_TRAP" = false ]; then
            echo "    - Missing: trap cleanup EXIT"
        fi
        
        if [ "$HAS_DELETE_MUTATION" = false ]; then
            echo "    - Missing: DeleteRestroom mutation for cleanup"
        fi
    fi
    echo ""
done

echo "🏁 Validation completed!"
echo ""

if [ $VALIDATION_ERRORS -eq 0 ]; then
    echo "✅ All tests pass cleanup compliance checks"
    exit 0
else
    echo "❌ $VALIDATION_ERRORS test(s) failed cleanup compliance"
    echo ""
    echo "To fix non-compliant tests:"
    echo "1. Use test-template.sh as a reference"
    echo "2. Add resource tracking arrays"
    echo "3. Implement cleanup() function"
    echo "4. Add 'trap cleanup EXIT'"
    echo "5. Include DeleteRestroom mutations"
    exit 1
fi