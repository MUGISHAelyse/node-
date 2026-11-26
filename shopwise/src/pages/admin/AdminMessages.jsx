// AdminMessages.jsx: /admin/messages: messages sent from the Contact page. Open one to read it.

import { useState } from 'react'
import { useMessages } from '../../context/MessagesContext'
import ConfirmButton from '../../components/ConfirmButton'
import { shortDate } from '../../utils/format'

export default function AdminMessages() {
  const { messages, unread, setRead, deleteMessage } = useMessages()
  // false = show all messages, true = only the unread ones.
  const [onlyNew, setOnlyNew] = useState(false)
  const list = messages.filter(m => !onlyNew || !m.read)

  return (
    <div className="panel">
      <div className="toolbar">
        <h2>Messages ({messages.length})</h2>
        <div className="chips">
          <button className={'chip' + (!onlyNew ? ' on' : '')} onClick={() => setOnlyNew(false)}>All</button>
          <button className={'chip' + (onlyNew ? ' on' : '')} onClick={() => setOnlyNew(true)}>Unread ({unread})</button>
        </div>
      </div>

      {list.length ? (
        <div className="msg-list">
          {list.map(m => (
            // Opening a message marks it as read.
            <details key={m.id} className={'msg' + (m.read ? '' : ' unread')} onToggle={e => { if (e.currentTarget.open && !m.read) setRead(m.id, true) }}>
              <summary>
                {!m.read && <span className="dot" aria-label="Unread" />}
                <b>{m.name}</b>
                <span className="muted small"> · {m.topic}{m.order ? ` · ${m.order}` : ''} · {shortDate(m.date)}</span>
                <span className="snippet muted small">{m.message}</span>
              </summary>
              <div className="msg-body">
                <p>{m.message}</p>
                <p className="muted small">From {m.name} &lt;{m.email}&gt; · reference {m.id}</p>
                <div className="row-actions">
                  {/* Opens the admin's email app with a reply already started. */}
                  <a className="btn sm" href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.topic} (${m.id})`)}`}>Reply by email</a>
                  <button className="btn sm sec" onClick={() => setRead(m.id, !m.read)}>{m.read ? 'Mark as unread' : 'Mark as read'}</button>
                  <ConfirmButton label="Delete" question="Delete?" onConfirm={() => deleteMessage(m.id)} />
                </div>
              </div>
            </details>
          ))}
        </div>
      ) : <p className="empty">{messages.length ? 'No unread messages.' : 'No messages yet. They appear here when someone uses the Contact page.'}</p>}
    </div>
  )
}
