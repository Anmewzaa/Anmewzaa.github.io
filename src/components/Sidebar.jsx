import { RESOURCE_TYPES, CATEGORIES } from '../utils/resourceTypes'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  const onDragStart = (event, type) => {
    event.dataTransfer.setData('application/reactflow-type', type)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>Components</div>
      {CATEGORIES.map(cat => {
        const items = Object.entries(RESOURCE_TYPES).filter(([, v]) => v.category === cat)
        if (!items.length) return null
        return (
          <div key={cat} className={styles.group}>
            <div className={styles.groupLabel}>{cat}</div>
            {items.map(([type, rt]) => (
              <div
                key={type}
                className={styles.item}
                draggable
                onDragStart={e => onDragStart(e, type)}
                style={{ '--item-color': rt.color }}
              >
                <span className={styles.itemIcon}>{rt.icon}</span>
                <span className={styles.itemLabel}>{rt.label}</span>
              </div>
            ))}
          </div>
        )
      })}
      <div className={styles.hint}>Drag resources onto the canvas</div>
    </aside>
  )
}
