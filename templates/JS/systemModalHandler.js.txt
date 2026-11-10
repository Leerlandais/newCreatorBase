if(document.getElementById('systemMessageModal') != null){
    /*
    Controls the modal that contains systemMessages from PHP
     */
    const modal = document.getElementById('systemMessageModal');
    const closeBtn = document.getElementById('closeMessageModal');

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

}
