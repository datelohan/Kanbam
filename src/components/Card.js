import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { FiEdit2, FiTrash2, FiCalendar, FiFlag } from 'react-icons/fi';
import { PRIORITY_CONFIG, formatDate, isOverdue, isDueSoon } from '../utils/helpers';

export default function Card({ card, index, onEdit, onDelete }) {
  const priority = PRIORITY_CONFIG[card.priority] || PRIORITY_CONFIG.media;
  const overdue = isOverdue(card.dueDate);
  const dueSoon = isDueSoon(card.dueDate);

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group bg-dark-700/60 backdrop-blur border border-white/5 rounded-xl p-4 mb-3 cursor-grab active:cursor-grabbing transition-all duration-200 hover:border-white/10 hover:bg-dark-700/80 ${
            snapshot.isDragging ? 'shadow-2xl shadow-black/50 rotate-2 scale-105 border-indigo-500/30' : ''
          }`}
        >
          {/* Top: project + actions */}
          <div className="flex items-start justify-between mb-2">
            {card.project && (
              <span className="text-xs bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded-md font-medium">
                {card.project}
              </span>
            )}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(card); }}
                className="p-1 text-dark-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-all"
              >
                <FiEdit2 size={13} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
                className="p-1 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all"
              >
                <FiTrash2 size={13} />
              </button>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-dark-50 mb-1 leading-snug">{card.title}</h3>

          {/* Description */}
          {card.description && (
            <p className="text-xs text-dark-400 mb-3 line-clamp-2 leading-relaxed">{card.description}</p>
          )}

          {/* Footer: priority + date */}
          <div className="flex items-center justify-between mt-2">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md ${priority.bg} ${priority.text} font-medium`}>
              <FiFlag size={10} />
              {priority.label}
            </span>

            {card.dueDate && (
              <span className={`inline-flex items-center gap-1 text-xs ${
                overdue ? 'text-red-400' : dueSoon ? 'text-amber-400' : 'text-dark-400'
              }`}>
                <FiCalendar size={10} />
                {formatDate(card.dueDate)}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
