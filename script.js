// Initialize the map with the provided coordinates
const map = L.map('map').setView([-0.3211635693493237, 31.74243842337778], 17);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Add scale control to the map
L.control.scale({
    imperial: false, // Show only metric units
    position: 'bottomleft'
}).addTo(map);

// Enhanced campus facilities data with corrected categories and unique names
const facilities = [
    {
        id: 1,
        name: "University Church",
        category: "service",
        coordinates: [-0.32092475530636544, 31.74273742653818],
        description: "The church is fundamentally a community of people called together by God, who form the spiritual body of Christ on earth to worship, grow, and serve",
        color: "#f39c12"
    },
    {
        id: 2,
        name: "Main Lecture Theatre",
        category: "academic",
        coordinates: [-0.3209837629777277, 31.74258722283774],
        description: "Large capacity lecture hall for university-wide events and lectures.",
        color: "#3498db"
    },
    {
        id: 3,
        name: "Administration Block - Registrar",
        category: "administrative",
        coordinates: [-0.32096230564272277, 31.742388739376437],
        description: "Central administration offices including Registrar, Marketing Manager, Campus Accountant",
        color: "#8e44ad"
    },
    {
        id: 4,
        name: "Administration Block - VC Office",
        category: "administrative",
        coordinates: [-0.32126002616185656, 31.741991772453837],
        description: "Central administration offices including Vice Chancellor, DOS Office, and Finance departments.",
        color: "#8e44ad"
    },
    {
        id: 5,
        name: "Computer & IT Building",
        category: "academic",
        coordinates: [-0.3213378089987512, 31.74229486206366],
        description: "Houses computer labs, IT departments, and computer science lecture halls.",
        color: "#3498db"
    },
    {
        id: 6,
        name: "University Library",
        category: "academic",
        coordinates: [-0.3213699950000564, 31.74172355156018],
        description: "Main university library with extensive collection of books, journals, and digital resources.",
        color: "#3498db"
    },
    {
        id: 7,
        name: "University Main Hall",
        category: "service",
        coordinates: [-0.3202701948022359, 31.74232522812605],
        description: "Event Center for All students with capacity for 200 students.",
        color: "#e74c3c"
    },
    {
        id: 8,
        name: "Main Cafeteria",
        category: "service",
        coordinates: [-0.3201336411481814, 31.742556614317614],
        description: "Central dining facility serving meals throughout the day.",
        color: "#e74c3c"
    },
    {
        id: 9,
        name: "Health Center",
        category: "service",
        coordinates: [-0.3202967469014167, 31.742863864834273],
        description: "University medical facility providing basic healthcare services.",
        color: "#e74c3c"
    },
    {
        id: 10,
        name: "Student Hostel A",
        category: "residential",
        coordinates: [-0.32039347240502075, 31.742719722616584],
        description: "Accommodation for first-year students with capacity for 200 students.",
        color: "#2ecc71"
    },
    {
        id: 11,
        name: "Student Hostel B",
        category: "residential",
        coordinates: [-0.3201677795618572, 31.74202935725815],
        description: "Accommodation for continuing students with shared facilities.",
        color: "#2ecc71"
    },
    {
        id: 12,
        name: "Main Campus Gate",
        category: "service",
        coordinates: [-0.3241537436151624, 31.74147457039186],
        description: "The gate serves as the main entrance and security checkpoint for controlling access to the university campus.",
        color: "#e74c3c"
    },
    {
        id: 13,
        name: "Sports Complex",
        category: "service",
        coordinates: [-0.3216231263456627, 31.74346249396298],
        description: "Includes football field, basketball court, and indoor sports facilities.",
        color: "#e74c3c"
    }
];

// Create marker layers
let facilityMarkers = [];
let routingLayer = null;
let startMarker = null;
let endMarker = null;
let routeArrows = [];

