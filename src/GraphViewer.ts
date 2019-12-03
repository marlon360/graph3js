import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    PointLight,
    AxesHelper,
    MeshBasicMaterial,
    PlaneGeometry,
    Mesh,
    Material,
    MeshNormalMaterial,
    MeshLambertMaterial,
    DoubleSide,
    TextureLoader,
    RepeatWrapping,
    VertexColors,
    Vector3, ParametricGeometry, Color, Face3,
    TubeGeometry,
    Curve
} from 'three';

import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

import OrbitControls from 'three-orbitcontrols';

// Constants
const SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;

export class GraphViewer {

    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    controls: OrbitControls;

    graphMesh = null;

    constructor(container: HTMLElement) {

        this.scene = new Scene();
        this.camera = this.setupCamera(this.scene);
        this.renderer = this.setupRenderer(container);
        this.setupLight(this.scene);
        this.setupFloor(this.scene);
        this.controls = this.setupControls(this.camera, this.renderer);

        this.renderer.setClearColor(0x474747, 1);

        document.body.appendChild( VRButton.createButton( this.renderer ) );
        this.renderer.vr.enabled = true;

        this.renderer.setAnimationLoop(() => {

            this.render();
            this.update();
        
        } );
        //this.animate();
    }

    setupCamera(scene: Scene): PerspectiveCamera {

        const VIEW_ANGLE = 45;
        const ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
        const NEAR = 0.1;
        const FAR = 20000;

        const camera = new PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        scene.add(camera);
        camera.position.set(24, 50, 20);
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
        var wireframeMaterial = new MeshBasicMaterial({ color: 0x787878, wireframe: true, side: DoubleSide });
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

    public createCurve(func: (x) => Array<number> | number, setting?: {
        segments: number,
        radiusSegments: number,
        tubeRadius: number,
        tMin: number,
        tMax: number,
    }) {
         // set default values
         const segments = setting && setting.segments || 100,
         radiusSegments = setting && setting.radiusSegments || 6,
         tubeRadius = setting && setting.tubeRadius ||0.1,
         tMin = setting && setting.tMin || 0,
         tMax = setting && setting.tMax || 60;

        const tRange = tMax - tMin;

        function CustomPath (scale: number) {
            Curve.call(this);
            this.scale = scale;
        }

        CustomPath.prototype = Object.create(Curve.prototype);
        CustomPath.prototype.constructor = CustomPath;
        CustomPath.prototype.getPoint = function(t: number) {
            t = t * tRange + tMin;

            if (Array.isArray(func(t))) {
                return new Vector3(func(t)[0],func(t)[1] || 0,func(t)[2] || 0).multiplyScalar(this.scale);
            } else {
                // draw in xz plane a normal graph
                return new Vector3(t, 0, <number>func(t)).multiplyScalar(this.scale);
            }
        }

        const path = new CustomPath(1);

        const tubeGeometry = new TubeGeometry(path, segments, tubeRadius, radiusSegments, false);
        
        // vertex colors based on t value
        // faces are indexed using characters
        var faceIndices = ['a', 'b', 'c', 'd'];
        // first, assign colors to vertices as desired
        for (var s = 0; s <= segments; s++)
            for (var r = 0; r < radiusSegments; r++) {
                const vertexIndex = r + s * radiusSegments;
                const color = new Color(0xffffff);
                // according to length along curve, repeat once
                color.setHSL((1 * s / segments) % 1, 1, 0.5);
                tubeGeometry.colors[vertexIndex] = color;
            }
        // copy the colors as necessary to the face's vertexColors array.
        for (var i = 0; i < tubeGeometry.faces.length; i++) {
            const face = tubeGeometry.faces[i];
            const numberOfSides = (face instanceof Face3) ? 3 : 4;
            for (var j = 0; j < numberOfSides; j++) {
                const vertexIndex = face[faceIndices[j]];
                face.vertexColors[j] = tubeGeometry.colors[vertexIndex];
            }
        }

        if (this.graphMesh) {
            this.scene.remove(this.graphMesh);
        }

        const wireMaterial = this.createWireMaterial(segments);
        wireMaterial.map.repeat.set(segments, segments);
        wireMaterial.map.repeat.set(segments, radiusSegments);

        this.graphMesh = new Mesh(tubeGeometry, wireMaterial);
        this.graphMesh.doubleSided = true;        
        this.scene.add(this.graphMesh);
    }

    public createGraph(func: (x, y) => number, setting?: {
        xMin: number,
        xMax: number,
        yMin: number,
        yMax: number,
        segments: number
    }) {

        // set default values
        const xMin = setting && setting.xMin || -10,
            xMax = setting && setting.xMax || 10,
            yMin = setting && setting.yMin || -10,
            yMax = setting && setting.yMin || 10,
            segments = setting && setting.segments || 40;

        // calculate ranges
        const xRange = xMax - xMin;
        const yRange = yMax - yMin;

        // x and y from 0 to 1
        const meshFunction = (x, y, vec3) => {
            // map x,y to range
            x = xRange * x + xMin;
            y = yRange * y + yMin;
            // get z value from function
            const z = func(x, y);
            if (!isNaN(z))
                vec3.set(x, y, z);
        };

        const graphGeometry = new ParametricGeometry(meshFunction, segments, segments);

        // set colors based on z value
        graphGeometry.computeBoundingBox();
        const zMin = graphGeometry.boundingBox.min.z;
        const zMax = graphGeometry.boundingBox.max.z;
        const zRange = zMax - zMin;

        // first, assign colors to vertices
        for (var i = 0; i < graphGeometry.vertices.length; i++) {
            const point = graphGeometry.vertices[i];
            const color = new Color(0xffffff);
            // only change color if not infinte
            if (isFinite(zRange)) {
                color.setHSL(0.7 * (zMax - point.z) / zRange, 1, 0.5);
            }
            graphGeometry.colors[i] = color;
        }
        // faces are indexed using characters
        const faceIndices = ['a', 'b', 'c', 'd'];
        // copy the colors as necessary to the face's vertexColors array.
        for (let i = 0; i < graphGeometry.faces.length; i++) {
            const face = graphGeometry.faces[i];
            const numberOfSides = (face instanceof Face3) ? 3 : 4;
            for (let j = 0; j < numberOfSides; j++) {
                const vertexIndex = face[faceIndices[j]];
                face.vertexColors[j] = graphGeometry.colors[vertexIndex];
            }
        }

        const wireMaterial = this.createWireMaterial(segments);
        wireMaterial.map.repeat.set(segments, segments);

        // remove graph if exists
        if (this.graphMesh) {
            this.scene.remove(this.graphMesh);
        }

        this.graphMesh = new Mesh(graphGeometry, wireMaterial);
        this.scene.add(this.graphMesh);
    }

    createWireMaterial(segments: number = 40): MeshBasicMaterial {
        var loader = new TextureLoader();
        const squareImageUrl = require('../images/square.png');
        const wireTexture = loader.load(squareImageUrl);
        wireTexture.wrapS = wireTexture.wrapT = RepeatWrapping;
        wireTexture.repeat.set(segments, segments);
        return new MeshBasicMaterial({ map: wireTexture, vertexColors: VertexColors, side: DoubleSide });
    }

}