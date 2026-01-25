<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let compact = false

  const dispatch = createEventDispatcher<{ fileselect: File }>()

  let dragOver = false
  let fileInput: HTMLInputElement

  function handleDragOver(event: DragEvent) {
    event.preventDefault()
    dragOver = true
  }

  function handleDragLeave() {
    dragOver = false
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    dragOver = false

    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      dispatch('fileselect', files[0])
    }
  }

  function handleFileInput(event: Event) {
    const target = event.target as HTMLInputElement
    const files = target.files
    if (files && files.length > 0) {
      dispatch('fileselect', files[0])
    }
  }

  function handleClick() {
    fileInput?.click()
  }
</script>

{#if compact}
  <button class="browse-button" on:click={handleClick}>
    📁 Browse Files
  </button>
  <input
    bind:this={fileInput}
    type="file"
    on:change={handleFileInput}
    accept="image/*,video/*,audio/*,.pdf"
    style="display: none;"
  />
{:else}
  <div
    class="upload-area"
    class:drag-over={dragOver}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
    role="button"
    tabindex="0"
    on:click={handleClick}
    on:keydown={(e) => e.key === 'Enter' && handleClick()}
  >
    <div class="upload-icon">📁</div>
    <p class="upload-text">Drop a file here or click to select</p>
    <p class="upload-hint">Supports images, videos, audio, and documents with C2PA manifests</p>

    <input
      bind:this={fileInput}
      type="file"
      on:change={handleFileInput}
      accept="image/*,video/*,audio/*,.pdf"
      style="display: none;"
    />
  </div>
{/if}

<style>
  .browse-button {
    border-radius: 8px;
    border: 1px solid #646cff;
    padding: 0.75em 1.5em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #646cff;
    color: white;
    cursor: pointer;
    transition: all 0.25s;
    white-space: nowrap;
  }

  .browse-button:hover {
    background-color: #535bf2;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(100, 108, 255, 0.3);
  }

  .upload-area {
    border: 2px dashed #646cff;
    border-radius: 12px;
    padding: 3rem 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: rgba(100, 108, 255, 0.05);
  }

  .upload-area:hover,
  .upload-area.drag-over {
    border-color: #535bf2;
    background-color: rgba(100, 108, 255, 0.1);
    transform: scale(1.02);
  }

  .upload-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .upload-text {
    font-size: 1.2rem;
    font-weight: 500;
    margin: 0.5rem 0;
  }

  .upload-hint {
    font-size: 0.9rem;
    color: #888;
    margin: 0.5rem 0;
  }
</style>
