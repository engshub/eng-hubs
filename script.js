/* ============================================================
   ENG HUBS — Script principal (Vanilla JS)
   Funcionalidades:
   1. Renderização dinâmica de cards de concursos
   2. Filtros por área + busca textual + ordenação
   3. Botão "Acompanhar" com troca de estado (toggle)
   4. Modal de Login / Cadastro com tabs
   5. Sistema de toast/notificações
   6. Menu mobile responsivo
   ============================================================ */

(function () {
    'use strict';

    /* ============================================================
       1. BASE DE DADOS FICTÍCIA — concursos abertos
       Em produção, viria de uma API. Aqui é estático para demo.
       ============================================================ */
    const CONCURSOS = [
        {
            id: 'c1',
            orgao: 'TCE-SP',
            cargo: 'Auditor de Controle Externo — Engenharia',
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
            orgao: 'Prefeitura de Camboriú/SC',
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
            cargo: 'Auditor de Controle Externo — Arquitetura',
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
            areaLabel: 'Engenharia Elétrica',
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
            cargo: 'Analista Ambiental — Engenharia',
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
            cargo: 'Engenheiro Agrônomo',
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
            cargo: 'Analista Judiciário — Engenharia Civil',
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
            cargo: 'Arquiteto e Urbanista — Fiscalização',
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

    /* Estado da aplicação (em memória) */
    const state = {
        filtroArea: 'todos',
        textoBusca: '',
        ordenacao: 'prazo',
        acompanhando: new Set()  // ids de concursos sendo acompanhados
    };


    /* ============================================================
       2. UTILITÁRIOS
       ============================================================ */

    /** Formata número como moeda BRL */
    function formatBRL(valor) {
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    /** Calcula dias restantes até uma data ISO (YYYY-MM-DD) */
    function diasRestantes(dataISO) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const alvo = new Date(dataISO + 'T00:00:00');
        const diff = Math.ceil((alvo - hoje) / (1000 * 60 * 60 * 24));
        return diff;
    }

    /** Formata data ISO para "dd/mm/yyyy" */
    function formatData(dataISO) {
        const d = new Date(dataISO + 'T00:00:00');
        return d.toLocaleDateString('pt-BR');
    }

    /** Atalho seguro para querySelector */
    function $(sel, ctx = document) { return ctx.querySelector(sel); }
    function $$(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }

    /** Re-inicializa os ícones Lucide após inserção dinâmica de HTML */
    function refreshIcons() {
        if (window.lucide) window.lucide.createIcons();
    }


    /* ============================================================
       3. RENDERIZAÇÃO DE CARDS
       ============================================================ */

    /** Gera o HTML de um card de concurso */
    function renderCard(c) {
        const dias = diasRestantes(c.inscricoesAte);
        const isAcompanhando = state.acompanhando.has(c.id);

        // Badge primária baseada no status
        const badgeClass =
            c.statusBadge === 'encerrando' ? 'badge-encerrando' :
            c.statusBadge === 'novo' ? 'badge-novo' :
            'badge-aberto';

        const iconStatus =
            c.statusBadge === 'encerrando' ? 'alarm-clock' :
            c.statusBadge === 'novo' ? 'sparkles' :
            'check-circle-2';

        // Texto do prazo (com destaque para urgência)
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

    /** Aplica filtros + ordenação e re-renderiza a grid */
    function renderGrid() {
        const grid = $('#cards-grid');
        const empty = $('#empty-state');
        if (!grid) return;

        // 1. Filtra por área
        let lista = state.filtroArea === 'todos'
            ? CONCURSOS.slice()
            : CONCURSOS.filter(c => c.area === state.filtroArea);

        // 2. Filtra por texto da busca (cargo, orgao, banca, estado)
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

        // 3. Ordena
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

        // 4. Renderiza ou exibe estado vazio
        if (lista.length === 0) {
            grid.innerHTML = '';
            empty.classList.remove('hidden');
        } else {
            empty.classList.add('hidden');
            grid.innerHTML = lista.map(renderCard).join('');
        }

        refreshIcons();
    }


    /* ============================================================
       4. SISTEMA DE TOAST (notificações simuladas)
       ============================================================ */

    /**
     * Exibe um toast no canto inferior direito.
     * @param {object} opts - { title, message, type, duration }
     *   type: 'default' | 'success' | 'info' | 'warning'
     */
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

        // Remoção animada
        const remove = () => {
            toast.classList.add('toast-out');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        };

        toast.querySelector('.toast-close').addEventListener('click', remove);
        setTimeout(remove, duration);
    }


    /* ============================================================
       5. AÇÃO: ACOMPANHAR CONCURSO (toggle de estado)
       ============================================================ */

    function toggleAcompanhar(id, btn) {
        const concurso = CONCURSOS.find(c => c.id === id);
        const isAtivo = state.acompanhando.has(id);

        if (isAtivo) {
            // Desacompanhar
            state.acompanhando.delete(id);
            if (btn) {
                btn.classList.remove('is-active');
                btn.querySelector('.btn-watch-label').textContent = 'Acompanhar';
                btn.querySelector('i').setAttribute('data-lucide', 'bell-plus');
            }
            showToast({
                type: 'info',
                title: 'Removido dos acompanhados',
                message: concurso ? `Você não receberá mais alertas sobre ${concurso.orgao}.` : ''
            });
        } else {
            // Acompanhar
            state.acompanhando.add(id);
            if (btn) {
                btn.classList.add('is-active');
                btn.querySelector('.btn-watch-label').textContent = 'Acompanhando';
                btn.querySelector('i').setAttribute('data-lucide', 'check');
            }
            showToast({
                type: 'success',
                title: 'Concurso acompanhado!',
                message: concurso
                    ? `Você receberá alertas sobre ${concurso.orgao} — ${concurso.cargo}.`
                    : 'Você receberá notificações sobre este concurso.'
            });
        }
        refreshIcons();

        // Sincroniza o ícone de favorito (estrela/bookmark) no card
        const fav = document.querySelector(`[data-fav-id="${id}"]`);
        if (fav) {
            fav.classList.toggle('is-active', state.acompanhando.has(id));
            fav.querySelector('i').setAttribute('data-lucide',
                state.acompanhando.has(id) ? 'bookmark-check' : 'bookmark');
            refreshIcons();
        }
    }

    /** Versão para os cards "previstos" (botão Avisar quando sair) */
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


    /* ============================================================
       6. MODAL (Login / Cadastro)
       ============================================================ */

    const modal = {
        el: null,
        init() {
            this.el = $('#modal');
            if (!this.el) return;

            // Botões que abrem o modal (em qualquer tab)
            $$('[data-modal-open]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tab = btn.getAttribute('data-modal-open');
                    this.open(tab);
                });
            });

            // Fechar pelo X
            $('#modal-close').addEventListener('click', () => this.close());

            // Fechar clicando fora
            this.el.addEventListener('click', (e) => {
                if (e.target === this.el) this.close();
            });

            // Fechar com ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.el.classList.contains('is-open')) this.close();
            });

            // Tabs internas
            $$('.modal-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    this.switchTab(tab.getAttribute('data-tab'));
                });
            });

            // Submissão de formulários (simulada)
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
                    email,
                    password: senha,
                    options: { data: { nome_completo: nome } }
                });
                btn.textContent = 'Criar conta gratuita';
                btn.disabled = false;
                if (error) {
                    showToast({ type: 'error', title: 'Erro ao criar conta', message: error.message });
                    return;
                }
                this.close();
                showToast({
                    type: 'success',
                    title: `Conta criada, ${nome.split(' ')[0]}!`,
                    message: 'Verifique seu e-mail para confirmar o cadastro.'
                });
            });
        },

        open(tab = 'login') {
            this.el.classList.add('is-open');
            this.el.setAttribute('aria-hidden', 'false');
            this.switchTab(tab);
            document.body.style.overflow = 'hidden';
            // Foco no primeiro campo após abrir
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
            // Atualiza visual das tabs
            $$('.modal-tab').forEach(t => {
                t.classList.toggle('is-active', t.getAttribute('data-tab') === tabName);
            });
            // Mostra conteúdo correspondente
            $$('.modal-content').forEach(c => c.classList.add('hidden'));
            const active = $(`#content-${tabName}`);
            if (active) active.classList.remove('hidden');
        }
    };


    /* ============================================================
       7. MENU MOBILE
       ============================================================ */

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

        // Fecha o menu ao clicar em um link
        nav.querySelectorAll('a, button').forEach(el => {
            el.addEventListener('click', () => {
                nav.classList.remove('is-open');
                btn.setAttribute('aria-expanded', 'false');
                btn.querySelector('i').setAttribute('data-lucide', 'menu');
                refreshIcons();
            });
        });
    }


    /* ============================================================
       8. EVENT DELEGATION (cards são re-renderizados)
       ============================================================ */

    function initDelegation() {
        document.addEventListener('click', (e) => {
            // Acompanhar concurso (cards principais)
            const watchBtn = e.target.closest('[data-watch-id]');
            if (watchBtn) {
                toggleAcompanhar(watchBtn.getAttribute('data-watch-id'), watchBtn);
                return;
            }

            // Favoritar via ícone bookmark
            const favBtn = e.target.closest('[data-fav-id]');
            if (favBtn) {
                const id = favBtn.getAttribute('data-fav-id');
                const cardWatchBtn = document.querySelector(`[data-watch-id="${id}"]`);
                toggleAcompanhar(id, cardWatchBtn);
                return;
            }

            // Detalhes do concurso (placeholder)
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

            // Botão "Avisar quando sair" dos previstos
            const watchPrev = e.target.closest('.btn-watch[data-id]');
            if (watchPrev) {
                toggleAvisar(watchPrev.getAttribute('data-id'), watchPrev);
                return;
            }
        });
    }


    /* ============================================================
       9. FILTROS, BUSCA E ORDENAÇÃO
       ============================================================ */

    function initFilters() {
        // Chips de área
        $$('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                $$('.chip').forEach(c => c.classList.remove('chip-active'));
                chip.classList.add('chip-active');
                state.filtroArea = chip.getAttribute('data-filter');
                renderGrid();
                // Scroll suave para a seção (UX)
                const target = $('#concursos');
                if (target && state.filtroArea !== 'todos') {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Busca textual
        const form = $('#search-form');
        const input = $('#search-input');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            state.textoBusca = input.value;
            renderGrid();
            $('#concursos').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        // Busca em tempo real (debounce simples)
        let debounceTimer;
        input.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                state.textoBusca = input.value;
                renderGrid();
            }, 300);
        });

        // Ordenação
        $('#sort-select').addEventListener('change', (e) => {
            state.ordenacao = e.target.value;
            renderGrid();
        });
    }


    /* ============================================================
       10. NOTIFICAÇÕES SIMULADAS DE BOAS-VINDAS
       ============================================================ */

    function initBoasVindas() {
        // Notificação inicial após 1.5s
        setTimeout(() => {
            showToast({
                type: 'default',
                title: '3 novos editais publicados',
                message: 'Confira as oportunidades atualizadas hoje.',
                duration: 6000
            });
        }, 1500);

        // Botão de sino do header dispara notificação
        const btnNotif = $('#btn-notif');
        if (btnNotif) {
            btnNotif.addEventListener('click', () => {
                showToast({
                    type: 'info',
                    title: 'Central de notificações',
                    message: 'Você tem 3 alertas: TCE-SP iminente, novo edital DNIT e prazo encerrando no INCRA.'
                });
            });
        }
    }


    /* ============================================================
       11. INICIALIZAÇÃO
       ============================================================ */

    function init() {
        // Inicializa ícones Lucide
        if (window.lucide) window.lucide.createIcons();

        renderGrid();
        modal.init();
        initMenuMobile();
        initDelegation();
        initFilters();
        initBoasVindas();
    }

    // Aguarda DOM pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Atualiza UI conforme estado de login
    if (typeof onAuthChange === 'function') {
        onAuthChange((user) => {
            const btnEntrar   = document.querySelector('[data-modal-open="login"]');
            const btnCadastro = document.querySelector('[data-modal-open="cadastro"]');
            const navMinhaArea = document.querySelector('.nav-minha-area');
            if (user) {
                if (btnEntrar)   btnEntrar.textContent = 'Sair';
                if (btnEntrar)   btnEntrar.onclick = async (e) => {
                    e.preventDefault();
                    await db.auth.signOut();
                    showToast({ type: 'info', title: 'Até logo!', message: 'Você saiu da sua conta.' });
                };
                if (btnCadastro) btnCadastro.style.display = 'none';
                if (navMinhaArea) navMinhaArea.style.fontWeight = '700';
            } else {
                if (btnEntrar)   btnEntrar.textContent = 'Entrar';
                if (btnCadastro) btnCadastro.style.display = '';
            }
        });
    }

})();
