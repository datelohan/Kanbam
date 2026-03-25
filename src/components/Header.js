import React, { useRef } from 'react';
import { FiPlus, FiDownload, FiUpload, FiSearch, FiFilter } from 'react-icons/fi';

export default function Header({
  onNewCard,
  onExport,
  onImport,
  searchTerm,
  onSearchChange,
  filterProject,
  onFilterProjectChange,
  filterPriority,
  onFilterPriorityChange,
  projects,
}) {
  const fileRef = useRef();

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  return (
    <header className="bg-dark-800/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/seplag.png"
              alt="SEPLAG"
              className="h-9 object-contain rounded-md px-2 py-1 bg-white"
            />
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Kanban</h1>
              <p className="text-xs text-dark-400 -mt-0.5">Painel de Tarefas</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 text-sm" />
              <input
                type="text"
                placeholder="Buscar cards..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-dark-700/50 border border-white/5 rounded-lg pl-9 pr-4 py-2 text-sm text-dark-100 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all"
              />
            </div>

            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 text-xs" />
              <select
                value={filterProject}
                onChange={(e) => onFilterProjectChange(e.target.value)}
                className="bg-dark-700/50 border border-white/5 rounded-lg pl-8 pr-8 py-2 text-sm text-dark-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none cursor-pointer"
              >
                <option value="">Todos projetos</option>
                {projects.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <select
              value={filterPriority}
              onChange={(e) => onFilterPriorityChange(e.target.value)}
              className="bg-dark-700/50 border border-white/5 rounded-lg px-3 py-2 text-sm text-dark-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none cursor-pointer"
            >
              <option value="">Prioridade</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onExport}
              className="p-2 text-dark-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              title="Exportar dados"
            >
              <FiDownload size={18} />
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="p-2 text-dark-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              title="Importar dados"
            >
              <FiUpload size={18} />
            </button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            <button
              onClick={onNewCard}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
            >
              <FiPlus size={16} />
              Novo Card
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
