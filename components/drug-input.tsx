'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Pill, AlertCircle, Search } from 'lucide-react';

const SUPPORTED_DRUGS = [
  { name: 'CODEINE', genes: ['CYP2D6'], category: 'Analgesic' },
  { name: 'WARFARIN', genes: ['CYP2C9', 'VKORC1'], category: 'Anticoagulant' },
  { name: 'CLOPIDOGREL', genes: ['CYP2C19'], category: 'Antiplatelet' },
  { name: 'SIMVASTATIN', genes: ['CYP3A4', 'SLCO1B1'], category: 'Statin' },
  { name: 'AZATHIOPRINE', genes: ['TPMT'], category: 'Immunosuppressant' },
  { name: 'FLUOROURACIL', genes: ['DPYD'], category: 'Chemotherapy' },
] as const;

export type SupportedDrug = (typeof SUPPORTED_DRUGS)[number]['name'];

interface DrugInputProps {
  selectedDrugs: SupportedDrug[];
  onDrugsChange: (drugs: SupportedDrug[]) => void;
  disabled?: boolean;
}

export function DrugInput({ selectedDrugs, onDrugsChange, disabled = false }: DrugInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDrugs = SUPPORTED_DRUGS.filter(
    (d) =>
      !selectedDrugs.includes(d.name) &&
      (d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.category.toLowerCase().includes(search.toLowerCase()) ||
        d.genes.some((g) => g.toLowerCase().includes(search.toLowerCase())))
  );

  const addDrug = (drugName: SupportedDrug) => {
    if (!selectedDrugs.includes(drugName)) {
      onDrugsChange([...selectedDrugs, drugName]);
      setError('');
    }
    setSearch('');
    setIsOpen(false);
  };

  const removeDrug = (drugName: SupportedDrug) => {
    onDrugsChange(selectedDrugs.filter((d) => d !== drugName));
  };

  const handleManualInput = () => {
    if (!inputValue.trim()) return;
    const parts = inputValue.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
    const validNames = SUPPORTED_DRUGS.map((d) => d.name);
    const newDrugs: SupportedDrug[] = [];
    const invalid: string[] = [];

    for (const part of parts) {
      if (validNames.includes(part as SupportedDrug)) {
        if (!selectedDrugs.includes(part as SupportedDrug) && !newDrugs.includes(part as SupportedDrug)) {
          newDrugs.push(part as SupportedDrug);
        }
      } else {
        invalid.push(part);
      }
    }

    if (newDrugs.length > 0) {
      onDrugsChange([...selectedDrugs, ...newDrugs]);
    }
    if (invalid.length > 0) {
      setError(`Unsupported drug(s): ${invalid.join(', ')}. Supported: ${validNames.join(', ')}`);
    } else {
      setError('');
    }
    setInputValue('');
  };

  const getDrugInfo = (name: SupportedDrug) => SUPPORTED_DRUGS.find((d) => d.name === name);

  const categoryColor = (category: string) => {
    switch (category) {
      case 'Analgesic': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'Anticoagulant': return 'bg-chart-5/10 text-chart-5 border-chart-5/20';
      case 'Antiplatelet': return 'bg-chart-6/10 text-chart-6 border-chart-6/20';
      case 'Statin': return 'bg-chart-4/10 text-chart-4 border-chart-4/20';
      case 'Immunosuppressant': return 'bg-chart-7/10 text-chart-7 border-chart-7/20';
      case 'Chemotherapy': return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="w-full space-y-4">
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold mb-2">
          <Pill className="w-4 h-4 text-secondary" />
          Enter Drug Name(s)
          <span className="text-chart-5 text-xs">*</span>
        </label>

        {/* Selected chips */}
        {selectedDrugs.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedDrugs.map((drug) => {
              const info = getDrugInfo(drug);
              return (
                <div
                  key={drug}
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${categoryColor(info?.category || '')}`}
                >
                  <span className="text-xs opacity-60 uppercase tracking-wider">{info?.category}</span>
                  <span className="font-semibold">{drug}</span>
                  <span className="text-[10px] opacity-50 font-mono">({info?.genes.join(', ')})</span>
                  {!disabled && (
                    <button
                      onClick={() => removeDrug(drug)}
                      className="ml-1 p-0.5 rounded-full hover:bg-background/50 transition"
                      aria-label={`Remove ${drug}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Input + Dropdown */}
        <div className="flex gap-2">
          <div className="flex-1 relative" ref={dropdownRef}>
            <div
              className={`flex items-center gap-2 px-4 py-3 border-2 rounded-xl transition-all cursor-pointer ${
                isOpen ? 'border-secondary bg-muted/30' : 'border-border hover:border-secondary/40'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => { if (!disabled) { setIsOpen(!isOpen); inputRef.current?.focus(); } }}
            >
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
                placeholder={selectedDrugs.length > 0 ? 'Add more drugs...' : 'Search or select drugs...'}
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                disabled={disabled}
                onFocus={() => setIsOpen(true)}
              />
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown */}
            {isOpen && !disabled && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-slide-in-up">
                {filteredDrugs.length > 0 ? (
                  <div className="max-h-56 overflow-y-auto">
                    {filteredDrugs.map((drug) => (
                      <button
                        key={drug.name}
                        onClick={() => addDrug(drug.name)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${categoryColor(drug.category)}`}>
                            {drug.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold group-hover:text-secondary transition">{drug.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {drug.category} &middot; Genes: {drug.genes.join(', ')}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition">+ Add</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No matching drugs found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Manual comma-separated input */}
        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleManualInput(); }}
            placeholder="e.g. CODEINE, WARFARIN, CLOPIDOGREL"
            className="flex-1 px-4 py-2.5 border border-border rounded-xl bg-transparent text-sm placeholder:text-muted-foreground/60 outline-none focus:border-secondary transition"
            disabled={disabled}
          />
          <button
            onClick={handleManualInput}
            disabled={disabled || !inputValue.trim()}
            className="px-4 py-2.5 bg-secondary text-secondary-foreground text-sm font-medium rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-chart-5/5 border border-chart-5/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-chart-5 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-chart-5">{error}</p>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Note: Both VCF file and drug name(s) are compulsory for final pharmacogenomic analysis.
        Supported drugs: CODEINE, WARFARIN, CLOPIDOGREL, SIMVASTATIN, AZATHIOPRINE, FLUOROURACIL.
      </p>
    </div>
  );
}

export { SUPPORTED_DRUGS };
