/* ============================================================
   ENG HUBS Ã¢ÂÂ Script principal (Vanilla JS)
   ============================================================ */
(function () {
    'use strict';

    const CONCURSOS = [
        {
            id: 'c1',
            orgao: 'TCE-SP',
            cargo: 'Auditor de Controle Externo Ã¢ÂÂ Engenharia',
            area: 'engenharia-civil',
            areaLabel: 'Engenharia Civil',
            banca: 'VUNESP',
            estado: 'SP',
            vagas: 12,
            salario: 23110,
            inscricoesAte: '2026-07-15',
            statusBadge: 'novo',
            statusLabel: 'Novo',
            isHighlight: true
        },
        {
            id: 'c2',
            orgao: 'Prefeitura de CamboriÃÂº/SC',
            cargo: 'Engenheiro Civil',
            area: 'engenharia-civil',
            areaLabel: 'Engenharia Civil',
            banca: 'FEPESE',
            estado: 'SC',
            vagas: 4,
            salario: 8940,
            inscricoesAte: '2026-05-28',
            statusBadge: 'encerrando',
            statusLabel: 'Encerrando'
        },
        {
            id: 'c3',
            orgao: 'TCM-SP',
            cargo: 'Auditor de Controle Externo Ã¢ÂÂ Arquitetura',
            area: 'arquitetura',
            areaLabel: 'Arquitetura',
            banca: 'FGV',
            estado: 'SP',
            vagas: 6,
            salario: 21500,
            inscricoesAte: '2026-06-30',
            statusBadge: 'aberto',
            statusLabel: 'Aberto'
        },
        {
            id: 'c4',
            orgao: 'CREA-PR',
            cargo: 'Engenheiro Eletricista',
            area: 'eletrica',
            areaLabel: 'Engenharia ElÃÂ©trica',
            banca: 'IBFC',
            estado: 'PR',
            vagas: 3,
            salario: 9870,
            inscricoesAte: '2026-06-10',
            statusBadge: 'aberto',
            statusLabel: 'Aberto'
        },
        {
            id: 'c5',
            orgao: 'IBAMA',
            cargo: 'Analista Ambiental Ã¢ÂÂ Engenharia',
            area: 'ambiental',
            areaLabel: 'Engenharia Ambiental',
            banca: 'CEBRASPE',
            estado: 'Nacional',
            vagas: 40,
            salario: 11070,
            inscricoesAte: '2026-08-20',
            statusBadge: 'aberto',
            statusLabel: 'Aberto'
        },
        {
            id: 'c6',
            orgao: 'INCRA',
            cargo: 'Engenheiro AgrÃÂ´nomo',
            area: 'agronomia',
            areaLabel: 'Agronomia',
            banca: 'CEBRASPE',
            estado: 'Nacional',
            vagas: 25,
            salario: 14560,
            inscricoesAte: '2026-06-05',
            statusBadge: 'encerrando',
            statusLabel: 'Encerrando'
        },
        {
            id: 'c7',
            orgao: 'Prefeitura de Curitiba/PR',
            cargo: 'Arquiteto e Urbanista',
            area: 'arquitetura',
            areaLabel: 'Arquitetura',
            banca: 'FAFIPA',
            estado: 'PR',
            vagas: 8,
            salario: 9230,
            inscricoesAte: '2026-07-02',
            statusBadge: 'novo',
            statusLabel: 'Novo'
        },
        {
            id: 'c8',
            orgao: 'TJ-RS',
            cargo: 'Analista JudiciÃÂ¡rio Ã¢ÂÂ Engenharia Civil',
            area: 'engenharia-civil',
            areaLabel: 'Engenharia Civil',
            banca: 'FAURGS',
            estado: 'RS',
            vagas: 5,
            salario: 13780,
            inscricoesAte: '2026-07-25',
            statusBadge: 'aberto',
            statusLabel: 'Aberto'
        },
        {
            id: 'c9',
            orgao: 'CAU/BR',
            cargo: 'Arquiteto e Urbanista Ã¢ÂÂ FiscalizaÃÂ§ÃÂ£o',
            area: 'arquitetura',
            areaLabel: 'Arquitetura',
            banca: 'IADES',
            estado: 'DF',
            vagas: 10,
            salario: 12450,
            inscricoesAte: '2026-08-10',
            statusBadge: 'aberto',
            statusLabel: 'Aberto'
        }
    ];

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
            textoPrazo = `<strong>ÃÂltimo dia para inscriÃÂ§ÃÂ£o!</strong>`;
        } else {
            textoPrazo = `InscriÃÂ§ÃÂµes atÃÂ© <strong>${formatData(c.inscricoesAte)}</strong> ÃÂ· ${dias} dia${dias > 1 ? 's' : ''}`;
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
                        <span class="card-info-label">RemuneraÃÂ§ÃÂ£o</span>
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
                <div class="toast-title">${title || 'NotificaÃÂ§ÃÂ£o'}</div>
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
            <button class="toast-close" aria-label="Fechar notificaÃÂ§ÃÂ£o">
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
                        // Supabase: remove de controle_concursos
            if (typeof db !== 'undefined') {
                db.auth.getSession().then(function(res) {
                    var user = res.data && res.data.session && res.data.session.user;
                    if (user) {
                        db.from('controle_concursos')
                            .delete()
                            .match({ user_id: user.id, concurso_id: id })
                            .then(function(r) { if (r.error) console.error('Erro ao remover de controle_concursos:', r.error); });
                    }
                });
            }
            showToast({
                type: 'info',
                title: 'Removido dos acompanhados',
                message: concurso ? `VocÃÂª nÃÂ£o receberÃÂ¡ mais alertas sobre ${concurso.orgao}.` : ''
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
                        // Supabase: salvar em controle_concursos com dados do concurso
            if (typeof db !== 'undefined' && concurso) {
                db.auth.getSession().then(function(res) {
                    var user = res.data && res.data.session && res.data.session.user;
                    if (user) {
                        db.from('controle_concursos')
                            .upsert({
                                user_id:        user.id,
                                concurso_id:    id,
                                banca:          concurso.banca,
                                orgao:          concurso.orgao,
                                cargo:          concurso.cargo,
                                vagas:          concurso.vagas,
                                salario:        String(concurso.salario),
                                data_inscricao: concurso.inscricoesAte,
                                situacao:       'nao',
                                data_prova:     null,
                                data_isencao:   null,
                                gabarito:       null
                            }, { onConflict: 'user_id,concurso_id' })
                            .then(function(r) { if (r.error) console.error('Erro ao salvar em controle_concursos:', r.error); });
                    }
                });
            }
            showToast({
                type: 'success',
                title: 'Concurso acompanhado!',
                message: concurso
                    ? `VocÃÂª receberÃÂ¡ alertas sobre ${concurso.orgao} Ã¢ÂÂ ${concurso.cargo}.`
                    : 'VocÃÂª receberÃÂ¡ notificaÃÂ§ÃÂµes sobre este concurso.'
            });
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
                message: 'VocÃÂª serÃÂ¡ notificado assim que o edital for publicado.'
            });
        } else {
            label.textContent = 'Avisar quando sair';
            icon.setAttribute('data-lucide', 'bell-plus');
            showToast({
                type: 'info',
                title: 'Aviso desativado',
                message: 'VocÃÂª nÃÂ£o receberÃÂ¡ mais alertas sobre este edital.'
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
                    title: 'PÃÂ¡gina de detalhes',
                    message: concurso ? `Abrindo detalhes de ${concurso.orgao} Ã¢ÂÂ ${concurso.cargo}.` : 'Em breve.'
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

    function initBoasVindas() {
        setTimeout(() => {
            showToast({
                type: 'default',
                title: '3 novos editais publicados',
                message: 'Confira as oportunidades atualizadas hoje.',
                duration: 6000
            });
        }, 1500);
        const btnNotif = $('#btn-notif');
        if (btnNotif) {
            btnNotif.addEventListener('click', () => {
                showToast({
                    type: 'info',
                    title: 'Central de notificaÃÂ§ÃÂµes',
                    message: 'VocÃÂª tem 3 alertas: TCE-SP iminente, novo edital DNIT e prazo encerrando no INCRA.'
                });
            });
        }
    }

    function init() {
        if (window.lucide) window.lucide.createIcons();
        renderGrid();
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
       SUPABASE AUTH Ã¢ÂÂ Session check + dropdown
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
            <span style="font-size:13px;font-weight:500;color:#1A2E4A;">OlÃÂ¡, ${primeiro} Ã°ÂÂÂ</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div id="ud" style="display:none;position:absolute;top:calc(100% + 8px);right:0;background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.12);width:220px;z-index:9999;overflow:hidden;">
            <div style="padding:12px 16px;border-bottom:1px solid #e2e8f0;background:#f8fafc;">
              <div style="font-weight:600;font-size:13px;color:#1A2E4A;">${nomeCompleto}</div>
              <div style="font-size:11px;color:#64748b;overflow:hidden;text-overflow:ellipsis;">${user.email}</div>
            </div>
            <a href="controle.html" style="display:flex;align-items:center;gap:10px;padding:11px 16px;font-size:13px;color:#1A2E4A;text-decoration:none;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background=''">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Minha ÃÂ¡rea
            </a>
            <button id="btnConfigIndex" style="display:flex;align-items:center;gap:10px;padding:11px 16px;font-size:13px;color:#1A2E4A;background:none;border:none;width:100%;cursor:pointer;text-align:left;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background=''">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              ConfiguraÃÂ§ÃÂµes da conta
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

        // LOGOUT Ã¢ÂÂ limpa localStorage diretamente (signOut via rede falha no plano free)
        document.getElementById('btnSairIndex').addEventListener('click', () => {
            localStorage.clear();
            window.location.reload();
        });

        // Listener ConfiguraÃÂ§ÃÂµes da conta (index)
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
        getUser().then(user => { if (user) buildUserDropdown(user); });
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
                showToast({ type: 'info', title: 'Acesso restrito', message: 'FaÃÂ§a login para acessar sua ÃÂ¡rea.' });
                window.history.replaceState({}, '', window.location.pathname);
            }, 400);
        }
    })();


