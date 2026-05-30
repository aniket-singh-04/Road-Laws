import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { FiCheck, FiChevronDown } from 'react-icons/fi'

export type SelectOption = {
  value: string
  label: string
  description?: string
}

type Props = {
  label: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  compact?: boolean
}

export function SelectListbox({ label, value, options, onChange, compact = false }: Props) {
  const selected = options.find((option) => option.value === value) || options[0]

  return (
    <div className={compact ? 'listbox compact-listbox' : 'listbox'}>
      <span className="listbox-label">{label}</span>
      <Listbox value={selected?.value || ''} onChange={onChange}>
        <ListboxButton className="listbox-button">
          <span>{selected?.label || 'Select'}</span>
          <FiChevronDown aria-hidden="true" />
        </ListboxButton>
        <ListboxOptions className="listbox-options" anchor="bottom start">
          {options.map((option) => (
            <ListboxOption key={option.value} value={option.value} className="listbox-option">
              {({ selected: active }) => (
                <>
                  <span>
                    <strong>{option.label}</strong>
                    {option.description ? <small>{option.description}</small> : null}
                  </span>
                  {active ? <FiCheck aria-hidden="true" /> : null}
                </>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  )
}
