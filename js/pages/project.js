/**
 * Project Page Module
 * Handles particle simulator project page functionality
 */

const ProjectPage = (function() {
    'use strict';
    
    // Private variables
    let gifOverlay = null;
    let toggleBtn = null;
    let placeholderImg = null;
    let isGifVisible = false;
    
    /**
     * Initialize project page
     */
    function init() {
        console.log('Project page initialized');
        
        // Get DOM elements
        gifOverlay = document.getElementById('gifOverlay');
        toggleBtn = document.getElementById('toggleGif');
        placeholderImg = document.getElementById('placeholderImage');
        
        // Setup media controls
        if (toggleBtn && gifOverlay) {
            setupMediaControls();
        }
        
        // Initialize backend integration placeholder
        initBackendSection();
        
        // Initialize data visualization section
        initDataVizSection();
    }
    
    /**
     * Setup media controls for toggling between image and GIF
     */
    function setupMediaControls() {
        toggleBtn.addEventListener('click', toggleGif);
        
        // Optional: Add keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.key === 'g' || e.key === 'G') {
                toggleGif();
            }
        });
    }
    
    /**
     * Toggle between placeholder image and GIF
     */
    function toggleGif() {
        isGifVisible = !isGifVisible;
        
        if (isGifVisible) {
            gifOverlay.classList.add('active');
            toggleBtn.textContent = 'Show Placeholder';
        } else {
            gifOverlay.classList.remove('active');
            toggleBtn.textContent = 'Show Demo GIF';
        }
    }
    
    /**
     * Initialize backend integration section
     */
    function initBackendSection() {
        const backendSection = document.getElementById('backendSection');
        
        if (backendSection) {
            // This section will be populated with data from backend
            // For now, show a placeholder
            backendSection.innerHTML = `
                <h2>Simulation Data</h2>
                <div class="backend-placeholder">
                    <p>Backend integration ready for:</p>
                    <ul>
                        <li>Particle trajectory data</li>
                        <li>Simulation parameters</li>
                        <li>User-generated simulations</li>
                    </ul>
                </div>
            `;
        }
    }
    
    /**
     * Initialize data visualization section for GNUplot integration
     */
    function initDataVizSection() {
        const dataViz = document.getElementById('dataViz');
        
        if (dataViz) {
            // Structure for future GNUplot integration
            const vizContainer = document.createElement('div');
            vizContainer.className = 'gnuplot-container';
            vizContainer.id = 'gnuplotContainer';
            vizContainer.setAttribute('data-gnuplot-ready', 'true');
            
            dataViz.appendChild(vizContainer);
            
            // Add configuration options for GNUplot
            addGNUplotConfig();
        }
    }
    
    /**
     * Add GNUplot configuration panel
     */
    function addGNUplotConfig() {
        const dataViz = document.getElementById('dataViz');
        
        if (!dataViz) return;
        
        const configPanel = document.createElement('div');
        configPanel.className = 'gnuplot-config';
        configPanel.innerHTML = `
            <h3>GNUplot Configuration</h3>
            <div class="config-options">
                <label>
                    <input type="checkbox" id="showTrajectory" checked>
                    Show particle trajectories
                </label>
                <label>
                    <input type="checkbox" id="showHeatmap">
                    Show heatmap
                </label>
                <label>
                    <input type="checkbox" id="showVelocity">
                    Show velocity vectors
                </label>
            </div>
            <button class="btn" id="updateViz">Update Visualization</button>
        `;
        
        dataViz.appendChild(configPanel);
        
        // Add event listener for update button
        const updateBtn = document.getElementById('updateViz');
        if (updateBtn) {
            updateBtn.addEventListener('click', updateVisualization);
        }
    }
    
    /**
     * Update visualization (placeholder for GNUplot integration)
     */
    function updateVisualization() {
        console.log('Updating visualization with GNUplot');
        
        // This function will be replaced with actual GNUplot integration
        const container = document.getElementById('gnuplotContainer');
        
        if (container) {
            container.innerHTML = '<p class="loading">Generating GNUplot visualization...</p>';
            
            // Simulate GNUplot processing
            setTimeout(() => {
                container.innerHTML = `
                    <div class="viz-result">
                        <p>GNUplot visualization ready</p>
                        <pre>
set terminal png
set output 'trajectory.png'
plot 'data.txt' using 1:2 with lines
                        </pre>
                    </div>
                `;
            }, 1500);
        }
    }
    
    /**
     * Load particle simulation data from backend
     * @param {Object} params - Simulation parameters
     */
    async function loadSimulationData(params = {}) {
        try {
            // This function will fetch data from backend
            const defaultParams = {
                particles: 100,
                iterations: 1000,
                gravity: 9.81
            };
            
            const config = { ...defaultParams, ...params };
            
            // Simulate API call
            const response = await fetch('/api/simulation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(config)
            });
            
            if (!response.ok) {
                throw new Error('Failed to load simulation data');
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Error loading simulation data:', error);
            return null;
        }
    }
    
    /**
     * Export simulation data for GNUplot
     * @param {Array} data - Simulation data
     */
    function exportForGNUplot(data) {
        // Format data for GNUplot
        const formattedData = data.map(point => 
            `${point.x} ${point.y} ${point.z || 0}`
        ).join('\n');
        
        // Create download link
        const blob = new Blob([formattedData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'simulation_data.txt';
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    // Public API
    return {
        init,
        loadSimulationData,
        exportForGNUplot,
        updateVisualization
    };
})();