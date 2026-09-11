// ======================== CATALOG & STORE LOGIC ========================
const CATALOG = {
  avatars: [
    {id:'default', icon:'fa-user', name:'Student', cost:0},
    {id:'wizard', icon:'fa-hat-wizard', name:'Wizard', cost:200},
    {id:'robot', icon:'fa-robot', name:'Robot', cost:300},
    {id:'alien', icon:'fa-user-astronaut', name:'Astronaut', cost:350},
    {id:'cat', icon:'fa-cat', name:'Cat', cost:150},
    {id:'ghost', icon:'fa-ghost', name:'Ghost', cost:250}
  ],
  companions: [
    {id:'default', name:'Study Buddy', cost:0},
    {id:'robot_friend', name:'Robo Pal', cost:400},
    {id:'magic_cat', name:'Magic Cat', cost:500}
  ],
  timers: [
    {id:'classic', name:'Classic Wheel', cost:0, desc:'Time Timer style red wheel that shrinks.'},
    {id:'donut', name:'Modern Donut', cost:100, desc:'Clean ring that empties clockwise.'},
    {id:'hourglass', name:'Hourglass', cost:200, desc:'Falling sand measures your progress.'},
    {id:'retro', name:'Retro Power Bar', cost:150, desc:'Vertical power segments drain over time.'}
  ],
   colors: [
    {id:'#FF8C42', name:'Flame Orange', cost:100},
    {id:'#4ECDC4', name:'Calm Teal', cost:100},
    {id:'#FF6B6B', name:'Crimson Red', cost:100},
    {id:'#58A6FF', name:'Neon Blue', cost:100},
    {id:'#A855F7', name:'Royal Purple', cost:100},
    {id:'#22C55E', name:'Emerald Green', cost:100},
    {id:'#EC4899', name:'Hot Pink', cost:100},
    {id:'#FBBF24', name:'Sun Yellow', cost:100}
  ],
  themes: [
    {id:'default', name:'Dark Mode', cost:0, class:''},
    {id:'light', name:'Soft Light', cost:100, class:'light-mode'},
    {id:'forest', name:'Forest Green', cost:150, style:{'--teal':'#22c55e', '--accent':'#84cc16'}},
    {id:'ocean', name:'Deep Ocean', cost:150, style:{'--teal':'#3b82f6', '--accent':'#06b6d4'}}
  ]
};

// ======================== AUDIO ENGINE ========================
const SFX={
  ctx:null,
  init(){if(!this.ctx)this.ctx=new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume();},
  _p(f,d,t,v){if(!Store.get('settings').sounds)return;this.init();const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=t;o.frequency.value=f;g.gain.setValueAtTime(v,this.ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+d);o.connect(g);g.connect(this.ctx.destination);o.start();o.stop(this.ctx.currentTime+d);},
  correct(){this._p(523,.1,'sine',.15);setTimeout(()=>this._p(659,.1,'sine',.15),80);setTimeout(()=>this._p(784,.15,'sine',.15),160);},
  wrong(){this._p(220,.25,'triangle',.1);},
  complete(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>this._p(f,.2,'sine',.15),i*120));},
  tick(){this._p(800,.05,'sine',.05);},
  click(){this._p(600,.04,'sine',.08);},
  bonus(){[659,784,988,1319].forEach((f,i)=>setTimeout(()=>this._p(f,.15,'sine',.12),i*80));},
  nudge(){this._p(440,.08,'triangle',.06);setTimeout(()=>this._p(523,.1,'triangle',.06),120);},
  whoosh(){if(!Store.get('settings').sounds)return;this.init();const c=this.ctx,dur=.5,len=Math.floor(dur*c.sampleRate),buf=c.createBuffer(1,len,c.sampleRate),dp=buf.getChannelData(0);for(let i=0;i<len;i++){const t=i/len;dp[i]=(Math.random()*2-1)*Math.min(1,t*25)*Math.pow(1-t,1.8)*.12;}const src=c.createBufferSource();src.buffer=buf;const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=400;const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.setValueAtTime(1800,c.currentTime);bp.frequency.exponentialRampToValueAtTime(5000,c.currentTime+dur*.5);bp.Q.value=.6;src.connect(hp);hp.connect(bp);bp.connect(c.destination);src.start();}
};

// ======================== AMBIENT SOUND ENGINE (TONE.JS) ========================
const Ambient = {
  volume: 0.35,
  sounds: {
    lofi: { name: 'Lo-Fi Chill', icon: 'fa-music', playing: false, nodes: null },
    brown: { name: 'Brown Noise', icon: 'fa-wave-square', playing: false, nodes: null },
    pink: { name: 'Pink Noise', icon: 'fa-water', playing: false, nodes: null },
    white: { name: 'White Noise', icon: 'fa-wind', playing: false, nodes: null },
    rain: { name: 'Rain & Storm', icon: 'fa-cloud-showers-heavy', playing: false, nodes: null },
    binaural: { name: 'Beta Waves', icon: 'fa-brain', playing: false, nodes: null },
    ocean: { name: 'Ocean Waves', icon: 'fa-umbrella-beach', playing: false, nodes: null },
    wind: { name: 'Forest Breeze', icon: 'fa-leaf', playing: false, nodes: null },
    cafe: { name: 'Cafe Murmur', icon: 'fa-mug-hot', playing: false, nodes: null }
  },

  async initTone() {
    if (window.Tone && Tone.context && Tone.context.state !== 'running') {
      await Tone.start();
    }
  },

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, parseFloat(v)));
    if (!window.Tone) return;
    const db = this.volume <= 0.001 ? -100 : Tone.gainToDb(this.volume);
    Tone.getDestination().volume.rampTo(db, 0.1);
  },

  async toggle(type) {
    if (!Store.get('settings').sounds) {
      toast('Turn on sounds in Settings first', 'warn');
      return;
    }
    if (!window.Tone) {
      toast('Tone.js audio engine loading...', 'info');
      return;
    }
    await this.initTone();

    const snd = this.sounds[type];
    if (!snd) return;

    if (snd.playing) {
      this.stopSound(type);
    } else {
      this.startSound(type);
    }

    this.updateUI();
  },

  async applyPreset(preset) {
    if (!Store.get('settings').sounds) {
      toast('Turn on sounds in Settings first', 'warn');
      return;
    }
    if (!window.Tone) return;
    await this.initTone();

    this.stopAll();

    const presets = {
      adhd: ['brown', 'binaural'],
      lofi: ['lofi', 'rain'],
      nature: ['ocean', 'wind'],
      cafe: ['cafe', 'white']
    };

    const targetList = presets[preset] || [];
    targetList.forEach(t => this.startSound(t));
    this.updateUI();
    toast(`Preset loaded!`, 'info');
  },

  stopAll() {
    Object.keys(this.sounds).forEach(type => {
      if (this.sounds[type].playing) {
        this.stopSound(type);
      }
    });
    this.updateUI();
  },

  isPlaying(type) {
    return this.sounds[type] ? this.sounds[type].playing : false;
  },

  updateUI() {
    Object.keys(this.sounds).forEach(type => {
      const btn = document.getElementById('amb-' + type);
      if (btn) {
        btn.classList.toggle('active', this.sounds[type].playing);
      }
    });
    const activeCount = Object.values(this.sounds).filter(s => s.playing).length;
    const badge = document.getElementById('amb-active-count');
    if (badge) {
      badge.textContent = activeCount > 0 ? `${activeCount} active` : 'Off';
    }
  },

  startSound(type) {
    const snd = this.sounds[type];
    if (!snd) return;

    try {
      if (type === 'brown') {
        const noise = new Tone.Noise("brown");
        const filter = new Tone.Filter(320, "lowpass");
        const gain = new Tone.Gain(0.7);
        noise.connect(filter);
        filter.connect(gain);
        gain.toDestination();
        noise.start();
        snd.nodes = { noise, filter, gain };
      } else if (type === 'pink') {
        const noise = new Tone.Noise("pink");
        const filter = new Tone.Filter(900, "lowpass");
        const gain = new Tone.Gain(0.5);
        noise.connect(filter);
        filter.connect(gain);
        gain.toDestination();
        noise.start();
        snd.nodes = { noise, filter, gain };
      } else if (type === 'white') {
        const noise = new Tone.Noise("white");
        const filterHP = new Tone.Filter(500, "highpass");
        const filterLP = new Tone.Filter(2800, "lowpass");
        const gain = new Tone.Gain(0.18);
        noise.connect(filterHP);
        filterHP.connect(filterLP);
        filterLP.connect(gain);
        gain.toDestination();
        noise.start();
        snd.nodes = { noise, filterHP, filterLP, gain };
      } else if (type === 'rain') {
        const noise = new Tone.Noise("pink");
        const filter = new Tone.AutoFilter({
          frequency: 0.15,
          baseFrequency: 350,
          octaves: 2.2
        }).start();
        const gain = new Tone.Gain(0.55);

        const thunderSynth = new Tone.MembraneSynth({
          pitchDecay: 0.1,
          octaves: 3,
          oscillator: { type: "sine" },
          envelope: { attack: 0.2, decay: 2.2, sustain: 0, release: 1 }
        });
        const thunderFilter = new Tone.Filter(110, "lowpass");
        const thunderGain = new Tone.Gain(0.35);
        thunderSynth.connect(thunderFilter);
        thunderFilter.connect(thunderGain);
        thunderGain.toDestination();

        const thunderLoop = new Tone.Loop(time => {
          if (Math.random() > 0.65) {
            thunderSynth.triggerAttackRelease("C1", "2n", time);
          }
        }, "8m").start(0);

        noise.connect(filter);
        filter.connect(gain);
        gain.toDestination();
        noise.start();

        if (Tone.Transport.state !== 'started') Tone.Transport.start();

        snd.nodes = { noise, filter, gain, thunderSynth, thunderFilter, thunderGain, thunderLoop };
      } else if (type === 'lofi') {
        const poly = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "triangle" },
          envelope: { attack: 0.12, decay: 1.2, sustain: 0.35, release: 1.8 }
        });

        const chorus = new Tone.Chorus(2.5, 3, 0.45).start();
        const lofiFilter = new Tone.Filter(850, "lowpass");
        const reverb = new Tone.Freeverb({ roomSize: 0.65, dampening: 2500 });
        const synthGain = new Tone.Gain(0.3);

        poly.chain(chorus, lofiFilter, reverb, synthGain, Tone.getDestination());

        const vinyl = new Tone.Noise("white");
        const vinylFilter = new Tone.Filter({ frequency: 2200, type: "bandpass", Q: 2.5 });
        const vinylGain = new Tone.Gain(0.035);
        vinyl.chain(vinylFilter, vinylGain, Tone.getDestination());
        vinyl.start();

        const chords = [
          ["Eb3", "G3", "Bb3", "D4"],
          ["C3", "Eb3", "G3", "Bb3"],
          ["F3", "Ab3", "C4", "Eb4"],
          ["Bb2", "D3", "F3", "Ab3"]
        ];
        let chordIdx = 0;

        const lofiLoop = new Tone.Loop(time => {
          const currentChord = chords[chordIdx % chords.length];
          poly.triggerAttackRelease(currentChord, "2n", time);
          poly.triggerAttackRelease(currentChord[3], "4n", time + Tone.Time("4n").toSeconds());
          chordIdx++;
        }, "1m").start(0);

        Tone.Transport.bpm.value = 66;
        if (Tone.Transport.state !== 'started') Tone.Transport.start();

        snd.nodes = { poly, chorus, lofiFilter, reverb, synthGain, vinyl, vinylFilter, vinylGain, lofiLoop };
      } else if (type === 'binaural') {
        const oscLeft = new Tone.Oscillator(200, "sine");
        const pannerLeft = new Tone.Panner(-1);
        const gainLeft = new Tone.Gain(0.22);
        oscLeft.chain(pannerLeft, gainLeft, Tone.getDestination());

        const oscRight = new Tone.Oscillator(214, "sine");
        const pannerRight = new Tone.Panner(1);
        const gainRight = new Tone.Gain(0.22);
        oscRight.chain(pannerRight, gainRight, Tone.getDestination());

        oscLeft.start();
        oscRight.start();

        snd.nodes = { oscLeft, pannerLeft, gainLeft, oscRight, pannerRight, gainRight };
      } else if (type === 'ocean') {
        const noise = new Tone.Noise("brown");
        const filter = new Tone.Filter(200, "lowpass");
        const lfo = new Tone.LFO(0.08, 140, 750);
        const gain = new Tone.Gain(0.55);

        lfo.connect(filter.frequency);
        noise.connect(filter);
        filter.connect(gain);
        gain.toDestination();

        lfo.start();
        noise.start();

        snd.nodes = { noise, filter, lfo, gain };
      } else if (type === 'wind') {
        const noise = new Tone.Noise("pink");
        const filter = new Tone.Filter({ frequency: 550, type: "bandpass", Q: 3.5 });
        const lfo = new Tone.LFO(0.12, 280, 1100);
        const gain = new Tone.Gain(0.35);

        lfo.connect(filter.frequency);
        noise.connect(filter);
        filter.connect(gain);
        gain.toDestination();

        lfo.start();
        noise.start();

        snd.nodes = { noise, filter, lfo, gain };
      } else if (type === 'cafe') {
        const noise1 = new Tone.Noise("pink");
        const filter1 = new Tone.Filter(550, "bandpass");
        const gain1 = new Tone.Gain(0.28);

        const noise2 = new Tone.Noise("brown");
        const filter2 = new Tone.Filter(280, "lowpass");
        const gain2 = new Tone.Gain(0.28);

        noise1.connect(filter1);
        filter1.connect(gain1);
        gain1.toDestination();

        noise2.connect(filter2);
        filter2.connect(gain2);
        gain2.toDestination();

        noise1.start();
        noise2.start();

        snd.nodes = { noise1, filter1, gain1, noise2, filter2, gain2 };
      }

      snd.playing = true;
    } catch (e) {
      console.error("Error starting Tone sound:", type, e);
      toast("Could not start sound engine", "warn");
      snd.playing = false;
    }
  },

  stopSound(type) {
    const snd = this.sounds[type];
    if (!snd || !snd.playing || !snd.nodes) return;

    try {
      const n = snd.nodes;
      if (n.noise) n.noise.stop();
      if (n.noise1) n.noise1.stop();
      if (n.noise2) n.noise2.stop();
      if (n.vinyl) n.vinyl.stop();
      if (n.oscLeft) n.oscLeft.stop();
      if (n.oscRight) n.oscRight.stop();
      if (n.lfo) n.lfo.stop();
      if (n.lofiLoop) n.lofiLoop.dispose();
      if (n.thunderLoop) n.thunderLoop.dispose();
      if (n.thunderSynth) n.thunderSynth.dispose();
      if (n.poly) n.poly.dispose();

      Object.keys(n).forEach(k => {
        if (n[k] && typeof n[k].dispose === 'function') {
          try { n[k].dispose(); } catch (err) {}
        }
      });
    } catch (e) {
      console.error("Error stopping Tone sound:", type, e);
    }

    snd.nodes = null;
    snd.playing = false;

    const anyActive = Object.values(this.sounds).some(s => s.playing);
    if (!anyActive && window.Tone && Tone.Transport) {
      Tone.Transport.stop();
    }
  },

  renderSoundscapeCard() {
    const activeCount = Object.values(this.sounds).filter(s => s.playing).length;
    return `
      <div class="card" style="margin-bottom:16px; padding:16px; background:var(--card);">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <i class="fas fa-headphones" style="color:var(--teal); font-size:16px;"></i>
            <span style="font-weight:700; font-size:14px;">Focus Soundscape</span>
            <span class="tag" style="background:var(--teal-g); color:var(--teal); font-size:11px;" id="amb-active-count">${activeCount > 0 ? `${activeCount} active` : 'Off'}</span>
          </div>
          <div style="display:flex; align-items:center; gap:10px; margin-left:auto;">
            <i class="fas fa-volume-high" style="color:var(--text2); font-size:12px;"></i>
            <input type="range" min="0" max="100" value="${Math.round(this.volume * 100)}" class="amb-slider" id="amb-vol" oninput="Ambient.setVolume(this.value/100)" title="Volume" style="width:80px;">
            <button class="btn btn-sm btn-ghost" onclick="Ambient.stopAll(); SFX.click();" style="border:1px solid var(--border); font-size:11px; padding:4px 8px;">Mute All</button>
          </div>
        </div>

        <div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:8px; margin-bottom:12px;" class="no-scrollbar">
          <span style="font-size:11px; color:var(--text2); display:flex; align-items:center; font-weight:700; padding-right:4px;">Presets:</span>
          <button class="amb-btn" onclick="Ambient.applyPreset('adhd'); SFX.click();" style="font-size:11px; padding:4px 10px;"><i class="fas fa-brain" style="color:var(--accent);"></i> ADHD Focus</button>
          <button class="amb-btn" onclick="Ambient.applyPreset('lofi'); SFX.click();" style="font-size:11px; padding:4px 10px;"><i class="fas fa-music" style="color:#D8B4FE;"></i> Cozy Lo-Fi</button>
          <button class="amb-btn" onclick="Ambient.applyPreset('nature'); SFX.click();" style="font-size:11px; padding:4px 10px;"><i class="fas fa-tree" style="color:var(--green);"></i> Nature</button>
          <button class="amb-btn" onclick="Ambient.applyPreset('cafe'); SFX.click();" style="font-size:11px; padding:4px 10px;"><i class="fas fa-mug-hot" style="color:var(--teal);"></i> Cafe</button>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(115px, 1fr)); gap:8px;">
          ${Object.keys(this.sounds).map(k => {
            const s = this.sounds[k];
            return `<button class="amb-btn ${s.playing ? 'active' : ''}" id="amb-${k}" onclick="Ambient.toggle('${k}'); SFX.click();" style="justify-content:center; padding:8px 6px; font-size:12px;">
              <i class="fas ${s.icon}"></i> ${s.name}
            </button>`;
          }).join('')}
        </div>
      </div>
    `;
  }
};

// ======================== DATA STORE ========================
function getLocalDateStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const Store={
  _d:{user:null,sessions:[],games:[],quests:{},thoughts:[],totalXP:0,streak:0,lastActive:null,settings:{focusDuration:10,breakDuration:3,sounds:true,whitelist:['khanacademy.org','docs.google.com','classroom.google.com','ekb.eg','nafham.com'],strictMode:false},inventory:{avatars:['default'],companions:['default'],timers:['classic'],themes:['default'],equipped:{avatar:'default',companion:'default',timer:'classic',theme:'default'}}},
  load(){
    try{
      const r=localStorage.getItem('spark_data');
      this._d=r?{...this._d,...JSON.parse(r)}:{...this._d};
      if(!this._d.inventory){
        this._d.inventory={avatars:['default'],companions:['default'],timers:['classic'],colors:['#FF8C42'],themes:['default'],equipped:{avatar:'default',companion:'default',timer:'classic',color:'#FF8C42',theme:'default'}};
      }
      if(!this._d.inventory.timers){
        this._d.inventory.timers=['classic'];
      }
      if(!this._d.inventory.colors){
        const u = this._d.user;
        this._d.inventory.colors = u && u.color ? [u.color] : ['#FF8C42'];
      }
      if(!this._d.inventory.equipped){
        this._d.inventory.equipped={avatar:'default',companion:'default',timer:'classic',color:'#FF8C42',theme:'default'};
      }
      if(!this._d.inventory.equipped.timer){
        this._d.inventory.equipped.timer='classic';
      }
      if(!this._d.inventory.equipped.color){
        const u = this._d.user;
        this._d.inventory.equipped.color = u && u.color ? u.color : '#FF8C42';
      }
      if(!this._d.focusPresets){
        this._d.focusPresets = [
          { id: 'p_pomo', name: 'Pomodoro Classic', focusMin: 25, breakMin: 5, soundscape: 'brown', icon: 'fa-clock' },
          { id: 'p_deep', name: 'Deep Work', focusMin: 50, breakMin: 10, soundscape: 'lofi', icon: 'fa-brain' },
          { id: 'p_adhd', name: 'ADHD Sprint', focusMin: 15, breakMin: 3, soundscape: 'adhd', icon: 'fa-bolt' },
          { id: 'p_burst', name: 'Quick Burst', focusMin: 10, breakMin: 2, soundscape: 'cafe', icon: 'fa-fire' }
        ];
      }
      if(!this._d.settings.dailyGoalMin) this._d.settings.dailyGoalMin = 30;
      if(!this._d.moodLogs) this._d.moodLogs = [];
      if(!this._d.journalLogs) this._d.journalLogs = [];
      let storedNotes = null;
      try {
        const raw = localStorage.getItem('spark_sticky_notes') || localStorage.getItem('sticky_notes') || localStorage.getItem('stickyNotes');
        if (raw !== null) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) storedNotes = parsed;
        }
      } catch(e) {}
      if (storedNotes !== null) {
        this._d.stickyNotes = storedNotes;
      } else if(!this._d.stickyNotes) {
        this._d.stickyNotes = [
          {
            id: 'sn_welcome',
            text: '📌 Quick Note:\n• Drag me anywhere on screen.\n• Write reminders or ideas.\n• Minimize me (-) when busy!\n• Scatter or stack notes anytime.',
            color: 'yellow',
            x: Math.max(260, (typeof window !== 'undefined' ? window.innerWidth : 1000) - 280),
            y: 80,
            width: 230,
            height: 200,
            minimized: false,
            zIndex: 100
          }
        ];
      }
      if(!this._d.tasks){
        this._d.tasks = [
          {
            id: 'task_sample_1',
            title: 'Math Homework Chapter 3',
            category: 'Homework',
            estMin: 20,
            completed: false,
            created: Date.now(),
            steps: [
              { text: 'Get pencil and notebook ready', done: true },
              { text: 'Solve problems 1 to 5', done: false },
              { text: 'Check answers in workbook', done: false }
            ]
          },
          {
            id: 'task_sample_2',
            title: 'Read Biology Chapter',
            category: 'Reading',
            estMin: 15,
            completed: false,
            created: Date.now() - 1000,
            steps: [
              { text: 'Read pages 45 to 50', done: false },
              { text: 'Jot down 3 key takeaways', done: false }
            ]
          }
        ];
      }
      if(!this._d.scheduleEvents){
        this._d.scheduleEvents = [
          {
            id: 'evt_math',
            title: 'Mathematics (Algebra & Sets)',
            category: 'Class',
            color: '#3B82F6',
            days: [1, 3, 5],
            startTime: '09:00',
            endTime: '10:00',
            location: 'Room 204',
            notes: 'Bring formulas, calculator & notebook'
          },
          {
            id: 'evt_eng',
            title: 'English Language & Reading',
            category: 'Class',
            color: '#A855F7',
            days: [1, 3],
            startTime: '10:30',
            endTime: '11:45',
            location: 'Room 102',
            notes: 'Vocabulary & comprehension analysis'
          },
          {
            id: 'evt_sci',
            title: 'Science & Physics Lab',
            category: 'Class',
            color: '#10B981',
            days: [2, 4],
            startTime: '09:30',
            endTime: '11:00',
            location: 'Science Lab B',
            notes: 'Lab workbook & safety procedures'
          },
          {
            id: 'evt_hist',
            title: 'Social Studies & History',
            category: 'Class',
            color: '#F59E0B',
            days: [2, 4],
            startTime: '11:30',
            endTime: '12:30',
            location: 'Hall 3',
            notes: 'Civilization timelines'
          },
          {
            id: 'evt_focus',
            title: 'Daily Deep Focus & Study Sprint',
            category: 'Study',
            color: '#FF8C42',
            days: [1, 2, 3, 4, 5],
            startTime: '16:00',
            endTime: '17:00',
            location: 'Study Desk',
            notes: 'ADHD focus block: lo-fi noise & Spark timer'
          },
          {
            id: 'evt_sports',
            title: 'Sports & PE Activity',
            category: 'Activity',
            color: '#EC4899',
            days: [2, 5],
            startTime: '14:30',
            endTime: '15:30',
            location: 'Sports Field',
            notes: 'Movement break & hydration'
          }
        ];
      }
      if(!this._d.routines){
        this._d.routines = [
          {
            id: 'rt_morning',
            title: 'Morning Focus Kickoff',
            slot: 'morning',
            targetTime: '07:30',
            icon: 'fa-sun',
            color: '#FF8C42',
            days: [1, 2, 3, 4, 5],
            steps: [
              'Drink a full glass of water',
              'Check backpack & materials for today',
              'Review today’s timetable on Spark'
            ]
          },
          {
            id: 'rt_afternoon',
            title: 'Afternoon Brain Reset',
            slot: 'afternoon',
            targetTime: '15:15',
            icon: 'fa-bolt',
            color: '#4ECDC4',
            days: [1, 2, 3, 4, 5],
            steps: [
              '10-minute stretch & healthy snack',
              'Check off school classes completed',
              'Launch 25-minute Pomodoro focus block'
            ]
          },
          {
            id: 'rt_evening',
            title: 'Evening Wind Down & Prep',
            slot: 'evening',
            targetTime: '20:30',
            icon: 'fa-moon',
            color: '#8B5CF6',
            days: [1, 2, 3, 4, 5, 6, 0],
            steps: [
              'Review 10 flashcards on Spark',
              'Check tomorrow’s schedule & prep clothes',
              'Disconnect screens 30m before sleep'
            ]
          }
        ];
      }
      if(!this._d.routineLogs) this._d.routineLogs = {};
      if(this._d.tasks){
        const curDate = getLocalDateStr(new Date());
        this._d.tasks.forEach((t, i) => {
          if (!t.scheduledDate) {
            t.scheduledDate = curDate;
            t.scheduledTime = i === 0 ? '16:00' : '17:00';
          }
        });
      }
    }catch(e){this._d={...this._d};}
  },
  save(){
    try{
      localStorage.setItem('spark_data',JSON.stringify(this._d));
      if (Array.isArray(this._d.stickyNotes)) {
        const snJson = JSON.stringify(this._d.stickyNotes);
        localStorage.setItem('spark_sticky_notes', snJson);
        localStorage.setItem('sticky_notes', snJson);
        localStorage.setItem('stickyNotes', snJson);
      }
    }catch(e){}
  },
  get(k){return this._d[k];},set(k,v){this._d[k]=v;this.save();},
  addXP(a){this._d.totalXP=(this._d.totalXP||0)+a;this.save();},
  updateStreak(){const t=new Date().toDateString(),l=this._d.lastActive;if(l===t)return;const y=new Date(Date.now()-86400000).toDateString();this._d.streak=(l===y)?(this._d.streak||0)+1:1;this._d.lastActive=t;this.save();},
  getSessionStats(d=7){const c=Date.now()-d*86400000;return this._d.sessions.filter(s=>new Date(s.date).getTime()>c);}
};
Store.load();

// ======================== RESOURCES ========================
const RESOURCES=[
  {name:"MOE E-Learning Portal",url:"https://studentbooks.moe.gov.eg/",desc:"Official source for PDF textbooks and interactive workbooks for every grade.",grades:[1,2,3,4,5,6,7,8,9,10,11,12],subjects:["Arabic","Math","Science","English","Social Studies"],icon:"fa-book",color:"#E11D48"},
  {name:"Egyptian Knowledge Bank",url:"https://www.ekb.eg",desc:"Massive digital library. The 'Study' section has curriculum-specific videos and quizzes.",grades:[1,2,3,4,5,6,7,8,9,10,11,12],subjects:["Arabic","Math","Science","English","Social Studies"],icon:"fa-landmark",color:"#F59E0B"},
  {name:"Madrasetna — Primary",url:"https://www.youtube.com/@Madrasetna1",desc:"Ministry of Education's official video lessons for primary stage.",grades:[1,2,3,4,5,6],subjects:["Arabic","Math","Science","English"],icon:"fa-chalkboard-teacher",color:"#14BF96"},
  {name:"Madrasetna — Preparatory",url:"https://www.youtube.com/@Madrasetna2",desc:"Ministry of Education's official video lessons for preparatory stage.",grades:[7,8,9],subjects:["Arabic","Math","Science","English","Social Studies"],icon:"fa-chalkboard-teacher",color:"#14BF96"},
  {name:"Madrasetna — Secondary",url:"https://www.youtube.com/@MadrasetnaSecondary",desc:"Ministry of Education's official video lessons for secondary/thanawya stage.",grades:[10,11,12],subjects:["Arabic","Math","Physics","Chemistry","Biology","Philosophy"],icon:"fa-chalkboard-teacher",color:"#14BF96"},
  {name:"Nafham",url:"https://www.youtube.com/nafham",desc:"Quick, student-to-student style explanations of specific textbook lessons.",grades:[1,2,3,4,5,6,7,8,9,10,11,12],subjects:["Arabic","Math","Science","English","Social Studies"],icon:"fa-play-circle",color:"#3B82F6"},
  {name:"Khan Academy Arabic",url:"https://ar.khanacademy.org",desc:"Full Arabic version with math and science lessons plus practice exercises.",grades:[1,2,3,4,5,6,7,8,9,10,11,12],subjects:["Math","Science"],icon:"fa-graduation-cap",color:"#8B5CF6"},
  {name:"Learning Passport",url:"https://egypt.learningpassport.org",desc:"Literacy, numeracy, and life skills activities for Egyptian primary students.",grades:[1,2,3,4,5,6],subjects:["Arabic","Math","English"],icon:"fa-passport",color:"#06B6D4"},
  {name:"Starfall",url:"https://www.starfall.com",desc:"English phonics and reading for grades 1–2.",grades:[1,2],subjects:["English"],icon:"fa-star",color:"#F59E0B"},
  {name:"ABCya!",url:"https://www.abcya.com",desc:"Educational games organized by grade level and skill.",grades:[1,2,3,4,5],subjects:["Math","English","Science"],icon:"fa-shapes",color:"#EC4899"},
  {name:"Math Playground",url:"https://www.mathplayground.com",desc:"Math games, logic puzzles, and word problems for primary.",grades:[1,2,3,4,5,6],subjects:["Math"],icon:"fa-calculator",color:"#F43F5E"},
  {name:"Storyline Online",url:"https://www.storylineonline.net",desc:"Actors read picture books aloud. Great for English listening skills.",grades:[1,2,3],subjects:["English"],icon:"fa-book-open",color:"#A855F7"},
  {name:"SplashLearn",url:"https://www.splashlearn.com",desc:"Structured math and reading practice with a game-like feel.",grades:[1,2,3,4,5],subjects:["Math","English"],icon:"fa-water",color:"#38BDF8"},
  {name:"PhET Simulations",url:"https://phet.colorado.edu/sims/html",desc:"Interactive virtual labs for science and math. See how atoms, circuits, or fractions work.",grades:[4,5,6,7,8,9,10,11,12],subjects:["Science","Physics","Chemistry","Math"],icon:"fa-atom",color:"#10B981"},
  {name:"Ducksters",url:"https://www.ducksters.com",desc:"Clear articles for social studies, history, and geography research.",grades:[4,5,6,7,8,9],subjects:["Social Studies","History","Science"],icon:"fa-feather",color:"#FBBF24"},
  {name:"CrashCourse Kids",url:"https://www.youtube.com/@CrashCourseKids",desc:"Engaging science videos for preparatory-level biology and physics concepts.",grades:[4,5,6,7,8],subjects:["Science"],icon:"fa-flask",color:"#F97316"},
  {name:"GeoGebra",url:"https://www.geogebra.org",desc:"Free graphing calculator and geometry tools. Essential for geometry and algebra in grades 7–12.",grades:[7,8,9,10,11,12],subjects:["Math"],icon:"fa-chart-line",color:"#22C55E"},
  {name:"Hessas Misr",url:"https://www.hesas.eg",desc:"Exam-focused video lessons and practice. Free only with your official @moe.edu.eg school email.",grades:[10,11,12],subjects:["Math","Physics","Chemistry","Biology","Arabic","Philosophy"],icon:"fa-pencil",color:"#E11D48"},
  {name:"The Organic Chemistry Tutor",url:"https://www.youtube.com/@TheOrganicChemistryTutor",desc:"Despite the name — the best free resource for high school physics and math problem solving.",grades:[10,11,12],subjects:["Physics","Chemistry","Math"],icon:"fa-flask",color:"#06B6D4"},
  {name:"CrashCourse",url:"https://www.youtube.com/@CrashCourse",desc:"Fast-paced, high-quality overviews of philosophy, history, biology, and physics.",grades:[9,10,11,12],subjects:["Philosophy","History","Biology","Physics"],icon:"fa-bolt",color:"#F59E0B"},
  {name:"Flipping Physics",url:"https://www.flippingphysics.com",desc:"Physics explanations with real demonstrations. Great for the mechanics part of thanawya.",grades:[10,11,12],subjects:["Physics"],icon:"fa-atom",color:"#3B82F6"},
  {name:"MIT OpenCourseWare",url:"https://ocw.mit.edu",desc:"Free MIT course materials. For advanced grade 12 students looking ahead to university.",grades:[11,12],subjects:["Physics","Chemistry","Biology","Math"],icon:"fa-university",color:"#A855F7"}
];

// ======================== PAUSE NUDGE MESSAGES ========================
const PAUSE_MSGS=[
  {t:"Still there?",b:"Let's finish this last step so you can take a proper break guilt-free later."},
  {t:"Hey, welcome back",b:"You drifted — that's totally normal. One more step and then you can rest for real."},
  {t:"Quick check-in",b:"The hardest part is already done — you started. Let's get through this together."},
  {t:"You're doing great",b:"Pausing and coming back is actually a skill. Let's finish what you started."},
  {t:"Gentle nudge",b:"Your brain might be looking for something easier. That's okay. But you'll feel better if you finish this."},
  {t:"Small reminder",b:"You don't need to do everything — just the next tiny step. That's it."},
  {t:"Here with you",b:"It's normal to pause. What matters is that you come back. Ready for one more step?"}
];

// ======================== TOAST / MODAL ========================
function toast(m,t='success'){const e=document.createElement('div');e.className=`toast toast-${t}`;const i={success:'fa-check-circle',info:'fa-info-circle',warn:'fa-exclamation-triangle',bonus:'fa-gift'};e.innerHTML=`<i class="fas ${i[t]||i.info}"></i>${m}`;document.getElementById('toast-container').appendChild(e);setTimeout(()=>e.remove(),t==='bonus'?4000:3000);}
function showModal(h){document.getElementById('modal-root').innerHTML=`<div class="modal-overlay" id="modal-overlay"><div class="modal">${h}</div></div>`;document.getElementById('modal-overlay').addEventListener('click',e=>{if(e.target.id==='modal-overlay')closeModal();});}
function closeModal(){document.getElementById('modal-root').innerHTML='';}

// ======================== TASK BREAKER ========================
function breakDownTask(task){
  const t=task.toLowerCase();
  const m={homework:['Get your supplies ready','Read the instructions carefully','Start with the first question','Work through each problem','Check your answers','Put everything in your folder'],read:['Find your book or article','Get comfortable and focused','Open to the right page','Read the first paragraph','Keep reading at your own pace','Write down one thing you learned'],write:['Open your notebook or document','Write the title or heading','Write the first sentence — any sentence','Add a few more details','Read what you wrote so far','Fix any spelling or mistakes'],math:['Get your pencil and paper ready','Look at the first problem carefully','Write down what you know','Solve it step by step','Check your answer makes sense','Move to the next problem'],study:['Gather your notes and materials','Review the main ideas first','Close your notes and test yourself','Mark anything you forgot','Review the weak spots again','Take a short break'],project:['Read the project requirements','Brainstorm a few ideas','Pick the best idea','Gather what you need','Work on the first part','Keep building it step by step'],default:['Get everything you need ready','Figure out the very first small step','Do just that one step','Look at what comes next','Keep going one step at a time','Review what you did']};
  let k='default';
  if(t.includes('homework')||t.includes('hw'))k='homework';else if(t.includes('read')||t.includes('book')||t.includes('chapter'))k='read';else if(t.includes('write')||t.includes('essay')||t.includes('paragraph')||t.includes('story'))k='write';else if(t.includes('math')||t.includes('calculate')||t.includes('multiply')||t.includes('divide'))k='math';else if(t.includes('study')||t.includes('review')||t.includes('memorize')||t.includes('practice'))k='study';else if(t.includes('project')||t.includes('poster')||t.includes('presentation'))k='project';
  return[...m[k]];
}

// ======================== ROUTER ========================
let currentView='dashboard';const VN=['dashboard','focus','planner','schedule','wellness','learn','flashcards','store','resources','progress','settings'];
function navigate(v){if(!VN.includes(v))return;currentView=v;document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('active',a.dataset.view===v));document.querySelectorAll('.view').forEach(el=>el.classList.remove('active'));document.getElementById('view-'+v).classList.add('active');renderView(v);document.getElementById('sidebar').classList.remove('open');if(v!=='focus')cleanupFocus();if(v!=='learn')stopGame();if(v!=='flashcards')cleanupFlash();if(v!=='wellness')cleanupBreathing();}
function renderView(v){({dashboard:renderDashboard,focus:renderFocus,planner:renderPlanner,schedule:renderSchedule,wellness:renderWellness,learn:renderLearn,flashcards:renderFlashcards,store:renderStore,resources:renderResources,progress:renderProgress,settings:renderSettings})[v]?.();}

