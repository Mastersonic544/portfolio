<script>
  import { updateDoc, doc } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';

  let { section } = $props();

  let bio       = $state(section.content?.bio ?? '');
  let education = $state(section.education ? JSON.parse(JSON.stringify(section.education)) : []);
  let skills    = $state(section.skills    ? [...section.skills]    : []);
  let quickScan = $state(section.quickScan ? JSON.parse(JSON.stringify(section.quickScan)) : []);

  /** @type {'' | 'bio' | 'education' | 'skills' | 'quickScan'} */
  let saving = $state('');

  const ref = doc(db, 'sections', section.id);

  async function saveBio()       { saving = 'bio';       await updateDoc(ref, { 'content.bio': bio });                                          saving = ''; }
  async function saveEducation() { saving = 'education'; await updateDoc(ref, { education: education.map(e => ({ ...e })) });                    saving = ''; }
  async function saveSkills()    { saving = 'skills';    await updateDoc(ref, { skills: skills.filter(Boolean) });                               saving = ''; }
  async function saveQuickScan() { saving = 'quickScan'; await updateDoc(ref, { quickScan: quickScan.map(q => ({ ...q })) });                    saving = ''; }

  function addEdu()       { education = [...education, { institution: '', degree: '', year: '' }]; }
  function removeEdu(i)   { education = education.filter((_, j) => j !== i); }
  function addSkill()     { skills    = [...skills, '']; }
  function removeSkill(i) { skills    = skills.filter((_, j) => j !== i); }
  function addScan()      { quickScan = [...quickScan, { key: '', value: '' }]; }
  function removeScan(i)  { quickScan = quickScan.filter((_, j) => j !== i); }
</script>

<div class="editor">

  <!-- Bio -->
  <div class="panel">
    <div class="ph"><span class="pt">Bio</span><button class="bs" onclick={saveBio} disabled={saving==='bio'}>{saving==='bio'?'Saving…':'Save'}</button></div>
    <textarea class="ta" bind:value={bio} rows="4"></textarea>
  </div>

  <!-- Education -->
  <div class="panel">
    <div class="ph">
      <span class="pt">Education</span>
      <div class="pa"><button class="bg" onclick={addEdu}>+ Add</button><button class="bs" onclick={saveEducation} disabled={saving==='education'}>{saving==='education'?'Saving…':'Save'}</button></div>
    </div>
    {#each education as edu, i}
      <div class="row3">
        <input class="fi" type="text" bind:value={edu.institution} placeholder="Institution" />
        <input class="fi" type="text" bind:value={edu.degree}      placeholder="Degree" />
        <input class="fi" style="max-width:110px" type="text" bind:value={edu.year} placeholder="Year" />
        <button class="db" onclick={() => removeEdu(i)}>×</button>
      </div>
    {/each}
  </div>

  <!-- Skills -->
  <div class="panel">
    <div class="ph">
      <span class="pt">Skills</span>
      <div class="pa"><button class="bg" onclick={addSkill}>+ Add</button><button class="bs" onclick={saveSkills} disabled={saving==='skills'}>{saving==='skills'?'Saving…':'Save'}</button></div>
    </div>
    <div class="tag-wrap">
      {#each skills as _, i}
        <div class="tag-row">
          <input class="fi tag-in" type="text" bind:value={skills[i]} placeholder="Skill" />
          <button class="db" onclick={() => removeSkill(i)}>×</button>
        </div>
      {/each}
    </div>
  </div>

  <!-- Quick Scan -->
  <div class="panel">
    <div class="ph">
      <span class="pt">Quick Scan</span>
      <div class="pa"><button class="bg" onclick={addScan}>+ Add</button><button class="bs" onclick={saveQuickScan} disabled={saving==='quickScan'}>{saving==='quickScan'?'Saving…':'Save'}</button></div>
    </div>
    {#each quickScan as item, i}
      <div class="row2">
        <input class="fi" type="text" bind:value={item.key}   placeholder="Label" style="max-width:130px" />
        <input class="fi" type="text" bind:value={item.value} placeholder="Value" />
        <button class="db" onclick={() => removeScan(i)}>×</button>
      </div>
    {/each}
  </div>

</div>

<style>
  .editor { display: flex; flex-direction: column; }
  .panel  { padding: 0.875rem 0; border-bottom: 1px solid var(--bg-card); display: flex; flex-direction: column; gap: 0.6rem; }
  .ph     { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
  .pa     { display: flex; gap: 0.4rem; }
  .pt     { font-family: var(--font-body); font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); }
  .bs     { background: var(--accent); color: #fff; border: none; padding: 0.25rem 0.75rem; font-family: var(--font-body); font-size: 0.72rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
  .bs:disabled { opacity: 0.4; cursor: not-allowed; }
  .bg     { background: transparent; border: 1px solid var(--bg-card); color: var(--text-muted); padding: 0.25rem 0.65rem; font-family: var(--font-body); font-size: 0.72rem; cursor: pointer; }
  .bg:hover { color: var(--text); border-color: var(--text-muted); }
  .fi     { flex: 1; background: transparent; border: none; border-bottom: 1px solid var(--bg-card); color: var(--text); font-family: var(--font-body); font-size: 0.83rem; padding: 0.25rem 0; outline: none; transition: border-color 0.15s; min-width: 0; }
  .fi:focus { border-bottom-color: var(--accent); }
  .ta     { width: 100%; background: var(--bg-card); border: 1px solid var(--bg-card); color: var(--text); font-family: var(--font-body); font-size: 0.83rem; padding: 0.5rem 0.75rem; outline: none; resize: vertical; line-height: 1.65; box-sizing: border-box; }
  .ta:focus { border-color: var(--accent); }
  .db     { background: transparent; border: none; color: var(--text-muted); font-size: 1rem; cursor: pointer; padding: 0 0.2rem; flex-shrink: 0; line-height: 1; }
  .db:hover { color: #e55; }
  .row3, .row2 { display: flex; align-items: center; gap: 0.5rem; }
  .tag-wrap    { display: flex; flex-wrap: wrap; gap: 0.35rem; }
  .tag-row     { display: flex; align-items: center; gap: 0.25rem; }
  .tag-in      { width: 100px; }
</style>
