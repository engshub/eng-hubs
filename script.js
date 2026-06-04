/* ============================================================
   ENG HUBS — Script principal (Vanilla JS)
   ============================================================ */
(function () {
    'use strict';

    let CONCURSOS = [];

    const state = {
        filtroArea: 'todos',
        textoBusca: '',
        ordenacao: 'prazo',
        acompanhando: new Set(JSON.parse(localStorage.getItem('eng_acompanhando') || '[]'))
    };

    function formatBRL(valor) {
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    function diasRestantes(dataISO) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const alvo = new Date(dataISO + 'T00:00:00');
        const diff = Math.ceil((alvo - hoje) / (1000 * 60 * 60 * 24));
        return diff;
    }

    function formatData(dataISO) {
        const d = new Date(dataISO + 'T00:00:00');
        return d.toLocaleDateString('pt-BR');
    }

    function $(sel, ctx = document) { return ctx.querySelector(sel); }
    function $$(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }

    function refreshIcons() {
        if (window.lucide) window.lucide.createIcons();
    }

    function renderCard(c) {
        const dias = diasRestantes(c.inscricoesAte);
        const isAcompanhando = state.acompanhando.has(c.id);
        const badgeClass =
            c.statusBadge === 'encerrando' ? 'badge-encerrando' :
            c.statusBadge === 'novo' ? 'badge-novo' :
            'badge-aberto';
        const iconStatus =
            c.statusBadge === 'encerrando' ? 'alarm-clock' :
            c.statusBadge === 'novo' ? 'sparkles' :
            'check-circle-2';
        let textoPrazo;
        if (dias < 0) {
            textoPrazo = `Encerrado em <strong>${formatData(c.inscricoesAte)}</strong>`;
        } else if (dias === 0) {
            textoPrazo = `<strong>Último dia para inscrição!</strong>`;
        } else {
            textoPrazo = `Inscrições até <strong>${formatData(c.inscricoesAte)}</strong> · ${dias} dia${dias > 1 ? 's' : ''}`;
        }
        return `
            <article class="card" data-id="${c.id}" data-area="${c.area}">
                <div class="card-header">
                    <div class="card-badges">
                        <span class="badge ${badgeClass}">
                            <i data-lucide="${iconStatus}"></i> ${c.statusLabel}
                        </span>
                        <span class="badge badge-area">${c.areaLabel}</span>
                    </div>
                    <button
                        class="card-favorite ${isAcompanhando ? 'is-active' : ''}"
                        data-fav-id="${c.id}"
                        aria-label="${isAcompanhando ? 'Remover dos favoritos' : 'Favoritar'}"
                        title="${isAcompanhando ? 'Remover dos favoritos' : 'Favoritar'}"
                    >
                        <i data-lucide="${isAcompanhando ? 'bookmark-check' : 'bookmark'}"></i>
                    </button>
                </div>
                <p class="card-org">${c.orgao}</p>
                <h3 class="card-title">${c.cargo}</h3>
                <div class="card-info">
                    <div class="card-info-item">
                        <span class="card-info-label">Vagas</span>
                        <span class="card-info-value"><strong>${c.vagas}</strong></span>
                    </div>
                    <div class="card-info-item">
                        <span class="card-info-label">Remuneração</span>
                        <span class="card-info-value">${formatBRL(c.salario)}</span>
                    </div>
                    <div class="card-info-item">
                        <span class="card-info-label">Banca</span>
                        <span class="card-info-value">${c.banca}</span>
                    </div>
                    <div class="card-info-item">
                        <span class="card-info-label">UF</span>
                        <span class="card-info-value">${c.estado}</span>
                    </div>
                </div>
                <div class="card-deadline">
                    <i data-lucide="calendar-clock"></i>
                    <span>${textoPrazo}</span>
                </div>
                <div class="card-actions">
                    <button
                        class="btn btn-outline btn-watch ${isAcompanhando ? 'is-active' : ''}"
                        data-watch-id="${c.id}"
                    >
                        <i data-lucide="${isAcompanhando ? 'check' : 'bell-plus'}"></i>
                        <span class="btn-watch-label">${isAcompanhando ? 'Acompanhando' : 'Acompanhar'}</span>
                    </button>
                    <button class="btn-details" data-details-id="${c.id}">
                        Detalhes
                    </button>
                </div>
            </article>
        `;
    }

    function renderGrid() {
        const grid = $('#cards-grid');
        const empty = $('#empty-state');
        if (!grid) return;
        let lista = state.filtroArea === 'todos'
            ? CONCURSOS.slice()
            : CONCURSOS.filter(c => c.area === state.filtroArea);
        const q = state.textoBusca.trim().toLowerCase();
        if (q) {
            lista = lista.filter(c =>
                c.cargo.toLowerCase().includes(q) ||
                c.orgao.toLowerCase().includes(q) ||
                c.banca.toLowerCase().includes(q) ||
                c.estado.toLowerCase().includes(q) ||
                c.areaLabel.toLowerCase().includes(q)
            );
        }
        switch (state.ordenacao) {
            case 'salario':
                lista.sort((a, b) => b.salario - a.salario);
                break;
            case 'vagas':
                lista.sort((a, b) => b.vagas - a.vagas);
                break;
            case 'recentes':
                lista.sort((a, b) => (b.statusBadge === 'novo' ? 1 : 0) - (a.statusBadge === 'novo' ? 1 : 0));
                break;
            case 'prazo':
            default:
                lista.sort((a, b) => new Date(a.inscricoesAte) - new Date(b.inscricoesAte));
                break;
        }
        if (lista.length === 0) {
            grid.innerHTML = '';
            empty.classList.remove('hidden');
        } else {
            empty.classList.add('hidden');
            grid.innerHTML = lista.map(renderCard).join('');
        }
        refreshIcons();
    }

    function showToast({ title, message, type = 'default', duration = 4500 } = {}) {
        const container = $('#toast-container');
        if (!container) return;
        const iconMap = {
            default: 'bell-ring',
            success: 'check-circle-2',
            info: 'info',
            warning: 'alert-triangle'
        };
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i data-lucide="${iconMap[type] || iconMap.default}"></i>
            </div>
            <div class="toast-body">
                <div class="toast-title">${title || 'Notificação'}</div>
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
            <button class="toast-close" aria-label="Fechar notificação">
                <i data-lucide="x"></i>
            </button>
        `;
        container.appendChild(toast);
        refreshIcons();
        const remove = () => {
            toast.classList.add('toast-out');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        };
        toast.querySelector('.toast-close').addEventListener('click', remove);
        setTimeout(remove, duration);
    }

    function toggleAcompanhar(id, btn) {
        const concurso = CONCURSOS.find(c => c.id === id);
        const isAtivo = state.acompanhando.has(id);
        if (isAtivo) {
            state.acompanhando.delete(id);
            localStorage.setItem('eng_acompanhando', JSON.stringify([...state.acompanhando]));
            if (btn) {
                btn.classList.remove('is-active');
                btn.querySelector('.btn-watch-label').textContent = 'Acompanhar';
                const iconBtn1 = btn.querySelector('i[data-lucide]') || btn.querySelector('svg');
                if (iconBtn1 && iconBtn1.tagName === 'I') { iconBtn1.setAttribute('data-lucide', 'bell-plus'); }
            }
                        // Supabase: remove de controle_concursos (via fetch direto)
            (function() {
              var _ls = (function(){ try { var s=JSON.parse(localStorage.getItem('sb-xyvsihpdfgnihgomdntb-auth-token')); return (s&&s.access_token&&s.user)?s:null; } catch(e){return null;} })();
              if (!_ls) return;
              fetch(_engDb.supabaseUrl+'/rest/v1/controle_concursos?user_id=eq.'+_ls.user.id+'&concurso_id=eq.'+encodeURIComponent(id), {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer '+_ls.access_token, 'apikey': _engDb.supabaseKey }
              }).catch(function(e){ console.error('Erro ao remover de controle_concursos:', e); });
            })();
            showToast({
                type: 'info',
                title: 'Removido dos acompanhados',
                message: concurso ? `Você não receberá mais alertas sobre ${concurso.orgao}.` : ''
            });
        } else {
            state.acompanhando.add(id);
            localStorage.setItem('eng_acompanhando', JSON.stringify([...state.acompanhando]));
            if (btn) {
                btn.classList.add('is-active');
                btn.querySelector('.btn-watch-label').textContent = 'Acompanhando';
                const iconBtn2 = btn.querySelector('i[data-lucide]') || btn.querySelector('svg');
                if (iconBtn2 && iconBtn2.tagName === 'I') { iconBtn2.setAttribute('data-lucide', 'check'); }
            }
                        // Supabase: salvar em controle_concursos (via fetch direto)
            if (concurso) {
              var _ls2 = (function(){ try { var s=JSON.parse(localStorage.getItem('sb-xyvsihpdfgnihgomdntb-auth-token')); return (s&&s.access_token&&s.user)?s:null; } catch(e){return null;} })();
              if (_ls2) {
                fetch(_engDb.supabaseUrl+'/rest/v1/controle_concursos', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer '+_ls2.access_token, 'apikey': _engDb.supabaseKey, 'Prefer': 'return=minimal,resolution=merge-duplicates' },
                  body: JSON.stringify({ user_id: _ls2.user.id, concurso_id: id, banca: concurso.banca, orgao: concurso.orgao, cargo: concurso.cargo, vagas: concurso.vagas, salario: String(concurso.salario), data_inscricao: concurso.inscricoesAte, situacao: 'nao', data_prova: null, data_isencao: null, gabarito: null })
                }).catch(function(e){ console.error('Erro ao salvar em controle_concursos:', e); });
              }
            }
            showToast({
                type: 'success',
                title: 'Concurso acompanhado!',
                message: concurso
                    ? `Você receberá alertas sobre ${concurso.orgao} — ${concurso.cargo}.`
                    : 'Você receberá notificações sobre este concurso.'
            });
            setTimeout(() => { window.location.href = 'controle.html'; }, 1200);
        }
        refreshIcons();
        const fav = document.querySelector(`[data-fav-id="${id}"]`);
        if (fav) {
            fav.classList.toggle('is-active', state.acompanhando.has(id));
            const iconFav = fav.querySelector('i[data-lucide]') || fav.querySelector('svg');
            if (iconFav && iconFav.tagName === 'I') {
              iconFav.setAttribute('data-lucide', state.acompanhando.has(id) ? 'bookmark-check' : 'bookmark');
              refreshIcons();
            }
        }
    }

    function toggleAvisar(id, btn) {
        const isAtivo = btn.classList.toggle('is-active');
        const label = btn.querySelector('.btn-watch-label');
        const icon = btn.querySelector('i');
        if (isAtivo) {
            label.textContent = 'Aviso ativo';
            icon.setAttribute('data-lucide', 'check');
            showToast({
                type: 'success',
                title: 'Aviso ativado',
                message: 'Você será notificado assim que o edital for publicado.'
            });
        } else {
            label.textContent = 'Avisar quando sair';
            icon.setAttribute('data-lucide', 'bell-plus');
            showToast({
                type: 'info',
                title: 'Aviso desativado',
                message: 'Você não receberá mais alertas sobre este edital.'
            });
        }
        refreshIcons();
    }

    const modal = {
        el: null,
        init() {
            this.el = $('#modal');
            if (!this.el) return;
            $$('[data-modal-open]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tab = btn.getAttribute('data-modal-open');
                    this.open(tab);
                });
            });
            $('#modal-close').addEventListener('click', () => this.close());
            this.el.addEventListener('click', (e) => {
                if (e.target === this.el) this.close();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.el.classList.contains('is-open')) this.close();
            });
            $$('.modal-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    this.switchTab(tab.getAttribute('data-tab'));
                });
            });
            $('#form-login').addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = e.target.querySelector('button[type="submit"]');
                const email = e.target.email.value;
                const senha = e.target.senha.value;
                btn.textContent = 'Entrando...';
                btn.disabled = true;
                const { error } = await db.auth.signInWithPassword({ email, password: senha });
                btn.textContent = 'Entrar';
                btn.disabled = false;
                if (error) {
                    showToast({ type: 'error', title: 'Erro ao entrar', message: 'E-mail ou senha incorretos.' });
                    return;
                }
                this.close();
                showToast({ type: 'success', title: 'Bem-vindo de volta!', message: 'Login realizado com sucesso.' });
                setTimeout(() => { window.location.href = 'controle.html'; }, 1200);
            });
            $('#form-cadastro').addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = e.target.querySelector('button[type="submit"]');
                const nome = e.target.nome.value.trim();
                const email = e.target.email.value;
                const senha = e.target.senha.value;
                btn.textContent = 'Criando conta...';
                btn.disabled = true;
                const { error } = await db.auth.signUp({
                    email, password: senha,
                    options: { data: { nome_completo: nome } }
                });
                btn.textContent = 'Criar conta gratuita';
                btn.disabled = false;
                if (error) {
                    showToast({ type: 'error', title: 'Erro ao criar conta', message: error.message });
                    return;
                }
                this.close();
                showToast({ type: 'success', title: `Conta criada, ${nome.split(' ')[0]}!`, message: 'Verifique seu e-mail para confirmar o cadastro.' });
            });
        },
        open(tab = 'login') {
            this.el.classList.add('is-open');
            this.el.setAttribute('aria-hidden', 'false');
            this.switchTab(tab);
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                const input = this.el.querySelector(`#content-${tab} input`);
                if (input) input.focus();
            }, 100);
        },
        close() {
            this.el.classList.remove('is-open');
            this.el.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        },
        switchTab(tabName) {
            $$('.modal-tab').forEach(t => {
                t.classList.toggle('is-active', t.getAttribute('data-tab') === tabName);
            });
            $$('.modal-content').forEach(c => c.classList.add('hidden'));
            const active = $(`#content-${tabName}`);
            if (active) active.classList.remove('hidden');
        }
    };

    function initMenuMobile() {
        const btn = $('#btn-menu');
        const nav = $('#nav-mobile');
        if (!btn || !nav) return;
        btn.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('is-open');
            btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            btn.querySelector('i').setAttribute('data-lucide', isOpen ? 'x' : 'menu');
            refreshIcons();
        });
        nav.querySelectorAll('a, button').forEach(el => {
            el.addEventListener('click', () => {
                nav.classList.remove('is-open');
                btn.setAttribute('aria-expanded', 'false');
                btn.querySelector('i').setAttribute('data-lucide', 'menu');
                refreshIcons();
            });
        });
    }

        function syncAcompanhandoFromDB() {
        const _ls = JSON.parse(localStorage.getItem('sb-xyvsihpdfgnihgomdntb-auth-token') || 'null');
        if (!_ls || !_ls.user) return;
        fetch(_engDb.supabaseUrl + '/rest/v1/controle_concursos?select=concurso_id&user_id=eq.' + _ls.user.id, {
            headers: {
                'Authorization': 'Bearer ' + _ls.access_token,
                'apikey': _engDb.supabaseKey
            }
        }).then(r => r.json()).then(rows => {
            if (!Array.isArray(rows)) return;
            const ids = rows.map(r => r.concurso_id).filter(Boolean);
            state.acompanhando = new Set(ids);
            localStorage.setItem('eng_acompanhando', JSON.stringify(ids));
            renderGrid();
        }).catch(() => {});
    }

    function initDelegation() {
        document.addEventListener('click', (e) => {
            const watchBtn = e.target.closest('[data-watch-id]');
            if (watchBtn) {
if (watchBtn.querySelector('.btn-watch-label')) { toggleAcompanhar(watchBtn.getAttribute('data-watch-id'), watchBtn); }
                return;
            }
            const favBtn = e.target.closest('[data-fav-id]');
            if (favBtn) {
                const id = favBtn.getAttribute('data-fav-id');
                const cardWatchBtn = document.querySelector(`[data-watch-id="${id}"]`);
                toggleAcompanhar(id, cardWatchBtn);
                return;
            }
            const detailsBtn = e.target.closest('[data-details-id]');
            if (detailsBtn) {
                const id = detailsBtn.getAttribute('data-details-id');
                const concurso = CONCURSOS.find(c => c.id === id);
                showToast({
                    type: 'info',
                    title: 'Página de detalhes',
                    message: concurso ? `Abrindo detalhes de ${concurso.orgao} — ${concurso.cargo}.` : 'Em breve.'
                });
                return;
            }
            const watchPrev = e.target.closest('.btn-watch[data-id]');
            if (watchPrev) {
                toggleAvisar(watchPrev.getAttribute('data-id'), watchPrev);
                return;
            }
        });
    }

    function initFilters() {
        $$('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                $$('.chip').forEach(c => c.classList.remove('chip-active'));
                chip.classList.add('chip-active');
                state.filtroArea = chip.getAttribute('data-filter');
                renderGrid();
                const target = $('#concursos');
                if (target && state.filtroArea !== 'todos') {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
        const form = $('#search-form');
        const input = $('#search-input');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            state.textoBusca = input.value;
            renderGrid();
            $('#concursos').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        let debounceTimer;
        input.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                state.textoBusca = input.value;
                renderGrid();
            }, 300);
        });
        $('#sort-select').addEventListener('change', (e) => {
            state.ordenacao = e.target.value;
            renderGrid();
        });
    }

    function buildNotifPanel() {
        const existing = document.getElementById('notif-dropdown');
        if (existing) { existing.remove(); return null; }

        const cards = Array.from(document.querySelectorAll('.card'));
        const followed = cards
            .filter(card => card.textContent.includes('Acompanhando'))
            .map(card => {
                const orgao = card.querySelector('.card-org') ? card.querySelector('.card-org').textContent.trim() : '';
                const cargo = card.querySelector('.card-title') ? card.querySelector('.card-title').textContent.trim() : '';
                const deadline = card.querySelector('.card-deadline') ? card.querySelector('.card-deadline').textContent.trim() : '';
                const statusBadge = card.querySelector('.badge');
                const status = statusBadge ? statusBadge.textContent.trim() : '';
                const daysMatch = deadline.match(/(\d+)\s+dias?/);
                const daysLeft = daysMatch ? parseInt(daysMatch[1]) : null;
                const encerrada = deadline.includes('encerradas');
                return { orgao, cargo, deadline, status, daysLeft, encerrada };
            })
            .filter(c => !c.encerrada)
            .sort((a, b) => (a.daysLeft ?? 999) - (b.daysLeft ?? 999));

        const items = followed.map(c => {
            let icon, cls, text;
            if (c.daysLeft !== null && c.daysLeft <= 7) {
                icon = '\u26a0\ufe0f';
                cls = 'notif-item-urgent';
                text = `<strong>${c.orgao}</strong> &mdash; prazo encerrando em ${c.daysLeft} dia${c.daysLeft === 1 ? '' : 's'}!`;
            } else if (c.status === 'Novo') {
                icon = '\ud83c\udd95';
                cls = 'notif-item-new';
                text = `<strong>${c.orgao}</strong> &mdash; novo edital: ${c.cargo}.`;
            } else {
                icon = '\u2139\ufe0f';
                cls = 'notif-item-info';
                text = `<strong>${c.orgao}</strong> &mdash; ${c.deadline}.`;
            }
            const urgentStyle = cls === 'notif-item-urgent' ? 'background:#fff7ed;border-left:3px solid #f97316;' : '';
            const newStyle = cls === 'notif-item-new' ? 'background:#f0fdf4;border-left:3px solid #22c55e;' : '';
            return `<div class="notif-item ${cls}" style="display:flex;align-items:flex-start;gap:10px;padding:12px 16px;border-bottom:1px solid #f3f4f6;font-size:14px;line-height:1.4;${urgentStyle}${newStyle}">
                <span>${icon}</span><span>${text}</span>
            </div>`;
        }).join('');

        const emptyMsg = followed.length === 0
            ? '<div style="padding:24px 16px;color:#6b7280;font-size:14px;text-align:center;">Voc\u00ea n\u00e3o est\u00e1 acompanhando nenhum concurso. Clique em \ud83d\udd14 nos cards para acompanhar.</div>'
            : '';

        const panel = document.createElement('div');
        panel.id = 'notif-dropdown';
        panel.style.cssText = 'position:fixed;top:60px;right:16px;width:340px;max-width:calc(100vw - 32px);background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.15);z-index:9999;font-family:inherit;overflow:hidden;';
        panel.innerHTML =
            `<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid #e5e7eb;background:#1e2a3a;color:#fff;">
                <strong>Seus concursos (${followed.length} ativo${followed.length !== 1 ? 's' : ''})</strong>
                <button id="notif-close-btn" style="background:none;border:none;color:#fff;cursor:pointer;font-size:18px;padding:0 4px;line-height:1;" aria-label="Fechar">&times;</button>
            </div>
            <div style="max-height:360px;overflow-y:auto;">${items || emptyMsg}</div>`;

        document.body.appendChild(panel);

        panel.querySelector('#notif-close-btn').addEventListener('click', e => {
            e.stopPropagation();
            panel.remove();
        });

        setTimeout(() => {
            const outsideHandler = e => {
                if (!panel.contains(e.target) && !e.target.closest('#btn-notif')) {
                    panel.remove();
                    document.removeEventListener('click', outsideHandler);
                }
            };
            document.addEventListener('click', outsideHandler);
        }, 100);

        return panel;
    }

    function updateNotifBadge() {
        const badge = document.querySelector('.notif-badge');
        if (!badge) return;
        const cards = Array.from(document.querySelectorAll('.card'));
        const followed = cards.filter(card => card.textContent.includes('Acompanhando'));
        const urgent = followed.filter(card => {
            const deadline = card.querySelector('.card-deadline') ? card.querySelector('.card-deadline').textContent : '';
            const m = deadline.match(/(\d+)\s+dias?/);
            return m && parseInt(m[1]) <= 7;
        });
        badge.textContent = urgent.length > 0 ? urgent.length : followed.length;
        badge.style.background = urgent.length > 0 ? '#f97316' : '#6b7280';
    }

    function initBoasVindas() {
        updateNotifBadge();

        const cards = Array.from(document.querySelectorAll('.card'));
        const urgentFollowed = cards.filter(card => {
            if (!card.textContent.includes('Acompanhando')) return false;
            const deadline = card.querySelector('.card-deadline') ? card.querySelector('.card-deadline').textContent : '';
            const m = deadline.match(/(\d+)\s+dias?/);
            return m && parseInt(m[1]) <= 7;
        });

        if (urgentFollowed.length > 0) {
            setTimeout(() => {
                const orgao = urgentFollowed[0].querySelector('.card-org') ? urgentFollowed[0].querySelector('.card-org').textContent.trim() : '';
                const deadline = urgentFollowed[0].querySelector('.card-deadline') ? urgentFollowed[0].querySelector('.card-deadline').textContent.trim() : '';
                const m = deadline.match(/(\d+)\s+dias?/);
                const dias = m ? m[1] : '?';
                showToast({
                    type: 'warning',
                    title: 'Prazo se encerrando!',
                    message: `${orgao}  inscri��es encerram em ${dias} dia${dias === '1' ? '' : 's'}.`,
                    duration: 6000
                });
            }, 1500);
        }

        const btnNotif = $('#btn-notif');
        if (btnNotif) {
            btnNotif.addEventListener('click', e => {
                e.stopPropagation();
                buildNotifPanel();
                updateNotifBadge();
            });
        }
    }

    
    async function loadConcursos() {
        try {
            const db = window._engDb;
            if (!db) { renderGrid(); return; }
            const { data, error } = await db
                .from('concursos')
                .select('*')
                .eq('secao', 'aberto')
                .neq('homologado', true)
                .order('created_at', { ascending: false });
            if (error || !data) { renderGrid(); return; }
            CONCURSOS = data.map(function(c) {
                var dias = c.inscricoes_ate ? Math.round((new Date(c.inscricoes_ate) - new Date()) / 86400000) : 999;
                var badge = dias < 0 ? 'encerrado' : dias <= 7 ? 'encerrando' : c.fase === 'Inscrições abertas' ? 'aberto' : 'novo';
                return {
                    id: String(c.id),
                    orgao: c.orgao || '',
                    cargo: c.cargo || '',
                    area: c.area || '',
                    areaLabel: c.area_label || c.area || '',
                    banca: c.banca || '',
                    estado: c.uf || '',
                    vagas: c.vagas || 0,
                    salario: parseFloat(c.salario) || 0,
                    inscricoesAte: c.inscricoes_ate || '',
                    statusBadge: badge,
                    statusLabel: badge === 'encerrando' ? 'Encerrando' : badge === 'encerrado' ? 'Encerrado' : badge === 'novo' ? 'Novo' : 'Aberto',
                    link_edital: c.link_edital || '',
                    isHighlight: c.destacar === true
                };
            });
        } catch(e) {
            console.error('Erro ao carregar concursos:', e);
        }
        renderGrid();
    }

    function init() {
        if (window.lucide) window.lucide.createIcons();
        loadConcursos();
        modal.init();
        initMenuMobile();
        initDelegation();
        initFilters();
        initBoasVindas();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* ============================================================
       SUPABASE AUTH — Session check + dropdown
       ============================================================ */
    function buildUserDropdown(user) {
        const wrap = document.getElementById('user-greeting-wrap');
        if (!wrap || wrap.hasChildNodes()) return;
        const btnEntrar    = document.querySelector('[data-modal-open="login"]');
        const btnCadastro  = document.querySelector('[data-modal-open="cadastro"]');
        const navMinhaArea = document.querySelector('.nav-minha-area');
        const meta         = user.user_metadata || {};
        const nomeCompleto = meta.nome_completo || user.email;
        const primeiro     = nomeCompleto.split(' ')[0];
        const iniciais     = nomeCompleto.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const fotoUrl      = meta.foto_url || null;

        if (btnEntrar)    btnEntrar.style.display  = 'none';
        if (btnCadastro)  btnCadastro.style.display = 'none';
        if (navMinhaArea) navMinhaArea.style.fontWeight = '700';

        const av = fotoUrl
            ? `<img src="${fotoUrl}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;">`
            : `<span style="width:28px;height:28px;border-radius:50%;background:#F4801A;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#fff;">${iniciais}</span>`;

        wrap.innerHTML = `
        <div style="position:relative;">
          <div id="ub" style="display:flex;align-items:center;gap:8px;background:rgba(26,46,74,0.06);border:1px solid #e2e8f0;border-radius:20px;padding:4px 12px 4px 6px;cursor:pointer;">
            ${av}
            <span style="font-size:13px;font-weight:500;color:#1A2E4A;">Olá, ${primeiro} 👋</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div id="ud" style="display:none;position:absolute;top:calc(100% + 8px);right:0;background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.12);width:220px;z-index:9999;overflow:hidden;">
            <div style="padding:12px 16px;border-bottom:1px solid #e2e8f0;background:#f8fafc;">
              <div style="font-weight:600;font-size:13px;color:#1A2E4A;">${nomeCompleto}</div>
              <div style="font-size:11px;color:#64748b;overflow:hidden;text-overflow:ellipsis;">${user.email}</div>
            </div>
            <a href="controle.html" style="display:flex;align-items:center;gap:10px;padding:11px 16px;font-size:13px;color:#1A2E4A;text-decoration:none;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background=''">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Minha área
            </a>
            <button id="btnConfigIndex" style="display:flex;align-items:center;gap:10px;padding:11px 16px;font-size:13px;color:#1A2E4A;background:none;border:none;width:100%;cursor:pointer;text-align:left;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background=''">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Configurações da conta
            </button>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:4px 0;">
            <button id="btnSairIndex" style="display:flex;align-items:center;gap:10px;padding:11px 16px;font-size:13px;color:#b91c1c;background:none;border:none;width:100%;cursor:pointer;" onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background=''">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sair
            </button>
          </div>
        </div>`;

        wrap.style.display = 'flex';

        document.getElementById('ub').addEventListener('click', e => {
            e.stopPropagation();
            const dd = document.getElementById('ud');
            dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', () => {
            const dd = document.getElementById('ud');
            if (dd) dd.style.display = 'none';
        }, { once: false });

        // LOGOUT — limpa localStorage diretamente (signOut via rede falha no plano free)
        document.getElementById('btnSairIndex').addEventListener('click', () => {
            localStorage.clear();
            window.location.reload();
        });

        // Listener Configurações da conta (index)
        const btnCfgIdx = document.getElementById('btnConfigIndex');
        if (btnCfgIdx) {
            btnCfgIdx.addEventListener('click', () => {
                const dd = document.getElementById('ud');
                if (dd) dd.style.display = 'none';
                openConfigModal('perfil');
            });
        }
    }

    function clearUserDropdown() {
        const wrap        = document.getElementById('user-greeting-wrap');
        const btnEntrar   = document.querySelector('[data-modal-open="login"]');
        const btnCadastro = document.querySelector('[data-modal-open="cadastro"]');
        if (btnEntrar)   { btnEntrar.style.display = ''; btnEntrar.textContent = 'Entrar'; }
        if (btnCadastro)   btnCadastro.style.display = '';
        if (wrap)        { wrap.innerHTML = ''; wrap.style.display = 'none'; }
    }

    if (typeof getUser === 'function') {
        getUser().then(user => { if (user) buildUserDropdown(user);
                // Sync estado acompanhando com o banco
                syncAcompanhandoFromDB(); });
    }

    if (typeof onAuthChange === 'function') {
        onAuthChange(user => {
            if (user) buildUserDropdown(user);
            else clearUserDropdown();
        });
    }

    (function() {
        const p = new URLSearchParams(window.location.search);
        if (p.get('login') === '1') {
            setTimeout(() => {
                modal.open('login');
                showToast({ type: 'info', title: 'Acesso restrito', message: 'Faça login para acessar sua área.' });
                window.history.replaceState({}, '', window.location.pathname);
            }, 400);
        }
    })();


/* ===== MODAL CONFIGURAÇÕES DA CONTA — PÁGINA INICIAL ===== */
(function() {

function injectConfigModalStyles() {
    if (document.getElementById('cfg-modal-styles')) return;
    const css = `
.cfg-backdrop{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;align-items:center;justify-content:center;padding:20px}
.cfg-backdrop.open{display:flex}
.cfg-modal{background:#fff;border-radius:14px;width:100%;max-width:500px;box-shadow:0 12px 40px rgba(0,0,0,.18);overflow:hidden;display:flex;flex-direction:column;max-height:90vh;font-family:'Inter',sans-serif}
.cfg-header{display:flex;justify-content:space-between;align-items:center;padding:20px 24px 0}
.cfg-title{font-family:'Montserrat',sans-serif;font-size:17px;font-weight:700;color:#1A2E4A}
.cfg-tabs{display:flex;padding:0 24px;margin-top:16px;border-bottom:2px solid #e2e8f0}
.cfg-tab{padding:10px 16px;font-size:13px;font-weight:500;color:#64748b;cursor:pointer;border:none;background:none;border-bottom:2px solid transparent;margin-bottom:-2px;transition:color .15s,border-color .15s;display:flex;align-items:center;gap:6px;white-space:nowrap}
.cfg-tab:hover{color:#1A2E4A}
.cfg-tab.active{color:#F4801A;border-bottom-color:#F4801A;font-weight:600}
.cfg-body{padding:24px;overflow-y:auto;flex:1}
.cfg-panel{display:none}.cfg-panel.active{display:block}
.cfg-field{margin-bottom:16px}
.cfg-field label{display:block;font-size:12px;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px}
.cfg-field input{width:100%;padding:10px 12px;font-size:13px;font-family:'Inter',sans-serif;border:1.5px solid #e2e8f0;border-radius:8px;color:#1A2E4A;outline:none;transition:border-color .15s;box-sizing:border-box}
.cfg-field input:focus{border-color:#F4801A}
.cfg-field input:disabled{background:#f8fafc;color:#94a3b8;cursor:not-allowed}
.cfg-field small{display:block;font-size:11px;color:#94a3b8;margin-top:4px}
.cfg-section-title{font-size:12px;font-weight:700;color:#1A2E4A;text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px;margin-top:4px}
.cfg-footer{display:flex;justify-content:flex-end;gap:10px;padding:16px 24px;border-top:1px solid #e2e8f0;background:#f8fafc}
.cfg-btn-cancel{padding:9px 20px;border:1.5px solid #e2e8f0;border-radius:8px;background:transparent;color:#475569;font-size:13px;font-weight:500;cursor:pointer}
.cfg-btn-cancel:hover{background:#f1f5f9}
.cfg-btn-save{padding:9px 22px;background:#F4801A;border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:600;cursor:pointer}
.cfg-btn-save:hover{background:#e07016}
.cfg-btn-save:disabled{opacity:.6;cursor:not-allowed}
.cfg-pwd-strength{height:4px;border-radius:2px;background:#e2e8f0;margin-top:6px;overflow:hidden}
.cfg-pwd-bar{height:100%;border-radius:2px;transition:width .3s,background .3s;width:0}
.cfg-avatar-wrap{display:flex;flex-direction:column;align-items:center;gap:12px;margin-bottom:20px}
.cfg-avatar-preview{width:80px;height:80px;border-radius:50%;background:#F4801A;display:flex;align-items:center;justify-content:center;font-family:'Montserrat',sans-serif;font-size:28px;font-weight:700;color:#fff;overflow:hidden;border:3px solid #e2e8f0}
.cfg-avatar-preview img{width:100%;height:100%;object-fit:cover}
.cfg-btn-foto{display:inline-flex;align-items:center;gap:6px;padding:7px 16px;border:1.5px solid #1A2E4A;border-radius:8px;background:transparent;color:#1A2E4A;font-size:13px;font-weight:500;cursor:pointer}
.cfg-btn-foto:hover{background:#f1f5f9}
.cfg-premium-box{background:linear-gradient(135deg,#1A2E4A 0%,#2d4a7a 100%);border-radius:12px;padding:20px;color:#fff;margin-bottom:16px}
.cfg-premium-box h4{font-size:15px;font-weight:700;margin:0 0 6px;font-family:'Montserrat',sans-serif}
.cfg-premium-box p{font-size:12px;color:rgba(255,255,255,.75);margin:0 0 14px;line-height:1.5}
.cfg-btn-premium{display:inline-flex;align-items:center;gap:6px;background:#F4801A;color:#fff;border:none;padding:8px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
.cfg-plan-info{display:flex;align-items:center;gap:10px;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:16px}
`;
    const el = document.createElement('style');
    el.id = 'cfg-modal-styles';
    el.textContent = css;
    document.head.appendChild(el);
}

function injectConfigModalHTML(user) {
    if (document.getElementById('cfgBackdrop')) return;
    const meta = user.user_metadata || {};
    const nome = meta.nome_completo || '';
    const iniciais = nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';
    const fotoUrl = meta.foto_url || null;
    const avatarHTML = fotoUrl
        ? `<img src="${fotoUrl}" alt="Foto">`
        : `<span style="font-size:28px;font-weight:700;color:#fff;font-family:'Montserrat',sans-serif">${iniciais}</span>`;

    const html = `
<div class="cfg-backdrop" id="cfgBackdrop" onclick="if(event.target===this)closeCfg()">
  <div class="cfg-modal">
    <div class="cfg-header">
      <span class="cfg-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F4801A" stroke-width="2" stroke-linecap="round" style="vertical-align:-2px;margin-right:6px;"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        Configurações da conta
      </span>
      <button onclick="closeCfg()" style="background:none;border:none;font-size:18px;color:#94a3b8;cursor:pointer;padding:4px;">&#x2715;</button>
    </div>
    <div class="cfg-tabs">
      <button class="cfg-tab active" data-cfg-tab="perfil" onclick="switchCfgTab('perfil')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>Dados pessoais
      </button>
      <button class="cfg-tab" data-cfg-tab="seguranca" onclick="switchCfgTab('seguranca')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Segurança
      </button>
      <button class="cfg-tab" data-cfg-tab="pagamento" onclick="switchCfgTab('pagamento')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>Pagamento
      </button>
    </div>
    <div class="cfg-body">
      <div class="cfg-panel active" id="cfg-panel-perfil">
        <div class="cfg-avatar-wrap">
          <div class="cfg-avatar-preview" id="cfgAvatarPreview">${avatarHTML}</div>
          <label class="cfg-btn-foto" for="cfgFotoInput">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Alterar foto
          </label>
          <input type="file" id="cfgFotoInput" accept="image/*" style="display:none" onchange="handleCfgFoto(event)">
        </div>
        <p class="cfg-section-title">Informações pessoais</p>
        <div class="cfg-field"><label>Nome completo</label><input type="text" id="cfgNome" value="${nome}" placeholder="Seu nome completo"></div>
        <div class="cfg-field"><label>E-mail atual</label><input type="email" id="cfgEmailAtual" value="${user.email||''}" disabled><small>Para alterar o e-mail, acesse a aba Segurança.</small></div>
        <div class="cfg-field"><label>Área de atuação</label><input type="text" id="cfgArea" value="${meta.area||''}" placeholder="Ex: Engenharia Civil"></div>
      </div>
      <div class="cfg-panel" id="cfg-panel-seguranca">
        <p class="cfg-section-title">Alterar e-mail</p>
        <div class="cfg-field"><label>Novo e-mail</label><input type="email" id="cfgNovoEmail" placeholder="novo@email.com"><small>Um link de confirmação será enviado para o novo endereço.</small></div>
        <div style="margin-bottom:24px;"><button class="cfg-btn-save" onclick="cfgSalvarEmail()" style="width:100%;" id="cfgBtnEmail">Alterar e-mail</button></div>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin-bottom:24px;">
        <p class="cfg-section-title">Alterar senha</p>
        <div class="cfg-field"><label>Nova senha</label><input type="password" id="cfgNovaSenha" placeholder="Mínimo 6 caracteres" oninput="cfgPwdStrength(this.value)"><div class="cfg-pwd-strength"><div class="cfg-pwd-bar" id="cfgPwdBar"></div></div><small id="cfgPwdTxt" style="font-weight:500;margin-top:4px;"></small></div>
        <div class="cfg-field"><label>Confirmar nova senha</label><input type="password" id="cfgConfSenha" placeholder="Repita a nova senha"></div>
        <div><button class="cfg-btn-save" onclick="cfgSalvarSenha()" style="width:100%;" id="cfgBtnSenha">Alterar senha</button></div>
      </div>
      <div class="cfg-panel" id="cfg-panel-pagamento">
        <div class="cfg-plan-info"><div style="width:36px;height:36px;border-radius:50%;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-size:18px;">🎓</div><div><strong style="display:block;font-size:13px;font-weight:700;color:#1A2E4A">Plano Gratuito</strong><span style="font-size:11px;color:#64748b">Acesso aos editais públicos e controle de concursos</span></div></div>
        <div class="cfg-premium-box"><h4>✨ Engs Hub Premium — em breve</h4><p>Alertas instantâneos por e-mail, filtros avançados, histórico completo de bancas e muito mais.</p><button class="cfg-btn-premium" onclick="showToast({type:'success',title:'Em breve!',message:'Você será avisado quando o Premium for lançado.'})">⭐ Quero ser avisado</button></div>
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;"><p style="margin:0;font-size:12px;color:#92400e;line-height:1.5;"><strong>💳 Forma de pagamento</strong><br>A integração com plataforma de pagamento será disponibilizada em breve.</p></div>
      </div>
    </div>
    <div class="cfg-footer" id="cfgFooter">
      <button class="cfg-btn-cancel" onclick="closeCfg()">Cancelar</button>
      <button class="cfg-btn-save" id="cfgBtnSalvar" onclick="cfgSalvarPerfil()">Salvar alterações</button>
    </div>
  </div>
</div>`;
    document.body.insertAdjacentHTML('beforeend', html);

    document.addEventListener('keydown', function(e){
        if(e.key==='Escape'){const bd=document.getElementById('cfgBackdrop');if(bd&&bd.classList.contains('open'))closeCfg();}
    });
}

window._cfgUser = null;

window.openConfigModal = function(tab) {
    if (!window._cfgUser) return;
    const user = window._cfgUser;
    injectConfigModalStyles();
    injectConfigModalHTML(user);
    window.switchCfgTab(tab || 'perfil');
    document.getElementById('cfgBackdrop').classList.add('open');
    document.body.style.overflow = 'hidden';
};

window.closeCfg = function() {
    const bd = document.getElementById('cfgBackdrop');
    if (bd) bd.classList.remove('open');
    document.body.style.overflow = '';
};

window.switchCfgTab = function(t) {
    document.querySelectorAll('.cfg-tab').forEach(el => el.classList.toggle('active', el.getAttribute('data-cfg-tab')===t));
    document.querySelectorAll('.cfg-panel').forEach(el => el.classList.remove('active'));
    const p = document.getElementById('cfg-panel-'+t); if(p) p.classList.add('active');
    const btn = document.getElementById('cfgBtnSalvar');
    if(btn) btn.style.display = (t==='seguranca'||t==='pagamento') ? 'none' : '';
};

window.cfgPwdStrength = function(s) {
    const bar=document.getElementById('cfgPwdBar'), txt=document.getElementById('cfgPwdTxt');
    if(!s){bar.style.width='0';txt.textContent='';return;}
    let sc=0;
    if(s.length>=6)sc++;if(s.length>=10)sc++;if(/[A-Z]/.test(s))sc++;if(/[0-9]/.test(s))sc++;if(/[^A-Za-z0-9]/.test(s))sc++;
    const lv=[{w:'20%',c:'#ef4444',l:'Muito fraca'},{w:'40%',c:'#f97316',l:'Fraca'},{w:'60%',c:'#eab308',l:'Razoável'},{w:'80%',c:'#22c55e',l:'Forte'},{w:'100%',c:'#16a34a',l:'Muito forte'}][Math.max(0,sc-1)];
    bar.style.width=lv.w;bar.style.background=lv.c;txt.textContent=lv.l;txt.style.color=lv.c;
};

window.handleCfgFoto = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2*1024*1024) { showToast({type:'warning',title:'Foto muito grande',message:'Máximo 2MB.'}); return; }
    const reader = new FileReader();
    reader.onload = function(e) {
        const url = e.target.result;
        const preview = document.getElementById('cfgAvatarPreview');
        if (preview) preview.innerHTML = '<img src="'+url+'" alt="Foto">';
        // Atualizar avatar no header da index
        const wrap = document.getElementById('user-greeting-wrap');
        if (wrap) {
            const av = wrap.querySelector('img, span[style*="border-radius:50%"]');
            if (av && av.tagName === 'IMG') av.src = url;
            else {
                const img = document.createElement('img');
                img.src = url;
                img.style.cssText = 'width:28px;height:28px;border-radius:50%;object-fit:cover;';
                if (av) av.replaceWith(img);
            }
        }
        // Salvar no Supabase
        if (typeof db !== 'undefined') db.auth.updateUser({ data: { foto_url: url } });
        if (window._cfgUser) { window._cfgUser.user_metadata = window._cfgUser.user_metadata || {}; window._cfgUser.user_metadata.foto_url = url; }
        showToast({type:'success',title:'Foto atualizada!'});
    };
    reader.readAsDataURL(file);
};

window.cfgSalvarPerfil = async function() {
    const nome = document.getElementById('cfgNome').value.trim();
    const area = document.getElementById('cfgArea').value.trim();
    const btn = document.getElementById('cfgBtnSalvar');
    if (!nome) { showToast({type:'warning',title:'Informe seu nome.'}); return; }
    btn.textContent = 'Salvando...'; btn.disabled = true;
    const res = await db.auth.updateUser({ data: { nome_completo: nome, area } });
    btn.textContent = 'Salvar alterações'; btn.disabled = false;
    if (res.error) { showToast({type:'warning',title:'Erro: '+res.error.message}); return; }
    if (window._cfgUser) { window._cfgUser.user_metadata.nome_completo = nome; window._cfgUser.user_metadata.area = area; }
    // Atualizar header
    const primeiro = nome.split(' ')[0];
    const nameEl = document.querySelector('#user-greeting-wrap span');
    if (nameEl && nameEl.textContent.includes('Olá')) nameEl.textContent = 'Olá, '+primeiro+' 👋';
    const ddName = document.getElementById('user-greeting-wrap');
    if (ddName) {
        const nameSpan = ddName.querySelector('span[style*="font-size:13px"]');
        if (nameSpan) nameSpan.textContent = 'Olá, '+primeiro+' 👋';
    }
    showToast({type:'success',title:'✅ Dados atualizados!'});
    closeCfg();
};

window.cfgSalvarEmail = async function() {
    const e = document.getElementById('cfgNovoEmail').value.trim();
    const btn = document.getElementById('cfgBtnEmail');
    if (!e || !/^[^@]+@[^@]+.[^@]+$/.test(e)) { showToast({type:'warning',title:'E-mail inválido.'}); return; }
    btn.textContent='Enviando...';btn.disabled=true;
    const res = await db.auth.updateUser({ email: e });
    btn.textContent='Alterar e-mail';btn.disabled=false;
    if(res.error){showToast({type:'warning',title:'Erro: '+res.error.message});return;}
    showToast({type:'success',title:'✅ Confirmação enviada para '+e});
    document.getElementById('cfgNovoEmail').value='';
};

window.cfgSalvarSenha = async function() {
    const nova=document.getElementById('cfgNovaSenha').value, conf=document.getElementById('cfgConfSenha').value;
    const btn=document.getElementById('cfgBtnSenha');
    if(!nova||nova.length<6){showToast({type:'warning',title:'Senha mín. 6 caracteres.'});return;}
    if(nova!==conf){showToast({type:'warning',title:'Senhas não coincidem.'});return;}
    btn.textContent='Alterando...';btn.disabled=true;
    const res=await db.auth.updateUser({password:nova});
    btn.textContent='Alterar senha';btn.disabled=false;
    if(res.error){showToast({type:'warning',title:'Erro: '+res.error.message});return;}
    showToast({type:'success',title:'✅ Senha alterada!'});
    document.getElementById('cfgNovaSenha').value='';
    document.getElementById('cfgConfSenha').value='';
    const bar=document.getElementById('cfgPwdBar');if(bar)bar.style.width='0';
    const txt=document.getElementById('cfgPwdTxt');if(txt)txt.textContent='';
};

// Expor o user atual para o modal
if (typeof getUser === 'function') {
    getUser().then(function(user){ if(user) window._cfgUser = user; });
}
if (typeof onAuthChange === 'function') {
    onAuthChange(function(user){ if(user) window._cfgUser = user; });
}

})();

})();
