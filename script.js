// --- BANCO DE DADOS MOCK (localStorage) ---
function inicializarDados() {
    if (!localStorage.getItem('sga_users')) {
        const usuariosPadrao = [{
            email: 'professor@maisunifacisa.com.br',
            senha: '123',
            nome: 'Ana Paula Menezes',
            disciplinas: ['Engenharia de Software'],
            avatar: ''
        }];
        localStorage.setItem('sga_users', JSON.stringify(usuariosPadrao));
    }
    
    if (!localStorage.getItem('sga_classes')) {
        const turmasPadrao = [
            { id: 1, nome: 'Engenharia de Software', periodo: 'ADS 2026.1' },
            { id: 2, nome: 'Banco de Dados II', periodo: 'ADS 2026.1' },
            { id: 3, nome: 'Programação Web', periodo: 'ADS 2026.1' }
        ];
        localStorage.setItem('sga_classes', JSON.stringify(turmasPadrao));
    }
    
    if (!localStorage.getItem('sga_students')) {
        const alunosPadrao = [];
        const nomes = ["Beatriz Andrade", "Carlos Eduardo", "Daniela Ferreira", "Eduardo Nascimento", "Fernanda Melo", "Gustavo Pereira", "Helena Costa", "Igor Santos", "Julia Lima", "Lucas Silva"];
        
        let matricula = 2026104521;
        for (let c = 1; c <= 3; c++) {
            for (let i = 0; i < 10; i++) {
                alunosPadrao.push({
                    id: matricula++,
                    turmaId: c,
                    nome: nomes[i] + ' ' + (c === 1 ? 'Souza' : (c === 2 ? 'Dias' : 'Gomes')),
                    p1: '', p2: '', proj1: '', proj2: '', final: ''
                });
            }
        }
        localStorage.setItem('sga_students', JSON.stringify(alunosPadrao));
    }

    if (!localStorage.getItem('sga_files')) {
        localStorage.setItem('sga_files', JSON.stringify([]));
    }
}
inicializarDados();

// --- ESTADO GLOBAL ---
let usuarioAtual = JSON.parse(sessionStorage.getItem('sga_currentUser'));
if (usuarioAtual) {
    // Compatibilidade com dados anteriores
    usuarioAtual.nome = usuarioAtual.nome || usuarioAtual.name;
    usuarioAtual.senha = usuarioAtual.senha || usuarioAtual.password;
    usuarioAtual.disciplinas = usuarioAtual.disciplinas || usuarioAtual.subjects || [];
}

let turmaAtualId = null;
let paginaAtual = 1;
const ITENS_POR_PAGINA = 5;

// --- UTILITÁRIOS ---
function obterIniciais(nome) {
    if (!nome) return '';
    return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function atualizarAvatares() {
    if (!usuarioAtual) return;
    const iniciais = obterIniciais(usuarioAtual.nome);
    const idsElementos = ['avatar-menu-lateral', 'avatar-cabecalho', 'avatar-perfil'];
    
    idsElementos.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            if (usuarioAtual.avatar) {
                elemento.style.backgroundImage = `url(${usuarioAtual.avatar})`;
                elemento.innerText = '';
            } else {
                elemento.style.backgroundImage = 'none';
                elemento.innerText = iniciais;
            }
        }
    });
}

// Verifica sessão para home.html
if (window.location.pathname.endsWith('home.html') || window.location.pathname.endsWith('home.html/')) {
    if (!usuarioAtual) {
        window.location.href = 'index.html';
    } else {
        const nomeSidebar = document.getElementById('nome-menu-lateral');
        if (nomeSidebar) nomeSidebar.innerText = usuarioAtual.nome;
        atualizarAvatares();
        mostrarSubtela('subtela-turmas');
    }
}

// --- NAVEGAÇÃO DE SUBTELAS (Apenas na Home) ---
function mostrarSubtela(idSubtela) {
    document.querySelectorAll('.subtela').forEach(el => el.classList.remove('ativa'));
    const subtelaAlvo = document.getElementById(idSubtela);
    if (subtelaAlvo) subtelaAlvo.classList.add('ativa');
    
    document.querySelectorAll('.item-navegacao').forEach(el => el.classList.remove('ativo'));
    const itemNav = document.querySelector(`.item-navegacao[data-alvo="${idSubtela}"]`);
    if (itemNav) itemNav.classList.add('ativo');

    const tituloPagina = document.getElementById('titulo-pagina');
    if (tituloPagina) {
        if (idSubtela === 'subtela-turmas') {
            tituloPagina.innerText = 'Minhas turmas';
            renderizarTurmas();
        } else if (idSubtela === 'subtela-perfil') {
            tituloPagina.innerText = 'Meu perfil';
            carregarPerfil();
        } else if (idSubtela === 'subtela-detalhe-turma') {
            tituloPagina.innerText = 'Diário de Notas';
        }
    }
}

