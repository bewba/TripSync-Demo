interface LatLngPoint {
    lat: number;
    lng: number;
    createdAt?: string;
}

interface HeatChunk {
    points: [number, number][];
    color: string;
    startSegmentIdx: number;
    endSegmentIdx: number;
    durationSec: number;
    startTime?: string;
    endTime?: string;
}

interface HeatComputeResult {
    chunks: HeatChunk[];
    renderedPoints: [number, number][];
}

const MAX_RENDER_POINTS = 800;

const getDurationSeconds = (start?: string, end?: string): number | null => {
    if (!start || !end) return null;
    const startMs = new Date(start).getTime();
    const endMs = new Date(end).getTime();
    if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) return null;
    return (endMs - startMs) / 1000;
};

const getSegmentColor = (ratio: number) => {
    if (ratio < 0.25) return '#22c55e';
    if (ratio < 0.5) return '#eab308';
    if (ratio < 0.75) return '#f97316';
    return '#ef4444';
};

const downsampleCoordinates = (coords: LatLngPoint[]): LatLngPoint[] => {
    if (coords.length <= MAX_RENDER_POINTS) return coords;

    // Keep first/last points and take evenly spaced interior samples.
    const interiorCount = coords.length - 2;
    const targetInterior = Math.max(1, MAX_RENDER_POINTS - 2);
    const step = Math.max(1, Math.ceil(interiorCount / targetInterior));

    const sampled: LatLngPoint[] = [coords[0]];
    for (let i = 1; i < coords.length - 1; i += step) {
        sampled.push(coords[i]);
    }

    const last = coords[coords.length - 1];
    if (sampled[sampled.length - 1] !== last) {
        sampled.push(last);
    }

    return sampled;
};

const computeHeatChunks = (actualCoords: LatLngPoint[]): HeatComputeResult => {
    const coords = downsampleCoordinates(actualCoords);

    if (coords.length < 2) {
        return { chunks: [], renderedPoints: coords.map((p) => [p.lat, p.lng]) as [number, number][] };
    }

    const segmentDurations: number[] = [];
    for (let i = 0; i < coords.length - 1; i += 1) {
        const duration = getDurationSeconds(coords[i].createdAt, coords[i + 1].createdAt);
        if (duration != null) segmentDurations.push(duration);
    }

    const minDuration = segmentDurations.length ? Math.min(...segmentDurations) : 0;
    const maxDuration = segmentDurations.length ? Math.max(...segmentDurations) : 0;
    const durationRange = maxDuration - minDuration;

    const renderedPoints: [number, number][] = [];
    const chunks: HeatChunk[] = [];
    let currentChunkColor = '';
    let currentChunkPoints: [number, number][] = [];
    let currentChunkStartIdx = 0;
    let currentChunkDurationSec = 0;

    const flushChunk = (endSegmentIdx: number) => {
        if (currentChunkPoints.length < 2 || !currentChunkColor) return;
        chunks.push({
            points: [...currentChunkPoints],
            color: currentChunkColor,
            startSegmentIdx: currentChunkStartIdx,
            endSegmentIdx,
            durationSec: currentChunkDurationSec,
            startTime: coords[currentChunkStartIdx].createdAt,
            endTime: coords[endSegmentIdx + 1]?.createdAt || coords[endSegmentIdx]?.createdAt,
        });
    };

    for (let i = 0; i < coords.length - 1; i += 1) {
        const start = coords[i];
        const end = coords[i + 1];
        renderedPoints.push([start.lat, start.lng]);

        const durationSeconds = getDurationSeconds(start.createdAt, end.createdAt);
        const ratio = durationSeconds == null || durationRange <= 0
            ? 0.5
            : (durationSeconds - minDuration) / durationRange;
        const segmentColor = getSegmentColor(ratio);
        const normalizedDuration = durationSeconds ?? 0;

        if (!currentChunkColor) {
            currentChunkColor = segmentColor;
            currentChunkPoints = [[start.lat, start.lng], [end.lat, end.lng]];
            currentChunkStartIdx = i;
            currentChunkDurationSec = normalizedDuration;
            continue;
        }

        if (segmentColor === currentChunkColor) {
            currentChunkPoints.push([end.lat, end.lng]);
            currentChunkDurationSec += normalizedDuration;
        } else {
            flushChunk(i - 1);
            currentChunkColor = segmentColor;
            currentChunkPoints = [[start.lat, start.lng], [end.lat, end.lng]];
            currentChunkStartIdx = i;
            currentChunkDurationSec = normalizedDuration;
        }
    }

    flushChunk(coords.length - 2);
    const last = coords[coords.length - 1];
    renderedPoints.push([last.lat, last.lng]);

    return { chunks, renderedPoints };
};

if (typeof self === 'undefined') {
    throw new Error('Worker must run in browser context');
  }


self.onmessage = (event: MessageEvent<{ id: number; coords: LatLngPoint[] }>) => {
    const { id, coords } = event.data;
    const result = computeHeatChunks(coords);
    self.postMessage({ id, result });
};

