import { useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import Sidebar from '../components/Sidebar'
import ConfigPanel from '../components/ConfigPanel'
import TerraformOutput from '../components/TerraformOutput'
import AzureNode from '../components/nodes/AzureNode'
import { RESOURCE_TYPES } from '../utils/resourceTypes'
import styles from './BuilderPage.module.css'

const nodeTypes = { azureNode: AzureNode }

let nodeIdCounter = 1

function BuilderInner() {
  const reactFlowWrapper = useRef(null)
  const [rfInstance, setRfInstance] = useState(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState(null)

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#7C3AED' } }, eds)),
    [setEdges]
  )

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()
      const type = event.dataTransfer.getData('application/reactflow-type')
      if (!type || !rfInstance) return

      const rt = RESOURCE_TYPES[type]
      if (!rt) return

      const position = rfInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const id = `node_${nodeIdCounter++}`
      const newNode = {
        id,
        type: 'azureNode',
        position,
        data: { type, name: `${rt.label.toLowerCase().replace(/\s+/g, '-')}-${nodeIdCounter}`, ...rt.defaultData },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [rfInstance, setNodes]
  )

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const onUpdateNode = useCallback((id, newData) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: newData } : n))
    )
    setSelectedNode((prev) => (prev && prev.id === id ? { ...prev, data: newData } : prev))
  }, [setNodes])

  const onDeleteNode = useCallback((id) => {
    setNodes((nds) => nds.filter((n) => n.id !== id))
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
    setSelectedNode(null)
  }, [setNodes, setEdges])

  const currentSelectedNode = selectedNode
    ? nodes.find((n) => n.id === selectedNode.id) || null
    : null

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>⬡ Mewstella</Link>
        <span className={styles.headerTitle}>Visual Terraform Builder</span>
        <div className={styles.headerRight}>
          <span className={styles.badge}>Azure · MVP</span>
        </div>
      </header>

      <div className={styles.workarea}>
        <Sidebar />

        <div className={styles.canvas} ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setRfInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode="Delete"
            style={{ background: '#0d0d0d' }}
          >
            <Background color="#374151" gap={24} size={1} />
            <Controls style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
            <MiniMap
              nodeColor={(n) => {
                const rt = RESOURCE_TYPES[n.data?.type]
                return rt ? rt.color : '#374151'
              }}
              style={{ background: '#111827', border: '1px solid #374151' }}
              maskColor="rgba(0,0,0,0.5)"
            />
          </ReactFlow>

          {!nodes.length && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>☁️</div>
              <div className={styles.emptyTitle}>Start building your infrastructure</div>
              <div className={styles.emptyDesc}>Drag Azure resources from the left panel onto the canvas</div>
            </div>
          )}
        </div>

        <ConfigPanel
          node={currentSelectedNode}
          onUpdate={onUpdateNode}
          onDelete={onDeleteNode}
        />
      </div>

      <TerraformOutput nodes={nodes} edges={edges} />
    </div>
  )
}

export default function BuilderPage() {
  return (
    <ReactFlowProvider>
      <BuilderInner />
    </ReactFlowProvider>
  )
}
