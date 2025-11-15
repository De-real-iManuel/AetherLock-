import * as React from 'react'

export default function AIPage() {
  const [files, setFiles] = React.useState<File[]>([])
  const [result, setResult] = React.useState<string | null>(null)

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const dropped = Array.from(e.dataTransfer.files)
    setFiles((f) => [...f, ...dropped])
  }

  return (
    <div className="min-h-screen container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">AI Verification</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div onDragOver={(e) => e.preventDefault()} onDrop={onDrop} className="p-6 border-2 border-dashed border-slate-700 rounded text-slate-300">
            <div className="mb-3">Drag & drop evidence (screenshots, transcripts) or use the file picker.</div>
            <input type="file" multiple onChange={(e) => setFiles((f) => [...f, ...Array.from(e.target.files || [])])} />

            <div className="mt-4">
              <strong>Queued files</strong>
              <ul className="mt-2 text-sm text-slate-300">
                {files.map((f, i) => (
                  <li key={i}>{f.name} <span className="text-xs text-slate-500">({Math.round(f.size / 1024)} KB)</span></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4">
            <button onClick={() => setResult('Pass — Evidence consistent with deliverable')} className="px-4 py-2 bg-cyan-500 text-black rounded">Analyze with AI</button>
            <button onClick={() => setResult('Fail — Mismatch detected')} className="ml-2 px-4 py-2 bg-slate-700 rounded">Simulate Fail</button>
          </div>
        </div>

        <div className="p-4 bg-slate-900/30 rounded">
          <h3 className="font-semibold">Results</h3>
          {result ? (
            <div className="mt-3 p-3 bg-slate-800 rounded text-slate-200">{result}</div>
          ) : (
            <div className="mt-3 text-slate-400">No analysis run yet. Upload files and press Analyze.</div>
          )}

          <div className="mt-4 text-sm text-slate-400">AI notes: This is a simulated client-side result. Real runs are performed server-side and produce cryptographic evidence bundles.</div>
        </div>
      </div>
    </div>
  )
}
