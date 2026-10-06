// --- DATABASE MOCK (localStorage) ---
function initData() {
    if (!localStorage.getItem('sga_users')) {
        const defaultUsers = [{
            email: 'professor@maisunifacisa.com.br',
            password: '123',
            name: 'Ana Paula Menezes',
            subject: 'Engenharia de Software',
            avatar: ''
        }];
        localStorage.setItem('sga_users', JSON.stringify(defaultUsers));
    }
    
    if (!localStorage.getItem('sga_classes')) {
        const defaultClasses = [
            { id: 1, name: 'Engenharia de Software', period: 'ADS 2026.1' },
            { id: 2, name: 'Banco de Dados II', period: 'ADS 2026.1' },
            { id: 3, name: 'Programação Web', period: 'ADS 2026.1' }
        ];
        localStorage.setItem('sga_classes', JSON.stringify(defaultClasses));
    }
    
    if (!localStorage.getItem('sga_students')) {
        const defaultStudents = [];
        const nomes = ["Beatriz Andrade", "Carlos Eduardo", "Daniela Ferreira", "Eduardo Nascimento", "Fernanda Melo", "Gustavo Pereira", "Helena Costa", "Igor Santos", "Julia Lima", "Lucas Silva"];
        
        let mat = 2026104521;
        for(let c=1; c<=3; c++) {
            for(let i=0; i<10; i++) {
                defaultStudents.push({
                    id: mat++,
                    classId: c,
                    name: nomes[i] + ' ' + (c === 1 ? 'Souza' : (c === 2 ? 'Dias' : 'Gomes')),
                    p1: '', p2: '', proj1: '', proj2: '', final: ''
                });
            }
        }
        localStorage.setItem('sga_students', JSON.stringify(defaultStudents));
    }

    if (!localStorage.getItem('sga_files')) {
        localStorage.setItem('sga_files', JSON.stringify([]));
    }
}
initData();

// --- ESTADO GLOBAL ---
let currentUser = null;
let currentClassId = null;
let currentPage = 1;
const ITEMS_PER_PAGE = 5;

// --- NAVEGAÇÃO VIEWS ---
function showView(viewId) {
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}

