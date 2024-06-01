#!/bin/bash

# Prompt the user for the number of files to be processed
read -p "Enter the number of files to process: " max_files

# Counter for the number of files processed
count=0

# Check if there are any files in the 0staging folder
if [ -n "$(ls -A ./0staging)" ]; then
  # Directly iterate over the files in the directory
  for file in ./0staging/*; do
    filename=$(basename "$file")

    # Skip specific folder and file
    if [ "$filename" = "templates" ] || [ "$filename" = "package.json" ]; then
      continue
    fi

    # Only process up to the max_files
    if [ $count -eq $max_files ]; then
      break
    fi

    # Get the filename without the directory part
    filename=$(basename "$file")

    # Get the first line of the file in the 0staging directory
    comment=$(head -n 1 "$file")

    # Move the file to the current directory
    mv -i "$file" .

    # Commit the change and push it to the remote repository
    git add .
    git commit -m "$comment"
    git push
    sleep 2

    # Increase the counter
    ((count++))
  done

  echo "$count files were processed."
else
  echo "No files found in the 0staging directory"
fi

