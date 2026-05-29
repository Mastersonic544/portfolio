<script>
  import { updateDoc, doc } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { convertToWebP } from '$lib/utils/convertWebP.js';
  import { uploadToStorage } from '$lib/utils/uploadToStorage.js';

  let { section } = $props();

  /** @type {{ slug: string; date: string; caption: string; url?: string; _tmpId: string }[]} */
  let items = $state(
    (section.items ? JSON.parse(JSON.stringify(section.items)) : []).map(item => ({
      ...item,
      _tmpId: Math.random().toString(36).slice(2),
    }))
  );
  let saving = $state(false);

  /** Track upload status per row index */
  let uploadStatus = $state({});

  /** Track thumbnail preview URLs keyed by _tmpId (stable across slug edits and save re-maps) */
  let thumbUrls = $state({});

  const ref = doc(db, 'sections', section.id);

  /** Normalize a slug to lowercase alphanumeric with hyphens only */
  function normalizeSlug(s) {
    return s.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-_]/g, '');
  }

  /** Save all highlight items to Firestore */
  async function save() {
    saving = true;
    // Normalize slugs — spread preserves _tmpId so thumbUrls keys stay valid
    items = items.map(i => ({ ...i, slug: normalizeSlug(i.slug) }));
    // Persist content fields only (not _tmpId)
    await updateDoc(ref, { items: items.map(i => ({ slug: i.slug, date: i.date, caption: i.caption, url: i.url ?? '' })) });
    saving = false;
  }

  /** Add a new empty highlight row */
  function addItem() { items = [...items, { slug: '', date: '', caption: '', _tmpId: Math.random().toString(36).slice(2) }]; }

  /** Remove a highlight row by index */
  function remove(i) { items = items.filter((_, j) => j !== i); }

  /** Handle image upload for a specific row */
  async function handleUpload(index) {
    const snapshot = items[index];
    if (!snapshot?.slug?.trim()) {
      uploadStatus = { ...uploadStatus, [index]: { type: 'error', msg: 'Set a slug first' } };
      return;
    }
    // Capture the stable ID now; even if save() re-maps the array, _tmpId travels with the item
    const tmpId = snapshot._tmpId;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      uploadStatus = { ...uploadStatus, [index]: { type: 'uploading', msg: 'Converting…' } };

      try {
        const webpBlob = await convertToWebP(file, 0.85);

        // Re-access the live item via index so mutations hit the current proxy
        // (save() may have replaced the array between click and file-select)
        const current = items[index];
        if (!current) throw new Error('Item removed during upload');

        const slug = normalizeSlug(current.slug);
        current.slug = slug;
        const filename = `${slug}.webp`;

        uploadStatus = { ...uploadStatus, [index]: { type: 'uploading', msg: 'Uploading…' } };

        const url = await uploadToStorage(webpBlob, 'highlights', filename);
        current.url = url;
        thumbUrls = { ...thumbUrls, [tmpId]: url };
        uploadStatus = { ...uploadStatus, [index]: { type: 'success', msg: 'Uploaded' } };

        setTimeout(() => {
          uploadStatus = { ...uploadStatus, [index]: undefined };
        }, 3000);
      } catch (err) {
        console.error('[highlight-upload]', err);
        uploadStatus = { ...uploadStatus, [index]: { type: 'error', msg: err.message || 'Failed' } };
      }
    };

    input.click();
  }
</script>

<div class="editor">
  <div class="head">
    <span class="pt">Highlight Moments</span>
    <div class="actions">
      <button class="bg" onclick={addItem}>+ Add</button>
      <button class="bs" onclick={save} disabled={saving}>{saving ? 'Saving…' : 'Save All'}</button>
    </div>
  </div>

  <div class="list">
    {#each items as item, i}
      <div class="row">
        <!-- Thumbnail preview -->
        {#if item.slug}
          <div class="thumb">
            <img
              src={thumbUrls[item._tmpId] || item.url || `/images/highlights/${item.slug}.webp`}
              alt={item.caption || item.slug}
              onerror={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        {/if}

        <input class="fi" type="text" bind:value={item.slug}    placeholder="image-slug" style="max-width:150px" />
        <input class="fi" type="text" bind:value={item.date}    placeholder="Dec 2024"   style="max-width:100px" />
        <input class="fi" type="text" bind:value={item.caption} placeholder="Caption…" />

        <!-- Upload image button -->
        <button
          class="upload-btn"
          title="Upload image for this highlight"
          onclick={() => handleUpload(i)}
          disabled={uploadStatus[i]?.type === 'uploading'}
        >
          {#if uploadStatus[i]?.type === 'uploading'}
            <span class="spin">↻</span>
          {:else}
            📷
          {/if}
        </button>

        <!-- Upload status indicator -->
        {#if uploadStatus[i]}
          <span class="status {uploadStatus[i].type}">{uploadStatus[i].msg}</span>
        {/if}

        <button class="db" onclick={() => remove(i)}>×</button>
      </div>
    {/each}
  </div>
  <p class="hint">Images are stored in Firebase Storage — use 📷 to upload/replace images</p>
</div>

<style>
  .editor { display: flex; flex-direction: column; gap: 0.75rem; }
  .head   { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--bg-card); }
  .actions { display: flex; gap: 0.4rem; }
  .pt   { font-family: var(--font-body); font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); }
  .bs   { background: var(--accent); color: #fff; border: none; padding: 0.25rem 0.75rem; font-family: var(--font-body); font-size: 0.72rem; font-weight: 600; cursor: pointer; }
  .bs:disabled { opacity: 0.4; cursor: not-allowed; }
  .bg   { background: transparent; border: 1px solid var(--bg-card); color: var(--text-muted); padding: 0.25rem 0.65rem; font-family: var(--font-body); font-size: 0.72rem; cursor: pointer; }
  .bg:hover { color: var(--text); border-color: var(--text-muted); }
  .list { display: flex; flex-direction: column; gap: 0.5rem; }
  .row  { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
  .fi   { flex: 1; background: transparent; border: none; border-bottom: 1px solid var(--bg-card); color: var(--text); font-family: var(--font-body); font-size: 0.83rem; padding: 0.25rem 0; outline: none; transition: border-color 0.15s; min-width: 0; }
  .fi:focus { border-bottom-color: var(--accent); }
  .db   { background: transparent; border: none; color: var(--text-muted); font-size: 1rem; cursor: pointer; padding: 0 0.2rem; flex-shrink: 0; line-height: 1; }
  .db:hover { color: #e55; }

  /* Thumbnail preview */
  .thumb { width: 36px; height: 36px; border-radius: 4px; overflow: hidden; flex-shrink: 0; background: var(--bg-card); display: flex; align-items: center; justify-content: center; }
  .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* Upload button */
  .upload-btn { background: transparent; border: 1px solid var(--bg-card); color: var(--text-muted); font-size: 0.85rem; cursor: pointer; padding: 0.15rem 0.4rem; border-radius: 3px; flex-shrink: 0; transition: all 0.15s; line-height: 1; }
  .upload-btn:hover { border-color: var(--accent); color: var(--accent); }
  .upload-btn:disabled { opacity: 0.5; cursor: wait; }

  /* Spinner animation for uploading state */
  .spin { display: inline-block; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Status messages */
  .status { font-family: var(--font-body); font-size: 0.68rem; flex-shrink: 0; }
  .status.uploading { color: var(--accent); }
  .status.success { color: #4caf50; }
  .status.error { color: #e55; }

  .hint { font-family: var(--font-body); font-size: 0.72rem; color: var(--text-muted); }
  .hint code { font-size: 0.7rem; color: var(--accent); }
</style>
