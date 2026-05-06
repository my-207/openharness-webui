import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useProviderStore } from '../stores/providerStore'
import { ProviderCard } from '../components/providers/ProviderCard'
import { ProviderFormModal } from '../components/providers/ProviderFormModal'
import { Button } from '../components/shared/Button'
import { toast } from '../components/shared/Toast'
import type { ProviderProfile } from '../types/protocol'

export function ProvidersPage() {
  const { profiles, loading, fetchProfiles, createProfile, updateProfile, deleteProfile, switchProfile, testConnection } = useProviderStore()
  const [showForm, setShowForm] = useState(false)
  const [editProfile, setEditProfile] = useState<ProviderProfile | null>(null)

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const handleSave = async (data: any) => {
    try {
      if (editProfile) {
        await updateProfile(editProfile.name, data)
        toast('success', 'Provider profile updated')
      } else {
        await createProfile(data)
        toast('success', 'Provider profile created')
      }
      setShowForm(false)
      setEditProfile(null)
    } catch (err) {
      toast('error', `Failed: ${(err as Error).message}`)
    }
  }

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete provider "${name}"?`)) return
    try {
      await deleteProfile(name)
      toast('success', 'Provider profile deleted')
    } catch (err) {
      toast('error', `Failed to delete: ${(err as Error).message}`)
    }
  }

  const handleSwitch = async (name: string) => {
    try {
      await switchProfile(name)
      toast('success', `Switched to ${name}`)
    } catch (err) {
      toast('error', `Failed to switch: ${(err as Error).message}`)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 scroll-thin">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">Provider Profiles</h1>
            <p className="text-sm text-text-secondary mt-1">Configure LLM provider connections</p>
          </div>
          <Button variant="primary" onClick={() => { setEditProfile(null); setShowForm(true) }}>
            <Plus size={16} /> Add Provider
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-sm text-text-tertiary text-center py-8">Loading providers...</div>
        )}

        {/* Provider list */}
        {!loading && profiles.length === 0 && (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <p className="text-sm text-text-secondary mb-3">No provider profiles configured yet.</p>
            <Button variant="primary" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Add Your First Provider
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {profiles.map((p) => (
            <ProviderCard
              key={p.name}
              profile={p}
              onEdit={(profile) => { setEditProfile(profile); setShowForm(true) }}
              onDelete={handleDelete}
              onSwitch={handleSwitch}
              onTestConnection={testConnection}
            />
          ))}
        </div>

        {/* Quick setup guide */}
        {profiles.length > 0 && (
          <div className="mt-8 p-4 bg-surface-secondary border border-border rounded-lg">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Quick Setup Guide</h3>
            <ol className="text-xs text-text-secondary space-y-1 ml-4 list-decimal">
              <li>Add a provider profile (e.g., <span className="text-primary">anthropic</span>)</li>
              <li>Enter your API Key</li>
              <li>Select your model</li>
              <li>Click <span className="text-primary">Use</span> to activate</li>
              <li>Return to Chat and start asking questions!</li>
            </ol>
          </div>
        )}
      </div>

      {/* Form modal */}
      <ProviderFormModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditProfile(null) }}
        onSave={handleSave}
        editProfile={editProfile}
      />
    </div>
  )
}
