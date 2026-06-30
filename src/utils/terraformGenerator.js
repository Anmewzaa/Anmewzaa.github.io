import { RESOURCE_TYPES } from './resourceTypes'

function safeId(name = '') {
  return name.toLowerCase().replace(/[^a-z0-9_]/g, '_') || 'resource'
}

function findConnected(nodeId, edges, nodes, targetType) {
  return edges
    .filter(e => e.source === nodeId || e.target === nodeId)
    .map(e => (e.source === nodeId ? e.target : e.source))
    .map(id => nodes.find(n => n.id === id))
    .filter(n => n && n.data.type === targetType)
}

function getRef(node) {
  const rt = RESOURCE_TYPES[node.data.type]
  if (!rt) return null
  return `${rt.tfType}.${safeId(node.data.name)}`
}

export function generateTerraform(nodes, edges) {
  if (!nodes.length) {
    return '# Drop Azure resources onto the canvas to generate Terraform code.'
  }

  const lines = []

  lines.push(`terraform {`)
  lines.push(`  required_providers {`)
  lines.push(`    azurerm = {`)
  lines.push(`      source  = "hashicorp/azurerm"`)
  lines.push(`      version = "~> 3.0"`)
  lines.push(`    }`)
  lines.push(`  }`)
  lines.push(`}`)
  lines.push(``)
  lines.push(`provider "azurerm" {`)
  lines.push(`  features {}`)
  lines.push(`}`)
  lines.push(``)

  const order = ['ResourceGroup', 'VNet', 'Subnet', 'NSG', 'PublicIP', 'NIC', 'VM', 'StorageAccount']
  const sorted = [...nodes].sort((a, b) => {
    const ai = order.indexOf(a.data.type)
    const bi = order.indexOf(b.data.type)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  for (const node of sorted) {
    const rt = RESOURCE_TYPES[node.data.type]
    if (!rt) continue
    const d = node.data
    const id = safeId(d.name)

    const connectedRGs = findConnected(node.id, edges, nodes, 'ResourceGroup')
    const connectedVNets = findConnected(node.id, edges, nodes, 'VNet')
    const connectedSubnets = findConnected(node.id, edges, nodes, 'Subnet')
    const connectedNICs = findConnected(node.id, edges, nodes, 'NIC')

    const rgRef = connectedRGs[0] ? `${getRef(connectedRGs[0])}.name` : `"placeholder-rg"`
    const vnetRef = connectedVNets[0] ? getRef(connectedVNets[0]) : null
    const subnetRef = connectedSubnets[0] ? getRef(connectedSubnets[0]) : null

    lines.push(`resource "${rt.tfType}" "${id}" {`)

    switch (d.type) {
      case 'ResourceGroup':
        lines.push(`  name     = "${d.name}"`)
        lines.push(`  location = "${d.location || 'East US'}"`)
        break

      case 'VNet':
        lines.push(`  name                = "${d.name}"`)
        lines.push(`  address_space       = ["${d.addressSpace || '10.0.0.0/16'}"]`)
        lines.push(`  location            = "${d.location || 'East US'}"`)
        lines.push(`  resource_group_name = ${rgRef}`)
        break

      case 'Subnet':
        lines.push(`  name                 = "${d.name}"`)
        lines.push(`  address_prefixes     = ["${d.addressPrefix || '10.0.1.0/24'}"]`)
        if (vnetRef) {
          lines.push(`  resource_group_name  = ${vnetRef}.resource_group_name`)
          lines.push(`  virtual_network_name = ${vnetRef}.name`)
        } else {
          lines.push(`  resource_group_name  = ${rgRef}`)
          lines.push(`  virtual_network_name = "placeholder-vnet"`)
        }
        break

      case 'NSG':
        lines.push(`  name                = "${d.name}"`)
        lines.push(`  location            = "${d.location || 'East US'}"`)
        lines.push(`  resource_group_name = ${rgRef}`)
        lines.push(``)
        lines.push(`  security_rule {`)
        lines.push(`    name                       = "allow-ssh"`)
        lines.push(`    priority                   = 1001`)
        lines.push(`    direction                  = "Inbound"`)
        lines.push(`    access                     = "Allow"`)
        lines.push(`    protocol                   = "Tcp"`)
        lines.push(`    source_port_range          = "*"`)
        lines.push(`    destination_port_range     = "22"`)
        lines.push(`    source_address_prefix      = "*"`)
        lines.push(`    destination_address_prefix = "*"`)
        lines.push(`  }`)
        break

      case 'PublicIP':
        lines.push(`  name                = "${d.name}"`)
        lines.push(`  location            = "${d.location || 'East US'}"`)
        lines.push(`  resource_group_name = ${rgRef}`)
        lines.push(`  allocation_method   = "${d.allocationMethod || 'Static'}"`)
        break

      case 'NIC': {
        const subnetForNic = connectedSubnets[0]
        lines.push(`  name                = "${d.name}"`)
        lines.push(`  location            = "${d.location || 'East US'}"`)
        lines.push(`  resource_group_name = ${rgRef}`)
        lines.push(``)
        lines.push(`  ip_configuration {`)
        lines.push(`    name                          = "internal"`)
        lines.push(`    subnet_id                     = ${subnetForNic ? `${getRef(subnetForNic)}.id` : `"placeholder-subnet-id"`}`)
        lines.push(`    private_ip_address_allocation = "${d.privateIpAllocation || 'Dynamic'}"`)
        lines.push(`  }`)
        break
      }

      case 'VM': {
        const nicRef = connectedNICs[0] ? getRef(connectedNICs[0]) : null
        lines.push(`  name                  = "${d.name}"`)
        lines.push(`  location              = "${d.location || 'East US'}"`)
        lines.push(`  resource_group_name   = ${rgRef}`)
        lines.push(`  size                  = "${d.size || 'Standard_B1s'}"`)
        lines.push(`  admin_username        = "${d.adminUsername || 'azureuser'}"`)
        lines.push(`  network_interface_ids = [${nicRef ? `${nicRef}.id` : `"placeholder-nic-id"`}]`)
        lines.push(``)
        lines.push(`  os_disk {`)
        lines.push(`    caching              = "ReadWrite"`)
        lines.push(`    storage_account_type = "Standard_LRS"`)
        lines.push(`  }`)
        lines.push(``)
        lines.push(`  source_image_reference {`)
        if ((d.osImage || '').includes('Ubuntu 22')) {
          lines.push(`    publisher = "Canonical"`)
          lines.push(`    offer     = "0001-com-ubuntu-server-jammy"`)
          lines.push(`    sku       = "22_04-lts"`)
        } else if ((d.osImage || '').includes('Ubuntu 20')) {
          lines.push(`    publisher = "Canonical"`)
          lines.push(`    offer     = "UbuntuServer"`)
          lines.push(`    sku       = "20_04-lts"`)
        } else {
          lines.push(`    publisher = "Canonical"`)
          lines.push(`    offer     = "0001-com-ubuntu-server-jammy"`)
          lines.push(`    sku       = "22_04-lts"`)
        }
        lines.push(`    version   = "latest"`)
        lines.push(`  }`)
        lines.push(``)
        lines.push(`  admin_ssh_key {`)
        lines.push(`    username   = "${d.adminUsername || 'azureuser'}"`)
        lines.push(`    public_key = file("~/.ssh/id_rsa.pub")`)
        lines.push(`  }`)
        break
      }

      case 'StorageAccount':
        lines.push(`  name                     = "${d.name}"`)
        lines.push(`  location                 = "${d.location || 'East US'}"`)
        lines.push(`  resource_group_name      = ${rgRef}`)
        lines.push(`  account_tier             = "${d.accountTier || 'Standard'}"`)
        lines.push(`  account_replication_type = "${d.replicationType || 'LRS'}"`)
        break

      default:
        lines.push(`  # Unknown resource type`)
    }

    lines.push(`}`)
    lines.push(``)
  }

  return lines.join('\n')
}
