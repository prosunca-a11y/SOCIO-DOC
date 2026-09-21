import React, { useState } from 'react';
import { Empresa } from '../types';
import { 
  Building2, 
  ShieldCheck, 
  Coins, 
  TrendingUp, 
  FileText, 
  Landmark, 
  Scale, 
  CheckCircle2, 
  ChevronDown, 
  Edit3, 
  Sparkles,
  BookOpen,
  ShieldAlert,
  FileSpreadsheet
} from 'lucide-react';

interface NavbarProps {
  empresas: Empresa[];
  selectedEmpresa: Empresa;
  onSelectEmpresa: (empresa: Empresa) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  tasaBCV: number;
  onUpdateTasaBCV: (nuevaTasa: number) => void;
  onOpenPricing: () => void;
  onOpenTerms: () => void;
  onOpenCompanyManager: () => void;
  onOpenFiscalReport?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  empresas,
  selectedEmpresa,
  onSelectEmpresa,
  activeTab,
  onSelectTab,
  tasaBCV,
  onUpdateTasaBCV,
  onOpenPricing,
  onOpenTerms,
  onOpenCompanyManager,
  onOpenFiscalReport,
}) => {
  const [editingTasa, setEditingTasa] = useState(false);
  const [tempTasa, setTempTasa] = useState(tasaBCV.toString());

  const handleSaveTasa = () => {
    const val = parseFloat(tempTasa);
    if (!isNaN(val) && val > 0) {
      onUpdateTasaBCV(val);
    }
    setEditingTasa(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Semáforo', icon: TrendingUp },
    { id: 'contratos', label: 'Contratos de Mutuo', icon: FileText },
    { id: 'asamblea', label: 'Actas de Asamblea', icon: Landmark },
    { id: 'matching', label: 'Matching Bancario', icon: Scale },
    { id: 'asientos', label: 'Asientos VEN-NIF', icon: BookOpen },
    { id: 'igtf', label: 'Control IGTF (3%)', icon: Coins },
    { id: 'validador', label: 'Fecha Cierta & Respaldo', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
        
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black shadow-xs shadow-blue-500/20">
            <span className="text-base tracking-tight">SD</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                socio<span className="text-blue-600">-doc</span>
              </span>
              <span className="text-[10px] font-bold bg-blue-50 border border-blue-200/80 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Venezuela 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Control de Cuentas de Socios & Blindaje Tributario SENIAT
            </p>
          </div>
        </div>

        {/* Center: Empresa Selector & Multi-Empresa Manager */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 transition-colors shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <select
              value={selectedEmpresa.id}
              onChange={(e) => {
                if (e.target.value === '__add_new__') {
                  onOpenCompanyManager();
                  return;
                }
                const found = empresas.find(emp => emp.id === e.target.value);
                if (found) onSelectEmpresa(found);
              }}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1 max-w-[200px] sm:max-w-[280px] truncate"
            >
              {empresas.map(emp => (
                <option key={emp.id} value={emp.id} className="bg-white text-slate-900">
                  {emp.razon_social.substring(0, 32)}... ({emp.rif_empresa})
                </option>
              ))}
              <option value="__add_new__" className="bg-blue-50 text-blue-700 font-bold">
                + Registrar Nueva Empresa...
              </option>
            </select>
          </div>

          <button
            onClick={onOpenCompanyManager}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs"
            title="Abrir panel de administración multi-empresa"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Empresas</span>
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
              {empresas.length}
            </span>
          </button>

          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg border hidden md:inline-block ${
            selectedEmpresa.tipo_contribuyente === 'Especial'
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {selectedEmpresa.tipo_contribuyente === 'Especial' ? 'Sujeto Pasivo Especial' : 'Contribuyente Ordinario'}
          </span>
        </div>

        {/* Right: BCV Exchange Rate & SaaS Plan CTA */}
        <div className="flex items-center gap-2">
          
          {/* BCV Rate Pill */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl text-xs font-mono shadow-2xs">
            <span className="text-[11px] text-slate-500 font-sans font-medium">Tasa BCV:</span>
            {editingTasa ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.01"
                  value={tempTasa}
                  onChange={(e) => setTempTasa(e.target.value)}
                  className="w-16 bg-white border border-blue-500 rounded px-1.5 py-0.5 text-xs text-slate-900 focus:outline-none"
                />
                <button
                  onClick={handleSaveTasa}
                  className="bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded text-[10px] cursor-pointer hover:bg-blue-700"
                >
                  OK
                </button>
              </div>
            ) : (
              <div
                onClick={() => setEditingTasa(true)}
                className="flex items-center gap-1 text-blue-700 font-bold cursor-pointer hover:underline"
                title="Haga clic para actualizar la tasa oficial BCV"
              >
                <span>Bs. {tasaBCV.toFixed(2)}</span>
                <Edit3 className="w-3 h-3 text-slate-400" />
              </div>
            )}
          </div>

          {/* Cierre Fiscal CSV Button */}
          {onOpenFiscalReport && (
            <button
              onClick={onOpenFiscalReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Exportar Resumen Consolidado CSV para el Cierre Fiscal SENIAT"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Cierre Fiscal CSV</span>
            </button>
          )}

          {/* Pricing Button */}
          <button
            onClick={onOpenPricing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Planes SaaS</span>
          </button>

          {/* Legal Disclaimer link */}
          <button
            onClick={onOpenTerms}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Exención de Responsabilidad Tributaria (Art. X)"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Navigation Submenu Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1.5 overflow-x-auto py-2 text-xs scrollbar-none bg-slate-50/50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white font-medium'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

    </header>
  );
};
