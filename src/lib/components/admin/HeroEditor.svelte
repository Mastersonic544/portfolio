<script>
  import { updateDoc, doc } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { convertToWebP } from '$lib/utils/convertWebP.js';
  import { uploadToStorage } from '$lib/utils/uploadToStorage.js';

  /** @type {{ id: string; content?: Record<string,string>; services?: string[]; kpis?: any[]; companies?: any[] }} */
  let { section } = $props();

  const DEFAULT_KPIS = [
    { num: 5,   suffix: '+', label: 'Years of Experience' },
    { num: 100, suffix: '%', label: 'Client Satisfaction' },
    { num: 7,   suffix: '+', label: 'Companies Worked With' },
    { num: 48,  suffix: '+', label: 'Projects Shipped' },
  ];

  let biography       = $state(section.content?.biography        ?? 'Full stack developer, engineer, and creative technologist. I build powerful digital products, automation systems, and branding assets fast. A strong vibecoder capable of shipping tools in seconds, not days.');
  let contactLocation = $state(section.content?.contact_location ?? 'Sfax, Tunisia');
  let contactEmail    = $state(section.content?.contact_email    ?? 'yassine.m.dhouib@gmail.com');
  let contactPhone    = $state(section.content?.contact_phone    ?? '+216 54 489 995');
  let services        = $state([...(section.services  ?? ['Web Development', 'Mobile App Development', 'UI/UX Design', 'Graphic Design', 'Video Editing'])]);
  let kpis            = $state([...(section.kpis      ?? DEFAULT_KPIS)]);
  let companies       = $state([...(section.companies ?? [])]);

  /** @type {'' | 'content' | 'services' | 'kpis' | 'companies'} */
  let saving    = $state('');
  let uploading = $state(false);

  const docRef = doc(db, 'sections', section.id);

  async function saveContent() {
    saving = 'content';
    await updateDoc(docRef, {
      'content.biography':        biography,
      'content.contact_location': contactLocation,
      'content.contact_email':    contactEmail,
      'content.contact_phone':    contactPhone,
    });
    saving = '';
  }

  async function saveServices() {
    saving = 'services';
    await updateDoc(docRef, { services: [...services] });
    saving = '';
  }

  async function saveKPIs() {
    saving = 'kpis';
    await updateDoc(docRef, { kpis: kpis.map(k => ({ ...k, num: Number(k.num) })) });
    saving = '';
  }

  async function saveCompanies() {
    saving = 'companies';
    await updateDoc(docRef, { companies: [...companies] });
    saving = '';
  }

  function addService()     { services = [...services, '']; }
  function removeService(i) { services = services.filter((_, j) => j !== i); }

  function addKPI()     { kpis = [...kpis, { num: 0, suffix: '+', label: '' }]; }
  function removeKPI(i) { kpis = kpis.filter((_, j) => j !== i); }

  async function removeCompany(i) {
    companies = companies.filter((_, j) => j !== i);
    await saveCompanies();
  }

  /** @param {Event & { currentTarget: HTMLInputElement }} e */
  async function handleUpload(e) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    uploading = true;
    try {
      const blob = await convertToWebP(file);
      const fname = `${Date.now()}.webp`;
      const url  = await uploadToStorage(blob, 'companies', fname);
      companies  = [...companies, { name: file.name.replace(/\.[^.]+$/, ''), url }];
      await saveCompanies();
    } finally {
      uploading = false;
      e.currentTarget.value = '';
    }
  }
</script>

