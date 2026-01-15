// ============================================
// 3D STAR MAP - UNIVERSE PAGE
// ============================================

let signalActive = false;

let scene, camera, renderer, starField, blackHole, locations = [];
let mouse = { x: 0, y: 0 };
let isDragging = false;
let previousMouseX = 0;
let rotationVelocity = { x: 0, y: 0 };
let raycaster = new THREE.Raycaster();
let mouseNDC = new THREE.Vector2();
const SIGNAL_MIN_DISTANCE = 1600;
const SIGNAL_MAX_DISTANCE = 3600;
const SIGNAL_CUTOFF = 0.05; // below this = silence




// Location data
const locationData = {
    'Charybdis Prime': {
        title: 'Supermassive Black Hole',
        sector: 'Center of Galaxy',
        distance: '26,000 Light Years',
        status: 'ACTIVE - EMITTING SIGNAL',
        description: 'The source of the quantum psalm frequency. A supermassive black hole at the edge of the known galaxy, broadcasting a signal that predates the formation of stars. Its event horizon marks the boundary between everything humanity knows and something far older.',
        relevance: 'The ultimate destination. The signal emanating from this cosmic giant has been humming since before the first stars ignited—a frequency that calls to something deep within the android\'s circuits.'
    },
    'brigade-base': {
        title: 'Brigade Position',
        sector: 'Sector 7-A',
        distance: '12,500 Light Years',
        status: 'OPERATIONAL',
        description: 'Current position of the Brigade deserters. A mobile fleet operating in deep space, constantly on the move to avoid detection by empire forces. Their makeshift home is a collection of salvaged ships, stolen technology, and ten years of hard-won survival.',
        relevance: 'Home base for the crew who built the android. The Brigade needs a leader to navigate them safely to the Array and beyond—someone who can calculate impossible odds and make the choices they can\'t.'
    },
    'Artemis Array': {
        title: 'The Array',
        sector: 'Research Station Epsilon',
        distance: '18,000 Light Years',
        status: 'HEAVILY GUARDED',
        description: 'A massive research installation studying the black hole signal. The Array is humanity\'s most advanced scientific achievement—and its most valuable military asset. Whoever controls the Array controls access to the frequency, and potentially, to understanding what lies beyond the event horizon.',
        relevance: 'The Brigade\'s target. To reach the black hole, they need the Array\'s technology. But stealing it means facing three converging fleets and risking everything on one impossible heist.'
    },
    'Hegemony': {
        title: 'Empire Fleet Alpha',
        sector: 'Sector 3-C',
        distance: '15,200 Light Years',
        status: 'HOSTILE - CONVERGING',
        description: 'Primary imperial battle fleet. Heavily armed, disciplined, and utterly ruthless. They\'ve been hunting the Brigade for years, but now they\'re redirecting toward the Array. Not to study the signal—to weaponize it.',
        relevance: 'One of three factions racing toward the black hole. Empire Alpha sees the frequency as a weapon, a tool of conquest. They\'ll destroy anyone who stands between them and total control.'
    },
    'Colonial Authority': {
        title: 'Empire Fleet Beta',
        sector: 'Sector 5-D',
        distance: '16,800 Light Years',
        status: 'HOSTILE - CONVERGING',
        description: 'Secondary imperial fleet with experimental technology divisions. Where Alpha uses brute force, Beta uses innovation—often at the cost of ethics, safety, or sanity. Their research into the frequency has already driven several crews mad.',
        relevance: 'The second faction in the race. Empire Beta doesn\'t just want to control the signal—they want to understand it, decode it, use it to rewrite reality itself. Their methods are desperate and dangerous.'
    },
    'Sozuna Station Warzone': {
        title: 'Former War Zone',
        sector: 'Sector 2-B',
        distance: '8,000 Light Years',
        status: 'ABANDONED - WRECKAGE DETECTED',
        description: 'The graveyard of a ten-year war. Shattered ships, debris fields, and the ghosts of battles long finished. This is where the Brigade fought, bled, and lost friends. Where the soldier whose memories now live in the android made their final sacrifice.',
        relevance: 'The past that haunts the present. The android carries memories from this war—ten years of combat, trust, and trauma. Understanding this place might help her understand who she was built from, and who she\'s meant to become.'
    }
};

// Initialize Three.js scene
function initUniverse() {
    const container = document.getElementById('star-field-container');

    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.00015);

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
    );
    camera.position.z = 1000;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);
    container.addEventListener('click', onSceneClick);

    // Create star field
    createStarField();

    // Create black hole
    createBlackHole();

    // Create location markers
    createLocationMarkers();

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onMouseWheel);

    // Start animation
    animate();

    // Setup location clicks
    setupLocationClicks();

    console.log('✅ Universe initialized!');
}

// Create star field
function createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 15000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
        // Random position in sphere
        const radius = Math.random() * 4000 + 500;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);

        // Star colors (mostly white, some colored)
        const colorChoice = Math.random();
        if (colorChoice > 0.95) {
            // Red stars
            colors[i] = 1.0;
            colors[i + 1] = 0.3;
            colors[i + 2] = 0.3;
        } else if (colorChoice > 0.90) {
            // Blue stars
            colors[i] = 0.3;
            colors[i + 1] = 0.5;
            colors[i + 2] = 1.0;
        } else {
            // White stars
            const brightness = Math.random() * 0.5 + 0.5;
            colors[i] = brightness;
            colors[i + 1] = brightness;
            colors[i + 2] = brightness;
        }
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMaterial = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });

    starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
}

// Create black hole with glow
function createBlackHole() {
    // Black hole sphere
    const geometry = new THREE.SphereGeometry(80, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.9
    });
    blackHole = new THREE.Mesh(geometry, material);
    blackHole.position.set(-500, 200, -1500);
    scene.add(blackHole);

    // Accretion disk glow
    const glowGeometry = new THREE.RingGeometry(100, 200, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0033,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
    });
    const accretionDisk = new THREE.Mesh(glowGeometry, glowMaterial);
    accretionDisk.position.copy(blackHole.position);
    accretionDisk.rotation.x = Math.PI / 2;
    scene.add(accretionDisk);

    // Outer glow
    const outerGlowGeometry = new THREE.RingGeometry(200, 300, 64);
    const outerGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0033,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.1
    });
    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    outerGlow.position.copy(blackHole.position);
    outerGlow.rotation.x = Math.PI / 2;
    scene.add(outerGlow);

    // Store for animation
    blackHole.accretionDisk = accretionDisk;
    blackHole.outerGlow = outerGlow;

    blackHole.userData.locationId = 'Charybdis Prime';
    blackHole.userData.type = 'location';
}