function showSubView(subViewId) {
    document.querySelectorAll('.sub-view').forEach(el => el.classList.remove('active'));
    document.getElementById(subViewId).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[data-target="${subViewId}"]`);
    if(navItem) navItem.classList.add('active');

    if(subViewId === 'classes-list-view') {
        document.getElementById('page-title').innerText = 'Minhas turmas';
        renderClasses();
    } else if (subViewId === 'profile-view') {
        document.getElementById('page-title').innerText = 'Meu perfil';
        loadProfile();
    } else if (subViewId === 'class-detail-view') {
        document.getElementById('page-title').innerText = 'Diário de Notas';
    }
}

// --- UTILS ---
function getInitials(name) {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function updateAvatars() {
    if(!currentUser) return;
    const inits = getInitials(currentUser.name);
    const elements = ['sidebar-avatar', 'header-avatar', 'profile-avatar'];
    elements.forEach(id => {
        const el = document.getElementById(id);
        if(currentUser.avatar) {
            el.style.backgroundImage = `url(${currentUser.avatar})`;
            el.innerText = '';
        } else {
            el.style.backgroundImage = 'none';
            el.innerText = inits;
        }
    });
}

// --- LOGIN & REGISTRO ---
document.getElementById('link-register').addEventListener('click', (e) => {
    e.preventDefault();
    showView('register-view');
});
document.getElementById('link-login').addEventListener('click', (e) => {
    e.preventDefault();
    showView('login-view');
});

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    
    const users = JSON.parse(localStorage.getItem('sga_users'));
    const user = users.find(u => u.email === email && u.password === pass);
    
    if(user) {
        currentUser = user;
        document.getElementById('sidebar-name').innerText = user.name;
        updateAvatars();
        showView('home-view');
        showSubView('classes-list-view');
    } else {
        alert('Credenciais inválidas!');
    }
});

document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const subject = document.getElementById('reg-subject').value;
    const pass = document.getElementById('reg-password').value;
    const conf = document.getElementById('reg-confirm').value;
    
    if(pass !== conf) {
        alert('As senhas não coincidem!');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('sga_users'));
    if(users.find(u => u.email === email)) {
        alert('E-mail já cadastrado!');
        return;
    }
    
    users.push({ name, email, subject, password: pass, avatar: '' });
    localStorage.setItem('sga_users', JSON.stringify(users));
    alert('Cadastro realizado com sucesso!');
    showView('login-view');
    document.getElementById('register-form').reset();
});

document.getElementById('btn-logout').addEventListener('click', () => {
    currentUser = null;
    document.getElementById('login-form').reset();
    showView('login-view');
});

// --- MENU LATERAL ---
document.querySelectorAll('.nav-item[data-target]').forEach(item => {
    item.addEventListener('click', () => {
        showSubView(item.getAttribute('data-target'));
    });
});

// --- TURMAS ---
function renderClasses() {
    const classes = JSON.parse(localStorage.getItem('sga_classes')).filter(c => c.profEmail === currentUser.email);
    const students = JSON.parse(localStorage.getItem('sga_students'));
    const grid = document.getElementById('classes-grid');
    grid.innerHTML = '';
    
    classes.forEach(cls => {
        const qtd = students.filter(s => s.classId === cls.id).length;
        const card = document.createElement('div');
        card.className = 'class-card';
        card.innerHTML = `
            <h3>${cls.name}</h3>
            <p>${cls.period} • ${qtd} alunos matriculados</p>
            <div class="card-footer">
                <span>Abrir turma ></span>
            </div>
        `;
        card.addEventListener('click', () => openClass(cls));
        grid.appendChild(card);
    });
}

function openClass(cls) {
    currentClassId = cls.id;
    currentPage = 1;
    document.getElementById('detail-class-name').innerText = cls.name;
    document.getElementById('detail-class-desc').innerText = cls.period;
    showSubView('class-detail-view');
    renderGrades();
    renderFiles();
}

document.getElementById('btn-back-classes').addEventListener('click', () => {
    showSubView('classes-list-view');
});

// --- LÓGICA DE NOTAS ---
function parseNota(val) {
    if(val === '' || val === null || val === undefined) return null;
    let n = parseFloat(val);
    if(isNaN(n) || n < 0 || n > 10) return null;
    return n;
}

function updateStudentGrades(student) {
    let p1 = parseNota(student.p1);
    let p2 = parseNota(student.p2);
    let proj1 = parseNota(student.proj1);
    let proj2 = parseNota(student.proj2);
    let final = parseNota(student.final);
    
    student.media = null;
    student.status = '-';
    
    // Regra 7.1 - Composição da avaliação
    if(p1 !== null && p2 !== null && proj1 !== null && proj2 !== null) {
        let notaIndividual = (p1 + p2) / 2;
        let notaProjeto  = (proj1 + proj2) / 2;
        let mediaFinal = (notaIndividual * 0.4) + (notaProjeto   * 0.6);
        student.media = mediaFinal.toFixed(2);
        
        // Regra 7.2 - Definição do status
        if(mediaFinal >= 7.0) {
            student.status = 'Aprovado';
        } else if(mediaFinal < 7.0 && notaProjeto    < 4.0) {
            student.status = 'Reprovado';
        } else {
            student.status = 'Fará prova final';
            
            // Regra 7.3 - Resultado da prova final
            if(final !== null) {
                if((notaProjeto  + final) >= 7.0) {
                    student.status = 'Aprovado';
                } else {
                    student.status = 'Reprovado';
                }
            }
        }
    }
}

function saveGrades() {
    const students = JSON.parse(localStorage.getItem('sga_students'));
    const index = students.findIndex(s => s.id === this.studentId);
    if(index > -1) {
        // Validação básica 0 a 10
        let val = parseFloat(this.el.value);
        if(this.el.value !== '' && (isNaN(val) || val < 0 || val > 10)) {
            alert('Nota inválida. Digite um valor entre 0 e 10.');
            this.el.value = students[index][this.field];
            return;
        }

        students[index][this.field] = this.el.value;
        updateStudentGrades(students[index]);
        localStorage.setItem('sga_students', JSON.stringify(students));
        renderGrades();
    }
}

function renderGrades() {
    const allStudents = JSON.parse(localStorage.getItem('sga_students'));
    const classStudents = allStudents.filter(s => s.classId === currentClassId);
    
    // Paginação
    const totalPages = Math.ceil(classStudents.length / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = classStudents.slice(start, start + ITEMS_PER_PAGE);
    
    const tbody = document.getElementById('grades-tbody');
    tbody.innerHTML = '';
    
    paginated.forEach(s => {
        updateStudentGrades(s); 
        
        let statusClass = '';
        if(s.status === 'Aprovado') statusClass = 'status-aprovado';
        if(s.status === 'Reprovado') statusClass = 'status-reprovado';
        if(s.status === 'Fará prova final') statusClass = 'status-final';
        
        const isFaraFinal = s.status === 'Fará prova final';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${s.id}</td>
            <td>${s.name}</td>
            <td><input type="number" step="0.1" min="0" max="10" class="input-nota" data-id="${s.id}" data-field="p1" value="${s.p1}"></td>
            <td><input type="number" step="0.1" min="0" max="10" class="input-nota" data-id="${s.id}" data-field="p2" value="${s.p2}"></td>
            <td><input type="number" step="0.1" min="0" max="10" class="input-nota" data-id="${s.id}" data-field="proj1" value="${s.proj1}"></td>
            <td><input type="number" step="0.1" min="0" max="10" class="input-nota" data-id="${s.id}" data-field="proj2" value="${s.proj2}"></td>
            <td><strong>${s.media || '-'}</strong></td>
            <td><span class="status-badge ${statusClass}">${s.status}</span></td>
            <td><input type="number" step="0.1" min="0" max="10" class="input-nota" data-id="${s.id}" data-field="final" value="${s.final}" ${isFaraFinal || s.final !== '' && s.media < 7.0 && parseNota(s.proj1)!==null && parseNota(s.proj2)!==null && ((parseNota(s.proj1)+parseNota(s.proj2))/2) >= 4.0 ? '' : 'disabled'}></td>
        `;
        tbody.appendChild(tr);
    });
    
    document.querySelectorAll('.input-nota').forEach(inp => {
        inp.addEventListener('blur', function() {
            const studentId = parseInt(this.getAttribute('data-id'));
            const field = this.getAttribute('data-field');
            saveGrades.call({studentId, field, el: this});
        });
    });
    
    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const pag = document.getElementById('pagination');
    pag.innerHTML = '';
    for(let i=1; i<=totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        btn.innerText = i;
        btn.onclick = () => { currentPage = i; renderGrades(); };
        pag.appendChild(btn);
    }
}

