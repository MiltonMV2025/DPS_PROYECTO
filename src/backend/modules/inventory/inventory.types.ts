export interface InventoryItem {
  id?: number;
  nombre: string;
  categoria: string;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  id_proveedor: number;
}