// ======================== USER PANEL ========================
function updateUserPanel(){const u=Store.get('user'),inv=Store.get('inventory'),p=document.getElementById('user-panel');if(!u){p.innerHTML='';return;}const s=Store.get('streak')||0;const av=CATALOG.avatars.find(a=>a.id===inv.equipped.avatar)||CATALOG.avatars[0];p.innerHTML=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><div style="width:36px;height:36px;border-radius:50%;background:${u.color};display:flex;align-items:center;justify-content:center;font-size:15px;color:#fff"><i class="fas ${av.icon}"></i></div><div><div style="font-weight:700;font-size:14px">${u.name}</div><div style="font-size:12px;color:var(--text2)">Grade ${u.grade}</div></div></div><div class="streak-badge"><i class="fas fa-fire"></i>${s} day streak</div>`;}

// ======================== QUEST SYSTEM ========================
function getTodayQuests(){const t=new Date().toDateString();let q=Store.get('quests')[t];if(!q){q={focus:false,game:false,resource:false};const qs=Store.get('quests');qs[t]=q;Store.set('quests',qs);}return q;}
function completeQuest(type){const t=new Date().toDateString(),qs=Store.get('quests');if(!qs[t])qs[t]={focus:false,game:false,resource:false};if(!qs[t][type]){qs[t][type]=true;Store.set('quests',qs);const c=Object.values(qs[t]).filter(Boolean).length;if(c===3){Store.addXP(50);toast('All daily quests done! +50 XP bonus!','success');}else toast('Quest completed!','success');}}

// ======================== THOUGHT DUMP ========================
function dumpThought(){const inp=document.getElementById('thought-input');if(!inp)return;const text=inp.value.trim();if(!text)return;inp.value='';const thoughts=Store.get('thoughts');thoughts.unshift({text,date:new Date().toISOString()});if(thoughts.length>100)thoughts.length=100;Store.set('thoughts',thoughts);const area=document.getElementById('thought-float-area');if(area){const b=document.createElement('div');b.className='thought-bubble';b.textContent=text;area.appendChild(b);setTimeout(()=>b.remove(),1500);}SFX.whoosh();setTimeout(()=>inp.focus(),50);}
document.addEventListener('keydown',e=>{if(e.target.id==='thought-input'&&e.key==='Enter'){e.preventDefault();dumpThought();}});

// ======================== DASHBOARD ========================
function renderDashboard(){
  const u=Store.get('user');if(!u)return;Store.updateStreak();updateUserPanel();
  const q=getTodayQuests(),ws=Store.getSessionStats(7),tfm=ws.reduce((s,x)=>s+x.duration,0);
  const wg=Store.get('games').filter(g=>new Date(g.date).getTime()>Date.now()-7*86400000),wxp=wg.reduce((s,g)=>s+g.xp,0);
  const ts=Store.get('sessions').filter(s=>new Date(s.date).toDateString()===new Date().toDateString()),ttf=ts.reduce((s,x)=>s+x.duration,0);
  const s=Store.get('settings')||{};
  const dailyGoal=s.dailyGoalMin||30;
  const goalPct=Math.min(100,Math.round((ttf/dailyGoal)*100));
  const activeTasks=(Store.get('tasks')||[]).filter(t=>!t.completed);

  const todayDateStr = getLocalDateStr(new Date());
  const todayDayIdx = new Date().getDay();
  const allEvents = Store.get('scheduleEvents') || [];
  const todayEvents = allEvents.filter(e => (e.days && e.days.includes(todayDayIdx)) || e.specificDate === todayDateStr);
  const todayScheduledTasks = (Store.get('tasks') || []).filter(t => t.scheduledDate === todayDateStr && !t.completed);

  document.getElementById('view-dashboard').innerHTML=`<div style="max-width:960px;margin:0 auto">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:28px"><div><h1 style="font-size:28px;font-weight:700;margin-bottom:4px">Welcome back, ${u.name}</h1><p style="color:var(--text2);font-size:15px">Here's what's on your plate today. Just pick one thing to start.</p></div><div class="tag" style="background:rgba(255,140,66,.12);color:var(--accent);font-size:14px;padding:6px 14px"><i class="fas fa-bolt"></i> ${Store.get('totalXP')} XP total</div></div>

    <!-- Daily Goal & Active Tasks Widget -->
    <div class="card" style="margin-bottom:24px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
        <h3 style="font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-list-check" style="color:var(--teal);"></i> Task Planner & Daily Goal
        </h3>
        <button class="btn btn-sm btn-ghost" onclick="navigate('planner')" style="font-size:12px;border:1px solid var(--border);">
          Open Planner <i class="fas fa-arrow-right"></i>
        </button>
      </div>

      <!-- Goal Mini Progress Bar -->
      <div style="margin-bottom:16px;padding:12px 14px;background:var(--bg);border-radius:10px;">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;">
          <span style="font-weight:700;">Daily Focus Goal</span>
          <span style="color:var(--teal);font-weight:700;">${ttf} / ${dailyGoal} mins (${goalPct}%)</span>
        </div>
        <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden;">
          <div style="height:100%;width:${goalPct}%;background:var(--teal);border-radius:3px;transition:width 0.4s ease;"></div>
        </div>
      </div>

      <!-- Quick Tasks -->
      ${!activeTasks.length?`
        <div style="text-align:center;padding:12px;color:var(--text2);font-size:13px;">
          No active tasks right now. <button class="btn btn-sm btn-teal" onclick="showAddTaskModal()" style="margin-left:8px;"><i class="fas fa-plus"></i> Add a Task</button>
        </div>
      `:`
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${activeTasks.slice(0,3).map(t=>`
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;background:var(--bg);border-radius:10px;">
              <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(t.title)}</div>
                <div style="font-size:12px;color:var(--text2);">${t.category||'Personal'} &middot; ~${t.estMin}m &middot; ${t.steps?t.steps.filter(st=>st.done).length:0}/${t.steps?t.steps.length:0} steps</div>
              </div>
              <button class="btn btn-sm btn-teal" onclick="launchFocusForTask('${t.id}')"><i class="fas fa-play"></i> Focus</button>
            </div>
          `).join('')}
        </div>
      `}
    </div>

    <!-- Today's Schedule & Timetable Card -->
    <div class="card" style="margin-bottom:24px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
        <h3 style="font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-calendar-day" style="color:var(--accent);"></i> Today's Timetable & Classes
        </h3>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-sm btn-teal" onclick="navigate('schedule')" style="font-size:12px;">
            Full Timetable <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>

      ${(todayEvents.length === 0 && todayScheduledTasks.length === 0) ? `
        <div style="text-align:center;padding:12px;color:var(--text2);font-size:13px;">
          No classes or scheduled study tasks today.
          <button class="btn btn-sm btn-teal" onclick="navigate('schedule')" style="margin-left:8px;"><i class="fas fa-calendar-plus"></i> Open Schedule</button>
        </div>
      ` : `
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${todayEvents.map(e => `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;background:var(--bg);border-radius:10px;border-left:3px solid ${e.color || '#3B82F6'};">
              <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:14px;">${escHtml(e.title)}</div>
                <div style="font-size:12px;color:var(--text2);"><i class="fas fa-clock"></i> ${e.startTime} - ${e.endTime} ${e.location ? `&middot; <i class="fas fa-location-dot"></i> ${escHtml(e.location)}` : ''}</div>
              </div>
              <span class="tag" style="background:${e.color || '#3B82F6'}22; color:${e.color || '#3B82F6'}; font-size:11px;">${e.category || 'Class'}</span>
            </div>
          `).join('')}

          ${todayScheduledTasks.slice(0, 2).map(t => `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;background:var(--bg);border-radius:10px;border-left:3px solid var(--teal);">
              <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:14px;"><i class="fas fa-list-check" style="color:var(--teal); margin-right:6px;"></i> ${escHtml(t.title)}</div>
                <div style="font-size:12px;color:var(--text2);"><i class="fas fa-clock"></i> ${t.scheduledTime || '16:00'} (~${t.estMin || 15}m)</div>
              </div>
              <button class="btn btn-sm btn-teal" onclick="launchFocusForTask('${t.id}')"><i class="fas fa-play"></i> Focus</button>
            </div>
          `).join('')}
        </div>
      `}
    </div>

    <!-- Mind & Mood Wellness Card -->
    <div class="card card-glow" style="margin-bottom:24px; background:linear-gradient(135deg, var(--card) 0%, rgba(78,205,196,0.08) 100%);">
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:12px;">
        <h3 style="font-size:16px; font-weight:700; display:flex; align-items:center; gap:8px;">
          <i class="fas fa-heart-pulse" style="color:var(--teal);"></i> Mind & Emotional Health Check-In
        </h3>
        <button class="btn btn-sm btn-teal" onclick="navigate('wellness')" style="font-size:12px;">
          Wellness Hub <i class="fas fa-arrow-right"></i>
        </button>
      </div>
      <p style="font-size:13px; color:var(--text2); margin-bottom:14px;">How are you feeling right now? Taking 30 seconds to check in helps reduce task anxiety.</p>
      <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:4px;" class="no-scrollbar">
        <button class="preset-chip" onclick="quickLogMood('great')"><span>🌟 Great</span></button>
        <button class="preset-chip" onclick="quickLogMood('calm')"><span>🌿 Calm</span></button>
        <button class="preset-chip" onclick="quickLogMood('focused')"><span>🎯 Focused</span></button>
        <button class="preset-chip" onclick="quickLogMood('low_energy')"><span>🔋 Low Energy</span></button>
        <button class="preset-chip" onclick="quickLogMood('overwhelmed')"><span>😫 Overwhelmed</span></button>
        <button class="preset-chip" onclick="quickLogMood('anxious')"><span>😰 Anxious</span></button>
      </div>
    </div>

    <div class="card" style="margin-bottom:24px"><h3 style="font-size:16px;margin-bottom:14px;display:flex;align-items:center;gap:8px"><i class="fas fa-scroll" style="color:var(--accent)"></i> Daily Quests</h3><div style="display:flex;flex-direction:column;gap:8px">${[{k:'focus',t:'Complete a focus session',d:'Even 10 minutes counts',l:'Start',v:'focus'},{k:'game',t:'Play a learning game',d:'Practice makes progress',l:'Play',v:'learn'},{k:'resource',t:'Explore a resource',d:'Find something new to learn from',l:'Explore',v:'resources'}].map(qi=>`<div class="quest-item ${getTodayQuests()[qi.k]?'completed':''}" onclick="${getTodayQuests()[qi.k]?'':`navigate('${qi.v}')`}"><div class="quest-check">${getTodayQuests()[qi.k]?'<i class="fas fa-check" style="font-size:12px"></i>':''}</div><div><div style="font-weight:700;font-size:14px">${qi.t}</div><div style="font-size:12px;color:var(--text2)">${qi.d}</div></div>${getTodayQuests()[qi.k]?'':`<div style="margin-left:auto"><span class="btn btn-sm btn-primary">${qi.l}</span></div>`}</div>`).join('')}</div></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px">
      <div class="card card-glow" style="cursor:pointer" onclick="navigate('focus')"><div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><div style="width:44px;height:44px;border-radius:12px;background:var(--teal-g);display:flex;align-items:center;justify-content:center"><i class="fas fa-bullseye" style="color:var(--teal);font-size:18px"></i></div><div><div style="font-weight:700;font-size:15px">Focus Lab</div><div style="font-size:12px;color:var(--text2)">${ttf>0?ttf+'m done today':'Start your first session'}</div></div></div><div class="btn btn-teal btn-sm" style="width:100%;justify-content:center">Just 10 Minutes <i class="fas fa-arrow-right"></i></div></div>
      <div class="card" style="cursor:pointer" onclick="navigate('learn')"><div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><div style="width:44px;height:44px;border-radius:12px;background:rgba(255,140,66,.12);display:flex;align-items:center;justify-content:center"><i class="fas fa-gamepad" style="color:var(--accent);font-size:18px"></i></div><div><div style="font-weight:700;font-size:15px">Math Adventure</div><div style="font-size:12px;color:var(--text2)">Primary (Grades 1–6)</div></div></div><div class="btn btn-primary btn-sm" style="width:100%;justify-content:center">Play Now <i class="fas fa-arrow-right"></i></div></div>
      <div class="card" style="cursor:pointer" onclick="navigate('flashcards')"><div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><div style="width:44px;height:44px;border-radius:12px;background:rgba(88,166,255,.12);display:flex;align-items:center;justify-content:center"><i class="fas fa-clone" style="color:var(--blue);font-size:18px"></i></div><div><div style="font-weight:700;font-size:15px">Flashcards</div><div style="font-size:12px;color:var(--text2)">Spaced repetition review</div></div></div><div class="btn btn-sm btn-secondary" style="width:100%;justify-content:center">Study <i class="fas fa-arrow-right"></i></div></div>
      <div class="card" style="cursor:pointer" onclick="navigate('store')"><div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><div style="width:44px;height:44px;border-radius:12px;background:rgba(216,180,254,.12);display:flex;align-items:center;justify-content:center"><i class="fas fa-store" style="color:#D8B4FE;size:18px"></i></div><div><div style="font-weight:700;font-size:15px">Store</div><div style="font-size:12px;color:var(--text2)">Spend your XP</div></div></div><div class="btn btn-sm" style="width:100%;justify-content:center;border:1px solid var(--text2);background:transparent">Shop <i class="fas fa-arrow-right"></i></div></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px">
      <div class="card stat-card"><div class="stat-num" style="color:var(--teal)">${tfm}m</div><div class="stat-label">Focus this week</div></div>
      <div class="card stat-card"><div class="stat-num" style="color:var(--accent)">${wxp}</div><div class="stat-label">XP this week</div></div>
      <div class="card stat-card"><div class="stat-num" style="color:var(--green)">${ws.length}</div><div class="stat-label">Sessions</div></div>
      <div class="card stat-card"><div class="stat-num" style="color:var(--blue)">${wg.length}</div><div class="stat-label">Games played</div></div>
    </div></div>`;
}

// ======================== VISUAL TIME-BOXING COMPONENT ========================
function getTimerSVG(type, ratio) {
  if (isNaN(ratio) || ratio < 0) ratio = 0;
  if (ratio > 1) ratio = 1;

  // ADHD-friendly: Soothing dynamic colors that adapt to current session phase & theme.
  // Muted pastel-like theme variables avoid creating "countdown panic" or time anxiety.
  const activeColor = focusState.mode === 'break' ? 'var(--accent)' : 'var(--teal)';

  if (type === 'donut') {
    const r = 85;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - ratio);
    return `
      <svg viewBox="0 0 220 220" class="w-full h-full">
        <circle cx="110" cy="110" r="${r}" fill="none" stroke="var(--border)" stroke-width="14" />
        <circle cx="110" cy="110" r="${r}" fill="none" stroke="${activeColor}" stroke-width="14"
                stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"
                transform="rotate(-90 110 110)" style="transition: stroke-dashoffset 0.3s linear; opacity: 0.8;" />
      </svg>
    `;
  } else if (type === 'hourglass') {
    const topY = 110 - 72 * ratio;
    const botY = 190 - 72 * (1 - ratio);
    const isStreaming = ratio > 0 && ratio < 1 && focusState.running;
    return `
      <svg viewBox="0 0 220 220" class="w-full h-full">
        <defs>
          <clipPath id="top-bulb">
            <path d="M 65,30 L 155,30 Q 120,110 110,110 Q 100,110 65,30 Z" />
          </clipPath>
          <clipPath id="bot-bulb">
            <path d="M 110,110 Q 120,110 155,190 L 65,190 Q 100,110 110,110 Z" />
          </clipPath>
        </defs>
        <rect x="45" y="18" width="130" height="12" rx="4" fill="var(--card-h)" stroke="var(--border)" stroke-width="2"/>
        <rect x="45" y="190" width="130" height="12" rx="4" fill="var(--card-h)" stroke="var(--border)" stroke-width="2"/>
        
        <path d="M 65,30 Q 100,110 65,190 L 155,190 Q 120,110 155,30 Z" fill="var(--bg)" opacity="0.3"/>
        
        <g clip-path="url(#top-bulb)">
          <rect x="40" y="${topY}" width="140" height="85" fill="${activeColor}" opacity="0.65" />
        </g>
        
        <g clip-path="url(#bot-bulb)">
          <rect x="40" y="${botY}" width="140" height="85" fill="${activeColor}" opacity="0.65" />
          <path d="M 110,${botY} Q 110,${botY-10} 125,${botY} Z" fill="${activeColor}" opacity="0.65"/>
          <path d="M 110,${botY} Q 110,${botY-10} 95,${botY} Z" fill="${activeColor}" opacity="0.65"/>
        </g>
        
        ${isStreaming ? `<line x1="110" y1="108" x2="110" y2="185" stroke="${activeColor}" stroke-width="2.5" stroke-dasharray="3 3" opacity="0.6" />` : ''}
        
        <path d="M 65,30 Q 100,110 65,190" fill="none" stroke="var(--border)" stroke-width="3" stroke-linecap="round"/>
        <path d="M 155,30 Q 120,110 155,190" fill="none" stroke="var(--border)" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `;
  } else if (type === 'retro') {
    let blocks = '';
    for (let i = 0; i < 10; i++) {
      const isActive = (9 - i) < ratio * 10;
      const fill = isActive ? activeColor : 'rgba(255,255,255,0.04)';
      const opacity = isActive ? '0.75' : '0.12';
      blocks += `<rect x="91" y="${32 + i * 16}" width="38" height="12" rx="2" fill="${fill}" opacity="${opacity}" style="transition: fill 0.3s, opacity 0.3s;" />`;
    }
    return `
      <svg viewBox="0 0 220 220" class="w-full h-full">
        <rect x="85" y="25" width="50" height="170" rx="8" fill="none" stroke="var(--border)" stroke-width="4"/>
        <rect x="100" y="15" width="20" height="10" rx="3" fill="var(--border)"/>
        ${blocks}
      </svg>
    `;
  } else {
    // Classic "Time Timer" (Muted, theme-integrated pie wheel)
    let pathD = '';
    if (ratio >= 0.999) {
      pathD = `M 110,110 m -90,0 a 90,90 0 1,0 180,0 a 90,90 0 1,0 -180,0`;
    } else if (ratio > 0) {
      const startX = 110;
      const startY = 20;
      const angle = -Math.PI / 2 + ratio * 2 * Math.PI;
      const endX = 110 + 90 * Math.cos(angle);
      const endY = 110 + 90 * Math.sin(angle);
      const largeArc = ratio > 0.5 ? 1 : 0;
      pathD = `M 110 110 L ${startX} ${startY} A 90 90 0 ${largeArc} 1 ${endX} ${endY} Z`;
    }
    return `
      <svg viewBox="0 0 220 220" class="w-full h-full">
        <circle cx="110" cy="110" r="95" fill="var(--card-h)" stroke="var(--border)" stroke-width="2" />
        <circle cx="110" cy="110" r="90" fill="none" stroke="var(--border)" stroke-width="1" stroke-dasharray="2 6" opacity="0.3" />
        ${pathD ? `<path d="${pathD}" fill="${activeColor}" opacity="0.6" />` : ''}
        <circle cx="110" cy="110" r="6" fill="var(--text)" />
      </svg>
    `;
  }
}

// ======================== FOCUS LAB ========================
let focusState={timer:null,seconds:0,totalSeconds:0,task:'',steps:[],currentStep:0,distractions:0,running:false,phase:'setup',accumulatedDuration:0,mode:'focus'};
let pauseReminderTO=null,bodyDoubleTOs=[],focusXPTO=null;
function cleanupFocus(){if(focusState.timer){clearInterval(focusState.timer);focusState.timer=null;}if(pauseReminderTO){clearTimeout(pauseReminderTO);pauseReminderTO=null;}bodyDoubleTOs.forEach(t=>clearTimeout(t));bodyDoubleTOs=[];if(focusXPTO){clearTimeout(focusXPTO);focusXPTO=null;}focusState.running=false;Ambient.stopAll();window.onbeforeunload=null;}
function startPauseReminder(){stopPauseReminder();pauseReminderTO=setTimeout(()=>{const m=PAUSE_MSGS[Math.floor(Math.random()*PAUSE_MSGS.length)];SFX.nudge();showModal(`<div class="nudge-pulse" style="text-align:center;border-radius:16px;padding:8px"><div style="font-size:40px;margin-bottom:12px"><i class="fas fa-hand-holding-heart" style="color:var(--teal)"></i></div><h2 style="font-size:20px;margin-bottom:6px">${m.t}</h2><p style="color:var(--text2);margin-bottom:20px;line-height:1.5">${m.b}</p><div style="display:flex;gap:10px;justify-content:center"><button class="btn btn-secondary" onclick="closeModal();focusState.phase='setup';navigate('focus')">I'm done for now</button><button class="btn btn-teal" onclick="closeModal();resumeFocus()"><i class="fas fa-play"></i> Let's keep going</button></div></div>`);},120000+Math.random()*30000);}
function stopPauseReminder(){if(pauseReminderTO){clearTimeout(pauseReminderTO);pauseReminderTO=null;}}
function scheduleFocusXP(){if(focusXPTO)clearTimeout(focusXPTO);focusXPTO=setTimeout(()=>{if(!focusState.running||focusState.phase!=='active')return;const a=2+Math.floor(Math.random()*4);Store.addXP(a);toast(`+${a} XP for staying focused`,'bonus');SFX.click();scheduleFocusXP();},45000+Math.random()*60000);}

function startBodyDouble(){
  bodyDoubleTOs.forEach(t=>clearTimeout(t));bodyDoubleTOs=[];
  const ch=document.getElementById('bd-char'),ey=document.getElementById('bd-eyes'),ey2=document.getElementById('bd-eye2'),bk=document.getElementById('bd-book');
  if(!ch)return;
  function blink(){if(ey){ey.setAttribute('ry','0.5');setTimeout(()=>{if(ey)ey.setAttribute('ry','3');},120);}if(ey2){ey2.setAttribute('ry','0.5');setTimeout(()=>{if(ey2)ey2.setAttribute('ry','3');},120);}bodyDoubleTOs.push(setTimeout(blink,2000+Math.random()*4000));}
  function tilt(){const d=Math.random()>.5?3:-3;ch.style.transform=`rotate(${d}deg)`;setTimeout(()=>{ch.style.transform='rotate(0deg)';},1500+Math.random()*2000);bodyDoubleTOs.push(setTimeout(tilt,8000+Math.random()*15000));}
  function page(){if(!bk)return;bk.style.transform='translateX(2px) skewY(-1deg)';setTimeout(()=>{bk.style.transform='translateX(0) skewY(0)';},600);bodyDoubleTOs.push(setTimeout(page,15000+Math.random()*25000));}
  function look(){if(ey)ey.setAttribute('cy','36');if(ey2)ey2.setAttribute('cy','36');setTimeout(()=>{if(ey)ey.setAttribute('cy','39');if(ey2)ey2.setAttribute('cy','39');},1200+Math.random()*1500);bodyDoubleTOs.push(setTimeout(look,20000+Math.random()*30000));}
  function stretch(){ch.style.transform='translateY(-3px) scaleX(1.03)';setTimeout(()=>{ch.style.transform='translateY(0) scaleX(1)';},800);bodyDoubleTOs.push(setTimeout(stretch,35000+Math.random()*40000));}
  bodyDoubleTOs.push(setTimeout(blink,1000+Math.random()*3000));bodyDoubleTOs.push(setTimeout(tilt,5000+Math.random()*5000));bodyDoubleTOs.push(setTimeout(page,10000+Math.random()*8000));bodyDoubleTOs.push(setTimeout(look,15000+Math.random()*10000));bodyDoubleTOs.push(setTimeout(stretch,25000+Math.random()*15000));
}

function bdSVG(type='default'){
  if(type==='robot_friend'){
    return `<svg viewBox="0 0 100 150" width="80" id="bd-char" class="bd-character" style="filter:drop-shadow(0 4px 12px rgba(0,0,0,.3))"><rect x="10" y="128" width="80" height="4" rx="2" fill="#2A2A3D" opacity=".5"/><rect x="35" y="10" width="30" height="35" rx="5" fill="#9CA3AF"/><rect x="25" y="45" width="50" height="40" rx="5" fill="#D1D5DB"/><circle cx="40" cy="65" r="5" fill="#EF4444"/><circle cx="60" cy="65" r="5" fill="#3B82F6"/><rect x="40" y="85" width="20" height="10" fill="#4B5563"/><path d="M30 95 L35 120 L65 120 L70 95" fill="#6B7280"/><rect x="28" y="88" width="44" height="30" rx="2" fill="#E5E7EB" stroke="#D1D5DB" stroke-width="1"/><line x1="50" y1="88" x2="50" y2="118" stroke="#9CA3AF" stroke-width="1"/></svg>`;
  } else if (type==='magic_cat') {
    return `<svg viewBox="0 0 100 150" width="80" id="bd-char" class="bd-character" style="filter:drop-shadow(0 4px 12px rgba(168,85,247,.3))"><rect x="10" y="128" width="80" height="4" rx="2" fill="#2A2A3D" opacity=".5"/><path d="M25 50 L20 20 L40 40 Z" fill="#A855F7"/><path d="M75 50 L80 20 L60 40 Z" fill="#A855F7"/><ellipse cx="50" cy="70" rx="35" ry="30" fill="#E9D5FF"/><circle cx="40" cy="65" r="5" fill="#000"/><circle cx="60" cy="65" r="5" fill="#000"/><path d="M45 80 Q50 85 55 80" fill="none" stroke="#6B21A8" stroke-width="2"/><path d="M30 90 Q50 130 70 90" fill="#A855F7"/></svg>`;
  }
  return `<svg viewBox="0 0 100 150" width="80" id="bd-char" class="bd-character" style="filter:drop-shadow(0 4px 12px rgba(0,0,0,.3))"><rect x="10" y="128" width="80" height="4" rx="2" fill="#2A2A3D" opacity=".5"/><ellipse cx="50" cy="28" rx="27" ry="24" fill="#5C3D2E"/><circle cx="50" cy="36" r="22" fill="#FFD4A8"/><path d="M28 28 Q35 12 50 14 Q65 12 72 28 Q72 22 65 18 Q55 12 50 14 Q45 12 35 18 Q28 22 28 28Z" fill="#5C3D2E"/><ellipse cx="28" cy="38" rx="4" ry="5" fill="#F0C8A0"/><ellipse cx="72" cy="38" rx="4" ry="5" fill="#F0C8A0"/><rect x="32" y="33" width="16" height="12" rx="5" ry="5" fill="none" stroke="#555" stroke-width="1.8"/><rect x="52" y="33" width="16" height="12" rx="5" ry="5" fill="none" stroke="#555" stroke-width="1.8"/><line x1="48" y1="39" x2="52" y2="39" stroke="#555" stroke-width="1.5"/><line x1="32" y1="39" x2="26" y2="37" stroke="#555" stroke-width="1.5"/><line x1="68" y1="39" x2="74" y2="37" stroke="#555" stroke-width="1.5"/><ellipse id="bd-eyes" cx="40" cy="39" rx="2.5" ry="3" fill="#333"/><ellipse id="bd-eye2" cx="60" cy="39" rx="2.5" ry="3" fill="#333"/><line x1="36" y1="30" x2="44" y2="30.5" stroke="#5C3D2E" stroke-width="1.2" stroke-linecap="round"/><line x1="56" y1="30.5" x2="64" y2="30" stroke="#5C3D2E" stroke-width="1.2" stroke-linecap="round"/><path d="M44 48 Q50 52 56 48" fill="none" stroke="#A0785A" stroke-width="1.5" stroke-linecap="round"/><rect x="44" y="57" width="12" height="6" rx="2" fill="#FFD4A8"/><path d="M30 63 Q30 60 40 60 L60 60 Q70 60 70 63 L74 120 Q74 126 68 126 L32 126 Q26 126 26 120 Z" fill="#4ECDC4"/><path d="M40 60 L50 68 L60 60" fill="none" stroke="#3DBDB5" stroke-width="1.5"/><path d="M30 68 Q22 82 30 96" fill="none" stroke:#FFD4A8" stroke-width="7" stroke-linecap="round"/><path d="M70 68 Q78 82 70 96" fill="none" stroke:#FFD4A8" stroke-width="7" stroke-linecap="round"/><g id="bd-book" style="transition:transform .6s ease"><rect x="28" y="88" width="44" height="30" rx="2" fill="#FFF8F0" stroke="#E0D5C8" stroke-width="1"/><line x1="50" y1="88" x2="50" y2="118" stroke="#D5C8B8" stroke-width="1"/><line x1="32" y1="95" x2="47" y2="95" stroke="#DDD" stroke-width=".7"/><line x1="32" y1="99" x2="45" y2="99" stroke="#DDD" stroke-width=".7"/><line x1="32" y1="103" x2="47" y2="103" stroke="#DDD" stroke-width=".7"/><line x1="32" y1="107" x2="44" y2="107" stroke="#DDD" stroke-width=".7"/><line x1="53" y1="95" x2="68" y2="95" stroke="#DDD" stroke-width=".7"/><line x1="53" y1="99" x2="66" y2="99" stroke="#DDD" stroke-width=".7"/><line x1="53" y1="103" x2="68" y2="103" stroke="#DDD" stroke-width=".7"/><line x1="53" y1="107" x2="65" y2="107" stroke="#DDD" stroke-width=".7"/></g></svg>`;
}

function renderFocus(){
  updateUserPanel();
  document.getElementById('view-focus').innerHTML=`<div style="max-width:800px;margin:0 auto">${focusState.phase==='setup'?renderFocusSetup():renderFocusActive()}</div>`;
  if(focusState.phase==='active'){if(focusState.running)startFocusTick();startBodyDouble();if(!focusState.running)startPauseReminder();if(focusState.running)scheduleFocusXP();}
}

function renderFocusSetup(){
  const s=Store.get('settings'),rt=Store.get('sessions').slice(-5).reverse();
  const presets=Store.get('focusPresets')||[];
  const tasks=(Store.get('tasks')||[]).filter(t=>!t.completed);

  return`<h1 style="font-size:26px;font-weight:700;margin-bottom:6px">Focus Lab</h1><p style="color:var(--text2);margin-bottom:28px">The hardest part is starting. We'll make it as easy as possible.</p>

    <!-- Presets & Interval Schedules -->
    <div class="card" style="margin-bottom:20px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <label style="font-weight:700;font-size:14px;"><i class="fas fa-sliders" style="color:var(--teal);"></i> Focus Presets & Interval Schedules</label>
        <button class="btn btn-sm btn-ghost" onclick="showCreatePresetModal()" style="font-size:11px;border:1px solid var(--border);color:var(--teal);"><i class="fas fa-plus"></i> Custom Preset</button>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:6px;">
        ${presets.map(p=>{
          const isSel=s.focusDuration===p.focusMin && s.breakDuration===p.breakMin;
          return`
            <div class="preset-chip ${isSel?'active':''}" onclick="applyFocusPreset('${p.id}')">
              <i class="fas ${p.icon||'fa-clock'}"></i>
              <span>${p.name} (${p.focusMin}/${p.breakMin}m)</span>
              ${p.custom?`<i class="fas fa-times" style="font-size:10px;margin-left:4px;opacity:0.6;" onclick="event.stopPropagation();deleteCustomPreset('${p.id}');"></i>`:''}
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Active Tasks Picker from Planner -->
    ${tasks.length?`
      <div class="card" style="margin-bottom:20px;background:var(--bg);">
        <label style="font-weight:700;font-size:13px;color:var(--text2);display:block;margin-bottom:8px;"><i class="fas fa-list-check" style="color:var(--teal);"></i> Pick an Active Task from your Planner:</label>
        <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;" class="no-scrollbar">
          ${tasks.map(t=>`
            <button class="btn btn-sm btn-ghost" onclick="launchFocusForTask('${t.id}')" style="border:1px solid var(--border);font-size:12px;white-space:nowrap;background:var(--card);">
              <i class="fas fa-bullseye" style="color:var(--teal);"></i> ${escHtml(t.title)} (${t.estMin}m)
            </button>
          `).join('')}
        </div>
      </div>
    `:''}

    <div class="card" style="margin-bottom:20px"><label style="font-weight:700;font-size:14px;display:block;margin-bottom:8px">What do you need to do?</label><input type="text" class="input" id="focus-task-input" placeholder="e.g. Do math homework, Read chapter 3..." style="margin-bottom:12px"><div style="display:flex;flex-wrap:wrap;gap:6px">${['Do math homework','Read a chapter','Write an assignment','Study for a test','Practice spelling'].map(t=>`<button class="btn btn-sm btn-ghost" style="border:1px solid var(--border);font-size:12px" onclick="document.getElementById('focus-task-input').value='${t}';SFX.click()">${t}</button>`).join('')}</div></div>
    <div class="card" style="margin-bottom:20px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><label style="font-weight:700;font-size:14px">We'll break it into small steps</label><span style="font-size:12px;color:var(--text2)">(edit if you want)</span></div><div id="steps-list"><div style="color:var(--text2);font-size:14px;padding:8px 0">Type a task above to see the steps...</div></div></div>
    <div class="card" style="margin-bottom:24px"><label style="font-weight:700;font-size:14px;display:block;margin-bottom:12px">Session length</label><div style="display:flex;gap:8px;flex-wrap:wrap">${[5,10,15,20,25,30,45,60].map(m=>`<button class="grade-pill ${m===s.focusDuration?'selected':''}" onclick="Store.get('settings').focusDuration=${m};Store.save();SFX.click();renderFocus()">${m} min</button>`).join('')}</div><p style="font-size:12px;color:var(--text2);margin-top:8px"><i class="fas fa-lightbulb" style="color:var(--accent)"></i> Current interval schedule: ${s.focusDuration}m focus / ${s.breakDuration||3}m break.</p></div>
    <div style="text-align:center"><button class="btn btn-lg btn-teal" onclick="startFocusSession()"><i class="fas fa-play"></i> Just Start — ${s.focusDuration} Minutes</button><p style="font-size:13px;color:var(--text2);margin-top:10px">That's it. No setup, no planning paralysis. Just start.</p></div>
    ${rt.length?`<div style="margin-top:32px"><h3 style="font-size:15px;color:var(--text2);margin-bottom:12px">Recent sessions</h3><div style="display:flex;flex-direction:column;gap:8px">${rt.map(s=>`<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--card);border-radius:10px;font-size:13px"><i class="fas ${s.completed?'fa-check-circle':'fa-clock'}" style="color:${s.completed?'var(--green)':'var(--text2)'}"></i><span style="flex:1">${escHtml(s.task)}</span><span style="color:var(--text2)">${s.duration}m</span></div>`).join('')}</div></div>`:''}`;
}

