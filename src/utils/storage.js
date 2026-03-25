const STORAGE_KEY = 'kanban-seplag-data';

const defaultData = {
  columns: {
    'backlog': {
      id: 'backlog',
      title: 'Backlog',
      color: '#6366f1',
      cardIds: [],
    },
    'a-fazer': {
      id: 'a-fazer',
      title: 'A Fazer',
      color: '#f59e0b',
      cardIds: [],
    },
    'em-andamento': {
      id: 'em-andamento',
      title: 'Em Andamento',
      color: '#3b82f6',
      cardIds: [],
    },
    'em-revisao': {
      id: 'em-revisao',
      title: 'Em Revisão',
      color: '#a855f7',
      cardIds: [],
    },
    'concluido': {
      id: 'concluido',
      title: 'Concluído',
      color: '#22c55e',
      cardIds: [],
    },
  },
  columnOrder: ['backlog', 'a-fazer', 'em-andamento', 'em-revisao', 'concluido'],
  cards: {},
  projects: ['Geral'],
};

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Erro ao carregar dados:', e);
  }
  return { ...defaultData };
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Erro ao salvar dados:', e);
  }
}

export function exportData(data) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kanban-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.columns && data.cards && data.columnOrder) {
          resolve(data);
        } else {
          reject(new Error('Formato de arquivo inválido'));
        }
      } catch {
        reject(new Error('JSON inválido'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file);
  });
}
