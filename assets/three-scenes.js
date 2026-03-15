/* ============================================
   ZURAQ — Three.js 3D Scenes
   Pakistani Truck Art-Inspired 3D Motifs
   Paisley, floral rosettes, peacock fans,
   scalloped borders, chamak patti panels
   ============================================ */

// --- Truck Art Geometry Builders ---
function createPaisleyShape() {
  // Classic boteh/paisley teardrop shape
  const shape = new THREE.Shape();
  shape.moveTo(0, -1.2);
  shape.bezierCurveTo(0.6, -0.8, 1.0, -0.2, 0.8, 0.4);
  shape.bezierCurveTo(0.6, 0.9, 0.3, 1.3, 0, 1.2);
  shape.bezierCurveTo(-0.3, 1.3, -0.6, 0.9, -0.8, 0.4);
  shape.bezierCurveTo(-1.0, -0.2, -0.6, -0.8, 0, -1.2);
  return shape;
}

function createFlowerShape(petals, innerR, outerR) {
  // Truck art rosette — radial petals
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / petals;
  for (let i = 0; i < petals; i++) {
    const angle1 = i * step;
    const angle2 = (i + 0.5) * step;
    if (i === 0) {
      shape.moveTo(Math.cos(angle1) * outerR, Math.sin(angle1) * outerR);
    } else {
      shape.lineTo(Math.cos(angle1) * outerR, Math.sin(angle1) * outerR);
    }
    shape.quadraticCurveTo(
      Math.cos(angle2) * innerR * 0.5,
      Math.sin(angle2) * innerR * 0.5,
      Math.cos((i + 1) * step) * outerR,
      Math.sin((i + 1) * step) * outerR
    );
  }
  return shape;
}

function createScallopedBorder(segments, radius) {
  // Scalloped edge — like truck art panel borders
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / segments;
  const scallop = radius * 0.15;
  for (let i = 0; i < segments; i++) {
    const a1 = i * step;
    const a2 = (i + 0.5) * step;
    const a3 = (i + 1) * step;
    const x1 = Math.cos(a1) * radius;
    const y1 = Math.sin(a1) * radius;
    const xm = Math.cos(a2) * (radius + scallop);
    const ym = Math.sin(a2) * (radius + scallop);
    const x2 = Math.cos(a3) * radius;
    const y2 = Math.sin(a3) * radius;
    if (i === 0) shape.moveTo(x1, y1);
    shape.quadraticCurveTo(xm, ym, x2, y2);
  }
  return shape;
}

function createPeacockFan(feathers, radius) {
  // Peacock tail fan — iconic truck art element
  const group = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xA0834D,
    transparent: true,
    opacity: 0.12,
    roughness: 0.2,
    metalness: 0.5,
    side: THREE.DoubleSide
  });

  for (let i = 0; i < feathers; i++) {
    const angle = ((i / (feathers - 1)) - 0.5) * Math.PI * 0.6;
    // Feather = elongated ellipse
    const featherShape = new THREE.Shape();
    featherShape.moveTo(0, 0);
    featherShape.bezierCurveTo(0.15, radius * 0.3, 0.1, radius * 0.7, 0, radius);
    featherShape.bezierCurveTo(-0.1, radius * 0.7, -0.15, radius * 0.3, 0, 0);

    const geo = new THREE.ShapeGeometry(featherShape);
    const featherMesh = new THREE.Mesh(geo, mat.clone());
    featherMesh.rotation.z = angle;
    featherMesh.position.z = (i % 2) * 0.02; // slight depth offset

    // Add eye circle at tip
    const eyeGeo = new THREE.RingGeometry(0.06, 0.1, 12);
    const eyeMat = new THREE.MeshPhysicalMaterial({
      color: 0x3C2415,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(Math.sin(angle) * radius * 0.85, Math.cos(angle) * radius * 0.85, 0.01);
    featherMesh.add(eye);

    group.add(featherMesh);
  }
  return group;
}

function createChamakPatti() {
  // Chamak patti — reflective metallic diamond strips (truck art signature)
  const group = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xC4A76E,
    transparent: true,
    opacity: 0.15,
    roughness: 0.05,
    metalness: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    side: THREE.DoubleSide
  });

  for (let i = 0; i < 5; i++) {
    const diamondGeo = new THREE.OctahedronGeometry(0.12, 0);
    const diamond = new THREE.Mesh(diamondGeo, mat);
    diamond.scale.set(1, 1, 0.2);
    diamond.position.set(i * 0.35 - 0.7, 0, 0);
    group.add(diamond);
  }

  // Connecting strip
  const stripGeo = new THREE.PlaneGeometry(2.0, 0.04);
  const stripMat = new THREE.MeshPhysicalMaterial({
    color: 0xC4A76E, transparent: true, opacity: 0.1,
    metalness: 0.8, roughness: 0.1, side: THREE.DoubleSide
  });
  const strip = new THREE.Mesh(stripGeo, stripMat);
  group.add(strip);

  return group;
}