function renderFocusActive(){
  const m=Math.floor(focusState.seconds/60),s=focusState.seconds%60,ts=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

  if(focusState.mode==='break'){
    return`
      <div style="max-width:550px;margin:30px auto 0;text-align:center;">
        <div class="card" style="padding:32px 24px;border-color:var(--teal);">
          <div class="breathe-ring">
            <i class="fas fa-leaf" style="font-size:36px;color:var(--teal);"></i>
          </div>
          <h2 style="font-size:24px;font-weight:700;margin-bottom:6px;">Rest & Recharge Break</h2>
          <p style="color:var(--text2);font-size:14px;margin-bottom:20px;">
            Great work! Step away from your screen, stretch your back, take 3 deep breaths, or grab water.
          </p>
          <div style="font-family:Fredoka;font-size:52px;font-weight:700;color:var(--teal);margin-bottom:24px;" id="focus-time-display">
            ${ts}
          </div>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
            <button class="btn btn-teal" onclick="skipBreakToFocus()"><i class="fas fa-play"></i> Next Focus Interval (${Store.get('settings').focusDuration}m)</button>
            <button class="btn btn-secondary" onclick="confirmEndSession()"><i class="fas fa-flag-checkered"></i> Finish Session</button>
          </div>
        </div>
      </div>
    `;
  }

  const p=focusState.totalSeconds>0?((focusState.totalSeconds-focusState.seconds)/focusState.totalSeconds)*100:0;
  const ratio=focusState.totalSeconds>0?(focusState.seconds/focusState.totalSeconds):1;
  const el=focusState.totalSeconds-focusState.seconds,es=el>=60?Math.floor(el/60)+' minute'+(Math.floor(el/60)>1?'s':''):el+' seconds';
  const comp=Store.get('inventory').equipped.companion;
  const equippedTimer=Store.get('inventory').equipped.timer||'classic';

  return`<div style="display:flex;gap:32px;align-items:flex-start;flex-wrap:wrap"><div style="flex:1;min-width:300px">
    <div style="text-align:center;margin-bottom:20px">
      <div style="display:flex;justify-content:center;margin-bottom:24px">
        <div class="visual-timer-container" style="position:relative; width:220px; height:220px; display:flex; align-items:center; justify-content:center;">
          <div id="visual-timer-svg" style="position:absolute; inset:0; z-index:1;">
            ${getTimerSVG(equippedTimer, ratio)}
          </div>
          <div style="text-align:center; position:relative; z-index:2; pointer-events:none;">
            <div style="font-family:Fredoka;font-size:42px;font-weight:700;color:var(--text); line-height:1.1;" id="focus-time-display">${ts}</div>
            <div style="font-size:12px;color:var(--text2)" id="focus-phase-label">${focusState.running?'Stay focused...':'Paused'}</div>
          </div>
        </div>
      </div>
    <div style="max-width:400px;margin:0 auto 20px;height:6px;background:var(--border);border-radius:3px;overflow:hidden"><div style="height:100%;background:linear-gradient(90deg,var(--teal),var(--green));border-radius:3px;transition:width .5s;width:${p}%"></div></div>
    <div style="font-weight:700;font-size:18px;margin-bottom:4px">${escHtml(focusState.task)}</div><div style="font-size:13px;color:var(--text2)">${es} in &middot; ${focusState.distractions} distraction${focusState.distractions!==1?'s':''}</div></div>
    ${Ambient.renderSoundscapeCard()}
    <div class="card" style="margin-bottom:16px"><div style="font-weight:700;font-size:14px;margin-bottom:12px">Your steps</div><div style="display:flex;flex-direction:column;gap:4px">${focusState.steps.map((st,i)=>{let c=i<focusState.currentStep?'done-step':i===focusState.currentStep?'active-step':'';return`<div class="step-item ${c}"><div class="step-num">${i<focusState.currentStep?'<i class="fas fa-check" style="font-size:10px"></i>':i+1}</div><span>${escHtml(st)}</span></div>`;}).join('')}</div></div>
    <div class="card" style="margin-bottom:16px;position:relative;overflow:visible"><div style="font-weight:700;font-size:13px;color:var(--text2);margin-bottom:8px;display:flex;align-items:center;gap:6px"><i class="fas fa-cloud" style="color:var(--teal)"></i> Thought Dump <span style="font-weight:400;font-size:11px;color:var(--text2)">— brain going wild? Park it here and let it go.</span></div><div style="display:flex;gap:8px"><input class="input" id="thought-input" placeholder="Type the thought, hit Enter to release it..." style="font-size:13px"><button class="btn btn-sm btn-ghost" onclick="dumpThought()" style="border:1px solid var(--border);flex-shrink:0;color:var(--teal)"><i class="fas fa-arrow-up"></i></button></div><div id="thought-float-area" style="position:relative;height:0;overflow:visible"></div></div>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:20px">
      <button class="btn btn-ghost" onclick="logDistraction()" style="border:1px solid var(--border);color:var(--accent)"><i class="fas fa-arrow-right-from-bracket"></i> I got distracted</button>
      <button class="btn btn-ghost" onclick="advanceStep()"><i class="fas fa-arrow-down"></i> Next step</button>
      ${focusState.running?`<button class="btn btn-secondary" onclick="pauseFocus()"><i class="fas fa-pause"></i> Pause</button>`:`<button class="btn btn-teal" onclick="resumeFocus()"><i class="fas fa-play"></i> Resume</button>`}
    </div>
    <div style="text-align:center"><button class="btn btn-primary" onclick="confirmEndSession()" style="background:var(--green)"><i class="fas fa-flag-checkered"></i> ${p>=100?'Finish Session':'End Early — Still Counts'}</button><p style="font-size:12px;color:var(--text2);margin-top:6px">Ending early is not failing. Starting was the win.</p></div>
  </div><div style="width:140px;flex-shrink:0;text-align:center"><div class="card" style="padding:16px 8px;display:flex;flex-direction:column;align-items:center;gap:4px"><div class="bd-wrap">${bdSVG(comp)}</div><div class="bd-label">Studying with<br>you right now</div></div></div></div>`;
}

function startFocusSession(){
  SFX.click();
  const ti=document.getElementById('focus-task-input'),task=ti?ti.value.trim():'';
  if(!task){toast('Type what you need to do first','warn');return;}
  const steps=breakDownTask(task);
  const se=document.querySelectorAll('#steps-list .step-item input');
  if(se.length)se.forEach((el,i)=>{if(el.value.trim())steps[i]=el.value.trim();});
  const dur=Store.get('settings').focusDuration;
  
  focusState={
    timer:null,
    seconds:dur*60,
    totalSeconds:dur*60,
    task,
    steps,
    currentStep:0,
    distractions:0,
    running:true,
    phase:'active',
    accumulatedDuration:0,
    mode:'focus',
    endTime: Date.now() + (dur*60*1000) // Precise target end time
  };
  renderFocus();
  if(Store.get('settings').strictMode){
    window.onbeforeunload = function(){ return "Focus session is running. Are you sure you want to leave?"; };
  }
}
function startFocusTick() {
  if (focusState.timer) clearInterval(focusState.timer);
  if (!focusState.mode) focusState.mode = 'focus'; 

  if (!focusState.endTime) {
    focusState.endTime = Date.now() + focusState.seconds * 1000;
  }

  focusState.timer = setInterval(() => {
    if (!focusState.running) return;
    
    const msLeft = focusState.endTime - Date.now();
    const currentSeconds = Math.max(0, msLeft / 1000);
    focusState.seconds = currentSeconds;
    
    const d = document.getElementById('focus-time-display');
    if (d) {
      const displaySecs = Math.ceil(currentSeconds);
      const m = Math.floor(displaySecs / 60);
      const s = displaySecs % 60;
      const formattedTime = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      if (d.textContent !== formattedTime) {
        d.textContent = formattedTime;
      }
      const label = d.nextElementSibling;
      if (label) label.textContent = focusState.mode === 'focus' ? 'Stay with it...' : 'Take a breather...';

      // Butter-smooth dynamic visual SVG update (refreshes 10x per second)
      const timerSvgDiv = document.getElementById('visual-timer-svg');
      if (timerSvgDiv) {
        const equippedTimer = Store.get('inventory').equipped.timer || 'classic';
        const ratio = focusState.totalSeconds > 0 ? (focusState.seconds / focusState.totalSeconds) : 1;
        timerSvgDiv.innerHTML = getTimerSVG(equippedTimer, ratio);
      }
    }
    
    // Play sound tick exactly once per second in the final 60 seconds
    const secFloor = Math.floor(currentSeconds);
    if (focusState.lastSecFloor === undefined) focusState.lastSecFloor = secFloor;
    if (secFloor !== focusState.lastSecFloor) {
      focusState.lastSecFloor = secFloor;
      if (secFloor <= 60 && secFloor > 0 && focusState.mode === 'focus') {
        SFX.tick();
      }
    }
    
    if (currentSeconds <= 0) {
      clearInterval(focusState.timer);
      if (focusState.mode === 'focus') {
        SFX.complete(); 
        toast('Focus complete! Time for a short break.', 'bonus');
        focusState.accumulatedDuration += (Store.get('settings').focusDuration * 60); 
        focusState.mode = 'break';
        focusState.seconds = Store.get('settings').breakDuration * 60;
        focusState.totalSeconds = focusState.seconds;
        focusState.endTime = Date.now() + (focusState.seconds * 1000);
        startFocusTick();
      } else {
        SFX.nudge(); 
        toast('Break is over! Let\'s focus.', 'info');
        focusState.mode = 'focus';
        focusState.seconds = Store.get('settings').focusDuration * 60;
        focusState.totalSeconds = focusState.seconds;
        focusState.endTime = Date.now() + (focusState.seconds * 1000);
        startFocusTick();
      }
    }
  }, 100); // Ticks smoothly every 100ms
}
function pauseFocus(){focusState.running=false;SFX.click();stopPauseReminder();if(focusXPTO){clearTimeout(focusXPTO);focusXPTO=null;}renderFocus();startPauseReminder();window.onbeforeunload=null;}
function resumeFocus(){
  focusState.running=true;
  SFX.click();
  stopPauseReminder();
  closeModal();
  
  // Recalculate end timestamp from remaining fractional seconds
  focusState.endTime = Date.now() + (focusState.seconds * 1000);
  
  renderFocus();
  scheduleFocusXP();
  if(Store.get('settings').strictMode){
    window.onbeforeunload = function(){ return "Focus session is running. Are you sure you want to leave?"; };
  }
}
function logDistraction(force=false){
  focusState.distractions++;SFX.click();
  toast(force?'Tab switch detected!':'Logged. Now gently come back.','info');renderFocus();
}
function advanceStep(){if(focusState.currentStep<focusState.steps.length-1){focusState.currentStep++;SFX.click();renderFocus();}}

// Strict Mode Logic
let strictTimeout = null;
function confirmEndSession(){
  const s = Store.get('settings');
  if(!s.strictMode){
    endFocusSession();
    return;
  }
  showModal(`
    <div style="text-align:center">
      <h2 style="color:var(--red);margin-bottom:10px"><i class="fas fa-exclamation-triangle"></i> Wait!</h2>
      <p>Strict mode is on. You must wait 5 seconds before giving up.</p>
      <div id="strict-timer" style="font-size:32px;font-weight:700;margin:20px 0;color:var(--accent)">5</div>
      <button class="btn btn-sm btn-ghost" onclick="cancelStrictEnd()">Cancel</button>
    </div>
  `);
  let left=5;
  const timerEl=document.getElementById('strict-timer');
  strictTimeout=setInterval(()=>{
    left--;
    if(timerEl)timerEl.textContent=left;
    if(left<=0){
      clearInterval(strictTimeout);
      closeModal();
      endFocusSession();
    }
  },1000);
}
function cancelStrictEnd(){clearInterval(strictTimeout);closeModal();}

