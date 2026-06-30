import { Handle, Position, NodeResizer } from '@xyflow/react'
import { RESOURCE_TYPES } from '../../utils/resourceTypes'
import styles from './ContainerNode.module.css'

export default function ContainerNode({ data, selected }) {
  const rt = RESOURCE_TYPES[data.type]
  if (!rt) return null

  return (
    <>
      <NodeResizer
        minWidth={200}
        minHeight={140}
        isVisible={selected}
        lineStyle={{ borderColor: rt.color }}
        handleStyle={{ borderColor: rt.color, background: '#1f2937' }}
      />
      <div
        className={`${styles.container} ${selected ? styles.selected : ''}`}
        style={{ '--node-color': rt.color }}
      >
        <div className={styles.label}>
          <span className={styles.icon}>{rt.icon}</span>
          <div className={styles.labelText}>
            <div className={styles.name}>{data.name || 'unnamed'}</div>
            <div className={styles.type}>{rt.label}</div>
          </div>
        </div>
      </div>
      <Handle type="target" position={Position.Left} className={styles.handle} />
      <Handle type="source" position={Position.Right} className={styles.handle} />
    </>
  )
}