// --- LOGIN & CADASTRO ---
const formLogin = document.getElementById('form-login');
if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;
        
        const usuarios = JSON.parse(localStorage.getItem('sga_users')) || [];
        const usuarioEncontrado = usuarios.find(u => u.email === email && (u.senha === senha || u.password === senha));
        
        if (usuarioEncontrado) {
            usuarioEncontrado.nome = usuarioEncontrado.nome || usuarioEncontrado.name;
            usuarioEncontrado.senha = usuarioEncontrado.senha || usuarioEncontrado.password;
            usuarioEncontrado.disciplinas = usuarioEncontrado.disciplinas || usuarioEncontrado.subjects || [];
            
            sessionStorage.setItem('sga_currentUser', JSON.stringify(usuarioEncontrado));
            window.location.href = 'home.html';
        } else {
            alert('Credenciais inválidas!');
        }
    });
}

const formCadastro = document.getElementById('form-cadastro');
if (formCadastro) {
    formCadastro.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('cad-nome').value;
        const email = document.getElementById('cad-email').value;
        const senha = document.getElementById('cad-senha').value;
        const confirmacao = document.getElementById('cad-confirmar-senha').value;
        
        if (senha !== confirmacao) {
            alert('As senhas não coincidem!');
            return;
        }
        
        const usuarios = JSON.parse(localStorage.getItem('sga_users')) || [];
        if (usuarios.find(u => u.email === email)) {
            alert('E-mail já cadastrado!');
            return;
        }
        
        usuarios.push({ nome, email, disciplinas: [], senha, avatar: '' });
        localStorage.setItem('sga_users', JSON.stringify(usuarios));
        alert('Cadastro realizado com sucesso!');
        window.location.href = 'index.html';
    });
}

const btnSair = document.getElementById('btn-sair');
if (btnSair) {
    btnSair.addEventListener('click', () => {
        sessionStorage.removeItem('sga_currentUser');
        window.location.href = 'index.html';
    });
}

// --- MENU LATERAL (Apenas na Home) ---
document.querySelectorAll('.item-navegacao[data-alvo]').forEach(item => {
    item.addEventListener('click', () => {
        mostrarSubtela(item.getAttribute('data-alvo'));
    });
});

// --- TURMAS (Apenas na Home) ---
function renderizarTurmas() {
    const grid = document.getElementById('grid-turmas');
    if (!grid) return;

    const disciplinasUsuario = usuarioAtual.disciplinas || usuarioAtual.subjects || [];
    const turmas = (JSON.parse(localStorage.getItem('sga_classes')) || []).filter(c => {
        const nomeTurma = c.nome || c.name;
        return disciplinasUsuario.includes(nomeTurma);
    });
    
    const alunos = JSON.parse(localStorage.getItem('sga_students')) || [];
    grid.innerHTML = '';
    
    turmas.forEach(turma => {
        const idTurma = turma.id;
        const nomeTurma = turma.nome || turma.name;
        const periodoTurma = turma.periodo || turma.period;
        const qtdAlunos = alunos.filter(a => (a.turmaId || a.classId) === idTurma).length;
        
        const card = document.createElement('div');
        card.className = 'card-turma';
        card.innerHTML = `
            <h3>${nomeTurma}</h3>
            <p>${periodoTurma} • ${qtdAlunos} alunos matriculados</p>
            <div class="rodape-card">
                <span>Abrir turma ></span>
            </div>
        `;
        card.addEventListener('click', () => abrirTurma(turma));
        grid.appendChild(card);
    });
}

function abrirTurma(turma) {
    turmaAtualId = turma.id;
    paginaAtual = 1;
    document.getElementById('detalhe-nome-turma').innerText = turma.nome || turma.name;
    document.getElementById('detalhe-desc-turma').innerText = turma.periodo || turma.period;
    mostrarSubtela('subtela-detalhe-turma');
    renderizarNotas();
    renderizarArquivos();
}

