import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiTerminal, FiX, FiMinus, FiMaximize2 } from 'react-icons/fi';

const HELP_TEXT = [
  '',
  '  Comandos disponíveis:',
  '  ─────────────────────────────────────────',
  '  novo <título>              Cria card no Backlog',
  '  novo <título> --col <col>  Cria card em coluna específica',
  '  mover <id> <coluna>        Move card para outra coluna',
  '  listar [coluna]            Lista cards (ou de uma coluna)',
  '  buscar <termo>             Busca cards por título/descrição',
  '  excluir <id>               Exclui um card',
  '  projetos                   Lista projetos',
  '  projeto <nome>             Cria novo projeto',
  '  stats                      Mostra estatísticas',
  '  exportar                   Exporta dados em JSON',
  '  limpar                     Limpa o terminal',
  '  help                       Mostra esta ajuda',
  '',
  '  Colunas: backlog, a-fazer, em-andamento, em-revisao, concluido',
  '',
];

const COLUMN_ALIASES = {
  'backlog': 'backlog',
  'afazer': 'a-fazer',
  'a-fazer': 'a-fazer',
  'fazer': 'a-fazer',
  'andamento': 'em-andamento',
  'em-andamento': 'em-andamento',
  'revisao': 'em-revisao',
  'em-revisao': 'em-revisao',
  'concluido': 'concluido',
  'done': 'concluido',
};

