console.log("Let's start javascript");

var songUL

var songs;

let currentSong = new Audio();

let currFolder;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = parseInt(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

async function getSongs(folder) {
    // search 127
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text()
    // console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // Show all the songs in the playlist
    songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="Images/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Wansh</div>
                            </div>
                            <div class="playnow">
                                <span>Play now</span>
                                <img src="Images/play.svg" alt="">
                            </div></li>`;
    }

    // console.log(songUL);
    //Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.getElementsByTagName("div")[0]);
            // above one or
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playmusic(e.querySelector(".info").firstElementChild.innerHTML)
            //    console.log(e);
        })
    })
    return songs
}

const playmusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".singinfo").innerHTML = track.replace(".mp3","");
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text()
    // console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    // console.log(anchors);
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            // console.log(e.href.split("/").slice(-2)[0]);
            let folder = e.href.split("/").slice(-2)[0]
            //Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await a.json()
            // console.log(response);

            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card rounded">
        <div class="play">
            <img src="Images/playnow.svg" alt="">
        </div>
        <img src="/songs/${folder}/cover.jpeg" alt="">
        <h3>${response.title}</h3>
        <p>${response.description}</p>
    </div>`
        }
    }

    //Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        // console.log(e);
        e.addEventListener("click", async item => {
            console.log('fetching songs');
            
            // console.log(item.currentTarget.dataset);
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playmusic(songs[0])
        })
    })

    //Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log('previous clicked');
        // console.log(currentSong);
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
    })

    //Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log('next clicked');
        // console.log(currentSong);
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
        // console.log(songs, index);
    })

}


async function main() {
    //Get the list of all songs
    let songs = await getSongs("songs/1stalbum")
    // console.log(songs)
    playmusic(songs[0], true)

    //Display all the albums on the page
     await displayAlbums()

    //Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg";
        }
        else {
            currentSong.pause()
            play.src = "play.svg"
        }
    })

    //Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    //Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    //Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => { 
        document.querySelector(".left").style.left = 0 
    })

    //Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => { 
        document.querySelector(".left").style.left = -120 + "%" 
    })

    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to", e.target.value, "/100");
        currentSong.volume = parseInt(e.target.value) / 100;
        if(currentSong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    //Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click",(e)=>{
        // console.log(e.target);
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg");
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
}
main()
