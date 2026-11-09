<template>
  <div class="btn-create-page-online">
    <v-layout px-2>
      <button
        class="btn-create mb-1"
        v-if="!storeAlreadyCreated && !storeUrl"
        @click="handleLogin"
        :disabled="isButtonBlocked || isPersistentProcessStarted"
        :style="isPersistentProcessStarted ? {
          background: `linear-gradient(to right, rgba(2,151,155,0.30) ${progressPercent}%, rgba(140,216,60,0.2) ${progressPercent}%)`,
          justifyContent: 'space-between'
        } : {}"
      >
        <span class="btn-icon">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
        <span>{{ buttonText }}</span>
        <span v-if="isPersistentProcessStarted" class="btn-progress-pct">
          {{ progressPercent }}%
        </span>
      </button>
      <div class="url-tienda-box" v-if="storeUrl || commerce.urlDomain">
        <span class="url-tienda-label">Tu tienda online</span>
        <div class="url-tienda-row">
          <a :href="storeUrl || commerce.urlDomain" target="_blank" class="url-tienda-link">
            {{ storeUrl || commerce.urlDomain }}
          </a>
          <button
            class="url-copy-btn"
            :class="{ 'url-copy-btn--success': copySuccess }"
            @click="copyUrl"
          >
            <span v-if="!copySuccess">Copiar</span>
            <span v-else>✓ Copiado</span>
          </button>
        </div>
      </div>
    </v-layout>

    <div class="dialog-overlay" v-if="dialog" @click.self="handleOverlayClick">
      <div class="dialog-card">
        <div class="dialog-header">
          <h1 class="dialog-title">Creando tu tienda</h1>
          <p class="dialog-subtitle" v-if="userInfo">{{ userInfo.full_name || userInfo.email }}</p>
          <p class="dialog-subtitle" v-else>Conectando con Netlify...</p>
        </div>

        <div class="dialog-content">
          <template v-if="isRunning || loading">
            <div class="steps-box">
              <div class="space-y-3">
                <div v-for="(step, i) in steps" :key="i" class="step-row">
                  <div v-if="i < currentStep" class="step-icon done">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#02979B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div v-else-if="i === currentStep" class="step-icon spinning">
                    <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#e5e7eb" stroke-width="4"/>
                      <path fill="#02979B" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                  </div>
                  <div v-else class="step-icon pending"></div>
                  <p :class="['step-label', i < currentStep ? 'done-label' : i === currentStep ? 'active-label' : 'pending-label']">{{ step }}</p>
                </div>
              </div>
            </div>
          </template>

          <div v-if="errorMessage" class="error-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" class="flex-shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <p class="error-text">{{ errorMessage }}</p>
              <button @click="handleReset" class="retry-btn">Intentar de nuevo</button>
            </div>
          </div>

          <div v-if="result" class="result-box">
            <p class="result-big-text">¡Tu página está siendo creada!</p>
            <p class="result-big-sub">En 5 minutos tu tienda estará lista</p>
            <div class="result-url-box">
              <p class="result-url-label">URL de tu tienda</p>
              <a :href="result.url" target="_blank" rel="noreferrer" class="result-url">{{ result.url }}</a>
            </div>
            <div class="countdown-wrap">
              <div class="countdown-ring">
                <svg viewBox="0 0 36 36" width="64" height="64">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2.5"/>
                  <circle
                    cx="18" cy="18" r="15"
                    fill="none"
                    stroke="white"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-dasharray="94.2"
                    :stroke-dashoffset="94.2 - (94.2 * countdown / 6)"
                    style="transition: stroke-dashoffset 1s linear; transform: rotate(-90deg); transform-origin: center;"
                  />
                </svg>
                <span class="countdown-number">{{ countdown }}</span>
              </div>
              <p class="countdown-text">Cerrando en {{ countdown }}s...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import helper from '@/shared/helper';

const NETLIFY_CLIENT_ID = process.env.NETLIFY_CLIENT_ID;
const NETLIFY_SERVICE = process.env.NETLIFY_SERVICE;

const STEPS = [
  'Autenticando con Netlify...',
  'Obteniendo cuenta...',
  'Creando sitio...',
  'Configurando variables de entorno...',
  'Iniciando deploy...',
];

