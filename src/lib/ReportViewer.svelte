<script lang="ts">
  export let report: any

  let showRaw = false

  // Get the active manifest object from the manifests map
  $: activeManifest = report.active_manifest && report.manifests
    ? report.manifests[report.active_manifest]
    : null

  function downloadReport() {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `c2pa-report-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2))
  }

  // Elide long hash-like values for readability
  function elideValue(value: any, key?: string): any {
    if (typeof value === 'string') {
      // Check if this is a hash-like field based on key name
      const isHashKey = key && (
        key.toLowerCase().includes('hash') ||
        key.toLowerCase().includes('pad') ||
        key === 'identifier'
      )

      // Check if value looks like a hash (long hex string, base64, etc.)
      // But exclude instance_id and document_id patterns
      const looksLikeHash = value.length > 32 && (
        /^[0-9a-fA-F]{32,}$/.test(value) || // Hex hash
        /^[A-Za-z0-9+/]{32,}={0,2}$/.test(value) // Base64
      )

      if (isHashKey || looksLikeHash) {
        return '<elided>'
      }
    } else if (Array.isArray(value)) {
      // Check if it's an array of numbers (binary data)
      if (value.length > 10 && value.every(v => typeof v === 'number' && v >= 0 && v <= 255)) {
        return '<binary data elided>'
      }
      return value.map(v => elideValue(v))
    } else if (typeof value === 'object' && value !== null) {
      const result: any = {}
      for (const k in value) {
        result[k] = elideValue(value[k], k)
      }
      return result
    }
    return value
  }

  // Format assertion data with elided hashes
  function formatAssertionData(data: any): string {
    const elided = elideValue(data)
    return JSON.stringify(elided, null, 2)
  }
</script>

<div class="report-container">
  <div class="report-header">
    <h2>C2PA Conformance Report</h2>
    <div class="actions">
      <button on:click={() => showRaw = !showRaw}>
        {showRaw ? 'Show Formatted' : 'Show Raw JSON'}
      </button>
      <button on:click={downloadReport}>Download Report</button>
      <button on:click={copyToClipboard}>Copy JSON</button>
    </div>
  </div>

  {#if showRaw}
    <pre class="json-output">{JSON.stringify(report, null, 2)}</pre>
  {:else}
    <div class="formatted-report">
      {#if activeManifest}
        {#if activeManifest.signature_info}
          <section>
            <h3>Signature Information</h3>
            <div class="info-grid">
              {#if activeManifest.signature_info.common_name}
                <div class="info-item">
                  <span class="label">Common Name:</span>
                  <span class="value">{activeManifest.signature_info.common_name}</span>
                </div>
              {/if}
              {#if activeManifest.signature_info.issuer}
                <div class="info-item">
                  <span class="label">Issuer:</span>
                  <span class="value">{activeManifest.signature_info.issuer}</span>
                </div>
              {/if}
              {#if activeManifest.signature_info.time}
                <div class="info-item">
                  <span class="label">Signed:</span>
                  <span class="value">{activeManifest.signature_info.time}</span>
                </div>
              {/if}
              {#if activeManifest.signature_info.alg}
                <div class="info-item">
                  <span class="label">Algorithm:</span>
                  <span class="value">{activeManifest.signature_info.alg}</span>
                </div>
              {/if}
            </div>
          </section>
        {/if}

        <section>
          <h3>Active Manifest</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Claim Generator:</span>
              <span class="value">
                {#if activeManifest.claim_generator_info && activeManifest.claim_generator_info.length > 0}
                  {activeManifest.claim_generator_info[0].name}
                  {#if activeManifest.claim_generator_info[0].version}
                    v{activeManifest.claim_generator_info[0].version}
                  {/if}
                {:else if activeManifest.claim_generator}
                  {activeManifest.claim_generator}
                {:else}
                  N/A
                {/if}
              </span>
            </div>
            <div class="info-item">
              <span class="label">Instance ID:</span>
              <span class="value">{activeManifest.instance_id || 'N/A'}</span>
            </div>
            {#if activeManifest.label}
              <div class="info-item">
                <span class="label">Label:</span>
                <span class="value">{activeManifest.label}</span>
              </div>
            {/if}
          </div>
        </section>

        {#if activeManifest.assertions && activeManifest.assertions.length > 0}
          <section>
            <h3>Assertions ({activeManifest.assertions.length})</h3>
            <div class="assertions-list">
              {#each activeManifest.assertions as assertion}
                <div class="assertion-item">
                  <strong>{assertion.label || assertion.url || 'Unknown'}</strong>
                  {#if assertion.data}
                    <pre class="assertion-data">{formatAssertionData(assertion.data)}</pre>
                  {/if}
                </div>
              {/each}
            </div>
          </section>
        {/if}

        {#if activeManifest.ingredients && activeManifest.ingredients.length > 0}
          <section>
            <h3>Ingredients ({activeManifest.ingredients.length})</h3>
            <div class="ingredients-list">
              {#each activeManifest.ingredients as ingredient}
                <div class="ingredient-item">
                  <strong>{ingredient.title || ingredient.instance_id || 'Unknown'}</strong>
                  {#if ingredient.format}
                    <p><span class="ingredient-label">Format:</span> {ingredient.format}</p>
                  {/if}
                  {#if ingredient.relationship}
                    <p><span class="ingredient-label">Relationship:</span> {ingredient.relationship}</p>
                  {/if}
                  {#if ingredient.document_id}
                    <p><span class="ingredient-label">Document ID:</span> {ingredient.document_id}</p>
                  {/if}
                  {#if ingredient.instance_id && !ingredient.title}
                    <p><span class="ingredient-label">Instance ID:</span> {ingredient.instance_id}</p>
                  {/if}
                </div>
              {/each}
            </div>
          </section>
        {/if}

        {#if report.validation_status && report.validation_status.length > 0}
          <section>
            <h3>Validation Status</h3>
            <div class="validation-list">
              {#each report.validation_status as status}
                <div class="validation-item" class:success={status.success}>
                  <strong>{status.code}</strong>
                  {#if status.explanation}
                    <p>{status.explanation}</p>
                  {/if}
                </div>
              {/each}
            </div>
          </section>
        {/if}
      {:else}
        <p class="no-manifest">No active manifest found in this file.</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .report-container {
    text-align: left;
    margin-top: 2rem;
  }

  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .report-header h2 {
    margin: 0;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .json-output {
    background-color: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 1.5rem;
    overflow-x: auto;
    text-align: left;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .formatted-report {
    background-color: rgba(100, 108, 255, 0.05);
    border: 1px solid rgba(100, 108, 255, 0.2);
    border-radius: 8px;
    padding: 1.5rem;
  }

  section {
    margin-bottom: 2rem;
  }

  section:last-child {
    margin-bottom: 0;
  }

  h3 {
    color: #646cff;
    margin-top: 0;
    margin-bottom: 1rem;
    border-bottom: 1px solid rgba(100, 108, 255, 0.2);
    padding-bottom: 0.5rem;
  }

  .info-grid {
    display: grid;
    gap: 1rem;
  }

  .info-item {
    display: flex;
    gap: 0.5rem;
  }

  .label {
    font-weight: 600;
    min-width: 140px;
  }

  .value {
    word-break: break-all;
  }

  .assertions-list,
  .ingredients-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .assertion-item,
  .ingredient-item {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    padding: 1rem;
  }

  .assertion-data {
    margin-top: 0.5rem;
    background-color: rgba(0, 0, 0, 0.3);
    padding: 0.75rem;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.85rem;
  }

  .ingredient-item p {
    margin: 0.5rem 0 0 0;
    font-size: 0.9rem;
  }

  .ingredient-label {
    font-weight: 600;
    color: #888;
  }

  :global(.value:has(> :contains("<elided>"))) {
    font-style: italic;
    opacity: 0.7;
  }

  .validation-status {
    background-color: rgba(255, 50, 50, 0.1);
    border: 1px solid rgba(255, 50, 50, 0.3);
    border-radius: 6px;
    padding: 1rem;
  }

  .validation-status.valid {
    background-color: rgba(50, 255, 50, 0.1);
    border-color: rgba(50, 255, 50, 0.3);
  }

  .validation-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .validation-item {
    background-color: rgba(255, 50, 50, 0.1);
    border: 1px solid rgba(255, 50, 50, 0.3);
    border-radius: 6px;
    padding: 0.75rem;
  }

  .validation-item.success {
    background-color: rgba(50, 255, 50, 0.1);
    border-color: rgba(50, 255, 50, 0.3);
  }

  .validation-item p {
    margin: 0.5rem 0 0 0;
    font-size: 0.9rem;
  }

  .errors {
    margin-top: 1rem;
  }

  .errors ul {
    margin: 0.5rem 0 0 0;
    padding-left: 1.5rem;
  }

  .errors li {
    margin: 0.25rem 0;
  }

  .no-manifest {
    text-align: center;
    color: #888;
    padding: 2rem;
  }

  @media (prefers-color-scheme: light) {
    .json-output {
      background-color: #f9f9f9;
      border-color: #ddd;
      color: #213547;
    }

    .assertion-item,
    .ingredient-item {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .assertion-data {
      background-color: rgba(0, 0, 0, 0.08);
    }
  }
</style>
