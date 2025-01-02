let currentSong= new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds){
    if(isNaN(seconds)|| seconds <0){
        return "00:00";
    }
    const minutes=Math.floor(seconds/60)
    const remainingSeconds=Math.floor(seconds % 60)

    const formattedMinutes =String(minutes).padStart(2,"0");
    const formattedSeconds =String(remainingSeconds).padStart(2,"0");
    return `${formattedMinutes}:${formattedSeconds}`;
}

/*async function getSongs(folder) {
    currFolder = folder;
    try {
        let a = await fetch(`/songs/${folder}/info.json`); 
        let response = await a.json(); 

        let div=document.createElement("div")
        div.innerHTML=response;
        let as=div.getElementsByTagName("a")
        songs = [];
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if(element.href.endsWith(".mp3")){
                songs.push(element.href.split(`/${folder}/`)[1])
            }
        }

        let songUL=document.querySelector(".songList").getElementsByTagName("ul")[0]
        songUL.innerHTML=""
        for (const song of songs) {
            songUL.innerHTML=songUL.innerHTML + `<li> <img class="invert" src="music.svg " alt="music">
                <div class="info">
                    <div>${song.replaceAll("%20"," ")}</div>
                    <div>jassi gill</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="play.svg" alt="play">
                </div> </li>`;
        }

        // attach event listener to each song
        Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
            e.addEventListener("click",element=>{
                console.log(e.querySelector(".info").firstElementChild.innerHTML)
                playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            })
        })
    } catch (error) {
        console.error(`Error fetching songs: ${error}`);
    }
} */

    async function getSongs(folder) {
        currFolder = folder;
        try {
            let response = await fetch(`/songs/${folder}/`); // Fetch directory listing
            let text = await response.text(); 
    
            let div = document.createElement("div");
            div.innerHTML = text;
            let as = div.getElementsByTagName("a");
            songs = [];
    
            for (let link of as) {
                if(link.href.endsWith(".mp3")){
                    songs.push(link.href.split(`/${folder}/`)[1]);
                }
            }
    
            let songUL = document.querySelector(".songList ul");
            songUL.innerHTML = "";
    
            songs.forEach(song => {
                songUL.innerHTML += `
                    <li>
                        <img class="invert" src="music.svg" alt="music">
                        <div class="info">
                            <div>${decodeURIComponent(song)}</div>
                            <div>jassi gill</div>
                        </div>
                        <div class="playnow">
                            <span>Play Now</span>
                            <img class="invert" src="play.svg" alt="play">
                        </div>
                    </li>`;
            });
    
            // Attach event listeners
            Array.from(document.querySelectorAll(".songList li")).forEach(e => {
                e.addEventListener("click", () => {
                    const track = e.querySelector(".info div").textContent.trim();
                    console.log(track);
                    playMusic(track);
                });
            });
        } catch (error) {
            console.error(`Error fetching songs: ${error}`);
        }
        return songs;
    }
    
 
const playMusic=(track,pause=false)=>{ 
    if (!track || !currFolder) {
        console.error("Track or folder is missing");
        return;
    }
    currentSong.src = `http://127.0.0.1:5500/songs/${currFolder}/` + track;
    if(!pause){
    currentSong.play()
    play.src="pause.svg"
    }
    
    document.querySelector(".songinfo").innerHTML=decodeURI(track)
    document.querySelector(".songtime").innerHTML="00:00 / 00:00 "
}

async function displayAlbums() {
    let a = await fetch(`/songs/`); 
    let response = await a.text(); 
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer=document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes("/songs/") && !e.href.endsWith("/songs/")) {
            let folder = e.href.split("/").pop(); // extract the last part of the URL
            let a = await fetch(`/songs/${folder}/info.json`); 
            let response = await a.json(); 
            console.log(response)
            cardContainer.innerHTML=cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                            <div class="play">
                            <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
                                <!-- Green Background -->
                                <rect width="30" height="30" fill="green" />
                                
                                <!-- Black Play Button -->
                                <polygon points="11,8 24,15 11,22" fill="black" />
                              </svg>
                            </div>
                              
                        <img src="/songs/${folder}/cover.jpg" alt="img">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                      </div> `
        }
    }
    // {/* load playlist when card is clicked  */}
    Array.from(document.getElementsByClassName("card")).forEach(e=>{ 
        e.addEventListener("click", async item=>{
            songs = await getSongs(`${item.currentTarget.dataset.folder}`)
            /*songs 110*/
            playMusic(songs[0])
        })
    })
}


async function main() {
await getSongs("ncs") /*songs/ncs */

if(songs.length > 0) {
    playMusic(songs[0], true); 
} else {
    console.error("No songs found in the selected folder");
}  /* playMusic(songs[0],true) */ 

// display all the albus on the page
displayAlbums()

//  {/* here i attach event listner to play,next ,previous */}
play.addEventListener("click",()=>{
    if(currentSong.paused){
        currentSong.play()
        play.src="pause.svg"
    }
    else{
        currentSong.pause()
        play.src="play.svg"
    }
}) 
// timeupdate here 
currentSong.addEventListener("timeupdate",()=>{
   
    document.querySelector(".songtime").innerHTML=
    `${secondsToMinutesSeconds(currentSong.currentTime)}/
    ${secondsToMinutesSeconds(currentSong.duration)}`
    document.querySelector(".circle").style.left=(currentSong.currentTime/ currentSong.duration)* 100 + "%";
    
})
    // {/* //seekbarfor moving circle */}
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent =(e.offsetX/e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left= percent + "%";
        currentSong.currentTime = ((currentSong.duration)* percent)/100
    }) 
    //  add el for hamburger 
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0"
    })
    // {/* // add el for close hamb  */}
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-120%"
    })
    // {/* // previous play  button */}
    previous.addEventListener("click", ()=>{
        console.log('previous clicked')
        let index =songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index-1) >= 0){
        playMusic(songs[index-1])  
        } 
    })

    // {/* //  add next button el */}
    next.addEventListener("click",()=>{
        currentSong.pause()
       

        let index =songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index+1) < songs.length ){
        playMusic(songs[index+1])
        }
        
    })


    // {/* // Add an event to volume */}
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",
        (e)=>{
            currentSong.volume=parseInt(e.target.value)/100            
        }
    )
   
    // add event listner to mute track
    document.querySelector(".volume > img").addEventListener("click",e=>{
        
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg")
            currentSong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume =  .1;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;  
        }
        
        
    }

)

}

main()      