// --- DATABASE MOCK (localStorage) ---
function initData() {
    if (!localStorage.getItem('sga_users')) {
        const defaultUsers = [{
            email: 'professor@maisunifacisa.com.br',
            password: '123',
            name: 'Ana Paula Menezes',
            subjects: ['Engenharia de Software'],
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
let currentUser = JSON.parse(sessionStorage.getItem('sga_currentUser'));
let currentClassId = null;
let currentPage = 1;
const ITEMS_PER_PAGE = 5;

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
        if(el) {
            if(currentUser.avatar) {
                el.style.backgroundImage = `url(${currentUser.avatar})`;
                el.innerText = '';
            } else {
                el.style.backgroundImage = 'none';
                el.innerText = inits;
            }
        }
    });
}

// Verifica sessão para home.html
if (window.location.pathname.endsWith('home.html') || window.location.pathname.endsWith('home.html/')) {
    if (!currentUser) {
        window.location.href = 'index.html';
    } else {
        document.getElementById('sidebar-name').innerText = currentUser.name;
        updateAvatars();
        showSubView('classes-list-view');
    }
}

// --- NAVEGAÇÃO SUBVIEWS (Apenas Home) ---
function showSubView(subViewId) {
    document.querySelectorAll('.sub-view').forEach(el => el.classList.remove('active'));
    const targetView = document.getElementById(subViewId);
    if(targetView) targetView.classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[data-target="${subViewId}"]`);
    if(navItem) navItem.classList.add('active');

    const pageTitle = document.getElementById('page-title');
    if(pageTitle) {
        if(subViewId === 'classes-list-view') {
            pageTitle.innerText = 'Minhas turmas';
            renderClasses();
        } else if (subViewId === 'profile-view') {
            pageTitle.innerText = 'Meu perfil';
            loadProfile();
        } else if (subViewId === 'class-detail-view') {
            pageTitle.innerText = 'Diário de Notas';
        }
    }
}

// --- LOGIN & REGISTRO ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        
        const users = JSON.parse(localStorage.getItem('sga_users'));
        const user = users.find(u => u.email === email && u.password === pass);
        
        if(user) {
            sessionStorage.setItem('sga_currentUser', JSON.stringify(user));
            window.location.href = 'home.html';
        } else {
            alert('Credenciais inválidas!');
        }
    });
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
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
        
        users.push({ name, email, subjects: [], password: pass, avatar: '' });
        localStorage.setItem('sga_users', JSON.stringify(users));
        alert('Cadastro realizado com sucesso!');
        window.location.href = 'index.html';
    });
}

const btnLogout = document.getElementById('btn-logout');
if(btnLogout) {
    btnLogout.addEventListener('click', () => {
        sessionStorage.removeItem('sga_currentUser');
        window.location.href = 'index.html';
    });
}

// --- MENU LATERAL (Apenas Home) ---
document.querySelectorAll('.nav-item[data-target]').forEach(item => {
    item.addEventListener('click', () => {
        showSubView(item.getAttribute('data-target'));
    });
});

// --- TURMAS (Apenas Home) ---
function renderClasses() {
    const grid = document.getElementById('classes-grid');
    if(!grid) return;

    const userSubjects = currentUser.subjects || [];
    const classes = JSON.parse(localStorage.getItem('sga_classes')).filter(c => userSubjects.includes(c.name));
    const students = JSON.parse(localStorage.getItem('sga_students'));
    
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

const btnBackClasses = document.getElementById('btn-back-classes');
if(btnBackClasses) {
    btnBackClasses.addEventListener('click', () => {
        showSubView('classes-list-view');
    });
}

// --- LÓGICA DE NOTAS (Apenas Home) ---
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
    
    if(p1 !== null && p2 !== null && proj1 !== null && proj2 !== null) {
        let notaIndividual = (p1 + p2) / 2;
        let notaProjeto  = (proj1 + proj2) / 2;
        let mediaFinal = (notaIndividual * 0.4) + (notaProjeto   * 0.6);
        student.media = mediaFinal.toFixed(2);
        
        if(mediaFinal >= 7.0) {
            student.status = 'Aprovado';
        } else if(mediaFinal < 7.0 && notaProjeto    < 4.0) {
            student.status = 'Reprovado';
        } else {
            student.status = 'Fará prova final';
            
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
    const tbody = document.getElementById('grades-tbody');
    if(!tbody) return;

    const allStudents = JSON.parse(localStorage.getItem('sga_students'));
    const classStudents = allStudents.filter(s => s.classId === currentClassId);
    
    const totalPages = Math.ceil(classStudents.length / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = classStudents.slice(start, start + ITEMS_PER_PAGE);
    
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
    if(!pag) return;
    pag.innerHTML = '';
    for(let i=1; i<=totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        btn.innerText = i;
        btn.onclick = () => { currentPage = i; renderGrades(); };
        pag.appendChild(btn);
    }
}

// --- ARQUIVOS (Apenas Home) ---
const fileUpload = document.getElementById('file-upload');
if(fileUpload) {
    fileUpload.addEventListener('change', function(e) {
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
        e.target.value = '';
    });
}

function renderFiles() {
    const ul = document.getElementById('files-list');
    if(!ul) return;
    
    const allFiles = JSON.parse(localStorage.getItem('sga_files')) || [];
    const classFiles = allFiles.filter(f => f.classId === currentClassId);
    
    ul.innerHTML = '';
    
    if(classFiles.length === 0) {
        ul.innerHTML = '<li>Nenhum arquivo anexado.</li>';
        return;
    }
    
    classFiles.forEach(f => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><i class="fas fa-file-pdf" style="color:var(--vermelho); margin-right:8px;"></i> ${f.name} <small>(${f.date})</small></span>
            <div>
                <a href="${f.data}" download="${f.name}" style="margin-right: 15px;"><i class="fas fa-download"></i> Baixar</a>
                <a href="#" onclick="deleteFile(${f.id}); return false;" style="color: var(--vermelho);"><i class="fas fa-trash"></i> Excluir</a>
            </div>
        `;
        ul.appendChild(li);
    });
}