function endFocusSession(auto=false){
  cleanupFocus();
  let currentCycleElapsed = 0;
  if(focusState.mode === 'focus') {
    currentCycleElapsed = focusState.totalSeconds - focusState.seconds;
  }
  
  const totalSecondsElapsed = focusState.accumulatedDuration + currentCycleElapsed;
  const min = Math.max(1, Math.round(totalSecondsElapsed / 60));
  
  const session={id:Date.now(),task:focusState.task,steps:focusState.steps,duration:min,distractions:focusState.distractions,date:new Date().toISOString(),completed:auto||min>=5};
  const sessions=Store.get('sessions');sessions.push(session);Store.set('sessions',sessions);
  const baseXP=min*2;Store.addXP(baseXP);completeQuest('focus');SFX.complete();
  let bonusXP=0;if(Math.random()<.35){bonusXP=20+Math.floor(Math.random()*31);Store.addXP(bonusXP);SFX.bonus();}
  showModal(`<div style="text-align:center"><div style="font-size:48px;margin-bottom:12px">${auto?'<i class="fas fa-trophy" style="color:#FFD93D"></i>':'<i class="fas fa-seedling" style="color:var(--green)"></i>'}</div><h2 style="font-size:22px;margin-bottom:4px">${auto?'Session Complete!':'Great Start!'}</h2><p style="color:var(--text2);margin-bottom:20px">${auto?'You stayed focused the whole time. Amazing.':'You showed up and tried. That matters more than you think.'}</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:${bonusXP>0?'12px':'20px'}"><div class="card" style="padding:12px"><div style="font-family:Fredoka;font-size:24px;color:var(--teal)">${min}m</div><div style="font-size:12px;color:var(--text2)">Focused</div></div><div class="card" style="padding:12px"><div style="font-family:Fredoka;font-size:24px;color:var(--accent)">${focusState.distractions}</div><div style="font-size:12px;color:var(--text2)">Distractions</div></div><div class="card" style="padding:12px"><div style="font-family:Fredoka;font-size:24px;color:var(--green)">+${baseXP}</div><div style="font-size:12px;color:var(--text2)">XP</div></div></div>
    ${bonusXP>0?`<div class="card bonus-card bonus-pop" style="margin-bottom:20px;padding:16px;border:1px solid rgba(216,180,254,.3)"><div style="display:flex;align-items:center;gap:12px;justify-content:center"><i class="fas fa-gift" style="font-size:24px;color:#D8B4FE"></i><div style="text-align:left"><div style="font-weight:800;font-size:16px;color:#D8B4FE">Surprise Bonus!</div><div style="font-size:13px;color:var(--text2)">Nice work! Here's an extra +${bonusXP} XP</div></div></div></div>`:''}
    <button class="btn btn-primary" onclick="closeModal();focusState.phase='setup';navigate('focus')">Done</button></div>`);
}

document.addEventListener('input',e=>{if(e.target.id==='focus-task-input'){const task=e.target.value.trim(),list=document.getElementById('steps-list');if(!list)return;if(!task){list.innerHTML='<div style="color:var(--text2);font-size:14px;padding:8px 0">Type a task above to see the steps...</div>';return;}const steps=breakDownTask(task);list.innerHTML=steps.map((s,i)=>`<div class="step-item" style="padding:6px 10px"><div class="step-num" style="width:20px;height:20px;font-size:11px">${i+1}</div><input class="input" value="${s}" style="border:none;background:transparent;padding:2px 4px;font-size:13px" data-step-idx="${i}"></div>`).join('');}});

// ======================== STORE ========================
function renderStore(){updateUserPanel();
  const xp=Store.get('totalXP'),inv=Store.get('inventory');
  document.getElementById('view-store').innerHTML=`<div style="max-width:900px;margin:0 auto"><h1 style="font-size:26px;font-weight:700;margin-bottom:6px">Store</h1><p style="color:var(--text2);margin-bottom:20px">Spend your XP to customize your experience.</p>
  
  <div class="card" style="margin-bottom:24px; padding:16px; display:flex; justify-content:space-between; align-items:center;">
    <div style="display:flex; align-items:center; gap:10px">
      <i class="fas fa-coins" style="color:#FFD93D; font-size:24px"></i>
      <span style="font-weight:700; font-size:20px">${xp} XP Available</span>
    </div>
    <div style="font-size:13px; color:var(--text2)">Equip items to use them</div>
  </div>

  <h3 style="margin-bottom:12px; font-size:18px; color:var(--accent)">User Avatars</h3>
  <div class="store-grid" style="margin-bottom:32px">${CATALOG.avatars.map(a=>renderStoreItem('avatar', a, inv)).join('')}</div>

  <h3 style="margin-bottom:12px; font-size:18px; color:var(--teal)">Study Companions</h3>
  <div class="store-grid" style="margin-bottom:32px">${CATALOG.companions.map(c=>renderStoreItem('companion', c, inv)).join('')}</div>

  <h3 style="margin-bottom:12px; font-size:18px; color:var(--red)">Visual Timers</h3>
  <div class="store-grid" style="margin-bottom:32px">${CATALOG.timers.map(t=>renderStoreItem('timer', t, inv)).join('')}</div>

  <h3 style="margin-bottom:12px; font-size:18px; color:var(--accent)">Profile Colors</h3>
  <div class="store-grid" style="margin-bottom:32px">${CATALOG.colors.map(c=>renderStoreItem('color', c, inv)).join('')}</div>

  <h3 style="margin-bottom:12px; font-size:18px; color:var(--blue)">Themes</h3>
  <div class="store-grid" style="margin-bottom:32px">${CATALOG.themes.map(t=>renderStoreItem('theme', t, inv)).join('')}</div>
  </div>`;
}

function renderStoreItem(type, item, inv){
  const owned=inv[type+'s'].includes(item.id);
  const equipped=inv.equipped[type]===item.id;
  const canAfford=Store.get('totalXP')>=item.cost;
  const cls=`store-item ${owned?'owned':''} ${equipped?'equipped':''}`;
  
  // Keep the background circle neutral for Colors so they don't blend into their own swatches
  const iconBg = (equipped && type !== 'color') ? 'var(--accent)' : 'var(--card)';
  const iconColor = (equipped && type !== 'color') ? '#fff' : 'var(--text2)';

  return `<div class="${cls}" onclick="handleStoreClick('${type}','${item.id}')">
    <div class="icon-wrap" style="background:${iconBg}; color:${iconColor}; transition: background 0.2s;">
      ${type==='avatar'?`<i class="fas ${item.icon}"></i>`:
       type==='companion'?`<i class="fas fa-user-friends"></i>`:
       type==='theme'&&item.id==='light'?'<i class="fas fa-sun"></i>':
       type==='theme'&&item.id==='forest'?'<i class="fas fa-tree"></i>':
       type==='theme'&&item.id==='ocean'?'<i class="fas fa-water"></i>':
       type==='timer'&&item.id==='classic'?'<i class="fas fa-clock"></i>':
       type==='timer'&&item.id==='donut'?'<i class="fas fa-circle-notch"></i>':
       type==='timer'&&item.id==='hourglass'?'<i class="fas fa-hourglass-half"></i>':
       type==='timer'&&item.id==='retro'?'<i class="fas fa-battery-three-quarters"></i>':
       type==='color'?`<div style="width:24px;height:24px;border-radius:50%;background:${item.id};border:2px solid var(--border); box-shadow: 0 2px 6px rgba(0,0,0,0.15)"></div>`:
       '<i class="fas fa-palette"></i>'}
    </div>
    <div style="font-weight:700; font-size:14px">${item.name}</div>
    ${owned && equipped?'<span style="font-size:12px; color:var(--green); font-weight:700">Equipped</span>':
      owned?'<span style="font-size:12px; color:var(--text2)">Owned</span>':
      `<span class="cost">${item.cost} XP</span>`}
  </div>`;
}

function handleStoreClick(type, id){
  const inv=Store.get('inventory'), cat=CATALOG[type+'s'];
  const item=cat.find(i=>i.id===id);
  if(inv.equipped[type]===id){
    toast('Already equipped','info');return;
  }
  if(inv[type+'s'].includes(id)){
  inv.equipped[type]=id;
  if (type === 'color') {
    const u = Store.get('user');
    if (u) { u.color = id; Store.set('user', u); }
    applyAccentColor(id);
  }
  Store.set('inventory',inv);
  SFX.click();
  if(type==='theme')applyTheme(item);
  updateUserPanel();
  renderStore();
  toast(`${item.name} equipped!`,'success');
}
 else {
    if(Store.get('totalXP')>=item.cost){
      showModal(`<h3 style="margin-bottom:10px">Buy ${item.name}?</h3><p style="color:var(--text2);margin-bottom:20px">Cost: ${item.cost} XP. You have ${Store.get('totalXP')} XP.</p>
        <div style="display:flex;gap:10px;justify-content:center">
          <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="buyItem('${type}','${id}')">Buy</button>
        </div>`);
    } else {
      toast('Not enough XP!','warn');
    }
  }
}

function buyItem(type,id){
  const inv=Store.get('inventory'), cat=CATALOG[type+'s'];
  const item=cat.find(i=>i.id===id);
  Store.set('totalXP',Store.get('totalXP')-item.cost);
  inv[type+'s'].push(id);
  inv.equipped[type]=id;
  if (type === 'color') {
    const u = Store.get('user');
    if (u) { u.color = id; Store.set('user', u); }
    applyAccentColor(id);
  }
  Store.set('inventory',inv);
  closeModal();
  SFX.bonus();
  if(type==='theme')applyTheme(item);
  updateUserPanel();
  renderStore();
  toast(`Purchased ${item.name}!`,'success');
}

function applyTheme(item){
  const b=document.body;
  b.className=b.className.replace(/light-mode/g,'').trim();
  if(item.style){
    for(let k in item.style) b.style.setProperty(k, item.style[k]);
  } else {
    b.style.removeProperty('--teal');
    b.style.removeProperty('--accent');
  }
  if(item.class) b.classList.add(item.class);
}

// ======================== MATH GAME (Primary 1–6, Egypt curriculum) ========================
let gameState={active:false,questions:[],current:0,score:0,streak:0,xp:0,grade:2,answered:false};
function stopGame(){gameState.active=false;}

function generateNumericOptions(ans){
  const opts=new Set([ans]);let tr=0;
  while(opts.size<4&&tr<50){tr++;let off=Math.floor(Math.random()*Math.max(3,Math.floor(Math.abs(ans)*.3)))+1;if(Math.random()>.5)off=-off;const w=ans+off;if(w>=0)opts.add(w);}
  while(opts.size<4)opts.add(ans+opts.size*2+1);
  return shuffle([...opts]);
}

function genQ(grade){
  let q,ans,opts;
  if(grade===1){
    const types=['compare','add_sub','before_after','days'];
    const type=types[Math.floor(Math.random()*types.length)];
    if(type==='compare'){
      const a=Math.floor(Math.random()*90)+10;let b=Math.floor(Math.random()*90)+10;while(b===a)b=Math.floor(Math.random()*90)+10;
      ans=a>b?`${a} is greater`:`${b} is greater`;
      q=`Which is greater: ${a} or ${b}?`;
      const w1=a<b?`${a} is greater`:`${b} is greater`;const w2='They are equal';
      opts=[ans,w1,w2,`${Math.min(a,b)} is less`].filter((v,i,a)=>a.indexOf(v)===i);while(opts.length<4)opts.push('Neither');opts=shuffle(opts);
    }else if(type==='add_sub'){
      if(Math.random()>.5){const a=Math.floor(Math.random()*10)+1,b=Math.floor(Math.random()*(20-a))+1;ans=a+b;q=`${a} + ${b} = ?`;}
      else{const a=Math.floor(Math.random()*10)+5,b=Math.floor(Math.random()*(a-1))+1;ans=a-b;q=`${a} - ${b} = ?`;}
      opts=generateNumericOptions(ans);
    }else if(type==='before_after'){
      const n=Math.floor(Math.random()*90)+10;
      if(Math.random()>.5){q=`What number comes after ${n}?`;ans=n+1;}else{q=`What number comes before ${n}?`;ans=n-1;}
      opts=generateNumericOptions(ans);
    }else{
      const days=['Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'];
      const today=days[Math.floor(Math.random()*7)],idx=days.indexOf(today),r=Math.random();
      if(r<.33){q=`If today is ${today}, what was yesterday?`;ans=days[(idx+6)%7];}
      else if(r<.66){q=`If today is ${today}, what is tomorrow?`;ans=days[(idx+1)%7];}
      else{q=`If today is ${today}, what day comes after 2 days?`;ans=days[(idx+2)%7];}
      opts=[ans];while(opts.length<4){const w=days[Math.floor(Math.random()*7)];if(!opts.includes(w))opts.push(w);}opts=shuffle(opts);
    }
  }else if(grade===2){
    const types=['regroup','place_value','money','compare_3d'];
    const type=types[Math.floor(Math.random()*types.length)];
    if(type==='regroup'){
      const a=Math.floor(Math.random()*50)+30,b=Math.floor(Math.random()*50)+30;ans=a+b;q=`${a} + ${b} = ?`;opts=generateNumericOptions(ans);
    }else if(type==='place_value'){
      const num=Math.floor(Math.random()*900)+100,str=String(num),pos=Math.floor(Math.random()*3);
      const digit=parseInt(str[pos]),placeNames=['hundreds','tens','ones'],placeVals=[100,10,1];
      ans=digit*placeVals[pos];q=`What is the value of the digit ${digit} in ${num}?`;opts=generateNumericOptions(ans);
    }else if(type==='money'){
      const h=Math.floor(Math.random()*5),t=Math.floor(Math.random()*9),o=Math.floor(Math.random()*9);ans=h*100+t*10+o;
      const parts=[];if(h)parts.push(`${h} x 100 LE`);if(t)parts.push(`${t} x 10 LE`);if(o)parts.push(`${o} x 1 LE`);
      q=`You have ${parts.join(', ')}. How much money do you have?`;opts=generateNumericOptions(ans);
    }else{
      const a=Math.floor(Math.random()*900)+100;let b=Math.floor(Math.random()*900)+100;while(b===a)b=Math.floor(Math.random()*900)+100;
      ans=Math.max(a,b);q=`Which is greater: ${a} or ${b}?`;opts=generateNumericOptions(ans);
    }
  }else if(grade===3){
    const types=['repeated_add','perimeter','area','mass'];
    const type=types[Math.floor(Math.random()*types.length)];
    if(type==='repeated_add'){
      const g=Math.floor(Math.random()*5)+2,p=Math.floor(Math.random()*5)+2;ans=g*p;q=`${g} groups of ${p} = ?`;opts=generateNumericOptions(ans);
    }else if(type==='perimeter'){
      const l=Math.floor(Math.random()*8)+3,w=Math.floor(Math.random()*8)+3;ans=(l+w)*2;q=`A rectangle has length ${l}cm and width ${w}cm. What is its perimeter?`;opts=generateNumericOptions(ans);
    }else if(type==='area'){
      const l=Math.floor(Math.random()*8)+2,w=Math.floor(Math.random()*8)+2;ans=l*w;q=`A rectangle has length ${l}cm and width ${w}cm. What is its area?`;opts=generateNumericOptions(ans);
    }else{
      const kg=Math.floor(Math.random()*5)+1,g=Math.floor(Math.random()*900)+100;
      if(Math.random()>.5){ans=kg*1000+g;q=`${kg}kg ${g}g = ? grams`;}else{ans=Math.round((kg+g/1000)*1000)/1000;q=`${kg*1000+g}g = ? kg`;}
      opts=generateNumericOptions(ans);
    }
  }else if(grade===4){
    const types=['place_big','unit_convert','area_cut','strategy'];
    const type=types[Math.floor(Math.random()*types.length)];
    if(type==='place_big'){
      const num=Math.floor(Math.random()*9000000)+1000000,str=String(num);
      const positions=[{name:'millions',mult:1000000,idx:Math.max(0,str.length-7)},{name:'hundred thousands',mult:100000,idx:Math.max(0,str.length-6)},{name:'ten thousands',mult:10000,idx:Math.max(0,str.length-5)},{name:'thousands',mult:1000,idx:Math.max(0,str.length-4)}].filter(p=>p.idx>=0&&p.idx<str.length);
      if(!positions.length)return genQ(4);
      const pos=positions[Math.floor(Math.random()*positions.length)];
      const digit=parseInt(str[pos.idx]);if(!digit)return genQ(4);
      ans=digit*pos.mult;q=`What is the value of the digit ${digit} in ${num.toLocaleString()}?`;opts=generateNumericOptions(ans);
    }else if(type==='unit_convert'){
      const convs=[{q:v=>`${v} km = ? m`,ans:v=>v*1000,r:[2,20]},{q:v=>`${v*1000} m = ? km`,ans:v=>v,r:[2,15]},{q:v=>`${v} m = ? cm`,ans:v=>v*100,r:[3,20]},{q:v=>`${v} kg = ? g`,ans:v=>v*1000,r:[2,10]},{q:v=>`${v} cm = ? mm`,ans:v=>v*10,r:[3,25]}];
      const c=convs[Math.floor(Math.random()*convs.length)],v=c.r[0]+Math.floor(Math.random()*(c.r[1]-c.r[0]));
      ans=c.ans(v);q=c.q(v);opts=generateNumericOptions(ans);
    }else if(type==='area_cut'){
      const bL=Math.floor(Math.random()*10)+8,bW=Math.floor(Math.random()*8)+6,cL=Math.floor(Math.random()*3)+2,cW=Math.floor(Math.random()*3)+2;
      ans=bL*bW-cL*cW;q=`A rectangle of ${bL}m x ${bW}m has a ${cL}m x ${cW}m piece cut from the corner. What is the remaining area?`;opts=generateNumericOptions(ans);
    }else{
      const problems=[{q:'What is the best way to solve 18 + 7?',ans:'Make 10 (18+2+5)',wrong:['Count on from 18','Double 18 then subtract','Use a number line only']},{q:'What is the best way to solve 25 x 4?',ans:'Double twice (25->50->100)',wrong:['Count by 4s from 0','Multiply normally only','Break 25 into 20+5 then multiply']},{q:'What is the best way to solve 99 + 45?',ans:'Add 100 then subtract 1',wrong:['Count on from 99','Break both numbers apart','Use a number line']},{q:'What is the best way to solve 9 x 6?',ans:'Think 10x6 then subtract 6',wrong:['Count by 9s','Add 9 six times','Memorize it only']}];
      const p=problems[Math.floor(Math.random()*problems.length)];q=p.q;ans=p.ans;opts=shuffle([ans,...p.wrong]);
    }
  }else if(grade===5){
    const types=['decimal_add','decimal_money','power_of_10','fraction_compare','fraction_add'];
    const type=types[Math.floor(Math.random()*types.length)];
    if(type==='decimal_add'){
      const a=Math.round((Math.random()*9+1)*10)/10,b=Math.round((Math.random()*9+1)*10)/10;
      ans=Math.round((a+b)*10)/10;q=`${a} + ${b} = ?`;opts=generateNumericOptions(ans);
    }else if(type==='decimal_money'){
      const price=Math.round((Math.random()*90+10)*10)/10,kg=Math.floor(Math.random()*9)+2;
      ans=Math.round(price*kg*10)/10;q=`If 1kg of apples costs ${price} LE, how much do ${kg}kg cost?`;opts=generateNumericOptions(ans);
    }else if(type==='power_of_10'){
      const n=Math.floor(Math.random()*4)+2,base=Math.round((Math.random()*9+1)*100)/100;
      ans=Math.round(base*Math.pow(10,n)*100)/100;q=`${base} x 10${'^'.repeat(n)} = ?`;opts=generateNumericOptions(ans);
    }else if(type==='fraction_compare'){
      const dens=[2,3,4,5,6,8,10],d=dens[Math.floor(Math.random()*dens.length)];
      const n1=Math.floor(Math.random()*(d-1))+1;let n2=Math.floor(Math.random()*(d-1))+1;while(n2===n1)n2=Math.floor(Math.random()*(d-1))+1;
      ans=n1>n2?`${n1}/${d} is greater`:`${n2}/${d} is greater`;
      q=`Which is greater: ${n1}/${d} or ${n2}/${d}?`;
      const w1=n1>n2?`${n2}/${d} is greater`:`${n1}/${d} is greater`;
      opts=[ans,w1,'They are equal',`${Math.min(n1,n2)}/${d} is less`].filter((v,i,a)=>a.indexOf(v)===i);while(opts.length<4)opts.push('Cannot compare');opts=shuffle(opts);
    }else{
      const dens=[2,3,4,5,6,8,10],d=dens[Math.floor(Math.random()*dens.length)];
      const n1=Math.floor(Math.random()*(d-1))+1,n2=Math.floor(Math.random()*(d-1))+1,numAns=n1+n2;
      ans=numAns+'/'+d;q=numAns>d?`${n1}/${d} + ${n2}/${d} = ? (improper)`:`${n1}/${d} + ${n2}/${d} = ?`;
      opts=[ans];while(opts.length<4){const w=numAns+Math.floor(Math.random()*5)-2;if(w>0&&w!==numAns)opts.push(w+'/'+d);}opts=shuffle(opts);
    }
  }else{
    const types=['absolute_val','ratio','percent_real','neg_compare','percent_simple'];
    const type=types[Math.floor(Math.random()*types.length)];
    if(type==='absolute_val'){
      const a=Math.floor(Math.random()*20)+1,b=Math.floor(Math.random()*15)+1,v1=Math.random()>.5?a:-a;
      ans=Math.abs(v1)>b?`|${v1}| is greater`:`${b} is greater`;
      q=`Compare: |${v1}| and ${b}`;
      const w1=Math.abs(v1)>b?`${b} is greater`:`|${v1}| is greater`;
      opts=[ans,w1,'They are equal',`|${b}|`].filter((v,i,a)=>a.indexOf(v)===i);while(opts.length<4)opts.push('Cannot determine');opts=shuffle(opts);
    }else if(type==='ratio'){
      const pairs=[[250,1000,'1:4'],[150,300,'1:2'],[400,1000,'2:5'],[75,300,'1:4'],[200,500,'2:5'],[120,360,'1:3'],[60,180,'1:3'],[300,500,'3:5'],[40,100,'2:5'],[180,600,'3:10'],[350,700,'1:2']];
      const pair=pairs[Math.floor(Math.random()*pairs.length)];ans=pair[2];
      q=`Find the ratio of ${pair[0]}g to ${pair[1]}g in simplest form.`;
      const wrongs=pairs.filter(p=>p[2]!==pair[2]).map(p=>p[2]).filter((v,i,a)=>a.indexOf(v)===i).slice(0,3);
      opts=shuffle([ans,...wrongs]).slice(0,4);while(opts.length<4)opts.push(pair[0]+':'+pair[1]);
    }else if(type==='percent_real'){
      const scenarios=[{q:'A shirt costs 200 LE and is now 25% off. What is the discount?',ans:50},{q:'A shirt costs 200 LE and is now 25% off. What is the new price?',ans:150},{q:'Ali scored 80 out of 100 on a test. What is his percentage?',ans:80},{q:'A class has 40 students. 60% are girls. How many girls are there?',ans:24},{q:'A class has 40 students. 60% are girls. How many boys are there?',ans:16},{q:'The price went from 100 LE to 120 LE. What is the increase percentage?',ans:20},{q:'A book costs 80 LE. The shop offers 10% discount. How much do you pay?',ans:72},{q:'You need 360 LE and you have saved 75% of it. How much have you saved?',ans:270}];
      const s=scenarios[Math.floor(Math.random()*scenarios.length)];ans=s.ans;q=s.q;opts=generateNumericOptions(ans);
    }else if(type==='neg_compare'){
      const a=Math.floor(Math.random()*10)+1,b=Math.floor(Math.random()*10)+1;ans=`${b} is greater`;
      q=`Which is greater: -${a} or ${b}?`;
      opts=[`-${a} is greater`,ans,'They are equal',`|-${a}|`].filter((v,i,a)=>a.indexOf(v)===i);while(opts.length<4)opts.push('Cannot compare');opts=shuffle(opts);
    }else{
      const pct=[10,20,25,50,75][Math.floor(Math.random()*5)],base=Math.floor(Math.random()*40)+5;
      ans=Math.round(base*pct/100);q=`What is ${pct}% of ${base}?`;opts=generateNumericOptions(ans);
    }
  }
  return{q,ans,opts};
}

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

function renderLearn(){
  updateUserPanel();const el=document.getElementById('view-learn'),u=Store.get('user'),grade=u?u.grade:2;
  if(!gameState.active){
    const best={};Store.get('games').filter(g=>g.type==='math').forEach(g=>{if(!best[g.grade]||g.xp>best[g.grade].xp)best[g.grade]=g;});
    el.innerHTML=`<div style="max-width:600px;margin:0 auto;text-align:center"><h1 style="font-size:26px;font-weight:700;margin-bottom:6px">Learn & Play</h1><p style="color:var(--text2);margin-bottom:28px">Practice math with quick, fun rounds.</p>
      <div class="card" style="margin-bottom:24px;text-align:left"><div style="display:flex;align-items:center;gap:14px;margin-bottom:16px"><div class="char-face happy"><div class="eye l"></div><div class="eye r"></div><div class="mouth"></div></div><div><div style="font-weight:700;font-size:17px">Math Adventure</div><div style="font-size:13px;color:var(--text2)">Primary (Grades 1–6) &middot; 10 questions &middot; +10 XP each</div></div></div>
      <label style="font-weight:700;font-size:14px;display:block;margin-bottom:10px">Grade Level</label><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px">${[1,2,3,4,5,6].map(g=>`<button class="grade-pill ${g===grade?'selected':''}" onclick="gameState.grade=${g};SFX.click();renderLearn()">${g}</button>`).join('')}</div>
      <button class="btn btn-lg btn-primary" style="width:100%;justify-content:center" onclick="startMathGame()"><i class="fas fa-play"></i> Start Round</button>
      ${best[gameState.grade]?`<div style="text-align:center;margin-top:12px;font-size:13px;color:var(--text2)">Best: ${best[gameState.grade].score}/${best[gameState.grade].total} &middot; ${best[gameState.grade].xp} XP</div>`:''}</div>
      <div class="card" style="text-align:left"><h3 style="font-size:15px;margin-bottom:10px"><i class="fas fa-info-circle" style="color:var(--blue)"></i> Scoring</h3><div style="font-size:13px;color:var(--text2);display:flex;flex-direction:column;gap:6px"><div><span style="color:var(--green);font-weight:700">+10 XP</span> correct answer</div><div><span style="color:var(--accent);font-weight:700">Streak bonus</span> 3+ in a row = +5 extra</div><div><span style="color:#D8B4FE;font-weight:700">Surprise bonus</span> random bonus after rounds</div><div><span style="color:var(--text);font-weight:700">No penalty</span> for wrong answers</div></div></div></div>`;
  } else renderMathQ(el);
}

function startMathGame(){SFX.click();gameState={active:true,questions:[],current:0,score:0,streak:0,xp:0,grade:gameState.grade,answered:false};for(let i=0;i<10;i++)gameState.questions.push(genQ(gameState.grade));renderLearn();}

function renderMathQ(el){const q=gameState.questions[gameState.current];el.innerHTML=`<div style="max-width:560px;margin:0 auto"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px"><button class="btn btn-sm btn-ghost" onclick="gameState.active=false;renderLearn()"><i class="fas fa-arrow-left"></i> Quit</button><div style="display:flex;align-items:center;gap:16px;font-size:14px"><span style="color:var(--green);font-weight:700"><i class="fas fa-bolt"></i> ${gameState.xp} XP</span>${gameState.streak>=3?`<span style="color:var(--accent);font-weight:700"><i class="fas fa-fire"></i> ${gameState.streak} streak</span>`:''}</div></div><div style="display:flex;gap:6px;margin-bottom:24px">${gameState.questions.map((_,i)=>{if(i<gameState.current)return'<div class="progress-dot done"></div>';if(i===gameState.current)return'<div class="progress-dot current"></div>';return'<div class="progress-dot"></div>';}).join('')}</div><div style="display:flex;justify-content:center;margin-bottom:16px;position:relative" id="game-char-wrap"><div class="char-face" id="game-char"><div class="eye l"></div><div class="eye r"></div><div class="mouth"></div></div></div><div class="card card-glow" style="text-align:center;margin-bottom:24px;padding:32px 20px"><div style="font-size:14px;color:var(--text2);margin-bottom:8px">Question ${gameState.current+1} of 10</div><div style="font-family:Fredoka;font-size:36px;font-weight:700">${q.q}</div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px" id="game-options">${q.opts.map(o=>`<button class="btn btn-secondary btn-lg" style="justify-content:center;font-size:22px;font-family:Fredoka" data-answer="${o}" onclick="answerMath('${String(o).replace(/'/g,"\\'")}')">${o}</button>`).join('')}</div></div>`;}

function answerMath(chosen){if(gameState.answered)return;gameState.answered=true;const q=gameState.questions[gameState.current];const correct=String(chosen)===String(q.ans);const ch=document.getElementById('game-char'),btns=document.querySelectorAll('#game-options button');btns.forEach(b=>{const v=b.dataset.answer;const match=String(v)===String(q.ans);b.disabled=true;if(match){b.style.background='var(--green)';b.style.color='#0F0F14';b.style.borderColor='var(--green)';}else if(String(v)===String(chosen)&&!correct){b.style.background='var(--red)';b.style.color='#fff';b.style.borderColor='var(--red)';}else b.style.opacity='.4';});if(correct){gameState.score++;gameState.streak++;let xp=10;if(gameState.streak>=3)xp+=5;gameState.xp+=xp;if(ch)ch.className='char-face happy';SFX.correct();spawnP(document.getElementById('game-char-wrap'),['#FFD93D','#FF8C42','#7EE787','#4ECDC4']);}else{gameState.streak=0;if(ch)ch.className='char-face thinking';SFX.wrong();}setTimeout(()=>{gameState.current++;gameState.answered=false;if(gameState.current>=10)endMathGame();else renderLearn();},correct?1000:1800);}

function spawnP(c,cols){if(!c)return;for(let i=0;i<12;i++){const p=document.createElement('div');p.className='particle';const a=(Math.PI*2/12)*i+Math.random()*.5,d=60+Math.random()*40,sz=6+Math.random()*6;p.style.cssText=`left:50%;top:50%;background:${cols[i%cols.length]};--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d}px;width:${sz}px;height:${sz}px;`;c.appendChild(p);setTimeout(()=>p.remove(),800);}}

function endMathGame(){gameState.active=false;SFX.complete();const gr=gameState.grade,game={id:Date.now(),type:'math',score:gameState.score,total:10,xp:gameState.xp,date:new Date().toISOString(),grade:gr};const games=Store.get('games');games.push(game);Store.set('games',games);Store.addXP(gameState.xp);completeQuest('game');let bx=0;if(Math.random()<.25){bx=20+Math.floor(Math.random()*31);Store.addXP(bx);setTimeout(()=>SFX.bonus(),400);}const st=gameState.score>=9?3:gameState.score>=7?2:gameState.score>=5?1:0;const sh='<i class="fas fa-star" style="color:#FFD93D;font-size:28px;margin:0 4px"></i>'.repeat(st)+'<i class="fas fa-star" style="color:var(--border);font-size:28px;margin:0 4px"></i>'.repeat(3-st);showModal(`<div style="text-align:center"><div style="margin-bottom:12px">${sh}</div><h2 style="font-size:22px;margin-bottom:4px">Round Complete!</h2><p style="color:var(--text2);margin-bottom:20px">Grade ${gr} Math</p><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:${bx>0?'12px':'20px'}"><div class="card" style="padding:12px"><div style="font-family:Fredoka;font-size:28px;color:var(--green)">${gameState.score}/10</div><div style="font-size:12px;color:var(--text2)">Correct</div></div><div class="card" style="padding:12px"><div style="font-family:Fredoka;font-size:28px;color:var(--accent)">+${gameState.xp}</div><div style="font-size:12px;color:var(--text2)">XP Earned</div></div><div class="card" style="padding:12px"><div style="font-family:Fredoka;font-size:28px;color:var(--teal)">${Math.max(...Store.get('games').filter(g=>g.type==='math'&&g.grade===gr).map(g=>g.xp))}</div><div style="font-size:12px;color:var(--text2)">Best XP</div></div></div>${bx>0?`<div class="card bonus-card bonus-pop" style="margin-bottom:20px;padding:16px;border:1px solid rgba(216,180,254,.3)"><div style="display:flex;align-items:center;gap:12px;justify-content:center"><i class="fas fa-gift" style="font-size:24px;color:#D8B4FE"></i><div style="text-align:left"><div style="font-weight:800;font-size:16px;color:#D8B4FE">Surprise Bonus!</div><div style="font-size:13px;color:var(--text2)">You earned an extra +${bx} XP</div></div></div></div>`:''}<div style="display:flex;gap:12px;justify-content:center"><button class="btn btn-secondary" onclick="closeModal();renderLearn()">Back</button><button class="btn btn-primary" onclick="closeModal();startMathGame()">Play Again</button></div></div>`);}

// ======================== RESOURCES ========================
function renderResources(){updateUserPanel();const el=document.getElementById('view-resources'),u=Store.get('user'),grade=u?u.grade:2;el.innerHTML=`<div style="max-width:900px;margin:0 auto"><h1 style="font-size:26px;font-weight:700;margin-bottom:6px">Free Learning Resources</h1><p style="color:var(--text2);margin-bottom:24px">Curated for the Egyptian curriculum. All free or free-with-school-email.</p><div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:8px"><div><label style="font-size:12px;color:var(--text2);display:block;margin-bottom:4px">Grade</label><select class="input" id="res-grade" style="width:auto;padding:8px 12px" onchange="filterRes()"><option value="all">All Grades</option><optgroup label="Primary">${[1,2,3,4,5,6].map(g=>`<option value="${g}" ${g===grade?'selected':''}>Grade ${g}</option>`).join('')}</optgroup><optgroup label="Preparatory">${[7,8,9].map(g=>`<option value="${g}" ${g===grade?'selected':''}>Grade ${g}</option>`).join('')}</optgroup><optgroup label="Secondary">${[10,11,12].map(g=>`<option value="${g}" ${g===grade?'selected':''}>Grade ${g}</option>`).join('')}</optgroup></select></div><div><label style="font-size:12px;color:var(--text2);display:block;margin-bottom:4px">Subject</label><select class="input" id="res-subject" style="width:auto;padding:8px 12px" onchange="filterRes()"><option value="all">All Subjects</option><option value="Math">Math</option><option value="Arabic">Arabic</option><option value="English">English</option><option value="Science">Science</option><option value="Physics">Physics</option><option value="Chemistry">Chemistry</option><option value="Biology">Biology</option><option value="Social Studies">Social Studies</option><option value="History">History</option><option value="Philosophy">Philosophy</option></select></div></div><div id="res-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;margin-top:16px"></div><div id="res-empty" style="display:none;text-align:center;padding:40px;color:var(--text2)"><i class="fas fa-search" style="font-size:32px;margin-bottom:12px;display:block"></i>No resources match this filter.</div></div>`;filterRes();}

function filterRes(){const g=document.getElementById('res-grade').value,s=document.getElementById('res-subject').value,f=RESOURCES.filter(r=>{if(g!=='all'&&!r.grades.includes(parseInt(g)))return false;if(s!=='all'&&!r.subjects.includes(s))return false;return true;}),grid=document.getElementById('res-grid'),empty=document.getElementById('res-empty');if(!f.length){grid.innerHTML='';empty.style.display='block';return;}empty.style.display='none';const colors={Math:'rgba(255,140,66,.12);color:var(--accent)',Arabic:'rgba(239,68,68,.12);color:#EF4444',English:'rgba(88,166,255,.12);color:var(--blue)',Science:'rgba(78,205,196,.12);color:var(--teal)',Physics:'rgba(168,85,247,.12);color:#A855F7',Chemistry:'rgba(6,182,212,.12);color:#06B6D4',Biology:'rgba(34,197,94,.12);color:#22C55E','Social Studies':'rgba(251,191,36,.12);color:#FBBF24',History:'rgba(251,191,36,.12);color:#FBBF24',Philosophy:'rgba(236,72,153,.12);color:#EC4899'};grid.innerHTML=f.map(r=>`<a href="${r.url}" target="_blank" rel="noopener" class="res-card" onclick="completeQuest('resource');return true;" style="text-decoration:none;color:inherit;display:block"><div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><div style="width:40px;height:40px;border-radius:10px;background:${r.color}22;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fas ${r.icon}" style="color:${r.color};font-size:16px"></i></div><div style="flex:1;min-width:0"><div style="font-weight:700;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.name}</div><div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:2px">${r.subjects.map(x=>`<span class="tag" style="background:${colors[x]||'rgba(78,205,196,.12);color:var(--teal)'};font-size:10px;padding:2px 6px">${x}</span>`).join('')}</div></div><i class="fas fa-external-link-alt" style="color:var(--text2);font-size:12px"></i></div><p style="font-size:13px;color:var(--text2);line-height:1.4">${r.desc}</p><div style="margin-top:8px;font-size:11px;color:var(--text2)">Grades ${r.grades[0]}–${r.grades[r.grades.length-1]}</div></a>`).join('');}

// ======================== PROGRESS ========================
let progressChart=null;
function renderProgress(){updateUserPanel();const el=document.getElementById('view-progress'),ts=Store.get('sessions').length,tg=Store.get('games').length,tfm=Store.get('sessions').reduce((s,x)=>s+x.duration,0),txp=Store.get('totalXP'),ad=ts>0?(Store.get('sessions').reduce((s,x)=>s+x.distractions,0)/ts).toFixed(1):'0';const labels=[],fd=[],xd=[];for(let i=6;i>=0;i--){const d=new Date(Date.now()-i*86400000);labels.push(d.toLocaleDateString('en',{weekday:'short'}));const ds=d.toDateString();fd.push(Store.get('sessions').filter(s=>new Date(s.date).toDateString()===ds).reduce((s,x)=>s+x.duration,0));xd.push(Store.get('games').filter(g=>new Date(g.date).toDateString()===ds).reduce((s,g)=>s+g.xp,0));}const games=Store.get('games').filter(g=>new Date(g.date).getTime()>Date.now()-7*86400000);const sessions=Store.get('sessions');el.innerHTML=`<div style="max-width:900px;margin:0 auto"><h1 style="font-size:26px;font-weight:700;margin-bottom:6px">Your Progress</h1><p style="color:var(--text2);margin-bottom:28px">Every minute counts.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin-bottom:28px"><div class="card stat-card"><div class="stat-num" style="color:var(--teal)">${tfm}m</div><div class="stat-label">Total focus</div></div><div class="card stat-card"><div class="stat-num" style="color:var(--accent)">${txp}</div><div class="stat-label">Total XP</div></div><div class="card stat-card"><div class="stat-num" style="color:var(--green)">${ts}</div><div class="stat-label">Sessions</div></div><div class="card stat-card"><div class="stat-num" style="color:var(--blue)">${tg}</div><div class="stat-label">Games played</div></div><div class="card stat-card"><div class="stat-num" style="color:var(--text)">${ad}</div><div class="stat-label">Avg distractions</div></div></div><div class="card" style="margin-bottom:28px"><h3 style="font-size:16px;margin-bottom:16px">Last 7 Days</h3><div style="position:relative;height:260px"><canvas id="progress-chart"></canvas></div></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px"><div class="card"><h3 style="font-size:16px;margin-bottom:14px"><i class="fas fa-bullseye" style="color:var(--teal)"></i> Recent Focus Sessions</h3>${!sessions.length?'<p style="color:var(--text2);font-size:14px">No focus sessions yet.</p>':`<div style="display:flex;flex-direction:column;gap:8px">${sessions.slice(-8).reverse().map(s=>`<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--bg);border-radius:10px"><div style="width:36px;height:36px;border-radius:8px;background:var(--teal-g);display:flex;align-items:center;justify-content:center"><i class="fas fa-clock" style="color:var(--teal);font-size:14px"></i></div><div style="flex:1"><div style="font-weight:700;font-size:14px">${escHtml(s.task)}</div><div style="font-size:12px;color:var(--text2)">${new Date(s.date).toLocaleDateString()} &middot; ${s.distractions} distraction${s.distractions!==1?'s':''}</div></div><div style="text-align:right"><div style="font-weight:700;font-size:14px;color:var(--teal)">${s.duration}m</div><div style="font-size:12px;color:var(--green)">+${s.duration*2} XP</div></div></div>`).join('')}</div>`}</div><div class="card"><h3 style="font-size:16px;margin-bottom:14px"><i class="fas fa-gamepad" style="color:var(--accent)"></i> Recent Games</h3>${!games.length?'<p style="color:var(--text2);font-size:14px">No games played recently.</p>':`<div style="display:flex;flex-direction:column;gap:8px">${games.slice(-8).reverse().map(g=>`<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--bg);border-radius:10px"><div style="width:36px;height:36px;border-radius:8px;background:rgba(255,140,66,.12);display:flex;align-items:center;justify-content:center"><i class="fas fa-gamepad" style="color:var(--accent);font-size:14px"></i></div><div style="flex:1"><div style="font-weight:700;font-size:14px">Grade ${g.grade} Math</div><div style="font-size:12px;color:var(--text2)">${new Date(g.date).toLocaleDateString()}</div></div><div style="text-align:right"><div style="font-weight:700;font-size:14px;color:var(--green)">${g.score}/${g.total}</div><div style="font-size:12px;color:var(--accent)">+${g.xp} XP</div></div></div>`).join('')}</div>`}</div></div></div>`;if(progressChart)progressChart.destroy();const ctx=document.getElementById('progress-chart');if(ctx){progressChart=new Chart(ctx,{type:'bar',data:{labels,datasets:[{label:'Focus (min)',data:fd,backgroundColor:'rgba(78,205,196,0.6)',borderColor:'#4ECDC4',borderWidth:1,borderRadius:6,barPercentage:.5},{label:'XP Earned',data:xd,backgroundColor:'rgba(255,140,66,0.6)',borderColor:'#FF8C42',borderWidth:1,borderRadius:6,barPercentage:.5}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#9B97A0',font:{family:'Nunito',weight:'600'}}}},scales:{x:{grid:{color:'rgba(42,42,61,0.5)'},ticks:{color:'#9B97A0',font:{family:'Nunito'}}},y:{grid:{color:'rgba(42,42,61,0.5)'},ticks:{color:'#9B97A0',font:{family:'Nunito'}},beginAtZero:true}}}});}}

// ======================== SETTINGS ========================
function renderSettings(){updateUserPanel();const el=document.getElementById('view-settings'),u=Store.get('user')||{name:'',grade:2,color:'#FF8C42'},s=Store.get('settings'),thoughts=Store.get('thoughts')||[];
const gradeSections=(sel)=>`<div style="margin-bottom:6px"><div style="font-size:11px;color:var(--text2);margin-bottom:4px">Primary</div><div style="display:flex;gap:6px;flex-wrap:wrap">${[1,2,3,4,5,6].map(g=>`<button class="grade-pill ${g===sel?'selected':''}" onclick="document.querySelectorAll('#view-settings .grade-pill').forEach(p=>p.classList.remove('selected'));this.classList.add('selected');this.dataset.val='${g}'" data-val="${g}">${g}</button>`).join('')}</div></div><div style="margin-bottom:6px"><div style="font-size:11px;color:var(--text2);margin-bottom:4px">Preparatory</div><div style="display:flex;gap:6px;flex-wrap:wrap">${[7,8,9].map(g=>`<button class="grade-pill ${g===sel?'selected':''}" onclick="document.querySelectorAll('#view-settings .grade-pill').forEach(p=>p.classList.remove('selected'));this.classList.add('selected');this.dataset.val='${g}'" data-val="${g}">${g}</button>`).join('')}</div></div><div><div style="font-size:11px;color:var(--text2);margin-bottom:4px">Secondary (Thanawya Amma)</div><div style="display:flex;gap:6px;flex-wrap:wrap">${[10,11,12].map(g=>`<button class="grade-pill ${g===sel?'selected':''}" onclick="document.querySelectorAll('#view-settings .grade-pill').forEach(p=>p.classList.remove('selected'));this.classList.add('selected');this.dataset.val='${g}'" data-val="${g}">${g}</button>`).join('')}</div></div>`;
  el.innerHTML=`<div style="max-width:700px;margin:0 auto"><h1 style="font-size:26px;font-weight:700;margin-bottom:6px">Settings</h1><p style="color:var(--text2);margin-bottom:28px">Customize Spark.</p>
    <div class="card" style="margin-bottom:20px"><h3 style="font-size:16px;margin-bottom:14px"><i class="fas fa-user" style="color:var(--accent);margin-right:8px"></i>Profile</h3><div style="margin-bottom:12px"><label style="font-size:13px;color:var(--text2);display:block;margin-bottom:4px">Name</label><input class="input" id="set-name" value="${u.name}" placeholder="Your name"></div><div style="margin-bottom:12px"><label style="font-size:13px;color:var(--text2);display:block;margin-bottom:4px">Grade</label>${gradeSections(u.grade)}</div><div><label style="font-size:13px;color:var(--text2);display:block;margin-bottom:6px">Color</label>
<div style="display:flex;gap:8px;flex-wrap:wrap">
  ${(function() {
    const ownedColors = Store.get('inventory').colors || ['#FF8C42'];
    return ['#FF8C42','#4ECDC4','#FF6B6B','#58A6FF','#A855F7','#22C55E','#EC4899','#FBBF24'].map(c => {
      const isOwned = ownedColors.includes(c);
      if (isOwned) {
        return `<div class="color-opt ${c===u.color?'selected':''}" style="background:${c}" data-color="${c}" onclick="document.querySelectorAll('.color-opt').forEach(o=>o.classList.remove('selected'));this.classList.add('selected')"></div>`;
      } else {
        return `<div class="color-opt locked-color" style="background:${c}; position:relative; display:flex; align-items:center; justify-content:center; opacity:0.4; cursor:pointer;" onclick="navigate('store'); toast('Unlock this color in the Store first!','info')">
          <i class="fas fa-lock" style="font-size:11px; color:#fff;"></i>
        </div>`;
      }
    }).join('');
  })()}
</div></div><button class="btn btn-primary btn-sm" style="margin-top:14px" onclick="saveProfile()">Save Profile</button></div>
<div><label style="font-size:13px;color:var(--text2);display:block;margin-bottom:6px">Default focus duration</label><div style="display:flex;gap:6px">${[5,10,15,20,25,30,45,60].map(m=>`<button class="grade-pill ${m===s.focusDuration?'selected':''}" onclick="Store.get('settings').focusDuration=${m};Store.save();SFX.click();renderSettings()">${m} min</button>`).join('')}</div></div><div style="margin-top:12px;"><label style="font-size:13px;color:var(--text2);display:block;margin-bottom:6px">Default break duration</label><div style="display:flex;gap:6px">${[3, 5, 10].map(m => `<button class="grade-pill ${m === s.breakDuration ? 'selected' : ''}" onclick="Store.get('settings').breakDuration=${m};Store.save();SFX.click();renderSettings()">${m} min</button>`).join('')}</div></div></div>
<div class="card" style="margin-bottom:20px;border-color:rgba(255,140,66,.2)"><h3 style="font-size:16px;margin-bottom:14px"><i class="fas fa-shield-alt" style="color:var(--accent);margin-right:8px"></i>Focus Mode</h3>
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px"><div><div style="font-weight:700;font-size:14px">Strict Focus Mode</div><div style="font-size:12px;color:var(--text2)">Adds a 5-second delay to stop timer and warns on tab close.</div></div><button class="btn ${s.strictMode?'btn-primary':'btn-secondary'} btn-sm" onclick="toggleStrict()">${s.strictMode?'Strict ON':'Strict OFF'}</button></div></div>
<div class="card" style="margin-bottom:20px;border-color:rgba(78,205,196,.15)"><h3 style="font-size:16px;margin-bottom:6px;display:flex;align-items:center;gap:8px"><i class="fas fa-cloud" style="color:var(--teal)"></i> Thought Journal</h3><p style="font-size:13px;color:var(--text2);margin-bottom:14px">Ideas you parked during focus sessions. Safe here for later.</p>${!thoughts.length?'<p style="font-size:14px;color:var(--text2);padding:12px 0">No thoughts yet. Use the Thought Dump during your next focus session.</p>':`<div style="display:flex;flex-direction:column;gap:6px;max-height:300px;overflow-y:auto">${thoughts.slice(0,50).map(t=>`<div class="thought-entry"><div class="thought-text">${t.text}</div><div class="thought-time">${new Date(t.date).toLocaleDateString()} ${new Date(t.date).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div></div>`).join('')}</div>${thoughts.length>50?`<div style="font-size:12px;color:var(--text2);margin-top:8px">Showing 50 of ${thoughts.length}</div>`:''}<button class="btn btn-sm btn-ghost" style="margin-top:10px;color:var(--red);border:1px solid rgba(255,107,107,.2)" onclick="Store.set('thoughts',[]);renderSettings();toast('Journal cleared','info')"><i class="fas fa-trash"></i> Clear Journal</button>`}</div>
    <div class="card" style="margin-bottom:20px;border-color:rgba(255,140,66,.2)"><h3 style="font-size:16px;margin-bottom:14px"><i class="fas fa-lightbulb" style="color:var(--accent);margin-right:8px"></i>ADHD-Friendly Features</h3><div style="display:flex;flex-direction:column;gap:10px;font-size:14px;color:var(--text2);line-height:1.5"><div><span style="color:var(--teal);font-weight:700">Task Breaker</span> — Big tasks become 6 tiny steps.</div><div><span style="color:var(--teal);font-weight:700">"Just Start" Timer</span> — Commit to 10 minutes. Minute zero is the real battle.</div><div><span style="color:var(--teal);font-weight:700">Pause Nudge</span> — Gentle reminder if you pause too long.</div><div><span style="color:var(--teal);font-weight:700">Body Doubling</span> — A study buddy works alongside you.</div><div><span style="color:var(--teal);font-weight:700">Thought Dump</span> — Park random ideas and release them. Saved for later.</div><div><span style="color:var(--teal);font-weight:700">Brown Noise & Rain</span> — Cancels the noise inside your head.</div><div><span style="color:var(--teal);font-weight:700">Surprise Bonuses</span> — Random XP keeps your brain engaged.</div><div><span style="color:var(--teal);font-weight:700">Focus Shield</span> — Removes the "just check one thing" trap.</div></div></div>
    <div class="card"><h3 style="font-size:16px;margin-bottom:14px"><i class="fas fa-database" style="color:var(--text2);margin-right:8px"></i>Data</h3><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-sm btn-secondary" onclick="exportData()"><i class="fas fa-download"></i> Export Data</button><button class="btn btn-sm" style="background:var(--red);color:#fff" onclick="clearData()"><i class="fas fa-trash"></i> Clear All Data</button></div><p style="font-size:12px;color:var(--text2);margin-top:8px">All data stored locally in your browser. Nothing sent to any server.</p></div></div>`;
  genBookmarklet();
}

function toggleStrict(){const s=Store.get('settings');s.strictMode=!s.strictMode;Store.set('settings',s);renderSettings();toast(s.strictMode?'Strict Mode Enabled':'Strict Mode Disabled','info');}

function saveProfile(){const n=document.getElementById('set-name').value.trim();if(!n){toast('Please enter your name','warn');return;}const g=document.querySelector('#view-settings .grade-pill.selected[data-val]'),gr=g?parseInt(g.dataset.val):2,c=document.querySelector('.color-opt.selected'),cl=c?c.dataset.color:'#FF8C42';Store.set('user',{name:n,grade:gr,color:cl});updateUserPanel();toast('Profile saved!','success');SFX.click();}
function saveWhitelist(){const t=document.getElementById('whitelist-input').value,w=t.split('\n').map(s=>s.trim().toLowerCase()).filter(s=>s&&!s.startsWith('//')&&!s.startsWith('#'));Store.get('settings').whitelist=w;Store.save();genBookmarklet();toast('Whitelist updated!','success');}
function genBookmarklet(){const w=JSON.stringify(Store.get('settings').whitelist),u=location.href.split('#')[0]+'#focus',c=`javascript:void((function(){var w=${w},h=location.hostname.toLowerCase(),ok=w.some(function(d){return h.indexOf(d)!==-1});if(!ok){location.href='${u}';}else{var m=document.createElement('div');m.style.cssText='position:fixed;top:20px;right:20px;z-index:99999;padding:12px 20px;background:#1C1C2A;color:#4ECDC4;border-radius:10px;font-family:sans-serif;font-size:14px;font-weight:bold;box-shadow:0 8px 25px rgba(0,0,0,0.5)';m.textContent='\\u2713 Productive site. Keep going!';document.body.appendChild(m);setTimeout(function(){m.remove()},2000);}})())`;const l=document.getElementById('bookmarklet-link');if(l)l.href=c;}
function exportData(){const b=new Blob([JSON.stringify(Store._d,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='spark-data.json';a.click();toast('Data exported!','success');}
function clearData(){showModal(`<h2 style="font-size:20px;margin-bottom:10px">Clear All Data?</h2><p style="color:var(--text2);margin-bottom:20px">This cannot be undone. Includes flashcard decks stored in IndexedDB.</p><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn" style="background:var(--red);color:#fff" onclick="localStorage.removeItem('spark_data');localStorage.removeItem('spark_sticky_notes');localStorage.removeItem('sticky_notes');localStorage.removeItem('stickyNotes');localStorage.removeItem('spark_sticky_notes_visible');localStorage.removeItem('sticky_notes_visible');localStorage.removeItem('spark_sticky_notes_highest_z');localStorage.removeItem('sticky_notes_highest_z');Store.load();FlashDB.clearAll().catch(()=>{});cleanupFlash();closeModal();showOnboarding();renderStickyNotes();toast('All data cleared','info')">Delete Everything</button></div>`);}

// ======================== FLASHCARDS (IndexedDB + SM-2) ========================
function escHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function idbReq(req){return new Promise((ok,no)=>{req.onsuccess=()=>ok(req.result);req.onerror=()=>no(req.error);});}

function sm2Update(card,quality){
  let n=card.repetitions||0,I=card.interval||0,EF=card.easiness||2.5;
  if(quality<3){n=0;I=1;}else{if(n===0)I=1;else if(n===1)I=6;else I=Math.round(I*EF);n++;}
  EF=EF+(0.1-(5-quality)*(0.08+(5-quality)*0.02));
  if(EF<1.3)EF=1.3;
  return{repetitions:n,interval:I,easiness:EF,nextReview:Date.now()+I*86400000,lastReview:Date.now()};
}

const FlashDB={
  db:null,
  open(){
    if(this.db)return Promise.resolve(this.db);
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open('spark_flashcards',1);
      req.onupgradeneeded=e=>{
        const db=e.target.result;
        if(!db.objectStoreNames.contains('decks'))db.createObjectStore('decks',{keyPath:'id'});
        if(!db.objectStoreNames.contains('cards')){
          const s=db.createObjectStore('cards',{keyPath:'id',autoIncrement:true});
          s.createIndex('deckId','deckId',{unique:false});
          s.createIndex('nextReview','nextReview',{unique:false});
        }
      };
      req.onsuccess=()=>{this.db=req.result;resolve(this.db);};
      req.onerror=()=>reject(req.error);
    });
  },
  _store(name,mode){return this.db.transaction(name,mode).objectStore(name);},
  async getAllDecks(){await this.open();return idbReq(this._store('decks','readonly').getAll());},
  async saveDeck(deck){await this.open();return idbReq(this._store('decks','readwrite').put(deck));},
  async deleteDeck(id){await this.open();const cards=await this.getCardsByDeck(id);const tx=this.db.transaction(['cards','decks'],'readwrite');cards.forEach(c=>tx.objectStore('cards').delete(c.id));tx.objectStore('decks').delete(id);return idbReq(tx);},
  async getCardsByDeck(deckId){await this.open();return idbReq(this._store('cards','readonly').index('deckId').getAll(deckId));},
  async saveCard(card){await this.open();return idbReq(this._store('cards','readwrite').put(card));},
  async deleteCard(id){await this.open();return idbReq(this._store('cards','readwrite').delete(id));},
  async getDeckStats(deckId){
    const cards=await this.getCardsByDeck(deckId),now=Date.now();
    const total=cards.length,newC=cards.filter(c=>!c.repetitions).length;
    const due=cards.filter(c=>c.repetitions>0&&c.nextReview<=now).length;
    return{total,newC,due,learned:cards.filter(c=>c.repetitions>0).length};
  },
  async clearAll(){
    await this.open();
    return new Promise((ok,no)=>{const req=indexedDB.deleteDatabase('spark_flashcards');req.onsuccess=()=>{this.db=null;ok();};req.onerror=()=>no(req.error);});
  }
};

const DECK_COLORS=['#FF8C42','#4ECDC4','#58A6FF','#A855F7','#22C55E','#EC4899','#FBBF24','#FF6B6B'];
let flashState={screen:'list',deckId:null,queue:[],idx:0,flipped:false,sessionReviewed:0,sessionXP:0};
function cleanupFlash(){flashState={screen:'list',deckId:null,queue:[],idx:0,flipped:false,sessionReviewed:0,sessionXP:0};}

async function renderFlashcards(){
  updateUserPanel();
  const el=document.getElementById('view-flashcards');
  try{await FlashDB.open();}catch(e){el.innerHTML=`<div style="max-width:600px;margin:0 auto;text-align:center;padding:40px"><i class="fas fa-exclamation-triangle" style="font-size:32px;color:var(--accent);margin-bottom:12px"></i><p>Flashcard storage is unavailable in this browser.</p></div>`;return;}
  if(flashState.screen==='list')await renderFlashDeckList(el);
  else if(flashState.screen==='deck')await renderFlashDeckDetail(el);
  else if(flashState.screen==='study')renderFlashStudy(el);
}

async function renderFlashDeckList(el){
  const decks=await FlashDB.getAllDecks();
  const stats=await Promise.all(decks.map(async d=>({deck:d,stats:await FlashDB.getDeckStats(d.id)})));
  const totalDue=stats.reduce((s,x)=>s+x.stats.due,0);
  el.innerHTML=`<div style="max-width:960px;margin:0 auto">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:28px">
      <div><h1 style="font-size:26px;font-weight:700;margin-bottom:4px">Flashcards</h1><p style="color:var(--text2);font-size:15px">Anki-style spaced repetition. Cards stored in IndexedDB — room for thousands.</p></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-secondary btn-sm" onclick="loadStarterFlashcardDecks()"><i class="fas fa-magic"></i> Starter Decks</button>
        <button class="btn btn-secondary btn-sm" onclick="triggerImportDeckJSON()"><i class="fas fa-file-import"></i> Import JSON</button>
        <button class="btn btn-primary btn-sm" onclick="showCreateDeckModal()"><i class="fas fa-plus"></i> New Deck</button>
      </div>
    </div>
    ${totalDue>0?`<div class="card" style="margin-bottom:20px;border-color:rgba(255,140,66,.3);display:flex;align-items:center;gap:12px;padding:14px 18px"><i class="fas fa-bell" style="color:var(--accent)"></i><span style="font-size:14px"><strong>${totalDue}</strong> card${totalDue!==1?'s':''} due for review across your decks</span></div>`:''}
    ${!decks.length?`<div class="card" style="text-align:center;padding:48px 24px"><i class="fas fa-clone" style="font-size:40px;color:var(--text2);margin-bottom:16px;display:block"></i><h3 style="font-size:18px;margin-bottom:8px">No decks yet</h3><p style="color:var(--text2);margin-bottom:20px;font-size:14px">Create a deck, import JSON, or load preset starter decks to start studying with SM-2 spaced repetition.</p>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="showCreateDeckModal()"><i class="fas fa-plus"></i> Create Deck</button>
      <button class="btn btn-secondary" onclick="loadStarterFlashcardDecks()"><i class="fas fa-magic"></i> Load Starter Decks</button>
    </div></div>`
    :`<div class="flash-deck-grid">${stats.map(({deck,stats:s})=>`<div class="flash-deck-card" onclick="openFlashDeck('${deck.id}')">
      <div style="display:flex;align-items:center;gap:12px"><div class="deck-icon" style="background:${deck.color}22;color:${deck.color}"><i class="fas fa-layer-group"></i></div><div style="flex:1;min-width:0"><div style="font-weight:700;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(deck.name)}</div>${deck.desc?`<div style="font-size:12px;color:var(--text2);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(deck.desc)}</div>`:''}</div></div>
      <div class="flash-stat-row"><span><i class="fas fa-clone"></i> ${s.total} cards</span>${s.due?`<span class="flash-stat-due"><i class="fas fa-clock"></i> ${s.due} due</span>`:''}${s.newC?`<span class="flash-stat-new"><i class="fas fa-seedling"></i> ${s.newC} new</span>`:''}</div>
      ${s.due||s.newC?`<div class="btn btn-sm btn-teal" style="width:100%;justify-content:center;margin-top:4px" onclick="event.stopPropagation();startFlashStudy('${deck.id}')"><i class="fas fa-play"></i> Study Now</div>`:''}
    </div>`).join('')}</div>`}
    <div class="card" style="margin-top:24px"><h3 style="font-size:15px;margin-bottom:10px"><i class="fas fa-info-circle" style="color:var(--blue)"></i> How it works</h3><div style="font-size:13px;color:var(--text2);line-height:1.6;display:flex;flex-direction:column;gap:6px"><div><strong style="color:var(--text)">SM-2 algorithm</strong> — schedules reviews based on how well you remember each card.</div><div><strong style="color:var(--text)">Again / Hard / Good / Easy</strong> — rate each card after flipping to set the next review date.</div><div><strong style="color:var(--text)">IndexedDB storage</strong> — supports large decks with text and images without the 5MB localStorage limit.</div></div></div>
  </div>`;
}

async function loadStarterFlashcardDecks() {
  const sampleDecks = [
    {
      id: 'deck_adhd_hacks',
      name: 'ADHD Focus & Study Hacks',
      desc: 'Proven strategies for ADHD learning and executive function.',
      color: '#4ECDC4',
      created: Date.now(),
      cards: [
        { front: 'What is the 5-Minute Rule?', back: 'Commit to working for just 5 minutes. Overcoming initial friction is the hardest part for ADHD brains; once momentum starts, hyperfocus often kicks in.' },
        { front: 'What is Body Doubling?', back: 'Working alongside someone else (or a virtual buddy). The presence of another person boosts focus and accountability without pressure.' },
        { front: 'Why does Brown Noise help ADHD focus?', back: 'Brown noise has deep, rumble-like frequencies that mask distracting ambient noises, soothing an overactive mind.' },
        { front: 'What is Task Chunking?', back: 'Breaking big, overwhelming projects into tiny micro-steps (1-2 min actions) to prevent executive dysfunction and paralysis.' },
        { front: 'How does Visual Time-Boxing help?', back: 'Seeing time shrink visually (donut or hourglass) makes time concrete rather than an abstract threat, reducing time anxiety.' }
      ]
    },
    {
      id: 'deck_mental_math',
      name: 'Mental Math Shortcuts',
      desc: 'Speed math tricks for everyday calculations and exams.',
      color: '#FF8C42',
      created: Date.now() + 1,
      cards: [
        { front: 'How to calculate a 15% tip in your head?', back: '1. Find 10% (move decimal left once).\n2. Add half of that 10% value.\nExample: 10% of $40 = $4; half is $2 → $6 total tip.' },
        { front: 'Trick to multiply any 2-digit number by 11?', back: 'Add the two digits and place the sum in the middle.\nExample: 35 × 11 → 3+(3+5)+5 = 385!' },
        { front: 'How to square a number ending in 5 (e.g., 35²)?', back: 'Multiply the tens digit (3) by (3 + 1 = 4) → 12. Then attach 25 at the end → 1225!' },
        { front: 'Quick way to subtract from 1,000?', back: 'Subtract all digits except the last from 9, and the last digit from 10.\nExample: 1000 - 647 → (9-6)=3, (9-4)=5, (10-7)=3 → 353.' }
      ]
    },
    {
      id: 'deck_science_core',
      name: 'Science Fundamentals',
      desc: 'Core biology, chemistry, and physics principles.',
      color: '#A855F7',
      created: Date.now() + 2,
      cards: [
        { front: 'What is the chemical formula for Photosynthesis?', back: '6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ + 6O₂\n(Carbon Dioxide + Water → Glucose + Oxygen)' },
        { front: 'What is Ohm\'s Law?', back: 'V = I × R\nVoltage (V) = Current (I) × Resistance (R)' },
        { front: 'What is the function of Mitochondria?', back: 'The powerhouse of the cell: produces ATP (energy) through cellular respiration.' },
        { front: 'What are Newton\'s Three Laws of Motion?', back: '1. Inertia (an object in motion stays in motion)\n2. F = m × a (Force = Mass × Acceleration)\n3. Action & Reaction (equal and opposite reactions)' }
      ]
    }
  ];

  for (const d of sampleDecks) {
    const cards = d.cards;
    delete d.cards;
    await FlashDB.saveDeck(d);
    for (const c of cards) {
      await FlashDB.saveCard({
        deckId: d.id,
        front: c.front,
        back: c.back,
        repetitions: 0,
        interval: 0,
        easiness: 2.5,
        nextReview: 0,
        lastReview: null,
        created: Date.now()
      });
    }
  }
  SFX.bonus();
  toast('Loaded starter decks with cards!', 'success');
  renderFlashcards();
}

async function exportDeckJSON(deckId) {
  const decks = await FlashDB.getAllDecks();
  const deck = decks.find(d => d.id === deckId);
  if (!deck) return;
  const cards = await FlashDB.getCardsByDeck(deckId);
  const data = { deck, cards };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${deck.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_deck.json`;
  a.click();
  toast('Deck exported as JSON!', 'success');
}

function triggerImportDeckJSON() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed.deck || !parsed.cards) throw new Error('Invalid deck format');
      const newDeckId = 'deck_' + Date.now();
      const deck = { ...parsed.deck, id: newDeckId, created: Date.now() };
      await FlashDB.saveDeck(deck);
      for (const card of parsed.cards) {
        await FlashDB.saveCard({
          ...card,
          id: undefined,
          deckId: newDeckId,
          repetitions: 0,
          nextReview: 0
        });
      }
      SFX.bonus();
      toast(`Imported deck "${deck.name}" with ${parsed.cards.length} cards!`, 'success');
      renderFlashcards();
    } catch (err) {
      toast('Failed to import deck JSON file.', 'warn');
    }
  };
  input.click();
}

function showCreateDeckModal(){
  showModal(`<h2 style="font-size:20px;margin-bottom:16px">New Deck</h2>
    <div style="margin-bottom:12px"><label style="font-size:13px;color:var(--text2);display:block;margin-bottom:4px">Deck name</label><input class="input" id="deck-name" placeholder="e.g. Biology Chapter 3" autofocus></div>
    <div style="margin-bottom:20px"><label style="font-size:13px;color:var(--text2);display:block;margin-bottom:4px">Description (optional)</label><input class="input" id="deck-desc" placeholder="What is this deck about?"></div>
    <div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="createFlashDeck()">Create</button></div>`);
}

async function createFlashDeck(){
  const name=document.getElementById('deck-name')?.value.trim();
  if(!name){toast('Enter a deck name','warn');return;}
  const desc=document.getElementById('deck-desc')?.value.trim()||'';
  const decks=await FlashDB.getAllDecks();
  const deck={id:'deck_'+Date.now(),name,desc,color:DECK_COLORS[decks.length%DECK_COLORS.length],created:Date.now()};
  await FlashDB.saveDeck(deck);
  closeModal();SFX.click();toast('Deck created!','success');
  flashState={screen:'deck',deckId:deck.id,queue:[],idx:0,flipped:false,sessionReviewed:0,sessionXP:0};
  renderFlashcards();
}

function openFlashDeck(id){flashState={screen:'deck',deckId:id,queue:[],idx:0,flipped:false,sessionReviewed:0,sessionXP:0};renderFlashcards();}

async function renderFlashDeckDetail(el){
  const decks=await FlashDB.getAllDecks();
  const deck=decks.find(d=>d.id===flashState.deckId);
  if(!deck){flashState.screen='list';renderFlashcards();return;}
  const cards=await FlashDB.getCardsByDeck(deck.id);
  const stats=await FlashDB.getDeckStats(deck.id);
  const now=Date.now();
  el.innerHTML=`<div style="max-width:800px;margin:0 auto">
    <button class="btn btn-sm btn-ghost" style="margin-bottom:16px" onclick="flashState.screen='list';renderFlashcards()"><i class="fas fa-arrow-left"></i> All Decks</button>
    <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:24px">
      <div><h1 style="font-size:26px;font-weight:700;margin-bottom:4px">${escHtml(deck.name)}</h1>${deck.desc?`<p style="color:var(--text2)">${escHtml(deck.desc)}</p>`:''}
      <div class="flash-stat-row" style="margin-top:8px"><span>${stats.total} cards</span>${stats.due?`<span class="flash-stat-due">${stats.due} due</span>`:''}${stats.newC?`<span class="flash-stat-new">${stats.newC} new</span>`:''}</div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${stats.total?`<button class="btn btn-teal" onclick="startFlashStudy('${deck.id}')"><i class="fas fa-play"></i> Study${stats.due||stats.newC?` (${stats.due+Math.min(stats.newC,20)} cards)`:''}</button>`:''}
        <button class="btn btn-primary" onclick="showAddCardModal()"><i class="fas fa-plus"></i> Add Card</button>
        <button class="btn btn-sm btn-secondary" onclick="exportDeckJSON('${deck.id}')"><i class="fas fa-file-export"></i> Export</button>
        <button class="btn btn-sm btn-ghost" style="color:var(--red);border:1px solid rgba(255,107,107,.2)" onclick="confirmDeleteDeck('${deck.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>
    ${!cards.length?`<div class="card" style="text-align:center;padding:32px"><p style="color:var(--text2);margin-bottom:16px">No cards in this deck yet.</p><button class="btn btn-primary" onclick="showAddCardModal()"><i class="fas fa-plus"></i> Add Your First Card</button></div>`
    :`<div class="flash-card-list">${cards.map(c=>{
      const isNew=!c.repetitions;
      const isDue=!isNew&&c.nextReview<=now;
      const meta=isNew?'New':isDue?'Due':`Review in ${Math.max(1,Math.ceil((c.nextReview-now)/86400000))}d`;
      return`<div class="flash-card-row"><div class="fc-front">${escHtml(c.front)}</div><span class="fc-meta ${isDue?'fc-due':''}">${meta}</span><button class="btn btn-sm btn-ghost" onclick="confirmDeleteCard(${c.id})" style="padding:4px 8px;color:var(--red)"><i class="fas fa-trash"></i></button></div>`;
    }).join('')}</div>`}
  </div>`;
}

function showAddCardModal(){
  showModal(`<h2 style="font-size:20px;margin-bottom:16px">Add Card</h2>
    <div style="margin-bottom:12px"><label style="font-size:13px;color:var(--text2);display:block;margin-bottom:4px">Front (question)</label><textarea class="input" id="card-front" rows="3" placeholder="Question or term..." style="resize:vertical"></textarea></div>
    <div style="margin-bottom:12px"><label style="font-size:13px;color:var(--text2);display:block;margin-bottom:4px">Back (answer)</label><textarea class="input" id="card-back" rows="3" placeholder="Answer or definition..." style="resize:vertical"></textarea></div>
    <div style="margin-bottom:12px"><label style="font-size:13px;color:var(--text2);display:block;margin-bottom:4px">Front image (optional)</label><input type="file" class="input" id="card-front-img" accept="image/*" style="padding:8px"></div>
    <div style="margin-bottom:20px"><label style="font-size:13px;color:var(--text2);display:block;margin-bottom:4px">Back image (optional)</label><input type="file" class="input" id="card-back-img" accept="image/*" style="padding:8px"></div>
    <div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveFlashCard()">Save Card</button></div>`);
}

function readImageFile(input){
  return new Promise((ok,no)=>{
    const f=input?.files?.[0];
    if(!f)return ok(null);
    if(f.size>3*1024*1024){toast('Image too large (max 3MB)','warn');return ok(null);}
    const r=new FileReader();
    r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(f);
  });
}

async function saveFlashCard(){
  const front=document.getElementById('card-front')?.value.trim();
  const back=document.getElementById('card-back')?.value.trim();
  if(!front||!back){toast('Enter both front and back','warn');return;}
  const frontImage=await readImageFile(document.getElementById('card-front-img'));
  const backImage=await readImageFile(document.getElementById('card-back-img'));
  const card={deckId:flashState.deckId,front,back,frontImage,backImage,repetitions:0,interval:0,easiness:2.5,nextReview:0,lastReview:null,created:Date.now()};
  await FlashDB.saveCard(card);
  closeModal();SFX.click();toast('Card added!','success');renderFlashcards();
}

function confirmDeleteDeck(id){
  showModal(`<h2 style="font-size:18px;margin-bottom:10px">Delete this deck?</h2><p style="color:var(--text2);margin-bottom:20px">All cards in this deck will be permanently deleted.</p><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn" style="background:var(--red);color:#fff" onclick="deleteFlashDeck('${id}')">Delete</button></div>`);
}

async function deleteFlashDeck(id){
  await FlashDB.deleteDeck(id);closeModal();flashState.screen='list';toast('Deck deleted','info');renderFlashcards();
}

function confirmDeleteCard(id){
  showModal(`<p style="margin-bottom:20px">Delete this card?</p><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn" style="background:var(--red);color:#fff" onclick="deleteFlashCard(${id})">Delete</button></div>`);
}

async function deleteFlashCard(id){
  await FlashDB.deleteCard(id);closeModal();toast('Card deleted','info');renderFlashcards();
}

async function startFlashStudy(deckId){
  const cards=await FlashDB.getCardsByDeck(deckId);
  const now=Date.now();
  const due=cards.filter(c=>c.repetitions>0&&c.nextReview<=now);
  const fresh=cards.filter(c=>!c.repetitions).slice(0,20);
  const queue=shuffle([...due,...fresh]);
  if(!queue.length){toast('No cards to review — add some first!','info');return;}
  flashState={screen:'study',deckId,queue,idx:0,flipped:false,sessionReviewed:0,sessionXP:0};
  SFX.click();renderFlashcards();
}

function renderFlashStudy(el){
  if(flashState.idx>=flashState.queue.length){finishFlashSession();return;}
  const card=flashState.queue[flashState.idx];
  const total=flashState.queue.length,done=flashState.idx;
  const frontImg=card.frontImage?`<img class="flash-card-img" src="${card.frontImage}" alt="">`:'';
  const backImg=card.backImage?`<img class="flash-card-img" src="${card.backImage}" alt="">`:'';
  el.innerHTML=`<div style="max-width:640px;margin:0 auto">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
      <button class="btn btn-sm btn-ghost" onclick="flashState.screen='deck';renderFlashcards()"><i class="fas fa-times"></i> Exit</button>
      <span style="font-size:14px;color:var(--text2)">${done+1} / ${total}</span>
    </div>
    <div style="display:flex;gap:6px;margin-bottom:20px">${flashState.queue.map((_,i)=>`<div class="progress-dot ${i<done?'done':i===done?'current':''}"></div>`).join('')}</div>
    <div class="flash-card-scene" id="flash-scene" onclick="flipFlashCard()">
      <div class="flash-card-inner ${flashState.flipped?'flipped':''}" id="flash-inner">
        <div class="flash-card-face front">${frontImg}<div class="flash-card-text">${escHtml(card.front)}</div><div class="flash-card-hint">Tap or press Space to flip</div></div>
        <div class="flash-card-face back">${backImg}<div class="flash-card-text">${escHtml(card.back)}</div></div>
      </div>
    </div>
    ${flashState.flipped?`<div class="flash-rate-row">
      <button class="flash-rate-btn again" onclick="rateFlashCard(1)"><span>Again</span><small>&lt;1 day</small></button>
      <button class="flash-rate-btn hard" onclick="rateFlashCard(3)"><span>Hard</span><small>~1 day</small></button>
      <button class="flash-rate-btn good" onclick="rateFlashCard(4)"><span>Good</span><small>Normal</small></button>
      <button class="flash-rate-btn easy" onclick="rateFlashCard(5)"><span>Easy</span><small>Longer</small></button>
    </div>`:`<div style="text-align:center"><button class="btn btn-teal btn-lg" onclick="flipFlashCard()"><i class="fas fa-sync-alt"></i> Show Answer</button></div>`}
  </div>`;
}

function flipFlashCard(){
  if(flashState.flipped)return;
  flashState.flipped=true;SFX.click();
  const inner=document.getElementById('flash-inner');
  if(inner)inner.classList.add('flipped');
  renderFlashStudy(document.getElementById('view-flashcards'));
}

async function rateFlashCard(quality){
  const card=flashState.queue[flashState.idx];
  const upd=sm2Update(card,quality);
  Object.assign(card,upd);
  await FlashDB.saveCard(card);
  flashState.sessionReviewed++;
  if(quality>=3){SFX.correct();Store.addXP(5);flashState.sessionXP+=5;}else SFX.wrong();
  flashState.idx++;flashState.flipped=false;
  if(flashState.idx>=flashState.queue.length)finishFlashSession();
  else renderFlashStudy(document.getElementById('view-flashcards'));
}

function finishFlashSession(){
  const n=flashState.sessionReviewed,xp=flashState.sessionXP;
  SFX.complete();
  showModal(`<div style="text-align:center"><div style="font-size:48px;margin-bottom:12px"><i class="fas fa-check-circle" style="color:var(--green)"></i></div><h2 style="font-size:22px;margin-bottom:4px">Session Complete!</h2><p style="color:var(--text2);margin-bottom:20px">You reviewed ${n} card${n!==1?'s':''}.</p>${xp>0?`<div class="card" style="padding:16px;margin-bottom:20px"><div style="font-family:Fredoka;font-size:28px;color:var(--accent)">+${xp} XP</div><div style="font-size:12px;color:var(--text2)">5 XP per Good/Easy card</div></div>`:''}<div style="display:flex;gap:10px;justify-content:center"><button class="btn btn-secondary" onclick="closeModal();flashState.screen='deck';renderFlashcards()">Back to Deck</button><button class="btn btn-primary" onclick="closeModal();startFlashStudy(flashState.deckId)">Study Again</button></div></div>`);
  flashState.flipped=false;
}

document.addEventListener('keydown',e=>{
  if(currentView!=='flashcards'||flashState.screen!=='study')return;
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
  if(e.code==='Space'){e.preventDefault();if(!flashState.flipped)flipFlashCard();}
  if(flashState.flipped&&e.key>='1'&&e.key<='4')rateFlashCard([1,3,4,5][parseInt(e.key)-1]);
});

// ======================== TASK PLANNER & PRESETS ========================
let plannerFilter = 'all';

function skipBreakToFocus() {
  SFX.click();
  focusState.mode = 'focus';
  const dur = Store.get('settings').focusDuration;
  focusState.seconds = dur * 60;
  focusState.totalSeconds = dur * 60;
  focusState.endTime = Date.now() + (dur * 60 * 1000);
  renderFocus();
}

function showCreatePresetModal() {
  showModal(`
    <h2 style="font-size:20px; font-weight:700; margin-bottom:16px;">New Focus Preset</h2>
    <div style="margin-bottom:12px;">
      <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">Preset Name</label>
      <input class="input" id="preset-name-inp" placeholder="e.g. Cram Session, Reading Sprint" autofocus style="font-size:14px;">
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
      <div>
        <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">Focus Duration</label>
        <select class="input" id="preset-focus-inp" style="font-size:13px;">
          <option value="5">5 min</option>
          <option value="10">10 min</option>
          <option value="15" selected>15 min</option>
          <option value="20">20 min</option>
          <option value="25">25 min</option>
          <option value="30">30 min</option>
          <option value="45">45 min</option>
          <option value="60">60 min</option>
        </select>
      </div>
      <div>
        <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">Break Duration</label>
        <select class="input" id="preset-break-inp" style="font-size:13px;">
          <option value="1">1 min</option>
          <option value="2">2 min</option>
          <option value="3" selected>3 min</option>
          <option value="5">5 min</option>
          <option value="10">10 min</option>
        </select>
      </div>
    </div>
    <div style="margin-bottom:20px;">
      <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">Preferred Soundscape</label>
      <select class="input" id="preset-sound-inp" style="font-size:13px;">
        <option value="none">None</option>
        <option value="adhd">ADHD Focus</option>
        <option value="lofi">Cozy Lo-Fi</option>
        <option value="nature">Nature Sounds</option>
        <option value="cafe">Cafe Murmur</option>
        <option value="brown">Brown Noise</option>
        <option value="rain">Rain & Storm</option>
      </select>
    </div>
    <div style="display:flex; gap:10px; justify-content:flex-end;">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-teal" onclick="saveCustomPreset()"><i class="fas fa-check"></i> Save Preset</button>
    </div>
  `);
}

function saveCustomPreset() {
  const nameEl = document.getElementById('preset-name-inp');
  const focusEl = document.getElementById('preset-focus-inp');
  const breakEl = document.getElementById('preset-break-inp');
  const soundEl = document.getElementById('preset-sound-inp');

  const name = nameEl ? nameEl.value.trim() : '';
  if (!name) {
    toast('Please enter a preset name', 'warn');
    return;
  }

  const focusMin = parseInt(focusEl.value, 10);
  const breakMin = parseInt(breakEl.value, 10);
  const soundscape = soundEl.value;

  const presets = Store.get('focusPresets') || [];
  presets.push({
    id: 'p_custom_' + Date.now(),
    name,
    focusMin,
    breakMin,
    soundscape,
    custom: true,
    icon: 'fa-user-clock'
  });

  Store.set('focusPresets', presets);
  closeModal();
  SFX.click();
  toast(`Custom preset "${name}" saved!`, 'success');
  if (currentView === 'focus') renderFocus();
}

function deleteCustomPreset(presetId) {
  let presets = Store.get('focusPresets') || [];
  presets = presets.filter(p => p.id !== presetId);
  Store.set('focusPresets', presets);
  SFX.click();
  toast('Preset deleted', 'info');
  if (currentView === 'focus') renderFocus();
}

function applyFocusPreset(presetId) {
  const presets = Store.get('focusPresets') || [];
  const p = presets.find(x => x.id === presetId);
  if (!p) return;

  const s = Store.get('settings');
  s.focusDuration = p.focusMin;
  s.breakDuration = p.breakMin;
  Store.save();

  if (p.soundscape && p.soundscape !== 'none') {
    Ambient.applyPreset(p.soundscape);
  }

  SFX.click();
  toast(`Applied ${p.name} (${p.focusMin}m focus / ${p.breakMin}m break)`, 'info');
  renderFocus();
}

function renderPlanner() {
  updateUserPanel();
  const el = document.getElementById('view-planner');
  if (!el) return;
  const tasks = Store.get('tasks') || [];
  const s = Store.get('settings') || {};
  const dailyGoal = s.dailyGoalMin || 30;

  const todayStr = new Date().toDateString();
  const todaySessions = (Store.get('sessions') || []).filter(x => new Date(x.date).toDateString() === todayStr);
  const todayFocusMin = todaySessions.reduce((acc, x) => acc + x.duration, 0);

  const goalPct = Math.min(100, Math.round((todayFocusMin / dailyGoal) * 100));

  let filtered = tasks;
  if (plannerFilter === 'completed') {
    filtered = tasks.filter(t => t.completed);
  } else if (plannerFilter !== 'all') {
    filtered = tasks.filter(t => !t.completed && (t.category || 'Personal').toLowerCase() === plannerFilter.toLowerCase());
  } else {
    filtered = tasks.filter(t => !t.completed);
  }

  el.innerHTML = `
    <div style="max-width:960px; margin:0 auto;">
      <div style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:16px; margin-bottom:24px;">
        <div>
          <h1 style="font-size:26px; font-weight:700; margin-bottom:4px;">Task & Goal Planner</h1>
          <p style="color:var(--text2); font-size:15px;">Break down your goals into bite-sized micro-steps. Built for ADHD clarity.</p>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn btn-teal btn-sm" onclick="navigate('schedule')"><i class="fas fa-calendar-week"></i> Timetable & Routines</button>
          <button class="btn btn-ghost btn-sm" onclick="autoSyncTasksToSchedule()" style="border:1px solid var(--border);" title="Auto-distribute pending tasks onto your week timetable"><i class="fas fa-bolt"></i> Auto-Sync to Week</button>
          <button class="btn btn-secondary btn-sm" onclick="showEditDailyGoalModal()"><i class="fas fa-bullseye"></i> Goal: ${dailyGoal}m</button>
          <button class="btn btn-primary btn-sm" onclick="showAddTaskModal()"><i class="fas fa-plus"></i> New Task</button>
        </div>
      </div>

      <!-- Goal Progress Banner -->
      <div class="card card-glow" style="margin-bottom:24px; padding:20px; background:linear-gradient(135deg, var(--card) 0%, var(--bg) 100%);">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:40px; height:40px; border-radius:10px; background:var(--teal-g); display:flex; align-items:center; justify-content:center;">
              <i class="fas fa-flag" style="color:var(--teal); font-size:18px;"></i>
            </div>
            <div>
              <div style="font-weight:700; font-size:16px;">Today's Focus Goal</div>
              <div style="font-size:13px; color:var(--text2);">${todayFocusMin} of ${dailyGoal} minutes completed (${goalPct}%)</div>
            </div>
          </div>
          ${todayFocusMin >= dailyGoal ? `
            <span class="tag" style="padding:6px 14px; font-size:13px; background:rgba(126,231,135,0.15); color:var(--green); border-color:var(--green);">
              <i class="fas fa-trophy"></i> Goal Reached!
            </span>
          ` : `
            <span class="tag" style="padding:6px 12px; font-size:12px; background:rgba(78,205,196,0.1); color:var(--teal);">
              ${dailyGoal - todayFocusMin}m remaining today
            </span>
          `}
        </div>
        <div style="height:8px; background:var(--border); border-radius:4px; overflow:hidden;">
          <div style="height:100%; width:${goalPct}%; background:linear-gradient(90deg, var(--teal), var(--green)); border-radius:4px; transition:width 0.4s ease;"></div>
        </div>
      </div>

      <!-- Filters -->
      <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:8px; margin-bottom:20px;" class="no-scrollbar">
        ${['all', 'Homework', 'Reading', 'Exam Prep', 'Project', 'Personal', 'completed'].map(cat => {
          const active = plannerFilter === cat ? 'selected' : '';
          const label = cat === 'all' ? 'All Pending' : cat === 'completed' ? 'Completed' : cat;
          return `<button class="grade-pill ${active}" onclick="plannerFilter='${cat}'; SFX.click(); renderPlanner();">${label}</button>`;
        }).join('')}
      </div>

      <!-- Task List -->
      ${!filtered.length ? `
        <div class="card" style="text-align:center; padding:48px 24px;">
          <i class="fas fa-check-double" style="font-size:40px; color:var(--text2); margin-bottom:16px; display:block;"></i>
          <h3 style="font-size:18px; margin-bottom:8px;">${plannerFilter === 'completed' ? 'No completed tasks yet' : 'No tasks in this category'}</h3>
          <p style="color:var(--text2); margin-bottom:20px; font-size:14px;">Add a task and use auto-breakdown to split it into easy micro-steps.</p>
          <button class="btn btn-primary" onclick="showAddTaskModal()"><i class="fas fa-plus"></i> Add a Task</button>
        </div>
      ` : `
        <div style="display:flex; flex-direction:column; gap:16px;">
          ${filtered.map(t => renderTaskCard(t)).join('')}
        </div>
      `}
    </div>
  `;
}

function renderTaskCard(t) {
  const steps = t.steps || [];
  const doneCount = steps.filter(s => s.done).length;
  const totalCount = steps.length;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : (t.completed ? 100 : 0);

  const catColors = {
    Homework: '#4ECDC4',
    Reading: '#A855F7',
    'Exam Prep': '#FF8C42',
    Project: '#3B82F6',
    Personal: '#10B981'
  };
  const catColor = catColors[t.category] || '#FF8C42';

  return `
    <div class="task-card ${t.completed ? 'completed' : ''}">
      <div style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:12px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px; flex-wrap:wrap;">
            <span class="tag" style="background:${catColor}22; color:${catColor}; font-size:11px; font-weight:700;">${t.category || 'Personal'}</span>
            <span style="font-size:12px; color:var(--text2);"><i class="fas fa-clock"></i> ~${t.estMin || 15} min</span>
            ${t.scheduledDate ? `
              <span class="tag" style="background:rgba(78,205,196,0.12); color:var(--teal); font-size:11px; cursor:pointer;" onclick="navigate('schedule')" title="Click to view on Timetable">
                <i class="fas fa-calendar-day"></i> ${t.scheduledDate} ${t.scheduledTime ? `at ${t.scheduledTime}` : ''}
              </span>
            ` : `
              <span class="tag" style="background:var(--bg); border:1px solid var(--border); color:var(--text2); font-size:11px; cursor:pointer;" onclick="showTaskScheduleDetails('${t.id}')" title="Assign to Timetable">
                <i class="fas fa-calendar-plus"></i> Unscheduled
              </span>
            `}
            ${t.completed ? `<span class="tag" style="background:rgba(126,231,135,0.15); color:var(--green); font-size:11px;"><i class="fas fa-check"></i> Completed</span>` : ''}
          </div>
          <h3 style="font-size:17px; font-weight:700; ${t.completed ? 'text-decoration:line-through; opacity:0.8;' : ''}">${escHtml(t.title)}</h3>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          ${!t.completed ? `
            <button class="btn btn-sm btn-ghost" style="border:1px solid var(--border);" onclick="showTaskScheduleDetails('${t.id}')" title="Schedule / Move on Timetable"><i class="fas fa-calendar-alt"></i></button>
            <button class="btn btn-teal btn-sm" onclick="launchFocusForTask('${t.id}')"><i class="fas fa-bullseye"></i> Focus on Task</button>
          ` : ''}
          <button class="btn btn-sm btn-ghost" style="color:var(--red);" onclick="deleteTask('${t.id}')" title="Delete Task"><i class="fas fa-trash"></i></button>
        </div>
      </div>

      ${totalCount > 0 ? `
        <div style="margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text2); margin-bottom:4px;">
            <span>Micro-Steps (${doneCount}/${totalCount})</span>
            <span>${pct}%</span>
          </div>
          <div style="height:6px; background:var(--border); border-radius:3px; overflow:hidden;">
            <div style="height:100%; width:${pct}%; background:${catColor}; border-radius:3px; transition:width 0.3s ease;"></div>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:6px; margin-top:10px;">
          ${steps.map((st, idx) => `
            <div class="task-step-check" onclick="toggleTaskStep('${t.id}', ${idx}); event.stopPropagation();">
              <input type="checkbox" ${st.done ? 'checked' : ''} style="accent-color:var(--teal); width:16px; height:16px; cursor:pointer;" onclick="event.stopPropagation(); toggleTaskStep('${t.id}', ${idx});">
              <span style="font-size:13px; ${st.done ? 'text-decoration:line-through; color:var(--text2);' : ''}">${escHtml(st.text)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function toggleTaskStep(taskId, stepIndex) {
  const tasks = Store.get('tasks') || [];
  const task = tasks.find(t => t.id === taskId);
  if (!task || !task.steps || !task.steps[stepIndex]) return;

  const step = task.steps[stepIndex];
  step.done = !step.done;

  if (step.done) {
    SFX.click();
    Store.addXP(5);
    toast('+5 XP for micro-step!', 'bonus');
  }

  const allDone = task.steps.length > 0 && task.steps.every(s => s.done);
  if (allDone && !task.completed) {
    task.completed = true;
    Store.addXP(20);
    SFX.complete();
    toast(`Task "${task.title}" completed! +20 XP Bonus!`, 'success');
  } else if (!allDone && task.completed) {
    task.completed = false;
  }

  Store.set('tasks', tasks);
  if (currentView === 'planner') renderPlanner();
  else if (currentView === 'schedule') renderSchedule();
  else if (currentView === 'dashboard') renderDashboard();
  else if (currentView === 'focus') renderFocus();
}

function launchFocusForTask(taskId) {
  const tasks = Store.get('tasks') || [];
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  navigate('focus');
  setTimeout(() => {
    const input = document.getElementById('focus-task-input');
    if (input) input.value = task.title;

    if (task.estMin) {
      Store.get('settings').focusDuration = task.estMin;
      Store.save();
    }

    const remainingSteps = (task.steps && task.steps.length)
      ? task.steps.filter(s => !s.done).map(s => s.text)
      : breakDownTask(task.title);

    const stepsListEl = document.getElementById('steps-list');
    if (stepsListEl && remainingSteps.length) {
      stepsListEl.innerHTML = remainingSteps.map((st, i) => `
        <div class="step-item active-step">
          <div class="step-num">${i + 1}</div>
          <input class="input" value="${escHtml(st)}" style="font-size:13px; padding:4px 8px;">
        </div>
      `).join('');
    }
  }, 50);
}

function showAddTaskModal(defaultDate, defaultTime) {
  const curDate = defaultDate || getLocalDateStr(new Date());
  const curTime = defaultTime || '16:00';
  showModal(`
    <h2 style="font-size:20px; font-weight:700; margin-bottom:16px;">New Task & Micro-Steps</h2>
    <div style="margin-bottom:12px;">
      <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">Task Title</label>
      <input class="input" id="task-title-inp" placeholder="e.g. Read Physics Chapter 2" autofocus style="font-size:14px;">
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
      <div>
        <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">Category</label>
        <select class="input" id="task-cat-inp" style="font-size:13px;">
          <option value="Homework">Homework</option>
          <option value="Reading">Reading</option>
          <option value="Exam Prep">Exam Prep</option>
          <option value="Project">Project</option>
          <option value="Personal">Personal</option>
        </select>
      </div>
      <div>
        <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">Estimated Minutes</label>
        <select class="input" id="task-min-inp" style="font-size:13px;">
          <option value="10">10 min</option>
          <option value="15" selected>15 min</option>
          <option value="25">25 min</option>
          <option value="30">30 min</option>
          <option value="45">45 min</option>
          <option value="60">60 min</option>
        </select>
      </div>
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
      <div>
        <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">Scheduled Date</label>
        <input type="date" class="input" id="task-date-inp" value="${curDate}" style="font-size:13px;">
      </div>
      <div>
        <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">Timetable Slot</label>
        <select class="input" id="task-time-inp" style="font-size:13px;">
          ${['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'].map(tm => `
            <option value="${tm}" ${curTime === tm ? 'selected' : ''}>${tm}</option>
          `).join('')}
        </select>
      </div>
    </div>
    <div style="margin-bottom:16px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
        <label style="font-size:13px; color:var(--text2);">Micro-Steps</label>
        <button class="btn btn-sm btn-ghost" onclick="autoGenerateTaskSteps()" style="font-size:11px; color:var(--teal); border:1px solid var(--border);">
          <i class="fas fa-magic"></i> Auto-Breakdown (ADHD)
        </button>
      </div>
      <div id="modal-task-steps" style="display:flex; flex-direction:column; gap:6px;">
        <input class="input task-step-input" placeholder="Micro-step 1..." style="font-size:13px; padding:6px 10px;">
        <input class="input task-step-input" placeholder="Micro-step 2..." style="font-size:13px; padding:6px 10px;">
        <input class="input task-step-input" placeholder="Micro-step 3..." style="font-size:13px; padding:6px 10px;">
      </div>
      <button class="btn btn-sm btn-ghost" onclick="addModalStepRow()" style="margin-top:6px; font-size:11px; color:var(--text2);"><i class="fas fa-plus"></i> Add step</button>
    </div>
    <div style="display:flex; gap:10px; justify-content:flex-end;">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveNewTask()"><i class="fas fa-check"></i> Create & Sync Task</button>
    </div>
  `);
}

function autoGenerateTaskSteps() {
  const titleInp = document.getElementById('task-title-inp');
  const title = titleInp ? titleInp.value.trim() : '';
  if (!title) {
    toast('Type a task title first', 'warn');
    return;
  }
  const steps = breakDownTask(title);
  const container = document.getElementById('modal-task-steps');
  if (container) {
    container.innerHTML = steps.map(s => `
      <input class="input task-step-input" value="${escHtml(s)}" style="font-size:13px; padding:6px 10px;">
    `).join('');
  }
  SFX.click();
}

function addModalStepRow() {
  const container = document.getElementById('modal-task-steps');
  if (container) {
    const div = document.createElement('input');
    div.className = 'input task-step-input';
    div.placeholder = `Micro-step ${container.children.length + 1}...`;
    div.style.cssText = 'font-size:13px; padding:6px 10px;';
    container.appendChild(div);
  }
}

function saveNewTask() {
  const titleEl = document.getElementById('task-title-inp');
  const catEl = document.getElementById('task-cat-inp');
  const minEl = document.getElementById('task-min-inp');
  const dateEl = document.getElementById('task-date-inp');
  const timeEl = document.getElementById('task-time-inp');

  const title = titleEl ? titleEl.value.trim() : '';
  if (!title) {
    toast('Please enter a task title', 'warn');
    return;
  }

  const category = catEl ? catEl.value : 'Personal';
  const estMin = minEl ? parseInt(minEl.value, 10) : 15;
  const scheduledDate = dateEl && dateEl.value ? dateEl.value : getLocalDateStr(new Date());
  const scheduledTime = timeEl && timeEl.value ? timeEl.value : '16:00';

  const stepInputs = document.querySelectorAll('.task-step-input');
  const steps = [];
  stepInputs.forEach(inp => {
    const val = inp.value.trim();
    if (val) steps.push({ text: val, done: false });
  });

  const tasks = Store.get('tasks') || [];
  tasks.unshift({
    id: 'task_' + Date.now(),
    title,
    category,
    estMin,
    scheduledDate,
    scheduledTime,
    completed: false,
    created: Date.now(),
    steps
  });

  Store.set('tasks', tasks);
  closeModal();
  SFX.click();
  toast(`Task "${title}" created & synced to schedule!`, 'success');
  if (currentView === 'planner') renderPlanner();
  else if (currentView === 'schedule') renderSchedule();
  else if (currentView === 'dashboard') renderDashboard();
}

function deleteTask(taskId) {
  let tasks = Store.get('tasks') || [];
  tasks = tasks.filter(t => t.id !== taskId);
  Store.set('tasks', tasks);
  SFX.click();
  toast('Task deleted', 'info');
  if (currentView === 'planner') renderPlanner();
  else if (currentView === 'schedule') renderSchedule();
  else if (currentView === 'dashboard') renderDashboard();
}

function showEditDailyGoalModal() {
  const s = Store.get('settings');
  const curr = s.dailyGoalMin || 30;
  showModal(`
    <h2 style="font-size:20px; font-weight:700; margin-bottom:12px;">Daily Focus Goal</h2>
    <p style="color:var(--text2); font-size:14px; margin-bottom:16px;">Set your target daily focus time in minutes:</p>
    <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px;">
      ${[15, 20, 30, 45, 60, 90, 120].map(m => `
        <button class="grade-pill ${m === curr ? 'selected' : ''}" onclick="Store.get('settings').dailyGoalMin=${m}; Store.save(); closeModal(); SFX.click(); toast('Goal updated to ${m} minutes!', 'success'); renderView(currentView);">${m} min</button>
      `).join('')}
    </div>
    <div style="text-align:right;">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
    </div>
  `);
}

// ======================== SCHEDULE & TIMETABLE SYSTEM ========================
let scheduleWeekOffset = 0;
let scheduleViewMode = 'timetable'; // 'timetable', 'agenda', 'routine'
let scheduleFilter = 'all'; // 'all', 'classes', 'tasks', 'routine'

function getWeekDays(offset = 0) {
  const now = new Date();
  const todayStr = getLocalDateStr(now);
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
  const distToMonday = (currentDay + 6) % 7; // Monday = 0, Tuesday = 1...
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distToMonday + (offset * 7));

  const days = [];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fullNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayIndexes = [1, 2, 3, 4, 5, 6, 0]; // 1=Mon, 2=Tue... 0=Sun

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const dateStr = getLocalDateStr(d);
    days.push({
      name: dayNames[i],
      fullName: fullNames[i],
      dayIndex: dayIndexes[i],
      date: d,
      dateStr: dateStr,
      dayNum: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
      isToday: dateStr === todayStr
    });
  }
  return days;
}

function renderSchedule() {
  updateUserPanel();
  const el = document.getElementById('view-schedule');
  if (!el) return;

  const days = getWeekDays(scheduleWeekOffset);
  const weekStart = `${days[0].monthName} ${days[0].dayNum}`;
  const weekEnd = `${days[6].monthName} ${days[6].dayNum}, ${days[6].date.getFullYear()}`;
  const isCurrentWeek = scheduleWeekOffset === 0;

  const tasks = Store.get('tasks') || [];
  const pendingTasks = tasks.filter(t => !t.completed);
  const unscheduledTasks = pendingTasks.filter(t => !t.scheduledDate);
  const events = Store.get('scheduleEvents') || [];
  const routines = Store.get('routines') || [];

  el.innerHTML = `
    <div style="max-width:1100px; margin:0 auto;">
      <!-- Schedule Header -->
      <div style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:16px; margin-bottom:20px;">
        <div>
          <h1 style="font-size:26px; font-weight:700; margin-bottom:4px; display:flex; align-items:center; gap:10px;">
            <i class="fas fa-calendar-days" style="color:var(--teal);"></i> Schedule & Timetable
          </h1>
          <p style="color:var(--text2); font-size:15px;">Week-by-week timetable, daily routines, and automatically synced tasks.</p>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-teal btn-sm" onclick="autoSyncTasksToSchedule()" title="Automatically distribute pending tasks into open study slots this week">
            <i class="fas fa-bolt"></i> Auto-Sync Tasks ${unscheduledTasks.length ? `(${unscheduledTasks.length})` : ''}
          </button>
          <button class="btn btn-primary btn-sm" onclick="showAddScheduleEventModal()"><i class="fas fa-plus"></i> Add Event / Class</button>
          <button class="btn btn-secondary btn-sm" onclick="showAddTaskModal()"><i class="fas fa-list-check"></i> New Task</button>
          <button class="btn btn-ghost btn-sm" onclick="printSchedule()" title="Print or export timetable summary" style="border:1px solid var(--border);">
            <i class="fas fa-print"></i> Export
          </button>
        </div>
      </div>

      <!-- Week Navigator Bar -->
      <div class="card" style="margin-bottom:20px; padding:14px 20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <button class="btn btn-sm btn-secondary" onclick="scheduleWeekOffset--; SFX.click(); renderSchedule();" title="Previous Week">
            <i class="fas fa-chevron-left"></i> Prev Week
          </button>
          <button class="btn btn-sm ${isCurrentWeek ? 'btn-teal' : 'btn-secondary'}" onclick="scheduleWeekOffset=0; SFX.click(); renderSchedule();">
            <i class="fas fa-calendar-check"></i> ${isCurrentWeek ? 'Current Week' : 'Jump to Today'}
          </button>
          <button class="btn btn-sm btn-secondary" onclick="scheduleWeekOffset++; SFX.click(); renderSchedule();" title="Next Week">
            Next Week <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <div style="font-family:'Fredoka',sans-serif; font-size:18px; font-weight:700; display:flex; align-items:center; gap:8px;">
          <i class="far fa-calendar-alt" style="color:var(--accent);"></i>
          <span>${weekStart} – ${weekEnd}</span>
          ${isCurrentWeek ? `<span class="tag" style="background:rgba(78,205,196,0.15); color:var(--teal); font-size:12px; font-family:'Nunito';">This Week</span>` : ''}
        </div>

        <!-- View Switcher -->
        <div style="display:flex; gap:6px; background:var(--bg); padding:4px; border-radius:10px; border:1px solid var(--border);">
          <button class="schedule-nav-pill ${scheduleViewMode === 'timetable' ? 'active' : ''}" style="padding:5px 12px; font-size:12px;" onclick="scheduleViewMode='timetable'; SFX.click(); renderSchedule();">
            <i class="fas fa-table-cells"></i> Timetable
          </button>
          <button class="schedule-nav-pill ${scheduleViewMode === 'agenda' ? 'active' : ''}" style="padding:5px 12px; font-size:12px;" onclick="scheduleViewMode='agenda'; SFX.click(); renderSchedule();">
            <i class="fas fa-bars-staggered"></i> Day Agenda
          </button>
          <button class="schedule-nav-pill ${scheduleViewMode === 'routine' ? 'active' : ''}" style="padding:5px 12px; font-size:12px;" onclick="scheduleViewMode='routine'; SFX.click(); renderSchedule();">
            <i class="fas fa-repeat"></i> Daily Routines
          </button>
        </div>
      </div>

      <!-- Filters & Unscheduled Tasks Notice -->
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
        <div style="display:flex; gap:8px; overflow-x:auto;" class="no-scrollbar">
          ${[
            { id: 'all', label: 'All Items', icon: 'fa-layer-group' },
            { id: 'classes', label: 'Classes & Timetable', icon: 'fa-graduation-cap' },
            { id: 'tasks', label: 'Synced Tasks', icon: 'fa-list-check' },
            { id: 'routine', label: 'Daily Routines', icon: 'fa-clock-rotate-left' }
          ].map(f => `
            <button class="grade-pill ${scheduleFilter === f.id ? 'selected' : ''}" style="font-size:12px; padding:6px 14px;" onclick="scheduleFilter='${f.id}'; SFX.click(); renderSchedule();">
              <i class="fas ${f.icon}"></i> ${f.label}
            </button>
          `).join('')}
        </div>

        <div style="display:flex; gap:8px; align-items:center;">
          <button class="btn btn-sm btn-ghost" onclick="showRoutineTemplateModal()" style="font-size:12px; border:1px solid var(--border);">
            <i class="fas fa-wand-magic-sparkles"></i> Timetable Presets
          </button>
        </div>
      </div>

      ${unscheduledTasks.length > 0 ? `
        <div class="card card-glow" style="margin-bottom:20px; padding:14px 18px; background:linear-gradient(135deg, rgba(78,205,196,0.08) 0%, var(--card) 100%); border-color:rgba(78,205,196,0.3); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:36px; height:36px; border-radius:10px; background:var(--teal-g); display:flex; align-items:center; justify-content:center; color:var(--teal);">
              <i class="fas fa-sparkles"></i>
            </div>
            <div>
              <div style="font-weight:700; font-size:14px;">You have ${unscheduledTasks.length} pending unscheduled task${unscheduledTasks.length > 1 ? 's' : ''}</div>
              <div style="font-size:12px; color:var(--text2);">Automatically schedule them into optimal study blocks across your week with 1 click.</div>
            </div>
          </div>
          <button class="btn btn-sm btn-teal" onclick="autoSyncTasksToSchedule()">
            <i class="fas fa-bolt"></i> Auto-Sync All to Schedule
          </button>
        </div>
      ` : ''}

      <!-- Main Schedule Content based on view mode -->
      ${scheduleViewMode === 'timetable'
        ? renderWeeklyTimetableGrid(days)
        : scheduleViewMode === 'agenda'
          ? renderScheduleAgenda(days)
          : renderDailyRoutinesTab(days)
      }
    </div>
  `;
}

// ---------------- Timetable Grid View ----------------
function renderWeeklyTimetableGrid(days) {
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
  const events = Store.get('scheduleEvents') || [];
  const tasks = Store.get('tasks') || [];
  const routines = Store.get('routines') || [];

  return `
    <div class="timetable-wrapper">
      <div class="timetable-grid">
        <!-- Top Left Corner -->
        <div class="timetable-header-cell" style="color:var(--text2); font-size:12px; display:flex; align-items:center; justify-content:center;">
          Time
        </div>

        <!-- Day Headers -->
        ${days.map(d => `
          <div class="timetable-header-cell ${d.isToday ? 'today-col' : ''}">
            <div style="font-size:13px; font-weight:700; color:${d.isToday ? 'var(--teal)' : 'var(--text)'};">${d.name}</div>
            <div style="font-size:16px; font-weight:800; font-family:'Fredoka'; margin-top:2px; color:${d.isToday ? 'var(--teal)' : 'var(--text)'};">
              ${d.dayNum} ${d.monthName}
            </div>
            ${d.isToday ? `<span class="tag" style="background:var(--teal); color:#0F0F14; font-size:10px; padding:2px 8px; margin-top:4px;">TODAY</span>` : ''}
          </div>
        `).join('')}

        <!-- Time Rows -->
        ${hours.map(h => {
          const hourNum = parseInt(h.split(':')[0], 10);
          const h12 = (hourNum % 12 || 12) + (hourNum >= 12 ? ' PM' : ' AM');

          return `
            <!-- Time label -->
            <div class="timetable-time-label">
              <span>${h12}</span>
            </div>

            <!-- 7 Day cells for this hour -->
            ${days.map(d => {
              // 1. Classes & Events
              const cellEvents = (scheduleFilter === 'tasks') ? [] : events.filter(e => {
                const dayMatch = (e.days && e.days.includes(d.dayIndex)) || (e.specificDate === d.dateStr);
                if (!dayMatch) return false;
                const startHour = parseInt((e.startTime || '09:00').split(':')[0], 10);
                return startHour === hourNum;
              });

              // 2. Synced Tasks
              const cellTasks = (scheduleFilter === 'classes') ? [] : tasks.filter(t => {
                if (t.scheduledDate !== d.dateStr) return false;
                const taskHour = parseInt((t.scheduledTime || '16:00').split(':')[0], 10);
                return taskHour === hourNum;
              });

              // 3. Routines
              const cellRoutines = (scheduleFilter === 'classes' || scheduleFilter === 'tasks') ? [] : routines.filter(r => {
                const dayMatch = !r.days || r.days.includes(d.dayIndex);
                if (!dayMatch) return false;
                const rtHour = parseInt((r.targetTime || '07:30').split(':')[0], 10);
                return rtHour === hourNum;
              });

              return `
                <div class="timetable-cell ${d.isToday ? 'is-today-cell' : ''}" onclick="showAddScheduleEventModal(${d.dayIndex}, '${h}')" title="Click to add event/task on ${d.name} at ${h}">
                  <!-- Render Events -->
                  ${cellEvents.map(e => `
                    <div class="schedule-item" style="background:${e.color || '#3B82F6'}22; border-left:3px solid ${e.color || '#3B82F6'}; color:var(--text);" onclick="event.stopPropagation(); showEditEventModal('${e.id}')">
                      <div style="display:flex; align-items:center; justify-content:space-between; gap:4px;">
                        <span style="font-size:10px; font-weight:800; color:${e.color || '#3B82F6'}; text-transform:uppercase;">${e.category || 'Class'}</span>
                        <span style="font-size:10px; color:var(--text2);">${e.startTime || ''}</span>
                      </div>
                      <div style="font-weight:700; font-size:12px; line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escHtml(e.title)}</div>
                      ${e.location ? `<div style="font-size:10px; color:var(--text2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"><i class="fas fa-location-dot" style="font-size:9px;"></i> ${escHtml(e.location)}</div>` : ''}
                    </div>
                  `).join('')}

                  <!-- Render Synced Tasks -->
                  ${cellTasks.map(t => {
                    const steps = t.steps || [];
                    const doneCount = steps.filter(s => s.done).length;
                    return `
                      <div class="schedule-item schedule-task-item ${t.completed ? 'completed' : ''}" onclick="event.stopPropagation(); showTaskScheduleDetails('${t.id}')">
                        <div style="display:flex; align-items:center; justify-content:space-between; gap:4px;">
                          <div style="display:flex; align-items:center; gap:6px;">
                            <input type="checkbox" ${t.completed ? 'checked' : ''} style="accent-color:var(--teal); width:13px; height:13px; cursor:pointer;" onclick="event.stopPropagation(); toggleTaskStep('${t.id}', 0);">
                            <span style="font-size:10px; font-weight:700; color:var(--teal);"><i class="fas fa-list-check"></i> Task</span>
                          </div>
                          <span style="font-size:10px; color:var(--text2);">~${t.estMin || 15}m</span>
                        </div>
                        <div style="font-weight:700; font-size:12px; line-height:1.2; ${t.completed ? 'text-decoration:line-through;' : ''} white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                          ${escHtml(t.title)}
                        </div>
                        ${steps.length > 0 ? `
                          <div style="font-size:10px; color:var(--text2);"><i class="fas fa-bars-progress"></i> ${doneCount}/${steps.length} steps</div>
                        ` : ''}
                      </div>
                    `;
                  }).join('')}

                  <!-- Render Routine Indicator -->
                  ${cellRoutines.map(r => `
                    <div class="schedule-item" style="background:${r.color || '#FF8C42'}18; border-left:3px solid ${r.color || '#FF8C42'}; color:var(--text); padding:4px 6px;" onclick="event.stopPropagation(); scheduleViewMode='routine'; renderSchedule();">
                      <div style="display:flex; align-items:center; gap:6px; font-size:11px;">
                        <i class="fas ${r.icon || 'fa-sun'}" style="color:${r.color || '#FF8C42'}; font-size:11px;"></i>
                        <span style="font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escHtml(r.title)}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `;
            }).join('')}
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ---------------- Day Agenda View ----------------
function renderScheduleAgenda(days) {
  const events = Store.get('scheduleEvents') || [];
  const tasks = Store.get('tasks') || [];
  const routines = Store.get('routines') || [];
  const routineLogs = Store.get('routineLogs') || {};

  return `
    <div style="display:flex; flex-direction:column; gap:16px;">
      ${days.map(d => {
        const dayEvents = (scheduleFilter === 'tasks') ? [] : events.filter(e => (e.days && e.days.includes(d.dayIndex)) || (e.specificDate === d.dateStr));
        const dayTasks = (scheduleFilter === 'classes') ? [] : tasks.filter(t => t.scheduledDate === d.dateStr);
        const dayRoutines = (scheduleFilter === 'classes' || scheduleFilter === 'tasks') ? [] : routines.filter(r => !r.days || r.days.includes(d.dayIndex));

        const totalItems = dayEvents.length + dayTasks.length + dayRoutines.length;

        return `
          <div class="agenda-day-card ${d.isToday ? 'today' : ''}">
            <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid var(--border);">
              <div style="display:flex; align-items:center; gap:12px;">
                <div style="width:44px; height:44px; border-radius:12px; background:${d.isToday ? 'var(--teal)' : 'var(--bg)'}; color:${d.isToday ? '#0F0F14' : 'var(--text)'}; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:'Fredoka'; font-weight:700;">
                  <span style="font-size:11px; text-transform:uppercase; line-height:1;">${d.name}</span>
                  <span style="font-size:18px; line-height:1;">${d.dayNum}</span>
                </div>
                <div>
                  <h3 style="font-size:18px; font-weight:700; display:flex; align-items:center; gap:8px;">
                    ${d.fullName}, ${d.monthName} ${d.dayNum}
                    ${d.isToday ? `<span class="tag" style="background:var(--teal); color:#0F0F14; font-size:11px;">TODAY</span>` : ''}
                  </h3>
                  <div style="font-size:12px; color:var(--text2);">${totalItems} item${totalItems === 1 ? '' : 's'} scheduled (${dayEvents.length} classes, ${dayTasks.length} tasks, ${dayRoutines.length} routines)</div>
                </div>
              </div>
              <div style="display:flex; gap:8px;">
                <button class="btn btn-sm btn-ghost" onclick="showAddScheduleEventModal(${d.dayIndex})" style="border:1px solid var(--border); font-size:12px;"><i class="fas fa-plus"></i> Add Event</button>
                <button class="btn btn-sm btn-teal" onclick="showAddTaskModal('${d.dateStr}')" style="font-size:12px;"><i class="fas fa-list-check"></i> Add Task</button>
              </div>
            </div>

            <!-- Items Container -->
            ${totalItems === 0 ? `
              <div style="text-align:center; padding:20px; color:var(--text2); font-size:13px;">
                No schedule items or tasks for this day. <button class="btn btn-sm btn-ghost" onclick="showAddTaskModal('${d.dateStr}')" style="color:var(--teal);"><i class="fas fa-plus"></i> Schedule something</button>
              </div>
            ` : `
              <div style="display:flex; flex-direction:column; gap:10px;">
                <!-- Routines -->
                ${dayRoutines.map(r => {
                  const isDone = routineLogs[d.dateStr] && routineLogs[d.dateStr][r.id];
                  return `
                    <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:var(--bg); border-radius:10px; border-left:3px solid ${r.color || '#FF8C42'}; gap:12px;">
                      <div style="display:flex; align-items:center; gap:12px;">
                        <input type="checkbox" ${isDone ? 'checked' : ''} style="accent-color:var(--accent); width:16px; height:16px; cursor:pointer;" onclick="toggleRoutineForDay('${r.id}', '${d.dateStr}')">
                        <div>
                          <div style="font-weight:700; font-size:14px; ${isDone ? 'text-decoration:line-through; color:var(--text2);' : ''}">${escHtml(r.title)}</div>
                          <div style="font-size:12px; color:var(--text2);"><i class="fas fa-clock"></i> ${r.targetTime || 'Routine'} &middot; ${r.steps ? r.steps.length : 0} habit steps</div>
                        </div>
                      </div>
                      <span class="tag" style="background:${r.color || '#FF8C42'}22; color:${r.color || '#FF8C42'}; font-size:11px;">${r.slot || 'Routine'}</span>
                    </div>
                  `;
                }).join('')}

                <!-- Classes & Events -->
                ${dayEvents.map(e => `
                  <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:var(--bg); border-radius:10px; border-left:3px solid ${e.color || '#3B82F6'}; gap:12px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                      <div style="width:36px; height:36px; border-radius:8px; background:${e.color || '#3B82F6'}22; color:${e.color || '#3B82F6'}; display:flex; align-items:center; justify-content:center; font-size:15px;">
                        <i class="fas fa-graduation-cap"></i>
                      </div>
                      <div>
                        <div style="font-weight:700; font-size:14px;">${escHtml(e.title)}</div>
                        <div style="font-size:12px; color:var(--text2);">
                          <i class="fas fa-clock"></i> ${e.startTime} - ${e.endTime} ${e.location ? `&middot; <i class="fas fa-location-dot"></i> ${escHtml(e.location)}` : ''}
                        </div>
                      </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <span class="tag" style="background:${e.color || '#3B82F6'}22; color:${e.color || '#3B82F6'}; font-size:11px;">${e.category || 'Class'}</span>
                      <button class="btn btn-sm btn-ghost" onclick="showEditEventModal('${e.id}')" title="Edit Event"><i class="fas fa-pen"></i></button>
                    </div>
                  </div>
                `).join('')}

                <!-- Synced Tasks -->
                ${dayTasks.map(t => {
                  const steps = t.steps || [];
                  const doneCount = steps.filter(s => s.done).length;
                  return `
                    <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:var(--bg); border-radius:10px; border-left:3px solid var(--teal); gap:12px;">
                      <div style="display:flex; align-items:center; gap:12px; flex:1; min-width:0;">
                        <input type="checkbox" ${t.completed ? 'checked' : ''} style="accent-color:var(--teal); width:16px; height:16px; cursor:pointer;" onclick="toggleTaskStep('${t.id}', 0)">
                        <div style="flex:1; min-width:0;">
                          <div style="font-weight:700; font-size:14px; ${t.completed ? 'text-decoration:line-through; opacity:0.7;' : ''} overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                            ${escHtml(t.title)}
                          </div>
                          <div style="font-size:12px; color:var(--text2);">
                            <span class="tag" style="background:rgba(78,205,196,0.1); color:var(--teal); font-size:11px;">${t.category || 'Task'}</span>
                            &middot; <i class="fas fa-clock"></i> ${t.scheduledTime || '16:00'} (~${t.estMin || 15}m)
                            ${steps.length ? `&middot; ${doneCount}/${steps.length} micro-steps` : ''}
                          </div>
                        </div>
                      </div>
                      <div style="display:flex; align-items:center; gap:8px;">
                        <button class="btn btn-sm btn-teal" onclick="launchFocusForTask('${t.id}')"><i class="fas fa-play"></i> Focus</button>
                        <button class="btn btn-sm btn-ghost" onclick="showTaskScheduleDetails('${t.id}')" title="Task details"><i class="fas fa-ellipsis-v"></i></button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ---------------- Daily Routines View ----------------
function renderDailyRoutinesTab(days) {
  const routines = Store.get('routines') || [];
  const routineLogs = Store.get('routineLogs') || {};
  const todayStr = getLocalDateStr(new Date());

  const slots = [
    { key: 'morning', title: 'Morning Kickoff Routine', icon: 'fa-sun', color: '#FF8C42', desc: 'Prime your brain and environment before classes begin.' },
    { key: 'afternoon', title: 'Afternoon Brain Reset', icon: 'fa-bolt', color: '#4ECDC4', desc: 'Decompress from classes and transition smoothly into study mode.' },
    { key: 'evening', title: 'Evening Wind Down & Prep', icon: 'fa-moon', color: '#8B5CF6', desc: 'Solidify memories, review flashcards, and prep for tomorrow.' }
  ];

  return `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <!-- Banner -->
      <div class="card card-glow" style="padding:20px; background:linear-gradient(135deg, var(--card) 0%, rgba(255,140,66,0.08) 100%);">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div>
            <h2 style="font-size:20px; font-weight:700; margin-bottom:4px;">Daily Routines & ADHD Habit Loops</h2>
            <p style="font-size:14px; color:var(--text2);">Anchor habits around existing daily triggers. Small consistent routines reduce executive dysfunction.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="showRoutineModal()"><i class="fas fa-plus"></i> Create Routine</button>
        </div>
      </div>

      <!-- Routines by Slot -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:18px;">
        ${slots.map(slot => {
          const slotRoutines = routines.filter(r => (r.slot || 'morning') === slot.key);
          return `
            <div class="card" style="display:flex; flex-direction:column; gap:14px;">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <div style="width:38px; height:38px; border-radius:10px; background:${slot.color}22; color:${slot.color}; display:flex; align-items:center; justify-content:center; font-size:18px;">
                    <i class="fas ${slot.icon}"></i>
                  </div>
                  <div>
                    <h3 style="font-size:16px; font-weight:700;">${slot.title}</h3>
                    <div style="font-size:12px; color:var(--text2);">${slot.desc}</div>
                  </div>
                </div>
              </div>

              ${slotRoutines.length === 0 ? `
                <div style="text-align:center; padding:24px 12px; color:var(--text2); font-size:13px; background:var(--bg); border-radius:10px;">
                  No ${slot.key} routine configured. <br>
                  <button class="btn btn-sm btn-ghost" onclick="showRoutineModal('${slot.key}')" style="color:var(--teal); margin-top:6px;">
                    <i class="fas fa-plus"></i> Add ${slot.key} habit
                  </button>
                </div>
              ` : slotRoutines.map(r => {
                const isTodayDone = routineLogs[todayStr] && routineLogs[todayStr][r.id];
                const steps = r.steps || [];

                return `
                  <div style="background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:10px;">
                    <div style="display:flex; align-items:center; justify-content:space-between;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <input type="checkbox" ${isTodayDone ? 'checked' : ''} style="accent-color:${slot.color}; width:18px; height:18px; cursor:pointer;" onclick="toggleRoutineForDay('${r.id}', '${todayStr}')">
                        <span style="font-weight:700; font-size:14px; ${isTodayDone ? 'text-decoration:line-through; color:var(--text2);' : ''}">${escHtml(r.title)}</span>
                      </div>
                      <div style="display:flex; align-items:center; gap:6px;">
                        <span class="tag" style="background:rgba(255,255,255,0.06); font-size:11px;"><i class="fas fa-clock"></i> ${r.targetTime || 'Anytime'}</span>
                        <button class="btn btn-sm btn-ghost" style="color:var(--red); padding:4px;" onclick="deleteRoutine('${r.id}')"><i class="fas fa-trash"></i></button>
                      </div>
                    </div>

                    <!-- Steps Checklist -->
                    ${steps.length > 0 ? `
                      <div style="display:flex; flex-direction:column; gap:6px; margin-top:4px;">
                        ${steps.map((st, sIdx) => `
                          <div style="display:flex; align-items:center; gap:8px; font-size:13px; color:var(--text2); padding:4px 6px; background:var(--card); border-radius:6px;">
                            <i class="fas fa-check-circle" style="color:${slot.color}; font-size:11px;"></i>
                            <span>${escHtml(st)}</span>
                          </div>
                        `).join('')}
                      </div>
                    ` : ''}

                    <!-- 7-day mini progress dots for this week -->
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-top:6px; padding-top:8px; border-top:1px solid var(--border); font-size:11px; color:var(--text2);">
                      <span>This Week Progress:</span>
                      <div style="display:flex; gap:6px;">
                        ${days.map(d => {
                          const doneOnDay = routineLogs[d.dateStr] && routineLogs[d.dateStr][r.id];
                          return `
                            <div title="${d.name} (${d.dateStr}): ${doneOnDay ? 'Completed' : 'Pending'}" style="width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; background:${doneOnDay ? slot.color : 'var(--border)'}; color:${doneOnDay ? '#0F0F14' : 'var(--text2)'}; cursor:pointer;" onclick="toggleRoutineForDay('${r.id}', '${d.dateStr}')">
                              ${d.name[0]}
                            </div>
                          `;
                        }).join('')}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ---------------- Auto-Sync Tasks Engine ----------------
function autoSyncTasksToSchedule() {
  const tasks = Store.get('tasks') || [];
  const pendingTasks = tasks.filter(t => !t.completed);
  if (!pendingTasks.length) {
    toast('No pending tasks to schedule!', 'info');
    return;
  }

  const days = getWeekDays(scheduleWeekOffset);
  const events = Store.get('scheduleEvents') || [];
  let syncedCount = 0;

  // Study hours on weekdays: 15:00, 16:00, 17:00, 18:00, 19:00
  const studyHours = ['16:00', '17:00', '15:00', '18:00', '19:00'];

  // Distribute tasks across week days
  pendingTasks.forEach((t, i) => {
    // Pick day (Monday to Friday prioritized)
    const dayObj = days[i % 5]; // cycles Mon(0), Tue(1), Wed(2), Thu(3), Fri(4)
    const hourSlot = studyHours[Math.floor(i / 5) % studyHours.length];

    t.scheduledDate = dayObj.dateStr;
    t.scheduledTime = hourSlot;
    syncedCount++;
  });

  Store.set('tasks', tasks);
  SFX.bonus();
  toast(`Auto-synced ${syncedCount} task${syncedCount === 1 ? '' : 's'} across your weekly timetable!`, 'success');
  renderSchedule();
}

// ---------------- Modals & Event Management ----------------
function showAddScheduleEventModal(defaultDay, defaultHour) {
  const dayIndex = defaultDay !== undefined ? defaultDay : 1;
  const startTime = defaultHour || '09:00';
  const hourNum = parseInt(startTime.split(':')[0], 10);
  const endHour = String(hourNum + 1).padStart(2, '0') + ':00';

  showModal(`
    <h2 style="font-size:20px; font-weight:700; margin-bottom:16px;">Add Timetable Event / Class</h2>
    <div style="margin-bottom:12px;">
      <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">Title / Subject</label>
      <input class="input" id="evt-title-inp" placeholder="e.g. Mathematics, Chemistry, or Study Session" autofocus>
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
      <div>
        <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">Category</label>
        <select class="input" id="evt-cat-inp">
          <option value="Class">Class / Lecture</option>
          <option value="Study">Deep Work / Study</option>
          <option value="Activity">Sports / Activity</option>
          <option value="Exam">Exam / Quiz</option>
          <option value="Personal">Personal Routine</option>
        </select>
      </div>
      <div>
        <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">Color Accent</label>
        <select class="input" id="evt-color-inp">
          <option value="#3B82F6">Blue (Math/Science)</option>
          <option value="#A855F7">Purple (Languages)</option>
          <option value="#10B981">Green (Biology/Lab)</option>
          <option value="#F59E0B">Amber (History/Social)</option>
          <option value="#FF8C42">Orange (Focus Sprint)</option>
          <option value="#EC4899">Pink (Arts/Sports)</option>
        </select>
      </div>
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
      <div>
        <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">Start Time</label>
        <select class="input" id="evt-start-inp">
          ${['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'].map(t => `
            <option value="${t}" ${t === startTime ? 'selected' : ''}>${t}</option>
          `).join('')}
        </select>
      </div>
      <div>
        <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">End Time</label>
        <select class="input" id="evt-end-inp">
          ${['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'].map(t => `
            <option value="${t}" ${t === endHour ? 'selected' : ''}>${t}</option>
          `).join('')}
        </select>
      </div>
    </div>
    <div style="margin-bottom:12px;">
      <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:6px;">Recurring Days of Week</label>
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        ${[
          { d: 1, n: 'Mon' }, { d: 2, n: 'Tue' }, { d: 3, n: 'Wed' },
          { d: 4, n: 'Thu' }, { d: 5, n: 'Fri' }, { d: 6, n: 'Sat' }, { d: 0, n: 'Sun' }
        ].map(item => `
          <label style="display:flex; align-items:center; gap:4px; font-size:12px; background:var(--bg); padding:6px 10px; border-radius:8px; border:1px solid var(--border); cursor:pointer;">
            <input type="checkbox" class="evt-day-check" value="${item.d}" ${item.d === dayIndex ? 'checked' : ''} style="accent-color:var(--teal);">
            <span>${item.n}</span>
          </label>
        `).join('')}
      </div>
    </div>
    <div style="margin-bottom:16px;">
      <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">Room / Location / Notes (optional)</label>
      <input class="input" id="evt-loc-inp" placeholder="e.g. Room 204 or Online Zoom link">
    </div>
    <div style="display:flex; gap:10px; justify-content:flex-end;">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveScheduleEvent()"><i class="fas fa-check"></i> Save to Timetable</button>
    </div>
  `);
}

function saveScheduleEvent() {
  const titleEl = document.getElementById('evt-title-inp');
  const catEl = document.getElementById('evt-cat-inp');
  const colorEl = document.getElementById('evt-color-inp');
  const startEl = document.getElementById('evt-start-inp');
  const endEl = document.getElementById('evt-end-inp');
  const locEl = document.getElementById('evt-loc-inp');

  const title = titleEl ? titleEl.value.trim() : '';
  if (!title) {
    toast('Please enter a title or subject', 'warn');
    return;
  }

  const selectedDays = [];
  document.querySelectorAll('.evt-day-check:checked').forEach(cb => {
    selectedDays.push(parseInt(cb.value, 10));
  });

  const events = Store.get('scheduleEvents') || [];
  events.push({
    id: 'evt_' + Date.now(),
    title,
    category: catEl ? catEl.value : 'Class',
    color: colorEl ? colorEl.value : '#3B82F6',
    startTime: startEl ? startEl.value : '09:00',
    endTime: endEl ? endEl.value : '10:00',
    days: selectedDays.length ? selectedDays : [1, 3, 5],
    location: locEl ? locEl.value.trim() : ''
  });

  Store.set('scheduleEvents', events);
  closeModal();
  SFX.click();
  toast(`Added "${title}" to your timetable!`, 'success');
  renderSchedule();
}

function showEditEventModal(eventId) {
  const events = Store.get('scheduleEvents') || [];
  const evt = events.find(e => e.id === eventId);
  if (!evt) return;

  showModal(`
    <h2 style="font-size:20px; font-weight:700; margin-bottom:16px;">Edit Event: ${escHtml(evt.title)}</h2>
    <div style="margin-bottom:14px;">
      <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">Title</label>
      <input class="input" id="edit-evt-title" value="${escHtml(evt.title)}">
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px;">
      <div>
        <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">Start Time</label>
        <select class="input" id="edit-evt-start">
          ${['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'].map(t => `
            <option value="${t}" ${t === evt.startTime ? 'selected' : ''}>${t}</option>
          `).join('')}
        </select>
      </div>
      <div>
        <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">End Time</label>
        <select class="input" id="edit-evt-end">
          ${['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'].map(t => `
            <option value="${t}" ${t === evt.endTime ? 'selected' : ''}>${t}</option>
          `).join('')}
        </select>
      </div>
    </div>
    <div style="margin-bottom:16px;">
      <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">Location / Notes</label>
      <input class="input" id="edit-evt-loc" value="${escHtml(evt.location || '')}">
    </div>
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <button class="btn btn-sm btn-ghost" style="color:var(--red);" onclick="deleteScheduleEvent('${evt.id}')"><i class="fas fa-trash"></i> Delete Event</button>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary btn-sm" onclick="updateScheduleEvent('${evt.id}')"><i class="fas fa-check"></i> Save Changes</button>
      </div>
    </div>
  `);
}

function updateScheduleEvent(eventId) {
  const events = Store.get('scheduleEvents') || [];
  const evt = events.find(e => e.id === eventId);
  if (!evt) return;

  const titleEl = document.getElementById('edit-evt-title');
  const startEl = document.getElementById('edit-evt-start');
  const endEl = document.getElementById('edit-evt-end');
  const locEl = document.getElementById('edit-evt-loc');

  if (titleEl && titleEl.value.trim()) evt.title = titleEl.value.trim();
  if (startEl) evt.startTime = startEl.value;
  if (endEl) evt.endTime = endEl.value;
  if (locEl) evt.location = locEl.value.trim();

  Store.set('scheduleEvents', events);
  closeModal();
  SFX.click();
  toast('Event updated!', 'success');
  renderSchedule();
}

function deleteScheduleEvent(id) {
  let events = Store.get('scheduleEvents') || [];
  events = events.filter(e => e.id !== id);
  Store.set('scheduleEvents', events);
  closeModal();
  SFX.click();
  toast('Event removed from timetable', 'info');
  renderSchedule();
}

// ---------------- Task Detail & Reschedule Modal ----------------
function showTaskScheduleDetails(taskId) {
  const tasks = Store.get('tasks') || [];
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const steps = task.steps || [];

  showModal(`
    <h2 style="font-size:20px; font-weight:700; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
      <i class="fas fa-list-check" style="color:var(--teal);"></i> ${escHtml(task.title)}
    </h2>
    <div style="display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap;">
      <span class="tag" style="background:rgba(78,205,196,0.1); color:var(--teal); font-weight:700;">${task.category || 'Personal'}</span>
      <span class="tag" style="background:var(--bg); border:1px solid var(--border);"><i class="fas fa-clock"></i> ~${task.estMin || 15}m</span>
      ${task.completed ? `<span class="tag" style="background:rgba(126,231,135,0.15); color:var(--green);"><i class="fas fa-check"></i> Completed</span>` : ''}
    </div>

    <!-- Date & Time Slot Changer -->
    <div style="background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:14px; margin-bottom:16px;">
      <div style="font-weight:700; font-size:13px; margin-bottom:8px;">Schedule Assignment</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div>
          <label style="font-size:12px; color:var(--text2); display:block; margin-bottom:3px;">Date</label>
          <input type="date" class="input" id="sched-task-date" value="${task.scheduledDate || getLocalDateStr(new Date())}" style="font-size:13px; padding:6px 10px;">
        </div>
        <div>
          <label style="font-size:12px; color:var(--text2); display:block; margin-bottom:3px;">Time Slot</label>
          <select class="input" id="sched-task-time" style="font-size:13px; padding:6px 10px;">
            ${['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'].map(tm => `
              <option value="${tm}" ${(task.scheduledTime || '16:00') === tm ? 'selected' : ''}>${tm}</option>
            `).join('')}
          </select>
        </div>
      </div>
    </div>

    <!-- Micro-steps checklist -->
    ${steps.length > 0 ? `
      <div style="margin-bottom:16px;">
        <label style="font-size:13px; font-weight:700; display:block; margin-bottom:8px;">Micro-Steps</label>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${steps.map((st, idx) => `
            <div class="task-step-check" onclick="toggleTaskStep('${task.id}', ${idx}); showTaskScheduleDetails('${task.id}');">
              <input type="checkbox" ${st.done ? 'checked' : ''} style="accent-color:var(--teal); width:16px; height:16px; cursor:pointer;" onclick="event.stopPropagation(); toggleTaskStep('${task.id}', ${idx}); showTaskScheduleDetails('${task.id}');">
              <span style="font-size:13px; ${st.done ? 'text-decoration:line-through; color:var(--text2);' : ''}">${escHtml(st.text)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px;">
      <button class="btn btn-teal btn-sm" onclick="closeModal(); launchFocusForTask('${task.id}')">
        <i class="fas fa-play"></i> Focus on Task
      </button>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary btn-sm" onclick="applyTaskScheduleChange('${task.id}')">
          <i class="fas fa-check"></i> Save Schedule
        </button>
      </div>
    </div>
  `);
}

function applyTaskScheduleChange(taskId) {
  const tasks = Store.get('tasks') || [];
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const dateEl = document.getElementById('sched-task-date');
  const timeEl = document.getElementById('sched-task-time');

  if (dateEl) task.scheduledDate = dateEl.value;
  if (timeEl) task.scheduledTime = timeEl.value;

  Store.set('tasks', tasks);
  closeModal();
  SFX.click();
  toast(`Task rescheduled to ${task.scheduledDate} at ${task.scheduledTime}!`, 'success');
  renderSchedule();
}

// ---------------- Routine Habit Management ----------------
function toggleRoutineForDay(routineId, dateStr) {
  const routineLogs = Store.get('routineLogs') || {};
  if (!routineLogs[dateStr]) routineLogs[dateStr] = {};

  const current = !!routineLogs[dateStr][routineId];
  routineLogs[dateStr][routineId] = !current;
  Store.set('routineLogs', routineLogs);

  if (!current) {
    Store.addXP(10);
    SFX.click();
    toast('Routine completed! +10 XP', 'bonus');
  } else {
    SFX.click();
  }

  renderSchedule();
}

function showRoutineModal(defaultSlot) {
  showModal(`
    <h2 style="font-size:20px; font-weight:700; margin-bottom:16px;">New Daily Routine</h2>
    <div style="margin-bottom:12px;">
      <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">Routine Title</label>
      <input class="input" id="rt-title-inp" placeholder="e.g. Afternoon Study Power Hour" autofocus>
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
      <div>
        <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">Time of Day</label>
        <select class="input" id="rt-slot-inp">
          <option value="morning" ${defaultSlot === 'morning' ? 'selected' : ''}>Morning</option>
          <option value="afternoon" ${defaultSlot === 'afternoon' ? 'selected' : ''}>Afternoon</option>
          <option value="evening" ${defaultSlot === 'evening' ? 'selected' : ''}>Evening</option>
        </select>
      </div>
      <div>
        <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">Target Time</label>
        <input type="time" class="input" id="rt-time-inp" value="16:00">
      </div>
    </div>
    <div style="margin-bottom:16px;">
      <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">Habit Steps (one per line)</label>
      <textarea class="input" id="rt-steps-inp" rows="3" placeholder="Step 1: Drink water&#10;Step 2: Clear desk&#10;Step 3: Turn on brown noise"></textarea>
    </div>
    <div style="display:flex; gap:10px; justify-content:flex-end;">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveCustomRoutine()"><i class="fas fa-check"></i> Create Routine</button>
    </div>
  `);
}

function saveCustomRoutine() {
  const titleEl = document.getElementById('rt-title-inp');
  const slotEl = document.getElementById('rt-slot-inp');
  const timeEl = document.getElementById('rt-time-inp');
  const stepsEl = document.getElementById('rt-steps-inp');

  const title = titleEl ? titleEl.value.trim() : '';
  if (!title) {
    toast('Please enter a routine title', 'warn');
    return;
  }

  const slot = slotEl ? slotEl.value : 'morning';
  const targetTime = timeEl ? timeEl.value : '08:00';
  const rawSteps = stepsEl ? stepsEl.value.split('\n').map(s => s.trim()).filter(Boolean) : [];

  const icons = { morning: 'fa-sun', afternoon: 'fa-bolt', evening: 'fa-moon' };
  const colors = { morning: '#FF8C42', afternoon: '#4ECDC4', evening: '#8B5CF6' };

  const routines = Store.get('routines') || [];
  routines.push({
    id: 'rt_' + Date.now(),
    title,
    slot,
    targetTime,
    icon: icons[slot] || 'fa-star',
    color: colors[slot] || '#FF8C42',
    days: [1, 2, 3, 4, 5],
    steps: rawSteps
  });

  Store.set('routines', routines);
  closeModal();
  SFX.click();
  toast(`Routine "${title}" saved!`, 'success');
  renderSchedule();
}

function deleteRoutine(id) {
  let routines = Store.get('routines') || [];
  routines = routines.filter(r => r.id !== id);
  Store.set('routines', routines);
  SFX.click();
  toast('Routine removed', 'info');
  renderSchedule();
}

function showRoutineTemplateModal() {
  showModal(`
    <h2 style="font-size:20px; font-weight:700; margin-bottom:14px;">Timetable & Routine Presets</h2>
    <p style="color:var(--text2); font-size:14px; margin-bottom:16px;">Quickly load a structured weekly timetable template tailored to your schedule:</p>
    <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:20px;">
      <div class="card" style="cursor:pointer; padding:14px;" onclick="applySchedulePreset('school')">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div style="font-weight:700; font-size:15px;"><i class="fas fa-school" style="color:var(--teal); margin-right:8px;"></i> Standard School Week</div>
          <span class="btn btn-sm btn-teal">Apply</span>
        </div>
        <div style="font-size:12px; color:var(--text2); margin-top:4px;">Mon-Fri 9AM-2PM classes (Math, Science, English, History) + 4PM daily deep focus blocks.</div>
      </div>
      <div class="card" style="cursor:pointer; padding:14px;" onclick="applySchedulePreset('exam')">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div style="font-weight:700; font-size:15px;"><i class="fas fa-bolt" style="color:var(--accent); margin-right:8px;"></i> Exam Prep Sprint</div>
          <span class="btn btn-sm btn-primary">Apply</span>
        </div>
        <div style="font-size:12px; color:var(--text2); margin-top:4px;">High-intensity review blocks: Morning flashcards, afternoon past exam tests, evening relaxation.</div>
      </div>
      <div class="card" style="cursor:pointer; padding:14px;" onclick="applySchedulePreset('adhd')">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div style="font-weight:700; font-size:15px;"><i class="fas fa-brain" style="color:#A855F7; margin-right:8px;"></i> ADHD Low-Friction Routine</div>
          <span class="btn btn-sm btn-secondary">Apply</span>
        </div>
        <div style="font-size:12px; color:var(--text2); margin-top:4px;">25-minute short bursts with mandatory 10-minute stretch & sensory resets.</div>
      </div>
    </div>
    <div style="text-align:right;">
      <button class="btn btn-secondary" onclick="closeModal()">Close</button>
    </div>
  `);
}

function applySchedulePreset(type) {
  if (type === 'exam') {
    Store.set('scheduleEvents', [
      { id: 'evt_rev1', title: 'Subject 1 Practice Exam', category: 'Exam', color: '#FF8C42', days: [1, 3, 5], startTime: '09:00', endTime: '11:00', location: 'Quiet Room' },
      { id: 'evt_rev2', title: 'Flashcards & Memory Review', category: 'Study', color: '#A855F7', days: [1, 2, 3, 4, 5], startTime: '14:00', endTime: '15:00', location: 'Spark Desk' },
      { id: 'evt_rev3', title: 'Problem Sets & Formula Practice', category: 'Study', color: '#3B82F6', days: [2, 4], startTime: '16:00', endTime: '17:30', location: 'Desk' }
    ]);
  } else if (type === 'adhd') {
    Store.set('scheduleEvents', [
      { id: 'evt_adhd1', title: 'Sprint 1: Most Urgent Homework', category: 'Study', color: '#4ECDC4', days: [1, 2, 3, 4, 5], startTime: '15:30', endTime: '16:00', location: 'Study Space' },
      { id: 'evt_adhd2', title: 'Sensory Walk & Snack', category: 'Activity', color: '#10B981', days: [1, 2, 3, 4, 5], startTime: '16:00', endTime: '16:30', location: 'Home' },
      { id: 'evt_adhd3', title: 'Sprint 2: Reading or Project', category: 'Study', color: '#FF8C42', days: [1, 2, 3, 4, 5], startTime: '16:30', endTime: '17:00', location: 'Study Space' }
    ]);
  } else {
    // Default School
    Store.set('scheduleEvents', [
      { id: 'evt_m', title: 'Mathematics', category: 'Class', color: '#3B82F6', days: [1, 3, 5], startTime: '09:00', endTime: '10:00', location: 'Room 204' },
      { id: 'evt_e', title: 'English Literature', category: 'Class', color: '#A855F7', days: [1, 3], startTime: '10:30', endTime: '11:30', location: 'Room 102' },
      { id: 'evt_s', title: 'Science & Chemistry Lab', category: 'Class', color: '#10B981', days: [2, 4], startTime: '09:30', endTime: '11:00', location: 'Lab B' },
      { id: 'evt_h', title: 'History & Social Studies', category: 'Class', color: '#F59E0B', days: [2, 4], startTime: '11:30', endTime: '12:30', location: 'Room 210' },
      { id: 'evt_f', title: 'Daily Deep Focus & Homework Hour', category: 'Study', color: '#FF8C42', days: [1, 2, 3, 4, 5], startTime: '16:00', endTime: '17:00', location: 'Home Study Desk' }
    ]);
  }

  closeModal();
  SFX.bonus();
  toast('Timetable preset applied!', 'success');
  renderSchedule();
}

function printSchedule() {
  window.print();
}

// ======================== MIND & MOOD WELLNESS SYSTEM ========================
let selectedMood = 'calm';
let wellnessTab = 'checkin'; // 'checkin', 'breathing', 'grounding', 'dissolver', 'reframes'

const MOOD_DATA = {
  great: { label: 'Great', emoji: '🌟', rec: 'You are in high spirits! Capitalize on this momentum with a Focus session or learning game.', preset: 'p_deep' },
  focused: { label: 'Focused', emoji: '🎯', rec: 'Your mind is locked in. Perfect time to smash a task on your planner!', preset: 'p_pomo' },
  calm: { label: 'Calm', emoji: '🌿', rec: 'Steady & peaceful energy. Great time for deep reading or flashcard study.', preset: 'p_pomo' },
  low_energy: { label: 'Low Energy', emoji: '🔋', rec: 'Be gentle with yourself. Try a 10-minute Quick Burst focus or cozy Lo-Fi soundscape.', preset: 'p_burst' },
  overwhelmed: { label: 'Overwhelmed', emoji: '😫', rec: 'Stop and pause! Try 2 minutes of Box Breathing or the 5-4-3-2-1 Grounding exercise.', preset: 'p_adhd' },
  anxious: { label: 'Anxious', emoji: '😰', rec: 'Take a deep breath. Use the Worry Dissolver below or listen to soothing Brown Noise.', preset: 'p_adhd' },
  frustrated: { label: 'Frustrated', emoji: '😤', rec: 'Take 3 deep breaths. Remember B-minus work is better than non-existent work.', preset: 'p_burst' }
};

function quickLogMood(moodKey) {
  selectedMood = moodKey;
  const mood = MOOD_DATA[moodKey];
  if (!mood) return;

  const logs = Store.get('moodLogs') || [];
  logs.unshift({
    id: 'm_' + Date.now(),
    mood: moodKey,
    date: new Date().toISOString()
  });
  if (logs.length > 50) logs.length = 50;
  Store.set('moodLogs', logs);

  Store.addXP(10);
  SFX.click();
  toast(`Mood logged: ${mood.emoji} ${mood.label} (+10 XP)`, 'success');

  if (currentView !== 'wellness') {
    navigate('wellness');
  } else {
    renderWellness();
  }
}

// Guided Breathing State
let breathingState = {
  running: false,
  mode: 'box', // 'box' (4-4-4-4), '478' (4-7-8), 'slow' (5-5)
  phase: 'inhale', // 'inhale', 'hold', 'exhale', 'hold2'
  seconds: 4,
  cycles: 0,
  timerId: null
};

function cleanupBreathing() {
  if (breathingState.timerId) {
    clearInterval(breathingState.timerId);
    breathingState.timerId = null;
  }
  breathingState.running = false;
}

function startBreathing(mode) {
  cleanupBreathing();
  if (mode) breathingState.mode = mode;
  breathingState.running = true;
  breathingState.phase = 'inhale';
  breathingState.cycles = 0;

  if (breathingState.mode === 'box') breathingState.seconds = 4;
  else if (breathingState.mode === '478') breathingState.seconds = 4;
  else if (breathingState.mode === 'slow') breathingState.seconds = 5;

  SFX.click();
  playBreathingChime(440);
  renderWellness();

  breathingState.timerId = setInterval(() => {
    tickBreathing();
  }, 1000);
}

function stopBreathing() {
  cleanupBreathing();
  SFX.click();
  renderWellness();
}

function playBreathingChime(freq = 440) {
  try {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  } catch (e) {}
}

function tickBreathing() {
  breathingState.seconds--;
  if (breathingState.seconds <= 0) {
    if (breathingState.mode === 'box') {
      if (breathingState.phase === 'inhale') {
        breathingState.phase = 'hold';
        breathingState.seconds = 4;
        playBreathingChime(523.25);
      } else if (breathingState.phase === 'hold') {
        breathingState.phase = 'exhale';
        breathingState.seconds = 4;
        playBreathingChime(392.00);
      } else if (breathingState.phase === 'exhale') {
        breathingState.phase = 'hold2';
        breathingState.seconds = 4;
        playBreathingChime(329.63);
      } else {
        breathingState.phase = 'inhale';
        breathingState.seconds = 4;
        breathingState.cycles++;
        playBreathingChime(440);
      }
    } else if (breathingState.mode === '478') {
      if (breathingState.phase === 'inhale') {
        breathingState.phase = 'hold';
        breathingState.seconds = 7;
        playBreathingChime(523.25);
      } else if (breathingState.phase === 'hold') {
        breathingState.phase = 'exhale';
        breathingState.seconds = 8;
        playBreathingChime(349.23);
      } else {
        breathingState.phase = 'inhale';
        breathingState.seconds = 4;
        breathingState.cycles++;
        playBreathingChime(440);
      }
    } else if (breathingState.mode === 'slow') {
      if (breathingState.phase === 'inhale') {
        breathingState.phase = 'exhale';
        breathingState.seconds = 5;
        playBreathingChime(392);
      } else {
        breathingState.phase = 'inhale';
        breathingState.seconds = 5;
        breathingState.cycles++;
        playBreathingChime(440);
      }
    }

    if (breathingState.cycles > 0 && breathingState.cycles % 4 === 0 && breathingState.phase === 'inhale') {
      Store.addXP(15);
      toast('4 Breathing cycles complete! +15 XP', 'success');
    }
  }

  const circleEl = document.getElementById('guided-breath-circle');
  const timerEl = document.getElementById('breath-timer-display');
  const phaseEl = document.getElementById('breath-phase-label');
  const cycleEl = document.getElementById('breath-cycle-count');

  if (circleEl && timerEl && phaseEl) {
    timerEl.textContent = breathingState.seconds + 's';
    cycleEl.textContent = `${breathingState.cycles} cycles done`;

    let phaseText = 'Breathe In...';
    circleEl.className = 'guided-breath-circle ' + breathingState.phase;

    if (breathingState.phase === 'inhale') phaseText = 'Breathe In Slowly...';
    else if (breathingState.phase === 'hold' || breathingState.phase === 'hold2') phaseText = 'Hold Breath Calmly...';
    else if (breathingState.phase === 'exhale') phaseText = 'Exhale Gently...';

    phaseEl.textContent = phaseText;
  }
}

// 5-4-3-2-1 Sensory Grounding Wizard State
let groundingStep = 0;
let groundingAnswers = { see: [], touch: [], hear: [], smell: [], appreciate: '' };

function resetGroundingWizard() {
  groundingStep = 0;
  groundingAnswers = { see: [], touch: [], hear: [], smell: [], appreciate: '' };
  if (currentView === 'wellness') renderWellness();
}

function nextGroundingStep() {
  SFX.click();
  groundingStep++;
  if (groundingStep >= 5) {
    Store.addXP(20);
    SFX.complete();
    toast('Grounding session complete! Feel present & clear. +20 XP', 'success');
  }
  renderWellness();
}

// Dissolve Thought / Worry Jar
function dissolveWorryThought() {
  const inp = document.getElementById('worry-dissolve-input');
  if (!inp) return;
  const val = inp.value.trim();
  if (!val) {
    toast('Write down what is troubling you', 'warn');
    return;
  }

  const container = document.getElementById('worry-stage');
  if (container) {
    container.innerHTML = `<div id="dissolving-text" style="font-size:18px; font-weight:700; color:var(--text); text-align:center; padding:24px; transition:all 2s ease; opacity:1; filter:blur(0px); transform:scale(1);">${escHtml(val)}</div>`;
    inp.value = '';

    setTimeout(() => {
      const el = document.getElementById('dissolving-text');
      if (el) {
        el.style.opacity = '0';
        el.style.filter = 'blur(12px)';
        el.style.transform = 'scale(1.3) translateY(-20px)';
      }
      playBreathingChime(220);
    }, 100);

    setTimeout(() => {
      if (container) {
        container.innerHTML = `
          <div style="text-align:center; padding:20px; color:var(--teal); font-weight:700; animation:fadeIn 0.5s ease;">
            <i class="fas fa-sparkles" style="font-size:24px; margin-bottom:8px; display:block;"></i>
            Thought released. You are not your thoughts — you are the one observing them.
          </div>
        `;
      }
      Store.addXP(10);
      toast('Worry dissolved & released! +10 XP', 'bonus');
    }, 2100);
  }
}

// ADHD Reframes Data
const ADHD_REFRAMES = [
  {
    title: 'Task Paralysis',
    problem: 'I have so much to do, I am overwhelmed and doing nothing at all.',
    reframe: 'You do not have to finish the whole project today. Lower the bar completely: just do 2 minutes or open the document. Starting micro builds momentum.',
    icon: 'fa-cubes-stacked'
  },
  {
    title: 'Perfectionism Trap',
    problem: 'If I cannot do this assignment perfectly, it is not worth doing.',
    reframe: 'B-minus work submitted on time beats an unsubmitted masterwork every time. Done is infinite times better than perfect.',
    icon: 'fa-bullseye'
  },
  {
    title: 'Distraction Guilt',
    problem: 'I lost 30 minutes on my phone. I ruined my entire focus routine.',
    reframe: 'A distraction is a temporary detour, not a crash. Take a deep breath, reset right now, and give yourself credit for returning.',
    icon: 'fa-rotate-left'
  },
  {
    title: 'Time Blindness Panic',
    problem: 'It feels like time is slipping away and I am falling behind.',
    reframe: 'Time is linear. Set a 10-minute timer for one single micro-task. You only need to focus on what is in front of you right now.',
    icon: 'fa-hourglass-half'
  }
];

function getRandomAffirmation() {
  const affirmations = [
    "My worth is not measured by my productivity.",
    "Small steps taken consistently create incredible transformation.",
    "It is completely okay to pause, breathe, and restart at any point.",
    "I am capable, resilient, and learning how my brain works best.",
    "Imperfection is human. Progress is my only goal."
  ];
  return affirmations[Math.floor(Math.random() * affirmations.length)];
}

function renderWellness() {
  updateUserPanel();
  const el = document.getElementById('view-wellness');
  if (!el) return;

  const logs = Store.get('moodLogs') || [];
  const recentLog = logs[0];
  const activeMoodData = selectedMood ? MOOD_DATA[selectedMood] : MOOD_DATA.calm;

  el.innerHTML = `
    <div style="max-width:960px; margin:0 auto;">
      <div style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:16px; margin-bottom:24px;">
        <div>
          <h1 style="font-size:26px; font-weight:700; margin-bottom:4px;">Mind & Emotional Wellness Hub</h1>
          <p style="color:var(--text2); font-size:15px;">Compassionate mental health tools designed specifically for student focus & ADHD clarity.</p>
        </div>
        <button class="btn btn-sm btn-ghost" onclick="toast(getRandomAffirmation(), 'info')" style="border:1px solid var(--border); color:var(--teal);">
          <i class="fas fa-sparkles"></i> Daily Affirmation
        </button>
      </div>

      <!-- Tab Navigation -->
      <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:8px; margin-bottom:24px;" class="no-scrollbar">
        <button class="grade-pill ${wellnessTab==='checkin'?'selected':''}" onclick="wellnessTab='checkin'; SFX.click(); renderWellness();">
          <i class="fas fa-face-smile"></i> Mood Check-In
        </button>
        <button class="grade-pill ${wellnessTab==='firstaid'?'selected':''}" style="background:${wellnessTab==='firstaid'?'var(--red)':'rgba(239,68,68,0.12)'}; color:${wellnessTab==='firstaid'?'#fff':'var(--red)'}; font-weight:700;" onclick="wellnessTab='firstaid'; SFX.click(); renderWellness();">
          <i class="fas fa-kit-medical"></i> Panic / Anxiety SOS
        </button>
        <button class="grade-pill ${wellnessTab==='journal'?'selected':''}" onclick="wellnessTab='journal'; SFX.click(); renderWellness();">
          <i class="fas fa-book-heart"></i> Small Wins Journal
        </button>
        <button class="grade-pill ${wellnessTab==='bodyscan'?'selected':''}" onclick="wellnessTab='bodyscan'; SFX.click(); renderWellness();">
          <i class="fas fa-spa"></i> Body Scan & PMR
        </button>
        <button class="grade-pill ${wellnessTab==='affirmations'?'selected':''}" onclick="wellnessTab='affirmations'; SFX.click(); renderWellness();">
          <i class="fas fa-quote-left"></i> Self-Talk Cards
        </button>
        <button class="grade-pill ${wellnessTab==='breathing'?'selected':''}" onclick="wellnessTab='breathing'; SFX.click(); renderWellness();">
          <i class="fas fa-wind"></i> Guided Breathing
        </button>
        <button class="grade-pill ${wellnessTab==='grounding'?'selected':''}" onclick="wellnessTab='grounding'; SFX.click(); renderWellness();">
          <i class="fas fa-anchor"></i> 5-4-3-2-1 Grounding
        </button>
        <button class="grade-pill ${wellnessTab==='dissolver'?'selected':''}" onclick="wellnessTab='dissolver'; SFX.click(); renderWellness();">
          <i class="fas fa-cloud-moon"></i> Worry Dissolver
        </button>
        <button class="grade-pill ${wellnessTab==='reframes'?'selected':''}" onclick="wellnessTab='reframes'; SFX.click(); renderWellness();">
          <i class="fas fa-brain"></i> ADHD Reframes
        </button>
        <button class="grade-pill ${wellnessTab==='analytics'?'selected':''}" onclick="wellnessTab='analytics'; SFX.click(); renderWellness();">
          <i class="fas fa-chart-line"></i> Mood Insights
        </button>
      </div>

      ${wellnessTab === 'checkin' ? renderWellnessCheckinSection(logs, activeMoodData) : ''}
      ${wellnessTab === 'firstaid' ? renderWellnessFirstAidSection() : ''}
      ${wellnessTab === 'journal' ? renderWellnessJournalSection() : ''}
      ${wellnessTab === 'bodyscan' ? renderWellnessBodyScanSection() : ''}
      ${wellnessTab === 'affirmations' ? renderWellnessAffirmationsSection() : ''}
      ${wellnessTab === 'breathing' ? renderWellnessBreathingSection() : ''}
      ${wellnessTab === 'grounding' ? renderWellnessGroundingSection() : ''}
      ${wellnessTab === 'dissolver' ? renderWellnessDissolverSection() : ''}
      ${wellnessTab === 'reframes' ? renderWellnessReframesSection() : ''}
      ${wellnessTab === 'analytics' ? renderWellnessAnalyticsSection() : ''}
    </div>
  `;
}

function renderWellnessFirstAidSection() {
  return `
    <div class="card card-glow" style="border-left: 5px solid var(--red); padding:28px;">
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:48px; height:48px; border-radius:12px; background:rgba(239,68,68,0.15); display:flex; align-items:center; justify-content:center;">
            <i class="fas fa-heart-pulse" style="color:var(--red); font-size:24px;"></i>
          </div>
          <div>
            <h3 style="font-size:20px; font-weight:800; color:var(--text);">Panic & Acute Anxiety Rapid First-Aid</h3>
            <p style="font-size:13px; color:var(--text2);">Immediate 4-step physiological reset for intense anxiety, racing heart, or overwhelm.</p>
          </div>
        </div>
        <button class="btn btn-sm btn-teal" onclick="playSoundscape('brown'); toast('Playing calming Brown Noise soundscape...', 'info');">
          <i class="fas fa-headphones"></i> Play Calming Brown Noise
        </button>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px; margin-top:20px;">
        <div style="background:var(--bg); padding:18px; border-radius:12px; border:1px solid var(--border);">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; font-weight:800; color:var(--red);">
            <span style="background:var(--red); color:#fff; width:22px; height:22px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:12px;">1</span>
            Physiological Double-Inhale
          </div>
          <p style="font-size:13px; color:var(--text2); margin-bottom:12px; line-height:1.5;">
            Take <strong>2 quick inhales</strong> through your nose, then 1 long slow exhale through your mouth. Doing this 3 times pops collapsed lung alveoli and rapidly drops adrenaline.
          </p>
          <button class="btn btn-sm btn-secondary" style="width:100%; justify-content:center;" onclick="startBreathing('slow')">
            <i class="fas fa-wind"></i> Start Guided Reset Breath
          </button>
        </div>

        <div style="background:var(--bg); padding:18px; border-radius:12px; border:1px solid var(--border);">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; font-weight:800; color:var(--blue);">
            <span style="background:var(--blue); color:#fff; width:22px; height:22px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:12px;">2</span>
            Cold Temperature Shock
          </div>
          <p style="font-size:13px; color:var(--text2); margin-bottom:12px; line-height:1.5;">
            Splash ice cold water on your face or press a cold bottle / ice cube against your wrists. Triggers the <em>Mammalian Dive Reflex</em>, dropping heart rate.
          </p>
          <div style="font-size:12px; color:var(--teal); font-weight:700;">
            <i class="fas fa-temperature-arrow-down"></i> Quickest physical circuit breaker.
          </div>
        </div>

        <div style="background:var(--bg); padding:18px; border-radius:12px; border:1px solid var(--border);">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; font-weight:800; color:var(--purple);">
            <span style="background:var(--purple); color:#fff; width:22px; height:22px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:12px;">3</span>
            Safety Anchor Truth
          </div>
          <p style="font-size:13px; color:var(--text2); margin-bottom:12px; line-height:1.5;">
            Say aloud: <em>"My body is feeling adrenaline, but I am safe right now. Anxiety always peaks and passes within minutes."</em>
          </p>
          <button class="btn btn-sm btn-ghost" style="width:100%; justify-content:center; border:1px solid var(--border);" onclick="createNewStickyNote('🚨 I am in a safe space right now. This feeling will pass soon.')">
            <i class="fas fa-thumbtack"></i> Stick Anchor Note on Screen
          </button>
        </div>

        <div style="background:var(--bg); padding:18px; border-radius:12px; border:1px solid var(--border);">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; font-weight:800; color:var(--green);">
            <span style="background:var(--green); color:#fff; width:22px; height:22px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:12px;">4</span>
            Grounding & Body Unplug
          </div>
          <p style="font-size:13px; color:var(--text2); margin-bottom:12px; line-height:1.5;">
            Unclench jaw, drop shoulders down, press feet flat on the floor. You do not need to solve anything in this exact minute.
          </p>
          <button class="btn btn-sm btn-teal" style="width:100%; justify-content:center;" onclick="wellnessTab='grounding'; renderWellness();">
            <i class="fas fa-anchor"></i> Go to 5-4-3-2-1 Grounding
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderWellnessJournalSection() {
  const journals = Store.get('journalLogs') || [];

  return `
    <div class="card card-glow" style="padding:28px;">
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
        <div>
          <h3 style="font-size:20px; font-weight:800; margin-bottom:4px; display:flex; align-items:center; gap:8px;">
            <i class="fas fa-book-heart" style="color:var(--teal);"></i> Small Wins & Gratitude Journal
          </h3>
          <p style="font-size:14px; color:var(--text2);">
            Training your brain to notice micro-wins builds emotional resilience and combats study burnout.
          </p>
        </div>
        <span class="tag" style="background:var(--teal-g); color:var(--teal); font-weight:700; font-size:13px;">
          <i class="fas fa-fire"></i> ${journals.length} Entries Saved
        </span>
      </div>

      <div style="background:var(--bg); padding:20px; border-radius:14px; border:1px solid var(--border); margin-bottom:24px;">
        <h4 style="font-size:15px; font-weight:700; margin-bottom:12px;">What are 3 small things that went well or you appreciate today?</h4>
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">
          <input class="input" id="journal-win-1" placeholder="1. E.g., Started my math homework early / Drank a glass of water..." style="font-size:14px;">
          <input class="input" id="journal-win-2" placeholder="2. E.g., Took a 10-minute walk outside / Helped a friend..." style="font-size:14px;">
          <input class="input" id="journal-win-3" placeholder="3. E.g., Proud of showing up even when tired..." style="font-size:14px;">
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <select class="input" id="journal-category" style="width:auto; font-size:13px;">
            <option value="Study & Focus">📚 Study & Focus</option>
            <option value="Health & Energy">🌿 Health & Energy</option>
            <option value="Personal Growth">🌱 Personal Growth</option>
            <option value="Mindset & Peace">💖 Mindset & Peace</option>
          </select>
          <button class="btn btn-teal" onclick="saveJournalEntry()">
            <i class="fas fa-bookmark"></i> Save Daily Wins (+15 XP)
          </button>
        </div>
      </div>

      <div>
        <h4 style="font-size:16px; font-weight:700; margin-bottom:12px;">Your Journal Log History</h4>
        ${journals.length === 0 ? `
          <div style="text-align:center; padding:24px; color:var(--text2); font-size:14px;">
            No journal entries yet! Write down 3 small wins above to start your streak.
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${journals.slice().reverse().map((j) => {
              const dateStr = new Date(j.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
              return `
                <div style="background:var(--bg); padding:16px; border-radius:12px; border-left:4px solid var(--teal); display:flex; flex-direction:column; gap:8px;">
                  <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-weight:800; font-size:13px; color:var(--teal);">${j.category || 'Small Wins'}</span>
                    <span style="font-size:12px; color:var(--text2);">${dateStr}</span>
                  </div>
                  <ul style="margin:0; padding-left:18px; font-size:13px; color:var(--text); line-height:1.6;">
                    ${j.wins.map(w => `<li>${escHtml(w)}</li>`).join('')}
                  </ul>
                  <div style="display:flex; justify-content:flex-end;">
                    <button class="btn btn-sm btn-ghost" style="font-size:11px;" onclick="createNewStickyNote('🌟 Small Win (${dateStr}):\\n• ${j.wins.join('\\n• ')}')">
                      <i class="fas fa-thumbtack"></i> Pin to Sticky Note
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

function saveJournalEntry() {
  const w1 = document.getElementById('journal-win-1').value.trim();
  const w2 = document.getElementById('journal-win-2').value.trim();
  const w3 = document.getElementById('journal-win-3').value.trim();
  const category = document.getElementById('journal-category').value;

  const wins = [w1, w2, w3].filter(w => w.length > 0);
  if (wins.length === 0) {
    toast('Please enter at least 1 win or moment of gratitude!', 'warn');
    return;
  }

  const journals = Store.get('journalLogs') || [];
  journals.push({
    id: 'j_' + Date.now(),
    wins: wins,
    category: category,
    date: Date.now()
  });

  Store.set('journalLogs', journals);
  Store.addXP(15);
  SFX.complete();
  toast('Journal entry saved! +15 XP earned 🎉', 'success');
  renderWellness();
}

let pmrStep = 0;
let pmrIsTense = true;
let pmrSecondsLeft = 5;

const PMR_STEPS = [
  { name: 'Shoulders & Neck', instruction: 'Shrug your shoulders up high towards your ears and hold tight!', icon: 'fa-user-nurse' },
  { name: 'Hands & Arms', instruction: 'Clench both fists tightly as if squeezing lemons!', icon: 'fa-hand-back-fist' },
  { name: 'Face & Jaw', instruction: 'Scrunch up your facial muscles, squeeze eyes shut and clench jaw gently.', icon: 'fa-face-grimace' },
  { name: 'Stomach & Core', instruction: 'Tighten your abdominal muscles as if bracing for impact.', icon: 'fa-child-reaching' },
  { name: 'Legs & Feet', instruction: 'Curl your toes downward and tense your calf muscles tight.', icon: 'fa-shoe-prints' }
];

function renderWellnessBodyScanSection() {
  const step = PMR_STEPS[pmrStep] || PMR_STEPS[0];

  return `
    <div class="card card-glow" style="text-align:center; padding:32px 24px;">
      <div style="display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:12px;">
        <i class="fas fa-spa" style="font-size:28px; color:var(--teal);"></i>
        <h3 style="font-size:22px; font-weight:800;">Progressive Muscle Relaxation (PMR)</h3>
      </div>
      <p style="color:var(--text2); font-size:14px; max-width:520px; margin:0 auto 24px;">
        Physical tension directly feeds mental anxiety. Tensing each muscle group for 5s then dropping it instantly trains your body to release stress held while sitting.
      </p>

      <div style="display:flex; justify-content:center; gap:8px; margin-bottom:24px; flex-wrap:wrap;">
        ${PMR_STEPS.map((s, idx) => `
          <div class="grade-pill ${idx === pmrStep ? 'selected' : ''}" style="cursor:default; font-size:12px;">
            Step ${idx + 1}: ${s.name}
          </div>
        `).join('')}
      </div>

      <div style="background:var(--bg); max-width:480px; margin:0 auto 24px; padding:28px; border-radius:16px; border:2px solid ${pmrIsTense ? 'var(--accent)' : 'var(--teal)'}; transition:all 0.3s ease;">
        <div style="width:64px; height:64px; border-radius:50%; background:${pmrIsTense ? 'rgba(255,140,66,0.15)' : 'var(--teal-g)'}; display:flex; align-items:center; justify-content:center; margin:0 auto 16px;">
          <i class="fas ${step.icon}" style="font-size:28px; color:${pmrIsTense ? 'var(--accent)' : 'var(--teal)'};"></i>
        </div>
        <h4 style="font-size:18px; font-weight:800; margin-bottom:8px; color:${pmrIsTense ? 'var(--accent)' : 'var(--teal)'};">
          ${pmrIsTense ? '1. TENSE MUSCLES NOW' : '2. RELEASE & LET DROP'}
        </h4>
        <p style="font-size:15px; color:var(--text); font-weight:600; line-height:1.5; margin-bottom:20px;">
          ${pmrIsTense ? step.instruction : 'Let all tension melt away. Notice the warm, relaxed sensation.'}
        </p>

        <div style="font-family:Fredoka; font-size:36px; font-weight:700; color:var(--teal);">
          ${pmrSecondsLeft}s
        </div>
      </div>

      <div style="display:flex; gap:12px; justify-content:center;">
        <button class="btn btn-lg btn-teal" onclick="nextPMRStep()">
          <i class="fas ${pmrStep === PMR_STEPS.length - 1 && !pmrIsTense ? 'fa-circle-check' : 'fa-step-forward'}"></i>
          ${pmrStep === PMR_STEPS.length - 1 && !pmrIsTense ? 'Complete Session (+10 XP)' : 'Next Muscle Group'}
        </button>
        <button class="btn btn-lg btn-ghost" onclick="resetPMR()">
          <i class="fas fa-rotate-left"></i> Reset
        </button>
      </div>
    </div>
  `;
}

function nextPMRStep() {
  SFX.click();
  if (pmrIsTense) {
    pmrIsTense = false;
    pmrSecondsLeft = 5;
    playBreathingChime(260);
  } else {
    if (pmrStep < PMR_STEPS.length - 1) {
      pmrStep++;
      pmrIsTense = true;
      pmrSecondsLeft = 5;
    } else {
      Store.addXP(10);
      toast('Full Progressive Muscle Relaxation Complete! Body refreshed.', 'bonus');
      resetPMR();
    }
  }
  renderWellness();
}

function resetPMR() {
  pmrStep = 0;
  pmrIsTense = true;
  pmrSecondsLeft = 5;
  renderWellness();
}

const AFFIRMATION_DECKS = [
  {
    category: '🎓 Test & Exam Anxiety',
    icon: 'fa-graduation-cap',
    items: [
      "I have prepared to the best of my ability, and my worth is not defined by a score.",
      "Anxiety is just energy looking for direction. I can take one calm question at a time.",
      "If I encounter a difficult problem, I can pause, skip, and come back with fresh eyes."
    ]
  },
  {
    category: '⏳ Feeling Behind & Overwhelmed',
    icon: 'fa-hourglass-half',
    items: [
      "I don't have to fix my whole life today. I just need to do the next 5 minutes.",
      "Starting late is infinitely better than never starting. I am starting right now.",
      "It is safe to slow down. High panic does not equal high speed."
    ]
  },
  {
    category: '🧠 ADHD Brain Appreciation',
    icon: 'fa-bolt',
    items: [
      "My brain works differently, and that includes incredible creativity and hyperfocus gifts.",
      "Taking frequent short breaks is not laziness — it is smart energy management.",
      "I forgive myself for yesterday's distractions. Today is a brand new canvas."
    ]
  },
  {
    category: '🌿 Self-Compassion & Peace',
    icon: 'fa-heart',
    items: [
      "I talk to myself with the same kindness and patience I give my best friends.",
      "Resting is a productive part of learning and memory consolidation.",
      "I am doing my best, and my best is enough."
    ]
  }
];

function renderWellnessAffirmationsSection() {
  return `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <div class="card" style="background:var(--card); border-left:4px solid var(--teal);">
        <h3 style="font-size:18px; font-weight:800; margin-bottom:4px; display:flex; align-items:center; gap:8px;">
          <i class="fas fa-quote-left" style="color:var(--teal);"></i> Compassionate Self-Talk Decks
        </h3>
        <p style="color:var(--text2); font-size:14px;">
          Select any affirmation card below to copy or pin it directly onto your screen as a Sticky Note!
        </p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:18px;">
        ${AFFIRMATION_DECKS.map(deck => `
          <div class="card" style="display:flex; flex-direction:column; gap:12px;">
            <div style="display:flex; align-items:center; gap:8px; font-weight:800; font-size:15px; color:var(--text); border-bottom:1px solid var(--border); padding-bottom:8px;">
              <i class="fas ${deck.icon}" style="color:var(--teal);"></i> ${deck.category}
            </div>
            <div style="display:flex; flex-direction:column; gap:10px;">
              ${deck.items.map(quote => `
                <div style="background:var(--bg); padding:12px; border-radius:10px; font-size:13px; line-height:1.5; color:var(--text); border:1px solid var(--border); display:flex; flex-direction:column; gap:8px;">
                  <div>"${escHtml(quote)}"</div>
                  <div style="display:flex; justify-content:flex-end; gap:6px;">
                    <button class="btn btn-sm btn-ghost" style="font-size:11px;" onclick="navigator.clipboard.writeText('${escHtml(quote)}'); toast('Copied affirmation to clipboard!', 'info');">
                      <i class="fas fa-copy"></i> Copy
                    </button>
                    <button class="btn btn-sm btn-teal" style="font-size:11px;" onclick="createNewStickyNote('✨ Affirmation:\\n${escHtml(quote)}')">
                      <i class="fas fa-thumbtack"></i> Pin to Desktop
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderWellnessAnalyticsSection() {
  const logs = Store.get('moodLogs') || [];
  const totalLogs = logs.length;

  const moodCounts = {};
  logs.forEach(l => {
    moodCounts[l.mood] = (moodCounts[l.mood] || 0) + 1;
  });

  return `
    <div class="card card-glow" style="padding:28px;">
      <h3 style="font-size:20px; font-weight:800; margin-bottom:6px; display:flex; align-items:center; gap:8px;">
        <i class="fas fa-chart-line" style="color:var(--teal);"></i> Emotional Pattern Insights
      </h3>
      <p style="font-size:14px; color:var(--text2); margin-bottom:20px;">
        Understanding your emotional patterns helps tailor study schedules around your natural energy levels.
      </p>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:16px; margin-bottom:24px;">
        <div style="background:var(--bg); padding:16px; border-radius:12px; text-align:center;">
          <div style="font-size:28px; font-weight:800; color:var(--teal);">${totalLogs}</div>
          <div style="font-size:12px; color:var(--text2); font-weight:700;">Total Mood Check-Ins</div>
        </div>
        <div style="background:var(--bg); padding:16px; border-radius:12px; text-align:center;">
          <div style="font-size:28px; font-weight:800; color:var(--accent);">
            ${Object.keys(moodCounts).length ? MOOD_DATA[Object.keys(moodCounts).reduce((a,b) => moodCounts[a] > moodCounts[b] ? a : b)]?.emoji || '🧘' : '🧘'}
          </div>
          <div style="font-size:12px; color:var(--text2); font-weight:700;">Primary Mood State</div>
        </div>
        <div style="background:var(--bg); padding:16px; border-radius:12px; text-align:center;">
          <div style="font-size:28px; font-weight:800; color:var(--blue);">
            ${(Store.get('journalLogs') || []).length}
          </div>
          <div style="font-size:12px; color:var(--text2); font-weight:700;">Small Wins Recorded</div>
        </div>
      </div>

      <h4 style="font-size:15px; font-weight:700; margin-bottom:12px;">Logged Mood Breakdown</h4>
      <div style="display:flex; flex-direction:column; gap:10px;">
        ${Object.keys(MOOD_DATA).map(key => {
          const item = MOOD_DATA[key];
          const count = moodCounts[key] || 0;
          const pct = totalLogs > 0 ? Math.round((count / totalLogs) * 100) : 0;
          return `
            <div>
              <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:700; margin-bottom:4px;">
                <span>${item.emoji} ${item.label}</span>
                <span style="color:var(--text2);">${count} times (${pct}%)</span>
              </div>
              <div style="height:10px; background:var(--bg); border-radius:5px; overflow:hidden;">
                <div style="height:100%; width:${pct}%; background:var(--teal); border-radius:5px; transition:width 0.4s ease;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderWellnessCheckinSection(logs, activeMoodData) {
  return `
    <div class="card card-glow" style="margin-bottom:24px;">
      <h3 style="font-size:18px; font-weight:700; margin-bottom:6px; display:flex; align-items:center; gap:8px;">
        <i class="fas fa-heart-circle-check" style="color:var(--teal);"></i> Daily Emotional & Energy Check-In
      </h3>
      <p style="color:var(--text2); font-size:14px; margin-bottom:16px;">
        Checking in with yourself builds emotional awareness and prevents burnout. Select your current state:
      </p>

      <!-- Emoji Picker -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(90px, 1fr)); gap:10px; margin-bottom:20px;">
        ${Object.keys(MOOD_DATA).map(key => {
          const item = MOOD_DATA[key];
          const isSel = selectedMood === key;
          return `
            <div class="mood-chip ${isSel ? 'selected' : ''}" onclick="selectedMood='${key}'; SFX.click(); renderWellness();">
              <div class="mood-emoji">${item.emoji}</div>
              <div class="mood-label">${item.label}</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Recommendation Card -->
      <div style="padding:16px; background:var(--bg); border-radius:12px; border-left:4px solid var(--teal); margin-bottom:20px;">
        <div style="font-weight:700; font-size:14px; margin-bottom:4px; color:var(--teal);">
          <i class="fas fa-lightbulb"></i> Personal Recommendation
        </div>
        <div style="font-size:14px; color:var(--text);">${activeMoodData.rec}</div>
        <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn btn-sm btn-teal" onclick="quickLogMood('${selectedMood}')">
            <i class="fas fa-check"></i> Log Mood (+10 XP)
          </button>
          <button class="btn btn-sm btn-secondary" onclick="navigate('focus')">
            <i class="fas fa-bullseye"></i> Start ${activeMoodData.label} Session
          </button>
        </div>
      </div>

      <!-- Past Logs History -->
      ${logs.length ? `
        <div>
          <h4 style="font-size:14px; font-weight:700; color:var(--text2); margin-bottom:10px;">Recent Check-Ins</h4>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${logs.slice(0, 5).map(l => {
              const info = MOOD_DATA[l.mood] || MOOD_DATA.calm;
              const dateStr = new Date(l.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              return `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:var(--bg); border-radius:10px; font-size:13px;">
                  <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:18px;">${info.emoji}</span>
                    <span style="font-weight:700;">${info.label}</span>
                  </div>
                  <span style="color:var(--text2); font-size:12px;">${dateStr}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderWellnessBreathingSection() {
  const isRun = breathingState.running;
  let phaseText = 'Click Start to Begin';
  if (isRun) {
    if (breathingState.phase === 'inhale') phaseText = 'Breathe In Slowly...';
    else if (breathingState.phase === 'hold' || breathingState.phase === 'hold2') phaseText = 'Hold Breath Calmly...';
    else if (breathingState.phase === 'exhale') phaseText = 'Exhale Gently...';
  }

  return `
    <div class="card card-glow" style="text-align:center; padding:32px 24px;">
      <h3 style="font-size:22px; font-weight:700; margin-bottom:6px;">Guided Mind Reset & Breathing</h3>
      <p style="color:var(--text2); font-size:14px; margin-bottom:20px; max-width:500px; margin-left:auto; margin-right:auto;">
        Slowing down your respiration signals your nervous system that you are safe, dissolving panic & focus fatigue.
      </p>

      <!-- Breathing Technique Selector -->
      <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap; margin-bottom:24px;">
        <button class="grade-pill ${breathingState.mode==='box'?'selected':''}" onclick="startBreathing('box')">
          Box Breathing (4-4-4-4)
        </button>
        <button class="grade-pill ${breathingState.mode==='478'?'selected':''}" onclick="startBreathing('478')">
          4-7-8 Deep Calm
        </button>
        <button class="grade-pill ${breathingState.mode==='slow'?'selected':''}" onclick="startBreathing('slow')">
          Slow Reset (5-5)
        </button>
      </div>

      <!-- Animated Breathing Circle -->
      <div class="guided-breath-circle ${isRun ? breathingState.phase : ''}" id="guided-breath-circle">
        <div style="font-family:Fredoka; font-size:48px; font-weight:700; color:var(--teal);" id="breath-timer-display">
          ${isRun ? breathingState.seconds + 's' : 'Ready'}
        </div>
        <div style="font-size:12px; font-weight:700; color:var(--text2);" id="breath-cycle-count">
          ${breathingState.cycles} cycles done
        </div>
      </div>

      <div style="font-size:18px; font-weight:700; color:var(--teal); margin-bottom:24px;" id="breath-phase-label">
        ${phaseText}
      </div>

      <!-- Controls -->
      <div style="display:flex; gap:12px; justify-content:center;">
        ${!isRun ? `
          <button class="btn btn-lg btn-teal" onclick="startBreathing()"><i class="fas fa-play"></i> Start Breathing</button>
        ` : `
          <button class="btn btn-lg btn-secondary" onclick="stopBreathing()"><i class="fas fa-pause"></i> Pause</button>
        `}
      </div>
    </div>
  `;
}

function renderWellnessGroundingSection() {
  const stepsMeta = [
    { num: 5, icon: 'fa-eye', title: '5 Things You Can SEE', desc: 'Look around your room. Find 5 distinct objects.', key: 'see' },
    { num: 4, icon: 'fa-hand', title: '4 Things You Can TOUCH', desc: 'Feel your clothes, desk, chair, or cool air.', key: 'touch' },
    { num: 3, icon: 'fa-ear-listen', title: '3 Things You HEAR', desc: 'Listen closely for ambient background sounds.', key: 'hear' },
    { num: 2, icon: 'fa-nose', title: '2 Things You SMELL', desc: 'Notice smells around you or take a fresh breath.', key: 'smell' },
    { num: 1, icon: 'fa-heart', title: '1 Good Thing You Appreciate', desc: 'Acknowledge one positive thing about yourself or today.', key: 'appreciate' }
  ];

  if (groundingStep >= 5) {
    return `
      <div class="card card-glow" style="text-align:center; padding:40px 24px;">
        <i class="fas fa-anchor" style="font-size:48px; color:var(--teal); margin-bottom:16px;"></i>
        <h3 style="font-size:22px; font-weight:700; margin-bottom:8px;">You Are Grounded & Present</h3>
        <p style="color:var(--text2); font-size:14px; margin-bottom:24px; max-width:480px; margin-left:auto; margin-right:auto;">
          Sensory grounding brings your hyperactive or anxious brain back to the immediate physical present. Great job!
        </p>
        <div style="display:flex; gap:12px; justify-content:center;">
          <button class="btn btn-teal" onclick="resetGroundingWizard()"><i class="fas fa-rotate-left"></i> Repeat Grounding</button>
          <button class="btn btn-primary" onclick="navigate('focus')"><i class="fas fa-play"></i> Ready to Focus</button>
        </div>
      </div>
    `;
  }

  const currStep = stepsMeta[groundingStep];

  return `
    <div class="card card-glow" style="padding:28px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <span class="tag" style="background:var(--teal-g); color:var(--teal); font-weight:700;">
          Step ${groundingStep + 1} of 5
        </span>
        <button class="btn btn-sm btn-ghost" onclick="resetGroundingWizard()" style="font-size:12px;"><i class="fas fa-rotate-left"></i> Restart</button>
      </div>

      <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
        <div style="width:48px; height:48px; border-radius:12px; background:var(--teal-g); display:flex; align-items:center; justify-content:center;">
          <i class="fas ${currStep.icon}" style="color:var(--teal); font-size:22px;"></i>
        </div>
        <div>
          <h3 style="font-size:20px; font-weight:700;">${currStep.title}</h3>
          <p style="font-size:13px; color:var(--text2);">${currStep.desc}</p>
        </div>
      </div>

      <div style="margin-bottom:24px;">
        <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:8px;">Type them out (or mentally acknowledge them):</label>
        <input class="input" id="grounding-step-inp" placeholder="Type here..." style="font-size:14px;" autofocus onkeydown="if(event.key==='Enter')nextGroundingStep()">
      </div>

      <div style="display:flex; justify-content:flex-end;">
        <button class="btn btn-teal" onclick="nextGroundingStep()">Next Step <i class="fas fa-arrow-right"></i></button>
      </div>
    </div>
  `;
}

function renderWellnessDissolverSection() {
  return `
    <div class="card card-glow" style="padding:28px;">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
        <div style="width:44px; height:44px; border-radius:12px; background:rgba(168,85,247,0.12); display:flex; align-items:center; justify-content:center;">
          <i class="fas fa-cloud-moon" style="color:#A855F7; font-size:20px;"></i>
        </div>
        <div>
          <h3 style="font-size:20px; font-weight:700;">Worry & Thought Dissolver</h3>
          <p style="font-size:13px; color:var(--text2);">Got a sticky, anxious thought in your head? Write it down and watch it fade into space.</p>
        </div>
      </div>

      <div id="worry-stage" style="min-height:100px; display:flex; align-items:center; justify-content:center; background:var(--bg); border-radius:12px; padding:16px; margin-bottom:16px;">
        <input class="input" id="worry-dissolve-input" placeholder="e.g. What if I fail tomorrow's test? / I feel overwhelmed..." style="font-size:15px; border:none; background:transparent;" onkeydown="if(event.key==='Enter')dissolveWorryThought()">
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <span style="font-size:12px; color:var(--text2);"><i class="fas fa-shield-halved" style="color:var(--teal);"></i> Private & purely client-side. Nothing is permanently stored.</span>
        <button class="btn btn-teal" onclick="dissolveWorryThought()"><i class="fas fa-sparkles"></i> Release & Dissolve Thought</button>
      </div>
    </div>
  `;
}

function renderWellnessReframesSection() {
  return `
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div class="card" style="background:var(--card); border-left:4px solid var(--accent);">
        <h3 style="font-size:18px; font-weight:700; margin-bottom:4px;">ADHD Compassion & Anti-Paralysis Reframes</h3>
        <p style="color:var(--text2); font-size:14px;">The ADHD brain often trips on guilt, perfectionism, and all-or-nothing thinking. Here is how to reframe them:</p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
        ${ADHD_REFRAMES.map(r => `
          <div class="reframe-card">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
              <div style="width:36px; height:36px; border-radius:10px; background:var(--teal-g); display:flex; align-items:center; justify-content:center;">
                <i class="fas ${r.icon}" style="color:var(--teal);"></i>
              </div>
              <h4 style="font-weight:700; font-size:16px;">${r.title}</h4>
            </div>
            <div style="font-size:13px; color:var(--red); margin-bottom:10px; font-weight:600;">
              <i class="fas fa-xmark"></i> "${r.problem}"
            </div>
            <div style="font-size:13px; color:var(--green); background:var(--bg); padding:10px 12px; border-radius:8px; line-height:1.5;">
              <i class="fas fa-lightbulb"></i> <strong>Compassionate Reframe:</strong> ${r.reframe}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ======================== ONBOARDING ========================
function showOnboarding(){showModal(`<div style="text-align:center"><div style="width:56px;height:56px;margin:0 auto 16px;background:linear-gradient(135deg,#FF8C42,#FFC107);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px var(--accent-g)"><i class="fas fa-fire" style="color:#fff;font-size:24px"></i></div><h1 style="font-size:24px;margin-bottom:4px">Welcome to Spark</h1><p style="color:var(--text2);margin-bottom:24px;font-size:15px">Small steps, big momentum.</p><div style="text-align:left;margin-bottom:16px"><label style="font-size:13px;color:var(--text2);display:block;margin-bottom:4px">What should we call you?</label><input class="input" id="onb-name" placeholder="Your name" autofocus></div><div style="text-align:left;margin-bottom:16px"><label style="font-size:13px;color:var(--text2);display:block;margin-bottom:6px">Grade</label><div style="display:flex;flex-direction:column;gap:8px" id="onb-grades"><div><div style="font-size:11px;color:var(--text2);margin-bottom:4px">Primary</div><div style="display:flex;gap:6px;flex-wrap:wrap">${[1,2,3,4,5,6].map(g=>`<button class="grade-pill" data-g="${g}" onclick="document.querySelectorAll('#onb-grades .grade-pill').forEach(p=>p.classList.remove('selected'));this.classList.add('selected')">${g}</button>`).join('')}</div></div><div><div style="font-size:11px;color:var(--text2);margin-bottom:4px">Preparatory</div><div style="display:flex;gap:6px;flex-wrap:wrap">${[7,8,9].map(g=>`<button class="grade-pill" data-g="${g}" onclick="document.querySelectorAll('#onb-grades .grade-pill').forEach(p=>p.classList.remove('selected'));this.classList.add('selected')">${g}</button>`).join('')}</div></div><div><div style="font-size:11px;color:var(--text2);margin-bottom:4px">Secondary</div><div style="display:flex;gap:6px;flex-wrap:wrap">${[10,11,12].map(g=>`<button class="grade-pill" data-g="${g}" onclick="document.querySelectorAll('#onb-grades .grade-pill').forEach(p=>p.classList.remove('selected'));this.classList.add('selected')">${g}</button>`).join('')}</div></div></div></div><div style="text-align:left;margin-bottom:24px"><label style="font-size:13px;color:var(--text2);display:block;margin-bottom:6px">Color</label><div style="display:flex;gap:8px;justify-content:center" id="onb-colors">${['#FF8C42','#4ECDC4','#FF6B6B','#58A6FF','#A855F7','#22C55E'].map(c=>`<div class="color-opt" style="background:${c}" data-c="${c}" onclick="document.querySelectorAll('#onb-colors .color-opt').forEach(o=>o.classList.remove('selected'));this.classList.add('selected')"></div>`).join('')}</div></div><button class="btn btn-lg btn-primary" style="width:100%;justify-content:center" onclick="finishOnboarding()">Let's Go <i class="fas fa-arrow-right"></i></button></div>`);setTimeout(()=>{const g2=document.querySelector('#onb-grades [data-g="2"]');if(g2)g2.classList.add('selected');const c1=document.querySelector('#onb-colors [data-c="#FF8C42"]');if(c1)c1.classList.add('selected');},50);}
function finishOnboarding(){
  const n=document.getElementById('onb-name').value.trim();
  if(!n){toast('Please enter your name','warn');return;}
  const g=document.querySelector('#onb-grades .grade-pill.selected'),gr=g?parseInt(g.dataset.g):2,c=document.querySelector('#onb-colors .color-opt.selected'),cl=c?c.dataset.c:'#FF8C42';
  Store.set('user',{name:n,grade:gr,color:cl});
  Store.updateStreak();
  closeModal();
  
  // Initialize dynamic inventory colors list with their onboarding selection
  const inv = Store.get('inventory');
  inv.colors = [cl];
  inv.equipped.color = cl;
  Store.set('inventory', inv);

  applyAccentColor(cl);
  updateUserPanel();
  navigate('dashboard');
  toast(`Welcome, ${n}!`,'success');
  SFX.complete();
}
// ======================== STICKY NOTES SYSTEM ========================
let stickyNotesVisible = true;
let highestZIndex = 100;
let isDockMenuOpen = false;

function getStickyNotes() {
  let notes = Store.get('stickyNotes');
  if (!Array.isArray(notes) || (notes.length === 0 && !Store._d.stickyNotes)) {
    try {
      const raw = localStorage.getItem('spark_sticky_notes') || localStorage.getItem('sticky_notes') || localStorage.getItem('stickyNotes');
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          notes = parsed;
          Store._d.stickyNotes = notes;
        }
      }
    } catch(e) {}
  }
  return Array.isArray(notes) ? notes : [];
}

function saveStickyNotes(notes) {
  if (!Array.isArray(notes)) return;
  Store.set('stickyNotes', notes);
  try {
    const json = JSON.stringify(notes);
    localStorage.setItem('spark_sticky_notes', json);
    localStorage.setItem('sticky_notes', json);
    localStorage.setItem('stickyNotes', json);
    localStorage.setItem('spark_sticky_notes_visible', JSON.stringify(stickyNotesVisible));
    localStorage.setItem('sticky_notes_visible', JSON.stringify(stickyNotesVisible));
    localStorage.setItem('spark_sticky_notes_highest_z', JSON.stringify(highestZIndex));
  } catch(e) {
    console.warn('Could not save sticky notes to localStorage', e);
  }
}

function syncStickyNotesFromDOM() {
  const notes = getStickyNotes();
  if (!notes.length) return;
  let changed = false;

  notes.forEach(note => {
    const el = document.querySelector(`.sticky-note[data-id="${note.id}"]`);
    if (!el) return;

    // 1. Sync Text Content
    const ta = el.querySelector('.sticky-textarea');
    if (ta && ta.value !== note.text) {
      note.text = ta.value;
      changed = true;
    }

    // 2. Sync Coordinates / Position
    const curLeft = parseInt(el.style.left, 10);
    const curTop = parseInt(el.style.top, 10);
    if (!isNaN(curLeft) && curLeft !== note.x) {
      note.x = curLeft;
      changed = true;
    }
    if (!isNaN(curTop) && curTop !== note.y) {
      note.y = curTop;
      changed = true;
    }

    // 3. Sync Z-Index
    const curZ = parseInt(el.style.zIndex, 10);
    if (!isNaN(curZ) && curZ !== note.zIndex) {
      note.zIndex = curZ;
      changed = true;
    }

    // 4. Sync Dimensions (if resized and not minimized)
    if (!note.minimized && !el.classList.contains('minimized')) {
      const curW = parseInt(el.style.width, 10) || el.offsetWidth;
      const curH = parseInt(el.style.height, 10) || el.offsetHeight;
      if (curW && curW >= 160 && curW !== note.width) {
        note.width = curW;
        changed = true;
      }
      if (curH && curH >= 120 && curH !== note.height) {
        note.height = curH;
        changed = true;
      }
    }
  });

  if (changed) {
    saveStickyNotes(notes);
  }
}

function onStickyResize(noteId) {
  const el = document.querySelector(`.sticky-note[data-id="${noteId}"]`);
  if (!el || el.classList.contains('minimized')) return;
  const w = parseInt(el.style.width, 10) || el.offsetWidth;
  const h = parseInt(el.style.height, 10) || el.offsetHeight;
  const notes = getStickyNotes();
  const note = notes.find(n => n.id === noteId);
  if (note && (note.width !== w || note.height !== h)) {
    note.width = w;
    note.height = h;
    saveStickyNotes(notes);
  }
}

function toggleStickyDockMenu() {
  SFX.click();
  const menu = document.getElementById('sticky-dock-menu');
  if (!menu) return;
  isDockMenuOpen = !isDockMenuOpen;
  menu.style.display = isDockMenuOpen ? 'flex' : 'none';
}

function closeStickyDockMenu() {
  isDockMenuOpen = false;
  const menu = document.getElementById('sticky-dock-menu');
  if (menu) menu.style.display = 'none';
}

function toggleStickyNotesVisibility() {
  SFX.click();
  syncStickyNotesFromDOM();
  stickyNotesVisible = !stickyNotesVisible;
  const layer = document.getElementById('sticky-notes-layer');
  const visText = document.getElementById('sticky-vis-text');
  if (layer) layer.style.display = stickyNotesVisible ? 'block' : 'none';
  if (visText) visText.textContent = stickyNotesVisible ? 'Hide All' : 'Show All';
  try {
    localStorage.setItem('spark_sticky_notes_visible', JSON.stringify(stickyNotesVisible));
    localStorage.setItem('sticky_notes_visible', JSON.stringify(stickyNotesVisible));
  } catch(e) {}
  closeStickyDockMenu();
  toast(stickyNotesVisible ? 'Sticky notes visible' : 'Sticky notes hidden', 'info');
}

function createNewStickyNote(initialText = '') {
  closeStickyDockMenu();
  SFX.click();
  syncStickyNotesFromDOM();
  const notes = getStickyNotes();
  
  const count = notes.length;
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const baseX = Math.min(screenWidth - 260, Math.max(260, 300 + (count * 25) % (screenWidth - 500 || 300)));
  const baseY = Math.min(screenHeight - 250, 100 + (count * 25) % (screenHeight - 350 || 300));

  const colors = ['yellow', 'green', 'pink', 'blue', 'purple'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  highestZIndex++;

  const newNote = {
    id: 'sn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    text: initialText || '',
    color: randomColor,
    x: baseX,
    y: baseY,
    width: 230,
    height: 200,
    minimized: false,
    zIndex: highestZIndex
  };

  notes.push(newNote);
  saveStickyNotes(notes);
  renderStickyNotes();
  
  setTimeout(() => {
    const ta = document.querySelector(`.sticky-note[data-id="${newNote.id}"] .sticky-textarea`);
    if (ta) ta.focus();
  }, 50);

  toast('New sticky note created!', 'success');
}

function renderStickyNotes() {
  const layer = document.getElementById('sticky-notes-layer');
  const badge = document.getElementById('sticky-count-badge');
  if (!layer) return;

  const notes = getStickyNotes();
  if (badge) badge.textContent = notes.length;

  layer.innerHTML = notes.map(note => {
    const previewText = note.text.trim().split('\n')[0].slice(0, 16) || 'Sticky Note';
    const colorClass = 'sn-' + (note.color || 'yellow');
    
    if (note.zIndex > highestZIndex) highestZIndex = note.zIndex;

    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const clampedX = Math.max(10, Math.min(screenWidth - 60, typeof note.x === 'number' ? note.x : 280));
    const clampedY = Math.max(10, Math.min(screenHeight - 40, typeof note.y === 'number' ? note.y : 80));

    const widthStyle = note.width && !note.minimized ? `width:${note.width}px;` : '';
    const heightStyle = note.height && !note.minimized ? `height:${note.height}px; min-height:${note.height}px;` : '';

    return `
      <div class="sticky-note ${colorClass} ${note.minimized ? 'minimized' : ''}" 
           data-id="${note.id}" 
           style="left:${clampedX}px; top:${clampedY}px; z-index:${note.zIndex || 100}; ${widthStyle} ${heightStyle}"
           onclick="bringStickyToFront('${note.id}')"
           onmouseup="onStickyResize('${note.id}')">
        <div class="sticky-header" onmousedown="startStickyDrag(event, '${note.id}')" ontouchstart="startStickyDrag(event, '${note.id}')">
          <div style="display:flex; align-items:center; gap:6px; overflow:hidden;">
            <i class="fas fa-thumbtack" style="font-size:11px; opacity:0.8;"></i>
            <span style="white-space:nowrap; text-overflow:ellipsis; overflow:hidden; font-size:12px;">
              ${note.minimized ? escHtml(previewText) : 'Note'}
            </span>
          </div>
          <div class="sticky-actions" onclick="event.stopPropagation();">
            ${!note.minimized ? `
              <div class="sticky-color-picker">
                <div class="sticky-color-dot" style="background:#FFE066;" onclick="changeStickyColor('${note.id}', 'yellow')" title="Yellow"></div>
                <div class="sticky-color-dot" style="background:#B2F2BB;" onclick="changeStickyColor('${note.id}', 'green')" title="Green"></div>
                <div class="sticky-color-dot" style="background:#FCC2D7;" onclick="changeStickyColor('${note.id}', 'pink')" title="Pink"></div>
                <div class="sticky-color-dot" style="background:#A5D8FF;" onclick="changeStickyColor('${note.id}', 'blue')" title="Blue"></div>
                <div class="sticky-color-dot" style="background:#E599E0;" onclick="changeStickyColor('${note.id}', 'purple')" title="Purple"></div>
                <div class="sticky-color-dot" style="background:#2A2A3D;" onclick="changeStickyColor('${note.id}', 'dark')" title="Dark"></div>
              </div>
            ` : ''}
            <button class="sticky-btn-icon" onclick="toggleMinimizeSticky('${note.id}')" title="${note.minimized ? 'Expand Note' : 'Minimize Note'}">
              <i class="fas ${note.minimized ? 'fa-expand' : 'fa-minus'}"></i>
            </button>
            <button class="sticky-btn-icon" onclick="deleteStickyNote('${note.id}')" title="Delete Note">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        ${!note.minimized ? `
          <div class="sticky-body">
            <textarea class="sticky-textarea" 
                      placeholder="Write your note or idea here..." 
                      oninput="updateStickyText('${note.id}', this.value)"
                      onchange="updateStickyText('${note.id}', this.value)"
                      onblur="updateStickyText('${note.id}', this.value)">${escHtml(note.text)}</textarea>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function bringStickyToFront(noteId) {
  const notes = getStickyNotes();
  const note = notes.find(n => n.id === noteId);
  if (!note) return;

  highestZIndex++;
  note.zIndex = highestZIndex;
  saveStickyNotes(notes);

  const el = document.querySelector(`.sticky-note[data-id="${noteId}"]`);
  if (el) el.style.zIndex = highestZIndex;
}

function updateStickyText(noteId, text) {
  const notes = getStickyNotes();
  const note = notes.find(n => n.id === noteId);
  if (note) {
    note.text = text;
    saveStickyNotes(notes);
  }
}

function changeStickyColor(noteId, color) {
  SFX.click();
  syncStickyNotesFromDOM();
  const notes = getStickyNotes();
  const note = notes.find(n => n.id === noteId);
  if (note) {
    note.color = color;
    saveStickyNotes(notes);
    renderStickyNotes();
  }
}

function toggleMinimizeSticky(noteId) {
  SFX.click();
  syncStickyNotesFromDOM();
  const notes = getStickyNotes();
  const note = notes.find(n => n.id === noteId);
  if (note) {
    const el = document.querySelector(`.sticky-note[data-id="${noteId}"]`);
    if (el && !note.minimized) {
      note.width = parseInt(el.style.width, 10) || el.offsetWidth;
      note.height = parseInt(el.style.height, 10) || el.offsetHeight;
    }
    note.minimized = !note.minimized;
    saveStickyNotes(notes);
    renderStickyNotes();
  }
}

function deleteStickyNote(noteId) {
  SFX.click();
  syncStickyNotesFromDOM();
  let notes = getStickyNotes();
  notes = notes.filter(n => n.id !== noteId);
  saveStickyNotes(notes);
  renderStickyNotes();
  toast('Sticky note deleted', 'info');
}

let activeDragNoteId = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

function startStickyDrag(e, noteId) {
  if (e.target.closest('.sticky-actions')) return;
  
  activeDragNoteId = noteId;
  bringStickyToFront(noteId);

  const el = document.querySelector(`.sticky-note[data-id="${noteId}"]`);
  if (!el) return;

  el.classList.add('dragging');

  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

  const rect = el.getBoundingClientRect();
  dragOffsetX = clientX - rect.left;
  dragOffsetY = clientY - rect.top;

  document.addEventListener('mousemove', onStickyDragMove);
  document.addEventListener('mouseup', onStickyDragEnd);
  document.addEventListener('touchmove', onStickyDragMove, { passive: false });
  document.addEventListener('touchend', onStickyDragEnd);
  window.addEventListener('mouseup', onStickyDragEnd);
  window.addEventListener('touchend', onStickyDragEnd);
  window.addEventListener('touchcancel', onStickyDragEnd);
  window.addEventListener('blur', onStickyDragEnd);
}

function onStickyDragMove(e) {
  if (!activeDragNoteId) return;
  if (e.cancelable) e.preventDefault();

  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  let newX = clientX - dragOffsetX;
  let newY = clientY - dragOffsetY;

  newX = Math.max(10, Math.min(screenWidth - 190, newX));
  newY = Math.max(10, Math.min(screenHeight - 40, newY));

  const el = document.querySelector(`.sticky-note[data-id="${activeDragNoteId}"]`);
  if (el) {
    el.style.left = newX + 'px';
    el.style.top = newY + 'px';
  }
}

function onStickyDragEnd(e) {
  if (!activeDragNoteId) return;

  const el = document.querySelector(`.sticky-note[data-id="${activeDragNoteId}"]`);
  if (el) {
    el.classList.remove('dragging');
    const finalX = parseInt(el.style.left, 10);
    const finalY = parseInt(el.style.top, 10);

    const notes = getStickyNotes();
    const note = notes.find(n => n.id === activeDragNoteId);
    if (note && !isNaN(finalX) && !isNaN(finalY)) {
      note.x = finalX;
      note.y = finalY;
      saveStickyNotes(notes);
    }
  }

  activeDragNoteId = null;
  document.removeEventListener('mousemove', onStickyDragMove);
  document.removeEventListener('mouseup', onStickyDragEnd);
  document.removeEventListener('touchmove', onStickyDragMove);
  document.removeEventListener('touchend', onStickyDragEnd);
  window.removeEventListener('mouseup', onStickyDragEnd);
  window.removeEventListener('touchend', onStickyDragEnd);
  window.removeEventListener('touchcancel', onStickyDragEnd);
  window.removeEventListener('blur', onStickyDragEnd);
}

function scatterStickyNotes() {
  closeStickyDockMenu();
  SFX.whoosh();
  syncStickyNotesFromDOM();
  const notes = getStickyNotes();
  if (!notes.length) {
    toast('No sticky notes to scatter. Create one first!', 'info');
    return;
  }

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  notes.forEach((note) => {
    const randX = Math.floor(Math.random() * (screenWidth - 300)) + 250;
    const randY = Math.floor(Math.random() * (screenHeight - 260)) + 60;

    note.x = Math.max(250, randX);
    note.y = Math.max(60, randY);

    const el = document.querySelector(`.sticky-note[data-id="${note.id}"]`);
    if (el) {
      el.style.transition = 'left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      el.style.left = note.x + 'px';
      el.style.top = note.y + 'px';

      setTimeout(() => {
        if (el) el.style.transition = 'transform 0.1s ease, box-shadow 0.15s ease';
      }, 450);
    }
  });

  saveStickyNotes(notes);
  toast('Sticky notes scattered across screen!', 'success');
}

function stackStickyNotes() {
  closeStickyDockMenu();
  SFX.click();
  syncStickyNotesFromDOM();
  const notes = getStickyNotes();
  if (!notes.length) {
    toast('No sticky notes to stack.', 'info');
    return;
  }

  const screenWidth = window.innerWidth;

  notes.forEach((note, idx) => {
    note.x = Math.min(screenWidth - 250, 280 + (idx * 25));
    note.y = 80 + (idx * 30);

    const el = document.querySelector(`.sticky-note[data-id="${note.id}"]`);
    if (el) {
      el.style.transition = 'left 0.3s ease, top 0.3s ease';
      el.style.left = note.x + 'px';
      el.style.top = note.y + 'px';

      setTimeout(() => {
        if (el) el.style.transition = 'transform 0.1s ease, box-shadow 0.15s ease';
      }, 350);
    }
  });

  saveStickyNotes(notes);
  toast('Notes stacked in cascade!', 'info');
}

// Window lifecycle persistence handlers
window.addEventListener('beforeunload', syncStickyNotesFromDOM);
window.addEventListener('pagehide', syncStickyNotesFromDOM);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) syncStickyNotesFromDOM();
});

// ======================== INIT ========================
function init(){
  if(!Store.get('user'))showOnboarding();else{Store.updateStreak();updateUserPanel();renderDashboard();}
  const savedThemeId = Store.get('inventory').equipped.theme;
  const savedTheme = CATALOG.themes.find(t=>t.id===savedThemeId);
  if(savedTheme) applyTheme(savedTheme);
  
  // Restore sticky notes visibility & highest zIndex from localStorage
  try {
    const savedVis = localStorage.getItem('spark_sticky_notes_visible') ?? localStorage.getItem('sticky_notes_visible');
    if (savedVis !== null) {
      stickyNotesVisible = JSON.parse(savedVis);
    }
    const savedZ = localStorage.getItem('spark_sticky_notes_highest_z') ?? localStorage.getItem('sticky_notes_highest_z');
    if (savedZ !== null) {
      highestZIndex = Math.max(highestZIndex, parseInt(savedZ, 10) || 100);
    }
  } catch(e) {}

  const layer = document.getElementById('sticky-notes-layer');
  const visText = document.getElementById('sticky-vis-text');
  if (layer) layer.style.display = stickyNotesVisible ? 'block' : 'none';
  if (visText) visText.textContent = stickyNotesVisible ? 'Hide All' : 'Show All';

  renderStickyNotes();

  document.querySelectorAll('#nav a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();SFX.click();navigate(a.dataset.view);}));
  window.addEventListener('hashchange',()=>{const v=location.hash.slice(1);if(v&&VN.includes(v))navigate(v);});
  document.getElementById('menu-btn').addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('open'));
  document.getElementById('main').addEventListener('click',()=>{
    document.getElementById('sidebar').classList.remove('open');
    closeStickyDockMenu();
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
  
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && focusState.running && focusState.mode === 'focus') {
      logDistraction(true);
    }
  });
  FlashDB.open().catch(()=>{});
}
init();
