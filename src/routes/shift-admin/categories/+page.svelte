<script>
  import { onMount } from 'svelte';
  import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { TYPES, loadCategories, DEFAULT_CATEGORIES } from '$lib/categories.js';

  /** @type {import('$lib/categories.js').Taxonomy} */
  let tax = $state({ ...DEFAULT_CATEGORIES });
  let loading = $state(true);

  /** @type {Record<string, string>} per-type "add new" inputs */
  let newCat = $state({ dev: '', digital: '', pfe: '' });

  let saveState = $state(/** @type {'idle'|'saving'|'saved'|'error'} */ ('idle'));
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let savedTimer;

  onMount(async () => {
    tax = await loadCategories();
    loading = false;
  });

  async function persist() {
    saveState = 'saving';
    try {
      await setDoc(doc(db, 'sections', 'categories'), {
        name: 'categories',
        ...$state.snapshot(tax),
        updatedAt: serverTimestamp()
      }, { merge: true });
      saveState = 'saved';
      clearTimeout(savedTimer);
      savedTimer = setTimeout(() => { if (saveState === 'saved') saveState = 'idle'; }, 1800);
    } catch {
      saveState = 'error';
    }
  }

  /** @param {'dev'|'digital'|'pfe'} type */
  function addCat(type) {
    const v = newCat[type].trim();
    if (!v) return;
    if (tax[type].some((c) => c.toLowerCase() === v.toLowerCase())) {
      newCat[type] = '';
      return;
    }
    tax[type] = [...tax[type], v];
    newCat[type] = '';
    persist();
  }

  /** @param {'dev'|'digital'|'pfe'} type @param {number} i */
  function removeCat(type, i) {
    tax[type] = tax[type].filter((_, idx) => idx !== i);
    persist();
  }

  /** @param {'dev'|'digital'|'pfe'} type @param {number} i @param {string} value */
  function renameCat(type, i, value) {
    const v = value.trim();
    if (!v) { removeCat(type, i); return; }
    if (tax[type][i] === v) return;
    tax[type][i] = v;
    persist();
  }
</script>

<svelte:head>
  <title>Categories — Shift Admin</title>
</svelte:head>

<div class="cats-page">
  <div class="page-head">
    <h1 class="page-title">Categories</h1>
    <div class="save-pill" data-state={saveState}>
      {#if saveState === 'saving'}Saving…
      {:else if saveState === 'saved'}✓ Saved
      {:else if saveState === 'error'}Save failed
      {/if}
    </div>
  </div>

  <p class="intro">
    These are the sub-categories shown per project type — in the add/edit forms and the
    public filter beside the type dropdown. Changes save automatically.
  </p>

  {#if loading}
    <p class="hint">Loading…</p>
  {:else}
    <div class="type-grid">
      {#each TYPES as t}
        <section class="type-card">
          <h2 class="type-title">{t.label}<span class="count">{tax[t.value].length}</span></h2>

          <div class="chip-list">
            {#each tax[t.value] as cat, i (i)}
              <div class="chip">
                <input
                  class="chip-input"
                  value={cat}
                  onblur={(e) => renameCat(t.value, i, e.currentTarget.value)}
                  onkeydown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                  aria-label="Category name"
                />
                <button class="chip-remove" onclick={() => removeCat(t.value, i)} aria-label="Delete category">×</button>
              </div>
            {/each}
            {#if tax[t.value].length === 0}
              <span class="empty">No categories yet.</span>
            {/if}
          </div>

          <div class="add-row">
            <input
              type="text"
              bind:value={newCat[t.value]}
              placeholder="Add a category…"
              onkeydown={(e) => e.key === 'Enter' && addCat(t.value)}
            />
            <button class="add-btn" onclick={() => addCat(t.value)} disabled={!newCat[t.value].trim()}>+ Add</button>
          </div>
        </section>
      {/each}
    </div>

    <p class="note">
      Renaming a category here doesn't rewrite categories already saved on existing projects —
      re-tick them in the project editor if you rename one.
    </p>
  {/if}
</div>

<style>
  .cats-page { display: flex; flex-direction: column; gap: 1.25rem; }

  .page-head { display: flex; align-items: center; gap: 1rem; }

  .page-title {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text);
  }

  .save-pill {
    font-family: var(--font-body);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--text-muted);
    min-height: 1rem;
  }
  .save-pill[data-state="saved"] { color: #38a169; }
  .save-pill[data-state="error"] { color: #e53e3e; }

  .intro {
    font-family: var(--font-body);
    font-size: 0.85rem;
    line-height: 1.6;
    color: var(--text-muted);
    max-width: 64ch;
    margin: 0;
  }

  .type-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.25rem;
  }

  .type-card {
    border: 1px solid var(--bg-card);
    border-radius: 6px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .type-title {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-family: var(--font-heading);
    font-size: 1rem;
    font-weight: 700;
    color: var(--text);
    margin: 0;
  }

  .count {
    font-family: var(--font-body);
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-muted);
    background: var(--bg-card);
    border-radius: 10px;
    padding: 1px 8px;
  }

  .chip-list { display: flex; flex-direction: column; gap: 0.4rem; }

  .chip {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: var(--bg-card);
    border-radius: 4px;
    padding: 0.15rem 0.3rem 0.15rem 0.55rem;
  }

  .chip-input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.82rem;
    padding: 0.3rem 0;
    outline: none;
  }

  .chip-remove {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
    padding: 0 0.3rem;
    transition: color 0.15s ease;
  }
  .chip-remove:hover { color: #e53e3e; }

  .empty { font-family: var(--font-body); font-size: 0.78rem; color: var(--text-muted); }

  .add-row { display: flex; gap: 0.5rem; align-items: center; }

  .add-row input {
    flex: 1;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--bg-card);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.82rem;
    padding: 0.35rem 0;
    outline: none;
    transition: border-color 0.2s ease;
  }
  .add-row input:focus { border-bottom-color: var(--accent); }

  .add-btn {
    background: var(--accent);
    color: #fff;
    border: none;
    padding: 0.4rem 0.85rem;
    font-family: var(--font-body);
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    border-radius: 3px;
    transition: opacity 0.2s ease;
  }
  .add-btn:hover:not(:disabled) { opacity: 0.88; }
  .add-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .note, .hint {
    font-family: var(--font-body);
    font-size: 0.78rem;
    color: var(--text-muted);
    margin: 0;
  }
</style>
