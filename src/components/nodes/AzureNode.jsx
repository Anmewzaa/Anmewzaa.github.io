import { Handle, Position } from '@xyflow/react'
import { RESOURCE_TYPES } from '../../utils/resourceTypes'
import styles from './AzureNode.module.css'

export default function AzureNode({ data, selected }) {
  const rt = RESOURCE_TYPES[data.type]
  if (!rt) return null

  return (
    <div
      className={`${styles.node} ${selected ? styles.selected : ''}`}
      style={{ '--node-color': rt.color }}
    >
      <Handle type="target" position={Position.Left} className={styles.handle} />
      <div className={styles.header}>
        <span className={styles.icon}>{rt.icon}</span>
        <span className={styles.typeLabel}>{rt.label}</span>
      </div>
      <div className={styles.name}>{data.name || 'unnamed'}</div>
      {data.location && <div className={styles.meta}>{data.location}</div>}
      <Handle type="source" position={Position.Right} className={styles.handle} />
    </div>
  )
}
