# Consultio - Quantitative Risk Consulting Portfolio

## ✨ Features

- **Dual Theme Support** - Dark mode default with beautiful blue glow effects, toggle to light mode
- **Custom Mouse Animation** - Subtle particle effects with glow trails (optimized for dark theme)
- **Fully Responsive** - Perfect on desktop, tablet, and mobile devices
- **4 Complete Pages** - Home, About, Project, Contact
- **CV Download** - Ready for your PDF resume
- **GitHub Integration** - Links to your project repository
- **Flexible Media Grid** - Easy to add images and GIFs
- **Corporate + Scientific Design** - Clean, professional, minimalist
- **No Dependencies** - Pure vanilla JS, no frameworks

## 🚀 Quick Start

📁 Project Structure

consultio-portfolio/
│
├── index.html                          # Home page
├── about.html                           # CV/Resume page
├── project-particle-simulator.html      # Research project
├── contact.html                         # Contact page
├── README.md                            # This file
│
├── css/                                 # Stylesheets
│   ├── main.css                          # Global styles, theme
│   ├── home.css                          # Home page
│   ├── about.css                         # About page
│   ├── contact.css                       # Contact page
│   └── project.css                       # Project page
│
├── js/                                  # JavaScript
│   ├── main.js                           # Entry point
│   ├── modules/                          # Reusable modules
│   │   ├── mouseTracking.js               # Custom cursor
│   │   ├── themeManager.js                # Dark/light mode
│   │   └── utils.js                       # Helper functions
│   └── pages/                            # Page logic
│       ├── home.js
│       ├── about.js
│       ├── contact.js
│       └── project.js
│
└── assets/                              # Static files
    ├── images/                           # Images & GIFs
    └── resume.pdf                        # Downloadable CV
🎨 Theme System
Dark Theme (Default)
css
[data-theme="dark"] {
    --primary-color: #64b5f6;    /* Bright blue headings */
    --accent-color: #64b5f6;      /* Accent blue */
    --text-color: #ffffff;         /* Pure white text */
    --background: #0a1929;         /* Deep navy */
    --card-bg: #132f4c;            /* Dark blue cards */
    --glow: 0 0 20px #64b5f6;      /* Blue glow effect */
}
Light Theme
css
:root {
    --primary-color: #1a2b3c;     /* Dark blue */
    --accent-color: #3498db;       /* Scientific blue */
    --text-color: #2c3e50;         /* Dark gray */
    --background: #ffffff;          /* White */
}

#How to Enable Light/Dark Mode:
Currently Only Dark Mode Enabled

you can uncomment this in nav section 
<button class="theme-toggle" id="themeToggle">
    <i class="fas fa-moon"></i>
    <i class="fas fa-sun"></i>
</button>

🖱️ Mouse Animation
The custom cursor features:

Triple-layer design: Dot, ring, and outer glow

10 particles with pulsing blue glow

Particle connections in dark mode

Smooth follow (smoothing: 0.06)

Click burst effects

Configuration
In js/modules/mouseTracking.js:

javascript
const config = {
    particleCount: 10,      // Number of particles (5-15 recommended)
    particleSize: 4,        // Particle size
    ringSize: 40,           // Cursor ring size
    smoothing: 0.06,        // Follow speed (lower = slower)
    // ...
};
📱 Mobile Responsiveness
The site is fully optimized for mobile devices:

Breakpoints: 1024px, 768px, 480px

Touch-friendly hover states

Responsive navigation that wraps

Optimized fonts and spacing

Theme-color meta tag for mobile browser UI

🔧 Customization Guide
Changing Colors
Edit CSS variables in css/main.css:

css
:root {  /* Light mode */
    --primary-color: #1a2b3c;  /* Change this */
    --accent-color: #3498db;   /* Change this */
}

[data-theme="dark"] {  /* Dark mode */
    --primary-color: #64b5f6;  /* Change this */
    --accent-color: #64b5f6;   /* Change this */
}
Adding Images
Save images to assets/images/

Use path: assets/images/your-image.jpg

Recommended size: Under 500KB

Formats: JPG, PNG, GIF

Adding Media to Project Page
Copy this block in project-particle-simulator.html:

html
<div class="media-item">
    <div class="media-container">
        <img src="assets/images/your-image.jpg" alt="Description">
    </div>
    <p class="media-caption">Your caption</p>
</div>
Making a Square Larger
html
<!-- Full width -->
<div class="media-item large">

<!-- 2/3 width -->
<div class="media-item" style="grid-column: span 2;">

📄 Page Descriptions
Home Page (index.html)
Company landing with data visualization

Metrics strip (experience, projects, satisfaction)

Service preview cards

About Page (about.html)
Professional summary

Timeline experience section

Education grid

Skills categories

Downloadable CV button

Project Page (project-particle-simulator.html)
GitHub repository link

Project description

Flexible media grid

Technical details

Future research directions

Contact Page (contact.html)
Email: smdw1997@gmail.com

Location: SE13, London

LinkedIn and GitHub links

Form placeholder for future expansion

Version: 1.0.0
Last Updated: February 2026