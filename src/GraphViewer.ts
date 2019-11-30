import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    PointLight,
    AxesHelper,
    MeshBasicMaterial,
    PlaneGeometry,
    Mesh,
    MeshNormalMaterial,
    MeshLambertMaterial,
    DoubleSide,
    TextureLoader,
    RepeatWrapping,
    VertexColors,
    Vector3
} from 'three';

import OrbitControls from 'three-orbitcontrols';

// Constants
const SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;

export class GraphViewer {

    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    controls: OrbitControls;

    constructor(container: HTMLElement) {

        this.scene = new Scene();
        this.camera = this.setupCamera(this.scene);
        this.renderer = this.setupRenderer(container);
        this.setupLight(this.scene);
        this.setupFloor(this.scene);
        this.controls = this.setupControls(this.camera, this.renderer);

        this.renderer.setClearColor(0xdddddd, 1);

        this.animate();
    }

    setupCamera(scene: Scene): PerspectiveCamera {

        const VIEW_ANGLE = 45;
        const ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
        const NEAR = 0.1;
        const FAR = 20000;

        const camera = new PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        scene.add(camera);
        camera.position.set(0, 150, 400);
        camera.up = new Vector3(0, 0, 1);
        camera.lookAt(scene.position);

        return camera;
    }

    setupRenderer(container: HTMLElement): WebGLRenderer {
        const renderer = new WebGLRenderer({ antialias: true });
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        container.appendChild(renderer.domElement);
        return renderer;
    }

    setupLight(scene: Scene) {
        const light = new PointLight(0xffffff);
        light.position.set(0, 250, 0);
        scene.add(light);
    }

    setupFloor(scene: Scene) {
        scene.add(new AxesHelper());
        var wireframeMaterial = new MeshBasicMaterial({ color: 0x2050ff, wireframe: true, side: DoubleSide });
        var floorGeometry = new PlaneGeometry(1000, 1000, 20, 20);
        var floor = new Mesh(floorGeometry, wireframeMaterial);
        floor.position.z = -0.01;
        scene.add(floor);
    }

    setupControls(camera: PerspectiveCamera, renderer: WebGLRenderer): OrbitControls {
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true
        controls.dampingFactor = 0.25
        controls.enableZoom = true;
        return controls;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.render();
        this.update();
    }

    update() {
        this.controls.update();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

}