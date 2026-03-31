import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'todo-mcp-app.todos'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
]

function loadTodos() {
  try {
    const storedTodos = window.localStorage.getItem(STORAGE_KEY)

    if (!storedTodos) {
      return []
    }

    const parsedTodos = JSON.parse(storedTodos)

    if (!Array.isArray(parsedTodos)) {
      return []
    }

    return parsedTodos.filter(
      (todo) =>
        todo &&
        typeof todo.id === 'string' &&
        typeof todo.text === 'string' &&
        typeof todo.completed === 'boolean' &&
        typeof todo.createdAt === 'number',
    )
  } catch {
    return []
  }
}

function App() {
  const [draft, setDraft] = useState('')
  const [filter, setFilter] = useState('all')
  const [todos, setTodos] = useState(() => loadTodos())

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const visibleTodos = useMemo(() => {
    const sortedTodos = [...todos].sort((a, b) => b.createdAt - a.createdAt)

    if (filter === 'active') {
      return sortedTodos.filter((todo) => !todo.completed)
    }

    if (filter === 'completed') {
      return sortedTodos.filter((todo) => todo.completed)
    }

    return sortedTodos
  }, [filter, todos])

  const totalCount = todos.length
  const activeCount = todos.filter((todo) => !todo.completed).length
  const completedCount = totalCount - activeCount

  const hasTodos = totalCount > 0
  const hasCompletedTodos = completedCount > 0

  function handleSubmit(event) {
    event.preventDefault()

    const text = draft.trim()

    if (!text) {
      return
    }

    const nextTodo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: Date.now(),
    }

    setTodos((currentTodos) => [nextTodo, ...currentTodos])
    setDraft('')
  }

  function handleToggle(todoId) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
  }

  function handleDelete(todoId) {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== todoId))
  }

  function handleClearCompleted() {
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.completed))
  }

  function getEmptyState() {
    if (!hasTodos) {
      return {
        title: 'Nothing here yet',
        message: 'Add your first task to start building momentum.',
      }
    }

    if (filter === 'active') {
      return {
        title: 'No active tasks',
        message: 'Everything is done for now, or this list needs a fresh start.',
      }
    }

    if (filter === 'completed') {
      return {
        title: 'No completed tasks',
        message: 'Finish something and it will land here for a quick review.',
      }
    }

    return {
      title: 'No matching tasks',
      message: 'Try another filter or add a new task.',
    }
  }

  const emptyState = getEmptyState()

  return (
    <main className="app-shell">
      <section className="app-card">
        <div className="app-hero">
          <p className="eyebrow">Single-list command center</p>
          <h1>Turn scattered tasks into a clean daily runway.</h1>
          <p className="hero-copy">
            Add what matters, check it off fast, and keep the list moving with
            focused filters.
          </p>
        </div>

        <form className="composer" onSubmit={handleSubmit}>
          <label className="composer-label" htmlFor="todo-input">
            Add a task
          </label>
          <div className="composer-row">
            <input
              id="todo-input"
              className="composer-input"
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ship the polished todo app"
              autoComplete="off"
            />
            <button className="composer-button" type="submit">
              Add task
            </button>
          </div>
        </form>

        <section className="toolbar" aria-label="Task controls">
          <div className="stats" aria-label="Task summary">
            <article>
              <span>{totalCount}</span>
              <p>Total</p>
            </article>
            <article>
              <span>{activeCount}</span>
              <p>Active</p>
            </article>
            <article>
              <span>{completedCount}</span>
              <p>Completed</p>
            </article>
          </div>

          <div className="toolbar-row">
            <div className="filters" role="tablist" aria-label="Filter tasks">
              {FILTERS.map((option) => (
                <button
                  key={option.id}
                  className={
                    option.id === filter ? 'filter-chip active' : 'filter-chip'
                  }
                  type="button"
                  role="tab"
                  aria-selected={option.id === filter}
                  onClick={() => setFilter(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button
              className="clear-button"
              type="button"
              onClick={handleClearCompleted}
              disabled={!hasCompletedTodos}
            >
              Clear completed
            </button>
          </div>
        </section>

        <section className="list-panel" aria-live="polite">
          {visibleTodos.length > 0 ? (
            <ul className="todo-list">
              {visibleTodos.map((todo) => (
                <li
                  key={todo.id}
                  className={todo.completed ? 'todo-item completed' : 'todo-item'}
                >
                  <label className="todo-main">
                    <input
                      className="todo-checkbox"
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggle(todo.id)}
                    />
                    <span className="todo-copy">
                      <span className="todo-text">{todo.text}</span>
                      <span className="todo-meta">
                        Created{' '}
                        {new Date(todo.createdAt).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </span>
                  </label>

                  <button
                    className="delete-button"
                    type="button"
                    onClick={() => handleDelete(todo.id)}
                    aria-label={`Delete ${todo.text}`}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <p className="empty-title">{emptyState.title}</p>
              <p className="empty-copy">{emptyState.message}</p>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

export default App
