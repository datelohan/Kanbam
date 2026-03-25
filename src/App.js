import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Board from './components/Board';
import CardModal from './components/CardModal';
import ConfirmModal from './components/ConfirmModal';
import Terminal from './components/Terminal';
import { loadData, saveData, exportData, importData } from './utils/storage';
import { generateId } from './utils/helpers';
import { FiTerminal } from 'react-icons/fi';
import './App.css';

function App() {
  const [data, setData] = useState(loadData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [activeColumnId, setActiveColumnId] = useState('backlog');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [terminalOpen, setTerminalOpen] = useState(false);

  useEffect(() => {
    saveData(data);
  }, [data]);

  // Ctrl+` or Ctrl+J to toggle terminal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key === '`') || (e.ctrlKey && e.key === 'j')) {
        e.preventDefault();
        setTerminalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDragEnd = useCallback((result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    setData((prev) => {
      const newData = { ...prev, columns: { ...prev.columns } };

      const sourceCol = { ...newData.columns[source.droppableId] };
      const sourceCards = [...sourceCol.cardIds];
      sourceCards.splice(source.index, 1);
      sourceCol.cardIds = sourceCards;
      newData.columns[source.droppableId] = sourceCol;

      const destCol = { ...newData.columns[destination.droppableId] };
      const destCards = [...destCol.cardIds];
      destCards.splice(destination.index, 0, draggableId);
      destCol.cardIds = destCards;
      newData.columns[destination.droppableId] = destCol;

      newData.cards = { ...newData.cards };
      newData.cards[draggableId] = { ...newData.cards[draggableId], columnId: destination.droppableId };

      return newData;
    });
  }, []);

  const handleSaveCard = useCallback((cardData) => {
    setData((prev) => {
      const newData = { ...prev, columns: { ...prev.columns }, cards: { ...prev.cards } };

      if (cardData.id) {
        newData.cards[cardData.id] = { ...newData.cards[cardData.id], ...cardData };
      } else {
        const id = generateId();
        const colId = cardData.columnId || 'backlog';
        newData.cards[id] = { ...cardData, id, columnId: colId, createdAt: new Date().toISOString() };
        const col = { ...newData.columns[colId] };
        col.cardIds = [...col.cardIds, id];
        newData.columns[colId] = col;
      }

      return newData;
    });
  }, []);

  const handleDeleteCard = useCallback((cardId) => {
    setConfirmDelete(cardId);
  }, []);

  const confirmDeleteCard = useCallback(() => {
    if (!confirmDelete) return;
    setData((prev) => {
      const newData = { ...prev, columns: { ...prev.columns }, cards: { ...prev.cards } };
      const card = newData.cards[confirmDelete];
      if (card) {
        const col = { ...newData.columns[card.columnId] };
        col.cardIds = col.cardIds.filter((id) => id !== confirmDelete);
        newData.columns[card.columnId] = col;
        delete newData.cards[confirmDelete];
      }
      return newData;
    });
    setConfirmDelete(null);
  }, [confirmDelete]);

  const handleEditCard = useCallback((card) => {
    setEditingCard(card);
    setModalOpen(true);
  }, []);

  const handleNewCard = useCallback((columnId) => {
    setEditingCard(null);
    setActiveColumnId(columnId || 'backlog');
    setModalOpen(true);
  }, []);

  const handleExport = useCallback(() => {
    exportData(data);
  }, [data]);

  const handleImport = useCallback(async (file) => {
    try {
      const imported = await importData(file);
      setData(imported);
    } catch (err) {
      alert(err.message);
    }
  }, []);

  const handleAddProject = useCallback((name) => {
    setData((prev) => {
      if (prev.projects.includes(name)) return prev;
      return { ...prev, projects: [...prev.projects, name] };
    });
  }, []);

  return (
    <div className="h-screen flex flex-col bg-dark-900">
      <Header
        onNewCard={() => handleNewCard()}
        onExport={handleExport}
        onImport={handleImport}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterProject={filterProject}
        onFilterProjectChange={setFilterProject}
        filterPriority={filterPriority}
        onFilterPriorityChange={setFilterPriority}
        projects={data.projects}
      />
      <Board
        columns={data.columns}
        columnOrder={data.columnOrder}
        cards={data.cards}
        onDragEnd={handleDragEnd}
        onEditCard={handleEditCard}
        onDeleteCard={handleDeleteCard}
        onAddCard={handleNewCard}
        searchTerm={searchTerm}
        filterProject={filterProject}
        filterPriority={filterPriority}
      />
      <CardModal
        isOpen={modalOpen}
        card={editingCard}
        columnId={activeColumnId}
        projects={data.projects}
        onSave={handleSaveCard}
        onClose={() => { setModalOpen(false); setEditingCard(null); }}
        onAddProject={handleAddProject}
      />
      <ConfirmModal
        isOpen={!!confirmDelete}
        message="Tem certeza que deseja excluir este card? Esta ação não pode ser desfeita."
        onConfirm={confirmDeleteCard}
        onCancel={() => setConfirmDelete(null)}
      />
      <Terminal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        data={data}
        onUpdateData={setData}
        onExport={handleExport}
      />

      {/* Terminal toggle button */}
      {!terminalOpen && (
        <button
          onClick={() => setTerminalOpen(true)}
          className="fixed bottom-4 right-4 z-40 bg-dark-700/80 backdrop-blur border border-white/10 text-dark-300 hover:text-green-400 hover:border-green-500/30 p-3 rounded-xl transition-all shadow-lg group"
          title="Terminal (Ctrl+`)"
        >
          <FiTerminal size={20} />
          <span className="absolute -top-8 right-0 bg-dark-700 text-dark-300 text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Ctrl + `
          </span>
        </button>
      )}
    </div>
  );
}

export default App;
