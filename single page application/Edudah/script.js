const links = document.querySelectorAll("nav a");
const sections = document.querySelectorAll("section");

links.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = e.target.dataset.section;

    sections.forEach(sec => sec.classList.remove("active"));
    document.getElementById(target).classList.add("active");
  });
});

// ===== Courses Section =====
let courses = JSON.parse(localStorage.getItem("courses")) || ["HTML Basics", "CSS Design", "JavaScript Essentials"];
const courseList = document.getElementById("courseList");

function renderCourses() {
  courseList.innerHTML = "";
  courses.forEach((course, index) => {
    const div = document.createElement("div");
    div.classList.add("course");
    div.innerHTML = `
      <span>${course}</span>
      <button onclick="removeCourse(${index})">❌</button>
    `;
    courseList.appendChild(div);
  });
  localStorage.setItem("courses", JSON.stringify(courses));
}

function removeCourse(index) {
  courses.splice(index, 1);
  renderCourses();
}

document.getElementById("addCourseForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const newCourse = document.getElementById("courseName").value.trim();
  if (newCourse) {
    courses.push(newCourse);
    document.getElementById("courseName").value = "";
    renderCourses();
  }
});

renderCourses();

// ===== Progress Section =====
const progressContainer = document.getElementById("progressContainer");
progressContainer.innerHTML = `
  <div style="background:white;padding:20px;border-radius:10px;max-width:400px;">
    <h3>Your Progress</h3>
    <p>HTML: 80%</p>
    <p>CSS: 70%</p>
    <p>JavaScript: 50%</p>
  </div>
`;

// ===== Profile Section =====
const profileForm = document.getElementById("profileForm");
const profileInfo = document.getElementById("profileInfo");

profileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("studentName").value;
  const email = document.getElementById("studentEmail").value;
  const college = document.getElementById("studentCollege").value;

  const profile = { name, email, college };
  localStorage.setItem("profile", JSON.stringify(profile));
  showProfile();
  profileForm.reset();
});

function showProfile() {
  const profile = JSON.parse(localStorage.getItem("profile"));
  if (profile) {
    profileInfo.innerHTML = `
      <div style="background:white;padding:15px;border-radius:10px;margin-top:15px;">
        <h3>${profile.name}</h3>
        <p>${profile.email}</p>
        <p>${profile.college}</p>
      </div>
    `;
  }
}
showProfile();