<div class="hero-editor">

  <!-- ── KPI Stats ──────────────────────────────── -->
  <div class="panel">
    <div class="panel-head">
      <span class="panel-title">KPI Stats</span>
      <div class="panel-actions">
        <button class="btn-ghost" onclick={addKPI}>+ Add</button>
        <button class="btn-save" onclick={saveKPIs} disabled={saving === 'kpis'}>
          {saving === 'kpis' ? 'Saving…' : 'Save KPIs'}
        </button>
      </div>
    </div>
    <div class="kpi-grid">
      {#each kpis as kpi, i}
        <div class="kpi-card">
          <button class="del-btn top-right" onclick={() => removeKPI(i)} title="Remove">×</button>
          <input class="kpi-num"    type="number" bind:value={kpi.num}    placeholder="0" />
          <input class="kpi-suffix" type="text"   bind:value={kpi.suffix} placeholder="+"  maxlength="2" />
          <input class="kpi-label"  type="text"   bind:value={kpi.label}  placeholder="Label" />
        </div>
      {/each}
    </div>
  </div>

  <!-- ── Biography & Contact ───────────────────── -->
  <div class="panel">
    <div class="panel-head">
      <span class="panel-title">Biography & Contact</span>
      <button class="btn-save" onclick={saveContent} disabled={saving === 'content'}>
        {saving === 'content' ? 'Saving…' : 'Save'}
      </button>
    </div>
    <div class="field-stack">
      <div class="field">
        <label class="field-label">Biography</label>
        <textarea class="field-textarea" bind:value={biography} rows="3"></textarea>
      </div>
      <div class="field-row">
        <div class="field">
          <label class="field-label">Location</label>
          <input class="field-input" type="text" bind:value={contactLocation} />
        </div>
        <div class="field">
          <label class="field-label">Email</label>
          <input class="field-input" type="email" bind:value={contactEmail} />
        </div>
        <div class="field">
          <label class="field-label">Phone</label>
          <input class="field-input" type="text" bind:value={contactPhone} />
        </div>
      </div>
    </div>
  </div>

  <!-- ── Services ──────────────────────────────── -->
  <div class="panel">
    <div class="panel-head">
      <span class="panel-title">Services</span>
      <div class="panel-actions">
        <button class="btn-ghost" onclick={addService}>+ Add</button>
        <button class="btn-save" onclick={saveServices} disabled={saving === 'services'}>
          {saving === 'services' ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
    <div class="service-list">
      {#each services as _, i}
        <div class="service-row">
          <input class="field-input" type="text" bind:value={services[i]} />
          <button class="del-btn" onclick={() => removeService(i)}>×</button>
        </div>
      {/each}
    </div>
  </div>

  <!-- ── Company Logos ─────────────────────────── -->
  <div class="panel">
    <div class="panel-head">
      <span class="panel-title">Company Logos</span>
      <label class="btn-upload" class:disabled={uploading}>
        {uploading ? 'Uploading…' : '+ Upload Image'}
        <input type="file" accept="image/*" onchange={handleUpload} disabled={uploading} hidden />
      </label>
    </div>
    <div class="logo-grid">
      {#each companies as co, i}
        <div class="logo-card">
          <div class="logo-img-wrap">
            <img src={co.url} alt={co.name} class="logo-img" />
          </div>
          <div class="logo-footer">
            <input
              class="field-input logo-name"
              type="text"
              bind:value={companies[i].name}
              onblur={saveCompanies}
              title="Display name"
            />
            <button class="del-btn" onclick={() => removeCompany(i)}>×</button>
          </div>
        </div>
      {:else}
        <p class="empty-hint">No logos yet. Upload a company image above.</p>
      {/each}
    </div>
  </div>

</div>

<style>
  .hero-editor { display: flex; flex-direction: column; }

  /* ── Panel ──────────────────────────────────── */
  .panel {
    padding: 1.125rem 0;
    border-bottom: 1px solid var(--bg-card);
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .panel-title {
    font-family: var(--font-body);
    font-size: 0.62rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
  }

  .panel-actions { display: flex; gap: 0.5rem; align-items: center; }

  /* ── Buttons ────────────────────────────────── */
  .btn-save {
    background: var(--accent);
    color: #fff;
    border: none;
    padding: 0.28rem 0.85rem;
    font-family: var(--font-body);
    font-size: 0.73rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s ease;
  }
  .btn-save:hover:not(:disabled) { opacity: 0.82; }
  .btn-save:disabled { opacity: 0.4; cursor: not-allowed; }

  .btn-ghost {
    background: transparent;
    border: 1px solid var(--bg-card);
    color: var(--text-muted);
    padding: 0.28rem 0.75rem;
    font-family: var(--font-body);
    font-size: 0.73rem;
    cursor: pointer;
    transition: border-color 0.15s ease, color 0.15s ease;
  }
  .btn-ghost:hover { border-color: var(--text-muted); color: var(--text); }

  .btn-upload {
    background: transparent;
    border: 1px dashed var(--text-muted);
    color: var(--text-muted);
    padding: 0.28rem 0.85rem;
    font-family: var(--font-body);
    font-size: 0.73rem;
    cursor: pointer;
    transition: border-color 0.15s ease, color 0.15s ease;
    white-space: nowrap;
  }
  .btn-upload:hover:not(.disabled) { border-color: var(--accent); color: var(--accent); }
  .btn-upload.disabled { opacity: 0.45; cursor: not-allowed; }

  .del-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
    padding: 0 0.2rem;
    flex-shrink: 0;
    transition: color 0.15s ease;
  }
  .del-btn:hover { color: #e55; }
  .del-btn.top-right { position: absolute; top: 0.4rem; right: 0.4rem; }

  /* ── KPI grid ───────────────────────────────── */
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.625rem;
  }

  .kpi-card {
    border: 1px solid var(--bg-card);
    padding: 0.875rem 0.875rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    position: relative;
  }

  .kpi-num {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--bg-card);
    color: var(--text);
    width: 100%;
    outline: none;
    padding: 0.15rem 0;
    transition: border-color 0.15s ease;
  }
  .kpi-num:focus { border-bottom-color: var(--accent); }

  .kpi-suffix {
    font-family: var(--font-body);
    font-size: 0.78rem;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--bg-card);
    color: var(--text-muted);
    width: 2.5rem;
    outline: none;
    padding: 0.15rem 0;
    transition: border-color 0.15s ease;
  }
  .kpi-suffix:focus { border-bottom-color: var(--accent); }

  .kpi-label {
    font-family: var(--font-body);
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--bg-card);
    color: var(--text-muted);
    width: 100%;
    outline: none;
    padding: 0.15rem 0;
    transition: border-color 0.15s ease;
  }
  .kpi-label:focus { border-bottom-color: var(--accent); }

  /* ── Fields ─────────────────────────────────── */
  .field-stack { display: flex; flex-direction: column; gap: 0.75rem; }

  .field-row {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.75rem;
  }

  .field { display: flex; flex-direction: column; gap: 0.3rem; }

  .field-label {
    font-family: var(--font-body);
    font-size: 0.62rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
  }

  .field-input {
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--bg-card);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.85rem;
    padding: 0.28rem 0;
    outline: none;
    width: 100%;
    transition: border-color 0.15s ease;
  }
  .field-input:focus { border-bottom-color: var(--accent); }

  .field-textarea {
    background: var(--bg-card);
    border: 1px solid var(--bg-card);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.85rem;
    padding: 0.6rem 0.75rem;
    outline: none;
    width: 100%;
    resize: vertical;
    line-height: 1.65;
    box-sizing: border-box;
    transition: border-color 0.15s ease;
  }
  .field-textarea:focus { border-color: var(--accent); }

  /* ── Services ───────────────────────────────── */
  .service-list { display: flex; flex-direction: column; gap: 0.35rem; }

  .service-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  /* ── Company logos ──────────────────────────── */
  .logo-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .logo-card {
    border: 1px solid var(--bg-card);
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 130px;
    flex-shrink: 0;
  }

  .logo-img-wrap {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    filter: grayscale(1);
    opacity: 0.65;
  }

  .logo-footer {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .logo-name { font-size: 0.75rem; }

  .empty-hint {
    font-family: var(--font-body);
    font-size: 0.8rem;
    color: var(--text-muted);
  }
</style>