// Enhanced facility markers with better styling
facilities.forEach(facility => {
    const marker = L.circleMarker(facility.coordinates, {
        color: facility.color,
        fillColor: facility.color,
        fillOpacity: 0.8,
        radius: 10,
        weight: 3
    }).addTo(map);
    
    // Enhanced popup with better styling
    marker.bindPopup(`
        <div style="min-width: 280px; padding: 5px;">
            <h3 style="margin: 0 0 12px 0; color: ${facility.color}; border-bottom: 2px solid ${facility.color}; padding-bottom: 8px;">
                ${facility.name}
            </h3>
            <p style="margin: 8px 0;"><strong>Category:</strong> ${facility.category.charAt(0).toUpperCase() + facility.category.slice(1)}</p>
            <p style="margin: 8px 0;">${facility.description}</p>
            <p style="margin: 8px 0;"><strong>Coordinates:</strong><br>${facility.coordinates[0].toFixed(6)}, ${facility.coordinates[1].toFixed(6)}</p>
        </div>
    `);
    
    marker.facilityData = facility;
    facilityMarkers.push(marker);
});

// Populate routing dropdowns
const startPointSelect = document.getElementById('start-point');
const endPointSelect = document.getElementById('end-point');

facilities.forEach(facility => {
    const option = document.createElement('option');
    option.value = facility.id;
    option.textContent = facility.name;
    
    startPointSelect.appendChild(option.cloneNode(true));
    endPointSelect.appendChild(option);
});

// Filter functionality
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        this.classList.add('active');
        
        const filter = this.getAttribute('data-filter');
        
        // Show/hide markers based on filter
        facilityMarkers.forEach(marker => {
            if (filter === 'all' || marker.facilityData.category === filter) {
                marker.addTo(map);
            } else {
                map.removeLayer(marker);
            }
        });
    });
});

// Search functionality
document.getElementById('search-btn').addEventListener('click', performSearch);
document.getElementById('search-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        performSearch();
    }
});

function performSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    
    if (!searchTerm) {
        alert('Please enter a search term');
        return;
    }
    
    const foundFacilities = facilities.filter(facility => 
        facility.name.toLowerCase().includes(searchTerm) ||
        facility.description.toLowerCase().includes(searchTerm) ||
        facility.category.toLowerCase().includes(searchTerm)
    );
    
    if (foundFacilities.length === 0) {
        alert('No facilities found matching your search.');
        return;
    }
    
    // Clear any existing highlights
    facilityMarkers.forEach(marker => {
        marker.setStyle({
            radius: 10,
            weight: 3
        });
    });
    
    // Highlight found facilities
    foundFacilities.forEach(facility => {
        const marker = facilityMarkers.find(m => m.facilityData.id === facility.id);
        if (marker) {
            marker.setStyle({
                radius: 15,
                weight: 4,
                fillOpacity: 1
            });
            marker.openPopup();
        }
    });
    
    // Fit map to show all found facilities
    const group = new L.featureGroup(foundFacilities.map(facility => 
        facilityMarkers.find(m => m.facilityData.id === facility.id)
    ));
    map.fitBounds(group.getBounds(), { padding: [30, 30] });
}

