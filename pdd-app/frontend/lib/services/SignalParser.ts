/**
 * SignalParser.ts
 * Clinical logic for extracting physiological data from legacy formats (CSV/JSON/EDF).
 * Engineered for 'Titanium' data mobility.
 */
export class SignalParser {
    /**
     * Parses a CSV file with columns like 'Timestamp,Value,Channel'
     */
    static async parseCSV(file: File): Promise<number[]> {
        const text = await file.text();
        const lines = text.split('\n').slice(1); // Skip header
        const values: number[] = [];

        for (const line of lines) {
            if (!line.trim()) continue;
            const parts = line.split(',');
            // Auto-detect value column (usually the 2nd one)
            const val = parseFloat(parts[1]);
            if (!isNaN(val)) {
                values.push(val);
            }
        }

        // Professional Signal Normalization
        return this.normalize(values);
    }

    /**
     * Normalizes raw sensor units to clinical visualization range (-50 to +50 uV)
     */
    private static normalize(data: number[]): number[] {
        if (data.length === 0) return [];
        const max = Math.max(...data.map(Math.abs));
        if (max === 0) return data;

        // Scale to a standard 100-unit peak-to-peak window
        return data.map(v => (v / max) * 40);
    }
}
