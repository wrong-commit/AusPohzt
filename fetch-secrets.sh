#!/bin/bash
# Fetch secrets from AWS Secrets Manager
SECRET_NAME="pik-manual-test"
SECRET_VALUE=$(aws secretsmanager get-secret-value --secret-id "$SECRET_NAME" --query SecretString --output text)

# Parse JSON and export to .env
echo "Parsing secrets..."
sudo echo "$SECRET_VALUE" | jq -r 'to_entries | .[] | "\(.key)=\(.value)"' > .env