import { useState } from 'react'
import { Info, FileText, ArrowUpRight, MessageSquare, Shield, AlertTriangle, Github, Mail } from 'lucide-react'
import { Button } from '../components/shared/Button'

export function AboutPage() {
  const [feedbackName, setFeedbackName] = useState('')
  const [feedbackEmail, setFeedbackEmail] = useState('')
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)

  const handleFeedback = () => {
    console.log('Feedback:', { name: feedbackName, email: feedbackEmail, message: feedbackMsg })
    setFeedbackSent(true)
    setTimeout(() => setFeedbackSent(false), 3000)
    setFeedbackName('')
    setFeedbackEmail('')
    setFeedbackMsg('')
  }

  return (
    <div className="p-6 h-full overflow-y-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-text-primary">OpenHarness WebUI</h1>
        <p className="text-sm text-text-tertiary mt-1">v0.1.0 · Built for OpenHarness Runtime</p>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {/* Version */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info size={16} className="text-primary" />
            <h2 className="text-sm font-medium text-text-primary">Version Information</h2>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-text-tertiary">App Version</span><span className="text-text-primary">0.1.0</span></div>
            <div className="flex justify-between"><span className="text-text-tertiary">Build Date</span><span className="text-text-primary">2026-04-30</span></div>
            <div className="flex justify-between"><span className="text-text-tertiary">Runtime</span><span className="text-text-primary">OpenHarness 0.1.7</span></div>
            <div className="flex justify-between"><span className="text-text-tertiary">Source</span><span className="text-text-primary font-mono">github.com/HKUDS/OpenHarness</span></div>
          </div>
        </div>

        {/* Release Notes */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-primary" />
            <h2 className="text-sm font-medium text-text-primary">Release Notes</h2>
          </div>
          <div className="text-xs text-text-secondary space-y-2">
            <p><strong className="text-text-primary">v0.1.0</strong> — Initial WebUI Release</p>
            <ul className="list-disc list-inside space-y-1 text-text-tertiary">
              <li>Core chat interface with streaming responses</li>
              <li>Provider configuration management</li>
              <li>Session history and management</li>
              <li>Tool registry and MCP server management</li>
              <li>Skill management with .md file support</li>
              <li>Permission system with path rules and mode switching</li>
              <li>Memory CRUD with search</li>
              <li>Task management with real-time status</li>
              <li>Settings page with theme, effort, and mode controls</li>
              <li>Plugin management (install/uninstall/enable/disable)</li>
              <li>Swarm multi-agent panel</li>
              <li>Cron job scheduler</li>
              <li>Autopilot repository navigation</li>
              <li>OhMo personal agent management</li>
              <li>Auth status monitoring</li>
              <li>Bridge session management</li>
            </ul>
          </div>
        </div>

        {/* Upgrade */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpRight size={16} className="text-emerald-400" />
            <h2 className="text-sm font-medium text-text-primary">Upgrade Guide</h2>
          </div>
          <div className="text-xs text-text-secondary space-y-1">
            <p>To upgrade OpenHarness WebUI:</p>
            <code className="block mt-2 px-3 py-2 bg-surface-tertiary rounded text-text-primary font-mono">
              git pull origin main<br />
              pip install -r requirements.txt<br />
              cd frontend &amp;&amp; npm install &amp;&amp; npm run build
            </code>
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={16} className="text-primary" />
            <h2 className="text-sm font-medium text-text-primary">Feedback</h2>
          </div>
          {feedbackSent ? (
            <div className="text-xs text-emerald-400 py-3">Thank you! Your feedback has been recorded.</div>
          ) : (
            <div className="space-y-3">
              <input
                className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary placeholder-text-tertiary"
                placeholder="Your name"
                value={feedbackName}
                onChange={(e) => setFeedbackName(e.target.value)}
              />
              <input
                className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary placeholder-text-tertiary"
                placeholder="Email (optional)"
                value={feedbackEmail}
                onChange={(e) => setFeedbackEmail(e.target.value)}
              />
              <textarea
                className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary placeholder-text-tertiary resize-none"
                rows={3}
                placeholder="Describe your feedback, issue, or suggestion..."
                value={feedbackMsg}
                onChange={(e) => setFeedbackMsg(e.target.value)}
              />
              <Button onClick={handleFeedback} disabled={!feedbackMsg.trim()}>Send Feedback</Button>
            </div>
          )}
        </div>

        {/* Privacy */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-primary" />
            <h2 className="text-sm font-medium text-text-primary">Privacy & Settings</h2>
          </div>
          <div className="text-xs text-text-secondary space-y-2">
            <p>All data is stored locally. No telemetry is collected.</p>
            <p>API keys and credentials are stored in local configuration files.</p>
            <a href="/settings" className="text-primary underline inline-flex items-center gap-1">
              <span>Manage privacy settings</span>
              <ArrowUpRight size={10} />
            </a>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-yellow-400" />
            <h2 className="text-sm font-medium text-text-primary">Rate Limits</h2>
          </div>
          <div className="text-xs text-text-secondary">
            <p>Rate limits depend on your provider's API tier. To reduce rate limit pressure:</p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-text-tertiary">
              <li>Switch to a provider with higher rate limits</li>
              <li>Reduce the number of concurrent requests</li>
              <li>Enable auto-compact to reduce token usage</li>
              <li>Use lower effort levels for faster responses</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
