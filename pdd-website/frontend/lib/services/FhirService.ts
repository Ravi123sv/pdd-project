/**
 * FhirService.ts
 * Implements HL7 FHIR v4.0.1 Data Interoperability for NeuroSignal Hub.
 */
export class FhirService {
    static generateBundle(session: any) {
        const bundle = {
            resourceType: "Bundle",
            type: "collection",
            timestamp: new Date().toISOString(),
            entry: [
                {
                    fullUrl: `urn:uuid:patient-${session.patient?.patientId}`,
                    resource: {
                        resourceType: "Patient",
                        identifier: [{ system: "http://neurosignal.org/mrn", value: session.patient?.patientId }],
                        name: [{ text: session.patient?.name }],
                        managingOrganization: { display: session.hospitalId }
                    }
                },
                {
                    fullUrl: `urn:uuid:observation-${session._id}`,
                    resource: {
                        resourceType: "Observation",
                        status: "final",
                        category: [{
                            coding: [{
                                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                                code: "exam",
                                display: "Exam"
                            }]
                        }],
                        code: {
                            coding: [{
                                system: "http://loinc.org",
                                code: session.testType === 'ECG' ? "8601-7" : "34534-8",
                                display: session.testType
                            }]
                        },
                        subject: { reference: `urn:uuid:patient-${session.patient?.patientId}` },
                        effectiveDateTime: session.startTime,
                        valueQuantity: {
                            value: session.quality,
                            unit: "%",
                            system: "http://unitsofmeasure.org",
                            code: "%"
                        },
                        note: [{ text: session.findings || "Clinical session finalized via NeuroSignal Hub." }]
                    }
                }
            ]
        };

        return JSON.stringify(bundle, null, 2);
    }

    static download(session: any) {
        const data = this.generateBundle(session);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `FHIR_BUNDLE_${session.patient?.patientId}_${session._id.slice(-6)}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    static downloadCSV(session: any) {
        const headers = "Timestamp,Value_uV,Channel\n";
        const snapshot = session.waveformSnapshot || [];
        const rows = snapshot.map((val: number, i: number) => {
            const time = new Date(new Date(session.startTime).getTime() + (i * 20)).toISOString();
            return `${time},${val.toFixed(2)},Lead_II`;
        }).join('\n');

        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `SIGNAL_DATA_${session.patient?.patientId}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }
}
