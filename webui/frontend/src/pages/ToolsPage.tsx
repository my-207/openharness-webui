import { useEffect, useState } from 'react'
import { Wrench, Server, Plus, Trash2, Package, Search, Terminal, Users, Clock, BookOpen, Puzzle, Plug } from 'lucide-react'
import { Spinner } from '../components/shared/Spinner'
import { Button } from '../components/shared/Button'
import { useToolsStore } from '../stores/toolsStore'

const categories = [
  { id: 'all', label: 'All Tools', icon: Wrench },
  { id: 'file_io', label: 'File I/O', icon: BookOpen },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'agent', label: 'Agent', icon: Users },
  { id: 'task', label: 'Task', icon: Clock },
  { id: 'mcp', label: 'MCP', icon: Plug },
  { id: 'mode', label: 'Mode', icon: Terminal },
  { id: 'schedule', label: 'Schedule', icon: Clock },
  { id: 'metadata', label: 'Metadata', icon: Package },
]

export function ToolsPage() {
  const { tools, mcpServers, loading, fetchTools, fetchMcpServers, addMcpServer, removeMcpServer } = useToolsStore()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddMcp, setShowAddMcp] = useState(false)
  const [mcpName, setMcpName] = useState('')
  const [mcpTransport, setMcpTransport] = useState<'stdio' | 'http' | 'ws'>('stdio')
  const [mcpCommand, setMcpCommand] = useState('')

  useEffect(() => {
    fetchTools()
    fetchMcpServers()
  }, [fetchTools, fetchMcpServers])

  const filteredTools = selectedCategory === 'all'
    ? tools
    : tools.filter((t) => t.category === selectedCategory)

  const handleAddMcp = async () => {
    if (!mcpName.trim() || !mcpCommand.trim()) return
    const args: string[] = []
    if (mcpTransport === 'http' || mcpTransport === 'ws') {
      await addMcpServer({ name: mcpName.trim(), transport: mcpTransport, url: mcpCommand.trim(), args })
    } else {
      const parts = mcpCommand.trim().split(/\s+/)
      const cmd = parts[0]
      const cmdArgs = parts.slice(1)
      await addMcpServer({ name: mcpName.trim(), transport: mcpTransport, command: cmd, args: cmdArgs })
    }
    setMcpName('')
    setMcpCommand('')
    setShowAddMcp(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  return (
    <div className="flex h-full">
      {/* Left sidebar - categories */}
      <div className="w-48 border-r border-border bg-surface shrink-0 p-2 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium px-2 py-2">Categories</div>
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-tertiary'
              }`}
            >
              <Icon size={14} />
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Tools */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-text-primary mb-3">
            {categories.find((c) => c.id === selectedCategory)?.label || 'Tools'}
            <span className="text-text-tertiary ml-2 font-normal">({filteredTools.length})</span>
          </h2>
          {filteredTools.length === 0 ? (
            <p className="text-sm text-text-tertiary py-8 text-center">No tools in this category</p>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-tertiary/50 text-text-tertiary text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-2 font-medium">Name</th>
                    <th className="text-left px-4 py-2 font-medium">Description</th>
                    <th className="text-left px-4 py-2 font-medium">Required Args</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTools.map((tool) => (
                    <tr key={tool.name} className="hover:bg-surface-tertiary/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-primary">{tool.name}</td>
                      <td className="px-4 py-3 text-text-secondary text-xs max-w-md">{tool.description}</td>
                      <td className="px-4 py-3 text-text-tertiary text-xs">
                        {tool.required_args?.length ? tool.required_args.join(', ') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MCP Servers */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-text-primary">
              MCP Servers
              <span className="text-text-tertiary ml-2 font-normal">({mcpServers.length})</span>
            </h2>
            <Button onClick={() => setShowAddMcp(!showAddMcp)}>
              <Plus size={14} className="mr-1.5" />
              Add MCP Server
            </Button>
          </div>

          {showAddMcp && (
            <div className="mb-4 p-4 bg-surface-secondary border border-border rounded-lg space-y-3">
              <input
                className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary placeholder-text-tertiary"
                placeholder="Server name"
                value={mcpName}
                onChange={(e) => setMcpName(e.target.value)}
              />
              <select
                className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary"
                value={mcpTransport}
                onChange={(e) => setMcpTransport(e.target.value as 'stdio' | 'http' | 'ws')}
              >
                <option value="stdio">stdio</option>
                <option value="http">HTTP</option>
                <option value="ws">WebSocket</option>
              </select>
              <input
                className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary placeholder-text-tertiary"
                placeholder={mcpTransport === 'stdio' ? 'Command (e.g., npx @modelcontextprotocol/server-filesystem)' : 'URL'}
                value={mcpCommand}
                onChange={(e) => setMcpCommand(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleAddMcp} disabled={!mcpName.trim() || !mcpCommand.trim()}>Add</Button>
                <Button variant="secondary" onClick={() => setShowAddMcp(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {mcpServers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-text-tertiary">
              <Server size={32} className="mb-2 opacity-30" />
              <p className="text-xs">No MCP servers configured</p>
            </div>
          ) : (
            <div className="space-y-2">
              {mcpServers.map((srv) => (
                <div key={srv.name} className="flex items-center gap-3 px-4 py-3 bg-surface border border-border rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${srv.status === 'connected' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-text-primary font-medium truncate">{srv.name}</div>
                    <div className="text-xs text-text-tertiary">
                      {srv.transport} · {srv.tools_count || 0} tools · {srv.resources_count || 0} resources
                    </div>
                  </div>
                  <button
                    className="p-1.5 hover:bg-red-500/10 rounded text-text-tertiary hover:text-danger transition-colors"
                    onClick={() => removeMcpServer(srv.name)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
