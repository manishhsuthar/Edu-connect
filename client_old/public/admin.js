const unapprovedFaculty = document.getElementById('unapproved-faculty');

async function getUnapprovedFaculty() {
    const response = await fetch('/unapproved-faculty');
    const faculty = await response.json();

    unapprovedFaculty.innerHTML = '';

    for (const member of faculty) {
        const card = document.createElement('div');
        card.classList.add('faculty-card');

        const name = document.createElement('h2');
        name.textContent = member.username;
        card.appendChild(name);

        const email = document.createElement('p');
        email.textContent = member.email;
        card.appendChild(email);

        const approveButton = document.createElement('button');
        approveButton.textContent = 'Approve';
        approveButton.addEventListener('click', async () => {
            await fetch('/approve-faculty', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: member.email })
            });

            getUnapprovedFaculty();
        });
        card.appendChild(approveButton);

        unapprovedFaculty.appendChild(card);
    }
}

getUnapprovedFaculty();