import csv
import math
import random
import time

def generate_ecg(duration_sec=10, sample_rate=250):
    """Generates a realistic mock ECG signal burst."""
    total_samples = duration_sec * sample_rate
    ecg_data = []

    for i in range(total_samples):
        # Base heart rate around 75 BPM (1.25 Hz)
        t = i / sample_rate
        # Simulate P-QRS-T wave
        # R-peak
        val = 0.0
        if (i % 200) < 10:  # R-peak every 200 samples
            val = 2.0 + random.uniform(-0.1, 0.1)
        else:
            val = 0.1 * math.sin(t * 2 * math.pi * 1.25) # Baseline

        ecg_data.append(val)
    return ecg_data

def save_to_csv(filename, data, headers):
    with open(filename, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        for val in data:
            writer.writerow([val])

if __name__ == "__main__":
    print("Generating Clinical ECG Burst (10s)...")
    data = generate_ecg()
    save_to_csv("D:/pdd/assets/samples/ecg_burst_gen.csv", data, ["LEAD I"])
    print("Generation Complete: assets/samples/ecg_burst_gen.csv")
