import {useState} from 'react'
import {generateRostersPDF, generateRoundPDF} from '../utils/utilities'
import config from '../AppConfig'

type Props = {
  tournament: any,
  token: string
}

export default function TournamentCard({tournament, token}: Props) {
  const [loadingLists, setLoadingList] = useState(false)
  const [loadingPairings, setLoadingPairings] = useState(false)
  const [leftSeconds, setSeftSeconds] = useState(0)
  let countdownInterval: any

  const startCountdown = (seconds: number) => {
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

  const createArray = (length) => {
    return Array.from({length}, (_, i) => i + 1)
  }

  const handleClick = async () => {
    setLoadingList(true)
    startCountdown(tournament.players * 3)
    try {
      const response = await fetch(`${config.url}api/lists?id=${tournament.id}&token=${encodeURIComponent(token)}`)
      const data = await response.json()
      generateRostersPDF(data, tournament.name)
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error('Неизвестная ошибка');
      }
    } finally {
      setLoadingList(false)
      setSeftSeconds(0)
    }
  }

  const handleClickRound = (round) => async () => {
    setLoadingPairings(true)
    try {
      const response = await fetch(`${config.url}api/round?tournamentId=${tournament.id}&round=${round}&token=${encodeURIComponent(token)}`)
      const data = await response.json()
      generateRoundPDF(data, tournament.name, round)
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error('Неизвестная ошибка');
      }
    }finally {
      setLoadingPairings(false)
    }
  }

  const renderRound = (round) => <button key={round} onClick={handleClickRound(round)} disabled={loadingPairings} style={Styles.round}>{round}</button>

  return <div style={Styles.container}>
    <h3>{tournament.name}</h3>
    <p style={Styles.p}><strong>Место проведения:</strong> {tournament.location}</p>
    <p style={Styles.p}><strong>Дата начала:</strong> {new Date(tournament.eventDate).toLocaleDateString()}</p>
    <p style={Styles.p}><strong>Дата окончания:</strong> {new Date(tournament.eventEndDate).toLocaleDateString()}</p>
    <p style={Styles.p}><strong>Организатор:</strong> {tournament.owner}</p>
    <p style={Styles.p}><strong>Игроки:</strong> {tournament.players}/{tournament.numTickets}</p>
    <p style={Styles.p}><strong>Статус:</strong> {tournament.ended ? 'Окончен' : 'Активен'}</p>
    {tournament.currentRound
      ? <>
        <b>Скачать паринги раунда</b>
        <div style={Styles.row}>
          {createArray(tournament.currentRound).map(renderRound)}
        </div>
      </>
      : null
    }
    <button style={Styles.button} onClick={handleClick} disabled={loadingLists}>{loadingLists ? `Загрузка` : 'Скачать Листы'}</button>
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
  button: {backgroundColor: 'lightblue', color: 'black'},
  row: {display: 'flex', justifyContent: 'space-between', paddingBottom: 16, paddingTop: 8},
  round: {flex: 1, textAlign: 'center', marginLeft: 4, marginright: 4}
}