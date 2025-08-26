# Fix Git Remote Origin Error

Follow these steps to remove the old GitHub account connection and set up your new GitHub account:

## Step 1: Remove Old Remote Origin

Open the terminal in your Replit project and run:

```bash
# Check current remote origin
git remote -v

# Remove the old remote origin
git remote remove origin

# Verify it's removed
git remote -v
```

## Step 2: Create New Repository on Your GitHub Account

1. Go to [GitHub.com](https://github.com) and sign in to your **new** account
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the details:
   - **Repository name**: `gameconnect` (or any name you prefer)
   - **Description**: `A comprehensive gaming portal platform with content management, blog system, and ad management`
   - **Visibility**: Choose Public or Private
   - **DO NOT** check "Initialize this repository with README, .gitignore, or license" (we already have these files)
5. Click "Create repository"

## Step 3: Add Your New GitHub Repository

After creating the repository, GitHub will show you the repository URL. Use it in these commands:

```bash
# Add your new GitHub repository as remote origin
# Replace YOUR_USERNAME with your new GitHub username
# Replace REPOSITORY_NAME with your repository name (if different from gameconnect)
git remote add origin https://github.com/YOUR_USERNAME/gameconnect.git

# Verify the new remote is added
git remote -v
```

## Step 4: Push to Your New Repository

```bash
# Add all files to staging
git add .

# Commit your changes
git commit -m "Complete GameConnect platform with admin dashboard, blog system, and ad management"

# Push to your new GitHub repository
git push -u origin main
```

## Step 5: If You Get Authentication Error

If you get an authentication error when pushing, you'll need to authenticate:

### Option A: Personal Access Token (Recommended)
1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Set expiration and select scopes (check "repo" for private repos or "public_repo" for public repos)
4. Copy the generated token
5. When prompted for password, use the token instead of your password

### Option B: SSH Key (Alternative)
```bash
# Generate SSH key
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Copy the public key
cat ~/.ssh/id_rsa.pub

# Add this key to GitHub: Settings → SSH and GPG keys → New SSH key
# Then change remote URL to SSH
git remote set-url origin git@github.com:YOUR_USERNAME/gameconnect.git
```

## Step 6: Verify Everything Works

```bash
# Check if push was successful
git status

# Your repository should now be clean with no uncommitted changes
```

## Complete Commands Summary

Here's the complete sequence of commands to run:

```bash
# 1. Remove old remote
git remote remove origin

# 2. Add new remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/gameconnect.git

# 3. Stage and commit all files
git add .
git commit -m "Complete GameConnect platform ready for deployment"

# 4. Push to new repository
git push -u origin main
```

## After Successful Push

Once you've successfully pushed to GitHub:

1. Your code will be available at: `https://github.com/YOUR_USERNAME/gameconnect`
2. You can now deploy it on your Hostinger VPS following the deployment guide
3. Clone from your new repository on the VPS:

```bash
# On your VPS
cd /var/www
git clone https://github.com/YOUR_USERNAME/gameconnect.git
cd gameconnect
chmod +x setup.sh
./setup.sh
```

This will completely disconnect your project from the old GitHub account and connect it to your new one.