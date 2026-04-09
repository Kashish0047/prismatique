// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Smooth Scrolling for Navigation Links
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // Remove active class from all links
            navLinks.forEach(navLink => navLink.classList.remove('active'));

            // Add active class to clicked link
            this.classList.add('active');

            // Get target section
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                // Smooth scroll to section
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Close mobile menu if open
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    });

    // Highlight active section on scroll
    window.addEventListener('scroll', function() {
        let current = '';
        const sections = document.querySelectorAll('section[id]');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (window.pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Add scroll effect to navbar
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(26, 26, 26, 0.95))';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'linear-gradient(135deg, var(--primary-black), var(--dark-gray))';
            navbar.style.backdropFilter = 'none';
        }
    });

    // Countdown Timer Functionality
    let countdownInterval;
    
    function startCountdown(endTime) {
        console.log('Starting countdown with end time:', endTime);
        
        // Clear existing interval
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        
        function updateCountdown() {
            const now = new Date().getTime();
            let targetTime;
            
            if (endTime) {
                // Use the actual end time from API
                targetTime = new Date(endTime).getTime();
                console.log('Using API end time:', new Date(endTime));
            } else {
                // Fallback to default (30 days from now)
                targetTime = now + (30 * 24 * 60 * 60 * 1000);
                console.log('Using default end time (30 days)');
            }
            
            const distance = targetTime - now;
            
            if (distance < 0) {
                // Timer expired - leaderboard reset
                console.log('Leaderboard period ended! Refreshing data...');
                document.querySelector('.countdown-label').textContent = 'LEADERBOARD RESETTING...';
                document.querySelector('.countdown-timer').innerHTML = '<div class="time-unit"><span class="time-value">00</span><span class="time-label">DAYS</span></div><div class="time-unit"><span class="time-value">00</span><span class="time-label">HOURS</span></div><div class="time-unit"><span class="time-value">00</span><span class="time-label">MINS</span></div><div class="time-unit"><span class="time-value">00</span><span class="time-label">SECS</span></div>';
                
                // Refresh leaderboard data after reset
                setTimeout(() => {
                    fetchLeaderboardData();
                }, 5000);
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            const timeElements = document.querySelectorAll('.time-value');
            if (timeElements.length >= 4) {
                timeElements[0].textContent = String(days).padStart(2, '0');
                timeElements[1].textContent = String(hours).padStart(2, '0');
                timeElements[2].textContent = String(minutes).padStart(2, '0');
                timeElements[3].textContent = String(seconds).padStart(2, '0');
            }
        }
        
        // Update immediately
        updateCountdown();
        
        // Update every second
        countdownInterval = setInterval(updateCountdown, 1000);
    }

    // Leaderboard Data Fetching
    async function fetchLeaderboardData() {
        try {
            console.log('Fetching leaderboard data...');
            // Try local API first, then fallback to mock data
            const response = await fetch('https://your-server.wispbyte.com/api/leaderboard');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Full API Response:', JSON.stringify(result, null, 2));
            console.log('Response success:', result.success);
            console.log('Response data:', result.data);
            console.log('Data type:', typeof result.data);
            
            if (result.success && result.data) {
                // Extract end time for countdown
                if (result.data.endsAt) {
                    console.log('Leaderboard ends at:', result.data.endsAt);
                    startCountdown(result.data.endsAt);
                }
                
                // Try different ways to get the players array
                let players = null;
                
                if (result.data.standings && Array.isArray(result.data.standings)) {
                    players = result.data.standings;
                    console.log('Found players in result.data.standings');
                } else if (result.data.data && Array.isArray(result.data.data)) {
                    players = result.data.data;
                    console.log('Found players in result.data.data');
                } else if (Array.isArray(result.data)) {
                    players = result.data;
                    console.log('Found players in result.data');
                } else if (result.data.leaderboard && Array.isArray(result.data.leaderboard)) {
                    players = result.data.leaderboard;
                    console.log('Found players in result.data.leaderboard');
                } else {
                    console.log('Players array not found. Available keys:', Object.keys(result.data));
                    // Log the actual structure
                    if (typeof result.data === 'object') {
                        console.log('Data object structure:');
                        for (let key in result.data) {
                            console.log(`  ${key}:`, typeof result.data[key], Array.isArray(result.data[key]) ? `Array(${result.data[key].length})` : '');
                        }
                    }
                }
                
                if (players && players.length > 0) {
                    console.log('Players found:', players.length);
                    console.log('Top player:', players[0]);
                    updateLeaderboard(players);
                } else {
                    console.log('No players array found, using default data');
                    useDefaultLeaderboardData();
                }
            } else {
                console.log('API response invalid, using default data');
                useDefaultLeaderboardData();
            }
            
        } catch (error) {
            console.error('Error:', error);
            useDefaultLeaderboardData();
        }
    }
    
    function updateLeaderboard(players) {
        console.log('Updating leaderboard with', players.length, 'players');
        
        // Update top 3 cards
        const winnerCards = document.querySelectorAll('.winner-card');
        
        for (let i = 0; i < Math.min(3, players.length); i++) {
            const player = players[i];
            const card = winnerCards[i];
            
            if (card && player) {
                const nameElement = card.querySelector('.winner-name');
                const amountElement = card.querySelector('.winner-amount');
                
                const playerName = player.username || 'Unknown';
                const wagerAmount = player.wageredUsd || 0;
                
                console.log(`Setting card ${i + 1}: ${playerName} - $${wagerAmount}`);
                
                if (nameElement) nameElement.textContent = playerName;
                if (amountElement) amountElement.textContent = `$${wagerAmount.toLocaleString()}`;
            }
        }
        
        // Update table
        updateLeaderboardTable(players);
    }
    
    function updateLeaderboardTable(players) {
        const tableBody = document.getElementById('leaderboardTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        // Add rows for ranks 4-20
        for (let i = 3; i < Math.min(20, players.length); i++) {
            const player = players[i];
            const rank = i + 1;
            
            const row = document.createElement('div');
            row.className = 'table-row';
            row.innerHTML = `
                <div class="table-cell rank">${rank}</div>
                <div class="table-cell name">${player.username || 'Unknown'}</div>
                <div class="table-cell wager">$${(player.wageredUsd || 0).toLocaleString()}</div>
            `;
            
            tableBody.appendChild(row);
        }
    }
    
    function useDefaultLeaderboardData() {
        console.log('Using default leaderboard data');
        // Set default values for top 3
        const defaultPlayers = [
            { username: 'TopPlayer', wageredUsd: 900 },
            { username: 'ShadowBet', wageredUsd: 450 },
            { username: 'LuckyStreamer', wageredUsd: 270 }
        ];
        updateLeaderboard(defaultPlayers);
    }
    
    // FAQ Accordion Functionality
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.fa-chevron-down');
        
        question.addEventListener('click', () => {
            const isOpen = answer.style.display === 'block';
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.querySelector('.faq-answer').style.display = 'none';
                    otherItem.querySelector('.fa-chevron-down').style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle current item
            if (isOpen) {
                answer.style.display = 'none';
                icon.style.transform = 'rotate(0deg)';
            } else {
                answer.style.display = 'block';
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });
    
    // Initialize FAQ answers as hidden
    faqItems.forEach(item => {
        item.querySelector('.faq-answer').style.display = 'none';
    });

    // Initialize leaderboard data
    fetchLeaderboardData();
    
    // Refresh leaderboard data every 30 seconds
    setInterval(fetchLeaderboardData, 30000);
    
    // Start countdown when page loads
    startCountdown();

    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value
            };

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                
                if (result.success) {
                    alert('Thank you for your message! We will get back to you soon.');
                    contactForm.reset();
                } else {
                    alert('There was an error sending your message. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('There was an error sending your message. Please try again.');
            }
        });
    }

    // Load services dynamically on services page
    if (window.location.pathname === '/services' || document.getElementById('services-grid')) {
        loadServices();
    }
});

async function loadServices() {
    try {
        const response = await fetch('/api/services');
        const services = await response.json();
        
        const servicesGrid = document.getElementById('services-grid');
        if (servicesGrid) {
            servicesGrid.innerHTML = services.map(service => `
                <div class="service-card">
                    <div class="service-icon">${service.icon}</div>
                    <h3>${service.title}</h3>
                    <p>${service.description}</p>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading services:', error);
    }
}
