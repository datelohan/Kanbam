import React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import Column from './Column';

export default function Board({ columns, columnOrder, cards, onDragEnd, onEditCard, onDeleteCard, onAddCard, searchTerm, filterProject, filterPriority }) {

  const filterCards = (cardIds) => {
    return cardIds
      .map((id) => cards[id])
      .filter(Boolean)
      .filter((card) => {
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchTitle = card.title.toLowerCase().includes(term);
          const matchDesc = (card.description || '').toLowerCase().includes(term);
          if (!matchTitle && !matchDesc) return false;
        }
        if (filterProject && card.project !== filterProject) return false;
        if (filterPriority && card.priority !== filterPriority) return false;
        return true;
      });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-5 p-6 overflow-x-auto flex-1 items-start">
        {columnOrder.map((colId) => {
          const column = columns[colId];
          if (!column) return null;
          const filteredCards = filterCards(column.cardIds);
          return (
            <Column
              key={colId}
              column={column}
              cards={filteredCards}
              onEditCard={onEditCard}
              onDeleteCard={onDeleteCard}
              onAddCard={onAddCard}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
}
