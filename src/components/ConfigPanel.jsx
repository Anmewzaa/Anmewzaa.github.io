import { RESOURCE_TYPES } from '../utils/resourceTypes'
import styles from './ConfigPanel.module.css'

export default function ConfigPanel({ node, onUpdate, onDelete }) {
  if (!node) {
    return (
      <aside className={styles.panel}>
        <div className={styles.empty}>
          <span>Click a resource to configure it</span>
        </div>
      </aside>
    )
  }

  const rt = RESOURCE_TYPES[node.data.type]
  if (!rt) return null

  const handleChange = (key, value) => {
    onUpdate(node.id, { ...node.data, [key]: value })
  }

  return (
    <aside className={styles.panel}>
      <div className={styles.header} style={{ '--node-color': rt.color }}>
        <span className={styles.icon}>{rt.icon}</span>
        <span>{rt.label}</span>
      </div>
      <div className={styles.fields}>
        {rt.fields.map(field => (
          <div key={field.key} className={styles.field}>
            <label className={styles.label}>{field.label}</label>
            {field.type === 'select' ? (
              <select
                className={styles.input}
                value={node.data[field.key] || ''}
                onChange={e => handleChange(field.key, e.target.value)}
              >
                {field.options.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                className={styles.input}
                type="text"
                value={node.data[field.key] || ''}
                onChange={e => handleChange(field.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
      <div className={styles.actions}>
        <button className={styles.deleteBtn} onClick={() => onDelete(node.id)}>
          Delete Resource
        </button>
      </div>
    </aside>
  )
}
