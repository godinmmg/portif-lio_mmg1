# 📊 React Dashboard - Task Manager

> Dashboard moderno e responsivo para gerenciamento de tarefas, desenvolvido com React + TypeScript + Testes completos

[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Jest](https://img.shields.io/badge/Jest-29+-green.svg)](https://jestjs.io/)
[![Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen.svg)](https://jestjs.io/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🚀 Features

- ✅ **TypeScript** - Tipagem estática completa
- ✅ **React Hooks** - useState, useEffect, useContext, Custom Hooks
- ✅ **Context API** - Gerenciamento de estado global
- ✅ **Testes Completos** - Jest + React Testing Library
- ✅ **Gráficos** - Visualização de dados com Recharts
- ✅ **Responsivo** - Mobile-first design
- ✅ **Autenticação JWT** - Sistema seguro de login
- ✅ **API Integration** - Integração com REST API
- ✅ **Clean Code** - Padrões e boas práticas

## 📸 Screenshots

### Dashboard Principal
```
┌─────────────────────────────────────────┐
│  📊 Dashboard                  🔔 ⚙️ 👤│
├─────────────────────────────────────────┤
│                                         │
│  📈 Estatísticas                        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ 45   │ │ 12   │ │ 28   │ │ 5    │  │
│  │Total │ │Pend. │ │Prog. │ │Conc. │  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │
│                                         │
│  📋 Minhas Tarefas                      │
│  ┌─────────────────────────────────┐   │
│  │ 🔴 HIGH │ Implementar login     │   │
│  │ Status: Em Progresso            │   │
│  │ [Editar] [Deletar]              │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## 🛠️ Tecnologias

### Core
- **React 18** - Framework UI
- **TypeScript** - Superset JavaScript
- **React Router DOM** - Navegação SPA

### UI & Gráficos
- **CSS3** - Estilização
- **Recharts** - Gráficos e visualizações
- **Responsive Design** - Mobile-first

### HTTP & Estado
- **Axios** - Cliente HTTP
- **Context API** - Estado global
- **Custom Hooks** - Lógica reutilizável

### Testes
- **Jest** - Framework de testes
- **React Testing Library** - Testes de componentes
- **@testing-library/jest-dom** - Matchers customizados

## ⚙️ Instalação

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- API Task Manager rodando (ver repositório [task-manager-api](https://github.com/godinmmg/portifolio_mmg))

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/godinmmg/portifolio_mmg1.git
cd portifolio_mmg1
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Crie um arquivo .env na raiz do projeto
echo "REACT_APP_API_URL=http://localhost:3000/api" > .env
```

4. **Inicie o servidor de desenvolvimento**
```bash
npm start
```

A aplicação estará disponível em: `http://localhost:3000`

## 🧪 Testes

### Executar todos os testes
```bash
npm test
```

### Executar com cobertura
```bash
npm test -- --coverage
```

### Executar em modo watch
```bash
npm test -- --watch
```

### Cobertura atual
```
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   92.5  |   88.2   |   90.1  |   93.4  |
 components/          |   95.3  |   91.7   |   94.2  |   96.1  |
 hooks/               |   88.9  |   82.4   |   85.3  |   89.7  |
 services/            |   93.7  |   90.1   |   91.8  |   94.2  |
 contexts/            |   90.2  |   85.6   |   88.9  |   91.1  |
```

## 📁 Estrutura do Projeto

```
react-dashboard/
├── public/                   # Arquivos estáticos
├── src/
│   ├── components/          # Componentes React
│   │   ├── TaskCard.tsx
│   │   ├── TaskCard.css
│   │   └── __tests__/
│   │       └── TaskCard.test.tsx
│   ├── pages/               # Páginas da aplicação
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── hooks/               # Custom Hooks
│   │   ├── useTasks.ts
│   │   └── __tests__/
│   │       └── useTasks.test.ts
│   ├── contexts/            # Context API
│   │   ├── AuthContext.tsx
│   │   └── __tests__/
│   │       └── AuthContext.test.tsx
│   ├── services/            # API Services
│   │   ├── api.ts
│   │   └── __tests__/
│   │       └── api.test.ts
│   ├── types/               # TypeScript Types
│   │   └── index.ts
│   ├── utils/               # Utilidades
│   ├── App.tsx              # Componente principal
│   └── index.tsx            # Entry point
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Funcionalidades

### Autenticação
- ✅ Login de usuários
- ✅ Registro de novos usuários
- ✅ Logout
- ✅ Persistência de sessão (localStorage)
- ✅ Proteção de rotas privadas

### Gerenciamento de Tarefas
- ✅ Listar tarefas
- ✅ Criar nova tarefa
- ✅ Editar tarefa existente
- ✅ Deletar tarefa
- ✅ Filtrar por status e prioridade
- ✅ Paginação
- ✅ Busca de tarefas

### Dashboard
- ✅ Estatísticas em tempo real
- ✅ Gráficos de progresso
- ✅ Filtros avançados
- ✅ Responsivo (mobile/tablet/desktop)

## 🎨 Componentes Principais

### TaskCard
Componente para exibir uma tarefa individual com ações.

```typescript
<TaskCard
  task={task}
  onEdit={(task) => handleEdit(task)}
  onDelete={(id) => handleDelete(id)}
  onStatusChange={(id, status) => handleStatusChange(id, status)}
/>
```

### AuthContext
Context para gerenciamento de autenticação.

```typescript
const { user, login, logout, isAuthenticated } = useAuth();
```

### useTasks Hook
Hook customizado para gerenciar tarefas.

```typescript
const {
  tasks,
  loading,
  error,
  createTask,
  updateTask,
  deleteTask,
  fetchTasks,
} = useTasks();
```

## 🔒 Segurança

- ✅ Tokens JWT armazenados com segurança
- ✅ Interceptors Axios para autenticação automática
- ✅ Logout automático em caso de token inválido
- ✅ Validação de formulários
- ✅ Sanitização de inputs

## 📱 Responsividade

O dashboard é totalmente responsivo e otimizado para:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1440px+)

## 🚀 Build e Deploy

### Build de produção
```bash
npm run build
```

### Deploy (exemplo com Vercel)
```bash
npm install -g vercel
vercel --prod
```

### Variáveis de ambiente em produção
```env
REACT_APP_API_URL=https://sua-api.com/api
```

## 🧪 Metodologia de Testes

### Testes de Componentes
- Renderização correta
- Interações do usuário
- Estados e props
- Eventos e callbacks

### Testes de Hooks
- Estados iniciais
- Chamadas de API
- Tratamento de erros
- Atualizações de estado

### Testes de Integração
- Fluxos completos de usuário
- Autenticação
- CRUD de tarefas

## 📝 Scripts Disponíveis

```bash
npm start          # Inicia servidor de desenvolvimento
npm test           # Executa testes
npm run build      # Build de produção
npm run eject      # Ejeta configuração do CRA
npm run lint       # Verifica lint
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Marcos (godinmmg)**

- GitHub: [@godinmmg](https://github.com/godinmmg)
- LinkedIn: [Seu LinkedIn](https://www.linkedin.com/in/seu-perfil)
- Email: contato@eletronicammg.cloud

## 🙏 Agradecimentos

- Inspirado em melhores práticas da comunidade React
- Desenvolvido com foco em Clean Code e TDD
- Projeto criado para demonstrar habilidades em frontend moderno

## 📚 Recursos Adicionais

- [Documentação React](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Testing Library](https://testing-library.com/)
- [React Hooks](https://react.dev/reference/react)

---

⭐ Se este projeto te ajudou, considere dar uma estrela!

Desenvolvido com ❤️ por [godinmmg](https://github.com/godinmmg)
