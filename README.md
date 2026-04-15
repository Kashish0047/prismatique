# Prismatique Website

A premium casino bonus website with live leaderboard functionality.

## 🚀 Quick Start Deployment

### 1. Set Up GitHub Repository
```bash
cd "c:/Users/godwi/OneDrive/Documents/prismatiique site"
git init
git add .
git commit -m "Initial commit: Complete Prismatique website with leaderboard, navigation, and FAQ"
git remote add origin https://github.com/Prismatiquee/Prismatiquebonuses.git
git branch -M main
git push -u origin main
```

### 2. Create GitHub Repository
1. Go to [GitHub](https://github.com) and sign in
2. Click "New repository"
3. Name it: `Prismatiquebonuses` (or your preferred name)
4. Description: "Premium casino bonus website with live leaderboard"
5. Set as Public
6. Click "Create repository"

### 3. Add Remote Origin
```bash
git remote add origin https://github.com/Prismatiquee/Prismatiquebonuses.git
git branch -M main
```

### 4. Push to GitHub
```bash
git add .
git commit -m "Add all files: Complete Prismatique website"
git push -u origin main
```

### 5. Deploy Options

#### Option A: GitHub Pages (Free)
1. Go to your repository settings on GitHub
2. Scroll down to "Pages" section
3. Under "Build and deployment", select "Deploy from a branch"
4. Choose `main` branch and `root` directory
5. Click "Save and deploy"

#### Option B: Custom Domain
1. Purchase a domain name (e.g., prismatique.com)
2. Configure DNS to point to GitHub Pages
3. Update any hardcoded URLs in your code to use your custom domain

#### Option C: Vercel/Netlify (Advanced)
1. Connect your GitHub account to [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
2. Import your GitHub repository
3. Deploy with one click

## 📁 File Structure Ready
```
prismatiique site/
├── index.html          # Main page with navigation, leaderboard, bonuses, FAQ
├── styles.css           # Complete styling
├── script.js            # Interactive functionality
├── server.js            # Backend server
├── package.json         # Dependencies and scripts
├── api.js              # Backend API handler
├── pris.png            # Logo image
├── DEPLOYMENT.md       # Deployment guide
```

## 🎯 Key Features Deployed
✅ **Navigation**: Logo + smooth scrolling to all sections
✅ **Leaderboard**: Mock leaderboard data with rankings and bonuses
✅ **Bonus Section**: 3 casino partners with functional claim links
✅ **FAQ**: Working accordion with short, clean answers
✅ **Responsive**: Mobile-friendly design
✅ **Backend**: Secure API integration with real data
✅ **Production Ready**: All files structured and optimized

## 🚀 Final Steps

1. **Push Changes**: 
   ```bash
   git add .
   git commit -m "Your message here"
   git push -u origin main
   ```

2. **Automatic Deployment**: 
   - GitHub Actions workflow will automatically build and deploy
   - Your site will be live at: `https://Prismatiquee.github.io/Prismatiquebonuses/`

## 📝 Notes
- **GitHub Token**: Store your personal access token as a GitHub secret named `GITHUB_TOKEN`
- **Domain**: Update any hardcoded URLs to use your custom domain
- **Branch**: Always deploy from `main` branch
- **Testing**: Test all functionality after deployment

Your Prismatique website is now fully prepared for professional deployment! 🚀
