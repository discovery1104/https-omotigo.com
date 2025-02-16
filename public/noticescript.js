document.addEventListener('DOMContentLoaded', function() {
    fetch("notice.json")
    .then(response => response.json())
    .then(data => {
        const noticesContainer = document.getElementById('notices-container');
        data.notices.forEach(notice => {
            const noticeBlock = document.createElement('div');
            noticeBlock.className = 'notice-block';  // Apply rounded corners and padding
            noticeBlock.innerHTML = `
                <h3>${notice.title}</h3>
                <p>${notice.description}</p>
            `;
            noticesContainer.appendChild(noticeBlock);
        });
    })
    .catch(error => console.error('Error loading the notices:', error));
});
