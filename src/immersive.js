import * as THREE from 'three';
import shaka from 'shaka-player';

export class ImmersivePlayer {
  constructor(video) {
    this.video = video;
    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.videoTexture = new THREE.VideoTexture(this.video);
    this.videoTexture.minFilter = THREE.LinearFilter;
    this.videoTexture.magFilter = THREE.LinearFilter;
    this.videoTexture.format = THREE.RGBFormat;

    this.initMainScene();
    this.initMiniGlobe();

    this.player = new shaka.Player(this.video);

    window.addEventListener('resize', () => this.onWindowResize(), false);
    window.addEventListener('keydown', (event) => this.handleKeyDown(event), false);

    this.animate();
  }

  async load(url) {
    if (!this.player) {
      console.error('Shaka player is not initialized.');
      return;
    }
    try {
      await this.player.load(url);
      console.log('The video has been loaded successfully!');
    } catch (error) {
      console.error('Error loading video:', error);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);

    // Invert the camera rotation for the mini-globe
    this.globe.rotation.x = -this.camera.rotation.x;
    this.globe.rotation.y = -this.camera.rotation.y;
    this.globe.rotation.z = -this.camera.rotation.z;

    this.globeRenderer.render(this.globeScene, this.globeCamera);
  }

  handleKeyDown(event) {
    const rotationAmount = 0.05;
    switch (event.key) {
      case 'ArrowUp':
        this.camera.rotation.x = Math.max(this.camera.rotation.x + rotationAmount, -Math.PI / 2);
        break;
      case 'ArrowDown':
        this.camera.rotation.x = Math.min(this.camera.rotation.x - rotationAmount, Math.PI / 2);
        break;
      case 'ArrowLeft':
        this.camera.rotation.y += rotationAmount; // Inverted for internal view
        break;
      case 'ArrowRight':
        this.camera.rotation.y -= rotationAmount; // Inverted for internal view
        break;
    }
  }

  getMediaElement() {
    return this.video;
  }

  initMainScene() {
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    const material = new THREE.MeshBasicMaterial({ map: this.videoTexture });
    material.side = THREE.BackSide;
    this.sphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.sphere);

    this.camera.position.set(0, 0, 0.1);
  }

  initMiniGlobe() {
    const globeElement = document.getElementById('globe');

    this.globeScene = new THREE.Scene();
    this.globeCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.globeRenderer = new THREE.WebGLRenderer({ alpha: true });
    this.globeRenderer.setSize(300, 300);
    globeElement.appendChild(this.globeRenderer.domElement);

    const globeGeometry = new THREE.SphereGeometry(5, 32, 32);
    const globeMaterial = new THREE.MeshBasicMaterial({ map: this.videoTexture });
    globeMaterial.side = THREE.BackSide;
    this.globe = new THREE.Mesh(globeGeometry, globeMaterial);
    this.globeScene.add(this.globe);

    const axisLength = 7;
    const axisX = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), axisLength, 0xff0000);
    const axisY = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), axisLength, 0x00ff00);
    const axisZ = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), axisLength, 0x0000ff);

    this.globe.add(axisX);
    this.globe.add(axisY);
    this.globe.add(axisZ);

    const northPoleGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const northPoleMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const northPole = new THREE.Mesh(northPoleGeometry, northPoleMaterial);
    northPole.position.set(0, 5, 0);

    const southPoleGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const southPoleMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    const southPole = new THREE.Mesh(southPoleGeometry, southPoleMaterial);
    southPole.position.set(0, -5, 0);

    this.globe.add(northPole);
    this.globe.add(southPole);

    this.globeCamera.position.z = 20;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
