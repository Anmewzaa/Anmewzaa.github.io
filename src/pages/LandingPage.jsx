import { Link } from 'react-router-dom'
import styles from './LandingPage.module.css'

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <span className={styles.logo}>⬡ Mewstella</span>
        <Link to="/builder" className={styles.navCta}>Open Builder</Link>
      </nav>

      <section className={styles.hero}>
        <div className={styles.badge}>Azure · Terraform · Visual</div>
        <h1 className={styles.title}>
          Drag. Drop. Deploy.
        </h1>
        <p className={styles.tagline}>Visual Terraform for Azure</p>
        <p className={styles.desc}>
          Design your Azure infrastructure visually — drag components onto a canvas,
          connect them, and get production-ready Terraform HCL generated in real time.
          No cloud expertise required to get started.
        </p>
        <div className={styles.actions}>
          <Link to="/builder" className={styles.ctaBtn}>Try the Demo →</Link>
          <a href="https://github.com" className={styles.ghostBtn}>GitHub</a>
        </div>
      </section>

      <section className={styles.preview}>
        <div className={styles.previewLabel}>Builder Preview</div>
        <div className={styles.mockBuilder}>
          <div className={styles.mockSidebar}>
            <div className={styles.mockGroup}>Networking</div>
            {['VNet','Subnet','NSG','Public IP','NIC'].map(r => (
              <div key={r} className={styles.mockItem}>{r}</div>
            ))}
            <div className={styles.mockGroup}>Compute</div>
            {['Virtual Machine'].map(r => (
              <div key={r} className={styles.mockItem}>{r}</div>
            ))}
            <div className={styles.mockGroup}>Storage</div>
            {['Storage Account'].map(r => (
              <div key={r} className={styles.mockItem}>{r}</div>
            ))}
          </div>
          <div className={styles.mockCanvas}>
            <div className={styles.mockCanvasLabel}>Canvas — drop resources here</div>
            <div className={styles.mockNodes}>
              <div className={`${styles.mockNode} ${styles.nodeRg}`}>📦 Resource Group<br/><span>my-rg · East US</span></div>
              <div className={`${styles.mockNode} ${styles.nodeVnet}`}>🌐 VNet<br/><span>my-vnet · 10.0.0.0/16</span></div>
              <div className={`${styles.mockNode} ${styles.nodeVm}`}>💻 VM<br/><span>my-vm · Standard_B1s</span></div>
              <svg className={styles.mockEdge} viewBox="0 0 200 60">
                <defs><marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#7C3AED"/></marker></defs>
                <path d="M10,30 C60,30 140,30 190,30" stroke="#7C3AED" strokeWidth="2" fill="none" markerEnd="url(#arr)"/>
              </svg>
            </div>
          </div>
          <div className={styles.mockCode}>
            <div className={styles.mockCodeBar}>main.tf <span>· HCL</span></div>
            <pre className={styles.mockCodeBody}>{`resource "azurerm_resource_group" "rg" {
  name     = "my-rg"
  location = "East US"
}

resource "azurerm_virtual_network" "vnet" {
  name                = "my-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = "East US"
  resource_group_name = azurerm_resource_group.rg.name
}`}</pre>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        {[
          { icon: '🎯', title: 'Visual First', desc: 'Build infrastructure the way you think — visually. No HCL memorization required.' },
          { icon: '⚡', title: 'Live Code Gen', desc: 'Every drag, drop, and connection updates your Terraform code instantly.' },
          { icon: '☁️', title: 'Azure Native', desc: 'Purpose-built for Azure with accurate resource schemas and references.' },
        ].map(f => (
          <div key={f.title} className={styles.featureCard}>
            <span className={styles.featureIcon}>{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className={styles.footer}>
        Built with React &amp; React Flow · <a href="https://github.com">GitHub</a>
      </footer>
    </div>
  )
}
