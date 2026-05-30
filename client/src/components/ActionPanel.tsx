import { useState } from 'react'
import { FiPlay } from 'react-icons/fi'
import { SelectListbox, type SelectOption } from './SelectListbox'

export type ActionField = {
  name: string
  label?: string
  options?: SelectOption[]
}

type Props = {
  title: string
  fields: Array<string | ActionField>
  initial: Record<string, string>
  onRun: (body: Record<string, string>) => void
  output: string
}

export function ActionPanel({ title, fields, initial, onRun, output }: Props) {
  const [form, setForm] = useState(initial)
  const normalizedFields = fields.map((field) => (typeof field === 'string' ? { name: field } : field))

  return (
    <section className="grid two">
      <div className="panel">
        <h2>{title}</h2>
        <div className="form-grid">
          {normalizedFields.map((field) => (
            field.options ? (
              <SelectListbox
                key={field.name}
                label={field.label || field.name}
                value={form[field.name] || field.options[0]?.value || ''}
                options={field.options}
                onChange={(value) => setForm({ ...form, [field.name]: value })}
              />
            ) : (
              <label key={field.name}>
                <span>{field.label || field.name}</span>
                <input value={form[field.name] || ''} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })} />
              </label>
            )
          ))}
        </div>
        <button className="primary command-button" onClick={() => onRun(form)}>
          <FiPlay aria-hidden="true" />
          <span>Run check</span>
        </button>
      </div>
      <pre className="output">{output}</pre>
    </section>
  )
}
