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
    protocols: "Protocol Library"
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
    protocols: "Librería de Protocolos"
  }
};

export function useTranslation() {
  const { language = 'en' } = (useStore.getState() as any); // We'll add this to store

  const t = (key: string) => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  return { t };
}
