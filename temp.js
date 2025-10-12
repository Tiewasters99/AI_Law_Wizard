import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const QuaintonLawMiniverse = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const lampShadesRef = useRef([]);
  const lampLightsRef = useRef([]);
  
  const [showHelp, setShowHelp] = useState(true);
  const [selectedContent, setSelectedContent] = useState(null);
  const [lampsOn, setLampsOn] = useState(true);
  const [showMusicPanel, setShowMusicPanel] = useState(false);

  useEffect(() => {
    if (!sceneRef.current) return;
    
    lampShadesRef.current.forEach(shade => {
      if (shade.material) {
        shade.material.emissiveIntensity = lampsOn ? 0.5 : 0;
      }
    });
    
    lampLightsRef.current.forEach(light => {
      light.intensity = lampsOn ? 0.8 : 0;
    });
  }, [lampsOn]);

  useEffect(() => {
    if (!mountRef.current) return;

    let frameId;
    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x2a2a40);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    currentMount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 0.7);
    directional.position.set(10, 10, 10);
    directional.castShadow = true;
    scene.add(directional);

    const lampLight1 = new THREE.PointLight(0xffd700, lampsOn ? 0.8 : 0, 10);
    lampLight1.position.set(-8, 2, 8);
    scene.add(lampLight1);

    const lampLight2 = new THREE.PointLight(0xffd700, lampsOn ? 0.8 : 0, 10);
    lampLight2.position.set(8, 2, 8);
    scene.add(lampLight2);

    lampLightsRef.current = [lampLight1, lampLight2];

    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x3a3a50 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xd4c5a9 });

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(50, 10, 0.5), wallMat);
    backWall.position.set(0, 5, -25);
    backWall.receiveShadow = true;
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 10, 50), wallMat);
    leftWall.position.set(-25, 5, 0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 10, 50), wallMat);
    rightWall.position.set(25, 5, 0);
    scene.add(rightWall);

    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50), 
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 10;
    scene.add(ceiling);

    const createText = (text, fontSize) => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1a1a2e';
      ctx.font = `bold ${fontSize}px Georgia`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      return new THREE.CanvasTexture(canvas);
    };

    const createWhiteText = (text, fontSize) => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      return new THREE.CanvasTexture(canvas);
    };

    const createBlackText = (text, fontSize) => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      return new THREE.CanvasTexture(canvas);
    };

    const rightWallBrandTexture = createText('QUAINTON LAW MINIVERSE™', 80);
    const rightWallBrandPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 2),
      new THREE.MeshBasicMaterial({ map: rightWallBrandTexture, transparent: true })
    );
    rightWallBrandPlane.position.set(24.4, 6, 0);
    rightWallBrandPlane.rotation.y = -Math.PI / 2;
    scene.add(rightWallBrandPlane);

    const backWallFarBrandTexture = createWhiteText('QUAINTON LAW MINIVERSE™', 80);
    const backWallFarBrandPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 2.5),
      new THREE.MeshBasicMaterial({ map: backWallFarBrandTexture, transparent: true })
    );
    backWallFarBrandPlane.position.set(0, 6, 24.7);
    backWallFarBrandPlane.rotation.y = Math.PI;
    scene.add(backWallFarBrandPlane);

    const brandTexture = createText('QUAINTON LAW', 120);
    const brandPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 4),
      new THREE.MeshBasicMaterial({ map: brandTexture, transparent: true })
    );
    brandPlane.position.set(0, 7.5, -24.7);
    scene.add(brandPlane);

    const miniverseTexture = createText('MINIVERSE™', 80);
    const miniversePlane = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 3),
      new THREE.MeshBasicMaterial({ map: miniverseTexture, transparent: true })
    );
    miniversePlane.position.set(0, 5.8, -24.7);
    scene.add(miniversePlane);

    const interactiveObjects = [];

    const createBackPanel = (label, position, color, type) => {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(8, 5, 0.3),
        new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.6 })
      );
      panel.position.copy(position);
      panel.castShadow = true;
      panel.userData = { type, label, interactive: true };
      scene.add(panel);
      interactiveObjects.push(panel);

      const labelTexture = createWhiteText(label, 60);
      const labelPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 1.5),
        new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true })
      );
      labelPlane.position.set(position.x, position.y, position.z + 0.2);
      scene.add(labelPlane);
    };

    createBackPanel('FIRM VIDEOS', new THREE.Vector3(-10, 3.5, -24.6), 0x8b0000, 'video');
    createBackPanel('OUR WALL', new THREE.Vector3(10, 3.5, -24.6), 0x1e4d8b, 'ourwall');

    const profilePositions = [
      new THREE.Vector3(-15, 2.5, 24.6),
      new THREE.Vector3(-9, 2.5, 24.6),
      new THREE.Vector3(-3, 2.5, 24.6),
      new THREE.Vector3(3, 2.5, 24.6),
      new THREE.Vector3(9, 2.5, 24.6),
      new THREE.Vector3(15, 2.5, 24.6)
    ];

    profilePositions.forEach((position, index) => {
      const profilePanel = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 1.5, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x5a4a6a, roughness: 0.4, metalness: 0.6 })
      );
      profilePanel.position.copy(position);
      profilePanel.castShadow = true;
      profilePanel.userData = { type: 'profile', label: `PROFILE ${index + 1}`, interactive: true };
      scene.add(profilePanel);
      interactiveObjects.push(profilePanel);

      const profileLabelTexture = createWhiteText('PROFILES', 40);
      const profileLabelPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(3.5, 1),
        new THREE.MeshBasicMaterial({ map: profileLabelTexture, transparent: true })
      );
      profileLabelPlane.position.set(position.x, position.y, position.z - 0.2);
      profileLabelPlane.rotation.y = Math.PI;
      scene.add(profileLabelPlane);
    });

    const artPanel = new THREE.Mesh(
      new THREE.BoxGeometry(6, 4, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x2d5016, roughness: 0.4, metalness: 0.6 })
    );
    artPanel.position.set(0, 3, -24.6);
    artPanel.castShadow = true;
    artPanel.userData = { type: 'art', label: 'FIRM ARTWORK', interactive: true };
    scene.add(artPanel);
    interactiveObjects.push(artPanel);

    const artLabelTexture = createWhiteText('FIRM ARTWORK', 70);
    const artLabelPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(5.5, 1.5),
      new THREE.MeshBasicMaterial({ map: artLabelTexture, transparent: true })
    );
    artLabelPlane.position.set(0, 3, -24.4);
    scene.add(artLabelPlane);

    const table = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.2, 5),
      new THREE.MeshStandardMaterial({ color: 0x3d2817 })
    );
    table.position.set(0, 0.8, 4);
    table.castShadow = true;
    scene.add(table);

    const chairMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e });
    const createChair = (x, z, rotation) => {
      const chairGroup = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.8), chairMat);
      seat.position.y = 0.5;
      seat.castShadow = true;
      chairGroup.add(seat);

      const back = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1, 0.1), chairMat);
      back.position.y = 1;
      back.position.z = -0.35;
      back.castShadow = true;
      chairGroup.add(back);

      chairGroup.position.set(x, 0, z);
      chairGroup.rotation.y = rotation;
      scene.add(chairGroup);
    };

    createChair(0, 8, 0);
    createChair(-5, 4, Math.PI / 2);
    createChair(5, 4, -Math.PI / 2);
    createChair(0, 0, Math.PI);

    const createTableItem = (label, x, z) => {
      const item = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.05, 0.7),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      item.position.set(x, 1, z);
      item.userData = { type: 'tableItem', label, interactive: true };
      scene.add(item);
      interactiveObjects.push(item);

      const itemLabelTexture = createText(label, 30);
      const itemLabel = new THREE.Mesh(
        new THREE.PlaneGeometry(0.4, 0.1),
        new THREE.MeshBasicMaterial({ map: itemLabelTexture, transparent: true })
      );
      itemLabel.position.set(x, 1.03, z);
      itemLabel.rotation.x = -Math.PI / 2;
      scene.add(itemLabel);
    };

    createTableItem('Leave Review', -3, 4);
    createTableItem('Our Website', -1, 4);
    createTableItem('Other Sites', 1, 4);
    createTableItem('Pro Bono', 3, 4);

    const bookshelf = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 6, 8),
      new THREE.MeshStandardMaterial({ color: 0x4a2c1a })
    );
    bookshelf.position.set(-24.5, 3, -8);
    bookshelf.castShadow = true;
    scene.add(bookshelf);

    const firmLibraryTexture = createWhiteText('FIRM LIBRARY', 50);
    const firmLibraryPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 1.5),
      new THREE.MeshBasicMaterial({ map: firmLibraryTexture, transparent: true })
    );
    firmLibraryPlane.position.set(-24.3, 5.5, -8);
    firmLibraryPlane.rotation.y = Math.PI / 2;
    scene.add(firmLibraryPlane);

    const bookTitles = [
      'Agentic Theory',
      'Agentic AI and Law',
      'Law\'s Empire',
      'Russia Company',
      'Superintelligence',
      'Alignment Problem',
      'Liberation Theologies',
      'You Might be a Robot',
      'Black Box Society',
      'AI Legal Personhood',
      'Unknowable Unknown',
      'Logical Calculus',
      'Augmenting LLMs',
      'Read Me',
      'Explore Me',
      'Check Me Out',
      'Read Me',
      'Explore Me',
      'Check Me Out',
      'Read Me',
      'Explore Me',
      'Check Me Out',
      'Read Me',
      'Explore Me',
      'Check Me Out'
    ];
    
    for (let i = 0; i < 25; i++) {
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.8, 0.2),
        new THREE.MeshStandardMaterial({ 
          color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5) 
        })
      );
      const row = Math.floor(i / 5);
      const col = i % 5;
      book.position.set(-24.3, 0.8 + row * 1, -11 + col * 1.5);
      book.rotation.y = Math.PI / 2;
      book.castShadow = true;
      book.userData = { type: 'book', label: bookTitles[i], interactive: true };
      scene.add(book);
      interactiveObjects.push(book);
    }

    const receptionDesk = new THREE.Mesh(
      new THREE.BoxGeometry(3, 1, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x3d2817 })
    );
    receptionDesk.position.set(-24, 0.5, 0);
    receptionDesk.castShadow = true;
    scene.add(receptionDesk);

    const receptionistBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.5, 1.5, 16),
      new THREE.MeshStandardMaterial({ color: 0x2c5f8d })
    );
    receptionistBody.position.set(-24, 1.8, 0);
    receptionistBody.castShadow = true;
    scene.add(receptionistBody);

    const receptionistHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffdbac })
    );
    receptionistHead.position.set(-24, 2.8, 0);
    receptionistHead.castShadow = true;
    scene.add(receptionistHead);

    const receptionBrandTexture = createText('QUAINTON LAW MINIVERSE™', 50);
    const receptionBrandPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 2),
      new THREE.MeshBasicMaterial({ map: receptionBrandTexture, transparent: true })
    );
    receptionBrandPlane.position.set(-24, 6.5, 0);
    receptionBrandPlane.rotation.y = Math.PI / 2;
    scene.add(receptionBrandPlane);

    const receptionTexture = createBlackText('RECEPTION', 60);
    const receptionPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 1.2),
      new THREE.MeshBasicMaterial({ map: receptionTexture, transparent: true })
    );
    receptionPlane.position.set(-24, 5, 0);
    receptionPlane.rotation.y = Math.PI / 2;
    scene.add(receptionPlane);

    const firmDocsTexture = createBlackText('Firm Documents Below', 60);
    const firmDocsPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 1.5),
      new THREE.MeshBasicMaterial({ map: firmDocsTexture, transparent: true })
    );
    firmDocsPlane.position.set(-24, 4, 0);
    firmDocsPlane.rotation.y = Math.PI / 2;
    scene.add(firmDocsPlane);

    const deskItems = ['Engagement Letters', 'Firm Brochure', 'NDAs'];
    deskItems.forEach((item, i) => {
      const doc = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.04, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      doc.position.set(-24, 1.03, -0.6 + i * 0.5);
      doc.rotation.x = -Math.PI / 8;
      doc.userData = { type: 'deskItem', label: item, interactive: true };
      scene.add(doc);
      interactiveObjects.push(doc);

      const docLabelTexture = createText(item, 35);
      const docLabel = new THREE.Mesh(
        new THREE.PlaneGeometry(0.35, 0.08),
        new THREE.MeshBasicMaterial({ map: docLabelTexture, transparent: true })
      );
      docLabel.position.set(-24, 1.05, -0.6 + i * 0.5);
      docLabel.rotation.x = -Math.PI / 2.3;
      scene.add(docLabel);
    });

    const legalPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 5, 6),
      new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.4, metalness: 0.6 })
    );
    legalPanel.position.set(-24.6, 3.5, 8);
    legalPanel.castShadow = true;
    legalPanel.userData = { type: 'legal', label: 'LEGAL MATERIALS', interactive: true };
    scene.add(legalPanel);
    interactiveObjects.push(legalPanel);

    const legalLabelCanvas = document.createElement('canvas');
    legalLabelCanvas.width = 1024;
    legalLabelCanvas.height = 512;
    const legalCtx = legalLabelCanvas.getContext('2d');
    legalCtx.fillStyle = '#ffffff';
    legalCtx.font = 'bold 45px Arial';
    legalCtx.textAlign = 'center';
    legalCtx.fillText('LEGAL MATERIALS', 512, 200);
    legalCtx.font = '30px Arial';
    legalCtx.fillText('Supreme Court, Podcasts', 512, 280);
    legalCtx.fillText('and more', 512, 330);
    const legalLabelTexture = new THREE.CanvasTexture(legalLabelCanvas);
    const legalLabelPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(4.5, 2.2),
      new THREE.MeshBasicMaterial({ map: legalLabelTexture, transparent: true })
    );
    legalLabelPlane.position.set(-24.4, 3.5, 8);
    legalLabelPlane.rotation.y = Math.PI / 2;
    scene.add(legalLabelPlane);

    const creditsPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 3, 4),
      new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.4, metalness: 0.6 })
    );
    creditsPanel.position.set(24.6, 3.5, -16);
    creditsPanel.castShadow = true;
    scene.add(creditsPanel);

    const creditsCanvas = document.createElement('canvas');
    creditsCanvas.width = 1024;
    creditsCanvas.height = 768;
    const creditsCtx = creditsCanvas.getContext('2d');
    creditsCtx.fillStyle = '#ffffff';
    creditsCtx.font = 'bold 45px Arial';
    creditsCtx.textAlign = 'center';
    creditsCtx.textBaseline = 'middle';
    creditsCtx.fillText('Brought to you by', 512, 200);
    creditsCtx.font = 'bold 58px Arial';
    creditsCtx.fillText('AI Law Wizard', 512, 300);
    creditsCtx.font = '35px Arial';
    creditsCtx.fillText('&', 512, 380);
    creditsCtx.font = 'bold 50px Arial';
    creditsCtx.fillText('Claude Sonnet 4.5', 512, 460);

    const creditsTexture = new THREE.CanvasTexture(creditsCanvas);
    const creditsPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.5, 2.6),
      new THREE.MeshBasicMaterial({ map: creditsTexture, transparent: true })
    );
    creditsPlane.position.set(24.4, 3.5, -16);
    creditsPlane.rotation.y = -Math.PI / 2;
    scene.add(creditsPlane);

    const ideaVaultPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 2.5, 3),
      new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.4, metalness: 0.6 })
    );
    ideaVaultPanel.position.set(24.6, 3.5, -11);
    ideaVaultPanel.castShadow = true;
    ideaVaultPanel.userData = { type: 'ideaVault', label: 'IDEA VAULT', interactive: true };
    scene.add(ideaVaultPanel);
    interactiveObjects.push(ideaVaultPanel);

    const ideaVaultCanvas = document.createElement('canvas');
    ideaVaultCanvas.width = 1024;
    ideaVaultCanvas.height = 768;
    const ideaVaultCtx = ideaVaultCanvas.getContext('2d');
    ideaVaultCtx.fillStyle = '#1a1a2e';
    ideaVaultCtx.font = 'bold 55px Arial';
    ideaVaultCtx.textAlign = 'center';
    ideaVaultCtx.textBaseline = 'middle';
    ideaVaultCtx.fillText('💡', 512, 300);
    ideaVaultCtx.font = 'bold 42px Arial';
    ideaVaultCtx.fillText('IDEA', 512, 400);
    ideaVaultCtx.fillText('VAULT', 512, 460);

    const ideaVaultTexture = new THREE.CanvasTexture(ideaVaultCanvas);
    const ideaVaultPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 2.1),
      new THREE.MeshBasicMaterial({ map: ideaVaultTexture, transparent: true })
    );
    ideaVaultPlane.position.set(24.4, 3.5, -11);
    ideaVaultPlane.rotation.y = -Math.PI / 2;
    scene.add(ideaVaultPlane);

    const artworkPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 4.5, 3.5),
      new THREE.MeshStandardMaterial({ color: 0x2d5016, roughness: 0.4, metalness: 0.6 })
    );
    artworkPanel.position.set(24.6, 3.8, -6);
    artworkPanel.castShadow = true;
    artworkPanel.userData = { type: 'rightArt', label: 'ARTWORK', interactive: true };
    scene.add(artworkPanel);
    interactiveObjects.push(artworkPanel);

    const artworkLabelCanvas = document.createElement('canvas');
    artworkLabelCanvas.width = 1024;
    artworkLabelCanvas.height = 768;
    const artworkLabelCtx = artworkLabelCanvas.getContext('2d');
    artworkLabelCtx.fillStyle = '#ffffff';
    artworkLabelCtx.font = 'bold 65px Arial';
    artworkLabelCtx.textAlign = 'center';
    artworkLabelCtx.textBaseline = 'middle';
    artworkLabelCtx.fillText('ARTWORK', 512, 384);

    const artworkLabelTexture = new THREE.CanvasTexture(artworkLabelCanvas);
    const artworkLabelPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 2.2),
      new THREE.MeshBasicMaterial({ map: artworkLabelTexture, transparent: true })
    );
    artworkLabelPlane.position.set(24.4, 3.8, -6);
    artworkLabelPlane.rotation.y = -Math.PI / 2;
    scene.add(artworkLabelPlane);

    for (let i = 0; i < 6; i++) {
      const cert = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 1.5, 1.2),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
      );
      const row = Math.floor(i / 3);
      const col = i % 3;
      cert.position.set(24.6, 2 + row * 2.5, -1 + col * 2);
      cert.castShadow = true;
      cert.userData = { type: 'certificate', label: `Certificate ${i + 1}`, interactive: true };
      scene.add(cert);
      interactiveObjects.push(cert);
    }

    const personalImagesPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 5, 4),
      new THREE.MeshStandardMaterial({ color: 0x4a2c5f, roughness: 0.4, metalness: 0.6 })
    );
    personalImagesPanel.position.set(24.6, 3.5, 8);
    personalImagesPanel.castShadow = true;
    personalImagesPanel.userData = { type: 'personalImages', label: 'PERSONAL IMAGES', interactive: true };
    scene.add(personalImagesPanel);
    interactiveObjects.push(personalImagesPanel);

    const personalImagesCanvas = document.createElement('canvas');
    personalImagesCanvas.width = 1024;
    personalImagesCanvas.height = 768;
    const personalImagesCtx = personalImagesCanvas.getContext('2d');
    personalImagesCtx.fillStyle = '#ffffff';
    personalImagesCtx.font = 'bold 55px Arial';
    personalImagesCtx.textAlign = 'center';
    personalImagesCtx.textBaseline = 'middle';
    personalImagesCtx.fillText('PERSONAL', 512, 340);
    personalImagesCtx.fillText('IMAGES', 512, 420);

    const personalImagesTexture = new THREE.CanvasTexture(personalImagesCanvas);
    const personalImagesPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.5, 2.6),
      new THREE.MeshBasicMaterial({ map: personalImagesTexture, transparent: true })
    );
    personalImagesPlane.position.set(24.4, 3.5, 8);
    personalImagesPlane.rotation.y = -Math.PI / 2;
    scene.add(personalImagesPlane);

    const createLamp = (x, z) => {
      const lampGroup = new THREE.Group();
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.3, 0.1, 16),
        new THREE.MeshStandardMaterial({ color: 0x8b7355 })
      );
      base.position.y = 0.05;
      lampGroup.add(base);

      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x8b7355 })
      );
      pole.position.y = 0.8;
      lampGroup.add(pole);

      const shade = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 0.4, 16),
        new THREE.MeshStandardMaterial({ 
          color: 0xffd700, 
          emissive: 0xffd700, 
          emissiveIntensity: lampsOn ? 0.5 : 0 
        })
      );
      shade.position.y = 1.6;
      shade.userData = { type: 'lamp', interactive: true };
      lampGroup.add(shade);
      lampShadesRef.current.push(shade);

      lampGroup.position.set(x, 0, z);
      scene.add(lampGroup);
      
      interactiveObjects.push(base);
      interactiveObjects.push(pole);
      interactiveObjects.push(shade);
    };

    createLamp(-8, 8);
    createLamp(8, 8);

    const createPlant = (x, z) => {
      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.25, 0.4, 16),
        new THREE.MeshStandardMaterial({ color: 0x8b4513 })
      );
      pot.position.set(x, 0.2, z);
      pot.castShadow = true;
      scene.add(pot);

      const plant = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x228b22 })
      );
      plant.position.set(x, 0.6, z);
      plant.castShadow = true;
      scene.add(plant);
    };

    createPlant(-10, -5);
    createPlant(10, -5);

    const keys = {};
    let yaw = 0;
    let pitch = 0;
    const moveSpeed = 0.12;

    const onKeyDown = (e) => {
      keys[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'h') setShowHelp(prev => !prev);
    };

    const onKeyUp = (e) => {
      keys[e.key.toLowerCase()] = false;
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects);

      if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (obj.userData.interactive) {
          if (obj.userData.type === 'lamp') {
            setLampsOn(prev => !prev);
          } else {
            setSelectedContent({ type: obj.userData.type, label: obj.userData.label });
          }
        }
      }
    };

    window.addEventListener('click', onClick);

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const forward = new THREE.Vector3(0, 0, -1);
      const right = new THREE.Vector3(1, 0, 0);
      
      forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
      right.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);

      if (keys['arrowup'] || keys['w']) camera.position.add(forward.clone().multiplyScalar(moveSpeed));
      if (keys['arrowdown'] || keys['s']) camera.position.add(forward.clone().multiplyScalar(-moveSpeed));
      if (keys['arrowleft'] || keys['a']) camera.position.add(right.clone().multiplyScalar(-moveSpeed));
      if (keys['arrowright'] || keys['d']) camera.position.add(right.clone().multiplyScalar(moveSpeed));
      if (keys['q']) yaw += 0.02;
      if (keys['e']) yaw -= 0.02;

      camera.position.x = Math.max(-23, Math.min(23, camera.position.x));
      camera.position.z = Math.max(-23, Math.min(23, camera.position.z));
      camera.position.y = 1.6;

      camera.rotation.order = 'YXZ';
      camera.rotation.y = yaw;
      camera.rotation.x = pitch;

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(mat => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      
      renderer.dispose();
      lampShadesRef.current = [];
      lampLightsRef.current = [];
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      {showHelp && (
        <div style={{
          position: 'fixed', top: '20px', left: '20px', background: 'rgba(20, 20, 35, 0.95)',
          color: 'white', padding: '25px', borderRadius: '12px', maxWidth: '420px',
          fontFamily: 'Arial, sans-serif', boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
          border: '2px solid #8b0000', zIndex: 1000
        }}>
          <button onClick={() => setShowHelp(false)} style={{
            position: 'absolute', top: '12px', right: '12px', background: '#8b0000',
            color: 'white', border: 'none', borderRadius: '50%', width: '32px',
            height: '32px', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold'
          }}>×</button>
          
          <h2 style={{ margin: '0 0 18px 0', fontSize: '22px', color: '#f0e6d2' }}>
            Welcome to the Quainton Law Miniverse
          </h2>
          
          <div style={{ marginBottom: '15px' }}>
            <strong style={{ fontSize: '15px' }}>Controls:</strong>
            <ul style={{ margin: '8px 0', paddingLeft: '22px', fontSize: '14px', lineHeight: '1.7' }}>
              <li><strong>Arrow Keys / WASD:</strong> Move</li>
              <li><strong>Q / E:</strong> Rotate camera</li>
              <li><strong>Click:</strong> Interact with objects</li>
              <li><strong>H:</strong> Toggle help</li>
            </ul>
          </div>
          
          <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
            <p><strong>Explore:</strong> Bookshelf, Receptionist desk, Legal Materials, Certificates, Artwork, Conference table, Idea Vault, Profile panels, and clickable lamps</p>
          </div>
        </div>
      )}

      {selectedContent && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'white', padding: '35px', borderRadius: '15px', maxWidth: '750px',
          width: '90%', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 15px 60px rgba(0,0,0,0.5)',
          zIndex: 2000
        }}>
          <button onClick={() => setSelectedContent(null)} style={{
            position: 'absolute', top: '18px', right: '18px', background: '#8b0000',
            color: 'white', border: 'none', borderRadius: '50%', width: '38px',
            height: '38px', cursor: 'pointer', fontSize: '22px', fontWeight: 'bold'
          }}>×</button>

          <h2 style={{ marginTop: 0, color: '#1a1a2e' }}>{selectedContent.label}</h2>
          
          {selectedContent.type === 'video' && (
            <div>
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '18px', color: '#8b0000', marginBottom: '15px' }}>
                  Featured Firm Videos
                </h3>
                
                <a href="https://www.youtube.com/watch?v=FUnCvHnitPQ" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'block', padding: '20px',
                    background: 'linear-gradient(135deg, #8b0000 0%, #a00000 100%)',
                    color: 'white', textDecoration: 'none', borderRadius: '10px', marginBottom: '15px',
                    fontSize: '18px', fontWeight: 'bold', textAlign: 'center',
                    boxShadow: '0 4px 15px rgba(139, 0, 0, 0.3)', transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  Watch Our Featured Video
                </a>

                <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px',
                  fontSize: '14px', color: '#666', textAlign: 'center' }}>
                  Click to open video in new tab<br/>
                  <strong>Turn on full screen for best viewing</strong>
                </div>
              </div>
              
              <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '10px' }}>
                <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '17px' }}>
                  Add More Videos:
                </h4>
                <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6' }}>
                  Upload to YouTube or Vimeo, get embed code, and add to your Miniverse configuration
                </p>
              </div>
            </div>
          )}

          {selectedContent.type === 'art' && (
            <div>
              <p style={{ marginBottom: '20px', fontSize: '16px' }}>Display your firm artwork gallery</p>
              
              <div style={{ marginBottom: '25px' }}>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                  <a href="https://i.imgur.com/Gc59Q6K.png" target="_blank" rel="noopener noreferrer"
                    style={{ flex: 1, padding: '20px',
                      background: 'linear-gradient(135deg, #2d5016 0%, #3d6020 100%)',
                      color: 'white', textDecoration: 'none', borderRadius: '10px',
                      fontSize: '16px', fontWeight: 'bold', textAlign: 'center',
                      boxShadow: '0 4px 15px rgba(45, 80, 22, 0.3)' }}>
                    Artwork #1
                  </a>

                  <a href="https://i.imgur.com/6YKVvhG.png" target="_blank" rel="noopener noreferrer"
                    style={{ flex: 1, padding: '20px',
                      background: 'linear-gradient(135deg, #2d5016 0%, #3d6020 100%)',
                      color: 'white', textDecoration: 'none', borderRadius: '10px',
                      fontSize: '16px', fontWeight: 'bold', textAlign: 'center',
                      boxShadow: '0 4px 15px rgba(45, 80, 22, 0.3)' }}>
                    Artwork #2
                  </a>
                </div>
                <div style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px',
                  fontSize: '13px', color: '#666', textAlign: 'center' }}>
                  Click to open images in new tab
                </div>
              </div>
              
              <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '10px' }}>
                <h4 style={{ marginTop: 0, fontSize: '17px' }}>Add More Images:</h4>
                <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6' }}>
                  Upload to Imgur or your website and get direct image URLs
                </p>
              </div>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'Agentic Theory' && (
            <div style={{ marginBottom: '20px' }}>
              <a href="https://drive.google.com/file/d/1ebvUaV9y3LvxpmgItgSTkMmHa4Ls_ZIZ/view?usp=sharing" 
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', padding: '25px',
                  background: 'linear-gradient(135deg, #4a2c1a 0%, #5a3c2a 100%)',
                  color: 'white', textDecoration: 'none', borderRadius: '10px',
                  fontSize: '17px', fontWeight: 'bold', textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(74, 44, 26, 0.3)', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                Read: Agentic Theory
              </a>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'Agentic AI and Law' && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', color: '#4a2c1a', marginBottom: '15px' }}>
                Agentic AI and the Practice of Law
              </h3>
              
              <a href="https://docs.google.com/document/d/1kby4LMs0PVUCy8IA0qWD5LWh54jr5Vxb1hftmfPw4Uk/edit?usp=sharing" 
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', padding: '25px',
                  background: 'linear-gradient(135deg, #4a2c1a 0%, #5a3c2a 100%)',
                  color: 'white', textDecoration: 'none', borderRadius: '10px', marginBottom: '15px',
                  fontSize: '17px', fontWeight: 'bold', textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(74, 44, 26, 0.3)', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                Read Full Paper
              </a>
              
              <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '10px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '15px', lineHeight: '1.6', fontStyle: 'italic' }}>
                  Trust, Imagination, and the New Calculus of Liability
                </p>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#666' }}>
                  An exploration of how agentic AI transforms legal practice, professional responsibility, and liability frameworks.
                </p>
              </div>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'Law\'s Empire' && (
            <div style={{ marginBottom: '20px' }}>
              <a href="https://drive.google.com/file/d/18_1XREv0fHn_3exOWgMntjd-jWnE_SED/view?usp=sharing" 
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', padding: '25px',
                  background: 'linear-gradient(135deg, #4a2c1a 0%, #5a3c2a 100%)',
                  color: 'white', textDecoration: 'none', borderRadius: '10px',
                  fontSize: '17px', fontWeight: 'bold', textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(74, 44, 26, 0.3)', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                Read: Law's Empire
              </a>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'Russia Company' && (
            <div style={{ marginBottom: '20px' }}>
              <a href="https://drive.google.com/file/d/1RcVU6tKOYtABxR4hlMUdXmRPjI8ZxHeP/view?usp=sharing" 
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', padding: '25px',
                  background: 'linear-gradient(135deg, #4a2c1a 0%, #5a3c2a 100%)',
                  color: 'white', textDecoration: 'none', borderRadius: '10px',
                  fontSize: '17px', fontWeight: 'bold', textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(74, 44, 26, 0.3)', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                Read: The Origin and Early History of the Russia or Muscovy Company
              </a>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'Superintelligence' && (
            <div style={{ marginBottom: '20px' }}>
              <a href="https://drive.google.com/file/d/1YikBAleixDVc2fCMhPTCAhFEkNZYV04i/view?usp=sharing" 
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', padding: '25px',
                  background: 'linear-gradient(135deg, #4a2c1a 0%, #5a3c2a 100%)',
                  color: 'white', textDecoration: 'none', borderRadius: '10px',
                  fontSize: '17px', fontWeight: 'bold', textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(74, 44, 26, 0.3)', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                Read: Superintelligence
              </a>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'Alignment Problem' && (
            <div style={{ marginBottom: '20px' }}>
              <a href="https://drive.google.com/file/d/1wNTyTDzbx_dsP7mlOo_7-6BLVjMJDVHU/view?usp=sharing" 
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', padding: '25px',
                  background: 'linear-gradient(135deg, #4a2c1a 0%, #5a3c2a 100%)',
                  color: 'white', textDecoration: 'none', borderRadius: '10px',
                  fontSize: '17px', fontWeight: 'bold', textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(74, 44, 26, 0.3)', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                Read: The Alignment Problem
              </a>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'Liberation Theologies' && (
            <div style={{ marginBottom: '20px' }}>
              <a href="https://drive.google.com/file/d/1GjVSJ0q-7Y7IcEPxaUk8G88nXHX9I8k2/view?usp=sharing" 
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', padding: '25px',
                  background: 'linear-gradient(135deg, #4a2c1a 0%, #5a3c2a 100%)',
                  color: 'white', textDecoration: 'none', borderRadius: '10px',
                  fontSize: '17px', fontWeight: 'bold', textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(74, 44, 26, 0.3)', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                Read: Decolonizing Liberation Theologies
              </a>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'You Might be a Robot' && (
            <div style={{ marginBottom: '20px' }}>
              <a href="https://drive.google.com/file/d/1bjgLlKHPQCEGNykgBPN2CuORnalP4929/view?usp=sharing" 
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', padding: '25px',
                  background: 'linear-gradient(135deg, #4a2c1a 0%, #5a3c2a 100%)',
                  color: 'white', textDecoration: 'none', borderRadius: '10px',
                  fontSize: '17px', fontWeight: 'bold', textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(74, 44, 26, 0.3)', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                Read: You Might be a Robot
              </a>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'Black Box Society' && (
            <div style={{ marginBottom: '20px' }}>
              <a href="https://drive.google.com/file/d/1ZgrAtpCpWWStD8mtx5bayV93w232Uard/view?usp=sharing" 
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', padding: '25px',
                  background: 'linear-gradient(135deg, #4a2c1a 0%, #5a3c2a 100%)',
                  color: 'white', textDecoration: 'none', borderRadius: '10px',
                  fontSize: '17px', fontWeight: 'bold', textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(74, 44, 26, 0.3)', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                Read: The Black Box Society
              </a>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'AI Legal Personhood' && (
            <div style={{ marginBottom: '20px' }}>
              <a href="https://drive.google.com/file/d/1Cw9hBnjo9QR-blGMizc1CQp-MwG7Rjsp/view?usp=sharing" 
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', padding: '25px',
                  background: 'linear-gradient(135deg, #4a2c1a 0%, #5a3c2a 100%)',
                  color: 'white', textDecoration: 'none', borderRadius: '10px',
                  fontSize: '17px', fontWeight: 'bold', textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(74, 44, 26, 0.3)', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                Read: The Ethics and Challenges of Legal Personhood for AI
              </a>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'Unknowable Unknown' && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', color: '#4a2c1a', marginBottom: '15px' }}>
                The Unknowable Unknown
              </h3>
              
              <a href="https://docs.google.com/document/d/1pB10z2YfGgHVYPf5kl9Pj62NMVvlPoGs/edit?usp=sharing" 
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', padding: '25px',
                  background: 'linear-gradient(135deg, #4a2c1a 0%, #5a3c2a 100%)',
                  color: 'white', textDecoration: 'none', borderRadius: '10px', marginBottom: '15px',
                  fontSize: '17px', fontWeight: 'bold', textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(74, 44, 26, 0.3)', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                Read Full Paper
              </a>
              
              <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '10px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '15px', lineHeight: '1.6', fontStyle: 'italic' }}>
                  The Case for AI Arms Control
                </p>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#666' }}>
                  Why a global cap on AI compute is essential for human survival.
                </p>
              </div>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'Logical Calculus' && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', color: '#4a2c1a', marginBottom: '15px' }}>
                Featured Paper
              </h3>
              
              <a href="https://drive.google.com/file/d/1iBAI7spq1vJiP7PNzal3d4yY-VaHOWHQ/view?usp=sharing" 
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', padding: '25px',
                  background: 'linear-gradient(135deg, #4a2c1a 0%, #5a3c2a 100%)',
                  color: 'white', textDecoration: 'none', borderRadius: '10px', marginBottom: '15px',
                  fontSize: '17px', fontWeight: 'bold', textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(74, 44, 26, 0.3)', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                A Logical Calculus of Ideas Immanent in Nervous Activity
              </a>
              
              <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '10px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '15px', lineHeight: '1.6', fontStyle: 'italic' }}>
                  McCulloch & Pitts (1943)
                </p>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#666' }}>
                  The foundational paper that introduced the first mathematical model of artificial neurons, laying the groundwork for modern neural networks and artificial intelligence.
                </p>
              </div>
            </div>
          )}

          {selectedContent.type === 'book' && selectedContent.label === 'Augmenting LLMs' && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', color: '#4a2c1a', marginBottom: '15px' }}>
                Featured Research Paper
              </h3>
              
              <a href="https://arxiv.org/pdf/2306.07174" 
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', padding: '25px',
                  background: 'linear-gradient(135deg, #4a2c1a 0%, #5a3c2a 100%)',
                  color: 'white', textDecoration: 'none', borderRadius: '10px', marginBottom: '15px',
                  fontSize: '17px', fontWeight: 'bold', textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(74, 44, 26, 0.3)', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                Augmenting Language Models with Long-Term Memory
              </a>
              
              <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '10px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '15px', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "LONGMEM: Enabling LLMs to memorize long history"
                </p>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#666' }}>
                  By Wang et al. (Microsoft Research & UC Santa Barbara). A framework that enables large language models to cache and utilize long-form previous context through a decoupled memory architecture.
                </p>
              </div>
            </div>
          )}

          {selectedContent.type === 'ideaVault' && (
            <div>
              <div style={{ padding: '60px 30px',
                background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                borderRadius: '15px', textAlign: 'center', marginBottom: '25px' }}>
                <div style={{ fontSize: '72px', marginBottom: '20px' }}>💡</div>
                <h3 style={{ margin: '0 0 15px 0', color: '#1a1a2e', fontSize: '32px' }}>
                  Coming Soon
                </h3>
                <p style={{ margin: 0, color: '#1a1a2e', fontSize: '16px', lineHeight: '1.6' }}>
                  The Idea Vault will let you capture and save thoughts as you explore the Miniverse
                </p>
              </div>
              <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '10px' }}>
                <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6' }}>
                  This feature will include note-taking, downloads, and the ability to share your ideas with us or your team.
                </p>
              </div>
            </div>
          )}

          {selectedContent.type === 'profile' && (
            <div>
              <div style={{ padding: '30px', background: '#f5f5f5', borderRadius: '10px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.8', color: '#333' }}>
                  Videos, articles, testimonials from team members, partners, clients and more.
                </p>
              </div>
            </div>
          )}

          {selectedContent.type === 'ourwall' && (
            <div>
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '20px', color: '#1e4d8b', marginBottom: '20px' }}>
                  Our Wall - Firm Updates & Information
                </h3>
                
                <a href="#testimonials"
                  style={{
                    display: 'block', padding: '15px 20px',
                    background: 'linear-gradient(135deg, #8b4789 0%, #a85ba6 100%)',
                    color: 'white', textDecoration: 'none', borderRadius: '10px', marginBottom: '12px',
                    fontSize: '16px', fontWeight: 'bold',
                    boxShadow: '0 3px 12px rgba(139, 71, 137, 0.3)'
                  }}>
                  Client Testimonials
                </a>

                <a href="#cases"
                  style={{
                    display: 'block', padding: '15px 20px',
                    background: 'linear-gradient(135deg, #8b0000 0%, #a00000 100%)',
                    color: 'white', textDecoration: 'none', borderRadius: '10px', marginBottom: '12px',
                    fontSize: '16px', fontWeight: 'bold',
                    boxShadow: '0 3px 12px rgba(139, 0, 0, 0.3)'
                  }}>
                  Featured Cases
                </a>
              </div>
              
              <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '10px' }}>
                <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '17px' }}>
                  Customize Your Links
                </h4>
                <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6' }}>
                  Replace the placeholder links with URLs to your firm's pages
                </p>
              </div>
            </div>
          )}

          {selectedContent.type === 'legal' && (
            <div>
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '18px', color: '#4a4a4a', marginBottom: '15px' }}>
                  Supreme Court Resources
                </h3>
                
                <a href="https://www.oyez.org" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'block', padding: '12px 15px',
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d4a7f 100%)',
                    color: 'white', textDecoration: 'none', borderRadius: '8px', marginBottom: '10px',
                    fontSize: '15px', fontWeight: 'bold',
                    boxShadow: '0 3px 10px rgba(30, 58, 95, 0.3)'
                  }}>
                  Oyez Project - SCOTUS Arguments (1955-Present)
                </a>

                <a href="https://www.supremecourt.gov" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'block', padding: '12px 15px',
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d4a7f 100%)',
                    color: 'white', textDecoration: 'none', borderRadius: '8px', marginBottom: '10px',
                    fontSize: '15px', fontWeight: 'bold',
                    boxShadow: '0 3px 10px rgba(30, 58, 95, 0.3)'
                  }}>
                  Supreme Court Official Audio & Transcripts
                </a>

                <a href="https://podcasts.apple.com/us/podcast/the-supreme-court-oral-arguments/id1649139910" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'block', padding: '12px 15px',
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d4a7f 100%)',
                    color: 'white', textDecoration: 'none', borderRadius: '8px', marginBottom: '20px',
                    fontSize: '15px', fontWeight: 'bold',
                    boxShadow: '0 3px 10px rgba(30, 58, 95, 0.3)'
                  }}>
                  SCOTUS Oral Arguments Podcast
                </a>

                <h3 style={{ fontSize: '18px', color: '#4a4a4a', marginBottom: '15px', marginTop: '20px' }}>
                  Federal Circuit Courts
                </h3>

                <a href="https://www.courtlistener.com/audio/" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'block', padding: '12px 15px',
                    background: 'linear-gradient(135deg, #4a4a4a 0%, #5a5a5a 100%)',
                    color: 'white', textDecoration: 'none', borderRadius: '8px', marginBottom: '10px',
                    fontSize: '15px', fontWeight: 'bold',
                    boxShadow: '0 3px 10px rgba(74, 74, 74, 0.3)'
                  }}>
                  CourtListener - All Federal Circuit Courts
                </a>

                <a href="https://www.ca9.uscourts.gov/media/" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'block', padding: '12px 15px',
                    background: 'linear-gradient(135deg, #4a4a4a 0%, #5a5a5a 100%)',
                    color: 'white', textDecoration: 'none', borderRadius: '8px', marginBottom: '10px',
                    fontSize: '15px', fontWeight: 'bold',
                    boxShadow: '0 3px 10px rgba(74, 74, 74, 0.3)'
                  }}>
                  9th Circuit Oral Arguments
                </a>

                <a href="https://www.cafc.uscourts.gov/home/oral-argument/listen-to-oral-arguments/" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'block', padding: '12px 15px',
                    background: 'linear-gradient(135deg, #4a4a4a 0%, #5a5a5a 100%)',
                    color: 'white', textDecoration: 'none', borderRadius: '8px', marginBottom: '20px',
                    fontSize: '15px', fontWeight: 'bold',
                    boxShadow: '0 3px 10px rgba(74, 74, 74, 0.3)'
                  }}>
                  Federal Circuit Court Audio
                </a>

                <h3 style={{ fontSize: '18px', color: '#4a4a4a', marginBottom: '15px', marginTop: '20px' }}>
                  Law School Podcasts
                </h3>

                <a href="https://law.stanford.edu/stanford-legal-podcast/" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'block', padding: '12px 15px',
                    background: 'linear-gradient(135deg, #8b0000 0%, #a00000 100%)',
                    color: 'white', textDecoration: 'none', borderRadius: '8px', marginBottom: '10px',
                    fontSize: '15px', fontWeight: 'bold',
                    boxShadow: '0 3px 10px rgba(139, 0, 0, 0.3)'
                  }}>
                  Stanford Legal Podcast
                </a>

                <a href="https://hls.harvard.edu/communications-office/podcast-conversations-from-harvard-law-school/" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'block', padding: '12px 15px',
                    background: 'linear-gradient(135deg, #8b0000 0%, #a00000 100%)',
                    color: 'white', textDecoration: 'none', borderRadius: '8px', marginBottom: '10px',
                    fontSize: '15px', fontWeight: 'bold',
                    boxShadow: '0 3px 10px rgba(139, 0, 0, 0.3)'
                  }}>
                  Conversations from Harvard Law School
                </a>

                <a href="https://law.yale.edu/about-yale-law-school/office-dean/inside-yale-law-school-podcast" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'block', padding: '12px 15px',
                    background: 'linear-gradient(135deg, #8b0000 0%, #a00000 100%)',
                    color: 'white', textDecoration: 'none', borderRadius: '8px', marginBottom: '10px',
                    fontSize: '15px', fontWeight: 'bold',
                    boxShadow: '0 3px 10px rgba(139, 0, 0, 0.3)'
                  }}>
                  Inside Yale Law School Podcast
                </a>

                <a href="https://constitutioncenter.org/news-debate/podcasts" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'block', padding: '12px 15px',
                    background: 'linear-gradient(135deg, #8b0000 0%, #a00000 100%)',
                    color: 'white', textDecoration: 'none', borderRadius: '8px', marginBottom: '20px',
                    fontSize: '15px', fontWeight: 'bold',
                    boxShadow: '0 3px 10px rgba(139, 0, 0, 0.3)'
                  }}>
                  National Constitution Center Podcasts
                </a>

                <h3 style={{ fontSize: '18px', color: '#4a4a4a', marginBottom: '15px', marginTop: '20px' }}>
                  Live Trials & Courtrooms
                </h3>

                <a href="https://www.courttv.com/title/court-tv-live-stream-web/" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'block', padding: '12px 15px',
                    background: 'linear-gradient(135deg, #2d5016 0%, #3d6020 100%)',
                    color: 'white', textDecoration: 'none', borderRadius: '8px', marginBottom: '10px',
                    fontSize: '15px', fontWeight: 'bold',
                    boxShadow: '0 3px 10px rgba(45, 80, 22, 0.3)'
                  }}>
                  Court TV - Live Trial Coverage
                </a>

                <a href="https://cvn.com/" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'block', padding: '12px 15px',
                    background: 'linear-gradient(135deg, #2d5016 0%, #3d6020 100%)',
                    color: 'white', textDecoration: 'none', borderRadius: '8px', marginBottom: '20px',
                    fontSize: '15px', fontWeight: 'bold',
                    boxShadow: '0 3px 10px rgba(45, 80, 22, 0.3)'
                  }}>
                  Courtroom View Network (CVN)
                </a>

                <h3 style={{ fontSize: '18px', color: '#4a4a4a', marginBottom: '15px', marginTop: '20px' }}>
                  Legal Skills Training
                </h3>

                <div style={{ padding: '15px', background: '#fff8dc', borderRadius: '8px', marginBottom: '15px', border: '2px solid #daa520' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#8b6914' }}>
                    Trial Advocacy Fundamentals
                  </h4>
                  <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }}>
                    <li><strong>Direct Examination</strong> - Eliciting testimony from your witnesses</li>
                    <li><strong>Cross Examination</strong> - Impeachment and control techniques</li>
                    <li><strong>Introducing Evidence</strong> - Foundation, authentication, exhibits</li>
                    <li><strong>Opening Statements</strong> - Persuasive storytelling</li>
                    <li><strong>Closing Arguments</strong> - Synthesizing evidence</li>
                  </ul>
                </div>

                <a href="https://www.nita.org" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'block', padding: '12px 15px',
                    background: 'linear-gradient(135deg, #654321 0%, #8b6914 100%)',
                    color: 'white', textDecoration: 'none', borderRadius: '8px', marginBottom: '10px',
                    fontSize: '15px', fontWeight: 'bold',
                    boxShadow: '0 3px 10px rgba(101, 67, 33, 0.3)'
                  }}>
                  NITA - National Institute for Trial Advocacy
                </a>

                <a href="https://www.nacdl.org" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'block', padding: '12px 15px',
                    background: 'linear-gradient(135deg, #654321 0%, #8b6914 100%)',
                    color: 'white', textDecoration: 'none', borderRadius: '8px', marginBottom: '15px',
                    fontSize: '15px', fontWeight: 'bold',
                    boxShadow: '0 3px 10px rgba(101, 67, 33, 0.3)'
                  }}>
                  NACDL - Criminal Defense Trial Skills
                </a>

                <div style={{ padding: '15px', background: '#f0f8ff', borderRadius: '8px', border: '1px solid #4682b4' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#1e4d8b' }}>
                    For Attorneys: Add Your Firm Materials
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: '#555' }}>
                    Upload trial advocacy guides, examination templates, evidence checklists, and training videos specific to your practice areas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {(selectedContent.type === 'rightArt' || 
            selectedContent.type === 'certificate' || selectedContent.type === 'tableItem' || 
            selectedContent.type === 'deskItem' || selectedContent.type === 'personalImages') && (
            <div>
              <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '10px' }}>
                <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6' }}>
                  Add your content via URL embeds (Vimeo, SoundCloud, Imgur, Google Drive, PDFs, etc.)
                </p>
              </div>
            </div>
          )}

          {(selectedContent.type === 'book' && !['Agentic Theory', 'Agentic AI and Law', 'Law\'s Empire', 'Russia Company', 'Superintelligence', 'Alignment Problem', 'Liberation Theologies', 'You Might be a Robot', 'Black Box Society', 'AI Legal Personhood', 'Unknowable Unknown', 'Logical Calculus', 'Augmenting LLMs'].includes(selectedContent.label)) && (
            <div>
              <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '10px' }}>
                <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6' }}>
                  Legal resources and documents available via Google Drive or your website hosting
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{
        position: 'fixed', bottom: '25px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(20, 20, 35, 0.92)', color: '#f0e6d2', padding: '12px 28px',
        borderRadius: '30px', fontSize: '14px', fontFamily: 'Georgia, serif',
        boxShadow: '0 6px 25px rgba(0,0,0,0.4)', zIndex: 999
      }}>
        Click panels to explore • Press H for help
      </div>

      <button onClick={(e) => { e.stopPropagation(); setShowMusicPanel(prev => !prev); }}
        style={{ position: 'fixed', top: '20px', right: '20px',
          background: 'rgba(20, 20, 35, 0.95)', color: 'white',
          padding: '12px 18px', borderRadius: '30px', border: '2px solid #8b0000',
          fontSize: '18px', cursor: 'pointer', boxShadow: '0 6px 25px rgba(0,0,0,0.4)',
          zIndex: 1000 }}>
        🎵
      </button>

      {showMusicPanel && (
        <div style={{
          position: 'fixed', top: '70px', right: '20px', background: 'rgba(20, 20, 35, 0.98)',
          color: 'white', padding: '25px', borderRadius: '12px', maxWidth: '350px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.6)', border: '2px solid #8b0000',
          zIndex: 1000
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#f0e6d2' }}>
            Background Music
          </h3>
          
          <a href="https://www.youtube.com/watch?v=jgpJVI3tDbY&list=PLcY_3cCKImIwwB-BL3j-b7P0Y-qme0j5N" target="_blank" rel="noopener noreferrer"
            style={{
              display: 'block', padding: '12px',
              background: 'linear-gradient(135deg, #8b4789 0%, #a85ba6 100%)',
              color: 'white', textDecoration: 'none', borderRadius: '8px', marginBottom: '10px',
              fontSize: '15px', fontWeight: 'bold', textAlign: 'center',
              boxShadow: '0 3px 10px rgba(139, 71, 137, 0.3)'
            }}>
            Classical
          </a>

          <a href="https://www.youtube.com/watch?v=Dx5qFachd3A&list=PLiN1kp_cbtdhRBH8QyAMO-DAJu0OBwPPe" target="_blank" rel="noopener noreferrer"
            style={{
              display: 'block', padding: '12px',
              background: 'linear-gradient(135deg, #1e4d8b 0%, #2d6bb8 100%)',
              color: 'white', textDecoration: 'none', borderRadius: '8px', marginBottom: '10px',
              fontSize: '15px', fontWeight: 'bold', textAlign: 'center',
              boxShadow: '0 3px 10px rgba(30, 77, 139, 0.3)'
            }}>
            Jazz
          </a>

          <a href="https://www.youtube.com/watch?v=TquOWZeyFyg&list=PLg5XbHSMRGGcDQx4vGmZvKR3UY2HxVWoX" target="_blank" rel="noopener noreferrer"
            style={{
              display: 'block', padding: '12px',
              background: 'linear-gradient(135deg, #8b6914 0%, #b88b1e 100%)',
              color: 'white', textDecoration: 'none', borderRadius: '8px', marginBottom: '10px',
              fontSize: '15px', fontWeight: 'bold', textAlign: 'center',
              boxShadow: '0 3px 10px rgba(139, 105, 20, 0.3)'
            }}>
            Acoustic Folk
          </a>

          <p style={{ margin: '15px 0 0 0', fontSize: '12px', color: '#ccc', textAlign: 'center' }}>
            Opens in new tab
          </p>
        </div>
      )}
    </div>
  );
};

export default QuaintonLawMiniverse;