// Enhanced Routing functionality with better visualization
document.getElementById('calculate-route').addEventListener('click', function() {
    const startId = parseInt(startPointSelect.value);
    const endId = parseInt(endPointSelect.value);
    
    if (!startId || !endId) {
        alert('Please select both starting point and destination');
        return;
    }
    
    if (startId === endId) {
        alert('Starting point and destination cannot be the same');
        return;
    }
    
    const startFacility = facilities.find(f => f.id === startId);
    const endFacility = facilities.find(f => f.id === endId);
    
    // Clear previous route and markers
    clearRoute();
    
    // Create a more realistic route with path simulation
    const routePoints = simulateRealisticRoute(startFacility.coordinates, endFacility.coordinates);
    
    // Create enhanced route line
    routingLayer = L.polyline(routePoints, {
        color: '#9b59b6',
        weight: 6,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: null
    }).addTo(map);
    
    // Add direction arrows along the route
    addDirectionArrows(routePoints);
    
    // Enhanced start and end markers
    startMarker = L.circleMarker(startFacility.coordinates, {
        color: '#2ecc71',
        fillColor: '#2ecc71',
        fillOpacity: 1,
        radius: 12,
        weight: 4
    }).addTo(map).bindPopup(`
        <div style="text-align: center; padding: 5px;">
            <h4 style="color: #2ecc71; margin: 0 0 8px 0;">🚩 Start Point</h4>
            <strong>${startFacility.name}</strong>
        </div>
    `).openPopup();
    
    endMarker = L.circleMarker(endFacility.coordinates, {
        color: '#e74c3c',
        fillColor: '#e74c3c',
        fillOpacity: 1,
        radius: 12,
        weight: 4
    }).addTo(map).bindPopup(`
        <div style="text-align: center; padding: 5px;">
            <h4 style="color: #e74c3c; margin: 0 0 8px 0;">🎯 Destination</h4>
            <strong>${endFacility.name}</strong>
        </div>
    `);
    
    // Calculate and display route information
    const distance = calculateRouteDistance(routePoints);
    const estimatedTime = calculateEstimatedTime(distance);
    
    // Show route information
    showRouteInfo(distance, estimatedTime, startFacility.name, endFacility.name);
    
    // Fit map to show the entire route with optimal padding
    map.fitBounds(routingLayer.getBounds(), { padding: [60, 60] });
});

// Simulate a more realistic route with curves and intermediate points
function simulateRealisticRoute(start, end) {
    const points = [start];
    
    // Calculate intermediate points for a more natural path
    const numIntermediatePoints = 3;
    
    for (let i = 1; i <= numIntermediatePoints; i++) {
        const factor = i / (numIntermediatePoints + 1);
        const intermediatePoint = [
            start[0] + (end[0] - start[0]) * factor + (Math.random() - 0.5) * 0.0002,
            start[1] + (end[1] - start[1]) * factor + (Math.random() - 0.5) * 0.0002
        ];
        points.push(intermediatePoint);
    }
    
    points.push(end);
    return points;
}

