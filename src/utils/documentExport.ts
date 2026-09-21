import { jsPDF } from 'jspdf';
import { ContratoMutuo, Empresa, Accionista, ActaAsamblea, CapitalizacionAcreencia } from '../types';
import { formatVES, formatUSD, formatUSDT, formatFechaLarga, numeroALetras } from './formatters';

/**
 * Generates the clean legal text for a Mutuo contract
 */
export function generateContractText(
  contrato: ContratoMutuo,
  empresa: Empresa,
  accionista: Accionista
): { title: string; body: string; clauses: { title: string; text: string }[] } {
  const isCrypto = contrato.tipo_activo === 'USDT';
  const isEfectivo = contrato.tipo_activo === 'USD_EFECTIVO';
  const isVES = contrato.tipo_activo === 'VES';
  const isSocioAEmpresa = contrato.tipo_flujo === 'socio_a_empresa';

  const title = isCrypto
    ? 'CONTRATO DE MUTUO DE BIENES MUEBLES DIGITALES (CRIPTOPRÉSTAMO)'
    : 'CONTRATO DE MUTUO (PRÉSTAMO DE DINERO)';

  const preamble = `Nosotros, ${empresa.razon_social}, sociedad mercantil domiciliada en ${empresa.ciudad}, Estado ${empresa.estado}, constituida e inscrita por ante el ${empresa.registro_mercantil}, inscrita en el Registro Único de Información Fiscal (R.I.F.) Nro. ${empresa.rif_empresa}, debidamente representada en este acto por su ${empresa.cargo_representante}, ciudadano(a) ${empresa.representante_legal}, titular de la Cédula de Identidad Nro. ${empresa.cedula_representante}, en lo sucesivo denominada "${isSocioAEmpresa ? 'LA MUTUARIA' : 'LA MUTUANTE'}", por una parte; y por la otra, el ciudadano(a) ${accionista.nombre_accionista}, de nacionalidad venezolana, mayor de edad, titular de la Cédula de Identidad Nro. ${accionista.cedula_accionista} y del R.I.F. Nro. ${accionista.rif_accionista}, en su cualidad de accionista titular del ${accionista.porcentaje_acciones}% del capital social de la compañía, quien en lo sucesivo se denominará "${isSocioAEmpresa ? 'EL MUTUANTE' : 'EL MUTUARIO'}", hemos convenido en celebrar como en efecto celebramos el presente ${title}, el cual se regirá por las disposiciones del Código Civil de Venezuela, el Código de Comercio y por las siguientes cláusulas:`;

  const clauses: { title: string; text: string }[] = [];

  if (isCrypto) {
    clauses.push({
      title: 'PRIMERA (OBJETO Y NATURALEZA DEL ACTIVO)',
      text: `${isSocioAEmpresa ? 'EL MUTUANTE' : 'LA MUTUANTE'} entrega a título de mutuo a ${isSocioAEmpresa ? 'LA MUTUARIA' : 'EL MUTUARIO'}, un bien mueble intangible y digital, específicamente la cantidad de ${numeroALetras(contrato.monto_original)} TOKENS DE LA CRIPTOMONEDA ESTABLE DENOMINADA UNITED STATES DOLLAR TETHER (${formatUSDT(contrato.monto_original)}). Las partes reconocen que el token USDT es un criptoactivo fungible respaldado en valor paritario con el Dólar de los Estados Unidos de América, ampliamente aceptado en transacciones comerciales lícitas en la República Bolivariana de Venezuela.`,
    });

    clauses.push({
      title: 'SEGUNDA (ENTREGA, RED Y VERIFICACIÓN BLOCKCHAIN - PRUEBA MATERIAL)',
      text: `La entrega efectiva e irreversible del activo se efectuó mediante transferencia electrónica en la red de bloques ${contrato.soporte.red_blockchain || 'TRON (TRC-20)'}, originada desde la Billetera Digital (Wallet) propiedad de ${isSocioAEmpresa ? 'EL MUTUANTE' : 'LA MUTUANTE'}, dirección: [${contrato.soporte.wallet_origen || 'Wallet_Origen'}], con destino a la Billetera Digital corporativa propiedad de ${isSocioAEmpresa ? 'LA MUTUARIA' : 'EL MUTUARIO'}, dirección: [${contrato.soporte.wallet_destino || 'Wallet_Destino'}]. Identificador Hash (TXID): [${contrato.soporte.txid_blockchain || 'TXID_PENDIENTE'}], ejecutada en fecha ${formatFechaLarga(contrato.soporte.fecha_transaccion)}. La consulta pública del referido Hash en el explorador de bloques constituye prueba plena ante cualquier ente de fiscalización.`,
    });

    clauses.push({
      title: 'TERCERA (VALORACIÓN CONTABLE Y FISCAL VEN-NIF)',
      text: `A los efectos de su asentamiento contable en los libros de la empresa conforme a VEN-NIF y exigencias del SENIAT, se registra la operación en moneda de curso legal por la cantidad de ${formatVES(contrato.monto_indexado_ves)} (${numeroALetras(contrato.monto_indexado_ves)} BOLÍVARES), calculados a la tasa de cambio oficial de referencia del Banco Central de Venezuela (BCV) de Bs. ${contrato.tasa_bcv_fecha.toFixed(2)} por unidad para la fecha de la transferencia.`,
    });

    clauses.push({
      title: 'CUARTA (INTERESES Y CONDICIÓN FISCAL)',
      text: isSocioAEmpresa
        ? 'El presente préstamo se efectúa a título estrictamente gratuito, motivado directamente en la condición de socio del MUTUANTE y su interés en el financiamiento de la empresa, no devengando intereses de ninguna naturaleza para enervar la presunción de intereses prevista en las leyes tributarias.'
        : `Por tratarse de un préstamo otorgado por la sociedad a su accionista y para mitigar la presunción de dividendo del Artículo 72 de la Ley de Impuesto Sobre la Renta (LISLR), la operación devengará una tasa de interés comercial pactada del ${contrato.tasa_interes || 1.5}% mensual, debiendo facturarse y declararse como ingresos gravables.`,
    });

    clauses.push({
      title: 'QUINTA (DESTINO DE LOS FONDOS Y PLAZO)',
      text: `Los fondos son destinados expresamente a: "${contrato.destino_fondos}". La restitución de los tokens USDT entregados se efectuará en un plazo no mayor a ${contrato.plazo_meses} meses, con fecha límite improrrogable el ${formatFechaLarga(contrato.fecha_vencimiento)}.`,
    });

    clauses.push({
      title: 'SEXTA (DOMICILIO Y JURISDICCIÓN)',
      text: `Para todos los efectos derivados de este contrato, las partes eligen como domicilio especial, único y excluyente la ciudad de ${empresa.ciudad}, Estado ${empresa.estado}, a la jurisdicción de cuyos tribunales declaran someterse. Se otorgan dos (02) ejemplares de un mismo tenor y efecto el ${formatFechaLarga(contrato.fecha_inicio)}.`,
    });
  } else {
    clauses.push({
      title: 'PRIMERA (OBJETO Y MONTO)',
      text: `${isSocioAEmpresa ? 'EL MUTUANTE' : 'LA MUTUANTE'} entrega en calidad de mutuo (préstamo de consumo) a ${isSocioAEmpresa ? 'LA MUTUARIA' : 'EL MUTUARIO'}, la cantidad cierta y líquida de: ${isVES ? `${numeroALetras(contrato.monto_original)} BOLÍVARES (${formatVES(contrato.monto_original)})` : `${numeroALetras(contrato.monto_original)} DÓLARES DE LOS ESTADOS UNIDOS DE AMÉRICA (${formatUSD(contrato.monto_original)})`}.`,
    });

    clauses.push({
      title: 'SEGUNDA (ENTREGA Y MEDIO DE PAGO)',
      text: isEfectivo
        ? `La entrega de los fondos se realizó físicamente en billetes de curso legal en las oficinas de la empresa, expidiéndose simultáneamente el RECIBO DE INGRESO A CAJA PRINCIPAL Nro. ${contrato.soporte.recibo_caja_correlativo || 'REC-001'} en fecha ${formatFechaLarga(contrato.soporte.fecha_transaccion)}, el cual forma parte indivisible de la contabilidad mercantil de la compañía.`
        : `La entrega se ejecutó mediante transferencia bancaria desde la cuenta Nro. ${contrato.soporte.numero_cuenta_origen || '0134...'} en ${contrato.soporte.banco_origen || 'Banco Origen'}, hacia la cuenta Nro. ${contrato.soporte.numero_cuenta_destino || '0105...'} en ${contrato.soporte.banco_destino || 'Banco Destino'}, bajo la Referencia Bancaria ${contrato.soporte.referencia_bancaria || 'REF-BANCARIA'} en fecha ${formatFechaLarga(contrato.soporte.fecha_transaccion)}.`,
    });

    clauses.push({
      title: 'TERCERA (INTERESES Y REGULACIÓN TRIBUTARIA)',
      text: isSocioAEmpresa
        ? 'El presente mutuo se concede a título estrictamente gratuito, no devengando intereses en consideración al carácter de socio del MUTUANTE y su legítimo interés en el mantenimiento de la operatividad y liquidez de la empresa, descartándose cualquier rendimiento presunto gravable.'
        : `En estricto cumplimiento del Artículo 72 de la Ley de Impuesto Sobre la Renta (LISLR) para descartar la presunción de dividendo en préstamos concedidos a accionistas, se fija un interés comercial del ${contrato.tasa_interes || 1.5}% mensual sobre el saldo deudor, el cual será debidamente facturado y retenido conforme a las leyes fiscales vigentes.`,
    });

    clauses.push({
      title: 'CUARTA (DESTINO Y MOTIVO CORPORATIVO)',
      text: `Los fondos recibidos serán aplicados de manera estricta y comprobable para: "${contrato.destino_fondos}". ${contrato.motivo_comercial ? `Justificación corporativa: ${contrato.motivo_comercial}.` : ''}`,
    });

    clauses.push({
      title: 'QUINTA (CLÁUSULA DE INDEXACIÓN CAMBIARIA - TASA OFICIAL BCV)',
      text: isVES
        ? `A los fines de preservar el valor real del monto entregado y prevenir los efectos inflacionarios, las partes convienen en fijar como unidad de referencia el Dólar de los Estados Unidos de América. El monto en Bolívares equivale a ${formatUSD(contrato.monto_indexado_usd)} a la tasa oficial de Bs. ${contrato.tasa_bcv_fecha.toFixed(2)} por dólar emitida por el Banco Central de Venezuela (BCV) en la fecha del desembolso. Al momento de la restitución, LA MUTUARIA pagará la cantidad de Bolívares que resulte de multiplicar el monto indexado por la tasa oficial BCV vigente para el día de la liquidación.`
        : `El pago de la obligación se efectuará en la misma divisa o en su equivalente en Bolívares liquidado a la tasa oficial del Banco Central de Venezuela (BCV) vigente para el día efectivo del pago.`,
    });

    clauses.push({
      title: 'SEXTA (PLAZO Y DOMICILIO)',
      text: `El plazo fijado para la cancelación total es de ${contrato.plazo_meses} meses, con vencimiento el ${formatFechaLarga(contrato.fecha_vencimiento)}. Para todas las controversias derivadas, las partes fijan como domicilio especial la ciudad de ${empresa.ciudad}, Estado ${empresa.estado}. Se firman dos (02) ejemplares en ${empresa.ciudad}, el ${formatFechaLarga(contrato.fecha_inicio)}.`,
    });
  }

  const fullBody = preamble + '\n\n' + clauses.map(c => `${c.title}:\n${c.text}`).join('\n\n');

  return { title, body: fullBody, clauses };
}

