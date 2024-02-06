#!/bin/bash
git pull --recurse-submodules

# Check the exit code of the git pull command
if [ $? -ne 0 ]; then
    # If exit code indicates failure, check if it's due to permission denied
    if [[ $(git pull --recurse-submodules 2>&1) =~ "Permission denied" ]]; then
        echo "Error: Permission denied. Please log into the VPS and setup SSH access keys."
        exit 1
    else
        # If it's a different type of failure, print a generic error message
        echo "Error: Git pull failed. Please check your repository and try again."
        exit 1
    fi
fi

docker compose down
docker compose up --build --force-recreate -d
