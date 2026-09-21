import React, { useState } from 'react';
import { ContratoMutuo, Empresa, Accionista, ActaAsamblea, CapitalizacionAcreencia } from '../types';
import { formatVES, formatUSD, formatUSDT, formatFechaLarga, numeroALetras } from '../utils/formatters';
import { Printer, Copy, Check, X, ShieldCheck, FileText, Landmark, Download, FileDown } from 'lucide-react';
import { downloadContractWord, downloadContractPDF } from '../utils/documentExport';

interface LegalDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'contrato' | 'recibo_caja' | 'acta_macro' | 'acta_capitalizacion' | 'informe_comisario';
  contrato?: ContratoMutuo;
  empresa: Empresa;
  accionista?: Accionista;
  actaMacro?: ActaAsamblea;
  capitalizacionData?: CapitalizacionAcreencia;
}

export const LegalDocumentModal: React.FC<LegalDocumentModalProps> = ({
  isOpen,
  onClose,
  documentType,
  contrato,
  empresa,
  accionista,
  actaMacro,
  capitalizacionData,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(documentType);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = () => {
    if (contrato && accionista && activeTab === 'contrato') {
      downloadContractWord(contrato, empresa, accionista);
      return;
    }

    // Generic Word download for Recibo, Acta, Informe
    const text = getActiveText();
    const docTitle = activeTab === 'recibo_caja' ? 'Recibo_Caja' :
      activeTab === 'acta_macro' ? 'Acta_Asamblea_Macro' :
      activeTab === 'acta_capitalizacion' ? 'Acta_Capitalizacion' :
      activeTab === 'informe_comisario' ? 'Informe_Comisario' : 'Documento_Legal';

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${docTitle}</title>
        <style>
          @page { size: letter; margin: 2.5cm; }
          body { font-family: 'Times New Roman', serif; font-size: 11.5pt; line-height: 1.4; }
          p { margin-bottom: 10pt; text-align: justify; }
        </style>
      </head>
      <body>
        <div style="border-bottom: 2pt solid #1e3a8a; padding-bottom: 5pt; margin-bottom: 15pt;">
          <strong style="font-size: 12pt; text-transform: uppercase;">${empresa.razon_social}</strong><br/>
          <span style="font-size: 9pt;">R.I.F. ${empresa.rif_empresa} • ${empresa.registro_mercantil}</span>
        </div>
        ${text.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('')}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docTitle}_${contrato ? contrato.correlativo : empresa.rif_empresa}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (contrato && accionista && activeTab === 'contrato') {
      downloadContractPDF(contrato, empresa, accionista);
    } else {
      window.print();
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate legal texts
  const renderContratoText = () => {
    if (!contrato || !accionista) return '';

    const isCrypto = contrato.tipo_activo === 'USDT';
    const isEfectivo = contrato.tipo_activo === 'USD_EFECTIVO';
    const isVES = contrato.tipo_activo === 'VES';
    const isSocioAEmpresa = contrato.tipo_flujo === 'socio_a_empresa';

    if (isCrypto) {
      return `CONTRATO DE MUTUO DE BIENES MUEBLES DIGITALES (CRIPTOPRÉSTAMO)

Nosotros, ${empresa.razon_social}, sociedad mercantil domiciliada en ${empresa.ciudad}, Estado ${empresa.estado}, constituida e inscrita por ante el ${empresa.registro_mercantil}, inscrita en el Registro Único de Información Fiscal (R.I.F.) Nro. ${empresa.rif_empresa}, debidamente representada en este acto por su ${empresa.cargo_representante}, ciudadano(a) ${empresa.representante_legal}, titular de la Cédula de Identidad Nro. ${empresa.cedula_representante}, en lo sucesivo y a los efectos del presente instrumento denominada "${isSocioAEmpresa ? 'LA MUTUARIA' : 'LA MUTUANTE'}", por una parte; y por la otra, el ciudadano ${accionista.nombre_accionista}, mayor de edad, titular de la Cédula de Identidad Nro. ${accionista.cedula_accionista} e inscrito en el R.I.F. Nro. ${accionista.rif_accionista}, en su cualidad de socio y titular del ${accionista.porcentaje_acciones}% del capital social de la prenombrada compañía, quien en lo sucesivo se denominará "${isSocioAEmpresa ? 'EL MUTUANTE' : 'EL MUTUARIO'}", hemos convenido en celebrar como en efecto celebramos el presente CONTRATO DE MUTUO DE BIENES MUEBLES DIGITALES INCORPÓREOS, regido por las siguientes cláusulas:

PRIMERA (OBJETO Y NATURALEZA DEL ACTIVO): ${isSocioAEmpresa ? 'EL MUTUANTE' : 'LA MUTUANTE'} entrega a título de mutuo (préstamo de consumo) a ${isSocioAEmpresa ? 'LA MUTUARIA' : 'EL MUTUARIO'}, un bien mueble intangible, fungible y digital, específicamente la cantidad de ${numeroALetras(contrato.monto_original)} TOKENS DE LA CRIPTOMONEDA ESTABLE DENOMINADA UNITED STATES DOLLAR TETHER (${formatUSDT(contrato.monto_original)}). Las partes reconocen que el token USDT es un criptoactivo fungible respaldado en valor paritario con el Dólar de los Estados Unidos de América, ampliamente aceptado en las transacciones comerciales lícitas dentro de la República Bolivariana de Venezuela.

SEGUNDA (ENTREGA, RED Y VERIFICACIÓN BLOCKCHAIN - PRUEBA MATERIAL): La entrega efectiva e irreversible del activo se efectuó mediante transferencia electrónica en la red descentralizada de bloques ${contrato.soporte.red_blockchain || 'TRON (TRC-20)'}, originada desde la Billetera Digital (Wallet) propiedad de ${isSocioAEmpresa ? 'EL MUTUANTE' : 'LA MUTUANTE'}, dirección: [${contrato.soporte.wallet_origen || 'Wallet_Origen'}], con destino a la Billetera Digital corporativa propiedad de ${isSocioAEmpresa ? 'LA MUTUARIA' : 'EL MUTUARIO'}, dirección: [${contrato.soporte.wallet_destino || 'Wallet_Destino'}]. La transacción quedó formalmente asentada bajo el Identificador de Transacción Hash (TXID) Nro: [${contrato.soporte.txid_blockchain || 'TXID_PENDIENTE'}], ejecutada en fecha ${formatFechaLarga(contrato.soporte.fecha_transaccion)}. Las partes convienen en que la consulta pública del referido Hash en el explorador de la red constituye prueba plena, incontrovertible e irrefutable de la entrega del activo.

TERCERA (VALORACIÓN CONTABLE Y FISCAL VEN-NIF): A los exclusivos efectos de su asentamiento contable en los libros de la empresa conforme a los principios de contabilidad generalmente aceptados en Venezuela (VEN-NIF) y a las exigencias probatorias del Servicio Nacional Integrado de Administración Aduanera y Tributaria (SENIAT), las partes acuerdan registrar la operación en moneda de curso legal por la cantidad de ${formatVES(contrato.monto_indexado_ves)} (${numeroALetras(contrato.monto_indexado_ves)} BOLÍVARES), calculados a la tasa de cambio oficial de referencia del Banco Central de Venezuela (BCV) de Bs. ${contrato.tasa_bcv_fecha.toFixed(2)} por unidad de cuenta para la fecha de la transferencia.

CUARTA (${isSocioAEmpresa ? 'GRATUIDAD Y AUSENCIA DE INTERESES' : 'TASA DE INTERÉS COMERCIAL OBLIGATORIA'}): ${isSocioAEmpresa ? 'El presente préstamo de bienes digitales se efectúa a título estrictamente gratuito, motivado de manera directa en la condición de accionista que ostenta EL MUTUANTE y su interés corporativo en el apalancamiento operativo de la compañía, no devengando intereses de ninguna naturaleza para enervar la presunción de intereses prevista en las leyes tributarias.' : `Por tratarse de un préstamo otorgado por la sociedad mercantil a su accionista y para mitigar la presunción de dividendo prevista en el Artículo 72 de la Ley de Impuesto Sobre la Renta (LISLR), la operación devengará una tasa de interés comercial pactada del ${contrato.tasa_interes || 1.5}% mensual, debiendo la empresa facturar y declarar dichos rendimientos como ingresos gravables.`}

QUINTA (DESTINO DE LOS FONDOS Y PLAZO): Los fondos transferidos son destinados expresamente a: "${contrato.destino_fondos}". La restitución total de la misma cantidad y especie de tokens USDT entregados se efectuará en un plazo no mayor a ${contrato.plazo_meses} meses, con fecha límite improrrogable el ${formatFechaLarga(contrato.fecha_vencimiento)}.

SEXTA (JURISDICCIÓN): Para todos los efectos derivados de este contrato, las partes eligen como domicilio especial, único y excluyente la ciudad de ${empresa.ciudad}, a la jurisdicción de cuyos tribunales declaran someterse.

Se otorgan dos (02) ejemplares de un mismo tenor y efecto en la ciudad de ${empresa.ciudad}, el ${formatFechaLarga(contrato.fecha_inicio)}.`;
    }

    // Traditional or Foreign Currency contract
    return `CONTRATO DE MUTUO (PRÉSTAMO DE DINERO)

Nosotros, ${empresa.razon_social}, sociedad mercantil con domicilio en ${empresa.ciudad}, Estado ${empresa.estado}, constituida e inscrita por ante el ${empresa.registro_mercantil}, bajo el Nro. de R.I.F. ${empresa.rif_empresa}, debidamente representada en este acto por su ${empresa.cargo_representante}, ciudadano(a) ${empresa.representante_legal}, titular de la Cédula de Identidad Nro. ${empresa.cedula_representante}, en lo sucesivo y a todos los efectos legales denominada "${isSocioAEmpresa ? 'LA MUTUARIA' : 'LA MUTUANTE'}", por una parte; y por la otra, el ciudadano(a) ${accionista.nombre_accionista}, de nacionalidad venezolana, mayor de edad, titular de la Cédula de Identidad Nro. ${accionista.cedula_accionista} y del R.I.F. Nro. ${accionista.rif_accionista}, en su calidad de accionista titular del ${accionista.porcentaje_acciones}% de las acciones de la precitada sociedad mercantil, quien en lo sucesivo se denominará "${isSocioAEmpresa ? 'EL MUTUANTE' : 'EL MUTUARIO'}", hemos convenido en celebrar el presente CONTRATO DE MUTUO, sujeto a las disposiciones del Código Civil de Venezuela, el Código de Comercio y a las siguientes estipulaciones:

PRIMERA (OBJETO Y MONTO): ${isSocioAEmpresa ? 'EL MUTUANTE' : 'LA MUTUANTE'} entrega en calidad de mutuo (préstamo de consumo) a ${isSocioAEmpresa ? 'LA MUTUARIA' : 'EL MUTUARIO'}, la cantidad de: ${isVES ? `${numeroALetras(contrato.monto_original)} BOLÍVARES (${formatVES(contrato.monto_original)})` : `${numeroALetras(contrato.monto_original)} DÓLARES DE LOS ESTADOS UNIDOS DE AMÉRICA (${formatUSD(contrato.monto_original)})`}.

SEGUNDA (ENTREGA Y SOPORTE PROBATORIO ANTE EL SENIAT):
${isEfectivo ? `Las partes hacen constar de manera fehaciente que la entrega de los fondos se realizó físicamente en billetes de curso legal en las oficinas de la empresa, expidiéndose de forma simultánea el RECIBO DE INGRESO A CAJA PRINCIPAL Nro. ${contrato.soporte.recibo_caja_correlativo || 'REC-001'} en fecha ${formatFechaLarga(contrato.soporte.fecha_transaccion)}, el cual se anexa y forma parte indisoluble de la contabilidad mercantil de la compañía.` : `La entrega de los fondos se ejecutó mediante transferencia bancaria electrónica originada desde la cuenta Nro. ${contrato.soporte.numero_cuenta_origen || 'CUENTA-ORIGEN'} en el ${contrato.soporte.banco_origen || 'BANCO-ORIGEN'}, con destino a la cuenta Nro. ${contrato.soporte.numero_cuenta_destino || 'CUENTA-DESTINO'} en el ${contrato.soporte.banco_destino || 'BANCO-DESTINO'}, identificada bajo el Número de Referencia Bancaria ${contrato.soporte.referencia_bancaria || 'REF-BANCARIA'} en fecha ${formatFechaLarga(contrato.soporte.fecha_transaccion)}. El comprobante bancario se anexa como Anexo A.`}

TERCERA (${isSocioAEmpresa ? 'GRATUIDAD Y AUSENCIA DE INTERESES' : 'INTERESES COMERCIALES POR REGULACIÓN TRIBUTARIA'}):
${isSocioAEmpresa ? 'Las partes declaran formalmente que el presente mutuo se concede a título estrictamente gratuito, no devengando intereses de ninguna naturaleza en consideración al carácter de socio del MUTUANTE y su legítimo interés en el mantenimiento de la operatividad y liquidez de la empresa, descartándose cualquier rendimiento gravable u omisión de ingresos.' : `En cumplimiento del Artículo 72 de la Ley de Impuesto Sobre la Renta (LISLR) para descartar la presunción de dividendo en préstamos concedidos a accionistas, se fija un interés comercial del ${contrato.tasa_interes || 1.5}% mensual sobre el saldo deudor, el cual será debidamente facturado y retenido conforme a las leyes fiscales vigentes.`}

CUARTA (DESTINO Y MOTIVO CORPORATIVO): Los fondos recibidos serán aplicados de manera estricta y exclusiva para: "${contrato.destino_fondos}". ${contrato.motivo_comercial ? `Asimismo, se deja constancia de la justificación corporativa requerida por la administración tributaria: ${contrato.motivo_comercial}.` : ''}

QUINTA (CLÁUSULA DE INDEXACIÓN CAMBIARIA - TASA OFICIAL BCV): ${isVES ? `A los fines de preservar el valor real del monto entregado y prevenir los efectos de la devaluación monetaria, las partes convienen en fijar como unidad de referencia el Dólar de los Estados Unidos de América. El monto recibido en Bolívares equivale a la suma de ${formatUSD(contrato.monto_indexado_usd)} calculada a la tasa oficial de Bs. ${contrato.tasa_bcv_fecha.toFixed(2)} por dólar emitida por el Banco Central de Venezuela (BCV) en la fecha del desembolso. Al momento de la restitución, LA MUTUARIA pagará la cantidad de Bolívares que resulte de multiplicar el monto indexado por la tasa oficial BCV vigente para el estricto día de la liquidación.` : `El pago de la obligación se efectuará en la misma divisa o en su equivalente en Bolívares liquidado a la tasa oficial del Banco Central de Venezuela (BCV) vigente para el día efectivo del pago.`}

SEXTA (PLAZO Y RESTITUCIÓN): El plazo fijado para la cancelación total de la obligación es de ${contrato.plazo_meses} meses, estableciéndose como fecha límite de vencimiento el ${formatFechaLarga(contrato.fecha_vencimiento)}.

SÉPTIMA (DOMICILIO ESPECIAL): Para todas las controversias o derivaciones legales del presente contrato, las partes fijan como domicilio especial y excluyente la ciudad de ${empresa.ciudad}, Estado ${empresa.estado}.

Se firman dos (02) ejemplares de un mismo tenor y validez, en ${empresa.ciudad}, el ${formatFechaLarga(contrato.fecha_inicio)}.`;
  };

  const renderReciboCaja = () => {
    if (!contrato || !accionista) return '';
    return `================================================================================
RECIBO DE INGRESO A CAJA PRINCIPAL (DIVISAS EN EFECTIVO)
Control Interno Contable Nro: ${contrato.soporte.recibo_caja_correlativo || 'REC-2026-0042'}
================================================================================

EMPRESA: ${empresa.razon_social}
R.I.F.: ${empresa.rif_empresa}
CONDICIÓN TRIBUTARIA: Contribuyente ${empresa.tipo_contribuyente} (Sujeto Pasivo Especial)
DIRECCIÓN: ${empresa.direccion_fiscal}

FECHA DE INGRESO: ${formatFechaLarga(contrato.soporte.fecha_transaccion)}
VALOR REFERENCIAL OFICIAL BCV: Bs. ${contrato.tasa_bcv_fecha.toFixed(2)} por 1.00 USD
EQUIVALENCIA CONTABLE EN BOLÍVARES: ${formatVES(contrato.monto_indexado_ves)}

RECIBÍ del ciudadano(a): ${accionista.nombre_accionista}
Cédula de Identidad: ${accionista.cedula_accionista} | R.I.F.: ${accionista.rif_accionista}
Condición en la entidad: Accionista / Socio Titular del ${accionista.porcentaje_acciones}% del Capital Social.

LA CANTIDAD DE:
${numeroALetras(contrato.monto_original)} DÓLARES DE LOS ESTADOS UNIDOS DE AMÉRICA (${formatUSD(contrato.monto_original)}) en billetes físicos de curso legal.

POR CONCEPTO DE:
Aporte financiero temporal en calidad de Mutuo (Préstamo de Accionista), según lo estipulado formalmente en el Contrato de Mutuo Nro. ${contrato.correlativo} de fecha ${formatFechaLarga(contrato.fecha_inicio)}, destinado exclusivamente para: "${contrato.destino_fondos}".

ASIENTO CONTABLE VENEZOLANO (VEN-NIF):
--------------------------------------------------------------------------------
1.01.01.02.001 - CAJA PRINCIPAL MONEDA EXTRANJERA (ACTIVO)      ${formatVES(contrato.monto_indexado_ves)} [DÉBITO]
2.01.03.01.001 - CUENTAS POR PAGAR SOCIOS / ACCIONISTAS (PASIVO) ${formatVES(contrato.monto_indexado_ves)} [CRÉDITO]
--------------------------------------------------------------------------------

CONTROL DE RETENCIÓN DE IGTF (IMPUESTO A GRANDES TRANSACCIONES):
${empresa.tipo_contribuyente === 'Especial' ? `• Alícuota aplicable IGTF: 3.00% (Sujeto Pasivo Especial en percepción de moneda extranjera en efectivo).
• Base Imponible: ${formatUSD(contrato.monto_original)} (Bs. ${contrato.monto_indexado_ves.toFixed(2)})
• Monto IGTF Determinado: ${formatUSD(contrato.soporte.igtf_monto_usd)} (Bs. ${contrato.soporte.igtf_monto_ves.toFixed(2)})
• Estatus: Comprobante emitido para entero ante el portal fiscal del SENIAT dentro del calendario legal.` : '• No aplica percepción de IGTF por condición de Contribuyente Ordinario.'}

ENTREGADO POR:                                RECIBIDO EN CAJA POR:
_________________________________             _________________________________
${accionista.nombre_accionista}               ${empresa.representante_legal}
C.I. V-${accionista.cedula_accionista}        C.I. V-${empresa.cedula_representante}
Accionista Mutuante                           ${empresa.cargo_representante}
                                              (SELLO HÚMEDO DE LA EMPRESA)`;
  };

  const renderActaMacro = () => {
    return `ACTA DE ASAMBLEA GENERAL EXTRAORDINARIA DE ACCIONISTAS DE LA SOCIEDAD MERCANTIL ${empresa.razon_social}

Hoy, ${actaMacro ? formatFechaLarga(actaMacro.fecha_asamblea) : '15 de enero de 2026'}, siendo las ${actaMacro?.hora_inicio || '10:00 AM'}, en la sede social de la compañía ${empresa.razon_social}, debidamente inscrita por ante el ${empresa.registro_mercantil}, con R.I.F. Nro. ${empresa.rif_empresa}, domiciliada en ${empresa.ciudad}, Estado ${empresa.estado}; se encuentran presentes la totalidad de los accionistas que representan el cien por ciento (100%) del capital social suscrito y pagado de la compañía. Preside la reunión el Director Presidente ciudadano ${empresa.representante_legal}. El Presidente constata la presencia del quórum legal estatutario y declara válidamente constituida la Asamblea General Extraordinaria de Accionistas, prescindiéndose de la convocatoria por prensa en virtud de hallarse presente el cien por ciento del capital social de la empresa.

Acto seguido, el Presidente somete a consideración de los presentes el único punto del ORDEN DEL DÍA:
"Autorización de líneas de financiamiento operativo y préstamos de mutuo recíproco entre los accionistas y la sociedad mercantil para el ejercicio económico, fijación de límites, condiciones de gratuidad e indexación oficial".

Tomando el uso de la palabra, el Presidente expone a la asamblea que en el marco de la realidad financiera nacional y la necesidad de sostener el capital de trabajo de la sociedad ante fluctuaciones comerciales, resulta imperativo establecer un marco regulatorio de gobierno corporativo que respalde ante las autoridades fiscales (SENIAT) y los principios contables VEN-NIF todas las entradas y salidas de fondos bajo las cuentas "Cuentas por Pagar Accionistas" y "Cuentas por Cobrar Accionistas".

Luego de amplia deliberación, los accionistas APROBARON POR UNANIMIDAD las siguientes resoluciones:

PRIMERA: AUTORIZACIÓN DE LÍNEAS DE APORTE (CUENTAS POR PAGAR ACCIONISTAS): Se autoriza a la Junta Directiva a recibir préstamos (mutuos) de los accionistas hasta por la cantidad máxima acumulada de CIENTO CINCUENTA MIL DÓLARES DE LOS ESTADOS UNIDOS DE AMÉRICA ($150,000.00 USD) o su equivalente en Bolívares o Criptoactivos (USDT). Dichos préstamos serán a título estrictamente gratuito, motivados en el vínculo societario, y podrán incorporar cláusulas de indexación basadas en la tasa de cambio oficial publicada por el Banco Central de Venezuela (BCV), o la entrega de bienes muebles digitales fungibles (USDT).

SEGUNDA: CONDICIONES PARA PRÉSTAMOS A ACCIONISTAS (CUENTAS POR COBRAR ACCIONISTAS): Se autoriza de forma estricta y excepcional el otorgamiento de préstamos de la sociedad a sus accionistas hasta por un límite máximo de VEINTICINCO MIL DÓLARES ($25,000.00 USD), siempre que: (a) Exista una justificación comercial documentada en beneficio directo de la empresa; (b) Se pacte obligatoriamente una tasa de interés comercial para desvirtuar la figura de "Dividendo Presunto" prevista en el Artículo 72 de la Ley de ISLR; y (c) El plazo de restitución no supere los ciento ochenta (180) días continuos.

TERCERA: ASENTAMIENTO Y REGISTRO: Todo movimiento de fondos derivado de la presente autorización deberá estar respaldado obligatoriamente por un Contrato de Mutuo formal, vinculado a comprobantes bancarios, recibos de caja principal o Hash de transacciones Blockchain (TXID), debiendo asentarse la presente acta en el Libro de Actas de Asambleas de Accionistas debidamente sellado por el Registro Mercantil.

No habiendo más asuntos que tratar, se levanta la sesión y se procede a la firma inmediata del acta por todos los presentes en señal de conformidad.`;
  };

  const renderActaCapitalizacion = () => {
    if (!capitalizacionData && !contrato) return '';
    const cap = capitalizacionData || {
      monto_capitalizado_ves: contrato?.monto_indexado_ves || 540000,
      monto_capitalizado_usd: contrato?.monto_original || 12500,
      capital_anterior_ves: empresa.capital_social_ves,
      capital_nuevo_ves: empresa.capital_social_ves + (contrato?.monto_indexado_ves || 540000),
      valor_nominal_accion_ves: 100,
      numero_acciones_nuevas: Math.floor((contrato?.monto_indexado_ves || 540000) / 100),
      nombre_comisario: 'Lic. Gladys Elena Peña Morales',
      cpc_comisario: 'CPC Nro. 48.912',
      fecha_asamblea: '2026-03-20',
      uuid_acta: 'CAP-2026-0089',
    };

    return `ACTA DE ASAMBLEA GENERAL EXTRAORDINARIA DE ACCIONISTAS DE LA SOCIEDAD MERCANTIL ${empresa.razon_social} (AUMENTO DE CAPITAL MEDIANTE CAPITALIZACIÓN DE ACREENCIA DE SOCIO)

Hoy, ${formatFechaLarga(cap.fecha_asamblea)}, siendo las 10:00 AM, en la sede social de ${empresa.razon_social}, inscrita en el ${empresa.registro_mercantil}, RIF Nro. ${empresa.rif_empresa}, se encuentran presentes los accionistas que representan el 100% del capital social de la compañía. Preside la reunión el Director Presidente ${empresa.representante_legal}. El Presidente constata el quórum legal y declara abierta la Asamblea Extraordinaria.

ORDEN DEL DÍA:
PUNTO PRIMERO: Consideración y aprobación del Informe del Comisario Mercantil sobre la acreencia cierta, líquida y exigible mantenida a favor del accionista ${accionista?.nombre_accionista || 'Carlos Eduardo Mendoza Silva'}.
PUNTO SEGUNDO: Aumento del Capital Social de la compañía de la cantidad de ${formatVES(cap.capital_anterior_ves)} a la cantidad de ${formatVES(cap.capital_nuevo_ves)}, mediante la extinción y capitalización total de la referida acreencia, y consecuente reforma de la Cláusula Quinta de los Estatutos Sociales.

DESARROLLO:
PUNTO PRIMERO: El Presidente somete a consideración el Informe Técnico presentado por el Comisario de la sociedad, ${cap.nombre_comisario}, debidamente inscrito en el Colegio de Contadores Públicos bajo el ${cap.cpc_comisario}, en el cual se certifica que la sociedad mercantil adeuda legítimamente al accionista la suma de ${formatVES(cap.monto_capitalizado_ves)} (equivalente a ${formatUSD(cap.monto_capitalizado_usd)}), producto de los fondos inyectados bajo el Contrato de Mutuo ${contrato?.correlativo || 'MUT-2026-0001'} debidamente respaldado en comprobantes y asientos de diario. La Asamblea APROBÓ POR UNANIMIDAD el informe del comisario.

PUNTO SEGUNDO: El accionista manifiesta expresamente su voluntad de liberar a la sociedad mercantil del desembolso en efectivo de dicha deuda, aceptando en su lugar la capitalización íntegra de la misma. Sometido a votación, los accionistas APROBARON POR UNANIMIDAD aumentar el Capital Social de la sociedad mercantil en la suma de ${formatVES(cap.monto_capitalizado_ves)}, emitiéndose ${cap.numero_acciones_nuevas.toLocaleString()} nuevas acciones nominativas no convertibles al portador con un valor nominal de ${formatVES(cap.valor_nominal_accion_ves)} cada una. Con este acto, la deuda queda completamente extinguida en los libros pasivos de la sociedad y se incorpora al Patrimonio neto de la empresa.

REFORMA ESTATUTARIA: Se reforma la Cláusula Quinta de los Estatutos Sociales, quedando redactada así: "CLÁUSULA QUINTA: El Capital Social de la compañía es de ${formatVES(cap.capital_nuevo_ves)}, dividido y representado en ${((cap.capital_nuevo_ves) / cap.valor_nominal_accion_ves).toLocaleString()} acciones comunes y nominativas de ${formatVES(cap.valor_nominal_accion_ves)} cada una, totalmente suscritas y pagadas...".

Se autoriza al Director Presidente a consignar copia certificada de la presente acta ante el Registro Mercantil correspondiente dentro de los lapsos previstos en el Código de Comercio. (Firmas de los accionistas y el comisario).`;
  };

  const renderInformeComisario = () => {
    return `INFORME DEL COMISARIO MERCANTIL INDEPENDIENTE A LA ASAMBLEA GENERAL EXTRAORDINARIA DE ACCIONISTAS DE ${empresa.razon_social}

A los Señores Accionistas:

En mi condición de Comisario de la sociedad mercantil ${empresa.razon_social}, titular de la inscripción en el Colegio de Contadores Públicos bajo el CPC Nro. 48.912, y en cumplimiento de los Artículos 287, 309 y 311 del Código de Comercio de la República Bolivariana de Venezuela, he procedido a efectuar una auditoría especial a los libros auxiliares y principales de contabilidad al día de hoy.

DICTAMEN Y CERTIFICACIÓN DE ACREENCIA:
1. He examinado el saldo registrado en la cuenta de Pasivo "2.01.03.01 Cuentas por Pagar Socios / Accionistas", constatando la existencia de una obligación cierta, líquida y legalmente exigible a favor del accionista ${accionista?.nombre_accionista || 'Carlos Eduardo Mendoza Silva'}.
2. Se verificó el Contrato de Mutuo Nro. ${contrato?.correlativo || 'MUT-2026-0001'}, así como el soporte de ingreso de fondos en caja/banco y su correspondiente asiento en el libro de diario.
3. Se certifica que los fondos fueron empleados efectivamente en capital de trabajo y adquisición de inventarios para la operatividad de la empresa.
4. Por tanto, RECOMIENDO FAVORABLEMENTE a la Asamblea General de Accionistas la aprobación de la capitalización de la acreencia por un monto de ${formatVES(contrato?.monto_indexado_ves || 540000)}, extinguiendo el pasivo y fortaleciendo el patrimonio neto de la entidad frente a los requerimientos de la Administración Tributaria Nacional (SENIAT).

En Caracas, a la fecha de celebración de la Asamblea.
Lic. Gladys Elena Peña Morales
Contador Público Colegiado - CPC Nro. 48.912`;
  };

  const getActiveText = () => {
    switch (activeTab) {
      case 'contrato':
        return renderContratoText();
      case 'recibo_caja':
        return renderReciboCaja();
      case 'acta_macro':
        return renderActaMacro();
      case 'acta_capitalizacion':
        return renderActaCapitalizacion();
      case 'informe_comisario':
        return renderInformeComisario();
      default:
        return renderContratoText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top bar with Tabs */}
        <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Expediente Documental Legal SENIAT</span>
                {contrato && (
                  <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 font-semibold">
                    {contrato.correlativo}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-500">
                Redactado con formalismos del Código Civil, Código de Comercio y VEN-NIF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              title="Descargar documento en formato PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar PDF</span>
            </button>

            <button
              onClick={handleDownloadWord}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              title="Descargar documento editable en formato Word (.doc)"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Descargar Word</span>
            </button>

            <button
              onClick={() => handleCopy(getActiveText())}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              title="Imprimir o guardar vista del navegador"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab selection */}
        <div className="px-5 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('contrato')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'contrato' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
            }`}
          >
            Contrato de Mutuo
          </button>

          {contrato?.tipo_activo === 'USD_EFECTIVO' && (
            <button
              onClick={() => setActiveTab('recibo_caja')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'recibo_caja' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
              }`}
            >
              Recibo de Caja Principal
            </button>
          )}

          <button
            onClick={() => setActiveTab('acta_macro')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'acta_macro' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
            }`}
          >
            Acta de Asamblea Macro
          </button>

          <button
            onClick={() => setActiveTab('acta_capitalizacion')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'acta_capitalizacion' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
            }`}
          >
            Acta de Capitalización
          </button>

          <button
            onClick={() => setActiveTab('informe_comisario')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'informe_comisario' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
            }`}
          >
            Informe del Comisario
          </button>
        </div>

        {/* Paper Container (Formatted for Legal Venezuelan A4 print) */}
        <div className="p-6 overflow-y-auto bg-slate-100/80 font-mono text-xs leading-relaxed text-slate-800 select-text">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 shadow-md whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed text-slate-800 print-page max-w-3xl mx-auto">
            
            {/* Header in Document */}
            <div className="border-b border-slate-200 pb-4 mb-6 flex items-start justify-between">
              <div>
                <div className="font-extrabold text-sm text-slate-900 tracking-wide uppercase">
                  {empresa.razon_social}
                </div>
                <div className="text-xs text-slate-600">
                  R.I.F. Nro. {empresa.rif_empresa} | {empresa.registro_mercantil.substring(0, 70)}...
                </div>
                <div className="text-[11px] text-slate-500">
                  Domicilio: {empresa.ciudad}, Estado {empresa.estado}, República Bolivariana de Venezuela
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded">
                  Doc. Oficial Fiscal
                </span>
              </div>
            </div>

            {/* Document Body */}
            <div className="whitespace-pre-wrap font-serif text-[13px] leading-relaxed text-slate-900">
              {getActiveText()}
            </div>

            {/* Signature Blocks */}
            <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="w-48 mx-auto border-b border-slate-400 mb-2"></div>
                <div className="font-bold text-slate-900">{empresa.representante_legal}</div>
                <div className="text-slate-600">C.I. V-{empresa.cedula_representante}</div>
                <div className="text-[11px] text-slate-500">{empresa.cargo_representante}</div>
                <div className="text-[10px] text-slate-500 uppercase">{empresa.razon_social}</div>
              </div>

              <div>
                <div className="w-48 mx-auto border-b border-slate-400 mb-2"></div>
                <div className="font-bold text-slate-900">{accionista?.nombre_accionista || 'Accionista'}</div>
                <div className="text-slate-600">C.I. V-{accionista?.cedula_accionista || ''}</div>
                <div className="text-[11px] text-slate-500">Accionista / Mutuante</div>
                <div className="text-[10px] text-slate-500">R.I.F. {accionista?.rif_accionista || ''}</div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Documento respaldado conforme a normativa venezolana 2026</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Cerrar Vista Previa
          </button>
        </div>

      </div>
    </div>
  );
};
