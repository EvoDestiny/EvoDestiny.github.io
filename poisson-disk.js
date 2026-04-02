/**
 * PoissonDiskSampling — Fixed-density implementation (Bridson's algorithm)
 *
 * Faithful port of the `ri` class from antigravity/main-O7ZY2SOM.js.
 * Internals extracted: tiny-ndarray (integer grid), sphere-random (Box-Muller),
 * Moore neighbourhood with circle filter and distance sort.
 */

// ────────────────────────────────────────────────
//  tiny-ndarray: integer grid with stride indexing
// ────────────────────────────────────────────────
function _tinyNDArrayInteger(shape) {
    var stride = 1;
    var strides = new Array(shape.length);
    for (var i = shape.length; i > 0; i--) {
        strides[i - 1] = stride;
        stride *= shape[i - 1];
    }
    return { stride: strides, data: new Uint32Array(stride) };
}

// ────────────────────────────────────────────────
//  sphere-random: Box-Muller normalised unit vector
//  Returns a uniformly-distributed direction in N-d
// ────────────────────────────────────────────────
function _sphereRandom(dimension, rng) {
    var vec = new Array(dimension);
    var pairs = Math.floor(dimension / 2) << 1;
    var r2 = 0, r, s, a, c;
    for (c = 0; c < pairs; c += 2) {
        r = -2 * Math.log(rng());
        s = Math.sqrt(r);
        a = 2 * Math.PI * rng();
        r2 += r;
        vec[c] = s * Math.cos(a);
        vec[c + 1] = s * Math.sin(a);
    }
    if (dimension % 2) {
        var x = Math.sqrt(-2 * Math.log(rng())) * Math.cos(2 * Math.PI * rng());
        vec[dimension - 1] = x;
        r2 += Math.pow(x, 2);
    }
    for (var norm = 1 / Math.sqrt(r2), c = 0; c < dimension; ++c) vec[c] *= norm;
    return vec;
}

// ────────────────────────────────────────────────
//  Neighbourhood: Moore(range=2) + circle filter + sort
// ────────────────────────────────────────────────
var _neighbourhoodCache = {};

function _getNeighbourhood(dimension) {
    if (_neighbourhoodCache[dimension]) return _neighbourhoodCache[dimension];

    // Moore neighbourhood with range=2
    var range = 2, size = range * 2 + 1;
    var length = Math.pow(size, dimension) - 1;
    var raw = new Array(length);
    var i, d, index, mod;

    for (i = 0; i < length; i++) {
        var vec = raw[i] = new Array(dimension);
        index = i < length / 2 ? i : i + 1; // skip centre cell
        for (d = 1; d <= dimension; d++) {
            mod = index % Math.pow(size, d);
            vec[d - 1] = mod / Math.pow(size, d - 1) - range;
            index -= mod;
        }
    }

    // Filter: keep vectors within approximately-circular shell
    raw = raw.filter(function (v) {
        var dist2 = 0;
        for (var d = 0; d < dimension; d++)
            dist2 += Math.pow(Math.max(0, Math.abs(v[d]) - 1), 2);
        return dist2 < dimension;
    });

    // Add origin
    var origin = [];
    for (d = 0; d < dimension; d++) origin.push(0);
    raw.push(origin);

    // Sort by squared distance
    raw.sort(function (a, b) {
        var da = 0, db = 0;
        for (var d = 0; d < dimension; d++) { da += a[d] * a[d]; db += b[d] * b[d]; }
        return da < db ? -1 : da > db ? 1 : 0;
    });

    _neighbourhoodCache[dimension] = raw;
    return raw;
}

// ────────────────────────────────────────────────
//  Squared Euclidean distance
// ────────────────────────────────────────────────
function _squaredDistance(a, b) {
    var d = 0;
    for (var i = 0; i < a.length; i++) d += Math.pow(a[i] - b[i], 2);
    return d;
}

// ────────────────────────────────────────────────
//  PoissonDiskSampling  (fixed-density, class `ri`)
// ────────────────────────────────────────────────
/**
 * @param {Object} options
 * @param {number[]} options.shape         - Domain [width, height]
 * @param {number}   options.minDistance    - Minimum spacing
 * @param {number}   [options.maxDistance]  - Max spacing (default minDistance×2)
 * @param {number}   [options.tries]       - Attempts per active point (default 30)
 * @param {Function} [rng]                 - RNG, default Math.random
 */