const btnVoltarTurmas = document.getElementById('btn-voltar-turmas');
if (btnVoltarTurmas) {
    btnVoltarTurmas.addEventListener('click', () => {
        mostrarSubtela('subtela-turmas');
    });
}

// --- LÓGICA DE NOTAS (Apenas na Home) ---
function parseNota(valor) {
    if (valor === '' || valor === null || valor === undefined) return null;
    let n = parseFloat(valor);
    if (isNaN(n) || n < 0 || n > 10) return null;
    return n;
}

function atualizarNotasAluno(aluno) {
    let p1 = parseNota(aluno.p1);
    let p2 = parseNota(aluno.p2);
    let proj1 = parseNota(aluno.proj1);
    let proj2 = parseNota(aluno.proj2);
    let final = parseNota(aluno.final);
    
    aluno.media = null;
    aluno.status = '-';
    
    if (p1 !== null && p2 !== null && proj1 !== null && proj2 !== null) {
        let notaIndividual = (p1 + p2) / 2;
        let notaProjeto = (proj1 + proj2) / 2;
        let mediaFinal = (notaIndividual * 0.4) + (notaProjeto * 0.6);
        aluno.media = mediaFinal.toFixed(2);
        
        if (mediaFinal >= 7.0) {
            aluno.status = 'Aprovado';
        } else if (mediaFinal < 7.0 && notaProjeto < 4.0) {
            aluno.status = 'Reprovado';
        } else {
            aluno.status = 'Fará prova final';
            
            if (final !== null) {
                if ((notaProjeto + final) >= 7.0) {
                    aluno.status = 'Aprovado';
                } else {
                    aluno.status = 'Reprovado';
                }
            }
        }
    }
}

function salvarNotas() {
    const alunos = JSON.parse(localStorage.getItem('sga_students')) || [];
    const indice = alunos.findIndex(a => a.id === this.alunoId);
    
    if (indice > -1) {
        let valor = parseFloat(this.elemento.value);
        if (this.elemento.value !== '' && (isNaN(valor) || valor < 0 || valor > 10)) {
            alert('Nota inválida. Digite um valor entre 0 e 10.');
            this.elemento.value = alunos[indice][this.campo];
            return;
        }

        alunos[indice][this.campo] = this.elemento.value;
        atualizarNotasAluno(alunos[indice]);
        localStorage.setItem('sga_students', JSON.stringify(alunos));
        renderizarNotas();
    }
}

