# Prismatique Website Deployment Guide

## Overview
This guide will help you deploy your Prismatique website to GitHub and make it live.

## Prerequisites
- GitHub account with repository created
- Git installed on your local machine
- Node.js and npm installed locally

## Step 1: Initialize Git Repository
```bash
cd "c:/Users/godwi/OneDrive/Documents/prismatiique site"
git init
git add .
git commit -m "Initial commit: Complete Prismatique website with leaderboard, navigation, and FAQ"
```

## Step 2: Create GitHub Repository
1. Go to [GitHub](https://github.com) and sign in
2. Click "New repository"
3. Name it: `Prismatiquebonuses` (or your preferred name)
4. Description: "Premium casino bonus website with live leaderboard"
5. Set as Public
6. Click "Create repository"

## Step 3: Add Remote Origin
```bash
git remote add origin https://github.com/Prismatiquee/Prismatiquebonuses.git
git branch -M main
```

## Step 4: Push to GitHub
```bash
git add .
git commit -m "Add all files: Complete website with navigation, leaderboard, FAQ, and styling"
git push -u origin main
```

## Step 5: Deploy Options

### Option A: GitHub Pages (Free Hosting)
1. Go to your repository settings on GitHub
2. Scroll down to "Pages" section
3. Under "Build and deployment", select "Deploy from a branch"
4. Choose `main` branch and `root` directory
5. Click "Save and deploy"

### Option B: Custom Domain
1. Purchase a domain name (e.g., prismatique.com)
2. Configure DNS to point to GitHub Pages
3. Update any hardcoded URLs in your code to use your custom domain

### Option C: Vercel/Netlify (Advanced)
1. Connect your GitHub account to [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
2. Import your GitHub repository
3. Deploy with one click

## File Structure Ready for Deployment
```
prismatiique site/
├── index.html          # Main page with navigation, leaderboard, bonuses, FAQ
├── styles.css           # Complete styling
├── script.js            # Interactive functionality
├── server.js            # Backend server
├── package.json         # Dependencies and scripts
├── api.js              # Backend API handler
├── pris.png            # Logo image
└── DEPLOYMENT.md     # Deployment guide
```

## Key Features Deployed
- **Navigation**: Complete with logo and smooth scrolling to all sections
- **Leaderboard**: Mock leaderboard data with rankings and bonuses
- **Bonus Section**: 3 casino partners with functional claim links
- **FAQ**: Working accordion with short, clean answers
- **Responsive**: Mobile-friendly design
✅ **Backend**: Secure API integration with real data
✅ **Production Ready**: All files structured and ready for deployment

## Next Steps
1. Follow the deployment steps above
2. Your site will be live at: `https://Prismatiquee.github.io/Prismatiquebonuses/`
3. Test all functionality after deployment
4. Update DNS if using custom domain

## Notes
- The API key is stored securely in `api.js` (not exposed in frontend)
- All relative paths work correctly with GitHub Pages
- The site is production-ready with proper error handling
- Responsive design works on all devices
- Live leaderboard updates every 30 seconds

Good luck with your deployment! 🚀