export default function Terminal({ isOpen, onClose, data, onUpdateData, onExport }) {
  const [lines, setLines] = useState([
    '╭─────────────────────────────────────╮',
    '│  Kanban SEPLAG Terminal v1.0        │',
    '│  Digite "help" para ver os comandos │',
    '╰─────────────────────────────────────╯',
    '',
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [minimized, setMinimized] = useState(false);
  const inputRef = useRef();
  const scrollRef = useRef();

  useEffect(() => {
    if (isOpen && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, minimized]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const addLines = useCallback((newLines) => {
    setLines((prev) => [...prev, ...newLines]);
  }, []);

  const findCardByShortId = useCallback((shortId) => {
    const cards = Object.values(data.cards);
    return cards.find((c) => c.id.startsWith(shortId));
  }, [data.cards]);

  const getColumnName = useCallback((colId) => {
    return data.columns[colId]?.title || colId;
  }, [data.columns]);

  const processCommand = useCallback((cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    addLines([`  \x1b[32m❯\x1b[0m ${trimmed}`]);

    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();

    switch (command) {
      case 'help':
      case 'ajuda': {
        addLines(HELP_TEXT);
        break;
      }

      case 'limpar':
      case 'clear': {
        setLines([]);
        break;
      }

      case 'novo':
      case 'new':
      case 'criar': {
        const colFlagIdx = parts.indexOf('--col');
        let colId = 'backlog';
        let titleParts = parts.slice(1);

        if (colFlagIdx > -1) {
          const colArg = parts[colFlagIdx + 1];
          colId = COLUMN_ALIASES[colArg?.toLowerCase()] || 'backlog';
          titleParts = parts.slice(1, colFlagIdx);
        }

        const title = titleParts.join(' ');
        if (!title) {
          addLines(['  ⚠ Uso: novo <título> [--col <coluna>]']);
          break;
        }

        const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        const newCard = {
          id,
          title,
          description: '',
          priority: 'media',
          project: '',
          dueDate: '',
          columnId: colId,
          createdAt: new Date().toISOString(),
        };

        const newData = { ...data, columns: { ...data.columns }, cards: { ...data.cards } };
        newData.cards[id] = newCard;
        const col = { ...newData.columns[colId] };
        col.cardIds = [...col.cardIds, id];
        newData.columns[colId] = col;
        onUpdateData(newData);

        addLines([
          `  ✓ Card criado em ${getColumnName(colId)}`,
          `    ID: ${id.slice(0, 8)}  Título: ${title}`,
          '',
        ]);
        break;
      }

      case 'listar':
      case 'ls':
      case 'list': {
        const colArg = parts[1]?.toLowerCase();
        const targetCols = colArg && COLUMN_ALIASES[colArg]
          ? [COLUMN_ALIASES[colArg]]
          : data.columnOrder;

        let total = 0;
        targetCols.forEach((colId) => {
          const col = data.columns[colId];
          if (!col) return;
          const cards = col.cardIds.map((id) => data.cards[id]).filter(Boolean);
          if (cards.length === 0 && colArg) {
            addLines([`  ${col.title}: (vazio)`]);
            return;
          }
          if (cards.length === 0) return;
          addLines([`  ┌─ ${col.title} (${cards.length})`]);
          cards.forEach((card) => {
            const pri = card.priority === 'alta' ? '🔴' : card.priority === 'baixa' ? '🟢' : '🟡';
            addLines([`  │ ${pri} [${card.id.slice(0, 8)}] ${card.title}`]);
            total++;
          });
          addLines(['  │']);
        });
        addLines([`  └─ Total: ${total} cards`, '']);
        break;
      }

      case 'mover':
      case 'move':
      case 'mv': {
        const shortId = parts[1];
        const destArg = parts[2]?.toLowerCase();
        if (!shortId || !destArg) {
          addLines(['  ⚠ Uso: mover <id> <coluna>']);
          break;
        }

        const destColId = COLUMN_ALIASES[destArg];
        if (!destColId) {
          addLines(['  ✗ Coluna inválida. Use: backlog, a-fazer, em-andamento, em-revisao, concluido']);
          break;
        }

        const card = findCardByShortId(shortId);
        if (!card) {
          addLines([`  ✗ Card "${shortId}" não encontrado`]);
          break;
        }

        const newData = { ...data, columns: { ...data.columns }, cards: { ...data.cards } };
        // Remove from old column
        const oldCol = { ...newData.columns[card.columnId] };
        oldCol.cardIds = oldCol.cardIds.filter((id) => id !== card.id);
        newData.columns[card.columnId] = oldCol;
        // Add to new column
        const destCol = { ...newData.columns[destColId] };
        destCol.cardIds = [...destCol.cardIds, card.id];
        newData.columns[destColId] = destCol;
        // Update card
        newData.cards[card.id] = { ...card, columnId: destColId };
        onUpdateData(newData);

        addLines([
          `  ✓ "${card.title}" movido para ${getColumnName(destColId)}`,
          '',
        ]);
        break;
      }

      case 'excluir':
      case 'delete':
      case 'rm': {
        const shortId = parts[1];
        if (!shortId) {
          addLines(['  ⚠ Uso: excluir <id>']);
          break;
        }
        const card = findCardByShortId(shortId);
        if (!card) {
          addLines([`  ✗ Card "${shortId}" não encontrado`]);
          break;
        }

        const newData = { ...data, columns: { ...data.columns }, cards: { ...data.cards } };
        const col = { ...newData.columns[card.columnId] };
        col.cardIds = col.cardIds.filter((id) => id !== card.id);
        newData.columns[card.columnId] = col;
        delete newData.cards[card.id];
        onUpdateData(newData);

        addLines([`  ✓ Card "${card.title}" excluído`, '']);
        break;
      }

      case 'buscar':
      case 'search':
      case 'find': {
        const term = parts.slice(1).join(' ').toLowerCase();
        if (!term) {
          addLines(['  ⚠ Uso: buscar <termo>']);
          break;
        }
        const results = Object.values(data.cards).filter(
          (c) => c.title.toLowerCase().includes(term) || (c.description || '').toLowerCase().includes(term)
        );
        if (results.length === 0) {
          addLines([`  Nenhum resultado para "${term}"`, '']);
        } else {
          addLines([`  Resultados para "${term}":`]);
          results.forEach((card) => {
            addLines([`  • [${card.id.slice(0, 8)}] ${card.title} → ${getColumnName(card.columnId)}`]);
          });
          addLines(['']);
        }
        break;
      }

      case 'projetos':
      case 'projects': {
        addLines(['  Projetos:']);
        data.projects.forEach((p) => {
          const count = Object.values(data.cards).filter((c) => c.project === p).length;
          addLines([`  • ${p} (${count} cards)`]);
        });
        addLines(['']);
        break;
      }

      case 'projeto':
      case 'project': {
        const name = parts.slice(1).join(' ');
        if (!name) {
          addLines(['  ⚠ Uso: projeto <nome>']);
          break;
        }
        if (data.projects.includes(name)) {
          addLines([`  ⚠ Projeto "${name}" já existe`, '']);
          break;
        }
        const newData = { ...data, projects: [...data.projects, name] };
        onUpdateData(newData);
        addLines([`  ✓ Projeto "${name}" criado`, '']);
        break;
      }

      case 'stats':
      case 'estatisticas': {
        const totalCards = Object.keys(data.cards).length;
        const byPriority = { alta: 0, media: 0, baixa: 0 };
        Object.values(data.cards).forEach((c) => {
          if (byPriority[c.priority] !== undefined) byPriority[c.priority]++;
        });

        addLines([
          '  ┌─ Estatísticas',
          `  │ Total de cards: ${totalCards}`,
          `  │ Projetos: ${data.projects.length}`,
          '  │',
        ]);
        data.columnOrder.forEach((colId) => {
          const col = data.columns[colId];
          const count = col.cardIds.length;
          const bar = '█'.repeat(Math.min(count * 2, 20)) + '░'.repeat(Math.max(20 - count * 2, 0));
          addLines([`  │ ${col.title.padEnd(14)} ${bar} ${count}`]);
        });
        addLines([
          '  │',
          `  │ 🔴 Alta: ${byPriority.alta}  🟡 Média: ${byPriority.media}  🟢 Baixa: ${byPriority.baixa}`,
          '  └─',
          '',
        ]);
        break;
      }

      case 'exportar':
      case 'export': {
        onExport();
        addLines(['  ✓ Dados exportados com sucesso', '']);
        break;
      }

      default: {
        addLines([`  ✗ Comando desconhecido: "${command}". Digite "help" para ajuda.`, '']);
      }
    }
  }, [data, onUpdateData, onExport, addLines, findCardByShortId, getColumnName]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      processCommand(input);
      setHistory((prev) => [input, ...prev].slice(0, 50));
      setHistoryIdx(-1);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHistoryIdx((prev) => {
        const next = Math.min(prev + 1, history.length - 1);
        setInput(history[next] || '');
        return next;
      });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHistoryIdx((prev) => {
        const next = Math.max(prev - 1, -1);
        setInput(next === -1 ? '' : history[next] || '');
        return next;
      });
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col" style={{ width: minimized ? 'auto' : '600px' }}>
      {/* Title bar - Mac style */}
      <div className="bg-[#2a2a2a] rounded-t-xl px-4 py-2.5 flex items-center justify-between border border-white/10 border-b-0 cursor-move">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 transition-all"
            title="Fechar"
          />
          <button
            onClick={() => setMinimized(!minimized)}
            className="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-110 transition-all"
            title="Minimizar"
          />
          <button
            className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-110 transition-all"
            title="Maximizar"
          />
        </div>
        <div className="flex items-center gap-2 text-dark-300 text-xs">
          <FiTerminal size={12} />
          <span className="font-medium">kanban — bash</span>
        </div>
        <div className="w-14" />
      </div>

      {/* Terminal body */}
      {!minimized && (
        <div
          className="bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 border-t-0 rounded-b-xl flex flex-col"
          style={{ height: '380px' }}
          onClick={() => inputRef.current?.focus()}
        >
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm">
            {lines.map((line, i) => (
              <div key={i} className="text-dark-200 leading-6 whitespace-pre">
                {line || '\u00A0'}
              </div>
            ))}
            {/* Input line */}
            <div className="flex items-center text-dark-200 leading-6">
              <span className="text-green-400 mr-2">❯</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none text-dark-100 font-mono text-sm caret-green-400"
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