/* ===== MODAL CONFIGURAÃÂÃÂES DA CONTA Ã¢ÂÂ PÃÂGINA INICIAL ===== */
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
        ConfiguraÃÂ§ÃÂµes da conta
      </span>
      <button onclick="closeCfg()" style="background:none;border:none;font-size:18px;color:#94a3b8;cursor:pointer;padding:4px;">&#x2715;</button>
    </div>
    <div class="cfg-tabs">
      <button class="cfg-tab active" data-cfg-tab="perfil" onclick="switchCfgTab('perfil')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>Dados pessoais
      </button>
      <button class="cfg-tab" data-cfg-tab="seguranca" onclick="switchCfgTab('seguranca')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>SeguranÃÂ§a
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
        <p class="cfg-section-title">InformaÃÂ§ÃÂµes pessoais</p>
        <div class="cfg-field"><label>Nome completo</label><input type="text" id="cfgNome" value="${nome}" placeholder="Seu nome completo"></div>
        <div class="cfg-field"><label>E-mail atual</label><input type="email" id="cfgEmailAtual" value="${user.email||''}" disabled><small>Para alterar o e-mail, acesse a aba SeguranÃÂ§a.</small></div>
        <div class="cfg-field"><label>ÃÂrea de atuaÃÂ§ÃÂ£o</label><input type="text" id="cfgArea" value="${meta.area||''}" placeholder="Ex: Engenharia Civil"></div>
      </div>
      <div class="cfg-panel" id="cfg-panel-seguranca">
        <p class="cfg-section-title">Alterar e-mail</p>
        <div class="cfg-field"><label>Novo e-mail</label><input type="email" id="cfgNovoEmail" placeholder="novo@email.com"><small>Um link de confirmaÃÂ§ÃÂ£o serÃÂ¡ enviado para o novo endereÃÂ§o.</small></div>
        <div style="margin-bottom:24px;"><button class="cfg-btn-save" onclick="cfgSalvarEmail()" style="width:100%;" id="cfgBtnEmail">Alterar e-mail</button></div>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin-bottom:24px;">
        <p class="cfg-section-title">Alterar senha</p>
        <div class="cfg-field"><label>Nova senha</label><input type="password" id="cfgNovaSenha" placeholder="MÃÂ­nimo 6 caracteres" oninput="cfgPwdStrength(this.value)"><div class="cfg-pwd-strength"><div class="cfg-pwd-bar" id="cfgPwdBar"></div></div><small id="cfgPwdTxt" style="font-weight:500;margin-top:4px;"></small></div>
        <div class="cfg-field"><label>Confirmar nova senha</label><input type="password" id="cfgConfSenha" placeholder="Repita a nova senha"></div>
        <div><button class="cfg-btn-save" onclick="cfgSalvarSenha()" style="width:100%;" id="cfgBtnSenha">Alterar senha</button></div>
      </div>
      <div class="cfg-panel" id="cfg-panel-pagamento">
        <div class="cfg-plan-info"><div style="width:36px;height:36px;border-radius:50%;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-size:18px;">Ã°ÂÂÂ</div><div><strong style="display:block;font-size:13px;font-weight:700;color:#1A2E4A">Plano Gratuito</strong><span style="font-size:11px;color:#64748b">Acesso aos editais pÃÂºblicos e controle de concursos</span></div></div>
        <div class="cfg-premium-box"><h4>Ã¢ÂÂ¨ Engs Hub Premium Ã¢ÂÂ em breve</h4><p>Alertas instantÃÂ¢neos por e-mail, filtros avanÃÂ§ados, histÃÂ³rico completo de bancas e muito mais.</p><button class="cfg-btn-premium" onclick="showToast({type:'success',title:'Em breve!',message:'VocÃÂª serÃÂ¡ avisado quando o Premium for lanÃÂ§ado.'})">Ã¢Â­Â Quero ser avisado</button></div>
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;"><p style="margin:0;font-size:12px;color:#92400e;line-height:1.5;"><strong>Ã°ÂÂÂ³ Forma de pagamento</strong><br>A integraÃÂ§ÃÂ£o com plataforma de pagamento serÃÂ¡ disponibilizada em breve.</p></div>
      </div>
    </div>
    <div class="cfg-footer" id="cfgFooter">
      <button class="cfg-btn-cancel" onclick="closeCfg()">Cancelar</button>
      <button class="cfg-btn-save" id="cfgBtnSalvar" onclick="cfgSalvarPerfil()">Salvar alteraÃÂ§ÃÂµes</button>
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
    const lv=[{w:'20%',c:'#ef4444',l:'Muito fraca'},{w:'40%',c:'#f97316',l:'Fraca'},{w:'60%',c:'#eab308',l:'RazoÃÂ¡vel'},{w:'80%',c:'#22c55e',l:'Forte'},{w:'100%',c:'#16a34a',l:'Muito forte'}][Math.max(0,sc-1)];
    bar.style.width=lv.w;bar.style.background=lv.c;txt.textContent=lv.l;txt.style.color=lv.c;
};

