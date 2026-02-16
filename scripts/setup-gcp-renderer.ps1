
# Set variables
$PROJECT_ID = "gen-lang-client-0294256298"
$REGION = "us-central1"
$SERVICE_ACCOUNT_NAME = "remotion-renderer-sa"
$SERVICE_ACCOUNT_EMAIL = "$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
$KEY_FILE = "gcp-sa-key.json"

Write-Host "Setting up GCP Project: $PROJECT_ID in $REGION..."

# Create Project (interactive if needed, might need organization ID)
# Assuming user has a default project or we can create one.
# For simplicity, let's use the current project if set, or ask user to set one.
# But user said "I want to retry to generate them", so maybe they want a FRESH start.
# Let's try to use the CURRENT project first if set.

# $currentProject = gcloud config get-value project
# if (-not $currentProject) {
#    Write-Error "No GCP project set. Please run 'gcloud config set project YOUR_PROJECT_ID' first."
#    exit 1
# }
# $PROJECT_ID = $currentProject
Write-Host "Using Project ID: $PROJECT_ID"

# Enable APIs
Write-Host "Enabling APIs..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com storage.googleapis.com --project $PROJECT_ID

# Create Service Account
Write-Host "Creating Service Account..."
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME --display-name "Remotion Renderer SA" --project $PROJECT_ID

# Grant Roles
Write-Host "Granting Roles..."
$roles = @(
    "roles/run.admin",
    "roles/storage.admin",
    "roles/iam.serviceAccountUser",
    "roles/artifactregistry.writer",
    "roles/cloudbuild.builds.editor"
)

foreach ($role in $roles) {
    gcloud projects add-iam-policy-binding $PROJECT_ID --member "serviceAccount:$SERVICE_ACCOUNT_EMAIL" --role $role
}

# Generate Key
Write-Host "Generating Key..."
if (Test-Path $KEY_FILE) {
    Remove-Item $KEY_FILE
}
gcloud iam service-accounts keys create $KEY_FILE --iam-account $SERVICE_ACCOUNT_EMAIL --project $PROJECT_ID

Write-Host "---------------------------------------------------"
Write-Host "SETUP COMPLETE!"
Write-Host "Project ID: $PROJECT_ID"
Write-Host "Service Account Key saved to: $PWD\$KEY_FILE"
Write-Host "---------------------------------------------------"
Write-Host "PLEASE COPY THE CONTENT OF $KEY_FILE ADD IT TO GITHUB SECRETS AS 'GCP_SA_KEY'"
Write-Host "AND SET 'GCP_PROJECT_ID' SECRET TO: $PROJECT_ID"
Write-Host "---------------------------------------------------"
