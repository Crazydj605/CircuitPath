import React from 'react'

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 border border-slate-200">$1</code>')
}

export function RenderMd({ text }: { text: string }) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let tableHeaders: string[] = []
  let tableRows: string[][] = []
  let listItems: { ordered: boolean; text: string }[] = []
  let inTable = false
  let inList = false
  let inOrderedList = false

  const flushTable = (key: number) => {
    if (tableHeaders.length === 0) return
    elements.push(
      <div key={key} className="overflow-x-auto mb-3">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              {tableHeaders.map((h, i) => (
                <th key={i} className="text-left py-2 pr-6 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {h.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 1 ? 'bg-slate-50' : ''}>
                {row.map((cell, ci) => (
                  <td key={ci} className="py-2 pr-6 text-sm text-slate-600 border-b border-slate-100">
                    <span dangerouslySetInnerHTML={{ __html: formatInline(cell.trim()) }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
    tableHeaders = []
    tableRows = []
    inTable = false
  }

  const flushList = (key: number) => {
    if (listItems.length === 0) return
    const ordered = listItems[0].ordered
    const Tag = ordered ? 'ol' : 'ul'
    elements.push(
      React.createElement(
        Tag,
        { key, className: ordered ? 'space-y-1.5 mb-3 ml-1 list-none' : 'space-y-1.5 mb-3 ml-1' },
        listItems.map((item, i) =>
          React.createElement(
            'li',
            { key: i, className: 'flex items-start gap-2 text-sm text-slate-600' },
            ordered
              ? React.createElement('span', { className: 'text-xs font-bold text-slate-400 mt-0.5 shrink-0 w-4' }, `${i + 1}.`)
              : React.createElement('span', { className: 'w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0' }),
            React.createElement('span', {
              dangerouslySetInnerHTML: { __html: formatInline(item.text) },
            })
          )
        )
      )
    )
    listItems = []
    inList = false
    inOrderedList = false
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim()

    // Table row
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (/^[\|:\-\s]+$/.test(trimmed)) return // separator row
      const cells = trimmed.slice(1, -1).split('|')
      if (!inTable) {
        if (inList || inOrderedList) flushList(idx)
        inTable = true
        tableHeaders = cells
      } else {
        tableRows.push(cells)
      }
      return
    }

    if (inTable) flushTable(idx)

    // Ordered list item (1. 2. etc)
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)/)
    if (orderedMatch) {
      if (inList) flushList(idx)
      inOrderedList = true
      inList = true
      listItems.push({ ordered: true, text: orderedMatch[2] })
      return
    }

    // Unordered list item
    if (trimmed.startsWith('- ')) {
      if (inOrderedList) { flushList(idx); }
      inList = true
      listItems.push({ ordered: false, text: trimmed.slice(2) })
      return
    }

    if (inList || inOrderedList) flushList(idx)

    // ## Header
    if (trimmed.startsWith('## ')) {
      elements.push(
        <p key={idx} className="text-sm font-bold text-slate-900 mt-4 mb-1.5">
          {trimmed.slice(3)}
        </p>
      )
      return
    }

    // ### Header
    if (trimmed.startsWith('### ')) {
      elements.push(
        <p key={idx} className="text-sm font-semibold text-slate-800 mt-3 mb-1">
          {trimmed.slice(4)}
        </p>
      )
      return
    }

    // Empty line
    if (trimmed === '') {
      elements.push(<div key={idx} className="h-1" />)
      return
    }

    // Regular paragraph
    elements.push(
      <p
        key={idx}
        className="text-sm text-slate-600 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
      />
    )
  })

  if (inTable) flushTable(lines.length)
  if (inList || inOrderedList) flushList(lines.length)

  return <div className="space-y-0.5">{elements}</div>
}
