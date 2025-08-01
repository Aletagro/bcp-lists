import {useState} from 'react'
import TournamentCard from './components/TournamentCard'
import config from './AppConfig'

function App() {
  const [token, setToken] = useState('')
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!token.trim()) {
      setError('Введите токен')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${config.url}api/tournaments?token=${encodeURIComponent(token)}`)
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(JSON.stringify(errData))
      }
      const data = await response.json()
      setTournaments(data || [])
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error('Неизвестная ошибка');
      }
    } finally {
      setLoading(false)
    }
  }

  return <div style={{ padding: '20px', fontFamily: 'Arial' }}>
    <div style={{ marginBottom: '20px' }}>
      <h1>Введите ваш токен</h1>
      <input
        type="text"
        placeholder="Введите ваш Bearer-токен"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        style={{ width: '400px', padding: '8px' }}
      />
      <button onClick={handleSearch} style={{ marginLeft: '10px', padding: '8px 16px' }}>
        Поиск
      </button>
    </div>
    <h1>Ваши Турниры</h1>
    {loading && <p>Загрузка...</p>}
    {error && <p style={{ color: 'red' }}>{error}</p>}

    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {tournaments.length > 0 ? (
        tournaments.map((t, i) => <TournamentCard key={i} tournament={t} token={token} />)
      ) : (
        <p>Нет активных турниров</p>
      )}
    </div>
  </div>
}

export default App
