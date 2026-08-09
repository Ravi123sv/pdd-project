"use client";

import { useStore } from "./store/useStore";

const translations: any = {
  en: {
    dashboard: "Dashboard",
    monitor: "Signal Monitor",
    patients: "Patient Registry",
    archive: "Clinical Archive",
    export: "Export Vault",
    settings: "System Settings",
    login: "Login",
    logout: "Log Out",
    welcome: "Welcome",
    hub_online: "Hub Online",
    unit_status: "Multi-Unit Status",
    clinical_feed: "Clinical Feed",
    initialize: "Initialize Stream",
    commit: "Commit to Archive",
    neural_analysis: "Neural Analysis",
    active_history: "Active History",
    longitudinal: "Longitudinal Intelligence",
    security_vault: "Institutional Security Vault",
    protocols: "Protocol Library",
    admission: "Patient Admission",
    mrn: "Clinical MRN",
    patient_name: "Patient Name",
    age: "Age / DOB",
    modality: "Diagnostic Modality",
    sweep_speed: "Sweep Speed",
    gain: "Gain",
    signal_health: "Signal Health",
    neural_sqi: "Neural SQI",
    baseline_overlay: "Baseline Overlay"
  },
  es: {
    dashboard: "Panel",
    monitor: "Monitor de Señal",
    patients: "Registro de Pacientes",
    archive: "Archivo Clínico",
    export: "Bóveda de Exportación",
    settings: "Configuración",
    login: "Iniciar Sesión",
    logout: "Cerrar Sesión",
    welcome: "Bienvenido",
    hub_online: "Hub en Línea",
    unit_status: "Estado de Unidades",
    clinical_feed: "Canal Clínico",
    initialize: "Iniciar Transmisión",
    commit: "Archivar Sesión",
    neural_analysis: "Análisis Neuronal",
    active_history: "Historial Activo",
    longitudinal: "Inteligencia Longitudinal",
    security_vault: "Bóveda de Seguridad",
    protocols: "Librería de Protocolos",
    admission: "Admisión de Pacientes",
    mrn: "MRN Clínico",
    patient_name: "Nombre del Paciente",
    age: "Edad / FN",
    modality: "Modalidad Diagnóstica",
    sweep_speed: "Velocidad de Barrido",
    gain: "Ganancia",
    signal_health: "Salud de la Señal",
    neural_sqi: "SQI Neuronal",
    baseline_overlay: "Superposición de Base"
  }
};

export function useTranslation() {
  const { language = 'en' } = useStore();

  const t = (key: string) => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  return { t };
}
