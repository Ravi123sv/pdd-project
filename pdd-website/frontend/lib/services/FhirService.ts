/**
 * FhirService v1.0
 * Standardized HL7 FHIR Bundle Generator for Clinical Interoperability.
 * Compliant with FHIR R4 (v4.0.1) standard.
 */
export const FhirService = {
    /**
     * Generates a FHIR DiagnosticReport bundle for an ECG/EEG session.
     */
    generateDiagnosticReport: (session: any) => {
        const patientName = session.patient?.name || "Unknown Patient";
        const patientId = session.patient?.patientId || "MRN-0000";

        return {
            resourceType: "Bundle",
            type: "document",
            timestamp: new Date().toISOString(),
            entry: [
                {
                    resource: {
                        resourceType: "Patient",
                        id: patientId.replace(/[^a-zA-Z0-9]/g, ""),
                        identifier: [{ system: "urn:oid:1.2.36.146.595.217.0.1", value: patientId }],
                        name: [{ text: patientName }]
                    }
                },
                {
                    resource: {
                        resourceType: "DiagnosticReport",
                        status: "final",
                        category: [
                            {
                                coding: [
                                    {
                                        system: "http://terminology.hl7.org/CodeSystem/v2-0074",
                                        code: session.testType === 'EEG' ? "EEG" : "ECG",
                                        display: session.testType
                                    }
                                ]
                            }
                        ],
                        code: {
                            coding: [
                                {
                                    system: "http://loinc.org",
                                    code: session.testType === 'EEG' ? "11503-0" : "34534-8",
                                    display: `${session.testType} Diagnostic Report`
                                }
                            ]
                        },
                        subject: { reference: `Patient/${patientId.replace(/[^a-zA-Z0-9]/g, "")}` },
                        effectiveDateTime: session.startTime,
                        issued: new Date().toISOString(),
                        conclusion: session.aiSummary || "Normal morphology identified.",
                        presentedForm: [
                            {
                                contentType: "application/json",
                                title: `Neural Logic Analysis - ${session.testType}`
                            }
                        ]
                    }
                }
            ]
        };
    },

    /**
     * Converts session data to a downloadable CSV format for researchers.
     */
    convertToCSV: (session: any) => {
        const headers = ["Timestamp", "Patient_MRN", "Modality", "Quality_SQI", "Findings"];
        const row = [
            new Date(session.startTime).toISOString(),
            session.patient?.patientId,
            session.testType,
            session.quality,
            `"${session.findings?.replace(/"/g, '""')}"`
        ];

        return [headers.join(","), row.join(",")].join("\n");
    }
};
