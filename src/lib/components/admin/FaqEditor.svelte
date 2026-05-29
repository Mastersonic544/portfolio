<script>
  import { updateDoc, doc } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';

  let { section } = $props();

  /** @type {{ q: string; a: string }[]} */
  let items  = $state(section.items ? JSON.parse(JSON.stringify(section.items)) : []);
  let saving = $state(false);

  const ref = doc(db, 'sections', section.id);

  async function save() {
    saving = true;
    await updateDoc(ref, { items: items.map(i => ({ q: i.q, a: i.a })) });
    saving = false;
  }

  function addItem()    { items = [...items, { q: '', a: '' }]; }
  /** @param {number} i */
  function remove(i)    { items = items.filter((_, j) => j !== i); }
</script>

<div class="editor">
  <div class="head">
    <span class="pt">FAQ Items</span>
    <div class="actions">
      <button class="bg" onclick={addItem}>+ Add Question</button>
      <button class="bs" onclick={save} disabled={saving}>{saving ? 'Saving…' : 'Save All'}</button>
    </div>
  </div>

  <div class="list">
    {#each items as item, i}
      <div class="faq-item">
        <div class="item-head">
          <span class="item-num">{i + 1}</span>
          <button class="db" onclick={() => remove(i)}>× Remove</button>
        </div>
        <div class="field">
          <label class="lbl">Question</label>
          <input class="fi" type="text" bind:value={item.q} placeholder="Question…" />
        </div>
        <div class="field">
          <label class="lbl">Answer</label>
          <textarea class="ta" bind:value={item.a} rows="3" placeholder="Answer…"></textarea>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .editor { display: flex; flex-direction: column; gap: 0.875rem; }
  .head   { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--bg-card); }
  .actions { display: flex; gap: 0.4rem; }
  .pt   { font-family: var(--font-body); font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); }
  .bs   { background: var(--accent); color: #fff; border: none; padding: 0.25rem 0.75rem; font-family: var(--font-body); font-size: 0.72rem; font-weight: 600; cursor: pointer; }
  .bs:disabled { opacity: 0.4; cursor: not-allowed; }
  .bg   { background: transparent; border: 1px solid var(--bg-card); color: var(--text-muted); padding: 0.25rem 0.65rem; font-family: var(--font-body); font-size: 0.72rem; cursor: pointer; }
  .bg:hover { color: var(--text); border-color: var(--text-muted); }
  .list { display: flex; flex-direction: column; gap: 0.75rem; }
  .faq-item { border: 1px solid var(--bg-card); padding: 0.875rem; display: flex; flex-direction: column; gap: 0.5rem; }
  .item-head { display: flex; align-items: center; justify-content: space-between; }
  .item-num { font-family: var(--font-body); font-size: 0.65rem; color: var(--text-muted); font-weight: 700; }
  .field { display: flex; flex-direction: column; gap: 0.25rem; }
  .lbl  { font-family: var(--font-body); font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); }
  .fi   { background: transparent; border: none; border-bottom: 1px solid var(--bg-card); color: var(--text); font-family: var(--font-body); font-size: 0.83rem; padding: 0.25rem 0; outline: none; transition: border-color 0.15s; width: 100%; }
  .fi:focus { border-bottom-color: var(--accent); }
  .ta   { width: 100%; background: var(--bg-card); border: 1px solid var(--bg-card); color: var(--text); font-family: var(--font-body); font-size: 0.83rem; padding: 0.4rem 0.6rem; outline: none; resize: vertical; line-height: 1.6; box-sizing: border-box; }
  .ta:focus { border-color: var(--accent); }
  .db   { background: transparent; border: none; color: var(--text-muted); font-size: 0.72rem; cursor: pointer; padding: 0; }
  .db:hover { color: #e55; }
</style>
