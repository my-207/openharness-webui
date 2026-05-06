import { useEffect } from 'react'
import { Key, Shield, LogOut, ExternalLink, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { Spinner } from '../components/shared/Spinner'
import { useAuthStore } from '../stores/authStore'

export function AuthPage() {
  const { sources, providerStatus, loading, fetchSources, fetchProviderStatus, logoutProvider } = useAuthStore()

  useEffect(() => {
    fetchSources()
    fetchProviderStatus()
  }, [fetchSources, fetchProviderStatus])

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  const statusDot = (status: string) => {
    switch (status) {
      case 'configured': return <CheckCircle size={14} className="text-emerald-400" />
      case 'missing': return <XCircle size={14} className="text-red-400" />
      case 'error': return <AlertTriangle size={14} className="text-yellow-400" />
      default: return <XCircle size={14} className="text-red-400" />
    }
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-6">
        <Key size={18} className="text-text-primary" />
        <h1 className="text-lg font-semibold text-text-primary">Auth Management</h1>
      </div>

      {/* Auth Sources */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-text-primary mb-3">Authentication Sources</h2>
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-tertiary/50 text-text-tertiary text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-2 font-medium">Source</th>
                <th className="text-left px-4 py-2 font-medium">Type</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sources.map((src) => (
                <tr key={src.name} className="hover:bg-surface-tertiary/20 transition-colors">
                  <td className="px-4 py-3 text-xs text-text-primary">{src.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-tertiary text-text-tertiary">
                      {src.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {statusDot(src.status)}
                      <span className="text-xs text-text-secondary">{src.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-tertiary">{src.info || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provider Auth Status */}
      <div>
        <h2 className="text-sm font-medium text-text-primary mb-3">Provider Auth Status</h2>
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-tertiary/50 text-text-tertiary text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-2 font-medium">Provider</th>
                <th className="text-left px-4 py-2 font-medium">Configured</th>
                <th className="text-left px-4 py-2 font-medium">Auth Source</th>
                <th className="text-right px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {providerStatus.map((p) => (
                <tr key={p.name} className="hover:bg-surface-tertiary/20 transition-colors">
                  <td className="px-4 py-3 text-xs text-text-primary font-medium">{p.name}</td>
                  <td className="px-4 py-3">
                    {p.configured ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle size={12} /> Yes
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-400">
                        <XCircle size={12} /> No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-text-tertiary">{p.auth_source}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {p.configured && (
                        <button
                          className="p-1.5 hover:bg-red-500/10 rounded text-text-tertiary hover:text-danger transition-colors"
                          title="Logout"
                          onClick={() => logoutProvider(p.name)}
                        >
                          <LogOut size={14} />
                        </button>
                      )}
                      <a
                        href="/providers"
                        className="p-1.5 hover:bg-surface-tertiary rounded text-text-tertiary hover:text-text-primary transition-colors"
                        title="Configure in Providers"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
