import axios from 'axios';
axios.defaults.timeout = 2000;

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
  try {
    const response = await axios.get('/api/users/teachers');
    data.teachers = response.data;
  } catch (err) {
    console.error('Failed to fetch teachers (GET /api/users/teachers)', err);
  }
};

const fetchUnassigned = async () => {
  try {
    const response = await axios.get('/api/users/unassigned');
    data.unassigned = response.data;
  } catch (err) {
    console.error(
      'Failed to fetch unassigned students (GET /api/users/unassigned)',
      err
    );
  }
};

const renderTeachers = () => {
  const html = data.teachers
    .map((teacher) => {
      return `
      <li>
        ${teacher.name} (${teacher.mentees && teacher.mentees.length} mentees)
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
  if (!mentees) return;
  const html = mentees
    .map((mentee) => {
      return `
      <li>
        ${mentee.name}
        <button data-mentor-id='${mentee.mentorId}' data-action='delete-mentee' data-id='${mentee.id}'>x</button>
        <button data-mentor-id='${mentee.mentorId}' data-action='unassign-mentee' data-id='${mentee.id}'>Unassign Mentee</button>
        <button data-mentor-id='${mentee.mentorId}' data-action='make-mentee-a-teacher' data-id='${mentee.id}'>Make Teacher</button>
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

const createStudent = async (studentName) => {
  try {
    const response = await axios.post('/api/users', { name: studentName });
    const student = response.data;
    data.unassigned = [student, ...data.unassigned];
    render();
  } catch (err) {
    console.error('Failed to create new student (POST /api/users)', err);
    error.innerText = err.response
      ? err.response.data.message
      : 'Request Timed Out';
  }
};

const deleteTeacher = async (teacherId) => {
  try {
    await axios.delete(`/api/users/${teacherId}`);
    const { mentees } = getTeacherById(teacherId);
    data.teachers = data.teachers.filter((teacher) => teacher.id !== teacherId);
    data.unassigned = [...data.unassigned, ...mentees];
    render();
  } catch (err) {
    console.error(
      `Failed to delete user (DELETE /api/users/${teacherId})`,
      err
    );
    error.innerText = err.response
      ? err.response.data.message
      : 'Request Timed Out';
  }
};

const deleteMentee = async (menteeId, teacherId) => {
  try {
    const teacher = getTeacherById(teacherId);
    await axios.delete(`/api/users/${menteeId}`);
    teacher.mentees = teacher.mentees.filter(
      (mentee) => mentee.id !== menteeId
    );
    render();
  } catch (err) {
    console.error(`Failed to delete user (DELETE /api/users/${menteeId})`, err);
    error.innerText = err.response
      ? err.response.data.message
      : 'Request Timed Out';
  }
};

const deleteUnassignedStudent = async (studentId) => {
  try {
    await axios.delete(`/api/users/${studentId}`);
    data.unassigned = data.unassigned.filter(
      (student) => student.id !== studentId
    );
    render();
  } catch (err) {
    console.error(
      `Failed to delete user (DELETE /api/users/${studentId})`,
      err
    );
    error.innerText = err.response
      ? err.response.data.message
      : 'Request Timed Out';
  }
};

const makeTeacherAStudent = async (id) => {
  try {
    const response = await axios.put(`/api/users/${id}`, {
      userType: 'STUDENT',
    });
    const student = response.data;
    data.unassigned.push(student);
    data.teachers = data.teachers.filter((teacher) => teacher.id !== id);
    render();
  } catch (err) {
    console.error(`Failed to update user (PUT /api/users/${id})`, err);
    error.innerText = err.response
      ? err.response.data.message
      : 'Request Timed Out';
  }
};

const makeMenteeATeacher = async (menteeId, teacherId) => {
  const mentor = getTeacherById(teacherId);
  try {
    const response = await axios.put(`/api/users/${menteeId}`, {
      userType: 'TEACHER',
    });
    const teacher = response.data;
    mentor.mentees = mentor.mentees.filter((mentee) => mentee.id === menteeId);
    data.teachers = [teacher, ...data.teachers];
    render();
  } catch (err) {
    console.error(`Failed to update user (PUT /api/users/${menteeId})`, err);
    error.innerText = err.response
      ? err.response.data.message
      : 'Request Timed Out';
  }
};

const makeUnassignedATeacher = async (id) => {
  try {
    const response = await axios.put(`/api/users/${id}`, {
      userType: 'TEACHER',
    });
    const teacher = response.data;
    teacher.mentees = [];
    data.unassigned = data.unassigned.filter((student) => student.id !== id);
    data.teachers = [teacher, ...data.teachers];
    render();
  } catch (err) {
    console.error(`Failed to update user (PUT /api/users/${id})`, err);
    error.innerText = err.response
      ? err.response.data.message
      : 'Request Timed Out';
  }
};

const unassignMentee = async (menteeId, teacherId) => {
  const mentor = getTeacherById(teacherId);
  try {
    const response = await axios.put(`/api/users/${menteeId}`, {
      mentorId: null,
    });
    const student = response.data;
    data.unassigned.push(student);
    mentor.mentees = mentor.mentees.filter((mentee) => mentee.id !== menteeId);
    render();
  } catch (err) {
    console.error(`Failed to update user (PUT /api/users/${menteeId})`, err);
    error.innerText = err.response
      ? err.response.data.message
      : 'Request Timed Out';
  }
};

const assignMentor = async (studentId, teacherId) => {
  const mentor = getTeacherById(teacherId);
  try {
    const response = await axios.put(`/api/users/${studentId}`, {
      mentorId: teacherId,
    });
    const student = response.data;
    data.unassigned = data.unassigned.filter(
      (_student) => _student.id !== studentId
    );
    mentor.mentees.push(student);
    render();
  } catch (err) {
    console.error(`Failed to update user (PUT /api/users/${studentId})`, err);
    error.innerText = err.response
      ? err.response.data.message
      : 'Request Timed Out';
  }
};

content.addEventListener('click', async (ev) => {
  const action = ev.target.getAttribute('data-action');
  const id = +ev.target.getAttribute('data-id');
  const mentorId = +ev.target.getAttribute('data-mentor-id');
  if (action === 'create-student') {
    createStudent(studentNameField.value);
  } else if (action === 'delete-teacher') {
    deleteTeacher(id);
  } else if (action === 'delete-mentee') {
    deleteMentee(id, mentorId);
  } else if (action === 'delete-unassigned') {
    deleteUnassignedStudent(id);
  } else if (action === 'make-teacher-a-student') {
    makeTeacherAStudent(id);
  } else if (action === 'make-mentee-a-teacher') {
    makeMenteeATeacher(id, mentorId);
  } else if (action === 'make-unassigned-a-teacher') {
    makeUnassignedATeacher(id);
  } else if (action === 'unassign-mentee') {
    unassignMentee(id, mentorId);
  }
});

content.addEventListener('change', async (ev) => {
  const action = ev.target.getAttribute('data-action');
  const id = +ev.target.getAttribute('data-id');
  if (action === 'assign-mentor') {
    const teacherId = +ev.target.value;
    assignMentor(id, teacherId);
  }
});

function render() {
  renderTeachers();
  renderUnassigned();
  studentNameField.value = '';
  error.innerText = '';
}

start();
