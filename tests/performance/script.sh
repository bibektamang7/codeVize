#!/bin/bash

if [ -f "./../.env" ]; then
  set -a
  source ./../.env
  set +a
else
  echo ".env not found"
  exit 1
fi

clear

echo "Select test type:"
echo "1) Load"
echo "2) Spike"
echo "3) Stress"
read -p "Enter choice: " test_type

case $test_type in
  1) FOLDER="load" ;;
  2) FOLDER="spike" ;;
  3) FOLDER="stress" ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

clear
echo "Selected: $FOLDER test"
echo ""

echo "Select file to run:"
echo "1) Run ALL tests"
echo "2) user.js"
echo "3) pullRequest.js"
echo "4) auth.js"
read -p "Enter choice: " file_choice

run_file() {
  echo "Running: $1"
  k6 run "$1"
  echo ""
}

case $file_choice in
  1)
    echo "Running all tests in $FOLDER..."
    for file in "$FOLDER"/*.js; do
      run_file "$file"
    done
    ;;
  2)
    run_file "$FOLDER/user.js"
    ;;
  3)
    run_file "$FOLDER/pullRequest.js"
    ;;
  4)
    run_file "$FOLDER/auth.js"
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac
