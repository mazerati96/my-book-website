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
let universeGroup;
const SIGNAL_MIN_DISTANCE = 1700;
const SIGNAL_MAX_DISTANCE = 2600;

const SIGNAL_CUTOFF = 0.12;





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

    // CREATE UNIVERSE GROUP - This will hold everything we want to rotate
    universeGroup = new THREE.Group();
    scene.add(universeGroup);

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
// UPDATE createStarField() - add stars to universeGroup instead of scene:
function createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 15000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
        const radius = Math.random() * 4000 + 500;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);

        const colorChoice = Math.random();
        if (colorChoice > 0.95) {
            colors[i] = 1.0;
            colors[i + 1] = 0.3;
            colors[i + 2] = 0.3;
        } else if (colorChoice > 0.90) {
            colors[i] = 0.3;
            colors[i + 1] = 0.5;
            colors[i + 2] = 1.0;
        } else {
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
    universeGroup.add(starField); // Changed from scene.add()
}

// Create black hole with glow
function createBlackHole() {
    // Central black sphere (event horizon)
    const geometry = new THREE.SphereGeometry(80, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 1.0
    });
    blackHole = new THREE.Mesh(geometry, material);
    blackHole.position.set(-500, 200, -1500);
    universeGroup.add(blackHole);

    // Create VIBRANT multi-layered accretion disk
    const diskLayers = [];

    // Layer 1: Inner BLAZING region (electric blue-white)
    const innerDisk = new THREE.RingGeometry(85, 120, 64);
    const innerMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff, // BRIGHT CYAN
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
    });
    const innerRing = new THREE.Mesh(innerDisk, innerMaterial);
    innerRing.position.copy(blackHole.position);
    innerRing.rotation.x = Math.PI / 2;
    universeGroup.add(innerRing);
    diskLayers.push(innerRing);

    // Layer 2: Mid region (NEON GREEN)
    const midDisk1 = new THREE.RingGeometry(120, 160, 64);
    const midMaterial1 = new THREE.MeshBasicMaterial({
        color: 0x00ff88, // BRIGHT GREEN
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75
    });
    const midRing1 = new THREE.Mesh(midDisk1, midMaterial1);
    midRing1.position.copy(blackHole.position);
    midRing1.rotation.x = Math.PI / 2;
    universeGroup.add(midRing1);
    diskLayers.push(midRing1);

    // Layer 3: Mid-outer region (BRIGHT GOLD)
    const midDisk2 = new THREE.RingGeometry(160, 200, 64);
    const midMaterial2 = new THREE.MeshBasicMaterial({
        color: 0xffaa00, // BRIGHT GOLD/ORANGE
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65
    });
    const midRing2 = new THREE.Mesh(midDisk2, midMaterial2);
    midRing2.position.copy(blackHole.position);
    midRing2.rotation.x = Math.PI / 2;
    universeGroup.add(midRing2);
    diskLayers.push(midRing2);

    // Layer 4: Outer region (HOT PINK/RED)
    const outerDisk = new THREE.RingGeometry(200, 240, 64);
    const outerMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0066, // HOT PINK
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55
    });
    const outerRing = new THREE.Mesh(outerDisk, outerMaterial);
    outerRing.position.copy(blackHole.position);
    outerRing.rotation.x = Math.PI / 2;
    universeGroup.add(outerRing);
    diskLayers.push(outerRing);

    // Layer 5: Outermost PURPLE glow
    const glowDisk = new THREE.RingGeometry(240, 300, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xaa00ff, // BRIGHT PURPLE
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35
    });
    const glowRing = new THREE.Mesh(glowDisk, glowMaterial);
    glowRing.position.copy(blackHole.position);
    glowRing.rotation.x = Math.PI / 2;
    universeGroup.add(glowRing);
    diskLayers.push(glowRing);

    // PHOTON RING (gravitational lensing - BRIGHT WHITE)
    const lensGeometry = new THREE.RingGeometry(75, 85, 64);
    const lensMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
    });
    const photonRing = new THREE.Mesh(lensGeometry, lensMaterial);
    photonRing.position.copy(blackHole.position);
    photonRing.rotation.x = Math.PI / 2;
    universeGroup.add(photonRing);

    // ======================================
    // PARTICLE SYSTEM - Swirling matter!
    // ======================================
    const particleCount = 3000;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Random position in disk
        const angle = Math.random() * Math.PI * 2;
        const radius = 100 + Math.random() * 200; // Between inner and outer disk
        const height = (Math.random() - 0.5) * 20; // Slight thickness

        particlePositions[i3] = Math.cos(angle) * radius;
        particlePositions[i3 + 1] = height;
        particlePositions[i3 + 2] = Math.sin(angle) * radius;

        // Color based on distance from center (mimics disk colors)
        if (radius < 130) {
            // CYAN
            particleColors[i3] = 0.0;
            particleColors[i3 + 1] = 1.0;
            particleColors[i3 + 2] = 1.0;
        } else if (radius < 170) {
            // GREEN
            particleColors[i3] = 0.0;
            particleColors[i3 + 1] = 1.0;
            particleColors[i3 + 2] = 0.5;
        } else if (radius < 210) {
            // GOLD
            particleColors[i3] = 1.0;
            particleColors[i3 + 1] = 0.7;
            particleColors[i3 + 2] = 0.0;
        } else if (radius < 250) {
            // PINK
            particleColors[i3] = 1.0;
            particleColors[i3 + 1] = 0.0;
            particleColors[i3 + 2] = 0.4;
        } else {
            // PURPLE
            particleColors[i3] = 0.7;
            particleColors[i3 + 1] = 0.0;
            particleColors[i3 + 2] = 1.0;
        }

        // Store velocity data for rotation
        particleVelocities.push({
            angle: angle,
            radius: radius,
            speed: 0.002 + (1 / radius) * 30 // Inner particles move faster
        });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending // Makes particles glow!
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    particleSystem.position.copy(blackHole.position);
    universeGroup.add(particleSystem);

    // Store everything for animation
    blackHole.diskLayers = diskLayers;
    blackHole.photonRing = photonRing;
    blackHole.particleSystem = particleSystem;
    blackHole.particleVelocities = particleVelocities;

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
        universeGroup.add(marker); // Changed from scene.add()
        locations.push(marker);
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Apply momentum rotation to universe group
    if (!isDragging) {
        universeGroup.rotation.y += 0.0002 + rotationVelocity.y * 0.95;
        universeGroup.rotation.x += rotationVelocity.x * 0.95;

        // Clamp X rotation
        universeGroup.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, universeGroup.rotation.x));

        rotationVelocity.x *= 0.95;
        rotationVelocity.y *= 0.95;
    }

    // Animate black hole accretion disk 
    if (blackHole && blackHole.diskLayers) {
        const time = Date.now() * 0.001;

        blackHole.diskLayers.forEach((layer, index) => {
            const speed = 0.004 - (index * 0.0007);
            layer.rotation.z += speed;

            const pulse = Math.sin(time * 1.5 + index) * 0.15 + 0.85;
            layer.material.opacity = (0.9 - index * 0.12) * pulse;
        });

        if (blackHole.photonRing) {
            const photonPulse = Math.sin(time * 3) * 0.3 + 0.6;
            blackHole.photonRing.material.opacity = photonPulse;
            blackHole.photonRing.rotation.z += 0.015;
        }

        if (blackHole.particleSystem && blackHole.particleVelocities) {
            const positions = blackHole.particleSystem.geometry.attributes.position.array;

            blackHole.particleVelocities.forEach((vel, i) => {
                const i3 = i * 3;
                vel.angle += vel.speed;

                positions[i3] = Math.cos(vel.angle) * vel.radius;
                positions[i3 + 2] = Math.sin(vel.angle) * vel.radius;
                positions[i3 + 1] += Math.sin(time * 2 + i) * 0.1;
            });

            blackHole.particleSystem.geometry.attributes.position.needsUpdate = true;
        }
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

        // Rotate the ENTIRE UNIVERSE GROUP
        universeGroup.rotation.y += deltaX * 0.005;
        universeGroup.rotation.x += deltaY * 0.005;

        // Clamp X rotation so you don't flip upside down (optional)
        universeGroup.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, universeGroup.rotation.x));

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
    if (strength > SIGNAL_CUTOFF) {
        indicator.classList.add('active');
        indicator.style.setProperty('--signal-strength', strength);
    } else {
        indicator.classList.remove('active');
        indicator.style.setProperty('--signal-strength', 0);
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