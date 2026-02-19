function toggleMenu() {
            const sidebar = document.getElementById('sidebar');
            const btnText = document.querySelector('.toggle-btn .text');
            
            sidebar.classList.toggle('expanded');
            
            if (sidebar.classList.contains('expanded')) {
                btnText.textContent = 'Свернуть';
            } else {
                btnText.textContent = 'Развернуть';
            }
        }