/**
 * Downloads the contract as a natively formatted Microsoft Word document (.doc)
 */
export function downloadContractWord(
  contrato: ContratoMutuo,
  empresa: Empresa,
  accionista: Accionista
): void {
  const { title, clauses } = generateContractText(contrato, empresa, accionista);
  const isSocioAEmpresa = contrato.tipo_flujo === 'socio_a_empresa';

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${title} - ${contrato.correlativo}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: letter;
          margin: 2.5cm 2.5cm 2.5cm 2.5cm;
          mso-header-margin: 35.4pt;
          mso-footer-margin: 35.4pt;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11.5pt;
          line-height: 1.4;
          color: #000000;
          text-align: justify;
        }
        .header-table {
          width: 100%;
          border-bottom: 2pt solid #1e3a8a;
          margin-bottom: 18pt;
          padding-bottom: 6pt;
        }
        .company-name {
          font-size: 13pt;
          font-weight: bold;
          color: #1e3a8a;
          text-transform: uppercase;
        }
        .company-details {
          font-size: 9.5pt;
          color: #334155;
        }
        .doc-title {
          font-size: 14pt;
          font-weight: bold;
          text-align: center;
          margin-top: 14pt;
          margin-bottom: 8pt;
          color: #0f172a;
        }
        .correlativo-badge {
          text-align: center;
          font-size: 10pt;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          color: #1e3a8a;
          margin-bottom: 16pt;
        }
        p.clause-title {
          font-weight: bold;
          margin-top: 12pt;
          margin-bottom: 3pt;
          text-align: justify;
        }
        p.clause-text {
          margin-top: 0;
          margin-bottom: 10pt;
          text-indent: 24pt;
          text-align: justify;
        }
        .signatures-table {
          width: 100%;
          margin-top: 36pt;
          border-collapse: collapse;
        }
        .signature-cell {
          width: 50%;
          text-align: center;
          vertical-align: top;
          padding: 10pt;
        }
        .signature-line {
          width: 80%;
          border-top: 1pt solid #000000;
          margin: 0 auto 6pt auto;
        }
      </style>
    </head>
    <body>
      <table class="header-table">
        <tr>
          <td>
            <div class="company-name">${empresa.razon_social}</div>
            <div class="company-details">R.I.F. ${empresa.rif_empresa} • ${empresa.registro_mercantil}</div>
            <div class="company-details">Domicilio Fiscal: ${empresa.direccion_fiscal}, ${empresa.ciudad}, Estado ${empresa.estado}</div>
          </td>
          <td style="text-align: right; vertical-align: top;">
            <div style="font-size: 9pt; font-weight: bold; color: #1e3a8a;">EXPEDIENTE TRIBUTARIO</div>
            <div style="font-size: 8pt; color: #64748b;">Art. 72 LISLR / VEN-NIF</div>
          </td>
        </tr>
      </table>

      <div class="doc-title">${title}</div>
      <div class="correlativo-badge">INSTRUMENTO LEGAL NRO: ${contrato.correlativo}</div>

      <p class="clause-text">
        Nosotros, <strong>${empresa.razon_social}</strong>, sociedad mercantil debidamente domiciliada en ${empresa.ciudad}, Estado ${empresa.estado}, inscrita en el Registro Mercantil bajo el R.I.F. Nro. <strong>${empresa.rif_empresa}</strong>, representada en este acto por su ${empresa.cargo_representante}, ciudadano(a) <strong>${empresa.representante_legal}</strong>, titular de la Cédula de Identidad Nro. <strong>${empresa.cedula_representante}</strong>, en lo sucesivo denominada "${isSocioAEmpresa ? 'LA MUTUARIA' : 'LA MUTUANTE'}", por una parte; y por la otra, el ciudadano(a) <strong>${accionista.nombre_accionista}</strong>, titular de la Cédula de Identidad Nro. <strong>${accionista.cedula_accionista}</strong> y R.I.F. Nro. <strong>${accionista.rif_accionista}</strong>, en su carácter de accionista titular del <strong>${accionista.porcentaje_acciones}%</strong> del capital social, quien se denominará "${isSocioAEmpresa ? 'EL MUTUANTE' : 'EL MUTUARIO'}", convenimos en suscribir el presente instrumento bajo las siguientes cláusulas:
      </p>

      ${clauses.map(c => `
        <p class="clause-title">${c.title}</p>
        <p class="clause-text">${c.text}</p>
      `).join('')}

      <table class="signatures-table">
        <tr>
          <td class="signature-cell">
            <div class="signature-line"></div>
            <strong>${empresa.representante_legal}</strong><br/>
            C.I. V-${empresa.cedula_representante}<br/>
            ${empresa.cargo_representante}<br/>
            <span style="font-size: 9pt; text-transform: uppercase;">${empresa.razon_social}</span>
          </td>
          <td class="signature-cell">
            <div class="signature-line"></div>
            <strong>${accionista.nombre_accionista}</strong><br/>
            C.I. V-${accionista.cedula_accionista}<br/>
            R.I.F. ${accionista.rif_accionista}<br/>
            <span style="font-size: 9pt;">Accionista (${accionista.porcentaje_acciones}% Acciones)</span>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Contrato_Mutuo_${contrato.correlativo}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads the contract as a crisp, professional legal PDF using jsPDF
 */
