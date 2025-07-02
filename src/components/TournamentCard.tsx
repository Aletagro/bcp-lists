import {useState} from 'react'
import {generateRostersPDF} from '../utils/utilities'

export default function TournamentCard({tournament, token}) {
  const [loading, setLoading] = useState(false)
  const [leftSeconds, setSeftSeconds] = useState(0)
  let countdownInterval

  const startCountdown = (seconds) => {
    let timeLeft = seconds
    countdownInterval = setInterval(() => {
      timeLeft--
      if (timeLeft <= 0) {
        clearInterval(countdownInterval)
      } else {
        setSeftSeconds(timeLeft)
      }
    }, 1000)
  }

  const handleClick = async () => {
    setLoading(true)
    startCountdown(tournament.players * 3)
    try {
      const response = await fetch(`https://bcp-server.onrender.com/api/lists?id=${tournament.id}&token=${encodeURIComponent(token)}`)
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(JSON.stringify(errData))
      }
      const data = await response.json()
      generateRostersPDF(data, tournament.name)
    } catch (err) {
      console.error(err.message)
    } finally {
      setLoading(false)
      setSeftSeconds(0)
    }
  }

  return <div style={Styles.container}>
    <h3>{tournament.name}</h3>
    <p style={Styles.p}><strong>Место проведения:</strong> {tournament.location}</p>
    <p style={Styles.p}><strong>Дата начала:</strong> {new Date(tournament.eventDate).toLocaleDateString()}</p>
    <p style={Styles.p}><strong>Дата окончания:</strong> {new Date(tournament.eventEndDate).toLocaleDateString()}</p>
    <p style={Styles.p}><strong>Организатор:</strong> {tournament.owner}</p>
    <p style={Styles.p}><strong>Игроки:</strong> {tournament.players}/{tournament.numTickets}</p>
    <p style={Styles.p}><strong>Статус:</strong> {tournament.ended ? 'Окончен' : 'Активен'}</p>
    <button style={Styles.button} onClick={handleClick} disabled={loading}>{loading ? `Загрузка` : 'Скачать Листы'}</button>
    {leftSeconds > 0 ? <p>До конца скачивания осталось примерно {leftSeconds} секунд</p> : null}
  </div>
}

const Styles = {
  container: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '16px',
    margin: '10px',
    width: '300px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  },
  p: {marginBottom: 12, marginTop: 0},
  button: {backgroundColor: 'lightblue'}
}