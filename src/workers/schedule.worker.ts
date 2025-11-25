import { ScheduleEngine } from "../services/solver/engine";
import { GenerationInput } from "../services/solver/types";

self.onmessage = (e: MessageEvent<GenerationInput>) => {
    const input = e.data;

    try {
        const engine = new ScheduleEngine(input);
        const result = engine.solve();
        self.postMessage({ type: 'complete', result });
    } catch (error) {
        self.postMessage({ type: 'error', error: String(error) });
    }
};
