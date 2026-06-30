import { useState } from 'react'
import { generateTerraform } from '../utils/terraformGenerator'
import styles from './TerraformOutput.module.css'

function syntaxHighlight(code) {
  const keywords = ['resource', 'provider', 'terraform', 'required_providers', 'features', 'source', 'version', 'true', 'false']
  const lines = code.split('\n')
  return lines.map((line, i) => {
    const parts = []
    let rest = line

    // Highlight strings
    const stringRe = /"([^"]*)"/g
    let lastIndex = 0
    let match
    const segments = []
    while ((match = stringRe.exec(rest)) !== null) {
      if (match.index > lastIndex) segments.push({ text: rest.slice(lastIndex, match.index), type: 'plain' })
      segments.push({ text: match[0], type: 'string' })
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < rest.length) segments.push({ text: rest.slice(lastIndex), type: 'plain' })

    return (
      <span key={i}>
        {segments.map((seg, si) => {
          if (seg.type === 'string') {
            return <span key={si} className={styles.str}>{seg.text}</span>
          }
          // Check for keywords
          const word = seg.text.trim()
          if (keywords.includes(word)) {
            return <span key={si} className={styles.kw}>{seg.text}</span>
          }
          // Comments
          if (seg.text.trimStart().startsWith('#')) {
            return <span key={si} className={styles.comment}>{seg.text}</span>
          }
          return <span key={si}>{seg.text}</span>
        })}
        {'\n'}
      </span>
    )
  })
}

export default function TerraformOutput({ nodes, edges }) {
  const [collapsed, setCollapsed] = useState(false)
  const [copied, setCopied] = useState(false)
  const hcl = generateTerraform(nodes, edges)

  const handleCopy = () => {
    navigator.clipboard.writeText(hcl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const handleDownload = () => {
    const blob = new Blob([hcl], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'main.tf'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`${styles.panel} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.bar}>
        <button className={styles.toggle} onClick={() => setCollapsed(c => !c)}>
          {collapsed ? '▲' : '▼'} Terraform Output
        </button>
        <span className={styles.fileLabel}>main.tf · HCL</span>
        <div className={styles.barActions}>
          <button className={styles.barBtn} onClick={handleCopy}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <button className={styles.barBtn} onClick={handleDownload}>
            Download .tf
          </button>
        </div>
      </div>
      {!collapsed && (
        <pre className={styles.code}>
          <code>{syntaxHighlight(hcl)}</code>
        </pre>
      )}
    </div>
  )
}
