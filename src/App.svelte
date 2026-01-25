<script lang="ts">
  import { onMount } from 'svelte'
  import FileUpload from './lib/FileUpload.svelte'
  import ReportViewer from './lib/ReportViewer.svelte'
  import { processFile } from './lib/c2pa'
  import { testTrustListFetch } from './lib/trustListTest'

  let report: any = null
  let error: string | null = null
  let processing = false
  let globalDragOver = false

  // Test trust list fetching on component mount
  onMount(async () => {
    console.log('=== C2PA Conformance Tool Initialized ===')
    try {
      await testTrustListFetch()
    } catch (err) {
      console.warn('Trust list fetch test failed:', err)
    }

    // Prevent default drag/drop behavior on the entire window
    const preventDefaults = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      globalDragOver = false

      const files = e.dataTransfer?.files
      if (files && files.length > 0) {
        handleFileSelect({ detail: files[0] } as CustomEvent<File>)
      }
    }

    window.addEventListener('dragover', preventDefaults, false)
    window.addEventListener('drop', handleWindowDrop, false)

    // Cleanup
    return () => {
      window.removeEventListener('dragover', preventDefaults, false)
      window.removeEventListener('drop', handleWindowDrop, false)
    }
  })

  async function handleFileSelect(event: CustomEvent<File>) {
    const file = event.detail
    processing = true
    error = null
    report = null

    try {
      report = await processFile(file)
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred processing the file'
      console.error('Error processing file:', err)
    } finally {
      processing = false
    }
  }

  // Global drag and drop handlers
  function handleGlobalDragOver(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy'
    }
    globalDragOver = true
  }

  function handleGlobalDragLeave(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    // Only hide overlay if leaving the window entirely
    if (event.relatedTarget === null) {
      globalDragOver = false
    }
  }

  function handleGlobalDrop(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    globalDragOver = false

    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      handleFileSelect({ detail: files[0] } as CustomEvent<File>)
    }
  }

  function handleGlobalDragEnter(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
  }
</script>

<main
  on:dragenter={handleGlobalDragEnter}
  on:dragover={handleGlobalDragOver}
  on:dragleave={handleGlobalDragLeave}
  on:drop={handleGlobalDrop}
  class:global-drag-over={globalDragOver}
>
  {#if globalDragOver}
    <div class="drop-overlay">
      <div class="drop-message">
        <div class="drop-icon">📁</div>
        <p>Drop file to analyze</p>
      </div>
    </div>
  {/if}

  <div class="header">
    <div class="title-section">
      <h1>C2PA Conformance Testing Tool</h1>
      <p class="subtitle">Drag and drop files anywhere or click browse to validate C2PA manifests</p>
    </div>
    <FileUpload on:fileselect={handleFileSelect} compact={report !== null || processing} />
  </div>

  {#if processing}
    <div class="processing">
      <div class="spinner"></div>
      <p>Processing file...</p>
    </div>
  {/if}

  {#if error}
    <div class="error">
      <h2>Error</h2>
      <p>{error}</p>
    </div>
  {/if}

  {#if report}
    <ReportViewer {report} />
  {/if}
</main>

<style>
  main {
    text-align: center;
    position: relative;
  }

  main.global-drag-over {
    pointer-events: none;
  }

  .drop-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(100, 108, 255, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    pointer-events: none;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .drop-message {
    text-align: center;
    color: white;
  }

  .drop-icon {
    font-size: 6rem;
    margin-bottom: 1rem;
    animation: bounce 0.6s ease infinite;
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  .drop-message p {
    font-size: 2rem;
    font-weight: 600;
    margin: 0;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .title-section {
    flex: 1;
    text-align: left;
  }

  .title-section h1 {
    margin: 0 0 0.5rem 0;
  }

  .subtitle {
    color: #888;
    margin: 0;
  }

  .processing {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 3rem;
  }

  .spinner {
    border: 4px solid rgba(100, 108, 255, 0.1);
    border-left-color: #646cff;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error {
    background-color: rgba(255, 50, 50, 0.1);
    border: 1px solid rgba(255, 50, 50, 0.3);
    border-radius: 8px;
    padding: 2rem;
    margin: 2rem 0;
  }

  .error h2 {
    color: #ff5050;
    margin-top: 0;
  }

  .error p {
    color: #ffaaaa;
  }

  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      align-items: stretch;
    }

    .title-section {
      text-align: center;
    }
  }
</style>