// --- ARQUIVOS (Desafio Extra) ---
document.getElementById('file-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if(!file) return;
    if(file.type !== 'application/pdf') {
        alert('Apenas arquivos PDF são permitidos.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(evt) {
        const base64 = evt.target.result;
        const files = JSON.parse(localStorage.getItem('sga_files')) || [];
        try {
            files.push({
                id: Date.now(),
                classId: currentClassId,
                name: file.name,
                data: base64,
                date: new Date().toLocaleDateString()
            });
            localStorage.setItem('sga_files', JSON.stringify(files));
            renderFiles();
        } catch(err) {
            alert('Erro ao salvar. O arquivo pode ser muito grande para o armazenamento local. O limite do navegador pode ter sido excedido.');
        }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // reseta o input
});

function renderFiles() {
    const allFiles = JSON.parse(localStorage.getItem('sga_files')) || [];
    const classFiles = allFiles.filter(f => f.classId === currentClassId);
    const ul = document.getElementById('files-list');
    ul.innerHTML = '';
    
    if(classFiles.length === 0) {
        ul.innerHTML = '<li>Nenhum arquivo anexado.</li>';
        return;
    }
    
    classFiles.forEach(f => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><i class="fas fa-file-pdf" style="color:var(--vermelho); margin-right:8px;"></i> ${f.name} <small>(${f.date})</small></span>
            <a href="${f.data}" download="${f.name}"><i class="fas fa-download"></i> Baixar</a>
        `;
        ul.appendChild(li);
    });
}

// --- PERFIL ---
function loadProfile() {
    document.getElementById('prof-name').value = currentUser.name;
    document.getElementById('prof-email').value = currentUser.email;
    document.getElementById('prof-subject').value = currentUser.subject;
}

document.getElementById('profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    currentUser.name = document.getElementById('prof-name').value;
    currentUser.subject = document.getElementById('prof-subject').value;
    
    const users = JSON.parse(localStorage.getItem('sga_users'));
    const idx = users.findIndex(u => u.email === currentUser.email);
    users[idx] = currentUser;
    localStorage.setItem('sga_users', JSON.stringify(users));
    
    document.getElementById('sidebar-name').innerText = currentUser.name;
    updateAvatars();
    alert('Perfil atualizado com sucesso!');
});

document.getElementById('avatar-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if(!file) return;
    
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            currentUser.avatar = evt.target.result;
            const users = JSON.parse(localStorage.getItem('sga_users'));
            const idx = users.findIndex(u => u.email === currentUser.email);
            users[idx].avatar = currentUser.avatar;
            localStorage.setItem('sga_users', JSON.stringify(users));
            updateAvatars();
        } catch(err) {
            alert('A imagem é muito grande para ser salva no armazenamento local.');
        }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
});

document.getElementById('btn-remove-avatar').addEventListener('click', () => {
    currentUser.avatar = '';
    const users = JSON.parse(localStorage.getItem('sga_users'));
    const idx = users.findIndex(u => u.email === currentUser.email);
    users[idx].avatar = '';
    localStorage.setItem('sga_users', JSON.stringify(users));
    updateAvatars();
});
