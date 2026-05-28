import { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const DataContext = createContext(null)

const DEFAULT_SETTINGS = {
  name: '', address: '', email: '', phone: '',
  threshold: 8595, showThreshold: true,
  iban: '', studentNumber: '',
  btwEnabled: false, btwNumber: '', btwRate: 21,
  paymentTermDays: 30,
}

function computeNextInvoiceNumber(invoices) {
  const year = new Date().getFullYear()
  const prefix = `${year}-`
  const nums = invoices
    .filter(inv => inv.number?.startsWith(prefix))
    .map(inv => parseInt(inv.number.split('-')[1], 10))
    .filter(n => Number.isFinite(n))
  const max = nums.length > 0 ? Math.max(...nums) : 0
  return `${year}-${String(max + 1).padStart(3, '0')}`
}

export function DataProvider({ children }) {
  const [clients, setClients] = useLocalStorage('urentracker_clients', [])
  const [entries, setEntries] = useLocalStorage('urentracker_entries', [])
  const [settings, setSettings] = useLocalStorage('urentracker_settings', DEFAULT_SETTINGS)
  const [invoices, setInvoices] = useLocalStorage('urentracker_invoices', [])

  function addClient(client) {
    const newClient = { ...client, id: crypto.randomUUID() }
    setClients(prev => [...prev, newClient])
    return newClient
  }
  function updateClient(id, data) {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
  }
  function deleteClient(id) {
    setClients(prev => prev.filter(c => c.id !== id))
    setEntries(prev => prev.filter(e => e.clientId !== id))
  }

  function addEntry(entry) {
    const newEntry = { ...entry, id: crypto.randomUUID() }
    setEntries(prev => [...prev, newEntry])
    return newEntry
  }
  function updateEntry(id, data) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...data } : e))
  }
  function deleteEntry(id) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  function addInvoice(invoice) {
    const newInvoice = {
      ...invoice,
      id: crypto.randomUUID(),
      number: computeNextInvoiceNumber(invoices),
    }
    setInvoices(prev => [...prev, newInvoice])
    return newInvoice
  }
  function updateInvoice(id, data) {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...data } : inv))
  }
  function deleteInvoice(id) {
    setInvoices(prev => prev.filter(inv => inv.id !== id))
  }

  return (
    <DataContext.Provider value={{
      clients, addClient, updateClient, deleteClient,
      entries, addEntry, updateEntry, deleteEntry,
      settings, setSettings,
      invoices, addInvoice, updateInvoice, deleteInvoice,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
