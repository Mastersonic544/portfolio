<script>
  import { onMount } from 'svelte';
  import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import HeroEditor       from '$lib/components/admin/HeroEditor.svelte';
  import AboutEditor      from '$lib/components/admin/AboutEditor.svelte';
  import FaqEditor        from '$lib/components/admin/FaqEditor.svelte';
  import ServicesEditor   from '$lib/components/admin/ServicesEditor.svelte';
  import HighlightsEditor from '$lib/components/admin/HighlightsEditor.svelte';
  import ContactEditor    from '$lib/components/admin/ContactEditor.svelte';

  /** @typedef {{ id: string; name: string; visible: boolean; order: number; content: Record<string, string> }} Section */

  /** @type {Section[]} */
  let sections = $state([]);
  let loading  = $state(true);

  onMount(async () => {
    const snap = await getDocs(query(collection(db, 'sections'), orderBy('order')));
    sections = snap.docs.map((d) => ({ id: d.id, .../** @type {any} */ (d.data()) }));
    loading = false;
  });

  /** @param {Section} sec */
  async function toggleVisible(sec) {
    sec.visible = !sec.visible;
    await updateDoc(doc(db, 'sections', sec.id), { visible: sec.visible });
  }

  /** @param {number} i */
  async function moveUp(i) {
    if (i === 0) return;
    const a = sections[i];
    const b = sections[i - 1];
    [a.order, b.order] = [b.order, a.order];
    sections = [...sections.slice(0, i - 1), a, b, ...sections.slice(i + 1)];
    await Promise.all([
      updateDoc(doc(db, 'sections', a.id), { order: a.order }),
      updateDoc(doc(db, 'sections', b.id), { order: b.order })
    ]);
  }

  /** @param {number} i */
  async function moveDown(i) {
    if (i === sections.length - 1) return;
    const a = sections[i];
    const b = sections[i + 1];
    [a.order, b.order] = [b.order, a.order];
    sections = [...sections.slice(0, i), b, a, ...sections.slice(i + 2)];
    await Promise.all([
      updateDoc(doc(db, 'sections', a.id), { order: a.order }),
      updateDoc(doc(db, 'sections', b.id), { order: b.order })
    ]);
  }

  /**
   * @param {Section} sec
   * @param {string} key
   * @param {string} value
   */
  async function saveField(sec, key, value) {
    sec.content[key] = value;
    await updateDoc(doc(db, 'sections', sec.id), { [`content.${key}`]: value });
  }
</script>

<svelte:head>
  <title>CMS — Shift Admin</title>
</svelte:head>

