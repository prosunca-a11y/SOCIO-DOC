export type TipoContribuyente = 'Ordinario' | 'Especial';

export type TipoFlujo = 'socio_a_empresa' | 'empresa_a_socio';

export type TipoActivo = 'VES' | 'USD_EFECTIVO' | 'USD_TRANSFERENCIA' | 'USDT';

export type EstadoContrato = 'activo' | 'cancelado' | 'capitalizado';

export interface Empresa {
  id: string;
  razon_social: string;
  rif_empresa: string;
  registro_mercantil: string; // Ej: Registro Mercantil Segundo de Caracas, Nro. 14, Tomo 22-A
  representante_legal: string;
  cedula_representante: string;
  cargo_representante: string;
  tipo_contribuyente: TipoContribuyente;
  capital_social_ves: number;
  ciudad: string;
  estado: string;
  direccion_fiscal: string;
  telefono: string;
  email: string;
}

export interface Accionista {
  id: string;
  empresa_id: string;
  nombre_accionista: string;
  cedula_accionista: string;
  rif_accionista: string;
  porcentaje_acciones: number;
  cargo_o_condicion: string;
  telefono: string;
  email: string;
  billetera_usdt?: string;
  banco_frecuente?: string;
  numero_cuenta?: string;
}

export interface ActaAsamblea {
  id: string;
  empresa_id: string;
  numero_acta: string;
  tipo_asamblea: 'extraordinaria' | 'ordinaria' | 'mixta';
  fecha_asamblea: string;
  hora_inicio: string;
  hora_fin: string;
  monto_maximo_autorizado_pagar: number; // en USD equivalente
  monto_maximo_autorizado_cobrar: number; // en USD equivalente
  quorum_capital_porcentaje: number;
  estatus_libro_fisico: boolean;
  fecha_asentamiento_libro?: string;
  presidente_mesa: string;
  secretario_mesa: string;
  observaciones?: string;
}

export interface SoporteTransaccion {
  id: string;
  contrato_id: string;
  tipo_soporte: 'bancario' | 'efectivo_caja' | 'blockchain_txid';
  referencia_bancaria?: string;
  banco_origen?: string;
  banco_destino?: string;
  numero_cuenta_origen?: string;
  numero_cuenta_destino?: string;
  wallet_origen?: string;
  wallet_destino?: string;
  txid_blockchain?: string;
  red_blockchain?: string; // TRON TRC-20, ETH ERC-20, Polygon, etc.
  recibo_caja_correlativo?: string;
  fecha_transaccion: string;
  hora_transaccion?: string;
  hash_documento_sha256: string;
  txhash_blockchain_polygon: string;
  block_number: number;
  timestamp_iso: string;
  igtf_aplica: boolean;
  igtf_monto_ves: number;
  igtf_monto_usd: number;
}

export interface ContratoMutuo {
  id: string;
  uuid_publico: string;
  correlativo: string;
  empresa_id: string;
  accionista_id: string;
  tipo_flujo: TipoFlujo;
  tipo_activo: TipoActivo;
  monto_original: number;
  tasa_bcv_fecha: number;
  monto_indexado_usd: number;
  monto_indexado_ves: number;
  aplica_interes: boolean;
  tasa_interes?: number; // % mensual o anual
  plazo_meses: number;
  fecha_inicio: string;
  fecha_vencimiento: string;
  destino_fondos: string;
  motivo_comercial?: string; // Obligatorio si empresa_a_socio
  estado: EstadoContrato;
  riesgo_dividendo_aceptado: boolean;
  saldo_pendiente: number;
  soporte: SoporteTransaccion;
}

export interface TransaccionBancaria {
  id: string;
  empresa_id: string;
  fecha: string;
  banco: string;
  referencia: string;
  concepto: string;
  monto: number;
  tipo: 'credito' | 'debito';
  estado_conciliacion: 'pendiente' | 'conciliado';
  contrato_vinculado_id?: string;
  sugerencia_socio_id?: string;
}

export interface CuentaAsiento {
  codigo: string;
  nombre: string;
  debito: number;
  credito: number;
}

export interface AsientoContable {
  id: string;
  contrato_id: string;
  fecha: string;
  sistema_destino: 'Saint' | 'Profit Plus' | 'Galac' | 'Excel';
  cuentas: CuentaAsiento[];
  glosa: string;
}

export interface CapitalizacionAcreencia {
  id: string;
  contrato_id: string;
  empresa_id: string;
  accionista_id: string;
  fecha_asamblea: string;
  monto_capitalizado_ves: number;
  monto_capitalizado_usd: number;
  capital_anterior_ves: number;
  capital_nuevo_ves: number;
  valor_nominal_accion_ves: number;
  numero_acciones_nuevas: number;
  total_acciones_accionista: number;
  nombre_comisario: string;
  cpc_comisario: string;
  uuid_acta: string;
}
