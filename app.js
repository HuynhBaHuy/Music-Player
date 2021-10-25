/* TO DO TASK:
*   1. render song => ok
*   2. scroll top => ok
*   3. Play/pause/seek => ok
*   4. CD rotate => ok
*   5. Next/prev => ok
*   6. Random => ok
*   7. Next/Repeat when ended => ok
*   8. Active song => ok
*   9. Scroll active song into view => ok
*   10. Play song when click 
*/
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player');
const heading = $('header h2');
const status = $('header h4');
const cdThumb = $('.cd .cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.control .btn-toggle-play');
const nextBtn = $('.control .btn-next');
const prevBtn = $('.control .btn-prev');
const repeatBtn = $('.control .btn-repeat');
const randomBtn = $('.control .btn-random');
const progress = $('#progress');
const playlist = $('.playlist');
const app = {
    currentIndex: 0,
    isPlaying:false,
    isRandom:false,
    configs: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY))||{},
    songs: [{
            name:'Chỉ một đêm nữa thôi',
            singer:'MCK & Tlinh',
            path: './assets/music/ChiMotDemNuaThoi.mp3',
            img: './assets/img/chimotdemnuathoi.jpg'
        },{
            name: 'Con chim trên cành hát về tinh yêu',
            singer:'Tùng',
            path: './assets/music/ConChimTrenCanhHatVeTinhYeu.mp3',
            img: './assets/img/conchimtrencanhhatvetinhyeu.jpg'
        },{
            name: 'Con dế mèn hát vào mùa đông',
            singer:'Tùng & Trang',
            path: './assets/music/ConDeMenHatVaoMuaDong.mp3',
            img: './assets/img/condemenhatvaomuadong.jpg'
        },{
            name: 'Gam màu tím ở rìa thế giới',
            singer: 'Tùng',
            path: './assets/music/GamMauTimORiaTheGioi.mp3',
            img: './assets/img/gammautimoriathegioi.jpg'
        },{
            name: 'Một cú lừa',
            singer: 'Bích Phương ft Phúc Du',
            path: './assets/music/MotCuLua.mp3',
            img: './assets/img/motculua.png',
        },{
            name: 'Tay to',
            singer: 'MCK ft PhongKin',
            path: './assets/music/TayTo.mp3',
            img:'./assets/img/tayto.jpg'
        },{
            name: 'Thư cho anh',
            singer: 'Trang',
            path: './assets/music/ThuChoAnh.mp3',
            img:'./assets/img/thuchoanh.jpg'
        },{
            name:'Từ chối nhẹ nhàng thôi',
            singer: 'Bích Phương ft Phúc Du',
            path: './assets/music/TuChoiNheNhangThoi.mp3',
            img: './assets/img/tuchoinhenhang.jpg'
        }],
    setConfigs:function(key,value){
        this.configs[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.configs));
    },
    definePropertise:function(){
        Object.defineProperty(this,'currentSong',{
            get: function(){
                return this.songs[this.currentIndex];
            }
        });
    },
    render: function(){
        const htmls = this.songs.map((song,index) =>{
            return `
            <div data-index = "${index}" class="song ${app.currentIndex===index ? 'active':''}">
                <!-- thumb -->
                <div class="thumb" style="background-image: url('${song.img}')"></div>
                <!-- body -->
                <div class="body">
                    <!-- title -->
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                    <!-- singer -->
                </div>
                <!-- option -->
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>`
        })
        playlist.innerHTML = htmls.join('');
    },
    handleEvent:function(){
        const cdWidth = cd.offsetWidth;
        
        // xu ly phong to/ thu nho cd
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ?newCdWidth+'px':0;
            cd.style.opacity = newCdWidth /cdWidth;
        }
        // Xu ly cd quay/dung
        const cdThumbAnimate = cdThumb.animate([{
            transform: 'rotate(360deg)',
        }],{
            duration: 10000, //10s
            iterations: Infinity, // loop vo han
        })
        cdThumbAnimate.pause();
        // xu ly khi click play
        playBtn.onclick = function(){
            if(app.isPlaying) {
                audio.pause();
            }
            else{   
                audio.play();
            }
        }
        // khi song play 
        audio.onplay = function(){
            app.isPlaying = true;
            status.textContent = 'Now Playing';
            player.classList.add('playing');
            cdThumbAnimate.play();
        }
        //khi song pause
        audio.onpause = function(){
            app.isPlaying = false;
            status.textContent = 'Paused Song';
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // khi tien do bai hat thay doi
        audio.ontimeupdate = function(){
            if(audio.duration){
                const percent = Math.floor(audio.currentTime/audio.duration * 100);
                progress.value = percent;
            }
        }

        // xu ly khi tua song
        progress.onchange = function(e){
            const seekTime = audio.duration/100 * e.target.value;
            audio.currentTime = seekTime;
        }

        // xu ly khi next song
        nextBtn.onclick = function(){
            if(app.isRandom){
                app.randomSong();
            }
            else{
                app.nextSong();
            }
            audio.play();
            app.render();
            app.scrollToAciveSong();
        }
        
        //xu ly khi prev song
        prevBtn.onclick = function(){
            if(app.isRandom){
                app.randomSong();
            }
            else{
                app.prevSong();
            }
            audio.play();
            app.render();
            app.scrollToAciveSong();
        }

        // xu ly khi random song
        randomBtn.onclick = function(){
            app.isRandom = !app.isRandom;
            app.setConfigs('isRandom', app.isRandom);
            randomBtn.classList.toggle('active',app.isRandom);
        }
        
        //xu ly khi repeat song
        repeatBtn.onclick = function(){
            audio.loop = !audio.loop;
            app.setConfigs('isRepeat', audio.loop);
            repeatBtn.classList.toggle('active',audio.loop);
        }
        // xu ly khi song end
        audio.onended = function(){
            if(!audio.loop){
                nextBtn.click();
            }
        }
        // xu ly lang nghe click vao playlist
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)'); 
            if(songNode){
                if(!e.target.closest('.option')){
                    app.currentIndex = Number(songNode.dataset.index);
                    app.loadCurrentSong();
                    app.render();
                    audio.play();
                }
                
            }
        }
    },
    loadConfigs:function(){
        this.isRandom = this.configs.isRandom;
        audio.loop = this.configs.isRepeat; 
    },
    loadCurrentSong:function(){
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.img}')`;
        audio.src = this.currentSong.path;
    },
    nextSong:function(){
        this.currentIndex ++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong:function(){
        this.currentIndex--;
        if(this.currentIndex <0){
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    randomSong:function(){
        let newIndex;
        do{
            newIndex = Math.floor(Math.random() * this.songs.length);
        }while(this.currentIndex === newIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    scrollToAciveSong:function(){
        setTimeout(function(){$('.song.active').scrollIntoView({
            behavior: 'smooth',
            block:'nearest'
        })},200);
    },
    start: function(){
        // gan cau hinh tu configs vao ung dung
        this.loadConfigs();
        // define cac thuoc tinh cho object
        this.definePropertise();

        // listen and handle the event
        this.handleEvent();
        
        // Load bai hat dau tien vao UI 
        this.loadCurrentSong();
        // Render playlist
        this.render()
        repeatBtn.classList.toggle('active',audio.loop);
        randomBtn.classList.toggle('active',this.isRandom);

    }
}
app.start()