window.handleCfgFoto = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2*1024*1024) { showToast({type:'warning',title:'Foto muito grande',message:'MÃÂ¡ximo 2MB.'}); return; }
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
    btn.textContent = 'Salvar alteraÃÂ§ÃÂµes'; btn.disabled = false;
    if (res.error) { showToast({type:'warning',title:'Erro: '+res.error.message}); return; }
    if (window._cfgUser) { window._cfgUser.user_metadata.nome_completo = nome; window._cfgUser.user_metadata.area = area; }
    // Atualizar header
    const primeiro = nome.split(' ')[0];
    const nameEl = document.querySelector('#user-greeting-wrap span');
    if (nameEl && nameEl.textContent.includes('OlÃÂ¡')) nameEl.textContent = 'OlÃÂ¡, '+primeiro+' Ã°ÂÂÂ';
    const ddName = document.getElementById('user-greeting-wrap');
    if (ddName) {
        const nameSpan = ddName.querySelector('span[style*="font-size:13px"]');
        if (nameSpan) nameSpan.textContent = 'OlÃÂ¡, '+primeiro+' Ã°ÂÂÂ';
    }
    showToast({type:'success',title:'Ã¢ÂÂ Dados atualizados!'});
    closeCfg();
};

window.cfgSalvarEmail = async function() {
    const e = document.getElementById('cfgNovoEmail').value.trim();
    const btn = document.getElementById('cfgBtnEmail');
    if (!e || !/^[^@]+@[^@]+.[^@]+$/.test(e)) { showToast({type:'warning',title:'E-mail invÃÂ¡lido.'}); return; }
    btn.textContent='Enviando...';btn.disabled=true;
    const res = await db.auth.updateUser({ email: e });
    btn.textContent='Alterar e-mail';btn.disabled=false;
    if(res.error){showToast({type:'warning',title:'Erro: '+res.error.message});return;}
    showToast({type:'success',title:'Ã¢ÂÂ ConfirmaÃÂ§ÃÂ£o enviada para '+e});
    document.getElementById('cfgNovoEmail').value='';
};

window.cfgSalvarSenha = async function() {
    const nova=document.getElementById('cfgNovaSenha').value, conf=document.getElementById('cfgConfSenha').value;
    const btn=document.getElementById('cfgBtnSenha');
    if(!nova||nova.length<6){showToast({type:'warning',title:'Senha mÃÂ­n. 6 caracteres.'});return;}
    if(nova!==conf){showToast({type:'warning',title:'Senhas nÃÂ£o coincidem.'});return;}
    btn.textContent='Alterando...';btn.disabled=true;
    const res=await db.auth.updateUser({password:nova});
    btn.textContent='Alterar senha';btn.disabled=false;
    if(res.error){showToast({type:'warning',title:'Erro: '+res.error.message});return;}
    showToast({type:'success',title:'Ã¢ÂÂ Senha alterada!'});
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
