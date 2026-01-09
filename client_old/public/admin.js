const unapprovedFacultyDiv = document.getElementById('unapproved-faculty');
const allUsersDiv = document.getElementById('all-users');
const allMessagesDiv = document.getElementById('all-messages');

// --- Unapproved Faculty ---
async function getUnapprovedFaculty() {
    try {
        const response = await fetch('/unapproved-faculty');
        if (!response.ok) throw new Error('Failed to fetch unapproved faculty');
        const faculty = await response.json();

        unapprovedFacultyDiv.innerHTML = '';
        if (faculty.length === 0) {
            unapprovedFacultyDiv.innerHTML += '<p>No unapproved faculty.</p>';
            return;
        }

        faculty.forEach(member => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h4>${member.username}</h4>
                <p>${member.email}</p>
            `;
            const approveButton = document.createElement('button');
            approveButton.textContent = 'Approve';
            approveButton.onclick = () => approveFaculty(member.email);
            card.appendChild(approveButton);
            unapprovedFacultyDiv.appendChild(card);
        });
    } catch (error) {
        unapprovedFacultyDiv.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
}

async function approveFaculty(email) {
    if (!confirm(`Approve faculty member with email: ${email}?`)) return;
    try {
        await fetch('/approve-faculty', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        getUnapprovedFaculty(); // Refresh list
    } catch (error) {
        alert('Failed to approve faculty.');
    }
}


// --- All Users ---
async function getAllUsers() {
    try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const users = await response.json();

        allUsersDiv.innerHTML = '';
        if (users.length === 0) {
            allUsersDiv.innerHTML += '<p>No users found.</p>';
            return;
        }

        users.forEach(user => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h4>${user.username} (${user.role})</h4>
                <p>${user.email}</p>
            `;
            if (user.role !== 'admin') { // Prevent admin from deleting themselves
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'delete-btn';
                deleteButton.onclick = () => deleteUser(user._id);
                card.appendChild(deleteButton);
            }
            allUsersDiv.appendChild(card);
        });
    } catch (error) {
        allUsersDiv.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user and all their messages? This cannot be undone.')) return;
    try {
        await fetch(`/api/users/${userId}`, { method: 'DELETE' });
        getAllUsers(); // Refresh list
        getAllMessages(); // Refresh messages as well
    } catch (error) {
        alert('Failed to delete user.');
    }
}


// --- All Messages ---
async function getAllMessages() {
    try {
        const response = await fetch('/api/messages');
        if (!response.ok) throw new Error('Failed to fetch messages');
        const messages = await response.json();

        allMessagesDiv.innerHTML = '';
        if (messages.length === 0) {
            allMessagesDiv.innerHTML += '<p>No messages found.</p>';
            return;
        }

        messages.forEach(message => {
            const card = document.createElement('div');
            card.className = 'card message-card';
            card.innerHTML = `
                <p><strong>${message.sender ? message.sender.username : 'Unknown'}:</strong> ${message.text}</p>
                <p class="timestamp">${new Date(message.createdAt).toLocaleString()}</p>
            `;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-btn';
            deleteButton.onclick = () => deleteMessage(message._id);
            card.appendChild(deleteButton);
            allMessagesDiv.appendChild(card);
        });
    } catch (error) {
        allMessagesDiv.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
}

async function deleteMessage(messageId) {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
        await fetch(`/api/messages/${messageId}`, { method: 'DELETE' });
        getAllMessages(); // Refresh list
    } catch (error) {
        alert('Failed to delete message.');
    }
}


// Initial Load
function initAdmin() {
    getUnapprovedFaculty();
    getAllUsers();
    getAllMessages();
}

initAdmin();