function renderizarNotas() {
    const tbody = document.getElementById('tbody-notas');
    if (!tbody) return;

    const todosAlunos = JSON.parse(localStorage.getItem('sga_students')) || [];
    const alunosTurma = todosAlunos.filter(a => (a.turmaId || a.classId) === turmaAtualId);
    
    const totalPaginas = Math.ceil(alunosTurma.length / ITENS_POR_PAGINA);
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const alunosPaginados = alunosTurma.slice(inicio, inicio + ITENS_POR_PAGINA);
    
    tbody.innerHTML = '';
    
    alunosPaginados.forEach(aluno => {
        atualizarNotasAluno(aluno); 
        
        let classeStatus = '';
        if (aluno.status === 'Aprovado') classeStatus = 'status-aprovado';
        if (aluno.status === 'Reprovado') classeStatus = 'status-reprovado';
        if (aluno.status === 'Fará prova final') classeStatus = 'status-final';
        
        const isFaraFinal = aluno.status === 'Fará prova final';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${aluno.id}</td>
            <td>${aluno.nome || aluno.name}</td>
            <td><input type="number" step="0.1" min="0" max="10" class="input-nota" data-id="${aluno.id}" data-campo="p1" value="${aluno.p1}"></td>
            <td><input type="number" step="0.1" min="0" max="10" class="input-nota" data-id="${aluno.id}" data-campo="p2" value="${aluno.p2}"></td>
            <td><input type="number" step="0.1" min="0" max="10" class="input-nota" data-id="${aluno.id}" data-campo="proj1" value="${aluno.proj1}"></td>
            <td><input type="number" step="0.1" min="0" max="10" class="input-nota" data-id="${aluno.id}" data-campo="proj2" value="${aluno.proj2}"></td>
            <td><strong>${aluno.media || '-'}</strong></td>
            <td><span class="badge-status ${classeStatus}">${aluno.status}</span></td>
            <td><input type="number" step="0.1" min="0" max="10" class="input-nota" data-id="${aluno.id}" data-campo="final" value="${aluno.final}" ${isFaraFinal || (aluno.final !== '' && aluno.media < 7.0 && parseNota(aluno.proj1) !== null && parseNota(aluno.proj2) !== null && ((parseNota(aluno.proj1) + parseNota(aluno.proj2)) / 2) >= 4.0) ? '' : 'disabled'}></td>
        `;
        tbody.appendChild(tr);
    });
    
    document.querySelectorAll('.input-nota').forEach(input => {
        input.addEventListener('blur', function() {
            const alunoId = parseInt(this.getAttribute('data-id'));
            const campo = this.getAttribute('data-campo');
            salvarNotas.call({ alunoId, campo, elemento: this });
        });
    });
    
    renderizarPaginacao(totalPaginas);
}

function renderizarPaginacao(totalPaginas) {
    const containerPaginacao = document.getElementById('paginacao');
    if (!containerPaginacao) return;
    
    containerPaginacao.innerHTML = '';
    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement('button');
        btn.className = `btn-pagina ${i === paginaAtual ? 'ativo' : ''}`;
        btn.innerText = i;
        btn.onclick = () => { paginaAtual = i; renderizarNotas(); };
        containerPaginacao.appendChild(btn);
    }
}

// --- ARQUIVOS (Apenas na Home) ---
const uploadArquivo = document.getElementById('upload-arquivo');
if (uploadArquivo) {
    uploadArquivo.addEventListener('change', function(e) {
        const arquivo = e.target.files[0];
        if (!arquivo) return;
        if (arquivo.type !== 'application/pdf') {
            alert('Apenas arquivos PDF são permitidos.');
            return;
        }
        
        const leitor = new FileReader();
        leitor.onload = function(evt) {
            const base64 = evt.target.result;
            const arquivos = JSON.parse(localStorage.getItem('sga_files')) || [];
            try {
                arquivos.push({
                    id: Date.now(),
                    turmaId: turmaAtualId,
                    nome: arquivo.name,
                    dados: base64,
                    dataCriacao: new Date().toLocaleDateString()
                });
                localStorage.setItem('sga_files', JSON.stringify(arquivos));
                renderizarArquivos();
            } catch (err) {
                alert('Erro ao salvar. O arquivo pode ser muito grande para o armazenamento local.');
            }
        };
        leitor.readAsDataURL(arquivo);
        e.target.value = '';
    });
}

function renderizarArquivos() {
    const ul = document.getElementById('lista-arquivos');
    if (!ul) return;
    
    const todosArquivos = JSON.parse(localStorage.getItem('sga_files')) || [];
    const arquivosTurma = todosArquivos.filter(f => (f.turmaId || f.classId) === turmaAtualId);
    
    ul.innerHTML = '';
    
    if (arquivosTurma.length === 0) {
        ul.innerHTML = '<li>Nenhum arquivo anexado.</li>';
        return;
    }
    
    arquivosTurma.forEach(arq => {
        const nomeArquivo = arq.nome || arq.name;
        const dadosArquivo = arq.dados || arq.data;
        const dataArquivo = arq.dataCriacao || arq.date || '';
        
        const li = document.createElement('li');
        li.innerHTML = `
            <span><i class="fas fa-file-pdf" style="color:var(--vermelho); margin-right:8px;"></i> ${nomeArquivo} <small>(${dataArquivo})</small></span>
            <div>
                <a href="${dadosArquivo}" download="${nomeArquivo}" style="margin-right: 15px;"><i class="fas fa-download"></i> Baixar</a>
                <a href="#" onclick="excluirArquivo(${arq.id}); return false;" style="color: var(--vermelho);"><i class="fas fa-trash"></i> Excluir</a>
            </div>
        `;
        ul.appendChild(li);
    });
}

function excluirArquivo(id) {
    if (confirm('Tem certeza que deseja excluir este arquivo?')) {
        let arquivos = JSON.parse(localStorage.getItem('sga_files')) || [];
        arquivos = arquivos.filter(f => f.id !== id);
        localStorage.setItem('sga_files', JSON.stringify(arquivos));
        renderizarArquivos();
    }
}

// --- PERFIL (Apenas na Home) ---
function carregarPerfil() {
    const profNome = document.getElementById('prof-nome');
    if (!profNome) return;

    profNome.value = usuarioAtual.nome;
    document.getElementById('prof-email').value = usuarioAtual.email;
    document.getElementById('prof-senha').value = '';
    document.getElementById('prof-confirmar-senha').value = '';
    
    const checkboxes = document.querySelectorAll('#prof-disciplinas input[type="checkbox"]');
    const disciplinasUsuario = usuarioAtual.disciplinas || usuarioAtual.subjects || [];
    checkboxes.forEach(cb => {
        cb.checked = disciplinasUsuario.includes(cb.value);
    });
}

const formPerfil = document.getElementById('form-perfil');
if (formPerfil) {
    formPerfil.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const usuarios = JSON.parse(localStorage.getItem('sga_users')) || [];
        const idx = usuarios.findIndex(u => u.email === usuarioAtual.email);
        
        const novoEmail = document.getElementById('prof-email').value;
        const novaSenha = document.getElementById('prof-senha').value;
        const confirmarSenha = document.getElementById('prof-confirmar-senha').value;
        
        if (novoEmail !== usuarioAtual.email) {
            if (usuarios.find(u => u.email === novoEmail)) {
                alert('Este e-mail já está em uso por outro professor.');
                return;
            }
        }
        
        if (novaSenha) {
            if (novaSenha !== confirmarSenha) {
                alert('As novas senhas não coincidem!');
                return;
            }
            usuarioAtual.senha = novaSenha;
        }

        usuarioAtual.nome = document.getElementById('prof-nome').value;
        usuarioAtual.email = novoEmail;
        
        const checkboxes = document.querySelectorAll('#prof-disciplinas input[type="checkbox"]:checked');
        usuarioAtual.disciplinas = Array.from(checkboxes).map(cb => cb.value);
        
        if (idx > -1) {
            usuarios[idx] = usuarioAtual;
        } else {
            usuarios.push(usuarioAtual);
        }
        localStorage.setItem('sga_users', JSON.stringify(usuarios));
        sessionStorage.setItem('sga_currentUser', JSON.stringify(usuarioAtual));
        
        const nomeSidebar = document.getElementById('nome-menu-lateral');
        if (nomeSidebar) nomeSidebar.innerText = usuarioAtual.nome;
        atualizarAvatares();
        alert('Perfil atualizado com sucesso!');
        renderizarTurmas();
        
        document.getElementById('prof-senha').value = '';
        document.getElementById('prof-confirmar-senha').value = '';
    });
}

const uploadAvatar = document.getElementById('upload-avatar');
if (uploadAvatar) {
    uploadAvatar.addEventListener('change', function(e) {
        const arquivo = e.target.files[0];
        if (!arquivo) return;
        
        const leitor = new FileReader();
        leitor.onload = function(evt) {
            try {
                usuarioAtual.avatar = evt.target.result;
                const usuarios = JSON.parse(localStorage.getItem('sga_users')) || [];
                const idx = usuarios.findIndex(u => u.email === usuarioAtual.email);
                if (idx > -1) {
                    usuarios[idx].avatar = usuarioAtual.avatar;
                    localStorage.setItem('sga_users', JSON.stringify(usuarios));
                }
                sessionStorage.setItem('sga_currentUser', JSON.stringify(usuarioAtual));
                atualizarAvatares();
            } catch (err) {
                alert('A imagem é muito grande para ser salva no armazenamento local.');
            }
        };
        leitor.readAsDataURL(arquivo);
        e.target.value = '';
    });
}

const btnRemoverAvatar = document.getElementById('btn-remover-avatar');
if (btnRemoverAvatar) {
    btnRemoverAvatar.addEventListener('click', () => {
        usuarioAtual.avatar = '';
        const usuarios = JSON.parse(localStorage.getItem('sga_users')) || [];
        const idx = usuarios.findIndex(u => u.email === usuarioAtual.email);
        if (idx > -1) {
            usuarios[idx].avatar = '';
            localStorage.setItem('sga_users', JSON.stringify(usuarios));
        }
        sessionStorage.setItem('sga_currentUser', JSON.stringify(usuarioAtual));
        atualizarAvatares();
    });
}
