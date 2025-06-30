export interface AlimentoNutricional {
    id: number;
    grupo: string;
    subgrupo: string;
    nombreAlimento: string;
    pesoNeto: number | null;
    energiaKcal: number | null;
    aguaG: number | null;
    proteinaAnimalG: number | null;
    proteinaVegetalG: number | null;
    nitrogenoAnimalG: number | null;
    nitrogenoVegetalG: number | null;
    grasaAnimalG: number | null;
    grasaVegetalG: number | null;
    choCarbohidratoG: number | null;
    fibraG: number | null;
    calcioAnimalMg: number | null;
    calcioVegetalMg: number | null;
    fosforoMg: number | null;
    hierroHemMg: number | null;
    hierroNoHemMg: number | null;
    retinolMcg: number | null;
    vitaminaB1TiaminaMg: number | null;
    vitaminaB2RiboflavinaMg: number | null;
    niacinaMg: number | null;
    vitaminaCMg: number | null;
    sodioMg: number | null;
    potasioMg: number | null;
    usuarioRegistro: string;
    fechaRegistro: string | null; // ISO string
    usuarioModificacion: string;
    fechaModificacion: string | null; // ISO string
    estado: "ACTIVO" | "INACTIVO" | "ELIMINADO" | "OBSERVADO";
}