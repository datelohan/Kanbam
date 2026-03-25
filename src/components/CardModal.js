import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';

export default function CardModal({ isOpen, card, columnId, projects, onSave, onClose, onAddProject }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('media');
  const [project, setProject] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [newProject, setNewProject] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  const titleRef = useRef();

  useEffect(() => {
    if (isOpen) {
      if (card) {
        setTitle(card.title || '');
        setDescription(card.description || '');
        setPriority(card.priority || 'media');
        setProject(card.project || '');
        setDueDate(card.dueDate || '');
      } else {
        setTitle('');
        setDescription('');
        setPriority('media');
        setProject(projects[0] || '');
        setDueDate('');
      }
      setNewProject('');
      setShowNewProject(false);
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [isOpen, card, projects]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: card?.id,
      title: title.trim(),
      description: description.trim(),
      priority,
      project,
      dueDate,
      columnId: card?.columnId || columnId,
    });
    onClose();
  };

  const handleAddProject = () => {
    if (newProject.trim()) {
      onAddProject(newProject.trim());
      setProject(newProject.trim());
      setNewProject('');
      setShowNewProject(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-dark-800 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">
            {card ? 'Editar Card' : 'Novo Card'}
          </h2>
          <button onClick={onClose} className="p-1 text-dark-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <FiX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1.5 uppercase tracking-wider">Título *</label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome da tarefa..."
              className="w-full bg-dark-700/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1.5 uppercase tracking-wider">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes da tarefa..."
              rows={3}
              className="w-full bg-dark-700/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5 uppercase tracking-wider">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-dark-700/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5 uppercase tracking-wider">Data Limite</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-dark-700/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1.5 uppercase tracking-wider">Projeto</label>
            <div className="flex gap-2">
              {!showNewProject ? (
                <>
                  <select
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    className="flex-1 bg-dark-700/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                  >
                    <option value="">Sem projeto</option>
                    {projects.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewProject(true)}
                    className="p-2.5 text-dark-400 hover:text-indigo-400 hover:bg-indigo-500/10 border border-white/10 rounded-lg transition-all"
                  >
                    <FiPlus size={16} />
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    placeholder="Nome do projeto..."
                    className="flex-1 bg-dark-700/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddProject())}
                  />
                  <button
                    type="button"
                    onClick={handleAddProject}
                    className="px-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-all"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewProject(false)}
                    className="p-2.5 text-dark-400 hover:text-white hover:bg-white/5 border border-white/10 rounded-lg transition-all"
                  >
                    <FiX size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm text-dark-300 hover:text-white bg-dark-700/50 hover:bg-dark-700 border border-white/10 rounded-lg transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/20"
            >
              {card ? 'Salvar' : 'Criar Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
