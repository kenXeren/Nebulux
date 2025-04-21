# Nebulux

A mobile-first gamified life simulation web app that features quests, XP, leveling, daily check-ins, and more.

## Setting Up GitHub Auto-Save

This repository is set up to automatically save changes to GitHub. Here's how to use it:

### One-time Setup

1. Install Git from https://git-scm.com/download/win
2. Open a Command Prompt or PowerShell in this directory
3. Run these commands to set up Git (replace with your details):
   ```
   git init
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   git add .
   git commit -m "Initial commit"
   git branch -M main
   ```
4. Create a new repository on GitHub (https://github.com/new)
5. Connect your local repository to GitHub:
   ```
   git remote add origin https://github.com/YOURUSERNAME/Nebulux.git
   git push -u origin main
   ```

### Saving Changes

Whenever you make changes to files in this directory, you can save them to GitHub by running:

```
git add .
git commit -m "Description of changes"
git push
```

### Options for Automating Saves

#### 1. GitHub Desktop
Download GitHub Desktop (https://desktop.github.com/) for a visual way to commit and push changes.

#### 2. VS Code
If you use VS Code, it has built-in Git integration that can automatically commit your changes.

#### 3. Automated Script
Create a batch file in this directory named `auto-save.bat` with this content:

```batch
@echo off
git add .
git commit -m "Auto-save %date% %time%"
git push
echo Changes saved to GitHub!
pause
```

Double-click this file whenever you want to save your changes to GitHub.

## Files in this Repository

- `index.html` - The main application file
- `ai-model.js` - JavaScript for the AI recommendation system
- `manifest.json` - PWA manifest file for app installation
- `sw.js` - Service worker for offline functionality
- `icons/` - Directory containing app icons

## Adding New Files

When you create new files, make sure to:
1. Save them in the appropriate directory
2. Run the Git commands to add and commit them
3. Push the changes to GitHub

Your files will be safely stored in your GitHub repository, accessible from anywhere! 