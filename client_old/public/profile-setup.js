    document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('profile-setup-form');
    let user = null;

    // A simple tag input component
    const createTagInput = (container, tags, placeholder) => {
        const updateTags = () => {
            container.innerHTML = '';
            tags.forEach((tag, index) => {
                const tagEl = document.createElement('div');
                tagEl.className = 'tag';
                tagEl.innerHTML = `
                    ${tag}
                    <button type="button" class="remove-tag" data-index="${index}">&times;</button>
                `;
                container.appendChild(tagEl);
            });
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = placeholder;
            container.appendChild(input);
        };

        container.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' && e.key === 'Enter' && e.target.value.trim() !== '') {
                e.preventDefault();
                tags.push(e.target.value.trim());
                e.target.value = '';
                updateTags();
            }
        });

        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-tag')) {
                const index = parseInt(e.target.getAttribute('data-index'), 10);
                tags.splice(index, 1);
                updateTags();
            }
        });

        updateTags();
    };
    
    const fetchUserAndRenderForm = async () => {
        try {
            const response = await fetch('/user');
            if (response.ok) {
                user = await response.json();
                document.querySelector('.title').textContent = `Welcome, ${user.username}!`;
                renderForm(user.role);
            } else {
                window.location.href = '/login.html';
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            window.location.href = '/login.html';
        }
    };

    const renderForm = (role) => {
        let studentFields = `
            <div class="section">
                <h3 class="section-header">Academic Information</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="enrollmentNumber">Enrollment / Roll Number</label>
                        <input type="text" id="enrollmentNumber" name="enrollmentNumber" required />
                    </div>
                    <div class="form-group">
                        <label for="department">Department / Program</label>
                        <select id="department" name="department" required>
                            <option value="">Select Department</option>
                            <option value="Computer">Computer</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Civil">Civil</option>
                            <option value="Electrical">Electrical</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="semester">Semester</label>
                        <select id="semester" name="semester" required>
                            <option value="">Select Semester</option>
                            ${[...Array(8).keys()].map(i => `<option value="${i+1}">${i+1}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="division">Division / Batch</label>
                        <select id="division" name="division" required>
                            <option value="">Select Division</option>
                            <option value="QA">QA</option>
                            <option value="QB">QB</option>
                            <option value="QC">QC</option>
                            <option value="QD">QD</option>
                            <option value="QE">QE</option>
                            <option value="QF">QF</option>
                            <option value="QG">QG</option>
                        </select>
                    </div>
                    <div class="form-group full-width">
                        <label for="college">College / Institute Name</label>
                        <select id="college" name="college" required>
                            <option value="">Select College</option>
                            <option value="Engineering College A">PIET</option>
                            <option value="Engineering College B">PIET-DS</option>
                            <option value="Engineering College C">PIT</option>
                            <option value="Engineering College D">PPI</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="section">
                <h3 class="section-header">Profile Photo (Optional)</h3>
                <div class="form-group">
                    <label for="profilePhoto">Upload a photo</label>
                    <input type="file" id="profilePhoto" name="profilePhoto" accept="image/*" />
                </div>
            </div>
            <div class="section">
                <h3 class="section-header">Professional Interests (Optional)</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="areasOfInterest">Areas of Interest</label>
                        <div id="areasOfInterest" class="tag-input-container"></div>
                        <p class="helper-text">e.g., Artificial Intelligence, Web Development</p>
                    </div>
                    <div class="form-group">
                        <label for="skills">Skills</label>
                        <div id="skills" class="tag-input-container"></div>
                        <p class="helper-text">e.g., Python, React, Project Management</p>
                    </div>
                </div>
            </div>
        `;

        let facultyFields = `
            <div class="section">
                <h3 class="section-header">Professional Information</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="employeeId">Employee ID</label>
                        <input type="text" id="employeeId" name="employeeId" required />
                    </div>
                    <div class="form-group">
                        <label for="department">Department</label>
                        <select id="department" name="department" required>
                            <option value="">Select Department</option>
                            <option value="Computer">Computer</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Civil">Civil</option>
                            <option value="Electrical">Electrical</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="designation">Designation</label>
                        <select id="designation" name="designation" required>
                            <option value="">Select Designation</option>
                            <option value="Professor">Professor</option>
                            <option value="Associate Professor">Associate Professor</option>
                            <option value="Assistant Professor">Assistant Professor</option>
                            <option value="Lecturer">Lecturer</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="officeLocation">Office Location (Optional)</label>
                        <select id="officeLocation" name="officeLocation">
                            <option value="">Select Office Location</option>
                            <option value="Building A - Room 101">DS Building - Room 111</option>
                            <option value="Building B - Room 202">PPI Building - Room 202</option>
                            <option value="Building C - Room 303">GYM Building - Room 303</option>
                            <option value="Building D - Room 404">PIT Building - Room 404</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="section">
                <h3 class="section-header">Profile Photo (Optional)</h3>
                <div class="form-group">
                    <label for="profilePhoto">Upload a photo</label>
                    <input type="file" id="profilePhoto" name="profilePhoto" accept="image/*" />
                </div>
            </div>
            <div class="section">
                <h3 class="section-header">Subjects Taught</h3>
                <div class="form-grid">
                    <div class="form-group full-width">
                        <label>Subjects Taught</label>
                        <div id="subjectsTaught" class="tag-input-container">
                        </div>
                        <p class="helper-text">e.g., Data Structures, Database Management</p>
                    </div>
                </div>
            </div>
        `;
        
        form.innerHTML = (role === 'student' ? studentFields : facultyFields) + `
            <div class="form-actions">
                <button type="submit" class="submit-btn">Save and Continue</button>
            </div>
        `;

        if (role === 'student') {
            createTagInput(document.getElementById('areasOfInterest'), [], 'Add an interest and press Enter');
            createTagInput(document.getElementById('skills'), [], 'Add a skill and press Enter');
        } else {
            createTagInput(document.getElementById('subjectsTaught'), [], 'Add a subject and press Enter');
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Use FormData to handle file upload
        const formData = new FormData(e.target);
        formData.append('userId', user._id);

        const getTags = (id) => {
            const container = document.getElementById(id);
            if (!container) return [];
            return Array.from(container.querySelectorAll('.tag')).map(tagEl => tagEl.textContent.replace('×', '').trim());
        };
        
        // Remove the single value that FormData creates from the tag input container div
        formData.delete('areasOfInterest');
        formData.delete('skills');
        formData.delete('subjectsTaught');

        if (user.role === 'student') {
            const interests = getTags('areasOfInterest');
            interests.forEach(interest => formData.append('areasOfInterest', interest));
            
            const skills = getTags('skills');
            skills.forEach(skill => formData.append('skills', skill));
        } else {
            const subjects = getTags('subjectsTaught');
            subjects.forEach(subject => formData.append('subjectsTaught', subject));
        }
        
        // The file from the input is already in formData if the user selected one.

        try {
            const response = await fetch('/api/auth/profile-setup', {
                method: 'POST',
                // Do NOT set Content-Type header. The browser will set it to multipart/form-data with the correct boundary.
                body: formData,
            });

            if (response.ok) {
                window.location.href = '/dashboard.html';
            } else {
                const errorData = await response.json();
                alert(`Profile setup failed: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Profile setup failed:', error);
            alert('An error occurred during profile setup.');
        }
    });

    fetchUserAndRenderForm();
});
