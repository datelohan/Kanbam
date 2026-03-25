import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import Card from './Card';
import { FiPlus } from 'react-icons/fi';

export default function Column({ column, cards, onEditCard, onDeleteCard, onAddCard }) {
  return (
    <div className="flex-shrink-0 w-72 flex flex-col max-h-[calc(100vh-120px)]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
          <h2 className="text-sm font-semibold text-dark-100 uppercase tracking-wider">{column.title}</h2>
          <span className="text-xs text-dark-400 bg-dark-700/50 px-2 py-0.5 rounded-full font-medium">
            {cards.length}
          </span>
        </div>
        <button
          onClick={() => onAddCard(column.id)}
          className="p-1 text-dark-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-all"
        >
          <FiPlus size={16} />
        </button>
      </div>

      {/* Cards container */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto rounded-xl p-2 transition-all duration-200 min-h-[100px] ${
              snapshot.isDraggingOver
                ? 'bg-indigo-500/5 border-2 border-dashed border-indigo-500/20'
                : 'bg-dark-800/30 border-2 border-transparent'
            }`}
          >
            {cards.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                index={index}
                onEdit={onEditCard}
                onDelete={onDeleteCard}
              />
            ))}
            {provided.placeholder}
            {cards.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-center py-8 text-dark-500 text-xs">
                Arraste cards aqui
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
