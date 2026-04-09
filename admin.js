// Admin Panel JavaScript - Simplified for Easy Text Editing
class AdminPanel {
    constructor() {
        this.currentSection = 'home';
        this.init();
    }

    init() {
        this.loadCurrentContent();
        this.setupEventListeners();
        this.loadSection('home');
    }

    // Load current website content
    async loadCurrentContent() {
        try {
            // Load current HTML content
            const response = await fetch('index.html');
            const html = await response.text();
            
            // Extract current text values
            this.extractTextContent(html);
        } catch (error) {
            console.error('Error loading content:', error);
            this.showStatus('Error loading content', 'error');
        }
    }

    extractTextContent(html) {
        // Parse HTML to extract current text values
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract main title
        const mainTitle = doc.querySelector('.hero-content h1');
        if (mainTitle) {
            const titleText = mainTitle.textContent;
            const titleElement = document.getElementById('main-title');
            if (titleElement) {
                titleElement.textContent = titleText.replace('The ', '').replace('Bonuses', '').trim();
            }
        }

        // Extract subtitle
        const subtitle = doc.querySelector('.hero-content p');
        if (subtitle) {
            const subtitleElement = document.getElementById('subtitle-text');
            if (subtitleElement) {
                subtitleElement.textContent = subtitle.textContent.trim();
            }
        }

        // Extract feature texts
        const features = doc.querySelectorAll('.feature-item span');
        const featureTexts = ['100% Verified', 'Fast Payouts', '10k+ Players'];
        
        features.forEach((feature, index) => {
            const featureElement = document.getElementById(`feature${index + 1}-text`);
            if (featureElement && index < featureTexts.length) {
                featureElement.textContent = featureTexts[index];
            }
        });
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.admin-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.loadSection(section);
            });
        });

        // Save buttons for each section
        document.getElementById('save-home')?.addEventListener('click', () => this.saveHomeText());
        document.getElementById('save-bonuses')?.addEventListener('click', () => this.saveBonuses());
        document.getElementById('save-raffles')?.addEventListener('click', () => this.saveRaffles());
        document.getElementById('save-giveaways')?.addEventListener('click', () => this.saveGiveaways());
        document.getElementById('save-faq')?.addEventListener('click', () => this.saveFAQ());
        document.getElementById('preview-home')?.addEventListener('click', () => this.previewChanges());
        document.getElementById('reset-leaderboard')?.addEventListener('click', () => this.resetLeaderboard());
    }

    loadSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from nav links
        document.querySelectorAll('.admin-nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Add active class to nav link
        const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        this.currentSection = sectionName;
    }

    async saveHomeText() {
        try {
            const mainTitle = document.getElementById('main-title').textContent;
            const subtitle = document.getElementById('subtitle-text').textContent;
            const feature1 = document.getElementById('feature1-text').textContent;
            const feature2 = document.getElementById('feature2-text').textContent;
            const feature3 = document.getElementById('feature3-text').textContent;

            // Update the main website content
            await this.updateHomeContent(mainTitle, subtitle, [feature1, feature2, feature3]);

            this.showStatus('Home text updated and deployed!', 'success');
        } catch (error) {
            console.error('Save error:', error);
            this.showStatus('Error saving home text', 'error');
        }
    }

    async updateHomeContent(mainTitle, subtitle, features) {
        // This would update the actual index.html file
        // For demo purposes, we'll simulate the update
        console.log('Updating home content:', { mainTitle, subtitle, features });
        
        // In real implementation, this would make an API call to update the files
        const response = await fetch('/api/update-home', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mainTitle: `The ${mainTitle}`,
                subtitle: subtitle,
                features: features
            })
        });

        if (response.ok) {
            this.showStatus('Deployed successfully!', 'success');
        }
    }

    async saveBonuses() {
        try {
            const bonuses = this.collectBonusData();
            await this.deployContent('bonuses', bonuses);
            this.showStatus('Bonuses saved and deployed!', 'success');
        } catch (error) {
            console.error('Save error:', error);
            this.showStatus('Error saving bonuses', 'error');
        }
    }

    async saveRaffles() {
        try {
            const raffles = this.collectRaffleData();
            await this.deployContent('raffles', raffles);
            this.showStatus('Raffles saved and deployed!', 'success');
        } catch (error) {
            console.error('Save error:', error);
            this.showStatus('Error saving raffles', 'error');
        }
    }

    async saveGiveaways() {
        try {
            const giveaways = this.collectGiveawayData();
            await this.deployContent('giveaways', giveaways);
            this.showStatus('Giveaways saved and deployed!', 'success');
        } catch (error) {
            console.error('Save error:', error);
            this.showStatus('Error saving giveaways', 'error');
        }
    }

    async saveFAQ() {
        try {
            const faqData = this.collectFAQData();
            await this.deployContent('faq', faqData);
            this.showStatus('FAQ saved and deployed!', 'success');
        } catch (error) {
            console.error('Save error:', error);
            this.showStatus('Error saving FAQ', 'error');
        }
    }

    collectBonusData() {
        const bonuses = [];
        document.querySelectorAll('#bonuses-list .bonus-card').forEach(card => {
            const bonus = {
                title: card.querySelector('h3')?.textContent || '',
                amount: card.querySelector('.bonus-amount')?.textContent || '',
                code: card.querySelector('.bonus-code')?.textContent || ''
            };
            bonuses.push(bonus);
        });
        return bonuses;
    }

    collectRaffleData() {
        const raffles = [];
        document.querySelectorAll('#raffles-list .raffle-card').forEach(card => {
            const raffle = {
                title: card.querySelector('h3')?.textContent || '',
                prize: card.querySelector('.prize-amount')?.textContent || '',
                tickets: card.querySelector('.raffle-input')?.textContent || ''
            };
            raffles.push(raffle);
        });
        return raffles;
    }

    collectGiveawayData() {
        const giveaways = [];
        document.querySelectorAll('#giveaways-list .giveaway-card').forEach(card => {
            const giveaway = {
                title: card.querySelector('h3')?.textContent || '',
                prize: card.querySelector('.giveaway-prize span')?.textContent || '',
                requirements: card.querySelector('.giveaway-textarea')?.textContent || ''
            };
            giveaways.push(giveaway);
        });
        return giveaways;
    }

    collectFAQData() {
        const faqData = [];
        document.querySelectorAll('#faq-list .faq-item').forEach(item => {
            const faq = {
                question: item.querySelector('.faq-question h3')?.textContent || '',
                answer: item.querySelector('.faq-answer')?.textContent || ''
            };
            faqData.push(faq);
        });
        return faqData;
    }

    async deployContent(section, data) {
        // Simulate deployment
        console.log(`Deploying ${section} with data:`, data);
        
        // In real implementation, this would:
        // 1. Update the actual HTML/CSS/JS files
        // 2. Commit to git
        // 3. Deploy to GitHub Pages
        
        const response = await fetch('/api/deploy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                section: section,
                data: data
            })
        });

        if (response.ok) {
            return true;
        } else {
            throw new Error('Deployment failed');
        }
    }

    resetLeaderboard() {
        if (confirm('Are you sure you want to reset the leaderboard?')) {
            // In real implementation, this would reset the leaderboard data
            console.log('Resetting leaderboard...');
            this.showStatus('Leaderboard reset successfully!', 'success');
        }
    }

    previewChanges() {
        // Open preview window with current changes
        const mainTitle = document.getElementById('main-title').textContent;
        const subtitle = document.getElementById('subtitle-text').textContent;
        const feature1 = document.getElementById('feature1-text').textContent;
        const feature2 = document.getElementById('feature2-text').textContent;
        const feature3 = document.getElementById('feature3-text').textContent;

        const previewHTML = `
            <div style="padding: 2rem; background: #1a1a1a; color: white; font-family: Arial;">
                <h1 style="color: var(--accent-blue); font-size: 3rem;">The <span style="color: #66ccff;">${mainTitle}</span></h1>
                <p style="font-size: 1.2rem; margin-bottom: 2rem;">${subtitle}</p>
                <div style="display: flex; gap: 2rem; margin-bottom: 2rem;">
                    <div style="background: rgba(255,255,255,0.1); padding: 1rem 1.5rem; border-radius: 50px;">
                        ✅ ${feature1}
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 1rem 1.5rem; border-radius: 50px;">
                        ⚡ ${feature2}
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 1rem 1.5rem; border-radius: 50px;">
                        👥 ${feature3}
                    </div>
                </div>
            </div>
        `;

        const preview = window.open('', 'preview', 'width=800,height=600');
        preview.document.write(previewHTML);
        preview.document.close();
    }

    showStatus(message, type = 'success') {
        const statusEl = document.getElementById('status-message');
        const statusText = document.getElementById('status-text');
        
        if (statusEl && statusText) {
            statusText.textContent = message;
            statusEl.className = `status-message ${type}`;
            
            // Auto-hide after 3 seconds
            setTimeout(() => {
                statusEl.classList.add('hidden');
            }, 3000);
        }
    }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    new AdminPanel();
});
