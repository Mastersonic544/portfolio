<script>
  import { updateDoc, doc } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';

  let { section } = $props();

  let subtitle = $state(section.content?.subtitle ?? '');
  /** @type {{ label: string; href: string }[]} */
  let socials  = $state(section.socials ? JSON.parse(JSON.stringify(section.socials)) : []);

  /** @type {'' | 'content' | 'socials'} */
  let saving = $state('');

  const ref = doc(db, 'sections', section.id);

  async function saveContent() { saving = 'content'; await updateDoc(ref, { 'content.subtitle': subtitle }); saving = ''; }
  async function saveSocials() { saving = 'socials';  await updateDoc(ref, { socials: socials.map(s => ({ ...s })) }); saving = ''; }

  function addSocial()   { socials = [...socials, { label: '', href: '' }]; }
  /** @param {number} i */
  function remove(i)     { socials = socials.filter((_, j) => j !== i); }
</script>

<div class="editor">

  <div class="panel">
    <div class="ph"><span class="pt">Subtitle</span><button class="bs" onclick={saveContent} disabled={saving==='content'}>{saving==='content'?'Saving…':'Save'}</button></div>
    <textarea class="ta" bind:value={subtitle} rows="3"></textarea>
  </div>

  <div class="panel">
    <div class="ph">
      <span class="pt">Social Links</span>
      <div class="pa"><button class="bg" onclick={addSocial}>+ Add</button><button class="bs" onclick={saveSocials} disabled={saving==='socials'}>{saving==='socials'?'Saving…':'Save'}</button></div>
    </div>
    {#each socials as s, i}
      <div class="row">
        <input class="fi" type="text" bind:value={s.label} placeholder="LinkedIn" style="max-width:110px" />
        <input class="fi" type="url"  bind:value={s.href}  placeholder="https://…" />
        <button class="db" onclick={() => remove(i)}>×</button>
      </div>
    {/each}
  </div>

</div>

<style>
  .editor { display: flex; flex-direction: column; }
  .panel  { padding: 0.875rem 0; border-bottom: 1px solid var(--bg-card); display: flex; flex-direction: column; gap: 0.5rem; }
  .ph     { display: flex; align-items: center; justify-content: space-between; }
  .pa     { display: flex; gap: 0.4rem; }
  .pt     { font-family: var(--font-body); font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); }
  .bs     { background: var(--accent); color: #fff; border: none; padding: 0.25rem 0.75rem; font-family: var(--font-body); font-size: 0.72rem; font-weight: 600; cursor: pointer; }
  .bs:disabled { opacity: 0.4; cursor: not-allowed; }
  .bg     { background: transparent; border: 1px solid var(--bg-card); color: var(--text-muted); padding: 0.25rem 0.65rem; font-family: var(--font-body); font-size: 0.72rem; cursor: pointer; }
  .bg:hover { color: var(--text); border-color: var(--text-muted); }
  .ta     { width: 100%; background: var(--bg-card); border: 1px solid var(--bg-card); color: var(--text); font-family: var(--font-body); font-size: 0.83rem; padding: 0.4rem 0.6rem; outline: none; resize: vertical; line-height: 1.6; box-sizing: border-box; }
  .ta:focus { border-color: var(--accent); }
  .row    { display: flex; align-items: center; gap: 0.5rem; }
  .fi     { flex: 1; background: transparent; border: none; border-bottom: 1px solid var(--bg-card); color: var(--text); font-family: var(--font-body); font-size: 0.83rem; padding: 0.25rem 0; outline: none; transition: border-color 0.15s; min-width: 0; }
  .fi:focus { border-bottom-color: var(--accent); }
  .db     { background: transparent; border: none; color: var(--text-muted); font-size: 1rem; cursor: pointer; padding: 0 0.2rem; flex-shrink: 0; line-height: 1; }
  .db:hover { color: #e55; }
</style>