function deleteFile(id) {
    if(confirm('Tem certeza que deseja excluir este arquivo?')) {
        let files = JSON.parse(localStorage.getItem('sga_files')) || [];
        files = files.filter(f => f.id !== id);
        localStorage.setItem('sga_files', JSON.stringify(files));
        renderFiles();
    }
}

// --- PERFIL (Apenas Home) ---
function loadProfile() {
    const profName = document.getElementById('prof-name');
    if(!profName) return;

    profName.value = currentUser.name;
    document.getElementById('prof-email').value = currentUser.email;
    document.getElementById('prof-password').value = '';
    document.getElementById('prof-confirm-password').value = '';
    
    const checkboxes = document.querySelectorAll('#prof-subjects input[type="checkbox"]');
    const userSubjects = currentUser.subjects || [];
    checkboxes.forEach(cb => {
        cb.checked = userSubjects.includes(cb.value);
    });
}

const profileForm = document.getElementById('profile-form');
if(profileForm) {
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const users = JSON.parse(localStorage.getItem('sga_users'));
        const idx = users.findIndex(u => u.email === currentUser.email);
        
        const newEmail = document.getElementById('prof-email').value;
        const newPassword = document.getElementById('prof-password').value;
        const confirmPassword = document.getElementById('prof-confirm-password').value;
        
        if (newEmail !== currentUser.email) {
            if (users.find(u => u.email === newEmail)) {
                alert('Este e-mail já está em uso por outro professor.');
                return;
            }
        }
        
        if (newPassword) {
            if (newPassword !== confirmPassword) {
                alert('As novas senhas não coincidem!');
                return;
            }
            currentUser.password = newPassword;
        }

        currentUser.name = document.getElementById('prof-name').value;
        currentUser.email = newEmail;
        
        const checkboxes = document.querySelectorAll('#prof-subjects input[type="checkbox"]:checked');
        currentUser.subjects = Array.from(checkboxes).map(cb => cb.value);
        
        users[idx] = currentUser;
        localStorage.setItem('sga_users', JSON.stringify(users));
        
        sessionStorage.setItem('sga_currentUser', JSON.stringify(currentUser));
        
        document.getElementById('sidebar-name').innerText = currentUser.name;
        updateAvatars();
        alert('Perfil atualizado com sucesso!');
        renderClasses();
        
        document.getElementById('prof-password').value = '';
        document.getElementById('prof-confirm-password').value = '';
    });
}

const avatarUpload = document.getElementById('avatar-upload');
if(avatarUpload) {
    avatarUpload.addEventListener('change', function(e) {
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
                sessionStorage.setItem('sga_currentUser', JSON.stringify(currentUser));
                updateAvatars();
            } catch(err) {
                alert('A imagem é muito grande para ser salva no armazenamento local.');
            }
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    });
}

const btnRemoveAvatar = document.getElementById('btn-remove-avatar');
if(btnRemoveAvatar) {
    btnRemoveAvatar.addEventListener('click', () => {
        currentUser.avatar = '';
        const users = JSON.parse(localStorage.getItem('sga_users'));
        const idx = users.findIndex(u => u.email === currentUser.email);
        users[idx].avatar = '';
        localStorage.setItem('sga_users', JSON.stringify(users));
        sessionStorage.setItem('sga_currentUser', JSON.stringify(currentUser));
        updateAvatars();
    });
}
