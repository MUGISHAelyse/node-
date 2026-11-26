// ConfirmButton.jsx: a button that asks "Sure?" before it does something that cannot be undone, such as deleting.
// (It does not use window.confirm, which some browsers and previews block.)

import { useState } from 'react'

export default function ConfirmButton({ label, onConfirm, className = 'btn sm sec', question = 'Sure?', disabled = false }) {
  // false = show the normal button, true = show "Sure? Yes / No".
  const [asking, setAsking] = useState(false)

  if (!asking) {
    return <button type="button" className={className} disabled={disabled} onClick={() => setAsking(true)}>{label}</button>
  }
  return (
    <span className="confirm" role="group" aria-label="Please confirm">
      <span className="small">{question}</span>
      <button type="button" className="btn sm danger" onClick={() => { setAsking(false); onConfirm() }}>Yes</button>
      <button type="button" className="btn sm sec" onClick={() => setAsking(false)}>No</button>
    </span>
  )
}
