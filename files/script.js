// JavaScript for O-Level Student Management System

// persistence helpers
function loadStudents() {
    const data = localStorage.getItem('students');
    return data ? JSON.parse(data) : [];
}
function saveStudents() {
    localStorage.setItem('students', JSON.stringify(students));
}

let students = loadStudents();

// Utility functions
function calculateAverage(performance) {
    if (!performance || performance.length === 0) return 0;
    // average across all entries
    let total = 0;
    let count = 0;
    for (const rec of performance) {
        const subjects = rec.subjects;
        const sum = subjects.math + subjects.english + subjects.science + subjects.social;
        total += sum / 4;
        count++;
    }
    return count === 0 ? 0 : (total / count).toFixed(2);
}

function renderStudentList(filter = "") {
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = '';
    const search = filter.toLowerCase();
    students.forEach(student => {
        if (search && !(student.id.toLowerCase().includes(search) || student.name.toLowerCase().includes(search))) {
            return;
        }
        const avg = calculateAverage(student.performance);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.form}</td>
            <td>${avg}</td>
            <td>
                <button class="viewBtn" data-id="${student.id}">View</button>
                <button class="editBtn" data-id="${student.id}">Action</button>
                <button class="deleteBtn" data-id="${student.id}">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    attachListListeners();
}

function attachListListeners() {
    document.querySelectorAll('.viewBtn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            window.location.hash = 'view:' + id;
        });
    });
    document.querySelectorAll('.editBtn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            window.location.hash = 'edit:' + id;
        });
    });
    document.querySelectorAll('.deleteBtn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            deleteStudent(id);
        });
    });
}

function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    students = students.filter(s => s.id !== id);
    saveStudents();
    renderStudentList(document.getElementById('searchInput').value);
}

function showDetails(id, mode='view', pushHash = false) {
    const student = students.find(s => s.id === id);
    if (!student) return;
    if (pushHash) {
        window.location.hash = mode + ':' + id;
    }
    // hide main sections when showing details
    ['registration','searchSection','studentList'].forEach(sec => {
        const el = document.getElementById(sec);
        if (el) el.classList.add('hidden');
    });
    document.getElementById('perfStudentId').value = student.id;
    const detailsDiv = document.getElementById('studentDetails');
    detailsDiv.innerHTML = `
        <p><strong>ID:</strong> ${student.id}</p>
        <p><strong>Name:</strong> ${student.name}</p>
        <p><strong>Age:</strong> ${student.age}</p>
        <p><strong>Gender:</strong> ${student.gender}</p>
        <p><strong>Current Form:</strong> ${student.form}</p>
    `;
    renderPerformanceHistory(student);
    const section = document.getElementById('detailsSection');
    section.classList.remove('hidden');
    // show/hide form/promote depending on mode
    const perfForm = document.getElementById('performanceForm');
    const promoteBtn = document.getElementById('promoteBtn');
    if (mode === 'view') {
        if (perfForm) perfForm.classList.add('hidden');
        if (promoteBtn) promoteBtn.classList.add('hidden');
    } else {
        if (perfForm) perfForm.classList.remove('hidden');
        if (promoteBtn) promoteBtn.classList.remove('hidden');
    }
    section.scrollIntoView({ behavior: 'smooth' });
}

function renderPerformanceHistory(student) {
    const historyDiv = document.getElementById('performanceHistory');
    historyDiv.innerHTML = '';
    if (student.performance.length === 0) {
        historyDiv.textContent = 'No records yet';
        return;
    }
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Form</th>
                <th>Math</th>
                <th>English</th>
                <th>Science</th>
                <th>Social</th>
                <th>Average</th>
            </tr>
        </thead>
    `;
    const tbody = document.createElement('tbody');
    student.performance.forEach(rec => {
        const avg = ((rec.subjects.math + rec.subjects.english + rec.subjects.science + rec.subjects.social) / 4).toFixed(2);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${rec.form}</td>
            <td>${rec.subjects.math}</td>
            <td>${rec.subjects.english}</td>
            <td>${rec.subjects.science}</td>
            <td>${rec.subjects.social}</td>
            <td>${avg}</td>
        `;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    historyDiv.appendChild(table);
}

function clearForm() {
    document.getElementById('studentForm').reset();
}

// Event handlers

document.getElementById('studentForm').addEventListener('submit', function (e) {
    // persist
    e.preventDefault();
    const id = document.getElementById('studentId').value.trim();
    const name = document.getElementById('studentName').value.trim();
    const age = parseInt(document.getElementById('studentAge').value);
    const gender = document.getElementById('studentGender').value;
    const formLevel = parseInt(document.getElementById('studentFormLevel').value);

    // validation
    if (!id || !name || !age || !gender || !formLevel) {
        alert('Please fill in all fields');
        return;
    }
    if (students.some(s => s.id === id)) {
        alert('Student ID must be unique');
        return;
    }
    const student = {
        id,
        name,
        age,
        gender,
        form: formLevel,
        performance: []
    };
    students.push(student);
    saveStudents();
    renderStudentList(document.getElementById('searchInput').value);
    clearForm();
});

document.getElementById('performanceForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const studentId = document.getElementById('perfStudentId').value;
    const formLevel = parseInt(document.getElementById('perfFormLevel').value);
    const math = parseInt(document.getElementById('mathScore').value);
    const english = parseInt(document.getElementById('englishScore').value);
    const science = parseInt(document.getElementById('scienceScore').value);
    const social = parseInt(document.getElementById('socialScore').value);
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    // check if record for this form already exists
    const existing = student.performance.find(p => p.form === formLevel);
    const record = {
        form: formLevel,
        subjects: { math, english, science, social }
    };
    if (existing) {
        // update
        existing.subjects = record.subjects;
    } else {
        student.performance.push(record);
    }
    renderPerformanceHistory(student);
    renderStudentList(document.getElementById('searchInput').value);
    saveStudents();
    // reset performance form
    document.getElementById('performanceForm').reset();
});

document.getElementById('closeDetails').addEventListener('click', function () {
    document.getElementById('detailsSection').classList.add('hidden');
    // show main sections again
    ['registration','searchSection','studentList'].forEach(sec => {
        const el = document.getElementById(sec);
        if (el) el.classList.remove('hidden');
    });
    // clear hash when closing
    history.pushState("", document.title, window.location.pathname + window.location.search);
});

document.getElementById('searchInput').addEventListener('input', function () {
    renderStudentList(this.value);
});

document.getElementById('promoteBtn').addEventListener('click', function () {
    const studentId = document.getElementById('perfStudentId').value;
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    if (student.form < 4) {
        student.form += 1;
        alert(`Student promoted to Form ${student.form}`);
        document.getElementById('studentDetails').querySelector('p:nth-child(5)').innerHTML = `<strong>Current Form:</strong> ${student.form}`;
        renderStudentList(document.getElementById('searchInput').value);
        saveStudents();
    } else {
        alert('Student is already in Form 4');
    }
});

// initial render
renderStudentList();

// handle hash navigation
function handleHash() {
    const hash = window.location.hash.slice(1);
    if (!hash) {
        // show main sections
        ['registration','searchSection','studentList'].forEach(sec => {
            const el = document.getElementById(sec);
            if (el) el.classList.remove('hidden');
        });
        document.getElementById('detailsSection').classList.add('hidden');
        return;
    }
    const [mode, id] = hash.split(':');
    if (mode === 'view' || mode === 'edit') {
        showDetails(id, mode);
    } else {
        // legacy or default to view
        showDetails(hash, 'view');
    }
}

window.addEventListener('hashchange', handleHash);
// run once at load
handleHash();