class PoissonDiskSampling {
    constructor(options, rng) {
        if (typeof options.distanceFunction === 'function') {
            throw new Error('PoissonDiskSampling: Fixed-density implementation does not accept distanceFunction');
        }

        this.shape       = options.shape;
        this.minDistance  = options.minDistance;
        this.maxDistance  = options.maxDistance || options.minDistance * 2;
        this.maxTries    = Math.ceil(Math.max(1, options.tries || 30));
        this.rng         = rng || Math.random;

        var maxDim = 0;
        for (var i = 0; i < this.shape.length; i++)
            maxDim = Math.max(maxDim, this.shape[i]);

        var scale   = Math.max(1, maxDim / 128 | 0);
        var epsilon = 1e-14 * scale;

        this.dimension              = this.shape.length;
        this.squaredMinDistance      = this.minDistance * this.minDistance;
        this.minDistancePlusEpsilon  = this.minDistance + epsilon;
        this.deltaDistance           = Math.max(0, this.maxDistance - this.minDistancePlusEpsilon);
        this.cellSize               = this.minDistance / Math.sqrt(this.dimension);
        this.neighbourhood          = _getNeighbourhood(this.dimension);

        this.currentPoint = null;
        this.processList  = [];
        this.samplePoints = [];

        this.gridShape = [];
        for (var i = 0; i < this.dimension; i++)
            this.gridShape.push(Math.ceil(this.shape[i] / this.cellSize));

        this.grid = _tinyNDArrayInteger(this.gridShape);
    }

    /* ── Public API ── */

    addRandomPoint() {
        var point = new Array(this.dimension);
        for (var i = 0; i < this.dimension; i++)
            point[i] = this.rng() * this.shape[i];
        return this.directAddPoint(point);
    }

    addPoint(point) {
        var valid = true;
        if (point.length === this.dimension) {
            for (var i = 0; i < this.dimension && valid; i++)
                valid = point[i] >= 0 && point[i] < this.shape[i];
        } else {
            valid = false;
        }
        return valid ? this.directAddPoint(point) : null;
    }

    directAddPoint(point) {
        var gridIdx = 0, stride = this.grid.stride;
        this.processList.push(point);
        this.samplePoints.push(point);
        for (var i = 0; i < this.dimension; i++)
            gridIdx += (point[i] / this.cellSize | 0) * stride[i];
        this.grid.data[gridIdx] = this.samplePoints.length; // 1-based
        return point;
    }

    inNeighbourhood(point) {
        var dim = this.dimension, stride = this.grid.stride;
        var i, d, gridIdx, cell;

        for (i = 0; i < this.neighbourhood.length; i++) {
            gridIdx = 0;
            for (d = 0; d < dim; d++) {
                cell = (point[d] / this.cellSize | 0) + this.neighbourhood[i][d];
                if (cell < 0 || cell >= this.gridShape[d]) { gridIdx = -1; break; }
                gridIdx += cell * stride[d];
            }
            if (gridIdx !== -1 && this.grid.data[gridIdx] !== 0) {
                var existing = this.samplePoints[this.grid.data[gridIdx] - 1];
                if (_squaredDistance(point, existing) < this.squaredMinDistance) return true;
            }
        }
        return false;
    }

    next() {
        var n, angle, candidate, dist, valid, d;
        while (this.processList.length > 0) {
            if (this.currentPoint === null)
                this.currentPoint = this.processList.shift();

            var base = this.currentPoint;

            for (n = 0; n < this.maxTries; n++) {
                valid = true;
                dist  = this.minDistancePlusEpsilon + this.deltaDistance * this.rng();

                if (this.dimension === 2) {
                    angle     = this.rng() * Math.PI * 2;
                    candidate = [Math.cos(angle), Math.sin(angle)];
                } else {
                    candidate = _sphereRandom(this.dimension, this.rng);
                }

                for (d = 0; valid && d < this.dimension; d++) {
                    candidate[d] = base[d] + candidate[d] * dist;
                    valid = candidate[d] >= 0 && candidate[d] < this.shape[d];
                }

                if (valid && !this.inNeighbourhood(candidate))
                    return this.directAddPoint(candidate);
            }
            n === this.maxTries && (this.currentPoint = null);
        }
        return null;
    }

    fill() {
        if (this.samplePoints.length === 0) this.addRandomPoint();
        while (this.next()) {}
        return this.samplePoints;
    }

    getAllPoints() {
        return this.samplePoints;
    }

    reset() {
        var data = this.grid.data;
        for (var i = 0; i < data.length; i++) data[i] = 0;
        this.samplePoints = [];
        this.currentPoint = null;
        this.processList.length = 0;
    }
}
