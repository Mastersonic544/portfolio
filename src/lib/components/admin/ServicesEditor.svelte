<script>
  import { updateDoc, doc } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';

  let { section } = $props();

  /** @type {{ title: string; desc: string; services: string[]; category: string }[]} */
  let cards  = $state(section.cards ? JSON.parse(JSON.stringify(section.cards)) : []);
  let saving = $state(false);

  const ref = doc(db, 'sections', section.id);

  async function save() {
    saving = true;
    await updateDoc(ref, { cards: cards.map(c => ({ ...c, services: [...c.services] })) });
    saving = false;
  }

  function addCard()    { cards = [...cards, { title: '', desc: '', services: [], category: 'dev' }]; }
  /** @param {number} i */
  function removeCard(i) { cards = cards.filter((_, j) => j !== i); }
  /** @param {number} ci */
  function addSvc(ci)   { cards[ci].services = [...cards[ci].services, '']; }
  /** @param {number} ci @param {number} si */
  function removeSvc(ci, si) { cards[ci].services = cards[ci].services.filter((_, j) => j !== si); }
</script>

<div class="editor">
  <div class="head">
    <span class="pt">Service Cards</span>
    <div class="actions">
      <button class="bg" onclick={addCard}>+ Add Card</button>
      <button class="bs" onclick={save} disabled={saving}>{saving ? 'Saving…' : 'Save All'}</button>
    </div>
  </div>

  <div class="list">
    {#each cards as card, ci}
      <div class="card-item">
        <div class="card-head">
          <span class="item-num">Card {ci + 1}</span>
          <button class="db" onclick={() => removeCard(ci)}>× Remove</button>
        </div>
        <div class="row2">
          <div class="field">
            <label class="lbl">Title</label>
            <input class="fi" type="text" bind:value={card.title} placeholder="Digital, Dev…" />
          </div>
          <div class="field" style="max-width:130px">
            <label class="lbl">Category filter</label>
            <select class="fi sel" bind:value={card.category}>
              <option value="dev">dev</option>
              <option value="digital">digital</option>
              <option value="pfe">pfe</option>
            </select>
          </div>
        </div>
        <div class="field">
          <label class="lbl">Description</label>
          <textarea class="ta" bind:value={card.desc} rows="2"></textarea>
        </div>
        <div class="field">
          <label class="lbl">Services list</label>
          {#each card.services as _, si}
            <div class="svc-row">
              <input class="fi" type="text" bind:value={card.services[si]} placeholder="Service name" />
              <button class="db" onclick={() => removeSvc(ci, si)}>×</button>
            </div>
          {/each}
          <button class="bg small" onclick={() => addSvc(ci)}>+ Add service</button>
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
  .bg.small { align-self: flex-start; margin-top: 0.2rem; }
  .list { display: flex; flex-direction: column; gap: 0.75rem; }
  .card-item { border: 1px solid var(--bg-card); padding: 0.875rem; display: flex; flex-direction: column; gap: 0.6rem; }
  .card-head { display: flex; align-items: center; justify-content: space-between; }
  .item-num  { font-family: var(--font-body); font-size: 0.65rem; color: var(--text-muted); font-weight: 700; }
  .row2 { display: flex; gap: 1rem; flex-wrap: wrap; }
  .row2 .field { flex: 1; min-width: 120px; }
  .field { display: flex; flex-direction: column; gap: 0.25rem; }
  .lbl  { font-family: var(--font-body); font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); }
  .fi   { background: transparent; border: none; border-bottom: 1px solid var(--bg-card); color: var(--text); font-family: var(--font-body); font-size: 0.83rem; padding: 0.25rem 0; outline: none; transition: border-color 0.15s; width: 100%; }
  .fi:focus { border-bottom-color: var(--accent); }
  .sel  { cursor: pointer; appearance: none; }
  .ta   { width: 100%; background: var(--bg-card); border: 1px solid var(--bg-card); color: var(--text); font-family: var(--font-body); font-size: 0.83rem; padding: 0.4rem 0.6rem; outline: none; resize: vertical; line-height: 1.6; box-sizing: border-box; }
  .ta:focus { border-color: var(--accent); }
  .svc-row { display: flex; align-items: center; gap: 0.4rem; }
  .db   { background: transparent; border: none; color: var(--text-muted); font-size: 0.85rem; cursor: pointer; padding: 0; flex-shrink: 0; }
  .db:hover { color: #e55; }
</style>
