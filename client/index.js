import axios from 'axios';

const teacherList = document.querySelector('#teachers');
const unassignedList = document.querySelector('#unassigned');
const studentNameField = document.querySelector('#name');
const content = document.querySelector('#content');
const error = document.querySelector('#error');

const data = {
  teachers: [],
  unassigned: [],
};

const fetchTeachers = async () => {
  data.teachers = (await axios.get('/api/users/teachers')).data;
};

const fetchUnassigned = async () => {
  data.unassigned = (await axios.get('/api/users/unassigned')).data;
};

const renderTeachers = () => {
  const html = data.teachers
    .map((teacher) => {
      return `
      <li>
        ${teacher.name} (${teacher.mentees.length} mentees)
        <button data-action='delete-teacher' data-id='${teacher.id}'>x</button>
        <button data-action='make-teacher-a-student' data-id='${
          teacher.id
        }'>Make Student</button>
        <ul>
          ${renderMentees(teacher.mentees)}
        </ul>
      </li>
    `;
    })
    .join('');
  teacherList.innerHTML = html;
};

const renderMentees = (mentees) => {
  const html = mentees
    .map((mentee) => {
      return `
      <li>
        ${mentee.name}
        <button data-teacher-id='${mentee.mentorId}' data-action='delete-mentee' data-id='${mentee.id}'>x</button>
        <button data-teacher-id='${mentee.mentorId}' data-action='unassign-mentee' data-id='${mentee.id}'>Unassigne Mentee</button>
        <button data-teacher-id='${mentee.mentorId}' data-action='make-mentee-a-teacher' data-id='${mentee.id}'>Make Teacher</button>
      </li>
    `;
    })
    .join('');
  return html;
};

const renderUnassigned = () => {
  const html = data.unassigned
    .map((student) => {
      return `
      <li>
        ${student.name}
        <select data-id='${student.id}' data-action='assign-mentor'>
          <option>--- assign to mentor ---</option>
          ${data.teachers
            .map(
              (teacher) => `
              <option value='${teacher.id}'>${teacher.name}</option>
            `
            )
            .join('')}
        </select>
        <button data-action='delete-unassigned' data-id='${
          student.id
        }'>x</button>
        <button data-action='make-unassigned-a-teacher' data-id='${
          student.id
        }'>Make Teacher</button>
      </li>
    `;
    })
    .join('');
  unassignedList.innerHTML = html;
};

const start = async () => {
  await Promise.all([fetchTeachers(), fetchUnassigned()]);
  render();
};

const getTeacherById = (id) => {
  return data.teachers.find((teacher) => teacher.id === id);
};

const getMenteeById = (teacherId, id) => {
  return getTeacherById(teacherId).mentees.find((mentee) => mentee.id === id);
};

const getUnassignedById = (id) => {
  return data.unassigned.find((student) => student.id === id);
};

content.addEventListener('click', async (ev) => {
  const action = ev.target.getAttribute('data-action');
  const id = +ev.target.getAttribute('data-id');
  if (action === 'create-student') {
    try {
      const student = (
        await axios.post('/api/users', { name: studentNameField.value })
      ).data;
      data.unassigned = [student, ...data.unassigned];
      render();
    } catch (ex) {
      error.innerText = ex.response.data.message;
    }
  } else if (action === 'delete-teacher') {
    console.log(action, id);
    try {
      await axios.delete(`/api/users/${id}`);
      data.teachers = data.teachers.filter((teacher) => teacher.id !== id);
      render();
    } catch (ex) {
      error.innerText = ex.response.data.message;
    }
  } else if (action === 'delete-mentee') {
    console.log('TODO - delete this mentee', id);
    const teacherId = +ev.target.getAttribute('data-teacher-id');
    const teacher = getTeacherById(teacherId);
    await axios.delete(`/api/users/${id}`);
    teacher.mentees = teacher.mentees.filter((mentee) => mentee.id !== id);
    render();
  } else if (action === 'delete-unassigned') {
    await axios.delete(`/api/users/${id}`);
    data.unassigned = data.unassigned.filter((student) => student.id !== id);
    render();
  } else if (action === 'make-teacher-a-student') {
    try {
      const student = (
        await axios.put(`/api/users/${id}`, { userType: 'STUDENT' })
      ).data;
      data.unassigned.push(student);
      data.teachers = data.teachers.filter((teacher) => teacher.id !== id);
      render();
    } catch (ex) {
      error.innerText = ex.response.data.message;
    }
  } else if (action === 'make-mentee-a-teacher') {
    console.log('TODO - make this mentee a teacher', id);
    const teacherId = +ev.target.getAttribute('data-teacher-id');
    const mentor = getTeacherById(teacherId);
    try {
      const teacher = (
        await axios.put(`/api/users/${id}`, { userType: 'TEACHER' })
      ).data;
      mentor.mentees = mentor.mentees.filter((mentee) => mentee.id === id);
      data.teachers = [teacher, ...data.teachers];
      render();
    } catch (ex) {
      error.innerText = ex.response.data.message;
    }
  } else if (action === 'make-unassigned-a-teacher') {
    console.log('TODO - make this student a teacher', id);
    const teacher = (
      await axios.put(`/api/users/${id}`, { userType: 'TEACHER' })
    ).data;
    teacher.mentees = [];
    data.unassigned = data.unassigned.filter((student) => student.id !== id);
    data.teachers = [teacher, ...data.teachers];
    render();
  } else if (action === 'unassign-mentee') {
    console.log('TODO - unassign this mentee', id);
    const teacherId = +ev.target.getAttribute('data-teacher-id');
    const mentor = getTeacherById(teacherId);
    const student = (await axios.put(`/api/users/${id}`, { mentorId: null }))
      .data;
    data.unassigned.push(student);
    mentor.mentees = mentor.mentees.filter((mentee) => mentee.id !== id);
    render();
  }
});

content.addEventListener('change', async (ev) => {
  const action = ev.target.getAttribute('data-action');
  const id = +ev.target.getAttribute('data-id');
  if (action === 'assign-mentor') {
    const mentor = getTeacherById(+ev.target.value);
    const student = (
      await axios.put(`/api/users/${id}`, { mentorId: ev.target.value })
    ).data;
    data.unassigned = data.unassigned.filter((_student) => _student.id !== id);
    mentor.mentees.push(student);
    render();
  }
});

const render = () => {
  renderTeachers();
  renderUnassigned();
  studentNameField.value = '';
  error.innerText = '';
};

start();
