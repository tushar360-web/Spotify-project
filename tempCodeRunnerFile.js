Array.from(document.getElementsByClassName("card")).forEach(e=>{ 
        e.addEventListener("click",async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            
        })
    })