function getTokenFromURL() {
  const stored = helper.getLocalData('netlify_token_temp');
  if (stored) return stored;

  const stored2 = sessionStorage.getItem('netlify_token');
  if (stored2) {
    sessionStorage.removeItem('netlify_token');
    helper.setLocalData('netlify_token_temp', stored2);
    return stored2;
  }

  const hash = window.location.hash;
  if (!hash || hash === '#') return null;
  const params = new URLSearchParams(hash.startsWith('#') ? hash.substring(1) : hash);
  const token = params.get('access_token');
  if (token) {
    helper.setLocalData('netlify_token_temp', token);
  }
  return token;
}

export default {
  name: 'btn-create-page-online',
  props: {
    commerce: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    const commerceId = this.commerce && this.commerce.id;
    const savedUrl = helper.getLocalData(`store_url_${commerceId}`) || '';
    const savedCreated = helper.getLocalData(`store_created_${commerceId}`) === 'true';
    const alreadyHasUrl = !!(this.commerce && this.commerce.urlDomain) || !!savedUrl || savedCreated;

    const startKey = `progress_start_${commerceId}`;
    const startTime = Number(helper.getLocalData(startKey));
    let initialPercent = 0;
    if (startTime) {
      const elapsed = (Date.now() - startTime) / 1000;
      initialPercent = Math.min(90, Math.floor((elapsed / 540) * 90));
    }

    return {
      dialog: false,
      netlifyToken: '',
      userInfo: null,
      currentStep: 0,
      isRunning: false,
      processStarted: false,
      storeName: '',
      steps: STEPS,
      intervalId: null,
      localError: null,
      loading: false,
      result: null,
      error: null,
      countdown: null,
      countdownTimer: null,
      copySuccess: false,
      storeAlreadyCreated: alreadyHasUrl,
      storeUrl: (this.commerce && this.commerce.urlDomain) || savedUrl,
      isPersistentProcessStarted: helper.getLocalData(`process_started_${commerceId}`) === 'true',
      pendingSiteId: helper.getLocalData(`pending_site_id_${commerceId}`) || '',
      progressPercent: initialPercent,
      progressTimer: null,
      validationError: false,
      isValidating: false,
    };
  },
  computed: {
    errorMessage() {
      return this.localError || this.error;
    },
    isButtonBlocked() {
      return this.isRunning || this.loading || this.dialog || this.isValidating;
    },
    buttonText() {
      if (this.isValidating) return 'Verificando productos...';
      if (this.isRunning || this.loading || this.isPersistentProcessStarted) return 'Creando tienda...';
      return 'Crear tienda online';
    },
  },
  methods: {
    buildEnvVariables(commerce) {
      const productsBase = this.$httpProducts && this.$httpProducts.defaults && this.$httpProducts.defaults.baseURL;
      const salesBase = this.$httpSales && this.$httpSales.defaults && this.$httpSales.defaults.baseURL;
      const uploadBase = this.$httpProduction && this.$httpProduction.defaults && this.$httpProduction.defaults.baseURL;
      const formBackground = commerce.settings &&
        commerce.settings.template &&
        commerce.settings.template.aditionalInformation &&
        commerce.settings.template.aditionalInformation.urlImage || '';
      return {
        ACL_COMPANY_CODE: commerce.aclCode || '',
        COMMERCE_CODE: commerce.code,
        COMPANY_LOGIN_TITLE: commerce.name,
        DEFAULT_AVATAR: commerce.urlImage || '',
        FORM_BACKGROUND: formBackground,
        PAGE_TITLE: commerce.name,
        PRODUCTS_READ_REPORT: productsBase,
        PRODUCTS_URL: productsBase,
        REDIRECT_URI: commerce.urlDomain ? commerce.urlDomain.replace(/\/$/, '') : `https://${commerce.name}.netlify.app/`,
        SALES_READ_REPORT: salesBase,
        SALES_URL: salesBase,
        TOKEN: commerce.tokenStore,
        UPLOAD_URL: uploadBase,
      };
    },

    async handleLogin() {
      this.validationError = false;
      this.isValidating = true;

      try {
        const res = await this.$httpProducts.get(
          `products/master?flagActive=1&commerceId=${this.commerce.id}&limit=1&page=1`
        );
        const data = res.data;
        const hasProducts = Array.isArray(data) ? data.length > 0 : false;

        if (!hasProducts) {
          this.$bus.$emit('tienda-sin-productos');
          this.isValidating = false;
          return;
        }
      } catch (err) {
        console.warn('No se pudo verificar productos asignados:', err);
      }

      this.isValidating = false;
      this.processStarted = true;
      helper.setLocalData(`process_started_${this.commerce.id}`, 'true');
      this.isPersistentProcessStarted = true;
      this.isRunning = true;
      this.dialog = true;
      helper.setLocalData('returnTo', window.location.pathname);
      helper.setLocalData('netlify_commerce_id', String(this.commerce.id));
      const redirectUri = window.location.origin + window.location.pathname;
      const url = `https://app.netlify.com/authorize?response_type=token&client_id=${NETLIFY_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      window.location.href = url;
    },

    closeDialog() {
      this.dialog = false;
    },
    handleOverlayClick() {
      if (!this.isRunning && !this.loading && !this.countdown && !this.errorMessage) {
        this.closeDialog();
      }
    },
    copyUrl() {
      const url = this.storeUrl || this.commerce.urlDomain;
      navigator.clipboard.writeText(url).then(() => {
        this.copySuccess = true;
        setTimeout(() => { this.copySuccess = false; }, 2000);
      });
    },
    handleReset() {
      if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
      if (this.countdownTimer) { clearInterval(this.countdownTimer); this.countdownTimer = null; }
      if (this.progressTimer) { clearInterval(this.progressTimer); this.progressTimer = null; }
      this.netlifyToken = '';
      this.userInfo = null;
      this.isRunning = false;
      this.loading = false;
      this.currentStep = 0;
      this.dialog = false;
      this.localError = null;
      this.result = null;
      this.error = null;
      this.countdown = null;
      this.progressPercent = 0;
      this.processStarted = false;
      this.isPersistentProcessStarted = false;
      this.validationError = false;
      this.isValidating = false;
      helper.removeLocalData(`process_started_${this.commerce.id}`);
      helper.removeLocalData(`progress_${this.commerce.id}`);
      helper.removeLocalData(`progress_start_${this.commerce.id}`);
    },
    startCountdown() {
      this.countdown = 6;
      this.countdownTimer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = null;
          this.dialog = false;
          this.isRunning = false;
          this.loading = false;
        }
      }, 1000);
    },
    async createSite({ netlifyToken, nombre, variables }) {
      this.loading = true;
      try {
        const res = await fetch(`${NETLIFY_SERVICE}/api/netlify/crear-tienda-completa`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${netlifyToken}`,
          },
          body: JSON.stringify({ nombre, variables, netlifyToken }),
        });
        if (!res.ok) {
          const errData = await res.json();
          let errorMsg = errData.error || 'Error al crear la tienda';
          if (errorMsg.includes('already has a store created')) {
            const match = errorMsg.match(/"([^"]+)"/);
            const storeName = match ? match[1] : '';
            errorMsg = `El nombre "${storeName}" ya tiene una tienda creada. Por favor elige un nombre diferente.`;
          }
          throw new Error(errorMsg);
        }
        const data = await res.json();
        this.result = { site_id: data.site_id, hook_id: data.hook_id, url: data.url };
        this.loading = false;
        return this.result;
      } catch (err) {
        this.loading = false;
        this.error = err.message;
        throw err;
      }
    },
    startPolling(siteId) {
      const startKey = `progress_start_${this.commerce.id}`;

      if (!helper.getLocalData(startKey)) {
        helper.setLocalData(startKey, Date.now());
      }

      const calcPercent = () => {
        const start = Number(helper.getLocalData(startKey));
        const elapsed = (Date.now() - start) / 1000;
        return Math.min(90, Math.floor((elapsed / 540) * 90));
      };

      this.progressPercent = calcPercent();

      this.progressTimer = setInterval(() => {
        this.progressPercent = calcPercent();
      }, 5000);

      const pollDeploy = setInterval(async () => {
        try {
          const res = await fetch(`${NETLIFY_SERVICE}/api/netlify/estado-tienda/${siteId}`);
          const data = await res.json();
        if (data.estado === 'lista') {
          clearInterval(pollDeploy);
          clearInterval(this.progressTimer);
          this.progressPercent = 100;
          helper.removeLocalData(`progress_${this.commerce.id}`);
          helper.removeLocalData(startKey);
          this.storeUrl = data.url;
          this.storeAlreadyCreated = true;
          helper.setLocalData(`store_created_${this.commerce.id}`, 'true');
          helper.setLocalData(`store_url_${this.commerce.id}`, data.url);
          helper.removeLocalData(`pending_site_id_${this.commerce.id}`);
          helper.removeLocalData(`process_started_${this.commerce.id}`);
          this.isPersistentProcessStarted = false;
          if (!helper.getLocalData('toast_tienda_emitido')) {
            helper.setLocalData('toast_tienda_emitido', 'true');
            this.$bus.$emit('tienda-creada');
            setTimeout(() => {
              helper.removeLocalData('toast_tienda_emitido');
            }, 8000);
          }
        }
        } catch (err) {
          console.warn('Polling error:', err);
        }
      }, 15000);
    },
    async createStore(token) {
      try {
        this.storeName = this.commerce.name;
        let aclCode = '';
        try {
          const { data } = await this.$httpSales.get('companies');
          aclCode = data.aclCode || data.code || '';
        } catch (err) {
          console.warn('Could not retrieve aclCode:', err);
        }
        const variables = this.buildEnvVariables({ ...this.commerce, aclCode });
        const result = await this.createSite({ netlifyToken: token, nombre: this.commerce.name, variables });
        if (result) {
          this.currentStep = STEPS.length;
          this.isRunning = false;
          this.loading = false;
          this.startCountdown();
          helper.setLocalData(`pending_site_id_${this.commerce.id}`, result.site_id);
          this.startPolling(result.site_id);
          try {
            const companyId = this.commerce.settings &&
              this.commerce.settings.defaultWarehouse &&
              this.commerce.settings.defaultWarehouse.companyId;
            if (companyId) {
              const productsBase = this.$httpProducts && this.$httpProducts.defaults && this.$httpProducts.defaults.baseURL;
              await fetch(`${productsBase}/categories-public/replicate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  companyId,
                  commercesData: [{ id: this.commerce.id, name: this.commerce.name }],
                }),
              });
            } else {
              console.warn('Could not find companyId for:', this.commerce.name);
            }
          } catch (err) {
            console.warn('Could not replicate categories:', err);
          }
        }
        if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
      } catch (err) {
        console.error('Error in createStore:', err);
        this.localError = err.message || 'Error al crear la tienda';
        this.isRunning = false;
        this.loading = false;
        if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
      }
    },
  },
  mounted() {
    const token = getTokenFromURL();
    if (!token && !this.pendingSiteId) {
      helper.removeLocalData(`process_started_${this.commerce.id}`);
      this.isPersistentProcessStarted = false;
    }
    const savedCommerceId = helper.getLocalData('netlify_commerce_id');

    if (token) {
      if (savedCommerceId && String(savedCommerceId) !== String(this.commerce.id)) {
        return;
      }
      helper.removeLocalData('netlify_commerce_id');
      helper.removeLocalData('netlify_token_temp');
      this.processStarted = true;
      helper.setLocalData(`process_started_${this.commerce.id}`, 'true');
      this.isPersistentProcessStarted = true;
      this.netlifyToken = token;
      this.isRunning = true;
      this.currentStep = 0;
      this.dialog = true;
      window.history.replaceState(null, '', window.location.pathname);
      fetch('https://api.netlify.com/api/v1/user', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => {
          if (!r.ok) throw new Error(`Error ${r.status}: ${r.statusText}`);
          return r.json();
        })
        .then((data) => {
          this.userInfo = data;
          this.currentStep = 1;
          let step = 1;
          this.intervalId = setInterval(() => {
            step++;
            if (step < STEPS.length - 1) this.currentStep = step;
          }, 2000);
          this.createStore(token);
        })
        .catch((err) => {
          this.localError = err.message;
          this.isRunning = false;
          this.processStarted = false;
          this.isPersistentProcessStarted = false;
          helper.removeLocalData(`process_started_${this.commerce.id}`);
          if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
        });
    }

    if (this.pendingSiteId && !this.storeAlreadyCreated && !token) {
      this.startPolling(this.pendingSiteId);
    }
  },
  beforeDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    if (this.progressTimer) clearInterval(this.progressTimer);
  },
};
</script>

<style lang="scss" scoped>
.btn-create {
  align-items: center;
  background-color: rgba(195, 231, 232, 0.4);
  border: 1px solid #02979B;
  border-radius: 5px !important;
  color: #02979B;
  cursor: pointer;
  display: inline-flex;
  font-size: 12px !important;
  font-weight: 500;
  gap: 6px;
  justify-content: center;
  letter-spacing: 0.3px;
  padding: 0px 8px;
  width: 100%;
  height: 32px;
  position: relative;
  transition: background 0.8s ease;
}
.btn-create:hover {
  box-shadow: none;
  transform: none;
}
.btn-create:active {
  transform: none;
}
.btn-create:disabled {
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.btn-progress-pct {
  color: #02979B;
  font-size: 11px;
  font-weight: 700;
  opacity: 0.9;
}
.btn-icon {
  align-items: center;
  display: flex;
}
.url-tienda-box {
  background-color: rgba(195, 231, 232, 0.4);
  border: 1px solid #02979B;
  border-radius: 5px !important;
  padding: 0px 8px;
  width: 100%;
  height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 4px;
}
.url-tienda-label {
  color: #02979B;
  display: block;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 2px;
}
.url-tienda-row {
  align-items: center;
  display: flex;
  gap: 6px;
}
.url-tienda-link {
  color: #02979B;
  flex: 1;
  font-size: 10px;
  overflow: hidden;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  &:hover { text-decoration: underline; }
}
.url-copy-btn {
  background: #02979B;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 600;
  min-width: 50px;
  padding: 2px 6px;
  transition: background 0.2s ease;
  &--success {
    background: #8CD83C;
  }
}
.dialog-overlay {
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  bottom: 0;
  display: flex;
  justify-content: center;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 999;
}
.dialog-card {
  animation: slideUp 0.3s ease;
  background: white;
  border-radius: 20px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.18);
  max-width: 420px;
  overflow: hidden;
  width: 92%;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.dialog-header {
  background: #02979B;
  padding: 32px 28px 28px;
  text-align: center;
}
.dialog-title {
  color: white;
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 0 0 6px;
}
.dialog-subtitle {
  color: rgba(255,255,255,0.75);
  font-size: 0.8rem;
  margin: 0;
}
.dialog-content {
  padding: 24px;
}
.steps-box {
  background: #f8fffe;
  border: 1px solid #d0f0f0;
  border-radius: 14px;
  padding: 20px;
}
.step-row {
  align-items: center;
  display: flex;
  gap: 12px;
}
.step-icon {
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: 22px;
  justify-content: center;
  width: 22px;
  &.done {
    background: #e0f7f7;
    border-radius: 50%;
  }
  &.pending {
    border: 1.5px solid #e5e7eb;
    border-radius: 50%;
  }
}
.step-label {
  font-size: 0.8rem;
  transition: all 0.2s;
}
.done-label    { color: #02979B; font-weight: 600; }
.active-label  { color: #111827; font-weight: 700; }
.pending-label { color: #d1d5db; }
.space-y-3 > * + * { margin-top: 12px; }
.error-box {
  align-items: flex-start;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 12px;
  display: flex;
  gap: 10px;
  margin-top: 16px;
  padding: 14px 16px;
}
.error-text { color: #ef4444; font-size: 0.8rem; margin: 0 0 4px; }
.retry-btn  { background: none; border: none; color: #f87171; cursor: pointer; font-size: 0.75rem; padding: 0; text-decoration: underline; }
.flex-shrink-0 { flex-shrink: 0; }
.result-box {
  background: #02979B;
  border-radius: 14px;
  margin-top: 16px;
  padding: 24px 20px;
  text-align: center;
}
.result-big-text {
  color: white;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.3px;
  margin: 0 0 6px;
}
.result-big-sub {
  color: rgba(255,255,255,0.85);
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 20px;
}
.result-url-box {
  background: rgba(255,255,255,0.15);
  border-radius: 10px;
  margin-bottom: 20px;
  padding: 12px 14px;
  text-align: left;
}
.result-url-label {
  color: rgba(255,255,255,0.7);
  font-size: 0.7rem;
  letter-spacing: 0.5px;
  margin: 0 0 4px;
  text-transform: uppercase;
}
.result-url {
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  word-break: break-all;
  &:hover { text-decoration: underline; }
}
.countdown-wrap {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.countdown-ring {
  align-items: center;
  display: inline-flex;
  justify-content: center;
  position: relative;
}
.countdown-number {
  color: white;
  font-size: 1.2rem;
  font-weight: 800;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
}
.countdown-text {
  color: rgba(255,255,255,0.7);
  font-size: 0.75rem;
  margin: 0;
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>