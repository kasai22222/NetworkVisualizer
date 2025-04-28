#!/bin/bash

# docker build -t networkvisual .
# docker run -p 3000:8080 -v /var/log/snort3/alert_json.txt:/build/alert_json.txt -it --rm networkvisual:latest

#!/bin/bash

# --- Configuration ---
REMOTE_HOST="laptop-server"  # Replace with your server's user and IP/hostname
REMOTE_PROJECT_PATH="/home/ubuntu/backend" # Where you want to copy the project on the server
REMOTE_DOCKER_IMAGE_NAME="networkvisual:latest" # Choose a name and tag for your image
CONTAINER_NAME="backend-app"                # Name for the Docker container on the remote server
REMOTE_PORT_MAPPING="3000:3000"             # Port mapping (host:container)
DETACHED="false"                              # Set to "true" to run in the background, "false" to run in foreground
REMOVE_EXISTING="false"                       # Set to "true" to delete the remote project directory if it exists

# --- Functions ---

remove_remote_project() {
  if [ "${REMOVE_EXISTING}" = "true" ]; then
    echo "Checking if remote project directory exists..."
    ssh "${REMOTE_HOST}" "if [ -d \"${REMOTE_PROJECT_PATH}\" ]; then echo 'Directory exists'; else echo 'Directory does not exist'; fi"
    if ssh "${REMOTE_HOST}" "test -d \"${REMOTE_PROJECT_PATH}\""; then
      echo "Removing existing remote project directory: ${REMOTE_PROJECT_PATH}"
      ssh "${REMOTE_HOST}" "rm -rf \"${REMOTE_PROJECT_PATH}\""
      if [ $? -ne 0 ]; then
        echo "Error removing remote project directory."
        exit 1
      fi
      echo "Remote project directory removed."
    else
      echo "Remote project directory does not exist. Skipping removal."
    fi
  fi
}

copy_project_to_remote() {
  echo "Copying project folder to remote server ${REMOTE_HOST}:${REMOTE_PROJECT_PATH}..."
  rsync -avz --exclude "*.mmdb" . "${REMOTE_HOST}:${REMOTE_PROJECT_PATH}"
  if [ $? -ne 0 ]; then
    echo "Error copying project folder to remote server."
    exit 1
  fi
  echo "Project folder copied successfully."
}

build_remote_image() {
  echo "Building Docker image on remote server..."
  ssh "${REMOTE_HOST}" "cd ${REMOTE_PROJECT_PATH} && docker build -t ${REMOTE_DOCKER_IMAGE_NAME} ."
  if [ $? -ne 0 ]; then
    echo "Error building Docker image on remote server."
    exit 1
  fi
  echo "Docker image built successfully on remote server."
}

run_remote_container() {
  echo "Running Docker container on remote server..."
  # Stop and remove existing container if it's running
  ssh "${REMOTE_HOST}" "docker stop ${CONTAINER_NAME} 2>/dev/null || true"
  ssh "${REMOTE_HOST}" "docker rm ${CONTAINER_NAME} 2>/dev/null || true"

  CONTAINER_RUN_COMMAND="docker run -v /var/log/snort3/alert_json.txt:/build/alert_json.txt --name ${CONTAINER_NAME} -p ${REMOTE_PORT_MAPPING}"
  if [ "${DETACHED}" = "true" ]; then
    CONTAINER_RUN_COMMAND="${CONTAINER_RUN_COMMAND} -d"
  fi
  CONTAINER_RUN_COMMAND="${CONTAINER_RUN_COMMAND} ${REMOTE_DOCKER_IMAGE_NAME}"

  ssh "${REMOTE_HOST}" "${CONTAINER_RUN_COMMAND}"
  if [ $? -ne 0 ]; then
    echo "Error running Docker container on remote server."
    exit 1
  fi
  echo "Container ${CONTAINER_NAME} is running on remote server."
}

# --- Main Script ---

remove_remote_project
copy_project_to_remote
build_remote_image
run_remote_container

echo "Deployment process completed."
