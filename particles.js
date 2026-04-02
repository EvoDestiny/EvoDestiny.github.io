/**
 * Particle System — Faithful port of Google Antigravity
 *
 * Ring-based interaction, multi-octave simplex noise, scale-based animation.
 * Uses GPUSimulation for FBO ping-pong, PoissonDiskSampling for distribution.
 *
 * Exposes: window.particleSystem { startBackground(), enableMouseSpawn(), dispose() }
 */
window.particleSystem = (function () {

    // ════════════════════════════════════════════════
    //  GLSL Shaders (merged from shaders.js)
    // ════════════════════════════════════════════════

    var noiseGLSL = '\n' +
'  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }\n' +
'  vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }\n' +
'  float permute(float x) { return floor(mod(((x*34.0)+1.0)*x, 289.0)); }\n' +
'  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }\n' +
'  float taylorInvSqrt(float r) { return 1.79284291400159 - 0.85373472095314 * r; }\n' +
'\n' +
'  float snoise(vec2 v) {\n' +
'    const vec4 C = vec4(0.211324865405187, 0.366025403784439,\n' +
'            -0.577350269189626, 0.024390243902439);\n' +
'    vec2 i  = floor(v + dot(v, C.yy));\n' +
'    vec2 x0 = v - i + dot(i, C.xx);\n' +
'    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n' +
'    vec4 x12 = x0.xyxy + C.xxzz;\n' +
'    x12.xy -= i1;\n' +
'    i = mod(i, 289.0);\n' +
'    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))\n' +
'      + i.x + vec3(0.0, i1.x, 1.0));\n' +
'    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),\n' +
'      dot(x12.zw,x12.zw)), 0.0);\n' +
'    m = m*m;\n' +
'    m = m*m;\n' +
'    vec3 x = 2.0 * fract(p * C.www) - 1.0;\n' +
'    vec3 h = abs(x) - 0.5;\n' +
'    vec3 ox = floor(x + 0.5);\n' +
'    vec3 a0 = x - ox;\n' +
'    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);\n' +
'    vec3 g;\n' +
'    g.x  = a0.x  * x0.x  + h.x  * x0.y;\n' +
'    g.yz = a0.yz * x12.xz + h.yz * x12.yw;\n' +
'    return 130.0 * dot(m, g);\n' +
'  }\n' +
'\n' +
'  float snoise(vec3 v) {\n' +
'    const vec2 C = vec2(1.0/6.0, 1.0/3.0);\n' +
'    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);\n' +
'    vec3 i  = floor(v + dot(v, C.yyy));\n' +
'    vec3 x0 = v - i + dot(i, C.xxx);\n' +
'    vec3 g = step(x0.yzx, x0.xyz);\n' +
'    vec3 l = 1.0 - g;\n' +
'    vec3 i1 = min(g.xyz, l.zxy);\n' +
'    vec3 i2 = max(g.xyz, l.zxy);\n' +
'    vec3 x1 = x0 - i1 + 1.0 * C.xxx;\n' +
'    vec3 x2 = x0 - i2 + 2.0 * C.xxx;\n' +
'    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;\n' +
'    i = mod(i, 289.0);\n' +
'    vec4 p = permute(permute(permute(\n' +
'        i.z + vec4(0.0, i1.z, i2.z, 1.0))\n' +
'        + i.y + vec4(0.0, i1.y, i2.y, 1.0))\n' +
'        + i.x + vec4(0.0, i1.x, i2.x, 1.0));\n' +
'    float n_ = 1.0/7.0;\n' +
'    vec3 ns = n_ * D.wyz - D.xzx;\n' +
'    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);\n' +
'    vec4 x_ = floor(j * ns.z);\n' +
'    vec4 y_ = floor(j - 7.0 * x_);\n' +
'    vec4 x = x_ * ns.x + ns.yyyy;\n' +
'    vec4 y = y_ * ns.x + ns.yyyy;\n' +
'    vec4 h = 1.0 - abs(x) - abs(y);\n' +
'    vec4 b0 = vec4(x.xy, y.xy);\n' +
'    vec4 b1 = vec4(x.zw, y.zw);\n' +
'    vec4 s0 = floor(b0)*2.0 + 1.0;\n' +
'    vec4 s1 = floor(b1)*2.0 + 1.0;\n' +
'    vec4 sh = -step(h, vec4(0.0));\n' +
'    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;\n' +
'    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;\n' +
'    vec3 p0 = vec3(a0.xy, h.x);\n' +
'    vec3 p1 = vec3(a0.zw, h.y);\n' +
'    vec3 p2 = vec3(a1.xy, h.z);\n' +
'    vec3 p3 = vec3(a1.zw, h.w);\n' +
'    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));\n' +
'    p0 *= norm.x;\n' +
'    p1 *= norm.y;\n' +
'    p2 *= norm.z;\n' +
'    p3 *= norm.w;\n' +
'    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n' +
'    m = m * m;\n' +
'    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));\n' +
'  }\n';

    var simVertexShader = 'void main() { gl_Position = vec4(position, 1.0); }';

    function simFragmentShader(size) {
        return 'precision highp float;\n' +
'uniform sampler2D uPosition;\n' +
'uniform sampler2D uPosRefs;\n' +
'uniform float uTime;\n' +
'uniform float uDeltaTime;\n' +
'uniform vec2  uRingPos;\n' +
'uniform float uRingRadius;\n' +
'uniform float uRingWidth;\n' +
'uniform float uRingWidth2;\n' +
'uniform float uRingDisplacement;\n' +
noiseGLSL +
'void main() {\n' +
'    vec2 simTexCoords = gl_FragCoord.xy / vec2(' + size.toFixed(1) + ', ' + size.toFixed(1) + ');\n' +
'    vec4 pFrame = texture2D(uPosition, simTexCoords);\n' +
'    float scale = pFrame.z;\n' +
'    float velocity = pFrame.w;\n' +
'    vec2 refPos = texture2D(uPosRefs, simTexCoords).xy;\n' +
'    float time = uTime * .5;\n' +
'    vec2 curentPos = refPos;\n' +
'    vec2 pos = pFrame.xy;\n' +
'    pos *= .8;\n' +
'    float dist = distance(curentPos.xy, uRingPos);\n' +
'    float noise0 = snoise(vec3(curentPos.xy * .2 + vec2(18.4924, 72.9744), time * 0.5));\n' +
'    float dist1 = distance(curentPos.xy + (noise0 * .005), uRingPos);\n' +
'    float t = smoothstep(uRingRadius - (uRingWidth * 2.), uRingRadius, dist)\n' +
'            - smoothstep(uRingRadius, uRingRadius + uRingWidth, dist1);\n' +
'    float t2 = smoothstep(uRingRadius - (uRingWidth2 * 2.), uRingRadius, dist)\n' +
'             - smoothstep(uRingRadius, uRingRadius + uRingWidth2, dist1);\n' +
'    float t3 = smoothstep(uRingRadius + uRingWidth2, uRingRadius, dist);\n' +
'    t = pow(t, 2.);\n' +
'    t2 = pow(t2, 3.);\n' +
'    t += t2 * 3.;\n' +
'    t += t3 * .4;\n' +
'    t += snoise(vec3(curentPos.xy * 30. + vec2(11.4924, 12.9744), time * 0.5)) * t3 * .5;\n' +
'    float nS = snoise(vec3(curentPos.xy * 2. + vec2(18.4924, 72.9744), time * 0.5));\n' +
'    t += pow((nS + 1.5) * .5, 2.) * .6;\n' +
'    float noise1 = snoise(vec3(curentPos.xy * 4. + vec2(88.494, 32.4397), time * 0.35));\n' +
'    float noise2 = snoise(vec3(curentPos.xy * 4. + vec2(50.904, 120.947), time * 0.35));\n' +
'    float noise3 = snoise(vec3(curentPos.xy * 20. + vec2(18.4924, 72.9744), time * .5));\n' +
'    float noise4 = snoise(vec3(curentPos.xy * 20. + vec2(50.904, 120.947), time * .5));\n' +
'    vec2 disp = vec2(noise1, noise2) * .03;\n' +
'    disp += vec2(noise3, noise4) * .005;\n' +
'    disp.x += sin((refPos.x * 20.) + (time * 4.)) * .02 * clamp(dist, 0., 1.);\n' +
'    disp.y += cos((refPos.y * 20.) + (time * 3.)) * .02 * clamp(dist, 0., 1.);\n' +
'    pos -= (uRingPos - (curentPos + disp)) * pow(t2, .75) * uRingDisplacement;\n' +
'    float scaleDiff = t - scale;\n' +
'    scaleDiff *= .2;\n' +
'    scale += scaleDiff;\n' +
'    vec2 finalPos = curentPos + disp + (pos * .25);\n' +
'    velocity *= .5;\n' +
'    velocity += scale * .25;\n' +
'    gl_FragColor = vec4(finalPos, scale, velocity);\n' +
'}';
    }

    var particleVertexShader = 'precision highp float;\n' +
'attribute vec4 seeds;\n' +
'uniform sampler2D uPosition;\n' +
'uniform float uTime;\n' +
'uniform float uParticleScale;\n' +
'uniform float uPixelRatio;\n' +
'varying vec4  vSeeds;\n' +
'varying float vVelocity;\n' +
'varying vec2  vLocalPos;\n' +
'varying vec2  vScreenPos;\n' +
'varying float vScale;\n' +
'void main() {\n' +
'    vec4 pos = texture2D(uPosition, uv);\n' +
'    vSeeds    = seeds;\n' +
'    vVelocity = pos.w;\n' +
'    vScale    = pos.z;\n' +
'    vLocalPos = pos.xy;\n' +
'    vec4 viewSpace = modelViewMatrix * vec4(vec3(pos.xy, 0.), 1.0);\n' +
'    gl_Position    = projectionMatrix * viewSpace;\n' +
'    vScreenPos     = gl_Position.xy;\n' +
'    gl_PointSize = ((vScale * 7.) * (uPixelRatio * 0.5) * uParticleScale);\n' +
'}';

    var particleFragmentShader = 'precision highp float;\n' +
'varying vec4  vSeeds;\n' +
'varying vec2  vScreenPos;\n' +
'varying vec2  vLocalPos;\n' +
'varying float vScale;\n' +
'varying float vVelocity;\n' +
'uniform vec3  uColor1;\n' +
'uniform vec3  uColor2;\n' +
'uniform vec3  uColor3;\n' +
'uniform vec2  uRingPos;\n' +
'uniform vec2  uRez;\n' +
'uniform float uAlpha;\n' +
'uniform float uTime;\n' +
'uniform float uColorScheme;\n' +
noiseGLSL +
'#define PI 3.1415926535897932384626433832795\n' +
'float sdRoundBox(in vec2 p, in vec2 b, in vec4 r) {\n' +
'    r.xy = (p.x>0.0)?r.xy : r.zw;\n' +
'    r.x  = (p.y>0.0)?r.x  : r.y;\n' +
'    vec2 q = abs(p)-b+r.x;\n' +
'    return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;\n' +
'}\n' +
'vec2 rotate(vec2 v, float a) {\n' +
'    float s = sin(a);\n' +
'    float c = cos(a);\n' +
'    mat2 m = mat2(c, s, -s, c);\n' +
'    return m * v;\n' +
'}\n' +
'void main() {\n' +
'    float uBorderSize = 0.2;\n' +
'    float ratio = uRez.x / uRez.y;\n' +
'    float noiseAngle = snoise(vec3(vLocalPos * 10. + vec2(18.4924, 72.9744), uTime * .85));\n' +
'    float noiseColor = snoise(vec3(vLocalPos * 2. + vec2(74.664, 91.556), uTime * .5));\n' +
'    noiseColor = (noiseColor + 1.) * .5;\n' +
'    float angle = atan(vLocalPos.y - uRingPos.y, vLocalPos.x - uRingPos.x);\n' +
'    vec2 uv = gl_PointCoord.xy;\n' +
'    uv -= vec2(0.5);\n' +
'    uv.y *= -1.;\n' +
'    uv = rotate(uv, -angle + (noiseAngle * .5));\n' +
'    float h = 0.8;\n' +
'    float progress = smoothstep(0., .75, pow(noiseColor, 2.));\n' +
'    vec3 col = mix(\n' +
'        mix(uColor1, uColor2, progress/h),\n' +
'        mix(uColor2, uColor3, (progress - h)/(1.0 - h)),\n' +
'        step(h, progress)\n' +
'    );\n' +
'    vec3 color = col;\n' +
'    float dist = sqrt(dot(uv, uv));\n' +
'    float dr = .5;\n' +
'    float t = smoothstep(dr+(uBorderSize + .0001), dr-uBorderSize, dist);\n' +
'    t = clamp(t, 0., 1.);\n' +
'    float rounded = sdRoundBox(uv, vec2(0.5, 0.2), vec4(.25));\n' +
'    rounded = smoothstep(.1, 0., rounded);\n' +
'    float a = uAlpha * rounded * smoothstep(0.1, 0.2, vScale);\n' +
'    if(a < 0.01) { discard; }\n' +
'    color = clamp(color, 0., 1.);\n' +
'    color = mix(color, color * clamp(vVelocity, 0., 1.), uColorScheme);\n' +
'    gl_FragColor = vec4(color, clamp(a, 0., 1.));\n' +
'}';

    // ════════════════════════════════════════════════
    //  GPUSimulation — FBO Ping-Pong (merged from gpu-simulation.js)
    // ════════════════════════════════════════════════

    function GPUSimulation(renderer, size) {
        this.renderer     = renderer;
        this.size         = size || 256;
        this.length       = this.size * this.size;
        this.everRendered = false;
        this.count        = 0;
        this.posTex       = null;
        this.rt1          = null;
        this.rt2          = null;
        this.simScene     = null;
        this.simCamera    = null;
        this.simMaterial  = null;
    }

    GPUSimulation.prototype.createDataTexturePosition = function (pointsData) {
        var data = new Float32Array(this.length * 4);
        for (var i = 0; i < this.count; i++) {
            var idx = i * 4;
            data[idx + 0] = pointsData[i * 2 + 0] * (1 / 250);
            data[idx + 1] = pointsData[i * 2 + 1] * (1 / 250);
            data[idx + 2] = 0;
            data[idx + 3] = 0;
        }
        var tex = new THREE.DataTexture(
            data, this.size, this.size,
            THREE.RGBAFormat, THREE.FloatType
        );
        tex.needsUpdate = true;
        return tex;
    };

    GPUSimulation.prototype.createRenderTarget = function () {
        return new THREE.WebGLRenderTarget(this.size, this.size, {
            wrapS:         THREE.ClampToEdgeWrapping,
            wrapT:         THREE.ClampToEdgeWrapping,
            minFilter:     THREE.NearestFilter,
            magFilter:     THREE.NearestFilter,
            format:        THREE.RGBAFormat,
            type:          THREE.FloatType,
            depthBuffer:   false,
            stencilBuffer: false
        });
    };

    GPUSimulation.prototype.init = function (pointsData, count, vertexShader, fragmentShader, extraUniforms) {
        this.count = count;
        this.posTex = this.createDataTexturePosition(pointsData);
        this.rt1 = this.createRenderTarget();
        this.rt2 = this.createRenderTarget();

        this.renderer.setRenderTarget(this.rt1);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.clear();
        this.renderer.setRenderTarget(this.rt2);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.clear();
        this.renderer.setRenderTarget(null);

        this.simScene  = new THREE.Scene();
        this.simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        var uniforms = {
            uPosition:  { value: this.posTex },
            uPosRefs:   { value: this.posTex },
            uTime:      { value: 0 },
            uDeltaTime: { value: 0 }
        };
        if (extraUniforms) {
            for (var key in extraUniforms) {
                if (extraUniforms.hasOwnProperty(key)) {
                    uniforms[key] = extraUniforms[key];
                }
            }
        }
        this.simMaterial = new THREE.ShaderMaterial({
            uniforms:       uniforms,
            vertexShader:   vertexShader,
            fragmentShader: fragmentShader
        });
        var quadMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            this.simMaterial
        );
        this.simScene.add(quadMesh);
    };

    GPUSimulation.prototype.update = function (time, deltaTime) {
        this.simMaterial.uniforms.uPosition.value =
            this.everRendered ? this.rt1.texture : this.posTex;
        this.simMaterial.uniforms.uTime.value      = time;
        this.simMaterial.uniforms.uDeltaTime.value = deltaTime;
        this.renderer.setRenderTarget(this.rt2);
        this.renderer.render(this.simScene, this.simCamera);
        this.renderer.setRenderTarget(null);
    };

    GPUSimulation.prototype.getOutputTexture = function () {
        return this.everRendered ? this.rt2.texture : this.posTex;
    };

    GPUSimulation.prototype.getRefTexture = function () {
        return this.posTex;
    };

    GPUSimulation.prototype.postRender = function () {
        var temp = this.rt1;
        this.rt1 = this.rt2;
        this.rt2 = temp;
        this.everRendered = true;
    };

    GPUSimulation.prototype.dispose = function () {
        if (this.rt1)         this.rt1.dispose();
        if (this.rt2)         this.rt2.dispose();
        if (this.posTex)      this.posTex.dispose();
        if (this.simMaterial) this.simMaterial.dispose();
    };

    // ════════════════════════════════════════════════
    //  Particle System
    // ════════════════════════════════════════════════

    // ────────────────────────────────────────────────
    //  Configuration (antigravity defaults)
    // ────────────────────────────────────────────────
    var CONFIG = {
        simSize:          256,
        meshScale:        5,
        cameraZoom:       3.1,
        fov:              40,
        density:          230,
        particlesScale:   0.59,
        ringWidth:        0.006,
        ringWidth2:       0.107,
        ringDisplacement: 0.62,
        color1:           '#b8986a',
        color2:           '#c9a227',
        color3:           '#8b6914',
        alpha:            1.0,
        colorScheme:      1
    };

    // ── state ──
    var canvas, renderer, scene, camera;
    var gpuSim, particleMesh;
    var clock, time = 0;
    var mouseNDC       = new THREE.Vector2();
    var mouseActive    = false;
    var ringPos        = new THREE.Vector2();
    var cursorPos      = new THREE.Vector2();
    var running        = false;
    var halfH, halfW;  // cached frustum half-extents

    // Uniforms (shared refs so we can update them each frame)
    var simUniforms    = {};
    var renderMaterial = null;

    // ────────────────────────────────────────────────
    //  Helpers
    // ────────────────────────────────────────────────
    function mapRange(v, inMin, inMax, outMin, outMax) {
        return (v - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    // Simple 1D noise approximation (replaces OpenSimplex getVal for ambient drift)
    function noise1D(x) {
        var v = Math.sin(x) * 0.5 + Math.sin(x * 2.4 + 1.3) * 0.3 + Math.sin(x * 5.7 + 3.1) * 0.2;
        return v * 0.5 + 0.5;
    }

    // ────────────────────────────────────────────────
    //  Init renderer / scene / camera
    // ────────────────────────────────────────────────
    function init() {
        canvas = document.getElementById('bgCanvas');
        if (!canvas) return;

        renderer = new THREE.WebGLRenderer({
            canvas:    canvas,
            antialias: true,
            alpha:     true,
            powerPreference:      'high-performance',
            preserveDrawingBuffer: false,
            stencil:  false,
            precision: 'highp'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Needed for Float textures
        renderer.extensions.get('EXT_color_buffer_float');

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(
            CONFIG.fov,
            window.innerWidth / window.innerHeight,
            0.1, 1000
        );
        camera.position.z = CONFIG.cameraZoom;

        clock = new THREE.Clock();

        // Cache frustum half-extents for mouse mapping
        halfH = Math.tan(CONFIG.fov * Math.PI / 360) * CONFIG.cameraZoom;
        halfW = halfH * camera.aspect;

        initParticles();

        window.addEventListener('resize', onResize);
    }

    // ────────────────────────────────────────────────
    //  Build particle system
    // ────────────────────────────────────────────────
    function initParticles() {
        // 1. Poisson-distributed points (500×500 grid, centred at origin)
        var pds = new PoissonDiskSampling({
            shape:       [500, 500],
            minDistance:  mapRange(CONFIG.density, 0, 300, 10, 2),
            maxDistance:  mapRange(CONFIG.density, 0, 300, 11, 3),
            tries:       20
        });
        var rawPoints  = pds.fill();
        var pointsData = [];
        for (var i = 0; i < rawPoints.length; i++) {
            pointsData.push(rawPoints[i][0] - 250, rawPoints[i][1] - 250);
        }
        var count = pointsData.length / 2;

        // 2. GPU Simulation (FBO pipeline)
        gpuSim = new GPUSimulation(renderer, CONFIG.simSize);

        simUniforms = {
            uRingPos:          { value: new THREE.Vector2(0, 0) },
            uRingRadius:       { value: 0.2 },
            uRingWidth:        { value: CONFIG.ringWidth },
            uRingWidth2:       { value: CONFIG.ringWidth2 },
            uRingDisplacement: { value: CONFIG.ringDisplacement }
        };

        gpuSim.init(
            pointsData, count,
            simVertexShader,
            simFragmentShader(CONFIG.simSize),
            simUniforms
        );

        // 3. Geometry: uv → simulation texel lookup, seeds → per-particle randomness
        var geom  = new THREE.BufferGeometry();
        var uvs   = new Float32Array(count * 2);
        var seeds = new Float32Array(count * 4);
        for (var i = 0; i < count; i++) {
            uvs[i * 2]     = (i % CONFIG.simSize) / CONFIG.simSize;
            uvs[i * 2 + 1] = Math.floor(i / CONFIG.simSize) / CONFIG.simSize;
            seeds[i * 4]     = Math.random();
            seeds[i * 4 + 1] = Math.random();
            seeds[i * 4 + 2] = Math.random();
            seeds[i * 4 + 3] = Math.random();
        }
        geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
        geom.setAttribute('uv',       new THREE.BufferAttribute(uvs, 2));
        geom.setAttribute('seeds',    new THREE.BufferAttribute(seeds, 4));

        // 4. Render material
        var pxScale = canvas.width / window.devicePixelRatio / 2000 * CONFIG.particlesScale;

        renderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uPosition:      { value: gpuSim.getOutputTexture() },
                uTime:          { value: 0 },
                uParticleScale: { value: pxScale },
                uPixelRatio:    { value: window.devicePixelRatio },
                uColor1:        { value: new THREE.Color(CONFIG.color1) },
                uColor2:        { value: new THREE.Color(CONFIG.color2) },
                uColor3:        { value: new THREE.Color(CONFIG.color3) },
                uRingPos:       { value: new THREE.Vector2(0, 0) },
                uRez:           { value: new THREE.Vector2(canvas.width, canvas.height) },
                uAlpha:         { value: CONFIG.alpha },
                uColorScheme:   { value: CONFIG.colorScheme }
            },
            vertexShader:   particleVertexShader,
            fragmentShader: particleFragmentShader,
            transparent:    true,
            depthTest:      false,
            depthWrite:     false
        });

        // 5. Points mesh
        particleMesh = new THREE.Points(geom, renderMaterial);
        particleMesh.position.set(0, 0, 0);
        particleMesh.scale.set(CONFIG.meshScale, CONFIG.meshScale, CONFIG.meshScale);
        scene.add(particleMesh);
    }

    // ────────────────────────────────────────────────
    //  Resize handler
    // ────────────────────────────────────────────────
    function onResize() {
        if (!renderer || !camera) return;
        var w = window.innerWidth, h = window.innerHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        // Recache frustum
        halfH = Math.tan(CONFIG.fov * Math.PI / 360) * CONFIG.cameraZoom;
        halfW = halfH * camera.aspect;

        var u = renderMaterial.uniforms;
        u.uRez.value.set(renderer.domElement.width, renderer.domElement.height);
        u.uPixelRatio.value    = window.devicePixelRatio;
        u.uParticleScale.value = renderer.domElement.width / window.devicePixelRatio / 2000 * CONFIG.particlesScale;
    }

    // ────────────────────────────────────────────────
    //  Mouse handling — stores raw NDC, blending with
    //  noise + slow lerp happens in animate()
    // ────────────────────────────────────────────────
    function onMouseMove(e) {
        var rect = canvas.getBoundingClientRect();
        var nx =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
        var ny = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
        mouseNDC.set(nx, ny);
        mouseActive = true;
    }

    // ────────────────────────────────────────────────
    //  Animation loop
    // ────────────────────────────────────────────────
    function animate() {
        if (!running) return;
        requestAnimationFrame(animate);

        var dt = clock.getDelta();
        time += dt;

        // ── Ambient noise drift (matches iI class OpenSimplex getVal) ──
        var noiseX = (noise1D(time * 0.66 + 94.234) - 0.5) * 2;
        var noiseY = (noise1D(time * 0.75 + 21.028) - 0.5) * 2;

        // ── Ring position: slow lerp matching antigravity iI.update() ──
        // Mouse active: world * 0.175 + noise, lerp 0.02
        // No mouse: pure noise drift, lerp 0.01
        if (mouseActive) {
            var worldX = mouseNDC.x * halfW;
            var worldY = mouseNDC.y * halfH;
            cursorPos.set(
                worldX * 0.175 + noiseX * 0.1,
                worldY * 0.175 + noiseY * 0.1
            );
            ringPos.set(
                ringPos.x + (cursorPos.x - ringPos.x) * 0.02,
                ringPos.y + (cursorPos.y - ringPos.y) * 0.02
            );
        } else {
            cursorPos.set(noiseX * 0.2, noiseY * 0.1);
            ringPos.set(
                ringPos.x + (cursorPos.x - ringPos.x) * 0.01,
                ringPos.y + (cursorPos.y - ringPos.y) * 0.01
            );
        }

        // ── Simulation step ──
        simUniforms.uRingPos.value.copy(ringPos);
        simUniforms.uRingRadius.value =
            0.175 + Math.sin(time * 1.0) * 0.03 + Math.cos(time * 3.0) * 0.02;

        gpuSim.update(time, dt);

        // ── Render uniforms ──
        var u = renderMaterial.uniforms;
        u.uPosition.value      = gpuSim.getOutputTexture();
        u.uTime.value          = time;
        u.uRingPos.value.copy(ringPos);
        u.uParticleScale.value = canvas.width / window.devicePixelRatio / 2000 * CONFIG.particlesScale;

        // ── Draw ──
        renderer.setRenderTarget(null);
        renderer.autoClear = false;
        renderer.clear();
        renderer.render(scene, camera);

        // ── Swap FBO ──
        gpuSim.postRender();
    }

    // ────────────────────────────────────────────────
    //  Public API (matches original interface for main.js)
    // ────────────────────────────────────────────────
    return {
        startBackground: function () {
            init();
            // Fade-in matching antigravity: opacity 0→1, 4s, power2.out
            canvas.style.transition = 'opacity 4s cubic-bezier(0.22, 1, 0.36, 1)';
            running = true;
            animate();
            requestAnimationFrame(function () {
                canvas.style.opacity = '1';
            });
        },
        enableMouseSpawn: function () {
            document.addEventListener('mousemove', onMouseMove);
        },
        dispose: function () {
            running = false;
            document.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', onResize);
            if (gpuSim) gpuSim.dispose();
            if (particleMesh) {
                particleMesh.geometry.dispose();
                particleMesh.material.dispose();
            }
            if (renderer) renderer.dispose();
        }
    };
})();
