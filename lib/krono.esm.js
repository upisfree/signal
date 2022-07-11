/**
 * krono v2.0.0 build Tue, 10 May 2022 21:49:39 GMT
 * https://github.com/artlebedev/krono
 * Copyright 2022 Senya Pugach
 * @license UNLICENSED
 */
import { AudioListener, PerspectiveCamera, Box3, Vector3, AnimationMixer, LoopRepeat, Object3D, Vector2, AmbientLight, DirectionalLight, BasicShadowMap, PCFShadowMap, PCFSoftShadowMap, VSMShadowMap, Color, FogExp2, Mesh, Plane, PlaneHelper, PositionalAudio, OrthographicCamera, Uniform, NoToneMapping, LinearToneMapping, ReinhardToneMapping, CineonToneMapping, ACESFilmicToneMapping, LinearFilter, LinearMipmapLinearFilter, UVMapping, CubeReflectionMapping, CubeRefractionMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping, CubeUVReflectionMapping, CubeUVRefractionMapping, RepeatWrapping, ClampToEdgeWrapping, MirroredRepeatWrapping, NearestFilter, NearestMipmapNearestFilter, NearestMipmapLinearFilter, LinearMipmapNearestFilter, AnimationClip, KeyframeTrack, QuaternionKeyframeTrack, VectorKeyframeTrack, ColorKeyframeTrack, StringKeyframeTrack, BooleanKeyframeTrack, NumberKeyframeTrack, Raycaster, MeshPhongMaterial, MeshBasicMaterial, WebGLRenderer, sRGBEncoding, Scene, HalfFloatType, AudioLoader, DataTextureLoader, UnsignedByteType, FloatType, DataUtils, RGBFormat, RGBEFormat, LinearEncoding, RGBEEncoding, PMREMGenerator, Loader, LoaderUtils, FileLoader, MeshStandardMaterial, TangentSpaceNormalMap, Interpolant, ImageBitmapLoader, TextureLoader, InterleavedBuffer, InterleavedBufferAttribute, BufferAttribute, PointsMaterial, Material, LineBasicMaterial, DoubleSide, PropertyBinding, BufferGeometry, SkinnedMesh, LineSegments, Line, LineLoop, Points, Group, MathUtils, InterpolateLinear, Bone, Matrix4, Skeleton, SpotLight, PointLight, MeshPhysicalMaterial, InterpolateDiscrete, FrontSide, CanvasTexture, TriangleFanDrawMode, TriangleStripDrawMode, Sphere, CompressedTexture, RGBAFormat, RGBA_ASTC_4x4_Format, RGBA_BPTC_Format, RGBA_ETC2_EAC_Format, RGBA_PVRTC_4BPPV1_Format, RGBA_S3TC_DXT5_Format, RGB_ETC1_Format, RGB_ETC2_Format, RGB_PVRTC_4BPPV1_Format, RGB_S3TC_DXT1_Format, CompressedTextureLoader, LoadingManager, Spherical, EventDispatcher, Quaternion, Texture, Clock } from './three.module.js';
import { EffectPass, BlendFunction, ChromaticAberrationEffect, GlitchEffect, HueSaturationEffect, PixelationEffect, Effect as Effect$1, SMAAEffect as SMAAEffect$1, SMAAPreset, EdgeDetectionMode, BloomEffect, KernelSize, SelectiveBloomEffect, DepthOfFieldEffect, TextureEffect as TextureEffect$1, EffectComposer, SMAAImageLoader, RenderPass } from './postprocessing.esm.js';

function initAudioListener(krono) {
    krono.audioListener = new AudioListener();
    krono.camera.add(krono.audioListener);
}
function suspendAudioContext(krono) {
    krono.audioListener.context.suspend();
}
function resumeAudioContext(krono) {
    krono.audioListener.context.resume();
}

function initCamera(krono) {
    krono.defaultCamera = new PerspectiveCamera(40, 1, 0.1, 10000);
    krono.defaultCamera.name = krono.config.defaultCameraName;
    krono.camera = krono.defaultCamera;
}
function changeCamera(krono, newCamera) {
    krono.camera = newCamera;
    krono.camera.aspect = krono.bounds.canvas.width / krono.bounds.canvas.height;
    switch (krono.camera.type) {
        case 'OrthographicCamera':
            krono.camera.frustumX = Math.abs(krono.camera.left * 2);
            krono.camera.frustumY = Math.abs(krono.camera.top * 2);
            break;
    }
    krono.camera.updateProjectionMatrix();
    krono.renderPass.camera = krono.camera;
    krono.postEffects.forEach(e => e.pass.camera = krono.camera);
    if (krono.controls.enabled) {
        krono.controls.setPosition(krono.camera.position);
        krono.controls.setQuaternion(krono.camera.quaternion);
        krono.controls.lookAt(krono.controls.target.negate());
    }
}
function getCameraByName(name, cameras) {
    let cam = cameras.filter(c => c.name === name)[0];
    if (cam !== undefined) {
        return cam;
    }
    else {
        console.error(`Камера ${name} не найдена среди`, cameras);
    }
}
function updateCameraFrustum(krono) {
    krono.camera.left = krono.camera.frustumX / -2 * krono.camera.aspect / 2;
    krono.camera.right = krono.camera.frustumX / 2 * krono.camera.aspect / 2;
    krono.camera.top = krono.camera.frustumY / 2;
    krono.camera.bottom = krono.camera.frustumY / -2;
}
function centerCameraOnObject(krono, cam, controls, object) {
    object.updateMatrixWorld();
    const box = new Box3().setFromObject(object);
    const size = box.getSize(new Vector3()).length();
    const center = box.getCenter(new Vector3());
    cam.near = size / 100;
    cam.far = size * 100;
    cam.updateProjectionMatrix();
    cam.position.copy(center);
    cam.position.x += size;
    cam.position.y += size / 2.0;
    cam.position.z += size;
    cam.lookAt(center);
    krono.renderPass.camera = krono.camera;
    controls.setPosition(krono.camera.position);
    controls.setQuaternion(krono.camera.quaternion);
    controls.lookAt(center);
}

function initContainer(krono) {
    krono.container = {
        canvas: undefined,
        scroll: undefined
    };
}
function initBounds(krono) {
    krono.bounds = {
        canvas: undefined,
        scroll: undefined
    };
}
function updateContainersBounds(krono) {
    Object.keys(krono.container).forEach(k => {
        const c = krono.container[k];
        if (c && c !== window) {
            krono.bounds[k] = c.getBoundingClientRect();
        }
    });
}
function isElementInViewport(rect) {
    const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
    const windowWidth = (window.innerWidth || document.documentElement.clientWidth);
    const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
    const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);
    return (vertInView && horInView);
}

var resizeObservers = [];

var hasActiveObservations = function () {
    return resizeObservers.some(function (ro) { return ro.activeTargets.length > 0; });
};

var hasSkippedObservations = function () {
    return resizeObservers.some(function (ro) { return ro.skippedTargets.length > 0; });
};

var msg = 'ResizeObserver loop completed with undelivered notifications.';
var deliverResizeLoopError = function () {
    var event;
    if (typeof ErrorEvent === 'function') {
        event = new ErrorEvent('error', {
            message: msg
        });
    }
    else {
        event = document.createEvent('Event');
        event.initEvent('error', false, false);
        event.message = msg;
    }
    window.dispatchEvent(event);
};

var ResizeObserverBoxOptions;
(function (ResizeObserverBoxOptions) {
    ResizeObserverBoxOptions["BORDER_BOX"] = "border-box";
    ResizeObserverBoxOptions["CONTENT_BOX"] = "content-box";
    ResizeObserverBoxOptions["DEVICE_PIXEL_CONTENT_BOX"] = "device-pixel-content-box";
})(ResizeObserverBoxOptions || (ResizeObserverBoxOptions = {}));

var freeze = function (obj) { return Object.freeze(obj); };

var ResizeObserverSize = (function () {
    function ResizeObserverSize(inlineSize, blockSize) {
        this.inlineSize = inlineSize;
        this.blockSize = blockSize;
        freeze(this);
    }
    return ResizeObserverSize;
}());

var DOMRectReadOnly = (function () {
    function DOMRectReadOnly(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.top = this.y;
        this.left = this.x;
        this.bottom = this.top + this.height;
        this.right = this.left + this.width;
        return freeze(this);
    }
    DOMRectReadOnly.prototype.toJSON = function () {
        var _a = this, x = _a.x, y = _a.y, top = _a.top, right = _a.right, bottom = _a.bottom, left = _a.left, width = _a.width, height = _a.height;
        return { x: x, y: y, top: top, right: right, bottom: bottom, left: left, width: width, height: height };
    };
    DOMRectReadOnly.fromRect = function (rectangle) {
        return new DOMRectReadOnly(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    };
    return DOMRectReadOnly;
}());

var isSVG = function (target) { return target instanceof SVGElement && 'getBBox' in target; };
var isHidden = function (target) {
    if (isSVG(target)) {
        var _a = target.getBBox(), width = _a.width, height = _a.height;
        return !width && !height;
    }
    var _b = target, offsetWidth = _b.offsetWidth, offsetHeight = _b.offsetHeight;
    return !(offsetWidth || offsetHeight || target.getClientRects().length);
};
var isElement = function (obj) {
    var _a, _b;
    var scope = (_b = (_a = obj) === null || _a === void 0 ? void 0 : _a.ownerDocument) === null || _b === void 0 ? void 0 : _b.defaultView;
    return !!(scope && obj instanceof scope.Element);
};
var isReplacedElement = function (target) {
    switch (target.tagName) {
        case 'INPUT':
            if (target.type !== 'image') {
                break;
            }
        case 'VIDEO':
        case 'AUDIO':
        case 'EMBED':
        case 'OBJECT':
        case 'CANVAS':
        case 'IFRAME':
        case 'IMG':
            return true;
    }
    return false;
};

var global$1 = typeof window !== 'undefined' ? window : {};

var cache = new WeakMap();
var scrollRegexp = /auto|scroll/;
var verticalRegexp = /^tb|vertical/;
var IE = (/msie|trident/i).test(global$1.navigator && global$1.navigator.userAgent);
var parseDimension = function (pixel) { return parseFloat(pixel || '0'); };
var size = function (inlineSize, blockSize, switchSizes) {
    if (inlineSize === void 0) { inlineSize = 0; }
    if (blockSize === void 0) { blockSize = 0; }
    if (switchSizes === void 0) { switchSizes = false; }
    return new ResizeObserverSize((switchSizes ? blockSize : inlineSize) || 0, (switchSizes ? inlineSize : blockSize) || 0);
};
var zeroBoxes = freeze({
    devicePixelContentBoxSize: size(),
    borderBoxSize: size(),
    contentBoxSize: size(),
    contentRect: new DOMRectReadOnly(0, 0, 0, 0)
});
var calculateBoxSizes = function (target, forceRecalculation) {
    if (forceRecalculation === void 0) { forceRecalculation = false; }
    if (cache.has(target) && !forceRecalculation) {
        return cache.get(target);
    }
    if (isHidden(target)) {
        cache.set(target, zeroBoxes);
        return zeroBoxes;
    }
    var cs = getComputedStyle(target);
    var svg = isSVG(target) && target.ownerSVGElement && target.getBBox();
    var removePadding = !IE && cs.boxSizing === 'border-box';
    var switchSizes = verticalRegexp.test(cs.writingMode || '');
    var canScrollVertically = !svg && scrollRegexp.test(cs.overflowY || '');
    var canScrollHorizontally = !svg && scrollRegexp.test(cs.overflowX || '');
    var paddingTop = svg ? 0 : parseDimension(cs.paddingTop);
    var paddingRight = svg ? 0 : parseDimension(cs.paddingRight);
    var paddingBottom = svg ? 0 : parseDimension(cs.paddingBottom);
    var paddingLeft = svg ? 0 : parseDimension(cs.paddingLeft);
    var borderTop = svg ? 0 : parseDimension(cs.borderTopWidth);
    var borderRight = svg ? 0 : parseDimension(cs.borderRightWidth);
    var borderBottom = svg ? 0 : parseDimension(cs.borderBottomWidth);
    var borderLeft = svg ? 0 : parseDimension(cs.borderLeftWidth);
    var horizontalPadding = paddingLeft + paddingRight;
    var verticalPadding = paddingTop + paddingBottom;
    var horizontalBorderArea = borderLeft + borderRight;
    var verticalBorderArea = borderTop + borderBottom;
    var horizontalScrollbarThickness = !canScrollHorizontally ? 0 : target.offsetHeight - verticalBorderArea - target.clientHeight;
    var verticalScrollbarThickness = !canScrollVertically ? 0 : target.offsetWidth - horizontalBorderArea - target.clientWidth;
    var widthReduction = removePadding ? horizontalPadding + horizontalBorderArea : 0;
    var heightReduction = removePadding ? verticalPadding + verticalBorderArea : 0;
    var contentWidth = svg ? svg.width : parseDimension(cs.width) - widthReduction - verticalScrollbarThickness;
    var contentHeight = svg ? svg.height : parseDimension(cs.height) - heightReduction - horizontalScrollbarThickness;
    var borderBoxWidth = contentWidth + horizontalPadding + verticalScrollbarThickness + horizontalBorderArea;
    var borderBoxHeight = contentHeight + verticalPadding + horizontalScrollbarThickness + verticalBorderArea;
    var boxes = freeze({
        devicePixelContentBoxSize: size(Math.round(contentWidth * devicePixelRatio), Math.round(contentHeight * devicePixelRatio), switchSizes),
        borderBoxSize: size(borderBoxWidth, borderBoxHeight, switchSizes),
        contentBoxSize: size(contentWidth, contentHeight, switchSizes),
        contentRect: new DOMRectReadOnly(paddingLeft, paddingTop, contentWidth, contentHeight)
    });
    cache.set(target, boxes);
    return boxes;
};
var calculateBoxSize = function (target, observedBox, forceRecalculation) {
    var _a = calculateBoxSizes(target, forceRecalculation), borderBoxSize = _a.borderBoxSize, contentBoxSize = _a.contentBoxSize, devicePixelContentBoxSize = _a.devicePixelContentBoxSize;
    switch (observedBox) {
        case ResizeObserverBoxOptions.DEVICE_PIXEL_CONTENT_BOX:
            return devicePixelContentBoxSize;
        case ResizeObserverBoxOptions.BORDER_BOX:
            return borderBoxSize;
        default:
            return contentBoxSize;
    }
};

var ResizeObserverEntry = (function () {
    function ResizeObserverEntry(target) {
        var boxes = calculateBoxSizes(target);
        this.target = target;
        this.contentRect = boxes.contentRect;
        this.borderBoxSize = freeze([boxes.borderBoxSize]);
        this.contentBoxSize = freeze([boxes.contentBoxSize]);
        this.devicePixelContentBoxSize = freeze([boxes.devicePixelContentBoxSize]);
    }
    return ResizeObserverEntry;
}());

var calculateDepthForNode = function (node) {
    if (isHidden(node)) {
        return Infinity;
    }
    var depth = 0;
    var parent = node.parentNode;
    while (parent) {
        depth += 1;
        parent = parent.parentNode;
    }
    return depth;
};

var broadcastActiveObservations = function () {
    var shallowestDepth = Infinity;
    var callbacks = [];
    resizeObservers.forEach(function processObserver(ro) {
        if (ro.activeTargets.length === 0) {
            return;
        }
        var entries = [];
        ro.activeTargets.forEach(function processTarget(ot) {
            var entry = new ResizeObserverEntry(ot.target);
            var targetDepth = calculateDepthForNode(ot.target);
            entries.push(entry);
            ot.lastReportedSize = calculateBoxSize(ot.target, ot.observedBox);
            if (targetDepth < shallowestDepth) {
                shallowestDepth = targetDepth;
            }
        });
        callbacks.push(function resizeObserverCallback() {
            ro.callback.call(ro.observer, entries, ro.observer);
        });
        ro.activeTargets.splice(0, ro.activeTargets.length);
    });
    for (var _i = 0, callbacks_1 = callbacks; _i < callbacks_1.length; _i++) {
        var callback = callbacks_1[_i];
        callback();
    }
    return shallowestDepth;
};

var gatherActiveObservationsAtDepth = function (depth) {
    resizeObservers.forEach(function processObserver(ro) {
        ro.activeTargets.splice(0, ro.activeTargets.length);
        ro.skippedTargets.splice(0, ro.skippedTargets.length);
        ro.observationTargets.forEach(function processTarget(ot) {
            if (ot.isActive()) {
                if (calculateDepthForNode(ot.target) > depth) {
                    ro.activeTargets.push(ot);
                }
                else {
                    ro.skippedTargets.push(ot);
                }
            }
        });
    });
};

var process = function () {
    var depth = 0;
    gatherActiveObservationsAtDepth(depth);
    while (hasActiveObservations()) {
        depth = broadcastActiveObservations();
        gatherActiveObservationsAtDepth(depth);
    }
    if (hasSkippedObservations()) {
        deliverResizeLoopError();
    }
    return depth > 0;
};

var trigger;
var callbacks = [];
var notify = function () { return callbacks.splice(0).forEach(function (cb) { return cb(); }); };
var queueMicroTask = function (callback) {
    if (!trigger) {
        var toggle_1 = 0;
        var el_1 = document.createTextNode('');
        var config = { characterData: true };
        new MutationObserver(function () { return notify(); }).observe(el_1, config);
        trigger = function () { el_1.textContent = "" + (toggle_1 ? toggle_1-- : toggle_1++); };
    }
    callbacks.push(callback);
    trigger();
};

var queueResizeObserver = function (cb) {
    queueMicroTask(function ResizeObserver() {
        requestAnimationFrame(cb);
    });
};

var watching = 0;
var isWatching = function () { return !!watching; };
var CATCH_PERIOD = 250;
var observerConfig = { attributes: true, characterData: true, childList: true, subtree: true };
var events = [
    'resize',
    'load',
    'transitionend',
    'animationend',
    'animationstart',
    'animationiteration',
    'keyup',
    'keydown',
    'mouseup',
    'mousedown',
    'mouseover',
    'mouseout',
    'blur',
    'focus'
];
var time = function (timeout) {
    if (timeout === void 0) { timeout = 0; }
    return Date.now() + timeout;
};
var scheduled = false;
var Scheduler = (function () {
    function Scheduler() {
        var _this = this;
        this.stopped = true;
        this.listener = function () { return _this.schedule(); };
    }
    Scheduler.prototype.run = function (timeout) {
        var _this = this;
        if (timeout === void 0) { timeout = CATCH_PERIOD; }
        if (scheduled) {
            return;
        }
        scheduled = true;
        var until = time(timeout);
        queueResizeObserver(function () {
            var elementsHaveResized = false;
            try {
                elementsHaveResized = process();
            }
            finally {
                scheduled = false;
                timeout = until - time();
                if (!isWatching()) {
                    return;
                }
                if (elementsHaveResized) {
                    _this.run(1000);
                }
                else if (timeout > 0) {
                    _this.run(timeout);
                }
                else {
                    _this.start();
                }
            }
        });
    };
    Scheduler.prototype.schedule = function () {
        this.stop();
        this.run();
    };
    Scheduler.prototype.observe = function () {
        var _this = this;
        var cb = function () { return _this.observer && _this.observer.observe(document.body, observerConfig); };
        document.body ? cb() : global$1.addEventListener('DOMContentLoaded', cb);
    };
    Scheduler.prototype.start = function () {
        var _this = this;
        if (this.stopped) {
            this.stopped = false;
            this.observer = new MutationObserver(this.listener);
            this.observe();
            events.forEach(function (name) { return global$1.addEventListener(name, _this.listener, true); });
        }
    };
    Scheduler.prototype.stop = function () {
        var _this = this;
        if (!this.stopped) {
            this.observer && this.observer.disconnect();
            events.forEach(function (name) { return global$1.removeEventListener(name, _this.listener, true); });
            this.stopped = true;
        }
    };
    return Scheduler;
}());
var scheduler = new Scheduler();
var updateCount = function (n) {
    !watching && n > 0 && scheduler.start();
    watching += n;
    !watching && scheduler.stop();
};

var skipNotifyOnElement = function (target) {
    return !isSVG(target)
        && !isReplacedElement(target)
        && getComputedStyle(target).display === 'inline';
};
var ResizeObservation = (function () {
    function ResizeObservation(target, observedBox) {
        this.target = target;
        this.observedBox = observedBox || ResizeObserverBoxOptions.CONTENT_BOX;
        this.lastReportedSize = {
            inlineSize: 0,
            blockSize: 0
        };
    }
    ResizeObservation.prototype.isActive = function () {
        var size = calculateBoxSize(this.target, this.observedBox, true);
        if (skipNotifyOnElement(this.target)) {
            this.lastReportedSize = size;
        }
        if (this.lastReportedSize.inlineSize !== size.inlineSize
            || this.lastReportedSize.blockSize !== size.blockSize) {
            return true;
        }
        return false;
    };
    return ResizeObservation;
}());

var ResizeObserverDetail = (function () {
    function ResizeObserverDetail(resizeObserver, callback) {
        this.activeTargets = [];
        this.skippedTargets = [];
        this.observationTargets = [];
        this.observer = resizeObserver;
        this.callback = callback;
    }
    return ResizeObserverDetail;
}());

var observerMap = new WeakMap();
var getObservationIndex = function (observationTargets, target) {
    for (var i = 0; i < observationTargets.length; i += 1) {
        if (observationTargets[i].target === target) {
            return i;
        }
    }
    return -1;
};
var ResizeObserverController = (function () {
    function ResizeObserverController() {
    }
    ResizeObserverController.connect = function (resizeObserver, callback) {
        var detail = new ResizeObserverDetail(resizeObserver, callback);
        observerMap.set(resizeObserver, detail);
    };
    ResizeObserverController.observe = function (resizeObserver, target, options) {
        var detail = observerMap.get(resizeObserver);
        var firstObservation = detail.observationTargets.length === 0;
        if (getObservationIndex(detail.observationTargets, target) < 0) {
            firstObservation && resizeObservers.push(detail);
            detail.observationTargets.push(new ResizeObservation(target, options && options.box));
            updateCount(1);
            scheduler.schedule();
        }
    };
    ResizeObserverController.unobserve = function (resizeObserver, target) {
        var detail = observerMap.get(resizeObserver);
        var index = getObservationIndex(detail.observationTargets, target);
        var lastObservation = detail.observationTargets.length === 1;
        if (index >= 0) {
            lastObservation && resizeObservers.splice(resizeObservers.indexOf(detail), 1);
            detail.observationTargets.splice(index, 1);
            updateCount(-1);
        }
    };
    ResizeObserverController.disconnect = function (resizeObserver) {
        var _this = this;
        var detail = observerMap.get(resizeObserver);
        detail.observationTargets.slice().forEach(function (ot) { return _this.unobserve(resizeObserver, ot.target); });
        detail.activeTargets.splice(0, detail.activeTargets.length);
    };
    return ResizeObserverController;
}());

var ResizeObserver$1 = (function () {
    function ResizeObserver(callback) {
        if (arguments.length === 0) {
            throw new TypeError("Failed to construct 'ResizeObserver': 1 argument required, but only 0 present.");
        }
        if (typeof callback !== 'function') {
            throw new TypeError("Failed to construct 'ResizeObserver': The callback provided as parameter 1 is not a function.");
        }
        ResizeObserverController.connect(this, callback);
    }
    ResizeObserver.prototype.observe = function (target, options) {
        if (arguments.length === 0) {
            throw new TypeError("Failed to execute 'observe' on 'ResizeObserver': 1 argument required, but only 0 present.");
        }
        if (!isElement(target)) {
            throw new TypeError("Failed to execute 'observe' on 'ResizeObserver': parameter 1 is not of type 'Element");
        }
        ResizeObserverController.observe(this, target, options);
    };
    ResizeObserver.prototype.unobserve = function (target) {
        if (arguments.length === 0) {
            throw new TypeError("Failed to execute 'unobserve' on 'ResizeObserver': 1 argument required, but only 0 present.");
        }
        if (!isElement(target)) {
            throw new TypeError("Failed to execute 'unobserve' on 'ResizeObserver': parameter 1 is not of type 'Element");
        }
        ResizeObserverController.unobserve(this, target);
    };
    ResizeObserver.prototype.disconnect = function () {
        ResizeObserverController.disconnect(this);
    };
    ResizeObserver.toString = function () {
        return 'function ResizeObserver () { [polyfill code] }';
    };
    return ResizeObserver;
}());

function onresize(krono) {
    krono.isResizeNeeded = true;
}
function resize(krono) {
    const { camera, defaultCamera, renderer, effectComposer, bounds } = krono;
    updateContainersBounds(krono);
    camera.aspect = bounds.canvas.width / bounds.canvas.height;
    defaultCamera.aspect = bounds.canvas.width / bounds.canvas.height;
    switch (camera.type) {
        case 'OrthographicCamera':
            updateCameraFrustum(krono);
            break;
    }
    camera.updateProjectionMatrix();
    defaultCamera.updateProjectionMatrix();
    if (renderer) {
        renderer.setSize(bounds.canvas.width, bounds.canvas.height);
    }
    if (effectComposer) {
        effectComposer.setSize(bounds.canvas.width, bounds.canvas.height);
    }
    krono.isResizeNeeded = false;
}

function lerp (a, b, n) {
    return (1 - n) * a + n * b;
}

function bound (num, min = 0, max = 1) {
    if (num < min) {
        num = min;
    }
    if (num > max) {
        num = max;
    }
    return num;
}

class AnimationMixersScrollUpdater {
    constructor(krono, mixers, duration) {
        this.enabled = true;
        this.inertia = 0.04;
        this.currentY = 0;
        this.krono = krono;
        this.mixers = mixers;
        this.duration = duration;
        this.krono.animationMixersScrollUpdaters.push(this);
    }
    update() {
        if (!this.enabled) {
            return;
        }
        this.currentY = lerp(this.currentY, this.krono.scroll.percentage.y, this.inertia);
        this.currentY = bound(this.currentY, 0, 0.9999999);
        let time = this.duration * this.currentY;
        this.mixers.forEach(m => {
            m.setTime(time);
        });
    }
}

var ANIMATION_MODE;
(function (ANIMATION_MODE) {
    ANIMATION_MODE["SCROLL"] = "scroll";
    ANIMATION_MODE["TIME"] = "time";
    ANIMATION_MODE["NONE"] = "none";
})(ANIMATION_MODE || (ANIMATION_MODE = {}));
var ANIMATION_MODE$1 = ANIMATION_MODE;

const LOOP_POSTFIX = '_loop';
function initGLTFAnimations(krono, scene, animations) {
    if (animations.length > 0) {
        let mixer = new AnimationMixer(scene);
        animations.forEach(a => {
            if (krono.config.animationMode === ANIMATION_MODE$1.TIME || a.name.includes(LOOP_POSTFIX)) {
                let action = mixer.clipAction(a);
                action.loop = LoopRepeat;
                action.reset().play();
            }
        });
        krono.animationMixers.push(mixer);
    }
}

class SceneScrollUpdater extends AnimationMixersScrollUpdater {
    constructor(krono, scene, animations, duration) {
        super(krono, [new AnimationMixer(scene)], duration);
        this.actions = animations.map(clip => {
            if (clip.name.includes(LOOP_POSTFIX)) {
                return;
            }
            let action = this.mixers[0].clipAction(clip).reset().play();
            action.zeroSlopeAtStart = false;
            action.zeroSlopeAtEnd = false;
            return action;
        });
    }
}

function getAnimationByName (name, animations) {
    let anim = animations.filter(a => a.name === name)[0];
    if (anim !== undefined) {
        return anim;
    }
    else {
        console.error(`Анимация ${name} не найдена среди`, animations);
    }
}

class Effect {
    constructor(krono) {
        this.name = '';
        this.objectName = '';
        this.objectsKeyedList = {};
        this.objectsNamesList = {};
        this.krono = krono;
        this.uuid = this.krono.random.uuid();
        this._enabled = true;
        this.krono.effects.push(this);
    }
    get enabled() {
        return this._enabled;
    }
    set enabled(value) {
        this._enabled = value;
        this.setStatus(value);
    }
    static getInstanceByUuid(uuid, effects) {
        for (let i = 0; i < effects.length; i++) {
            if (effects[i].uuid === uuid) {
                return effects[i];
            }
        }
        console.error(`Effect's instance not found (uuid: "${uuid}").`);
        return null;
    }
    update() {
    }
    enable() {
        this.enabled = true;
    }
    disable() {
        this.enabled = false;
    }
    setStatus(status) {
    }
    getData() {
    }
    setData(data) {
    }
    getRandomData(partial = true) {
    }
    getEditorControls() {
    }
    dispose() {
    }
    onAfterSceneInit() {
    }
    updateObjectsList() {
        this.objectsKeyedList = {};
        this.objectsNamesList = [];
        this.krono.scene.traverse(object => {
            if (object instanceof Object3D) {
                if (this.isTargetObject(object)) {
                    this.objectsKeyedList[object.name] = object;
                }
            }
        });
        this.objectsKeyedList[this.krono.scene.name] = this.krono.scene;
        this.objectsKeyedList[this.krono.defaultCamera.name] = this.krono.defaultCamera;
        this.objectsNamesList = Object.keys(this.objectsKeyedList).sort((a, b) => a.localeCompare(b));
    }
    onObjectChange(name, useObjectData = false) {
        this.object = this.objectsKeyedList[name];
    }
    isTargetObject(object) {
        return true;
    }
    getObjectEditorControls() {
        this.updateObjectsList();
        return {
            objectName: {
                type: 'array',
                value: this.objectsNamesList,
                onChange: (name) => {
                    this.onObjectChange(name, true);
                }
            }
        };
    }
}
Effect.type = 'Effect';
Effect.parent = 'Effect';

function floorPowerOfTwo(value) {
    return Math.pow(2, Math.floor(Math.log(value) / Math.LN2));
}

class LightEffect extends Effect {
    constructor(krono) {
        super(krono);
        this.castShadow = false;
        this.shadowAutoUpdate = true;
        this.bias = 0;
        this.biasMinValue = 0;
        this.biasMaxValue = 1;
        this.biasStep = 0.0001;
        this.normalBias = 0;
        this.normalBiasMinValue = 0;
        this.normalBiasMaxValue = 1;
        this.normalBiasStep = 0.0001;
        this.radius = 1;
        this.radiusMinValue = 0;
        this.radiusMaxValue = 100;
        this.radiusStep = 1;
        this.mapSize = new Vector2(512, 512);
        this.mapSizeMinValue = 0;
        this.mapSizeMaxValue = 4096;
        this.mapSizeStep = 2;
        this.shadowNear = 0;
        this.shadowFar = 2000;
    }
    updateShadow() {
        this.light.castShadow = this.castShadow;
        this.light.shadow.bias = this.bias;
        this.light.shadow.normalBias = this.normalBias;
        this.light.shadow.radius = this.radius;
        this.light.shadow.mapSize.copy(this.mapSize);
        this.light.shadow.autoUpdate = this.shadowAutoUpdate;
        if (this.light.castShadow === true) {
            this.krono.renderer.shadowMap.enabled = true;
        }
    }
    dispose() {
        this.krono.scene.remove(this.light);
    }
    onAfterSceneInit() {
        this.krono.scene.add(this.light);
    }
    setStatus(status) {
        this.light.visible = status;
    }
    getShadowData() {
        return {
            castShadow: this.castShadow,
            bias: this.bias,
            normalBias: this.normalBias,
            radius: this.radius,
            mapSize: { type: 'vector', value: this.mapSize.toArray() },
            shadowAutoUpdate: this.shadowAutoUpdate
        };
    }
    setShadowData(data) {
        this.castShadow = data.castShadow;
        this.bias = data.bias;
        this.normalBias = data.normalBias;
        this.radius = data.radius;
        this.shadowAutoUpdate = data.shadowAutoUpdate;
        if (data.mapSize) {
            this.mapSize.fromArray(data.mapSize.value);
        }
    }
    getRandomShadowData() {
        return {
            castShadow: this.castShadow,
            bias: this.bias,
            normalBias: this.normalBias,
            radius: this.radius,
            mapSize: { type: 'vector', value: this.mapSize.toArray() },
            shadowAutoUpdate: this.shadowAutoUpdate
        };
    }
    getLightEditorControls() {
        return {
            enabled: {
                type: 'boolean'
            },
            intensity: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            },
            color: {
                type: 'color'
            }
        };
    }
    getShadowEditorControls() {
        return {
            castShadow: {
                type: 'boolean',
            },
            bias: {
                type: 'number',
                min: this.biasMinValue,
                max: this.biasMaxValue,
                step: this.biasStep
            },
            normalBias: {
                type: 'number',
                min: this.normalBiasMinValue,
                max: this.normalBiasMaxValue,
                step: this.normalBiasStep
            },
            radius: {
                type: 'number',
                min: this.radiusMinValue,
                max: this.radiusMaxValue,
                step: this.radiusStep
            },
            mapSize: {
                type: 'vector2',
                min: this.mapSizeMinValue,
                max: this.mapSizeMaxValue,
                step: this.mapSizeStep,
                onChange: this.onEditorMapSizeChange.bind(this)
            },
            shadowAutoUpdate: {
                type: 'boolean',
            }
        };
    }
    onEditorMapSizeChange() {
        this.mapSize.x = floorPowerOfTwo(this.mapSize.x);
        this.mapSize.y = floorPowerOfTwo(this.mapSize.y);
        if (this.light.shadow.map) {
            this.light.shadow.map.dispose();
            this.light.shadow.map = null;
        }
    }
}
LightEffect.type = 'LightEffect';
LightEffect.parent = 'LightEffect';

class AmbientLightEffect extends LightEffect {
    constructor(krono) {
        super(krono);
        this.defaultValue = 0;
        this.minValue = 0;
        this.maxValue = 3;
        this.step = 0.05;
        this.light = new AmbientLight();
        this.intensity = this.defaultValue;
        this.color = this.light.color;
    }
    update() {
        if (this.enabled) {
            this.light.visible = this.enabled;
            this.light.intensity = this.intensity;
            this.light.color = this.color;
        }
    }
    getData() {
        return {
            enabled: this.enabled,
            intensity: this.intensity,
            color: { type: 'color', value: this.color.toArray() }
        };
    }
    setData(data) {
        this.enabled = data.enabled;
        this.intensity = data.intensity;
        this.color.fromArray(data.color.value);
    }
    getRandomData() {
        return Object.assign({ enabled: true, intensity: this.krono.random.float(this.minValue, this.maxValue), color: { type: 'color', value: this.krono.random.color().toArray() } }, this.getRandomShadowData());
    }
    getEditorControls() {
        return this.getLightEditorControls();
    }
}
AmbientLightEffect.type = 'AmbientLightEffect';
AmbientLightEffect.parent = 'LightEffect';

class DirectionalLightEffect extends LightEffect {
    constructor(krono) {
        super(krono);
        this.defaultValue = 0;
        this.minValue = 0;
        this.maxValue = 3;
        this.step = 0.05;
        this.minPosition = -10;
        this.maxPosition = 10;
        this.light = new DirectionalLight();
        this.light.intensity = this.defaultValue;
        this.intensity = this.defaultValue;
        this.color = this.light.color;
        this.position = this.light.position;
    }
    update() {
        if (this.enabled) {
            this.light.visible = this.enabled;
            this.light.intensity = this.intensity;
            this.light.color = this.color;
            this.light.position.copy(this.position);
            this.updateShadow();
        }
    }
    getData() {
        return Object.assign({ enabled: this.enabled, intensity: this.intensity, color: { type: 'color', value: this.color.toArray() }, position: { type: 'vector', value: this.position.toArray() } }, this.getShadowData());
    }
    setData(data) {
        this.enabled = data.enabled;
        this.intensity = data.intensity;
        this.color.fromArray(data.color.value);
        this.position.fromArray(data.position.value);
        this.setShadowData(data);
    }
    getRandomData() {
        return Object.assign({ enabled: true, intensity: this.krono.random.float(this.minValue, this.maxValue), color: { type: 'color', value: this.krono.random.color().toArray() }, position: {
                type: 'vector',
                value: new Vector3(this.krono.random.float(this.minPosition, this.maxPosition), this.krono.random.float(this.minPosition, this.maxPosition), this.krono.random.float(this.minPosition, this.maxPosition)).toArray()
            } }, this.getRandomShadowData());
    }
    getEditorControls() {
        return Object.assign(Object.assign(Object.assign({}, this.getLightEditorControls()), { position: {
                type: 'vector3',
                min: this.minPosition,
                max: this.maxPosition,
                step: this.step
            } }), this.getShadowEditorControls());
    }
}
DirectionalLightEffect.type = 'DirectionalLightEffect';
DirectionalLightEffect.parent = 'LightEffect';

class ShadowTypeEffect extends Effect {
    constructor(krono) {
        super(krono);
        this.types = {
            BasicShadowMap: BasicShadowMap,
            PCFShadowMap: PCFShadowMap,
            PCFSoftShadowMap: PCFSoftShadowMap,
            VSMShadowMap: VSMShadowMap
        };
        this.shadowType = this.types.PCFShadowMap.toString();
    }
    get shadowType() {
        return this._shadowType;
    }
    set shadowType(value) {
        this._shadowType = value;
        if (this.krono.renderer) {
            this.krono.renderer.shadowMap.type = Number.parseInt(value);
        }
    }
    getData() {
        return {
            shadowType: this.shadowType.toString()
        };
    }
    setData(data) {
        this.shadowType = data.shadowType;
    }
    getRandomData() {
        return {
            shadowType: this.krono.random.fromArray(this.types).toString()
        };
    }
    getEditorControls() {
        return {
            shadowType: {
                type: 'array',
                value: this.types
            },
        };
    }
}
ShadowTypeEffect.type = 'ShadowTypeEffect';
ShadowTypeEffect.parent = 'Effect';

class BackgroundEffect extends Effect {
    constructor(krono) {
        super(krono);
        this.defaultValue = 0.5;
        this.minValue = 0;
        this.maxValue = 1;
        this.step = 0.01;
        this.color = new Color(1, 1, 1);
    }
    update() {
        var _a;
        if (!((_a = this.krono) === null || _a === void 0 ? void 0 : _a.scene)) {
            return;
        }
        if (this.enabled) {
            this.krono.scene.background = this.color;
        }
    }
    dispose() {
        this.krono.scene.background = new Color(1, 1, 1);
    }
    getData() {
        return {
            enabled: this.enabled,
            color: { type: 'color', value: this.color.toArray() }
        };
    }
    setData(data) {
        this.enabled = data.enabled;
        this.color.fromArray(data.color.value);
    }
    getRandomData() {
        return {
            enabled: true,
            color: { type: 'color', value: this.krono.random.color().toArray() }
        };
    }
    getEditorControls() {
        return {
            enabled: {
                type: 'boolean'
            },
            color: {
                type: 'color'
            }
        };
    }
}
BackgroundEffect.type = 'BackgroundEffect';
BackgroundEffect.parent = 'Effect';

class FogEffect extends Effect {
    constructor(krono) {
        super(krono);
        this.defaultValue = 0;
        this.defaultColor = 0xffffff;
        this.minValue = 0;
        this.maxValue = 5;
        this.step = 0.00001;
        this.density = this.defaultValue;
        this.color = new Color(this.defaultColor);
    }
    update() {
        var _a;
        if (!((_a = this.krono) === null || _a === void 0 ? void 0 : _a.scene)) {
            return;
        }
        if (this.enabled) {
            this.krono.scene.fog.density = this.density;
            this.krono.scene.fog.color = this.color;
        }
    }
    dispose() {
        this.krono.scene.fog = new FogExp2(0xffffff, this.defaultValue);
    }
    onAfterSceneInit() {
        this.krono.scene.fog = new FogExp2(this.color);
    }
    setStatus(status) {
        var _a, _b, _c, _d;
        if (status) {
            if ((_b = (_a = this.krono) === null || _a === void 0 ? void 0 : _a.scene) === null || _b === void 0 ? void 0 : _b.fog) {
                this.krono.scene.fog.density = this.defaultValue;
            }
        }
        else {
            if ((_d = (_c = this.krono) === null || _c === void 0 ? void 0 : _c.scene) === null || _d === void 0 ? void 0 : _d.fog) {
                this.krono.scene.fog.density = 0;
            }
        }
    }
    getData() {
        return {
            enabled: this.enabled,
            density: this.density,
            color: { type: 'color', value: this.color.toArray() }
        };
    }
    setData(data) {
        this.enabled = data.enabled;
        this.density = data.density;
        this.color.fromArray(data.color.value);
    }
    getRandomData() {
        return {
            enabled: true,
            density: this.krono.random.float(this.minValue, 0.0005),
            color: { type: 'color', value: this.krono.random.color().toArray() }
        };
    }
    getEditorControls() {
        return {
            enabled: {
                type: 'boolean'
            },
            density: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            },
            color: {
                type: 'color'
            }
        };
    }
}
FogEffect.type = 'FogEffect';
FogEffect.parent = 'Effect';

class WireframeEffect extends Effect {
    constructor(krono) {
        super(krono);
        this.enabled = false;
    }
    setStatus(status) {
        this.setSceneWireframe(status);
    }
    setSceneWireframe(status) {
        this.krono.scene.traverse(obj => {
            if (obj instanceof Mesh && obj.material) {
                obj.material.wireframe = status;
            }
        });
    }
    dispose() {
        this.setSceneWireframe(false);
    }
    getData() {
        return {
            enabled: this.enabled
        };
    }
    setData(data) {
        this.enabled = data.enabled;
    }
    getRandomData() {
        return {
            enabled: this.krono.random.boolean()
        };
    }
    getEditorControls() {
        return {
            enabled: {
                type: 'boolean'
            }
        };
    }
}
WireframeEffect.type = 'WireframeEffect';
WireframeEffect.parent = 'Effect';

class PixelRatioEffect extends Effect {
    constructor(krono) {
        super(krono);
        this.defaultValue = 1;
        this.minValue = 0.001;
        this.maxValue = 3;
        this.step = 0.001;
        this.pixelRatio = this.defaultValue;
    }
    update() {
        if (this.enabled && this.krono.renderer) {
            this.krono.renderer.setPixelRatio(this.pixelRatio);
        }
    }
    dispose() {
        this.krono.renderer.setPixelRatio(this.defaultValue);
    }
    setStatus(status) {
        if (status === false) {
            this.pixelRatio = this.defaultValue;
            this.krono.renderer.setPixelRatio(this.pixelRatio);
        }
    }
    getData() {
        return {
            enabled: this.enabled,
            pixelRatio: this.pixelRatio
        };
    }
    setData(data) {
        this.enabled = data.enabled;
        this.pixelRatio = data.pixelRatio;
    }
    getRandomData() {
        return {
            enabled: true,
            pixelRatio: this.krono.random.float(this.minValue, this.maxValue)
        };
    }
    getEditorControls() {
        return {
            enabled: {
                type: 'boolean'
            },
            pixelRatio: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            }
        };
    }
}
PixelRatioEffect.type = 'PixelRatioEffect';

class ScrollInertiaEffect extends Effect {
    constructor(krono) {
        super(krono);
        this.defaultValue = 0.04;
        this.minValue = 0;
        this.maxValue = 1;
        this.step = 0.00001;
        this.inertia = this.defaultValue;
    }
    update() {
        if (this.enabled) {
            this.updateInertia(this.inertia);
        }
    }
    updateInertia(inertia) {
        this.krono.animationMixersScrollUpdaters.forEach(u => u.inertia = inertia);
    }
    dispose() {
        this.updateInertia(this.defaultValue);
    }
    setStatus(status) {
        if (status) {
            this.inertia = this.defaultValue;
        }
        else {
            this.inertia = 0;
        }
        this.updateInertia(this.inertia);
    }
    getData() {
        return {
            enabled: this.enabled,
            inertia: this.inertia
        };
    }
    setData(data) {
        this.enabled = data.enabled;
        this.inertia = data.inertia;
    }
    getRandomData() {
        return {
            enabled: true,
            inertia: this.krono.random.float(this.minValue, this.maxValue)
        };
    }
    getEditorControls() {
        return {
            enabled: {
                type: 'boolean'
            },
            inertia: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            }
        };
    }
}
ScrollInertiaEffect.type = 'ScrollInertiaEffect';

class ClippingEffect extends Effect {
    constructor(krono) {
        super(krono);
        this.defaultValue = 0;
        this.minValue = -20;
        this.maxValue = 20;
        this.step = 0.001;
        this.constantX = 0;
        this.constantY = 0;
        this.constantZ = 0;
        this.negatedX = false;
        this.negatedY = false;
        this.negatedZ = false;
        this.planeHelpersSize = 0.001;
        this.planeHelpersColor = 0x000000;
        this.krono.renderer.localClippingEnabled = true;
        this.planes = [
            new Plane(new Vector3(-1, 0, 0), this.constantX),
            new Plane(new Vector3(0, -1, 0), this.constantY),
            new Plane(new Vector3(0, 0, -1), this.constantZ)
        ];
        this.planes[0].negated = this.negatedX;
        this.planes[1].negated = this.negatedY;
        this.planes[2].negated = this.negatedZ;
        if (this.krono.config.debug) {
            this.planeHelpers = this.planes.map(p => {
                return new PlaneHelper(p, this.planeHelpersSize, this.planeHelpersColor);
            });
        }
    }
    update() {
        if (this.enabled && this.object) {
            this.updatePlanes();
        }
    }
    updatePlanes() {
        this.planes[0].constant = this.constantX;
        this.planes[1].constant = this.constantY;
        this.planes[2].constant = this.constantZ;
        if (this.planes[0].negated !== this.negatedX) {
            this.planes[0].negated = this.negatedX;
            this.planes[0].negate();
        }
        if (this.planes[1].negated !== this.negatedY) {
            this.planes[1].negated = this.negatedY;
            this.planes[1].negate();
        }
        if (this.planes[2].negated !== this.negatedZ) {
            this.planes[2].negated = this.negatedZ;
            this.planes[2].negate();
        }
    }
    dispose() {
        if (this.object) {
            this.object.material.clippingPlanes = [];
        }
    }
    getData() {
        let obj = {
            enabled: this.enabled,
            objectName: this.objectName,
            constantX: this.constantX,
            constantY: this.constantY,
            constantZ: this.constantZ,
            negatedX: this.negatedX,
            negatedY: this.negatedY,
            negatedZ: this.negatedZ
        };
        return obj;
    }
    setData(data) {
        this.enabled = data.enabled;
        this.objectName = data.objectName;
        this.constantX = data.constantX;
        this.constantY = data.constantY;
        this.constantZ = data.constantZ;
        this.negatedX = data.negatedX;
        this.negatedY = data.negatedY;
        this.negatedZ = data.negatedZ;
    }
    onAfterSceneInit() {
        this.updateObjectsList();
        if (this.objectName !== '') {
            this.onObjectChange(this.objectName);
            this.updatePlanes();
        }
    }
    getEditorControls() {
        const obj = {
            enabled: {
                type: 'boolean'
            },
            constantX: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            },
            negatedX: {
                type: 'boolean'
            },
            constantY: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            },
            negatedY: {
                type: 'boolean'
            },
            constantZ: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            },
            negatedZ: {
                type: 'boolean'
            }
        };
        return Object.assign(Object.assign({}, obj), this.getObjectEditorControls());
    }
    onObjectChange(name) {
        if (!this.object) {
            this.object = this.objectsKeyedList[name];
        }
        if (!this.object) {
            console.error(`Не найден меш с именем ${name} в ${this.constructor.name}!`);
            return;
        }
        if (!this.object.material.clippingPlanes) {
            this.object.material.clippingPlanes = [];
        }
        this.object.material.clippingPlanes = this.object.material.clippingPlanes.filter(p => !this.planes.includes(p));
        this.object = this.objectsKeyedList[name];
        if (!this.object.material.clippingPlanes) {
            this.object.material.clippingPlanes = [];
        }
        this.object.material.clippingPlanes.push(...this.planes);
    }
    isTargetObject(object) {
        if (object.geometry !== undefined) {
            return true;
        }
        else {
            return false;
        }
    }
}
ClippingEffect.type = 'ClippingEffect';

class OpacityEffect extends Effect {
    constructor(krono) {
        super(krono);
        this.defaultValue = 1;
        this.minValue = 0;
        this.maxValue = 1;
        this.step = 0.001;
        this.opacity = 0;
    }
    update() {
        if (this.enabled && this.object) {
            this.updateObject();
        }
    }
    updateObject() {
        this.object.material.opacity = this.opacity;
    }
    getData() {
        return {
            enabled: this.enabled,
            objectName: this.objectName,
            opacity: this.opacity
        };
    }
    setData(data) {
        this.enabled = data.enabled;
        this.objectName = data.objectName;
        this.opacity = data.opacity;
    }
    onAfterSceneInit() {
        this.updateObjectsList();
        if (this.objectName !== '') {
            this.onObjectChange(this.objectName);
            this.updateObject();
        }
    }
    getEditorControls() {
        const obj = {
            enabled: {
                type: 'boolean'
            },
            opacity: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            }
        };
        return Object.assign(Object.assign({}, obj), this.getObjectEditorControls());
    }
    onObjectChange(name) {
        this.object = this.objectsKeyedList[name];
        this.object.material.transparent = true;
    }
    isTargetObject(object) {
        if (object.material !== undefined) {
            return true;
        }
        else {
            return false;
        }
    }
}
OpacityEffect.type = 'OpacityEffect';

class Audio extends PositionalAudio {
    constructor(krono, buffer, uuid, name) {
        super(krono.audioListener);
        this.krono = krono;
        this.setBuffer(buffer);
        if (uuid && uuid !== '') {
            this.uuid = uuid;
        }
        if (name) {
            this.name = name;
        }
        this.krono.audios.push(this);
        this.krono.scene.add(this);
    }
    dispose() {
        if (this.source) {
            this.stop();
        }
        this.krono.scene.remove(this);
        const index = this.krono.audios.indexOf(this);
        if (index > -1) {
            this.krono.audios.splice(index, 1);
        }
    }
}
function initKeyframesAudios(krono, keyframesAudios) {
    if (!keyframesAudios) {
        return;
    }
    keyframesAudios.forEach((k) => {
        if (krono.assets.audios[k.path]) {
            new Audio(krono, krono.assets.audios[k.path], k.uuid, k.name);
        }
        else {
            console.error('For some keyframes you need to load audio with path', k.path);
        }
    });
}
function getAudioInstance(uuid, audios) {
    let audio = audios.filter(a => a.uuid === uuid)[0];
    if (audio !== undefined && uuid !== undefined && uuid !== null) {
        return audio;
    }
    else {
        console.error(`Audio instance not found, uuid: ${uuid}`, audios);
    }
}

class AudioEffect extends Effect {
    constructor(krono) {
        super(krono);
        this.audioUuid = null;
    }
    setStatus(status) {
        if (!this.effectNode) {
            return;
        }
        if (status) {
            this.connect();
        }
        else {
            this.disconnect();
        }
    }
    dispose() {
        if (this.effectNode) {
            this.disconnect();
        }
    }
    connect() {
        if (this.audio === undefined) {
            return;
        }
        let filters = [...this.audio.filters];
        if (this.effectNode && !filters.includes(this.effectNode)) {
            filters = [...filters, this.effectNode];
        }
        this.audio.setFilters(filters);
    }
    disconnect() {
        if (this.audio === undefined) {
            return;
        }
        let filters = [...this.audio.filters];
        filters = filters.filter(f => f !== this.effectNode);
        this.audio.setFilters(filters);
    }
    changeAudio(audio, playAudio = false) {
        if (typeof audio === 'string') {
            audio = getAudioInstance(audio, this.krono.audios);
        }
        if (!audio) {
            console.error(`${this.constructor.name}: audio not found`, audio);
            return;
        }
        if (playAudio && this.audio) {
            try {
                this.audio.pause();
            }
            catch (e) {
                console.log('this.audio.pause()', this.audio);
                console.trace(e);
            }
        }
        this.disconnect();
        this.audio = audio;
        this.context = this.audio.context;
        this.audioUuid = this.audio.uuid;
        this.onAudioChange();
        if (playAudio) {
            try {
                this.audio.play();
            }
            catch (e) {
                console.log('this.audio.play()', this.audio);
                console.trace(e);
            }
        }
        if (this.enabled) {
            this.connect();
        }
    }
    getAudioData() {
        return {
            audioUuid: this.audioUuid,
            objectName: this.objectName
        };
    }
    setAudioData(data) {
        this.changeAudio(data.audioUuid);
        this.objectName = data.objectName;
    }
    onAudioChange() {
    }
    onObjectChange(name, message = false) {
        if (!this.object) {
            this.object = this.objectsKeyedList[name];
        }
    }
    getAudioEditorControls() {
        return {
            toggle: {
                type: 'function',
                onChange: this.onEditorToggleChange.bind(this)
            },
            audioUuid: {
                type: 'array',
                value: [],
                onChange: this.onEditorAudioChange.bind(this)
            }
        };
    }
    onEditorAudioChange(name) {
        const splitted = name.split(',');
        const index = splitted[splitted.length - 1].trim();
        this.changeAudio(this.krono.audios[index], true);
    }
    onEditorToggleChange() {
        if (this.audio === undefined) {
            return;
        }
        if (this.audio.isPlaying) {
            this.audio.pause();
        }
        else {
            this.audio.play();
        }
    }
}
AudioEffect.type = 'AudioEffect';
AudioEffect.parent = 'AudioEffect';

class LowPassAudioEffect extends AudioEffect {
    constructor(krono) {
        super(krono);
        this.frequencyDefaultValue = 350;
        this.frequencyMinValue = 0;
        this.frequencyMaxValue = 10000;
        this.detuneDefaultValue = 0;
        this.detuneMinValue = -1000;
        this.detuneMaxValue = 1000;
        this.qDefaultValue = 0;
        this.qMinValue = 0;
        this.qMaxValue = 100;
        this.frequency = this.frequencyDefaultValue;
        this.detune = this.detuneDefaultValue;
        this.Q = this.qDefaultValue;
    }
    update() {
        if (this.enabled && this.effectNode) {
            this.effectNode.frequency.setValueAtTime(this.frequency, this.context.currentTime);
            this.effectNode.detune.setValueAtTime(this.detune, this.context.currentTime);
            this.effectNode.Q.setValueAtTime(this.Q, this.context.currentTime);
        }
    }
    getData() {
        return Object.assign({ enabled: this.enabled, frequency: this.frequency, detune: this.detune, Q: this.Q }, this.getAudioData());
    }
    setData(data) {
        this.enabled = data.enabled;
        this.frequency = data.frequency;
        this.detune = data.detune;
        this.Q = data.Q;
        this.setAudioData(data);
    }
    onAudioChange() {
        this.effectNode = this.context.createBiquadFilter();
        this.effectNode.type = 'lowpass';
    }
    getEditorControls() {
        return Object.assign(Object.assign({ enabled: {
                type: 'boolean'
            } }, this.getAudioEditorControls()), { frequency: {
                type: 'number',
                min: this.frequencyMinValue,
                max: this.frequencyMaxValue,
                step: 1
            }, detune: {
                type: 'number',
                min: this.detuneMinValue,
                max: this.detuneMaxValue,
                step: 1
            }, Q: {
                type: 'number',
                min: this.qMinValue,
                max: this.qMaxValue,
                step: 1
            } });
    }
}
LowPassAudioEffect.type = 'LowPassAudioEffect';
LowPassAudioEffect.parent = 'AudioEffect';

class HighPassAudioEffect extends AudioEffect {
    constructor(krono) {
        super(krono);
        this.frequencyDefaultValue = 350;
        this.frequencyMinValue = 0;
        this.frequencyMaxValue = 10000;
        this.detuneDefaultValue = 0;
        this.detuneMinValue = -1000;
        this.detuneMaxValue = 1000;
        this.qDefaultValue = 0;
        this.qMinValue = 0;
        this.qMaxValue = 100;
        this.frequency = this.frequencyDefaultValue;
        this.detune = this.detuneDefaultValue;
        this.Q = this.qDefaultValue;
    }
    update() {
        if (this.enabled && this.effectNode) {
            this.effectNode.frequency.setValueAtTime(this.frequency, this.context.currentTime);
            this.effectNode.detune.setValueAtTime(this.detune, this.context.currentTime);
            this.effectNode.Q.setValueAtTime(this.Q, this.context.currentTime);
        }
    }
    getData() {
        return Object.assign({ enabled: this.enabled, frequency: this.frequency, detune: this.detune, Q: this.Q }, this.getAudioData());
    }
    setData(data) {
        this.enabled = data.enabled;
        this.frequency = data.frequency;
        this.detune = data.detune;
        this.Q = data.Q;
        this.setAudioData(data);
    }
    onAudioChange() {
        this.effectNode = this.context.createBiquadFilter();
        this.effectNode.type = 'highpass';
    }
    getEditorControls() {
        return Object.assign(Object.assign({ enabled: {
                type: 'boolean'
            } }, this.getAudioEditorControls()), { frequency: {
                type: 'number',
                min: this.frequencyMinValue,
                max: this.frequencyMaxValue,
                step: 1
            }, detune: {
                type: 'number',
                min: this.detuneMinValue,
                max: this.detuneMaxValue,
                step: 1
            }, Q: {
                type: 'number',
                min: this.qMinValue,
                max: this.qMaxValue,
                step: 1
            } });
    }
}
HighPassAudioEffect.type = 'HighPassAudioEffect';
HighPassAudioEffect.parent = 'AudioEffect';

class PlayAudioEffect extends AudioEffect {
    constructor(krono) {
        super(krono);
    }
    setStatus(status) {
        if (this.audio === undefined) {
            return;
        }
        try {
            if (status) {
                this.audio.play();
            }
            else {
                this.audio.pause();
            }
        }
        catch (e) {
            console.log('setStatus', status, this.audio);
            console.trace(e);
        }
    }
    getData() {
        return Object.assign({ enabled: this.enabled }, this.getAudioData());
    }
    setData(data) {
        this.enabled = data.enabled;
        this.setAudioData(data);
        this.setStatus(this.enabled);
    }
    getEditorControls() {
        return Object.assign({ enabled: {
                type: 'boolean'
            } }, this.getAudioEditorControls());
    }
}
PlayAudioEffect.type = 'PlayAudioEffect';
PlayAudioEffect.parent = 'AudioEffect';

class LoopAudioEffect extends AudioEffect {
    constructor(krono) {
        super(krono);
    }
    setStatus(status) {
        if (this.audio === undefined) {
            return;
        }
        this.audio.setLoop(status);
    }
    getData() {
        return Object.assign({ enabled: this.enabled }, this.getAudioData());
    }
    setData(data) {
        this.enabled = data.enabled;
        this.setAudioData(data);
        this.setStatus(this.enabled);
    }
    getEditorControls() {
        return Object.assign({ enabled: {
                type: 'boolean'
            } }, this.getAudioEditorControls());
    }
}
LoopAudioEffect.type = 'LoopAudioEffect';
LoopAudioEffect.parent = 'AudioEffect';

class SpeedAudioEffect extends AudioEffect {
    constructor(krono) {
        super(krono);
        this.defaultValue = 1;
        this.minValue = 0;
        this.maxValue = 2;
        this.step = 0.01;
        this.playbackRate = this.defaultValue;
    }
    update() {
        if (this.enabled && this.audio && this.audio.source) {
            this.audio.source.playbackRate.setValueAtTime(this.playbackRate, this.context.currentTime);
        }
    }
    getData() {
        return Object.assign({ enabled: this.enabled, playbackRate: this.playbackRate }, this.getAudioData());
    }
    setData(data) {
        this.enabled = data.enabled;
        this.playbackRate = data.playbackRate;
        this.setAudioData(data);
    }
    getEditorControls() {
        return Object.assign(Object.assign({ enabled: {
                type: 'boolean'
            } }, this.getAudioEditorControls()), { playbackRate: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            } });
    }
}
SpeedAudioEffect.type = 'SpeedAudioEffect';
SpeedAudioEffect.parent = 'AudioEffect';

class VolumeAudioEffect extends AudioEffect {
    constructor(krono) {
        super(krono);
        this.defaultValue = 1;
        this.minValue = 0;
        this.maxValue = 10;
        this.step = 0.01;
        this.volume = this.defaultValue;
    }
    update() {
        if (this.enabled && this.audio && this.audio.source) {
            this.audio.gain.gain.setValueAtTime(this.volume, this.context.currentTime);
        }
    }
    getData() {
        return Object.assign({ enabled: this.enabled, volume: this.volume }, this.getAudioData());
    }
    setData(data) {
        this.enabled = data.enabled;
        this.volume = data.volume;
        this.setAudioData(data);
    }
    getEditorControls() {
        return Object.assign(Object.assign({ enabled: {
                type: 'boolean'
            } }, this.getAudioEditorControls()), { volume: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            } });
    }
}
VolumeAudioEffect.type = 'VolumeAudioEffect';
VolumeAudioEffect.parent = 'AudioEffect';

class AspectCameraEffect extends Effect {
    constructor(krono) {
        super(krono);
        this.defaultValue = 0;
        this.minValue = -10;
        this.maxValue = 10;
        this.step = 0.01;
        this.negateChance = 0;
        this.aspect = this.defaultValue;
    }
    update() {
        var _a;
        if (!((_a = this.krono) === null || _a === void 0 ? void 0 : _a.camera)) {
            return;
        }
        if (this.enabled) {
            this.krono.camera.aspect = this.getCurrentAspect() + this.aspect;
        }
        this.krono.camera.updateProjectionMatrix();
    }
    dispose() {
        this.krono.camera.aspect = this.getCurrentAspect();
        this.krono.camera.updateProjectionMatrix();
    }
    onAfterSceneInit() {
        if (!(this.krono.camera instanceof PerspectiveCamera)) {
            console.error(`Тип камеры не PerspectiveCamera, а ${this.krono.camera.type}, поэтому AspectCameraEffect не заработает`, this.uuid, this);
        }
    }
    getCurrentAspect() {
        return this.krono.bounds.canvas.width / this.krono.bounds.canvas.height;
    }
    getData() {
        return {
            enabled: this.enabled,
            aspect: this.aspect
        };
    }
    setData(data) {
        this.enabled = data.enabled;
        this.aspect = data.aspect;
    }
    getRandomData() {
        let aspect = this.krono.random.float(0, 5);
        if (this.krono.random.float() < this.negateChance) {
            aspect *= -1;
        }
        return {
            enabled: true,
            aspect: aspect
        };
    }
    getEditorControls() {
        return {
            enabled: {
                type: 'boolean'
            },
            aspect: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            }
        };
    }
}
AspectCameraEffect.type = 'AspectCameraEffect';
AspectCameraEffect.parent = 'Effect';

class FovCameraEffect extends Effect {
    constructor(krono) {
        super(krono);
        this.defaultValue = 40;
        this.minValue = -179;
        this.maxValue = 179;
        this.step = 0.5;
        this.negateChance = 0;
        this.fov = this.defaultValue;
    }
    update() {
        var _a;
        if (!((_a = this.krono) === null || _a === void 0 ? void 0 : _a.camera)) {
            return;
        }
        if (this.enabled) {
            this.krono.camera.fov = this.fov;
        }
        this.krono.camera.updateProjectionMatrix();
    }
    dispose() {
        this.krono.camera.fov = this.krono.defaultCamera.fov;
        this.krono.camera.updateProjectionMatrix();
    }
    onAfterSceneInit() {
        if (!(this.krono.camera instanceof PerspectiveCamera)) {
            console.error(`Тип камеры не PerspectiveCamera, а ${this.krono.camera.type}, поэтому FovCameraEffect не заработает`, this.uuid, this);
        }
    }
    getData() {
        return {
            enabled: this.enabled,
            fov: this.fov
        };
    }
    setData(data) {
        this.enabled = data.enabled;
        this.fov = data.fov;
    }
    getRandomData() {
        let fov = this.krono.random.float(30, 150);
        if (this.krono.random.float() < this.negateChance) {
            fov *= -1;
        }
        return {
            enabled: true,
            fov: fov
        };
    }
    getEditorControls() {
        return {
            enabled: {
                type: 'boolean'
            },
            fov: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            }
        };
    }
}
FovCameraEffect.type = 'FovCameraEffect';
FovCameraEffect.parent = 'Effect';

class ZoomCameraEffect extends Effect {
    constructor(krono) {
        super(krono);
        this.defaultValue = 1;
        this.minValue = -5;
        this.maxValue = 15;
        this.step = 0.1;
        this.negateChance = 0;
        this.zoom = this.defaultValue;
    }
    update() {
        var _a;
        if (!((_a = this.krono) === null || _a === void 0 ? void 0 : _a.camera)) {
            return;
        }
        if (this.enabled) {
            this.krono.camera.zoom = this.zoom;
        }
        this.krono.camera.updateProjectionMatrix();
    }
    dispose() {
        this.krono.camera.zoom = this.defaultValue;
        this.krono.camera.updateProjectionMatrix();
    }
    onAfterSceneInit() {
        if (!(this.krono.camera instanceof PerspectiveCamera)) {
            console.error(`Тип камеры не PerspectiveCamera, а ${this.krono.camera.type}, поэтому ZoomCameraEffect не заработает`, this.uuid, this);
        }
    }
    getData() {
        return {
            enabled: this.enabled,
            zoom: this.zoom
        };
    }
    setData(data) {
        this.enabled = data.enabled;
        this.zoom = data.zoom;
    }
    getRandomData() {
        let zoom = this.krono.random.float(0, 5);
        if (this.krono.random.float() < this.negateChance) {
            zoom *= -1;
        }
        return {
            enabled: true,
            zoom: zoom
        };
    }
    getEditorControls() {
        return {
            enabled: {
                type: 'boolean'
            },
            zoom: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            }
        };
    }
}
ZoomCameraEffect.type = 'ZoomCameraEffect';
ZoomCameraEffect.parent = 'Effect';

class DistanceCameraEffect extends Effect {
    constructor(krono) {
        super(krono);
        this.defaultValue = 0.1;
        this.minValue = 0.1;
        this.maxValue = 10000;
        this.step = 0.1;
        this.swapChance = 0.1;
        this.strongChance = 0.15;
        this.near = 0.1;
        this.far = 2000;
    }
    update() {
        var _a;
        if (!((_a = this.krono) === null || _a === void 0 ? void 0 : _a.camera)) {
            return;
        }
        if (this.enabled) {
            this.krono.camera.near = this.near;
            this.krono.camera.far = this.far;
            if (this.near < this.far) {
                this.krono.raycasting.raycaster.near = this.near;
                this.krono.raycasting.raycaster.far = this.far;
            }
        }
        this.krono.camera.updateProjectionMatrix();
    }
    dispose() {
        this.krono.camera.near = this.krono.defaultCamera.near;
        this.krono.camera.far = this.krono.defaultCamera.far;
        this.krono.raycasting.raycaster.near = this.krono.defaultCamera.near;
        this.krono.raycasting.raycaster.far = this.krono.defaultCamera.far;
        this.krono.camera.updateProjectionMatrix();
    }
    getData() {
        return {
            enabled: this.enabled,
            near: this.near,
            far: this.far
        };
    }
    setData(data) {
        this.enabled = data.enabled;
        this.near = data.near;
        this.far = data.far;
    }
    getRandomData() {
        let a = this.krono.random.float(0.0001, 10);
        let b = this.krono.random.float(600, 1000);
        if (this.krono.random.float() < this.strongChance) {
            this.krono.random.float(0.0001, 600);
            this.krono.random.float(0.0001, 600);
        }
        let near = Math.min(a, b);
        let far = Math.max(a, b);
        if (this.krono.random.float() < this.swapChance) {
            near = Math.max(a, b);
            far = Math.min(a, b);
        }
        return {
            enabled: true,
            near: near,
            far: far
        };
    }
    getEditorControls() {
        return {
            enabled: {
                type: 'boolean'
            },
            near: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            },
            far: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            }
        };
    }
}
DistanceCameraEffect.type = 'DistanceCameraEffect';
DistanceCameraEffect.parent = 'Effect';

class FrustumCameraEffect extends Effect {
    constructor(krono) {
        super(krono);
        this.defaultValue = 8;
        this.minValue = 1;
        this.maxValue = 200;
        this.step = 0.1;
        this.isProportional = false;
        this.proportion = 1;
        this.frustumX = this.defaultValue;
        this.frustumY = this.defaultValue;
    }
    update() {
        var _a;
        if (!((_a = this.krono) === null || _a === void 0 ? void 0 : _a.camera)) {
            return;
        }
        if (this.enabled) {
            this.krono.camera.frustumX = this.frustumX;
            this.krono.camera.frustumY = this.frustumY;
            this.krono.updateCameraFrustum();
        }
        this.krono.camera.updateProjectionMatrix();
    }
    dispose() {
        this.krono.camera.frustumX = this.defaultValue;
        this.krono.camera.frustumY = this.defaultValue;
        this.krono.updateCameraFrustum();
    }
    onAfterSceneInit() {
        if (this.krono.camera.frustumX) {
            this.frustumX = this.krono.camera.frustumX;
        }
        else {
            this.frustumX = this.defaultValue;
        }
        if (this.krono.camera.frustumY) {
            this.frustumY = this.krono.camera.frustumY;
        }
        else {
            this.frustumY = this.defaultValue;
        }
        if (!(this.krono.camera instanceof OrthographicCamera)) {
            console.error(`Тип камеры не OrthographicCamera, а ${this.krono.camera.type}, поэтому FrustumCameraEffect не заработает`, this.uuid, this);
        }
    }
    getData() {
        return {
            enabled: this.enabled,
            frustumX: this.frustumX,
            frustumY: this.frustumY
        };
    }
    setData(data) {
        this.enabled = data.enabled;
        this.frustumX = data.frustumX;
        this.frustumY = data.frustumY;
    }
    getRandomData() {
        return {
            enabled: true,
            frustumX: this.krono.random.float(this.minValue, this.maxValue),
            frustumY: this.krono.random.float(this.minValue, this.maxValue)
        };
    }
    getEditorControls() {
        return {
            enabled: {
                type: 'boolean'
            },
            isProportional: {
                type: 'boolean',
                onChange: this.onProportionToggle.bind(this)
            },
            frustumX: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step,
                onChange: this.onFrustumXChange.bind(this)
            },
            frustumY: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step,
                onChange: this.onFrustumYChange.bind(this)
            }
        };
    }
    onProportionToggle() {
        const min = Math.min(this.frustumX, this.frustumY);
        const max = Math.max(this.frustumX, this.frustumY);
        this.proportion = min / max;
    }
    onFrustumXChange() {
        if (this.isProportional) {
            if (this.frustumX >= this.frustumY) {
                this.frustumY = this.frustumX * this.proportion;
            }
            else {
                this.frustumY = this.frustumX / this.proportion;
            }
        }
    }
    onFrustumYChange() {
        if (this.isProportional) {
            if (this.frustumY >= this.frustumX) {
                this.frustumX = this.frustumY * this.proportion;
            }
            else {
                this.frustumX = this.frustumY / this.proportion;
            }
        }
    }
}
FrustumCameraEffect.type = 'FrustumCameraEffect';
FrustumCameraEffect.parent = 'Effect';

class PostEffect extends Effect {
    constructor(krono, effectsAndOptions) {
        super(krono);
        this.forbiddenBlendModes = [];
        this.effects = effectsAndOptions.map(obj => {
            if (obj.options && obj.options.length > 0) {
                return new obj.effect(...obj.options);
            }
            else {
                return new obj.effect();
            }
        });
        this.effect = this.effects[this.effects.length - 1];
        this.blendFunction = this.effect.blendMode.getBlendFunction();
        this.blendOpacity = this.effect.blendMode.opacity.value;
    }
    get blendFunction() {
        return this._blendFunction;
    }
    set blendFunction(value) {
        this._blendFunction = value;
        this.effects.forEach(effect => {
            effect.blendMode.setBlendFunction(Number.parseInt(value));
        });
    }
    onAfterSceneInit() {
        if (this.pass) {
            return;
        }
        this.pass = new EffectPass(this.krono.camera, ...this.effects);
        this.krono.effectComposer.addPass(this.pass);
        this.krono.postEffects.push(this);
        this.krono.resize();
    }
    setStatus(status) {
        this.krono.postEffects.forEach(e => e.pass.renderToScreen = false);
        this.krono.renderPass.renderToScreen = false;
        if (this.pass) {
            this.pass.enabled = status;
        }
        const enabledPostEffects = this.krono.postEffects.filter(v => v.pass.enabled);
        if (enabledPostEffects.length) {
            enabledPostEffects[enabledPostEffects.length - 1].pass.renderToScreen = true;
        }
        else {
            this.krono.renderPass.renderToScreen = true;
        }
    }
    dispose() {
        this.setStatus(false);
        if (this.pass) {
            this.pass.dispose();
        }
        this.effects.forEach(effect => {
            effect.dispose();
        });
    }
    updateBlendMode() {
        this.effects.forEach(effect => {
            effect.blendMode.opacity.value = this.blendOpacity;
        });
    }
    getBlendModeData() {
        return {
            blendFunction: this.blendFunction.toString(),
            blendOpacity: this.blendOpacity
        };
    }
    setBlendModeData(data) {
        this.blendFunction = data.blendFunction;
        this.blendOpacity = data.blendOpacity;
    }
    getRandomBlendFunction() {
        let modes = Object.values(BlendFunction);
        modes = modes.filter(mode => !this.forbiddenBlendModes.includes(mode));
        return this.krono.random.fromArray(modes).toString();
    }
    getRandomBlendOpacity() {
        return this.krono.random.float(0.75, 1);
    }
    getBlendModesEditorControls() {
        return {
            blendFunction: {
                type: 'array',
                value: BlendFunction
            },
            blendOpacity: {
                type: 'number',
                min: 0,
                max: 1,
                step: 0.01
            }
        };
    }
}
PostEffect.type = 'PostEffect';
PostEffect.parent = 'PostEffect';

class ChromaticAberrationPostEffect extends PostEffect {
    constructor(krono) {
        super(krono, [{ effect: ChromaticAberrationEffect }]);
        this.defaultValue = 0;
        this.minValue = -1;
        this.maxValue = 1;
        this.step = 0.00001;
        this.hardValueChance = 0.1;
        this.x = this.defaultValue;
        this.y = this.defaultValue;
    }
    update() {
        if (this.enabled) {
            this.pass.effects[0].uniforms.get('offset').value.x = this.x;
            this.pass.effects[0].uniforms.get('offset').value.y = this.y;
            this.updateBlendMode();
        }
    }
    getData() {
        return Object.assign({ enabled: this.enabled, x: this.x, y: this.y }, this.getBlendModeData());
    }
    setData(data) {
        this.enabled = data.enabled;
        this.x = data.x;
        this.y = data.y;
        this.setBlendModeData(data);
    }
    getRandomData(partial = true) {
        let x = this.krono.random.float(0, 0.02);
        let y = this.krono.random.float(0, 0.02);
        if (this.krono.random.float() > 0.5) {
            x *= -1;
        }
        if (this.krono.random.float() > 0.5) {
            y *= -1;
        }
        if (this.krono.random.float() < this.hardValueChance) {
            x = this.krono.random.float(this.minValue, this.maxValue);
            y = this.krono.random.float(this.minValue, this.maxValue);
        }
        if (x === 0) {
            x = 0.02;
        }
        if (y === 0) {
            y = 0.02;
        }
        let data = {
            enabled: true,
            x: x,
            y: y,
            blendFunction: this.blendFunction.toString(),
            blendOpacity: this.blendOpacity
        };
        if (partial === false) {
            data.blendFunction = this.getRandomBlendFunction();
            data.blendOpacity = this.getRandomBlendOpacity();
        }
        return data;
    }
    getEditorControls() {
        let obj = {
            enabled: {
                type: 'boolean'
            },
            x: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            },
            y: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            }
        };
        return Object.assign(Object.assign({}, obj), this.getBlendModesEditorControls());
    }
}
ChromaticAberrationPostEffect.type = 'ChromaticAberrationPostEffect';
ChromaticAberrationPostEffect.parent = 'PostEffect';

class GlitchPostEffect extends PostEffect {
    constructor(krono) {
        super(krono, [{ effect: GlitchEffect }]);
        this.delayMinValue = 0;
        this.delayMaxValue = 4;
        this.delayStep = 0.01;
        this.durationMinValue = 0;
        this.durationMaxValue = 2;
        this.durationStep = 0.01;
        this.strengthMinValue = 0;
        this.strengthMaxValue = 1;
        this.strengthStep = 0.001;
        this.delayX = this.delayMinValue;
        this.delayY = this.delayMaxValue;
        this.durationX = this.durationMinValue;
        this.durationY = this.durationMaxValue;
        this.strengthX = this.strengthMinValue;
        this.strengthY = this.strengthMaxValue;
    }
    update() {
        if (this.enabled) {
            this.pass.effects[0].delay.x = this.delayX;
            this.pass.effects[0].delay.y = this.delayY;
            this.pass.effects[0].duration.x = this.durationX;
            this.pass.effects[0].duration.y = this.durationY;
            this.pass.effects[0].strength.x = this.strengthX;
            this.pass.effects[0].strength.y = this.strengthY;
        }
    }
    getData() {
        return {
            enabled: this.enabled,
            delayX: this.delayX,
            delayY: this.delayY,
            durationX: this.durationX,
            durationY: this.durationY,
            strengthX: this.strengthX,
            strengthY: this.strengthY
        };
    }
    setData(data) {
        this.enabled = data.enabled;
        this.delayX = data.delayX;
        this.delayY = data.delayY;
        this.durationX = data.durationX;
        this.durationY = data.durationY;
        this.strengthX = data.strengthX;
        this.strengthY = data.strengthY;
    }
    getRandomData() {
        return {
            enabled: true,
            delayX: this.krono.random.float(this.delayMinValue, this.delayMaxValue),
            delayY: this.krono.random.float(this.delayMinValue, this.delayMaxValue),
            durationX: this.krono.random.float(this.durationMinValue, this.durationMaxValue),
            durationY: this.krono.random.float(this.durationMinValue, this.durationMaxValue),
            strengthX: this.krono.random.float(this.strengthMinValue, this.strengthMaxValue),
            strengthY: this.krono.random.float(this.strengthMinValue, this.strengthMaxValue)
        };
    }
    getEditorControls() {
        return {
            enabled: {
                type: 'boolean'
            },
            delayX: {
                type: 'number',
                min: this.delayMinValue,
                max: this.delayMaxValue,
                step: this.delayStep
            },
            delayY: {
                type: 'number',
                min: this.delayMinValue,
                max: this.delayMaxValue,
                step: this.delayStep
            },
            durationX: {
                type: 'number',
                min: this.durationMinValue,
                max: this.durationMaxValue,
                step: this.durationStep
            },
            durationY: {
                type: 'number',
                min: this.durationMinValue,
                max: this.durationMaxValue,
                step: this.durationStep
            },
            strengthX: {
                type: 'number',
                min: this.strengthMinValue,
                max: this.strengthMaxValue,
                step: this.strengthStep
            },
            strengthY: {
                type: 'number',
                min: this.strengthMinValue,
                max: this.strengthMaxValue,
                step: this.strengthStep
            }
        };
    }
}
GlitchPostEffect.type = 'GlitchPostEffect';
GlitchPostEffect.parent = 'PostEffect';

class HuePostEffect extends PostEffect {
    constructor(krono) {
        super(krono, [{ effect: HueSaturationEffect }]);
        this.defaultValue = 0;
        this.minValue = -Math.PI;
        this.maxValue = Math.PI;
        this.step = 0.01;
        this.forbiddenBlendModes = [
            BlendFunction.ADD,
            BlendFunction.DARKEN
        ];
        this.hue = this.defaultValue;
    }
    update() {
        if (this.enabled) {
            this.effect.setHue(this.hue);
            this.updateBlendMode();
        }
    }
    getData() {
        return Object.assign({ enabled: this.enabled, hue: this.hue }, this.getBlendModeData());
    }
    setData(data) {
        this.enabled = data.enabled;
        this.hue = data.hue;
        this.setBlendModeData(data);
    }
    getRandomData(partial = true) {
        let data = {
            enabled: true,
            hue: this.krono.random.float(this.minValue, this.maxValue),
            blendFunction: this.blendFunction.toString(),
            blendOpacity: this.blendOpacity
        };
        if (partial === false) {
            data.blendFunction = this.getRandomBlendFunction();
            data.blendOpacity = this.getRandomBlendOpacity();
        }
        return data;
    }
    getEditorControls() {
        let obj = {
            enabled: {
                type: 'boolean'
            },
            hue: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            }
        };
        return Object.assign(Object.assign({}, obj), this.getBlendModesEditorControls());
    }
}
HuePostEffect.type = 'HuePostEffect';
HuePostEffect.parent = 'PostEffect';

class PixelationPostEffect extends PostEffect {
    constructor(krono) {
        super(krono, [{ effect: PixelationEffect }]);
        this.defaultValue = 0;
        this.minValue = 0;
        this.maxValue = 100;
        this.step = 1;
        this.granularity = this.defaultValue;
    }
    update() {
        if (this.enabled) {
            this.effect.setGranularity(this.granularity);
        }
    }
    getData() {
        return {
            enabled: this.enabled,
            granularity: this.granularity
        };
    }
    setData(data) {
        this.enabled = data.enabled;
        this.granularity = data.granularity;
    }
    getRandomData() {
        return {
            enabled: true,
            granularity: this.krono.random.float(this.minValue, 2)
        };
    }
    getEditorControls() {
        return {
            enabled: {
                type: 'boolean'
            },
            granularity: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            }
        };
    }
}
PixelationPostEffect.type = 'PixelationPostEffect';
PixelationPostEffect.parent = 'PostEffect';

const fragment = `
uniform float granularity;

uniform float rnd1;
uniform float rnd2;
uniform float rnd3;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(rnd1, rnd2))) * rnd3);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec4 color = inputColor;
  float t = time;

  vec2 granulatedUv = floor(uv * granularity);

  float c = random(granulatedUv * t);

  vec4 noise = vec4(c, c, c, 1);

  color *= noise;
  color = normalize(color);

  outputColor = color;
}
`;
class NoiseEffect extends Effect$1 {
    constructor(krono) {
        super('NoiseEffect', fragment, {
            uniforms: new Map([
                ['granularity', new Uniform(200)],
                ['rnd1', new Uniform(krono.random.float(10, 120))],
                ['rnd2', new Uniform(krono.random.float(10, 120))],
                ['rnd3', new Uniform(krono.random.float(40000, 90000))]
            ])
        });
    }
    setGranularity(granularity) {
        this.uniforms.get('granularity').value = granularity;
    }
}
class NoisePostEffect extends PostEffect {
    constructor(krono) {
        super(krono, [{
                effect: NoiseEffect,
                options: [krono]
            }]);
        this.defaultValue = 200;
        this.minValue = 2;
        this.maxValue = 1000;
        this.step = 1;
        this.forbiddenBlendModes = [
            BlendFunction.DIVIDE,
            BlendFunction.DARKEN,
            BlendFunction.MULTIPLY,
            BlendFunction.COLOR_BURN,
            BlendFunction.DIFFERENCE,
            BlendFunction.NORMAL,
            BlendFunction.SUBTRACT,
            BlendFunction.ALPHA
        ];
        this.granularity = this.defaultValue;
    }
    update() {
        if (this.enabled) {
            this.effect.setGranularity(this.granularity);
            this.updateBlendMode();
        }
    }
    getData() {
        return Object.assign({ enabled: this.enabled, granularity: this.granularity }, this.getBlendModeData());
    }
    setData(data) {
        this.enabled = data.enabled;
        this.granularity = data.granularity;
        this.setBlendModeData(data);
    }
    getRandomData(partial = true) {
        let data = {
            enabled: true,
            granularity: this.krono.random.float(this.minValue, this.maxValue),
            blendFunction: this.blendFunction.toString(),
            blendOpacity: this.blendOpacity
        };
        if (partial === false) {
            data.blendFunction = this.getRandomBlendFunction();
            data.blendOpacity = this.getRandomBlendOpacity();
        }
        return data;
    }
    getEditorControls() {
        let obj = {
            enabled: {
                type: 'boolean'
            },
            granularity: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            }
        };
        return Object.assign(Object.assign({}, obj), this.getBlendModesEditorControls());
    }
}
NoisePostEffect.type = 'NoisePostEffect';
NoisePostEffect.parent = 'PostEffect';

class SaturationPostEffect extends PostEffect {
    constructor(krono) {
        super(krono, [{ effect: HueSaturationEffect }]);
        this.defaultValue = 0;
        this.minValue = -1;
        this.maxValue = 1;
        this.step = 0.01;
        this.forbiddenBlendModes = [
            BlendFunction.DIVIDE
        ];
        this.saturation = this.defaultValue;
    }
    update() {
        if (this.enabled) {
            this.effect.uniforms.get('saturation').value = this.saturation;
            this.updateBlendMode();
        }
    }
    getData() {
        return Object.assign({ enabled: this.enabled, saturation: this.saturation }, this.getBlendModeData());
    }
    setData(data) {
        this.enabled = data.enabled;
        this.saturation = data.saturation;
        this.setBlendModeData(data);
    }
    getRandomData(partial = true) {
        let data = {
            enabled: true,
            saturation: this.krono.random.float(this.minValue, this.maxValue),
            blendFunction: this.blendFunction.toString(),
            blendOpacity: this.blendOpacity
        };
        if (partial === false) {
            data.blendFunction = this.getRandomBlendFunction();
            data.blendOpacity = this.getRandomBlendOpacity();
        }
        return data;
    }
    getEditorControls() {
        let obj = {
            enabled: {
                type: 'boolean'
            },
            saturation: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            }
        };
        return Object.assign(Object.assign({}, obj), this.getBlendModesEditorControls());
    }
}
SaturationPostEffect.type = 'SaturationPostEffect';
SaturationPostEffect.parent = 'PostEffect';

function updateMaterials(parent) {
    parent.traverse((child) => {
        if (child.material) {
            if (child.material.length === undefined) {
                child.material.needsUpdate = true;
            }
            else {
                child.material.forEach(m => m.needsUpdate = true);
            }
        }
    });
}

class ToneMappingEffect extends Effect {
    constructor(krono) {
        super(krono);
        this.defaultValue = 1;
        this.minValue = 0;
        this.maxValue = 10;
        this.step = 0.001;
        this.mappings = {
            NoToneMapping: NoToneMapping,
            LinearToneMapping: LinearToneMapping,
            ReinhardToneMapping: ReinhardToneMapping,
            CineonToneMapping: CineonToneMapping,
            ACESFilmicToneMapping: ACESFilmicToneMapping,
        };
        this.exposure = this.defaultValue;
        this.mapping = this.mappings.LinearToneMapping.toString();
    }
    get mapping() {
        return this._mapping;
    }
    set mapping(value) {
        this._mapping = value;
        if (this.krono.renderer && this.krono.scene) {
            this.krono.renderer.toneMapping = Number.parseInt(value);
            updateMaterials(this.krono.scene);
        }
    }
    update() {
        if (!this.krono || !this.krono.renderer) {
            return;
        }
        if (this.enabled) {
            this.krono.renderer.toneMappingExposure = this.exposure;
        }
    }
    onAfterSceneInit() {
        this.mapping = this.mappings.LinearToneMapping.toString();
    }
    getData() {
        return {
            enabled: this.enabled,
            exposure: this.exposure,
            mapping: this.mapping.toString()
        };
    }
    setData(data) {
        this.enabled = data.enabled;
        this.exposure = data.exposure;
        this.mapping = data.mapping;
    }
    getRandomData() {
        return {
            enabled: true,
            exposure: this.krono.random.float(this.minValue, this.maxValue),
            mapping: this.krono.random.fromArray(this.mappings).toString()
        };
    }
    getEditorControls() {
        return {
            enabled: {
                type: 'boolean'
            },
            exposure: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            },
            mapping: {
                type: 'array',
                value: this.mappings
            }
        };
    }
}
ToneMappingEffect.type = 'ToneMappingEffect';
ToneMappingEffect.parent = 'Effect';

class SMAAEffect extends PostEffect {
    constructor(krono) {
        super(krono, [{
                effect: SMAAEffect$1,
                options: [
                    krono.assets.smaa.search,
                    krono.assets.smaa.area,
                    SMAAPreset.HIGH,
                    EdgeDetectionMode.COLOR
                ]
            }]);
        this._preset = SMAAPreset.HIGH.toString();
        this._edgeDetectionMode = EdgeDetectionMode.COLOR.toString();
        this.edgeDetectionThreshold = 0.1;
        this.localContrastAdaptationFactor = 2.0;
    }
    get preset() {
        return this._preset;
    }
    set preset(value) {
        this._preset = value;
        this.effect.applyPreset(Number.parseInt(value));
    }
    get edgeDetectionMode() {
        return this._edgeDetectionMode;
    }
    set edgeDetectionMode(value) {
        this._edgeDetectionMode = value;
        this.effect.edgeDetectionMaterial.setEdgeDetectionMode(Number.parseInt(value));
    }
    update() {
        if (this.enabled) {
            this.effect.edgeDetectionMaterial.setEdgeDetectionThreshold(this.edgeDetectionThreshold);
            this.effect.edgeDetectionMaterial.setLocalContrastAdaptationFactor(this.localContrastAdaptationFactor);
            this.updateBlendMode();
        }
    }
    getData() {
        return Object.assign({ enabled: this.enabled, preset: this.preset.toString(), edgeDetectionMode: this.edgeDetectionMode.toString(), edgeDetectionThreshold: this.edgeDetectionThreshold, localContrastAdaptationFactor: this.localContrastAdaptationFactor }, this.getBlendModeData());
    }
    setData(data) {
        this.enabled = data.enabled;
        this.preset = data.preset;
        this.edgeDetectionMode = data.edgeDetectionMode;
        this.edgeDetectionThreshold = data.edgeDetectionThreshold;
        this.localContrastAdaptationFactor = data.localContrastAdaptationFactor;
        this.setBlendModeData(data);
    }
    getEditorControls() {
        return Object.assign({ enabled: {
                type: 'boolean'
            }, preset: {
                type: 'array',
                value: SMAAPreset
            }, edgeDetectionMode: {
                type: 'array',
                value: EdgeDetectionMode
            }, edgeDetectionThreshold: {
                type: 'number',
                min: 0,
                max: 0.5,
                step: 0.001
            }, localContrastAdaptationFactor: {
                type: 'number',
                min: 0,
                max: 10,
                step: 0.001
            } }, this.getBlendModesEditorControls());
    }
}
SMAAEffect.type = 'SMAAEffect';
SMAAEffect.parent = 'PostEffect';

class ObjectEffect extends Effect {
    constructor(krono) {
        super(krono);
    }
    update() {
        if (this.enabled && this.object) {
            this.updateObject();
        }
    }
    updateObject() { }
    onAfterSceneInit() {
        this.updateObjectsList();
        if (this.objectName !== '' && this.object === undefined) {
            this.onObjectChange(this.objectName);
            this.updateObject();
        }
    }
}
ObjectEffect.type = 'ObjectEffect';
ObjectEffect.parent = 'ObjectEffect';

class PositionObjectEffect extends ObjectEffect {
    constructor(krono) {
        super(krono);
        this.defaultValue = 0;
        this.minValue = -2;
        this.maxValue = 2;
        this.step = 0.00001;
        this.position = new Vector3();
    }
    updateObject() {
        this.object.position.copy(this.position);
    }
    getData() {
        return {
            enabled: this.enabled,
            objectName: this.objectName,
            position: { type: 'vector', value: this.position.toArray() }
        };
    }
    setData(data) {
        this.enabled = data.enabled;
        this.objectName = data.objectName;
        this.position.fromArray(data.position.value);
    }
    getEditorControls() {
        const obj = {
            enabled: {
                type: 'boolean'
            },
            position: {
                type: 'vector3',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            }
        };
        return Object.assign(Object.assign({}, obj), this.getObjectEditorControls());
    }
    onObjectChange(name, useObjectData = false) {
        this.object = this.objectsKeyedList[name];
        if (useObjectData) {
            this.position.copy(this.object.position);
        }
    }
}
PositionObjectEffect.type = 'PositionObjectEffect';
PositionObjectEffect.parent = 'ObjectEffect';

class ScaleObjectEffect extends ObjectEffect {
    constructor(krono) {
        super(krono);
        this.defaultValue = 0;
        this.minValue = -10;
        this.maxValue = 10;
        this.step = 0.00001;
        this.scale = new Vector3();
        this.isTogether = true;
    }
    updateObject() {
        this.object.scale.copy(this.scale);
    }
    getData() {
        return {
            enabled: this.enabled,
            objectName: this.objectName,
            scale: { type: 'vector', value: this.scale.toArray() }
        };
    }
    setData(data) {
        this.enabled = data.enabled;
        this.objectName = data.objectName;
        this.scale.fromArray(data.scale.value);
    }
    getEditorControls() {
        const obj = {
            enabled: {
                type: 'boolean'
            },
            isTogether: {
                type: 'boolean'
            },
            scale: {
                type: 'vector3',
                min: this.minValue,
                max: this.maxValue,
                step: this.step,
                onChange: this.onScaleChange.bind(this)
            }
        };
        return Object.assign(Object.assign({}, obj), this.getObjectEditorControls());
    }
    onObjectChange(name, useObjectData = false) {
        this.object = this.objectsKeyedList[name];
        if (useObjectData) {
            this.scale.copy(this.object.scale);
        }
    }
    onScaleChange(scale) {
        if (this.isTogether) {
            this.scale.x = scale;
            this.scale.y = scale;
            this.scale.z = scale;
        }
    }
}
ScaleObjectEffect.type = 'ScaleObjectEffect';
ScaleObjectEffect.parent = 'ObjectEffect';

class RotationObjectEffect extends ObjectEffect {
    constructor(krono) {
        super(krono);
        this.defaultValue = 0;
        this.minValue = -Math.PI * 2;
        this.maxValue = Math.PI * 2;
        this.step = 0.000001;
        this.rotation = new Vector3();
    }
    updateObject() {
        this.object.rotation.setFromVector3(this.rotation);
    }
    getData() {
        return {
            enabled: this.enabled,
            objectName: this.objectName,
            rotation: { type: 'vector', value: this.rotation.toArray() }
        };
    }
    setData(data) {
        this.enabled = data.enabled;
        this.objectName = data.objectName;
        this.rotation.fromArray(data.rotation.value);
    }
    getEditorControls() {
        const obj = {
            enabled: {
                type: 'boolean'
            },
            rotation: {
                type: 'vector3',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            }
        };
        return Object.assign(Object.assign({}, obj), this.getObjectEditorControls());
    }
    onObjectChange(name, useObjectData = false) {
        this.object = this.objectsKeyedList[name];
        if (useObjectData) {
            this.object.rotation.toVector3(this.rotation);
        }
    }
}
RotationObjectEffect.type = 'RotationObjectEffect';
RotationObjectEffect.parent = 'ObjectEffect';

class RealisticPreset extends Effect {
    constructor(krono) {
        super(krono);
        this.maxAnisotropy = 8;
        this.textureProperties = [
            'bumpMap',
            'clearcoatMap',
            'clearcoatNormalMap',
            'clearcoatRoughnessMap',
            'displacementMap',
            'emissiveMap',
            'map',
            'metalnessMap',
            'normalMap',
            'roughnessMap',
            'transmissionMap'
        ];
        this.pixelRatio = new PixelRatioEffect(krono);
        this.toneMapping = new ToneMappingEffect(krono);
        this.directional1 = new DirectionalLightEffect(krono);
        this.directional2 = new DirectionalLightEffect(krono);
        this.directional3 = new DirectionalLightEffect(krono);
        this.directional1.position.set(-2, 2.5, 2);
        this.directional2.position.set(4, 3, -0.5);
        this.directional3.position.set(-1, 3, -3);
        this.directional3.color = new Color(0.8, 0.8, 0.8);
    }
    onAfterSceneInit() {
        this.pixelRatio.onAfterSceneInit();
        this.toneMapping.onAfterSceneInit();
        this.directional1.onAfterSceneInit();
        this.directional2.onAfterSceneInit();
        this.directional3.onAfterSceneInit();
        console.log('onAfterSceneInit');
    }
    enable() {
        this.krono.renderer.physicallyCorrectLights = true;
        this.krono.renderer.gammaFactor = 2.2;
        this.krono.renderer.shadowMap.enabled = true;
        this.krono.renderer.shadowMap.type = PCFSoftShadowMap;
        this.setTexturesAnisotropy(this.maxAnisotropy);
        this.setTexturesFilters(LinearFilter, LinearFilter);
        this.updateTextures();
        this.pixelRatio.pixelRatio = window.devicePixelRatio;
        this.toneMapping.mapping = ACESFilmicToneMapping.toString();
        this.toneMapping.exposure = 1.034578;
        this.directional1.intensity = 1;
        this.directional2.intensity = 1;
        this.directional3.intensity = 1;
        console.log('enable');
    }
    disable() {
        this.krono.renderer.physicallyCorrectLights = false;
        this.krono.renderer.gammaFactor = 2;
        this.krono.renderer.shadowMap.type = PCFShadowMap;
        this.setTexturesAnisotropy(1);
        this.setTexturesFilters(LinearFilter, LinearMipmapLinearFilter);
        this.updateTextures();
        this.pixelRatio.pixelRatio = this.pixelRatio.defaultValue;
        this.toneMapping.mapping = LinearToneMapping.toString();
        this.toneMapping.exposure = 1;
        this.directional1.intensity = 0;
        this.directional2.intensity = 0;
        this.directional3.intensity = 0;
    }
    setStatus(status) {
        super.setStatus(status);
        console.log('setStatus', status);
        if (status) {
            this.enable();
        }
        else {
            this.disable();
        }
    }
    dispose() {
        this.disable();
        this.pixelRatio.dispose();
        this.toneMapping.dispose();
        this.directional1.dispose();
        this.directional2.dispose();
        this.directional3.dispose();
    }
    getData() {
        return {
            enabled: this.enabled
        };
    }
    setData(data) {
        this.enabled = data.enabled;
    }
    getEditorControls() {
        return {
            enabled: {
                type: 'boolean'
            }
        };
    }
    setTexturesAnisotropy(anisotropy) {
        this.traverseThroughTextures(texture => {
            texture.anisotropy = Math.min(anisotropy, this.krono.renderer.capabilities.getMaxAnisotropy());
        });
    }
    setTexturesFilters(magFilter, minFilter) {
        this.traverseThroughTextures(texture => {
            texture.magFilter = magFilter;
            texture.minFilter = minFilter;
        });
    }
    updateMaterials() {
        this.krono.scene.traverse((obj) => {
            if (obj.material) {
                obj.material.needsUpdate = true;
            }
        });
    }
    updateTextures() {
        this.traverseThroughTextures(texture => {
            texture.needsUpdate = true;
        });
    }
    traverseThroughTextures(action) {
        this.krono.scene.traverse((obj) => {
            if (obj.material) {
                this.textureProperties.forEach(prop => {
                    if (obj.material[prop] !== null && obj.material[prop] !== undefined) {
                        action(obj.material[prop]);
                    }
                });
            }
        });
    }
}
RealisticPreset.type = 'RealisticPreset';
RealisticPreset.parent = 'Effect';

class BloomPostEffect extends PostEffect {
    constructor(krono, bloomEffect = BloomEffect, ...effectOptions) {
        super(krono, [{
                effect: bloomEffect,
                options: effectOptions
            }]);
        this.defaultValue = 1;
        this.minValue = 0;
        this.maxValue = 1;
        this.step = 0.05;
        this.intensityMinValue = 0;
        this.intensityMaxValue = 20;
        this.intensityStep = 0.01;
        this._kernelSize = KernelSize.LARGE;
        this.forbiddenBlendModes = [
            BlendFunction.DARKEN,
            BlendFunction.DIVIDE,
            BlendFunction.COLOR_BURN,
            BlendFunction.NORMAL,
            BlendFunction.ALPHA,
            BlendFunction.AVERAGE,
            BlendFunction.EXCLUSION,
            BlendFunction.MULTIPLY,
            BlendFunction.NEGATION,
            BlendFunction.REFLECT,
            BlendFunction.SUBTRACT
        ];
        this.intensity = this.defaultValue;
        this.threshold = this.defaultValue;
        this.smoothing = this.defaultValue;
        this.effect = this.effects[this.effects.length - 1];
        this.kernelSize = this.effect.blurPass.kernelSize.toString();
    }
    get kernelSize() {
        return this._kernelSize;
    }
    set kernelSize(value) {
        this._kernelSize = value;
        this.effect.blurPass.kernelSize = Number.parseInt(value);
    }
    update() {
        if (this.enabled) {
            this.effect.intensity = this.intensity;
            this.effect.luminanceMaterial.threshold = this.threshold;
            this.effect.luminanceMaterial.smoothing = this.smoothing;
            this.updateBlendMode();
        }
    }
    getData() {
        return Object.assign({ enabled: this.enabled, intensity: this.intensity, threshold: this.threshold, smoothing: this.smoothing, kernelSize: this.kernelSize.toString() }, this.getBlendModeData());
    }
    setData(data) {
        this.enabled = data.enabled;
        this.intensity = data.intensity;
        this.threshold = data.threshold;
        this.smoothing = data.smoothing;
        this.kernelSize = data.kernelSize;
        this.setBlendModeData(data);
    }
    getRandomData(partial = true) {
        let data = {
            enabled: true,
            intensity: 1 + this.krono.random.float(),
            threshold: this.krono.random.float(),
            smoothing: this.krono.random.float(),
            kernelSize: this.krono.random.fromArray(Object.values(KernelSize)).toString(),
            blendFunction: this.blendFunction.toString(),
            blendOpacity: this.blendOpacity
        };
        if (data.threshold > 0.85) {
            data.threshold = 0.85;
        }
        if (data.smoothing > 0.7) {
            data.smoothing = 0.7;
        }
        if (partial === false) {
            data.blendFunction = this.getRandomBlendFunction();
            data.blendOpacity = this.getRandomBlendOpacity();
        }
        return data;
    }
    getEditorControls() {
        let obj = {
            enabled: {
                type: 'boolean'
            },
            intensity: {
                type: 'number',
                min: this.intensityMinValue,
                max: this.intensityMaxValue,
                step: this.intensityStep
            },
            threshold: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            },
            smoothing: {
                type: 'number',
                min: this.minValue,
                max: this.maxValue,
                step: this.step
            },
            kernelSize: {
                type: 'array',
                value: KernelSize
            }
        };
        return Object.assign(Object.assign({}, obj), this.getBlendModesEditorControls());
    }
}
BloomPostEffect.type = 'BloomPostEffect';
BloomPostEffect.parent = 'PostEffect';

class ObjectBloomEffect extends BloomPostEffect {
    constructor(krono) {
        super(krono, SelectiveBloomEffect, krono.scene, krono.camera);
        this.inverted = false;
        this.ignoreBackground = true;
    }
    update() {
        super.update();
        if (this.enabled) {
            this.effect.inverted = this.inverted;
            this.effect.ignoreBackground = this.ignoreBackground;
        }
    }
    onAfterSceneInit() {
        this.updateObjectsList();
        if (this.objectName !== '') {
            this.onObjectChange(this.objectName);
        }
        super.onAfterSceneInit();
    }
    getData() {
        return Object.assign(Object.assign({}, super.getData()), { inverted: this.inverted, ignoreBackground: this.ignoreBackground, objectName: this.objectName });
    }
    setData(data) {
        super.setData(data);
        this.inverted = data.inverted;
        this.ignoreBackground = data.ignoreBackground;
        this.objectName = data.objectName;
    }
    getEditorControls() {
        return Object.assign(Object.assign(Object.assign({}, super.getEditorControls()), { inverted: {
                type: 'boolean'
            }, ignoreBackground: {
                type: 'boolean'
            } }), this.getObjectEditorControls());
    }
    onObjectChange(name, useObjectData = false) {
        if (this.object && this.object.name !== name) {
            this.effect.selection.delete(this.object);
        }
        this.object = this.objectsKeyedList[name];
        this.effect.selection.add(this.object);
    }
}
ObjectBloomEffect.type = 'ObjectBloomEffect';
ObjectBloomEffect.parent = 'BloomPostEffect';

class DepthOfFieldPostEffect extends PostEffect {
    constructor(krono) {
        super(krono, [
            {
                effect: DepthOfFieldEffect,
                options: [
                    krono.camera,
                    {
                        focusDistance: 0,
                        focalLength: 0.048,
                        bokehScale: 2,
                        height: 480
                    }
                ]
            },
            {
                effect: TextureEffect$1
            }
        ]);
        this.focusDistance = 0;
        this.focalLength = 0.048;
        this.bokehScale = 2;
        this.debugView = false;
        this.resolutions = [
            '240',
            '360',
            '480',
            '720',
            '1080'
        ];
        this._resolution = '720';
        this.depthOfFieldEffect = this.effects[0];
        this.debugViewEffect = this.effects[1];
        this.debugViewEffect.texture = this.depthOfFieldEffect.renderTargetCoC.texture;
        this.debugViewEffect.blendMode.setBlendFunction(BlendFunction.SKIP);
    }
    get resolution() {
        return this._resolution;
    }
    set resolution(value) {
        this._resolution = value;
        this.depthOfFieldEffect.resolution.height = Number.parseInt(value);
    }
    update() {
        if (this.enabled) {
            this.depthOfFieldEffect.circleOfConfusionMaterial.uniforms.focusDistance.value = this.focusDistance;
            this.depthOfFieldEffect.circleOfConfusionMaterial.uniforms.focalLength.value = this.focalLength;
            this.depthOfFieldEffect.bokehScale = this.bokehScale;
            this.debugViewEffect.blendMode.setBlendFunction((this.debugView === true) ? BlendFunction.NORMAL : BlendFunction.SKIP);
            this.updateBlendMode();
        }
    }
    getData() {
        return Object.assign({ enabled: this.enabled, focusDistance: this.focusDistance, focalLength: this.focalLength, bokehScale: this.bokehScale, resolution: this.resolution.toString(), debugView: this.debugView }, this.getBlendModeData());
    }
    setData(data) {
        this.enabled = data.enabled;
        this.focusDistance = data.focusDistance;
        this.focalLength = data.focalLength;
        this.bokehScale = data.bokehScale;
        this.resolution = data.resolution;
        this.debugView = data.debugView;
        this.setBlendModeData(data);
    }
    getEditorControls() {
        let obj = {
            enabled: {
                type: 'boolean'
            },
            focusDistance: {
                type: 'number',
                min: 0,
                max: 1,
                step: 0.00001
            },
            focalLength: {
                type: 'number',
                min: 0,
                max: 0.5,
                step: 0.00001
            },
            bokehScale: {
                type: 'number',
                min: 0,
                max: 20,
                step: 0.00001
            },
            resolution: {
                type: 'array',
                value: this.resolutions
            },
            debugView: {
                type: 'boolean'
            }
        };
        return Object.assign(Object.assign({}, obj), this.getBlendModesEditorControls());
    }
}
DepthOfFieldPostEffect.type = 'DepthOfFieldPostEffect';
DepthOfFieldPostEffect.parent = 'PostEffect';

class TextureEffect extends Effect {
    constructor(krono) {
        super(krono);
        this.offset = new Vector2();
        this.repeat = new Vector2();
        this.rotation = 0;
        this.center = new Vector2();
        this.textureType = '';
        this.availableTextures = [];
        this.mappingModes = [
            UVMapping,
            CubeReflectionMapping,
            CubeRefractionMapping,
            EquirectangularReflectionMapping,
            EquirectangularRefractionMapping,
            CubeUVReflectionMapping,
            CubeUVRefractionMapping
        ];
        this.wrappingModes = [
            RepeatWrapping,
            ClampToEdgeWrapping,
            MirroredRepeatWrapping
        ];
        this.magFilters = [
            NearestFilter,
            LinearFilter
        ];
        this.minFilters = [
            NearestFilter,
            NearestMipmapNearestFilter,
            NearestMipmapLinearFilter,
            LinearFilter,
            LinearMipmapNearestFilter,
            LinearMipmapLinearFilter
        ];
        this.texturesPropertiesNames = [
            'clearcoatMap',
            'clearcoatNormalMap',
            'clearcoatRoughnessMap',
            'transmissionMap',
            'alphaMap',
            'aoMap',
            'bumpMap',
            'displacementMap',
            'emissiveMap',
            'envMap',
            'lightMap',
            'map',
            'metalnessMap',
            'normalMap',
            'roughnessMap',
            'specularMap'
        ];
        this._mapping = UVMapping.toString();
        this._wrapS = ClampToEdgeWrapping.toString();
        this._wrapT = ClampToEdgeWrapping.toString();
        this._magFilter = LinearFilter.toString();
        this._minFilter = UVMapping.toString();
    }
    get mapping() { return this._mapping; }
    set mapping(value) {
        this._mapping = value;
        this.texture.mapping = Number.parseInt(value);
    }
    get wrapS() { return this._wrapS; }
    set wrapS(value) {
        this._wrapS = value;
        this.texture.wrapS = Number.parseInt(value);
        this.texture.needsUpdate = true;
    }
    get wrapT() { return this._wrapT; }
    set wrapT(value) {
        this._wrapT = value;
        this.texture.wrapT = Number.parseInt(value);
        this.texture.needsUpdate = true;
    }
    get magFilter() { return this._magFilter; }
    set magFilter(value) {
        this._magFilter = value;
        this.texture.magFilter = Number.parseInt(value);
    }
    get minFilter() { return this._minFilter; }
    set minFilter(value) {
        this._minFilter = value;
        this.texture.minFilter = Number.parseInt(value);
    }
    update() {
        if (this.enabled && this.texture) {
            this.updateObject();
        }
    }
    updateObject() {
        this.texture.offset.copy(this.offset);
        this.texture.repeat.copy(this.repeat);
        this.texture.rotation = this.rotation;
        this.texture.center.copy(this.center);
    }
    onAfterSceneInit() {
        this.updateObjectsList();
        if (this.objectName !== '') {
            this.onObjectChange(this.objectName);
            this.updateObject();
        }
    }
    getData() {
        return {
            enabled: this.enabled,
            objectName: this.objectName,
            textureType: this.textureType,
            offset: { type: 'vector', value: this.offset.toArray() },
            repeat: { type: 'vector', value: this.repeat.toArray() },
            rotation: this.rotation,
            center: { type: 'vector', value: this.center.toArray() },
            mapping: this.mapping.toString(),
            wrapS: this.wrapS.toString(),
            wrapT: this.wrapT.toString(),
            magFilter: this.magFilter.toString(),
            minFilter: this.minFilter.toString(),
        };
    }
    setData(data) {
        this.enabled = data.enabled;
        this.objectName = data.objectName;
        this.textureType = data.textureType;
        this.offset.fromArray(data.offset.value);
        this.repeat.fromArray(data.repeat.value);
        this.rotation = data.rotation;
        this.center.fromArray(data.center.value);
        this.mapping = data.mapping;
        this.wrapS = data.wrapS;
        this.wrapT = data.wrapT;
        this.magFilter = data.magFilter;
        this.minFilter = data.minFilter;
    }
    getEditorControls() {
        const obj = Object.assign(Object.assign({ enabled: {
                type: 'boolean'
            } }, this.getObjectEditorControls()), { textureType: {
                type: 'array',
                value: this.texturesPropertiesNames,
                onChange: (name) => {
                    this.texture = this.object.material[name];
                    this.setEffectsDataFromTexture(this.texture);
                }
            }, offset: {
                type: 'vector2',
                min: 0,
                max: 1,
                step: 0.00001
            }, repeat: {
                type: 'vector2',
                min: 0,
                max: 10,
                step: 0.00001
            }, rotation: {
                type: 'number',
                min: -Math.PI * 2,
                max: Math.PI * 2,
                step: 0.000001
            }, center: {
                type: 'vector2',
                min: 0,
                max: 1,
                step: 0.00001
            }, mapping: {
                type: 'array',
                value: this.mappingModes
            }, wrapS: {
                type: 'array',
                value: this.wrappingModes
            }, wrapT: {
                type: 'array',
                value: this.wrappingModes
            }, magFilter: {
                type: 'array',
                value: this.magFilters
            }, minFilter: {
                type: 'array',
                value: this.minFilters
            } });
        return Object.assign({}, obj);
    }
    onObjectChange(name, useObjectData = false) {
        this.object = this.objectsKeyedList[name];
        this.updateTexturesList();
        this.texture = this.object.material[this.textureType];
        if (useObjectData && this.texture) {
            this.setEffectsDataFromTexture(this.texture);
        }
    }
    isTargetObject(object) {
        if (object.material !== undefined) {
            return true;
        }
        else {
            return false;
        }
    }
    setEffectsDataFromTexture(texture) {
        this.offset.copy(texture.offset);
        this.repeat.copy(texture.repeat);
        this.rotation = texture.rotation;
        this.center.copy(texture.center);
    }
    updateTexturesList() {
        this.availableTextures.length = 0;
        this.texturesPropertiesNames.forEach(name => {
            if (this.object.material[name] !== null && this.object.material[name] !== undefined) {
                this.availableTextures.push(name);
            }
        });
    }
}
TextureEffect.type = 'TextureEffect';
TextureEffect.parent = 'TextureEffect';

const EffectsList = [
    AmbientLightEffect,
    DirectionalLightEffect,
    ShadowTypeEffect,
    BackgroundEffect,
    FogEffect,
    WireframeEffect,
    PixelRatioEffect,
    ScrollInertiaEffect,
    PositionObjectEffect,
    RotationObjectEffect,
    ScaleObjectEffect,
    TextureEffect,
    ClippingEffect,
    OpacityEffect,
    PlayAudioEffect,
    LoopAudioEffect,
    SpeedAudioEffect,
    VolumeAudioEffect,
    LowPassAudioEffect,
    HighPassAudioEffect,
    AspectCameraEffect,
    FovCameraEffect,
    ZoomCameraEffect,
    DistanceCameraEffect,
    FrustumCameraEffect,
    BloomPostEffect,
    ObjectBloomEffect,
    ChromaticAberrationPostEffect,
    GlitchPostEffect,
    HuePostEffect,
    PixelationPostEffect,
    NoisePostEffect,
    SaturationPostEffect,
    ToneMappingEffect,
    DepthOfFieldPostEffect,
    SMAAEffect,
    RealisticPreset
];
const EffectsKeyedList = {};
EffectsList.forEach(e => EffectsKeyedList[e.type] = e);
function initEffect(effect) {
    EffectsList.push(effect);
    EffectsKeyedList[effect.type] = effect;
}

class KeyframesScrollUpdater extends AnimationMixersScrollUpdater {
    constructor(krono, keyframes, initAfterScene = false) {
        super(krono, [], 1);
        this.keyframes = keyframes;
        this.effectsData = this.getEffectsDataFromKeyframes(this.keyframes);
        this.krono = krono;
        this.initEffects(0, initAfterScene);
        this.generate();
    }
    generate() {
        this.effectsData = this.getEffectsDataFromKeyframes(this.keyframes);
        this.clearAnimationMixers();
        this.generateAnimationMixers();
    }
    initEffects(effectIndex = 0, initAfterScene = false) {
        for (let uuid in this.effectsData) {
            let data = this.effectsData[uuid][effectIndex].properties;
            if (!EffectsKeyedList[data.name]) {
                console.error(`"${data.name}" not found in effects list.`);
                continue;
            }
            let effect = new EffectsKeyedList[data.name](this.krono);
            effect.uuid = data.uuid;
            effect.setData(data.effectData);
            if (initAfterScene) {
                effect.onAfterSceneInit();
            }
        }
    }
    clearAnimationMixers() {
        this.mixers.forEach(m => {
            m.time = 0;
            m.timeScale = 0;
            m.stopAllAction();
        });
        this.mixers.length = 0;
    }
    generateAnimationMixers() {
        for (let uuid in this.effectsData) {
            let keyframeTracks = [];
            let clip;
            let mixer;
            let action;
            let effectInstance = Effect.getInstanceByUuid(uuid, this.krono.effects);
            if (effectInstance === null) {
                continue;
            }
            let effectProperties = this.effectsData[uuid];
            let percentages = effectProperties.map(p => p.percentage);
            let emulateFirstKeyframe = false;
            let emulateLastKeyframe = false;
            if (percentages[0] !== 0) {
                percentages.unshift(0);
                emulateFirstKeyframe = true;
            }
            if (percentages[percentages.length - 1] !== 1) {
                percentages.push(1);
                emulateLastKeyframe = true;
            }
            let effectKeys = Object.keys(effectProperties[0].properties.effectData);
            effectKeys.forEach(k => this.addKeyframeTrack(k, `.${k}`, 'effectData', effectProperties, percentages, keyframeTracks, emulateFirstKeyframe, emulateLastKeyframe));
            effectInstance.setData(effectProperties[0].properties.effectData);
            clip = new AnimationClip(uuid, 1, keyframeTracks);
            mixer = new AnimationMixer(effectInstance);
            action = mixer.clipAction(clip);
            action.play();
            this.mixers.push(mixer);
        }
    }
    addKeyframeTrack(key, trackKey, propertiesKey, properties, percentages, keyframeTracks, emulateFirstKeyframe, emulateLastKeyframe) {
        let values = properties.map(p => {
            let value = p.properties[propertiesKey][key];
            if (value.type) {
                return value.value;
            }
            else {
                return value;
            }
        });
        let allValuesEqual = values.every(v => v.toString() === values[0].toString());
        if (allValuesEqual) {
            return;
        }
        let keyframeTrackClass = this.getKeyframeTrackByType(values[0]);
        if (emulateFirstKeyframe) {
            values.unshift(values[0]);
        }
        if (emulateLastKeyframe) {
            values.push(values[values.length - 1]);
        }
        values = values.flat(1);
        let keyframeTrack = new keyframeTrackClass(trackKey, percentages, values);
        keyframeTracks.push(keyframeTrack);
    }
    getKeyframeTrackByType(value) {
        let type = typeof value;
        if (type === 'object') {
            type = value.type;
        }
        switch (type) {
            case 'number':
                return NumberKeyframeTrack;
            case 'boolean':
                return BooleanKeyframeTrack;
            case 'string':
                return StringKeyframeTrack;
            case 'color':
                return ColorKeyframeTrack;
            case 'vector':
                return VectorKeyframeTrack;
            case 'quaternion':
                return QuaternionKeyframeTrack;
            default:
                return KeyframeTrack;
        }
    }
    getEffectsDataFromKeyframes(keyframes) {
        let effectsDataFromKeyframes = {};
        if (keyframes.length === 0) {
            return effectsDataFromKeyframes;
        }
        keyframes.forEach(k => {
            k.effects.forEach(e => {
                if (!effectsDataFromKeyframes[e.uuid]) {
                    effectsDataFromKeyframes[e.uuid] = [];
                }
                effectsDataFromKeyframes[e.uuid].push({
                    properties: e,
                    percentage: k.percentage
                });
            });
        });
        Object.values(effectsDataFromKeyframes).forEach(data => {
            data.sort((a, b) => {
                return a.percentage - b.percentage;
            });
        });
        return effectsDataFromKeyframes;
    }
}

function changeKeyframes(krono, keyframesList) {
    const { config, effects } = krono;
    removeKeyframesScrollUpdaters(krono);
    removeAllEffects(krono);
    config.keyframes = keyframesList;
    if (config.keyframes.length > 0) {
        config.keyframes.forEach((k, i) => {
            if (isKeyframesDataValid(k) === false) {
                return;
            }
            initKeyframesAudios(krono, k.audios);
            if (i === 0) {
                krono.keyframesScrollUpdater = new KeyframesScrollUpdater(krono, k.keyframes, true);
            }
            else {
                new KeyframesScrollUpdater(krono, k.keyframes, true);
            }
        });
    }
    else {
        krono.keyframesScrollUpdater = new KeyframesScrollUpdater(krono, [], true);
    }
}
function isKeyframesDataValid(keyframes) {
    return keyframes !== undefined &&
        keyframes !== null &&
        Array.isArray(keyframes.audios) &&
        Array.isArray(keyframes.keyframes);
}
function removeAllEffects(krono) {
    const { effectComposer, effects, postEffects } = krono;
    for (let i = 0; i < postEffects.length; i++) {
        effectComposer.removePass(postEffects[i].pass);
    }
    for (let i = 0; i < effects.length; i++) {
        const effect = effects[i];
        effect.disable();
        effect.dispose();
    }
    effects.length = 0;
    postEffects.length = 0;
}
function removeKeyframesScrollUpdaters(krono) {
    const { animationMixersScrollUpdaters } = krono;
    let i = animationMixersScrollUpdaters.length;
    while (i--) {
        let updater = animationMixersScrollUpdaters[i];
        if (updater instanceof KeyframesScrollUpdater) {
            updater.clearAnimationMixers();
            animationMixersScrollUpdaters.splice(i, 1);
        }
    }
}

function updateMixersAndMaterials(krono, delta) {
    const { camera, optimizations, animationMixers, animationMixersScrollUpdaters, materialsToUpdate, effects } = krono;
    if (!optimizations.isAnimationsDisabled) {
        animationMixers.forEach(m => {
            const isVisible = camera.layers.test(m.getRoot().layers);
            if (isVisible) {
                m.update(delta);
            }
        });
        materialsToUpdate.forEach(m => m.update());
        effects.forEach(e => e.update());
    }
    animationMixersScrollUpdaters.forEach(u => u.update());
}
function updateStats(stats, debugStats) {
    if (stats) {
        stats.update();
    }
    if (debugStats) {
        debugStats.update();
    }
}
function render(krono, delta) {
    const { renderer, effectComposer, scene, camera, optimizations } = krono;
    if (optimizations.isPostProcessingDisabled) {
        renderer.render(scene, camera);
    }
    else {
        effectComposer.render(delta);
    }
}
function tick(krono) {
    requestAnimationFrame(tick.bind(this, krono));
    const { config, clock, raycasting, stats, debugStats, controls, optimizations, isResizeNeeded } = krono;
    if (isResizeNeeded) {
        resize(krono);
    }
    if (optimizations.shouldSkipNextTick() === true) {
        return;
    }
    let delta = clock.getDelta();
    updateMixersAndMaterials(krono, delta);
    raycasting.update();
    updateStats(stats, debugStats);
    if (controls.enabled) {
        controls.update(delta);
    }
    render(krono, delta);
    if (config.onAfterTick) {
        config.onAfterTick(delta);
    }
}

const ResizeObserver = window.ResizeObserver || ResizeObserver$1;
function initEvents(krono) {
    window.addEventListener('resize', onresize.bind(this, krono), false);
    let ro = new ResizeObserver(onresize.bind(this, krono));
    ro.observe(krono.container.canvas);
    krono.scroll.initListeners();
    krono.pointer.initListeners();
    if (krono.config.debug) ;
    onresize(krono);
    krono.scroll.onScroll();
}
function initMainScene(krono, gltf) {
    const { assets, config, controls, scene, defaultCamera } = krono;
    assets.mainScene = gltf;
    initGLTFAnimations(krono, assets.mainScene.scene, assets.mainScene.animations);
    let modelCamera;
    let cameraAnimation;
    if (config.cameraName) {
        modelCamera = getCameraByName(config.cameraName, assets.mainScene.cameras);
    }
    else {
        modelCamera = assets.mainScene.cameras[0];
    }
    if (config.cameraAnimationName) {
        cameraAnimation = getAnimationByName(config.cameraAnimationName, assets.mainScene.animations);
    }
    if (modelCamera) {
        changeCamera(krono, modelCamera);
    }
    switch (config.animationMode) {
        case ANIMATION_MODE$1.SCROLL:
            if (modelCamera && cameraAnimation) {
                new SceneScrollUpdater(krono, assets.mainScene.scene, assets.mainScene.animations, cameraAnimation.duration);
            }
            else if (assets.mainScene.animations.length > 0) {
                const maxDuration = assets.mainScene.animations.reduce((a, b) => a.duration > b.duration ? a : b).duration;
                new SceneScrollUpdater(krono, assets.mainScene.scene, assets.mainScene.animations, maxDuration);
            }
            break;
    }
    if (modelCamera && config.centerCameraOnModel) {
        controls.camera = modelCamera;
        centerCameraOnObject(krono, modelCamera, controls, assets.mainScene.scene);
    }
    else if (config.centerCameraOnModel) {
        centerCameraOnObject(krono, defaultCamera, controls, assets.mainScene.scene);
    }
    scene.add(assets.mainScene.scene);
}
function afterLoadInit(krono) {
    const { assets, config, stats, effects } = krono;
    if (config.debug) {
        console.log(assets);
    }
    stats.avgFpsEnabled = false;
    setTimeout(() => {
        stats.avgFpsEnabled = true;
    }, 7500);
    changeKeyframes(krono, config.keyframes);
    effects.forEach(e => {
        e.onAfterSceneInit();
    });
    tick(krono);
}

const POINTER_EVENT = {
    ENTER: 'pointerenter',
    LEAVE: 'pointerleave',
    DOWN: 'pointerdown',
    UP: 'pointerup',
    MOVE: 'pointermove'
};
class PointerManager {
    constructor(krono) {
        this.screenPosition = new Vector2(0, 0);
        this.scenePosition = new Vector2(0, 0);
        this.isPressed = false;
        this.krono = krono;
    }
    initListeners() {
        this.krono.container.canvas.addEventListener(POINTER_EVENT.DOWN, this.onPointerDown.bind(this), false);
        this.krono.container.canvas.addEventListener(POINTER_EVENT.UP, this.onPointerUp.bind(this), false);
        this.krono.container.canvas.addEventListener(POINTER_EVENT.MOVE, this.onPointerMove.bind(this), false);
    }
    updateScreenPosition(x, y) {
        this.screenPosition.x = x;
        this.screenPosition.y = y;
        this.scenePosition.x = (x / this.krono.bounds.canvas.width) * 2 - 1;
        this.scenePosition.y = -(y / this.krono.bounds.canvas.height) * 2 + 1;
    }
    onPointerMove(event) {
        if (!event.isPrimary) {
            return;
        }
        this.updateScreenPosition(event.clientX, event.clientY);
        this.krono.raycasting.dispatchEvent(this.krono.raycasting.currentIntersectedObject, {
            type: POINTER_EVENT.MOVE,
            nativeEvent: event,
            intersect: this.krono.raycasting.intersects[0]
        });
    }
    onPointerDown(event) {
        if (!event.isPrimary) {
            return;
        }
        this.updateScreenPosition(event.clientX, event.clientY);
        this.isPressed = true;
        this.krono.raycasting.dispatchEvent(this.krono.raycasting.currentIntersectedObject, {
            type: POINTER_EVENT.DOWN,
            nativeEvent: event
        });
    }
    onPointerUp(event) {
        if (!event.isPrimary) {
            return;
        }
        this.isPressed = false;
        this.krono.raycasting.dispatchEvent(this.krono.raycasting.currentIntersectedObject, {
            type: POINTER_EVENT.UP,
            nativeEvent: event
        });
    }
}

class Raycasting {
    constructor(krono) {
        this.raycaster = new Raycaster();
        this.intersects = [];
        this.objectsToIntersect = [];
        this.currentIntersection = null;
        this.currentIntersectedObject = null;
        this.krono = krono;
    }
    update() {
        var _a;
        this.intersects.length = 0;
        this.raycaster.setFromCamera(this.krono.pointer.scenePosition, this.krono.camera);
        this.raycaster.intersectObjects(this.objectsToIntersect, false, this.intersects);
        const isIntersects = this.intersects[0];
        const isCurrentExists = this.currentIntersectedObject !== null;
        const isCurrentDiffersNew = this.currentIntersectedObject !== ((_a = this.intersects[0]) === null || _a === void 0 ? void 0 : _a.object);
        if (isIntersects) {
            if (isCurrentExists) {
                if (isCurrentDiffersNew) {
                    this.dispatchEvent(this.currentIntersectedObject, {
                        type: POINTER_EVENT.LEAVE
                    });
                    this.currentIntersectedObject = this.intersects[0].object;
                    this.dispatchEvent(this.currentIntersectedObject, {
                        type: POINTER_EVENT.ENTER,
                        intersect: this.intersects[0]
                    });
                }
            }
            else {
                this.currentIntersectedObject = this.intersects[0].object;
                this.dispatchEvent(this.currentIntersectedObject, {
                    type: POINTER_EVENT.ENTER,
                    intersect: this.intersects[0]
                });
            }
        }
        else {
            if (isCurrentExists) {
                this.dispatchEvent(this.currentIntersectedObject, {
                    type: POINTER_EVENT.LEAVE
                });
            }
            this.currentIntersectedObject = null;
        }
    }
    updateObjectsToIntersect() {
        this.objectsToIntersect.length = 0;
        this.krono.scene.traverse((obj) => {
            if (obj._listeners !== undefined) {
                if (Object
                    .values(POINTER_EVENT)
                    .some(name => obj._listeners[name] !== undefined &&
                    obj._listeners[name].length > 0)) {
                    this.objectsToIntersect.push(obj);
                }
            }
        });
    }
    dispatchEvent(obj, event) {
        if (obj === null || obj === void 0 ? void 0 : obj._listeners[event.type]) {
            obj.dispatchEvent(event);
        }
    }
}

class Optimizations {
    constructor(krono) {
        this.enabled = false;
        this.level = 0;
        this.levelChangeThreshold = 30;
        this.isAnimationsDisabled = false;
        this.isPostProcessingDisabled = false;
        this.krono = krono;
    }
    updateLevel() {
        if (this.enabled && this.krono.stats.avgFps <= this.levelChangeThreshold) {
            this.optimizeNextLevel();
        }
    }
    shouldSkipNextTick() {
        const { config, scroll } = this.krono;
        return config.enabled === false ||
            (config.disableUpdatingIfTabIsInactive === true && document.hidden === true) ||
            (config.disableUpdatingIfCanvasIsNotInViewport === true && scroll.isCanvasInViewport === false);
    }
    optimizeNextLevel() {
        this.level++;
        switch (this.level) {
            case 1:
                this.setMSAAMultisampling(0);
                break;
            case 2:
                this.disablePostProcessing();
                break;
            case 3:
                this.convertMaterialsToPhong();
                break;
            case 4:
                this.convertMaterialsToBasic();
                break;
            case 5:
                this.setPixelRatio(0.85);
                break;
            case 6:
                this.setPixelRatio(0.5);
                break;
            case 7:
                this.setPixelRatio(0.38);
                break;
            case 8:
                this.disableAnimations();
                break;
        }
    }
    setMSAAMultisampling(multisampling) {
        this.krono.effectComposer.multisampling = multisampling;
    }
    setPixelRatio(ratio) {
        this.krono.renderer.setPixelRatio(ratio);
    }
    disableAnimations() {
        this.isAnimationsDisabled = true;
    }
    disablePostProcessing() {
        this.isPostProcessingDisabled = true;
    }
    convertMaterialsToPhong() {
        this.krono.scene.traverse(obj => {
            if (obj.type === 'Mesh' && obj.material && (obj.material.type === 'MeshStandardMaterial' || obj.material.type === 'MeshPhysicalMaterial')) {
                const mesh = obj;
                const material = new MeshPhongMaterial();
                material.alphaMap = mesh.material.alphaMap;
                material.aoMap = mesh.material.aoMap;
                material.aoMapIntensity = mesh.material.aoMapIntensity;
                material.bumpMap = mesh.material.bumpMap;
                material.bumpScale = mesh.material.bumpScale;
                material.color = mesh.material.color;
                material.combine = mesh.material.combine;
                material.displacementMap = mesh.material.displacementMap;
                material.displacementScale = mesh.material.displacementScale;
                material.displacementBias = mesh.material.displacementBias;
                material.emissive = mesh.material.emissive;
                material.emissiveMap = mesh.material.emissiveMap;
                material.emissiveIntensity = mesh.material.emissiveIntensity;
                material.envMap = mesh.material.envMap;
                material.lightMap = mesh.material.lightMap;
                material.lightMapIntensity = mesh.material.lightMapIntensity;
                material.map = mesh.material.map;
                material.morphTargets = mesh.material.morphTargets;
                material.normalMap = mesh.material.normalMap;
                material.normalMapType = mesh.material.normalMapType;
                material.normalScale = mesh.material.normalScale;
                material.reflectivity = mesh.material.reflectivity;
                material.refractionRatio = mesh.material.refractionRatio;
                material.wireframe = mesh.material.wireframe;
                material.side = mesh.material.side;
                material.transparent = mesh.material.transparent;
                material.opacity = mesh.material.opacity;
                material.precision = mesh.material.precision;
                material.premultipliedAlpha = mesh.material.premultipliedAlpha;
                mesh.material = material;
                mesh.material.needsUpdate = true;
            }
        });
    }
    convertMaterialsToBasic() {
        this.krono.scene.traverse(obj => {
            if (obj.type === 'Mesh' && obj.material) {
                const mesh = obj;
                const material = new MeshBasicMaterial();
                material.alphaMap = mesh.material.alphaMap;
                material.aoMap = mesh.material.aoMap;
                material.aoMapIntensity = mesh.material.aoMapIntensity;
                material.color = mesh.material.color;
                material.combine = mesh.material.combine;
                material.envMap = mesh.material.envMap;
                material.map = mesh.material.map;
                material.morphTargets = mesh.material.morphTargets;
                material.reflectivity = mesh.material.reflectivity;
                material.refractionRatio = mesh.material.refractionRatio;
                material.wireframe = mesh.material.wireframe;
                material.side = mesh.material.side;
                material.transparent = mesh.material.transparent;
                material.opacity = mesh.material.opacity;
                material.precision = mesh.material.precision;
                material.premultipliedAlpha = mesh.material.premultipliedAlpha;
                mesh.material = material;
                mesh.material.needsUpdate = true;
            }
        });
    }
}

function initRenderer(krono) {
    krono.renderer = new WebGLRenderer({
        alpha: krono.config.alpha,
        antialias: krono.config.browserAntialias,
        powerPreference: 'high-performance'
    });
    krono.renderer.setSize(krono.bounds.canvas.width, krono.bounds.canvas.height);
    krono.renderer.outputEncoding = sRGBEncoding;
    krono.renderer.debug.checkShaderErrors = krono.config.debug;
    krono.ktx2Loader.detectSupport(krono.renderer);
}

function initScene(krono) {
    krono.scene = new Scene();
    krono.scene.name = krono.config.rootSceneName;
}

const MB = 1024 * 1024;
const SEC = 1000;
class Stats {
    constructor(krono) {
        this.fps = 0;
        this.avgFps = 60;
        this.fpsSum = 0;
        this.fpsCount = 0;
        this.avgFpsUpdatePeriod = 3 * SEC;
        this.avgFpsEnabled = true;
        this.framesCount = 0;
        this.krono = krono;
        let context = this.krono.renderer.getContext();
        this.videoCardInfo = this.krono.renderer.extensions.get('WEBGL_debug_renderer_info');
        this.videoCardVendor = context.getParameter(this.videoCardInfo.UNMASKED_VENDOR_WEBGL);
        this.videoCardRenderer = context.getParameter(this.videoCardInfo.UNMASKED_RENDERER_WEBGL);
        this.precision = this.krono.renderer.capabilities.precision;
        this.contextName = this.krono.renderer.getContext().constructor.name;
        this.maxTextureSize = this.krono.renderer.capabilities.maxTextureSize;
        this.isMemoryInfoAvailable = performance.memory !== undefined;
        if (this.isMemoryInfoAvailable) {
            this.heapLimit = performance.memory.jsHeapSizeLimit / MB;
        }
        if (navigator.hardwareConcurrency) {
            this.hardwareConcurrency = navigator.hardwareConcurrency;
        }
        this.lastUpdate = performance.now();
        this.lastAvgFpsUpdate = performance.now();
    }
    update() {
        if (this.isMemoryInfoAvailable) {
            this.updateMemoryInfo();
        }
        this.updateFpsInfo();
    }
    updateMemoryInfo() {
        this.heapUsage = performance.memory.usedJSHeapSize / MB;
        this.heapPercentage = this.heapUsage / this.heapLimit;
    }
    updateFpsInfo() {
        const time = performance.now();
        this.framesCount++;
        if (time >= this.lastUpdate + SEC) {
            this.fps = Math.round((this.framesCount * SEC) / (time - this.lastUpdate));
            this.fpsSum += this.fps;
            this.fpsCount++;
            this.lastUpdate = time;
            this.framesCount = 0;
        }
        if (time >= this.lastAvgFpsUpdate + this.avgFpsUpdatePeriod &&
            this.avgFpsEnabled &&
            !document.hidden) {
            this.avgFps = this.fpsSum / this.fpsCount;
            this.fpsSum = 0;
            this.fpsCount = 0;
            this.lastAvgFpsUpdate = time;
            this.krono.optimizations.updateLevel();
        }
    }
}

function initEffectComposer(krono) {
    const context = krono.renderer.getContext();
    let multisampling = 0;
    if (krono.renderer.capabilities.isWebGL2 && krono.config.msaaAntialias) {
        multisampling = Math.min(krono.config.msaaSamples, context.getParameter(context.MAX_SAMPLES));
    }
    krono.effectComposer = new EffectComposer(krono.renderer, {
        frameBufferType: HalfFloatType,
        multisampling: multisampling
    });
    krono.effectComposer.addPass(krono.renderPass);
}

function initAudioLoader(krono) {
    krono.audioLoader = new AudioLoader(krono.loadingManager);
}
function loadAudio(krono) {
    return krono.config.audios.map(url => {
        return new Promise((resolve, reject) => {
            krono.audioLoader.load(url, (buffer) => {
                krono.assets.audios[url] = buffer;
                resolve();
            }, undefined, reject);
        });
    });
}

// https://github.com/mrdoob/three.js/issues/5552
// http://en.wikipedia.org/wiki/RGBE_image_format

var RGBELoader = function ( manager ) {

	DataTextureLoader.call( this, manager );

	this.type = UnsignedByteType;

};

RGBELoader.prototype = Object.assign( Object.create( DataTextureLoader.prototype ), {

	constructor: RGBELoader,

	// adapted from http://www.graphics.cornell.edu/~bjw/rgbe.html

	parse: function ( buffer ) {

		var
			/* return codes for rgbe routines */
			//RGBE_RETURN_SUCCESS = 0,
			RGBE_RETURN_FAILURE = - 1,

			/* default error routine.  change this to change error handling */
			rgbe_read_error = 1,
			rgbe_write_error = 2,
			rgbe_format_error = 3,
			rgbe_memory_error = 4,
			rgbe_error = function ( rgbe_error_code, msg ) {

				switch ( rgbe_error_code ) {

					case rgbe_read_error: console.error( 'THREE.RGBELoader Read Error: ' + ( msg || '' ) );
						break;
					case rgbe_write_error: console.error( 'THREE.RGBELoader Write Error: ' + ( msg || '' ) );
						break;
					case rgbe_format_error: console.error( 'THREE.RGBELoader Bad File Format: ' + ( msg || '' ) );
						break;
					default:
					case rgbe_memory_error: console.error( 'THREE.RGBELoader: Error: ' + ( msg || '' ) );

				}

				return RGBE_RETURN_FAILURE;

			},

			/* offsets to red, green, and blue components in a data (float) pixel */
			//RGBE_DATA_RED = 0,
			//RGBE_DATA_GREEN = 1,
			//RGBE_DATA_BLUE = 2,

			/* number of floats per pixel, use 4 since stored in rgba image format */
			//RGBE_DATA_SIZE = 4,

			/* flags indicating which fields in an rgbe_header_info are valid */
			RGBE_VALID_PROGRAMTYPE = 1,
			RGBE_VALID_FORMAT = 2,
			RGBE_VALID_DIMENSIONS = 4,

			NEWLINE = '\n',

			fgets = function ( buffer, lineLimit, consume ) {

				lineLimit = ! lineLimit ? 1024 : lineLimit;
				var p = buffer.pos,
					i = - 1, len = 0, s = '', chunkSize = 128,
					chunk = String.fromCharCode.apply( null, new Uint16Array( buffer.subarray( p, p + chunkSize ) ) )
				;
				while ( ( 0 > ( i = chunk.indexOf( NEWLINE ) ) ) && ( len < lineLimit ) && ( p < buffer.byteLength ) ) {

					s += chunk; len += chunk.length;
					p += chunkSize;
					chunk += String.fromCharCode.apply( null, new Uint16Array( buffer.subarray( p, p + chunkSize ) ) );

				}

				if ( - 1 < i ) {

					/*for (i=l-1; i>=0; i--) {
						byteCode = m.charCodeAt(i);
						if (byteCode > 0x7f && byteCode <= 0x7ff) byteLen++;
						else if (byteCode > 0x7ff && byteCode <= 0xffff) byteLen += 2;
						if (byteCode >= 0xDC00 && byteCode <= 0xDFFF) i--; //trail surrogate
					}*/
					if ( false !== consume ) buffer.pos += len + i + 1;
					return s + chunk.slice( 0, i );

				}

				return false;

			},

			/* minimal header reading.  modify if you want to parse more information */
			RGBE_ReadHeader = function ( buffer ) {

				var line, match,

					// regexes to parse header info fields
					magic_token_re = /^#\?(\S+)/,
					gamma_re = /^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,
					exposure_re = /^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,
					format_re = /^\s*FORMAT=(\S+)\s*$/,
					dimensions_re = /^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,

					// RGBE format header struct
					header = {

						valid: 0, /* indicate which fields are valid */

						string: '', /* the actual header string */

						comments: '', /* comments found in header */

						programtype: 'RGBE', /* listed at beginning of file to identify it after "#?". defaults to "RGBE" */

						format: '', /* RGBE format, default 32-bit_rle_rgbe */

						gamma: 1.0, /* image has already been gamma corrected with given gamma. defaults to 1.0 (no correction) */

						exposure: 1.0, /* a value of 1.0 in an image corresponds to <exposure> watts/steradian/m^2. defaults to 1.0 */

						width: 0, height: 0 /* image dimensions, width/height */

					};

				if ( buffer.pos >= buffer.byteLength || ! ( line = fgets( buffer ) ) ) {

					return rgbe_error( rgbe_read_error, 'no header found' );

				}

				/* if you want to require the magic token then uncomment the next line */
				if ( ! ( match = line.match( magic_token_re ) ) ) {

					return rgbe_error( rgbe_format_error, 'bad initial token' );

				}

				header.valid |= RGBE_VALID_PROGRAMTYPE;
				header.programtype = match[ 1 ];
				header.string += line + '\n';

				while ( true ) {

					line = fgets( buffer );
					if ( false === line ) break;
					header.string += line + '\n';

					if ( '#' === line.charAt( 0 ) ) {

						header.comments += line + '\n';
						continue; // comment line

					}

					if ( match = line.match( gamma_re ) ) {

						header.gamma = parseFloat( match[ 1 ], 10 );

					}

					if ( match = line.match( exposure_re ) ) {

						header.exposure = parseFloat( match[ 1 ], 10 );

					}

					if ( match = line.match( format_re ) ) {

						header.valid |= RGBE_VALID_FORMAT;
						header.format = match[ 1 ];//'32-bit_rle_rgbe';

					}

					if ( match = line.match( dimensions_re ) ) {

						header.valid |= RGBE_VALID_DIMENSIONS;
						header.height = parseInt( match[ 1 ], 10 );
						header.width = parseInt( match[ 2 ], 10 );

					}

					if ( ( header.valid & RGBE_VALID_FORMAT ) && ( header.valid & RGBE_VALID_DIMENSIONS ) ) break;

				}

				if ( ! ( header.valid & RGBE_VALID_FORMAT ) ) {

					return rgbe_error( rgbe_format_error, 'missing format specifier' );

				}

				if ( ! ( header.valid & RGBE_VALID_DIMENSIONS ) ) {

					return rgbe_error( rgbe_format_error, 'missing image size specifier' );

				}

				return header;

			},

			RGBE_ReadPixels_RLE = function ( buffer, w, h ) {

				var data_rgba, offset, pos, count, byteValue,
					scanline_buffer, ptr, ptr_end, i, l, off, isEncodedRun,
					scanline_width = w, num_scanlines = h, rgbeStart
				;

				if (
					// run length encoding is not allowed so read flat
					( ( scanline_width < 8 ) || ( scanline_width > 0x7fff ) ) ||
					// this file is not run length encoded
					( ( 2 !== buffer[ 0 ] ) || ( 2 !== buffer[ 1 ] ) || ( buffer[ 2 ] & 0x80 ) )
				) {

					// return the flat buffer
					return new Uint8Array( buffer );

				}

				if ( scanline_width !== ( ( buffer[ 2 ] << 8 ) | buffer[ 3 ] ) ) {

					return rgbe_error( rgbe_format_error, 'wrong scanline width' );

				}

				data_rgba = new Uint8Array( 4 * w * h );

				if ( ! data_rgba.length ) {

					return rgbe_error( rgbe_memory_error, 'unable to allocate buffer space' );

				}

				offset = 0; pos = 0; ptr_end = 4 * scanline_width;
				rgbeStart = new Uint8Array( 4 );
				scanline_buffer = new Uint8Array( ptr_end );

				// read in each successive scanline
				while ( ( num_scanlines > 0 ) && ( pos < buffer.byteLength ) ) {

					if ( pos + 4 > buffer.byteLength ) {

						return rgbe_error( rgbe_read_error );

					}

					rgbeStart[ 0 ] = buffer[ pos ++ ];
					rgbeStart[ 1 ] = buffer[ pos ++ ];
					rgbeStart[ 2 ] = buffer[ pos ++ ];
					rgbeStart[ 3 ] = buffer[ pos ++ ];

					if ( ( 2 != rgbeStart[ 0 ] ) || ( 2 != rgbeStart[ 1 ] ) || ( ( ( rgbeStart[ 2 ] << 8 ) | rgbeStart[ 3 ] ) != scanline_width ) ) {

						return rgbe_error( rgbe_format_error, 'bad rgbe scanline format' );

					}

					// read each of the four channels for the scanline into the buffer
					// first red, then green, then blue, then exponent
					ptr = 0;
					while ( ( ptr < ptr_end ) && ( pos < buffer.byteLength ) ) {

						count = buffer[ pos ++ ];
						isEncodedRun = count > 128;
						if ( isEncodedRun ) count -= 128;

						if ( ( 0 === count ) || ( ptr + count > ptr_end ) ) {

							return rgbe_error( rgbe_format_error, 'bad scanline data' );

						}

						if ( isEncodedRun ) {

							// a (encoded) run of the same value
							byteValue = buffer[ pos ++ ];
							for ( i = 0; i < count; i ++ ) {

								scanline_buffer[ ptr ++ ] = byteValue;

							}
							//ptr += count;

						} else {

							// a literal-run
							scanline_buffer.set( buffer.subarray( pos, pos + count ), ptr );
							ptr += count; pos += count;

						}

					}


					// now convert data from buffer into rgba
					// first red, then green, then blue, then exponent (alpha)
					l = scanline_width; //scanline_buffer.byteLength;
					for ( i = 0; i < l; i ++ ) {

						off = 0;
						data_rgba[ offset ] = scanline_buffer[ i + off ];
						off += scanline_width; //1;
						data_rgba[ offset + 1 ] = scanline_buffer[ i + off ];
						off += scanline_width; //1;
						data_rgba[ offset + 2 ] = scanline_buffer[ i + off ];
						off += scanline_width; //1;
						data_rgba[ offset + 3 ] = scanline_buffer[ i + off ];
						offset += 4;

					}

					num_scanlines --;

				}

				return data_rgba;

			};

		var RGBEByteToRGBFloat = function ( sourceArray, sourceOffset, destArray, destOffset ) {

			var e = sourceArray[ sourceOffset + 3 ];
			var scale = Math.pow( 2.0, e - 128.0 ) / 255.0;

			destArray[ destOffset + 0 ] = sourceArray[ sourceOffset + 0 ] * scale;
			destArray[ destOffset + 1 ] = sourceArray[ sourceOffset + 1 ] * scale;
			destArray[ destOffset + 2 ] = sourceArray[ sourceOffset + 2 ] * scale;

		};

		var RGBEByteToRGBHalf = function ( sourceArray, sourceOffset, destArray, destOffset ) {

			var e = sourceArray[ sourceOffset + 3 ];
			var scale = Math.pow( 2.0, e - 128.0 ) / 255.0;

			destArray[ destOffset + 0 ] = DataUtils.toHalfFloat( sourceArray[ sourceOffset + 0 ] * scale );
			destArray[ destOffset + 1 ] = DataUtils.toHalfFloat( sourceArray[ sourceOffset + 1 ] * scale );
			destArray[ destOffset + 2 ] = DataUtils.toHalfFloat( sourceArray[ sourceOffset + 2 ] * scale );

		};

		var byteArray = new Uint8Array( buffer );
		byteArray.pos = 0;
		var rgbe_header_info = RGBE_ReadHeader( byteArray );

		if ( RGBE_RETURN_FAILURE !== rgbe_header_info ) {

			var w = rgbe_header_info.width,
				h = rgbe_header_info.height,
				image_rgba_data = RGBE_ReadPixels_RLE( byteArray.subarray( byteArray.pos ), w, h );

			if ( RGBE_RETURN_FAILURE !== image_rgba_data ) {

				switch ( this.type ) {

					case UnsignedByteType:

						var data = image_rgba_data;
						var format = RGBEFormat; // handled as THREE.RGBAFormat in shaders
						var type = UnsignedByteType;
						break;

					case FloatType:

						var numElements = ( image_rgba_data.length / 4 ) * 3;
						var floatArray = new Float32Array( numElements );

						for ( var j = 0; j < numElements; j ++ ) {

							RGBEByteToRGBFloat( image_rgba_data, j * 4, floatArray, j * 3 );

						}

						var data = floatArray;
						var format = RGBFormat;
						var type = FloatType;
						break;

					case HalfFloatType:

						var numElements = ( image_rgba_data.length / 4 ) * 3;
						var halfArray = new Uint16Array( numElements );

						for ( var j = 0; j < numElements; j ++ ) {

							RGBEByteToRGBHalf( image_rgba_data, j * 4, halfArray, j * 3 );

						}

						var data = halfArray;
						var format = RGBFormat;
						var type = HalfFloatType;
						break;

					default:

						console.error( 'THREE.RGBELoader: unsupported type: ', this.type );
						break;

				}

				return {
					width: w, height: h,
					data: data,
					header: rgbe_header_info.string,
					gamma: rgbe_header_info.gamma,
					exposure: rgbe_header_info.exposure,
					format: format,
					type: type
				};

			}

		}

		return null;

	},

	setDataType: function ( value ) {

		this.type = value;
		return this;

	},

	load: function ( url, onLoad, onProgress, onError ) {

		function onLoadCallback( texture, texData ) {

			switch ( texture.type ) {

				case UnsignedByteType:

					texture.encoding = RGBEEncoding;
					texture.minFilter = NearestFilter;
					texture.magFilter = NearestFilter;
					texture.generateMipmaps = false;
					texture.flipY = true;
					break;

				case FloatType:

					texture.encoding = LinearEncoding;
					texture.minFilter = LinearFilter;
					texture.magFilter = LinearFilter;
					texture.generateMipmaps = false;
					texture.flipY = true;
					break;

				case HalfFloatType:

					texture.encoding = LinearEncoding;
					texture.minFilter = LinearFilter;
					texture.magFilter = LinearFilter;
					texture.generateMipmaps = false;
					texture.flipY = true;
					break;

			}

			if ( onLoad ) onLoad( texture, texData );

		}

		return DataTextureLoader.prototype.load.call( this, url, onLoadCallback, onProgress, onError );

	}

} );

function initRGBELoader(krono) {
    krono.rgbeLoader = new RGBELoader()
        .setDataType(UnsignedByteType);
}
function loadEnvMap(krono) {
    let pmremGenerator = new PMREMGenerator(krono.renderer);
    pmremGenerator.compileEquirectangularShader();
    return new Promise((resolve, reject) => {
        if (!krono.config.envMapPath) {
            resolve();
            return;
        }
        krono.rgbeLoader.load(krono.config.envMapPath, dataTexture => {
            let cubeRenderTarget = pmremGenerator.fromEquirectangular(dataTexture);
            krono.scene.environment = cubeRenderTarget.texture;
            dataTexture.dispose();
            pmremGenerator.dispose();
            resolve();
        }, undefined, reject);
    });
}

var GLTFLoader = ( function () {

	function GLTFLoader( manager ) {

		Loader.call( this, manager );

		this.dracoLoader = null;
		this.ktx2Loader = null;
		this.meshoptDecoder = null;

		this.pluginCallbacks = [];

		this.register( function ( parser ) {

			return new GLTFMaterialsClearcoatExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFTextureBasisUExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFTextureWebPExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFMaterialsTransmissionExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFLightsExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFMeshoptCompression( parser );

		} );

	}

	GLTFLoader.prototype = Object.assign( Object.create( Loader.prototype ), {

		constructor: GLTFLoader,

		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			var resourcePath;

			if ( this.resourcePath !== '' ) {

				resourcePath = this.resourcePath;

			} else if ( this.path !== '' ) {

				resourcePath = this.path;

			} else {

				resourcePath = LoaderUtils.extractUrlBase( url );

			}

			// Tells the LoadingManager to track an extra item, which resolves after
			// the model is fully loaded. This means the count of items loaded will
			// be incorrect, but ensures manager.onLoad() does not fire early.
			this.manager.itemStart( url );

			var _onError = function ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );
				scope.manager.itemEnd( url );

			};

			var loader = new FileLoader( this.manager );

			loader.setPath( this.path );
			loader.setResponseType( 'arraybuffer' );
			loader.setRequestHeader( this.requestHeader );
			loader.setWithCredentials( this.withCredentials );

			loader.load( url, function ( data ) {

				try {

					scope.parse( data, resourcePath, function ( gltf ) {

						onLoad( gltf );

						scope.manager.itemEnd( url );

					}, _onError );

				} catch ( e ) {

					_onError( e );

				}

			}, onProgress, _onError );

		},

		setDRACOLoader: function ( dracoLoader ) {

			this.dracoLoader = dracoLoader;
			return this;

		},

		setDDSLoader: function () {

			throw new Error(

				'THREE.GLTFLoader: "MSFT_texture_dds" no longer supported. Please update to "KHR_texture_basisu".'

			);

		},

		setKTX2Loader: function ( ktx2Loader ) {

			this.ktx2Loader = ktx2Loader;
			return this;

		},

		setMeshoptDecoder: function ( meshoptDecoder ) {

			this.meshoptDecoder = meshoptDecoder;
			return this;

		},

		register: function ( callback ) {

			if ( this.pluginCallbacks.indexOf( callback ) === - 1 ) {

				this.pluginCallbacks.push( callback );

			}

			return this;

		},

		unregister: function ( callback ) {

			if ( this.pluginCallbacks.indexOf( callback ) !== - 1 ) {

				this.pluginCallbacks.splice( this.pluginCallbacks.indexOf( callback ), 1 );

			}

			return this;

		},

		parse: function ( data, path, onLoad, onError ) {

			var content;
			var extensions = {};
			var plugins = {};

			if ( typeof data === 'string' ) {

				content = data;

			} else {

				var magic = LoaderUtils.decodeText( new Uint8Array( data, 0, 4 ) );

				if ( magic === BINARY_EXTENSION_HEADER_MAGIC ) {

					try {

						extensions[ EXTENSIONS.KHR_BINARY_GLTF ] = new GLTFBinaryExtension( data );

					} catch ( error ) {

						if ( onError ) onError( error );
						return;

					}

					content = extensions[ EXTENSIONS.KHR_BINARY_GLTF ].content;

				} else {

					content = LoaderUtils.decodeText( new Uint8Array( data ) );

				}

			}

			var json = JSON.parse( content );

			if ( json.asset === undefined || json.asset.version[ 0 ] < 2 ) {

				if ( onError ) onError( new Error( 'THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.' ) );
				return;

			}

			var parser = new GLTFParser( json, {

				path: path || this.resourcePath || '',
				crossOrigin: this.crossOrigin,
				requestHeader: this.requestHeader,
				manager: this.manager,
				ktx2Loader: this.ktx2Loader,
				meshoptDecoder: this.meshoptDecoder

			} );

			parser.fileLoader.setRequestHeader( this.requestHeader );

			for ( var i = 0; i < this.pluginCallbacks.length; i ++ ) {

				var plugin = this.pluginCallbacks[ i ]( parser );
				plugins[ plugin.name ] = plugin;

				// Workaround to avoid determining as unknown extension
				// in addUnknownExtensionsToUserData().
				// Remove this workaround if we move all the existing
				// extension handlers to plugin system
				extensions[ plugin.name ] = true;

			}

			if ( json.extensionsUsed ) {

				for ( var i = 0; i < json.extensionsUsed.length; ++ i ) {

					var extensionName = json.extensionsUsed[ i ];
					var extensionsRequired = json.extensionsRequired || [];

					switch ( extensionName ) {

						case EXTENSIONS.KHR_MATERIALS_UNLIT:
							extensions[ extensionName ] = new GLTFMaterialsUnlitExtension();
							break;

						case EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS:
							extensions[ extensionName ] = new GLTFMaterialsPbrSpecularGlossinessExtension();
							break;

						case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
							extensions[ extensionName ] = new GLTFDracoMeshCompressionExtension( json, this.dracoLoader );
							break;

						case EXTENSIONS.KHR_TEXTURE_TRANSFORM:
							extensions[ extensionName ] = new GLTFTextureTransformExtension();
							break;

						case EXTENSIONS.KHR_MESH_QUANTIZATION:
							extensions[ extensionName ] = new GLTFMeshQuantizationExtension();
							break;

						default:

							if ( extensionsRequired.indexOf( extensionName ) >= 0 && plugins[ extensionName ] === undefined ) {

								console.warn( 'THREE.GLTFLoader: Unknown extension "' + extensionName + '".' );

							}

					}

				}

			}

			parser.setExtensions( extensions );
			parser.setPlugins( plugins );
			parser.parse( onLoad, onError );

		}

	} );

	/* GLTFREGISTRY */

	function GLTFRegistry() {

		var objects = {};

		return	{

			get: function ( key ) {

				return objects[ key ];

			},

			add: function ( key, object ) {

				objects[ key ] = object;

			},

			remove: function ( key ) {

				delete objects[ key ];

			},

			removeAll: function () {

				objects = {};

			}

		};

	}

	/*********************************/
	/********** EXTENSIONS ***********/
	/*********************************/

	var EXTENSIONS = {
		KHR_BINARY_GLTF: 'KHR_binary_glTF',
		KHR_DRACO_MESH_COMPRESSION: 'KHR_draco_mesh_compression',
		KHR_LIGHTS_PUNCTUAL: 'KHR_lights_punctual',
		KHR_MATERIALS_CLEARCOAT: 'KHR_materials_clearcoat',
		KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS: 'KHR_materials_pbrSpecularGlossiness',
		KHR_MATERIALS_TRANSMISSION: 'KHR_materials_transmission',
		KHR_MATERIALS_UNLIT: 'KHR_materials_unlit',
		KHR_TEXTURE_BASISU: 'KHR_texture_basisu',
		KHR_TEXTURE_TRANSFORM: 'KHR_texture_transform',
		KHR_MESH_QUANTIZATION: 'KHR_mesh_quantization',
		EXT_TEXTURE_WEBP: 'EXT_texture_webp',
		EXT_MESHOPT_COMPRESSION: 'EXT_meshopt_compression'
	};

	/**
	 * Punctual Lights Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_lights_punctual
	 */
	function GLTFLightsExtension( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL;

		// Object3D instance caches
		this.cache = { refs: {}, uses: {} };

	}

	GLTFLightsExtension.prototype._markDefs = function () {

		var parser = this.parser;
		var nodeDefs = this.parser.json.nodes || [];

		for ( var nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex ++ ) {

			var nodeDef = nodeDefs[ nodeIndex ];

			if ( nodeDef.extensions
				&& nodeDef.extensions[ this.name ]
				&& nodeDef.extensions[ this.name ].light !== undefined ) {

				parser._addNodeRef( this.cache, nodeDef.extensions[ this.name ].light );

			}

		}

	};

	GLTFLightsExtension.prototype._loadLight = function ( lightIndex ) {

		var parser = this.parser;
		var cacheKey = 'light:' + lightIndex;
		var dependency = parser.cache.get( cacheKey );

		if ( dependency ) return dependency;

		var json = parser.json;
		var extensions = ( json.extensions && json.extensions[ this.name ] ) || {};
		var lightDefs = extensions.lights || [];
		var lightDef = lightDefs[ lightIndex ];
		var lightNode;

		var color = new Color( 0xffffff );

		if ( lightDef.color !== undefined ) color.fromArray( lightDef.color );

		var range = lightDef.range !== undefined ? lightDef.range : 0;

		switch ( lightDef.type ) {

			case 'directional':
				lightNode = new DirectionalLight( color );
				lightNode.target.position.set( 0, 0, - 1 );
				lightNode.add( lightNode.target );
				break;

			case 'point':
				lightNode = new PointLight( color );
				lightNode.distance = range;
				break;

			case 'spot':
				lightNode = new SpotLight( color );
				lightNode.distance = range;
				// Handle spotlight properties.
				lightDef.spot = lightDef.spot || {};
				lightDef.spot.innerConeAngle = lightDef.spot.innerConeAngle !== undefined ? lightDef.spot.innerConeAngle : 0;
				lightDef.spot.outerConeAngle = lightDef.spot.outerConeAngle !== undefined ? lightDef.spot.outerConeAngle : Math.PI / 4.0;
				lightNode.angle = lightDef.spot.outerConeAngle;
				lightNode.penumbra = 1.0 - lightDef.spot.innerConeAngle / lightDef.spot.outerConeAngle;
				lightNode.target.position.set( 0, 0, - 1 );
				lightNode.add( lightNode.target );
				break;

			default:
				throw new Error( 'THREE.GLTFLoader: Unexpected light type: ' + lightDef.type );

		}

		// Some lights (e.g. spot) default to a position other than the origin. Reset the position
		// here, because node-level parsing will only override position if explicitly specified.
		lightNode.position.set( 0, 0, 0 );

		lightNode.decay = 2;

		if ( lightDef.intensity !== undefined ) lightNode.intensity = lightDef.intensity;

		lightNode.name = parser.createUniqueName( lightDef.name || ( 'light_' + lightIndex ) );

		dependency = Promise.resolve( lightNode );

		parser.cache.add( cacheKey, dependency );

		return dependency;

	};

	GLTFLightsExtension.prototype.createNodeAttachment = function ( nodeIndex ) {

		var self = this;
		var parser = this.parser;
		var json = parser.json;
		var nodeDef = json.nodes[ nodeIndex ];
		var lightDef = ( nodeDef.extensions && nodeDef.extensions[ this.name ] ) || {};
		var lightIndex = lightDef.light;

		if ( lightIndex === undefined ) return null;

		return this._loadLight( lightIndex ).then( function ( light ) {

			return parser._getNodeRef( self.cache, lightIndex, light );

		} );

	};

	/**
	 * Unlit Materials Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit
	 */
	function GLTFMaterialsUnlitExtension() {

		this.name = EXTENSIONS.KHR_MATERIALS_UNLIT;

	}

	GLTFMaterialsUnlitExtension.prototype.getMaterialType = function () {

		return MeshBasicMaterial;

	};

	GLTFMaterialsUnlitExtension.prototype.extendParams = function ( materialParams, materialDef, parser ) {

		var pending = [];

		materialParams.color = new Color( 1.0, 1.0, 1.0 );
		materialParams.opacity = 1.0;

		var metallicRoughness = materialDef.pbrMetallicRoughness;

		if ( metallicRoughness ) {

			if ( Array.isArray( metallicRoughness.baseColorFactor ) ) {

				var array = metallicRoughness.baseColorFactor;

				materialParams.color.fromArray( array );
				materialParams.opacity = array[ 3 ];

			}

			if ( metallicRoughness.baseColorTexture !== undefined ) {

				pending.push( parser.assignTexture( materialParams, 'map', metallicRoughness.baseColorTexture ) );

			}

		}

		return Promise.all( pending );

	};

	/**
	 * Clearcoat Materials Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_clearcoat
	 */
	function GLTFMaterialsClearcoatExtension( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_CLEARCOAT;

	}

	GLTFMaterialsClearcoatExtension.prototype.getMaterialType = function ( materialIndex ) {

		var parser = this.parser;
		var materialDef = parser.json.materials[ materialIndex ];

		if ( ! materialDef.extensions || ! materialDef.extensions[ this.name ] ) return null;

		return MeshPhysicalMaterial;

	};

	GLTFMaterialsClearcoatExtension.prototype.extendMaterialParams = function ( materialIndex, materialParams ) {

		var parser = this.parser;
		var materialDef = parser.json.materials[ materialIndex ];

		if ( ! materialDef.extensions || ! materialDef.extensions[ this.name ] ) {

			return Promise.resolve();

		}

		var pending = [];

		var extension = materialDef.extensions[ this.name ];

		if ( extension.clearcoatFactor !== undefined ) {

			materialParams.clearcoat = extension.clearcoatFactor;

		}

		if ( extension.clearcoatTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'clearcoatMap', extension.clearcoatTexture ) );

		}

		if ( extension.clearcoatRoughnessFactor !== undefined ) {

			materialParams.clearcoatRoughness = extension.clearcoatRoughnessFactor;

		}

		if ( extension.clearcoatRoughnessTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'clearcoatRoughnessMap', extension.clearcoatRoughnessTexture ) );

		}

		if ( extension.clearcoatNormalTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'clearcoatNormalMap', extension.clearcoatNormalTexture ) );

			if ( extension.clearcoatNormalTexture.scale !== undefined ) {

				var scale = extension.clearcoatNormalTexture.scale;

				// https://github.com/mrdoob/three.js/issues/11438#issuecomment-507003995
				materialParams.clearcoatNormalScale = new Vector2( scale, - scale );

			}

		}

		return Promise.all( pending );

	};

	/**
	 * Transmission Materials Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_transmission
	 * Draft: https://github.com/KhronosGroup/glTF/pull/1698
	 */
	function GLTFMaterialsTransmissionExtension( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_TRANSMISSION;

	}

	GLTFMaterialsTransmissionExtension.prototype.getMaterialType = function ( materialIndex ) {

		var parser = this.parser;
		var materialDef = parser.json.materials[ materialIndex ];

		if ( ! materialDef.extensions || ! materialDef.extensions[ this.name ] ) return null;

		return MeshPhysicalMaterial;

	};

	GLTFMaterialsTransmissionExtension.prototype.extendMaterialParams = function ( materialIndex, materialParams ) {

		var parser = this.parser;
		var materialDef = parser.json.materials[ materialIndex ];

		if ( ! materialDef.extensions || ! materialDef.extensions[ this.name ] ) {

			return Promise.resolve();

		}

		var pending = [];

		var extension = materialDef.extensions[ this.name ];

		if ( extension.transmissionFactor !== undefined ) {

			materialParams.transmission = extension.transmissionFactor;

		}

		if ( extension.transmissionTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'transmissionMap', extension.transmissionTexture ) );

		}

		return Promise.all( pending );

	};

	/**
	 * BasisU Texture Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_basisu
	 */
	function GLTFTextureBasisUExtension( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_TEXTURE_BASISU;

	}

	GLTFTextureBasisUExtension.prototype.loadTexture = function ( textureIndex ) {

		var parser = this.parser;
		var json = parser.json;

		var textureDef = json.textures[ textureIndex ];

		if ( ! textureDef.extensions || ! textureDef.extensions[ this.name ] ) {

			return null;

		}

		var extension = textureDef.extensions[ this.name ];
		var source = json.images[ extension.source ];
		var loader = parser.options.ktx2Loader;

		if ( ! loader ) {

			if ( json.extensionsRequired && json.extensionsRequired.indexOf( this.name ) >= 0 ) {

				throw new Error( 'THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures' );

			} else {

				// Assumes that the extension is optional and that a fallback texture is present
				return null;

			}

		}

		return parser.loadTextureImage( textureIndex, source, loader );

	};

	/**
	 * WebP Texture Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_texture_webp
	 */
	function GLTFTextureWebPExtension( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.EXT_TEXTURE_WEBP;
		this.isSupported = null;

	}

	GLTFTextureWebPExtension.prototype.loadTexture = function ( textureIndex ) {

		var name = this.name;
		var parser = this.parser;
		var json = parser.json;

		var textureDef = json.textures[ textureIndex ];

		if ( ! textureDef.extensions || ! textureDef.extensions[ name ] ) {

			return null;

		}

		var extension = textureDef.extensions[ name ];
		var source = json.images[ extension.source ];

		var loader = parser.textureLoader;
		if ( source.uri ) {

			var handler = parser.options.manager.getHandler( source.uri );
			if ( handler !== null ) loader = handler;

		}

		return this.detectSupport().then( function ( isSupported ) {

			if ( isSupported ) return parser.loadTextureImage( textureIndex, source, loader );

			if ( json.extensionsRequired && json.extensionsRequired.indexOf( name ) >= 0 ) {

				throw new Error( 'THREE.GLTFLoader: WebP required by asset but unsupported.' );

			}

			// Fall back to PNG or JPEG.
			return parser.loadTexture( textureIndex );

		} );

	};

	GLTFTextureWebPExtension.prototype.detectSupport = function () {

		if ( ! this.isSupported ) {

			this.isSupported = new Promise( function ( resolve ) {

				var image = new Image();

				// Lossy test image. Support for lossy images doesn't guarantee support for all
				// WebP images, unfortunately.
				image.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';

				image.onload = image.onerror = function () {

					resolve( image.height === 1 );

				};

			} );

		}

		return this.isSupported;

	};

	/**
	* meshopt BufferView Compression Extension
	*
	* Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_meshopt_compression
	*/
	function GLTFMeshoptCompression( parser ) {

		this.name = EXTENSIONS.EXT_MESHOPT_COMPRESSION;
		this.parser = parser;

	}

	GLTFMeshoptCompression.prototype.loadBufferView = function ( index ) {

		var json = this.parser.json;
		var bufferView = json.bufferViews[ index ];

		if ( bufferView.extensions && bufferView.extensions[ this.name ] ) {

			var extensionDef = bufferView.extensions[ this.name ];

			var buffer = this.parser.getDependency( 'buffer', extensionDef.buffer );
			var decoder = this.parser.options.meshoptDecoder;

			if ( ! decoder || ! decoder.supported ) {

				if ( json.extensionsRequired && json.extensionsRequired.indexOf( this.name ) >= 0 ) {

					throw new Error( 'THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files' );

				} else {

					// Assumes that the extension is optional and that fallback buffer data is present
					return null;

				}

			}

			return Promise.all( [ buffer, decoder.ready ] ).then( function ( res ) {

				var byteOffset = extensionDef.byteOffset || 0;
				var byteLength = extensionDef.byteLength || 0;

				var count = extensionDef.count;
				var stride = extensionDef.byteStride;

				var result = new ArrayBuffer( count * stride );
				var source = new Uint8Array( res[ 0 ], byteOffset, byteLength );

				decoder.decodeGltfBuffer( new Uint8Array( result ), count, stride, source, extensionDef.mode, extensionDef.filter );
				return result;

			} );

		} else {

			return null;

		}

	};

	/* BINARY EXTENSION */
	var BINARY_EXTENSION_HEADER_MAGIC = 'glTF';
	var BINARY_EXTENSION_HEADER_LENGTH = 12;
	var BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4E4F534A, BIN: 0x004E4942 };

	function GLTFBinaryExtension( data ) {

		this.name = EXTENSIONS.KHR_BINARY_GLTF;
		this.content = null;
		this.body = null;

		var headerView = new DataView( data, 0, BINARY_EXTENSION_HEADER_LENGTH );

		this.header = {
			magic: LoaderUtils.decodeText( new Uint8Array( data.slice( 0, 4 ) ) ),
			version: headerView.getUint32( 4, true ),
			length: headerView.getUint32( 8, true )
		};

		if ( this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC ) {

			throw new Error( 'THREE.GLTFLoader: Unsupported glTF-Binary header.' );

		} else if ( this.header.version < 2.0 ) {

			throw new Error( 'THREE.GLTFLoader: Legacy binary file detected.' );

		}

		var chunkContentsLength = this.header.length - BINARY_EXTENSION_HEADER_LENGTH;
		var chunkView = new DataView( data, BINARY_EXTENSION_HEADER_LENGTH );
		var chunkIndex = 0;

		while ( chunkIndex < chunkContentsLength ) {

			var chunkLength = chunkView.getUint32( chunkIndex, true );
			chunkIndex += 4;

			var chunkType = chunkView.getUint32( chunkIndex, true );
			chunkIndex += 4;

			if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON ) {

				var contentArray = new Uint8Array( data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength );
				this.content = LoaderUtils.decodeText( contentArray );

			} else if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN ) {

				var byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
				this.body = data.slice( byteOffset, byteOffset + chunkLength );

			}

			// Clients must ignore chunks with unknown types.

			chunkIndex += chunkLength;

		}

		if ( this.content === null ) {

			throw new Error( 'THREE.GLTFLoader: JSON content not found.' );

		}

	}

	/**
	 * DRACO Mesh Compression Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_draco_mesh_compression
	 */
	function GLTFDracoMeshCompressionExtension( json, dracoLoader ) {

		if ( ! dracoLoader ) {

			throw new Error( 'THREE.GLTFLoader: No DRACOLoader instance provided.' );

		}

		this.name = EXTENSIONS.KHR_DRACO_MESH_COMPRESSION;
		this.json = json;
		this.dracoLoader = dracoLoader;
		this.dracoLoader.preload();

	}

	GLTFDracoMeshCompressionExtension.prototype.decodePrimitive = function ( primitive, parser ) {

		var json = this.json;
		var dracoLoader = this.dracoLoader;
		var bufferViewIndex = primitive.extensions[ this.name ].bufferView;
		var gltfAttributeMap = primitive.extensions[ this.name ].attributes;
		var threeAttributeMap = {};
		var attributeNormalizedMap = {};
		var attributeTypeMap = {};

		for ( var attributeName in gltfAttributeMap ) {

			var threeAttributeName = ATTRIBUTES[ attributeName ] || attributeName.toLowerCase();

			threeAttributeMap[ threeAttributeName ] = gltfAttributeMap[ attributeName ];

		}

		for ( attributeName in primitive.attributes ) {

			var threeAttributeName = ATTRIBUTES[ attributeName ] || attributeName.toLowerCase();

			if ( gltfAttributeMap[ attributeName ] !== undefined ) {

				var accessorDef = json.accessors[ primitive.attributes[ attributeName ] ];
				var componentType = WEBGL_COMPONENT_TYPES[ accessorDef.componentType ];

				attributeTypeMap[ threeAttributeName ] = componentType;
				attributeNormalizedMap[ threeAttributeName ] = accessorDef.normalized === true;

			}

		}

		return parser.getDependency( 'bufferView', bufferViewIndex ).then( function ( bufferView ) {

			return new Promise( function ( resolve ) {

				dracoLoader.decodeDracoFile( bufferView, function ( geometry ) {

					for ( var attributeName in geometry.attributes ) {

						var attribute = geometry.attributes[ attributeName ];
						var normalized = attributeNormalizedMap[ attributeName ];

						if ( normalized !== undefined ) attribute.normalized = normalized;

					}

					resolve( geometry );

				}, threeAttributeMap, attributeTypeMap );

			} );

		} );

	};

	/**
	 * Texture Transform Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_transform
	 */
	function GLTFTextureTransformExtension() {

		this.name = EXTENSIONS.KHR_TEXTURE_TRANSFORM;

	}

	GLTFTextureTransformExtension.prototype.extendTexture = function ( texture, transform ) {

		texture = texture.clone();

		if ( transform.offset !== undefined ) {

			texture.offset.fromArray( transform.offset );

		}

		if ( transform.rotation !== undefined ) {

			texture.rotation = transform.rotation;

		}

		if ( transform.scale !== undefined ) {

			texture.repeat.fromArray( transform.scale );

		}

		if ( transform.texCoord !== undefined ) {

			console.warn( 'THREE.GLTFLoader: Custom UV sets in "' + this.name + '" extension not yet supported.' );

		}

		texture.needsUpdate = true;

		return texture;

	};

	/**
	 * Specular-Glossiness Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_pbrSpecularGlossiness
	 */

	/**
	 * A sub class of StandardMaterial with some of the functionality
	 * changed via the `onBeforeCompile` callback
	 * @pailhead
	 */

	function GLTFMeshStandardSGMaterial( params ) {

		MeshStandardMaterial.call( this );

		this.isGLTFSpecularGlossinessMaterial = true;

		//various chunks that need replacing
		var specularMapParsFragmentChunk = [
			'#ifdef USE_SPECULARMAP',
			'	uniform sampler2D specularMap;',
			'#endif'
		].join( '\n' );

		var glossinessMapParsFragmentChunk = [
			'#ifdef USE_GLOSSINESSMAP',
			'	uniform sampler2D glossinessMap;',
			'#endif'
		].join( '\n' );

		var specularMapFragmentChunk = [
			'vec3 specularFactor = specular;',
			'#ifdef USE_SPECULARMAP',
			'	vec4 texelSpecular = texture2D( specularMap, vUv );',
			'	texelSpecular = sRGBToLinear( texelSpecular );',
			'	// reads channel RGB, compatible with a glTF Specular-Glossiness (RGBA) texture',
			'	specularFactor *= texelSpecular.rgb;',
			'#endif'
		].join( '\n' );

		var glossinessMapFragmentChunk = [
			'float glossinessFactor = glossiness;',
			'#ifdef USE_GLOSSINESSMAP',
			'	vec4 texelGlossiness = texture2D( glossinessMap, vUv );',
			'	// reads channel A, compatible with a glTF Specular-Glossiness (RGBA) texture',
			'	glossinessFactor *= texelGlossiness.a;',
			'#endif'
		].join( '\n' );

		var lightPhysicalFragmentChunk = [
			'PhysicalMaterial material;',
			'material.diffuseColor = diffuseColor.rgb * ( 1. - max( specularFactor.r, max( specularFactor.g, specularFactor.b ) ) );',
			'vec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );',
			'float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );',
			'material.specularRoughness = max( 1.0 - glossinessFactor, 0.0525 ); // 0.0525 corresponds to the base mip of a 256 cubemap.',
			'material.specularRoughness += geometryRoughness;',
			'material.specularRoughness = min( material.specularRoughness, 1.0 );',
			'material.specularColor = specularFactor;',
		].join( '\n' );

		var uniforms = {
			specular: { value: new Color().setHex( 0xffffff ) },
			glossiness: { value: 1 },
			specularMap: { value: null },
			glossinessMap: { value: null }
		};

		this._extraUniforms = uniforms;

		this.onBeforeCompile = function ( shader ) {

			for ( var uniformName in uniforms ) {

				shader.uniforms[ uniformName ] = uniforms[ uniformName ];

			}

			shader.fragmentShader = shader.fragmentShader
				.replace( 'uniform float roughness;', 'uniform vec3 specular;' )
				.replace( 'uniform float metalness;', 'uniform float glossiness;' )
				.replace( '#include <roughnessmap_pars_fragment>', specularMapParsFragmentChunk )
				.replace( '#include <metalnessmap_pars_fragment>', glossinessMapParsFragmentChunk )
				.replace( '#include <roughnessmap_fragment>', specularMapFragmentChunk )
				.replace( '#include <metalnessmap_fragment>', glossinessMapFragmentChunk )
				.replace( '#include <lights_physical_fragment>', lightPhysicalFragmentChunk );

		};

		Object.defineProperties( this, {

			specular: {
				get: function () {

					return uniforms.specular.value;

				},
				set: function ( v ) {

					uniforms.specular.value = v;

				}
			},

			specularMap: {
				get: function () {

					return uniforms.specularMap.value;

				},
				set: function ( v ) {

					uniforms.specularMap.value = v;

					if ( v ) {

						this.defines.USE_SPECULARMAP = ''; // USE_UV is set by the renderer for specular maps

					} else {

						delete this.defines.USE_SPECULARMAP;

					}

				}
			},

			glossiness: {
				get: function () {

					return uniforms.glossiness.value;

				},
				set: function ( v ) {

					uniforms.glossiness.value = v;

				}
			},

			glossinessMap: {
				get: function () {

					return uniforms.glossinessMap.value;

				},
				set: function ( v ) {

					uniforms.glossinessMap.value = v;

					if ( v ) {

						this.defines.USE_GLOSSINESSMAP = '';
						this.defines.USE_UV = '';

					} else {

						delete this.defines.USE_GLOSSINESSMAP;
						delete this.defines.USE_UV;

					}

				}
			}

		} );

		delete this.metalness;
		delete this.roughness;
		delete this.metalnessMap;
		delete this.roughnessMap;

		this.setValues( params );

	}

	GLTFMeshStandardSGMaterial.prototype = Object.create( MeshStandardMaterial.prototype );
	GLTFMeshStandardSGMaterial.prototype.constructor = GLTFMeshStandardSGMaterial;

	GLTFMeshStandardSGMaterial.prototype.copy = function ( source ) {

		MeshStandardMaterial.prototype.copy.call( this, source );
		this.specularMap = source.specularMap;
		this.specular.copy( source.specular );
		this.glossinessMap = source.glossinessMap;
		this.glossiness = source.glossiness;
		delete this.metalness;
		delete this.roughness;
		delete this.metalnessMap;
		delete this.roughnessMap;
		return this;

	};

	function GLTFMaterialsPbrSpecularGlossinessExtension() {

		return {

			name: EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS,

			specularGlossinessParams: [
				'color',
				'map',
				'lightMap',
				'lightMapIntensity',
				'aoMap',
				'aoMapIntensity',
				'emissive',
				'emissiveIntensity',
				'emissiveMap',
				'bumpMap',
				'bumpScale',
				'normalMap',
				'normalMapType',
				'displacementMap',
				'displacementScale',
				'displacementBias',
				'specularMap',
				'specular',
				'glossinessMap',
				'glossiness',
				'alphaMap',
				'envMap',
				'envMapIntensity',
				'refractionRatio',
			],

			getMaterialType: function () {

				return GLTFMeshStandardSGMaterial;

			},

			extendParams: function ( materialParams, materialDef, parser ) {

				var pbrSpecularGlossiness = materialDef.extensions[ this.name ];

				materialParams.color = new Color( 1.0, 1.0, 1.0 );
				materialParams.opacity = 1.0;

				var pending = [];

				if ( Array.isArray( pbrSpecularGlossiness.diffuseFactor ) ) {

					var array = pbrSpecularGlossiness.diffuseFactor;

					materialParams.color.fromArray( array );
					materialParams.opacity = array[ 3 ];

				}

				if ( pbrSpecularGlossiness.diffuseTexture !== undefined ) {

					pending.push( parser.assignTexture( materialParams, 'map', pbrSpecularGlossiness.diffuseTexture ) );

				}

				materialParams.emissive = new Color( 0.0, 0.0, 0.0 );
				materialParams.glossiness = pbrSpecularGlossiness.glossinessFactor !== undefined ? pbrSpecularGlossiness.glossinessFactor : 1.0;
				materialParams.specular = new Color( 1.0, 1.0, 1.0 );

				if ( Array.isArray( pbrSpecularGlossiness.specularFactor ) ) {

					materialParams.specular.fromArray( pbrSpecularGlossiness.specularFactor );

				}

				if ( pbrSpecularGlossiness.specularGlossinessTexture !== undefined ) {

					var specGlossMapDef = pbrSpecularGlossiness.specularGlossinessTexture;
					pending.push( parser.assignTexture( materialParams, 'glossinessMap', specGlossMapDef ) );
					pending.push( parser.assignTexture( materialParams, 'specularMap', specGlossMapDef ) );

				}

				return Promise.all( pending );

			},

			createMaterial: function ( materialParams ) {

				var material = new GLTFMeshStandardSGMaterial( materialParams );
				material.fog = true;

				material.color = materialParams.color;

				material.map = materialParams.map === undefined ? null : materialParams.map;

				material.lightMap = null;
				material.lightMapIntensity = 1.0;

				material.aoMap = materialParams.aoMap === undefined ? null : materialParams.aoMap;
				material.aoMapIntensity = 1.0;

				material.emissive = materialParams.emissive;
				material.emissiveIntensity = 1.0;
				material.emissiveMap = materialParams.emissiveMap === undefined ? null : materialParams.emissiveMap;

				material.bumpMap = materialParams.bumpMap === undefined ? null : materialParams.bumpMap;
				material.bumpScale = 1;

				material.normalMap = materialParams.normalMap === undefined ? null : materialParams.normalMap;
				material.normalMapType = TangentSpaceNormalMap;

				if ( materialParams.normalScale ) material.normalScale = materialParams.normalScale;

				material.displacementMap = null;
				material.displacementScale = 1;
				material.displacementBias = 0;

				material.specularMap = materialParams.specularMap === undefined ? null : materialParams.specularMap;
				material.specular = materialParams.specular;

				material.glossinessMap = materialParams.glossinessMap === undefined ? null : materialParams.glossinessMap;
				material.glossiness = materialParams.glossiness;

				material.alphaMap = null;

				material.envMap = materialParams.envMap === undefined ? null : materialParams.envMap;
				material.envMapIntensity = 1.0;

				material.refractionRatio = 0.98;

				return material;

			},

		};

	}

	/**
	 * Mesh Quantization Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_mesh_quantization
	 */
	function GLTFMeshQuantizationExtension() {

		this.name = EXTENSIONS.KHR_MESH_QUANTIZATION;

	}

	/*********************************/
	/********** INTERPOLATION ********/
	/*********************************/

	// Spline Interpolation
	// Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#appendix-c-spline-interpolation
	function GLTFCubicSplineInterpolant( parameterPositions, sampleValues, sampleSize, resultBuffer ) {

		Interpolant.call( this, parameterPositions, sampleValues, sampleSize, resultBuffer );

	}

	GLTFCubicSplineInterpolant.prototype = Object.create( Interpolant.prototype );
	GLTFCubicSplineInterpolant.prototype.constructor = GLTFCubicSplineInterpolant;

	GLTFCubicSplineInterpolant.prototype.copySampleValue_ = function ( index ) {

		// Copies a sample value to the result buffer. See description of glTF
		// CUBICSPLINE values layout in interpolate_() function below.

		var result = this.resultBuffer,
			values = this.sampleValues,
			valueSize = this.valueSize,
			offset = index * valueSize * 3 + valueSize;

		for ( var i = 0; i !== valueSize; i ++ ) {

			result[ i ] = values[ offset + i ];

		}

		return result;

	};

	GLTFCubicSplineInterpolant.prototype.beforeStart_ = GLTFCubicSplineInterpolant.prototype.copySampleValue_;

	GLTFCubicSplineInterpolant.prototype.afterEnd_ = GLTFCubicSplineInterpolant.prototype.copySampleValue_;

	GLTFCubicSplineInterpolant.prototype.interpolate_ = function ( i1, t0, t, t1 ) {

		var result = this.resultBuffer;
		var values = this.sampleValues;
		var stride = this.valueSize;

		var stride2 = stride * 2;
		var stride3 = stride * 3;

		var td = t1 - t0;

		var p = ( t - t0 ) / td;
		var pp = p * p;
		var ppp = pp * p;

		var offset1 = i1 * stride3;
		var offset0 = offset1 - stride3;

		var s2 = - 2 * ppp + 3 * pp;
		var s3 = ppp - pp;
		var s0 = 1 - s2;
		var s1 = s3 - pp + p;

		// Layout of keyframe output values for CUBICSPLINE animations:
		//   [ inTangent_1, splineVertex_1, outTangent_1, inTangent_2, splineVertex_2, ... ]
		for ( var i = 0; i !== stride; i ++ ) {

			var p0 = values[ offset0 + i + stride ]; // splineVertex_k
			var m0 = values[ offset0 + i + stride2 ] * td; // outTangent_k * (t_k+1 - t_k)
			var p1 = values[ offset1 + i + stride ]; // splineVertex_k+1
			var m1 = values[ offset1 + i ] * td; // inTangent_k+1 * (t_k+1 - t_k)

			result[ i ] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1;

		}

		return result;

	};

	/*********************************/
	/********** INTERNALS ************/
	/*********************************/

	/* CONSTANTS */

	var WEBGL_CONSTANTS = {
		FLOAT: 5126,
		//FLOAT_MAT2: 35674,
		FLOAT_MAT3: 35675,
		FLOAT_MAT4: 35676,
		FLOAT_VEC2: 35664,
		FLOAT_VEC3: 35665,
		FLOAT_VEC4: 35666,
		LINEAR: 9729,
		REPEAT: 10497,
		SAMPLER_2D: 35678,
		POINTS: 0,
		LINES: 1,
		LINE_LOOP: 2,
		LINE_STRIP: 3,
		TRIANGLES: 4,
		TRIANGLE_STRIP: 5,
		TRIANGLE_FAN: 6,
		UNSIGNED_BYTE: 5121,
		UNSIGNED_SHORT: 5123
	};

	var WEBGL_COMPONENT_TYPES = {
		5120: Int8Array,
		5121: Uint8Array,
		5122: Int16Array,
		5123: Uint16Array,
		5125: Uint32Array,
		5126: Float32Array
	};

	var WEBGL_FILTERS = {
		9728: NearestFilter,
		9729: LinearFilter,
		9984: NearestMipmapNearestFilter,
		9985: LinearMipmapNearestFilter,
		9986: NearestMipmapLinearFilter,
		9987: LinearMipmapLinearFilter
	};

	var WEBGL_WRAPPINGS = {
		33071: ClampToEdgeWrapping,
		33648: MirroredRepeatWrapping,
		10497: RepeatWrapping
	};

	var WEBGL_TYPE_SIZES = {
		'SCALAR': 1,
		'VEC2': 2,
		'VEC3': 3,
		'VEC4': 4,
		'MAT2': 4,
		'MAT3': 9,
		'MAT4': 16
	};

	var ATTRIBUTES = {
		POSITION: 'position',
		NORMAL: 'normal',
		TANGENT: 'tangent',
		TEXCOORD_0: 'uv',
		TEXCOORD_1: 'uv2',
		COLOR_0: 'color',
		WEIGHTS_0: 'skinWeight',
		JOINTS_0: 'skinIndex',
	};

	var PATH_PROPERTIES = {
		scale: 'scale',
		translation: 'position',
		rotation: 'quaternion',
		weights: 'morphTargetInfluences'
	};

	var INTERPOLATION = {
		CUBICSPLINE: undefined, // We use a custom interpolant (GLTFCubicSplineInterpolation) for CUBICSPLINE tracks. Each
		                        // keyframe track will be initialized with a default interpolation type, then modified.
		LINEAR: InterpolateLinear,
		STEP: InterpolateDiscrete
	};

	var ALPHA_MODES = {
		OPAQUE: 'OPAQUE',
		MASK: 'MASK',
		BLEND: 'BLEND'
	};

	/* UTILITY FUNCTIONS */

	function resolveURL( url, path ) {

		// Invalid URL
		if ( typeof url !== 'string' || url === '' ) return '';

		// Host Relative URL
		if ( /^https?:\/\//i.test( path ) && /^\//.test( url ) ) {

			path = path.replace( /(^https?:\/\/[^\/]+).*/i, '$1' );

		}

		// Absolute URL http://,https://,//
		if ( /^(https?:)?\/\//i.test( url ) ) return url;

		// Data URI
		if ( /^data:.*,.*$/i.test( url ) ) return url;

		// Blob URL
		if ( /^blob:.*$/i.test( url ) ) return url;

		// Relative URL
		return path + url;

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#default-material
	 */
	function createDefaultMaterial( cache ) {

		if ( cache[ 'DefaultMaterial' ] === undefined ) {

			cache[ 'DefaultMaterial' ] = new MeshStandardMaterial( {
				color: 0xFFFFFF,
				emissive: 0x000000,
				metalness: 1,
				roughness: 1,
				transparent: false,
				depthTest: true,
				side: FrontSide
			} );

		}

		return cache[ 'DefaultMaterial' ];

	}

	function addUnknownExtensionsToUserData( knownExtensions, object, objectDef ) {

		// Add unknown glTF extensions to an object's userData.

		for ( var name in objectDef.extensions ) {

			if ( knownExtensions[ name ] === undefined ) {

				object.userData.gltfExtensions = object.userData.gltfExtensions || {};
				object.userData.gltfExtensions[ name ] = objectDef.extensions[ name ];

			}

		}

	}

	/**
	 * @param {Object3D|Material|BufferGeometry} object
	 * @param {GLTF.definition} gltfDef
	 */
	function assignExtrasToUserData( object, gltfDef ) {

		if ( gltfDef.extras !== undefined ) {

			if ( typeof gltfDef.extras === 'object' ) {

				Object.assign( object.userData, gltfDef.extras );

			} else {

				console.warn( 'THREE.GLTFLoader: Ignoring primitive type .extras, ' + gltfDef.extras );

			}

		}

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#morph-targets
	 *
	 * @param {BufferGeometry} geometry
	 * @param {Array<GLTF.Target>} targets
	 * @param {GLTFParser} parser
	 * @return {Promise<BufferGeometry>}
	 */
	function addMorphTargets( geometry, targets, parser ) {

		var hasMorphPosition = false;
		var hasMorphNormal = false;

		for ( var i = 0, il = targets.length; i < il; i ++ ) {

			var target = targets[ i ];

			if ( target.POSITION !== undefined ) hasMorphPosition = true;
			if ( target.NORMAL !== undefined ) hasMorphNormal = true;

			if ( hasMorphPosition && hasMorphNormal ) break;

		}

		if ( ! hasMorphPosition && ! hasMorphNormal ) return Promise.resolve( geometry );

		var pendingPositionAccessors = [];
		var pendingNormalAccessors = [];

		for ( var i = 0, il = targets.length; i < il; i ++ ) {

			var target = targets[ i ];

			if ( hasMorphPosition ) {

				var pendingAccessor = target.POSITION !== undefined
					? parser.getDependency( 'accessor', target.POSITION )
					: geometry.attributes.position;

				pendingPositionAccessors.push( pendingAccessor );

			}

			if ( hasMorphNormal ) {

				var pendingAccessor = target.NORMAL !== undefined
					? parser.getDependency( 'accessor', target.NORMAL )
					: geometry.attributes.normal;

				pendingNormalAccessors.push( pendingAccessor );

			}

		}

		return Promise.all( [
			Promise.all( pendingPositionAccessors ),
			Promise.all( pendingNormalAccessors )
		] ).then( function ( accessors ) {

			var morphPositions = accessors[ 0 ];
			var morphNormals = accessors[ 1 ];

			if ( hasMorphPosition ) geometry.morphAttributes.position = morphPositions;
			if ( hasMorphNormal ) geometry.morphAttributes.normal = morphNormals;
			geometry.morphTargetsRelative = true;

			return geometry;

		} );

	}

	/**
	 * @param {Mesh} mesh
	 * @param {GLTF.Mesh} meshDef
	 */
	function updateMorphTargets( mesh, meshDef ) {

		mesh.updateMorphTargets();

		if ( meshDef.weights !== undefined ) {

			for ( var i = 0, il = meshDef.weights.length; i < il; i ++ ) {

				mesh.morphTargetInfluences[ i ] = meshDef.weights[ i ];

			}

		}

		// .extras has user-defined data, so check that .extras.targetNames is an array.
		if ( meshDef.extras && Array.isArray( meshDef.extras.targetNames ) ) {

			var targetNames = meshDef.extras.targetNames;

			if ( mesh.morphTargetInfluences.length === targetNames.length ) {

				mesh.morphTargetDictionary = {};

				for ( var i = 0, il = targetNames.length; i < il; i ++ ) {

					mesh.morphTargetDictionary[ targetNames[ i ] ] = i;

				}

			} else {

				console.warn( 'THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.' );

			}

		}

	}

	function createPrimitiveKey( primitiveDef ) {

		var dracoExtension = primitiveDef.extensions && primitiveDef.extensions[ EXTENSIONS.KHR_DRACO_MESH_COMPRESSION ];
		var geometryKey;

		if ( dracoExtension ) {

			geometryKey = 'draco:' + dracoExtension.bufferView
				+ ':' + dracoExtension.indices
				+ ':' + createAttributesKey( dracoExtension.attributes );

		} else {

			geometryKey = primitiveDef.indices + ':' + createAttributesKey( primitiveDef.attributes ) + ':' + primitiveDef.mode;

		}

		return geometryKey;

	}

	function createAttributesKey( attributes ) {

		var attributesKey = '';

		var keys = Object.keys( attributes ).sort();

		for ( var i = 0, il = keys.length; i < il; i ++ ) {

			attributesKey += keys[ i ] + ':' + attributes[ keys[ i ] ] + ';';

		}

		return attributesKey;

	}

	/* GLTF PARSER */

	function GLTFParser( json, options ) {

		this.json = json || {};
		this.extensions = {};
		this.plugins = {};
		this.options = options || {};

		// loader object cache
		this.cache = new GLTFRegistry();

		// associations between Three.js objects and glTF elements
		this.associations = new Map();

		// BufferGeometry caching
		this.primitiveCache = {};

		// Object3D instance caches
		this.meshCache = { refs: {}, uses: {} };
		this.cameraCache = { refs: {}, uses: {} };
		this.lightCache = { refs: {}, uses: {} };

		// Track node names, to ensure no duplicates
		this.nodeNamesUsed = {};

		// Use an ImageBitmapLoader if imageBitmaps are supported. Moves much of the
		// expensive work of uploading a texture to the GPU off the main thread.
		if ( typeof createImageBitmap !== 'undefined' && /Firefox/.test( navigator.userAgent ) === false ) {

			this.textureLoader = new ImageBitmapLoader( this.options.manager );

		} else {

			this.textureLoader = new TextureLoader( this.options.manager );

		}

		this.textureLoader.setCrossOrigin( this.options.crossOrigin );
		this.textureLoader.setRequestHeader( this.options.requestHeader );

		this.fileLoader = new FileLoader( this.options.manager );
		this.fileLoader.setResponseType( 'arraybuffer' );

		if ( this.options.crossOrigin === 'use-credentials' ) {

			this.fileLoader.setWithCredentials( true );

		}

	}

	GLTFParser.prototype.setExtensions = function ( extensions ) {

		this.extensions = extensions;

	};

	GLTFParser.prototype.setPlugins = function ( plugins ) {

		this.plugins = plugins;

	};

	GLTFParser.prototype.parse = function ( onLoad, onError ) {

		var parser = this;
		var json = this.json;
		var extensions = this.extensions;

		// Clear the loader cache
		this.cache.removeAll();

		// Mark the special nodes/meshes in json for efficient parse
		this._invokeAll( function ( ext ) {

			return ext._markDefs && ext._markDefs();

		} );

		Promise.all( this._invokeAll( function ( ext ) {

			return ext.beforeRoot && ext.beforeRoot();

		} ) ).then( function () {

			return Promise.all( [

				parser.getDependencies( 'scene' ),
				parser.getDependencies( 'animation' ),
				parser.getDependencies( 'camera' ),

			] );

		} ).then( function ( dependencies ) {

			var result = {
				scene: dependencies[ 0 ][ json.scene || 0 ],
				scenes: dependencies[ 0 ],
				animations: dependencies[ 1 ],
				cameras: dependencies[ 2 ],
				asset: json.asset,
				parser: parser,
				userData: {}
			};

			addUnknownExtensionsToUserData( extensions, result, json );

			assignExtrasToUserData( result, json );

			Promise.all( parser._invokeAll( function ( ext ) {

				return ext.afterRoot && ext.afterRoot( result );

			} ) ).then( function () {

				onLoad( result );

			} );

		} ).catch( onError );

	};

	/**
	 * Marks the special nodes/meshes in json for efficient parse.
	 */
	GLTFParser.prototype._markDefs = function () {

		var nodeDefs = this.json.nodes || [];
		var skinDefs = this.json.skins || [];
		var meshDefs = this.json.meshes || [];

		// Nothing in the node definition indicates whether it is a Bone or an
		// Object3D. Use the skins' joint references to mark bones.
		for ( var skinIndex = 0, skinLength = skinDefs.length; skinIndex < skinLength; skinIndex ++ ) {

			var joints = skinDefs[ skinIndex ].joints;

			for ( var i = 0, il = joints.length; i < il; i ++ ) {

				nodeDefs[ joints[ i ] ].isBone = true;

			}

		}

		// Iterate over all nodes, marking references to shared resources,
		// as well as skeleton joints.
		for ( var nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex ++ ) {

			var nodeDef = nodeDefs[ nodeIndex ];

			if ( nodeDef.mesh !== undefined ) {

				this._addNodeRef( this.meshCache, nodeDef.mesh );

				// Nothing in the mesh definition indicates whether it is
				// a SkinnedMesh or Mesh. Use the node's mesh reference
				// to mark SkinnedMesh if node has skin.
				if ( nodeDef.skin !== undefined ) {

					meshDefs[ nodeDef.mesh ].isSkinnedMesh = true;

				}

			}

			if ( nodeDef.camera !== undefined ) {

				this._addNodeRef( this.cameraCache, nodeDef.camera );

			}

		}

	};

	/**
	 * Counts references to shared node / Object3D resources. These resources
	 * can be reused, or "instantiated", at multiple nodes in the scene
	 * hierarchy. Mesh, Camera, and Light instances are instantiated and must
	 * be marked. Non-scenegraph resources (like Materials, Geometries, and
	 * Textures) can be reused directly and are not marked here.
	 *
	 * Example: CesiumMilkTruck sample model reuses "Wheel" meshes.
	 */
	GLTFParser.prototype._addNodeRef = function ( cache, index ) {

		if ( index === undefined ) return;

		if ( cache.refs[ index ] === undefined ) {

			cache.refs[ index ] = cache.uses[ index ] = 0;

		}

		cache.refs[ index ] ++;

	};

	/** Returns a reference to a shared resource, cloning it if necessary. */
	GLTFParser.prototype._getNodeRef = function ( cache, index, object ) {

		if ( cache.refs[ index ] <= 1 ) return object;

		var ref = object.clone();

		ref.name += '_instance_' + ( cache.uses[ index ] ++ );

		return ref;

	};

	GLTFParser.prototype._invokeOne = function ( func ) {

		var extensions = Object.values( this.plugins );
		extensions.push( this );

		for ( var i = 0; i < extensions.length; i ++ ) {

			var result = func( extensions[ i ] );

			if ( result ) return result;

		}

	};

	GLTFParser.prototype._invokeAll = function ( func ) {

		var extensions = Object.values( this.plugins );
		extensions.unshift( this );

		var pending = [];

		for ( var i = 0; i < extensions.length; i ++ ) {

			var result = func( extensions[ i ] );

			if ( result ) pending.push( result );

		}

		return pending;

	};

	/**
	 * Requests the specified dependency asynchronously, with caching.
	 * @param {string} type
	 * @param {number} index
	 * @return {Promise<Object3D|Material|THREE.Texture|AnimationClip|ArrayBuffer|Object>}
	 */
	GLTFParser.prototype.getDependency = function ( type, index ) {

		var cacheKey = type + ':' + index;
		var dependency = this.cache.get( cacheKey );

		if ( ! dependency ) {

			switch ( type ) {

				case 'scene':
					dependency = this.loadScene( index );
					break;

				case 'node':
					dependency = this.loadNode( index );
					break;

				case 'mesh':
					dependency = this._invokeOne( function ( ext ) {

						return ext.loadMesh && ext.loadMesh( index );

					} );
					break;

				case 'accessor':
					dependency = this.loadAccessor( index );
					break;

				case 'bufferView':
					dependency = this._invokeOne( function ( ext ) {

						return ext.loadBufferView && ext.loadBufferView( index );

					} );
					break;

				case 'buffer':
					dependency = this.loadBuffer( index );
					break;

				case 'material':
					dependency = this._invokeOne( function ( ext ) {

						return ext.loadMaterial && ext.loadMaterial( index );

					} );
					break;

				case 'texture':
					dependency = this._invokeOne( function ( ext ) {

						return ext.loadTexture && ext.loadTexture( index );

					} );
					break;

				case 'skin':
					dependency = this.loadSkin( index );
					break;

				case 'animation':
					dependency = this.loadAnimation( index );
					break;

				case 'camera':
					dependency = this.loadCamera( index );
					break;

				default:
					throw new Error( 'Unknown type: ' + type );

			}

			this.cache.add( cacheKey, dependency );

		}

		return dependency;

	};

	/**
	 * Requests all dependencies of the specified type asynchronously, with caching.
	 * @param {string} type
	 * @return {Promise<Array<Object>>}
	 */
	GLTFParser.prototype.getDependencies = function ( type ) {

		var dependencies = this.cache.get( type );

		if ( ! dependencies ) {

			var parser = this;
			var defs = this.json[ type + ( type === 'mesh' ? 'es' : 's' ) ] || [];

			dependencies = Promise.all( defs.map( function ( def, index ) {

				return parser.getDependency( type, index );

			} ) );

			this.cache.add( type, dependencies );

		}

		return dependencies;

	};

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
	 * @param {number} bufferIndex
	 * @return {Promise<ArrayBuffer>}
	 */
	GLTFParser.prototype.loadBuffer = function ( bufferIndex ) {

		var bufferDef = this.json.buffers[ bufferIndex ];
		var loader = this.fileLoader;

		if ( bufferDef.type && bufferDef.type !== 'arraybuffer' ) {

			throw new Error( 'THREE.GLTFLoader: ' + bufferDef.type + ' buffer type is not supported.' );

		}

		// If present, GLB container is required to be the first buffer.
		if ( bufferDef.uri === undefined && bufferIndex === 0 ) {

			return Promise.resolve( this.extensions[ EXTENSIONS.KHR_BINARY_GLTF ].body );

		}

		var options = this.options;

		return new Promise( function ( resolve, reject ) {

			loader.load( resolveURL( bufferDef.uri, options.path ), resolve, undefined, function () {

				reject( new Error( 'THREE.GLTFLoader: Failed to load buffer "' + bufferDef.uri + '".' ) );

			} );

		} );

	};

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
	 * @param {number} bufferViewIndex
	 * @return {Promise<ArrayBuffer>}
	 */
	GLTFParser.prototype.loadBufferView = function ( bufferViewIndex ) {

		var bufferViewDef = this.json.bufferViews[ bufferViewIndex ];

		return this.getDependency( 'buffer', bufferViewDef.buffer ).then( function ( buffer ) {

			var byteLength = bufferViewDef.byteLength || 0;
			var byteOffset = bufferViewDef.byteOffset || 0;
			return buffer.slice( byteOffset, byteOffset + byteLength );

		} );

	};

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessors
	 * @param {number} accessorIndex
	 * @return {Promise<BufferAttribute|InterleavedBufferAttribute>}
	 */
	GLTFParser.prototype.loadAccessor = function ( accessorIndex ) {

		var parser = this;
		var json = this.json;

		var accessorDef = this.json.accessors[ accessorIndex ];

		if ( accessorDef.bufferView === undefined && accessorDef.sparse === undefined ) {

			// Ignore empty accessors, which may be used to declare runtime
			// information about attributes coming from another source (e.g. Draco
			// compression extension).
			return Promise.resolve( null );

		}

		var pendingBufferViews = [];

		if ( accessorDef.bufferView !== undefined ) {

			pendingBufferViews.push( this.getDependency( 'bufferView', accessorDef.bufferView ) );

		} else {

			pendingBufferViews.push( null );

		}

		if ( accessorDef.sparse !== undefined ) {

			pendingBufferViews.push( this.getDependency( 'bufferView', accessorDef.sparse.indices.bufferView ) );
			pendingBufferViews.push( this.getDependency( 'bufferView', accessorDef.sparse.values.bufferView ) );

		}

		return Promise.all( pendingBufferViews ).then( function ( bufferViews ) {

			var bufferView = bufferViews[ 0 ];

			var itemSize = WEBGL_TYPE_SIZES[ accessorDef.type ];
			var TypedArray = WEBGL_COMPONENT_TYPES[ accessorDef.componentType ];

			// For VEC3: itemSize is 3, elementBytes is 4, itemBytes is 12.
			var elementBytes = TypedArray.BYTES_PER_ELEMENT;
			var itemBytes = elementBytes * itemSize;
			var byteOffset = accessorDef.byteOffset || 0;
			var byteStride = accessorDef.bufferView !== undefined ? json.bufferViews[ accessorDef.bufferView ].byteStride : undefined;
			var normalized = accessorDef.normalized === true;
			var array, bufferAttribute;

			// The buffer is not interleaved if the stride is the item size in bytes.
			if ( byteStride && byteStride !== itemBytes ) {

				// Each "slice" of the buffer, as defined by 'count' elements of 'byteStride' bytes, gets its own InterleavedBuffer
				// This makes sure that IBA.count reflects accessor.count properly
				var ibSlice = Math.floor( byteOffset / byteStride );
				var ibCacheKey = 'InterleavedBuffer:' + accessorDef.bufferView + ':' + accessorDef.componentType + ':' + ibSlice + ':' + accessorDef.count;
				var ib = parser.cache.get( ibCacheKey );

				if ( ! ib ) {

					array = new TypedArray( bufferView, ibSlice * byteStride, accessorDef.count * byteStride / elementBytes );

					// Integer parameters to IB/IBA are in array elements, not bytes.
					ib = new InterleavedBuffer( array, byteStride / elementBytes );

					parser.cache.add( ibCacheKey, ib );

				}

				bufferAttribute = new InterleavedBufferAttribute( ib, itemSize, ( byteOffset % byteStride ) / elementBytes, normalized );

			} else {

				if ( bufferView === null ) {

					array = new TypedArray( accessorDef.count * itemSize );

				} else {

					array = new TypedArray( bufferView, byteOffset, accessorDef.count * itemSize );

				}

				bufferAttribute = new BufferAttribute( array, itemSize, normalized );

			}

			// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#sparse-accessors
			if ( accessorDef.sparse !== undefined ) {

				var itemSizeIndices = WEBGL_TYPE_SIZES.SCALAR;
				var TypedArrayIndices = WEBGL_COMPONENT_TYPES[ accessorDef.sparse.indices.componentType ];

				var byteOffsetIndices = accessorDef.sparse.indices.byteOffset || 0;
				var byteOffsetValues = accessorDef.sparse.values.byteOffset || 0;

				var sparseIndices = new TypedArrayIndices( bufferViews[ 1 ], byteOffsetIndices, accessorDef.sparse.count * itemSizeIndices );
				var sparseValues = new TypedArray( bufferViews[ 2 ], byteOffsetValues, accessorDef.sparse.count * itemSize );

				if ( bufferView !== null ) {

					// Avoid modifying the original ArrayBuffer, if the bufferView wasn't initialized with zeroes.
					bufferAttribute = new BufferAttribute( bufferAttribute.array.slice(), bufferAttribute.itemSize, bufferAttribute.normalized );

				}

				for ( var i = 0, il = sparseIndices.length; i < il; i ++ ) {

					var index = sparseIndices[ i ];

					bufferAttribute.setX( index, sparseValues[ i * itemSize ] );
					if ( itemSize >= 2 ) bufferAttribute.setY( index, sparseValues[ i * itemSize + 1 ] );
					if ( itemSize >= 3 ) bufferAttribute.setZ( index, sparseValues[ i * itemSize + 2 ] );
					if ( itemSize >= 4 ) bufferAttribute.setW( index, sparseValues[ i * itemSize + 3 ] );
					if ( itemSize >= 5 ) throw new Error( 'THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.' );

				}

			}

			return bufferAttribute;

		} );

	};

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#textures
	 * @param {number} textureIndex
	 * @return {Promise<THREE.Texture>}
	 */
	GLTFParser.prototype.loadTexture = function ( textureIndex ) {

		var json = this.json;
		var options = this.options;
		var textureDef = json.textures[ textureIndex ];
		var source = json.images[ textureDef.source ];

		var loader = this.textureLoader;

		if ( source.uri ) {

			var handler = options.manager.getHandler( source.uri );
			if ( handler !== null ) loader = handler;

		}

		return this.loadTextureImage( textureIndex, source, loader );

	};

	GLTFParser.prototype.loadTextureImage = function ( textureIndex, source, loader ) {

		var parser = this;
		var json = this.json;
		var options = this.options;

		var textureDef = json.textures[ textureIndex ];

		var URL = self.URL || self.webkitURL;

		var sourceURI = source.uri;
		var isObjectURL = false;
		var hasAlpha = true;

		if ( source.mimeType === 'image/jpeg' ) hasAlpha = false;

		if ( source.bufferView !== undefined ) {

			// Load binary image data from bufferView, if provided.

			sourceURI = parser.getDependency( 'bufferView', source.bufferView ).then( function ( bufferView ) {

				if ( source.mimeType === 'image/png' ) {

					// Inspect the PNG 'IHDR' chunk to determine whether the image could have an
					// alpha channel. This check is conservative — the image could have an alpha
					// channel with all values == 1, and the indexed type (colorType == 3) only
					// sometimes contains alpha.
					//
					// https://en.wikipedia.org/wiki/Portable_Network_Graphics#File_header
					var colorType = new DataView( bufferView, 25, 1 ).getUint8( 0, false );
					hasAlpha = colorType === 6 || colorType === 4 || colorType === 3;

				}

				isObjectURL = true;
				var blob = new Blob( [ bufferView ], { type: source.mimeType } );
				sourceURI = URL.createObjectURL( blob );
				return sourceURI;

			} );

		} else if ( source.uri === undefined ) {

			throw new Error( 'THREE.GLTFLoader: Image ' + textureIndex + ' is missing URI and bufferView' );

		}

		return Promise.resolve( sourceURI ).then( function ( sourceURI ) {

			return new Promise( function ( resolve, reject ) {

				var onLoad = resolve;

				if ( loader.isImageBitmapLoader === true ) {

					onLoad = function ( imageBitmap ) {

						resolve( new CanvasTexture( imageBitmap ) );

					};

				}

				loader.load( resolveURL( sourceURI, options.path ), onLoad, undefined, reject );

			} );

		} ).then( function ( texture ) {

			// Clean up resources and configure Texture.

			if ( isObjectURL === true ) {

				URL.revokeObjectURL( sourceURI );

			}

			texture.flipY = false;

			if ( textureDef.name ) texture.name = textureDef.name;

			// When there is definitely no alpha channel in the texture, set RGBFormat to save space.
			if ( ! hasAlpha ) texture.format = RGBFormat;

			var samplers = json.samplers || {};
			var sampler = samplers[ textureDef.sampler ] || {};

			texture.magFilter = WEBGL_FILTERS[ sampler.magFilter ] || LinearFilter;
			texture.minFilter = WEBGL_FILTERS[ sampler.minFilter ] || LinearMipmapLinearFilter;
			texture.wrapS = WEBGL_WRAPPINGS[ sampler.wrapS ] || RepeatWrapping;
			texture.wrapT = WEBGL_WRAPPINGS[ sampler.wrapT ] || RepeatWrapping;

			parser.associations.set( texture, {
				type: 'textures',
				index: textureIndex
			} );

			return texture;

		} );

	};

	/**
	 * Asynchronously assigns a texture to the given material parameters.
	 * @param {Object} materialParams
	 * @param {string} mapName
	 * @param {Object} mapDef
	 * @return {Promise}
	 */
	GLTFParser.prototype.assignTexture = function ( materialParams, mapName, mapDef ) {

		var parser = this;

		return this.getDependency( 'texture', mapDef.index ).then( function ( texture ) {

			// Materials sample aoMap from UV set 1 and other maps from UV set 0 - this can't be configured
			// However, we will copy UV set 0 to UV set 1 on demand for aoMap
			if ( mapDef.texCoord !== undefined && mapDef.texCoord != 0 && ! ( mapName === 'aoMap' && mapDef.texCoord == 1 ) ) {

				console.warn( 'THREE.GLTFLoader: Custom UV set ' + mapDef.texCoord + ' for texture ' + mapName + ' not yet supported.' );

			}

			if ( parser.extensions[ EXTENSIONS.KHR_TEXTURE_TRANSFORM ] ) {

				var transform = mapDef.extensions !== undefined ? mapDef.extensions[ EXTENSIONS.KHR_TEXTURE_TRANSFORM ] : undefined;

				if ( transform ) {

					var gltfReference = parser.associations.get( texture );
					texture = parser.extensions[ EXTENSIONS.KHR_TEXTURE_TRANSFORM ].extendTexture( texture, transform );
					parser.associations.set( texture, gltfReference );

				}

			}

			materialParams[ mapName ] = texture;

		} );

	};

	/**
	 * Assigns final material to a Mesh, Line, or Points instance. The instance
	 * already has a material (generated from the glTF material options alone)
	 * but reuse of the same glTF material may require multiple threejs materials
	 * to accommodate different primitive types, defines, etc. New materials will
	 * be created if necessary, and reused from a cache.
	 * @param  {Object3D} mesh Mesh, Line, or Points instance.
	 */
	GLTFParser.prototype.assignFinalMaterial = function ( mesh ) {

		var geometry = mesh.geometry;
		var material = mesh.material;

		var useVertexTangents = geometry.attributes.tangent !== undefined;
		var useVertexColors = geometry.attributes.color !== undefined;
		var useFlatShading = geometry.attributes.normal === undefined;
		var useSkinning = mesh.isSkinnedMesh === true;
		var useMorphTargets = Object.keys( geometry.morphAttributes ).length > 0;
		var useMorphNormals = useMorphTargets && geometry.morphAttributes.normal !== undefined;

		if ( mesh.isPoints ) {

			var cacheKey = 'PointsMaterial:' + material.uuid;

			var pointsMaterial = this.cache.get( cacheKey );

			if ( ! pointsMaterial ) {

				pointsMaterial = new PointsMaterial();
				Material.prototype.copy.call( pointsMaterial, material );
				pointsMaterial.color.copy( material.color );
				pointsMaterial.map = material.map;
				pointsMaterial.sizeAttenuation = false; // glTF spec says points should be 1px

				this.cache.add( cacheKey, pointsMaterial );

			}

			material = pointsMaterial;

		} else if ( mesh.isLine ) {

			var cacheKey = 'LineBasicMaterial:' + material.uuid;

			var lineMaterial = this.cache.get( cacheKey );

			if ( ! lineMaterial ) {

				lineMaterial = new LineBasicMaterial();
				Material.prototype.copy.call( lineMaterial, material );
				lineMaterial.color.copy( material.color );

				this.cache.add( cacheKey, lineMaterial );

			}

			material = lineMaterial;

		}

		// Clone the material if it will be modified
		if ( useVertexTangents || useVertexColors || useFlatShading || useSkinning || useMorphTargets ) {

			var cacheKey = 'ClonedMaterial:' + material.uuid + ':';

			if ( material.isGLTFSpecularGlossinessMaterial ) cacheKey += 'specular-glossiness:';
			if ( useSkinning ) cacheKey += 'skinning:';
			if ( useVertexTangents ) cacheKey += 'vertex-tangents:';
			if ( useVertexColors ) cacheKey += 'vertex-colors:';
			if ( useFlatShading ) cacheKey += 'flat-shading:';
			if ( useMorphTargets ) cacheKey += 'morph-targets:';
			if ( useMorphNormals ) cacheKey += 'morph-normals:';

			var cachedMaterial = this.cache.get( cacheKey );

			if ( ! cachedMaterial ) {

				cachedMaterial = material.clone();

				if ( useSkinning ) cachedMaterial.skinning = true;
				if ( useVertexColors ) cachedMaterial.vertexColors = true;
				if ( useFlatShading ) cachedMaterial.flatShading = true;
				if ( useMorphTargets ) cachedMaterial.morphTargets = true;
				if ( useMorphNormals ) cachedMaterial.morphNormals = true;

				if ( useVertexTangents ) {

					cachedMaterial.vertexTangents = true;

					// https://github.com/mrdoob/three.js/issues/11438#issuecomment-507003995
					if ( cachedMaterial.normalScale ) cachedMaterial.normalScale.y *= - 1;
					if ( cachedMaterial.clearcoatNormalScale ) cachedMaterial.clearcoatNormalScale.y *= - 1;

				}

				this.cache.add( cacheKey, cachedMaterial );

				this.associations.set( cachedMaterial, this.associations.get( material ) );

			}

			material = cachedMaterial;

		}

		// workarounds for mesh and geometry

		if ( material.aoMap && geometry.attributes.uv2 === undefined && geometry.attributes.uv !== undefined ) {

			geometry.setAttribute( 'uv2', geometry.attributes.uv );

		}

		mesh.material = material;

	};

	GLTFParser.prototype.getMaterialType = function ( /* materialIndex */ ) {

		return MeshStandardMaterial;

	};

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#materials
	 * @param {number} materialIndex
	 * @return {Promise<Material>}
	 */
	GLTFParser.prototype.loadMaterial = function ( materialIndex ) {

		var parser = this;
		var json = this.json;
		var extensions = this.extensions;
		var materialDef = json.materials[ materialIndex ];

		var materialType;
		var materialParams = {};
		var materialExtensions = materialDef.extensions || {};

		var pending = [];

		if ( materialExtensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ] ) {

			var sgExtension = extensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ];
			materialType = sgExtension.getMaterialType();
			pending.push( sgExtension.extendParams( materialParams, materialDef, parser ) );

		} else if ( materialExtensions[ EXTENSIONS.KHR_MATERIALS_UNLIT ] ) {

			var kmuExtension = extensions[ EXTENSIONS.KHR_MATERIALS_UNLIT ];
			materialType = kmuExtension.getMaterialType();
			pending.push( kmuExtension.extendParams( materialParams, materialDef, parser ) );

		} else {

			// Specification:
			// https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#metallic-roughness-material

			var metallicRoughness = materialDef.pbrMetallicRoughness || {};

			materialParams.color = new Color( 1.0, 1.0, 1.0 );
			materialParams.opacity = 1.0;

			if ( Array.isArray( metallicRoughness.baseColorFactor ) ) {

				var array = metallicRoughness.baseColorFactor;

				materialParams.color.fromArray( array );
				materialParams.opacity = array[ 3 ];

			}

			if ( metallicRoughness.baseColorTexture !== undefined ) {

				pending.push( parser.assignTexture( materialParams, 'map', metallicRoughness.baseColorTexture ) );

			}

			materialParams.metalness = metallicRoughness.metallicFactor !== undefined ? metallicRoughness.metallicFactor : 1.0;
			materialParams.roughness = metallicRoughness.roughnessFactor !== undefined ? metallicRoughness.roughnessFactor : 1.0;

			if ( metallicRoughness.metallicRoughnessTexture !== undefined ) {

				pending.push( parser.assignTexture( materialParams, 'metalnessMap', metallicRoughness.metallicRoughnessTexture ) );
				pending.push( parser.assignTexture( materialParams, 'roughnessMap', metallicRoughness.metallicRoughnessTexture ) );

			}

			materialType = this._invokeOne( function ( ext ) {

				return ext.getMaterialType && ext.getMaterialType( materialIndex );

			} );

			pending.push( Promise.all( this._invokeAll( function ( ext ) {

				return ext.extendMaterialParams && ext.extendMaterialParams( materialIndex, materialParams );

			} ) ) );

		}

		if ( materialDef.doubleSided === true ) {

			materialParams.side = DoubleSide;

		}

		var alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE;

		if ( alphaMode === ALPHA_MODES.BLEND ) {

			materialParams.transparent = true;

			// See: https://github.com/mrdoob/three.js/issues/17706
			materialParams.depthWrite = false;

		} else {

			materialParams.transparent = false;

			if ( alphaMode === ALPHA_MODES.MASK ) {

				materialParams.alphaTest = materialDef.alphaCutoff !== undefined ? materialDef.alphaCutoff : 0.5;

			}

		}

		if ( materialDef.normalTexture !== undefined && materialType !== MeshBasicMaterial ) {

			pending.push( parser.assignTexture( materialParams, 'normalMap', materialDef.normalTexture ) );

			// https://github.com/mrdoob/three.js/issues/11438#issuecomment-507003995
			materialParams.normalScale = new Vector2( 1, - 1 );

			if ( materialDef.normalTexture.scale !== undefined ) {

				materialParams.normalScale.set( materialDef.normalTexture.scale, - materialDef.normalTexture.scale );

			}

		}

		if ( materialDef.occlusionTexture !== undefined && materialType !== MeshBasicMaterial ) {

			pending.push( parser.assignTexture( materialParams, 'aoMap', materialDef.occlusionTexture ) );

			if ( materialDef.occlusionTexture.strength !== undefined ) {

				materialParams.aoMapIntensity = materialDef.occlusionTexture.strength;

			}

		}

		if ( materialDef.emissiveFactor !== undefined && materialType !== MeshBasicMaterial ) {

			materialParams.emissive = new Color().fromArray( materialDef.emissiveFactor );

		}

		if ( materialDef.emissiveTexture !== undefined && materialType !== MeshBasicMaterial ) {

			pending.push( parser.assignTexture( materialParams, 'emissiveMap', materialDef.emissiveTexture ) );

		}

		return Promise.all( pending ).then( function () {

			var material;

			if ( materialType === GLTFMeshStandardSGMaterial ) {

				material = extensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ].createMaterial( materialParams );

			} else {

				material = new materialType( materialParams );

			}

			if ( materialDef.name ) material.name = materialDef.name;

			// baseColorTexture, emissiveTexture, and specularGlossinessTexture use sRGB encoding.
			if ( material.map ) material.map.encoding = sRGBEncoding;
			if ( material.emissiveMap ) material.emissiveMap.encoding = sRGBEncoding;

			assignExtrasToUserData( material, materialDef );

			parser.associations.set( material, { type: 'materials', index: materialIndex } );

			if ( materialDef.extensions ) addUnknownExtensionsToUserData( extensions, material, materialDef );

			return material;

		} );

	};

	/** When Object3D instances are targeted by animation, they need unique names. */
	GLTFParser.prototype.createUniqueName = function ( originalName ) {

		var sanitizedName = PropertyBinding.sanitizeNodeName( originalName || '' );

		var name = sanitizedName;

		for ( var i = 1; this.nodeNamesUsed[ name ]; ++ i ) {

			name = sanitizedName + '_' + i;

		}

		this.nodeNamesUsed[ name ] = true;

		return name;

	};

	/**
	 * @param {BufferGeometry} geometry
	 * @param {GLTF.Primitive} primitiveDef
	 * @param {GLTFParser} parser
	 */
	function computeBounds( geometry, primitiveDef, parser ) {

		var attributes = primitiveDef.attributes;

		var box = new Box3();

		if ( attributes.POSITION !== undefined ) {

			var accessor = parser.json.accessors[ attributes.POSITION ];

			var min = accessor.min;
			var max = accessor.max;

			// glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

			if ( min !== undefined && max !== undefined ) {

				box.set(
					new Vector3( min[ 0 ], min[ 1 ], min[ 2 ] ),
					new Vector3( max[ 0 ], max[ 1 ], max[ 2 ] ) );

			} else {

				console.warn( 'THREE.GLTFLoader: Missing min/max properties for accessor POSITION.' );

				return;

			}

		} else {

			return;

		}

		var targets = primitiveDef.targets;

		if ( targets !== undefined ) {

			var maxDisplacement = new Vector3();
			var vector = new Vector3();

			for ( var i = 0, il = targets.length; i < il; i ++ ) {

				var target = targets[ i ];

				if ( target.POSITION !== undefined ) {

					var accessor = parser.json.accessors[ target.POSITION ];
					var min = accessor.min;
					var max = accessor.max;

					// glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

					if ( min !== undefined && max !== undefined ) {

						// we need to get max of absolute components because target weight is [-1,1]
						vector.setX( Math.max( Math.abs( min[ 0 ] ), Math.abs( max[ 0 ] ) ) );
						vector.setY( Math.max( Math.abs( min[ 1 ] ), Math.abs( max[ 1 ] ) ) );
						vector.setZ( Math.max( Math.abs( min[ 2 ] ), Math.abs( max[ 2 ] ) ) );

						// Note: this assumes that the sum of all weights is at most 1. This isn't quite correct - it's more conservative
						// to assume that each target can have a max weight of 1. However, for some use cases - notably, when morph targets
						// are used to implement key-frame animations and as such only two are active at a time - this results in very large
						// boxes. So for now we make a box that's sometimes a touch too small but is hopefully mostly of reasonable size.
						maxDisplacement.max( vector );

					} else {

						console.warn( 'THREE.GLTFLoader: Missing min/max properties for accessor POSITION.' );

					}

				}

			}

			// As per comment above this box isn't conservative, but has a reasonable size for a very large number of morph targets.
			box.expandByVector( maxDisplacement );

		}

		geometry.boundingBox = box;

		var sphere = new Sphere();

		box.getCenter( sphere.center );
		sphere.radius = box.min.distanceTo( box.max ) / 2;

		geometry.boundingSphere = sphere;

	}

	/**
	 * @param {BufferGeometry} geometry
	 * @param {GLTF.Primitive} primitiveDef
	 * @param {GLTFParser} parser
	 * @return {Promise<BufferGeometry>}
	 */
	function addPrimitiveAttributes( geometry, primitiveDef, parser ) {

		var attributes = primitiveDef.attributes;

		var pending = [];

		function assignAttributeAccessor( accessorIndex, attributeName ) {

			return parser.getDependency( 'accessor', accessorIndex )
				.then( function ( accessor ) {

					geometry.setAttribute( attributeName, accessor );

				} );

		}

		for ( var gltfAttributeName in attributes ) {

			var threeAttributeName = ATTRIBUTES[ gltfAttributeName ] || gltfAttributeName.toLowerCase();

			// Skip attributes already provided by e.g. Draco extension.
			if ( threeAttributeName in geometry.attributes ) continue;

			pending.push( assignAttributeAccessor( attributes[ gltfAttributeName ], threeAttributeName ) );

		}

		if ( primitiveDef.indices !== undefined && ! geometry.index ) {

			var accessor = parser.getDependency( 'accessor', primitiveDef.indices ).then( function ( accessor ) {

				geometry.setIndex( accessor );

			} );

			pending.push( accessor );

		}

		assignExtrasToUserData( geometry, primitiveDef );

		computeBounds( geometry, primitiveDef, parser );

		return Promise.all( pending ).then( function () {

			return primitiveDef.targets !== undefined
				? addMorphTargets( geometry, primitiveDef.targets, parser )
				: geometry;

		} );

	}

	/**
	 * @param {BufferGeometry} geometry
	 * @param {Number} drawMode
	 * @return {BufferGeometry}
	 */
	function toTrianglesDrawMode( geometry, drawMode ) {

		var index = geometry.getIndex();

		// generate index if not present

		if ( index === null ) {

			var indices = [];

			var position = geometry.getAttribute( 'position' );

			if ( position !== undefined ) {

				for ( var i = 0; i < position.count; i ++ ) {

					indices.push( i );

				}

				geometry.setIndex( indices );
				index = geometry.getIndex();

			} else {

				console.error( 'THREE.GLTFLoader.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.' );
				return geometry;

			}

		}

		//

		var numberOfTriangles = index.count - 2;
		var newIndices = [];

		if ( drawMode === TriangleFanDrawMode ) {

			// gl.TRIANGLE_FAN

			for ( var i = 1; i <= numberOfTriangles; i ++ ) {

				newIndices.push( index.getX( 0 ) );
				newIndices.push( index.getX( i ) );
				newIndices.push( index.getX( i + 1 ) );

			}

		} else {

			// gl.TRIANGLE_STRIP

			for ( var i = 0; i < numberOfTriangles; i ++ ) {

				if ( i % 2 === 0 ) {

					newIndices.push( index.getX( i ) );
					newIndices.push( index.getX( i + 1 ) );
					newIndices.push( index.getX( i + 2 ) );


				} else {

					newIndices.push( index.getX( i + 2 ) );
					newIndices.push( index.getX( i + 1 ) );
					newIndices.push( index.getX( i ) );

				}

			}

		}

		if ( ( newIndices.length / 3 ) !== numberOfTriangles ) {

			console.error( 'THREE.GLTFLoader.toTrianglesDrawMode(): Unable to generate correct amount of triangles.' );

		}

		// build final geometry

		var newGeometry = geometry.clone();
		newGeometry.setIndex( newIndices );

		return newGeometry;

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#geometry
	 *
	 * Creates BufferGeometries from primitives.
	 *
	 * @param {Array<GLTF.Primitive>} primitives
	 * @return {Promise<Array<BufferGeometry>>}
	 */
	GLTFParser.prototype.loadGeometries = function ( primitives ) {

		var parser = this;
		var extensions = this.extensions;
		var cache = this.primitiveCache;

		function createDracoPrimitive( primitive ) {

			return extensions[ EXTENSIONS.KHR_DRACO_MESH_COMPRESSION ]
				.decodePrimitive( primitive, parser )
				.then( function ( geometry ) {

					return addPrimitiveAttributes( geometry, primitive, parser );

				} );

		}

		var pending = [];

		for ( var i = 0, il = primitives.length; i < il; i ++ ) {

			var primitive = primitives[ i ];
			var cacheKey = createPrimitiveKey( primitive );

			// See if we've already created this geometry
			var cached = cache[ cacheKey ];

			if ( cached ) {

				// Use the cached geometry if it exists
				pending.push( cached.promise );

			} else {

				var geometryPromise;

				if ( primitive.extensions && primitive.extensions[ EXTENSIONS.KHR_DRACO_MESH_COMPRESSION ] ) {

					// Use DRACO geometry if available
					geometryPromise = createDracoPrimitive( primitive );

				} else {

					// Otherwise create a new geometry
					geometryPromise = addPrimitiveAttributes( new BufferGeometry(), primitive, parser );

				}

				// Cache this geometry
				cache[ cacheKey ] = { primitive: primitive, promise: geometryPromise };

				pending.push( geometryPromise );

			}

		}

		return Promise.all( pending );

	};

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#meshes
	 * @param {number} meshIndex
	 * @return {Promise<Group|Mesh|SkinnedMesh>}
	 */
	GLTFParser.prototype.loadMesh = function ( meshIndex ) {

		var parser = this;
		var json = this.json;
		var extensions = this.extensions;

		var meshDef = json.meshes[ meshIndex ];
		var primitives = meshDef.primitives;

		var pending = [];

		for ( var i = 0, il = primitives.length; i < il; i ++ ) {

			var material = primitives[ i ].material === undefined
				? createDefaultMaterial( this.cache )
				: this.getDependency( 'material', primitives[ i ].material );

			pending.push( material );

		}

		pending.push( parser.loadGeometries( primitives ) );

		return Promise.all( pending ).then( function ( results ) {

			var materials = results.slice( 0, results.length - 1 );
			var geometries = results[ results.length - 1 ];

			var meshes = [];

			for ( var i = 0, il = geometries.length; i < il; i ++ ) {

				var geometry = geometries[ i ];
				var primitive = primitives[ i ];

				// 1. create Mesh

				var mesh;

				var material = materials[ i ];

				if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLES ||
					primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP ||
					primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN ||
					primitive.mode === undefined ) {

					// .isSkinnedMesh isn't in glTF spec. See ._markDefs()
					mesh = meshDef.isSkinnedMesh === true
						? new SkinnedMesh( geometry, material )
						: new Mesh( geometry, material );

					if ( mesh.isSkinnedMesh === true && ! mesh.geometry.attributes.skinWeight.normalized ) {

						// we normalize floating point skin weight array to fix malformed assets (see #15319)
						// it's important to skip this for non-float32 data since normalizeSkinWeights assumes non-normalized inputs
						mesh.normalizeSkinWeights();

					}

					if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP ) {

						mesh.geometry = toTrianglesDrawMode( mesh.geometry, TriangleStripDrawMode );

					} else if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN ) {

						mesh.geometry = toTrianglesDrawMode( mesh.geometry, TriangleFanDrawMode );

					}

				} else if ( primitive.mode === WEBGL_CONSTANTS.LINES ) {

					mesh = new LineSegments( geometry, material );

				} else if ( primitive.mode === WEBGL_CONSTANTS.LINE_STRIP ) {

					mesh = new Line( geometry, material );

				} else if ( primitive.mode === WEBGL_CONSTANTS.LINE_LOOP ) {

					mesh = new LineLoop( geometry, material );

				} else if ( primitive.mode === WEBGL_CONSTANTS.POINTS ) {

					mesh = new Points( geometry, material );

				} else {

					throw new Error( 'THREE.GLTFLoader: Primitive mode unsupported: ' + primitive.mode );

				}

				if ( Object.keys( mesh.geometry.morphAttributes ).length > 0 ) {

					updateMorphTargets( mesh, meshDef );

				}

				mesh.name = parser.createUniqueName( meshDef.name || ( 'mesh_' + meshIndex ) );

				assignExtrasToUserData( mesh, meshDef );

				if ( primitive.extensions ) addUnknownExtensionsToUserData( extensions, mesh, primitive );

				parser.assignFinalMaterial( mesh );

				meshes.push( mesh );

			}

			if ( meshes.length === 1 ) {

				return meshes[ 0 ];

			}

			var group = new Group();

			for ( var i = 0, il = meshes.length; i < il; i ++ ) {

				group.add( meshes[ i ] );

			}

			return group;

		} );

	};

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#cameras
	 * @param {number} cameraIndex
	 * @return {Promise<THREE.Camera>}
	 */
	GLTFParser.prototype.loadCamera = function ( cameraIndex ) {

		var camera;
		var cameraDef = this.json.cameras[ cameraIndex ];
		var params = cameraDef[ cameraDef.type ];

		if ( ! params ) {

			console.warn( 'THREE.GLTFLoader: Missing camera parameters.' );
			return;

		}

		if ( cameraDef.type === 'perspective' ) {

			camera = new PerspectiveCamera( MathUtils.radToDeg( params.yfov ), params.aspectRatio || 1, params.znear || 1, params.zfar || 2e6 );

		} else if ( cameraDef.type === 'orthographic' ) {

			camera = new OrthographicCamera( - params.xmag, params.xmag, params.ymag, - params.ymag, params.znear, params.zfar );

		}

		if ( cameraDef.name ) camera.name = this.createUniqueName( cameraDef.name );

		assignExtrasToUserData( camera, cameraDef );

		return Promise.resolve( camera );

	};

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#skins
	 * @param {number} skinIndex
	 * @return {Promise<Object>}
	 */
	GLTFParser.prototype.loadSkin = function ( skinIndex ) {

		var skinDef = this.json.skins[ skinIndex ];

		var skinEntry = { joints: skinDef.joints };

		if ( skinDef.inverseBindMatrices === undefined ) {

			return Promise.resolve( skinEntry );

		}

		return this.getDependency( 'accessor', skinDef.inverseBindMatrices ).then( function ( accessor ) {

			skinEntry.inverseBindMatrices = accessor;

			return skinEntry;

		} );

	};

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#animations
	 * @param {number} animationIndex
	 * @return {Promise<AnimationClip>}
	 */
	GLTFParser.prototype.loadAnimation = function ( animationIndex ) {

		var json = this.json;

		var animationDef = json.animations[ animationIndex ];

		var pendingNodes = [];
		var pendingInputAccessors = [];
		var pendingOutputAccessors = [];
		var pendingSamplers = [];
		var pendingTargets = [];

		for ( var i = 0, il = animationDef.channels.length; i < il; i ++ ) {

			var channel = animationDef.channels[ i ];
			var sampler = animationDef.samplers[ channel.sampler ];
			var target = channel.target;
			var name = target.node !== undefined ? target.node : target.id; // NOTE: target.id is deprecated.
			var input = animationDef.parameters !== undefined ? animationDef.parameters[ sampler.input ] : sampler.input;
			var output = animationDef.parameters !== undefined ? animationDef.parameters[ sampler.output ] : sampler.output;

			pendingNodes.push( this.getDependency( 'node', name ) );
			pendingInputAccessors.push( this.getDependency( 'accessor', input ) );
			pendingOutputAccessors.push( this.getDependency( 'accessor', output ) );
			pendingSamplers.push( sampler );
			pendingTargets.push( target );

		}

		return Promise.all( [

			Promise.all( pendingNodes ),
			Promise.all( pendingInputAccessors ),
			Promise.all( pendingOutputAccessors ),
			Promise.all( pendingSamplers ),
			Promise.all( pendingTargets )

		] ).then( function ( dependencies ) {

			var nodes = dependencies[ 0 ];
			var inputAccessors = dependencies[ 1 ];
			var outputAccessors = dependencies[ 2 ];
			var samplers = dependencies[ 3 ];
			var targets = dependencies[ 4 ];

			var tracks = [];

			for ( var i = 0, il = nodes.length; i < il; i ++ ) {

				var node = nodes[ i ];
				var inputAccessor = inputAccessors[ i ];
				var outputAccessor = outputAccessors[ i ];
				var sampler = samplers[ i ];
				var target = targets[ i ];

				if ( node === undefined ) continue;

				node.updateMatrix();
				node.matrixAutoUpdate = true;

				var TypedKeyframeTrack;

				switch ( PATH_PROPERTIES[ target.path ] ) {

					case PATH_PROPERTIES.weights:

						TypedKeyframeTrack = NumberKeyframeTrack;
						break;

					case PATH_PROPERTIES.rotation:

						TypedKeyframeTrack = QuaternionKeyframeTrack;
						break;

					case PATH_PROPERTIES.position:
					case PATH_PROPERTIES.scale:
					default:

						TypedKeyframeTrack = VectorKeyframeTrack;
						break;

				}

				var targetName = node.name ? node.name : node.uuid;

				var interpolation = sampler.interpolation !== undefined ? INTERPOLATION[ sampler.interpolation ] : InterpolateLinear;

				var targetNames = [];

				if ( PATH_PROPERTIES[ target.path ] === PATH_PROPERTIES.weights ) {

					// Node may be a Group (glTF mesh with several primitives) or a Mesh.
					node.traverse( function ( object ) {

						if ( object.isMesh === true && object.morphTargetInfluences ) {

							targetNames.push( object.name ? object.name : object.uuid );

						}

					} );

				} else {

					targetNames.push( targetName );

				}

				var outputArray = outputAccessor.array;

				if ( outputAccessor.normalized ) {

					var scale;

					if ( outputArray.constructor === Int8Array ) {

						scale = 1 / 127;

					} else if ( outputArray.constructor === Uint8Array ) {

						scale = 1 / 255;

					} else if ( outputArray.constructor == Int16Array ) {

						scale = 1 / 32767;

					} else if ( outputArray.constructor === Uint16Array ) {

						scale = 1 / 65535;

					} else {

						throw new Error( 'THREE.GLTFLoader: Unsupported output accessor component type.' );

					}

					var scaled = new Float32Array( outputArray.length );

					for ( var j = 0, jl = outputArray.length; j < jl; j ++ ) {

						scaled[ j ] = outputArray[ j ] * scale;

					}

					outputArray = scaled;

				}

				for ( var j = 0, jl = targetNames.length; j < jl; j ++ ) {

					var track = new TypedKeyframeTrack(
						targetNames[ j ] + '.' + PATH_PROPERTIES[ target.path ],
						inputAccessor.array,
						outputArray,
						interpolation
					);

					// Override interpolation with custom factory method.
					if ( sampler.interpolation === 'CUBICSPLINE' ) {

						track.createInterpolant = function InterpolantFactoryMethodGLTFCubicSpline( result ) {

							// A CUBICSPLINE keyframe in glTF has three output values for each input value,
							// representing inTangent, splineVertex, and outTangent. As a result, track.getValueSize()
							// must be divided by three to get the interpolant's sampleSize argument.

							return new GLTFCubicSplineInterpolant( this.times, this.values, this.getValueSize() / 3, result );

						};

						// Mark as CUBICSPLINE. `track.getInterpolation()` doesn't support custom interpolants.
						track.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = true;

					}

					tracks.push( track );

				}

			}

			var name = animationDef.name ? animationDef.name : 'animation_' + animationIndex;

			return new AnimationClip( name, undefined, tracks );

		} );

	};

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#nodes-and-hierarchy
	 * @param {number} nodeIndex
	 * @return {Promise<Object3D>}
	 */
	GLTFParser.prototype.loadNode = function ( nodeIndex ) {

		var json = this.json;
		var extensions = this.extensions;
		var parser = this;

		var nodeDef = json.nodes[ nodeIndex ];

		// reserve node's name before its dependencies, so the root has the intended name.
		var nodeName = nodeDef.name ? parser.createUniqueName( nodeDef.name ) : '';

		return ( function () {

			var pending = [];

			if ( nodeDef.mesh !== undefined ) {

				pending.push( parser.getDependency( 'mesh', nodeDef.mesh ).then( function ( mesh ) {

					var node = parser._getNodeRef( parser.meshCache, nodeDef.mesh, mesh );

					// if weights are provided on the node, override weights on the mesh.
					if ( nodeDef.weights !== undefined ) {

						node.traverse( function ( o ) {

							if ( ! o.isMesh ) return;

							for ( var i = 0, il = nodeDef.weights.length; i < il; i ++ ) {

								o.morphTargetInfluences[ i ] = nodeDef.weights[ i ];

							}

						} );

					}

					return node;

				} ) );

			}

			if ( nodeDef.camera !== undefined ) {

				pending.push( parser.getDependency( 'camera', nodeDef.camera ).then( function ( camera ) {

					return parser._getNodeRef( parser.cameraCache, nodeDef.camera, camera );

				} ) );

			}

			parser._invokeAll( function ( ext ) {

				return ext.createNodeAttachment && ext.createNodeAttachment( nodeIndex );

			} ).forEach( function ( promise ) {

				pending.push( promise );

			} );

			return Promise.all( pending );

		}() ).then( function ( objects ) {

			var node;

			// .isBone isn't in glTF spec. See ._markDefs
			if ( nodeDef.isBone === true ) {

				node = new Bone();

			} else if ( objects.length > 1 ) {

				node = new Group();

			} else if ( objects.length === 1 ) {

				node = objects[ 0 ];

			} else {

				node = new Object3D();

			}

			if ( node !== objects[ 0 ] ) {

				for ( var i = 0, il = objects.length; i < il; i ++ ) {

					node.add( objects[ i ] );

				}

			}

			if ( nodeDef.name ) {

				node.userData.name = nodeDef.name;
				node.name = nodeName;

			}

			assignExtrasToUserData( node, nodeDef );

			if ( nodeDef.extensions ) addUnknownExtensionsToUserData( extensions, node, nodeDef );

			if ( nodeDef.matrix !== undefined ) {

				var matrix = new Matrix4();
				matrix.fromArray( nodeDef.matrix );
				node.applyMatrix4( matrix );

			} else {

				if ( nodeDef.translation !== undefined ) {

					node.position.fromArray( nodeDef.translation );

				}

				if ( nodeDef.rotation !== undefined ) {

					node.quaternion.fromArray( nodeDef.rotation );

				}

				if ( nodeDef.scale !== undefined ) {

					node.scale.fromArray( nodeDef.scale );

				}

			}

			parser.associations.set( node, { type: 'nodes', index: nodeIndex } );

			return node;

		} );

	};

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#scenes
	 * @param {number} sceneIndex
	 * @return {Promise<Group>}
	 */
	GLTFParser.prototype.loadScene = function () {

		// scene node hierachy builder

		function buildNodeHierachy( nodeId, parentObject, json, parser ) {

			var nodeDef = json.nodes[ nodeId ];

			return parser.getDependency( 'node', nodeId ).then( function ( node ) {

				if ( nodeDef.skin === undefined ) return node;

				// build skeleton here as well

				var skinEntry;

				return parser.getDependency( 'skin', nodeDef.skin ).then( function ( skin ) {

					skinEntry = skin;

					var pendingJoints = [];

					for ( var i = 0, il = skinEntry.joints.length; i < il; i ++ ) {

						pendingJoints.push( parser.getDependency( 'node', skinEntry.joints[ i ] ) );

					}

					return Promise.all( pendingJoints );

				} ).then( function ( jointNodes ) {

					node.traverse( function ( mesh ) {

						if ( ! mesh.isMesh ) return;

						var bones = [];
						var boneInverses = [];

						for ( var j = 0, jl = jointNodes.length; j < jl; j ++ ) {

							var jointNode = jointNodes[ j ];

							if ( jointNode ) {

								bones.push( jointNode );

								var mat = new Matrix4();

								if ( skinEntry.inverseBindMatrices !== undefined ) {

									mat.fromArray( skinEntry.inverseBindMatrices.array, j * 16 );

								}

								boneInverses.push( mat );

							} else {

								console.warn( 'THREE.GLTFLoader: Joint "%s" could not be found.', skinEntry.joints[ j ] );

							}

						}

						mesh.bind( new Skeleton( bones, boneInverses ), mesh.matrixWorld );

					} );

					return node;

				} );

			} ).then( function ( node ) {

				// build node hierachy

				parentObject.add( node );

				var pending = [];

				if ( nodeDef.children ) {

					var children = nodeDef.children;

					for ( var i = 0, il = children.length; i < il; i ++ ) {

						var child = children[ i ];
						pending.push( buildNodeHierachy( child, node, json, parser ) );

					}

				}

				return Promise.all( pending );

			} );

		}

		return function loadScene( sceneIndex ) {

			var json = this.json;
			var extensions = this.extensions;
			var sceneDef = this.json.scenes[ sceneIndex ];
			var parser = this;

			// Loader returns Group, not Scene.
			// See: https://github.com/mrdoob/three.js/issues/18342#issuecomment-578981172
			var scene = new Group();
			if ( sceneDef.name ) scene.name = parser.createUniqueName( sceneDef.name );

			assignExtrasToUserData( scene, sceneDef );

			if ( sceneDef.extensions ) addUnknownExtensionsToUserData( extensions, scene, sceneDef );

			var nodeIds = sceneDef.nodes || [];

			var pending = [];

			for ( var i = 0, il = nodeIds.length; i < il; i ++ ) {

				pending.push( buildNodeHierachy( nodeIds[ i ], scene, json, parser ) );

			}

			return Promise.all( pending ).then( function () {

				return scene;

			} );

		};

	}();

	return GLTFLoader;

} )();

// This file is part of meshoptimizer library and is distributed under the terms of MIT License.
// Copyright (C) 2016-2020, by Arseny Kapoulkine (arseny.kapoulkine@gmail.com)
var MeshoptDecoder = (function() {

	// Built with clang version 11.0.0 (https://github.com/llvm/llvm-project.git 0160ad802e899c2922bc9b29564080c22eb0908c)
	// Built from meshoptimizer 0.15
	var wasm_base = "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";
	var wasm_simd = "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";

	// Uses bulk-memory and simd extensions
	var detector = new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,3,2,0,0,5,3,1,0,1,12,1,0,10,22,2,12,0,65,0,65,0,65,0,252,10,0,0,11,7,0,65,0,253,15,26,11]);

	// Used to unpack wasm
	var wasmpack = new Uint8Array([32,0,65,253,3,1,2,34,4,106,6,5,11,8,7,20,13,33,12,16,128,9,116,64,19,113,127,15,10,21,22,14,255,66,24,54,136,107,18,23,192,26,114,118,132,17,77,101,130,144,27,87,131,44,45,74,156,154,70,167]);

	if (typeof WebAssembly !== 'object') {
		// This module requires WebAssembly to function
		return {
			supported: false,
		};
	}

	var wasm = wasm_base;

	if (WebAssembly.validate(detector)) {
		wasm = wasm_simd;
		console.log("Warning: meshopt_decoder is using experimental SIMD support");
	}

	var instance;

	var promise =
		WebAssembly.instantiate(unpack(wasm), {})
		.then(function(result) {
			instance = result.instance;
			instance.exports.__wasm_call_ctors();
		});

	function unpack(data) {
		var result = new Uint8Array(data.length);
		for (var i = 0; i < data.length; ++i) {
			var ch = data.charCodeAt(i);
			result[i] = ch > 96 ? ch - 71 : ch > 64 ? ch - 65 : ch > 47 ? ch + 4 : ch > 46 ? 63 : 62;
		}
		var write = 0;
		for (var i = 0; i < data.length; ++i) {
			result[write++] = (result[i] < 60) ? wasmpack[result[i]] : (result[i] - 60) * 64 + result[++i];
		}
		return result.buffer.slice(0, write);
	}

	function decode(fun, target, count, size, source, filter) {
		var sbrk = instance.exports.sbrk;
		var count4 = (count + 3) & ~3; // pad for SIMD filter
		var tp = sbrk(count4 * size);
		var sp = sbrk(source.length);
		var heap = new Uint8Array(instance.exports.memory.buffer);
		heap.set(source, sp);
		var res = fun(tp, count, size, sp, source.length);
		if (res == 0 && filter) {
			filter(tp, count4, size);
		}
		target.set(heap.subarray(tp, tp + count * size));
		sbrk(tp - sbrk(0));
		if (res != 0) {
			throw new Error("Malformed buffer data: " + res);
		}
	}
	var filters = {
		// legacy index-based enums for glTF
		0: "",
		1: "meshopt_decodeFilterOct",
		2: "meshopt_decodeFilterQuat",
		3: "meshopt_decodeFilterExp",
		// string-based enums for glTF
		NONE: "",
		OCTAHEDRAL: "meshopt_decodeFilterOct",
		QUATERNION: "meshopt_decodeFilterQuat",
		EXPONENTIAL: "meshopt_decodeFilterExp",
	};

	var decoders = {
		// legacy index-based enums for glTF
		0: "meshopt_decodeVertexBuffer",
		1: "meshopt_decodeIndexBuffer",
		2: "meshopt_decodeIndexSequence",
		// string-based enums for glTF
		ATTRIBUTES: "meshopt_decodeVertexBuffer",
		TRIANGLES: "meshopt_decodeIndexBuffer",
		INDICES: "meshopt_decodeIndexSequence",
	};

	return {
		ready: promise,
		supported: true,
		decodeVertexBuffer: function(target, count, size, source, filter) {
			decode(instance.exports.meshopt_decodeVertexBuffer, target, count, size, source, instance.exports[filters[filter]]);
		},
		decodeIndexBuffer: function(target, count, size, source) {
			decode(instance.exports.meshopt_decodeIndexBuffer, target, count, size, source);
		},
		decodeIndexSequence: function(target, count, size, source) {
			decode(instance.exports.meshopt_decodeIndexSequence, target, count, size, source);
		},
		decodeGltfBuffer: function(target, count, size, source, mode, filter) {
			decode(instance.exports[decoders[mode]], target, count, size, source, instance.exports[filters[filter]]);
		}
	};
})();

function cloneSkeletonMesh(source, recursive = false) {
    var sourceLookup = new Map();
    var cloneLookup = new Map();
    var clone = source.clone(recursive);
    parallelTraverse(source, clone, function (sourceNode, clonedNode) {
        sourceLookup.set(clonedNode, sourceNode);
        cloneLookup.set(sourceNode, clonedNode);
    });
    clone.traverse(function (node) {
        if (!node.isSkinnedMesh) {
            return;
        }
        var clonedMesh = node;
        var sourceMesh = sourceLookup.get(node);
        var sourceBones = sourceMesh.skeleton.bones;
        clonedMesh.skeleton = sourceMesh.skeleton.clone();
        clonedMesh.bindMatrix.copy(sourceMesh.bindMatrix);
        clonedMesh.skeleton.bones = sourceBones.map(function (bone) {
            return cloneLookup.get(bone);
        });
        clonedMesh.bind(clonedMesh.skeleton, clonedMesh.bindMatrix);
    });
    return clone;
}
function parallelTraverse(a, b, callback) {
    callback(a, b);
    for (let i = 0; i < a.children.length; i++) {
        parallelTraverse(a.children[i], b.children[i], callback);
    }
}

function addChunkToScene(krono, name, gltf) {
    const { assets, config, scene } = krono;
    let chunk = assets.chunks[name] = gltf;
    let data = config.chunks.filter(c => c.path === name)[0];
    if (chunk === undefined) {
        console.error(`Не найден файл чанк-объекта с path ${data.path}`);
        return;
    }
    let parent;
    if (data.partial) {
        parent = chunk.scene.getObjectByName(data.parent);
    }
    else {
        parent = chunk.scene;
    }
    if (!parent) {
        console.error(`В файле ${data.path} не найден чанк-объект с именем ${data.parent}`);
        return;
    }
    let mesh = cloneSkeletonMesh(parent, true);
    if (data.name) {
        mesh.name = data.name;
    }
    if (data.visible !== undefined) {
        mesh.visible = data.visible;
    }
    if (data.position) {
        mesh.position.x = data.position.x;
        mesh.position.y = data.position.y;
        mesh.position.z = data.position.z;
    }
    if (data.scale) {
        mesh.scale.x = data.scale.x;
        mesh.scale.y = data.scale.y;
        mesh.scale.z = data.scale.z;
    }
    if (data.rotation) {
        mesh.rotation.x = data.rotation.x;
        mesh.rotation.y = data.rotation.y;
        mesh.rotation.z = data.rotation.z;
    }
    if (data.quaternion) {
        mesh.quaternion.x = data.quaternion.x;
        mesh.quaternion.y = data.quaternion.y;
        mesh.quaternion.z = data.quaternion.z;
        mesh.quaternion.w = data.quaternion.w;
    }
    initGLTFAnimations(krono, mesh, chunk.animations);
    chunk.animations.forEach(animation => {
        new SceneScrollUpdater(krono, mesh, [animation], animation.duration);
    });
    scene.add(mesh);
}

function initGLTFLoader(krono) {
    krono.gltfLoader = new GLTFLoader(krono.loadingManager);
    krono.gltfLoader.setMeshoptDecoder(MeshoptDecoder);
}
function loadGLTF(krono, path, onLoad) {
    if (krono.gltfLoader.ktx2Loader === null && krono.config.basisPath) {
        krono.gltfLoader.setKTX2Loader(krono.ktx2Loader);
    }
    if (krono.gltfLoader.dracoLoader === null && krono.config.dracoPath) {
        krono.gltfLoader.setDRACOLoader(krono.dracoLoader);
    }
    return new Promise((resolve, reject) => {
        krono.gltfLoader.load(path, (gltf) => {
            onLoad(gltf);
            resolve();
        }, null, (reason) => {
            const target = reason.target;
            if (target && target.status === 404) {
                console.error(`404: ${target.responseURL} не найден`);
                resolve();
            }
            else {
                console.error(reason);
                reject();
            }
        });
    });
}
function loadMainScene(krono) {
    return new Promise((resolve, reject) => {
        if (!krono.config.mainScenePath) {
            changeCamera(krono, krono.defaultCamera);
            resolve();
            return;
        }
        loadGLTF(krono, krono.config.mainScenePath, (gltf) => {
            if (krono.config.debug) {
                console.log(gltf);
            }
            initMainScene(krono, gltf);
            resolve();
        });
    });
}
function loadChunks(krono) {
    let uniquePaths = [...new Set(krono.config.chunks.map((s) => s.path))];
    return uniquePaths.map(path => {
        return loadGLTF(krono, path, (gltf) => {
            addChunkToScene(krono, path, gltf);
        });
    });
}

function initSMAALoader(krono) {
    krono.smaaImageLoader = new SMAAImageLoader(krono.loadingManager);
}
function loadSMAAImages(krono) {
    return new Promise((resolve, reject) => {
        if (!krono.config.smaaAntialias) {
            resolve();
            return;
        }
        krono.smaaImageLoader.load(([search, area]) => {
            krono.assets.smaa.search = search;
            krono.assets.smaa.area = area;
            resolve();
        }, reject);
    });
}

var DRACOLoader = function ( manager ) {

	Loader.call( this, manager );

	this.decoderPath = '';
	this.decoderConfig = {};
	this.decoderBinary = null;
	this.decoderPending = null;

	this.workerLimit = 4;
	this.workerPool = [];
	this.workerNextTaskID = 1;
	this.workerSourceURL = '';

	this.defaultAttributeIDs = {
		position: 'POSITION',
		normal: 'NORMAL',
		color: 'COLOR',
		uv: 'TEX_COORD'
	};
	this.defaultAttributeTypes = {
		position: 'Float32Array',
		normal: 'Float32Array',
		color: 'Float32Array',
		uv: 'Float32Array'
	};

};

DRACOLoader.prototype = Object.assign( Object.create( Loader.prototype ), {

	constructor: DRACOLoader,

	setDecoderPath: function ( path ) {

		this.decoderPath = path;

		return this;

	},

	setDecoderConfig: function ( config ) {

		this.decoderConfig = config;

		return this;

	},

	setWorkerLimit: function ( workerLimit ) {

		this.workerLimit = workerLimit;

		return this;

	},

	/** @deprecated */
	setVerbosity: function () {

		console.warn( 'THREE.DRACOLoader: The .setVerbosity() method has been removed.' );

	},

	/** @deprecated */
	setDrawMode: function () {

		console.warn( 'THREE.DRACOLoader: The .setDrawMode() method has been removed.' );

	},

	/** @deprecated */
	setSkipDequantization: function () {

		console.warn( 'THREE.DRACOLoader: The .setSkipDequantization() method has been removed.' );

	},

	load: function ( url, onLoad, onProgress, onError ) {

		var loader = new FileLoader( this.manager );

		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );

		loader.load( url, ( buffer ) => {

			var taskConfig = {
				attributeIDs: this.defaultAttributeIDs,
				attributeTypes: this.defaultAttributeTypes,
				useUniqueIDs: false
			};

			this.decodeGeometry( buffer, taskConfig )
				.then( onLoad )
				.catch( onError );

		}, onProgress, onError );

	},

	/** @deprecated Kept for backward-compatibility with previous DRACOLoader versions. */
	decodeDracoFile: function ( buffer, callback, attributeIDs, attributeTypes ) {

		var taskConfig = {
			attributeIDs: attributeIDs || this.defaultAttributeIDs,
			attributeTypes: attributeTypes || this.defaultAttributeTypes,
			useUniqueIDs: !! attributeIDs
		};

		this.decodeGeometry( buffer, taskConfig ).then( callback );

	},

	decodeGeometry: function ( buffer, taskConfig ) {

		// TODO: For backward-compatibility, support 'attributeTypes' objects containing
		// references (rather than names) to typed array constructors. These must be
		// serialized before sending them to the worker.
		for ( var attribute in taskConfig.attributeTypes ) {

			var type = taskConfig.attributeTypes[ attribute ];

			if ( type.BYTES_PER_ELEMENT !== undefined ) {

				taskConfig.attributeTypes[ attribute ] = type.name;

			}

		}

		//

		var taskKey = JSON.stringify( taskConfig );

		// Check for an existing task using this buffer. A transferred buffer cannot be transferred
		// again from this thread.
		if ( DRACOLoader.taskCache.has( buffer ) ) {

			var cachedTask = DRACOLoader.taskCache.get( buffer );

			if ( cachedTask.key === taskKey ) {

				return cachedTask.promise;

			} else if ( buffer.byteLength === 0 ) {

				// Technically, it would be possible to wait for the previous task to complete,
				// transfer the buffer back, and decode again with the second configuration. That
				// is complex, and I don't know of any reason to decode a Draco buffer twice in
				// different ways, so this is left unimplemented.
				throw new Error(

					'THREE.DRACOLoader: Unable to re-decode a buffer with different ' +
					'settings. Buffer has already been transferred.'

				);

			}

		}

		//

		var worker;
		var taskID = this.workerNextTaskID ++;
		var taskCost = buffer.byteLength;

		// Obtain a worker and assign a task, and construct a geometry instance
		// when the task completes.
		var geometryPending = this._getWorker( taskID, taskCost )
			.then( ( _worker ) => {

				worker = _worker;

				return new Promise( ( resolve, reject ) => {

					worker._callbacks[ taskID ] = { resolve, reject };

					worker.postMessage( { type: 'decode', id: taskID, taskConfig, buffer }, [ buffer ] );

					// this.debug();

				} );

			} )
			.then( ( message ) => this._createGeometry( message.geometry ) );

		// Remove task from the task list.
		// Note: replaced '.finally()' with '.catch().then()' block - iOS 11 support (#19416)
		geometryPending
			.catch( () => true )
			.then( () => {

				if ( worker && taskID ) {

					this._releaseTask( worker, taskID );

					// this.debug();

				}

			} );

		// Cache the task result.
		DRACOLoader.taskCache.set( buffer, {

			key: taskKey,
			promise: geometryPending

		} );

		return geometryPending;

	},

	_createGeometry: function ( geometryData ) {

		var geometry = new BufferGeometry();

		if ( geometryData.index ) {

			geometry.setIndex( new BufferAttribute( geometryData.index.array, 1 ) );

		}

		for ( var i = 0; i < geometryData.attributes.length; i ++ ) {

			var attribute = geometryData.attributes[ i ];
			var name = attribute.name;
			var array = attribute.array;
			var itemSize = attribute.itemSize;

			geometry.setAttribute( name, new BufferAttribute( array, itemSize ) );

		}

		return geometry;

	},

	_loadLibrary: function ( url, responseType ) {

		var loader = new FileLoader( this.manager );
		loader.setPath( this.decoderPath );
		loader.setResponseType( responseType );
		loader.setWithCredentials( this.withCredentials );

		return new Promise( ( resolve, reject ) => {

			loader.load( url, resolve, undefined, reject );

		} );

	},

	preload: function () {

		this._initDecoder();

		return this;

	},

	_initDecoder: function () {

		if ( this.decoderPending ) return this.decoderPending;

		var useJS = typeof WebAssembly !== 'object' || this.decoderConfig.type === 'js';
		var librariesPending = [];

		if ( useJS ) {

			librariesPending.push( this._loadLibrary( 'draco_decoder.js', 'text' ) );

		} else {

			librariesPending.push( this._loadLibrary( 'draco_wasm_wrapper.js', 'text' ) );
			librariesPending.push( this._loadLibrary( 'draco_decoder.wasm', 'arraybuffer' ) );

		}

		this.decoderPending = Promise.all( librariesPending )
			.then( ( libraries ) => {

				var jsContent = libraries[ 0 ];

				if ( ! useJS ) {

					this.decoderConfig.wasmBinary = libraries[ 1 ];

				}

				var fn = DRACOLoader.DRACOWorker.toString();

				var body = [
					'/* draco decoder */',
					jsContent,
					'',
					'/* worker */',
					fn.substring( fn.indexOf( '{' ) + 1, fn.lastIndexOf( '}' ) )
				].join( '\n' );

				this.workerSourceURL = URL.createObjectURL( new Blob( [ body ] ) );

			} );

		return this.decoderPending;

	},

	_getWorker: function ( taskID, taskCost ) {

		return this._initDecoder().then( () => {

			if ( this.workerPool.length < this.workerLimit ) {

				var worker = new Worker( this.workerSourceURL );

				worker._callbacks = {};
				worker._taskCosts = {};
				worker._taskLoad = 0;

				worker.postMessage( { type: 'init', decoderConfig: this.decoderConfig } );

				worker.onmessage = function ( e ) {

					var message = e.data;

					switch ( message.type ) {

						case 'decode':
							worker._callbacks[ message.id ].resolve( message );
							break;

						case 'error':
							worker._callbacks[ message.id ].reject( message );
							break;

						default:
							console.error( 'THREE.DRACOLoader: Unexpected message, "' + message.type + '"' );

					}

				};

				this.workerPool.push( worker );

			} else {

				this.workerPool.sort( function ( a, b ) {

					return a._taskLoad > b._taskLoad ? - 1 : 1;

				} );

			}

			var worker = this.workerPool[ this.workerPool.length - 1 ];
			worker._taskCosts[ taskID ] = taskCost;
			worker._taskLoad += taskCost;
			return worker;

		} );

	},

	_releaseTask: function ( worker, taskID ) {

		worker._taskLoad -= worker._taskCosts[ taskID ];
		delete worker._callbacks[ taskID ];
		delete worker._taskCosts[ taskID ];

	},

	debug: function () {

		console.log( 'Task load: ', this.workerPool.map( ( worker ) => worker._taskLoad ) );

	},

	dispose: function () {

		for ( var i = 0; i < this.workerPool.length; ++ i ) {

			this.workerPool[ i ].terminate();

		}

		this.workerPool.length = 0;

		return this;

	}

} );

/* WEB WORKER */

DRACOLoader.DRACOWorker = function () {

	var decoderConfig;
	var decoderPending;

	onmessage = function ( e ) {

		var message = e.data;

		switch ( message.type ) {

			case 'init':
				decoderConfig = message.decoderConfig;
				decoderPending = new Promise( function ( resolve/*, reject*/ ) {

					decoderConfig.onModuleLoaded = function ( draco ) {

						// Module is Promise-like. Wrap before resolving to avoid loop.
						resolve( { draco: draco } );

					};

					DracoDecoderModule( decoderConfig ); // eslint-disable-line no-undef

				} );
				break;

			case 'decode':
				var buffer = message.buffer;
				var taskConfig = message.taskConfig;
				decoderPending.then( ( module ) => {

					var draco = module.draco;
					var decoder = new draco.Decoder();
					var decoderBuffer = new draco.DecoderBuffer();
					decoderBuffer.Init( new Int8Array( buffer ), buffer.byteLength );

					try {

						var geometry = decodeGeometry( draco, decoder, decoderBuffer, taskConfig );

						var buffers = geometry.attributes.map( ( attr ) => attr.array.buffer );

						if ( geometry.index ) buffers.push( geometry.index.array.buffer );

						self.postMessage( { type: 'decode', id: message.id, geometry }, buffers );

					} catch ( error ) {

						console.error( error );

						self.postMessage( { type: 'error', id: message.id, error: error.message } );

					} finally {

						draco.destroy( decoderBuffer );
						draco.destroy( decoder );

					}

				} );
				break;

		}

	};

	function decodeGeometry( draco, decoder, decoderBuffer, taskConfig ) {

		var attributeIDs = taskConfig.attributeIDs;
		var attributeTypes = taskConfig.attributeTypes;

		var dracoGeometry;
		var decodingStatus;

		var geometryType = decoder.GetEncodedGeometryType( decoderBuffer );

		if ( geometryType === draco.TRIANGULAR_MESH ) {

			dracoGeometry = new draco.Mesh();
			decodingStatus = decoder.DecodeBufferToMesh( decoderBuffer, dracoGeometry );

		} else if ( geometryType === draco.POINT_CLOUD ) {

			dracoGeometry = new draco.PointCloud();
			decodingStatus = decoder.DecodeBufferToPointCloud( decoderBuffer, dracoGeometry );

		} else {

			throw new Error( 'THREE.DRACOLoader: Unexpected geometry type.' );

		}

		if ( ! decodingStatus.ok() || dracoGeometry.ptr === 0 ) {

			throw new Error( 'THREE.DRACOLoader: Decoding failed: ' + decodingStatus.error_msg() );

		}

		var geometry = { index: null, attributes: [] };

		// Gather all vertex attributes.
		for ( var attributeName in attributeIDs ) {

			var attributeType = self[ attributeTypes[ attributeName ] ];

			var attribute;
			var attributeID;

			// A Draco file may be created with default vertex attributes, whose attribute IDs
			// are mapped 1:1 from their semantic name (POSITION, NORMAL, ...). Alternatively,
			// a Draco file may contain a custom set of attributes, identified by known unique
			// IDs. glTF files always do the latter, and `.drc` files typically do the former.
			if ( taskConfig.useUniqueIDs ) {

				attributeID = attributeIDs[ attributeName ];
				attribute = decoder.GetAttributeByUniqueId( dracoGeometry, attributeID );

			} else {

				attributeID = decoder.GetAttributeId( dracoGeometry, draco[ attributeIDs[ attributeName ] ] );

				if ( attributeID === - 1 ) continue;

				attribute = decoder.GetAttribute( dracoGeometry, attributeID );

			}

			geometry.attributes.push( decodeAttribute( draco, decoder, dracoGeometry, attributeName, attributeType, attribute ) );

		}

		// Add index.
		if ( geometryType === draco.TRIANGULAR_MESH ) {

			geometry.index = decodeIndex( draco, decoder, dracoGeometry );

		}

		draco.destroy( dracoGeometry );

		return geometry;

	}

	function decodeIndex( draco, decoder, dracoGeometry ) {

		var numFaces = dracoGeometry.num_faces();
		var numIndices = numFaces * 3;
		var byteLength = numIndices * 4;

		var ptr = draco._malloc( byteLength );
		decoder.GetTrianglesUInt32Array( dracoGeometry, byteLength, ptr );
		var index = new Uint32Array( draco.HEAPF32.buffer, ptr, numIndices ).slice();
		draco._free( ptr );

		return { array: index, itemSize: 1 };

	}

	function decodeAttribute( draco, decoder, dracoGeometry, attributeName, attributeType, attribute ) {

		var numComponents = attribute.num_components();
		var numPoints = dracoGeometry.num_points();
		var numValues = numPoints * numComponents;
		var byteLength = numValues * attributeType.BYTES_PER_ELEMENT;
		var dataType = getDracoDataType( draco, attributeType );

		var ptr = draco._malloc( byteLength );
		decoder.GetAttributeDataArrayForAllPoints( dracoGeometry, attribute, dataType, byteLength, ptr );
		var array = new attributeType( draco.HEAPF32.buffer, ptr, numValues ).slice();
		draco._free( ptr );

		return {
			name: attributeName,
			array: array,
			itemSize: numComponents
		};

	}

	function getDracoDataType( draco, attributeType ) {

		switch ( attributeType ) {

			case Float32Array: return draco.DT_FLOAT32;
			case Int8Array: return draco.DT_INT8;
			case Int16Array: return draco.DT_INT16;
			case Int32Array: return draco.DT_INT32;
			case Uint8Array: return draco.DT_UINT8;
			case Uint16Array: return draco.DT_UINT16;
			case Uint32Array: return draco.DT_UINT32;

		}

	}

};

DRACOLoader.taskCache = new WeakMap();

/** Deprecated static methods */

/** @deprecated */
DRACOLoader.setDecoderPath = function () {

	console.warn( 'THREE.DRACOLoader: The .setDecoderPath() method has been removed. Use instance methods.' );

};

/** @deprecated */
DRACOLoader.setDecoderConfig = function () {

	console.warn( 'THREE.DRACOLoader: The .setDecoderConfig() method has been removed. Use instance methods.' );

};

/** @deprecated */
DRACOLoader.releaseDecoderModule = function () {

	console.warn( 'THREE.DRACOLoader: The .releaseDecoderModule() method has been removed. Use instance methods.' );

};

/** @deprecated */
DRACOLoader.getDecoderModule = function () {

	console.warn( 'THREE.DRACOLoader: The .getDecoderModule() method has been removed. Use instance methods.' );

};

function initDracoLoader(krono) {
    krono.dracoLoader = new DRACOLoader(krono.loadingManager);
    krono.dracoLoader.setDecoderPath(krono.config.dracoPath);
    krono.config._dracoPath = krono.config.dracoPath;
    Object.defineProperty(krono.config, 'dracoPath', {
        get() {
            return krono.config._dracoPath;
        },
        set(value) {
            krono.config._dracoPath = value;
            console.log(value);
            if (value) {
                krono.dracoLoader.setDecoderPath(value);
            }
        }
    });
}

/**
 * Loader for Basis Universal GPU Texture Codec.
 *
 * Basis Universal is a "supercompressed" GPU texture and texture video
 * compression system that outputs a highly compressed intermediate file format
 * (.basis) that can be quickly transcoded to a wide variety of GPU texture
 * compression formats.
 *
 * This loader parallelizes the transcoding process across a configurable number
 * of web workers, before transferring the transcoded compressed texture back
 * to the main thread.
 */
var BasisTextureLoader = function ( manager ) {

	Loader.call( this, manager );

	this.transcoderPath = '';
	this.transcoderBinary = null;
	this.transcoderPending = null;

	this.workerLimit = 4;
	this.workerPool = [];
	this.workerNextTaskID = 1;
	this.workerSourceURL = '';
	this.workerConfig = null;

};

BasisTextureLoader.taskCache = new WeakMap();

BasisTextureLoader.prototype = Object.assign( Object.create( Loader.prototype ), {

	constructor: BasisTextureLoader,

	setTranscoderPath: function ( path ) {

		this.transcoderPath = path;

		return this;

	},

	setWorkerLimit: function ( workerLimit ) {

		this.workerLimit = workerLimit;

		return this;

	},

	detectSupport: function ( renderer ) {

		this.workerConfig = {
			astcSupported: renderer.extensions.has( 'WEBGL_compressed_texture_astc' ),
			etc1Supported: renderer.extensions.has( 'WEBGL_compressed_texture_etc1' ),
			etc2Supported: renderer.extensions.has( 'WEBGL_compressed_texture_etc' ),
			dxtSupported: renderer.extensions.has( 'WEBGL_compressed_texture_s3tc' ),
			bptcSupported: renderer.extensions.has( 'EXT_texture_compression_bptc' ),
			pvrtcSupported: renderer.extensions.has( 'WEBGL_compressed_texture_pvrtc' )
				|| renderer.extensions.has( 'WEBKIT_WEBGL_compressed_texture_pvrtc' )
		};

		return this;

	},

	load: function ( url, onLoad, onProgress, onError ) {

		var loader = new FileLoader( this.manager );

		loader.setResponseType( 'arraybuffer' );
		loader.setWithCredentials( this.withCredentials );

		var texture = new CompressedTexture();

		loader.load( url, ( buffer ) => {

			// Check for an existing task using this buffer. A transferred buffer cannot be transferred
			// again from this thread.
			if ( BasisTextureLoader.taskCache.has( buffer ) ) {

				var cachedTask = BasisTextureLoader.taskCache.get( buffer );

				return cachedTask.promise.then( onLoad ).catch( onError );

			}

			this._createTexture( [ buffer ] )
				.then( function ( _texture ) {

					texture.copy( _texture );
					texture.needsUpdate = true;

					if ( onLoad ) onLoad( texture );

				} )
				.catch( onError );

		}, onProgress, onError );

		return texture;

	},

	/** Low-level transcoding API, exposed for use by KTX2Loader. */
	parseInternalAsync: function ( options ) {

		var { levels } = options;

		var buffers = new Set();

		for ( var i = 0; i < levels.length; i ++ ) {

			buffers.add( levels[ i ].data.buffer );

		}

		return this._createTexture( Array.from( buffers ), { ...options, lowLevel: true } );

	},

	/**
	 * @param {ArrayBuffer[]} buffers
	 * @param {object?} config
	 * @return {Promise<CompressedTexture>}
	 */
	_createTexture: function ( buffers, config ) {

		var worker;
		var taskID;

		var taskConfig = config || {};
		var taskCost = 0;

		for ( var i = 0; i < buffers.length; i ++ ) {

			taskCost += buffers[ i ].byteLength;

		}

		var texturePending = this._allocateWorker( taskCost )
			.then( ( _worker ) => {

				worker = _worker;
				taskID = this.workerNextTaskID ++;

				return new Promise( ( resolve, reject ) => {

					worker._callbacks[ taskID ] = { resolve, reject };

					worker.postMessage( { type: 'transcode', id: taskID, buffers: buffers, taskConfig: taskConfig }, buffers );

				} );

			} )
			.then( ( message ) => {

				var { mipmaps, width, height, format } = message;

				var texture = new CompressedTexture( mipmaps, width, height, format, UnsignedByteType );
				texture.minFilter = mipmaps.length === 1 ? LinearFilter : LinearMipmapLinearFilter;
				texture.magFilter = LinearFilter;
				texture.generateMipmaps = false;
				texture.needsUpdate = true;

				return texture;

			} );

		// Note: replaced '.finally()' with '.catch().then()' block - iOS 11 support (#19416)
		texturePending
			.catch( () => true )
			.then( () => {

				if ( worker && taskID ) {

					worker._taskLoad -= taskCost;
					delete worker._callbacks[ taskID ];

				}

			} );

		// Cache the task result.
		BasisTextureLoader.taskCache.set( buffers[ 0 ], { promise: texturePending } );

		return texturePending;

	},

	_initTranscoder: function () {

		if ( ! this.transcoderPending ) {

			// Load transcoder wrapper.
			var jsLoader = new FileLoader( this.manager );
			jsLoader.setPath( this.transcoderPath );
			jsLoader.setWithCredentials( this.withCredentials );
			var jsContent = new Promise( ( resolve, reject ) => {

				jsLoader.load( 'basis_transcoder.js', resolve, undefined, reject );

			} );

			// Load transcoder WASM binary.
			var binaryLoader = new FileLoader( this.manager );
			binaryLoader.setPath( this.transcoderPath );
			binaryLoader.setResponseType( 'arraybuffer' );
			binaryLoader.setWithCredentials( this.withCredentials );
			var binaryContent = new Promise( ( resolve, reject ) => {

				binaryLoader.load( 'basis_transcoder.wasm', resolve, undefined, reject );

			} );

			this.transcoderPending = Promise.all( [ jsContent, binaryContent ] )
				.then( ( [ jsContent, binaryContent ] ) => {

					var fn = BasisTextureLoader.BasisWorker.toString();

					var body = [
						'/* constants */',
						'var _EngineFormat = ' + JSON.stringify( BasisTextureLoader.EngineFormat ),
						'var _TranscoderFormat = ' + JSON.stringify( BasisTextureLoader.TranscoderFormat ),
						'var _BasisFormat = ' + JSON.stringify( BasisTextureLoader.BasisFormat ),
						'/* basis_transcoder.js */',
						jsContent,
						'/* worker */',
						fn.substring( fn.indexOf( '{' ) + 1, fn.lastIndexOf( '}' ) )
					].join( '\n' );

					this.workerSourceURL = URL.createObjectURL( new Blob( [ body ] ) );
					this.transcoderBinary = binaryContent;

				} );

		}

		return this.transcoderPending;

	},

	_allocateWorker: function ( taskCost ) {

		return this._initTranscoder().then( () => {

			if ( this.workerPool.length < this.workerLimit ) {

				var worker = new Worker( this.workerSourceURL );

				worker._callbacks = {};
				worker._taskLoad = 0;

				worker.postMessage( {
					type: 'init',
					config: this.workerConfig,
					transcoderBinary: this.transcoderBinary,
				} );

				worker.onmessage = function ( e ) {

					var message = e.data;

					switch ( message.type ) {

						case 'transcode':
							worker._callbacks[ message.id ].resolve( message );
							break;

						case 'error':
							worker._callbacks[ message.id ].reject( message );
							break;

						default:
							console.error( 'THREE.BasisTextureLoader: Unexpected message, "' + message.type + '"' );

					}

				};

				this.workerPool.push( worker );

			} else {

				this.workerPool.sort( function ( a, b ) {

					return a._taskLoad > b._taskLoad ? - 1 : 1;

				} );

			}

			var worker = this.workerPool[ this.workerPool.length - 1 ];

			worker._taskLoad += taskCost;

			return worker;

		} );

	},

	dispose: function () {

		for ( var i = 0; i < this.workerPool.length; i ++ ) {

			this.workerPool[ i ].terminate();

		}

		this.workerPool.length = 0;

		return this;

	}

} );

/* CONSTANTS */

BasisTextureLoader.BasisFormat = {
	ETC1S: 0,
	UASTC_4x4: 1,
};

BasisTextureLoader.TranscoderFormat = {
	ETC1: 0,
	ETC2: 1,
	BC1: 2,
	BC3: 3,
	BC4: 4,
	BC5: 5,
	BC7_M6_OPAQUE_ONLY: 6,
	BC7_M5: 7,
	PVRTC1_4_RGB: 8,
	PVRTC1_4_RGBA: 9,
	ASTC_4x4: 10,
	ATC_RGB: 11,
	ATC_RGBA_INTERPOLATED_ALPHA: 12,
	RGBA32: 13,
	RGB565: 14,
	BGR565: 15,
	RGBA4444: 16,
};

BasisTextureLoader.EngineFormat = {
	RGBAFormat: RGBAFormat,
	RGBA_ASTC_4x4_Format: RGBA_ASTC_4x4_Format,
	RGBA_BPTC_Format: RGBA_BPTC_Format,
	RGBA_ETC2_EAC_Format: RGBA_ETC2_EAC_Format,
	RGBA_PVRTC_4BPPV1_Format: RGBA_PVRTC_4BPPV1_Format,
	RGBA_S3TC_DXT5_Format: RGBA_S3TC_DXT5_Format,
	RGB_ETC1_Format: RGB_ETC1_Format,
	RGB_ETC2_Format: RGB_ETC2_Format,
	RGB_PVRTC_4BPPV1_Format: RGB_PVRTC_4BPPV1_Format,
	RGB_S3TC_DXT1_Format: RGB_S3TC_DXT1_Format,
};


/* WEB WORKER */

BasisTextureLoader.BasisWorker = function () {

	var config;
	var transcoderPending;
	var BasisModule;

	var EngineFormat = _EngineFormat; // eslint-disable-line no-undef
	var TranscoderFormat = _TranscoderFormat; // eslint-disable-line no-undef
	var BasisFormat = _BasisFormat; // eslint-disable-line no-undef

	onmessage = function ( e ) {

		var message = e.data;

		switch ( message.type ) {

			case 'init':
				config = message.config;
				init( message.transcoderBinary );
				break;

			case 'transcode':
				transcoderPending.then( () => {

					try {

						var { width, height, hasAlpha, mipmaps, format } = message.taskConfig.lowLevel
							? transcodeLowLevel( message.taskConfig )
							: transcode( message.buffers[ 0 ] );

						var buffers = [];

						for ( var i = 0; i < mipmaps.length; ++ i ) {

							buffers.push( mipmaps[ i ].data.buffer );

						}

						self.postMessage( { type: 'transcode', id: message.id, width, height, hasAlpha, mipmaps, format }, buffers );

					} catch ( error ) {

						console.error( error );

						self.postMessage( { type: 'error', id: message.id, error: error.message } );

					}

				} );
				break;

		}

	};

	function init( wasmBinary ) {

		transcoderPending = new Promise( ( resolve ) => {

			BasisModule = { wasmBinary, onRuntimeInitialized: resolve };
			BASIS( BasisModule ); // eslint-disable-line no-undef

		} ).then( () => {

			BasisModule.initializeBasis();

		} );

	}

	function transcodeLowLevel( taskConfig ) {

		var { basisFormat, width, height, hasAlpha } = taskConfig;

		var { transcoderFormat, engineFormat } = getTranscoderFormat( basisFormat, width, height, hasAlpha );

		var blockByteLength = BasisModule.getBytesPerBlockOrPixel( transcoderFormat );

		assert( BasisModule.isFormatSupported( transcoderFormat ), 'THREE.BasisTextureLoader: Unsupported format.' );

		var mipmaps = [];

		if ( basisFormat === BasisFormat.ETC1S ) {

			var transcoder = new BasisModule.LowLevelETC1SImageTranscoder();

			var { endpointCount, endpointsData, selectorCount, selectorsData, tablesData } = taskConfig.globalData;

			try {

				var ok;

				ok = transcoder.decodePalettes( endpointCount, endpointsData, selectorCount, selectorsData );

				assert( ok, 'THREE.BasisTextureLoader: decodePalettes() failed.' );

				ok = transcoder.decodeTables( tablesData );

				assert( ok, 'THREE.BasisTextureLoader: decodeTables() failed.' );

				for ( var i = 0; i < taskConfig.levels.length; i ++ ) {

					var level = taskConfig.levels[ i ];
					var imageDesc = taskConfig.globalData.imageDescs[ i ];

					var dstByteLength = getTranscodedImageByteLength( transcoderFormat, level.width, level.height );
					var dst = new Uint8Array( dstByteLength );

					ok = transcoder.transcodeImage(
						transcoderFormat,
						dst, dstByteLength / blockByteLength,
						level.data,
						getWidthInBlocks( transcoderFormat, level.width ),
						getHeightInBlocks( transcoderFormat, level.height ),
						level.width, level.height, level.index,
						imageDesc.rgbSliceByteOffset, imageDesc.rgbSliceByteLength,
						imageDesc.alphaSliceByteOffset, imageDesc.alphaSliceByteLength,
						imageDesc.imageFlags,
						hasAlpha,
						false,
						0, 0
					);

					assert( ok, 'THREE.BasisTextureLoader: transcodeImage() failed for level ' + level.index + '.' );

					mipmaps.push( { data: dst, width: level.width, height: level.height } );

				}

			} finally {

				transcoder.delete();

			}

		} else {

			for ( var i = 0; i < taskConfig.levels.length; i ++ ) {

				var level = taskConfig.levels[ i ];

				var dstByteLength = getTranscodedImageByteLength( transcoderFormat, level.width, level.height );
				var dst = new Uint8Array( dstByteLength );

				var ok = BasisModule.transcodeUASTCImage(
					transcoderFormat,
					dst, dstByteLength / blockByteLength,
					level.data,
					getWidthInBlocks( transcoderFormat, level.width ),
					getHeightInBlocks( transcoderFormat, level.height ),
					level.width, level.height, level.index,
					0,
					level.data.byteLength,
					0,
					hasAlpha,
					false,
					0, 0,
					- 1, - 1
				);

				assert( ok, 'THREE.BasisTextureLoader: transcodeUASTCImage() failed for level ' + level.index + '.' );

				mipmaps.push( { data: dst, width: level.width, height: level.height } );

			}

		}

		return { width, height, hasAlpha, mipmaps, format: engineFormat };

	}

	function transcode( buffer ) {

		var basisFile = new BasisModule.BasisFile( new Uint8Array( buffer ) );

		var basisFormat = basisFile.isUASTC() ? BasisFormat.UASTC_4x4 : BasisFormat.ETC1S;
		var width = basisFile.getImageWidth( 0, 0 );
		var height = basisFile.getImageHeight( 0, 0 );
		var levels = basisFile.getNumLevels( 0 );
		var hasAlpha = basisFile.getHasAlpha();

		function cleanup() {

			basisFile.close();
			basisFile.delete();

		}

		var { transcoderFormat, engineFormat } = getTranscoderFormat( basisFormat, width, height, hasAlpha );

		if ( ! width || ! height || ! levels ) {

			cleanup();
			throw new Error( 'THREE.BasisTextureLoader:	Invalid texture' );

		}

		if ( ! basisFile.startTranscoding() ) {

			cleanup();
			throw new Error( 'THREE.BasisTextureLoader: .startTranscoding failed' );

		}

		var mipmaps = [];

		for ( var mip = 0; mip < levels; mip ++ ) {

			var mipWidth = basisFile.getImageWidth( 0, mip );
			var mipHeight = basisFile.getImageHeight( 0, mip );
			var dst = new Uint8Array( basisFile.getImageTranscodedSizeInBytes( 0, mip, transcoderFormat ) );

			var status = basisFile.transcodeImage(
				dst,
				0,
				mip,
				transcoderFormat,
				0,
				hasAlpha
			);

			if ( ! status ) {

				cleanup();
				throw new Error( 'THREE.BasisTextureLoader: .transcodeImage failed.' );

			}

			mipmaps.push( { data: dst, width: mipWidth, height: mipHeight } );

		}

		cleanup();

		return { width, height, hasAlpha, mipmaps, format: engineFormat };

	}

	//

	// Optimal choice of a transcoder target format depends on the Basis format (ETC1S or UASTC),
	// device capabilities, and texture dimensions. The list below ranks the formats separately
	// for ETC1S and UASTC.
	//
	// In some cases, transcoding UASTC to RGBA32 might be preferred for higher quality (at
	// significant memory cost) compared to ETC1/2, BC1/3, and PVRTC. The transcoder currently
	// chooses RGBA32 only as a last resort and does not expose that option to the caller.
	var FORMAT_OPTIONS = [
		{
			if: 'astcSupported',
			basisFormat: [ BasisFormat.UASTC_4x4 ],
			transcoderFormat: [ TranscoderFormat.ASTC_4x4, TranscoderFormat.ASTC_4x4 ],
			engineFormat: [ EngineFormat.RGBA_ASTC_4x4_Format, EngineFormat.RGBA_ASTC_4x4_Format ],
			priorityETC1S: Infinity,
			priorityUASTC: 1,
			needsPowerOfTwo: false,
		},
		{
			if: 'bptcSupported',
			basisFormat: [ BasisFormat.ETC1S, BasisFormat.UASTC_4x4 ],
			transcoderFormat: [ TranscoderFormat.BC7_M5, TranscoderFormat.BC7_M5 ],
			engineFormat: [ EngineFormat.RGBA_BPTC_Format, EngineFormat.RGBA_BPTC_Format ],
			priorityETC1S: 3,
			priorityUASTC: 2,
			needsPowerOfTwo: false,
		},
		{
			if: 'dxtSupported',
			basisFormat: [ BasisFormat.ETC1S, BasisFormat.UASTC_4x4 ],
			transcoderFormat: [ TranscoderFormat.BC1, TranscoderFormat.BC3 ],
			engineFormat: [ EngineFormat.RGB_S3TC_DXT1_Format, EngineFormat.RGBA_S3TC_DXT5_Format ],
			priorityETC1S: 4,
			priorityUASTC: 5,
			needsPowerOfTwo: false,
		},
		{
			if: 'etc2Supported',
			basisFormat: [ BasisFormat.ETC1S, BasisFormat.UASTC_4x4 ],
			transcoderFormat: [ TranscoderFormat.ETC1, TranscoderFormat.ETC2 ],
			engineFormat: [ EngineFormat.RGB_ETC2_Format, EngineFormat.RGBA_ETC2_EAC_Format ],
			priorityETC1S: 1,
			priorityUASTC: 3,
			needsPowerOfTwo: false,
		},
		{
			if: 'etc1Supported',
			basisFormat: [ BasisFormat.ETC1S, BasisFormat.UASTC_4x4 ],
			transcoderFormat: [ TranscoderFormat.ETC1, TranscoderFormat.ETC1 ],
			engineFormat: [ EngineFormat.RGB_ETC1_Format, EngineFormat.RGB_ETC1_Format ],
			priorityETC1S: 2,
			priorityUASTC: 4,
			needsPowerOfTwo: false,
		},
		{
			if: 'pvrtcSupported',
			basisFormat: [ BasisFormat.ETC1S, BasisFormat.UASTC_4x4 ],
			transcoderFormat: [ TranscoderFormat.PVRTC1_4_RGB, TranscoderFormat.PVRTC1_4_RGBA ],
			engineFormat: [ EngineFormat.RGB_PVRTC_4BPPV1_Format, EngineFormat.RGBA_PVRTC_4BPPV1_Format ],
			priorityETC1S: 5,
			priorityUASTC: 6,
			needsPowerOfTwo: true,
		},
	];

	var ETC1S_OPTIONS = FORMAT_OPTIONS.sort( function ( a, b ) {

		return a.priorityETC1S - b.priorityETC1S;

	} );
	var UASTC_OPTIONS = FORMAT_OPTIONS.sort( function ( a, b ) {

		return a.priorityUASTC - b.priorityUASTC;

	} );

	function getTranscoderFormat( basisFormat, width, height, hasAlpha ) {

		var transcoderFormat;
		var engineFormat;

		var options = basisFormat === BasisFormat.ETC1S ? ETC1S_OPTIONS : UASTC_OPTIONS;

		for ( var i = 0; i < options.length; i ++ ) {

			var opt = options[ i ];

			if ( ! config[ opt.if ] ) continue;
			if ( ! opt.basisFormat.includes( basisFormat ) ) continue;
			if ( opt.needsPowerOfTwo && ! ( isPowerOfTwo( width ) && isPowerOfTwo( height ) ) ) continue;

			transcoderFormat = opt.transcoderFormat[ hasAlpha ? 1 : 0 ];
			engineFormat = opt.engineFormat[ hasAlpha ? 1 : 0 ];

			return { transcoderFormat, engineFormat };

		}

		console.warn( 'THREE.BasisTextureLoader: No suitable compressed texture format found. Decoding to RGBA32.' );

		transcoderFormat = TranscoderFormat.RGBA32;
		engineFormat = EngineFormat.RGBAFormat;

		return { transcoderFormat, engineFormat };

	}

	function assert( ok, message ) {

		if ( ! ok ) throw new Error( message );

	}

	function getWidthInBlocks( transcoderFormat, width ) {

		return Math.ceil( width / BasisModule.getFormatBlockWidth( transcoderFormat ) );

	}

	function getHeightInBlocks( transcoderFormat, height ) {

		return Math.ceil( height / BasisModule.getFormatBlockHeight( transcoderFormat ) );

	}

	function getTranscodedImageByteLength( transcoderFormat, width, height ) {

		var blockByteLength = BasisModule.getBytesPerBlockOrPixel( transcoderFormat );

		if ( BasisModule.formatIsUncompressed( transcoderFormat ) ) {

			return width * height * blockByteLength;

		}

		if ( transcoderFormat === TranscoderFormat.PVRTC1_4_RGB
				|| transcoderFormat === TranscoderFormat.PVRTC1_4_RGBA ) {

			// GL requires extra padding for very small textures:
			// https://www.khronos.org/registry/OpenGL/extensions/IMG/IMG_texture_compression_pvrtc.txt
			var paddedWidth = ( width + 3 ) & ~ 3;
			var paddedHeight = ( height + 3 ) & ~ 3;

			return ( Math.max( 8, paddedWidth ) * Math.max( 8, paddedHeight ) * 4 + 7 ) / 8;

		}

		return ( getWidthInBlocks( transcoderFormat, width )
			* getHeightInBlocks( transcoderFormat, height )
			* blockByteLength );

	}

	function isPowerOfTwo( value ) {

		if ( value <= 2 ) return true;

		return ( value & ( value - 1 ) ) === 0 && value !== 0;

	}

};

/**
 * @author Don McCurdy / https://www.donmccurdy.com
 */

let init, instance, heap;

const importObject = {

	env: {

		emscripten_notify_memory_growth: function ( index ) {

			heap = new Uint8Array( instance.exports.memory.buffer );

		}

	}

};

/**
 * ZSTD (Zstandard) decoder.
 *
 * Compiled from https://github.com/facebook/zstd/tree/dev/contrib/single_file_libs, with the
 * following steps:
 *
 * ```
 * ./combine.sh -r ../../lib -o zstddeclib.c zstddeclib-in.c
 * emcc zstddeclib.c -Oz -s EXPORTED_FUNCTIONS="['_ZSTD_decompress', '_ZSTD_findDecompressedSize', '_ZSTD_isError', '_malloc', '_free']" -s ALLOW_MEMORY_GROWTH=1 -s MALLOC=emmalloc -o zstddec.wasm
 * base64 zstddec.wasm > zstddec.txt
 * ```
 *
 * The base64 string written to `zstddec.txt` is embedded as the `wasm` variable at the bottom
 * of this file. The rest of this file is written by hand, in order to avoid an additional JS
 * wrapper generated by Emscripten.
 */
class ZSTDDecoder {

	init () {

		if ( ! init ) {

			init = fetch( 'data:application/wasm;base64,' + wasm )
				.then( ( response ) => response.arrayBuffer() )
				.then( ( arrayBuffer ) => WebAssembly.instantiate( arrayBuffer, importObject ) )
				.then( ( result ) => {

					instance = result.instance;

					importObject.env.emscripten_notify_memory_growth( 0 ); // initialize heap.

				});

		}

		return init;

	}

	decode ( array, uncompressedSize = 0 ) {

		// Write compressed data into WASM memory.
		const compressedSize = array.byteLength;
		const compressedPtr = instance.exports.malloc( compressedSize );
		heap.set( array, compressedPtr );

		// Decompress into WASM memory.
		uncompressedSize = uncompressedSize || Number( instance.exports.ZSTD_findDecompressedSize( compressedPtr, compressedSize ) );
		const uncompressedPtr = instance.exports.malloc( uncompressedSize );
		const actualSize = instance.exports.ZSTD_decompress( uncompressedPtr, uncompressedSize, compressedPtr, compressedSize );

		// Read decompressed data and free WASM memory.
		const dec = heap.slice( uncompressedPtr, uncompressedPtr + actualSize );
		instance.exports.free( compressedPtr );
		instance.exports.free( uncompressedPtr );

		return dec;

	}

}

/**
 * BSD License
 *
 * For Zstandard software
 *
 * Copyright (c) 2016-present, Yann Collet, Facebook, Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 *  * Neither the name Facebook nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
const wasm = 'AGFzbQEAAAABpQEVYAF/AX9gAn9/AGADf39/AX9gBX9/f39/AX9gAX8AYAJ/fwF/YAR/f39/AX9gA39/fwBgBn9/f39/fwF/YAd/f39/f39/AX9gAn9/AX5gAn5+AX5gAABgBX9/f39/AGAGf39/f39/AGAIf39/f39/f38AYAl/f39/f39/f38AYAABf2AIf39/f39/f38Bf2ANf39/f39/f39/f39/fwF/YAF/AX4CJwEDZW52H2Vtc2NyaXB0ZW5fbm90aWZ5X21lbW9yeV9ncm93dGgABANpaAEFAAAFAgEFCwACAQABAgIFBQcAAwABDgsBAQcAEhMHAAUBDAQEAAANBwQCAgYCBAgDAwMDBgEACQkHBgICAAYGAgQUBwYGAwIGAAMCAQgBBwUGCgoEEQAEBAEIAwgDBQgDEA8IAAcABAUBcAECAgUEAQCAAgYJAX8BQaCgwAILB2AHBm1lbW9yeQIABm1hbGxvYwAoBGZyZWUAJgxaU1REX2lzRXJyb3IAaBlaU1REX2ZpbmREZWNvbXByZXNzZWRTaXplAFQPWlNURF9kZWNvbXByZXNzAEoGX3N0YXJ0ACQJBwEAQQELASQKussBaA8AIAAgACgCBCABajYCBAsZACAAKAIAIAAoAgRBH3F0QQAgAWtBH3F2CwgAIABBiH9LC34BBH9BAyEBIAAoAgQiA0EgTQRAIAAoAggiASAAKAIQTwRAIAAQDQ8LIAAoAgwiAiABRgRAQQFBAiADQSBJGw8LIAAgASABIAJrIANBA3YiBCABIARrIAJJIgEbIgJrIgQ2AgggACADIAJBA3RrNgIEIAAgBCgAADYCAAsgAQsUAQF/IAAgARACIQIgACABEAEgAgv3AQECfyACRQRAIABCADcCACAAQQA2AhAgAEIANwIIQbh/DwsgACABNgIMIAAgAUEEajYCECACQQRPBEAgACABIAJqIgFBfGoiAzYCCCAAIAMoAAA2AgAgAUF/ai0AACIBBEAgAEEIIAEQFGs2AgQgAg8LIABBADYCBEF/DwsgACABNgIIIAAgAS0AACIDNgIAIAJBfmoiBEEBTQRAIARBAWtFBEAgACABLQACQRB0IANyIgM2AgALIAAgAS0AAUEIdCADajYCAAsgASACakF/ai0AACIBRQRAIABBADYCBEFsDwsgAEEoIAEQFCACQQN0ams2AgQgAgsWACAAIAEpAAA3AAAgACABKQAINwAICy8BAX8gAUECdEGgHWooAgAgACgCAEEgIAEgACgCBGprQR9xdnEhAiAAIAEQASACCyEAIAFCz9bTvtLHq9lCfiAAfEIfiUKHla+vmLbem55/fgsdAQF/IAAoAgggACgCDEYEfyAAKAIEQSBGBUEACwuCBAEDfyACQYDAAE8EQCAAIAEgAhBnIAAPCyAAIAJqIQMCQCAAIAFzQQNxRQRAAkAgAkEBSARAIAAhAgwBCyAAQQNxRQRAIAAhAgwBCyAAIQIDQCACIAEtAAA6AAAgAUEBaiEBIAJBAWoiAiADTw0BIAJBA3ENAAsLAkAgA0F8cSIEQcAASQ0AIAIgBEFAaiIFSw0AA0AgAiABKAIANgIAIAIgASgCBDYCBCACIAEoAgg2AgggAiABKAIMNgIMIAIgASgCEDYCECACIAEoAhQ2AhQgAiABKAIYNgIYIAIgASgCHDYCHCACIAEoAiA2AiAgAiABKAIkNgIkIAIgASgCKDYCKCACIAEoAiw2AiwgAiABKAIwNgIwIAIgASgCNDYCNCACIAEoAjg2AjggAiABKAI8NgI8IAFBQGshASACQUBrIgIgBU0NAAsLIAIgBE8NAQNAIAIgASgCADYCACABQQRqIQEgAkEEaiICIARJDQALDAELIANBBEkEQCAAIQIMAQsgA0F8aiIEIABJBEAgACECDAELIAAhAgNAIAIgAS0AADoAACACIAEtAAE6AAEgAiABLQACOgACIAIgAS0AAzoAAyABQQRqIQEgAkEEaiICIARNDQALCyACIANJBEADQCACIAEtAAA6AAAgAUEBaiEBIAJBAWoiAiADRw0ACwsgAAsMACAAIAEpAAA3AAALQQECfyAAKAIIIgEgACgCEEkEQEEDDwsgACAAKAIEIgJBB3E2AgQgACABIAJBA3ZrIgE2AgggACABKAAANgIAQQALDAAgACABKAIANgAAC/cCAQJ/AkAgACABRg0AAkAgASACaiAASwRAIAAgAmoiBCABSw0BCyAAIAEgAhALDwsgACABc0EDcSEDAkACQCAAIAFJBEAgAwRAIAAhAwwDCyAAQQNxRQRAIAAhAwwCCyAAIQMDQCACRQ0EIAMgAS0AADoAACABQQFqIQEgAkF/aiECIANBAWoiA0EDcQ0ACwwBCwJAIAMNACAEQQNxBEADQCACRQ0FIAAgAkF/aiICaiIDIAEgAmotAAA6AAAgA0EDcQ0ACwsgAkEDTQ0AA0AgACACQXxqIgJqIAEgAmooAgA2AgAgAkEDSw0ACwsgAkUNAgNAIAAgAkF/aiICaiABIAJqLQAAOgAAIAINAAsMAgsgAkEDTQ0AIAIhBANAIAMgASgCADYCACABQQRqIQEgA0EEaiEDIARBfGoiBEEDSw0ACyACQQNxIQILIAJFDQADQCADIAEtAAA6AAAgA0EBaiEDIAFBAWohASACQX9qIgINAAsLIAAL8wICAn8BfgJAIAJFDQAgACACaiIDQX9qIAE6AAAgACABOgAAIAJBA0kNACADQX5qIAE6AAAgACABOgABIANBfWogAToAACAAIAE6AAIgAkEHSQ0AIANBfGogAToAACAAIAE6AAMgAkEJSQ0AIABBACAAa0EDcSIEaiIDIAFB/wFxQYGChAhsIgE2AgAgAyACIARrQXxxIgRqIgJBfGogATYCACAEQQlJDQAgAyABNgIIIAMgATYCBCACQXhqIAE2AgAgAkF0aiABNgIAIARBGUkNACADIAE2AhggAyABNgIUIAMgATYCECADIAE2AgwgAkFwaiABNgIAIAJBbGogATYCACACQWhqIAE2AgAgAkFkaiABNgIAIAQgA0EEcUEYciIEayICQSBJDQAgAa0iBUIghiAFhCEFIAMgBGohAQNAIAEgBTcDGCABIAU3AxAgASAFNwMIIAEgBTcDACABQSBqIQEgAkFgaiICQR9LDQALCyAACy8BAn8gACgCBCAAKAIAQQJ0aiICLQACIQMgACACLwEAIAEgAi0AAxAIajYCACADCy8BAn8gACgCBCAAKAIAQQJ0aiICLQACIQMgACACLwEAIAEgAi0AAxAFajYCACADCx8AIAAgASACKAIEEAg2AgAgARAEGiAAIAJBCGo2AgQLCAAgAGdBH3MLugUBDX8jAEEQayIKJAACfyAEQQNNBEAgCkEANgIMIApBDGogAyAEEAsaIAAgASACIApBDGpBBBAVIgBBbCAAEAMbIAAgACAESxsMAQsgAEEAIAEoAgBBAXRBAmoQECENQVQgAygAACIGQQ9xIgBBCksNABogAiAAQQVqNgIAIAMgBGoiAkF8aiEMIAJBeWohDiACQXtqIRAgAEEGaiELQQQh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ASIDNgLE4AEgACgCvOABIQQgACABNgK84AEgACABIAJqNgK44AEgACABIAQgA2tqNgLA4AELpgEBAX8gACAAKALs4QEQFjYCyOABIABCADcD+OABIABCADcDuOABIABBwOABakIANwMAIABBqNAAaiIBQYyAgOAANgIAIABBADYCmOIBIABCADcDiOEBIABCAzcDgOEBIABBrNABakHgEikCADcCACAAQbTQAWpB6BIoAgA2AgAgACABNgIMIAAgAEGYIGo2AgggACAAQaAwajYCBCAAIABBEGo2AgALYQEBf0G4fyEDAkAgAUEDSQ0AIAIgABAhIgFBA3YiADYCCCACIAFBAXE2AgQgAiABQQF2QQNxIgM2AgACQCADQX9qIgFBAksNAAJAIAFBAWsOAgEAAgtBbA8LIAAhAwsgAwsMACAAIAEgAkEAEC4LiAQCA38CfiADEBYhBCAAQQBBKBAQIQAgBCACSwRAIAQPCyABRQRAQX8PCwJAAkAgA0EBRg0AIAEoAAAiBkGo6r5pRg0AQXYhAyAGQXBxQdDUtMIBRw0BQQghAyACQQhJDQEgAEEAQSgQECEAIAEoAAQhASAAQQE2AhQgACABrTcDAEEADwsgASACIAMQLyIDIAJLDQAgACADNgIYQXIhAyABIARqIgVBf2otAAAiAkEIcQ0AIAJBIHEiBkUEQEFwIQMgBS0AACIFQacBSw0BIAVBB3GtQgEgBUEDdkEKaq2GIgdCA4h+IAd8IQggBEEBaiEECyACQQZ2IQMgAkECdiEFAkAgAkEDcUF/aiICQQJLBEBBACECDAELAkACQAJAIAJBAWsOAgECAAsgASAEai0AACECIARBAWohBAwCCyABIARqLwAAIQIgBEECaiEEDAELIAEgBGooAAAhAiAEQQRqIQQLIAVBAXEhBQJ+AkACQAJAIANBf2oiA0ECTQRAIANBAWsOAgIDAQtCfyAGRQ0DGiABIARqMQAADAMLIAEgBGovAACtQoACfAwCCyABIARqKAAArQwBCyABIARqKQAACyEHIAAgBTYCICAAIAI2AhwgACAHNwMAQQAhAyAAQQA2AhQgACAHIAggBhsiBzcDCCAAIAdCgIAIIAdCgIAIVBs+AhALIAMLWwEBf0G4fyEDIAIQFiICIAFNBH8gACACakF/ai0AACIAQQNxQQJ0QaAeaigC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C0Egak8NAQsgByAHKQNoNwMQIAcgBykDYDcDCCAEIA0gB0EIaiAHQdwAaiAPIA4gESAQEB4hCwwBCyACIARqIQggBCAKEAcgAkERTwRAIARBEGohAgNAIAIgCkEQaiIKEAcgAkEQaiICIAhJDQALCyAIIAlrIQIgByATNgJcIAkgCCAOa0sEQCAJIAggEWtLBEBBbCELDAILIBAgAiAOayICaiIKIANqIBBNBEAgCCAKIAMQDxoMAgsgCCAKQQAgAmsQDyEIIAcgAiADaiIDNgJkIAggAmshCCAOIQILIAlBEE8EQCADIAhqIQMDQCAIIAIQByACQRBqIQIgCEEQaiIIIANJDQALDAELAkAgCUEHTQRAIAggAi0AADoAACAIIAItAAE6AAEgCCACLQACOgACIAggAi0AAzoAAyAIQQRqIAIgCUECdCIDQcAeaigCAGoiAhAXIAIgA0HgHmooAgBrIQIgBygCZCEDDAELIAggAhAMCyADQQlJDQAgAyAIaiEDIAhBCGoiCCACQQhqIgJrQQ9MBEADQCAIIAIQDCACQQhqIQIgCEEIaiIIIANJDQAMAgALAAsDQCAIIAIQByACQRBqIQIgCEEQaiIIIANJDQALCyAHQRhqEAQaIAsgDCALEAMiAhshDCAEIAQgC2ogAhshBCAFQX9qIgUNAAsgDBADDQFBbCEMIAdBGGoQBEECSQ0BQQAhCANAIAhBA0cEQCAAIAhBAnQiAmpBrNABaiACIAdqKAJENgIAIAhBAWohCAwBCwsgBygCXCEIC0G6fyEMIA8gCGsiACANIARrSw0AIAQEfyAEIAggABALIABqBUEACyABayEMCyAHQfAAaiQAIAwLkRcCFn8FfiMAQdABayIHJAAgByAAKALw4QEiCDYCvAEgASACaiESIAggACgCgOIBaiETAkACQCAFRQRAIAEhAwwBCyAAKALE4AEhESAAKALA4AEhFSAAKAK84AEhDyAAQQE2AozhAUEAIQgDQCAIQQNHBEAgByAIQQJ0IgJqIAAgAmpBrNABaigCADYCVCAIQQFqIQgMAQsLIAcgETYCZCAHIA82AmAgByABIA9rNgJoQWwhECAHQShqIAMgBBAGEAMNASAFQQQgBUEESBshFyAHQTxqIAdBKGogACgCABATIAdBxABqIAdBKGogACgCCBATIAdBzABqIAdB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IAdB0AFqJAAgEAslACAAQgA3AgAgAEEAOwEIIABBADoACyAAIAE2AgwgACACOgAKC7QFAQN/IwBBMGsiBCQAIABB/wFqIgVBfWohBgJAIAMvAQIEQCAEQRhqIAEgAhAGIgIQAw0BIARBEGogBEEYaiADEBwgBEEIaiAEQRhqIAMQHCAAIQMDQAJAIARBGGoQBCADIAZPckUEQCADIARBEGogBEEYahASOgAAIAMgBEEIaiAEQRhqEBI6AAEgBEEYahAERQ0BIANBAmohAwsgBUF+aiEFAn8DQEG6fyECIAMiASAFSw0FIAEgBEEQaiAEQRhqEBI6AAAgAUEBaiEDIARBGGoQBEEDRgRAQQIhAiAEQQhqDAILIAMgBUsNBSABIARBCGogBEEYahASOgABIAFBAmohA0EDIQIgBEEYahAEQQNHDQALIARBEGoLIQUgAyAFIARBGGoQEjoAACABIAJqIABrIQIMAwsgAyAEQRBqIARBGGoQEjoAAiADIARBCGogBEEYahASOgADIANBBGohAwwAAAsACyAEQRhqIAEgAhAGIgIQAw0AIARBEGogBEEYaiADEBwgBEEIaiAEQRhqIAMQHCAAIQMDQAJAIARBGGoQBCADIAZPckUEQCADIARBEGogBEEYahAROgAAIAMgBEEIaiAEQRhqEBE6AAEgBEEYahAERQ0BIANBAmohAwsgBUF+aiEFAn8DQEG6fyECIAMiASAFSw0EIAEgBEEQaiAEQRhqEBE6AAAgAUEBaiEDIARBGGoQBEEDRgRAQQIhAiAEQQhqDAILIAMgBUsNBCABIARBCGogBEEYahAROgABIAFBAmohA0EDIQIgBEEYahAEQQNHDQALIARBEGoLIQUgAyAFIARBGGoQEToAACABIAJqIABrIQIMAgsgAyAEQRBqIARBGGoQEToAAiADIARBCGogBEEYahAROgADIANBBGohAwwAAAsACyAEQTBqJAAgAgtpAQF/An8CQAJAIAJBB00NACABKAAAQbfIwuF+Rw0AIAAgASgABDYCmOIBQWIgAEEQaiABIAIQPiIDEAMNAhogAEKBgICAEDcDiOEBIAAgASADaiACIANrECoMAQsgACABIAIQKgtBAAsLrQMBBn8jAEGAAWsiAyQAQWIhCAJAIAJBCUkNACAAQZjQAGogAUEIaiIEIAJBeGogAEGY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wOABCwutAgIEfwF+IwBBQGoiBCQAAkACQCACQQhJDQAgASgAAEFwcUHQ1LTCAUcNACABIAIQIiEBIABCADcDCCAAQQA2AgQgACABNgIADAELIARBGGogASACEC0iAxADBEAgACADEBoMAQsgAwRAIABBuH8QGgwBCyACIAQoAjAiA2shAiABIANqIQMDQAJAIAAgAyACIARBCGoQLCIFEAMEfyAFBSACIAVBA2oiBU8NAUG4fwsQGgwCCyAGQQFqIQYgAiAFayECIAMgBWohAyAEKAIMRQ0ACyAEKAI4BEAgAkEDTQRAIABBuH8QGgwCCyADQQRqIQMLIAQoAighAiAEKQMYIQcgAEEANgIEIAAgAyABazYCACAAIAIgBmytIAcgB0J/URs3AwgLIARBQGskAAslAQF/IwBBEGsiAiQAIAIgACABEFEgAigCACEAIAJBEGokACAAC30BBH8jAEGQBGsiBCQAIARB/wE2AggCQCAEQRBqIARBCGogBEEMaiABIAIQFSIGEAMEQCAGIQUMAQtBVCEFIAQoAgwiB0EGSw0AIAMgBEEQaiAEKAIIIAcQQSIFEAMNACAAIAEgBmogAiAGayADEDwhBQsgBEGQBGokACAFC4cBAgJ/An5BABAWIQMCQANAIAEgA08EQAJAIAAoAABBcHFB0NS0wgFGBEAgACABECIiAhADRQ0BQn4PCyAAIAEQVSIEQn1WDQMgBCAFfCIFIARUIQJCfiEEIAINAyAAIAEQUiICEAMNAwsgASACayEBIAAgAmohAAwBCwtCfiAFIAEbIQQLIAQLPwIBfwF+IwBBMGsiAiQAAn5CfiACQQhqIAAgARAtDQAaQgAgAigCHEEBRg0AGiACKQMICyEDIAJBMGokACADC40BAQJ/IwBBMGsiASQAAkAgAEUNACAAKAKI4gENACABIABB/OEBaigCADYCKCABIAApAvThATcDICAAEDAgACgCqOIBIQIgASABKAIoNgIYIAEgASkDIDcDECACIAFBEGoQGyAAQQA2AqjiASABIAEoAig2AgggASABKQMgNwMAIAAgARAbCyABQTBqJAALKgECfyMAQRBrIgAkACAAQQA2AgggAEIANwMAIAAQWCEBIABBEGokACABC4cBAQN/IwBBEGsiAiQAAkAgACgCAEUgACgCBEVzDQAgAiAAKAIINgIIIAIgACkCADcDAAJ/IAIoAgAiAQRAIAIoAghBqOMJIAERBQAMAQtBqOMJECgLIgFFDQAgASAAKQIANwL04QEgAUH84QFqIAAoAgg2AgAgARBZIAEhAwsgAkEQaiQAIAMLywEBAn8jAEEgayIBJAAgAEGBgIDAADYCtOIBIABBADYCiOIBIABBADYC7OEBIABCADcDkOIBIABBADYCpOMJIABBADYC3OIBIABCADcCzOIBIABBADYCvOIBIABBADYCxOABIABCADcCnOIBIABBpOIBakIANwIAIABBrOIBakEANgIAIAFCADcCECABQgA3AhggASABKQMYNwMIIAEgASkDEDcDACABKAIIQQh2QQFxIQIgAEEANgLg4gEgACACNgKM4gEgAUEgaiQAC3YBA38jAEEwayIBJAAgAARAIAEgAEHE0AFqIgIoAgA2AiggASAAKQK80AE3AyAgACgCACEDIAEgAigCADYCGCABIAApArzQATcDECADIAFBEGoQGyABIAEoAig2AgggASABKQMgNwMAIAAgARAbCyABQTBqJAALzAEBAX8gACABKAK00AE2ApjiASAAIAEoAgQiAjYCwOABIAAgAjYCvOABIAAgAiABKAIIaiICNgK44AEgACACNgLE4AEgASgCuNABBEAgAEKBgICAEDcDiOEBIAAgAUGk0ABqNgIMIAAgAUGUIGo2AgggACABQZwwajYCBCAAIAFBDGo2AgAgAEGs0AFqIAFBqNABaigCADYCACAAQbDQAWogAUGs0AFqKAIANgIAIABBtNABaiABQbDQAWooAgA2AgAPCyAAQgA3A4jhAQs7ACACRQRAQbp/DwsgBEUEQEFsDwsgAiAEEGAEQCAAIAEgAiADIAQgBRBhDwsgACABIAIgAyAEIAUQZQtGAQF/IwBBEGsiBSQAIAVBCGogBBAOAn8gBS0ACQRAIAAgASACIAMgBBAyDAELIAAgASACIAMgBBA0CyEAIAVBEGokACAACzQAIAAgAyAEIAUQNiIFEAMEQCAFDwsgBSAESQR/IAEgAiADIAVqIAQgBWsgABA1BUG4fwsLRgEBfyMAQRBrIgUkACAFQQhqIAQQDgJ/IAUtAAkEQCAAIAEgAiADIAQQYgwBCyAAIAEgAiADIAQQNQshACAFQRBqJAAgAAtZAQF/QQ8hAiABIABJBEAgAUEE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';

const e=[171,75,84,88,32,50,48,187,13,10,26,10];var n,i,s,a,r,o,l,f;!function(t){t[t.NONE=0]="NONE",t[t.BASISLZ=1]="BASISLZ",t[t.ZSTD=2]="ZSTD",t[t.ZLIB=3]="ZLIB";}(n||(n={})),function(t){t[t.BASICFORMAT=0]="BASICFORMAT";}(i||(i={})),function(t){t[t.UNSPECIFIED=0]="UNSPECIFIED",t[t.ETC1S=163]="ETC1S",t[t.UASTC=166]="UASTC";}(s||(s={})),function(t){t[t.UNSPECIFIED=0]="UNSPECIFIED",t[t.SRGB=1]="SRGB";}(a||(a={})),function(t){t[t.UNSPECIFIED=0]="UNSPECIFIED",t[t.LINEAR=1]="LINEAR",t[t.SRGB=2]="SRGB",t[t.ITU=3]="ITU",t[t.NTSC=4]="NTSC",t[t.SLOG=5]="SLOG",t[t.SLOG2=6]="SLOG2";}(r||(r={})),function(t){t[t.ALPHA_STRAIGHT=0]="ALPHA_STRAIGHT",t[t.ALPHA_PREMULTIPLIED=1]="ALPHA_PREMULTIPLIED";}(o||(o={})),function(t){t[t.RGB=0]="RGB",t[t.RRR=3]="RRR",t[t.GGG=4]="GGG",t[t.AAA=15]="AAA";}(l||(l={})),function(t){t[t.RGB=0]="RGB",t[t.RGBA=3]="RGBA",t[t.RRR=4]="RRR",t[t.RRRG=5]="RRRG";}(f||(f={}));class U{constructor(){this.vkFormat=0,this.typeSize=1,this.pixelWidth=0,this.pixelHeight=0,this.pixelDepth=0,this.layerCount=0,this.faceCount=1,this.supercompressionScheme=n.NONE,this.levels=[],this.dataFormatDescriptor=[{vendorId:0,descriptorType:i.BASICFORMAT,versionNumber:2,descriptorBlockSize:40,colorModel:s.UNSPECIFIED,colorPrimaries:a.SRGB,transferFunction:a.SRGB,flags:o.ALPHA_STRAIGHT,texelBlockDimension:{x:4,y:4,z:1,w:1},bytesPlane:[],samples:[]}],this.keyValue={},this.globalData=null;}}class c{constructor(t,e,n,i){this._dataView=new DataView(t.buffer,t.byteOffset+e,n),this._littleEndian=i,this._offset=0;}_nextUint8(){const t=this._dataView.getUint8(this._offset);return this._offset+=1,t}_nextUint16(){const t=this._dataView.getUint16(this._offset,this._littleEndian);return this._offset+=2,t}_nextUint32(){const t=this._dataView.getUint32(this._offset,this._littleEndian);return this._offset+=4,t}_nextUint64(){const t=this._dataView.getUint32(this._offset,this._littleEndian)+2**32*this._dataView.getUint32(this._offset+4,this._littleEndian);return this._offset+=8,t}_skip(t){return this._offset+=t,this}_scan(t,e=0){const n=this._offset;let i=0;for(;this._dataView.getUint8(this._offset)!==e&&i<t;)i++,this._offset++;return i<t&&this._offset++,new Uint8Array(this._dataView.buffer,this._dataView.byteOffset+n,i)}}function _(t){return "undefined"!=typeof TextDecoder?(new TextDecoder).decode(t):Buffer.from(t).toString("utf8")}function p(t){const n=new Uint8Array(t.buffer,t.byteOffset,e.length);if(n[0]!==e[0]||n[1]!==e[1]||n[2]!==e[2]||n[3]!==e[3]||n[4]!==e[4]||n[5]!==e[5]||n[6]!==e[6]||n[7]!==e[7]||n[8]!==e[8]||n[9]!==e[9]||n[10]!==e[10]||n[11]!==e[11])throw new Error("Missing KTX 2.0 identifier.");const i=new U,s=17*Uint32Array.BYTES_PER_ELEMENT,a=new c(t,e.length,s,!0);i.vkFormat=a._nextUint32(),i.typeSize=a._nextUint32(),i.pixelWidth=a._nextUint32(),i.pixelHeight=a._nextUint32(),i.pixelDepth=a._nextUint32(),i.layerCount=a._nextUint32(),i.faceCount=a._nextUint32();const r=a._nextUint32();i.supercompressionScheme=a._nextUint32();const o=a._nextUint32(),l=a._nextUint32(),f=a._nextUint32(),h=a._nextUint32(),g=a._nextUint64(),p=a._nextUint64(),x=new c(t,e.length+s,3*r*8,!0);for(let e=0;e<r;e++)i.levels.push({levelData:new Uint8Array(t.buffer,t.byteOffset+x._nextUint64(),x._nextUint64()),uncompressedByteLength:x._nextUint64()});const u=new c(t,o,l,!0),y={vendorId:u._skip(4)._nextUint16(),descriptorType:u._nextUint16(),versionNumber:u._nextUint16(),descriptorBlockSize:u._nextUint16(),colorModel:u._nextUint8(),colorPrimaries:u._nextUint8(),transferFunction:u._nextUint8(),flags:u._nextUint8(),texelBlockDimension:{x:u._nextUint8()+1,y:u._nextUint8()+1,z:u._nextUint8()+1,w:u._nextUint8()+1},bytesPlane:[u._nextUint8(),u._nextUint8(),u._nextUint8(),u._nextUint8(),u._nextUint8(),u._nextUint8(),u._nextUint8(),u._nextUint8()],samples:[]},D=(y.descriptorBlockSize/4-6)/4;for(let t=0;t<D;t++)y.samples[t]={bitOffset:u._nextUint16(),bitLength:u._nextUint8(),channelID:u._nextUint8(),samplePosition:[u._nextUint8(),u._nextUint8(),u._nextUint8(),u._nextUint8()],sampleLower:u._nextUint32(),sampleUpper:u._nextUint32()};i.dataFormatDescriptor.length=0,i.dataFormatDescriptor.push(y);const b=new c(t,f,h,!0);for(;b._offset<h;){const t=b._nextUint32(),e=b._scan(t),n=_(e),s=b._scan(t-e.byteLength);i.keyValue[n]=n.match(/^ktx/i)?_(s):s,b._offset%4&&b._skip(4-b._offset%4);}if(p<=0)return i;const d=new c(t,g,p,!0),B=d._nextUint16(),w=d._nextUint16(),A=d._nextUint32(),S=d._nextUint32(),m=d._nextUint32(),L=d._nextUint32(),I=[];for(let t=0;t<r;t++)I.push({imageFlags:d._nextUint32(),rgbSliceByteOffset:d._nextUint32(),rgbSliceByteLength:d._nextUint32(),alphaSliceByteOffset:d._nextUint32(),alphaSliceByteLength:d._nextUint32()});const R=g+d._offset,E=R+A,T=E+S,O=T+m,P=new Uint8Array(t.buffer,t.byteOffset+R,A),C=new Uint8Array(t.buffer,t.byteOffset+E,S),F=new Uint8Array(t.buffer,t.byteOffset+T,m),G=new Uint8Array(t.buffer,t.byteOffset+O,L);return i.globalData={endpointCount:B,selectorCount:w,imageDescs:I,endpointsData:P,selectorsData:C,tablesData:F,extendedData:G},i}

/**
 * Loader for KTX 2.0 GPU Texture containers.
 *
 * KTX 2.0 is a container format for various GPU texture formats. The loader
 * supports Basis Universal GPU textures, which can be quickly transcoded to
 * a wide variety of GPU texture compression formats. While KTX 2.0 also allows
 * other hardware-specific formats, this loader does not yet parse them.
 *
 * This loader parses the KTX 2.0 container and then relies on
 * THREE.BasisTextureLoader to complete the transcoding process.
 *
 * References:
 * - KTX: http://github.khronos.org/KTX-Specification/
 * - DFD: https://www.khronos.org/registry/DataFormat/specs/1.3/dataformat.1.3.html#basicdescriptor
 */

// KTX 2.0 constants.

var DFDModel = {
	ETC1S: 163,
	UASTC: 166,
};

var DFDChannel = {
	ETC1S: {
		RGB: 0,
		RRR: 3,
		GGG: 4,
		AAA: 15,
	},
	UASTC: {
		RGB: 0,
		RGBA: 3,
		RRR: 4,
		RRRG: 5
	},
};

var SupercompressionScheme = {
	ZSTD: 2
};

var Transfer = {
	SRGB: 2
};

//

class KTX2Loader extends CompressedTextureLoader {

	constructor( manager ) {

		super( manager );

		this.basisLoader = new BasisTextureLoader( manager );
		this.zstd = new ZSTDDecoder();

		this.zstd.init();

		if ( typeof MSC_TRANSCODER !== 'undefined' ) {

			console.warn(

				'THREE.KTX2Loader: Please update to latest "basis_transcoder".'
				+ ' "msc_basis_transcoder" is no longer supported in three.js r125+.'

			);

		}

	}

	setTranscoderPath( path ) {

		this.basisLoader.setTranscoderPath( path );

		return this;

	}

	setWorkerLimit( path ) {

		this.basisLoader.setWorkerLimit( path );

		return this;

	}

	detectSupport( renderer ) {

		this.basisLoader.detectSupport( renderer );

		return this;

	}

	dispose() {

		this.basisLoader.dispose();

		return this;

	}

	load( url, onLoad, onProgress, onError ) {

		var scope = this;

		var texture = new CompressedTexture();

		var bufferPending = new Promise( function ( resolve, reject ) {

			new FileLoader( scope.manager )
				.setPath( scope.path )
				.setResponseType( 'arraybuffer' )
				.load( url, resolve, onProgress, reject );

		} );

		bufferPending
			.then( function ( buffer ) {

				scope.parse( buffer, function ( _texture ) {

					texture.copy( _texture );
					texture.needsUpdate = true;

					if ( onLoad ) onLoad( texture );

				}, onError );

			} )
			.catch( onError );

		return texture;

	}

	parse( buffer, onLoad, onError ) {

		var scope = this;

		var ktx = p( new Uint8Array( buffer ) );

		if ( ktx.pixelDepth > 0 ) {

			throw new Error( 'THREE.KTX2Loader: Only 2D textures are currently supported.' );

		}

		if ( ktx.layerCount > 1 ) {

			throw new Error( 'THREE.KTX2Loader: Array textures are not currently supported.' );

		}

		if ( ktx.faceCount > 1 ) {

			throw new Error( 'THREE.KTX2Loader: Cube textures are not currently supported.' );

		}

		var dfd = KTX2Utils.getBasicDFD( ktx );

		KTX2Utils.createLevels( ktx, this.zstd ).then( function ( levels ) {

			var basisFormat = dfd.colorModel === DFDModel.UASTC
				? BasisTextureLoader.BasisFormat.UASTC_4x4
				: BasisTextureLoader.BasisFormat.ETC1S;

			var parseConfig = {

				levels: levels,
				width: ktx.pixelWidth,
				height: ktx.pixelHeight,
				basisFormat: basisFormat,
				hasAlpha: KTX2Utils.getAlpha( ktx ),

			};

			if ( basisFormat === BasisTextureLoader.BasisFormat.ETC1S ) {

				parseConfig.globalData = ktx.globalData;

			}

			return scope.basisLoader.parseInternalAsync( parseConfig );

		} ).then( function ( texture ) {

			texture.encoding = dfd.transferFunction === Transfer.SRGB
				? sRGBEncoding
				: LinearEncoding;
			texture.premultiplyAlpha = KTX2Utils.getPremultiplyAlpha( ktx );

			onLoad( texture );

		} ).catch( onError );

		return this;

	}

}

var KTX2Utils = {

	createLevels: async function ( ktx, zstd ) {

		if ( ktx.supercompressionScheme === SupercompressionScheme.ZSTD ) {

			await zstd.init();

		}

		var levels = [];
		var width = ktx.pixelWidth;
		var height = ktx.pixelHeight;

		for ( var levelIndex = 0; levelIndex < ktx.levels.length; levelIndex ++ ) {

			var levelWidth = Math.max( 1, Math.floor( width / Math.pow( 2, levelIndex ) ) );
			var levelHeight = Math.max( 1, Math.floor( height / Math.pow( 2, levelIndex ) ) );
			var levelData = ktx.levels[ levelIndex ].levelData;

			if ( ktx.supercompressionScheme === SupercompressionScheme.ZSTD ) {

				levelData = zstd.decode( levelData, ktx.levels[ levelIndex ].uncompressedByteLength );

			}

			levels.push( {

				index: levelIndex,
				width: levelWidth,
				height: levelHeight,
				data: levelData,

			} );

		}

		return levels;

	},

	getBasicDFD: function ( ktx ) {

		// Basic Data Format Descriptor Block is always the first DFD.
		return ktx.dataFormatDescriptor[ 0 ];

	},

	getAlpha: function ( ktx ) {

		var dfd = this.getBasicDFD( ktx );

		// UASTC

		if ( dfd.colorModel === DFDModel.UASTC ) {

			if ( ( dfd.samples[ 0 ].channelID & 0xF ) === DFDChannel.UASTC.RGBA ) {

				return true;

			}

			return false;

		}

		// ETC1S

		if ( dfd.samples.length === 2
			&& ( dfd.samples[ 1 ].channelID & 0xF ) === DFDChannel.ETC1S.AAA ) {

			return true;

		}

		return false;

	},

	getPremultiplyAlpha: function ( ktx ) {

		var dfd = this.getBasicDFD( ktx );

		return !! ( dfd.flags & 1 /* KHR_DF_FLAG_ALPHA_PREMULTIPLIED */ );

	},

};

function initKTX2Loader(krono) {
    krono.ktx2Loader = new KTX2Loader(krono.loadingManager);
    krono.config._basisPath = krono.config.basisPath;
    Object.defineProperty(krono.config, 'basisPath', {
        get() {
            return krono.config._basisPath;
        },
        set(value) {
            krono.config._basisPath = value;
        }
    });
}

function initLoaders(krono) {
    krono.loadingManager = new LoadingManager();
    initDracoLoader(krono);
    initKTX2Loader(krono);
    initGLTFLoader(krono);
    initRGBELoader(krono);
    initSMAALoader(krono);
    initAudioLoader(krono);
}
function load(krono, callback) {
    return new Promise((resolve, reject) => {
        let promises = [
            loadMainScene(krono),
            loadEnvMap(krono),
            loadSMAAImages(krono)
        ];
        promises = promises.concat(loadChunks(krono));
        promises = promises.concat(loadAudio(krono));
        Promise
            .all(promises)
            .then(() => {
            callback();
            resolve();
        })
            .catch((err) => {
            reject(err);
        });
    });
}

function initRenderPass(krono) {
    krono.renderPass = new RenderPass(krono.scene);
    krono.renderPass.renderToScreen = true;
}

function setShadowCasting(parent, status) {
    parent.traverse((child) => {
        child.castShadow = status;
    });
}

function setShadowReceiving(parent, status) {
    parent.traverse((child) => {
        child.receiveShadow = status;
    });
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getAugmentedNamespace(n) {
	if (n.__esModule) return n;
	var a = Object.defineProperty({}, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

var alea = createCommonjsModule(function (module) {
// A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
// http://baagoe.com/en/RandomMusings/javascript/
// https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
// Original work is under MIT license -

// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.



(function(global, module, define) {

function Alea(seed) {
  var me = this, mash = Mash();

  me.next = function() {
    var t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10; // 2^-32
    me.s0 = me.s1;
    me.s1 = me.s2;
    return me.s2 = t - (me.c = t | 0);
  };

  // Apply the seeding algorithm from Baagoe.
  me.c = 1;
  me.s0 = mash(' ');
  me.s1 = mash(' ');
  me.s2 = mash(' ');
  me.s0 -= mash(seed);
  if (me.s0 < 0) { me.s0 += 1; }
  me.s1 -= mash(seed);
  if (me.s1 < 0) { me.s1 += 1; }
  me.s2 -= mash(seed);
  if (me.s2 < 0) { me.s2 += 1; }
  mash = null;
}

function copy(f, t) {
  t.c = f.c;
  t.s0 = f.s0;
  t.s1 = f.s1;
  t.s2 = f.s2;
  return t;
}

function impl(seed, opts) {
  var xg = new Alea(seed),
      state = opts && opts.state,
      prng = xg.next;
  prng.int32 = function() { return (xg.next() * 0x100000000) | 0; };
  prng.double = function() {
    return prng() + (prng() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
  };
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); };
  }
  return prng;
}

function Mash() {
  var n = 0xefc8249d;

  var mash = function(data) {
    data = String(data);
    for (var i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      var h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }
    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  };

  return mash;
}


if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.alea = impl;
}

})(
  commonjsGlobal,
  module,    // present in node.js
  (typeof undefined) == 'function'    // present with an AMD loader
);
});

var xor128 = createCommonjsModule(function (module) {
// A Javascript implementaion of the "xor128" prng algorithm by
// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  me.x = 0;
  me.y = 0;
  me.z = 0;
  me.w = 0;

  // Set up generator function.
  me.next = function() {
    var t = me.x ^ (me.x << 11);
    me.x = me.y;
    me.y = me.z;
    me.z = me.w;
    return me.w ^= (me.w >>> 19) ^ t ^ (t >>> 8);
  };

  if (seed === (seed | 0)) {
    // Integer seed.
    me.x = seed;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 64; k++) {
    me.x ^= strseed.charCodeAt(k) | 0;
    me.next();
  }
}

function copy(f, t) {
  t.x = f.x;
  t.y = f.y;
  t.z = f.z;
  t.w = f.w;
  return t;
}

function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); };
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xor128 = impl;
}

})(
  commonjsGlobal,
  module,    // present in node.js
  (typeof undefined) == 'function'    // present with an AMD loader
);
});

var xorwow = createCommonjsModule(function (module) {
// A Javascript implementaion of the "xorwow" prng algorithm by
// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  // Set up generator function.
  me.next = function() {
    var t = (me.x ^ (me.x >>> 2));
    me.x = me.y; me.y = me.z; me.z = me.w; me.w = me.v;
    return (me.d = (me.d + 362437 | 0)) +
       (me.v = (me.v ^ (me.v << 4)) ^ (t ^ (t << 1))) | 0;
  };

  me.x = 0;
  me.y = 0;
  me.z = 0;
  me.w = 0;
  me.v = 0;

  if (seed === (seed | 0)) {
    // Integer seed.
    me.x = seed;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 64; k++) {
    me.x ^= strseed.charCodeAt(k) | 0;
    if (k == strseed.length) {
      me.d = me.x << 10 ^ me.x >>> 4;
    }
    me.next();
  }
}

function copy(f, t) {
  t.x = f.x;
  t.y = f.y;
  t.z = f.z;
  t.w = f.w;
  t.v = f.v;
  t.d = f.d;
  return t;
}

function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); };
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xorwow = impl;
}

})(
  commonjsGlobal,
  module,    // present in node.js
  (typeof undefined) == 'function'    // present with an AMD loader
);
});

var xorshift7 = createCommonjsModule(function (module) {
// A Javascript implementaion of the "xorshift7" algorithm by
// François Panneton and Pierre L'ecuyer:
// "On the Xorgshift Random Number Generators"
// http://saluc.engr.uconn.edu/refs/crypto/rng/panneton05onthexorshift.pdf

(function(global, module, define) {

function XorGen(seed) {
  var me = this;

  // Set up generator function.
  me.next = function() {
    // Update xor generator.
    var X = me.x, i = me.i, t, v;
    t = X[i]; t ^= (t >>> 7); v = t ^ (t << 24);
    t = X[(i + 1) & 7]; v ^= t ^ (t >>> 10);
    t = X[(i + 3) & 7]; v ^= t ^ (t >>> 3);
    t = X[(i + 4) & 7]; v ^= t ^ (t << 7);
    t = X[(i + 7) & 7]; t = t ^ (t << 13); v ^= t ^ (t << 9);
    X[i] = v;
    me.i = (i + 1) & 7;
    return v;
  };

  function init(me, seed) {
    var j, X = [];

    if (seed === (seed | 0)) {
      // Seed state array using a 32-bit integer.
      X[0] = seed;
    } else {
      // Seed state using a string.
      seed = '' + seed;
      for (j = 0; j < seed.length; ++j) {
        X[j & 7] = (X[j & 7] << 15) ^
            (seed.charCodeAt(j) + X[(j + 1) & 7] << 13);
      }
    }
    // Enforce an array length of 8, not all zeroes.
    while (X.length < 8) X.push(0);
    for (j = 0; j < 8 && X[j] === 0; ++j);
    if (j == 8) X[7] = -1;

    me.x = X;
    me.i = 0;

    // Discard an initial 256 values.
    for (j = 256; j > 0; --j) {
      me.next();
    }
  }

  init(me, seed);
}

function copy(f, t) {
  t.x = f.x.slice();
  t.i = f.i;
  return t;
}

function impl(seed, opts) {
  if (seed == null) seed = +(new Date);
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (state.x) copy(state, xg);
    prng.state = function() { return copy(xg, {}); };
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xorshift7 = impl;
}

})(
  commonjsGlobal,
  module,    // present in node.js
  (typeof undefined) == 'function'    // present with an AMD loader
);
});

var xor4096 = createCommonjsModule(function (module) {
// A Javascript implementaion of Richard Brent's Xorgens xor4096 algorithm.
//
// This fast non-cryptographic random number generator is designed for
// use in Monte-Carlo algorithms. It combines a long-period xorshift
// generator with a Weyl generator, and it passes all common batteries
// of stasticial tests for randomness while consuming only a few nanoseconds
// for each prng generated.  For background on the generator, see Brent's
// paper: "Some long-period random number generators using shifts and xors."
// http://arxiv.org/pdf/1004.3115v1.pdf
//
// Usage:
//
// var xor4096 = require('xor4096');
// random = xor4096(1);                        // Seed with int32 or string.
// assert.equal(random(), 0.1520436450538547); // (0, 1) range, 53 bits.
// assert.equal(random.int32(), 1806534897);   // signed int32, 32 bits.
//
// For nonzero numeric keys, this impelementation provides a sequence
// identical to that by Brent's xorgens 3 implementaion in C.  This
// implementation also provides for initalizing the generator with
// string seeds, or for saving and restoring the state of the generator.
//
// On Chrome, this prng benchmarks about 2.1 times slower than
// Javascript's built-in Math.random().

(function(global, module, define) {

function XorGen(seed) {
  var me = this;

  // Set up generator function.
  me.next = function() {
    var w = me.w,
        X = me.X, i = me.i, t, v;
    // Update Weyl generator.
    me.w = w = (w + 0x61c88647) | 0;
    // Update xor generator.
    v = X[(i + 34) & 127];
    t = X[i = ((i + 1) & 127)];
    v ^= v << 13;
    t ^= t << 17;
    v ^= v >>> 15;
    t ^= t >>> 12;
    // Update Xor generator array state.
    v = X[i] = v ^ t;
    me.i = i;
    // Result is the combination.
    return (v + (w ^ (w >>> 16))) | 0;
  };

  function init(me, seed) {
    var t, v, i, j, w, X = [], limit = 128;
    if (seed === (seed | 0)) {
      // Numeric seeds initialize v, which is used to generates X.
      v = seed;
      seed = null;
    } else {
      // String seeds are mixed into v and X one character at a time.
      seed = seed + '\0';
      v = 0;
      limit = Math.max(limit, seed.length);
    }
    // Initialize circular array and weyl value.
    for (i = 0, j = -32; j < limit; ++j) {
      // Put the unicode characters into the array, and shuffle them.
      if (seed) v ^= seed.charCodeAt((j + 32) % seed.length);
      // After 32 shuffles, take v as the starting w value.
      if (j === 0) w = v;
      v ^= v << 10;
      v ^= v >>> 15;
      v ^= v << 4;
      v ^= v >>> 13;
      if (j >= 0) {
        w = (w + 0x61c88647) | 0;     // Weyl.
        t = (X[j & 127] ^= (v + w));  // Combine xor and weyl to init array.
        i = (0 == t) ? i + 1 : 0;     // Count zeroes.
      }
    }
    // We have detected all zeroes; make the key nonzero.
    if (i >= 128) {
      X[(seed && seed.length || 0) & 127] = -1;
    }
    // Run the generator 512 times to further mix the state before using it.
    // Factoring this as a function slows the main generator, so it is just
    // unrolled here.  The weyl generator is not advanced while warming up.
    i = 127;
    for (j = 4 * 128; j > 0; --j) {
      v = X[(i + 34) & 127];
      t = X[i = ((i + 1) & 127)];
      v ^= v << 13;
      t ^= t << 17;
      v ^= v >>> 15;
      t ^= t >>> 12;
      X[i] = v ^ t;
    }
    // Storing state as object members is faster than using closure variables.
    me.w = w;
    me.X = X;
    me.i = i;
  }

  init(me, seed);
}

function copy(f, t) {
  t.i = f.i;
  t.w = f.w;
  t.X = f.X.slice();
  return t;
}
function impl(seed, opts) {
  if (seed == null) seed = +(new Date);
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (state.X) copy(state, xg);
    prng.state = function() { return copy(xg, {}); };
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xor4096 = impl;
}

})(
  commonjsGlobal,                                     // window object or global
  module,    // present in node.js
  (typeof undefined) == 'function'    // present with an AMD loader
);
});

var tychei = createCommonjsModule(function (module) {
// A Javascript implementaion of the "Tyche-i" prng algorithm by
// Samuel Neves and Filipe Araujo.
// See https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  // Set up generator function.
  me.next = function() {
    var b = me.b, c = me.c, d = me.d, a = me.a;
    b = (b << 25) ^ (b >>> 7) ^ c;
    c = (c - d) | 0;
    d = (d << 24) ^ (d >>> 8) ^ a;
    a = (a - b) | 0;
    me.b = b = (b << 20) ^ (b >>> 12) ^ c;
    me.c = c = (c - d) | 0;
    me.d = (d << 16) ^ (c >>> 16) ^ a;
    return me.a = (a - b) | 0;
  };

  /* The following is non-inverted tyche, which has better internal
   * bit diffusion, but which is about 25% slower than tyche-i in JS.
  me.next = function() {
    var a = me.a, b = me.b, c = me.c, d = me.d;
    a = (me.a + me.b | 0) >>> 0;
    d = me.d ^ a; d = d << 16 ^ d >>> 16;
    c = me.c + d | 0;
    b = me.b ^ c; b = b << 12 ^ d >>> 20;
    me.a = a = a + b | 0;
    d = d ^ a; me.d = d = d << 8 ^ d >>> 24;
    me.c = c = c + d | 0;
    b = b ^ c;
    return me.b = (b << 7 ^ b >>> 25);
  }
  */

  me.a = 0;
  me.b = 0;
  me.c = 2654435769 | 0;
  me.d = 1367130551;

  if (seed === Math.floor(seed)) {
    // Integer seed.
    me.a = (seed / 0x100000000) | 0;
    me.b = seed | 0;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 20; k++) {
    me.b ^= strseed.charCodeAt(k) | 0;
    me.next();
  }
}

function copy(f, t) {
  t.a = f.a;
  t.b = f.b;
  t.c = f.c;
  t.d = f.d;
  return t;
}
function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); };
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.tychei = impl;
}

})(
  commonjsGlobal,
  module,    // present in node.js
  (typeof undefined) == 'function'    // present with an AMD loader
);
});

var _nodeResolve_empty = {};

var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': _nodeResolve_empty
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(_nodeResolve_empty$1);

/*
Copyright 2019 David Bau.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

var seedrandom$1 = createCommonjsModule(function (module) {
(function (global, pool, math) {
//
// The following constants are related to IEEE 754 limits.
//

var width = 256,        // each RC4 output is 0 <= x < 256
    chunks = 6,         // at least six RC4 outputs for each double
    digits = 52,        // there are 52 significant digits in a double
    rngname = 'random', // rngname: name for Math.random and Math.seedrandom
    startdenom = math.pow(width, chunks),
    significance = math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1,
    nodecrypto;         // node.js crypto module, initialized at the bottom.

//
// seedrandom()
// This is the seedrandom function described above.
//
function seedrandom(seed, options, callback) {
  var key = [];
  options = (options == true) ? { entropy: true } : (options || {});

  // Flatten the seed string or build one from local entropy if needed.
  var shortseed = mixkey(flatten(
    options.entropy ? [seed, tostring(pool)] :
    (seed == null) ? autoseed() : seed, 3), key);

  // Use the seed to initialize an ARC4 generator.
  var arc4 = new ARC4(key);

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.
  var prng = function() {
    var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
        d = startdenom,                 //   and denominator d = 2 ^ 48.
        x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };

  prng.int32 = function() { return arc4.g(4) | 0; };
  prng.quick = function() { return arc4.g(4) / 0x100000000; };
  prng.double = prng;

  // Mix the randomness into accumulated entropy.
  mixkey(tostring(arc4.S), pool);

  // Calling convention: what to return as a function of prng, seed, is_math.
  return (options.pass || callback ||
      function(prng, seed, is_math_call, state) {
        if (state) {
          // Load the arc4 state from the given state if it has an S array.
          if (state.S) { copy(state, arc4); }
          // Only provide the .state method if requested via options.state.
          prng.state = function() { return copy(arc4, {}); };
        }

        // If called as a method of Math (Math.seedrandom()), mutate
        // Math.random because that is how seedrandom.js has worked since v1.0.
        if (is_math_call) { math[rngname] = prng; return seed; }

        // Otherwise, it is a newer calling convention, so return the
        // prng directly.
        else return prng;
      })(
  prng,
  shortseed,
  'global' in options ? options.global : (this == math),
  options.state);
}

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
function ARC4(key) {
  var t, keylen = key.length,
      me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) {
    s[i] = i++;
  }
  for (i = 0; i < width; i++) {
    s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
    s[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  (me.g = function(count) {
    // Using instance members instead of closure state nearly doubles speed.
    var t, r = 0,
        i = me.i, j = me.j, s = me.S;
    while (count--) {
      t = s[i = mask & (i + 1)];
      r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
    }
    me.i = i; me.j = j;
    return r;
    // For robust unpredictability, the function call below automatically
    // discards an initial batch of values.  This is called RC4-drop[256].
    // See http://google.com/search?q=rsa+fluhrer+response&btnI
  })(width);
}

//
// copy()
// Copies internal state of ARC4 to or from a plain object.
//
function copy(f, t) {
  t.i = f.i;
  t.j = f.j;
  t.S = f.S.slice();
  return t;
}
//
// flatten()
// Converts an object tree to nested arrays of strings.
//
function flatten(obj, depth) {
  var result = [], typ = (typeof obj), prop;
  if (depth && typ == 'object') {
    for (prop in obj) {
      try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
    }
  }
  return (result.length ? result : typ == 'string' ? obj : obj + '\0');
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
function mixkey(seed, key) {
  var stringseed = seed + '', smear, j = 0;
  while (j < stringseed.length) {
    key[mask & j] =
      mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
  }
  return tostring(key);
}

//
// autoseed()
// Returns an object for autoseeding, using window.crypto and Node crypto
// module if available.
//
function autoseed() {
  try {
    var out;
    if (nodecrypto && (out = nodecrypto.randomBytes)) {
      // The use of 'out' to remember randomBytes makes tight minified code.
      out = out(width);
    } else {
      out = new Uint8Array(width);
      (global.crypto || global.msCrypto).getRandomValues(out);
    }
    return tostring(out);
  } catch (e) {
    var browser = global.navigator,
        plugins = browser && browser.plugins;
    return [+new Date, global, plugins, global.screen, tostring(pool)];
  }
}

//
// tostring()
// Converts an array of charcodes to a string
//
function tostring(a) {
  return String.fromCharCode.apply(0, a);
}

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to interfere with deterministic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math.random(), pool);

//
// Nodejs and AMD support: export the implementation as a module using
// either convention.
//
if (module.exports) {
  module.exports = seedrandom;
  // When in node.js, try using crypto package for autoseeding.
  try {
    nodecrypto = require$$0;
  } catch (ex) {}
} else {
  // When included as a plain script, set up Math.seedrandom global.
  math['seed' + rngname] = seedrandom;
}


// End anonymous scope, and pass initial values.
})(
  // global: `self` in browsers (including strict mode and web workers),
  // otherwise `this` in Node and other environments
  (typeof self !== 'undefined') ? self : commonjsGlobal,
  [],     // pool: entropy pool starts empty
  Math    // math: package containing random, pow, and seedrandom
);
});

// A library of seedable RNGs implemented in Javascript.
//
// Usage:
//
// var seedrandom = require('seedrandom');
// var random = seedrandom(1); // or any seed.
// var x = random();       // 0 <= x < 1.  Every bit is random.
// var x = random.quick(); // 0 <= x < 1.  32 bits of randomness.

// alea, a 53-bit multiply-with-carry generator by Johannes Baagøe.
// Period: ~2^116
// Reported to pass all BigCrush tests.


// xor128, a pure xor-shift generator by George Marsaglia.
// Period: 2^128-1.
// Reported to fail: MatrixRank and LinearComp.


// xorwow, George Marsaglia's 160-bit xor-shift combined plus weyl.
// Period: 2^192-2^32
// Reported to fail: CollisionOver, SimpPoker, and LinearComp.


// xorshift7, by François Panneton and Pierre L'ecuyer, takes
// a different approach: it adds robustness by allowing more shifts
// than Marsaglia's original three.  It is a 7-shift generator
// with 256 bits, that passes BigCrush with no systmatic failures.
// Period 2^256-1.
// No systematic BigCrush failures reported.


// xor4096, by Richard Brent, is a 4096-bit xor-shift with a
// very long period that also adds a Weyl generator. It also passes
// BigCrush with no systematic failures.  Its long period may
// be useful if you have many generators and need to avoid
// collisions.
// Period: 2^4128-2^32.
// No systematic BigCrush failures reported.


// Tyche-i, by Samuel Neves and Filipe Araujo, is a bit-shifting random
// number generator derived from ChaCha, a modern stream cipher.
// https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf
// Period: ~2^127
// No systematic BigCrush failures reported.


// The original ARC4-based prng included in this library.
// Period: ~2^1600


seedrandom$1.alea = alea;
seedrandom$1.xor128 = xor128;
seedrandom$1.xorwow = xorwow;
seedrandom$1.xorshift7 = xorshift7;
seedrandom$1.xor4096 = xor4096;
seedrandom$1.tychei = tychei;

var seedrandom = seedrandom$1;

class Random {
    constructor(krono) {
        this.uuid = (function () {
            var lut = [];
            for (var i = 0; i < 256; i++) {
                lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
            }
            return function () {
                var d0 = this.float() * 0xffffffff | 0;
                var d1 = this.float() * 0xffffffff | 0;
                var d2 = this.float() * 0xffffffff | 0;
                var d3 = this.float() * 0xffffffff | 0;
                var uuid = lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
                    lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
                    lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
                    lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
                return uuid.toUpperCase();
            };
        })();
        this.krono = krono;
        this.generator = seedrandom(this.krono.config.seed);
        Object.defineProperty(this.krono.config, 'seed', {
            get() {
                return this.krono.config._seed;
            },
            set(value) {
                this.krono.config._seed = value;
                this.setSeed(value);
            }
        });
    }
    setSeed(seed) {
        this.generator = seedrandom(seed);
    }
    int(min = 0, max = 100000000) {
        return Math.round(min - 0.5 + this.generator() * (max - min + 1));
    }
    float(min = 0, max = 1) {
        return this.generator() * (max - min) + min;
    }
    boolean() {
        return Boolean(this.int(0, 1));
    }
    color() {
        return new Color(this.generator(), this.generator(), this.generator());
    }
    fromArray(array) {
        return array[this.int(0, array.length - 1)];
    }
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(this.generator() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

/**
 * spatial-controls v4.0.0 build Wed Feb 24 2021
 * https://github.com/vanruesc/spatial-controls
 * Copyright 2021 Raoul van Rüschen
 * @license Zlib
 */
// src/core/Action.ts
var Action;
(function(Action2) {
  Action2[Action2["MOVE_FORWARD"] = 0] = "MOVE_FORWARD";
  Action2[Action2["MOVE_LEFT"] = 1] = "MOVE_LEFT";
  Action2[Action2["MOVE_BACKWARD"] = 2] = "MOVE_BACKWARD";
  Action2[Action2["MOVE_RIGHT"] = 3] = "MOVE_RIGHT";
  Action2[Action2["MOVE_DOWN"] = 4] = "MOVE_DOWN";
  Action2[Action2["MOVE_UP"] = 5] = "MOVE_UP";
  Action2[Action2["ZOOM_OUT"] = 6] = "ZOOM_OUT";
  Action2[Action2["ZOOM_IN"] = 7] = "ZOOM_IN";
})(Action || (Action = {}));

// src/core/ControlMode.ts
var ControlMode;
(function(ControlMode2) {
  ControlMode2["FIRST_PERSON"] = "first-person";
  ControlMode2["THIRD_PERSON"] = "third-person";
})(ControlMode || (ControlMode = {}));

// src/core/Direction.ts
var Direction;
(function(Direction2) {
  Direction2[Direction2["FORWARD"] = 0] = "FORWARD";
  Direction2[Direction2["LEFT"] = 1] = "LEFT";
  Direction2[Direction2["BACKWARD"] = 2] = "BACKWARD";
  Direction2[Direction2["RIGHT"] = 3] = "RIGHT";
  Direction2[Direction2["DOWN"] = 4] = "DOWN";
  Direction2[Direction2["UP"] = 5] = "UP";
})(Direction || (Direction = {}));

// src/core/PointerBehaviour.ts
var PointerBehaviour;
(function(PointerBehaviour2) {
  PointerBehaviour2["DEFAULT"] = "default";
  PointerBehaviour2["LOCK"] = "lock";
  PointerBehaviour2["LOCK_HOLD"] = "lock-hold";
})(PointerBehaviour || (PointerBehaviour = {}));

// src/input/PointerButton.ts
var PointerButton;
(function(PointerButton2) {
  PointerButton2[PointerButton2["MAIN"] = 0] = "MAIN";
  PointerButton2[PointerButton2["AUXILIARY"] = 1] = "AUXILIARY";
  PointerButton2[PointerButton2["SECONDARY"] = 2] = "SECONDARY";
})(PointerButton || (PointerButton = {}));

// src/managers/MovementState.ts
var MovementState = class {
  constructor() {
    this.reset();
  }
  reset() {
    this.left = false;
    this.right = false;
    this.forward = false;
    this.backward = false;
    this.up = false;
    this.down = false;
    return this;
  }
};
var TWO_PI = Math.PI * 2;
var v = new Vector3();
var m = new Matrix4();
var RotationManager = class {
  constructor(position, quaternion, target, settings) {
    this.position = position;
    this.quaternion = quaternion;
    this.target = target;
    this.settings = settings;
    this.spherical = new Spherical();
  }
  setPosition(position) {
    this.position = position;
    return this;
  }
  setQuaternion(quaternion) {
    this.quaternion = quaternion;
    return this;
  }
  setTarget(target) {
    this.target = target;
    return this;
  }
  restrictAngles() {
    const s = this.spherical;
    const rotation = this.settings.rotation;
    const thetaMin = rotation.getMinAzimuthalAngle();
    const thetaMax = rotation.getMaxAzimuthalAngle();
    const phiMin = rotation.getMinPolarAngle();
    const phiMax = rotation.getMaxPolarAngle();
    s.theta = Math.min(Math.max(s.theta, thetaMin), thetaMax);
    s.phi = Math.min(Math.max(s.phi, phiMin), phiMax);
    s.theta %= TWO_PI;
    s.makeSafe();
    return this;
  }
  restrictRadius() {
    const s = this.spherical;
    const zoom = this.settings.zoom;
    const min = zoom.getMinDistance();
    const max = zoom.getMaxDistance();
    s.radius = Math.min(Math.max(s.radius, min), max);
    return this;
  }
  restrictSpherical() {
    return this.restrictRadius().restrictAngles();
  }
  updateSpherical() {
    if (this.settings.general.getMode() === ControlMode.THIRD_PERSON) {
      v.subVectors(this.position, this.target);
    } else {
      v.subVectors(this.target, this.position).normalize();
    }
    this.spherical.setFromVector3(v);
    return this.restrictSpherical();
  }
  updatePosition() {
    if (this.settings.general.getMode() === ControlMode.THIRD_PERSON) {
      this.position.setFromSpherical(this.spherical).add(this.target);
    }
    return this;
  }
  updateQuaternion() {
    const settings = this.settings;
    const rotation = settings.rotation;
    const target = this.target;
    const up = rotation.getUpVector();
    if (settings.general.getMode() === ControlMode.THIRD_PERSON) {
      m.lookAt(v.subVectors(this.position, target), rotation.getPivotOffset(), up);
    } else {
      m.lookAt(v.set(0, 0, 0), target.setFromSpherical(this.spherical), up);
    }
    this.quaternion.setFromRotationMatrix(m);
    return this;
  }
  adjustSpherical(theta, phi) {
    const s = this.spherical;
    const settings = this.settings;
    const rotation = settings.rotation;
    const invertedY = rotation.isInvertedY();
    const orbit = settings.general.getMode() === ControlMode.THIRD_PERSON;
    s.theta = !rotation.isInvertedX() ? s.theta - theta : s.theta + theta;
    s.phi = (orbit || invertedY) && !(orbit && invertedY) ? s.phi - phi : s.phi + phi;
    return this.restrictAngles().updatePosition();
  }
  zoom(sign) {
    const s = this.spherical;
    const settings = this.settings;
    const zoom = settings.zoom;
    const orbit = settings.general.getMode() === ControlMode.THIRD_PERSON;
    if (zoom.isEnabled() && orbit) {
      const amount = sign * zoom.getSensitivity();
      s.radius = zoom.isInverted() ? s.radius - amount : s.radius + amount;
      this.restrictRadius().position.setFromSpherical(s).add(this.target);
    }
    return this;
  }
  lookAt(point) {
    this.target.copy(point);
    return this.updateSpherical().updateQuaternion();
  }
  getViewDirection(view) {
    const orbit = this.settings.general.getMode() === ControlMode.THIRD_PERSON;
    view.setFromSpherical(this.spherical).normalize();
    return orbit ? view.negate() : view;
  }
  update(timestamp) {
  }
};

// src/core/time.ts
var MILLISECONDS_TO_SECONDS = 1 / 1e3;
var x = new Vector3(1, 0, 0);
var y = new Vector3(0, 1, 0);
var z = new Vector3(0, 0, 1);

// src/managers/TranslationManager.ts
var v2 = new Vector3();
var TranslationManager = class {
  constructor(position, quaternion, target, settings) {
    this.position = position;
    this.quaternion = quaternion;
    this.target = target;
    this.settings = settings;
    this.movementState = new MovementState();
    this.timestamp = 0;
  }
  getMovementState() {
    return this.movementState;
  }
  setPosition(position) {
    this.position = position;
    return this;
  }
  setQuaternion(quaternion) {
    this.quaternion = quaternion;
    return this;
  }
  setTarget(target) {
    this.target = target;
    return this;
  }
  translateOnAxis(axis, distance) {
    v2.copy(axis).applyQuaternion(this.quaternion).multiplyScalar(distance);
    this.position.add(v2);
    if (this.settings.general.getMode() === ControlMode.THIRD_PERSON) {
      this.target.add(v2);
    }
  }
  translate(deltaTime) {
    const state = this.movementState;
    const step = deltaTime * this.settings.translation.getSensitivity();
    if (state.backward) {
      this.translateOnAxis(z, step);
    } else if (state.forward) {
      this.translateOnAxis(z, -step);
    }
    if (state.right) {
      this.translateOnAxis(x, step);
    } else if (state.left) {
      this.translateOnAxis(x, -step);
    }
    if (state.up) {
      this.translateOnAxis(y, step);
    } else if (state.down) {
      this.translateOnAxis(y, -step);
    }
  }
  moveTo(position) {
    if (this.settings.general.getMode() === ControlMode.THIRD_PERSON) {
      v2.subVectors(position, this.target);
      this.target.copy(position);
      this.position.add(v2);
    } else {
      this.position.copy(position);
    }
    return this;
  }
  update(timestamp) {
    if (this.settings.translation.isEnabled()) {
      const elapsed = (timestamp - this.timestamp) * MILLISECONDS_TO_SECONDS;
      this.translate(elapsed);
    }
    this.timestamp = timestamp;
  }
};

// src/input/KeyCode.ts
var KeyCode;
(function(KeyCode2) {
  KeyCode2[KeyCode2["BACKSPACE"] = 8] = "BACKSPACE";
  KeyCode2[KeyCode2["TAB"] = 9] = "TAB";
  KeyCode2[KeyCode2["ENTER"] = 13] = "ENTER";
  KeyCode2[KeyCode2["SHIFT"] = 16] = "SHIFT";
  KeyCode2[KeyCode2["CTRL"] = 17] = "CTRL";
  KeyCode2[KeyCode2["ALT"] = 18] = "ALT";
  KeyCode2[KeyCode2["PAUSE"] = 19] = "PAUSE";
  KeyCode2[KeyCode2["CAPS_LOCK"] = 20] = "CAPS_LOCK";
  KeyCode2[KeyCode2["ESCAPE"] = 27] = "ESCAPE";
  KeyCode2[KeyCode2["SPACE"] = 32] = "SPACE";
  KeyCode2[KeyCode2["PAGE_UP"] = 33] = "PAGE_UP";
  KeyCode2[KeyCode2["PAGE_DOWN"] = 34] = "PAGE_DOWN";
  KeyCode2[KeyCode2["END"] = 35] = "END";
  KeyCode2[KeyCode2["HOME"] = 36] = "HOME";
  KeyCode2[KeyCode2["LEFT"] = 37] = "LEFT";
  KeyCode2[KeyCode2["UP"] = 38] = "UP";
  KeyCode2[KeyCode2["RIGHT"] = 39] = "RIGHT";
  KeyCode2[KeyCode2["DOWN"] = 40] = "DOWN";
  KeyCode2[KeyCode2["INSERT"] = 45] = "INSERT";
  KeyCode2[KeyCode2["DELETE"] = 46] = "DELETE";
  KeyCode2[KeyCode2["DIGIT_0"] = 48] = "DIGIT_0";
  KeyCode2[KeyCode2["DIGIT_1"] = 49] = "DIGIT_1";
  KeyCode2[KeyCode2["DIGIT_2"] = 50] = "DIGIT_2";
  KeyCode2[KeyCode2["DIGIT_3"] = 51] = "DIGIT_3";
  KeyCode2[KeyCode2["DIGIT_4"] = 52] = "DIGIT_4";
  KeyCode2[KeyCode2["DIGIT_5"] = 53] = "DIGIT_5";
  KeyCode2[KeyCode2["DIGIT_6"] = 54] = "DIGIT_6";
  KeyCode2[KeyCode2["DIGIT_7"] = 55] = "DIGIT_7";
  KeyCode2[KeyCode2["DIGIT_8"] = 56] = "DIGIT_8";
  KeyCode2[KeyCode2["DIGIT_9"] = 57] = "DIGIT_9";
  KeyCode2[KeyCode2["A"] = 65] = "A";
  KeyCode2[KeyCode2["B"] = 66] = "B";
  KeyCode2[KeyCode2["C"] = 67] = "C";
  KeyCode2[KeyCode2["D"] = 68] = "D";
  KeyCode2[KeyCode2["E"] = 69] = "E";
  KeyCode2[KeyCode2["F"] = 70] = "F";
  KeyCode2[KeyCode2["G"] = 71] = "G";
  KeyCode2[KeyCode2["H"] = 72] = "H";
  KeyCode2[KeyCode2["I"] = 73] = "I";
  KeyCode2[KeyCode2["J"] = 74] = "J";
  KeyCode2[KeyCode2["K"] = 75] = "K";
  KeyCode2[KeyCode2["L"] = 76] = "L";
  KeyCode2[KeyCode2["M"] = 77] = "M";
  KeyCode2[KeyCode2["N"] = 78] = "N";
  KeyCode2[KeyCode2["O"] = 79] = "O";
  KeyCode2[KeyCode2["P"] = 80] = "P";
  KeyCode2[KeyCode2["Q"] = 81] = "Q";
  KeyCode2[KeyCode2["R"] = 82] = "R";
  KeyCode2[KeyCode2["S"] = 83] = "S";
  KeyCode2[KeyCode2["T"] = 84] = "T";
  KeyCode2[KeyCode2["U"] = 85] = "U";
  KeyCode2[KeyCode2["V"] = 86] = "V";
  KeyCode2[KeyCode2["W"] = 87] = "W";
  KeyCode2[KeyCode2["X"] = 88] = "X";
  KeyCode2[KeyCode2["Y"] = 89] = "Y";
  KeyCode2[KeyCode2["Z"] = 90] = "Z";
  KeyCode2[KeyCode2["META_LEFT"] = 91] = "META_LEFT";
  KeyCode2[KeyCode2["META_RIGHT"] = 92] = "META_RIGHT";
  KeyCode2[KeyCode2["SELECT"] = 93] = "SELECT";
  KeyCode2[KeyCode2["NUMPAD_0"] = 96] = "NUMPAD_0";
  KeyCode2[KeyCode2["NUMPAD_1"] = 97] = "NUMPAD_1";
  KeyCode2[KeyCode2["NUMPAD_2"] = 98] = "NUMPAD_2";
  KeyCode2[KeyCode2["NUMPAD_3"] = 99] = "NUMPAD_3";
  KeyCode2[KeyCode2["NUMPAD_4"] = 100] = "NUMPAD_4";
  KeyCode2[KeyCode2["NUMPAD_5"] = 101] = "NUMPAD_5";
  KeyCode2[KeyCode2["NUMPAD_6"] = 102] = "NUMPAD_6";
  KeyCode2[KeyCode2["NUMPAD_7"] = 103] = "NUMPAD_7";
  KeyCode2[KeyCode2["NUMPAD_8"] = 104] = "NUMPAD_8";
  KeyCode2[KeyCode2["NUMPAD_9"] = 105] = "NUMPAD_9";
  KeyCode2[KeyCode2["MULTIPLY"] = 106] = "MULTIPLY";
  KeyCode2[KeyCode2["ADD"] = 107] = "ADD";
  KeyCode2[KeyCode2["SUBTRACT"] = 109] = "SUBTRACT";
  KeyCode2[KeyCode2["DECIMAL_POINT"] = 110] = "DECIMAL_POINT";
  KeyCode2[KeyCode2["DIVIDE"] = 111] = "DIVIDE";
  KeyCode2[KeyCode2["F1"] = 112] = "F1";
  KeyCode2[KeyCode2["F2"] = 113] = "F2";
  KeyCode2[KeyCode2["F3"] = 114] = "F3";
  KeyCode2[KeyCode2["F4"] = 115] = "F4";
  KeyCode2[KeyCode2["F5"] = 116] = "F5";
  KeyCode2[KeyCode2["F6"] = 117] = "F6";
  KeyCode2[KeyCode2["F7"] = 118] = "F7";
  KeyCode2[KeyCode2["F8"] = 119] = "F8";
  KeyCode2[KeyCode2["F9"] = 120] = "F9";
  KeyCode2[KeyCode2["F10"] = 121] = "F10";
  KeyCode2[KeyCode2["F11"] = 122] = "F11";
  KeyCode2[KeyCode2["F12"] = 123] = "F12";
  KeyCode2[KeyCode2["NUM_LOCK"] = 144] = "NUM_LOCK";
  KeyCode2[KeyCode2["SCROLL_LOCK"] = 145] = "SCROLL_LOCK";
  KeyCode2[KeyCode2["SEMICOLON"] = 186] = "SEMICOLON";
  KeyCode2[KeyCode2["EQUAL_SIGN"] = 187] = "EQUAL_SIGN";
  KeyCode2[KeyCode2["COMMA"] = 188] = "COMMA";
  KeyCode2[KeyCode2["DASH"] = 189] = "DASH";
  KeyCode2[KeyCode2["PERIOD"] = 190] = "PERIOD";
  KeyCode2[KeyCode2["FORWARD_SLASH"] = 191] = "FORWARD_SLASH";
  KeyCode2[KeyCode2["GRAVE_ACCENT"] = 192] = "GRAVE_ACCENT";
  KeyCode2[KeyCode2["OPEN_BRACKET"] = 219] = "OPEN_BRACKET";
  KeyCode2[KeyCode2["BACK_SLASH"] = 220] = "BACK_SLASH";
  KeyCode2[KeyCode2["CLOSE_BRACKET"] = 221] = "CLOSE_BRACKET";
  KeyCode2[KeyCode2["SINGLE_QUOTE"] = 222] = "SINGLE_QUOTE";
})(KeyCode || (KeyCode = {}));
var GeneralSettings = class extends EventDispatcher {
  constructor() {
    super();
    this.mode = ControlMode.FIRST_PERSON;
    this.previousMode = this.mode;
  }
  getPreviousMode() {
    return this.previousMode;
  }
  getMode() {
    return this.mode;
  }
  setMode(value) {
    if (this.mode !== value) {
      this.mode = value;
      this.dispatchEvent({type: "change"});
      this.previousMode = value;
    }
  }
  copy(settings) {
    this.mode = settings.getMode();
    return this;
  }
  clone() {
    const clone = new GeneralSettings();
    return clone.copy(this);
  }
  fromJSON(json) {
    this.mode = json.mode;
    return this;
  }
  toJSON() {
    return {
      mode: this.mode
    };
  }
};

// src/settings/KeyBindings.ts
var KeyBindings = class {
  constructor() {
    this.defaultActions = new Map();
    this.actions = new Map();
  }
  reset() {
    this.actions = new Map(this.defaultActions);
    return this;
  }
  setDefault(actions) {
    this.defaultActions = actions;
    return this.reset();
  }
  clearDefault() {
    this.defaultActions.clear();
    return this;
  }
  clear() {
    this.actions.clear();
    return this;
  }
  copy(keyBindings) {
    this.defaultActions = new Map(keyBindings.defaultActions);
    this.actions = new Map(keyBindings.actions);
    return this;
  }
  clone() {
    const clone = new KeyBindings();
    return clone.copy(this);
  }
  fromJSON(json) {
    this.defaultActions = new Map(json.defaultActions);
    this.actions = new Map(json.actions);
    return this;
  }
  has(keyCode) {
    return this.actions.has(keyCode);
  }
  get(keyCode) {
    return this.actions.get(keyCode);
  }
  set(keyCode, action) {
    this.actions.set(keyCode, action);
    return this;
  }
  delete(keyCode) {
    return this.actions.delete(keyCode);
  }
  toJSON() {
    return {
      defaultActions: [...this.defaultActions],
      actions: [...this.actions]
    };
  }
};
var PointerSettings = class extends EventDispatcher {
  constructor() {
    super();
    this.behaviour = PointerBehaviour.DEFAULT;
    this.sensitivity = 1e-3;
  }
  getBehaviour() {
    return this.behaviour;
  }
  setBehaviour(value) {
    this.behaviour = value;
    this.dispatchEvent({type: "change"});
  }
  getSensitivity() {
    return this.sensitivity;
  }
  setSensitivity(value) {
    this.sensitivity = value;
    this.dispatchEvent({type: "change"});
  }
  copy(settings) {
    this.behaviour = settings.getBehaviour();
    this.sensitivity = settings.getSensitivity();
    return this;
  }
  clone() {
    const clone = new PointerSettings();
    return clone.copy(this);
  }
  fromJSON(json) {
    this.behaviour = json.behaviour;
    this.sensitivity = json.sensitivity;
    return this;
  }
  toJSON() {
    return {
      behaviour: this.behaviour,
      sensitivity: this.sensitivity
    };
  }
};
var RotationSettings = class extends EventDispatcher {
  constructor() {
    super();
    this.up = new Vector3();
    this.up.copy(y);
    this.pivotOffset = new Vector3();
    this.minAzimuthalAngle = Number.NEGATIVE_INFINITY;
    this.maxAzimuthalAngle = Number.POSITIVE_INFINITY;
    this.minPolarAngle = 0;
    this.maxPolarAngle = Math.PI;
    this.invertedX = false;
    this.invertedY = false;
    this.sensitivityX = 1;
    this.sensitivityY = 1;
  }
  getUpVector() {
    return this.up;
  }
  setUpVector(value) {
    this.up = value;
    this.dispatchEvent({type: "change"});
  }
  getPivotOffset() {
    return this.pivotOffset;
  }
  setPivotOffset(value) {
    this.pivotOffset = value;
    this.dispatchEvent({type: "change"});
  }
  getMinAzimuthalAngle() {
    return this.minAzimuthalAngle;
  }
  setMinAzimuthalAngle(value) {
    this.minAzimuthalAngle = value;
    this.dispatchEvent({type: "change"});
  }
  getMaxAzimuthalAngle() {
    return this.maxAzimuthalAngle;
  }
  setMaxAzimuthalAngle(value) {
    this.maxAzimuthalAngle = value;
    this.dispatchEvent({type: "change"});
  }
  getMinPolarAngle() {
    return this.minPolarAngle;
  }
  setMinPolarAngle(value) {
    this.minPolarAngle = value;
    this.dispatchEvent({type: "change"});
  }
  getMaxPolarAngle() {
    return this.maxPolarAngle;
  }
  setMaxPolarAngle(value) {
    this.maxPolarAngle = value;
    this.dispatchEvent({type: "change"});
  }
  isInvertedX() {
    return this.invertedX;
  }
  setInvertedX(value) {
    this.invertedX = value;
    this.dispatchEvent({type: "change"});
  }
  isInvertedY() {
    return this.invertedY;
  }
  setInvertedY(value) {
    this.invertedY = value;
    this.dispatchEvent({type: "change"});
  }
  getSensitivityX() {
    return this.sensitivityX;
  }
  setSensitivityX(value) {
    this.sensitivityX = value;
    this.dispatchEvent({type: "change"});
  }
  getSensitivityY() {
    return this.sensitivityY;
  }
  setSensitivityY(value) {
    this.sensitivityY = value;
    this.dispatchEvent({type: "change"});
  }
  setSensitivity(value) {
    this.sensitivityX = this.sensitivityY = value;
    this.dispatchEvent({type: "change"});
  }
  copy(settings) {
    this.up.copy(settings.getUpVector());
    this.pivotOffset.copy(settings.getPivotOffset());
    this.minAzimuthalAngle = settings.getMinAzimuthalAngle();
    this.maxAzimuthalAngle = settings.getMaxAzimuthalAngle();
    this.minPolarAngle = settings.getMinPolarAngle();
    this.maxPolarAngle = settings.getMaxPolarAngle();
    this.invertedX = settings.isInvertedX();
    this.invertedY = settings.isInvertedY();
    this.sensitivityX = settings.getSensitivityX();
    this.sensitivityY = settings.getSensitivityY();
    return this;
  }
  clone() {
    const clone = new RotationSettings();
    return clone.copy(this);
  }
  fromJSON(json) {
    this.up.copy(json.up);
    this.pivotOffset.copy(json.pivotOffset);
    this.minAzimuthalAngle = json.minAzimuthalAngle || Number.NEGATIVE_INFINITY;
    this.maxAzimuthalAngle = json.maxAzimuthalAngle || Number.POSITIVE_INFINITY;
    this.minPolarAngle = json.minPolarAngle;
    this.maxPolarAngle = json.maxPolarAngle;
    this.invertedX = json.invertedX;
    this.invertedY = json.invertedY;
    this.sensitivityX = json.sensitivityX;
    this.sensitivityY = json.sensitivityY;
    return this;
  }
  toJSON() {
    return {
      up: this.up,
      pivotOffset: this.pivotOffset,
      minAzimuthalAngle: this.minAzimuthalAngle,
      maxAzimuthalAngle: this.maxAzimuthalAngle,
      minPolarAngle: this.minPolarAngle,
      maxPolarAngle: this.maxPolarAngle,
      invertedX: this.invertedX,
      invertedY: this.invertedY,
      sensitivityX: this.sensitivityX,
      sensitivityY: this.sensitivityY
    };
  }
};
var TranslationSettings = class extends EventDispatcher {
  constructor() {
    super();
    this.enabled = true;
    this.sensitivity = 1;
  }
  isEnabled() {
    return this.enabled;
  }
  setEnabled(value) {
    this.enabled = value;
    this.dispatchEvent({type: "change"});
  }
  getSensitivity() {
    return this.sensitivity;
  }
  setSensitivity(value) {
    this.sensitivity = value;
    this.dispatchEvent({type: "change"});
  }
  copy(settings) {
    this.enabled = settings.isEnabled();
    this.sensitivity = settings.getSensitivity();
    return this;
  }
  clone() {
    const clone = new TranslationSettings();
    return clone.copy(this);
  }
  fromJSON(json) {
    this.enabled = json.enabled;
    this.sensitivity = json.sensitivity;
    return this;
  }
  toJSON() {
    return {
      enabled: this.enabled,
      sensitivity: this.sensitivity
    };
  }
};
var ZoomSettings = class extends EventDispatcher {
  constructor() {
    super();
    this.enabled = true;
    this.inverted = false;
    this.minDistance = 1e-6;
    this.maxDistance = Number.POSITIVE_INFINITY;
    this.sensitivity = 1;
  }
  isEnabled() {
    return this.enabled;
  }
  setEnabled(value) {
    this.enabled = value;
    this.dispatchEvent({type: "change"});
  }
  isInverted() {
    return this.inverted;
  }
  setInverted(value) {
    this.inverted = value;
    this.dispatchEvent({type: "change"});
  }
  getMinDistance() {
    return this.minDistance;
  }
  setMinDistance(value) {
    this.minDistance = Math.min(Math.max(value, 1e-6), Number.POSITIVE_INFINITY);
    this.dispatchEvent({type: "change"});
  }
  getMaxDistance() {
    return this.maxDistance;
  }
  setMaxDistance(value) {
    this.maxDistance = Math.min(Math.max(value, this.minDistance), Number.POSITIVE_INFINITY);
    this.dispatchEvent({type: "change"});
  }
  setRange(min, max) {
    this.minDistance = min;
    this.maxDistance = max;
    this.dispatchEvent({type: "change"});
  }
  getSensitivity() {
    return this.sensitivity;
  }
  setSensitivity(value) {
    this.sensitivity = value;
    this.dispatchEvent({type: "change"});
  }
  copy(settings) {
    this.enabled = settings.isEnabled();
    this.inverted = settings.isInverted();
    this.minDistance = settings.getMinDistance();
    this.maxDistance = settings.getMaxDistance();
    this.sensitivity = settings.getSensitivity();
    return this;
  }
  clone() {
    const clone = new ZoomSettings();
    return clone.copy(this);
  }
  fromJSON(json) {
    this.enabled = json.enabled;
    this.inverted = json.inverted;
    this.minDistance = json.minDistance;
    this.maxDistance = json.maxDistance || Number.POSITIVE_INFINITY;
    this.sensitivity = json.sensitivity;
    return this;
  }
  toJSON() {
    return {
      enabled: this.enabled,
      inverted: this.inverted,
      minDistance: this.minDistance,
      maxDistance: this.maxDistance,
      sensitivity: this.sensitivity
    };
  }
};

// src/settings/Settings.ts
var Settings = class extends EventDispatcher {
  constructor() {
    super();
    this.keyBindings = new KeyBindings();
    this.keyBindings.setDefault(new Map([
      [KeyCode.W, Action.MOVE_FORWARD],
      [KeyCode.UP, Action.MOVE_FORWARD],
      [KeyCode.A, Action.MOVE_LEFT],
      [KeyCode.LEFT, Action.MOVE_LEFT],
      [KeyCode.S, Action.MOVE_BACKWARD],
      [KeyCode.DOWN, Action.MOVE_BACKWARD],
      [KeyCode.D, Action.MOVE_RIGHT],
      [KeyCode.RIGHT, Action.MOVE_RIGHT],
      [KeyCode.X, Action.MOVE_DOWN],
      [KeyCode.SPACE, Action.MOVE_UP],
      [KeyCode.PAGE_DOWN, Action.ZOOM_OUT],
      [KeyCode.PAGE_UP, Action.ZOOM_IN]
    ]));
    this.general = new GeneralSettings();
    this.pointer = new PointerSettings();
    this.rotation = new RotationSettings();
    this.translation = new TranslationSettings();
    this.zoom = new ZoomSettings();
    this.general.addEventListener("change", (event) => this.dispatchEvent(event));
    this.pointer.addEventListener("change", (event) => this.dispatchEvent(event));
    this.rotation.addEventListener("change", (event) => this.dispatchEvent(event));
    this.translation.addEventListener("change", (event) => this.dispatchEvent(event));
    this.zoom.addEventListener("change", (event) => this.dispatchEvent(event));
  }
  copy(settings) {
    this.keyBindings.copy(settings.keyBindings);
    this.general.copy(settings.general);
    this.pointer.copy(settings.pointer);
    this.rotation.copy(settings.rotation);
    this.translation.copy(settings.translation);
    this.zoom.copy(settings.zoom);
    this.dispatchEvent({type: "change"});
    return this;
  }
  clone() {
    const clone = new Settings();
    return clone.copy(this);
  }
  fromJSON(json) {
    const settings = JSON.parse(json);
    this.keyBindings.fromJSON(settings.keyBindings);
    this.general.fromJSON(settings.general);
    this.pointer.fromJSON(settings.pointer);
    this.rotation.fromJSON(settings.rotation);
    this.translation.fromJSON(settings.translation);
    this.zoom.fromJSON(settings.zoom);
    this.dispatchEvent({type: "change"});
    return this;
  }
  toBlob() {
    return new Blob([JSON.stringify(this)], {
      type: "text/json"
    });
  }
  toJSON() {
    return {
      keyBindings: this.keyBindings,
      general: this.general,
      pointer: this.pointer,
      rotation: this.rotation,
      translation: this.translation,
      zoom: this.zoom
    };
  }
};

// src/strategies/MovementStrategy.ts
var MovementStrategy = class {
  constructor(movementState, direction) {
    this.movementState = movementState;
    this.direction = direction;
  }
  execute(flag) {
    const state = this.movementState;
    switch (this.direction) {
      case Direction.FORWARD:
        state.forward = flag;
        break;
      case Direction.LEFT:
        state.left = flag;
        break;
      case Direction.BACKWARD:
        state.backward = flag;
        break;
      case Direction.RIGHT:
        state.right = flag;
        break;
      case Direction.DOWN:
        state.down = flag;
        break;
      case Direction.UP:
        state.up = flag;
        break;
    }
  }
};

// src/strategies/ZoomStrategy.ts
var ZoomStrategy = class {
  constructor(rotationManager, zoomIn) {
    this.rotationManager = rotationManager;
    this.zoomIn = zoomIn;
  }
  execute(flag) {
    if (flag) {
      this.rotationManager.zoom(this.zoomIn ? -1 : 1);
    }
  }
};

// src/core/SpatialControls.ts
var v3 = new Vector3();
var SpatialControls = class {
  constructor(position = null, quaternion = null, domElement = document.body) {
    this.domElement = domElement;
    this.settings = new Settings();
    this.settings.addEventListener("change", (event) => this.handleEvent(event));
    this.position = position;
    this.quaternion = quaternion;
    this.target = new Vector3();
    this.rotationManager = new RotationManager(position, quaternion, this.target, this.settings);
    this.translationManager = new TranslationManager(position, quaternion, this.target, this.settings);
    const movementState = this.translationManager.getMovementState();
    this.strategies = new Map([
      [Action.MOVE_FORWARD, new MovementStrategy(movementState, Direction.FORWARD)],
      [Action.MOVE_LEFT, new MovementStrategy(movementState, Direction.LEFT)],
      [Action.MOVE_BACKWARD, new MovementStrategy(movementState, Direction.BACKWARD)],
      [Action.MOVE_RIGHT, new MovementStrategy(movementState, Direction.RIGHT)],
      [Action.MOVE_DOWN, new MovementStrategy(movementState, Direction.DOWN)],
      [Action.MOVE_UP, new MovementStrategy(movementState, Direction.UP)],
      [Action.ZOOM_OUT, new ZoomStrategy(this.rotationManager, false)],
      [Action.ZOOM_IN, new ZoomStrategy(this.rotationManager, true)]
    ]);
    this.lastScreenPosition = new Vector2();
    this.dragging = false;
    this.enabled = false;
    if (position !== null && quaternion !== null) {
      this.target.set(0, 0, -1).applyQuaternion(this.quaternion);
      this.lookAt(this.target);
      if (domElement !== null) {
        this.setEnabled();
      }
    }
  }
  getDomElement() {
    return this.domElement;
  }
  setDomElement(domElement) {
    const enabled = this.enabled;
    if (domElement !== null) {
      if (enabled) {
        this.setEnabled(false);
      }
      this.domElement = domElement;
      this.setEnabled(enabled);
    }
    return this;
  }
  getPosition() {
    return this.position;
  }
  setPosition(x2, y2, z2) {
    if (x2 instanceof Vector3) {
      this.position = x2;
      this.rotationManager.setPosition(x2);
      this.translationManager.setPosition(x2);
    } else {
      this.position.set(x2, y2, z2);
    }
    return this.lookAt(this.target);
  }
  getQuaternion() {
    return this.quaternion;
  }
  setQuaternion(quaternion) {
    this.quaternion = quaternion;
    this.rotationManager.setQuaternion(quaternion);
    this.translationManager.setQuaternion(quaternion);
    if (this.settings.general.getMode() === ControlMode.FIRST_PERSON) {
      this.target.set(0, 0, -1).applyQuaternion(quaternion);
    }
    return this.lookAt(this.target);
  }
  getTarget() {
    return this.target;
  }
  setTarget(x2, y2, z2) {
    if (x2 instanceof Vector3) {
      this.target = x2;
      this.rotationManager.setTarget(x2);
      this.translationManager.setTarget(x2);
    } else {
      this.target.set(x2, y2, z2);
    }
    return this.lookAt(this.target);
  }
  getViewDirection(view) {
    return this.rotationManager.getViewDirection(view);
  }
  copy(controls) {
    const p = this.position = controls.getPosition();
    const q = this.quaternion = controls.getQuaternion();
    const t = this.target = controls.getTarget();
    this.domElement = controls.getDomElement();
    this.settings.copy(controls.settings);
    this.rotationManager.setPosition(p).setQuaternion(q).setTarget(t);
    this.translationManager.setPosition(p).setQuaternion(q).setTarget(t);
    return this.lookAt(t);
  }
  clone() {
    const clone = new SpatialControls();
    return clone.copy(this);
  }
  moveTo(x2, y2, z2) {
    if (x2 instanceof Vector3) {
      this.translationManager.moveTo(x2);
    } else {
      this.translationManager.moveTo(v3.set(x2, y2, z2));
    }
    return this;
  }
  lookAt(x2, y2, z2) {
    if (x2 instanceof Vector3) {
      this.rotationManager.lookAt(x2);
    } else {
      this.rotationManager.lookAt(v3.set(x2, y2, z2));
    }
    return this;
  }
  setPointerLocked(locked = true) {
    if (locked) {
      if (document.pointerLockElement !== this.domElement && this.domElement.requestPointerLock !== void 0) {
        this.domElement.requestPointerLock();
      }
    } else if (document.exitPointerLock !== void 0) {
      document.exitPointerLock();
    }
  }
  setEnabled(enabled = true) {
    const domElement = this.domElement;
    this.translationManager.getMovementState().reset();
    if (enabled && !this.enabled) {
      document.addEventListener("pointerlockchange", this);
      document.addEventListener("visibilitychange", this);
      document.body.addEventListener("keyup", this);
      document.body.addEventListener("keydown", this);
      domElement.addEventListener("mousedown", this);
      domElement.addEventListener("mouseup", this);
      domElement.addEventListener("mouseleave", this);
      domElement.addEventListener("touchstart", this);
      domElement.addEventListener("touchend", this);
      domElement.addEventListener("wheel", this, {passive: true});
    } else if (!enabled && this.enabled) {
      document.removeEventListener("pointerlockchange", this);
      document.removeEventListener("visibilitychange", this);
      document.body.removeEventListener("keyup", this);
      document.body.removeEventListener("keydown", this);
      domElement.removeEventListener("mousedown", this);
      domElement.removeEventListener("mouseup", this);
      domElement.removeEventListener("mouseleave", this);
      domElement.removeEventListener("touchstart", this);
      domElement.removeEventListener("touchend", this);
      domElement.removeEventListener("wheel", this);
      domElement.removeEventListener("mousemove", this);
      domElement.removeEventListener("touchmove", this);
    }
    this.setPointerLocked(false);
    this.enabled = enabled;
    return this;
  }
  handlePointerMoveEvent(event) {
    const settings = this.settings;
    const rotation = settings.rotation;
    const pointerBehaviour = settings.pointer.getBehaviour();
    const pointerSensitivity = settings.pointer.getSensitivity();
    const rotationManager = this.rotationManager;
    const lastScreenPosition = this.lastScreenPosition;
    if (document.pointerLockElement === this.domElement) {
      if (pointerBehaviour === PointerBehaviour.LOCK || this.dragging) {
        rotationManager.adjustSpherical(event.movementX * pointerSensitivity * rotation.getSensitivityX(), event.movementY * pointerSensitivity * rotation.getSensitivityY()).updateQuaternion();
      }
    } else {
      const movementX = event.screenX - lastScreenPosition.x;
      const movementY = event.screenY - lastScreenPosition.y;
      lastScreenPosition.set(event.screenX, event.screenY);
      rotationManager.adjustSpherical(movementX * pointerSensitivity * rotation.getSensitivityX(), movementY * pointerSensitivity * rotation.getSensitivityY()).updateQuaternion();
    }
  }
  handleTouchMoveEvent(event) {
    const settings = this.settings;
    const rotation = settings.rotation;
    const pointerSensitivity = settings.pointer.getSensitivity();
    const rotationManager = this.rotationManager;
    const lastScreenPosition = this.lastScreenPosition;
    const touch = event.touches[0];
    const movementX = touch.screenX - lastScreenPosition.x;
    const movementY = touch.screenY - lastScreenPosition.y;
    lastScreenPosition.set(touch.screenX, touch.screenY);
    rotationManager.adjustSpherical(movementX * pointerSensitivity * rotation.getSensitivityX(), movementY * pointerSensitivity * rotation.getSensitivityY()).updateQuaternion();
  }
  handleMainPointerButton(event, pressed) {
    this.dragging = pressed;
    if (this.settings.pointer.getBehaviour() !== PointerBehaviour.DEFAULT) {
      this.setPointerLocked();
    } else {
      if (pressed) {
        this.lastScreenPosition.set(event.screenX, event.screenY);
        this.domElement.addEventListener("mousemove", this, {passive: true});
      } else {
        this.domElement.removeEventListener("mousemove", this);
      }
    }
  }
  handleAuxiliaryPointerButton(event, pressed) {
  }
  handleSecondaryPointerButton(event, pressed) {
  }
  handlePointerButtonEvent(event, pressed) {
    event.preventDefault();
    switch (event.button) {
      case PointerButton.MAIN:
        this.handleMainPointerButton(event, pressed);
        break;
      case PointerButton.AUXILIARY:
        this.handleAuxiliaryPointerButton(event, pressed);
        break;
      case PointerButton.SECONDARY:
        this.handleSecondaryPointerButton(event, pressed);
        break;
    }
  }
  handlePointerLeaveEvent(event) {
    this.domElement.removeEventListener("mousemove", this);
  }
  handleTouchEvent(event, start) {
    const touch = event.touches[0];
    event.preventDefault();
    if (start) {
      this.lastScreenPosition.set(touch.screenX, touch.screenY);
      this.domElement.addEventListener("touchmove", this, {passive: true});
    } else {
      this.domElement.removeEventListener("touchmove", this);
    }
  }
  handleKeyboardEvent(event, pressed) {
    const keyBindings = this.settings.keyBindings;
    if (keyBindings.has(event.keyCode)) {
      event.preventDefault();
      this.strategies.get(keyBindings.get(event.keyCode)).execute(pressed);
    }
  }
  handleWheelEvent(event) {
    this.rotationManager.zoom(Math.sign(event.deltaY));
  }
  handlePointerLockEvent() {
    if (document.pointerLockElement === this.domElement) {
      this.domElement.addEventListener("mousemove", this, {passive: true});
    } else {
      this.domElement.removeEventListener("mousemove", this);
    }
  }
  handleVisibilityChangeEvent() {
    if (document.hidden) {
      this.translationManager.getMovementState().reset();
      this.domElement.removeEventListener("mousemove", this);
      this.domElement.removeEventListener("touchmove", this);
    }
  }
  onSettingsChanged(event) {
    const general = this.settings.general;
    if (general.getMode() !== general.getPreviousMode()) {
      if (general.getMode() === ControlMode.THIRD_PERSON) {
        v3.copy(this.target);
        this.target.copy(this.position);
        this.position.sub(v3);
      } else {
        this.position.copy(this.target);
        this.target.set(0, 0, -1).applyQuaternion(this.quaternion);
        this.target.add(this.position);
      }
    }
    this.rotationManager.updateSpherical().updatePosition().updateQuaternion();
  }
  handleEvent(event) {
    switch (event.type) {
      case "mousemove":
        this.handlePointerMoveEvent(event);
        break;
      case "touchmove":
        this.handleTouchMoveEvent(event);
        break;
      case "mousedown":
        this.handlePointerButtonEvent(event, true);
        break;
      case "mouseup":
        this.handlePointerButtonEvent(event, false);
        break;
      case "mouseleave":
        this.handlePointerLeaveEvent(event);
        break;
      case "touchstart":
        this.handleTouchEvent(event, true);
        break;
      case "touchend":
        this.handleTouchEvent(event, false);
        break;
      case "keydown":
        this.handleKeyboardEvent(event, true);
        break;
      case "keyup":
        this.handleKeyboardEvent(event, false);
        break;
      case "wheel":
        this.handleWheelEvent(event);
        break;
      case "pointerlockchange":
        this.handlePointerLockEvent();
        break;
      case "visibilitychange":
        this.handleVisibilityChangeEvent();
        break;
      case "change":
        this.onSettingsChanged(event);
        break;
    }
  }
  update(timestamp) {
    this.rotationManager.update(timestamp);
    this.translationManager.update(timestamp);
  }
  dispose() {
    this.setEnabled(false);
  }
};

function initControls(krono) {
    krono.controls = new SpatialControls(krono.defaultCamera.position, krono.defaultCamera.quaternion, krono.renderer.domElement);
    krono.controls.setEnabled(false);
    krono.controls.settings.general.setMode(ControlMode.FIRST_PERSON);
    krono.controls.settings.pointer.setBehaviour(PointerBehaviour.DEFAULT);
    krono.controls.settings.zoom.enabled = false;
    krono.controls.settings.keyBindings.delete(KeyCode.W);
    krono.controls.settings.keyBindings.delete(KeyCode.A);
    krono.controls.settings.keyBindings.delete(KeyCode.S);
    krono.controls.settings.keyBindings.delete(KeyCode.D);
    krono.controls.settings.keyBindings.delete(KeyCode.X);
    krono.controls.settings.keyBindings.delete(KeyCode.SPACE);
    krono.controls.settings.keyBindings.delete(KeyCode.PAGE_DOWN);
    krono.controls.settings.keyBindings.delete(KeyCode.PAGE_UP);
    krono.controls.setOverviewMode = (status) => setOverviewMode(krono, status);
}
function setOverviewMode(krono, status) {
    krono.controls.setEnabled(status);
    krono.controls.settings.general.setMode((status) ? ControlMode.THIRD_PERSON : ControlMode.FIRST_PERSON);
    krono.controls.settings.zoom.enabled = status;
    krono.controls.lookAt(new Vector3(0, 0, 0));
    if (krono.controls.enabled) {
        krono.controls.setPosition(krono.camera.position);
        krono.controls.setQuaternion(krono.camera.quaternion);
    }
}

function getDefaultConfig() {
    return {
        version: '2.0.0',
        seed: Date.now(),
        editorVariableName: '__KRONO_EDITOR_INSTANCE__',
        defaultCameraName: 'KRONO_DEFAULT_CAMERA',
        rootSceneName: 'KRONO_ROOT_SCENE',
        enabled: true,
        editor: false,
        debug: false,
        animationMode: ANIMATION_MODE$1.SCROLL,
        keyframes: [
            {
                audios: [],
                keyframes: []
            }
        ],
        chunks: [],
        audios: [],
        cameraName: null,
        cameraAnimationName: null,
        mainScenePath: null,
        envMapPath: null,
        basisPath: null,
        dracoPath: null,
        browserAntialias: false,
        msaaAntialias: false,
        msaaSamples: 2,
        smaaAntialias: false,
        alpha: false,
        centerCameraOnModel: false,
        disableUpdatingIfTabIsInactive: true,
        disableUpdatingIfCanvasIsNotInViewport: true,
        onAfterTick: null,
        _seed: Date.now(),
        _basisPath: null,
        _dracoPath: null,
    };
}
function assignConfigFromOptions(config, options) {
    Object.keys(config).forEach(k => {
        if (options[k]) {
            config[k] = options[k];
        }
    });
}

const styles = `
.krono-stats {
  position: fixed;
  top: 0;
  left: 0;
  margin: 0;
  padding: 10px;
  color: #fff;
  font-size: 16pt;
  font-family: 'Helvetica', sans-serif;
  font-weight: bold;
  text-shadow: 1px 1px 0px rgba(0, 0, 0, 1);
  white-space: pre;
  z-index: 1;
  pointer-events: none;
}`;
class DebugStats {
    constructor(krono) {
        this._enabled = false;
        this.roundBorder = 3;
        this.touchCount = 0;
        this.touchLimit = 10;
        this.krono = krono;
        this.krono.renderer.getContext();
        this.cameraPosition = new Vector3();
        this.cameraQuaternion = new Quaternion();
    }
    get enabled() {
        return this._enabled;
    }
    set enabled(v) {
        this._enabled = v;
        if (!this.element) {
            this.generateStyles();
            this.element = this.generateMarkup();
        }
        this.text = '';
        this.element.innerHTML = this.text;
    }
    generateMarkup() {
        const p = document.createElement('p');
        p.classList.add('krono-stats');
        this.krono.container.canvas.appendChild(p);
        return p;
    }
    generateStyles() {
        const style = document.createElement('style');
        style.innerHTML = styles;
        this.krono.container.canvas.appendChild(style);
    }
    handleTouchEnd(e) {
        this.touchCount++;
        if (this.touchCount > this.touchLimit) {
            this.touchCount = 0;
            this.enabled = !this.enabled;
        }
    }
    update() {
        if (this.enabled) {
            this.updateCameraInfo();
            this.text = this.getCurrentText();
            this.element.innerHTML = this.text;
        }
    }
    updateCameraInfo() {
        const { camera } = this.krono;
        this.cameraPosition.x = camera.position.x.toFixed(this.roundBorder).toLocaleString();
        this.cameraPosition.y = camera.position.y.toFixed(this.roundBorder).toLocaleString();
        this.cameraPosition.z = camera.position.z.toFixed(this.roundBorder).toLocaleString();
        this.cameraQuaternion.x = camera.quaternion.x.toFixed(this.roundBorder).toLocaleString();
        this.cameraQuaternion.y = camera.quaternion.y.toFixed(this.roundBorder).toLocaleString();
        this.cameraQuaternion.z = camera.quaternion.z.toFixed(this.roundBorder).toLocaleString();
        this.cameraQuaternion.w = camera.quaternion.w.toFixed(this.roundBorder).toLocaleString();
    }
    getCurrentText() {
        const { config, stats, bounds, controls, renderer, effects, postEffects, } = this.krono;
        let t = `krono ${config.version} (${stats.fps} fps)

${navigator.userAgent}

${navigator.platform}`;
        if (navigator.hardwareConcurrency) {
            t += `, ${navigator.hardwareConcurrency} core`;
            if (navigator.hardwareConcurrency > 1) {
                t += 's';
            }
        }
        if (navigator.deviceMemory) {
            t += `, ${navigator.deviceMemory} GB of RAM`;
        }
        t += `
${bounds.canvas.width}×${bounds.canvas.height}, ${window.devicePixelRatio}x pixel ratio, ${screen.colorDepth}-bit color (${stats.videoCardVendor})
${stats.videoCardRenderer}, ${stats.contextName}

precision: ${stats.precision}
max texture size: ${stats.maxTextureSize.toLocaleString()}

scroll: ${Math.round(this.krono.scroll.percentage.y * 100)}%
fly: ${controls.enabled}

xyz: ${this.cameraPosition.x} / ${this.cameraPosition.y} / ${this.cameraPosition.z}
xyzw: ${this.cameraQuaternion.x} / ${this.cameraQuaternion.y} / ${this.cameraQuaternion.z} / ${this.cameraQuaternion.w}

`;
        if (stats.isMemoryInfoAvailable) {
            t +=
                `mem: ${Math.round(stats.heapPercentage * 100)}% ${Math.round(stats.heapUsage)} / ${stats.heapLimit} MB
`;
        }
        t +=
            `geometries: ${renderer.info.memory.geometries.toLocaleString()}
textures: ${renderer.info.memory.textures.toLocaleString()}
programs: ${renderer.info.programs.length.toLocaleString()}

calls: ${renderer.info.render.calls.toLocaleString()}
triangles: ${renderer.info.render.triangles.toLocaleString()}
points: ${renderer.info.render.points.toLocaleString()}
lines: ${renderer.info.render.lines.toLocaleString()}
frame: ${renderer.info.render.frame.toLocaleString()}

effects: ${effects.length}
post effects: ${postEffects.length}
`;
        return t;
    }
}

function initAssets(krono) {
    krono.assets = {
        mainScene: undefined,
        chunks: {},
        audios: {},
        smaa: {
            area: undefined,
            search: undefined
        }
    };
}

class ScrollManager {
    constructor(krono) {
        this.position = new Vector2(0, 0);
        this.percentage = new Vector2(0, 0);
        this.delta = new Vector2(0, 0);
        this.krono = krono;
    }
    initListeners() {
        this.krono.container.scroll.addEventListener('scroll', this.onScroll.bind(this), false);
    }
    onScroll() {
        const { container, bounds } = this.krono;
        updateContainersBounds(this.krono);
        let windowHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight);
        let scrollLeft = container.scroll.scrollLeft | container.scroll.pageXOffset;
        let scrollTop = container.scroll.scrollTop | container.scroll.pageYOffset;
        this.height = container.scroll.scrollHeight | windowHeight;
        this.heightWithoutCanvas = this.height - bounds.canvas.height;
        this.delta.x = scrollLeft - this.position.x;
        this.delta.y = scrollTop - this.position.y;
        this.position.x = scrollLeft;
        this.position.y = scrollTop;
        this.percentage.y = this.position.y / this.heightWithoutCanvas;
        this.isCanvasInViewport = isElementInViewport(bounds.canvas);
    }
}

function disposeScene(scene) {
    scene.traverse((obj) => {
        if (obj.geometry) {
            obj.geometry.dispose();
        }
        if (obj.material) {
            for (let key in obj.material) {
                if (obj.material[key] instanceof Texture) {
                    obj.material[key].dispose();
                }
            }
            obj.material.dispose();
        }
    });
}
function dispose(krono) {
    krono.effects.forEach(effect => effect.dispose());
    disposeScene(krono.scene);
    if (krono.assets.mainScene !== undefined) {
        krono.assets.mainScene.scenes.forEach(scene => disposeScene(scene));
    }
    if (Object.keys(krono.assets.chunks).length > 0) {
        krono.assets.chunks.forEach(chunk => {
            chunk.scenes.forEach(scene => disposeScene(scene));
        });
    }
    krono.renderer.forceContextLoss();
    krono.effectComposer.dispose();
    krono.renderer.dispose();
    krono.renderer.domElement.remove();
}

class Krono {
    constructor(options) {
        this.clock = new Clock();
        this.config = getDefaultConfig();
        assignConfigFromOptions(this.config, options);
        if (options.editor) {
            window.parent[this.config.editorVariableName] = this;
        }
        initContainer(this);
        initBounds(this);
        this.container.canvas = options.canvasContainer;
        this.container.scroll = options.scrollContainer;
        updateContainersBounds(this);
        initScene(this);
        initCamera(this);
        initAudioListener(this);
        initLoaders(this);
        initAssets(this);
        this.chunks = [];
        this.effectsList = EffectsList;
        this.effectsKeyedList = EffectsKeyedList;
        this.effects = [];
        this.postEffects = [];
        this.audios = [];
        this.animationMixers = [];
        this.animationMixersScrollUpdaters = [];
        this.materialsToUpdate = [];
        this.resize = () => resize(this);
        this.dispose = () => dispose(this);
        this.render = (delta) => render(this, delta);
        this.initEffect = initEffect;
        this.changeCamera = (camera) => changeCamera(this, camera);
        this.changeKeyframes = (keyframes) => changeKeyframes(this, keyframes);
        this.removeAllEffects = () => removeAllEffects(this);
        this.suspendAudioContext = () => suspendAudioContext(this);
        this.resumeAudioContext = () => resumeAudioContext(this);
        this.updateCameraFrustum = () => updateCameraFrustum(this);
        this.setShadowCasting = setShadowCasting;
        this.setShadowReceiving = setShadowReceiving;
        this.onLoad = options.onLoad;
        this.loadingManager.onProgress = options.onProgress;
        if (this.config.browserAntialias && this.config.msaaAntialias) {
            console.error('"config.browserAntialias" and "config.msaaAntialias" is both setted to true. You need to use just one, usage of both is bad for performance. For details see "core/config.ts".');
        }
        initRenderer(this);
        initRenderPass(this);
        initEffectComposer(this);
        this.container.canvas.appendChild(this.renderer.domElement);
        this.raycasting = new Raycasting(this);
        this.stats = new Stats(this);
        this.optimizations = new Optimizations(this);
        this.random = new Random(this);
        this.scroll = new ScrollManager(this);
        this.pointer = new PointerManager(this);
        initEvents(this);
        initControls(this);
    }
    load() {
        return load(this, this.afterLoadInit.bind(this));
    }
    enable() {
        this.config.enabled = true;
    }
    disable() {
        this.config.enabled = false;
    }
    afterLoadInit() {
        afterLoadInit(this);
        this.keyframesScrollUpdater = this.animationMixersScrollUpdaters.filter(a => a instanceof KeyframesScrollUpdater)[0];
        if (this.config.debug) {
            this.debugStats = new DebugStats(this);
            console.log(this);
        }
        if (this.onLoad) {
            this.onLoad();
        }
    }
    changeConfig(options) {
        assignConfigFromOptions(this.config, options);
    }
    addMaterialToUpdate(material) {
        this.materialsToUpdate.push(material);
    }
    removeMaterialToUpdate(material) {
        const index = this.materialsToUpdate.indexOf(material);
        if (index > -1) {
            this.materialsToUpdate.splice(index, 1);
        }
    }
}

export { AmbientLightEffect, AspectCameraEffect, Audio, AudioEffect, BackgroundEffect, BloomPostEffect, ChromaticAberrationPostEffect, ClippingEffect, DepthOfFieldPostEffect, DirectionalLightEffect, DistanceCameraEffect, Effect, FogEffect, FovCameraEffect, FrustumCameraEffect, GlitchPostEffect, HighPassAudioEffect, HuePostEffect, Krono, LightEffect, LoopAudioEffect, LowPassAudioEffect, NoisePostEffect, ObjectBloomEffect, OpacityEffect, PixelRatioEffect, PixelationPostEffect, PlayAudioEffect, PositionObjectEffect, PostEffect, RealisticPreset, RotationObjectEffect, SMAAEffect, SaturationPostEffect, ScaleObjectEffect, ScrollInertiaEffect, ShadowTypeEffect, SpeedAudioEffect, TextureEffect, ToneMappingEffect, VolumeAudioEffect, WireframeEffect, ZoomCameraEffect };
//# sourceMappingURL=krono.esm.js.map
