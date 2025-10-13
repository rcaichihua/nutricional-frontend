// Variables globales de configuración

// Opción 1: Para desarrollo local (si accedes desde la misma PC donde corre el backend)
export const API_URL_BASE = "http://localhost:8088/api";

// Opción 2: Para acceder desde otros dispositivos en la misma red (ej. un celular)
//export const API_URL_BASE = "http://192.168.1.6:8088/api";


// El resto de tu archivo de constantes se mantiene igual...
export const APP_CONFIG = {
  // Configuración de la aplicación
  APP_NAME: 'Nutricional Frontend',
  APP_VERSION: '1.0.0',

  // Configuración de API
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088/api', 
  API_TIMEOUT: 10000,

  // Configuración de paginación
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Configuración de notificaciones
  TOAST_DURATION: 3000,

  // Configuración de validación
  MIN_PASSWORD_LENGTH: 8,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};

// Subgrupos de insumos
export const SUBGRUPOS = {
  AZUCARES_Y_PRODUCTOS_DULCES: 'AZUCARES Y PRODUCTOS DULCES',
  BEBIDAS: 'BEBIDAS',
  CARNERO: 'CARNERO',
  CARNES_OTROS: 'CARNES OTROS',
  CARNES_Y_PREPARADOS: 'CARNES Y PREPARADOS',
  CERDO: 'CERDO',
  CEREALES_Y_GRANOS: 'CEREALES Y GRANOS',
  CEREALES_GRANOS_Y_DERIVADOS: 'CEREALES, GRANOS Y DERIVADOS',
  CRUSTACEOS_Y_MOLUSCOS: 'CRUSTACEOS Y MOLUSCOS',
  CRUSTACEOS_Y_OTROS: 'CRUSTACEOS Y OTROS',
  FORMULAS_LACTEAS: 'FORMULAS LACTEAS',
  FRUTAS_Y_PREPARADOS: 'FRUTAS Y PREPARADOS',
  GALLINA: 'GALLINA',
  HUEVO: 'HUEVO',
  LECHE: 'LECHE',
  LEGUMINOSAS: 'LEGUMINOSAS',
  LEGUMINOSAS_Y_DERIVADOS: 'LEGUMINOSAS Y DERIVADOS',
  MAIZ: 'MAÍZ',
  MISCELANEAS: 'MISCELANEAS (CONDIMENTOS E INDUSTRIALIZADOS)',
  OLEAGINOSAS_Y_DERIVADOS: 'OLEAGINOSAS Y DERIVADOS',
  PAN: 'PAN',
  PESCADOS: 'PESCADOS',
  PESCADOS_EN_CONSEVA: 'PESCADOS EN CONSEVA',
  POLLO: 'POLLO',
  PREPARADOS: 'PREPARADOS',
  QUESO: 'QUESO',
  QUINUA: 'QUINUA',
  TRIGO: 'TRIGO',
  TUBERCULOS_RAICES_Y_PREPARADOS: 'TUBERCULOS, RAICES Y PREPARADOS',
  VACUNO: 'VACUNO',
  VERDURAS: 'VERDURAS',
  VERDURAS_Y_PREPARADOS: 'VERDURAS Y PREPARADOS',
  YOGURT: 'YOGURT',
};

// Constantes de estado
export const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  IDLE: 'idle',
};

// Constantes de tipos de datos
export const DATA_TYPES = {
  INSUMO: 'insumo',
  RECETA: 'receta',
  MENU: 'menu',
};

// Constantes de unidades
export const UNITS = {
  GRAMOS: 'g',
  KILOGRAMOS: 'kg',
  MILILITROS: 'mL',
  LITROS: 'l',
  UNIDADES: 'ud',
  CUCHARADAS: 'cda',
  CUCHARADITAS: 'cdita',
};

// Constantes de nutrientes
export const NUTRIENTS = {
  CALORIAS: 'calorias',
  PROTEINAS: 'proteinas',
  CARBOHIDRATOS: 'carbohidratos',
  GRASAS: 'grasas',
  FIBRA: 'fibra',
  SODIO: 'sodio',
};

export const COLORSCHART = ["#9effac", "#17405c", "#fff000"]; // Carbohidratos, Proteínas, Lípidos

// Configuración de temas
export const THEME = {
  COLORS: {
    PRIMARY: '#3B82F6',
    SECONDARY: '#6B7280',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    INFO: '#06B6D4',
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
  },
};

// Configuración de rutas
export const ROUTES = {
  HOME: '/',
  INSUMOS: '/insumos',
  RECETAS: '/recetas',
  MENU: '/menu',
  COMPARATIVO: '/comparativo',
};

// Configuración de localStorage
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  AUTH_TOKEN: 'auth_token',
  THEME_MODE: 'theme_mode',
  LANGUAGE: 'language',
};

// Configuración de validación de formularios
export const VALIDATION = {
  REQUIRED: 'Este campo es requerido',
  EMAIL: 'Ingrese un email válido',
  MIN_LENGTH: (min) => `Mínimo ${min} caracteres`,
  MAX_LENGTH: (max) => `Máximo ${max} caracteres`,
  NUMERIC: 'Solo se permiten números',
  POSITIVE: 'El valor debe ser positivo',
};