// Add direction arrows along the route
function addDirectionArrows(routePoints) {
    routeArrows = [];
    
    for (let i = 0; i < routePoints.length - 1; i++) {
        const start = routePoints[i];
        const end = routePoints[i + 1];
        
        // Add arrows at regular intervals
        const numArrows = Math.max(1, Math.floor(calculateDistance(start, end) / 50));
        
        for (let j = 1; j <= numArrows; j++) {
            const factor = j / (numArrows + 1);
            const arrowPoint = [
                start[0] + (end[0] - start[0]) * factor,
                start[1] + (end[1] - start[1]) * factor
            ];
            
            const angle = Math.atan2(end[1] - start[1], end[0] - start[0]) * 180 / Math.PI;
            
            const arrowIcon = L.divIcon({
                className: 'route-arrow',
                html: `<div style="transform: rotate(${angle}deg); color: #9b59b6; font-size: 16px; font-weight: bold;">➤</div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            });
            
            const arrowMarker = L.marker(arrowPoint, { 
                icon: arrowIcon,
                interactive: false
            }).addTo(map);
            
            routeArrows.push(arrowMarker);
        }
    }
}

// Calculate route distance in meters using Haversine formula
function calculateRouteDistance(routePoints) {
    let totalDistance = 0;
    for (let i = 0; i < routePoints.length - 1; i++) {
        totalDistance += calculateDistance(routePoints[i], routePoints[i + 1]);
    }
    return totalDistance;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(point1, point2) {
    const R = 6371000; // Earth's radius in meters
    const lat1 = point1[0] * Math.PI / 180;
    const lat2 = point2[0] * Math.PI / 180;
    const deltaLat = (point2[0] - point1[0]) * Math.PI / 180;
    const deltaLon = (point2[1] - point1[1]) * Math.PI / 180;

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

// Calculate estimated walking time
function calculateEstimatedTime(distance) {
    const walkingSpeed = 1.4; // meters per second (average walking speed)
    const timeInMinutes = (distance / walkingSpeed) / 60;
    return Math.ceil(timeInMinutes);
}

// Display route information
function showRouteInfo(distance, time, startName, endName) {
    // Create or update route info panel
    let routeInfo = document.getElementById('route-info');
    
    if (!routeInfo) {
        routeInfo = document.createElement('div');
        routeInfo.id = 'route-info';
        routeInfo.className = 'route-info';
        document.querySelector('.controls-panel').appendChild(routeInfo);
    }
    
    routeInfo.innerHTML = `
        <h4>📍 Route Information</h4>
        <div class="route-details">
            <p><strong>From:</strong> ${startName}</p>
            <p><strong>To:</strong> ${endName}</p>
            <p><strong>Distance:</strong> <span class="highlight">${distance.toFixed(0)} meters</span></p>
            <p><strong>Estimated Time:</strong> <span class="highlight">${time} minutes walk</span></p>
        </div>
    `;
    
    // Add CSS for route info if not already present
    if (!document.querySelector('#route-info-styles')) {
        const style = document.createElement('style');
        style.id = 'route-info-styles';
        style.textContent = `
            .route-info {
                background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #9b59b6;
                margin: 15px 0;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .route-info h4 {
                color: #2c3e50;
                margin: 0 0 12px 0;
                font-size: 1.1em;
                border-bottom: 1px solid #bdc3c7;
                padding-bottom: 8px;
            }
            .route-details p {
                margin: 8px 0;
                font-size: 0.95em;
            }
            .highlight {
                color: #9b59b6;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);
    }
}

// Enhanced clear route functionality
document.getElementById('clear-route').addEventListener('click', clearRoute);

function clearRoute() {
    // Clear route line
    if (routingLayer) {
        map.removeLayer(routingLayer);
        routingLayer = null;
    }
    
    // Clear start and end markers
    if (startMarker) {
        map.removeLayer(startMarker);
        startMarker = null;
    }
    
    if (endMarker) {
        map.removeLayer(endMarker);
        endMarker = null;
    }
    
    // Clear route arrows
    routeArrows.forEach(arrow => {
        map.removeLayer(arrow);
    });
    routeArrows = [];
    
    // Clear route info panel
    const routeInfo = document.getElementById('route-info');
    if (routeInfo) {
        routeInfo.remove();
    }
    
    // Reset dropdowns
    startPointSelect.value = '';
    endPointSelect.value = '';
    
    // Reset search
    document.getElementById('search-input').value = '';
    
    // Reset all facility markers to normal style
    facilityMarkers.forEach(marker => {
        marker.setStyle({
            radius: 10,
            weight: 3,
            fillOpacity: 0.8
        });
    });
    
    // Reset view to campus
    map.setView([-0.3211635693493237, 31.74243842337778], 17);
}

// Enhanced responsive behavior
function handleResize() {
    setTimeout(() => {
        map.invalidateSize();
        // Re-center if we have a route
        if (routingLayer) {
            map.fitBounds(routingLayer.getBounds(), { padding: [60, 60] });
        }
    }, 150);
}

// Add resize event listener
window.addEventListener('resize', handleResize);

// Initialize map size after page load
window.addEventListener('load', function() {
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl + R to calculate route
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        document.getElementById('calculate-route').click();
    }
    // Ctrl + C to clear route
    if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        document.getElementById('clear-route').click();
    }
    // Escape to clear search
    if (e.key === 'Escape') {
        document.getElementById('search-input').value = '';
        clearRoute();
    }
});