// --- HERO SCENE ---
class HeroScene {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth;
    this.height = container.clientHeight;
    this.mouse = { x: 0, y: 0 };
    this.clock = new THREE.Clock();
    this.motifs = [];
    this.particles = null;

    this.init();
    this.createLights();
    this.createTruckArtMotifs();
    this.createBokehParticles();
    this.animate();
    this.bindEvents();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070707, 0.012);

    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 0, 30);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x070707, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);
  }

  createLights() {
    const ambient = new THREE.AmbientLight(0x222222, 0.6);
    this.scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xC4A76E, 0.8);
    keyLight.position.set(10, 15, 10);
    keyLight.castShadow = true;
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x333333, 0.3);
    fillLight.position.set(-8, 5, 8);
    this.scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x8B6946, 0.4, 50);
    rimLight.position.set(0, -10, 15);
    this.scene.add(rimLight);
  }

  createTruckArtMotifs() {
    const brownMat = new THREE.MeshPhysicalMaterial({
      color: 0x3C2415, transparent: true, opacity: 0.10,
      roughness: 0.1, metalness: 0.3, clearcoat: 1.0,
      clearcoatRoughness: 0.1, side: THREE.DoubleSide
    });
    const goldMat = new THREE.MeshPhysicalMaterial({
      color: 0xA0834D, transparent: true, opacity: 0.14,
      roughness: 0.2, metalness: 0.6, clearcoat: 0.8,
      side: THREE.DoubleSide
    });
    const shimmerMat = new THREE.MeshPhysicalMaterial({
      color: 0xC4A76E, transparent: true, opacity: 0.10,
      roughness: 0.05, metalness: 0.9, clearcoat: 1.0,
      clearcoatRoughness: 0.05, side: THREE.DoubleSide
    });

    // --- Paisley teardrops (3 floating) ---
    for (let i = 0; i < 3; i++) {
      const paisleyShape = createPaisleyShape();
      const geo = new THREE.ExtrudeGeometry(paisleyShape, {
        depth: 0.06, bevelEnabled: true, bevelThickness: 0.02,
        bevelSize: 0.02, bevelSegments: 3
      });
      const mat = [brownMat, goldMat, shimmerMat][i % 3];
      const mesh = new THREE.Mesh(geo, mat.clone());
      const scale = 0.5 + Math.random() * 0.5;
      mesh.scale.set(scale, scale, scale);
      mesh.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15 - 5
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      mesh.userData = {
        rotSpeed: { x: 0.002 + Math.random() * 0.003, y: 0.003 + Math.random() * 0.003, z: 0.001 + Math.random() * 0.002 },
        floatSpeed: 0.3 + Math.random() * 0.4,
        floatAmp: 0.4 + Math.random() * 0.5,
        initY: mesh.position.y
      };
      this.scene.add(mesh);
      this.motifs.push(mesh);
    }

    // --- Floral rosettes (3 floating) ---
    for (let i = 0; i < 3; i++) {
      const petals = [6, 8, 10][i];
      const flowerShape = createFlowerShape(petals, 0.3, 0.7 + Math.random() * 0.3);
      const geo = new THREE.ExtrudeGeometry(flowerShape, {
        depth: 0.04, bevelEnabled: true, bevelThickness: 0.01,
        bevelSize: 0.01, bevelSegments: 2
      });
      const mat = [goldMat, shimmerMat, brownMat][i % 3];
      const mesh = new THREE.Mesh(geo, mat.clone());
      const scale = 0.6 + Math.random() * 0.5;
      mesh.scale.set(scale, scale, scale);
      mesh.position.set(
        (Math.random() - 0.5) * 45,
        (Math.random() - 0.5) * 22,
        -6 + Math.random() * -10
      );
      mesh.userData = {
        rotSpeed: { x: 0.001, y: 0.002 + Math.random() * 0.002, z: 0.003 + Math.random() * 0.002 },
        floatSpeed: 0.2 + Math.random() * 0.3,
        floatAmp: 0.3 + Math.random() * 0.5,
        initY: mesh.position.y
      };
      this.scene.add(mesh);
      this.motifs.push(mesh);
    }

    // --- Peacock fan (2 floating) ---
    for (let i = 0; i < 2; i++) {
      const fan = createPeacockFan(7 + i * 2, 1.2 + Math.random() * 0.5);
      fan.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 18,
        -8 + Math.random() * -8
      );
      fan.scale.set(0.7, 0.7, 0.7);
      fan.userData = {
        rotSpeed: { x: 0.0005, y: 0.001, z: 0.002 + Math.random() * 0.001 },
        floatSpeed: 0.15 + Math.random() * 0.2,
        floatAmp: 0.4 + Math.random() * 0.4,
        initY: fan.position.y
      };
      this.scene.add(fan);
      this.motifs.push(fan);
    }

    // --- Scalloped border rings (2 floating) ---
    for (let i = 0; i < 2; i++) {
      const segments = 12 + i * 4;
      const scallopShape = createScallopedBorder(segments, 0.8 + Math.random() * 0.4);
      const geo = new THREE.ShapeGeometry(scallopShape);
      const mesh = new THREE.Mesh(geo, shimmerMat.clone());
      mesh.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 25,
        -10 + Math.random() * -8
      );
      mesh.userData = {
        rotSpeed: { x: 0, y: 0.001, z: 0.003 + Math.random() * 0.002 },
        floatSpeed: 0.2 + Math.random() * 0.2,
        floatAmp: 0.3 + Math.random() * 0.4,
        initY: mesh.position.y
      };
      this.scene.add(mesh);
      this.motifs.push(mesh);
    }

    // --- Chamak patti strips (3 floating) ---
    for (let i = 0; i < 3; i++) {
      const chamak = createChamakPatti();
      chamak.position.set(
        (Math.random() - 0.5) * 45,
        (Math.random() - 0.5) * 20,
        -5 + Math.random() * -10
      );
      chamak.rotation.z = Math.random() * Math.PI;
      chamak.scale.set(0.8 + Math.random() * 0.4, 0.8, 0.8);
      chamak.userData = {
        rotSpeed: { x: 0.001, y: 0.002, z: 0.001 + Math.random() * 0.002 },
        floatSpeed: 0.25 + Math.random() * 0.3,
        floatAmp: 0.2 + Math.random() * 0.4,
        initY: chamak.position.y
      };
      this.scene.add(chamak);
      this.motifs.push(chamak);
    }

    // --- Bold 8-pointed stars (classic truck art geometry) ---
    for (let i = 0; i < 3; i++) {
      const starGroup = new THREE.Group();

      // Outer star
      const starShape = new THREE.Shape();
      const points = 8;
      const outerR = 0.9 + Math.random() * 0.4;
      const innerR = outerR * 0.45;
      for (let j = 0; j < points * 2; j++) {
        const angle = (j * Math.PI) / points - Math.PI / 2;
        const r = j % 2 === 0 ? outerR : innerR;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (j === 0) starShape.moveTo(x, y);
        else starShape.lineTo(x, y);
      }
      starShape.closePath();

      const starGeo = new THREE.ExtrudeGeometry(starShape, {
        depth: 0.04, bevelEnabled: true, bevelThickness: 0.01,
        bevelSize: 0.01, bevelSegments: 2
      });
      const starMesh = new THREE.Mesh(starGeo, [brownMat, goldMat, shimmerMat][i % 3].clone());
      starGroup.add(starMesh);

      // Center circle
      const centerGeo = new THREE.CircleGeometry(innerR * 0.6, 16);
      const centerMesh = new THREE.Mesh(centerGeo, goldMat.clone());
      centerMesh.position.z = 0.05;
      starGroup.add(centerMesh);

      starGroup.position.set(
        (Math.random() - 0.5) * 42,
        (Math.random() - 0.5) * 20,
        -7 + Math.random() * -8
      );
      const scale = 0.5 + Math.random() * 0.4;
      starGroup.scale.set(scale, scale, scale);
      starGroup.userData = {
        rotSpeed: { x: 0.0008, y: 0.001 + Math.random() * 0.002, z: 0.002 },
        floatSpeed: 0.2 + Math.random() * 0.3,
        floatAmp: 0.3 + Math.random() * 0.5,
        initY: starGroup.position.y
      };
      this.scene.add(starGroup);
      this.motifs.push(starGroup);
    }
  }

  createBokehParticles() {
    const count = 100;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;
      sizes[i] = 0.05 + Math.random() * 0.12;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Golden shimmer particles like chamak patti reflections
    const mat = new THREE.PointsMaterial({
      color: 0xC4A76E,
      size: 0.25,
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);

    this.particleData = [];
    for (let i = 0; i < count; i++) {
      this.particleData.push({
        speed: 0.1 + Math.random() * 0.3,
        amp: 0.2 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const time = this.clock.getElapsedTime();

    // Animate motifs
    this.motifs.forEach(motif => {
      const d = motif.userData;
      motif.rotation.x += d.rotSpeed.x;
      motif.rotation.y += d.rotSpeed.y;
      motif.rotation.z += d.rotSpeed.z;
      motif.position.y = d.initY + Math.sin(time * d.floatSpeed) * d.floatAmp;
    });

    // Animate particles
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < this.particleData.length; i++) {
        const pd = this.particleData[i];
        positions[i * 3 + 1] += Math.sin(time * pd.speed + pd.phase) * 0.003;
        positions[i * 3] += Math.cos(time * pd.speed * 0.7 + pd.phase) * 0.002;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
      this.particles.rotation.y = time * 0.008;
    }

    // Mouse parallax on camera
    this.camera.position.x += (this.mouse.x * 2 - this.camera.position.x) * 0.02;
    this.camera.position.y += (this.mouse.y * 1.5 - this.camera.position.y) * 0.02;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.width = this.container.clientWidth;
      this.height = this.container.clientHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  updateScroll(scrollProgress) {
    if (scrollProgress > 0.8) {
      this.renderer.domElement.style.opacity = 1 - (scrollProgress - 0.8) * 5;
    } else {
      this.renderer.domElement.style.opacity = 1;
    }
  }
}


// --- FLOATING MOTIF SCENE (lighter, for section backgrounds) ---
class MotifScene {
  constructor(container, type = 'paisley') {
    this.container = container;
    this.width = container.clientWidth;
    this.height = container.clientHeight;
    this.clock = new THREE.Clock();
    this.motifs = [];
    this.type = type;

    this.init();
    this.createTruckArtMotifs(type);
    this.animate();

    window.addEventListener('resize', () => this.onResize());
  }

  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    this.camera.position.z = 20;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);

    this.scene.add(new THREE.AmbientLight(0xE8DFD0, 0.5));
    const dirLight = new THREE.DirectionalLight(0xC4A76E, 0.4);
    dirLight.position.set(5, 5, 10);
    this.scene.add(dirLight);
  }

  createTruckArtMotifs(type) {
    const mat = new THREE.MeshPhysicalMaterial({
      color: type === 'paisley' ? 0x3C2415 : 0xA0834D,
      transparent: true,
      opacity: 0.05,
      roughness: 0.2,
      metalness: 0.4,
      side: THREE.DoubleSide
    });

    const count = 6;
    for (let i = 0; i < count; i++) {
      let mesh;

      if (type === 'paisley') {
        const shape = createPaisleyShape();
        const geo = new THREE.ShapeGeometry(shape);
        mesh = new THREE.Mesh(geo, mat.clone());
      } else if (type === 'floral') {
        const shape = createFlowerShape(6 + (i % 3) * 2, 0.2, 0.5);
        const geo = new THREE.ShapeGeometry(shape);
        mesh = new THREE.Mesh(geo, mat.clone());
      } else if (type === 'chamak') {
        mesh = createChamakPatti();
        mesh.children.forEach(child => {
          if (child.material) {
            child.material = child.material.clone();
            child.material.opacity = 0.05;
          }
        });
      } else {
        // Default: 8-pointed star
        const starShape = new THREE.Shape();
        const points = 8;
        const outerR = 0.6; const innerR = 0.28;
        for (let j = 0; j < points * 2; j++) {
          const angle = (j * Math.PI) / points;
          const r = j % 2 === 0 ? outerR : innerR;
          if (j === 0) starShape.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
          else starShape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        starShape.closePath();
        const geo = new THREE.ShapeGeometry(starShape);
        mesh = new THREE.Mesh(geo, mat.clone());
      }

      const scale = 0.5 + Math.random() * 0.6;
      mesh.scale.set(scale, scale, scale);
      mesh.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10 - 5
      );
      mesh.userData = {
        rotSpeed: 0.002 + Math.random() * 0.004,
        floatSpeed: 0.2 + Math.random() * 0.4,
        floatAmp: 0.3 + Math.random() * 0.5,
        initY: mesh.position.y
      };

      this.scene.add(mesh);
      this.motifs.push(mesh);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const time = this.clock.getElapsedTime();

    this.motifs.forEach(m => {
      m.rotation.x += m.userData.rotSpeed;
      m.rotation.y += m.userData.rotSpeed * 1.3;
      m.position.y = m.userData.initY + Math.sin(time * m.userData.floatSpeed) * m.userData.floatAmp;
    });

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }
}


// --- DROP VAULT ANIMATION ---
class DropVault {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth;
    this.height = container.clientHeight;
    this.clock = new THREE.Clock();
    this.isRevealed = false;
    this.doors = [];
    this.revealProgress = 0;

    this.init();
    this.createVault();
    this.animate();

    window.addEventListener('resize', () => this.onResize());
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x2A2019, 0.04);

    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 0, 8);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.container.appendChild(this.renderer.domElement);

    this.scene.add(new THREE.AmbientLight(0xE8DFD0, 0.2));
    const spotlight = new THREE.SpotLight(0xC4A76E, 1.5, 30, Math.PI / 6, 0.5);
    spotlight.position.set(0, 5, 8);
    this.scene.add(spotlight);
    const rimLight = new THREE.PointLight(0xA0834D, 0.6, 20);
    rimLight.position.set(0, 0, 5);
    this.scene.add(rimLight);
  }

  createVault() {
    const doorMat = new THREE.MeshPhysicalMaterial({
      color: 0x3C2415, roughness: 0.3, metalness: 0.7,
      clearcoat: 0.5, transparent: true, opacity: 0.9
    });

    // Left door with truck art scalloped border
    const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(2.5, 4, 0.15), doorMat);
    leftDoor.position.set(-1.25, 0, 0);

    // Add truck art flower ornament
    const flowerShape = createFlowerShape(8, 0.15, 0.4);
    const flowerGeo = new THREE.ShapeGeometry(flowerShape);
    const flowerMat = new THREE.MeshPhysicalMaterial({
      color: 0xC4A76E, metalness: 0.8, roughness: 0.1,
      transparent: true, opacity: 0.5, side: THREE.DoubleSide
    });
    const leftFlower = new THREE.Mesh(flowerGeo, flowerMat);
    leftFlower.position.z = 0.08;
    leftDoor.add(leftFlower);

    this.scene.add(leftDoor);
    this.doors.push({ mesh: leftDoor, targetX: -3.5 });

    // Right door
    const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(2.5, 4, 0.15), doorMat.clone());
    rightDoor.position.set(1.25, 0, 0);
    const rightFlower = new THREE.Mesh(flowerGeo.clone(), flowerMat.clone());
    rightFlower.position.z = 0.08;
    rightDoor.add(rightFlower);
    this.scene.add(rightDoor);
    this.doors.push({ mesh: rightDoor, targetX: 3.5 });

    // Ornamental borders (scalloped)
    [leftDoor, rightDoor].forEach(door => {
      for (let i = 0; i < 3; i++) {
        const scallopShape = createScallopedBorder(12 + i * 4, 0.6 - i * 0.15);
        const scallopGeo = new THREE.ShapeGeometry(scallopShape);
        const scallopMat = new THREE.LineBasicMaterial({ color: 0xC4A76E, transparent: true, opacity: 0.3 });
        const scallop = new THREE.Mesh(scallopGeo, new THREE.MeshPhysicalMaterial({
          color: 0xC4A76E, transparent: true, opacity: 0.15 + i * 0.05,
          metalness: 0.7, roughness: 0.2, side: THREE.DoubleSide
        }));
        scallop.position.z = 0.09;
        scallop.position.y = 0.5 - i * 0.8;
        door.add(scallop);
      }
    });

    // Glow behind doors
    const glowGeo = new THREE.PlaneGeometry(5, 4);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xC4A76E, transparent: true, opacity: 0, side: THREE.DoubleSide
    });
    this.glow = new THREE.Mesh(glowGeo, glowMat);
    this.glow.position.z = -0.5;
    this.scene.add(this.glow);
  }

  reveal(progress) {
    this.revealProgress = Math.max(0, Math.min(1, progress));
    this.doors.forEach(door => {
      const startX = door.targetX > 0 ? 1.25 : -1.25;
      door.mesh.position.x = startX + (door.targetX - startX) * this.easeOutCubic(this.revealProgress);
    });
    if (this.glow) {
      this.glow.material.opacity = this.revealProgress * 0.3;
    }
  }

  easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  animate() {
    requestAnimationFrame(() => this.animate());
    const time = this.clock.getElapsedTime();
    this.doors.forEach(door => {
      door.mesh.children.forEach(child => {
        if (child.type === 'Mesh') {
          child.rotation.z = Math.sin(time * 0.5) * 0.02;
        }
      });
    });
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }
}


// --- EXPORTS ---
window.ZuraqScenes = { HeroScene, MotifScene, DropVault };