// Create location markers
function createLocationMarkers() {
    const markerPositions = {
        'brigade-base': { x: 300, y: -100, z: -800 },
        'Artemis Array': { x: -200, y: 150, z: -1000 },
        'Hegemony': { x: 400, y: 200, z: -600 },
        'Colonial Authority': { x: -350, y: -150, z: -700 },
        'Sozuna Station Warzone': { x: 150, y: -250, z: -500 }
    };
    
    


    Object.keys(markerPositions).forEach(id => {
        const pos = markerPositions[id];
        const geometry = new THREE.SphereGeometry(15, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff0033,
            transparent: true,
            opacity: 0.8
        });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.set(pos.x, pos.y, pos.z);
        marker.userData.locationId = id;
        marker.userData.type = 'location';
        scene.add(marker);
        locations.push(marker);
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate star field slowly
    if (!isDragging) {
        starField.rotation.y += 0.0002 + rotationVelocity.y * 0.95;
        starField.rotation.x += rotationVelocity.x * 0.95;
        rotationVelocity.x *= 0.95;
        rotationVelocity.y *= 0.95;
    }

    // Animate black hole
    if (blackHole) {
        blackHole.accretionDisk.rotation.z += 0.002;
        blackHole.outerGlow.rotation.z -= 0.001;

        // Pulse effect
        const pulse = Math.sin(Date.now() * 0.001) * 0.1 + 1;
        blackHole.accretionDisk.material.opacity = 0.2 + pulse * 0.1;
    }

    // Pulse location markers
    locations.forEach(marker => {
        const pulse = Math.sin(Date.now() * 0.003) * 0.2 + 0.8;
        marker.material.opacity = pulse;
    });

    renderer.render(scene, camera);
}

// Mouse controls
function onMouseDown(e) {
    isDragging = true;
    previousMouseX = e.clientX;
    previousMouseY = e.clientY;
}

function onMouseMove(e) {
    if (isDragging) {
        const deltaX = e.clientX - previousMouseX;
        const deltaY = e.clientY - previousMouseY;

        starField.rotation.y += deltaX * 0.005;
        starField.rotation.x += deltaY * 0.005;

        rotationVelocity.y = deltaX * 0.0001;
        rotationVelocity.x = deltaY * 0.0001;

        previousMouseX = e.clientX;
        previousMouseY = e.clientY;
    }
}

function onMouseUp() {
    isDragging = false;
}

function onMouseWheel(e) {
    e.preventDefault();

    camera.position.z += e.deltaY * 0.5;
    camera.position.z = Math.max(300, Math.min(2000, camera.position.z));

    const indicator = document.getElementById('frequency-indicator');
    if (!indicator) return;

    // Z-depth distance only
    const distance = Math.abs(camera.position.z - blackHole.position.z);

    // Normalize signal strength
    let strength = 1 - (distance - SIGNAL_MIN_DISTANCE) /
        (SIGNAL_MAX_DISTANCE - SIGNAL_MIN_DISTANCE);

    strength = THREE.MathUtils.clamp(strength, 0, 1);

    // Visual indicator
    if (strength > 0) {
        indicator.classList.add('active');
        indicator.style.setProperty('--signal-strength', strength);
    } else {
        indicator.classList.remove('active');
    }

    // Audio behavior
    if (window.frequencyGenerator) {
        if (strength > SIGNAL_CUTOFF && !signalActive) {
            window.frequencyGenerator.start();
            signalActive = true;
        }

        if (strength <= SIGNAL_CUTOFF && signalActive) {
            window.frequencyGenerator.stop();
            signalActive = false;
        }

        if (window.frequencyGenerator.setVolume) {
            window.frequencyGenerator.setVolume(
                strength > SIGNAL_CUTOFF ? strength : 0
            );
        }
    }
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Setup location clicks
function setupLocationClicks() {
    document.querySelectorAll('.location-item').forEach(item => {
        item.addEventListener('click', () => {
            const locationId = item.dataset.location;
            showLocationInfo(locationId);

            const marker = locations.find(m => m.userData.locationId === locationId);
            if (marker) {
                highlightMarker(marker);
            }

        });
    });

    document.getElementById('close-info').addEventListener('click', () => {
        document.getElementById('info-panel').style.display = 'none';
    });
}

// Show location info
function showLocationInfo(locationId) {
    const data = locationData[locationId];
    if (!data) return;

    document.getElementById('info-title').textContent = data.title;
    document.getElementById('info-sector').textContent = data.sector;
    document.getElementById('info-distance').textContent = data.distance;
    document.getElementById('info-status').textContent = data.status;
    document.getElementById('info-description').innerHTML = `<p>${data.description}</p>`;
    document.getElementById('info-relevance').textContent = data.relevance;

    document.getElementById('info-panel').style.display = 'block';

    // Focus camera on location marker
    const marker = locations.find(m => m.userData.locationId === locationId);
    if (marker) {
        // Smooth camera movement (simplified)
        camera.position.z = 600;
    }
}


function highlightMarker(targetMarker) {
    // Reset all markers
    locations.forEach(marker => {
        marker.material.color.set(0xff0033);
        marker.material.opacity = 0.8;
    });

    if (blackHole) {
        blackHole.material.color.set(0x000000);
    }

    // Highlight selected marker
    if (targetMarker.material) {
        targetMarker.material.color.set(0x00ccff); // blue glow
        targetMarker.material.opacity = 1;
    }
}

function onSceneClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();

    mouseNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseNDC.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouseNDC, camera);

    const clickableObjects = [blackHole, ...locations];
    const intersects = raycaster.intersectObjects(clickableObjects);

    if (intersects.length > 0) {
        const object = intersects[0].object;

        if (object.userData.locationId) {
            showLocationInfo(object.userData.locationId);
            highlightMarker(object);
        }
    }
}


// Initialize everything when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initUniverse();
       // initHamburgerMenu();
    });
} else {
    initUniverse();
    //initHamburgerMenu();
}