#!/bin/bash
# Fetch secrets from AWS Secrets Manager
TOKEN=`curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"` 
SECRET_NAME=`curl --fail -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/tags/instance/AWS_Secrets_Manager`
echo $SECRET_NAME
if [[ -z "${SECRET_NAME}" ]]; then 
    echo Could not fetch SECRET_NAME for AWS EC2 tags. 
    exit 1
fi
SECRET_VALUE=$(aws secretsmanager get-secret-value --secret-id "$SECRET_NAME" --query SecretString --output text)

# Parse JSON and export to .env
echo "Parsing secrets..."
sudo echo "$SECRET_VALUE" | jq -r 'to_entries | .[] | "\(.key)=\(.value)"' > .env