export function downloadContractPDF(
  contrato: ContratoMutuo,
  empresa: Empresa,
  accionista: Accionista
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  // Header Banner
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138); // Blue
  doc.text(empresa.razon_social.toUpperCase(), margin, y);
  y += 5;

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`R.I.F. ${empresa.rif_empresa} • ${empresa.registro_mercantil}`, margin, y);
  y += 4;
  doc.text(`Domicilio Fiscal: ${empresa.ciudad}, Estado ${empresa.estado}, Venezuela`, margin, y);
  y += 4;

  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Document Title
  const isCrypto = contrato.tipo_activo === 'USDT';
  const docTitle = isCrypto
    ? 'CONTRATO DE MUTUO DE BIENES MUEBLES DIGITALES'
    : 'CONTRATO DE MUTUO (PRÉSTAMO DE DINERO)';

  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(docTitle, pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFont('courier', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 58, 138);
  doc.text(`CORRELATIVO OFICIAL: ${contrato.correlativo}`, pageWidth / 2, y, { align: 'center' });
  y += 8;

  // Document Content
  const { clauses } = generateContractText(contrato, empresa, accionista);
  const isSocioAEmpresa = contrato.tipo_flujo === 'socio_a_empresa';

  const preamble = `Nosotros, ${empresa.razon_social}, R.I.F. Nro. ${empresa.rif_empresa}, debidamente representada por su ${empresa.cargo_representante}, ciudadano(a) ${empresa.representante_legal}, C.I. V-${empresa.cedula_representante}, ("${isSocioAEmpresa ? 'LA MUTUARIA' : 'LA MUTUANTE'}"), por una parte; y el ciudadano(a) ${accionista.nombre_accionista}, C.I. V-${accionista.cedula_accionista}, R.I.F. ${accionista.rif_accionista}, accionista titular del ${accionista.porcentaje_acciones}% del capital social ("${isSocioAEmpresa ? 'EL MUTUANTE' : 'EL MUTUARIO'}"), convenimos en suscribir el presente CONTRATO DE MUTUO bajo las siguientes cláusulas:`;

  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);

  const splitPreamble = doc.splitTextToSize(preamble, contentWidth);
  doc.text(splitPreamble, margin, y);
  y += splitPreamble.length * 4.5 + 4;

  // Loop through clauses with pagination check
  for (const clause of clauses) {
    // Check if we need a new page for clause title + some lines
    if (y > pageHeight - 35) {
      doc.addPage();
      y = margin;
    }

    doc.setFont('times', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(clause.title, margin, y);
    y += 4.5;

    doc.setFont('times', 'normal');
    const splitClause = doc.splitTextToSize(clause.text, contentWidth);

    // If clause text spills across page boundary
    for (let i = 0; i < splitClause.length; i++) {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = margin;
      }
      doc.text(splitClause[i], margin, y);
      y += 4.2;
    }
    y += 3;
  }

  // Signatures
  if (y > pageHeight - 35) {
    doc.addPage();
    y = margin + 10;
  }

  const col1X = margin + 20;
  const col2X = margin + contentWidth - 45;

  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.4);
  doc.line(col1X - 15, y, col1X + 35, y);
  doc.line(col2X - 25, y, col2X + 25, y);
  y += 4;

  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(empresa.representante_legal, col1X + 10, y, { align: 'center' });
  doc.text(accionista.nombre_accionista, col2X, y, { align: 'center' });
  y += 4;

  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`C.I. V-${empresa.cedula_representante} (${empresa.cargo_representante})`, col1X + 10, y, { align: 'center' });
  doc.text(`C.I. V-${accionista.cedula_accionista} (Accionista ${accionista.porcentaje_acciones}%)`, col2X, y, { align: 'center' });

  // Add Page Numbers
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${p} de ${totalPages} • Expediente Tributario ${contrato.correlativo}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  doc.save(`Contrato_Mutuo_${contrato.correlativo}.pdf`);
}
