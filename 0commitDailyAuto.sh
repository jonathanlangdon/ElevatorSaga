#!/bin/bash

# Sleep for a random interval between 1 and 30 minutes
sleep_time=$((RANDOM % 1740 + 60)) # This generates a random number between 60 and 1800
echo "Sleeping for $sleep_time seconds."
sleep $sleep_time

todayESTMidnight=$(TZ="America/New_York" date +"%Y-%m-%d 00:00:00")
echo "Today EST midnight is" $todayESTMidnight
todayMidnightUTC=$(date -u -d "$todayESTMidnight - 3 hours" "+%s")

events=$(curl -s https://api.github.com/users/jonathanlangdon/events)
eventDateString=$(echo "$events" | jq -r '.[0].created_at')
echo "The last push event in UTC was $eventDateString"
gitHubEvent=$(date -u -d "$eventDateString" "+%s")
# "2024-05-09T03:59:59Z" # sample date/time for event

if [ $gitHubEvent -ge $todayMidnightUTC ]; then
    echo "the most recent post is today(EST). Exiting script."
    exit 0
else
    echo "the most recent post was before today(EST)"
fi

# Generate a random number either 1 or 5
max_files=$(( ( RANDOM % 2 ) * 4 + 1 ))

# Counter for the number of files processed
count=0

# Check if there are any files in the 0staging folder
if [ -n "$(ls -A ./0staging)" ]; then
  # Count the number of files in the 0staging folder
  file_count=$(ls -1 ./0staging | wc -l)
  echo "There are $file_count files in the 0staging folder."

  # If the number of files is less than 5, set max_files to 1
  if [ $file_count -lt 5 ]; then
    max_files=1
  fi

  # Directly iterate over the files in the directory
  for file in ./0staging/*; do
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