<div class="cms-page">
  <h1 class="page-title">CMS</h1>

  {#if loading}
    <p class="hint">Loading sections…</p>
  {:else if sections.length === 0}
    <div class="empty-state">
      <p>No sections found.</p>
      <p class="hint">Populate a <code>sections</code> collection in Firestore to get started.</p>
    </div>
  {:else}
    <div class="section-list">
      {#each sections as sec, i}
        <div class="sec-row" class:hidden={!sec.visible}>

          <!-- Left: name + toggle + order -->
          <div class="sec-meta">
            <span class="sec-name">{sec.name}</span>

            <label class="toggle" title="Toggle visibility">
              <input
                type="checkbox"
                checked={sec.visible}
                onchange={() => toggleVisible(sec)}
              />
              <span class="track"></span>
            </label>

            <div class="order-btns">
              <button onclick={() => moveUp(i)}   disabled={i === 0}>↑</button>
              <button onclick={() => moveDown(i)} disabled={i === sections.length - 1}>↓</button>
            </div>
          </div>

          <!-- Right: section-specific editor -->
          <div class="section-editor">
            {#if sec.name === 'hero'}
              <HeroEditor section={sec} />
            {:else if sec.name === 'about'}
              <AboutEditor section={sec} />
            {:else if sec.name === 'faq'}
              <FaqEditor section={sec} />
            {:else if sec.name === 'services'}
              <ServicesEditor section={sec} />
            {:else if sec.name === 'highlights'}
              <HighlightsEditor section={sec} />
            {:else if sec.name === 'contact'}
              <ContactEditor section={sec} />
            {:else if Object.keys(sec.content ?? {}).length > 0}
              <div class="content-fields">
                {#each Object.keys(sec.content) as key}
                  <div class="cf-row">
                    <label class="cf-label" for="cf-{sec.id}-{key}">{key}</label>
                    <input
                      id="cf-{sec.id}-{key}"
                      class="cf-input"
                      type="text"
                      value={sec.content[key]}
                      onblur={(e) => saveField(sec, key, e.currentTarget.value)}
                    />
                  </div>
                {/each}
              </div>
            {/if}
          </div>

        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .cms-page { display: flex; flex-direction: column; gap: 1.75rem; }

  .page-title {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text);
  }

  /* ── Section list ───────────────────────────── */
  .section-list { display: flex; flex-direction: column; }

  .sec-row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 1.5rem;
    padding: 1.125rem 0;
    border-bottom: 1px solid var(--bg-card);
    transition: opacity 0.2s ease;
  }

  .sec-row:first-child { border-top: 1px solid var(--bg-card); }
  .sec-row.hidden { opacity: 0.4; }

  /* ── Left column ────────────────────────────── */
  .sec-meta {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    min-width: 200px;
  }

  .sec-name {
    font-family: var(--font-heading);
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text);
    min-width: 80px;
  }

  /* Toggle */
  .toggle { display: flex; align-items: center; cursor: pointer; }
  .toggle input { display: none; }

  .track {
    width: 34px;
    height: 19px;
    border-radius: 10px;
    background: var(--bg);
    border: 1.5px solid var(--text-muted);
    position: relative;
    transition: background 0.2s ease, border-color 0.2s ease;
  }

  .track::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: var(--text-muted);
    transition: transform 0.2s ease, background 0.2s ease;
  }

  .toggle input:checked + .track { background: var(--accent); border-color: var(--accent); }
  .toggle input:checked + .track::after { transform: translateX(15px); background: #fff; }

  /* Order buttons */
  .order-btns { display: flex; gap: 0.3rem; }

  .order-btns button {
    background: var(--bg-card);
    border: none;
    color: var(--text);
    width: 26px;
    height: 26px;
    cursor: pointer;
    font-size: 0.72rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.15s ease;
  }

  .order-btns button:hover:not(:disabled) { background: var(--text-muted); color: var(--bg); }
  .order-btns button:disabled { opacity: 0.25; cursor: not-allowed; }

  /* ── Section editor wrapper ─────────────────── */
  .section-editor {
    flex: 1;
    min-width: 260px;
  }

  /* ── Content fields ─────────────────────────── */
  .content-fields {
    flex: 1;
    min-width: 260px;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .cf-row {
    display: grid;
    grid-template-columns: 110px 1fr;
    align-items: center;
    gap: 0.875rem;
  }

  .cf-label {
    font-family: var(--font-body);
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
  }

  .cf-input {
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--bg-card);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.85rem;
    padding: 0.3rem 0;
    outline: none;
    width: 100%;
    transition: border-color 0.2s ease;
  }

  .cf-input:focus { border-bottom-color: var(--accent); }

  /* ── Empty / hint ───────────────────────────── */
  .empty-state { display: flex; flex-direction: column; gap: 0.375rem; }

  .hint {
    font-family: var(--font-body);
    font-size: 0.82rem;
    color: var(--text-muted);
  }

  .empty-state p {
    font-family: var(--font-body);
    font-size: 0.9rem;
    color: var(--text);
  }

  @media (max-width: 640px) {
    .sec-row { gap: 0.875rem; }
    .sec-meta { min-width: 0; width: 100%; }
    .section-editor { min-width: 0; width: 100%; }
    .content-fields { min-width: 0; }
    .cf-row { grid-template-columns: 90px 1fr; }
  }
</style>
