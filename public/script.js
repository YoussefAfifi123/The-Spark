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
      const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
      badge.textContent = activeCount > 0 ? (isAr ? `${activeCount} نشط` : `${activeCount} active`) : (isAr ? 'متوقف' : 'Off');
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
    const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
    const activeCount = Object.values(this.sounds).filter(s => s.playing).length;
    const title = isAr ? 'أصوات وخلفيات التركيز' : 'Focus Soundscape';
    const statusText = activeCount > 0 ? (isAr ? `${activeCount} نشط` : `${activeCount} active`) : (isAr ? 'متوقف' : 'Off');
    const muteText = isAr ? 'كتم الجميع' : 'Mute All';
    const presetsLabel = isAr ? 'الأوضاع الجاهزة:' : 'Presets:';
    const volTitle = isAr ? 'مستوى الصوت' : 'Volume';

    const soundNamesAr = {
      lofi: 'لو-فاي هادئ',
      brown: 'ضوضاء بنية',
      pink: 'ضوضاء وردية',
      white: 'ضوضاء بيضاء',
      rain: 'مطر وعواصف',
      binaural: 'موجات بيتا للتركيز',
      ocean: 'أمواج البحر',
      wind: 'نسيم الأشجار',
      cafe: 'أجواء المقهى'
    };

    return `
      <div class="card" style="margin-bottom:16px; padding:16px; background:var(--card);">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <i class="fas fa-headphones" style="color:var(--teal); font-size:16px;"></i>
            <span style="font-weight:700; font-size:14px;">${title}</span>
            <span class="tag" style="background:var(--teal-g); color:var(--teal); font-size:11px;" id="amb-active-count">${statusText}</span>
          </div>
          <div style="display:flex; align-items:center; gap:10px; margin-left:auto;">
            <i class="fas fa-volume-high" style="color:var(--text2); font-size:12px;"></i>
            <input type="range" min="0" max="100" value="${Math.round(this.volume * 100)}" class="amb-slider" id="amb-vol" oninput="Ambient.setVolume(this.value/100)" title="${volTitle}" style="width:80px;">
            <button class="btn btn-sm btn-ghost" onclick="Ambient.stopAll(); SFX.click();" style="border:1px solid var(--border); font-size:11px; padding:4px 8px;">${muteText}</button>
          </div>
        </div>

        <div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:8px; margin-bottom:12px;" class="no-scrollbar">
          <span style="font-size:11px; color:var(--text2); display:flex; align-items:center; font-weight:700; padding-right:4px;">${presetsLabel}</span>
          <button class="amb-btn" onclick="Ambient.applyPreset('adhd'); SFX.click();" style="font-size:11px; padding:4px 10px;"><i class="fas fa-brain" style="color:var(--accent);"></i> ${isAr ? 'تركيز ADHD' : 'ADHD Focus'}</button>
          <button class="amb-btn" onclick="Ambient.applyPreset('lofi'); SFX.click();" style="font-size:11px; padding:4px 10px;"><i class="fas fa-music" style="color:#D8B4FE;"></i> ${isAr ? 'لو-فاي مريح' : 'Cozy Lo-Fi'}</button>
          <button class="amb-btn" onclick="Ambient.applyPreset('nature'); SFX.click();" style="font-size:11px; padding:4px 10px;"><i class="fas fa-tree" style="color:var(--green);"></i> ${isAr ? 'أصوات الطبيعة' : 'Nature'}</button>
          <button class="amb-btn" onclick="Ambient.applyPreset('cafe'); SFX.click();" style="font-size:11px; padding:4px 10px;"><i class="fas fa-mug-hot" style="color:var(--teal);"></i> ${isAr ? 'أجواء المقهى' : 'Cafe'}</button>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(115px, 1fr)); gap:8px;">
          ${Object.keys(this.sounds).map(k => {
            const s = this.sounds[k];
            const displayName = isAr && soundNamesAr[k] ? soundNamesAr[k] : s.name;
            return `<button class="amb-btn ${s.playing ? 'active' : ''}" id="amb-${k}" onclick="Ambient.toggle('${k}'); SFX.click();" style="justify-content:center; padding:8px 6px; font-size:12px;">
              <i class="fas ${s.icon}"></i> ${displayName}
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
  _d:{user:null,sessions:[],games:[],quests:{},thoughts:[],totalXP:0,streak:0,lastActive:null,settings:{focusDuration:10,breakDuration:3,sounds:true,whitelist:['khanacademy.org','docs.google.com','classroom.google.com','ekb.eg','nafham.com'],strictMode:false,schedule:{weekStartDay:6,dayStartHour:8,dayEndHour:20}},inventory:{avatars:['default'],companions:['default'],timers:['classic'],themes:['default'],equipped:{avatar:'default',companion:'default',timer:'classic',theme:'default'}}},
  load(){
    try{
      const r=localStorage.getItem('spark_data');
      this._d=r?{...this._d,...JSON.parse(r)}:{...this._d};
      if(!this._d.settings) this._d.settings = {};
      if(!this._d.settings.schedule) {
        this._d.settings.schedule = { weekStartDay: 6, dayStartHour: 8, dayEndHour: 20 };
      }
      if(!this._d.calcHistory){
        this._d.calcHistory = [
          { id: 'ch_seed_1', expr: '2*pi*5^2', result: '157.07963268', timestamp: Date.now() - 3600000 },
          { id: 'ch_seed_2', expr: 'sin(45) * sqrt(2)', result: '1', timestamp: Date.now() - 7200000 }
        ];
      }
      if(!this._d.calcSettings){
        this._d.calcSettings = { angleUnit: 'deg', tab: 'geogebra', ggbApp: 'scientific' };
      }
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
      if(!this._d.lang) this._d.lang = 'ar';
      if(!this._d.settings.dailyGoalMin) this._d.settings.dailyGoalMin = 30;
      if(!this._d.moodLogs) this._d.moodLogs = [];
      if(!this._d.journalLogs) this._d.journalLogs = [];
      if(!this._d.cbtReframes || !Array.isArray(this._d.cbtReframes)) {
        this._d.cbtReframes = [
          {
            id: 'cbt_seed_1',
            date: new Date(Date.now() - 86400000).toISOString(),
            trigger: 'Scored low on the surprise chemistry pop quiz',
            stumble: 'I failed this quiz, so I will bomb the final exam and destroy my GPA for college.',
            initialBelief: 85,
            emotion: 'Anxious & Overwhelmed',
            distortions: ['catastrophizing', 'all-or-nothing'],
            evidenceFor: 'I struggled with two problem sets on molecular bonds.',
            evidenceAgainst: 'This was a 5-point pop quiz, not the final. I scored 88% on the previous lab. There are still 6 weeks and office hours to ask for help.',
            friendAdvice: 'I would tell them: one rough quiz does not define your ability. It just highlights what to review this Thursday.',
            stepReframe: 'One difficult pop quiz is helpful diagnostic data, not a forecast of my future. I have plenty of time to review molecular bonds and recover.',
            finalBelief: 20,
            microAction: 'Review 3 incorrectly answered quiz questions with my study partner tomorrow',
            actionDone: true,
            helpful: true
          },
          {
            id: 'cbt_seed_2',
            date: new Date(Date.now() - 259200000).toISOString(),
            trigger: 'Selected as group project leader in History',
            stumble: 'Everyone thinks I know what I am doing, but I just got lucky and they will realize I am an imposter.',
            initialBelief: 90,
            emotion: 'Inadequate & Insecure',
            distortions: ['imposter-syndrome', 'mind-reading'],
            evidenceFor: 'I feel nervous about speaking up and organizing others.',
            evidenceAgainst: 'The teacher praised my research outline last semester. My classmates voted for me because I am reliable and take organized notes. Being nervous is normal, not proof of fraud.',
            friendAdvice: 'You earned this spot through your hard work and kindness. Nobody expects perfection—just clear communication.',
            stepReframe: 'Feeling nervous does not mean I am unqualified. I have demonstrated solid organizational skills in the past, and leadership is a skill I can develop step-by-step.',
            finalBelief: 25,
            microAction: 'Create a shared document with bulleted milestone dates',
            actionDone: true,
            helpful: true
          }
        ];
      }
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
            minimized: true,
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
function toast(m,t='success'){
  if (typeof translateString === 'function' && currentLang() === 'ar') {
    m = translateString(m);
  }
  const e=document.createElement('div');
  e.className=`toast toast-${t}`;
  const i={success:'fa-check-circle',info:'fa-info-circle',warn:'fa-exclamation-triangle',bonus:'fa-gift'};
  e.innerHTML=`<i class="fas ${i[t]||i.info}"></i>${m}`;
  document.getElementById('toast-container').appendChild(e);
  setTimeout(()=>e.remove(),t==='bonus'?4000:3000);
}
function showModal(h){
  const root = document.getElementById('modal-root');
  root.innerHTML=`<div class="modal-overlay" id="modal-overlay"><div class="modal">${h}</div></div>`;
  document.getElementById('modal-overlay').addEventListener('click',e=>{if(e.target.id==='modal-overlay')closeModal();});
  if (currentLang() === 'ar' && typeof localizeDOM === 'function') {
    localizeDOM(root);
  }
}
function closeModal(){document.getElementById('modal-root').innerHTML='';}

// ======================== TASK BREAKER ========================
function breakDownTask(task){
  const t=task.toLowerCase();
  const isAr = currentLang() === 'ar';
  const mEn={
    homework:['Get your supplies ready','Read the instructions carefully','Start with the first question','Work through each problem','Check your answers','Put everything in your folder'],
    read:['Find your book or article','Get comfortable and focused','Open to the right page','Read the first paragraph','Keep reading at your own pace','Write down one thing you learned'],
    write:['Open your notebook or document','Write the title or heading','Write the first sentence — any sentence','Add a few more details','Read what you wrote so far','Fix any spelling or mistakes'],
    math:['Get your pencil and paper ready','Look at the first problem carefully','Write down what you know','Solve it step by step','Check your answer makes sense','Move to the next problem'],
    study:['Gather your notes and materials','Review the main ideas first','Close your notes and test yourself','Mark anything you forgot','Review the weak spots again','Take a short break'],
    project:['Read the project requirements','Brainstorm a few ideas','Pick the best idea','Gather what you need','Work on the first part','Keep building it step by step'],
    default:['Get everything you need ready','Figure out the very first small step','Do just that one step','Look at what comes next','Keep going one step at a time','Review what you did']
  };
  const mAr={
    homework:['جهّز أدواتك ودفاترك للبدء','اقرأ التعليمات بعناية وهدوء','ابدأ بالسؤال الأول فورًا','حل كل مسألة خطوة بخطوة','راجع إجاباتك جيدًا للتأكد','رتّب أوراقك وضعها في مكانها'],
    read:['أحضر كتابك أو المقال المطلوب','اجلس في مكان هادئ ومريح للعين','افتح الصفحة المحددة بدقة','اقرأ الفقرة الأولى بتركيز واستيعاب','واصل القراءة بالسرعة التي تريحك','دوّن فكرة رئيسية واحدة تعلمتها'],
    write:['افتح دفترك أو مستند الكتابة','اكتب العنوان الرئيسي بوضوح','اكتب الجملة الأولى — أي جملة لبدء التدفق','أضف بضع تفاصيل وأفكار داعمة','اقرأ ما كتبته حتى الآن بنظرة سريعة','صحح أي أخطاء لغوية أو إملائية'],
    math:['جهّز الورقة والقلم والمسودة','افحص المسألة الأولى وافهم المطلوب','اكتب المعطيات والقانون المناسب','ابدأ الحل الرياضي خطوة بخطوة','تأكد من منطقية وصحة الناتج النهائي','انتقل إلى المسألة التالية بثقة'],
    study:['اجمع ملخصاتك وأوراق المذاكرة','راجع الأفكار والمفاهيم الرئيسية أولاً','أغلق الملخص واختبر نفسك شفهيًا','حدد أي نقطة نسيتها لوضع علامة عليها','أعد مراجعة النقاط التي تحتاج تثبيتًا','خذ استراحة قصيرة مستحقة لتجديد نشاطك'],
    project:['اقرأ متطلبات ومعايير المشروع بعناية','اكتب عصفًا ذهنيًا لعدة أفكار إبداعية','اختر الفكرة الأوضح والأكثر إتقانًا','اجمع المواد والمعلومات التي ستحتاجها','ابدأ في الجزء الأول فورًا دون تردد','واصل إنجاز باقي الأجزاء خطوة بخطوة'],
    default:['جهّز كل ما تحتاجه للبدء في مكان هادئ','حدد أصغر خطوة أولى ممكنة للمهمة','أنجز هذه الخطوة الواحدة فقط الآن','انظر إلى الخطوة التالية وابدأ بها','واصل التقدم خطوة بخطوة بهدوء','راجع ما أنجزته واحتفل بتقدمك']
  };
  const m = isAr ? mAr : mEn;
  let k='default';
  if(t.includes('homework')||t.includes('hw')||t.includes('واجب')||t.includes('حل'))k='homework';
  else if(t.includes('read')||t.includes('book')||t.includes('chapter')||t.includes('قراءة')||t.includes('كتاب')||t.includes('فصل'))k='read';
  else if(t.includes('write')||t.includes('essay')||t.includes('paragraph')||t.includes('story')||t.includes('كتابة')||t.includes('مقال')||t.includes('تعبير'))k='write';
  else if(t.includes('math')||t.includes('calculate')||t.includes('multiply')||t.includes('divide')||t.includes('رياضيات')||t.includes('حساب')||t.includes('مسألة'))k='math';
  else if(t.includes('study')||t.includes('review')||t.includes('memorize')||t.includes('practice')||t.includes('مذاكرة')||t.includes('مراجعة')||t.includes('حفظ'))k='study';
  else if(t.includes('project')||t.includes('poster')||t.includes('presentation')||t.includes('مشروع')||t.includes('بحث'))k='project';
  return[...m[k]];
}

// ======================== I18N & LOCALIZATION SYSTEM ========================
function currentLang() {
  try {
    if (typeof Store !== 'undefined' && Store.get) {
      return Store.get('lang') || 'ar';
    }
  } catch(e) {}
  return 'ar';
}

const I18N = {
  en: {
    appName: 'Spark',
    appFullName: 'Spark — Learning, Focus & Cognitive Platform',
    brandTitle: 'Spark',
    brandSub: 'Learn & Focus',
    nav_dashboard: 'Dashboard',
    nav_focus: 'Focus Lab',
    nav_planner: 'Task Planner',
    nav_schedule: 'Schedule & Timetable',
    nav_wellness: 'Mind & Mood',
    nav_learn: 'Learn & Play',
    nav_science: 'Science Lab',
    nav_calculator: 'Calculator',
    nav_flashcards: 'Flashcards',
    nav_store: 'Store',
    nav_resources: 'Resources',
    nav_progress: 'Progress',
    nav_settings: 'Settings',
    collapse: 'Collapse',
    expand: 'Expand',
    focus_quick: 'Focus',
    sticky_new: 'New Sticky Note',
    sticky_scatter: 'Scatter Notes',
    sticky_stack: 'Cascade Stack',
    sticky_hide: 'Hide All',
    sticky_show: 'Show All',
    welcome_back: 'Welcome back',
    xp_total: 'XP total',
    daily_goal: 'Daily Focus Goal',
    open_planner: 'Open Planner',
    today_schedule: "Today's Timetable & Classes",
    full_schedule: 'Full Timetable',
    quests_title: "Daily Quests",
    all_quests_bonus: "All daily quests done! +50 XP bonus!",
    quest_done: "Quest completed!"
  },
  ar: {
    appName: 'سبارك',
    appFullName: 'سبارك — منصة التعلّم والتركيز والعلوم وإعادة الصياغة الإدراكية',
    brandTitle: 'سبارك',
    brandSub: 'منصة التعلّم والتركيز',
    nav_dashboard: 'لوحة التحكم',
    nav_focus: 'مختبر التركيز',
    nav_planner: 'منظّم المهام',
    nav_schedule: 'الجدول والمواعيد',
    nav_wellness: 'الراحة والمزاج',
    nav_learn: 'تعلّم والعب',
    nav_science: 'مختبر العلوم',
    nav_calculator: 'الآلة الحاسبة',
    nav_flashcards: 'البطاقات التعليمية',
    nav_store: 'المتجر',
    nav_resources: 'مصادر التعلّم',
    nav_progress: 'مستوى التقدم',
    nav_settings: 'الإعدادات',
    collapse: 'طي القائمة',
    expand: 'توسيع القائمة',
    focus_quick: 'تركيز سريع',
    sticky_new: 'ملاحظة لاصقة جديدة',
    sticky_scatter: 'بعثرة الملاحظات',
    sticky_stack: 'ترتيب متتالي',
    sticky_hide: 'إخفاء الكل',
    sticky_show: 'إظهار الكل',
    welcome_back: 'مرحبًا بعودتك',
    xp_total: 'إجمالي نقاط الخبرة',
    daily_goal: 'هدف التركيز اليومي',
    open_planner: 'فتح المنظّم',
    today_schedule: 'جدول الحصص والمواعيد لليوم',
    full_schedule: 'الجدول الكامل',
    quests_title: 'مهام اليوم الإضافية',
    all_quests_bonus: 'أُنجزت مهام اليوم بالكامل! +50 نقطة خبرة!',
    quest_done: 'تم إكمال المهمة!'
  }
};

function t(key, fallback = '') {
  const lang = currentLang();
  if (I18N[lang] && I18N[lang][key] !== undefined) return I18N[lang][key];
  if (I18N['en'] && I18N['en'][key] !== undefined) return I18N['en'][key];
  if (lang === 'ar' && typeof translateString === 'function') {
    return translateString(fallback || key);
  }
  return fallback || key;
}

function setLanguage(lang) {
  if (lang !== 'ar' && lang !== 'en') lang = 'ar';
  Store.set('lang', lang);
  const isAr = lang === 'ar';

  document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', isAr ? 'ar' : 'en');
  if (isAr) {
    document.body.classList.add('rtl');
  } else {
    document.body.classList.remove('rtl');
  }

  const langLabel = document.getElementById('lang-toggle-label');
  if (langLabel) langLabel.textContent = isAr ? 'English' : 'العربية';

  const subEl = document.getElementById('logo-subtitle');
  if (subEl) subEl.textContent = isAr ? 'منصة التعلّم والتركيز' : 'Learn & Focus';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    if (I18N[lang] && I18N[lang][k]) {
      el.textContent = I18N[lang][k];
    }
  });

  document.querySelectorAll('#nav a').forEach(a => {
    const v = a.dataset.view;
    if (VIEW_INFO[v]) {
      const title = isAr && VIEW_INFO[v].titleAr ? VIEW_INFO[v].titleAr : VIEW_INFO[v].title;
      a.setAttribute('data-tooltip', title);
      a.setAttribute('title', title);
    }
  });

  updateCollapseIcons(document.body.classList.contains('sidebar-collapsed'));
  updateTopBar();
  updateUserPanel();
  renderView(currentView);

  if (isAr && typeof localizeDOM === 'function') {
    localizeDOM(document.body);
  }

  toast(isAr ? 'تم تفعيل واجهة سبارك باللغة العربية (RTL)' : 'Spark interface switched to English', 'info');
}

function toggleLanguage() {
  const current = currentLang();
  setLanguage(current === 'ar' ? 'en' : 'ar');
  if (window.SFX && typeof SFX.click === 'function') {
    try { SFX.click(); } catch(e) {}
  }
}
window.setLanguage = setLanguage;
window.toggleLanguage = toggleLanguage;

// ======================== ROUTER & SIDEBAR ========================
let currentView = 'dashboard';
const VN = ['dashboard','focus','planner','schedule','wellness','learn','science','calculator','flashcards','store','resources','progress','settings'];

const VIEW_INFO = {
  dashboard: { title: 'Dashboard', titleAr: 'لوحة التحكم', icon: 'fa-home' },
  focus: { title: 'Focus Lab', titleAr: 'مختبر التركيز', icon: 'fa-bullseye' },
  planner: { title: 'Task Planner', titleAr: 'منظّم المهام', icon: 'fa-list-check' },
  schedule: { title: 'Schedule & Timetable', titleAr: 'الجدول والمواعيد', icon: 'fa-calendar-days' },
  wellness: { title: 'Mind & Mood', titleAr: 'الراحة والمزاج', icon: 'fa-heart-pulse' },
  learn: { title: 'Learn & Play', titleAr: 'تعلّم والعب', icon: 'fa-gamepad' },
  science: { title: 'Science Lab (PhET)', titleAr: 'مختبر العلوم (PhET)', icon: 'fa-flask-vial' },
  calculator: { title: 'Scientific Calculator', titleAr: 'الآلة الحاسبة العلمية', icon: 'fa-calculator' },
  flashcards: { title: 'Flashcards', titleAr: 'البطاقات التعليمية', icon: 'fa-clone' },
  store: { title: 'Store', titleAr: 'المتجر', icon: 'fa-store' },
  resources: { title: 'Resources', titleAr: 'مصادر التعلّم', icon: 'fa-book-open' },
  progress: { title: 'Progress', titleAr: 'مستوى التقدم', icon: 'fa-chart-line' },
  settings: { title: 'Settings', titleAr: 'الإعدادات', icon: 'fa-cog' }
};

function updateTopBar() {
  const isAr = currentLang() === 'ar';
  const info = VIEW_INFO[currentView] || { title: 'Spark', titleAr: 'سبارك', icon: 'fa-bolt' };
  const iconEl = document.getElementById('topbar-view-icon');
  const titleEl = document.getElementById('topbar-view-title');
  if (iconEl) iconEl.innerHTML = `<i class="fas ${info.icon}"></i>`;
  if (titleEl) titleEl.textContent = isAr && info.titleAr ? info.titleAr : info.title;

  const dateEl = document.getElementById('topbar-date');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString(isAr ? 'ar-EG' : undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  const streakEl = document.getElementById('topbar-streak');
  if (streakEl) {
    const s = (typeof Store !== 'undefined' && Store.get('streak')) || 0;
    const streakLabel = isAr ? `${s} يوم متواصل` : `${s}d streak`;
    streakEl.innerHTML = `<i class="fas fa-fire" style="color:var(--accent)"></i> <span>${streakLabel}</span>`;
  }

  const quickBtnText = document.getElementById('topbar-focus-text');
  if (quickBtnText) quickBtnText.textContent = isAr ? 'تركيز سريع' : 'Focus';

  const langLabel = document.getElementById('lang-toggle-label');
  if (langLabel) langLabel.textContent = isAr ? 'English' : 'العربية';
}

let _lastToggleTime = 0;
function toggleSidebarCollapse(e) {
  if (e) {
    if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault && e.type !== 'click') e.preventDefault();
  }
  const now = Date.now();
  if (now - _lastToggleTime < 180) return;
  _lastToggleTime = now;

  const isSmallScreen = window.innerWidth <= 540;
  const sb = document.getElementById('sidebar');
  const bd = document.getElementById('sidebar-backdrop');

  if (isSmallScreen) {
    if (sb) {
      const isOpen = sb.classList.toggle('open');
      if (bd) bd.classList.toggle('active', isOpen);
    }
  } else {
    const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
    try {
      localStorage.setItem('spark_sidebar_collapsed', isCollapsed ? 'true' : 'false');
    } catch(err) {}
    updateCollapseIcons(isCollapsed);
  }
  if (window.SFX && typeof SFX.click === 'function') {
    try { SFX.click(); } catch(err) {}
  }
}

function closeSidebarMobile(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  const sb = document.getElementById('sidebar');
  const bd = document.getElementById('sidebar-backdrop');
  if (sb) sb.classList.remove('open');
  if (bd) bd.classList.remove('active');
}

function updateCollapseIcons(isCollapsed) {
  const isAr = currentLang() === 'ar';
  const collapseIcon = document.getElementById('sidebar-collapse-icon');
  const footerIcon = document.getElementById('sidebar-footer-icon');
  const footerText = document.querySelector('.footer-btn-text');
  const collapseBtn = document.getElementById('sidebar-collapse-btn');
  const topbarBtn = document.getElementById('topbar-toggle-btn');
  const footerBtn = document.getElementById('sidebar-footer-toggle');

  if (collapseIcon) {
    if (isAr) {
      collapseIcon.className = isCollapsed ? 'fas fa-chevron-left' : 'fas fa-chevron-right';
    } else {
      collapseIcon.className = isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
    }
  }
  const expandLabel = isAr ? 'توسيع القائمة' : 'Expand sidebar';
  const collapseLabel = isAr ? 'طي القائمة' : 'Collapse sidebar';

  if (collapseBtn) {
    collapseBtn.setAttribute('title', isCollapsed ? `${expandLabel} (Ctrl+B)` : `${collapseLabel} (Ctrl+B)`);
    collapseBtn.setAttribute('aria-label', isCollapsed ? expandLabel : collapseLabel);
  }
  if (footerIcon) {
    if (isAr) {
      footerIcon.className = isCollapsed ? 'fas fa-angles-left' : 'fas fa-angles-right';
    } else {
      footerIcon.className = isCollapsed ? 'fas fa-angles-right' : 'fas fa-angles-left';
    }
  }
  if (footerBtn) {
    footerBtn.setAttribute('title', isCollapsed ? `${expandLabel} (Ctrl+B)` : `${collapseLabel} (Ctrl+B)`);
    footerBtn.setAttribute('aria-label', isCollapsed ? expandLabel : collapseLabel);
  }
  if (footerText) {
    footerText.textContent = isCollapsed ? (isAr ? 'توسيع' : 'Expand') : (isAr ? 'طي' : 'Collapse');
  }
  if (topbarBtn) {
    topbarBtn.setAttribute('title', isCollapsed ? `${expandLabel} (Ctrl+B)` : `${collapseLabel} (Ctrl+B)`);
  }
}
window.toggleSidebarCollapse = toggleSidebarCollapse;
window.closeSidebarMobile = closeSidebarMobile;

function navigate(v) {
  if (!VN.includes(v)) return;
  currentView = v;
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('active', a.dataset.view === v));
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  const viewEl = document.getElementById('view-' + v);
  if (viewEl) viewEl.classList.add('active');
  renderView(v);
  closeSidebarMobile();
  updateTopBar();
  if (v !== 'focus') cleanupFocus();
  if (v !== 'learn') stopGame();
  if (v !== 'flashcards') cleanupFlash();
  if (v !== 'wellness') cleanupBreathing();
}

function renderView(v) {
  ({
    dashboard: renderDashboard,
    focus: renderFocus,
    planner: renderPlanner,
    schedule: renderSchedule,
    wellness: renderWellness,
    learn: renderLearn,
    science: renderScience,
    calculator: renderCalculator,
    flashcards: renderFlashcards,
    store: renderStore,
    resources: renderResources,
    progress: renderProgress,
    settings: renderSettings
  })[v]?.();

  if (currentLang() === 'ar' && typeof window.localizeDOM === 'function') {
    window.localizeDOM(document.getElementById('view-' + v));
  }
}

// ======================== USER PANEL ========================
function updateUserPanel() {
  const u = Store.get('user'), inv = Store.get('inventory'), p = document.getElementById('user-panel');
  if (!u) { if (p) p.innerHTML = ''; return; }
  const s = Store.get('streak') || 0;
  const isAr = currentLang() === 'ar';
  const av = CATALOG.avatars.find(a => a.id === inv.equipped.avatar) || CATALOG.avatars[0];
  const safeName = String(u.name || 'Student').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const gradeLabel = isAr && window.GRADE_NAMES_AR && window.GRADE_NAMES_AR[u.grade] ? window.GRADE_NAMES_AR[u.grade] : `Grade ${u.grade}`;
  const streakText = isAr ? `${s} يوم متواصل` : `${s} day streak`;
  if (p) {
    p.innerHTML = `<div class="user-panel-inner" style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <div style="width:36px;height:36px;border-radius:50%;background:${u.color};display:flex;align-items:center;justify-content:center;font-size:15px;color:#fff;flex-shrink:0;">
        <i class="fas ${av.icon}"></i>
      </div>
      <div class="user-info">
        <div style="font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px;">${safeName}</div>
        <div style="font-size:12px;color:var(--text2)">${gradeLabel}</div>
      </div>
    </div>
    <div class="streak-badge" title="${streakText}">
      <i class="fas fa-fire"></i>
      <span class="streak-text">${streakText}</span>
    </div>`;
  }
  updateTopBar();
}

// ======================== QUEST SYSTEM ========================
function getTodayQuests(){const t=new Date().toDateString();let q=Store.get('quests')[t];if(!q){q={focus:false,game:false,resource:false};const qs=Store.get('quests');qs[t]=q;Store.set('quests',qs);}return q;}
function completeQuest(type){const t=new Date().toDateString(),qs=Store.get('quests');if(!qs[t])qs[t]={focus:false,game:false,resource:false};if(!qs[t][type]){qs[t][type]=true;Store.set('quests',qs);const c=Object.values(qs[t]).filter(Boolean).length;if(c===3){Store.addXP(50);toast('All daily quests done! +50 XP bonus!','success');}else toast('Quest completed!','success');}}

// ======================== THOUGHT DUMP ========================
function dumpThought(){const inp=document.getElementById('thought-input');if(!inp)return;const text=inp.value.trim();if(!text)return;inp.value='';const thoughts=Store.get('thoughts');thoughts.unshift({text,date:new Date().toISOString()});if(thoughts.length>100)thoughts.length=100;Store.set('thoughts',thoughts);const area=document.getElementById('thought-float-area');if(area){const b=document.createElement('div');b.className='thought-bubble';b.textContent=text;area.appendChild(b);setTimeout(()=>b.remove(),1500);}SFX.whoosh();setTimeout(()=>inp.focus(),50);}
document.addEventListener('keydown',e=>{if(e.target.id==='thought-input'&&e.key==='Enter'){e.preventDefault();dumpThought();}});

// ======================== DASHBOARD ========================
function renderDashboard(){
  const u=Store.get('user');if(!u)return;Store.updateStreak();updateUserPanel();
  const isArDash = typeof currentLang === 'function' && currentLang() === 'ar';
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
    <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:28px">
      <div>
        <h1 style="font-size:28px;font-weight:700;margin-bottom:4px">${isArDash ? `مرحباً بعودتك، ${escHtml(u.name)}` : `Welcome back, ${escHtml(u.name)}`}</h1>
        <p style="color:var(--text2);font-size:15px">${isArDash ? 'إليك جدولك ومهامك لليوم. اختر شيئاً واحداً فقط وابدأ به بهدوء.' : "Here's what's on your plate today. Just pick one thing to start."}</p>
      </div>
      <div class="tag" style="background:rgba(255,140,66,.12);color:var(--accent);font-size:14px;padding:6px 14px">
        <i class="fas fa-bolt"></i> ${Store.get('totalXP')} ${isArDash ? 'مجموع نقاط XP' : 'XP total'}
      </div>
    </div>

    <!-- Daily Goal & Active Tasks Widget -->
    <div class="card" style="margin-bottom:24px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
        <h3 style="font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-list-check" style="color:var(--teal);"></i> ${isArDash ? 'مخطط المهام والهدف اليومي' : 'Task Planner & Daily Goal'}
        </h3>
        <button class="btn btn-sm btn-ghost" onclick="navigate('planner')" style="font-size:12px;border:1px solid var(--border);">
          ${isArDash ? 'فتح المخطط' : 'Open Planner'} <i class="fas ${isArDash ? 'fa-arrow-left' : 'fa-arrow-right'}"></i>
        </button>
      </div>

      <!-- Goal Mini Progress Bar -->
      <div style="margin-bottom:16px;padding:12px 14px;background:var(--bg);border-radius:10px;">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;">
          <span style="font-weight:700;">${isArDash ? 'هدف التركيز اليومي' : 'Daily Focus Goal'}</span>
          <span style="color:var(--teal);font-weight:700;">${ttf} / ${dailyGoal} ${isArDash ? 'دقيقة' : 'mins'} (${goalPct}%)</span>
        </div>
        <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden;">
          <div style="height:100%;width:${goalPct}%;background:var(--teal);border-radius:3px;transition:width 0.4s ease;"></div>
        </div>
      </div>

      <!-- Quick Tasks -->
      ${!activeTasks.length?`
        <div style="text-align:center;padding:12px;color:var(--text2);font-size:13px;">
          ${isArDash ? 'لا توجد مهام نشطة حالياً.' : 'No active tasks right now.'} <button class="btn btn-sm btn-teal" onclick="showAddTaskModal()" style="margin-${isArDash ? 'right' : 'left'}:8px;"><i class="fas fa-plus"></i> ${isArDash ? 'إضافة مهمة' : 'Add a Task'}</button>
        </div>
      `:`
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${activeTasks.slice(0,3).map(t=>`
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;background:var(--bg);border-radius:10px;">
              <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(t.title)}</div>
                <div style="font-size:12px;color:var(--text2);">${t.category||'Personal'} &middot; ~${t.estMin}m &middot; ${t.steps?t.steps.filter(st=>st.done).length:0}/${t.steps?t.steps.length:0} steps</div>
              </div>
              <button class="btn btn-sm btn-teal" onclick="launchFocusForTask('${t.id}')"><i class="fas fa-play"></i> ${isArDash ? 'تركيز' : 'Focus'}</button>
            </div>
          `).join('')}
        </div>
      `}
    </div>

    <!-- Today's Schedule & Timetable Card -->
    <div class="card" style="margin-bottom:24px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
        <h3 style="font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-calendar-day" style="color:var(--accent);"></i> ${isArDash ? 'جدول الحصص والدروس اليومية' : "Today's Timetable & Classes"}
        </h3>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-sm btn-teal" onclick="navigate('schedule')" style="font-size:12px;">
            ${isArDash ? 'الجدول الكامل' : 'Full Timetable'} <i class="fas ${isArDash ? 'fa-arrow-left' : 'fa-arrow-right'}"></i>
          </button>
        </div>
      </div>

      ${(todayEvents.length === 0 && todayScheduledTasks.length === 0) ? `
        <div style="text-align:center;padding:12px;color:var(--text2);font-size:13px;">
          ${isArDash ? 'لا توجد حصص أو مهام دراسية مجدولة لهذا اليوم.' : 'No classes or scheduled study tasks today.'}
          <button class="btn btn-sm btn-teal" onclick="navigate('schedule')" style="margin-${isArDash ? 'right' : 'left'}:8px;"><i class="fas fa-calendar-plus"></i> ${isArDash ? 'فتح الجدول' : 'Open Schedule'}</button>
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
              <button class="btn btn-sm btn-teal" onclick="launchFocusForTask('${t.id}')"><i class="fas fa-play"></i> ${isArDash ? 'تركيز' : 'Focus'}</button>
            </div>
          `).join('')}
        </div>
      `}
    </div>

    <!-- Mind & Mood Wellness Card -->
    ${(() => {
      return `
      <div class="card card-glow" style="margin-bottom:24px; background:linear-gradient(135deg, var(--card) 0%, rgba(78,205,196,0.08) 100%);">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:12px;">
          <h3 style="font-size:16px; font-weight:700; display:flex; align-items:center; gap:8px;">
            <i class="fas fa-heart-pulse" style="color:var(--teal);"></i> ${isArDash ? 'تفقّد المزاج والراحة النفسية' : 'Mind & Emotional Health Check-In'}
          </h3>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-sm btn-ghost" onclick="wellnessTab='reframes'; setCbtSubTab('worksheet'); navigate('wellness');" style="border:1px solid var(--border); font-size:12px;">
              <i class="fas fa-brain" style="color:var(--teal);"></i> ${isArDash ? 'إعادة الصياغة الإدراكية' : 'CBT Reframing'}
            </button>
            <button class="btn btn-sm btn-teal" onclick="navigate('wellness')" style="font-size:12px;">
              ${isArDash ? 'واحة الراحة والمزاج' : 'Wellness Hub'} <i class="fas ${isArDash ? 'fa-arrow-left' : 'fa-arrow-right'}"></i>
            </button>
          </div>
        </div>
        <p style="font-size:13px; color:var(--text2); margin-bottom:14px;">${isArDash ? 'كيف تشعر في هذه اللحظة؟ تخصيص 30 ثانية لتفقّد مشاعرك يقلل التوتر ويزيد التركيز.' : 'How are you feeling right now? Taking 30 seconds to check in helps reduce task anxiety.'}</p>
        <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:4px;" class="no-scrollbar">
          <button class="preset-chip" onclick="quickLogMood('great')"><span>🌟 ${isArDash ? 'رائع' : 'Great'}</span></button>
          <button class="preset-chip" onclick="quickLogMood('calm')"><span>🌿 ${isArDash ? 'هادئ' : 'Calm'}</span></button>
          <button class="preset-chip" onclick="quickLogMood('focused')"><span>🎯 ${isArDash ? 'مُركّز' : 'Focused'}</span></button>
          <button class="preset-chip" onclick="quickLogMood('low_energy')"><span>🔋 ${isArDash ? 'طاقة منخفضة' : 'Low Energy'}</span></button>
          <button class="preset-chip" onclick="quickLogMood('overwhelmed')"><span>😫 ${isArDash ? 'مُثقَل / مشتت' : 'Overwhelmed'}</span></button>
          <button class="preset-chip" onclick="quickLogMood('anxious')"><span>😰 ${isArDash ? 'قلق ومتوتر' : 'Anxious'}</span></button>
        </div>
      </div>
      `;
    })()}

    <div class="card" style="margin-bottom:24px"><h3 style="font-size:16px;margin-bottom:14px;display:flex;align-items:center;gap:8px"><i class="fas fa-scroll" style="color:var(--accent)"></i> ${isArDash ? 'المهام والتحديات اليومية' : 'Daily Quests'}</h3><div style="display:flex;flex-direction:column;gap:8px">${[
      {k:'focus',t:isArDash ? 'إكمال جلسة تركيز' : 'Complete a focus session',d:isArDash ? 'حتى 10 دقائق تصنع فارقاً حقيقياً' : 'Even 10 minutes counts',l:isArDash ? 'ابدأ' : 'Start',v:'focus'},
      {k:'game',t:isArDash ? 'لعب لعبة تعليمية' : 'Play a learning game',d:isArDash ? 'الممارسة المستمرة سر التقدّم' : 'Practice makes progress',l:isArDash ? 'العب' : 'Play',v:'learn'},
      {k:'resource',t:isArDash ? 'استكشاف مصادر التعلّم' : 'Explore a resource',d:isArDash ? 'اكتشف محتوى جديداً ومفيداً لدراستك' : 'Find something new to learn from',l:isArDash ? 'استكشف' : 'Explore',v:'resources'}
    ].map(qi=>`<div class="quest-item ${getTodayQuests()[qi.k]?'completed':''}" onclick="${getTodayQuests()[qi.k]?'':`navigate('${qi.v}')`}"><div class="quest-check">${getTodayQuests()[qi.k]?'<i class="fas fa-check" style="font-size:12px"></i>':''}</div><div><div style="font-weight:700;font-size:14px">${qi.t}</div><div style="font-size:12px;color:var(--text2)">${qi.d}</div></div>${getTodayQuests()[qi.k]?'':`<div style="margin-${isArDash?'right':'left'}:auto"><span class="btn btn-sm btn-primary">${qi.l}</span></div>`}</div>`).join('')}</div></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px">
      <div class="card card-glow" style="cursor:pointer" onclick="navigate('focus')"><div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><div style="width:44px;height:44px;border-radius:12px;background:var(--teal-g);display:flex;align-items:center;justify-content:center"><i class="fas fa-bullseye" style="color:var(--teal);font-size:18px"></i></div><div><div style="font-weight:700;font-size:15px">${isArDash ? 'مختبر التركيز' : 'Focus Lab'}</div><div style="font-size:12px;color:var(--text2)">${ttf>0?(isArDash?`${ttf} دقيقة منجزة اليوم`:`${ttf}m done today`):(isArDash?'ابدأ جلستك الأولى':'Start your first session')}</div></div></div><div class="btn btn-teal btn-sm" style="width:100%;justify-content:center">${isArDash ? '10 دقائق فقط' : 'Just 10 Minutes'} <i class="fas ${isArDash ? 'fa-arrow-left' : 'fa-arrow-right'}"></i></div></div>
      <div class="card" style="cursor:pointer" onclick="navigate('learn')"><div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><div style="width:44px;height:44px;border-radius:12px;background:rgba(255,140,66,.12);display:flex;align-items:center;justify-content:center"><i class="fas fa-gamepad" style="color:var(--accent);font-size:18px"></i></div><div><div style="font-weight:700;font-size:15px">${isArDash ? 'مغامرة الرياضيات' : 'Math Adventure'}</div><div style="font-size:12px;color:var(--text2)">${isArDash ? 'المرحلة الابتدائية (1–6)' : 'Primary (Grades 1–6)'}</div></div></div><div class="btn btn-primary btn-sm" style="width:100%;justify-content:center">${isArDash ? 'العب الآن' : 'Play Now'} <i class="fas ${isArDash ? 'fa-arrow-left' : 'fa-arrow-right'}"></i></div></div>
      <div class="card" style="cursor:pointer" onclick="navigate('calculator')"><div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><div style="width:44px;height:44px;border-radius:12px;background:rgba(78,205,196,.12);display:flex;align-items:center;justify-content:center"><i class="fas fa-calculator" style="color:var(--teal);font-size:18px"></i></div><div><div style="font-weight:700;font-size:15px">${isArDash ? 'الآلة الحاسبة' : 'Calculator'}</div><div style="font-size:12px;color:var(--text2)">${isArDash ? 'بيانية وعلمية متطورة' : 'GeoGebra & Scientific'}</div></div></div><div class="btn btn-teal btn-sm" style="width:100%;justify-content:center">${isArDash ? 'احسب الآن' : 'Calculate'} <i class="fas ${isArDash ? 'fa-arrow-left' : 'fa-arrow-right'}"></i></div></div>
      <div class="card" style="cursor:pointer" onclick="navigate('flashcards')"><div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><div style="width:44px;height:44px;border-radius:12px;background:rgba(88,166,255,.12);display:flex;align-items:center;justify-content:center"><i class="fas fa-clone" style="color:var(--blue);font-size:18px"></i></div><div><div style="font-weight:700;font-size:15px">${isArDash ? 'البطاقات التعليمية' : 'Flashcards'}</div><div style="font-size:12px;color:var(--text2)">${isArDash ? 'مراجعة بالتكرار المتباعد' : 'Spaced repetition review'}</div></div></div><div class="btn btn-sm btn-secondary" style="width:100%;justify-content:center">${isArDash ? 'ذاكر الآن' : 'Study'} <i class="fas ${isArDash ? 'fa-arrow-left' : 'fa-arrow-right'}"></i></div></div>
      <div class="card" style="cursor:pointer" onclick="navigate('store')"><div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><div style="width:44px;height:44px;border-radius:12px;background:rgba(216,180,254,.12);display:flex;align-items:center;justify-content:center"><i class="fas fa-store" style="color:#D8B4FE;font-size:18px"></i></div><div><div style="font-weight:700;font-size:15px">${isArDash ? 'المتجر' : 'Store'}</div><div style="font-size:12px;color:var(--text2)">${isArDash ? 'أنفق نقاط خبرتك وتسوّق' : 'Spend your XP'}</div></div></div><div class="btn btn-sm" style="width:100%;justify-content:center;border:1px solid var(--text2);background:transparent">${isArDash ? 'تسوّق الآن' : 'Shop'} <i class="fas ${isArDash ? 'fa-arrow-left' : 'fa-arrow-right'}"></i></div></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px">
      <div class="card stat-card"><div class="stat-num" style="color:var(--teal)">${tfm}m</div><div class="stat-label">${isArDash ? 'دقائق التركيز هذا الأسبوع' : 'Focus this week'}</div></div>
      <div class="card stat-card"><div class="stat-num" style="color:var(--accent)">${wxp}</div><div class="stat-label">${isArDash ? 'نقاط XP هذا الأسبوع' : 'XP this week'}</div></div>
      <div class="card stat-card"><div class="stat-num" style="color:var(--green)">${ws.length}</div><div class="stat-label">${isArDash ? 'جلسات مكتملة' : 'Sessions'}</div></div>
      <div class="card stat-card"><div class="stat-num" style="color:var(--blue)">${wg.length}</div><div class="stat-label">${isArDash ? 'ألعاب ملعوبة' : 'Games played'}</div></div>
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
function startPauseReminder(){
  stopPauseReminder();
  pauseReminderTO=setTimeout(()=>{
    const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
    const PAUSE_MSGS_AR = [
      {t:"هل ما زلت هنا؟",b:"دعنا ننهي هذه الخطوة الأخيرة لتأخذ استراحة مريحة وهانئة دون أي شعور بالذنب."},
      {t:"مرحباً بعودتك",b:"شرد ذهنك قليلاً — وهذا طبيعي ومفهوم تماماً. خطوة واحدة متبقية ثم ترتاح فعلاً."},
      {t:"تفقد سريع ولطيف",b:"أصعب جزء أنجزته بالفعل — لقد بدأت! دعنا نتجاوز هذه الخطوة معاً."},
      {t:"أنت تبلي بلاءً رائعاً",b:"التوقف المؤقت ثم العودة هو مهارة حقيقية بحد ذاتها. لنكمل ما بدأناه."},
      {t:"تذكير خفيف ولطيف",b:"قد يبحث عقلك عن شيء أسهل الآن، وهذا طبيعي. لكنك ستشعر براحة وفخر أكبر عند إتمام الخطوة."},
      {t:"لفتة صغيرة",b:"لست مضطراً لفعل كل شيء دفعة واحدة — ركّز على هذه الخطوة الصغيرة التالية فقط."},
      {t:"معك خطوة بخطوة",b:"من الطبيعي أن تتوقف لحظات. المهم دائماً أنك تعود. هل أنت مستعد لخطوة أخرى؟"}
    ];
    const pool = isAr ? PAUSE_MSGS_AR : PAUSE_MSGS;
    const m = pool[Math.floor(Math.random()*pool.length)];
    SFX.nudge();
    showModal(`
      <div class="nudge-pulse" style="text-align:center;border-radius:16px;padding:8px">
        <div style="font-size:40px;margin-bottom:12px"><i class="fas fa-hand-holding-heart" style="color:var(--teal)"></i></div>
        <h2 style="font-size:20px;margin-bottom:6px">${m.t}</h2>
        <p style="color:var(--text2);margin-bottom:20px;line-height:1.5">${m.b}</p>
        <div style="display:flex;gap:10px;justify-content:center">
          <button class="btn btn-secondary" onclick="closeModal();focusState.phase='setup';navigate('focus')">${isAr ? 'سأكتفي بهذا القدر الآن' : "I'm done for now"}</button>
          <button class="btn btn-teal" onclick="closeModal();resumeFocus()"><i class="fas fa-play"></i> ${isAr ? 'هيا لنواصل معاً' : "Let's keep going"}</button>
        </div>
      </div>
    `);
  },120000+Math.random()*30000);
}
function stopPauseReminder(){if(pauseReminderTO){clearTimeout(pauseReminderTO);pauseReminderTO=null;}}
function scheduleFocusXP(){
  if(focusXPTO)clearTimeout(focusXPTO);
  focusXPTO=setTimeout(()=>{
    if(!focusState.running||focusState.phase!=='active')return;
    const a=2+Math.floor(Math.random()*4);
    Store.addXP(a);
    const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
    toast(isAr ? `+${a} نقطة خبرة لمواصلة التركيز!` : `+${a} XP for staying focused`,'bonus');
    SFX.click();
    scheduleFocusXP();
  },45000+Math.random()*60000);
}

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
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';

  const PRESET_NAMES_AR = {
    p_pomo: 'بومودورو كلاسيكي',
    p_deep: 'عمل عميق ومركز',
    p_adhd: 'سباق تركيز ADHD',
    p_burst: 'انطلاقة خاطفة'
  };

  const quickTasks = isAr 
    ? ['حل واجب الرياضيات', 'قراءة فصل دراسي', 'كتابة واجب تعبير', 'المذاكرة للاختبار', 'مراجعة الكلمات والمسائل']
    : ['Do math homework','Read a chapter','Write an assignment','Study for a test','Practice spelling'];

  const placeholderText = isAr 
    ? 'مثال: حل واجب الرياضيات، قراءة الفصل الثالث...'
    : 'e.g. Do math homework, Read chapter 3...';

  return`<h1 style="font-size:26px;font-weight:700;margin-bottom:6px">${isAr ? 'مختبر التركيز' : 'Focus Lab'}</h1>
    <p style="color:var(--text2);margin-bottom:28px">${isAr ? 'أصعب خطوة هي البداية دائماً. سنجعلها أسهل وأبسط ما يمكن.' : "The hardest part is starting. We'll make it as easy as possible."}</p>

    <!-- Presets & Interval Schedules -->
    <div class="card" style="margin-bottom:20px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <label style="font-weight:700;font-size:14px;"><i class="fas fa-sliders" style="color:var(--teal);"></i> ${isAr ? 'قوالب التركيز وجداول الفترات' : 'Focus Presets & Interval Schedules'}</label>
        <button class="btn btn-sm btn-ghost" onclick="showCreatePresetModal()" style="font-size:11px;border:1px solid var(--border);color:var(--teal);"><i class="fas fa-plus"></i> ${isAr ? 'قالب مخصص' : 'Custom Preset'}</button>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:6px;">
        ${presets.map(p=>{
          const isSel=s.focusDuration===p.focusMin && s.breakDuration===p.breakMin;
          const pName = isAr && PRESET_NAMES_AR[p.id] ? PRESET_NAMES_AR[p.id] : p.name;
          const unit = isAr ? 'د' : 'm';
          return`
            <div class="preset-chip ${isSel?'active':''}" onclick="applyFocusPreset('${p.id}')">
              <i class="fas ${p.icon||'fa-clock'}"></i>
              <span>${pName} (${p.focusMin}/${p.breakMin}${unit})</span>
              ${p.custom?`<i class="fas fa-times" style="font-size:10px;margin-left:4px;opacity:0.6;" onclick="event.stopPropagation();deleteCustomPreset('${p.id}');"></i>`:''}
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Active Tasks Picker from Planner -->
    ${tasks.length?`
      <div class="card" style="margin-bottom:20px;background:var(--bg);">
        <label style="font-weight:700;font-size:13px;color:var(--text2);display:block;margin-bottom:8px;"><i class="fas fa-list-check" style="color:var(--teal);"></i> ${isAr ? 'اختر مهمة نشطة من منظّم المهام:' : 'Pick an Active Task from your Planner:'}</label>
        <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;" class="no-scrollbar">
          ${tasks.map(t=>`
            <button class="btn btn-sm btn-ghost" onclick="launchFocusForTask('${t.id}')" style="border:1px solid var(--border);font-size:12px;white-space:nowrap;background:var(--card);">
              <i class="fas fa-bullseye" style="color:var(--teal);"></i> ${escHtml(t.title)} (${t.estMin}${isAr ? ' د' : 'm'})
            </button>
          `).join('')}
        </div>
      </div>
    `:''}

    <div class="card" style="margin-bottom:20px">
      <label style="font-weight:700;font-size:14px;display:block;margin-bottom:8px">${isAr ? 'ما الذي تريد إنجازه والتركيز عليه الآن؟' : 'What do you need to do?'}</label>
      <input type="text" class="input" id="focus-task-input" placeholder="${placeholderText}" style="margin-bottom:12px">
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${quickTasks.map(t=>`<button class="btn btn-sm btn-ghost" style="border:1px solid var(--border);font-size:12px" onclick="document.getElementById('focus-task-input').value='${t}';document.getElementById('focus-task-input').dispatchEvent(new Event('input'));SFX.click()">${t}</button>`).join('')}
      </div>
    </div>
    
    <div class="card" style="margin-bottom:20px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <label style="font-weight:700;font-size:14px">${isAr ? 'سنقسم المهمة إلى خطوات صغيرة ومحددة' : "We'll break it into small steps"}</label>
        <span style="font-size:12px;color:var(--text2)">${isAr ? '(يمكنك التعديل عليها بحرية)' : '(edit if you want)'}</span>
      </div>
      <div id="steps-list">
        <div style="color:var(--text2);font-size:14px;padding:8px 0">${isAr ? 'اكتب المهمة في الأعلى لرؤية الخطوات المقترحة...' : 'Type a task above to see the steps...'}</div>
      </div>
    </div>

    <div class="card" style="margin-bottom:24px">
      <label style="font-weight:700;font-size:14px;display:block;margin-bottom:12px">${isAr ? 'مدة جلسة التركيز' : 'Session length'}</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${[5,10,15,20,25,30,45,60].map(m=>`<button class="grade-pill ${m===s.focusDuration?'selected':''}" onclick="Store.get('settings').focusDuration=${m};Store.save();SFX.click();renderFocus()">${m} ${isAr ? 'دقيقة' : 'min'}</button>`).join('')}
      </div>
      <p style="font-size:12px;color:var(--text2);margin-top:8px">
        <i class="fas fa-lightbulb" style="color:var(--accent)"></i> ${isAr 
          ? `نظام الفترات الحالي: ${s.focusDuration} دقيقة تركيز / ${s.breakDuration||3} دقيقة استراحة.` 
          : `Current interval schedule: ${s.focusDuration}m focus / ${s.breakDuration||3}m break.`}
      </p>
    </div>

    <div style="text-align:center">
      <button class="btn btn-lg btn-teal" onclick="startFocusSession()">
        <i class="fas fa-play"></i> ${isAr ? `ابدأ الآن فقط — ${s.focusDuration} دقيقة` : `Just Start — ${s.focusDuration} Minutes`}
      </button>
      <p style="font-size:13px;color:var(--text2);margin-top:10px">
        ${isAr ? 'هذا كل شيء! دون تعقيد أو حيرة في التخطيط. ابدأ فوراً.' : "That's it. No setup, no planning paralysis. Just start."}
      </p>
    </div>

    ${rt.length?`
      <div style="margin-top:32px">
        <h3 style="font-size:15px;color:var(--text2);margin-bottom:12px">${isAr ? 'جلسات التركيز الأخيرة' : 'Recent sessions'}</h3>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${rt.map(s=>`
            <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--card);border-radius:10px;font-size:13px">
              <i class="fas ${s.completed?'fa-check-circle':'fa-clock'}" style="color:${s.completed?'var(--green)':'var(--text2)'}"></i>
              <span style="flex:1">${escHtml(s.task)}</span>
              <span style="color:var(--text2)">${s.duration}${isAr ? ' د' : 'm'}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `:''}
  `;
}

function renderFocusActive(){
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const m=Math.floor(focusState.seconds/60),s=focusState.seconds%60,ts=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

  if(focusState.mode==='break'){
    return`
      <div style="max-width:550px;margin:30px auto 0;text-align:center;">
        <div class="card" style="padding:32px 24px;border-color:var(--teal);">
          <div class="breathe-ring">
            <i class="fas fa-leaf" style="font-size:36px;color:var(--teal);"></i>
          </div>
          <h2 style="font-size:24px;font-weight:700;margin-bottom:6px;">${isAr ? 'استراحة لتجديد النشاط والراحة' : 'Rest & Recharge Break'}</h2>
          <p style="color:var(--text2);font-size:14px;margin-bottom:20px;">
            ${isAr ? 'عمل رائع ومتقن! ابتعد عن الشاشة قليلاً، تمطط، خذ 3 أنفاس عميقة واشرب بعض الماء.' : 'Great work! Step away from your screen, stretch your back, take 3 deep breaths, or grab water.'}
          </p>
          <div style="font-family:Fredoka;font-size:52px;font-weight:700;color:var(--teal);margin-bottom:24px;" id="focus-time-display">
            ${ts}
          </div>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
            <button class="btn btn-teal" onclick="skipBreakToFocus()"><i class="fas fa-play"></i> ${isAr ? `فترة التركيز التالية (${Store.get('settings').focusDuration} د)` : `Next Focus Interval (${Store.get('settings').focusDuration}m)`}</button>
            <button class="btn btn-secondary" onclick="confirmEndSession()"><i class="fas fa-flag-checkered"></i> ${isAr ? 'إنهاء الجلسة' : 'Finish Session'}</button>
          </div>
        </div>
      </div>
    `;
  }

  const p=focusState.totalSeconds>0?((focusState.totalSeconds-focusState.seconds)/focusState.totalSeconds)*100:0;
  const ratio=focusState.totalSeconds>0?(focusState.seconds/focusState.totalSeconds):1;
  const el=focusState.totalSeconds-focusState.seconds;
  let es = '';
  if (isAr) {
    es = el >= 60 ? `${Math.floor(el / 60)} دقيقة` : `${el} ثانية`;
  } else {
    es = el>=60?Math.floor(el/60)+' minute'+(Math.floor(el/60)>1?'s':''):el+' seconds';
  }
  const comp=Store.get('inventory').equipped.companion;
  const equippedTimer=Store.get('inventory').equipped.timer||'classic';

  const phaseLabel = focusState.running 
    ? (isAr ? 'واصل التركيز بثبات...' : 'Stay focused...') 
    : (isAr ? 'موقوف مؤقتاً' : 'Paused');

  const distractLabel = isAr 
    ? (focusState.distractions === 0 ? 'لا يوجد تشتت' : focusState.distractions === 1 ? 'تشتت واحد' : `${focusState.distractions} تشتتات`)
    : `${focusState.distractions} distraction${focusState.distractions!==1?'s':''}`;

  const elapsedText = isAr ? `مضى ${es} &middot; ${distractLabel}` : `${es} in &middot; ${distractLabel}`;

  return`<div style="display:flex;gap:32px;align-items:flex-start;flex-wrap:wrap"><div style="flex:1;min-width:300px">
    <div style="text-align:center;margin-bottom:20px">
      <div style="display:flex;justify-content:center;margin-bottom:24px">
        <div class="visual-timer-container" style="position:relative; width:220px; height:220px; display:flex; align-items:center; justify-content:center;">
          <div id="visual-timer-svg" style="position:absolute; inset:0; z-index:1;">
            ${getTimerSVG(equippedTimer, ratio)}
          </div>
          <div style="text-align:center; position:relative; z-index:2; pointer-events:none;">
            <div style="font-family:Fredoka;font-size:42px;font-weight:700;color:var(--text); line-height:1.1;" id="focus-time-display">${ts}</div>
            <div style="font-size:12px;color:var(--text2)" id="focus-phase-label">${phaseLabel}</div>
          </div>
        </div>
      </div>
    <div style="max-width:400px;margin:0 auto 20px;height:6px;background:var(--border);border-radius:3px;overflow:hidden"><div style="height:100%;background:linear-gradient(90deg,var(--teal),var(--green));border-radius:3px;transition:width .5s;width:${p}%"></div></div>
    <div style="font-weight:700;font-size:18px;margin-bottom:4px">${escHtml(focusState.task)}</div><div style="font-size:13px;color:var(--text2)">${elapsedText}</div></div>
    ${Ambient.renderSoundscapeCard()}
    <div class="card" style="margin-bottom:16px"><div style="font-weight:700;font-size:14px;margin-bottom:12px">${isAr ? 'خطواتك المحددة' : 'Your steps'}</div><div style="display:flex;flex-direction:column;gap:4px">${focusState.steps.map((st,i)=>{let c=i<focusState.currentStep?'done-step':i===focusState.currentStep?'active-step':'';return`<div class="step-item ${c}"><div class="step-num">${i<focusState.currentStep?'<i class="fas fa-check" style="font-size:10px"></i>':i+1}</div><span>${escHtml(st)}</span></div>`;}).join('')}</div></div>
    <div class="card" style="margin-bottom:16px;position:relative;overflow:visible">
      <div style="font-weight:700;font-size:13px;color:var(--text2);margin-bottom:8px;display:flex;align-items:center;gap:6px">
        <i class="fas fa-cloud" style="color:var(--teal)"></i> ${isAr ? 'تفريغ الأفكار العابرة (Thought Dump)' : 'Thought Dump'} 
        <span style="font-weight:400;font-size:11px;color:var(--text2)">${isAr ? '— عقلك مشتت؟ أفرغ الفكرة هنا وتخلص من تشويشها فوراً.' : '— brain going wild? Park it here and let it go.'}</span>
      </div>
      <div style="display:flex;gap:8px">
        <input class="input" id="thought-input" placeholder="${isAr ? 'اكتب الفكرة المشوشة واضغط Enter لتحرير عقلك منها...' : 'Type the thought, hit Enter to release it...'}" style="font-size:13px">
        <button class="btn btn-sm btn-ghost" onclick="dumpThought()" style="border:1px solid var(--border);flex-shrink:0;color:var(--teal)"><i class="fas fa-arrow-up"></i></button>
      </div>
      <div id="thought-float-area" style="position:relative;height:0;overflow:visible"></div>
    </div>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:20px">
      <button class="btn btn-ghost" onclick="logDistraction()" style="border:1px solid var(--border);color:var(--accent)"><i class="fas fa-arrow-right-from-bracket"></i> ${isAr ? 'تشتت انتباهي' : 'I got distracted'}</button>
      <button class="btn btn-ghost" onclick="advanceStep()"><i class="fas fa-arrow-down"></i> ${isAr ? 'الخطوة التالية' : 'Next step'}</button>
      ${focusState.running?`<button class="btn btn-secondary" onclick="pauseFocus()"><i class="fas fa-pause"></i> ${isAr ? 'إيقاف مؤقت' : 'Pause'}</button>`:`<button class="btn btn-teal" onclick="resumeFocus()"><i class="fas fa-play"></i> ${isAr ? 'استئناف' : 'Resume'}</button>`}
    </div>
    <div style="text-align:center"><button class="btn btn-primary" onclick="confirmEndSession()" style="background:var(--green)"><i class="fas fa-flag-checkered"></i> ${p>=100 ? (isAr ? 'إنهاء الجلسة' : 'Finish Session') : (isAr ? 'إنهاء مبكر — يُحتسب لك' : 'End Early — Still Counts')}</button><p style="font-size:12px;color:var(--text2);margin-top:6px">${isAr ? 'الإنهاء المبكر ليس فشلاً أبداً. مجرد البدء كان هو الفوز الحقيقي.' : 'Ending early is not failing. Starting was the win.'}</p></div>
  </div><div style="width:140px;flex-shrink:0;text-align:center"><div class="card" style="padding:16px 8px;display:flex;flex-direction:column;align-items:center;gap:4px"><div class="bd-wrap">${bdSVG(comp)}</div><div class="bd-label">${isAr ? 'يذاكر معك<br>الآن خطوة بخطوة' : 'Studying with<br>you right now'}</div></div></div></div>`;
}

function startFocusSession(){
  SFX.click();
  const ti=document.getElementById('focus-task-input'),task=ti?ti.value.trim():'';
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  if(!task){toast(isAr ? 'اكتب ما تود إنجازه أولاً' : 'Type what you need to do first','warn');return;}
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
    window.onbeforeunload = function(){ 
      return isAr ? "جلسة التركيز جارية الآن. هل أنت متأكد من مغادرة الصفحة؟" : "Focus session is running. Are you sure you want to leave?"; 
    };
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
      if (label) {
        const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
        label.textContent = focusState.mode === 'focus' 
          ? (isAr ? 'واصل التركيز بثبات...' : 'Stay with it...') 
          : (isAr ? 'استرح والتقط أنفاسك...' : 'Take a breather...');
      }

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
      const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
      if (focusState.mode === 'focus') {
        SFX.complete(); 
        toast(isAr ? 'اكتملت جلسة التركيز! حان وقت استراحة قصيرة ممتعة.' : 'Focus complete! Time for a short break.', 'bonus');
        focusState.accumulatedDuration += (Store.get('settings').focusDuration * 60); 
        focusState.mode = 'break';
        focusState.seconds = Store.get('settings').breakDuration * 60;
        focusState.totalSeconds = focusState.seconds;
        focusState.endTime = Date.now() + (focusState.seconds * 1000);
        startFocusTick();
      } else {
        SFX.nudge(); 
        toast(isAr ? 'انتهت الاستراحة! لنعد للتركيز بهمة ونشاط.' : 'Break is over! Let\'s focus.', 'info');
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
    const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
    window.onbeforeunload = function(){ 
      return isAr ? "جلسة التركيز جارية الآن. هل أنت متأكد من مغادرة الصفحة؟" : "Focus session is running. Are you sure you want to leave?"; 
    };
  }
}

function logDistraction(force=false){
  focusState.distractions++;SFX.click();
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  toast(force ? (isAr ? 'تم رصد تبديل علامة التبويب!' : 'Tab switch detected!') : (isAr ? 'تم تسجيل التشتت. والآن عُد لتركيزك بكل هدوء ولطف.' : 'Logged. Now gently come back.'), 'info');
  renderFocus();
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
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  showModal(`
    <div style="text-align:center">
      <h2 style="color:var(--red);margin-bottom:10px"><i class="fas fa-exclamation-triangle"></i> ${isAr ? 'انتظر لحظة!' : 'Wait!'}</h2>
      <p>${isAr ? 'وضع الانضباط الصارم مفعّل. عليك الانتظار 5 ثوانٍ قبل التراجع.' : 'Strict mode is on. You must wait 5 seconds before giving up.'}</p>
      <div id="strict-timer" style="font-size:32px;font-weight:700;margin:20px 0;color:var(--accent)">5</div>
      <button class="btn btn-sm btn-ghost" onclick="cancelStrictEnd()">${isAr ? 'إلغاء' : 'Cancel'}</button>
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

  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const title = auto 
    ? (isAr ? 'اكتملت الجلسة بنجاح!' : 'Session Complete!') 
    : (isAr ? 'بداية رائعة وموفقة!' : 'Great Start!');
  const subtitle = auto 
    ? (isAr ? 'حافظت على كامل تركيزك طوال الوقت. أداء مذهل ومبهر!' : 'You stayed focused the whole time. Amazing.') 
    : (isAr ? 'لقد حضرت وحاولت بجد. هذا الإنجاز يعني الكثير وأكبر مما تتخيل.' : 'You showed up and tried. That matters more than you think.');
  const focusedLabel = isAr ? 'وقت التركيز' : 'Focused';
  const distractionsLabel = isAr ? 'تشتتات' : 'Distractions';
  const xpLabel = isAr ? 'نقاط خبرة' : 'XP';
  const surpriseBonus = isAr ? 'مكافأة غير متوقعة!' : 'Surprise Bonus!';
  const surpriseDesc = isAr ? `عمل متقن! إليك +${bonusXP} نقطة خبرة إضافية` : `Nice work! Here's an extra +${bonusXP} XP`;
  const doneBtn = isAr ? 'تم' : 'Done';

  showModal(`<div style="text-align:center"><div style="font-size:48px;margin-bottom:12px">${auto?'<i class="fas fa-trophy" style="color:#FFD93D"></i>':'<i class="fas fa-seedling" style="color:var(--green)"></i>'}</div><h2 style="font-size:22px;margin-bottom:4px">${title}</h2><p style="color:var(--text2);margin-bottom:20px">${subtitle}</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:${bonusXP>0?'12px':'20px'}"><div class="card" style="padding:12px"><div style="font-family:Fredoka;font-size:24px;color:var(--teal)">${min}${isAr ? ' د' : 'm'}</div><div style="font-size:12px;color:var(--text2)">${focusedLabel}</div></div><div class="card" style="padding:12px"><div style="font-family:Fredoka;font-size:24px;color:var(--accent)">${focusState.distractions}</div><div style="font-size:12px;color:var(--text2)">${distractionsLabel}</div></div><div class="card" style="padding:12px"><div style="font-family:Fredoka;font-size:24px;color:var(--green)">+${baseXP}</div><div style="font-size:12px;color:var(--text2)">${xpLabel}</div></div></div>
    ${bonusXP>0?`<div class="card bonus-card bonus-pop" style="margin-bottom:20px;padding:16px;border:1px solid rgba(216,180,254,.3)"><div style="display:flex;align-items:center;gap:12px;justify-content:center"><i class="fas fa-gift" style="font-size:24px;color:#D8B4FE"></i><div style="text-align:left"><div style="font-weight:800;font-size:16px;color:#D8B4FE">${surpriseBonus}</div><div style="font-size:13px;color:var(--text2)">${surpriseDesc}</div></div></div></div>`:''}
    <button class="btn btn-primary" onclick="closeModal();focusState.phase='setup';navigate('focus')">${doneBtn}</button></div>`);
}

document.addEventListener('input',e=>{
  if(e.target.id==='focus-task-input'){
    const task=e.target.value.trim(),list=document.getElementById('steps-list');
    if(!list)return;
    const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
    if(!task){
      list.innerHTML=`<div style="color:var(--text2);font-size:14px;padding:8px 0">${isAr ? 'اكتب المهمة في الأعلى لرؤية الخطوات المقترحة...' : 'Type a task above to see the steps...'}</div>`;
      return;
    }
    const steps=breakDownTask(task);
    list.innerHTML=steps.map((s,i)=>`<div class="step-item" style="padding:6px 10px"><div class="step-num" style="width:20px;height:20px;font-size:11px">${i+1}</div><input class="input" value="${s}" style="border:none;background:transparent;padding:2px 4px;font-size:13px" data-step-idx="${i}"></div>`).join('');
  }
});

// ======================== STORE & REWARDS SYSTEM ========================
const STORE_ARABIC_DATA = {
  categories: {
    avatars: 'الصور الرمزية (الأفاتار)',
    companions: 'رفقاء الدراسة والتحفيز',
    timers: 'المؤقتات البصرية التفاعلية',
    colors: 'ألوان المظهر والواجهة',
    themes: 'السمات والمظهر العام'
  },
  items: {
    'avatar:default': { name: 'طالب مجتهد', desc: 'الشخصية الرمزية الافتراضية لطالب يسعى للتفوق والمذاكرة الذكية.' },
    'avatar:wizard': { name: 'الساحر العبقري', desc: 'ساحر المعرفة الذي يحول أصعب المسائل إلى حلول وإنجازات.' },
    'avatar:robot': { name: 'الروبوت الذكي', desc: 'مساعد رقمي فائق الدقة لحل المسائل المعقدة والتنظيم.' },
    'avatar:alien': { name: 'رائد الفضاء', desc: 'مستكشف يغوص في أعماق المعرفة الكونية وحب الاستطلاع.' },
    'avatar:cat': { name: 'القط المستكشف', desc: 'رفيق هادئ وفضولي يعشق التركيز والمذاكرة في هدوء.' },
    'avatar:ghost': { name: 'الشبح اللطيف', desc: 'شبح مرح يطرد التشتت والملل والمماطلة من غرفتك.' },
    'companion:default': { name: 'رفيق المذاكرة', desc: 'صديقك الوفي يشجعك أثناء فترات التركيز المستمر.' },
    'companion:robot_friend': { name: 'الصديق الآلي', desc: 'روبوت ودود يمنحك نصائح دورية للتركيز والاستيعاب.' },
    'companion:magic_cat': { name: 'القط السحري', desc: 'قط محفز بطاقة إيجابية وهدوء تام لتخفيف التوتر الدراسي.' },
    'timer:classic': { name: 'قرص المؤقت الكلاسيكي', desc: 'قرص دائري أحمر على طراز Time Timer ينكمش تدريجياً لتقليل قلق الوقت.' },
    'timer:donut': { name: 'حلقة الدونات العصرية', desc: 'حلقة دائرية نظيفة وأنيقة تفرغ باتجاه عقارب الساعة بهدوء.' },
    'timer:hourglass': { name: 'الساعة الرملية الهادئة', desc: 'حبيبات رملية متساقطة تراقب تقدمك بأسلوب مهدئ وخالٍ من التوتر.' },
    'timer:retro': { name: 'مؤشر الطاقة (ريترو)', desc: 'أشرطة طاقة عمودية تستنزف بمرور الوقت بأسلوب ألعاب الفيديو الكلاسيكية.' },
    'color:#FF8C42': { name: 'برتقالي ناري', desc: 'لون ناري مفعم بالحيوية والنشاط الذهني.' },
    'color:#4ECDC4': { name: 'تركواز هادئ', desc: 'درجة مهدئة للأعصاب ومريحة لتركيز طويل المدى.' },
    'color:#FF6B6B': { name: 'أحمر قرمزي', desc: 'لون قرمزي يمنحك حضوراً ملفتاً وثقة عالية.' },
    'color:#58A6FF': { name: 'أزرق نيون', desc: 'أزرق عصري واضح ومريح للقراءة والمتابعة.' },
    'color:#A855F7': { name: 'بنفسجي ملكي', desc: 'درجة ملكية مميزة تحفز الإبداع والخيال العلمي.' },
    'color:#22C55E': { name: 'أخضر زمردي', desc: 'لون زمردي يرمز للنجاح والنمو والتطوير الذاتي.' },
    'color:#EC4899': { name: 'وردي زاهٍ', desc: 'لون مشرق مبهج يبعث التفاؤل والإيجابية.' },
    'color:#FBBF24': { name: 'أصفر شمسي', desc: 'أصفر مشع يرفع النشاط الذهني والانتباه.' },
    'theme:default': { name: 'الوضع الداكن (الليلي)', desc: 'ألوان داكنة مريحة للعينين في الإضاءة الخافتة وتقليل التشتت.' },
    'theme:light': { name: 'الوضع الفاتح المريح', desc: 'تباين عالي ومظهر ساطع ومريح للمذاكرة في النهار.' },
    'theme:forest': { name: 'أخضر الغابة الهادئ', desc: 'درجات الطبيعة والأشجار لتعزيز الهدوء وصفاء الذهن.' },
    'theme:ocean': { name: 'أزرق المحيط العميق', desc: 'درجات بحرية عميقة تحفز التركيز العميق والاسترخاء.' }
  }
};

function getStoreItemDetails(type, item, isAr) {
  if (!isAr) return { name: item.name, desc: item.desc || '' };
  const key = `${type}:${item.id}`;
  const hit = STORE_ARABIC_DATA.items[key];
  if (hit) return hit;
  return { name: item.name, desc: item.desc || '' };
}

function renderStore(){
  updateUserPanel();
  const xp = Store.get('totalXP') || 0, inv = Store.get('inventory');
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const cNames = isAr ? STORE_ARABIC_DATA.categories : {
    avatars: 'User Avatars',
    companions: 'Study Companions',
    timers: 'Visual Timers',
    colors: 'Profile Colors',
    themes: 'Themes'
  };

  document.getElementById('view-store').innerHTML = `
    <div style="max-width:900px;margin:0 auto" ${isAr ? 'dir="rtl"' : ''}>
      <div style="margin-bottom:20px">
        <h1 style="font-size:26px;font-weight:700;margin-bottom:6px">
          ${isAr ? '<i class="fas fa-store" style="color:#D8B4FE;margin-left:8px"></i> متجر التخصيص والمكافآت' : 'Store'}
        </h1>
        <p style="color:var(--text2);margin-bottom:0">
          ${isAr ? 'أنفق نقاط خبرتك (XP) لتخصيص تجربتك، وفتح شخصيات ومؤقتات بصرية وألوان وسمات جديدة.' : 'Spend your XP to customize your experience.'}
        </p>
      </div>
      
      <!-- XP Balance Card -->
      <div class="card" style="margin-bottom:24px; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; background:linear-gradient(135deg, var(--card) 0%, rgba(216,180,254,0.08) 100%); border:1px solid rgba(216,180,254,0.25);">
        <div style="display:flex; align-items:center; gap:12px">
          <div style="width:44px; height:44px; border-radius:12px; background:rgba(255,217,61,0.15); display:flex; align-items:center; justify-content:center;">
            <i class="fas fa-coins" style="color:#FFD93D; font-size:22px"></i>
          </div>
          <div>
            <div style="font-weight:800; font-size:22px; color:var(--text); line-height:1.2;">
              ${xp} <span style="font-size:14px; font-weight:600; color:var(--accent);">${isAr ? 'نقطة خبرة (XP) متوفرة' : 'XP Available'}</span>
            </div>
            <div style="font-size:12px; color:var(--text2); margin-top:2px;">
              ${isAr ? 'انقر على أي عنصر لشرائه أو تفعيله فوراً' : 'Equip items to use them'}
            </div>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-sm btn-ghost" onclick="navigate('focus')" style="border:1px solid var(--border); font-size:12px;">
            <i class="fas fa-bullseye" style="color:var(--teal); margin-${isAr?'left':'right'}:6px"></i> ${isAr ? 'اكسب المزيد في مختبر التركيز' : 'Earn in Focus Lab'}
          </button>
        </div>
      </div>

      <!-- Categories -->
      <h3 style="margin-bottom:12px; font-size:17px; font-weight:700; color:var(--accent); display:flex; align-items:center; gap:8px;">
        <i class="fas fa-user-circle"></i> ${cNames.avatars}
      </h3>
      <div class="store-grid" style="margin-bottom:32px">${CATALOG.avatars.map(a=>renderStoreItem('avatar', a, inv)).join('')}</div>

      <h3 style="margin-bottom:12px; font-size:17px; font-weight:700; color:var(--teal); display:flex; align-items:center; gap:8px;">
        <i class="fas fa-user-friends"></i> ${cNames.companions}
      </h3>
      <div class="store-grid" style="margin-bottom:32px">${CATALOG.companions.map(c=>renderStoreItem('companion', c, inv)).join('')}</div>

      <h3 style="margin-bottom:12px; font-size:17px; font-weight:700; color:var(--red); display:flex; align-items:center; gap:8px;">
        <i class="fas fa-clock"></i> ${cNames.timers}
      </h3>
      <div class="store-grid" style="margin-bottom:32px">${CATALOG.timers.map(t=>renderStoreItem('timer', t, inv)).join('')}</div>

      <h3 style="margin-bottom:12px; font-size:17px; font-weight:700; color:var(--accent); display:flex; align-items:center; gap:8px;">
        <i class="fas fa-palette"></i> ${cNames.colors}
      </h3>
      <div class="store-grid" style="margin-bottom:32px">${CATALOG.colors.map(c=>renderStoreItem('color', c, inv)).join('')}</div>

      <h3 style="margin-bottom:12px; font-size:17px; font-weight:700; color:var(--blue); display:flex; align-items:center; gap:8px;">
        <i class="fas fa-brush"></i> ${cNames.themes}
      </h3>
      <div class="store-grid" style="margin-bottom:32px">${CATALOG.themes.map(t=>renderStoreItem('theme', t, inv)).join('')}</div>

      <!-- Educational / Motivational XP Info Card -->
      <div class="card" style="margin-top:16px; margin-bottom:32px; padding:16px 20px; background:linear-gradient(135deg, rgba(255,140,66,0.06) 0%, rgba(78,205,196,0.06) 100%); border:1px solid rgba(255,140,66,0.25);">
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px">
          <i class="fas fa-award" style="color:var(--accent); font-size:20px"></i>
          <span style="font-weight:700; font-size:15px">
            ${isAr ? 'كيف تكسب المزيد من نقاط الخبرة (XP)؟' : 'How to earn more XP?'}
          </span>
        </div>
        <p style="font-size:13px; color:var(--text2); line-height:1.6; margin:0">
          ${isAr 
            ? 'تحصل على نقطة خبرة مقابل كل دقيقة تركيز في <strong>مختبر التركيز</strong>، ونقاط إضافية عند حل التحديات في <strong>مغامرة الرياضيات</strong>، ومكافأة <strong>+50 نقطة XP</strong> يومياً عند إنجاز مهام اليوم الثلاث، ومكافآت مستمرة مع كل جلسة مراجعة في <strong>البطاقات التعليمية</strong> ومحاكاة <strong>مختبر العلوم</strong>!' 
            : 'Earn 1 XP per minute of focus in <strong>Focus Lab</strong>, win bonus XP in <strong>Math Adventure</strong> challenges, claim <strong>+50 XP daily bonus</strong> by completing your three daily quests, and review <strong>Flashcards</strong>!'}
        </p>
      </div>
    </div>`;
}

function renderStoreItem(type, item, inv){
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const info = getStoreItemDetails(type, item, isAr);
  const owned = inv[type+'s'].includes(item.id);
  const equipped = inv.equipped[type]===item.id;
  const canAfford = Store.get('totalXP')>=item.cost;
  const cls = `store-item ${owned?'owned':''} ${equipped?'equipped':''}`;
  
  // Keep the background circle neutral for Colors so they don't blend into their own swatches
  const iconBg = (equipped && type !== 'color') ? 'var(--accent)' : 'var(--card)';
  const iconColor = (equipped && type !== 'color') ? '#fff' : 'var(--text2)';

  const statusLabel = (owned && equipped)
    ? `<span style="font-size:12px; color:var(--green); font-weight:700"><i class="fas fa-check-circle" style="margin-${isAr?'left':'right'}:4px"></i>${isAr ? 'مُفعّل الآن' : 'Equipped'}</span>`
    : owned
    ? `<span style="font-size:12px; color:var(--text2)"><i class="fas fa-box-open" style="margin-${isAr?'left':'right'}:4px"></i>${isAr ? 'تم الشراء' : 'Owned'}</span>`
    : `<span class="cost"><i class="fas fa-coins" style="font-size:10px; margin-${isAr?'left':'right'}:4px"></i>${isAr ? `${item.cost} نقطة XP` : `${item.cost} XP`}</span>`;

  return `<div class="${cls}" onclick="handleStoreClick('${type}','${item.id}')" title="${info.desc || info.name}">
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
    <div style="font-weight:700; font-size:14px; margin-bottom:2px">${info.name}</div>
    ${statusLabel}
  </div>`;
}

function handleStoreClick(type, id){
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const inv = Store.get('inventory'), cat = CATALOG[type+'s'];
  const item = cat.find(i=>i.id===id);
  if (!item) return;
  const info = getStoreItemDetails(type, item, isAr);

  if(inv.equipped[type]===id){
    toast(isAr ? 'هذا العنصر مُفعّل وقيد الاستخدام بالفعل!' : 'Already equipped', 'info');
    return;
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
    toast(isAr ? `تم تفعيل "${info.name}" بنجاح!` : `${item.name} equipped!`, 'success');
  }
  else {
    const currentXp = Store.get('totalXP') || 0;
    if(currentXp >= item.cost){
      showModal(`
        <div style="${isAr ? 'direction:rtl;text-align:right;' : ''}">
          <h3 style="margin-bottom:10px; font-size:18px;">${isAr ? `شراء وتفعيل "${info.name}"؟` : `Buy ${item.name}?`}</h3>
          <p style="color:var(--text2);margin-bottom:12px; font-size:14px; line-height:1.6;">
            ${isAr 
              ? `التكلفة: <strong style="color:var(--accent)">${item.cost} نقطة XP</strong>.<br>رصيدك الحالي: <strong>${currentXp} نقطة</strong> (المتبقي بعد الشراء: ${currentXp - item.cost} نقطة).`
              : `Cost: <strong style="color:var(--accent)">${item.cost} XP</strong>.<br>You have <strong>${currentXp} XP</strong>.`}
          </p>
          ${info.desc ? `<div style="padding:10px 14px; border-radius:10px; background:rgba(78,205,196,0.08); border:1px solid rgba(78,205,196,0.25); font-size:13px; color:var(--text2); margin-bottom:18px;"><i class="fas fa-sparkles" style="color:var(--teal); margin-${isAr?'left':'right'}:6px"></i>${info.desc}</div>` : ''}
          <div style="display:flex;gap:10px;justify-content:${isAr ? 'flex-start' : 'flex-end'}">
            <button class="btn btn-secondary" onclick="closeModal()">${isAr ? 'إلغاء' : 'Cancel'}</button>
            <button class="btn btn-primary" onclick="buyItem('${type}','${id}')"><i class="fas fa-shopping-bag" style="margin-${isAr?'left':'right'}:6px"></i>${isAr ? 'تأكيد الشراء' : 'Buy'}</button>
          </div>
        </div>
      `);
    } else {
      toast(isAr ? 'عفواً، رصيدك من نقاط الخبرة (XP) غير كافٍ لشراء هذا العنصر!' : 'Not enough XP!', 'warn');
    }
  }
}

function buyItem(type,id){
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const inv = Store.get('inventory'), cat = CATALOG[type+'s'];
  const item = cat.find(i=>i.id===id);
  if (!item) return;
  const info = getStoreItemDetails(type, item, isAr);

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
  toast(isAr ? `تهانينا! تم شراء وتفعيل "${info.name}" بنجاح!` : `Purchased ${item.name}!`, 'success');
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

function applyAccentColor(hexColor) {
  if (!hexColor) return;
  document.documentElement.style.setProperty('--accent', hexColor);
  document.documentElement.style.setProperty('--accent-glow', hexColor + '33');
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
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';

  if(grade===1){
    const types=['compare','add_sub','before_after','days'];
    const type=types[Math.floor(Math.random()*types.length)];
    if(type==='compare'){
      const a=Math.floor(Math.random()*90)+10;let b=Math.floor(Math.random()*90)+10;while(b===a)b=Math.floor(Math.random()*90)+10;
      if (isAr) {
        ans = a > b ? `${a} هو الأكبر` : `${b} هو الأكبر`;
        q = `أي العددين أكبر: ${a} أم ${b}؟`;
        const w1 = a < b ? `${a} هو الأكبر` : `${b} هو الأكبر`;
        const w2 = 'العددان متساويان';
        opts = [ans, w1, w2, `${Math.min(a,b)} هو الأصغر`].filter((v,i,a)=>a.indexOf(v)===i);
        while(opts.length<4) opts.push('غير ذلك');
      } else {
        ans=a>b?`${a} is greater`:`${b} is greater`;
        q=`Which is greater: ${a} or ${b}?`;
        const w1=a<b?`${a} is greater`:`${b} is greater`;const w2='They are equal';
        opts=[ans,w1,w2,`${Math.min(a,b)} is less`].filter((v,i,a)=>a.indexOf(v)===i);while(opts.length<4)opts.push('Neither');
      }
      opts=shuffle(opts);
    }else if(type==='add_sub'){
      if(Math.random()>.5){const a=Math.floor(Math.random()*10)+1,b=Math.floor(Math.random()*(20-a))+1;ans=a+b;q=`${a} + ${b} = ?`;}
      else{const a=Math.floor(Math.random()*10)+5,b=Math.floor(Math.random()*(a-1))+1;ans=a-b;q=`${a} - ${b} = ?`;}
      opts=generateNumericOptions(ans);
    }else if(type==='before_after'){
      const n=Math.floor(Math.random()*90)+10;
      if(Math.random()>.5){
        q = isAr ? `ما العدد الذي يلي ${n} مباشرة؟` : `What number comes after ${n}?`;
        ans=n+1;
      }else{
        q = isAr ? `ما العدد الذي يسبق ${n} مباشرة؟` : `What number comes before ${n}?`;
        ans=n-1;
      }
      opts=generateNumericOptions(ans);
    }else{
      const daysEn=['Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'];
      const daysAr=['السبت','الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'];
      const days = isAr ? daysAr : daysEn;
      const today=days[Math.floor(Math.random()*7)],idx=days.indexOf(today),r=Math.random();
      if(r<.33){
        q = isAr ? `إذا كان اليوم هو ${today}، فماذا كان الأمس؟` : `If today is ${today}, what was yesterday?`;
        ans=days[(idx+6)%7];
      }
      else if(r<.66){
        q = isAr ? `إذا كان اليوم هو ${today}، فماذا يكون الغد؟` : `If today is ${today}, what is tomorrow?`;
        ans=days[(idx+1)%7];
      }
      else{
        q = isAr ? `إذا كان اليوم هو ${today}، فما هو اليوم بعد يومين؟` : `If today is ${today}, what day comes after 2 days?`;
        ans=days[(idx+2)%7];
      }
      opts=[ans];while(opts.length<4){const w=days[Math.floor(Math.random()*7)];if(!opts.includes(w))opts.push(w);}opts=shuffle(opts);
    }
  }else if(grade===2){
    const types=['regroup','place_value','money','compare_3d'];
    const type=types[Math.floor(Math.random()*types.length)];
    if(type==='regroup'){
      const a=Math.floor(Math.random()*50)+30,b=Math.floor(Math.random()*50)+30;ans=a+b;q=`${a} + ${b} = ?`;opts=generateNumericOptions(ans);
    }else if(type==='place_value'){
      const num=Math.floor(Math.random()*900)+100,str=String(num),pos=Math.floor(Math.random()*3);
      const digit=parseInt(str[pos]),placeVals=[100,10,1];
      ans=digit*placeVals[pos];
      q = isAr ? `ما القيمة المكانية للرقم ${digit} في العدد ${num}؟` : `What is the value of the digit ${digit} in ${num}?`;
      opts=generateNumericOptions(ans);
    }else if(type==='money'){
      const h=Math.floor(Math.random()*5),t=Math.floor(Math.random()*9),o=Math.floor(Math.random()*9);ans=h*100+t*10+o;
      const parts=[];
      if (isAr) {
        if(h)parts.push(`${h} × 100 جنيه`);if(t)parts.push(`${t} × 10 جنيهات`);if(o)parts.push(`${o} × 1 جنيه`);
        q=`لديك: ${parts.join('، و ')}. كم مجموع المبلغ؟`;
      } else {
        if(h)parts.push(`${h} x 100 LE`);if(t)parts.push(`${t} x 10 LE`);if(o)parts.push(`${o} x 1 LE`);
        q=`You have ${parts.join(', ')}. How much money do you have?`;
      }
      opts=generateNumericOptions(ans);
    }else{
      const a=Math.floor(Math.random()*900)+100;let b=Math.floor(Math.random()*900)+100;while(b===a)b=Math.floor(Math.random()*900)+100;
      ans=Math.max(a,b);
      q = isAr ? `أيهما أكبر: ${a} أم ${b}؟` : `Which is greater: ${a} or ${b}?`;
      opts=generateNumericOptions(ans);
    }
  }else if(grade===3){
    const types=['repeated_add','perimeter','area','mass'];
    const type=types[Math.floor(Math.random()*types.length)];
    if(type==='repeated_add'){
      const g=Math.floor(Math.random()*5)+2,p=Math.floor(Math.random()*5)+2;ans=g*p;
      q = isAr ? `${g} مجموعات من ${p} = ؟` : `${g} groups of ${p} = ?`;
      opts=generateNumericOptions(ans);
    }else if(type==='perimeter'){
      const l=Math.floor(Math.random()*8)+3,w=Math.floor(Math.random()*8)+3;ans=(l+w)*2;
      q = isAr ? `مستطيل طوله ${l} سم وعرضه ${w} سم. ما محيطه؟` : `A rectangle has length ${l}cm and width ${w}cm. What is its perimeter?`;
      opts=generateNumericOptions(ans);
    }else if(type==='area'){
      const l=Math.floor(Math.random()*8)+2,w=Math.floor(Math.random()*8)+2;ans=l*w;
      q = isAr ? `مستطيل طوله ${l} سم وعرضه ${w} سم. ما مساحته؟` : `A rectangle has length ${l}cm and width ${w}cm. What is its area?`;
      opts=generateNumericOptions(ans);
    }else{
      const kg=Math.floor(Math.random()*5)+1,g=Math.floor(Math.random()*900)+100;
      if(Math.random()>.5){
        ans=kg*1000+g;
        q = isAr ? `${kg} كجم و ${g} جم = ؟ جرام` : `${kg}kg ${g}g = ? grams`;
      }else{
        ans=Math.round((kg+g/1000)*1000)/1000;
        q = isAr ? `${kg*1000+g} جم = ؟ كجم` : `${kg*1000+g}g = ? kg`;
      }
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
      ans=digit*pos.mult;
      q = isAr ? `ما القيمة المكانية للرقم ${digit} في العدد ${num.toLocaleString('ar-EG')}؟` : `What is the value of the digit ${digit} in ${num.toLocaleString()}?`;
      opts=generateNumericOptions(ans);
    }else if(type==='unit_convert'){
      const convsEn=[{q:v=>`${v} km = ? m`,ans:v=>v*1000,r:[2,20]},{q:v=>`${v*1000} m = ? km`,ans:v=>v,r:[2,15]},{q:v=>`${v} m = ? cm`,ans:v=>v*100,r:[3,20]},{q:v=>`${v} kg = ? g`,ans:v=>v*1000,r:[2,10]},{q:v=>`${v} cm = ? mm`,ans:v=>v*10,r:[3,25]}];
      const convsAr=[{q:v=>`${v} كم = ؟ متر`,ans:v=>v*1000,r:[2,20]},{q:v=>`${v*1000} متر = ؟ كم`,ans:v=>v,r:[2,15]},{q:v=>`${v} متر = ؟ سم`,ans:v=>v*100,r:[3,20]},{q:v=>`${v} كجم = ؟ جرام`,ans:v=>v*1000,r:[2,10]},{q:v=>`${v} سم = ؟ ملم`,ans:v=>v*10,r:[3,25]}];
      const convs = isAr ? convsAr : convsEn;
      const c=convs[Math.floor(Math.random()*convs.length)],v=c.r[0]+Math.floor(Math.random()*(c.r[1]-c.r[0]));
      ans=c.ans(v);q=c.q(v);opts=generateNumericOptions(ans);
    }else if(type==='area_cut'){
      const bL=Math.floor(Math.random()*10)+8,bW=Math.floor(Math.random()*8)+6,cL=Math.floor(Math.random()*3)+2,cW=Math.floor(Math.random()*3)+2;
      ans=bL*bW-cL*cW;
      q = isAr ? `مستطيل أبعاده ${bL}م × ${bW}م اقتُطعت من ركنه قطعة أبعادها ${cL}م × ${cW}م. ما المساحة المتبقية؟` : `A rectangle of ${bL}m x ${bW}m has a ${cL}m x ${cW}m piece cut from the corner. What is the remaining area?`;
      opts=generateNumericOptions(ans);
    }else{
      const problemsEn=[{q:'What is the best way to solve 18 + 7?',ans:'Make 10 (18+2+5)',wrong:['Count on from 18','Double 18 then subtract','Use a number line only']},{q:'What is the best way to solve 25 x 4?',ans:'Double twice (25->50->100)',wrong:['Count by 4s from 0','Multiply normally only','Break 25 into 20+5 then multiply']},{q:'What is the best way to solve 99 + 45?',ans:'Add 100 then subtract 1',wrong:['Count on from 99','Break both numbers apart','Use a number line']},{q:'What is the best way to solve 9 x 6?',ans:'Think 10x6 then subtract 6',wrong:['Count by 9s','Add 9 six times','Memorize it only']}];
      const problemsAr=[{q:'ما هي أفضل استراتيجية لحساب 18 + 7 ذهنياً؟',ans:'تكوين العدد 10 (18+2+5)',wrong:['العد تصاعدياً على الأصابع','مضاعفة 18 ثم الطرح','استخدام خط الأعداد فقط']},{q:'ما أفضل طريقة ذهنياً لحساب 25 × 4؟',ans:'المضاعفة مرتين (25←50←100)',wrong:['الجمع المتكرر للعدد 4','الضرب العمودي المطول فقط','تفكيك 25 إلى 20+5 فقط']},{q:'ما أسرع طريقة ذهنياً لحساب 99 + 45؟',ans:'إضافة 100 ثم طرح 1',wrong:['العد بالآحاد تصاعدياً','تفكيك كلا العددين','استخدام خط الأعداد']},{q:'ما أسهل طريقة لحساب 9 × 6؟',ans:'حساب 10×6 ثم طرح 6',wrong:['تسميع جدول 9 كاملاً','جمع 9 ست مرات باليد','الحفظ الصم فقط']}];
      const problems = isAr ? problemsAr : problemsEn;
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
      ans=Math.round(price*kg*10)/10;
      q = isAr ? `إذا كان سعر 1 كجم من التفاح ${price} جنيهاً، فكم ثمن ${kg} كجم؟` : `If 1kg of apples costs ${price} LE, how much do ${kg}kg cost?`;
      opts=generateNumericOptions(ans);
    }else if(type==='power_of_10'){
      const n=Math.floor(Math.random()*4)+2,base=Math.round((Math.random()*9+1)*100)/100;
      ans=Math.round(base*Math.pow(10,n)*100)/100;q=`${base} x 10${'^'.repeat(n)} = ?`;opts=generateNumericOptions(ans);
    }else if(type==='fraction_compare'){
      const dens=[2,3,4,5,6,8,10],d=dens[Math.floor(Math.random()*dens.length)];
      const n1=Math.floor(Math.random()*(d-1))+1;let n2=Math.floor(Math.random()*(d-1))+1;while(n2===n1)n2=Math.floor(Math.random()*(d-1))+1;
      if (isAr) {
        ans = n1 > n2 ? `${n1}/${d} هو الأكبر` : `${n2}/${d} هو الأكبر`;
        q = `أيهما أكبر: ${n1}/${d} أم ${n2}/${d}؟`;
        const w1 = n1 > n2 ? `${n2}/${d} هو الأكبر` : `${n1}/${d} هو الأكبر`;
        opts = [ans, w1, 'الكسران متساويان', `${Math.min(n1,n2)}/${d} هو الأصغر`].filter((v,i,a)=>a.indexOf(v)===i);
        while(opts.length<4) opts.push('لا يمكن المقارنة');
      } else {
        ans=n1>n2?`${n1}/${d} is greater`:`${n2}/${d} is greater`;
        q=`Which is greater: ${n1}/${d} or ${n2}/${d}?`;
        const w1=n1>n2?`${n2}/${d} is greater`:`${n1}/${d} is greater`;
        opts=[ans,w1,'They are equal',`${Math.min(n1,n2)}/${d} is less`].filter((v,i,a)=>a.indexOf(v)===i);while(opts.length<4)opts.push('Cannot compare');
      }
      opts=shuffle(opts);
    }else{
      const dens=[2,3,4,5,6,8,10],d=dens[Math.floor(Math.random()*dens.length)];
      const n1=Math.floor(Math.random()*(d-1))+1,n2=Math.floor(Math.random()*(d-1))+1,numAns=n1+n2;
      ans=numAns+'/'+d;
      q=numAns>d?(isAr?`${n1}/${d} + ${n2}/${d} = ؟ (كسر غير حقيقي)`:`${n1}/${d} + ${n2}/${d} = ? (improper)`):`${n1}/${d} + ${n2}/${d} = ?`;
      opts=[ans];while(opts.length<4){const w=numAns+Math.floor(Math.random()*5)-2;if(w>0&&w!==numAns)opts.push(w+'/'+d);}opts=shuffle(opts);
    }
  }else{
    const types=['absolute_val','ratio','percent_real','neg_compare','percent_simple'];
    const type=types[Math.floor(Math.random()*types.length)];
    if(type==='absolute_val'){
      const a=Math.floor(Math.random()*20)+1,b=Math.floor(Math.random()*15)+1,v1=Math.random()>.5?a:-a;
      if (isAr) {
        ans = Math.abs(v1) > b ? `|${v1}| هو الأكبر` : `${b} هو الأكبر`;
        q = `قارن بين: |${v1}| و ${b}`;
        const w1 = Math.abs(v1) > b ? `${b} هو الأكبر` : `|${v1}| هو الأكبر`;
        opts = [ans, w1, 'متساويان', `|${b}|`].filter((v,i,a)=>a.indexOf(v)===i);
        while(opts.length<4) opts.push('غير محدد');
      } else {
        ans=Math.abs(v1)>b?`|${v1}| is greater`:`${b} is greater`;
        q=`Compare: |${v1}| and ${b}`;
        const w1=Math.abs(v1)>b?`${b} is greater`:`|${v1}| is greater`;
        opts=[ans,w1,'They are equal',`|${b}|`].filter((v,i,a)=>a.indexOf(v)===i);while(opts.length<4)opts.push('Cannot determine');
      }
      opts=shuffle(opts);
    }else if(type==='ratio'){
      const pairs=[[250,1000,'1:4'],[150,300,'1:2'],[400,1000,'2:5'],[75,300,'1:4'],[200,500,'2:5'],[120,360,'1:3'],[60,180,'1:3'],[300,500,'3:5'],[40,100,'2:5'],[180,600,'3:10'],[350,700,'1:2']];
      const pair=pairs[Math.floor(Math.random()*pairs.length)];ans=pair[2];
      q = isAr ? `أوجد النسبة بين ${pair[0]} جم و ${pair[1]} جم في أبسط صورة:` : `Find the ratio of ${pair[0]}g to ${pair[1]}g in simplest form.`;
      const wrongs=pairs.filter(p=>p[2]!==pair[2]).map(p=>p[2]).filter((v,i,a)=>a.indexOf(v)===i).slice(0,3);
      opts=shuffle([ans,...wrongs]).slice(0,4);while(opts.length<4)opts.push(pair[0]+':'+pair[1]);
    }else if(type==='percent_real'){
      const scenariosEn=[{q:'A shirt costs 200 LE and is now 25% off. What is the discount?',ans:50},{q:'A shirt costs 200 LE and is now 25% off. What is the new price?',ans:150},{q:'Ali scored 80 out of 100 on a test. What is his percentage?',ans:80},{q:'A class has 40 students. 60% are girls. How many girls are there?',ans:24},{q:'A class has 40 students. 60% are girls. How many boys are there?',ans:16},{q:'The price went from 100 LE to 120 LE. What is the increase percentage?',ans:20},{q:'A book costs 80 LE. The shop offers 10% discount. How much do you pay?',ans:72},{q:'You need 360 LE and you have saved 75% of it. How much have you saved?',ans:270}];
      const scenariosAr=[{q:'قميص سعره 200 جنيه وعليه خصم 25%. ما مقدار الخصم بالجنيه؟',ans:50},{q:'قميص سعره 200 جنيه وعليه خصم 25%. ما السعر الجديد بعد الخصم؟',ans:150},{q:'حصل علي على 80 درجة من 100 في الامتحان. ما نسبته المئوية؟',ans:80},{q:'فصل دراسي به 40 طالباً، 60% منهم بنات. كم عدد البنات؟',ans:24},{q:'فصل دراسي به 40 طالباً، 60% منهم بنات. كم عدد البنين؟',ans:16},{q:'ارتفع سعر سلعة من 100 جنيه إلى 120 جنيهاً. ما نسبة الزيادة؟',ans:20},{q:'كتاب سعره 80 جنيهاً والمكتبة تقدم خصماً 10%. كم تدفع للبائع؟',ans:72},{q:'تحتاج 360 جنيهاً وادخرت منها 75%. كم جنيهاً ادخرت حتى الآن؟',ans:270}];
      const scenarios = isAr ? scenariosAr : scenariosEn;
      const s=scenarios[Math.floor(Math.random()*scenarios.length)];ans=s.ans;q=s.q;opts=generateNumericOptions(ans);
    }else if(type==='neg_compare'){
      const a=Math.floor(Math.random()*10)+1,b=Math.floor(Math.random()*10)+1;
      if (isAr) {
        ans = `${b} هو الأكبر`;
        q = `أيهما أكبر: -${a} أم ${b}؟`;
        opts = [`-${a} هو الأكبر`, ans, 'متساويان', `|-${a}|`].filter((v,i,a)=>a.indexOf(v)===i);
        while(opts.length<4) opts.push('لا يمكن المقارنة');
      } else {
        ans=`${b} is greater`;
        q=`Which is greater: -${a} or ${b}?`;
        opts=[`-${a} is greater`,ans,'They are equal',`|-${a}|`].filter((v,i,a)=>a.indexOf(v)===i);while(opts.length<4)opts.push('Cannot compare');
      }
      opts=shuffle(opts);
    }else{
      const pct=[10,20,25,50,75][Math.floor(Math.random()*5)],base=Math.floor(Math.random()*40)+5;
      ans=Math.round(base*pct/100);
      q = isAr ? `ما هو ${pct}% من العدد ${base}؟` : `What is ${pct}% of ${base}?`;
      opts=generateNumericOptions(ans);
    }
  }
  return{q,ans,opts};
}

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

// ======================== PHET ARABIC LOCALIZATION DATA ========================
const PHET_ARABIC_DATA = {
  'circuit-construction-kit-dc': {
    nameAr: 'بناء الدوائر الكهربائية (التيار المستمر)',
    subjectAr: 'الفيزياء',
    categoryAr: 'الكهرباء والتيار والدوائر',
    descAr: 'بناء وتوصيل دوائر كهربائية بالبطاريات، والمصابيح، والمقاومات، والمفاتيح. قياس شدة التيار وفارق الجهد باستخدام أجهزة الفولتميتر والأميتر الحية.',
    learningGoalsAr: [
      'بناء دوائر توالي وتوازي وظيفية مع مراقبة تدفق الإلكترونات',
      'التحقق من قانون أوم (جـ = ت × م) عبر تغيير المقاومات',
      'اختبار التوصيل الكهربائي والمقاومة النوعية للمواد المختلفة'
    ],
    challengeAr: 'قم ببناء دائرة توازي تحتوي على مصباحين ومفتاح يتحكم في إضاءة مصباح واحد فقط دون إطفاء المصباح الآخر، وقارن شدة التيار في كل فرع.'
  },
  'build-an-atom': {
    nameAr: 'بناء الذرة والنظائر',
    subjectAr: 'الكيمياء',
    categoryAr: 'التركيب الذري والنظائر',
    descAr: 'تجميع البروتونات والنيوترونات والإلكترونات لبناء عناصر الجدول الدوري. فحص الشحنة الكلية، والعدد الكتلي، والاستقرار النووي.',
    learningGoalsAr: [
      'ربط عدد البروتونات بهوية العنصر في الجدول الدوري',
      'حساب الشحنة الكلية للذرة بناءً على الفرق بين البروتونات والإلكترونات',
      'التمييز بين الذرات المتعادلة والأيونات الموجبة والسالبة'
    ],
    challengeAr: 'ابنِ ذرة كربون-12 مستقرة ومتعادلة الشحنة، ثم أضف نيوتروناً لتكوين النظير كربون-13، ثم انزع إلكتروناً لتكوين أيون موجب C⁺.'
  },
  'states-of-matter-basics': {
    nameAr: 'حالات المادة والتحولات الحرارية',
    subjectAr: 'الكيمياء',
    categoryAr: 'الديناميكا الحرارية وتغيرات الحالة',
    descAr: 'تسخين وتبريد وضغط الذرات والجزيئات. راقب تحول النيون، والأرجون، والأكسجين، والماء بين الحالات الصلبة والسائلة والغازية.',
    learningGoalsAr: [
      'ربط درجة الحرارة بالطاقة الحركية وسرعة اهتزاز الجزيئات',
      'مقارنة المسافات البينية وقوى الترابط بين الحالات الثلاث',
      'ملاحظة تمدد التركيب البلوري للجليد مقارنة بالماء السائل'
    ],
    challengeAr: 'سخّن الجليد من الصفر المطلق حتى يتحول تماماً إلى بخار ماء. لاحظ درجات حرارة التحول وتغير سرعة الجزيئات.'
  },
  'energy-skate-park-basics': {
    nameAr: 'حديقة التزلج وقانون حفظ الطاقة',
    subjectAr: 'الفيزياء',
    categoryAr: 'الميكانيكا وحفظ الطاقة الميكانيكية',
    descAr: 'استكشاف حفظ الطاقة الميكانيكية لمتزلج على مسارات ومنحنيات مختلفة. فحص المخططات البيانية اللحظية للطاقة الحركية وطاقة الوضع والطاقة الحرارية.',
    learningGoalsAr: [
      'التحقق من ثبوت الطاقة الميكانيكية الكلية عند انعدام الاحتكاك',
      'تحليل طاقة الوضع عند القمة مقابل الطاقة الحركية عند القاع',
      'مراقبة تحول الطاقة الميكانيكية إلى حرارة تراكمية بفعل الاحتكاك'
    ],
    challengeAr: 'صمم مساراً منحنياً بحلقة دائرية كاملة (Loop) يكملها المتزلج بنجاح بأقل ارتفاع بداية ممكن.'
  },
  'balancing-chemical-equations': {
    nameAr: 'وزن المعادلات الكيميائية',
    subjectAr: 'الكيمياء',
    categoryAr: 'الحساب الكيميائي والتفاعلات',
    descAr: 'وزن تفاعلات التكوين، والتفكك، والاحتراق عبر ضبط المعاملات العددية. استخدام الموازين البصرية للتحقق من قانون بقاء الكتلة.',
    learningGoalsAr: [
      'إثبات بقاء المادة في التفاعلات الكيميائية (قانون لافوازييه)',
      'فهم سبب عدم جواز تعديل الأرقام السفلية للصيغ الكيميائية',
      'إتقان وزن تفاعلات احتراق الهيدروكربونات مع الأكسجين'
    ],
    challengeAr: 'العب تحدي وزن المعادلات الكيميائية وحقق 5/5 نجوم في المستوى الثاني أو الثالث!'
  },
  'forces-and-motion-basics': {
    nameAr: 'القوى والحركة وقوانين نيوتن',
    subjectAr: 'الفيزياء',
    categoryAr: 'قوانين نيوتن للحركة',
    descAr: 'استقصاء محصلة القوى، والاحتكاك، والتسارع بسحب ودفع الصناديق على أسطح مختلفة بقوى مختلفة.',
    learningGoalsAr: [
      'ربط القوة المحصلة بالتسارع: ق = ك × ت (قانون نيوتن الثاني)',
      'استقصاء الفرق بين الاحتكاك السكوني والاحتكاك الحركي',
      'مراقبة القصور الذاتي والحركة بسرعة ثابتة عند انعدام القوة المحصلة'
    ],
    challengeAr: 'احسب وتحقق من القوة الدنيا الدقيقة بالنيوتن اللازمة للتغلب على الاحتكاك السكوني لصندوق كتلته 100 كجم.'
  },
  'bending-light': {
    nameAr: 'انكسار الضوء وانعكاسه الكلي',
    subjectAr: 'الفيزياء',
    categoryAr: 'البصريات والموجات الضوئية',
    descAr: 'استكشاف انكسار وانعكاس أشعة الضوء بين الهواء والماء والزجاج والمناشير. قياس الزوايا بالمنقلة للتحقق من قانون سنيل.',
    learningGoalsAr: [
      'إثبات قانون سنيل للانكسار: معامل1 × جا(زاوية1) = معامل2 × جا(زاوية2)',
      'ملاحظة الانعكاس الكلي الداخلي عند الانتقال لوسط أقل كثافة ضوئية',
      'استكشاف تشتت الضوء الأبيض لألوان الطيف عبر المنشور الثلاثي'
    ],
    challengeAr: 'وجّه شعاع ليزر من الزجاج إلى الهواء وحدد الزاوية الحرجة التي يحدث عندها انعكاس كلي بنسبة 100%.'
  },
  'gravity-and-orbits': {
    nameAr: 'الجاذبية والمدارات الكوكبية',
    subjectAr: 'علوم الأرض والفضاء',
    categoryAr: 'علم الفلك وحركة الأجرام',
    descAr: 'التحكم في الشمس والأرض والقمر والمحطة الفضائية لمعاينة متجهات قوى التجاذب والسرعات المدارية والمسارات الكوكبية.',
    learningGoalsAr: [
      'ربط قوة الجاذبية بالكتل والمسافة المدارية (قانون الجذب العام)',
      'التمييز بين المدارات الدائرية المستقرة والمدارات الإهليلجية ومسارات الإفلات',
      'استقصاء زمن دورة القمر وديناميكا السقوط المداري'
    ],
    challengeAr: 'ضاعف كتلة النجم المركزي واضبط سرعة الأرض للحفاظ على مدار دائري مستقر دون اصطدام.'
  },
  'wave-on-a-string': {
    nameAr: 'الموجات على وتر والرنين',
    subjectAr: 'الفيزياء',
    categoryAr: 'حركة الموجات والتذبذب',
    descAr: 'توليد نبضات أو موجات توافقية متصلة على وتر. التحكم في السعة والتردد والخمود والشد لقياس سرعة الموجة وطولها.',
    learningGoalsAr: [
      'التحقق من معادلة انتشار الأمواج: السرعة = التردد × الطول الموجي',
      'رصد العقد والبطون للموجات الموقوفة والرنين التوافقي',
      'مقارنة انعكاس الموجة عند الطرف المقيد والطرف الحر'
    ],
    challengeAr: 'اضبط التردد على 2.0 هرتز مع صفر خمود واضبط الشد لإنتاج موجة موقوفة ذات 3 عُقد واضحة.'
  },
  'natural-selection': {
    nameAr: 'الانتخاب الطبيعي والتطور البيئي',
    subjectAr: 'الأحياء',
    categoryAr: 'الوراثة والتنوع الحيوي والبيئة',
    descAr: 'محاكاة الانتخاب الطبيعي في أرانب البراري والغابات والقطب الشمالي مع إدخال الطفرات والضواري.',
    learningGoalsAr: [
      'ملاحظة كيف تُدخل الطفرات الجينية أليلات جديدة في العشيرة',
      'تحليل ضغط الافتراس (الذئاب) ونقص الغذاء على البقاء',
      'تتبع تغير نسب الصفات الظاهرية عبر الأجيال المتعاقبة'
    ],
    challengeAr: 'أدخل طفرة الفراء الأبيض في البيئة القطبية مع وجود الذئاب، وراقب كيف يزيد التمويه من تكرار أليل الفراء الأبيض.'
  },
  'gene-expression-essentials': {
    nameAr: 'أساسيات التعبير الجيني وتخليق البروتين',
    subjectAr: 'الأحياء',
    categoryAr: 'البيولوجيا الجزيئية والوراثة',
    descAr: 'محاكاة نسخ الحمض النووي DNA إلى mRNA عبر بوليميراز الرنا وترجمته إلى بروتينات بواسطة الريبوسومات.',
    learningGoalsAr: [
      'تتبع ارتباط عوامل النسخ بمحفز الجين',
      'ملاحظة تخليق الرنا الرسول وترجمته بالريبوسومات السيتوبلازمية',
      'تحليل اتزان تركيز البروتينات ومعدل تحللها الخلوي'
    ],
    challengeAr: 'اضبط قوة المحفز وعوامل النسخ لتخليق أكثر من 50 جزيء بروتين دون تراكم مفرط للرنا الرسول.'
  },
  'density': {
    nameAr: 'الكثافة والطفو وقاعدة أرشميدس',
    subjectAr: 'الفيزياء',
    categoryAr: 'ميكانيكا الموائع وخواص المادة',
    descAr: 'غمر كتل مختلفة في خزانات سوائل لقياس قوة الطفو وإزاحة حجم السائل وحساب الكثافة (الكثافة = الكتلة ÷ الحجم).',
    learningGoalsAr: [
      'حساب الكثافة الحجمية للأجسام الصلبة المنتظمة وغير المنتظمة',
      'تطبيق قاعدة أرشميدس: قوة الطفو تساوي وزن السائل المزاح',
      'التنبؤ بطفو الأجسام أو غوصها أو تعلّقها بالسوائل'
    ],
    challengeAr: 'قِس كتلة الكتل المجهولة الخمس وحجم الماء المزاح لاستنتاج مادة كل كتلة بدقة.'
  },
  'ph-scale-basics': {
    nameAr: 'مقياس الرقم الهيدروجيني (pH)',
    subjectAr: 'الكيمياء',
    categoryAr: 'الأحماض والقواعد والمحاليل المائية',
    descAr: 'اختبار درجة حموضة القهوة والدم وحمض البطارية والماء النقي. إضافة الماء لمراقبة أثر التخفيف على تركيز الأيونات.',
    learningGoalsAr: [
      'فهم تدريج مقياس pH من 0 إلى 14 مع نقطة التعادل 7.0',
      'تصنيف المواد الشائعة إلى أحماض وقواعد قوية وضعيفة',
      'إثبات كيف يؤدي تخفيف المحلول الحمضي لتقريب الرقم الهيدروجيني من 7'
    ],
    challengeAr: 'ضع 0.5 لتر من القهوة (pH 5.0) ثم أضف ماء نقياً حتى يصل الخليط إلى pH 5.5 واحسب نسبة التخفيف.'
  },
  'molecule-shapes': {
    nameAr: 'أشكال الجزيئات ونظرية تنافر الإلكترونات (VSEPR)',
    subjectAr: 'الكيمياء',
    categoryAr: 'الروابط الكيميائية والشكل الفراغي',
    descAr: 'بناء جزيئات ثلاثية الأبعاد بروابط أحادية وثنائية وثلاثية وأزواج إلكترونات حرة وقياس زوايا الروابط في فضاء 3D.',
    learningGoalsAr: [
      'التنبؤ بالشكل الهندسي الفراغي: خطي، منحني، مثلث مستوٍ، رباعي الأوجه',
      'التمييز بين التوزيع الإلكتروني والشكل الفراغي الحقيقي للجزيء',
      'معاينة كيف يضغط تنافر الأزواج الحرة زوايا الروابط الكيميائية'
    ],
    challengeAr: 'ابنِ جزيئات الميثان والنشادر والماء، وقارن كيف تضغط الأزواج الحرة زوايا الروابط من 109.5° حتى 104.5°.'
  },
  'pendulum-lab': {
    nameAr: 'مختبر البندول البسيط والتذبذب',
    subjectAr: 'الفيزياء',
    categoryAr: 'الحركة الدورية والاهتزازية',
    descAr: 'أرجحة بندولين في وقت واحد. اكتشف كيف يعتمد زمن الدورة على طول الخيط وكتلة الثقل وزاوية الإطلاق وعجلة الجاذبية.',
    learningGoalsAr: [
      'تحديد العوامل المؤثرة في الزمن الدوري للبندول: ز = 2 ط √(ل / جـ)',
      'إثبات أن كتلة الثقل لا تؤثر إطلاقاً على زمن دورة البندول البسيط',
      'مقارنة حركة البندول على الأرض والقمر والمشتري'
    ],
    challengeAr: 'اضبط طول خيط البندول بدقة ليكون نصف زمن دورته ثانية واحدة بالضبط (مثل دقة ساعات الحائط الكلاسيكية).'
  },
  'faradays-law': {
    nameAr: 'قانون فاراداي والحث الكهرومغناطيسي',
    subjectAr: 'الفيزياء',
    categoryAr: 'الكهرومغناطيسية والتيار الحثي',
    descAr: 'تحريك مغناطيس دائم داخل ملفات أسلاك لإضاءة مصباح وتحريك مؤشر الفولتميتر والتحقق من قانون لينز.',
    learningGoalsAr: [
      'اكتشاف أن تغير التدفق المغناطيسي يولد قوة دافعة كهربائية حثية',
      'ربط عدد لفات الملف بمقدار الجهد الكهربائي المتولد',
      'إثبات أن زيادة سرعة حركة المغناطيس تضاعف شدة التيار الحثي'
    ],
    challengeAr: 'حرّك المغناطيس في ملف اللفتين مقابل ملف الأربع لفات بنفس السرعة وقارن انحراف المؤشر.'
  },
  'greenhouse-effect': {
    nameAr: 'ظاهرة الاحتباس الحراري والمناخ',
    subjectAr: 'علوم الأرض والفضاء',
    categoryAr: 'فيزياء الغلاف الجوي والمناخ',
    descAr: 'استكشاف كيف تمتص جزيئات الغازات الدفيئة (CO₂، CH₄، H₂O) الفوتونات تحت الحمراء وتدفئ سطح الأرض.',
    learningGoalsAr: [
      'التمييز بين الضوء المرئي القادم من الشمس والأشعة تحت الحمراء المنبعثة من الأرض',
      'مقارنة درجات الحرارة الجوية بين العصر الجليدي وعام 1750 واليوم',
      'تحليل أثر الغطاء السحابي وتركيز الغازات على ميزانية الطاقة الكوكبية'
    ],
    challengeAr: 'زد تركيز الغازات الدفيئة من العصر الجليدي إلى المستويات المعاصرة وسجل مقدار الارتفاع في درجات الحرارة.'
  },
  'hookes-law': {
    nameAr: 'قانون هوك وقوة النابض المرن',
    subjectAr: 'الفيزياء',
    categoryAr: 'المرونة وقوة الإرجاع',
    descAr: 'شد وضغط النوابض المرنة واستكشاف العلاقة المباشرة بين القوة المؤثرة، وقوة الإرجاع، وثابت الصلابة، والإزاحة.',
    learningGoalsAr: [
      'التحقق من قانون هوك: ق = - ث × س',
      'رسم بياني للقوة مقابل الإزاحة لحساب ثابت صلابة النابض',
      'مقارنة ثوابت الصلابة عند توصيل النوابض على التوالي والتوازي'
    ],
    challengeAr: 'اضبط ثابت النابض على 200 نيوتن/متر وطبق قوة إزاحة 60 نيوتن وتحقق من الاستطالة بالمسطرة الافتراضية.'
  },
  'color-vision': {
    nameAr: 'رؤية الألوان ومزج أضواء RGB',
    subjectAr: 'الفيزياء',
    categoryAr: 'البصريات والأطوال الموجية وإدراك العين',
    descAr: 'مزج حزم الأضواء الأساسية الحمراء والخضراء والزرقاء لإنتاج ألوان الطيف. استكشاف خلايا المخاريط البصرية في العين.',
    learningGoalsAr: [
      'فهم خلط الألوان الإضافي في الضوء (RGB)',
      'محاكاة كيف ترسل مستقبلات المخاريط في شبكية العين إشارات الألوان للدماغ',
      'ملاحظة امتصاص وترشيح الضوء عبر المرشحات اللونية'
    ],
    challengeAr: 'امزج الشعاعين الأحمر والأخضر بكثافة 100% مع صفر أزرق لمشاهدة اللون الأصفر النقي.'
  },
  'friction': {
    nameAr: 'الاحتكاك على المستوى الذري',
    subjectAr: 'الفيزياء',
    categoryAr: 'الديناميكا الحرارية والشبكة البلورية',
    descAr: 'حك كتابين ببعضهما وفحص سطح التلامس مجهرياً على مستوى الذرات لمعاينة تحول طاقة الحركة لاحتكاك وحرارة.',
    learningGoalsAr: [
      'ملاحظة انتقال الطاقة الحركية الميكانيكية إلى اهتزازات ذرية مجهرية',
      'ربط سعة اهتزاز الذرات بارتفاع درجة الحرارة',
      'ملاحظة انفصال الذرات عند تجاوز قوى الاحتكاك للروابط الجزيئية'
    ],
    challengeAr: 'قم بحك السطحين بسرعة فائقة حتى تنفصل ذرات فردية عن الشبكة السطحية.'
  },
  'under-pressure': {
    nameAr: 'الضغط الهيدروستاتيكي وتدفق السوائل',
    subjectAr: 'الفيزياء',
    categoryAr: 'ميكانيكا الموائع والضغط',
    descAr: 'استكشاف ضغط الموائع في الماء والبنزين والعسل. اكتشف كيف يتغير الضغط مع كثافة السائل والعمق والجاذبية والضغط الجوي.',
    learningGoalsAr: [
      'التحقق من قانون الضغط الهيدروستاتيكي: ض = ض_جوي + ك × جـ × ع',
      'إثبات أن ضغط السائل يعتمد فقط على العمق وليس على شكل الإناء',
      'مقارنة الضغط بين كواكب الأرض والمريخ والمشتري'
    ],
    challengeAr: 'قِس الضغط عند عمق 3 أمتار في الماء مقابل البنزين والعسل واحسب نسبة الكثافة.'
  },
  'concentration': {
    nameAr: 'تركيز المحاليل والمولارية',
    subjectAr: 'الكيمياء',
    categoryAr: 'المحاليل والتركيز المولي',
    descAr: 'إذابة مساحيق مختلفة في الماء لقياس المولارية (مول/لتر). تبخير الماء أو تخفيفه لمعاينة الوصول لحد التشبع وترسب البلورات.',
    learningGoalsAr: [
      'حساب التركيز المولاري: المولارية = عدد المولات ÷ حجم المحلول باللتر',
      'ملاحظة حدود التشبع التي يبدأ عندها المذاب بالترسب في القاع',
      'إثبات كيف يؤدي تبخير المذيب لزيادة تركيز المحلول'
    ],
    challengeAr: 'أذب المسحوق حتى تصل لحد التشبع التام ثم بخر 0.2 لتر من الماء وراقب بدء تكوّن البلورات المترسبة.'
  }
};

// ======================== PHET INTERACTIVE SCIENCE SIMULATIONS ========================
const PHET_SIMULATIONS = [
  {
    id: 'circuit-construction-kit-dc',
    name: 'Circuit Construction Kit: DC',
    subject: 'Physics',
    category: 'Electricity & Circuits',
    grades: [4, 5, 6, 7, 8, 9, 10, 11, 12],
    embedUrl: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html',
    icon: 'fa-bolt',
    color: '#F59E0B',
    featured: true,
    desc: 'Build circuits with batteries, light bulbs, resistors, and switches. Measure current and voltage using lifelike ammeters and voltmeters.',
    learningGoals: [
      'Construct functional series and parallel circuits with live electron flow',
      'Verify Ohm’s Law (V = I × R) across varying resistances',
      'Test electrical conductivity and resistivity of everyday materials'
    ],
    challenge: 'Build a parallel circuit with 2 light bulbs and 1 switch that controls only one bulb without turning off the other. Compare the current in each branch.'
  },
  {
    id: 'build-an-atom',
    name: 'Build an Atom',
    subject: 'Chemistry',
    category: 'Atomic Structure & Isotopes',
    grades: [6, 7, 8, 9, 10, 11, 12],
    embedUrl: 'https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_all.html',
    icon: 'fa-atom',
    color: '#10B981',
    featured: true,
    desc: 'Assemble protons, neutrons, and electrons to construct chemical elements on the periodic table. Inspect net charge, mass number, and nuclear stability.',
    learningGoals: [
      'Relate proton count directly to element identity on the periodic table',
      'Calculate net atomic charge based on proton and electron imbalance',
      'Distinguish neutral atoms from positive cations and negative anions'
    ],
    challenge: 'Build a neutral, stable Carbon-12 atom, then add one neutron to synthesize Carbon-13, and remove an electron to create a C⁺ cation.'
  },
  {
    id: 'states-of-matter-basics',
    name: 'States of Matter: Basics',
    subject: 'Chemistry',
    category: 'Thermodynamics & Phase Changes',
    grades: [4, 5, 6, 7, 8, 9, 10, 11, 12],
    embedUrl: 'https://phet.colorado.edu/sims/html/states-of-matter-basics/latest/states-of-matter-basics_all.html',
    icon: 'fa-fire-flame-curved',
    color: '#EF4444',
    featured: true,
    desc: 'Heat, cool, and compress atoms and molecules. Watch Neon, Argon, Oxygen, and Water transition between solid, liquid, and gas phases.',
    learningGoals: [
      'Connect temperature to molecular kinetic velocity and lattice vibration',
      'Compare particle spacing and intermolecular bonds across solid, liquid, and gas phases',
      'Observe the anomalous crystalline structure expansion of solid ice compared to liquid water'
    ],
    challenge: 'Heat ice at 0 K until it vaporizes completely into steam. Notice the temperature transitions and atomic velocity changes.'
  },
  {
    id: 'energy-skate-park-basics',
    name: 'Energy Skate Park: Basics',
    subject: 'Physics',
    category: 'Mechanics & Conservation of Energy',
    grades: [4, 5, 6, 7, 8, 9, 10, 11, 12],
    embedUrl: 'https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_all.html',
    icon: 'fa-person-skating',
    color: '#3B82F6',
    featured: true,
    desc: 'Explore conservation of mechanical energy with a skater on ramps and curved tracks. View real-time kinetic, potential, and thermal energy bar graphs.',
    learningGoals: [
      'Observe total mechanical energy remaining constant when friction is zero',
      'Analyze potential energy (PE = mgh) at apex vs kinetic energy (KE = ½mv²) at nadir',
      'Observe mechanical energy converting into thermal friction energy as heat accumulates'
    ],
    challenge: 'Design a curved track with a loop-the-loop where the skater completes the full loop without falling, using the minimal starting drop height.'
  },
  {
    id: 'balancing-chemical-equations',
    name: 'Balancing Chemical Equations',
    subject: 'Chemistry',
    category: 'Stoichiometry & Reactions',
    grades: [8, 9, 10, 11, 12],
    embedUrl: 'https://phet.colorado.edu/sims/html/balancing-chemical-equations/latest/balancing-chemical-equations_all.html',
    icon: 'fa-vial',
    color: '#8B5CF6',
    featured: true,
    desc: 'Balance synthesis, decomposition, and combustion reactions by adjusting integer coefficients. Use balance scales to verify conservation of mass.',
    learningGoals: [
      'Demonstrate that matter is conserved in chemical reactions (Lavoisier’s Law)',
      'Understand why subscripts cannot be altered when balancing coefficients',
      'Master balancing combustion reactions involving hydrocarbons and diatomic oxygen'
    ],
    challenge: 'Play the chemical balancing challenge game and score a perfect 5/5 stars on Level 2 or Level 3!'
  },
  {
    id: 'forces-and-motion-basics',
    name: 'Forces and Motion: Basics',
    subject: 'Physics',
    category: 'Newton’s Laws of Motion',
    grades: [4, 5, 6, 7, 8, 9, 10, 11, 12],
    embedUrl: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html',
    icon: 'fa-arrows-left-right',
    color: '#EC4899',
    featured: false,
    desc: 'Investigate net force, friction, acceleration, and Newton’s laws of motion by pulling wagons and pushing crates across surfaces with friction.',
    learningGoals: [
      'Relate net unbalanced force to acceleration: F_net = m × a (Newton’s 2nd Law)',
      'Investigate static friction thresholds vs kinetic friction resistance',
      'Observe inertia and constant speed when net horizontal force is zero'
    ],
    challenge: 'Calculate and verify the exact threshold force in Newtons required to overcome static friction on a 100 kg crate.'
  },
  {
    id: 'bending-light',
    name: 'Bending Light (Refraction & Reflection)',
    subject: 'Physics',
    category: 'Optics & Wave Mechanics',
    grades: [7, 8, 9, 10, 11, 12],
    embedUrl: 'https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_all.html',
    icon: 'fa-wand-magic-sparkles',
    color: '#06B6D4',
    featured: false,
    desc: 'Explore the refraction and reflection of light rays passing between air, water, glass, and mystery prisms. Measure angles with protractors to verify Snell’s Law.',
    learningGoals: [
      'Demonstrate Snell’s law: n₁ sin(θ₁) = n₂ sin(θ₂)',
      'Observe Total Internal Reflection (TIR) when incident from high to low index of refraction',
      'Observe chromatic dispersion of white light into spectrum rainbow colors through triangular prisms'
    ],
    challenge: 'Direct a laser from glass (n = 1.50) into air (n = 1.00) and find the critical angle where 100% of light undergoes Total Internal Reflection.'
  },
  {
    id: 'gravity-and-orbits',
    name: 'Gravity and Orbits',
    subject: 'Earth & Space',
    category: 'Astronomy & Gravitation',
    grades: [5, 6, 7, 8, 9, 10, 11, 12],
    embedUrl: 'https://phet.colorado.edu/sims/html/gravity-and-orbits/latest/gravity-and-orbits_all.html',
    icon: 'fa-earth-americas',
    color: '#10B981',
    featured: true,
    desc: 'Manipulate the Sun, Earth, Moon, and space station to visualize gravitational force vectors, orbital velocities, and planetary motion.',
    learningGoals: [
      'Relate gravitational force to masses and orbital radius (Newton’s Universal Gravitation)',
      'Differentiate stable circular orbits from elliptical or open escape paths',
      'Investigate lunar orbit periods and orbital decay mechanics'
    ],
    challenge: 'Double the mass of the central star and adjust Earth’s tangential speed to maintain a stable circular orbit without crashing.'
  },
  {
    id: 'wave-on-a-string',
    name: 'Wave on a String',
    subject: 'Physics',
    category: 'Waves, Resonance & Harmonics',
    grades: [6, 7, 8, 9, 10, 11, 12],
    embedUrl: 'https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_all.html',
    icon: 'fa-water',
    color: '#0284C7',
    featured: false,
    desc: 'Generate pulses or continuous harmonic waves on a string. Control amplitude, frequency, damping, and tension to measure wave speed and wavelength.',
    learningGoals: [
      'Verify the wave propagation speed equation: v = f × λ',
      'Observe standing wave nodes, antinodes, and harmonic resonances',
      'Compare fixed boundary phase inversion with free end non-inverting reflection'
    ],
    challenge: 'Set oscillator frequency to 2.0 Hz with zero damping and tune string tension to create a clean 3-node standing wave pattern.'
  },
  {
    id: 'natural-selection',
    name: 'Natural Selection',
    subject: 'Biology',
    category: 'Genetics, Evolution & Ecology',
    grades: [7, 8, 9, 10, 11, 12],
    embedUrl: 'https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_all.html',
    icon: 'fa-dna',
    color: '#16A34A',
    featured: true,
    desc: 'Simulate natural selection in rabbit populations across temperate grassland and arctic biomes. Introduce mutations and environmental selection pressures.',
    learningGoals: [
      'Observe how gene mutations introduce new alleles into a population',
      'Analyze predator selection pressure (wolves) and food scarcity selection',
      'Track changes in phenotypic ratios and population survival curves over generations'
    ],
    challenge: 'Introduce white fur mutation in the arctic tundra biome with wolves present. Observe how camouflage causes white fur allele frequency to rise.'
  },
  {
    id: 'gene-expression-essentials',
    name: 'Gene Expression Essentials',
    subject: 'Biology',
    category: 'Molecular Biology & Genetics',
    grades: [9, 10, 11, 12],
    embedUrl: 'https://phet.colorado.edu/sims/html/gene-expression-essentials/latest/gene-expression-essentials_all.html',
    icon: 'fa-virus',
    color: '#A855F7',
    featured: false,
    desc: 'Simulate the central dogma of genetics: transcribe DNA into mRNA via RNA polymerase and translate mRNA into fluorescent proteins with ribosomes.',
    learningGoals: [
      'Trace transcription factor binding to gene promoter sequences',
      'Observe mRNA synthesis and subsequent translation by cytoplasmic ribosomes',
      'Analyze protein degradation and transcription factor concentration equilibrium'
    ],
    challenge: 'Tune transcription factor affinity and promoter strength to synthesize over 50 fluorescent protein molecules without excessive mRNA backlog.'
  },
  {
    id: 'density',
    name: 'Density & Buoyancy',
    subject: 'Physics',
    category: 'Fluid Mechanics & Material Science',
    grades: [4, 5, 6, 7, 8, 9, 10, 11, 12],
    embedUrl: 'https://phet.colorado.edu/sims/html/density/latest/density_all.html',
    icon: 'fa-scale-balanced',
    color: '#EAB308',
    featured: false,
    desc: 'Submerge custom blocks into water tanks to observe buoyant force, water volume displacement, and calculate density (ρ = mass / volume).',
    learningGoals: [
      'Calculate volumetric density ρ = m / V for regular and irregular solids',
      'State Archimedes’ Principle: buoyant force equals weight of displaced liquid',
      'Predict whether an object will sink, float, or remain neutrally buoyant'
    ],
    challenge: 'Measure mass and water volume displacement for the 5 mystery blocks to deduce the exact material of each block.'
  },
  {
    id: 'ph-scale-basics',
    name: 'pH Scale: Basics',
    subject: 'Chemistry',
    category: 'Acids, Bases & Aqueous Solutions',
    grades: [6, 7, 8, 9, 10, 11, 12],
    embedUrl: 'https://phet.colorado.edu/sims/html/ph-scale-basics/latest/ph-scale-basics_all.html',
    icon: 'fa-droplet',
    color: '#D946EF',
    featured: false,
    desc: 'Test the pH of coffee, saliva, drain cleaner, blood, spit, and battery acid. Add water to observe dilution effects on logarithmic ion concentration.',
    learningGoals: [
      'Understand the 0–14 pH scale with neutral water at pH 7.0',
      'Categorize everyday household substances as strong or weak acids and bases',
      'Demonstrate how diluting an acidic solution shifts its pH toward 7'
    ],
    challenge: 'Pour 0.50 L of coffee (pH 5.0). Add pure water until the mixture reaches pH 5.5. Calculate the volume ratio needed.'
  },
  {
    id: 'molecule-shapes',
    name: 'Molecule Shapes (VSEPR Theory)',
    subject: 'Chemistry',
    category: 'Chemical Bonding & Geometry',
    grades: [9, 10, 11, 12],
    embedUrl: 'https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_all.html',
    icon: 'fa-cubes',
    color: '#6366F1',
    featured: false,
    desc: 'Build 3D molecules by attaching single, double, and triple bonds with lone electron pairs. Rotate molecules in 3D WebGL space and measure bond angles.',
    learningGoals: [
      'Predict 3D molecular geometry: Linear, Bent, Trigonal Planar, Tetrahedral, Trigonal Bipyramidal, Octahedral',
      'Distinguish electron domain geometry from actual molecular shape',
      'Demonstrate how lone pair repulsion compresses bonded angle values'
    ],
    challenge: 'Construct methane (CH₄), ammonia (NH₃), and water (H₂O). Compare how lone pairs compress the bond angles from 109.5° down to 104.5°.'
  },
  {
    id: 'pendulum-lab',
    name: 'Pendulum Lab',
    subject: 'Physics',
    category: 'Periodic Motion & Oscillations',
    grades: [6, 7, 8, 9, 10, 11, 12],
    embedUrl: 'https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_all.html',
    icon: 'fa-clock',
    color: '#14B8A6',
    featured: false,
    desc: 'Swing 1 or 2 pendulums simultaneously. Discover how oscillation period depends on string length, bob mass, release angle, and gravitational acceleration.',
    learningGoals: [
      'Determine factors affecting period: T = 2π√(L/g)',
      'Confirm that bob mass does NOT affect the period of a simple pendulum',
      'Compare pendulum behavior on Earth (g = 9.8 m/s²), the Moon, Jupiter, and Planet X'
    ],
    challenge: 'Calibrate a pendulum with a length that creates an exact 1.00-second half-period (a grandfather clock second tick).'
  },
  {
    id: 'faradays-law',
    name: 'Faraday’s Electromagnetic Lab',
    subject: 'Physics',
    category: 'Electromagnetism & Induction',
    grades: [8, 9, 10, 11, 12],
    embedUrl: 'https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law_all.html',
    icon: 'fa-magnet',
    color: '#F97316',
    featured: false,
    desc: 'Move a permanent bar magnet through wire coils to light up a light bulb and deflect a voltmeter. Investigate Lenz’s Law and electromagnetic induction.',
    learningGoals: [
      'Discover that changing magnetic flux induces electromotive force (EMF)',
      'Relate number of coil loops to magnitude of induced voltage',
      'Demonstrate that faster magnet speed produces higher induced current'
    ],
    challenge: 'Pass the magnet through the 2-loop coil vs the 4-loop coil at equal speed and observe the difference in voltmeter deflection.'
  },
  {
    id: 'greenhouse-effect',
    name: 'Greenhouse Effect',
    subject: 'Earth & Space',
    category: 'Atmospheric Physics & Climate',
    grades: [5, 6, 7, 8, 9, 10, 11, 12],
    embedUrl: 'https://phet.colorado.edu/sims/html/greenhouse-effect/latest/greenhouse-effect_all.html',
    icon: 'fa-temperature-arrow-up',
    color: '#EA580C',
    featured: false,
    desc: 'Explore how greenhouse gas molecules (CO₂, CH₄, H₂O) absorb and re-emit infrared photons to warm Earth’s surface from the Ice Age to today.',
    learningGoals: [
      'Differentiate incoming solar visible light from outgoing terrestrial infrared radiation',
      'Compare atmospheric temperatures across the Ice Age, 1750 Pre-Industrial, and Today',
      'Analyze how cloud cover and atmospheric concentrations alter planetary energy balance'
    ],
    challenge: 'Ramp atmospheric greenhouse gas concentration from Ice Age to modern levels and record the global surface temperature increase.'
  },
  {
    id: 'hookes-law',
    name: 'Hooke’s Law & Spring Force',
    subject: 'Physics',
    category: 'Elasticity & Harmonic Force',
    grades: [7, 8, 9, 10, 11, 12],
    embedUrl: 'https://phet.colorado.edu/sims/html/hookes-law/latest/hookes-law_all.html',
    icon: 'fa-arrows-split-up-and-left',
    color: '#059669',
    featured: false,
    desc: 'Stretch and compress springs to investigate the direct relationship between applied force, restorative spring force, spring constant, and displacement.',
    learningGoals: [
      'Verify Hooke’s law: F_s = -k × x',
      'Plot force vs displacement to calculate spring stiffness constant k',
      'Compare effective spring constants for springs connected in series vs parallel'
    ],
    challenge: 'Set spring constant to 200 N/m. Apply 60 N of displacement force and verify the exact displacement with the virtual ruler.'
  },
  {
    id: 'color-vision',
    name: 'Color Vision & RGB Light',
    subject: 'Physics',
    category: 'Optics, Wavelength & Human Perception',
    grades: [4, 5, 6, 7, 8, 9, 10, 11, 12],
    embedUrl: 'https://phet.colorado.edu/sims/html/color-vision/latest/color-vision_all.html',
    icon: 'fa-eye',
    color: '#8B5CF6',
    featured: false,
    desc: 'Mix Red, Green, and Blue primary light beams to produce any color in the rainbow. Explore human cone photoreceptors and monochromatic light filters.',
    learningGoals: [
      'Understand additive color mixing in light (RGB)',
      'Simulate how red, green, and blue cone receptors in the retina send color signals to the brain',
      'Observe light subtraction through colored optical absorption filters'
    ],
    challenge: 'Combine Red and Green beams at 100% intensity with zero Blue to see pure perceived Yellow light.'
  },
  {
    id: 'friction',
    name: 'Friction at Atomic Scale',
    subject: 'Physics',
    category: 'Thermodynamics & Atomic Lattice',
    grades: [4, 5, 6, 7, 8, 9, 10, 11, 12],
    embedUrl: 'https://phet.colorado.edu/sims/html/friction/latest/friction_all.html',
    icon: 'fa-hand-sparkles',
    color: '#DC2626',
    featured: false,
    desc: 'Rub two books together and examine the contact surface at the microscopic atomic level. Watch atoms vibrate faster as mechanical friction turns into heat.',
    learningGoals: [
      'Observe macroscopic mechanical friction transferring kinetic energy into microscopic atomic vibration',
      'Relate lattice vibration amplitude to thermal temperature',
      'Observe atomic wear and tear when friction forces exceed atomic bonds'
    ],
    challenge: 'Rub the book surfaces rapidly until individual atoms break away from the surface lattice.'
  },
  {
    id: 'under-pressure',
    name: 'Under Pressure (Fluid Dynamics)',
    subject: 'Physics',
    category: 'Fluids & Hydrostatic Pressure',
    grades: [6, 7, 8, 9, 10, 11, 12],
    embedUrl: 'https://phet.colorado.edu/sims/html/under-pressure/latest/under-pressure_all.html',
    icon: 'fa-gauge-high',
    color: '#0284C7',
    featured: false,
    desc: 'Explore fluid pressure in water, gasoline, and honey. Discover how pressure changes with fluid density, depth, gravity, and atmospheric pressure.',
    learningGoals: [
      'Verify hydrostatic pressure formula: P = P_atm + ρ × g × h',
      'Observe that fluid pressure depends solely on depth, not the shape of the container',
      'Compare pressure on Earth vs Mars vs Jupiter'
    ],
    challenge: 'Measure pressure at 3 meters depth in water vs gasoline vs honey and calculate the density ratio.'
  },
  {
    id: 'concentration',
    name: 'Solution Concentration',
    subject: 'Chemistry',
    category: 'Solutions & Molarity',
    grades: [7, 8, 9, 10, 11, 12],
    embedUrl: 'https://phet.colorado.edu/sims/html/concentration/latest/concentration_all.html',
    icon: 'fa-flask',
    color: '#0D9488',
    featured: false,
    desc: 'Dissolve solid drink mix, cobalt chloride, or potassium permanganate in water to measure solution molarity (mol/L). Evaporate water or dilute to observe saturation.',
    learningGoals: [
      'Calculate molar concentration M = moles of solute / liters of solution',
      'Observe saturation limits where solute precipitates as crystals',
      'Demonstrate how solvent evaporation increases solution concentration'
    ],
    challenge: 'Dissolve drink mix until reaching saturation, then evaporate 0.2 L of water and count precipitate crystal formation.'
  }
];

// PhET Science Lab State
let phetActiveSimId = null;
let phetSubjectFilter = 'all'; // 'all' | 'Physics' | 'Chemistry' | 'Biology' | 'Earth & Space'
let phetGradeFilter = 'all';
let phetSearchQuery = '';
let phetOnlyFavorites = false;
let phetShowNotebook = true;
let learnActiveTab = 'science'; // 'science' | 'math'
let phetNotesDebounceTimer = null;

function phetLaunchSim(simId) {
  phetActiveSimId = simId;
  SFX.click();
  if (currentView !== 'science' && currentView !== 'learn') {
    navigate('science');
  } else {
    renderView(currentView);
  }
}

function phetCloseSim() {
  phetActiveSimId = null;
  SFX.click();
  renderView(currentView === 'learn' ? 'learn' : 'science');
}

function phetToggleFullscreen() {
  const container = document.getElementById('phet-frame-container');
  if (!container) return;
  if (!document.fullscreenElement) {
    container.requestFullscreen?.() || container.webkitRequestFullscreen?.();
  } else {
    document.exitFullscreen?.() || document.webkitExitFullscreen?.();
  }
}

function phetReloadSim() {
  const iframe = document.getElementById('phet-sim-iframe');
  const loader = document.getElementById('phet-loader');
  if (!iframe) return;
  if (loader) loader.style.opacity = '1';
  iframe.src = iframe.src;
}

function phetToggleNotebook() {
  phetShowNotebook = !phetShowNotebook;
  renderView(currentView === 'learn' ? 'learn' : 'science');
}

function phetToggleFavorite(simId) {
  let favs = Store.get('phetFavorites') || [];
  if (favs.includes(simId)) {
    favs = favs.filter(id => id !== simId);
    toast('Removed simulation from bookmarks', 'info');
  } else {
    favs.push(simId);
    SFX.click();
    toast('Bookmarked simulation for quick access! ⭐', 'success');
  }
  Store.set('phetFavorites', favs);
  renderView(currentView === 'learn' ? 'learn' : 'science');
}

function phetSaveNotes(simId, val) {
  clearTimeout(phetNotesDebounceTimer);
  phetNotesDebounceTimer = setTimeout(() => {
    let notes = Store.get('phetLabNotes') || {};
    notes[simId] = val;
    Store.set('phetLabNotes', notes);
    const indicator = document.getElementById('phet-save-status');
    if (indicator) {
      indicator.textContent = 'Auto-saved ✓';
      setTimeout(() => { if (indicator) indicator.textContent = ''; }, 2000);
    }
  }, 400);
}

function phetToggleGoal(simId, idx) {
  let goals = Store.get('phetCompletedGoals') || {};
  if (!goals[simId]) goals[simId] = [];
  if (goals[simId].includes(idx)) {
    goals[simId] = goals[simId].filter(i => i !== idx);
  } else {
    goals[simId].push(idx);
    SFX.click();
  }
  Store.set('phetCompletedGoals', goals);
  renderView(currentView === 'learn' ? 'learn' : 'science');
}

function phetCompleteLab(simId) {
  let completed = Store.get('phetCompletedLabs') || [];
  if (completed.includes(simId)) {
    toast('Lab experiment already completed!', 'info');
    return;
  }
  completed.push(simId);
  Store.set('phetCompletedLabs', completed);
  Store.addXP(25);
  completeQuest('resource');
  SFX.complete();
  spawnP(document.getElementById('phet-frame-container'), ['#4ECDC4', '#FFD93D', '#FF8C42', '#22C55E']);
  toast('Lab Experiment Completed! +25 XP awarded 🎉', 'success');
  renderView(currentView === 'learn' ? 'learn' : 'science');
}

function phetOnFrameLoad() {
  const loader = document.getElementById('phet-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => { if (loader) loader.style.display = 'none'; }, 350);
  }
}

// Renders the Science Content (Workbench or Catalog)
function renderScienceContent(mountEl) {
  if (!mountEl) return;
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const user = Store.get('user') || { grade: 2 };
  const userGrade = user.grade || 2;
  const favs = Store.get('phetFavorites') || [];
  const completedLabs = Store.get('phetCompletedLabs') || [];
  const activeSim = phetActiveSimId ? PHET_SIMULATIONS.find(s => s.id === phetActiveSimId) : null;

  // 1. ACTIVE WORKBENCH VIEW
  if (activeSim) {
    const isFav = favs.includes(activeSim.id);
    const isCompleted = completedLabs.includes(activeSim.id);
    const savedNotes = (Store.get('phetLabNotes') || {})[activeSim.id] || '';
    const completedGoals = (Store.get('phetCompletedGoals') || {})[activeSim.id] || [];
    const arData = PHET_ARABIC_DATA[activeSim.id] || {};
    const simName = (isAr && arData.nameAr) || activeSim.name;
    const simCategory = (isAr && arData.categoryAr) || activeSim.category;
    const simSubject = (isAr && arData.subjectAr) || activeSim.subject;
    const simChallenge = (isAr && arData.challengeAr) || activeSim.challenge;
    const simGoals = (isAr && arData.learningGoalsAr) || activeSim.learningGoals;

    mountEl.innerHTML = `
      <div class="science-workbench">
        <div class="science-workbench-bar">
          <div class="science-wb-title-group">
            <button class="btn btn-secondary btn-sm" onclick="phetCloseSim()" title="${isAr ? 'العودة لجميع التجارب والمعامل' : 'Return to Simulations Catalog'}">
              <i class="fas ${isAr ? 'fa-arrow-right' : 'fa-arrow-left'}"></i> ${isAr ? 'جميع المعامل' : 'All Labs'}
            </button>
            <div style="display:flex; align-items:center; gap:10px;">
              <div class="science-sim-icon-box" style="background:${activeSim.color}22; color:${activeSim.color};">
                <i class="fas ${activeSim.icon}"></i>
              </div>
              <div>
                <div style="font-weight:800; font-size:16px;">${escHtml(simName)}</div>
                <div style="font-size:12px; color:var(--text2); display:flex; align-items:center; gap:8px;">
                  <span class="tag" style="background:${activeSim.color}1A; color:${activeSim.color}; font-size:10px; padding:1px 6px;">${simSubject}</span>
                  <span>${simCategory}</span>
                  <span>&middot;</span>
                  <span>${isAr ? `الصفوف ${activeSim.grades[0]}–${activeSim.grades[activeSim.grades.length - 1]}` : `Grades ${activeSim.grades[0]}–${activeSim.grades[activeSim.grades.length - 1]}`}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="science-wb-actions">
            <button class="btn btn-sm btn-secondary" onclick="phetToggleNotebook()" title="${isAr ? 'إظهار أو إخفاء دفتر المعمل' : 'Toggle Inquiry Notebook panel'}">
              <i class="fas fa-book-open"></i> <span>${phetShowNotebook ? (isAr ? 'إخفاء الدفتر' : 'Hide Notebook') : (isAr ? 'فتح الدفتر' : 'Open Notebook')}</span>
            </button>
            <button class="btn btn-sm btn-secondary" onclick="phetReloadSim()" title="${isAr ? 'إعادة تحميل المحاكاة' : 'Reload simulation state'}">
              <i class="fas fa-rotate-right"></i> <span>${isAr ? 'إعادة تحميل' : 'Reload'}</span>
            </button>
            <button class="btn btn-sm btn-secondary" onclick="phetToggleFullscreen()" title="${isAr ? 'وضع ملء الشاشة' : 'Fullscreen mode'}">
              <i class="fas fa-expand"></i> <span>${isAr ? 'ملء الشاشة' : 'Fullscreen'}</span>
            </button>
            <button class="btn btn-sm ${isFav ? 'btn-warning' : 'btn-secondary'}" onclick="phetToggleFavorite('${activeSim.id}')" title="${isFav ? (isAr ? 'إزالة من المفضلة' : 'Remove bookmark') : (isAr ? 'إضافة للمفضلة' : 'Bookmark simulation')}">
              <i class="fas fa-star" style="${isFav ? 'color:#F59E0B;' : ''}"></i>
            </button>
            <a href="${activeSim.embedUrl}" target="_blank" rel="noopener" class="btn btn-sm btn-ghost" title="${isAr ? 'فتح مباشرة من موقع PhET الرسمي' : 'Open directly from PhET (colorado.edu)'}">
              <i class="fas fa-external-link-alt"></i>
            </a>
          </div>
        </div>

        <div class="science-workbench-layout ${phetShowNotebook ? 'with-notebook' : ''}">
          <!-- Simulation Interactive Iframe Stage -->
          <div class="science-frame-container" id="phet-frame-container">
            <div class="science-iframe-loader" id="phet-loader">
              <div class="spinner"></div>
              <div style="font-weight:700; font-size:14px;">${isAr ? `جاري تحميل ${escHtml(simName)}...` : `Loading ${escHtml(activeSim.name)}...`}</div>
              <div style="font-size:12px; color:var(--text2);">${isAr ? 'محاكاة تفاعلية من PhET بتقنية HTML5' : 'Interactive PhET HTML5 Simulation'}</div>
            </div>
            <iframe
              id="phet-sim-iframe"
              src="${activeSim.embedUrl}"
              allow="fullscreen; autoplay; clipboard-write;"
              allowfullscreen
              onload="phetOnFrameLoad()"
              title="${escHtml(simName)}">
            </iframe>
          </div>

          <!-- Lab Inquiry Notebook Panel -->
          ${phetShowNotebook ? `
            <div class="science-notebook-panel">
              <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--border); padding-bottom:12px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <i class="fas fa-clipboard-check" style="color:var(--teal); font-size:16px;"></i>
                  <h3 style="font-size:15px; font-weight:800;">${isAr ? 'دفتر المعمل والاستكشاف' : 'Lab Notebook'}</h3>
                </div>
                <span id="phet-save-status" style="font-size:11px; color:var(--green); font-weight:700;"></span>
              </div>

              <!-- Inquiry Challenge Prompt -->
              <div class="card" style="padding:14px; background:rgba(78,205,196,0.08); border:1px solid rgba(78,205,196,0.3); border-radius:12px;">
                <div style="display:flex; align-items:center; gap:6px; font-weight:800; font-size:12px; color:var(--teal); margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">
                  <i class="fas fa-flag-checkered"></i> ${isAr ? 'تحدي الاستكشاف والبحث العلمي' : 'Investigation Challenge'}
                </div>
                <div style="font-size:13px; line-height:1.5; color:var(--text);">${escHtml(simChallenge)}</div>
              </div>

              <!-- Learning Goals Checklist -->
              <div>
                <label style="font-size:12px; font-weight:800; color:var(--text2); display:block; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">
                  ${isAr ? 'المفاهيم والأهداف التعليمية' : 'Key Concepts & Goals'}
                </label>
                <div class="science-goals-list">
                  ${simGoals.map((goal, idx) => {
                    const done = completedGoals.includes(idx);
                    return `
                      <label class="science-goal-item ${done ? 'done' : ''}">
                        <input type="checkbox" ${done ? 'checked' : ''} onchange="phetToggleGoal('${activeSim.id}', ${idx})">
                        <span>${escHtml(goal)}</span>
                      </label>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Student Lab Notes Area -->
              <div style="flex:1; display:flex; flex-direction:column; gap:6px;">
                <label style="font-size:12px; font-weight:800; color:var(--text2); display:block; text-transform:uppercase; letter-spacing:0.5px;">
                  ${isAr ? 'الملاحظات والفرضيات والنتائج' : 'Observations & Hypotheses'}
                </label>
                <textarea
                  class="science-notes-area"
                  placeholder="${isAr ? 'سجل بياناتك وملاحظاتك وفرضياتك واستنتاجاتك هنا...' : 'Record your data, observations, hypotheses, and conclusions here...'}"
                  oninput="phetSaveNotes('${activeSim.id}', this.value)">${escHtml(savedNotes)}</textarea>
              </div>

              <!-- Completion & XP Reward Card -->
              <div>
                ${isCompleted ? `
                  <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:rgba(34,197,94,0.12); border:1px solid rgba(34,197,94,0.3); border-radius:12px; color:var(--green); font-weight:800; font-size:13px;">
                    <span><i class="fas fa-circle-check" style="margin-right:6px;"></i> ${isAr ? 'تم إكمال المعمل بنجاح' : 'Lab Completed'}</span>
                    <span class="tag" style="background:var(--green); color:#0F0F14; font-weight:800;">+25 XP</span>
                  </div>
                ` : `
                  <button class="btn btn-primary" style="width:100%; justify-content:center; gap:8px; padding:12px;" onclick="phetCompleteLab('${activeSim.id}')">
                    <i class="fas fa-award"></i> ${isAr ? 'إكمال المعمل والحصول على +25 نقطة' : 'Complete Lab & Claim +25 XP'}
                  </button>
                `}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
    return;
  }

  // 2. CATALOG VIEW (SIMULATION DIRECTORY & DISCOVERY)
  const subjects = ['all', 'Physics', 'Chemistry', 'Biology', 'Earth & Space'];

  // Filter calculations
  let filtered = PHET_SIMULATIONS.filter(sim => {
    if (phetSubjectFilter !== 'all' && sim.subject !== phetSubjectFilter) return false;
    if (phetOnlyFavorites && !favs.includes(sim.id)) return false;
    if (phetGradeFilter !== 'all') {
      const g = parseInt(phetGradeFilter);
      if (!sim.grades.includes(g)) return false;
    }
    if (phetSearchQuery.trim()) {
      const q = phetSearchQuery.toLowerCase();
      const ar = PHET_ARABIC_DATA[sim.id] || {};
      const matchName = sim.name.toLowerCase().includes(q) || (ar.nameAr && ar.nameAr.toLowerCase().includes(q));
      const matchDesc = sim.desc.toLowerCase().includes(q) || (ar.descAr && ar.descAr.toLowerCase().includes(q));
      const matchCat = sim.category.toLowerCase().includes(q) || (ar.categoryAr && ar.categoryAr.toLowerCase().includes(q));
      const matchSubject = sim.subject.toLowerCase().includes(q) || (ar.subjectAr && ar.subjectAr.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchCat && !matchSubject) return false;
    }
    return true;
  });

  const subjectCounts = {
    Physics: PHET_SIMULATIONS.filter(s => s.subject === 'Physics').length,
    Chemistry: PHET_SIMULATIONS.filter(s => s.subject === 'Chemistry').length,
    Biology: PHET_SIMULATIONS.filter(s => s.subject === 'Biology').length,
    'Earth & Space': PHET_SIMULATIONS.filter(s => s.subject === 'Earth & Space').length
  };

  mountEl.innerHTML = `
    <!-- Science Hero Header -->
    <div class="science-header-hero">
      <div class="science-hero-top">
        <div class="science-hero-title-group">
          <div class="science-hero-icon">
            <i class="fas fa-flask-vial"></i>
          </div>
          <div>
            <h1 style="font-size:24px; font-weight:800; margin-bottom:4px; display:flex; align-items:center; gap:10px;">
              ${isAr ? 'مختبر تجارب PhET العلمية التفاعلية' : 'PhET Interactive Science Labs'}
              <span class="tag" style="background:rgba(78,205,196,0.15); color:var(--teal); font-size:11px; font-weight:800;">${isAr ? 'بيئة مدمجة' : 'Embedded Suite'}</span>
            </h1>
            <p style="color:var(--text2); font-size:14px; margin:0;">
              ${isAr ? 'محاكاة تفاعلية مدعومة بالأبحاث العلمية من جامعة كولورادو بولدر. استكشف الفيزياء والكيمياء والأحياء وعلوم الأرض بالفيدباك المباشر والتطبيقات الحية.' : 'Research-backed interactive simulations by University of Colorado Boulder. Explore physics, chemistry, biology, and earth science with real-time feedback.'}
            </p>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
          <div class="card" style="padding:8px 14px; display:flex; align-items:center; gap:10px; background:var(--bg); border:1px solid var(--border);">
            <div style="text-align:${isAr ? 'left' : 'right'};">
              <div style="font-size:11px; color:var(--text2);">${isAr ? 'المكتملة' : 'Completed'}</div>
              <div style="font-weight:800; font-size:15px; color:var(--green);">${completedLabs.length} / ${PHET_SIMULATIONS.length}</div>
            </div>
            <i class="fas fa-trophy" style="color:var(--green); font-size:18px;"></i>
          </div>
        </div>
      </div>

      <!-- Controls & Filter Toolbar -->
      <div class="science-controls-toolbar">
        <!-- Subject Chips -->
        <div class="science-subject-chips">
          <button class="science-subject-chip ${phetSubjectFilter === 'all' && !phetOnlyFavorites ? 'selected' : ''}" onclick="phetSubjectFilter='all'; phetOnlyFavorites=false; renderScienceContent(document.getElementById('${mountEl.id}'))">
            <i class="fas fa-layer-group"></i> ${isAr ? `جميع المعامل (${PHET_SIMULATIONS.length})` : `All Labs (${PHET_SIMULATIONS.length})`}
          </button>
          <button class="science-subject-chip ${phetSubjectFilter === 'Physics' && !phetOnlyFavorites ? 'selected' : ''}" onclick="phetSubjectFilter='Physics'; phetOnlyFavorites=false; renderScienceContent(document.getElementById('${mountEl.id}'))">
            <i class="fas fa-bolt" style="color:#F59E0B;"></i> ${isAr ? `الفيزياء (${subjectCounts.Physics})` : `Physics (${subjectCounts.Physics})`}
          </button>
          <button class="science-subject-chip ${phetSubjectFilter === 'Chemistry' && !phetOnlyFavorites ? 'selected' : ''}" onclick="phetSubjectFilter='Chemistry'; phetOnlyFavorites=false; renderScienceContent(document.getElementById('${mountEl.id}'))">
            <i class="fas fa-flask" style="color:#10B981;"></i> ${isAr ? `الكيمياء (${subjectCounts.Chemistry})` : `Chemistry (${subjectCounts.Chemistry})`}
          </button>
          <button class="science-subject-chip ${phetSubjectFilter === 'Biology' && !phetOnlyFavorites ? 'selected' : ''}" onclick="phetSubjectFilter='Biology'; phetOnlyFavorites=false; renderScienceContent(document.getElementById('${mountEl.id}'))">
            <i class="fas fa-dna" style="color:#16A34A;"></i> ${isAr ? `الأحياء (${subjectCounts.Biology})` : `Biology (${subjectCounts.Biology})`}
          </button>
          <button class="science-subject-chip ${phetSubjectFilter === 'Earth & Space' && !phetOnlyFavorites ? 'selected' : ''}" onclick="phetSubjectFilter='Earth & Space'; phetOnlyFavorites=false; renderScienceContent(document.getElementById('${mountEl.id}'))">
            <i class="fas fa-earth-americas" style="color:#06B6D4;"></i> ${isAr ? `علوم الأرض والفضاء (${subjectCounts['Earth & Space']})` : `Earth & Space (${subjectCounts['Earth & Space']})`}
          </button>
          <button class="science-subject-chip ${phetOnlyFavorites ? 'selected' : ''}" onclick="phetOnlyFavorites=!phetOnlyFavorites; renderScienceContent(document.getElementById('${mountEl.id}'))">
            <i class="fas fa-star" style="color:#F59E0B;"></i> ${isAr ? `المفضلة (${favs.length})` : `Bookmarks (${favs.length})`}
          </button>
        </div>

        <!-- Grade & Search Filters -->
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <select class="input" style="width:auto; padding:7px 12px; font-size:13px;" onchange="phetGradeFilter=this.value; renderScienceContent(document.getElementById('${mountEl.id}'))">
            <option value="all" ${phetGradeFilter === 'all' ? 'selected' : ''}>${isAr ? 'جميع الصفوف' : 'All Grades'}</option>
            <optgroup label="${isAr ? 'المرحلة الابتدائية' : 'Primary Stage'}">
              <option value="4" ${phetGradeFilter === '4' ? 'selected' : ''}>${isAr ? 'الصف الرابع الابتدائي' : 'Grade 4'}</option>
              <option value="5" ${phetGradeFilter === '5' ? 'selected' : ''}>${isAr ? 'الصف الخامس الابتدائي' : 'Grade 5'}</option>
              <option value="6" ${phetGradeFilter === '6' ? 'selected' : ''}>${isAr ? 'الصف السادس الابتدائي' : 'Grade 6'}</option>
            </optgroup>
            <optgroup label="${isAr ? 'المرحلة الإعدادية' : 'Preparatory Stage'}">
              <option value="7" ${phetGradeFilter === '7' ? 'selected' : ''}>${isAr ? 'الصف الأول الإعدادي' : 'Grade 7'}</option>
              <option value="8" ${phetGradeFilter === '8' ? 'selected' : ''}>${isAr ? 'الصف الثاني الإعدادي' : 'Grade 8'}</option>
              <option value="9" ${phetGradeFilter === '9' ? 'selected' : ''}>${isAr ? 'الصف الثالث الإعدادي' : 'Grade 9'}</option>
            </optgroup>
            <optgroup label="${isAr ? 'المرحلة الثانوية' : 'Secondary Stage'}">
              <option value="10" ${phetGradeFilter === '10' ? 'selected' : ''}>${isAr ? 'الصف الأول الثانوي' : 'Grade 10'}</option>
              <option value="11" ${phetGradeFilter === '11' ? 'selected' : ''}>${isAr ? 'الصف الثاني الثانوي' : 'Grade 11'}</option>
              <option value="12" ${phetGradeFilter === '12' ? 'selected' : ''}>${isAr ? 'الصف الثالث الثانوي (الثانوية العامة)' : 'Grade 12 (Thanawya)'}</option>
            </optgroup>
          </select>

          <div style="position:relative; display:flex; align-items:center;">
            <i class="fas fa-search" style="position:absolute; ${isAr ? 'right:10px;' : 'left:10px;'} color:var(--text2); font-size:12px; pointer-events:none;"></i>
            <input
              type="text"
              class="input"
              style="${isAr ? 'padding-right:30px; padding-left:12px;' : 'padding-left:30px;'} width:220px; font-size:13px;"
              placeholder="${isAr ? 'ابحث في التجارب والمفاهيم...' : 'Search experiments...'}"
              value="${escHtml(phetSearchQuery)}"
              oninput="phetSearchQuery=this.value; renderScienceContent(document.getElementById('${mountEl.id}'))">
          </div>
        </div>
      </div>
    </div>

    <!-- Simulations Cards Grid -->
    ${filtered.length ? `
      <div class="science-cards-grid">
        ${filtered.map(sim => {
          const isFav = favs.includes(sim.id);
          const isCompleted = completedLabs.includes(sim.id);
          const ar = PHET_ARABIC_DATA[sim.id] || {};
          const simName = (isAr && ar.nameAr) || sim.name;
          const simCategory = (isAr && ar.categoryAr) || sim.category;
          const simSubject = (isAr && ar.subjectAr) || sim.subject;
          const simDesc = (isAr && ar.descAr) || sim.desc;
          const simChallenge = (isAr && ar.challengeAr) || sim.challenge;

          return `
            <div class="science-sim-card">
              <div class="science-sim-card-header">
                <div style="display:flex; align-items:center; gap:12px;">
                  <div class="science-sim-icon-box" style="background:${sim.color}20; color:${sim.color};">
                    <i class="fas ${sim.icon}"></i>
                  </div>
                  <div>
                    <div style="font-weight:800; font-size:15px;">${escHtml(simName)}</div>
                    <div style="font-size:11px; color:var(--text2);">${simCategory}</div>
                  </div>
                </div>

                <div style="display:flex; align-items:center; gap:4px;">
                  ${isCompleted ? `<span title="${isAr ? 'تم إكمال المعمل' : 'Lab Completed'}" style="color:var(--green); font-size:14px; margin-right:4px;"><i class="fas fa-circle-check"></i></span>` : ''}
                  <button class="btn btn-sm btn-ghost" style="padding:6px 8px; color:${isFav ? '#F59E0B' : 'var(--text2)'};" onclick="phetToggleFavorite('${sim.id}')" title="${isFav ? (isAr ? 'إزالة من المفضلة' : 'Remove bookmark') : (isAr ? 'حفظ في المفضلة' : 'Bookmark')}">
                    <i class="fas fa-star"></i>
                  </button>
                </div>
              </div>

              <div class="science-sim-card-body">
                <div style="display:flex; gap:6px; flex-wrap:wrap;">
                  <span class="tag" style="background:${sim.color}18; color:${sim.color}; font-size:10px; font-weight:700;">${simSubject}</span>
                  <span class="tag" style="background:var(--bg); border:1px solid var(--border); color:var(--text2); font-size:10px;">${isAr ? `الصفوف ${sim.grades[0]}–${sim.grades[sim.grades.length - 1]}` : `Grades ${sim.grades[0]}–${sim.grades[sim.grades.length - 1]}`}</span>
                  ${sim.featured ? `<span class="tag" style="background:rgba(255,140,66,0.15); color:var(--accent); font-size:10px; font-weight:700;">${isAr ? '★ مميز وشائع' : '★ Popular'}</span>` : ''}
                </div>

                <p style="font-size:12px; color:var(--text2); line-height:1.45; margin:0; flex:1;">
                  ${escHtml(simDesc)}
                </p>

                <div class="science-sim-challenge-snippet">
                  <div style="font-weight:800; font-size:11px; color:var(--teal); margin-bottom:3px; display:flex; align-items:center; gap:5px;">
                    <i class="fas fa-compass"></i> ${isAr ? 'التحدي العلمي' : 'Challenge'}
                  </div>
                  <div style="font-size:11px; color:var(--text); line-height:1.35; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">
                    ${escHtml(simChallenge)}
                  </div>
                </div>
              </div>

              <div class="science-sim-card-footer">
                <button class="btn btn-sm btn-primary" style="flex:1; justify-content:center; gap:8px;" onclick="phetLaunchSim('${sim.id}')">
                  <i class="fas fa-play"></i> ${isAr ? 'تشغيل المعمل الافتراضي' : 'Launch Virtual Lab'}
                </button>
                <a href="${sim.embedUrl}" target="_blank" rel="noopener" class="btn btn-sm btn-secondary" style="padding:6px 10px;" title="${isAr ? 'فتح على موقع PhET كولورادو' : 'Open on PhET Colorado'}">
                  <i class="fas fa-external-link-alt"></i>
                </a>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    ` : `
      <div class="card" style="text-align:center; padding:50px 20px; color:var(--text2);">
        <i class="fas fa-flask-vial" style="font-size:36px; margin-bottom:12px; opacity:0.4; display:block;"></i>
        <h3 style="font-size:16px; font-weight:800; color:var(--text); margin-bottom:6px;">${isAr ? 'لم يتم العثور على معامل تطابق بحثك' : 'No science simulations found'}</h3>
        <p style="font-size:13px; margin-bottom:16px;">${isAr ? 'جرّب تعديل كلمات البحث أو تغيير فلاتر المواد والمراحل الدراسية.' : 'Try clearing your search query or switching subject and grade filters.'}</p>
        <button class="btn btn-secondary btn-sm" onclick="phetSubjectFilter='all'; phetGradeFilter='all'; phetSearchQuery=''; phetOnlyFavorites=false; renderScienceContent(document.getElementById('${mountEl.id}'))">
          ${isAr ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
        </button>
      </div>
    `}
  `;
}

// Standalone Science View handler
function renderScience() {
  updateUserPanel();
  const el = document.getElementById('view-science');
  if (!el) return;
  el.innerHTML = `<div class="science-wrap" id="science-main-mount"></div>`;
  renderScienceContent(document.getElementById('science-main-mount'));
}

function renderLearn(){
  updateUserPanel();
  const el = document.getElementById('view-learn');
  if (!el) return;
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const u = Store.get('user');
  const grade = u ? u.grade : 2;

  // Learn & Play tab switcher at top
  const navTabsHtml = `
    <div class="learn-subnav-bar">
      <button class="learn-subnav-btn ${learnActiveTab === 'science' ? 'active' : ''}" onclick="learnActiveTab='science'; SFX.click(); renderLearn();">
        <i class="fas fa-atom" style="font-size:16px;"></i> ${isAr ? 'محاكاة العلوم التفاعلية PhET' : 'PhET Science Simulations'}
      </button>
      <button class="learn-subnav-btn ${learnActiveTab === 'math' ? 'active accent' : ''}" onclick="learnActiveTab='math'; SFX.click(); renderLearn();">
        <i class="fas fa-gamepad" style="font-size:16px;"></i> ${isAr ? 'مغامرة الرياضيات المنهجية' : 'Math Adventure Game'}
      </button>
    </div>
  `;

  if (learnActiveTab === 'science') {
    el.innerHTML = `
      <div class="science-wrap">
        ${navTabsHtml}
        <div id="learn-science-mount"></div>
      </div>
    `;
    renderScienceContent(document.getElementById('learn-science-mount'));
    return;
  }

  // Math Adventure Game Tab
  if (!gameState.active) {
    const best = {};
    Store.get('games').filter(g => g.type === 'math').forEach(g => {
      if (!best[g.grade] || g.xp > best[g.grade].xp) best[g.grade] = g;
    });
    el.innerHTML = `
      <div style="max-width:680px; margin:0 auto;">
        ${navTabsHtml}
        <div class="card" style="margin-bottom:24px; text-align:${isAr ? 'right' : 'left'};">
          <div style="display:flex; align-items:center; gap:14px; margin-bottom:16px;">
            <div class="char-face happy"><div class="eye l"></div><div class="eye r"></div><div class="mouth"></div></div>
            <div>
              <div style="font-weight:700; font-size:17px;">${isAr ? 'مغامرة الرياضيات المنهجية' : 'Math Adventure'}</div>
              <div style="font-size:13px; color:var(--text2);">${isAr ? 'المرحلة الابتدائية (الصفوف 1–6) &middot; 10 أسئلة &middot; +10 نقاط لكل إجابة' : 'Primary (Grades 1–6) &middot; 10 questions &middot; +10 XP each'}</div>
            </div>
          </div>
          <label style="font-weight:700; font-size:14px; display:block; margin-bottom:10px;">${isAr ? 'اختر الصف الدراسي' : 'Grade Level'}</label>
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px;">
            ${[1, 2, 3, 4, 5, 6].map(g => `<button class="grade-pill ${g === (gameState.grade || grade) ? 'selected' : ''}" onclick="gameState.grade=${g}; SFX.click(); renderLearn()">${isAr ? `الصف ${g}` : g}</button>`).join('')}
          </div>
          <button class="btn btn-lg btn-primary" style="width:100%; justify-content:center;" onclick="startMathGame()">
            <i class="fas fa-play"></i> ${isAr ? 'ابدأ الجولة الآن' : 'Start Round'}
          </button>
          ${best[gameState.grade || grade] ? `<div style="text-align:center; margin-top:12px; font-size:13px; color:var(--text2);">${isAr ? `أفضل نتيجة: ${best[gameState.grade || grade].score}/${best[gameState.grade || grade].total} &middot; ${best[gameState.grade || grade].xp} نقطة` : `Best: ${best[gameState.grade || grade].score}/${best[gameState.grade || grade].total} &middot; ${best[gameState.grade || grade].xp} XP`}</div>` : ''}
        </div>
        <div class="card" style="text-align:${isAr ? 'right' : 'left'};">
          <h3 style="font-size:15px; margin-bottom:10px;"><i class="fas fa-info-circle" style="color:var(--blue);"></i> ${isAr ? 'نظام احتساب النقاط والمكافآت' : 'Scoring'}</h3>
          <div style="font-size:13px; color:var(--text2); display:flex; flex-direction:column; gap:8px;">
            <div><span style="color:var(--green); font-weight:700;">+10 XP</span> ${isAr ? 'لكل إجابة صحيحة' : 'correct answer'}</div>
            <div><span style="color:var(--accent); font-weight:700;">${isAr ? 'مكافأة السلسلة' : 'Streak bonus'}</span> ${isAr ? '3 إجابات متتالية أو أكثر = +5 نقاط إضافية' : '3+ in a row = +5 extra'}</div>
            <div><span style="color:#D8B4FE; font-weight:700;">${isAr ? 'مكافأة غير متوقعة' : 'Surprise bonus'}</span> ${isAr ? 'نقاط خبرة إضافية عشوائية بعد الجولات' : 'random bonus after rounds'}</div>
            <div><span style="color:var(--text); font-weight:700;">${isAr ? 'بدون عقوبة' : 'No penalty'}</span> ${isAr ? 'لا يوجد أي خصم للنقاط عند الخطأ' : 'for wrong answers'}</div>
          </div>
        </div>
      </div>
    `;
  } else {
    renderMathQ(el);
  }
}

function startMathGame(){SFX.click();const u=Store.get('user');const curGrade=gameState.grade||(u?u.grade:2);gameState={active:true,questions:[],current:0,score:0,streak:0,xp:0,grade:curGrade,answered:false};for(let i=0;i<10;i++)gameState.questions.push(genQ(curGrade));renderLearn();}

function renderMathQ(el){
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const q=gameState.questions[gameState.current];
  el.innerHTML=`
    <div style="max-width:560px;margin:0 auto">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <button class="btn btn-sm btn-ghost" onclick="gameState.active=false;renderLearn()">
          <i class="fas ${isAr ? 'fa-arrow-right' : 'fa-arrow-left'}"></i> ${isAr ? 'خروج' : 'Quit'}
        </button>
        <div style="display:flex;align-items:center;gap:16px;font-size:14px">
          <span style="color:var(--green);font-weight:700"><i class="fas fa-bolt"></i> ${gameState.xp} ${isAr ? 'نقطة' : 'XP'}</span>
          ${gameState.streak>=3?`<span style="color:var(--accent);font-weight:700"><i class="fas fa-fire"></i> ${isAr ? `سلسلة ${gameState.streak}` : `${gameState.streak} streak`}</span>`:''}
        </div>
      </div>
      <div style="display:flex;gap:6px;margin-bottom:24px">
        ${gameState.questions.map((_,i)=>{
          if(i<gameState.current)return'<div class="progress-dot done"></div>';
          if(i===gameState.current)return'<div class="progress-dot current"></div>';
          return'<div class="progress-dot"></div>';
        }).join('')}
      </div>
      <div style="display:flex;justify-content:center;margin-bottom:16px;position:relative" id="game-char-wrap">
        <div class="char-face" id="game-char"><div class="eye l"></div><div class="eye r"></div><div class="mouth"></div></div>
      </div>
      <div class="card card-glow" style="text-align:center;margin-bottom:24px;padding:32px 20px">
        <div style="font-size:14px;color:var(--text2);margin-bottom:8px">${isAr ? `السؤال ${gameState.current+1} من 10` : `Question ${gameState.current+1} of 10`}</div>
        <div style="font-family:'Cairo',Fredoka,sans-serif;font-size:32px;font-weight:700;line-height:1.4">${q.q}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px" id="game-options">
        ${q.opts.map(o=>`<button class="btn btn-secondary btn-lg" style="justify-content:center;font-size:20px;font-family:'Cairo',Fredoka,sans-serif" data-answer="${o}" onclick="answerMath('${String(o).replace(/'/g,"\\'")}')">${o}</button>`).join('')}
      </div>
    </div>
  `;
}

function answerMath(chosen){if(gameState.answered)return;gameState.answered=true;const q=gameState.questions[gameState.current];const correct=String(chosen)===String(q.ans);const ch=document.getElementById('game-char'),btns=document.querySelectorAll('#game-options button');btns.forEach(b=>{const v=b.dataset.answer;const match=String(v)===String(q.ans);b.disabled=true;if(match){b.style.background='var(--green)';b.style.color='#0F0F14';b.style.borderColor='var(--green)';}else if(String(v)===String(chosen)&&!correct){b.style.background='var(--red)';b.style.color='#fff';b.style.borderColor='var(--red)';}else b.style.opacity='.4';});if(correct){gameState.score++;gameState.streak++;let xp=10;if(gameState.streak>=3)xp+=5;gameState.xp+=xp;if(ch)ch.className='char-face happy';SFX.correct();spawnP(document.getElementById('game-char-wrap'),['#FFD93D','#FF8C42','#7EE787','#4ECDC4']);}else{gameState.streak=0;if(ch)ch.className='char-face thinking';SFX.wrong();}setTimeout(()=>{gameState.current++;gameState.answered=false;if(gameState.current>=10)endMathGame();else renderLearn();},correct?1000:1800);}

function spawnP(c,cols){if(!c)return;for(let i=0;i<12;i++){const p=document.createElement('div');p.className='particle';const a=(Math.PI*2/12)*i+Math.random()*.5,d=60+Math.random()*40,sz=6+Math.random()*6;p.style.cssText=`left:50%;top:50%;background:${cols[i%cols.length]};--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d}px;width:${sz}px;height:${sz}px;`;c.appendChild(p);setTimeout(()=>p.remove(),800);}}

function endMathGame(){
  gameState.active=false;
  SFX.complete();
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const gr=gameState.grade,game={id:Date.now(),type:'math',score:gameState.score,total:10,xp:gameState.xp,date:new Date().toISOString(),grade:gr};
  const games=Store.get('games');
  games.push(game);
  Store.set('games',games);
  Store.addXP(gameState.xp);
  completeQuest('game');
  let bx=0;
  if(Math.random()<.25){
    bx=20+Math.floor(Math.random()*31);
    Store.addXP(bx);
    setTimeout(()=>SFX.bonus(),400);
  }
  const st=gameState.score>=9?3:gameState.score>=7?2:gameState.score>=5?1:0;
  const sh='<i class="fas fa-star" style="color:#FFD93D;font-size:28px;margin:0 4px"></i>'.repeat(st)+'<i class="fas fa-star" style="color:var(--border);font-size:28px;margin:0 4px"></i>'.repeat(3-st);
  showModal(`
    <div style="text-align:center">
      <div style="margin-bottom:12px">${sh}</div>
      <h2 style="font-size:22px;margin-bottom:4px">${isAr ? 'اكتملت الجولة بنجاح!' : 'Round Complete!'}</h2>
      <p style="color:var(--text2);margin-bottom:20px">${isAr ? `رياضيات الصف ${gr}` : `Grade ${gr} Math`}</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:${bx>0?'12px':'20px'}">
        <div class="card" style="padding:12px">
          <div style="font-family:Fredoka;font-size:28px;color:var(--green)">${gameState.score}/10</div>
          <div style="font-size:12px;color:var(--text2)">${isAr ? 'صحيحة' : 'Correct'}</div>
        </div>
        <div class="card" style="padding:12px">
          <div style="font-family:Fredoka;font-size:28px;color:var(--accent)">+${gameState.xp}</div>
          <div style="font-size:12px;color:var(--text2)">${isAr ? 'نقاط مكتسبة' : 'XP Earned'}</div>
        </div>
        <div class="card" style="padding:12px">
          <div style="font-family:Fredoka;font-size:28px;color:var(--teal)">${Math.max(...Store.get('games').filter(g=>g.type==='math'&&g.grade===gr).map(g=>g.xp))}</div>
          <div style="font-size:12px;color:var(--text2)">${isAr ? 'أعلى نقاط' : 'Best XP'}</div>
        </div>
      </div>
      ${bx>0?`
        <div class="card bonus-card bonus-pop" style="margin-bottom:20px;padding:16px;border:1px solid rgba(216,180,254,.3)">
          <div style="display:flex;align-items:center;gap:12px;justify-content:center">
            <i class="fas fa-gift" style="font-size:24px;color:#D8B4FE"></i>
            <div style="text-align:${isAr ? 'right' : 'left'}">
              <div style="font-weight:800;font-size:16px;color:#D8B4FE">${isAr ? 'مكافأة غير متوقعة!' : 'Surprise Bonus!'}</div>
              <div style="font-size:13px;color:var(--text2)">${isAr ? `حصلت على +${bx} نقطة خبرة إضافية` : `You earned an extra +${bx} XP`}</div>
            </div>
          </div>
        </div>
      `:''}
      <div style="display:flex;gap:12px;justify-content:center">
        <button class="btn btn-secondary" onclick="closeModal();renderLearn()">${isAr ? 'رجوع' : 'Back'}</button>
        <button class="btn btn-primary" onclick="closeModal();startMathGame()">${isAr ? 'العب مجددًا' : 'Play Again'}</button>
      </div>
    </div>
  `);
}

// ======================== RESOURCES & ARABIC CURRICULUM ========================
const RESOURCES_ARABIC_DATA = {
  "MOE E-Learning Portal": {
    name: "بوابة التعليم الإلكتروني - وزارة التربية والتعليم",
    desc: "المصدر الرسمي الشامل لتحميل الكتب المدرسية بصيغة PDF وأدلة المعلم وكراسات التمارين والأنشطة التفاعلية لكافة المراحل والصفوف.",
    badge: "الموقع الرسمي للوزارة"
  },
  "Egyptian Knowledge Bank": {
    name: "بنك المعرفة المصري (EKB)",
    desc: "أضخم مكتبة رقمية وطنية تفاعلية. يوفر قسم (ذاكر الآن) شروحات فيديو تفاعلية، قواميس، واختبارات قياسية وفق مناهج الوزارة.",
    badge: "مكتبة رقمية وطنية"
  },
  "Madrasetna — Primary": {
    name: "قناة مدرستنا 1 (المرحلة الابتدائية)",
    desc: "القناة الرسمية لوزارة التربية والتعليم لشرح مناهج المرحلة الابتدائية بأسلوب مرئي مبسط وشيق مع نخبة من أفضل المعلمين.",
    badge: "فيديوهات شرح رسمية"
  },
  "Madrasetna — Preparatory": {
    name: "قناة مدرستنا 2 (المرحلة الإعدادية)",
    desc: "الحصص والدروس التعليمية المرئية الرسمية للمرحلة الإعدادية لمواد العلوم، الرياضيات، اللغات، والدراسات الاجتماعية.",
    badge: "المنهج الإعدادي الرسمي"
  },
  "Madrasetna — Secondary": {
    name: "قناة مدرستنا (المرحلة الثانوية)",
    desc: "شروحات مركزة لطلاب الصفوف الثانوية والثانوية العامة تركز على نواتج التعلم وأسئلة الفهم والتطبيق لنظام الامتحانات الحديث.",
    badge: "شروحات الثانوية العامة"
  },
  "Nafham": {
    name: "منصة نفهم التعليمية (Nafham)",
    desc: "شروحات فيديو سريعة ومبسطة (من 5 إلى 15 دقيقة) لكل درس في الكتاب المدرسي خطوة بخطوة بأسلوب منظم وسهل الاستيعاب.",
    badge: "شروحات سريعة وموجزة"
  },
  "Khan Academy Arabic": {
    name: "أكاديمية خان (النسخة العربية)",
    desc: "منصة عالمية معربة بالكامل تقدم دروس الرياضيات والعلوم وممارسات تفاعلية متدرجة من الصفر حتى الإتقان مع تقييم فوري ومستمر.",
    badge: "رياضيات وعلوم تفاعلية"
  },
  "Learning Passport": {
    name: "جواز السفر للتعلم (اليونيسف والتعليم)",
    desc: "منصة تفاعلية بالتعاون بين منظمة اليونيسف ووزارة التربية والتعليم لتنمية مهارات القراءة والكتابة والحساب والمهارات الحياتية.",
    badge: "تنمية المهارات الأساسية"
  },
  "Starfall": {
    name: "موقع ستار فال (Starfall)",
    desc: "منصة تفاعلية رائدة لتعليم الصوتيات (Phonics) والقراءة باللغة الإنجليزية للأطفال وصفوف التأسيس بأسلوب كرتوني مرح ومحفز.",
    badge: "تأسيس إنجليزي وصوتيات"
  },
  "ABCya!": {
    name: "منصة إيه بي سي يا (ABCya!)",
    desc: "ألعاب تعليمية شيقة مقسمة حسب الصف الدراسي والمهارة تجمع بين التعلم والمرح في مجالات الرياضيات، القراءة، والذكاء.",
    badge: "ألعاب تفاعلية للصفوف الأولى"
  },
  "Math Playground": {
    name: "ساحة الرياضيات (Math Playground)",
    desc: "موقع متخصص في ألعاب الحساب الذهني، ألغاز المنطق الرياضي، والمسائل اللفظية الموجهة لطلاب المرحلة الابتدائية.",
    badge: "حساب ذهني وألغاز"
  },
  "Storyline Online": {
    name: "ستوري لاين أونلاين (Storyline Online)",
    desc: "مكتبة مرئية يقرأ فيها نجوم وممثلون مشهورون قصص الأطفال المصورة؛ ممتازة لتعزيز مهارة الاستماع والمفردات باللغة الإنجليزية.",
    badge: "قصص إنجليزية مسموعة"
  },
  "SplashLearn": {
    name: "سبلاش ليرن (SplashLearn)",
    desc: "برنامج تدريب تفاعلي منظم على الرياضيات واللغة الإنجليزية مصمم بأسلوب شيق وجوائز تحفيزية مستمرة تحبب الطالب في المذاكرة.",
    badge: "تمارين تحفيزية منظمة"
  },
  "PhET Simulations": {
    name: "محاكاة PhET التفاعلية (مختبر كولورادو)",
    desc: "معامل افتراضية تفاعلية لمفاهيم الفيزياء والكيمياء والرياضيات، تتيح لك تجربة تركيب الذرات، بناء الدوائر الكهربائية، واكتشاف القوانين بنفسك.",
    badge: "معامل ومحاكاة علمية"
  },
  "Ducksters": {
    name: "داكسترز الموسوعي (Ducksters)",
    desc: "مقالات علمية وتاريخية وجغرافية مبسطة وموثوقة مصممة لأبحاث المدارس مع خرائط توضيحية واختبارات تقييم ذاتي شيقة.",
    badge: "أبحاث تاريخ وجغرافيا"
  },
  "CrashCourse Kids": {
    name: "كراش كورس للصغار (CrashCourse Kids)",
    desc: "سلسلة فيديوهات رسوم متحركة ممتعة تشرح بطريقة مشوقة مفاهيم علوم الأرض، الفضاء، دورة المياه، وأساسيات الفيزياء الحيوية.",
    badge: "علوم مبسطة للأطفال"
  },
  "GeoGebra": {
    name: "جيوجيبرا (GeoGebra)",
    desc: "حزمة أدوات هندسية وحاسبة بيانية تفاعلية مجانية عالمية لا غنى عنها لدروس الجبر، الهندسة الفراغية، وحساب المثلثات.",
    badge: "رسم بياني وهندسة"
  },
  "Hessas Misr": {
    name: "منصة حصص مصر",
    desc: "موقع تعليمي معتمد يقدم دروساً تفاعلية وتدريبات ونماذج امتحانات مطابقة للمواصفات الحديثة، مجانية لطلاب المدارس بالبريد الموحد.",
    badge: "نماذج امتحانات وتدريبات"
  },
  "The Organic Chemistry Tutor": {
    name: "معلم الكيمياء والفيزياء (Organic Chem Tutor)",
    desc: "القناة الأولى عالمياً في حل آلاف مسائل وتمارين الفيزياء والرياضيات والكيمياء خطوة بخطوة بالإنجليزية وبوضوح استثنائي.",
    badge: "حل مسائل تفصيلي"
  },
  "CrashCourse": {
    name: "كراش كورس (CrashCourse)",
    desc: "شروحات سريعة وعالية الإنتاجية لدروس الفلسفة، التاريخ العالمي، الأحياء، والفيزياء للمرحلتين الإعدادية والثانوية.",
    badge: "مفاهيم متقدمة وشاملة"
  },
  "Flipping Physics": {
    name: "فيزياء بالتجارب الحية (Flipping Physics)",
    desc: "شروحات فيزيائية ممتعة مدعومة بتجارب حقيقية ورسوم توضيحية، تشرح مفاهيم الميكانيكا وقوانين نيوتن وحركة المقذوفات.",
    badge: "تجارب واقعية للفيزياء"
  },
  "MIT OpenCourseWare": {
    name: "كورسات معهد ماساتشوستس (MIT OCW)",
    desc: "مواد ومحاضرات دراسية جامعية مجانية من معهد MIT المرموق، مناسبة لطلاب الثانوية المتميزين الراغبين في الاستعداد للمسار الجامعي.",
    badge: "مستوى متقدم وعالمي"
  }
};

const RES_SUBJECT_AR = {
  'Math': 'الرياضيات',
  'Arabic': 'اللغة العربية',
  'English': 'اللغة الإنجليزية',
  'Science': 'العلوم',
  'Physics': 'الفيزياء',
  'Chemistry': 'الكيمياء',
  'Biology': 'الأحياء',
  'Social Studies': 'الدراسات الاجتماعية',
  'History': 'التاريخ',
  'Philosophy': 'الفلسفة والمنطق'
};

function formatResourceGrades(grades, isAr) {
  if (!grades || !grades.length) return '';
  if (grades.length === 12 && grades[0] === 1 && grades[11] === 12) {
    return isAr ? 'جميع المراحل (1–12)' : 'All Grades (1–12)';
  }
  if (grades.length === 1) {
    if (!isAr) return `Grade ${grades[0]}`;
    if (grades[0] <= 6) return `الصف ${grades[0]} الابتدائي`;
    if (grades[0] <= 9) return `الصف ${grades[0]-6} الإعدادي`;
    return `الصف ${grades[0]-9} الثانوي`;
  }
  const min = grades[0], max = grades[grades.length - 1];
  return isAr ? `الصفوف ${min} إلى ${max}` : `Grades ${min}–${max}`;
}

function renderResources(){
  updateUserPanel();
  const el = document.getElementById('view-resources');
  if (!el) return;
  const u = Store.get('user'), grade = u ? u.grade : 2;
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';

  el.innerHTML = `
    <div style="max-width:920px;margin:0 auto" ${isAr ? 'dir="rtl"' : ''}>
      <!-- Header -->
      <div style="margin-bottom:20px">
        <h1 style="font-size:26px;font-weight:700;margin-bottom:6px">
          ${isAr ? '<i class="fas fa-book-open" style="color:var(--teal);margin-left:8px"></i> مصادر التعلّم المجانية' : 'Free Learning Resources'}
        </h1>
        <p style="color:var(--text2);margin-bottom:0">
          ${isAr ? 'مختارة بعناية لدعم طلاب المناهج المصرية والمراحل المختلفة. جميعها مجانية بالكامل أو بحساب البريد المدرسي الموحد.' : 'Curated for the Egyptian curriculum. All free or free-with-school-email.'}
        </p>
      </div>

      <!-- Egyptian Unified Email Guidance Banner -->
      <div class="card" style="margin-bottom:20px; padding:14px 18px; background:linear-gradient(135deg, rgba(78,205,196,0.08) 0%, rgba(88,166,255,0.08) 100%); border:1px solid rgba(78,205,196,0.25); display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
        <div style="width:42px;height:42px;border-radius:12px;background:rgba(78,205,196,0.2);display:flex;align-items:center;justify-content:center;color:var(--teal);font-size:18px;flex-shrink:0">
          <i class="fas fa-school"></i>
        </div>
        <div style="flex:1;min-width:240px">
          <div style="font-weight:700;font-size:14px;margin-bottom:2px">
            ${isAr ? 'تنويه لطلاب المدارس في مصر' : 'Notice for Egyptian Students'}
          </div>
          <div style="font-size:12px;color:var(--text2);line-height:1.4">
            ${isAr 
              ? 'يمكنك تسجيل الدخول إلى منصة <strong>حصص مصر</strong> و<strong>بنك المعرفة المصري (EKB)</strong> مجاناً باستخدام البريد الإلكتروني المدرسي الموحد (@moe.edu.eg) للوصول إلى كافة المناهج وبنوك الأسئلة الرسمية.' 
              : 'You can access <strong>Hessas Misr</strong> and the <strong>Egyptian Knowledge Bank (EKB)</strong> for free with your official school email (@moe.edu.eg).'}
          </div>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;margin-bottom:14px">
        <div style="flex:1;min-width:200px">
          <label style="font-size:12px;font-weight:600;color:var(--text2);display:block;margin-bottom:4px">
            <i class="fas fa-search" style="margin-${isAr?'left':'right'}:4px"></i> ${isAr ? 'بحث سريع' : 'Search'}
          </label>
          <input type="text" id="res-search" class="input" placeholder="${isAr ? 'ابحث بالاسم، المادة، أو الكلمات المفتاحية...' : 'Search by name, subject, or keywords...'}" oninput="filterRes()" style="padding:8px 12px;width:100%">
        </div>
        <div>
          <label style="font-size:12px;font-weight:600;color:var(--text2);display:block;margin-bottom:4px">
            <i class="fas fa-graduation-cap" style="margin-${isAr?'left':'right'}:4px"></i> ${isAr ? 'المرحلة والصف' : 'Grade'}
          </label>
          <select class="input" id="res-grade" style="width:auto;padding:8px 12px" onchange="filterRes()">
            <option value="all">${isAr ? 'جميع الصفوف الدراسية' : 'All Grades'}</option>
            <optgroup label="${isAr ? 'المرحلة الابتدائية' : 'Primary'}">
              ${[1,2,3,4,5,6].map(g=>`<option value="${g}" ${g===grade?'selected':''}>${isAr ? `الصف ${['الأول','الثاني','الثالث','الرابع','الخامس','السادس'][g-1]} الابتدائي` : `Grade ${g}`}</option>`).join('')}
            </optgroup>
            <optgroup label="${isAr ? 'المرحلة الإعدادية' : 'Preparatory'}">
              ${[7,8,9].map(g=>`<option value="${g}" ${g===grade?'selected':''}>${isAr ? `الصف ${['الأول','الثاني','الثالث'][g-7]} الإعدادي` : `Grade ${g}`}</option>`).join('')}
            </optgroup>
            <optgroup label="${isAr ? 'المرحلة الثانوية' : 'Secondary'}">
              <option value="10" ${grade===10?'selected':''}>${isAr ? 'الصف الأول الثانوي' : 'Grade 10'}</option>
              <option value="11" ${grade===11?'selected':''}>${isAr ? 'الصف الثاني الثانوي' : 'Grade 11'}</option>
              <option value="12" ${grade===12?'selected':''}>${isAr ? 'الصف الثالث الثانوي (الثانوية العامة)' : 'Grade 12'}</option>
            </optgroup>
          </select>
        </div>
        <div>
          <label style="font-size:12px;font-weight:600;color:var(--text2);display:block;margin-bottom:4px">
            <i class="fas fa-shapes" style="margin-${isAr?'left':'right'}:4px"></i> ${isAr ? 'المادة الدراسية' : 'Subject'}
          </label>
          <select class="input" id="res-subject" style="width:auto;padding:8px 12px" onchange="filterRes()">
            <option value="all">${isAr ? 'جميع المواد الدراسية' : 'All Subjects'}</option>
            <option value="Math">${isAr ? 'الرياضيات' : 'Math'}</option>
            <option value="Arabic">${isAr ? 'اللغة العربية' : 'Arabic'}</option>
            <option value="English">${isAr ? 'اللغة الإنجليزية' : 'English'}</option>
            <option value="Science">${isAr ? 'العلوم العامة' : 'Science'}</option>
            <option value="Physics">${isAr ? 'الفيزياء' : 'Physics'}</option>
            <option value="Chemistry">${isAr ? 'الكيمياء' : 'Chemistry'}</option>
            <option value="Biology">${isAr ? 'الأحياء' : 'Biology'}</option>
            <option value="Social Studies">${isAr ? 'الدراسات الاجتماعية' : 'Social Studies'}</option>
            <option value="History">${isAr ? 'التاريخ' : 'History'}</option>
            <option value="Philosophy">${isAr ? 'الفلسفة والمنطق' : 'Philosophy'}</option>
          </select>
        </div>
      </div>

      <!-- Grid & Empty State -->
      <div id="res-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;margin-top:16px"></div>
      <div id="res-empty" style="display:none;text-align:center;padding:40px;color:var(--text2)">
        <i class="fas fa-search" style="font-size:32px;margin-bottom:12px;display:block"></i>
        ${isAr ? 'لا توجد مصادر تعليمية تطابق خيارات التصفية الحالية.' : 'No resources match this filter.'}
      </div>
    </div>`;
  filterRes();
}

function filterRes(){
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const gradeEl = document.getElementById('res-grade');
  const subjEl = document.getElementById('res-subject');
  const searchEl = document.getElementById('res-search');

  const g = gradeEl ? gradeEl.value : 'all';
  const s = subjEl ? subjEl.value : 'all';
  const q = searchEl ? searchEl.value.trim().toLowerCase() : '';

  const f = RESOURCES.filter(r => {
    if (g !== 'all' && !r.grades.includes(parseInt(g))) return false;
    if (s !== 'all' && !r.subjects.includes(s)) return false;
    if (q) {
      const arData = RESOURCES_ARABIC_DATA[r.name] || {};
      const matchEn = r.name.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || r.subjects.some(sub=>sub.toLowerCase().includes(q));
      const matchAr = (arData.name && arData.name.toLowerCase().includes(q)) || 
                      (arData.desc && arData.desc.toLowerCase().includes(q)) ||
                      (arData.badge && arData.badge.toLowerCase().includes(q)) ||
                      r.subjects.some(sub => (RES_SUBJECT_AR[sub] || '').toLowerCase().includes(q));
      if (!matchEn && !matchAr) return false;
    }
    return true;
  });

  const grid = document.getElementById('res-grid'), empty = document.getElementById('res-empty');
  if (!grid) return;
  if (!f.length) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  const colors = {
    Math: 'rgba(255,140,66,.12);color:var(--accent)',
    Arabic: 'rgba(239,68,68,.12);color:#EF4444',
    English: 'rgba(88,166,255,.12);color:var(--blue)',
    Science: 'rgba(78,205,196,.12);color:var(--teal)',
    Physics: 'rgba(168,85,247,.12);color:#A855F7',
    Chemistry: 'rgba(6,182,212,.12);color:#06B6D4',
    Biology: 'rgba(34,197,94,.12);color:#22C55E',
    'Social Studies': 'rgba(251,191,36,.12);color:#FBBF24',
    History: 'rgba(251,191,36,.12);color:#FBBF24',
    Philosophy: 'rgba(236,72,153,.12);color:#EC4899'
  };

  grid.innerHTML = f.map(r => {
    const isPhet = r.name === 'PhET Simulations';
    const arData = RESOURCES_ARABIC_DATA[r.name] || {};
    const displayName = isAr && arData.name ? arData.name : r.name;
    const displayDesc = isAr && arData.desc ? arData.desc : r.desc;
    const displayBadge = isAr && arData.badge 
      ? `<span style="display:inline-flex;align-items:center;font-size:10px;padding:2px 8px;border-radius:12px;background:rgba(78,205,196,0.14);color:var(--teal);font-weight:600;margin-top:4px"><i class="fas fa-check-circle" style="margin-${isAr?'left':'right'}:4px"></i>${arData.badge}</span>` 
      : '';
    const gradesText = formatResourceGrades(r.grades, isAr);

    return `
      <div class="res-card" style="display:flex;flex-direction:column;justify-content:space-between;padding:16px;border-radius:12px;background:var(--card);border:1px solid var(--border);transition:transform 0.2s,box-shadow 0.2s;" onmouseenter="this.style.borderColor='var(--teal)'" onmouseleave="this.style.borderColor='var(--border)'">
        <div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
            <div style="width:42px;height:42px;border-radius:12px;background:${r.color}22;display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <i class="fas ${r.icon}" style="color:${r.color};font-size:17px"></i>
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-weight:700;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${displayName}">
                ${displayName}
              </div>
              <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:2px">
                ${r.subjects.map(x=>`<span class="tag" style="background:${colors[x]||'rgba(78,205,196,.12);color:var(--teal)'};font-size:10px;padding:2px 6px">${isAr ? (RES_SUBJECT_AR[x] || x) : x}</span>`).join('')}
              </div>
            </div>
            <a href="${r.url}" target="_blank" rel="noopener" onclick="completeQuest('resource');" title="${isAr ? 'فتح الرابط في نافذة جديدة' : 'Open website'}" style="color:var(--text2);font-size:13px;padding:4px">
              <i class="fas fa-external-link-alt"></i>
            </a>
          </div>
          ${displayBadge ? `<div style="margin-bottom:8px">${displayBadge}</div>` : ''}
          <p style="font-size:13px;color:var(--text2);line-height:1.5;margin-bottom:0">${displayDesc}</p>
        </div>
        <div style="margin-top:14px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between;gap:8px">
          <div style="font-size:11px;color:var(--text2);font-weight:600">
            <i class="fas fa-layer-group" style="margin-${isAr?'left':'right'}:4px;color:var(--accent)"></i> ${gradesText}
          </div>
          ${isPhet
            ? `<button class="btn btn-primary btn-sm" style="font-size:11px;padding:5px 12px;gap:6px" onclick="navigate('science')"><i class="fas fa-flask-vial"></i> ${isAr ? 'فتح مختبر العلوم' : 'Launch Labs'}</button>`
            : `<a href="${r.url}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="font-size:11px;padding:5px 12px;gap:6px" onclick="completeQuest('resource');"><i class="fas fa-arrow-up-right-from-square"></i> ${isAr ? 'زيارة المنصة' : 'Visit'}</a>`}
        </div>
      </div>`;
  }).join('');
}

// ======================== PROGRESS ========================
let progressChart=null;
function renderProgress(){updateUserPanel();const el=document.getElementById('view-progress'),ts=Store.get('sessions').length,tg=Store.get('games').length,tfm=Store.get('sessions').reduce((s,x)=>s+x.duration,0),txp=Store.get('totalXP'),ad=ts>0?(Store.get('sessions').reduce((s,x)=>s+x.distractions,0)/ts).toFixed(1):'0';const labels=[],fd=[],xd=[];for(let i=6;i>=0;i--){const d=new Date(Date.now()-i*86400000);labels.push(d.toLocaleDateString('en',{weekday:'short'}));const ds=d.toDateString();fd.push(Store.get('sessions').filter(s=>new Date(s.date).toDateString()===ds).reduce((s,x)=>s+x.duration,0));xd.push(Store.get('games').filter(g=>new Date(g.date).toDateString()===ds).reduce((s,g)=>s+g.xp,0));}const games=Store.get('games').filter(g=>new Date(g.date).getTime()>Date.now()-7*86400000);const sessions=Store.get('sessions');el.innerHTML=`<div style="max-width:900px;margin:0 auto"><h1 style="font-size:26px;font-weight:700;margin-bottom:6px">Your Progress</h1><p style="color:var(--text2);margin-bottom:28px">Every minute counts.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin-bottom:28px"><div class="card stat-card"><div class="stat-num" style="color:var(--teal)">${tfm}m</div><div class="stat-label">Total focus</div></div><div class="card stat-card"><div class="stat-num" style="color:var(--accent)">${txp}</div><div class="stat-label">Total XP</div></div><div class="card stat-card"><div class="stat-num" style="color:var(--green)">${ts}</div><div class="stat-label">Sessions</div></div><div class="card stat-card"><div class="stat-num" style="color:var(--blue)">${tg}</div><div class="stat-label">Games played</div></div><div class="card stat-card"><div class="stat-num" style="color:var(--text)">${ad}</div><div class="stat-label">Avg distractions</div></div></div><div class="card" style="margin-bottom:28px"><h3 style="font-size:16px;margin-bottom:16px">Last 7 Days</h3><div style="position:relative;height:260px"><canvas id="progress-chart"></canvas></div></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px"><div class="card"><h3 style="font-size:16px;margin-bottom:14px"><i class="fas fa-bullseye" style="color:var(--teal)"></i> Recent Focus Sessions</h3>${!sessions.length?'<p style="color:var(--text2);font-size:14px">No focus sessions yet.</p>':`<div style="display:flex;flex-direction:column;gap:8px">${sessions.slice(-8).reverse().map(s=>`<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--bg);border-radius:10px"><div style="width:36px;height:36px;border-radius:8px;background:var(--teal-g);display:flex;align-items:center;justify-content:center"><i class="fas fa-clock" style="color:var(--teal);font-size:14px"></i></div><div style="flex:1"><div style="font-weight:700;font-size:14px">${escHtml(s.task)}</div><div style="font-size:12px;color:var(--text2)">${new Date(s.date).toLocaleDateString()} &middot; ${s.distractions} distraction${s.distractions!==1?'s':''}</div></div><div style="text-align:right"><div style="font-weight:700;font-size:14px;color:var(--teal)">${s.duration}m</div><div style="font-size:12px;color:var(--green)">+${s.duration*2} XP</div></div></div>`).join('')}</div>`}</div><div class="card"><h3 style="font-size:16px;margin-bottom:14px"><i class="fas fa-gamepad" style="color:var(--accent)"></i> Recent Games</h3>${!games.length?'<p style="color:var(--text2);font-size:14px">No games played recently.</p>':`<div style="display:flex;flex-direction:column;gap:8px">${games.slice(-8).reverse().map(g=>`<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--bg);border-radius:10px"><div style="width:36px;height:36px;border-radius:8px;background:rgba(255,140,66,.12);display:flex;align-items:center;justify-content:center"><i class="fas fa-gamepad" style="color:var(--accent);font-size:14px"></i></div><div style="flex:1"><div style="font-weight:700;font-size:14px">Grade ${g.grade} Math</div><div style="font-size:12px;color:var(--text2)">${new Date(g.date).toLocaleDateString()}</div></div><div style="text-align:right"><div style="font-weight:700;font-size:14px;color:var(--green)">${g.score}/${g.total}</div><div style="font-size:12px;color:var(--accent)">+${g.xp} XP</div></div></div>`).join('')}</div>`}</div></div></div>`;if(progressChart)progressChart.destroy();const ctx=document.getElementById('progress-chart');if(ctx){progressChart=new Chart(ctx,{type:'bar',data:{labels,datasets:[{label:'Focus (min)',data:fd,backgroundColor:'rgba(78,205,196,0.6)',borderColor:'#4ECDC4',borderWidth:1,borderRadius:6,barPercentage:.5},{label:'XP Earned',data:xd,backgroundColor:'rgba(255,140,66,0.6)',borderColor:'#FF8C42',borderWidth:1,borderRadius:6,barPercentage:.5}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#9B97A0',font:{family:'Nunito',weight:'600'}}}},scales:{x:{grid:{color:'rgba(42,42,61,0.5)'},ticks:{color:'#9B97A0',font:{family:'Nunito'}}},y:{grid:{color:'rgba(42,42,61,0.5)'},ticks:{color:'#9B97A0',font:{family:'Nunito'}},beginAtZero:true}}}});}}

// ======================== SETTINGS ========================
function renderSettings(){
  updateUserPanel();
  const el=document.getElementById('view-settings');
  const u=Store.get('user')||{name:'',grade:2,color:'#FF8C42'};
  const s=Store.get('settings');
  const thoughts=Store.get('thoughts')||[];
  const sched=getScheduleSettings();
  const isAr = currentLang() === 'ar';

  const gradeSections=(sel)=>`
    <div style="margin-bottom:6px">
      <div style="font-size:11px;color:var(--text2);margin-bottom:4px">${isAr ? 'المرحلة الابتدائية' : 'Primary'}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${[1,2,3,4,5,6].map(g=>`<button class="grade-pill ${g===sel?'selected':''}" onclick="document.querySelectorAll('#view-settings .grade-pill').forEach(p=>p.classList.remove('selected'));this.classList.add('selected');this.dataset.val='${g}'" data-val="${g}">${g}</button>`).join('')}
      </div>
    </div>
    <div style="margin-bottom:6px">
      <div style="font-size:11px;color:var(--text2);margin-bottom:4px">${isAr ? 'المرحلة الإعدادية' : 'Preparatory'}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${[7,8,9].map(g=>`<button class="grade-pill ${g===sel?'selected':''}" onclick="document.querySelectorAll('#view-settings .grade-pill').forEach(p=>p.classList.remove('selected'));this.classList.add('selected');this.dataset.val='${g}'" data-val="${g}">${g}</button>`).join('')}
      </div>
    </div>
    <div>
      <div style="font-size:11px;color:var(--text2);margin-bottom:4px">${isAr ? 'المرحلة الثانوية (الثانوية العامة)' : 'Secondary (Thanawya Amma)'}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${[10,11,12].map(g=>`<button class="grade-pill ${g===sel?'selected':''}" onclick="document.querySelectorAll('#view-settings .grade-pill').forEach(p=>p.classList.remove('selected'));this.classList.add('selected');this.dataset.val='${g}'" data-val="${g}">${g}</button>`).join('')}
      </div>
    </div>
  `;

  el.innerHTML=`
    <div style="max-width:700px;margin:0 auto">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px;">
        <div>
          <h1 style="font-size:26px;font-weight:700;margin-bottom:4px">${isAr ? 'الإعدادات والتخصيص' : 'Settings & Preferences'}</h1>
          <p style="color:var(--text2);">${isAr ? 'تخصيص تجربة التعلّم ومنصة سبارك بالكامل.' : 'Customize your Spark learning environment.'}</p>
        </div>
        <div class="tag" style="background:rgba(78,205,196,0.15);color:var(--teal);padding:6px 12px;font-weight:700;">
          <i class="fas fa-bolt"></i> ${isAr ? 'منصة سبارك' : 'Spark Platform'}
        </div>
      </div>

      <!-- Language & RTL Settings Card -->
      <div class="card" style="margin-bottom:20px;border-color:rgba(78,205,196,0.35);">
        <h3 style="font-size:16px;margin-bottom:8px;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-globe" style="color:var(--teal);"></i> ${isAr ? 'اللغة والاتجاه (Language & Direction)' : 'Language & Interface Direction'}
        </h3>
        <p style="font-size:13px;color:var(--text2);margin-bottom:14px;">
          ${isAr ? 'التبديل بين الواجهة العربية مع المحاذاة الكاملة من اليمين لليسار (RTL) والواجهة الإنجليزية (LTR).' : 'Toggle between full Arabic with Right-to-Left (RTL) alignment and English (LTR).'}
        </p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="grade-pill ${isAr ? 'selected' : ''}" onclick="setLanguage('ar')" style="padding:10px 18px;font-weight:700;font-size:14px;font-family:'Cairo',sans-serif;display:flex;align-items:center;gap:8px;">
            <i class="fas fa-check" style="display:${isAr ? 'inline-block' : 'none'};color:var(--teal);"></i> العربية (RTL)
          </button>
          <button class="grade-pill ${!isAr ? 'selected' : ''}" onclick="setLanguage('en')" style="padding:10px 18px;font-weight:700;font-size:14px;display:flex;align-items:center;gap:8px;">
            <i class="fas fa-check" style="display:${!isAr ? 'inline-block' : 'none'};color:var(--teal);"></i> English (LTR)
          </button>
        </div>
      </div>

      <!-- Profile Card -->
      <div class="card" style="margin-bottom:20px">
        <h3 style="font-size:16px;margin-bottom:14px">
          <i class="fas fa-user" style="color:var(--accent);margin-right:8px"></i>${isAr ? 'الملف الشخصي' : 'Profile'}
        </h3>
        <div style="margin-bottom:12px">
          <label style="font-size:13px;color:var(--text2);display:block;margin-bottom:4px">${isAr ? 'الاسم' : 'Name'}</label>
          <input class="input" id="set-name" value="${u.name}" placeholder="${isAr ? 'اكتب اسمك...' : 'Your name'}">
        </div>
        <div style="margin-bottom:12px">
          <label style="font-size:13px;color:var(--text2);display:block;margin-bottom:4px">${isAr ? 'المرحلة والصف الدراسي' : 'Grade'}</label>
          ${gradeSections(u.grade)}
        </div>
        <div>
          <label style="font-size:13px;color:var(--text2);display:block;margin-bottom:6px">${isAr ? 'اللون المميّز' : 'Color'}</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${(function() {
              const ownedColors = Store.get('inventory').colors || ['#FF8C42'];
              return ['#FF8C42','#4ECDC4','#FF6B6B','#58A6FF','#A855F7','#22C55E','#EC4899','#FBBF24'].map(c => {
                const isOwned = ownedColors.includes(c);
                if (isOwned) {
                  return `<div class="color-opt ${c===u.color?'selected':''}" style="background:${c}" data-color="${c}" onclick="document.querySelectorAll('.color-opt').forEach(o=>o.classList.remove('selected'));this.classList.add('selected')"></div>`;
                } else {
                  return `<div class="color-opt locked-color" style="background:${c}; position:relative; display:flex; align-items:center; justify-content:center; opacity:0.4; cursor:pointer;" onclick="navigate('store'); toast('${isAr ? 'قم بفتح هذا اللون من المتجر أولاً!' : 'Unlock this color in the Store first!'}','info')">
                    <i class="fas fa-lock" style="font-size:11px; color:#fff;"></i>
                  </div>`;
                }
              }).join('');
            })()}
          </div>
        </div>
        <button class="btn btn-primary btn-sm" style="margin-top:14px" onclick="saveProfile()">${isAr ? 'حفظ الملف الشخصي' : 'Save Profile'}</button>
      </div>

      <!-- Focus Durations Card -->
      <div class="card" style="margin-bottom:20px;">
        <h3 style="font-size:16px;margin-bottom:14px">
          <i class="fas fa-clock" style="color:var(--accent);margin-right:8px"></i>${isAr ? 'توقيتات جلسات التركيز' : 'Focus Timer Durations'}
        </h3>
        <div>
          <label style="font-size:13px;color:var(--text2);display:block;margin-bottom:6px">${isAr ? 'مدة التركيز الافتراضية' : 'Default focus duration'}</label>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${[5,10,15,20,25,30,45,60].map(m=>`<button class="grade-pill ${m===s.focusDuration?'selected':''}" onclick="Store.get('settings').focusDuration=${m};Store.save();SFX.click();renderSettings()">${m} ${isAr ? 'دقيقة' : 'min'}</button>`).join('')}
          </div>
        </div>
        <div style="margin-top:12px;">
          <label style="font-size:13px;color:var(--text2);display:block;margin-bottom:6px">${isAr ? 'مدة الاستراحة الافتراضية' : 'Default break duration'}</label>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${[3, 5, 10].map(m => `<button class="grade-pill ${m === s.breakDuration ? 'selected' : ''}" onclick="Store.get('settings').breakDuration=${m};Store.save();SFX.click();renderSettings()">${m} ${isAr ? 'دقيقة' : 'min'}</button>`).join('')}
          </div>
        </div>
      </div>

    <!-- Schedule & Timetable Customization -->
    <div class="card" style="margin-bottom:20px;border-color:rgba(78,205,196,.25)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
        <h3 style="font-size:16px;margin:0;display:flex;align-items:center;gap:8px">
          <i class="fas fa-calendar-days" style="color:var(--teal)"></i> Schedule & Timetable Settings
        </h3>
        <button class="btn btn-sm btn-ghost" onclick="showScheduleSettingsModal()" style="border:1px solid var(--border); font-size:12px;">
          <i class="fas fa-sliders"></i> Open Customizer
        </button>
      </div>
      <div style="margin-bottom:14px;">
        <label style="font-size:13px;color:var(--text2);display:block;margin-bottom:6px">Week Starts On</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${[
            { val: 6, label: 'Saturday', note: 'Egypt & Middle East' },
            { val: 0, label: 'Sunday', note: 'North America / Japan' },
            { val: 1, label: 'Monday', note: 'International ISO / Europe' }
          ].map(opt => `
            <button class="grade-pill ${sched.weekStartDay === opt.val ? 'selected' : ''}" 
                    onclick="saveScheduleSettings(${opt.val}, ${sched.dayStartHour}, ${sched.dayEndHour})" 
                    style="padding:8px 14px; display:flex; flex-direction:column; align-items:flex-start; text-align:left;">
              <span style="font-weight:700;">${opt.label}</span>
              <span style="font-size:10px; opacity:0.75;">${opt.note}</span>
            </button>
          `).join('')}
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:14px;margin-bottom:14px;">
        <div>
          <label style="font-size:13px;color:var(--text2);display:block;margin-bottom:6px">Day Starts At (Earliest Timetable Hour)</label>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${[4, 5, 6, 7, 8, 9, 10].map(h => `
              <button class="grade-pill ${sched.dayStartHour === h ? 'selected' : ''}" 
                      onclick="saveScheduleSettings(${sched.weekStartDay}, ${h}, ${sched.dayEndHour})">
                ${formatHour12(h)}
              </button>
            `).join('')}
          </div>
        </div>
        <div>
          <label style="font-size:13px;color:var(--text2);display:block;margin-bottom:6px">Day Ends At (Latest Timetable Hour)</label>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${[17, 18, 19, 20, 21, 22, 23].map(h => `
              <button class="grade-pill ${sched.dayEndHour === h ? 'selected' : ''}" 
                      onclick="saveScheduleSettings(${sched.weekStartDay}, ${sched.dayStartHour}, ${h})">
                ${formatHour12(h)}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
      <div style="font-size:12px;color:var(--text2);background:var(--bg);padding:8px 12px;border-radius:8px;border:1px solid var(--border);display:flex;align-items:center;gap:6px;">
        <i class="fas fa-info-circle" style="color:var(--teal)"></i>
        <span>Currently showing <strong>${{6:'Saturday',0:'Sunday',1:'Monday'}[sched.weekStartDay] || 'Custom'}</strong> as week start &middot; <strong>${formatHour12(sched.dayStartHour)} to ${formatHour12(sched.dayEndHour)}</strong> (${Math.max(1, sched.dayEndHour - sched.dayStartHour + 1)} hours/day).</span>
      </div>
    </div>
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

// ======================== UNIFIED MATH RENDERER (KATEX) & MATHEMATICAL SUITE ========================
function renderUnifiedMath(container = document.body) {
  if (typeof renderMathInElement === 'function') {
    try {
      renderMathInElement(container, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false,
        errorColor: '#FF6B6B'
      });
    } catch (e) {
      console.warn('Unified Math rendering error:', e);
    }
  }
}

function renderKatexToString(latex, display = false) {
  if (typeof katex !== 'undefined' && typeof katex.renderToString === 'function') {
    try {
      return katex.renderToString(latex, { displayMode: display, throwOnError: false });
    } catch (e) {
      return `<span class="katex-fallback">${escHtml(latex)}</span>`;
    }
  }
  return `<span class="katex-fallback">${escHtml(latex)}</span>`;
}

// ------------------------ SUITE STATE & ENGINE ------------------------
let calcTab = 'desmos'; // 'desmos', 'three3d', 'scratchpad', 'native', 'formulas', 'converter'
let calcAngleUnit = 'deg'; // 'deg', 'rad'
let calcMemory = 0;
let calcExpr = '';
let calcResult = '0';
let calcLastAns = '0';
let calcIsNew = true;
let calcBaseInputVal = '42';
let calcBaseType = 'dec';

// Desmos 2D Graphing API State
let desmosCalculator = null;
let desmosFullscreen = false;

// 3D Studio State (Three.js & Math3D.org)
let calc3dMode = 'three'; // 'three' or 'math3d'
let three3dFormula = '(x^2 - y^2)/4';
let three3dColormap = 'neon'; // 'neon', 'viridis', 'coolwarm', 'aurora'
let three3dAutoRotate = true;
let three3dWireframe = false;
let three3dFullscreen = false;
let threeScene = null, threeCamera = null, threeRenderer = null, threeControls = null;
let threeSurfaceMesh = null, threeWireMesh = null, threeAnimId = null, threeResizeObserver = null;

// Unified Math Scratchpad State
let unifiedMathText = 'f(x) = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}';
let savedUserFormulas = [
  'f(x) = x^2 - 4x + 3',
  'y = 2\\sin(3x) \\cdot e^{-0.1x}',
  'z = \\frac{x^2 - y^2}{4}',
  '\\int_{0}^{\\pi} \\sin(x)\\,dx = 2'
];

// ======================== CALCULATOR ARABIC LOCALIZATION DATA ========================
const CALC_ARABIC_DATA = {
  categories: {
    'Algebra & Polynomials': 'الجبر وكثيرات الحدود',
    'Trigonometry & Polar Waves': 'حساب المثلثات والموجات القطبية',
    'Calculus & Tangents': 'التفاضل والتكامل والمماسات',
    'Conics & Statistics': 'القطوع المخروطية والإحصاء',
    'algebra': 'الجبر والهندسة',
    'trig': 'حساب المثلثات',
    'calculus': 'التفاضل والتكامل',
    'constants': 'الثوابت العلمية'
  },
  desmosItems: {
    'Quadratic Parabola': { nameAr: 'القطع المكافئ من الدرجة الثانية', descAr: 'رأس المنحنى عند (2, -1) ونقاط التقاطع عند س = 1, 3' },
    'Cubic with Local Extrema': { nameAr: 'دالة تكعيبية مع نهايات عظمى وصغرى', descAr: 'نقاط انقلاب ونهايات محلية عظمى وصغرى' },
    'Factored Polynomial': { nameAr: 'كثيرة حدود مفككة إلى عوامل', descAr: 'منحنى متعدد الأصفار عند -1, 2, 3' },
    'Rational Hyperbola': { nameAr: 'دالة كسرية متماثلة', descAr: 'منحنى كسري متماثل ومحدود' },
    'Harmonic Sine Wave': { nameAr: 'موجة جيبية توافقية', descAr: 'سعة الموجة 2 والتردد الزاوي 3' },
    'Damped Oscillation': { nameAr: 'اهتزاز متخامد أسياً', descAr: 'حركة توافقية بتخميد أسي طبيعي' },
    'Polar 5-Petal Rose': { nameAr: 'وردة قطبية خماسية البتلات', descAr: 'منحنى قطبي زهري خماسي متماثل' },
    'Tangent Asymptotes': { nameAr: 'دالة الظل والخطوط التقاربية', descAr: 'منحنيات دورية بخطوط تقارب رأسية' },
    'Function & Derivative': { nameAr: 'الدالة الأصلية ومشتقتها الأولى', descAr: "كثيرة حدود مع رسم مشتقتها f'(x)" },
    'Dynamic Tangent Slider': { nameAr: 'مماس ديناميكي منزلق للمنحنى', descAr: 'خط مماس يتحرك بسلاسة على المنحنى' },
    'Accumulation Integral': { nameAr: 'دالة المساحة التراكمية (تكامل)', descAr: 'تكامل تراكمي لموجة الجيب' },
    'Taylor Series Polynomial': { nameAr: 'كثيرة حدود متسلسلة تايلور', descAr: 'تقريب تايلور من الدرجة الخامسة لدالة جا(س)' },
    'Standard Circle': { nameAr: 'معادلة الدائرة القياسية', descAr: 'نصف قطرها 5 ومركزها نقطة الأصل' },
    'Centered Ellipse': { nameAr: 'قطع ناقص متمركز', descAr: 'المحور الأكبر 6 والمحور الأصغر 4' },
    'Normal Bell Distribution': { nameAr: 'منحنى التوزيع الطبيعي الغاوسي', descAr: 'منحنى الجرس للتوزيع الاحتمالي القياسي' },
    'Hyperbola Conic': { nameAr: 'قطع زائد مخروطي', descAr: 'منحنى مخروطي بخطوط تقاربية' }
  },
  threeItems: {
    'Hyperbolic Paraboloid (Saddle)': { nameAr: 'السطح السرجي (البارابولويد الزائدي)', descAr: 'سطح سرجي كلاسيكي مع نقطة انقلاب صغرى وعظمى عند الأصل' },
    'Sinc Wave Ripple': { nameAr: 'موجة التموج الدائري (Sinc)', descAr: 'اضطراب موجي دائري ينتشر في السائل' },
    'Circular Paraboloid Bowl': { nameAr: 'وعاء القطع المكافئ الدائري', descAr: 'سطح مكافئ محدب مع نقطة نهاية صغرى مطلقة' },
    'Monkey Saddle': { nameAr: 'سرج القرد ثلاثي الانخفاضات', descAr: 'سطح رياضي ذو 3 منخفضات فراغية' },
    'Egg Carton / 2D Sine': { nameAr: 'شبكة الكرتون الجيبية 2D', descAr: 'شبكة متكررة من القمم والقيعان الدورية' },
    'Damped Shockwave': { nameAr: 'موجة صدمية متخامدة 3D', descAr: 'نبضة طاقة ميكانيكية تتلاشى للخارج' },
    'Gaussian Bell Curve 3D': { nameAr: 'منحنى الجرس الغاوسي 3D', descAr: 'كثافة التوزيع الاحتمالي ثنائي المتغير' },
    'Whirlpool Spiral Wave': { nameAr: 'دوامة الموجات متحدة المركز', descAr: 'نطاقات موجية متحدة المركز تهتز بتردد عالٍ' }
  },
  formulas: {
    'Quadratic Formula': { nameAr: 'القانون العام لمعادلات الدرجة الثانية', descAr: 'إيجاد الجذور الحقيقية والمركبة للمعادلة أ س² + ب س + جـ = 0' },
    'Pythagorean Theorem': { nameAr: 'نظرية فيثاغورس الهندسية', descAr: 'العلاقة الأساسية بين أطوال أضلاع المثلث القائم الزاوية' },
    'Difference of Squares': { nameAr: 'الفرق بين مربعين', descAr: 'متطابقة التحليل الجبري لكثيرات الحدود' },
    'Pythagorean Trig Identity': { nameAr: 'متطابقة فيثاغورس المثلثية', descAr: 'المتطابقة الدائرية الأساسية: جا²(س) + جتا²(س) = 1 لجميع الزوايا' },
    'Tangent Quotient': { nameAr: 'متطابقة قسمة دالة الظل', descAr: 'ظل الزاوية = الجيب ÷ جيب التمام مع خطوط التقارب الدورية' },
    'Double Angle Sine': { nameAr: 'قانون ضعف زاوية الجيب', descAr: 'متطابقة فك ضعف الزاوية: جا(2س) = 2 جا(س) جتا(س)' },
    'Law of Cosines': { nameAr: 'قانون جيب التمام للمثلثات', descAr: 'تعميم لنظرية فيثاغورس على أي مثلث مائل' },
    'Power Rule (Derivative)': { nameAr: 'قاعدة القوة في التفاضل', descAr: 'مشتقة الحدود الأسية ذات الأسس الحقيقية: ن س^(ن-1)' },
    'Exponential Derivative': { nameAr: 'مشتقة الدالة الأسية الطبيعية', descAr: 'الدالة الرياضية الحقيقية الفريدة المطابقة لمشتقتها تماماً' },
    'Fundamental Theorem of Calculus': { nameAr: 'النظرية الأساسية في التفاضل والتكامل', descAr: 'الربط الجوهري بين علم التفاضل والتكامل المحدد' },
    '3D Hyperbolic Paraboloid (Saddle)': { nameAr: 'السطح السرجي 3D (البارابولويد الزائدي)', descAr: 'سطح سرجي كلاسيكي مع نقطة سرجية حرجة عند الأصل' },
    '3D Sinc Ripple Surface': { nameAr: 'سطح التموج الدائري 3D', descAr: 'انتشار الموجات الدائرية المتماثلة قطرياً في فضاء ثلاثي الأبعاد' },
    "Euler's Identity": { nameAr: 'متطابقة أويلر الرياضية الشهيرة', descAr: 'المعادلة الأجمل في الرياضيات: توحيد الثوابت الأسية والمركبة والدائرية' },
    'Speed of Light (c)': { nameAr: 'سرعة الضوء في الفراغ (c)', descAr: 'السرعة الكونية القصوى للإشعاع الكهرومغناطيسي في الفراغ' },
    "Planck's Constant (h)": { nameAr: 'ثابت بلانك الكمومي (h)', descAr: 'الثابت الفيزيائي الأساسي في ميكانيكا الكم' },
    'Gravitational Constant (G)': { nameAr: 'ثابت الجذب العام لنيوتن (G)', descAr: 'الثابت الفيزيائي التجريبي في قانون الجذب الكوني لنيوتن' },
    "Avogadro's Number (Nₐ)": { nameAr: 'عدد أفوجادرو للمول (Nₐ)', descAr: 'عدد الجسيمات أو الذرات في مول واحد من أي مادة نقية' },
    'Golden Ratio (φ)': { nameAr: 'النسبة الذهبية الجمالية (φ)', descAr: 'النسبة الهندسية الجمالية ونهاية حدود متتالية فيبوناتشي' }
  }
};

const DESMOS_PRESETS = [
  {
    category: 'Algebra & Polynomials',
    icon: 'fa-chart-line',
    items: [
      { name: 'Quadratic Parabola', latex: 'y = x^2 - 4x + 3', desc: 'Vertex at (2, -1), roots at x = 1, 3' },
      { name: 'Cubic with Local Extrema', latex: 'y = x^3 - 3x^2 + 2', desc: 'Local maximum and minimum inflection' },
      { name: 'Factored Polynomial', latex: 'y = (x - 2)(x + 1)(x - 3)', desc: 'Multi-root curve with zeros at -1, 2, 3' },
      { name: 'Rational Hyperbola', latex: 'y = \\frac{x^2 - 1}{x^2 + 1}', desc: 'Symmetric bounded rational curve' }
    ]
  },
  {
    category: 'Trigonometry & Polar Waves',
    icon: 'fa-wave-square',
    items: [
      { name: 'Harmonic Sine Wave', latex: 'y = 2\\sin(3x)', desc: 'Amplitude 2, angular frequency 3' },
      { name: 'Damped Oscillation', latex: 'y = e^{-0.2x} \\cos(4x)', desc: 'Exponential decay harmonic motion' },
      { name: 'Polar 5-Petal Rose', latex: 'r = 3\\sin(5\\theta)', desc: 'Symmetric 5-petal floral curve' },
      { name: 'Tangent Asymptotes', latex: 'y = \\tan(x)', desc: 'Periodic vertical asymptotic curves' }
    ]
  },
  {
    category: 'Calculus & Tangents',
    icon: 'fa-square-root-variable',
    items: [
      { name: 'Function & Derivative', latex: 'f(x) = x^3 - 3x', desc: "Primary polynomial plus derivative f'(x)" },
      { name: 'Dynamic Tangent Slider', latex: "y - f(a) = f'(a)(x - a)", desc: 'Tangent line sliding across curve' },
      { name: 'Accumulation Integral', latex: 'y = \\int_{0}^{x} \\sin(t)\\,dt', desc: 'Area accumulation function' },
      { name: 'Taylor Series Polynomial', latex: 'y = x - \\frac{x^3}{6} + \\frac{x^5}{120}', desc: '5th-order Taylor polynomial for sin(x)' }
    ]
  },
  {
    category: 'Conics & Statistics',
    icon: 'fa-shapes',
    items: [
      { name: 'Standard Circle', latex: 'x^2 + y^2 = 25', desc: 'Radius 5 centered at origin' },
      { name: 'Centered Ellipse', latex: '\\frac{x^2}{9} + \\frac{y^2}{4} = 1', desc: 'Major axis 6, minor axis 4' },
      { name: 'Normal Bell Distribution', latex: 'y = \\frac{1}{\\sqrt{2\\pi}} e^{-\\frac{x^2}{2}}', desc: 'Standard Gaussian distribution curve' },
      { name: 'Hyperbola Conic', latex: '\\frac{x^2}{4} - \\frac{y^2}{9} = 1', desc: 'Asymptotic conic curve' }
    ]
  }
];

const THREE_3D_PRESETS = [
  { name: 'Hyperbolic Paraboloid (Saddle)', formula: '(x^2 - y^2)/4', latex: 'z = \\frac{x^2 - y^2}{4}', desc: 'Classic saddle surface with minimax point at origin' },
  { name: 'Sinc Wave Ripple', formula: '3 * sin(sqrt(x^2 + y^2) + 0.001) / (sqrt(x^2 + y^2) + 0.001)', latex: 'z = 3\\frac{\\sin\\left(\\sqrt{x^2+y^2}\\right)}{\\sqrt{x^2+y^2}}', desc: 'Circular wave disturbance spreading across fluid' },
  { name: 'Circular Paraboloid Bowl', formula: '(x^2 + y^2)/6', latex: 'z = \\frac{x^2 + y^2}{6}', desc: 'Convex paraboloid dish with global minimum' },
  { name: 'Monkey Saddle', formula: '(x^3 - 3*x*y^2)/10', latex: 'z = \\frac{x^3 - 3xy^2}{10}', desc: 'Surface with 3 depressions for legs and tail' },
  { name: 'Egg Carton / 2D Sine', formula: 'sin(x) * cos(y)', latex: 'z = \\sin(x)\\cos(y)', desc: 'Periodic lattice grid of peaks and valleys' },
  { name: 'Damped Shockwave', formula: '2.5 * exp(-0.15*(x^2+y^2)) * cos(sqrt(x^2+y^2))', latex: 'z = 2.5 e^{-0.15(x^2+y^2)}\\cos\\left(\\sqrt{x^2+y^2}\\right)', desc: 'Damped energy impulse dissipating outward' },
  { name: 'Gaussian Bell Curve 3D', formula: '3 * exp(-(x^2 + y^2)/3)', latex: 'z = 3 e^{-\\frac{x^2+y^2}{3}}', desc: 'Bivariate normal probability distribution density' },
  { name: 'Whirlpool Spiral Wave', formula: 'sin(sqrt(x^2+y^2)*2 - 1.5)', latex: 'z = \\sin\\left(2\\sqrt{x^2+y^2} - 1.5\\right)', desc: 'Concentric wave bands vibrating at high frequency' }
];

const MATH3D_PRESETS = [
  { name: '3D Vector Field & Flow Lines', desc: 'Visualizing 3D vector fields F(x,y,z) with direction vectors' },
  { name: 'Parametric Space Helix', desc: 'Space curves r(t) = ⟨cos(t), sin(t), t/3⟩ and tangent vectors' },
  { name: 'Hyperboloid of One Sheet', desc: 'Implicit quadric surface x² + y² - z² = 1 with saddle curves' },
  { name: 'Tangent Plane to Surface', desc: 'Gradient vectors ∇f and tangent planes at any point (x₀, y₀)' }
];

const MATH_FORMULAS = [
  {
    category: 'algebra',
    name: 'Quadratic Formula',
    latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    desc: 'Finds real and complex roots of ax² + bx + c = 0',
    insert: '(-b + sqrt(b^2 - 4*a*c))/(2*a)',
    desmos: 'y = x^2 - 4x + 3'
  },
  {
    category: 'algebra',
    name: 'Pythagorean Theorem',
    latex: 'a^2 + b^2 = c^2 \\implies c = \\sqrt{a^2 + b^2}',
    desc: 'Fundamental relationship between sides of a right triangle',
    insert: 'sqrt(a^2 + b^2)',
    desmos: 'x^2 + y^2 = 25'
  },
  {
    category: 'algebra',
    name: 'Difference of Squares',
    latex: 'a^2 - b^2 = (a - b)(a + b)',
    desc: 'Factoring identity for quadratic polynomials',
    insert: '(a - b)*(a + b)',
    desmos: 'y = x^2 - 9'
  },
  {
    category: 'trig',
    name: 'Pythagorean Trig Identity',
    latex: '\\sin^2(\\theta) + \\cos^2(\\theta) = 1',
    desc: 'Fundamental circular identity valid for all angles',
    insert: 'sin(x)^2 + cos(x)^2',
    desmos: 'y = \\sin(x)^2 + \\cos(x)^2'
  },
  {
    category: 'trig',
    name: 'Tangent Quotient',
    latex: '\\tan(\\theta) = \\frac{\\sin(\\theta)}{\\cos(\\theta)}',
    desc: 'Trigonometric quotient identity with periodic vertical asymptotes',
    insert: 'sin(x)/cos(x)',
    desmos: 'y = \\tan(x)'
  },
  {
    category: 'trig',
    name: 'Double Angle Sine',
    latex: '\\sin(2\\theta) = 2\\sin(\\theta)\\cos(\\theta)',
    desc: 'Double-angle sine expansion identity',
    insert: '2*sin(x)*cos(x)',
    desmos: 'y = 2\\sin(x)\\cos(x)'
  },
  {
    category: 'trig',
    name: 'Law of Cosines',
    latex: 'c^2 = a^2 + b^2 - 2ab\\cos(C)',
    desc: 'Generalizes Pythagorean theorem for any oblique triangle',
    insert: 'sqrt(a^2 + b^2 - 2*a*b*cos(C))'
  },
  {
    category: 'calculus',
    name: 'Power Rule (Derivative)',
    latex: '\\frac{d}{dx}\\left[x^n\\right] = n x^{n-1}',
    desc: 'Differentiation of polynomial terms with real exponents',
    insert: 'n*x^(n-1)',
    desmos: 'f(x) = x^3 - 3x'
  },
  {
    category: 'calculus',
    name: 'Exponential Derivative',
    latex: '\\frac{d}{dx}\\left[e^x\\right] = e^x',
    desc: 'The unique real function identical to its own derivative',
    insert: 'exp(x)',
    desmos: 'y = e^x'
  },
  {
    category: 'calculus',
    name: 'Fundamental Theorem of Calculus',
    latex: '\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)',
    desc: 'Connects differentiation with definite integration',
    insert: 'F(b) - F(a)',
    desmos: 'y = \\int_0^x \\sin(t)\\,dt'
  },
  {
    category: 'calculus',
    name: '3D Hyperbolic Paraboloid (Saddle)',
    latex: 'z = \\frac{x^2 - y^2}{4}',
    desc: 'Classic saddle surface with stationary minimax saddle point at origin',
    insert: '(x^2 - y^2)/4',
    three: '(x^2 - y^2)/4'
  },
  {
    category: 'calculus',
    name: '3D Sinc Ripple Surface',
    latex: 'z = 3\\frac{\\sin\\left(\\sqrt{x^2+y^2}\\right)}{\\sqrt{x^2+y^2}}',
    desc: 'Radially symmetric circular wave propagation in 3D',
    insert: '3*sin(sqrt(x^2+y^2))/(sqrt(x^2+y^2))',
    three: '3 * sin(sqrt(x^2+y^2)+0.001)/(sqrt(x^2+y^2)+0.001)'
  },
  {
    category: 'constants',
    name: "Euler's Identity",
    latex: 'e^{i\\pi} + 1 = 0',
    desc: 'Profound identity uniting exponential, imaginary, and circular constants',
    insert: '-1'
  },
  {
    category: 'constants',
    name: 'Speed of Light (c)',
    latex: 'c = 299{,}792{,}458\\text{ m/s}',
    desc: 'Universal speed of electromagnetic radiation in vacuum',
    insert: '299792458'
  },
  {
    category: 'constants',
    name: "Planck's Constant (h)",
    latex: 'h = 6.62607015 \\times 10^{-34}\\text{ J}\\cdot\\text{s}',
    desc: 'Fundamental quantum proportionality constant in physics',
    insert: '6.62607015e-34'
  },
  {
    category: 'constants',
    name: 'Gravitational Constant (G)',
    latex: 'G = 6.67430 \\times 10^{-11}\\text{ N}\\cdot\\text{m}^2/\\text{kg}^2',
    desc: "Empirical physical constant in Newton's law of gravitation",
    insert: '6.67430e-11'
  },
  {
    category: 'constants',
    name: "Avogadro's Number (Nₐ)",
    latex: 'N_A = 6.02214076 \\times 10^{23}\\text{ mol}^{-1}',
    desc: 'Number of constituent particles per mole of substance',
    insert: '6.02214076e23'
  },
  {
    category: 'constants',
    name: 'Golden Ratio (φ)',
    latex: '\\phi = \\frac{1 + \\sqrt{5}}{2} \\approx 1.6180339887',
    desc: 'Aesthetic geometric ratio and limit of successive Fibonacci terms',
    insert: '1.618033988749895'
  }
];

// ------------------------ MAIN CALCULATOR RENDERER ------------------------
function renderCalculator() {
  updateUserPanel();
  const el = document.getElementById('view-calculator');
  if (!el) return;

  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';

  // Restore settings if stored, migrate legacy geogebra tab to desmos
  const s = Store.get('calcSettings') || {};
  if (s.tab) calcTab = s.tab;
  if (calcTab === 'geogebra') calcTab = 'desmos';
  if (s.angleUnit && !calcAngleUnit) calcAngleUnit = s.angleUnit;

  el.innerHTML = `
    <div class="calc-container" dir="${isAr ? 'rtl' : 'ltr'}">
      <!-- Header with refined typography -->
      <div style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-size:26px; font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:4px;">
            <i class="fas fa-calculator" style="color:var(--teal);"></i> ${isAr ? 'الآلة الحاسبة والجناح الرياضي الشامل' : 'Mathematical Suite & Calculator'}
          </h1>
          <p style="color:var(--text2); font-size:14px; max-width:720px;">
            ${isAr
              ? 'بيئة رياضية شاملة ومتكاملة تضم محاكي الرسوم البيانية Desmos 2D، وراسم الأسطح ثلاثية الأبعاد Three.js 3D، ومنصة Math3D، ومحرر معادلات KaTeX الفوري المطابق لخطوط Desmos.'
              : 'Unified mathematical environment featuring the Desmos 2D Graphing API, Three.js 3D Surface Plotter, Math3D.org, and a Unified KaTeX Math Renderer matching Desmos typography.'}
          </p>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <button class="calc-mode-pill ${calcAngleUnit==='deg'?'active':''}" onclick="calcToggleAngleUnit()" title="${isAr ? 'التبديل بين الدرجات والراديان' : 'Toggle Degrees / Radians'}">
            <span class="dot"></span> ${isAr ? (calcAngleUnit==='deg' ? 'بالدرجات DEG' : 'بالراديان RAD') : calcAngleUnit.toUpperCase()}
          </button>
          <button class="btn btn-sm btn-ghost" onclick="showCalcHelpModal()" style="border:1px solid var(--border); font-size:12px; border-radius:10px;">
            <i class="fas fa-circle-question"></i> ${isAr ? 'الدليل والاختصارات' : 'Guide & Shortcuts'}
          </button>
        </div>
      </div>

      <!-- Segmented Navigation Tabs -->
      <div class="calc-nav-tabs">
        <button class="calc-tab-btn ${calcTab==='desmos'?'active':''}" onclick="calcSetTab('desmos')">
          <i class="fas fa-chart-line"></i> ${isAr ? 'راسم Desmos 2D' : 'Desmos 2D Grapher'}
        </button>
        <button class="calc-tab-btn ${calcTab==='three3d'?'active':''}" onclick="calcSetTab('three3d')">
          <i class="fas fa-cube"></i> ${isAr ? 'استوديو 3D (Three.js & Math3D)' : '3D Studio (Three.js & Math3D)'}
        </button>
        <button class="calc-tab-btn ${calcTab==='scratchpad'?'active':''}" onclick="calcSetTab('scratchpad')">
          <i class="fas fa-pen-to-square"></i> ${isAr ? 'استوديو معادلات KaTeX' : 'Unified Math Studio'}
        </button>
        <button class="calc-tab-btn ${calcTab==='native'?'active':''}" onclick="calcSetTab('native')">
          <i class="fas fa-calculator"></i> ${isAr ? 'الآلة العلمية الدقيقة' : 'Scientific Keypad'}
        </button>
        <button class="calc-tab-btn ${calcTab==='formulas'?'active':''}" onclick="calcSetTab('formulas')">
          <i class="fas fa-square-root-variable"></i> ${isAr ? 'بنك القوانين والثوابت' : 'Formulas & Constants'}
        </button>
        <button class="calc-tab-btn ${calcTab==='converter'?'active':''}" onclick="calcSetTab('converter')">
          <i class="fas fa-repeat"></i> ${isAr ? 'محول الأنظمة والزوايا' : 'Base & Unit Converter'}
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="calc-tab-content">
        ${calcTab === 'desmos' ? renderCalcDesmosTab() : ''}
        ${calcTab === 'three3d' ? renderCalcThree3dTab() : ''}
        ${calcTab === 'scratchpad' ? renderCalcScratchpadTab() : ''}
        ${calcTab === 'native' ? renderCalcNativeTab() : ''}
        ${calcTab === 'formulas' ? renderCalcFormulasTab() : ''}
        ${calcTab === 'converter' ? renderCalcConverterTab() : ''}
      </div>
    </div>
  `;

  // Initialize active tab interactive engines
  if (calcTab === 'desmos') {
    setTimeout(initDesmosGrapher, 50);
  } else if (calcTab === 'three3d') {
    setTimeout(initThree3dStudio, 50);
  } else if (calcTab === 'scratchpad') {
    setTimeout(initUnifiedMathStudio, 50);
  } else if (calcTab === 'native') {
    attachCalcKeyboardListener();
  }

  // Render unified KaTeX across all rendered math elements
  renderUnifiedMath(el);
}

function calcSetTab(t) {
  if (calcTab === 'three3d' && t !== 'three3d') {
    destroyThree3d();
  }
  calcTab = t;
  const s = Store.get('calcSettings') || {};
  s.tab = t;
  Store.set('calcSettings', s);
  SFX.click();
  renderCalculator();
}

// ======================== 1. DESMOS API GRAPHING SUITE ========================
function renderCalcDesmosTab() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  return `
    <div class="math-workstation" dir="${isAr ? 'rtl' : 'ltr'}">
      <!-- Toolbar with Actions & Helpers -->
      <div class="math-app-bar">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-weight:700; font-size:14px; color:var(--teal); display:inline-flex; align-items:center; gap:6px;">
            <i class="fas fa-chart-line"></i> ${isAr ? 'حاسبة الرسوم البيانية ثنائية الأبعاد Desmos API' : 'Desmos API 2D Graphing Calculator'}
          </span>
          <span class="tag" style="background:rgba(78,205,196,0.12); color:var(--teal); font-size:11px;">
            ${isAr ? 'واجهة الويب الرسمية' : 'Official Web API'}
          </span>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn btn-sm btn-ghost" onclick="desmosClearAll()" title="${isAr ? 'مسح كافة المعادلات' : 'Clear all equations'}" style="border:1px solid var(--border); font-size:12px; border-radius:10px;">
            <i class="fas fa-trash-can"></i> ${isAr ? 'مسح الكل' : 'Clear All'}
          </button>
          <button class="btn btn-sm btn-ghost" onclick="desmosResetView()" title="${isAr ? 'إعادة ضبط المشهد' : 'Reset viewport'}" style="border:1px solid var(--border); font-size:12px; border-radius:10px;">
            <i class="fas fa-rotate"></i> ${isAr ? 'إعادة ضبط' : 'Reset View'}
          </button>
          <button class="btn btn-sm btn-teal" id="desmos-fullscreen-btn" onclick="calcToggleDesmosFullscreen()" style="font-size:12px; border-radius:10px;">
            <i class="fas fa-expand"></i> ${isAr ? (desmosFullscreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة') : (desmosFullscreen ? 'Exit Fullscreen' : 'Fullscreen')}
          </button>
        </div>
      </div>

      <!-- Quick Command Bar for Direct Desmos Plotting -->
      <div class="math-cmd-panel">
        <i class="fas fa-terminal" style="color:var(--teal); font-size:14px;"></i>
        <input
          id="desmos-cmd-input"
          class="math-cmd-input"
          type="text"
          placeholder="${isAr ? 'اكتب معادلة أو دالة (مثال: y = \\sin(3x) * e^{-0.2x}، y = x^2 - 4x + 3، x^2 + y^2 = 25)...' : 'Type formula (e.g. y = \\sin(3x) * e^{-0.2x}, y = x^2 - 4x + 3, x^2 + y^2 = 25)...'}"
          onkeydown="if(event.key==='Enter'){desmosSubmitCommand();}"
        />
        <button class="btn btn-sm btn-teal" onclick="desmosSubmitCommand()" style="font-size:12px; white-space:nowrap; border-radius:8px;">
          <i class="fas fa-paper-plane"></i> ${isAr ? 'رسم في Desmos' : 'Graph in Desmos'}
        </button>
      </div>

      <!-- Instant Math Presets Ribbon -->
      <div>
        <div style="font-size:11px; font-weight:700; color:var(--text2); text-transform:uppercase; letter-spacing:0.6px; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
          <i class="fas fa-bolt" style="color:var(--accent);"></i> ${isAr ? 'نماذج دوال فورية (رسم بنقرة واحدة)' : 'Instant Graph Presets (1-Click Plot)'}
        </div>
        <div class="calc-preset-ribbon no-scrollbar">
          ${DESMOS_PRESETS.flatMap(g => g.items.slice(0, 2)).map(p => {
            const pName = (isAr && CALC_ARABIC_DATA.desmosItems[p.name]?.nameAr) || p.name;
            const pDesc = (isAr && CALC_ARABIC_DATA.desmosItems[p.name]?.descAr) || p.desc;
            return `
            <button class="calc-preset-chip" onclick="desmosPlotFormula('${escHtml(p.latex)}')" title="${escHtml(pDesc)}">
              <i class="fas fa-play" style="font-size:10px; color:var(--teal);"></i>
              <strong>${escHtml(pName)}:</strong>
              <span style="font-family:monospace; color:var(--text2);" dir="ltr">${escHtml(p.latex)}</span>
            </button>
          `;}).join('')}
        </div>
      </div>

      <!-- Main Desmos Canvas Chassis -->
      <div id="desmos-frame-wrapper" class="desmos-frame-chassis ${desmosFullscreen ? 'fullscreen' : ''}" dir="ltr">
        <div id="desmos-calculator"></div>
      </div>

      <!-- Presets Reference Gallery by Mathematical Topic -->
      <div class="card" style="margin-top:4px; border-radius:16px;">
        <h3 style="font-size:15px; font-weight:700; margin-bottom:14px; display:flex; align-items:center; gap:8px;">
          <i class="fas fa-lightbulb" style="color:var(--accent);"></i> ${isAr ? 'معرض صيغ ومخططات Desmos حسب الموضوع' : 'Desmos Formula Gallery by Topic'}
        </h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:14px;">
          ${DESMOS_PRESETS.map(cat => {
            const catTitle = (isAr && CALC_ARABIC_DATA.categories[cat.category]) || cat.category;
            return `
            <div style="background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:14px;">
              <div style="font-size:13px; font-weight:700; color:var(--teal); margin-bottom:10px; display:flex; align-items:center; gap:6px;">
                <i class="fas ${cat.icon}"></i> ${catTitle}
              </div>
              <div style="display:flex; flex-direction:column; gap:6px;">
                ${cat.items.map(item => {
                  const itName = (isAr && CALC_ARABIC_DATA.desmosItems[item.name]?.nameAr) || item.name;
                  return `
                  <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:6px 8px; border-radius:8px; background:var(--card); font-size:12px; border:1px solid var(--border);">
                    <div style="min-width:0; flex:1;">
                      <div style="font-weight:700; color:var(--text);">${escHtml(itName)}</div>
                      <div style="font-family:monospace; color:var(--text2); font-size:11px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" dir="ltr">${escHtml(item.latex)}</div>
                    </div>
                    <button class="btn btn-xs btn-ghost" onclick="desmosPlotFormula('${escHtml(item.latex)}')" title="${isAr ? 'إدراج ورسم' : 'Insert & Graph'}" style="color:var(--teal);">
                      <i class="fas fa-play"></i>
                    </button>
                  </div>
                `;}).join('')}
              </div>
            </div>
          `;}).join('')}
        </div>
      </div>
    </div>
  `;
}

function initDesmosGrapher() {
  const elt = document.getElementById('desmos-calculator');
  if (!elt) return;

  if (typeof Desmos === 'undefined') {
    elt.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:var(--text2); gap:12px;">
        <i class="fas fa-spinner fa-spin" style="font-size:28px; color:var(--teal);"></i>
        <span>Loading Desmos API Calculator...</span>
      </div>
    `;
    setTimeout(initDesmosGrapher, 400);
    return;
  }

  if (desmosCalculator) {
    try {
      desmosCalculator.resize();
    } catch (e) {}
    return;
  }

  elt.innerHTML = '';
  desmosCalculator = Desmos.GraphingCalculator(elt, {
    keypad: true,
    expressions: true,
    settingsMenu: true,
    zoomButtons: true,
    border: false,
    fontSize: 14,
    showResetButtonOnGraphpaper: true
  });

  // Seed with initial illustrative expressions
  desmosCalculator.setExpressions([
    { id: 'exp_seed_1', latex: 'y = \\sin(x) \\cdot \\cos(0.5x)', color: '#4ECDC4' },
    { id: 'exp_seed_2', latex: 'y = \\frac{1}{2}x^2 - 3', color: '#FF8C42' },
    { id: 'exp_seed_3', latex: '(2, -1)', label: 'Vertex', showLabel: true, color: '#FF8C42' }
  ]);
}

function desmosPlotFormula(latex) {
  if (!latex) return;
  if (calcTab !== 'desmos') {
    calcSetTab('desmos');
  }
  setTimeout(() => {
    if (!desmosCalculator) initDesmosGrapher();
    if (desmosCalculator) {
      const exprId = 'user_expr_' + Date.now();
      desmosCalculator.setExpression({ id: exprId, latex: latex });
      toast(`Plotted in Desmos: ${latex}`, 'success');
      Store.addXP(5);
      SFX.success();
    }
  }, 100);
}

function desmosSubmitCommand() {
  const inputEl = document.getElementById('desmos-cmd-input');
  const val = inputEl ? inputEl.value.trim() : '';
  if (!val) {
    toast('Please enter a mathematical expression for Desmos', 'warn');
    return;
  }
  desmosPlotFormula(val);
  if (inputEl) inputEl.value = '';
}

function desmosClearAll() {
  if (desmosCalculator) {
    desmosCalculator.setBlank();
    toast('Cleared all Desmos expressions', 'info');
    SFX.click();
  }
}

function desmosResetView() {
  if (desmosCalculator) {
    desmosCalculator.setDefaultState();
    toast('Desmos view reset to default', 'info');
    SFX.click();
  }
}

function calcToggleDesmosFullscreen() {
  desmosFullscreen = !desmosFullscreen;
  const c = document.getElementById('desmos-frame-wrapper');
  const btn = document.getElementById('desmos-fullscreen-btn');
  if (c) c.classList.toggle('fullscreen', desmosFullscreen);
  if (btn) {
    btn.innerHTML = desmosFullscreen
      ? `<i class="fas fa-compress"></i> Exit Fullscreen`
      : `<i class="fas fa-expand"></i> Fullscreen`;
  }
  if (desmosCalculator) {
    setTimeout(() => desmosCalculator.resize(), 100);
  }
  SFX.click();
}

// ======================== 2. THREE.JS 3D VISUALIZER & MATH3D.ORG ========================
function renderCalcThree3dTab() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  return `
    <div class="math-workstation" dir="${isAr ? 'rtl' : 'ltr'}">
      <!-- Toolbar with 3D Mode Switcher (Three.js vs Math3D.org) -->
      <div class="math-app-bar">
        <div class="math-switcher-deck">
          <button class="math-sub-pill ${calc3dMode==='three'?'active':''}" onclick="calcSet3dMode('three')">
            <i class="fas fa-cube"></i> ${isAr ? 'مجسمات Three.js 3D' : 'Three.js 3D Visualizer'}
          </button>
          <button class="math-sub-pill ${calc3dMode==='math3d'?'active':''}" onclick="calcSet3dMode('math3d')">
            <i class="fas fa-globe"></i> ${isAr ? 'منصة Math3D.org' : 'Math3D.org Workstation'}
          </button>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          ${calc3dMode === 'three' ? `
            <button class="btn btn-sm btn-ghost" onclick="three3dResetCamera()" title="${isAr ? 'إعادة ضبط الكاميرا' : 'Reset 3D camera'}" style="border:1px solid var(--border); font-size:12px; border-radius:10px;">
              <i class="fas fa-camera-rotate"></i> ${isAr ? 'ضبط الكاميرا' : 'Reset Camera'}
            </button>
            <button class="btn btn-sm btn-teal" id="three-fullscreen-btn" onclick="three3dToggleFullscreen()" style="font-size:12px; border-radius:10px;">
              <i class="fas fa-expand"></i> ${isAr ? (three3dFullscreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة') : (three3dFullscreen ? 'Exit Fullscreen' : 'Fullscreen')}
            </button>
          ` : `
            <button class="btn btn-sm btn-ghost" onclick="math3dReset()" title="${isAr ? 'إعادة تحميل المنصة' : 'Reload Math3D'}" style="border:1px solid var(--border); font-size:12px; border-radius:10px;">
              <i class="fas fa-rotate"></i> ${isAr ? 'تحديث' : 'Reload'}
            </button>
            <button class="btn btn-sm btn-teal" id="math3d-fullscreen-btn" onclick="math3dToggleFullscreen()" style="font-size:12px; border-radius:10px;">
              <i class="fas fa-expand"></i> ${isAr ? (three3dFullscreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة') : (three3dFullscreen ? 'Exit Fullscreen' : 'Fullscreen')}
            </button>
            <a href="https://www.math3d.org/" target="_blank" rel="noopener" class="btn btn-sm btn-secondary" title="${isAr ? 'فتح math3d.org في نافذة جديدة' : 'Open math3d.org in new window'}" style="font-size:12px; border-radius:10px;">
              <i class="fas fa-arrow-up-right-from-square"></i>
            </a>
          `}
        </div>
      </div>

      ${calc3dMode === 'three' ? renderThree3dContent() : renderMath3dContent()}
    </div>
  `;
}

function renderThree3dContent() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  return `
    <!-- Command Bar for 3D Surface Function -->
    <div class="math-cmd-panel">
      <span style="font-weight:700; color:var(--teal); font-family:monospace; font-size:15px;" dir="ltr">z = f(x, y) =</span>
      <input
        id="three-formula-input"
        class="math-cmd-input"
        type="text"
        dir="ltr"
        value="${escHtml(three3dFormula)}"
        placeholder="${isAr ? 'اكتب دالة السطح z = f(x, y) (مثال: (x^2 - y^2)/4، 3*sin(sqrt(x^2+y^2))/sqrt(x^2+y^2))...' : 'Type z = f(x, y) (e.g. (x^2 - y^2)/4, 3*sin(sqrt(x^2+y^2))/sqrt(x^2+y^2), sin(x)*cos(y))...'}"
        onkeydown="if(event.key==='Enter'){three3dApplyInput();}"
      />
      <button class="btn btn-sm btn-teal" onclick="three3dApplyInput()" style="font-size:12px; white-space:nowrap; border-radius:8px;">
        <i class="fas fa-cube"></i> ${isAr ? 'رسم السطح 3D' : 'Plot 3D Surface'}
      </button>
    </div>

    <!-- 3D Presets Ribbon -->
    <div>
      <div style="font-size:11px; font-weight:700; color:var(--text2); text-transform:uppercase; letter-spacing:0.6px; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
        <i class="fas fa-bolt" style="color:var(--accent);"></i> ${isAr ? 'نماذج الأسطح ثلاثية الأبعاد الجاهزة' : '3D Surface Presets'}
      </div>
      <div class="calc-preset-ribbon no-scrollbar">
        ${THREE_3D_PRESETS.map(p => {
          const pName = (isAr && CALC_ARABIC_DATA.threeItems[p.name]?.nameAr) || p.name;
          const pDesc = (isAr && CALC_ARABIC_DATA.threeItems[p.name]?.descAr) || p.desc;
          return `
          <button class="calc-preset-chip" onclick="three3dPlotFormula('${escHtml(p.formula)}')" title="${escHtml(pDesc)}">
            <i class="fas fa-cube" style="font-size:10px; color:var(--accent);"></i>
            <strong>${escHtml(pName)}:</strong>
            <span style="font-family:monospace; color:var(--text2);" dir="ltr">${escHtml(p.formula)}</span>
          </button>
        `;}).join('')}
      </div>
    </div>

    <!-- Three.js 3D Viewport Chassis -->
    <div id="three-frame-wrapper" class="three-chassis ${three3dFullscreen ? 'fullscreen' : ''}" dir="ltr">
      <div id="three-canvas-mount"></div>

      <!-- Real-Time HUD Overlay with KaTeX Math -->
      <div class="three-overlay-hud" dir="${isAr ? 'rtl' : 'ltr'}">
        <div class="three-hud-badge">
          <i class="fas fa-cube" style="color:var(--teal);"></i>
          <span id="three-hud-formula">
            ${renderKatexToString(`z = ${three3dFormula}`, false)}
          </span>
        </div>
        <div class="three-hud-badge" style="font-size:11px; color:#94A3B8;">
          <i class="fas fa-arrows-up-down-left-right"></i> ${isAr ? 'اسحب للتدوير • العجلة للتكبير والتصغير • زر الفأرة الأيمن للإزاحة' : 'Drag to Rotate • Wheel to Zoom • Right-Click to Pan'}
        </div>
      </div>

      <!-- Quick Interactive 3D Controls -->
      <div class="three-hud-controls" dir="${isAr ? 'rtl' : 'ltr'}">
        <button class="btn btn-xs btn-ghost" onclick="three3dToggleRotate()" style="background:rgba(13,17,28,0.85); color:#FFF; border:1px solid rgba(255,255,255,0.15); border-radius:8px;">
          <i class="fas fa-arrows-spin"></i> ${isAr ? (`دوران تلقائي: ${three3dAutoRotate ? 'مفعل' : 'معطل'}`) : (`Auto-Spin: ${three3dAutoRotate ? 'ON' : 'OFF'}`)}
        </button>
        <button class="btn btn-xs btn-ghost" onclick="three3dToggleWireframe()" style="background:rgba(13,17,28,0.85); color:#FFF; border:1px solid rgba(255,255,255,0.15); border-radius:8px;">
          <i class="fas fa-border-all"></i> ${isAr ? (`شبكة خطوط: ${three3dWireframe ? 'مفعلة' : 'معطلة'}`) : (`Wireframe: ${three3dWireframe ? 'ON' : 'OFF'}`)}
        </button>
        <select onchange="three3dSetColormap(this.value)" style="background:rgba(13,17,28,0.85); color:#FFF; border:1px solid rgba(255,255,255,0.15); border-radius:8px; font-size:11px; padding:4px 8px;">
          <option value="neon" ${three3dColormap==='neon'?'selected':''}>${isAr ? 'الألوان: نيون سايبربانك' : 'Colormap: Neon Cyberpunk'}</option>
          <option value="viridis" ${three3dColormap==='viridis'?'selected':''}>${isAr ? 'الألوان: فيريديس العلمي' : 'Colormap: Viridis'}</option>
          <option value="coolwarm" ${three3dColormap==='coolwarm'?'selected':''}>${isAr ? 'الألوان: بارد - دافئ' : 'Colormap: Cool-Warm'}</option>
          <option value="aurora" ${three3dColormap==='aurora'?'selected':''}>${isAr ? 'الألوان: الشفق الزمردي' : 'Colormap: Emerald Aurora'}</option>
        </select>
      </div>
    </div>
  `;
}

function renderMath3dContent() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  return `
    <div id="math3d-frame-wrapper" class="math3d-frame-chassis ${three3dFullscreen ? 'fullscreen' : ''}" dir="ltr">
      <iframe
        id="math3d-iframe"
        src="https://www.math3d.org/"
        title="Math3D.org Workstation"
        allow="fullscreen; clipboard-read; clipboard-write"
        loading="lazy">
      </iframe>
    </div>

    <!-- Math3D Reference Topics -->
    <div class="card" style="border-radius:16px;">
      <h3 style="font-size:15px; font-weight:700; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
        <i class="fas fa-compass" style="color:var(--teal);"></i> ${isAr ? 'حساب التفاضل والتكامل متعدد المتغيرات في Math3D' : 'Multivariable Calculus in Math3D.org'}
      </h3>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:12px;">
        ${MATH3D_PRESETS.map(p => `
          <div style="background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:12px;">
            <div style="font-weight:700; font-size:13px; color:var(--text); margin-bottom:4px;">${escHtml(p.name)}</div>
            <div style="font-size:12px; color:var(--text2);">${escHtml(p.desc)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function calcSet3dMode(mode) {
  if (mode !== 'three') destroyThree3d();
  calc3dMode = mode;
  SFX.click();
  renderCalculator();
}

function math3dReset() {
  const iframe = document.getElementById('math3d-iframe');
  if (iframe) {
    const src = iframe.src;
    iframe.src = '';
    setTimeout(() => { iframe.src = src; }, 50);
    toast('Math3D.org refreshed', 'info');
  }
}

function math3dToggleFullscreen() {
  three3dFullscreen = !three3dFullscreen;
  const c = document.getElementById('math3d-frame-wrapper');
  const btn = document.getElementById('math3d-fullscreen-btn');
  if (c) c.classList.toggle('fullscreen', three3dFullscreen);
  if (btn) {
    btn.innerHTML = three3dFullscreen
      ? `<i class="fas fa-compress"></i> Exit Fullscreen`
      : `<i class="fas fa-expand"></i> Fullscreen`;
  }
  SFX.click();
}

// ------------------------ THREE.JS INITIALIZATION & RUNTIME ------------------------
function destroyThree3d() {
  if (threeAnimId) {
    cancelAnimationFrame(threeAnimId);
    threeAnimId = null;
  }
  if (threeResizeObserver) {
    threeResizeObserver.disconnect();
    threeResizeObserver = null;
  }
  if (threeRenderer) {
    try {
      threeRenderer.dispose();
      if (threeRenderer.domElement && threeRenderer.domElement.parentNode) {
        threeRenderer.domElement.parentNode.removeChild(threeRenderer.domElement);
      }
    } catch (e) {}
    threeRenderer = null;
  }
  threeScene = null;
  threeCamera = null;
  threeControls = null;
  threeSurfaceMesh = null;
  threeWireMesh = null;
}

function compileMathFunction(exprStr) {
  let s = (exprStr || '').trim().toLowerCase();
  if (!s) s = '(x*x - y*y)/4';

  s = s.replace(/\^/g, '**');
  s = s.replace(/(\d)([a-z(])/g, '$1*$2');
  s = s.replace(/(\))([a-z0-9(])/g, '$1*$2');

  const fns = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'sqrt', 'cbrt', 'abs', 'exp', 'log'];
  fns.forEach(fn => {
    const reg = new RegExp('\\b' + fn + '\\b', 'g');
    s = s.replace(reg, 'Math.' + fn);
  });
  s = s.replace(/\bpi\b/g, 'Math.PI');
  s = s.replace(/\be\b/g, 'Math.E');

  try {
    const fn = new Function('x', 'y', `"use strict"; return (${s});`);
    const val = fn(1, 1);
    if (typeof val !== 'number' || isNaN(val)) throw new Error('Invalid formula');
    return fn;
  } catch (e) {
    console.warn('Formula parse error, fallback to saddle:', e);
    return (x, y) => (x * x - y * y) / 4;
  }
}

function getColormapColor(t, scheme = 'neon') {
  t = Math.max(0, Math.min(1, t));
  if (scheme === 'viridis') {
    if (t < 0.25) {
      const u = t / 0.25;
      return { r: 0.27 * (1 - u) + 0.19 * u, g: 0.0 * (1 - u) + 0.40 * u, b: 0.33 * (1 - u) + 0.55 * u };
    } else if (t < 0.5) {
      const u = (t - 0.25) / 0.25;
      return { r: 0.19 * (1 - u) + 0.13 * u, g: 0.40 * (1 - u) + 0.57 * u, b: 0.55 * (1 - u) + 0.55 * u };
    } else if (t < 0.75) {
      const u = (t - 0.5) / 0.25;
      return { r: 0.13 * (1 - u) + 0.46 * u, g: 0.57 * (1 - u) + 0.78 * u, b: 0.55 * (1 - u) + 0.35 * u };
    } else {
      const u = (t - 0.75) / 0.25;
      return { r: 0.46 * (1 - u) + 0.99 * u, g: 0.78 * (1 - u) + 0.90 * u, b: 0.35 * (1 - u) + 0.14 * u };
    }
  } else if (scheme === 'coolwarm') {
    if (t < 0.5) {
      const u = t / 0.5;
      return { r: 0.23 * (1 - u) + 0.92 * u, g: 0.44 * (1 - u) + 0.92 * u, b: 0.85 * (1 - u) + 0.92 * u };
    } else {
      const u = (t - 0.5) / 0.5;
      return { r: 0.92 * (1 - u) + 0.85 * u, g: 0.92 * (1 - u) + 0.20 * u, b: 0.92 * (1 - u) + 0.25 * u };
    }
  } else if (scheme === 'aurora') {
    if (t < 0.5) {
      const u = t / 0.5;
      return { r: 0.05 * (1 - u) + 0.10 * u, g: 0.20 * (1 - u) + 0.85 * u, b: 0.50 * (1 - u) + 0.65 * u };
    } else {
      const u = (t - 0.5) / 0.5;
      return { r: 0.10 * (1 - u) + 0.90 * u, g: 0.85 * (1 - u) + 0.95 * u, b: 0.65 * (1 - u) + 0.20 * u };
    }
  } else {
    // 'neon' Cyberpunk
    if (t < 0.5) {
      const u = t / 0.5;
      return { r: 0.10 * (1 - u) + 0.70 * u, g: 0.85 * (1 - u) + 0.25 * u, b: 0.95 * (1 - u) + 0.90 * u };
    } else {
      const u = (t - 0.5) / 0.5;
      return { r: 0.70 * (1 - u) + 1.00 * u, g: 0.25 * (1 - u) + 0.55 * u, b: 0.90 * (1 - u) + 0.15 * u };
    }
  }
}

function buildSurfaceGeometry(fn, xMin = -5, xMax = 5, yMin = -5, yMax = 5, segments = 55) {
  const geom = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];
  const indices = [];

  const dx = (xMax - xMin) / segments;
  const dy = (yMax - yMin) / segments;

  let minZ = Infinity;
  let maxZ = -Infinity;
  const zGrid = [];

  for (let i = 0; i <= segments; i++) {
    const x = xMin + i * dx;
    zGrid[i] = [];
    for (let j = 0; j <= segments; j++) {
      const y = yMin + j * dy;
      let z = 0;
      try {
        z = fn(x, y);
        if (isNaN(z) || !isFinite(z)) z = 0;
        z = Math.max(-12, Math.min(12, z));
      } catch (e) {
        z = 0;
      }
      zGrid[i][j] = z;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }
  }

  const rangeZ = (maxZ - minZ) > 0.001 ? (maxZ - minZ) : 1;

  for (let i = 0; i <= segments; i++) {
    const x = xMin + i * dx;
    for (let j = 0; j <= segments; j++) {
      const y = yMin + j * dy;
      const z = zGrid[i][j];
      positions.push(x, z, y);

      const t = Math.max(0, Math.min(1, (z - minZ) / rangeZ));
      const c = getColormapColor(t, three3dColormap);
      colors.push(c.r, c.g, c.b);
    }
  }

  const stride = segments + 1;
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * stride + j;
      const b = (i + 1) * stride + j;
      const c = (i + 1) * stride + (j + 1);
      const d = i * stride + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  return geom;
}

function initThree3dStudio() {
  if (calc3dMode !== 'three') return;
  const container = document.getElementById('three-canvas-mount');
  if (!container || typeof THREE === 'undefined') return;

  destroyThree3d();

  const width = container.clientWidth || 800;
  const height = container.clientHeight || 580;

  threeScene = new THREE.Scene();
  threeScene.background = new THREE.Color(0x080C16);

  threeCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  threeCamera.position.set(13, 11, 15);

  threeRenderer = new THREE.WebGLRenderer({ antialias: true });
  threeRenderer.setSize(width, height);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  container.appendChild(threeRenderer.domElement);

  if (typeof THREE.OrbitControls !== 'undefined') {
    threeControls = new THREE.OrbitControls(threeCamera, threeRenderer.domElement);
    threeControls.enableDamping = true;
    threeControls.dampingFactor = 0.05;
    threeControls.autoRotate = three3dAutoRotate;
    threeControls.autoRotateSpeed = 1.2;
    threeControls.maxDistance = 50;
    threeControls.minDistance = 3;
  }

  // Lighting
  const ambient = new THREE.AmbientLight(0xFFFFFF, 0.65);
  threeScene.add(ambient);

  const dirLight1 = new THREE.DirectionalLight(0x4ECDC4, 0.8);
  dirLight1.position.set(15, 20, 10);
  threeScene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xFF8C42, 0.6);
  dirLight2.position.set(-15, -10, -10);
  threeScene.add(dirLight2);

  // Coordinate Grid & Axes
  const grid = new THREE.GridHelper(14, 14, 0x4ECDC4, 0x1E293B);
  grid.position.y = -0.01;
  threeScene.add(grid);

  // RGB Axes helper
  const axes = new THREE.AxesHelper(6);
  threeScene.add(axes);

  // Build Surface Mesh
  const fn = compileMathFunction(three3dFormula);
  const geom = buildSurfaceGeometry(fn);
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.35,
    metalness: 0.15,
    side: THREE.DoubleSide
  });
  threeSurfaceMesh = new THREE.Mesh(geom, mat);
  threeScene.add(threeSurfaceMesh);

  // Wireframe Overlay Mesh
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    wireframe: true,
    transparent: true,
    opacity: 0.2
  });
  threeWireMesh = new THREE.Mesh(geom, wireMat);
  threeWireMesh.visible = three3dWireframe;
  threeScene.add(threeWireMesh);

  // Animation Loop
  function animate() {
    threeAnimId = requestAnimationFrame(animate);
    if (threeControls) threeControls.update();
    if (threeRenderer && threeScene && threeCamera) {
      threeRenderer.render(threeScene, threeCamera);
    }
  }
  animate();

  // Resize Observer
  threeResizeObserver = new ResizeObserver(() => {
    if (!container || !threeRenderer || !threeCamera) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w > 0 && h > 0) {
      threeCamera.aspect = w / h;
      threeCamera.updateProjectionMatrix();
      threeRenderer.setSize(w, h);
    }
  });
  threeResizeObserver.observe(container);
}

function three3dSetFormula(formulaStr) {
  three3dFormula = formulaStr;
  const inputEl = document.getElementById('three-formula-input');
  if (inputEl) inputEl.value = formulaStr;

  const badgeEl = document.getElementById('three-hud-formula');
  if (badgeEl) {
    badgeEl.innerHTML = renderKatexToString(`z = ${formulaStr}`, false);
  }

  if (threeSurfaceMesh && threeScene) {
    const fn = compileMathFunction(formulaStr);
    const newGeom = buildSurfaceGeometry(fn);
    threeSurfaceMesh.geometry.dispose();
    threeSurfaceMesh.geometry = newGeom;

    if (threeWireMesh) {
      threeWireMesh.geometry = newGeom;
    }
  }
}

function three3dPlotFormula(formulaStr) {
  if (calcTab !== 'three3d') calcSetTab('three3d');
  if (calc3dMode !== 'three') calcSet3dMode('three');

  setTimeout(() => {
    three3dSetFormula(formulaStr);
    toast(`Plotted in 3D: z = ${formulaStr}`, 'success');
    Store.addXP(5);
    SFX.success();
  }, 100);
}

function three3dApplyInput() {
  const el = document.getElementById('three-formula-input');
  const val = el ? el.value.trim() : '';
  if (!val) {
    toast('Please enter a 3D function expression', 'warn');
    return;
  }
  three3dSetFormula(val);
  toast(`3D Surface updated: z = ${val}`, 'success');
  Store.addXP(5);
  SFX.success();
}

function three3dSetColormap(cmap) {
  three3dColormap = cmap;
  if (threeSurfaceMesh) {
    const fn = compileMathFunction(three3dFormula);
    const newGeom = buildSurfaceGeometry(fn);
    threeSurfaceMesh.geometry.dispose();
    threeSurfaceMesh.geometry = newGeom;
    if (threeWireMesh) threeWireMesh.geometry = newGeom;
  }
}

function three3dToggleRotate() {
  three3dAutoRotate = !three3dAutoRotate;
  if (threeControls) threeControls.autoRotate = three3dAutoRotate;
  const el = document.getElementById('calc-tab-content');
  if (el) renderCalculator();
}

function three3dToggleWireframe() {
  three3dWireframe = !three3dWireframe;
  if (threeWireMesh) threeWireMesh.visible = three3dWireframe;
  const el = document.getElementById('calc-tab-content');
  if (el) renderCalculator();
}

function three3dResetCamera() {
  if (threeCamera && threeControls) {
    threeCamera.position.set(13, 11, 15);
    threeControls.target.set(0, 0, 0);
    threeControls.update();
    toast('Camera position reset', 'info');
    SFX.click();
  }
}

function three3dToggleFullscreen() {
  three3dFullscreen = !three3dFullscreen;
  const c = document.getElementById('three-frame-wrapper');
  const btn = document.getElementById('three-fullscreen-btn');
  if (c) c.classList.toggle('fullscreen', three3dFullscreen);
  if (btn) {
    btn.innerHTML = three3dFullscreen
      ? `<i class="fas fa-compress"></i> Exit Fullscreen`
      : `<i class="fas fa-expand"></i> Fullscreen`;
  }
  SFX.click();
}

// ======================== 3. UNIFIED MATH LATEX STUDIO & SCRATCHPAD ========================
function renderCalcScratchpadTab() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const symbols = [
    { label: 'a/b', latex: '\\frac{a}{b}', title: isAr ? 'كسر اعتيادي' : 'Fraction' },
    { label: '√x', latex: '\\sqrt{x}', title: isAr ? 'جذر تربيعي' : 'Square Root' },
    { label: 'ⁿ√x', latex: '\\sqrt[n]{x}', title: isAr ? 'جذر نوني' : 'N-th Root' },
    { label: 'xⁿ', latex: 'x^{n}', title: isAr ? 'أس وقوة' : 'Exponent' },
    { label: 'xₙ', latex: 'x_{n}', title: isAr ? 'دليل سفلي' : 'Subscript' },
    { label: '∫', latex: '\\int_{a}^{b}', title: isAr ? 'تكامل محدد' : 'Definite Integral' },
    { label: '∑', latex: '\\sum_{i=1}^{n}', title: isAr ? 'رمز المجموع' : 'Summation' },
    { label: 'lim', latex: '\\lim_{x \\to 0}', title: isAr ? 'نهاية دالة' : 'Limit' },
    { label: '∂/∂x', latex: '\\frac{\\partial z}{\\partial x}', title: isAr ? 'مشتقة جزئية' : 'Partial Derivative' },
    { label: 'π', latex: '\\pi', title: isAr ? 'النسبة التقريبية باي' : 'Pi' },
    { label: 'θ', latex: '\\theta', title: isAr ? 'زاوية ثيتا' : 'Theta' },
    { label: 'α', latex: '\\alpha', title: isAr ? 'ألفا' : 'Alpha' },
    { label: 'β', latex: '\\beta', title: isAr ? 'بيتا' : 'Beta' },
    { label: 'λ', latex: '\\lambda', title: isAr ? 'لامدا' : 'Lambda' },
    { label: '∞', latex: '\\infty', title: isAr ? 'ما لا نهاية' : 'Infinity' },
    { label: '±', latex: '\\pm', title: isAr ? 'موجب أو سالب' : 'Plus-Minus' },
    { label: '×', latex: '\\times', title: isAr ? 'ضرب' : 'Multiply' },
    { label: '÷', latex: '\\div', title: isAr ? 'قسمة' : 'Divide' },
    { label: '≤', latex: '\\le', title: isAr ? 'أصغر من أو يساوي' : 'Less or Equal' },
    { label: '≥', latex: '\\ge', title: isAr ? 'أكبر من أو يساوي' : 'Greater or Equal' },
    { label: '≠', latex: '\\neq', title: isAr ? 'لا يساوي' : 'Not Equal' },
    { label: '≈', latex: '\\approx', title: isAr ? 'تقريباً' : 'Approximate' }
  ];

  return `
    <div style="display:flex; flex-direction:column; gap:20px;" dir="${isAr ? 'rtl' : 'ltr'}">
      <!-- Banner with Explanation -->
      <div style="background:var(--card); border:1px solid var(--border); border-radius:14px; padding:14px 18px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:38px; height:38px; border-radius:10px; background:rgba(78,205,196,0.12); display:flex; align-items:center; justify-content:center; color:var(--teal);">
            <i class="fas fa-square-root-variable" style="font-size:18px;"></i>
          </div>
          <div>
            <div style="font-weight:700; font-size:14px; color:var(--text);">${isAr ? 'محرر ومسودة صياغة KaTeX الفورية' : 'Unified KaTeX Typography & Expression Scratchpad'}</div>
            <div style="font-size:12px; color:var(--text2);">${isAr ? 'الصيغ المكتوبة في هذا المحرر تُعرض مباشرة بصيغة KaTeX المتطابقة مع خطوط ورموز Desmos الرياضية.' : 'Formulas typed in this custom text area render live in KaTeX, identical to Desmos mathematical notation.'}</div>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-sm btn-ghost" onclick="unifiedMathCopyLatex()" style="border:1px solid var(--border); font-size:12px;">
            <i class="fas fa-copy"></i> ${isAr ? 'نسخ LaTeX' : 'Copy LaTeX'}
          </button>
          <button class="btn btn-sm btn-secondary" onclick="unifiedMathSaveFormula()" style="font-size:12px;">
            <i class="fas fa-bookmark"></i> ${isAr ? 'حفظ الصيغة' : 'Save Formula'}
          </button>
        </div>
      </div>

      <!-- Studio Dual-Pane: Custom Textarea (Left) + Desmos-Matched KaTeX Canvas (Right) -->
      <div class="unified-math-studio">
        <!-- Editor Left Pane -->
        <div class="math-editor-pane">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <span style="font-weight:700; font-size:14px; color:var(--text); display:inline-flex; align-items:center; gap:6px;">
              <i class="fas fa-pen-to-square" style="color:var(--teal);"></i> ${isAr ? 'مساحة كتابة المعادلات المخصصة' : 'Formula Custom Text Area'}
            </span>
            <span class="tag" style="background:rgba(255,140,66,0.12); color:var(--accent); font-size:11px;">
              ${isAr ? 'صيغة LaTeX الرياضية' : 'LaTeX & Math Syntax'}
            </span>
          </div>

          <!-- Symbol & Syntax Insertion Palette -->
          <div class="math-symbol-toolbar" dir="ltr">
            ${symbols.map(s => `
              <button class="math-sym-btn" onclick="unifiedMathInsert('${s.latex}')" title="${s.title}">
                ${s.label}
              </button>
            `).join('')}
          </div>

          <!-- Custom Textarea for Formulas -->
          <textarea
            id="unified-math-input"
            class="math-custom-textarea"
            dir="ltr"
            placeholder="${isAr ? 'اكتب المعادلة الرياضية أو صيغة LaTeX هنا (مثال: \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} أو y = \\sin(2x) + \\cos(3x))...' : 'Type mathematical formula or LaTeX here (e.g. \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} or y = \\sin(2x) + \\cos(3x))...'}"
            oninput="updateUnifiedMathStudio(this.value)"
          >${escHtml(unifiedMathText)}</textarea>

          <!-- Quick Templates -->
          <div>
            <div style="font-size:11px; font-weight:700; color:var(--text2); text-transform:uppercase; margin-bottom:6px;">
              ${isAr ? 'قوالب سريعة جاهزة:' : 'Instant Templates:'}
            </div>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              <button class="btn btn-xs btn-ghost" onclick="unifiedMathSetText('f(x) = \\\\frac{-b \\\\pm \\\\sqrt{b^2 - 4ac}}{2a}')" style="border:1px solid var(--border); font-size:11px;">
                ${isAr ? 'المعادلة التربيعية' : 'Quadratic'}
              </button>
              <button class="btn btn-xs btn-ghost" onclick="unifiedMathSetText('e^{i\\\\pi} + 1 = 0')" style="border:1px solid var(--border); font-size:11px;">
                ${isAr ? 'متطابقة أويلر' : "Euler's Identity"}
              </button>
              <button class="btn btn-xs btn-ghost" onclick="unifiedMathSetText('\\\\int_{-\\\\infty}^{\\\\infty} e^{-x^2}\\\\,dx = \\\\sqrt{\\\\pi}')" style="border:1px solid var(--border); font-size:11px;">
                ${isAr ? 'تكامل غاوس' : 'Gaussian Integral'}
              </button>
              <button class="btn btn-xs btn-ghost" onclick="unifiedMathSetText('y = 2\\\\sin(3x) \\\\cdot e^{-0.15x}')" style="border:1px solid var(--border); font-size:11px;">
                ${isAr ? 'موجة متخامدة' : 'Damped Wave'}
              </button>
              <button class="btn btn-xs btn-ghost" onclick="unifiedMathSetText('z = \\\\frac{x^2 - y^2}{4}')" style="border:1px solid var(--border); font-size:11px;">
                ${isAr ? 'السطح السرجي 3D' : '3D Saddle'}
              </button>
            </div>
          </div>
        </div>

        <!-- Preview Right Pane (Rendered identically to Desmos) -->
        <div class="math-preview-pane">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <span style="font-weight:700; font-size:14px; color:var(--text); display:inline-flex; align-items:center; gap:6px;">
              <i class="fas fa-eye" style="color:var(--teal);"></i> ${isAr ? 'المعاينة الرياضية (مطابقة لخطوط Desmos)' : 'Rendered Output (Matches Desmos Typography)'}
            </span>
            <span class="tag" style="background:rgba(78,205,196,0.12); color:var(--teal); font-size:11px;">
              ${isAr ? 'عالي الدقة KaTeX' : 'KaTeX High-DPI'}
            </span>
          </div>

          <!-- Dynamic Display Box -->
          <div id="unified-math-preview-canvas" class="math-preview-canvas" dir="ltr">
            ${renderKatexToString(unifiedMathText || ' ', true)}
          </div>

          <!-- Cross-Engine Action Deck -->
          <div style="display:flex; flex-direction:column; gap:8px;">
            <div style="font-size:12px; font-weight:700; color:var(--text2);">${isAr ? 'تصدير إلى محركات الرسوم:' : 'Send to Visualization Engines:'}</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <button class="btn btn-sm btn-teal" onclick="unifiedMathSendToDesmos()" style="justify-content:center; font-size:12px;">
                <i class="fas fa-chart-line"></i> ${isAr ? 'رسم في Desmos 2D' : 'Plot in Desmos 2D'}
              </button>
              <button class="btn btn-sm btn-primary" onclick="unifiedMathSendTo3D()" style="justify-content:center; font-size:12px;">
                <i class="fas fa-cube"></i> ${isAr ? 'رسم في Three.js 3D' : 'Plot in Three.js 3D'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Saved Formulas Notebook -->
      <div class="card" style="border-radius:16px;">
        <h3 style="font-size:15px; font-weight:700; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
          <i class="fas fa-bookmark" style="color:var(--teal);"></i> ${isAr ? 'دفتر المعادلات المحفوظة' : 'Formula Notebook (Saved Expressions)'}
        </h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">
          ${savedUserFormulas.map((formula, idx) => `
            <div style="background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:8px;">
              <div style="overflow-x:auto; padding:6px 0; text-align:center;" dir="ltr">
                ${renderKatexToString(formula, false)}
              </div>
              <div style="display:flex; gap:6px; margin-top:auto;">
                <button class="btn btn-xs btn-teal" onclick="unifiedMathLoadSaved('${escHtml(formula)}')" style="flex:1; justify-content:center;">
                  <i class="fas fa-arrow-up"></i> ${isAr ? 'تحميل' : 'Load'}
                </button>
                <button class="btn btn-xs btn-ghost" onclick="desmosPlotFormula('${escHtml(formula)}')" title="${isAr ? 'رسم في Desmos' : 'Plot in Desmos'}" style="border:1px solid var(--border); color:var(--teal);">
                  <i class="fas fa-chart-line"></i>
                </button>
                <button class="btn btn-xs btn-ghost" onclick="unifiedMathDeleteSaved(${idx})" title="${isAr ? 'حذف' : 'Remove'}" style="color:#FF6B6B;">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function initUnifiedMathStudio() {
  const ta = document.getElementById('unified-math-input');
  if (ta) {
    updateUnifiedMathStudio(ta.value);
  }
}

function updateUnifiedMathStudio(text) {
  unifiedMathText = text;
  const canvas = document.getElementById('unified-math-preview-canvas');
  if (canvas) {
    const raw = (text || '').trim();
    canvas.innerHTML = renderKatexToString(raw || '\\text{Type a mathematical formula above...}', true);
  }
}

function unifiedMathSetText(str) {
  const ta = document.getElementById('unified-math-input');
  if (ta) {
    ta.value = str;
    updateUnifiedMathStudio(str);
  }
}

function unifiedMathInsert(snippet) {
  const ta = document.getElementById('unified-math-input');
  if (!ta) return;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const text = ta.value;
  ta.value = text.substring(0, start) + snippet + text.substring(end);
  ta.focus();
  ta.selectionStart = ta.selectionEnd = start + snippet.length;
  updateUnifiedMathStudio(ta.value);
  SFX.click();
}

function unifiedMathCopyLatex() {
  const ta = document.getElementById('unified-math-input');
  const val = ta ? ta.value.trim() : unifiedMathText;
  if (!val) {
    toast('No formula to copy', 'warn');
    return;
  }
  navigator.clipboard.writeText(val).then(() => {
    toast('LaTeX formula copied to clipboard!', 'success');
  }).catch(() => {
    calcCopyText(val);
  });
}

function unifiedMathSendToDesmos() {
  const ta = document.getElementById('unified-math-input');
  let val = ta ? ta.value.trim() : unifiedMathText;
  if (!val) {
    toast('Please enter a formula first', 'warn');
    return;
  }
  desmosPlotFormula(val);
}

function unifiedMathSendTo3D() {
  const ta = document.getElementById('unified-math-input');
  let val = ta ? ta.value.trim() : unifiedMathText;
  if (!val) {
    toast('Please enter a formula first', 'warn');
    return;
  }
  // Strip "z =" or "f(x, y) =" if present
  val = val.replace(/^[zZ]\s*=\s*/, '').replace(/^f\([xyXY,\s]+\)\s*=\s*/, '');
  // Clean basic latex fractions for standard 3D eval if needed
  val = val.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
  val = val.replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)');
  val = val.replace(/\\sin/g, 'sin').replace(/\\cos/g, 'cos').replace(/\\tan/g, 'tan');
  val = val.replace(/\\pi/g, 'pi');

  three3dPlotFormula(val);
}

function unifiedMathSaveFormula() {
  const ta = document.getElementById('unified-math-input');
  const val = ta ? ta.value.trim() : unifiedMathText;
  if (!val) return;
  if (!savedUserFormulas.includes(val)) {
    savedUserFormulas.unshift(val);
    if (savedUserFormulas.length > 12) savedUserFormulas.pop();
    toast('Formula saved to notebook!', 'success');
    renderCalculator();
  } else {
    toast('Formula already in notebook', 'info');
  }
}

function unifiedMathLoadSaved(formula) {
  unifiedMathSetText(formula);
  toast('Loaded formula from notebook', 'info');
  SFX.click();
}

function unifiedMathDeleteSaved(idx) {
  savedUserFormulas.splice(idx, 1);
  toast('Formula removed from notebook', 'info');
  renderCalculator();
}


// ------------------------ NATIVE SCIENTIFIC CALCULATOR TAB ------------------------
function renderCalcNativeTab() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const history = Store.get('calcHistory') || [];

  return `
    <div class="native-calc-layout" dir="${isAr ? 'rtl' : 'ltr'}">
      <!-- Calculator Chassis (Luxury Precision Instrument) -->
      <div class="native-calc-chassis">
        <!-- Precision Display Screen -->
        <div class="calc-screen-enclosure">
          <div class="calc-screen-header">
            <div class="calc-status-group">
              <button class="calc-mode-pill ${calcAngleUnit==='deg'?'active':''}" onclick="calcToggleAngleUnit()" title="${isAr ? 'التبديل بين الدرجات والراديان' : 'Click to toggle DEG / RAD'}">
                <span class="dot"></span> ${isAr ? (calcAngleUnit==='deg' ? 'بالدرجات DEG' : 'بالراديان RAD') : calcAngleUnit.toUpperCase()}
              </button>
              <span class="calc-mem-pill" title="${isAr ? 'سجل الذاكرة' : 'Memory Register'}">${calcMemory !== 0 ? `M: ${calcMemory}` : 'M: 0'}</span>
              ${calcLastAns !== '0' ? `<span class="calc-screen-btn" onclick="calcAppend('ANS')" title="${isAr ? 'استخدام الناتج السابق' : 'Click to use ANS'}">Ans: ${calcLastAns}</span>` : ''}
            </div>
            <div class="calc-screen-actions">
              <button class="calc-screen-btn" onclick="calcCopyResult()" title="${isAr ? 'نسخ الناتج الحالي إلى الحافظة' : 'Copy current result to clipboard'}">
                <i class="fas fa-copy"></i> ${isAr ? 'نسخ' : 'Copy'}
              </button>
              <button class="calc-screen-btn" onclick="calcClear()" style="color:var(--red);" title="${isAr ? 'مسح شامل (AC)' : 'All Clear (AC)'}">
                <i class="fas fa-trash-can"></i> ${isAr ? 'مسح' : 'Clear'}
              </button>
            </div>
          </div>

          <div class="calc-expression-row" id="calc-screen-expr" dir="ltr">${calcExpr || '0'}</div>
          <div class="calc-result-row" id="calc-screen-result" dir="ltr" onclick="calcCopyResult()" title="${isAr ? 'انقر لنسخ الناتج' : 'Click to copy result'}">
            ${calcResult}
          </div>
        </div>

        <!-- Dual-Deck Keypad System -->
        <div class="calc-keypad-decks">
          <!-- Scientific Functions Deck (Left) -->
          <div class="calc-deck-sci">
            <div class="calc-deck-section-title">
              <i class="fas fa-atom" style="color:var(--teal)"></i> ${isAr ? 'الدوال والأسس العلمية' : 'Functions & Powers'}
            </div>
            <div class="calc-sci-grid" dir="ltr">
              <!-- Row 1: Trigonometry -->
              <button class="c-key c-key-fn" onclick="calcAppendFn('sin(')">sin</button>
              <button class="c-key c-key-fn" onclick="calcAppendFn('cos(')">cos</button>
              <button class="c-key c-key-fn" onclick="calcAppendFn('tan(')">tan</button>
              <button class="c-key c-key-fn" onclick="calcAppendFn('asin(')">sin⁻¹</button>
              <button class="c-key c-key-fn" onclick="calcAppendFn('acos(')">cos⁻¹</button>

              <!-- Row 2: Inverses & Logs -->
              <button class="c-key c-key-fn" onclick="calcAppendFn('atan(')">tan⁻¹</button>
              <button class="c-key c-key-fn" onclick="calcAppendFn('ln(')">ln</button>
              <button class="c-key c-key-fn" onclick="calcAppendFn('log(')">log₁₀</button>
              <button class="c-key c-key-fn" onclick="calcAppendFn('log2(')">log₂</button>
              <button class="c-key c-key-fn" onclick="calcAppendFn('exp(')">eˣ</button>

              <!-- Row 3: Radicals & Powers -->
              <button class="c-key c-key-fn" onclick="calcAppendFn('sqrt(')">√x</button>
              <button class="c-key c-key-fn" onclick="calcAppendFn('cbrt(')">³√x</button>
              <button class="c-key c-key-fn" onclick="calcAppend('^')">xʸ</button>
              <button class="c-key c-key-fn" onclick="calcAppend('^2')">x²</button>
              <button class="c-key c-key-fn" onclick="calcAppend('^3')">x³</button>

              <!-- Row 4: Fractions, Abs, Factorial -->
              <button class="c-key c-key-fn" onclick="calcAppendFn('1/(')">1/x</button>
              <button class="c-key c-key-fn" onclick="calcAppendFn('abs(')">|x|</button>
              <button class="c-key c-key-fn" onclick="calcAppend('!')">n!</button>
              <button class="c-key c-key-fn" onclick="calcAppend('%')">%</button>
              <button class="c-key c-key-fn" onclick="calcAppendFn('10^(')">10ˣ</button>

              <!-- Row 5: Mathematical Constants & Combinatorics -->
              <button class="c-key c-key-fn" onclick="calcAppend('pi')">π</button>
              <button class="c-key c-key-fn" onclick="calcAppend('e')">e</button>
              <button class="c-key c-key-fn" onclick="calcAppend('phi')">φ</button>
              <button class="c-key c-key-fn" onclick="calcAppendFn('nCr(')">nCr</button>
              <button class="c-key c-key-fn" onclick="calcAppendFn('nPr(')">nPr</button>

              <!-- Row 6: Memory Operations & Ans -->
              <button class="c-key c-key-mem" onclick="calcMemoryAction('MC')" title="${isAr ? 'مسح الذاكرة' : 'Clear Memory'}">MC</button>
              <button class="c-key c-key-mem" onclick="calcMemoryAction('MR')" title="${isAr ? 'استرجاع الذاكرة' : 'Recall Memory'}">MR</button>
              <button class="c-key c-key-mem" onclick="calcMemoryAction('M+')" title="${isAr ? 'إضافة إلى الذاكرة' : 'Add to Memory'}">M+</button>
              <button class="c-key c-key-mem" onclick="calcMemoryAction('M-')" title="${isAr ? 'طرح من الذاكرة' : 'Subtract from Memory'}">M−</button>
              <button class="c-key c-key-fn" onclick="calcAppend('ANS')" style="color:var(--accent); font-weight:800;" title="${isAr ? 'الناتج السابق' : 'Previous Answer'}">ANS</button>
            </div>
          </div>

          <!-- Numeric & Arithmetic Pad (Right) -->
          <div class="calc-deck-num">
            <div class="calc-deck-section-title">
              <i class="fas fa-calculator" style="color:var(--accent)"></i> ${isAr ? 'لوحة الأرقام والعمليات' : 'Input Pad'}
            </div>
            <div class="calc-num-grid" dir="ltr">
              <!-- Row 1: Clear & Parentheses -->
              <button class="c-key c-key-clear" onclick="calcClear()" title="${isAr ? 'مسح شامل' : 'All Clear'}">AC</button>
              <button class="c-key c-key-clear" onclick="calcBackspace()" title="${isAr ? 'حذف خطوة للخلف' : 'Delete Backspace'}">DEL</button>
              <button class="c-key c-key-fn" onclick="calcAppend('(')">(</button>
              <button class="c-key c-key-fn" onclick="calcAppend(')')">)</button>

              <!-- Row 2: 7-9 & Division -->
              <button class="c-key c-key-num" onclick="calcAppend('7')">7</button>
              <button class="c-key c-key-num" onclick="calcAppend('8')">8</button>
              <button class="c-key c-key-num" onclick="calcAppend('9')">9</button>
              <button class="c-key c-key-op" onclick="calcAppend('÷')">÷</button>

              <!-- Row 3: 4-6 & Multiplication -->
              <button class="c-key c-key-num" onclick="calcAppend('4')">4</button>
              <button class="c-key c-key-num" onclick="calcAppend('5')">5</button>
              <button class="c-key c-key-num" onclick="calcAppend('6')">6</button>
              <button class="c-key c-key-op" onclick="calcAppend('×')">×</button>

              <!-- Row 4: 1-3 & Subtraction -->
              <button class="c-key c-key-num" onclick="calcAppend('1')">1</button>
              <button class="c-key c-key-num" onclick="calcAppend('2')">2</button>
              <button class="c-key c-key-num" onclick="calcAppend('3')">3</button>
              <button class="c-key c-key-op" onclick="calcAppend('−')">−</button>

              <!-- Row 5: Sign, Zero, Decimal, Addition -->
              <button class="c-key c-key-fn" onclick="calcToggleSign()" title="${isAr ? 'تغيير الإشارة (±)' : 'Toggle Sign (±)'}">±</button>
              <button class="c-key c-key-num" onclick="calcAppend('0')">0</button>
              <button class="c-key c-key-num" onclick="calcAppend('.')">.</button>
              <button class="c-key c-key-op" onclick="calcAppend('+')">+</button>

              <!-- Row 6: Big Equals Button -->
              <button class="c-key c-key-equals" onclick="calcEvaluate()" style="grid-column: span 4;" title="${isAr ? 'حساب النتيجة (Enter)' : 'Evaluate Expression (Enter)'}">
                <i class="fas fa-equals"></i> ${isAr ? 'حساب النتيجة' : 'Calculate'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- History Panel Card -->
      <div class="calc-history-card">
        <div class="calc-history-header">
          <div class="calc-history-title">
            <i class="fas fa-clock-rotate-left" style="color:var(--teal);"></i> ${isAr ? 'سجل الحسابات' : 'History'}
            ${history.length > 0 ? `<span class="tag" style="background:rgba(78,205,196,0.15); color:var(--teal); font-size:11px; padding:2px 7px;">${history.length}</span>` : ''}
          </div>
          ${history.length > 0 ? `
            <button class="btn btn-xs btn-ghost" onclick="calcClearHistory()" title="${isAr ? 'مسح السجل' : 'Clear History'}" style="color:var(--red);">
              <i class="fas fa-trash-can"></i>
            </button>
          ` : ''}
        </div>

        <div class="calc-history-stream no-scrollbar">
          ${history.length === 0 ? `
            <div style="text-align:center; padding:36px 12px; color:var(--text2); font-size:13px;">
              <i class="fas fa-receipt" style="font-size:24px; opacity:0.3; margin-bottom:8px; display:block;"></i>
              ${isAr ? 'لا توجد عمليات حسابية سابقة بعد.<br>احسب معادلة لتسجيلها هنا!' : 'No calculations yet.<br>Solve a problem to track it here!'}
            </div>
          ` : history.map(item => `
            <div class="calc-history-entry" onclick="calcLoadHistory('${escHtml(item.expr)}', '${escHtml(item.result)}')" title="${isAr ? 'انقر لإعادة التحميل في الشاشة' : 'Click to reload into screen'}">
              <div class="calc-history-expr-text" dir="ltr">${escHtml(item.expr)} =</div>
              <div class="calc-history-res-val" dir="ltr">
                <span>${escHtml(item.result)}</span>
                <button class="btn btn-xs btn-ghost" onclick="event.stopPropagation(); calcCopyText('${escHtml(item.result)}')" title="${isAr ? 'نسخ الناتج' : 'Copy result'}">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="font-size:11px; color:var(--text2); text-align:center; padding-top:8px; border-top:1px solid var(--border);">
          <i class="fas fa-keyboard" style="margin-right:4px;"></i> ${isAr ? 'لوحة المفاتيح نشطة (0-9، + - * /، Enter، Esc)' : 'Keyboard active (0-9, + - * /, Enter, Esc)'}
        </div>
      </div>
    </div>
  `;
}

// ------------------------ FORMULAS & CONSTANTS TAB ------------------------
let calcFormulaFilter = 'all';
function renderCalcFormulasTab() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const filtered = calcFormulaFilter === 'all'
    ? MATH_FORMULAS
    : MATH_FORMULAS.filter(f => f.category === calcFormulaFilter);

  return `
    <div style="display:flex; flex-direction:column; gap:18px;" dir="${isAr ? 'rtl' : 'ltr'}">
      <!-- Filter Chips -->
      <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:4px;" class="no-scrollbar">
        <button class="grade-pill ${calcFormulaFilter==='all'?'selected':''}" onclick="calcFormulaFilter='all'; renderCalculator();">${isAr ? 'جميع الصيغ' : 'All Formulas'}</button>
        <button class="grade-pill ${calcFormulaFilter==='algebra'?'selected':''}" onclick="calcFormulaFilter='algebra'; renderCalculator();">${isAr ? 'الجبر والهندسة' : 'Algebra & Geometry'}</button>
        <button class="grade-pill ${calcFormulaFilter==='trig'?'selected':''}" onclick="calcFormulaFilter='trig'; renderCalculator();">${isAr ? 'حساب المثلثات' : 'Trigonometry'}</button>
        <button class="grade-pill ${calcFormulaFilter==='calculus'?'selected':''}" onclick="calcFormulaFilter='calculus'; renderCalculator();">${isAr ? 'التفاضل والتكامل و3D' : 'Calculus & 3D'}</button>
        <button class="grade-pill ${calcFormulaFilter==='constants'?'selected':''}" onclick="calcFormulaFilter='constants'; renderCalculator();">${isAr ? 'الثوابت العلمية' : 'Scientific Constants'}</button>
      </div>

      <!-- Formula Cards Grid with KaTeX Unified Math Rendering -->
      <div class="formula-grid">
        ${filtered.map(f => {
          const fName = (isAr && CALC_ARABIC_DATA.formulas[f.name]?.nameAr) || f.name;
          const fDesc = (isAr && CALC_ARABIC_DATA.formulas[f.name]?.descAr) || f.desc;
          const fCat = (isAr && CALC_ARABIC_DATA.categories[f.category]) || f.category;
          return `
          <div class="formula-card">
            <div style="display:flex; align-items:center; justify-content:space-between;">
              <span style="font-weight:700; font-size:15px; color:var(--text);">${escHtml(fName)}</span>
              <span class="tag" style="background:rgba(78,205,196,0.12); color:var(--teal); font-size:11px; text-transform:capitalize;">
                ${escHtml(fCat)}
              </span>
            </div>
            <div class="formula-math-box" style="justify-content:center; padding:12px 14px; overflow-x:auto;" dir="ltr">
              ${renderKatexToString(f.latex, true)}
            </div>
            <p style="font-size:12px; color:var(--text2); line-height:1.5; margin:0;">${escHtml(fDesc)}</p>
            <div style="display:flex; gap:8px; margin-top:6px; flex-wrap:wrap;">
              <button class="btn btn-sm btn-teal" onclick="calcInsertFormula('${escHtml(f.insert)}')" style="flex:1; justify-content:center; font-size:12px; border-radius:8px;">
                <i class="fas fa-calculator"></i> ${isAr ? 'استخدام في الحاسبة' : 'Use in Calc'}
              </button>
              ${f.desmos ? `
                <button class="btn btn-sm btn-secondary" onclick="desmosPlotFormula('${escHtml(f.desmos)}')" style="font-size:12px; border-radius:8px;" title="${isAr ? 'رسم في Desmos 2D' : 'Plot in Desmos 2D'}">
                  <i class="fas fa-chart-line" style="color:var(--teal);"></i> Desmos
                </button>
              ` : ''}
              ${f.three ? `
                <button class="btn btn-sm btn-secondary" onclick="three3dPlotFormula('${escHtml(f.three)}')" style="font-size:12px; border-radius:8px;" title="${isAr ? 'رسم في Three.js 3D' : 'Plot in Three.js 3D'}">
                  <i class="fas fa-cube" style="color:var(--accent);"></i> ${isAr ? 'رسم 3D' : '3D Plot'}
                </button>
              ` : ''}
              <button class="btn btn-sm btn-ghost" onclick="calcCopyText('${escHtml(f.latex)}')" style="font-size:12px; border-radius:8px; border:1px solid var(--border);" title="${isAr ? 'نسخ صيغة LaTeX' : 'Copy LaTeX'}">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
        `;}).join('')}
      </div>
    </div>
  `;
}

// ------------------------ BASE & UNIT CONVERTER TAB ------------------------
function renderCalcConverterTab() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const num = parseInt(calcBaseInputVal, 10) || 0;
  const decVal = isNaN(num) ? '0' : num.toString(10);
  const hexVal = isNaN(num) ? '0' : '0x' + num.toString(16).toUpperCase();
  const binVal = isNaN(num) ? '0' : num.toString(2);
  const octVal = isNaN(num) ? '0' : '0o' + num.toString(8);

  // Group binary string in 4-bit nibbles
  const binPadded = binVal.padStart(Math.ceil(binVal.length / 4) * 4 || 4, '0');
  const binNibbles = binPadded.match(/.{1,4}/g)?.join(' ') || binVal;

  return `
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:20px;" dir="${isAr ? 'rtl' : 'ltr'}">
      <!-- Programmer Base Converter Card -->
      <div class="converter-card">
        <h3 style="font-size:16px; font-weight:700; display:flex; align-items:center; gap:8px;">
          <i class="fas fa-binary" style="color:var(--teal);"></i> ${isAr ? 'محول الأنظمة العددية للمبرمجين' : 'Programmer Base Converter'}
        </h3>
        <p style="font-size:13px; color:var(--text2); margin:0;">${isAr ? 'تحويل ديناميكي مباشر بين النظام العشري، والسداسي عشري، والثنائي (مقسم 4 بت)، والثماني.' : 'Convert numbers dynamically between Decimal, Hexadecimal, Binary (with 4-bit grouping), and Octal.'}</p>

        <div style="display:flex; flex-direction:column; gap:14px; margin-top:8px;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label style="font-size:12px; font-weight:700; color:var(--text2);">${isAr ? 'النظام العشري (أساس 10)' : 'Decimal (Base 10)'}</label>
              <span style="font-size:11px; color:var(--teal); font-family:monospace;" dir="ltr">DEC</span>
            </div>
            <div style="display:flex; gap:8px;">
              <input type="text" class="input-field" value="${decVal}" dir="ltr" oninput="calcUpdateBaseFromDec(this.value)" style="font-family:monospace; font-size:15px;" />
              <button class="btn btn-sm btn-secondary" onclick="calcCopyText('${decVal}')" title="${isAr ? 'نسخ العشري' : 'Copy Decimal'}" style="border-radius:8px;"><i class="fas fa-copy"></i></button>
            </div>
          </div>

          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label style="font-size:12px; font-weight:700; color:var(--text2);">${isAr ? 'النظام السداسي عشري (أساس 16)' : 'Hexadecimal (Base 16)'}</label>
              <span style="font-size:11px; color:var(--teal); font-family:monospace;" dir="ltr">HEX</span>
            </div>
            <div style="display:flex; gap:8px;">
              <input type="text" class="input-field" value="${hexVal}" dir="ltr" oninput="calcUpdateBaseFromHex(this.value)" style="font-family:monospace; font-size:15px; color:var(--teal);" />
              <button class="btn btn-sm btn-secondary" onclick="calcCopyText('${hexVal}')" title="${isAr ? 'نسخ السداسي عشري' : 'Copy Hex'}" style="border-radius:8px;"><i class="fas fa-copy"></i></button>
            </div>
          </div>

          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label style="font-size:12px; font-weight:700; color:var(--text2);">${isAr ? 'النظام الثنائي (أساس 2)' : 'Binary (Base 2)'}</label>
              <span style="font-size:11px; color:var(--accent); font-family:monospace;" dir="ltr">${isAr ? `${binVal.length} بت` : `${binVal.length} bits`}</span>
            </div>
            <div style="display:flex; gap:8px;">
              <input type="text" class="input-field" value="${binNibbles}" dir="ltr" oninput="calcUpdateBaseFromBin(this.value)" style="font-family:monospace; font-size:15px; color:var(--accent);" />
              <button class="btn btn-sm btn-secondary" onclick="calcCopyText('${binVal}')" title="${isAr ? 'نسخ الثنائي' : 'Copy Binary'}" style="border-radius:8px;"><i class="fas fa-copy"></i></button>
            </div>
          </div>

          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label style="font-size:12px; font-weight:700; color:var(--text2);">${isAr ? 'النظام الثماني (أساس 8)' : 'Octal (Base 8)'}</label>
              <span style="font-size:11px; color:var(--blue); font-family:monospace;" dir="ltr">OCT</span>
            </div>
            <div style="display:flex; gap:8px;">
              <input type="text" class="input-field" value="${octVal}" dir="ltr" oninput="calcUpdateBaseFromOct(this.value)" style="font-family:monospace; font-size:15px;" />
              <button class="btn btn-sm btn-secondary" onclick="calcCopyText('${octVal}')" title="${isAr ? 'نسخ الثماني' : 'Copy Octal'}" style="border-radius:8px;"><i class="fas fa-copy"></i></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Angle & Trigonometry Converter -->
      <div class="converter-card">
        <h3 style="font-size:16px; font-weight:700; display:flex; align-items:center; gap:8px;">
          <i class="fas fa-compass" style="color:var(--accent);"></i> ${isAr ? 'محول وحدات قياس الزوايا' : 'Angle Unit Converter'}
        </h3>
        <p style="font-size:13px; color:var(--text2); margin:0;">${isAr ? 'تحويل فوري متبادل بين الدرجات، والراديان، والغراد بالتزامن اللحظي.' : 'Convert between Degrees, Radians, and Gradians with real-time bidirectional synchronization.'}</p>

        <!-- Angle Presets -->
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
          ${[0, 30, 45, 60, 90, 180, 270, 360].map(deg => `
            <button class="btn btn-xs btn-ghost" onclick="document.getElementById('conv-deg-input').value='${deg}'; calcUpdateAngles('${deg}','deg')" style="font-size:11px; border:1px solid var(--border); border-radius:6px;">
              ${deg}°
            </button>
          `).join('')}
        </div>

        <div style="display:flex; flex-direction:column; gap:14px; margin-top:14px;" id="angle-conv-wrapper">
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--text2); display:block; margin-bottom:4px;">${isAr ? 'بالدرجات (°)' : 'Degrees (°)'}</label>
            <input type="number" id="conv-deg-input" class="input-field" value="180" dir="ltr" oninput="calcUpdateAngles(this.value, 'deg')" style="font-family:monospace; font-size:15px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--text2); display:block; margin-bottom:4px;">${isAr ? 'بالراديان (rad)' : 'Radians (rad)'}</label>
            <input type="number" id="conv-rad-input" class="input-field" value="${(Math.PI).toFixed(6)}" dir="ltr" oninput="calcUpdateAngles(this.value, 'rad')" style="font-family:monospace; font-size:15px; color:var(--teal);" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--text2); display:block; margin-bottom:4px;">${isAr ? 'بالغراد (gon)' : 'Gradians (gon)'}</label>
            <input type="number" id="conv-grad-input" class="input-field" value="200" dir="ltr" oninput="calcUpdateAngles(this.value, 'grad')" style="font-family:monospace; font-size:15px;" />
          </div>
        </div>
      </div>
    </div>
  `;
}

function calcUpdateBaseFromDec(v) {
  calcBaseInputVal = v.replace(/[^0-9-]/g, '') || '0';
  renderCalcConverterLive();
}
function calcUpdateBaseFromHex(v) {
  const clean = v.replace(/^0x/i, '').replace(/[^0-9a-fA-F]/g, '');
  const n = parseInt(clean, 16);
  calcBaseInputVal = isNaN(n) ? '0' : String(n);
  renderCalcConverterLive();
}
function calcUpdateBaseFromBin(v) {
  const clean = v.replace(/\s+/g, '').replace(/[^01]/g, '');
  const n = parseInt(clean, 2);
  calcBaseInputVal = isNaN(n) ? '0' : String(n);
  renderCalcConverterLive();
}
function calcUpdateBaseFromOct(v) {
  const clean = v.replace(/^0o/i, '').replace(/[^0-7]/g, '');
  const n = parseInt(clean, 8);
  calcBaseInputVal = isNaN(n) ? '0' : String(n);
  renderCalcConverterLive();
}

function renderCalcConverterLive() {
  const c = document.getElementById('calc-tab-content');
  if (c && calcTab === 'converter') {
    c.innerHTML = renderCalcConverterTab();
  }
}

function calcUpdateAngles(val, fromUnit) {
  const n = parseFloat(val);
  if (isNaN(n)) return;
  let deg = 0;
  if (fromUnit === 'deg') deg = n;
  else if (fromUnit === 'rad') deg = n * (180 / Math.PI);
  else if (fromUnit === 'grad') deg = n * (180 / 200);

  const rad = deg * (Math.PI / 180);
  const grad = deg * (200 / 180);

  const degEl = document.getElementById('conv-deg-input');
  const radEl = document.getElementById('conv-rad-input');
  const gradEl = document.getElementById('conv-grad-input');

  if (fromUnit !== 'deg' && degEl) degEl.value = Number(deg.toFixed(6));
  if (fromUnit !== 'rad' && radEl) radEl.value = Number(rad.toFixed(6));
  if (fromUnit !== 'grad' && gradEl) gradEl.value = Number(grad.toFixed(6));
}

// ------------------------ CALCULATOR INTERACTION HELPERS ------------------------
function calcAppend(str) {
  if (calcIsNew && /^[0-9.]/.test(str)) {
    calcExpr = '';
    calcIsNew = false;
  } else {
    calcIsNew = false;
  }
  if (str === 'ANS') {
    calcExpr += calcLastAns;
  } else {
    calcExpr += str;
  }
  calcUpdateScreen();
  SFX.click();
}

function calcAppendFn(fnStr) {
  if (calcIsNew) {
    calcExpr = '';
    calcIsNew = false;
  }
  calcExpr += fnStr;
  calcUpdateScreen();
  SFX.click();
}

function calcBackspace() {
  if (!calcExpr) return;
  // If ends with function like sin(, asin(, log(, delete whole function
  const fns = ['asin(', 'acos(', 'atan(', 'sinh(', 'cosh(', 'tanh(', 'log10(', 'log2(', 'sqrt(', 'cbrt(', 'nCr(', 'nPr(', 'abs(', 'fact(', 'sin(', 'cos(', 'tan(', 'log(', 'ln(', '1/('];
  let matched = false;
  for (const fn of fns) {
    if (calcExpr.endsWith(fn)) {
      calcExpr = calcExpr.slice(0, -fn.length);
      matched = true;
      break;
    }
  }
  if (!matched) {
    calcExpr = calcExpr.slice(0, -1);
  }
  calcUpdateScreen();
  SFX.click();
}

function calcClear() {
  calcExpr = '';
  calcResult = '0';
  calcIsNew = true;
  calcUpdateScreen();
  SFX.click();
}

function calcToggleSign() {
  if (calcIsNew && calcResult !== '0' && calcResult !== 'Error') {
    if (calcResult.startsWith('-')) {
      calcResult = calcResult.slice(1);
    } else {
      calcResult = '-' + calcResult;
    }
    calcExpr = calcResult;
    calcUpdateScreen();
    SFX.click();
    return;
  }
  if (!calcExpr) {
    calcExpr = '-';
    calcIsNew = false;
    calcUpdateScreen();
    SFX.click();
    return;
  }
  // If ending with a number like 42 or (-42)
  const wrappedNegMatch = calcExpr.match(/\(-(\d+(\.\d+)?)\)$/);
  if (wrappedNegMatch) {
    calcExpr = calcExpr.slice(0, -wrappedNegMatch[0].length) + wrappedNegMatch[1];
  } else {
    const numMatch = calcExpr.match(/(\d+(\.\d+)?)$/);
    if (numMatch) {
      const num = numMatch[1];
      calcExpr = calcExpr.slice(0, -num.length) + '(-' + num + ')';
    } else if (calcExpr.endsWith('-')) {
      calcExpr = calcExpr.slice(0, -1);
    } else {
      calcExpr += '(-';
    }
  }
  calcUpdateScreen();
  SFX.click();
}

function calcToggleAngleUnit() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  calcAngleUnit = calcAngleUnit === 'deg' ? 'rad' : 'deg';
  const s = Store.get('calcSettings') || {};
  s.angleUnit = calcAngleUnit;
  Store.set('calcSettings', s);
  toast(isAr ? (calcAngleUnit === 'deg' ? 'تم التبديل إلى نظام الدرجات (DEG)' : 'تم التبديل إلى نظام الراديان (RAD)') : `Trig angle mode: ${calcAngleUnit.toUpperCase()}`, 'info');
  SFX.click();
  calcUpdateScreen();
}

function calcMemoryAction(action) {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const curNum = parseFloat(calcResult) || 0;
  if (action === 'MC') {
    calcMemory = 0;
    toast(isAr ? 'تم مسح سجل الذاكرة' : 'Memory register cleared', 'info');
  } else if (action === 'MR') {
    calcAppend(calcMemory.toString());
    toast(isAr ? `تم استدعاء قيمة الذاكرة: ${calcMemory}` : `Recalled memory: ${calcMemory}`, 'info');
  } else if (action === 'M+') {
    calcMemory += curNum;
    toast(isAr ? `تمت الإضافة إلى الذاكرة: ${calcMemory}` : `Added to memory: ${calcMemory}`, 'success');
  } else if (action === 'M-') {
    calcMemory -= curNum;
    toast(isAr ? `تم الطرح من الذاكرة: ${calcMemory}` : `Subtracted from memory: ${calcMemory}`, 'success');
  } else if (action === 'MS') {
    calcMemory = curNum;
    toast(isAr ? `تم حفظ القيمة في الذاكرة: ${calcMemory}` : `Stored to memory: ${calcMemory}`, 'success');
  }
  SFX.click();
  calcUpdateScreen();
}

function calcEvaluate() {
  if (!calcExpr || !calcExpr.trim()) return;
  try {
    const res = evaluateMathExpression(calcExpr, calcAngleUnit);
    calcResult = res;
    calcLastAns = res;
    calcIsNew = true;

    // Save to history
    const history = Store.get('calcHistory') || [];
    history.unshift({
      id: 'ch_' + Date.now(),
      expr: calcExpr,
      result: res,
      timestamp: Date.now()
    });
    if (history.length > 50) history.pop();
    Store.set('calcHistory', history);

    Store.addXP(2);
    SFX.success();
    renderCalculator();
  } catch (err) {
    calcResult = 'Error';
    SFX.pop();
    calcUpdateScreen();
  }
}

function calcUpdateScreen() {
  const exprEl = document.getElementById('calc-screen-expr');
  const resEl = document.getElementById('calc-screen-result');
  if (exprEl) exprEl.textContent = calcExpr || '0';
  if (resEl) resEl.textContent = calcResult;
}

function calcCopyResult() {
  calcCopyText(calcResult);
}

function calcCopyText(txt) {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  if (!txt) return;
  navigator.clipboard.writeText(txt).then(() => {
    toast(isAr ? `تم نسخ "${txt}" إلى الحافظة بنجاح!` : `Copied "${txt}" to clipboard!`, 'success');
    SFX.click();
  }).catch(() => {
    toast(isAr ? `القيمة: ${txt}` : `Value: ${txt}`, 'info');
  });
}

function calcLoadHistory(expr, res) {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  calcExpr = expr;
  calcResult = res;
  calcIsNew = true;
  calcUpdateScreen();
  SFX.click();
  toast(isAr ? 'تم تحميل العملية السابقة إلى الشاشة' : 'Loaded past calculation', 'info');
}

function calcClearHistory() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  Store.set('calcHistory', []);
  toast(isAr ? 'تم مسح سجل العمليات الحسابية' : 'Calculation history cleared', 'info');
  renderCalculator();
}

function calcInsertFormula(formulaStr) {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  calcSetTab('native');
  calcExpr = formulaStr;
  calcIsNew = false;
  calcUpdateScreen();
  toast(isAr ? `تم إدراج الصيغة: ${formulaStr}` : `Inserted formula: ${formulaStr}`, 'success');
}

function showCalcHelpModal() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  showModal(`
    <div dir="${isAr ? 'rtl' : 'ltr'}">
      <h2 style="font-size:20px; font-weight:700; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
        <i class="fas fa-calculator" style="color:var(--teal);"></i> ${isAr ? 'دليل الجناح الرياضي واختصارات لوحة المفاتيح' : 'Mathematical Suite Guide & Shortcuts'}
      </h2>
      <div style="display:flex; flex-direction:column; gap:12px; font-size:14px; color:var(--text2); line-height:1.6;">
        <div>
          <strong style="color:var(--text);"><i class="fas fa-chart-line" style="color:var(--teal);"></i> ${isAr ? 'راسم Desmos 2D الرسمي:' : 'Desmos API 2D Graphing:'}</strong>
          <p style="margin:4px 0 0;">${isAr ? 'محرك حاسبة Desmos البيانية ثنائية الأبعاد الرسمي. يتيح تمثيل الدوال والمعادلات والمنحنيات القطبية والمماسات والمشتقات وكثيرات الحدود. انقر على أي نموذج لرسمه فورياً.' : 'Official Desmos 2D Graphing Calculator engine. Plot equations, polar curves, tangents, derivatives, and polynomials. Click any preset formula chip to graph instantly.'}</p>
        </div>
        <div>
          <strong style="color:var(--text);"><i class="fas fa-cube" style="color:var(--accent);"></i> ${isAr ? 'راسم الأسطح Three.js 3D ومنصة Math3D:' : 'Three.js 3D Surface Visualizer & Math3D.org:'}</strong>
          <p style="margin:4px 0 0;">${isAr ? 'راسم رسومي تفاعلي ثلاثي الأبعاد بالويب-جل (WebGL) لدوال الأسطح z = f(x, y) مع تحكم كامل بالتدوير والتكبير، وأنماط ألوان متقدمة، ووضع الشبكة الهيكلية، والدوران التلقائي، بالإضافة لمنصة Math3D.org لحساب التفاضل والتكامل متعدد المتغيرات.' : 'Real-time interactive 3D WebGL plotter for surfaces z = f(x, y) with OrbitControls, custom colormaps (Neon, Viridis, Cool-Warm, Aurora), wireframe mode, and auto-rotation. Also includes embedded Math3D.org for multivariable calculus.'}</p>
        </div>
        <div>
          <strong style="color:var(--text);"><i class="fas fa-pen-to-square" style="color:#A78BFA;"></i> ${isAr ? 'استوديو معادلات KaTeX الفوري:' : 'Unified KaTeX Math Studio:'}</strong>
          <p style="margin:4px 0 0;">${isAr ? 'محرر مخصص لكتابة المعادلات وصيغ LaTeX مع عرض مباشر وفوري مطابق لخطوط ورموز Desmos، وشريط رموز سريعة، وإمكانية إرسال الصيغة بنقرة واحدة إلى Desmos أو محرك 3D.' : 'Type formulas in the custom text area with live KaTeX rendering designed to match Desmos mathematical typography. Includes quick syntax symbol palette and 1-click dispatch to Desmos or Three.js 3D.'}</p>
        </div>
        <div>
          <strong style="color:var(--text);"><i class="fas fa-keyboard" style="color:var(--blue);"></i> ${isAr ? 'اختصارات لوحة المفاتيح (الآلة العلمية):' : 'Keyboard Shortcuts (Scientific Keypad):'}</strong>
          <ul style="margin:4px 0 0 18px;" dir="ltr">
            <li><code>0-9</code>, <code>.</code> — ${isAr ? 'إدخال الأرقام' : 'Enter numbers'}</li>
            <li><code>+</code>, <code>-</code>, <code>*</code>, <code>/</code>, <code>^</code> — ${isAr ? 'العمليات الحسابية' : 'Math operations'}</li>
            <li><code>Enter</code> or <code>=</code> — ${isAr ? 'حساب النتيجة' : 'Calculate result'}</li>
            <li><code>Backspace</code> — ${isAr ? 'حذف آخر مدخل' : 'Delete character'}</li>
            <li><code>Escape</code> or <code>C</code> — ${isAr ? 'مسح شامل (AC)' : 'All Clear (AC)'}</li>
            <li><code>D</code> — ${isAr ? 'التبديل بين الدرجات والراديان' : 'Toggle Degrees / Radians'}</li>
          </ul>
        </div>
      </div>
      <div style="display:flex; justify-content:flex-end; margin-top:20px;">
        <button class="btn btn-teal" onclick="closeModal()">${isAr ? 'فهمت ذلك!' : 'Got it!'}</button>
      </div>
    </div>
  `);
}

// ------------------------ MATH EVALUATION ENGINE ------------------------
function evaluateMathExpression(expr, angleUnit) {
  if (!expr || !expr.trim()) return '0';
  let s = expr.trim();

  // Replace typographic visual symbols
  s = s.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/π/g, 'pi');

  // Handle percentages: e.g. 50% -> (50/100), 50%*20
  s = s.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

  // Implicit multiplication: 2pi -> 2*pi, 2(3) -> 2*(3), (2)(3) -> (2)*(3), 2sin -> 2*sin
  s = s.replace(/(\d)(\()/g, '$1*$2');
  s = s.replace(/(\))(\d)/g, '$1*$2');
  s = s.replace(/(\))(\()/g, '$1*$2');
  s = s.replace(/(\d)(pi|e|phi|sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|log|ln|log2|sqrt|cbrt|abs|exp)/g, '$1*$2');
  s = s.replace(/(\))(pi|e|phi|sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|log|ln|log2|sqrt|cbrt|abs|exp)/g, '$1*$2');
  s = s.replace(/(pi|e|phi)(\d)/g, '$1*$2');

  // Factorial n! -> fact(n)
  s = s.replace(/(\d+)!/g, 'fact($1)');

  // Exponentiation ^ -> **
  s = s.replace(/\^/g, '**');

  const isDeg = angleUnit === 'deg';
  const toRad = deg => deg * (Math.PI / 180);
  const toDeg = rad => rad * (180 / Math.PI);

  const scope = {
    pi: Math.PI,
    e: Math.E,
    phi: 1.618033988749895,
    sin: x => isDeg ? Math.sin(toRad(x)) : Math.sin(x),
    cos: x => isDeg ? Math.cos(toRad(x)) : Math.cos(x),
    tan: x => isDeg ? Math.tan(toRad(x)) : Math.tan(x),
    asin: x => isDeg ? toDeg(Math.asin(x)) : Math.asin(x),
    acos: x => isDeg ? toDeg(Math.acos(x)) : Math.acos(x),
    atan: x => isDeg ? toDeg(Math.atan(x)) : Math.atan(x),
    sinh: Math.sinh,
    cosh: Math.cosh,
    tanh: Math.tanh,
    log10: Math.log10,
    log: Math.log10,
    ln: Math.log,
    log2: Math.log2,
    exp: Math.exp,
    sqrt: Math.sqrt,
    cbrt: Math.cbrt,
    abs: Math.abs,
    fact: n => {
      n = Math.round(Number(n));
      if (n < 0) return NaN;
      if (n === 0 || n === 1) return 1;
      if (n > 170) return Infinity;
      let r = 1;
      for (let i = 2; i <= n; i++) r *= i;
      return r;
    },
    nCr: (n, r) => {
      n = Math.round(Number(n)); r = Math.round(Number(r));
      if (r < 0 || r > n) return 0;
      let num = 1, den = 1;
      for (let i = 1; i <= r; i++) {
        num *= (n - (r - i));
        den *= i;
      }
      return num / den;
    },
    nPr: (n, r) => {
      n = Math.round(Number(n)); r = Math.round(Number(r));
      if (r < 0 || r > n) return 0;
      let num = 1;
      for (let i = 0; i < r; i++) num *= (n - i);
      return num;
    }
  };

  const allowedIdentifiers = 'pi|e|phi|sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|log10|log|ln|log2|exp|sqrt|cbrt|abs|fact|nCr|nPr';
  const sanitized = s.replace(new RegExp(allowedIdentifiers, 'g'), '');
  if (!/^[0-9+\-*/%.(),\s*]+$/.test(sanitized)) {
    throw new Error('Invalid characters');
  }

  const scopeKeys = Object.keys(scope);
  const scopeValues = Object.values(scope);
  const fn = new Function(...scopeKeys, `return (${s});`);
  const val = fn(...scopeValues);

  if (typeof val !== 'number' || isNaN(val)) {
    throw new Error('Undefined');
  }

  if (Math.abs(val) < 1e-12) return '0';
  if (!isFinite(val)) return val > 0 ? 'Infinity' : '-Infinity';

  const rounded = Number(Math.round(val + 'e+10') + 'e-10');
  return String(rounded);
}

// Attach keyboard listeners for scientific calculator
let _calcKeyHandlerAttached = false;
function attachCalcKeyboardListener() {
  if (_calcKeyHandlerAttached) return;
  _calcKeyHandlerAttached = true;

  window.addEventListener('keydown', (e) => {
    if (currentView !== 'calculator' || calcTab !== 'native') return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      calcAppend(e.key);
    } else if (e.key === '.') {
      e.preventDefault();
      calcAppend('.');
    } else if (e.key === '+') {
      e.preventDefault();
      calcAppend('+');
    } else if (e.key === '-') {
      e.preventDefault();
      calcAppend('−');
    } else if (e.key === '*') {
      e.preventDefault();
      calcAppend('×');
    } else if (e.key === '/') {
      e.preventDefault();
      calcAppend('÷');
    } else if (e.key === '^') {
      e.preventDefault();
      calcAppend('^');
    } else if (e.key === '(' || e.key === ')') {
      e.preventDefault();
      calcAppend(e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      calcEvaluate();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      calcBackspace();
    } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
      e.preventDefault();
      calcClear();
    } else if (e.key.toLowerCase() === 'd') {
      e.preventDefault();
      calcToggleAngleUnit();
    }
  });
}

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
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  try{await FlashDB.open();}catch(e){
    el.innerHTML=`<div style="max-width:600px;margin:0 auto;text-align:center;padding:40px" dir="${isAr ? 'rtl' : 'ltr'}"><i class="fas fa-exclamation-triangle" style="font-size:32px;color:var(--accent);margin-bottom:12px"></i><p>${isAr ? 'تخزين البطاقات التعليمية غير متاح في هذا المتصفح.' : 'Flashcard storage is unavailable in this browser.'}</p></div>`;
    return;
  }
  if(flashState.screen==='list')await renderFlashDeckList(el);
  else if(flashState.screen==='deck')await renderFlashDeckDetail(el);
  else if(flashState.screen==='study')renderFlashStudy(el);
}

async function renderFlashDeckList(el){
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const decks=await FlashDB.getAllDecks();
  const stats=await Promise.all(decks.map(async d=>({deck:d,stats:await FlashDB.getDeckStats(d.id)})));
  const totalDue=stats.reduce((s,x)=>s+x.stats.due,0);
  el.innerHTML=`<div style="max-width:960px;margin:0 auto" dir="${isAr ? 'rtl' : 'ltr'}">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:28px">
      <div>
        <h1 style="font-size:26px;font-weight:700;margin-bottom:4px;display:flex;align-items:center;gap:10px;">
          <i class="fas fa-layer-group" style="color:var(--teal)"></i> ${isAr ? 'البطاقات التعليمية الذكية' : 'Flashcards'}
        </h1>
        <p style="color:var(--text2);font-size:15px">
          ${isAr ? 'نظام التكرار المتباعد الذكي (SM-2 على طريقة Anki). بطاقات تُحفظ محلياً في قاعدة IndexedDB وتتسع لآلاف البطاقات.' : 'Anki-style spaced repetition. Cards stored in IndexedDB — room for thousands.'}
        </p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-secondary btn-sm" onclick="loadStarterFlashcardDecks()"><i class="fas fa-magic"></i> ${isAr ? 'حزم نموذجية' : 'Starter Decks'}</button>
        <button class="btn btn-secondary btn-sm" onclick="triggerImportDeckJSON()"><i class="fas fa-file-import"></i> ${isAr ? 'استيراد JSON' : 'Import JSON'}</button>
        <button class="btn btn-primary btn-sm" onclick="showCreateDeckModal()"><i class="fas fa-plus"></i> ${isAr ? 'حزمة جديدة' : 'New Deck'}</button>
      </div>
    </div>
    ${totalDue>0?`<div class="card" style="margin-bottom:20px;border-color:rgba(255,140,66,.3);display:flex;align-items:center;gap:12px;padding:14px 18px"><i class="fas fa-bell" style="color:var(--accent)"></i><span style="font-size:14px">${isAr ? `لديك <strong>${totalDue}</strong> بطاقة جاهزة للمراجعة عبر حزمك الدراسية` : `<strong>${totalDue}</strong> card${totalDue!==1?'s':''} due for review across your decks`}</span></div>`:''}
    ${!decks.length?`<div class="card" style="text-align:center;padding:48px 24px"><i class="fas fa-clone" style="font-size:40px;color:var(--text2);margin-bottom:16px;display:block"></i><h3 style="font-size:18px;margin-bottom:8px">${isAr ? 'لا توجد حزم بطاقات بعد' : 'No decks yet'}</h3><p style="color:var(--text2);margin-bottom:20px;font-size:14px">${isAr ? 'أنشئ حزمة مخصصة، أو استورد ملف JSON، أو حمّل الحزم النموذجية الجاهزة للمذاكرة بنظام SM-2 للتكرار المتباعد.' : 'Create a deck, import JSON, or load preset starter decks to start studying with SM-2 spaced repetition.'}</p>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="showCreateDeckModal()"><i class="fas fa-plus"></i> ${isAr ? 'إنشاء حزمة' : 'Create Deck'}</button>
      <button class="btn btn-secondary" onclick="loadStarterFlashcardDecks()"><i class="fas fa-magic"></i> ${isAr ? 'تحميل حزم نموذجية' : 'Load Starter Decks'}</button>
    </div></div>`
    :`<div class="flash-deck-grid">${stats.map(({deck,stats:s})=>`<div class="flash-deck-card" onclick="openFlashDeck('${deck.id}')">
      <div style="display:flex;align-items:center;gap:12px"><div class="deck-icon" style="background:${deck.color}22;color:${deck.color}"><i class="fas fa-layer-group"></i></div><div style="flex:1;min-width:0"><div style="font-weight:700;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(deck.name)}</div>${deck.desc?`<div style="font-size:12px;color:var(--text2);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(deck.desc)}</div>`:''}</div></div>
      <div class="flash-stat-row"><span><i class="fas fa-clone"></i> ${s.total} ${isAr ? 'بطاقة' : 'cards'}</span>${s.due?`<span class="flash-stat-due"><i class="fas fa-clock"></i> ${s.due} ${isAr ? 'مستحقة' : 'due'}</span>`:''}${s.newC?`<span class="flash-stat-new"><i class="fas fa-seedling"></i> ${s.newC} ${isAr ? 'جديدة' : 'new'}</span>`:''}</div>
      ${s.due||s.newC?`<div class="btn btn-sm btn-teal" style="width:100%;justify-content:center;margin-top:4px" onclick="event.stopPropagation();startFlashStudy('${deck.id}')"><i class="fas fa-play"></i> ${isAr ? 'ذاكر الآن' : 'Study Now'}</div>`:''}
    </div>`).join('')}</div>`}
    <div class="card" style="margin-top:24px"><h3 style="font-size:15px;margin-bottom:10px"><i class="fas fa-info-circle" style="color:var(--blue)"></i> ${isAr ? 'كيف يعمل نظام البطاقات الذكي؟' : 'How it works'}</h3><div style="font-size:13px;color:var(--text2);line-height:1.6;display:flex;flex-direction:column;gap:6px"><div><strong style="color:var(--text)">${isAr ? 'خوارزمية SM-2 المتقدمة' : 'SM-2 algorithm'}</strong> — ${isAr ? 'تجدول فترات المراجعة آلياً بناءً على مدى ثبات المعلومة وسرعة تذكرك لها.' : 'schedules reviews based on how well you remember each card.'}</div><div><strong style="color:var(--text)">${isAr ? 'أعد / صعب / جيد / سهل' : 'Again / Hard / Good / Easy'}</strong> — ${isAr ? 'قيّم كل بطاقة بعد قلبها لتحديد موعد الجلسة التالية تلقائياً.' : 'rate each card after flipping to set the next review date.'}</div><div><strong style="color:var(--text)">${isAr ? 'قاعدة بيانات IndexedDB' : 'IndexedDB storage'}</strong> — ${isAr ? 'تتيح حفظ حزم عملاقة مع النصوص والصور دون سقف التخزين المحدود لـ localStorage.' : 'supports large decks with text and images without the 5MB localStorage limit.'}</div></div></div>
  </div>`;
}

async function loadStarterFlashcardDecks() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const sampleDecks = isAr ? [
    {
      id: 'deck_adhd_hacks_ar',
      name: 'حيل التركيز والدراسة لفرط الحركة وتشتت الانتباه (ADHD)',
      desc: 'استراتيجيات مجربة لتسهيل المذاكرة وتجاوز صعوبات الوظائف التنفيذية.',
      color: '#4ECDC4',
      created: Date.now(),
      cards: [
        { front: 'ما هي قاعدة الـ 5 دقائق لبدء المذاكرة؟', back: 'التزم بالعمل لمدة 5 دقائق فقط. التغلب على عقبة البداية هو الأصعب لعقل الـ ADHD؛ وبمجرد أن يبدأ الزخم، ينشط التركيز الفائق غالباً.' },
        { front: 'ما هو أسلوب مضاعفة الجسد (Body Doubling)؟', back: 'العمل بجوار شخص آخر (أو رفيق دراسة افتراضي). مجرد وجود شخص آخر يعزز التركيز والمسؤولية دون ضغط نفسي.' },
        { front: 'لماذا تساعد الضوضاء البنية (Brown Noise) في التركيز؟', back: 'تحتوي الضوضاء البنية على ترددات هادئة وعميقة تحجب الضوضاء المحيطة المشتتة وتهدئ العقل النشط.' },
        { front: 'ما هو تقسيم المهام إلى كتل صغيرة (Task Chunking)؟', back: 'تفكيك المشاريع الكبيرة المرهقة إلى خطوات مجهرية صغيرة (مهام من دقيقة إلى دقيقتين) لتجنب الشلل التنفيذي والتسويف.' },
        { front: 'كيف يساعد التأطير الزمني البصري (Visual Time-Boxing)؟', back: 'رؤية الوقت يتقلص بصرياً (كدونات أو ساعة رملية) تجعل الوقت ملموساً بدلاً من كونه هاجساً غامضاً، مما يخفف قلق الوقت.' }
      ]
    },
    {
      id: 'deck_mental_math_ar',
      name: 'أسرار وحيل الحساب الذهني السريع',
      desc: 'حيل ذكية لإجراء العمليات الحسابية والمسائل في ثوانٍ دون ورقة وقلم.',
      color: '#FF8C42',
      created: Date.now() + 1,
      cards: [
        { front: 'كيف تضرب أي عدد من رقمين في 11 ذهنياً؟', back: 'اجمع الرقمين وضع المجموع في المنتصف.\nمثال: 35 × 11 → نجمع (3+5=8) ونضعها بينهما → 385!' },
        { front: 'كيف تربع أي عدد ينتهي بالرقم 5 (مثل 35²)؟', back: 'اضرب رقم العشرات (3) في (3 + 1 = 4) فيعطي 12. ثم أضف 25 في النهاية → 1225!' },
        { front: 'طريقة سريعة ومثيرة للطرح من 1,000؟', back: 'اطرح جميع الأرقام من 9 باستثناء الرقم الأخير اطرحه من 10.\nمثال: 1000 - 647 → (9-6)=3، (9-4)=5، (10-7)=3 → الناتج 353.' },
        { front: 'كيف تحسب 15% من أي رقم في ذهنك؟', back: '1. احسب 10% أولاً (حرك الفاصلة لليسار خانة واحدة).\n2. أضف نصف قيمة الـ 10%.\nمثال: 10% من 40 = 4؛ ونصفها 2 → الإجمالي 6.' }
      ]
    },
    {
      id: 'deck_science_core_ar',
      name: 'أساسيات العلوم والفيزياء العامة',
      desc: 'مفاهيم جوهرية في علم الأحياء، والكيمياء، والفيزياء الكلاسيكية.',
      color: '#A855F7',
      created: Date.now() + 2,
      cards: [
        { front: 'ما هي المعادلة الكيميائية للبناء الضوئي؟', back: '6CO₂ + 6H₂O + ضوء الشمس → C₆H₁₂O₆ + 6O₂\n(ثاني أكسيد الكربون + ماء → جلوكوز + أكسجين)' },
        { front: 'ما هو نص قانون أوم الكهربائي؟', back: 'فرق الجهد (جـ) = شدة التيار (ت) × المقاومة (م)\nV = I × R' },
        { front: 'ما هي وظيفة الميتوكوندريا في الخلية الحية؟', back: 'محطة توليد الطاقة في الخلية: تقوم بإنتاج جزيئات ATP من خلال عملية التنفس الخلوي.' },
        { front: 'ما هي قوانين نيوتن الثلاثة للحركة؟', back: '1. القصور الذاتي (الجسم الساكن يبقى ساكناً والمتحرك يستمر ما لم تؤثر عليه قوة خارجية)\n2. القوة = الكتلة × التسارع (F = m × a)\n3. لكل فعل رد فعل مساوٍ له في المقدار ومضاد له في الاتجاه.' }
      ]
    }
  ] : [
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
  toast(isAr ? 'تم تحميل الحزم النموذجية بنجاح!' : 'Loaded starter decks with cards!', 'success');
  renderFlashcards();
}

async function exportDeckJSON(deckId) {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
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
  toast(isAr ? 'تم تصدير الحزمة كملف JSON!' : 'Deck exported as JSON!', 'success');
}

function triggerImportDeckJSON() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
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
      toast(isAr ? `تم استيراد الحزمة "${deck.name}" بنجاح مع ${parsed.cards.length} بطاقة!` : `Imported deck "${deck.name}" with ${parsed.cards.length} cards!`, 'success');
      renderFlashcards();
    } catch (err) {
      toast(isAr ? 'فشل استيراد ملف JSON للحزمة.' : 'Failed to import deck JSON file.', 'warn');
    }
  };
  input.click();
}

function showCreateDeckModal(){
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  showModal(`<div dir="${isAr ? 'rtl' : 'ltr'}"><h2 style="font-size:20px;margin-bottom:16px">${isAr ? 'إنشاء حزمة بطاقات جديدة' : 'New Deck'}</h2>
    <div style="margin-bottom:12px"><label style="font-size:13px;color:var(--text2);display:block;margin-bottom:4px">${isAr ? 'اسم الحزمة' : 'Deck name'}</label><input class="input" id="deck-name" placeholder="${isAr ? 'مثال: أحياء - الفصل الثالث، مصطلحات إنجليزية...' : 'e.g. Biology Chapter 3'}" autofocus></div>
    <div style="margin-bottom:20px"><label style="font-size:13px;color:var(--text2);display:block;margin-bottom:4px">${isAr ? 'الوصف (اختياري)' : 'Description (optional)'}</label><input class="input" id="deck-desc" placeholder="${isAr ? 'ما موضوع هذه الحزمة وماذا تغطي؟' : 'What is this deck about?'}"></div>
    <div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-secondary" onclick="closeModal()">${isAr ? 'إلغاء' : 'Cancel'}</button><button class="btn btn-primary" onclick="createFlashDeck()">${isAr ? 'إنشاء' : 'Create'}</button></div></div>`);
}

async function createFlashDeck(){
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const name=document.getElementById('deck-name')?.value.trim();
  if(!name){toast(isAr ? 'يرجى كتابة اسم الحزمة' : 'Enter a deck name','warn');return;}
  const desc=document.getElementById('deck-desc')?.value.trim()||'';
  const decks=await FlashDB.getAllDecks();
  const deck={id:'deck_'+Date.now(),name,desc,color:DECK_COLORS[decks.length%DECK_COLORS.length],created:Date.now()};
  await FlashDB.saveDeck(deck);
  closeModal();SFX.click();toast(isAr ? 'تم إنشاء الحزمة بنجاح!' : 'Deck created!','success');
  flashState={screen:'deck',deckId:deck.id,queue:[],idx:0,flipped:false,sessionReviewed:0,sessionXP:0};
  renderFlashcards();
}

function openFlashDeck(id){flashState={screen:'deck',deckId:id,queue:[],idx:0,flipped:false,sessionReviewed:0,sessionXP:0};renderFlashcards();}

async function renderFlashDeckDetail(el){
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const decks=await FlashDB.getAllDecks();
  const deck=decks.find(d=>d.id===flashState.deckId);
  if(!deck){flashState.screen='list';renderFlashcards();return;}
  const cards=await FlashDB.getCardsByDeck(deck.id);
  const stats=await FlashDB.getDeckStats(deck.id);
  const now=Date.now();
  el.innerHTML=`<div style="max-width:800px;margin:0 auto" dir="${isAr ? 'rtl' : 'ltr'}">
    <button class="btn btn-sm btn-ghost" style="margin-bottom:16px" onclick="flashState.screen='list';renderFlashcards()">
      <i class="fas ${isAr ? 'fa-arrow-right' : 'fa-arrow-left'}"></i> ${isAr ? 'جميع الحزم' : 'All Decks'}
    </button>
    <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:24px">
      <div><h1 style="font-size:26px;font-weight:700;margin-bottom:4px">${escHtml(deck.name)}</h1>${deck.desc?`<p style="color:var(--text2)">${escHtml(deck.desc)}</p>`:''}
      <div class="flash-stat-row" style="margin-top:8px"><span>${stats.total} ${isAr ? 'بطاقة' : 'cards'}</span>${stats.due?`<span class="flash-stat-due">${stats.due} ${isAr ? 'مستحقة' : 'due'}</span>`:''}${stats.newC?`<span class="flash-stat-new">${stats.newC} ${isAr ? 'جديدة' : 'new'}</span>`:''}</div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${stats.total?`<button class="btn btn-teal" onclick="startFlashStudy('${deck.id}')"><i class="fas fa-play"></i> ${isAr ? 'ابدأ المذاكرة' : 'Study'}${stats.due||stats.newC?` (${stats.due+Math.min(stats.newC,20)} ${isAr ? 'بطاقة' : 'cards'})`:''}</button>`:''}
        <button class="btn btn-primary" onclick="showAddCardModal()"><i class="fas fa-plus"></i> ${isAr ? 'إضافة بطاقة' : 'Add Card'}</button>
        <button class="btn btn-sm btn-secondary" onclick="exportDeckJSON('${deck.id}')"><i class="fas fa-file-export"></i> ${isAr ? 'تصدير' : 'Export'}</button>
        <button class="btn btn-sm btn-ghost" style="color:var(--red);border:1px solid rgba(255,107,107,.2)" onclick="confirmDeleteDeck('${deck.id}')" title="${isAr ? 'حذف الحزمة' : 'Delete'}"><i class="fas fa-trash"></i></button>
      </div>
    </div>
    ${!cards.length?`<div class="card" style="text-align:center;padding:32px"><p style="color:var(--text2);margin-bottom:16px">${isAr ? 'لا توجد بطاقات في هذه الحزمة حتى الآن.' : 'No cards in this deck yet.'}</p><button class="btn btn-primary" onclick="showAddCardModal()"><i class="fas fa-plus"></i> ${isAr ? 'أضف أول بطاقة' : 'Add Your First Card'}</button></div>`
    :`<div class="flash-card-list">${cards.map(c=>{
      const isNew=!c.repetitions;
      const isDue=!isNew&&c.nextReview<=now;
      const meta=isNew ? (isAr ? 'جديدة' : 'New') : isDue ? (isAr ? 'مستحقة' : 'Due') : (isAr ? `مراجعة بعد ${Math.max(1,Math.ceil((c.nextReview-now)/86400000))} يوم` : `Review in ${Math.max(1,Math.ceil((c.nextReview-now)/86400000))}d`);
      return`<div class="flash-card-row"><div class="fc-front">${escHtml(c.front)}</div><span class="fc-meta ${isDue?'fc-due':''}">${meta}</span><button class="btn btn-sm btn-ghost" onclick="confirmDeleteCard(${c.id})" style="padding:4px 8px;color:var(--red)"><i class="fas fa-trash"></i></button></div>`;
    }).join('')}</div>`}
  </div>`;
}

function showAddCardModal(){
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  showModal(`<div dir="${isAr ? 'rtl' : 'ltr'}"><h2 style="font-size:20px;margin-bottom:16px">${isAr ? 'إضافة بطاقة جديدة' : 'Add Card'}</h2>
    <div style="margin-bottom:12px"><label style="font-size:13px;color:var(--text2);display:block;margin-bottom:4px">${isAr ? 'الوجه الأمامي (السؤال أو المصطلح)' : 'Front (question)'}</label><textarea class="input" id="card-front" rows="3" placeholder="${isAr ? 'اكتب السؤال، المفهوم، أو المصطلح الرياضي أو العلمي...' : 'Question or term...'}" style="resize:vertical"></textarea></div>
    <div style="margin-bottom:12px"><label style="font-size:13px;color:var(--text2);display:block;margin-bottom:4px">${isAr ? 'الوجه الخلفي (الإجابة أو الشرح)' : 'Back (answer)'}</label><textarea class="input" id="card-back" rows="3" placeholder="${isAr ? 'اكتب الإجابة، التعريف، أو الحل...' : 'Answer or definition...'}" style="resize:vertical"></textarea></div>
    <div style="margin-bottom:12px"><label style="font-size:13px;color:var(--text2);display:block;margin-bottom:4px">${isAr ? 'صورة الوجه الأمامي (اختياري)' : 'Front image (optional)'}</label><input type="file" class="input" id="card-front-img" accept="image/*" style="padding:8px"></div>
    <div style="margin-bottom:20px"><label style="font-size:13px;color:var(--text2);display:block;margin-bottom:4px">${isAr ? 'صورة الوجه الخلفي (اختياري)' : 'Back image (optional)'}</label><input type="file" class="input" id="card-back-img" accept="image/*" style="padding:8px"></div>
    <div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-secondary" onclick="closeModal()">${isAr ? 'إلغاء' : 'Cancel'}</button><button class="btn btn-primary" onclick="saveFlashCard()">${isAr ? 'حفظ البطاقة' : 'Save Card'}</button></div></div>`);
}

function readImageFile(input){
  return new Promise((ok,no)=>{
    const f=input?.files?.[0];
    if(!f)return ok(null);
    if(f.size>3*1024*1024){
      const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
      toast(isAr ? 'حجم الصورة كبير جداً (الحد الأقصى 3 ميجابايت)' : 'Image too large (max 3MB)','warn');
      return ok(null);
    }
    const r=new FileReader();
    r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(f);
  });
}

async function saveFlashCard(){
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const front=document.getElementById('card-front')?.value.trim();
  const back=document.getElementById('card-back')?.value.trim();
  if(!front||!back){toast(isAr ? 'يرجى كتابة السؤال والإجابة معاً' : 'Enter both front and back','warn');return;}
  const frontImage=await readImageFile(document.getElementById('card-front-img'));
  const backImage=await readImageFile(document.getElementById('card-back-img'));
  const card={deckId:flashState.deckId,front,back,frontImage,backImage,repetitions:0,interval:0,easiness:2.5,nextReview:0,lastReview:null,created:Date.now()};
  await FlashDB.saveCard(card);
  closeModal();SFX.click();toast(isAr ? 'تمت إضافة البطاقة بنجاح!' : 'Card added!','success');renderFlashcards();
}

function confirmDeleteDeck(id){
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  showModal(`<div dir="${isAr ? 'rtl' : 'ltr'}"><h2 style="font-size:18px;margin-bottom:10px">${isAr ? 'هل أنت متأكد من حذف هذه الحزمة؟' : 'Delete this deck?'}</h2><p style="color:var(--text2);margin-bottom:20px">${isAr ? 'سيتم حذف جميع البطاقات المحفوظة داخل هذه الحزمة نهائياً.' : 'All cards in this deck will be permanently deleted.'}</p><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-secondary" onclick="closeModal()">${isAr ? 'إلغاء' : 'Cancel'}</button><button class="btn" style="background:var(--red);color:#fff" onclick="deleteFlashDeck('${id}')">${isAr ? 'حذف' : 'Delete'}</button></div></div>`);
}

async function deleteFlashDeck(id){
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  await FlashDB.deleteDeck(id);closeModal();flashState.screen='list';toast(isAr ? 'تم حذف الحزمة' : 'Deck deleted','info');renderFlashcards();
}

function confirmDeleteCard(id){
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  showModal(`<div dir="${isAr ? 'rtl' : 'ltr'}"><p style="margin-bottom:20px">${isAr ? 'هل أنت متأكد من حذف هذه البطاقة؟' : 'Delete this card?'}</p><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-secondary" onclick="closeModal()">${isAr ? 'إلغاء' : 'Cancel'}</button><button class="btn" style="background:var(--red);color:#fff" onclick="deleteFlashCard(${id})">${isAr ? 'حذف' : 'Delete'}</button></div></div>`);
}

async function deleteFlashCard(id){
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  await FlashDB.deleteCard(id);closeModal();toast(isAr ? 'تم حذف البطاقة' : 'Card deleted','info');renderFlashcards();
}

async function startFlashStudy(deckId){
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const cards=await FlashDB.getCardsByDeck(deckId);
  const now=Date.now();
  const due=cards.filter(c=>c.repetitions>0&&c.nextReview<=now);
  const fresh=cards.filter(c=>!c.repetitions).slice(0,20);
  const queue=shuffle([...due,...fresh]);
  if(!queue.length){toast(isAr ? 'لا توجد بطاقات للمراجعة حالياً — أضف بطاقات جديدة أولاً!' : 'No cards to review — add some first!','info');return;}
  flashState={screen:'study',deckId,queue,idx:0,flipped:false,sessionReviewed:0,sessionXP:0};
  SFX.click();renderFlashcards();
}

function renderFlashStudy(el){
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  if(flashState.idx>=flashState.queue.length){finishFlashSession();return;}
  const card=flashState.queue[flashState.idx];
  const total=flashState.queue.length,done=flashState.idx;
  const frontImg=card.frontImage?`<img class="flash-card-img" src="${card.frontImage}" alt="">`:'';
  const backImg=card.backImage?`<img class="flash-card-img" src="${card.backImage}" alt="">`:'';
  el.innerHTML=`<div style="max-width:640px;margin:0 auto" dir="${isAr ? 'rtl' : 'ltr'}">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
      <button class="btn btn-sm btn-ghost" onclick="flashState.screen='deck';renderFlashcards()"><i class="fas fa-times"></i> ${isAr ? 'خروج' : 'Exit'}</button>
      <span style="font-size:14px;color:var(--text2);font-weight:700;">${done+1} / ${total}</span>
    </div>
    <div style="display:flex;gap:6px;margin-bottom:20px">${flashState.queue.map((_,i)=>`<div class="progress-dot ${i<done?'done':i===done?'current':''}"></div>`).join('')}</div>
    <div class="flash-card-scene" id="flash-scene" onclick="flipFlashCard()">
      <div class="flash-card-inner ${flashState.flipped?'flipped':''}" id="flash-inner">
        <div class="flash-card-face front">${frontImg}<div class="flash-card-text">${escHtml(card.front)}</div><div class="flash-card-hint">${isAr ? 'انقر أو اضغط مفتاح المسافة (Space) لقلب البطاقة' : 'Tap or press Space to flip'}</div></div>
        <div class="flash-card-face back">${backImg}<div class="flash-card-text">${escHtml(card.back)}</div></div>
      </div>
    </div>
    ${flashState.flipped?`<div class="flash-rate-row" dir="ltr">
      <button class="flash-rate-btn again" onclick="rateFlashCard(1)"><span>${isAr ? 'أعد' : 'Again'}</span><small>${isAr ? '&lt;1 يوم' : '&lt;1 day'}</small></button>
      <button class="flash-rate-btn hard" onclick="rateFlashCard(3)"><span>${isAr ? 'صعب' : 'Hard'}</span><small>${isAr ? '~1 يوم' : '~1 day'}</small></button>
      <button class="flash-rate-btn good" onclick="rateFlashCard(4)"><span>${isAr ? 'جيد' : 'Good'}</span><small>${isAr ? 'طبيعي' : 'Normal'}</small></button>
      <button class="flash-rate-btn easy" onclick="rateFlashCard(5)"><span>${isAr ? 'سهل' : 'Easy'}</span><small>${isAr ? 'أطول' : 'Longer'}</small></button>
    </div>`:`<div style="text-align:center"><button class="btn btn-teal btn-lg" onclick="flipFlashCard()"><i class="fas fa-sync-alt"></i> ${isAr ? 'إظهار الإجابة' : 'Show Answer'}</button></div>`}
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
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const n=flashState.sessionReviewed,xp=flashState.sessionXP;
  SFX.complete();
  showModal(`<div style="text-align:center" dir="${isAr ? 'rtl' : 'ltr'}"><div style="font-size:48px;margin-bottom:12px"><i class="fas fa-check-circle" style="color:var(--green)"></i></div><h2 style="font-size:22px;margin-bottom:4px">${isAr ? 'اكتملت الجلسة بنجاح!' : 'Session Complete!'}</h2><p style="color:var(--text2);margin-bottom:20px">${isAr ? `راجعت <strong>${n}</strong> بطاقة تعليمية.` : `You reviewed ${n} card${n!==1?'s':''}.`}</p>${xp>0?`<div class="card" style="padding:16px;margin-bottom:20px"><div style="font-family:Fredoka;font-size:28px;color:var(--accent)">+${xp} XP</div><div style="font-size:12px;color:var(--text2)">${isAr ? '5 نقاط XP لكل بطاقة جيدة أو سهلة' : '5 XP per Good/Easy card'}</div></div>`:''}<div style="display:flex;gap:10px;justify-content:center"><button class="btn btn-secondary" onclick="closeModal();flashState.screen='deck';renderFlashcards()">${isAr ? 'العودة للحزمة' : 'Back to Deck'}</button><button class="btn btn-primary" onclick="closeModal();startFlashStudy(flashState.deckId)">${isAr ? 'مذاكرة مجدداً' : 'Study Again'}</button></div></div>`);
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
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  showModal(`
    <h2 style="font-size:20px; font-weight:700; margin-bottom:16px;">${isAr ? 'قالب تركيز جديد' : 'New Focus Preset'}</h2>
    <div style="margin-bottom:12px;">
      <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">${isAr ? 'اسم القالب' : 'Preset Name'}</label>
      <input class="input" id="preset-name-inp" placeholder="${isAr ? 'مثال: جلسة مراجعة سريعة، سباق قراءة...' : 'e.g. Cram Session, Reading Sprint'}" autofocus style="font-size:14px;">
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
      <div>
        <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">${isAr ? 'مدة التركيز' : 'Focus Duration'}</label>
        <select class="input" id="preset-focus-inp" style="font-size:13px;">
          <option value="5">5 ${isAr ? 'دقائق' : 'min'}</option>
          <option value="10">10 ${isAr ? 'دقائق' : 'min'}</option>
          <option value="15" selected>15 ${isAr ? 'دقيقة' : 'min'}</option>
          <option value="20">20 ${isAr ? 'دقيقة' : 'min'}</option>
          <option value="25">25 ${isAr ? 'دقيقة' : 'min'}</option>
          <option value="30">30 ${isAr ? 'دقيقة' : 'min'}</option>
          <option value="45">45 ${isAr ? 'دقيقة' : 'min'}</option>
          <option value="60">60 ${isAr ? 'دقيقة' : 'min'}</option>
        </select>
      </div>
      <div>
        <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">${isAr ? 'مدة الاستراحة' : 'Break Duration'}</label>
        <select class="input" id="preset-break-inp" style="font-size:13px;">
          <option value="1">1 ${isAr ? 'دقيقة' : 'min'}</option>
          <option value="2">2 ${isAr ? 'دقيقة' : 'min'}</option>
          <option value="3" selected>3 ${isAr ? 'دقائق' : 'min'}</option>
          <option value="5">5 ${isAr ? 'دقائق' : 'min'}</option>
          <option value="10">10 ${isAr ? 'دقائق' : 'min'}</option>
        </select>
      </div>
    </div>
    <div style="margin-bottom:20px;">
      <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">${isAr ? 'صوت الخلفية المفضل' : 'Preferred Soundscape'}</label>
      <select class="input" id="preset-sound-inp" style="font-size:13px;">
        <option value="none">${isAr ? 'بدون' : 'None'}</option>
        <option value="adhd">${isAr ? 'تركيز ADHD' : 'ADHD Focus'}</option>
        <option value="lofi">${isAr ? 'لو-فاي مريح' : 'Cozy Lo-Fi'}</option>
        <option value="nature">${isAr ? 'أصوات الطبيعة' : 'Nature Sounds'}</option>
        <option value="cafe">${isAr ? 'أجواء المقهى' : 'Cafe Murmur'}</option>
        <option value="brown">${isAr ? 'ضوضاء بنية' : 'Brown Noise'}</option>
        <option value="rain">${isAr ? 'مطر وعواصف' : 'Rain & Storm'}</option>
      </select>
    </div>
    <div style="display:flex; gap:10px; justify-content:flex-end;">
      <button class="btn btn-secondary" onclick="closeModal()">${isAr ? 'إلغاء' : 'Cancel'}</button>
      <button class="btn btn-teal" onclick="saveCustomPreset()"><i class="fas fa-check"></i> ${isAr ? 'حفظ القالب' : 'Save Preset'}</button>
    </div>
  `);
}

function saveCustomPreset() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const nameEl = document.getElementById('preset-name-inp');
  const focusEl = document.getElementById('preset-focus-inp');
  const breakEl = document.getElementById('preset-break-inp');
  const soundEl = document.getElementById('preset-sound-inp');

  const name = nameEl ? nameEl.value.trim() : '';
  if (!name) {
    toast(isAr ? 'يرجى كتابة اسم القالب' : 'Please enter a preset name', 'warn');
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
  toast(isAr ? `تم حفظ القالب المخصص "${name}" بنجاح!` : `Custom preset "${name}" saved!`, 'success');
  if (currentView === 'focus') renderFocus();
}

function deleteCustomPreset(presetId) {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  let presets = Store.get('focusPresets') || [];
  presets = presets.filter(p => p.id !== presetId);
  Store.set('focusPresets', presets);
  SFX.click();
  toast(isAr ? 'تم حذف القالب' : 'Preset deleted', 'info');
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
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const PRESET_NAMES_AR = {
    p_pomo: 'بومودورو كلاسيكي',
    p_deep: 'عمل عميق ومركز',
    p_adhd: 'سباق تركيز ADHD',
    p_burst: 'انطلاقة خاطفة'
  };
  const displayName = isAr && PRESET_NAMES_AR[p.id] ? PRESET_NAMES_AR[p.id] : p.name;
  toast(isAr ? `تم تفعيل ${displayName} (${p.focusMin} دقيقة تركيز / ${p.breakMin} دقيقة استراحة)` : `Applied ${p.name} (${p.focusMin}m focus / ${p.breakMin}m break)`, 'info');
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
          ${getTimeSlotOptions(curTime)}
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

function getScheduleSettings() {
  const s = Store.get('settings') || {};
  if (!s.schedule) {
    s.schedule = { weekStartDay: 6, dayStartHour: 8, dayEndHour: 20 };
  }
  if (typeof s.schedule.weekStartDay !== 'number') s.schedule.weekStartDay = 6;
  if (typeof s.schedule.dayStartHour !== 'number') s.schedule.dayStartHour = 8;
  if (typeof s.schedule.dayEndHour !== 'number') s.schedule.dayEndHour = 20;
  return s.schedule;
}

function saveScheduleSettings(weekStartDay, dayStartHour, dayEndHour) {
  const s = Store.get('settings') || {};
  if (!s.schedule) s.schedule = {};
  const startDay = parseInt(weekStartDay, 10);
  const startH = Math.max(0, Math.min(22, parseInt(dayStartHour, 10)));
  const endH = Math.max(startH + 1, Math.min(23, parseInt(dayEndHour, 10)));

  s.schedule.weekStartDay = startDay;
  s.schedule.dayStartHour = startH;
  s.schedule.dayEndHour = endH;
  Store.save();
  SFX.bonus();

  const dayNames = { 6: 'Saturday', 0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday' };
  const dName = dayNames[startDay] || 'Custom';
  toast(`Timetable updated! Starts on ${dName}, ${formatHour12(startH)} to ${formatHour12(endH)}`, 'success');

  if (currentView === 'schedule') renderSchedule();
  else if (currentView === 'settings') renderSettings();
}

function formatHour12(h) {
  const hourNum = parseInt(h, 10);
  return (hourNum % 12 || 12) + (hourNum >= 12 ? ' PM' : ' AM');
}

function getScheduleHours() {
  const s = getScheduleSettings();
  const start = Math.max(0, Math.min(22, s.dayStartHour));
  const end = Math.max(start + 1, Math.min(23, s.dayEndHour));
  const hours = [];
  for (let h = start; h <= end; h++) {
    hours.push(String(h).padStart(2, '0') + ':00');
  }
  return hours;
}

function getTimeSlotOptions(selectedTime, startH = null, endH = null) {
  const sched = getScheduleSettings();
  const from = startH !== null ? startH : Math.min(4, sched.dayStartHour);
  const to = endH !== null ? endH : Math.max(23, sched.dayEndHour);
  const opts = [];
  for (let h = from; h <= to; h++) {
    const val = String(h).padStart(2, '0') + ':00';
    const h12 = (h % 12 || 12) + (h >= 12 ? ' PM' : ' AM');
    opts.push(`<option value="${val}" ${val === selectedTime ? 'selected' : ''}>${val} (${h12})</option>`);
  }
  return opts.join('');
}

function getOrderedWeekDaysList() {
  const sched = getScheduleSettings();
  const allDays = [
    { d: 0, n: 'Sun', full: 'Sunday' },
    { d: 1, n: 'Mon', full: 'Monday' },
    { d: 2, n: 'Tue', full: 'Tuesday' },
    { d: 3, n: 'Wed', full: 'Wednesday' },
    { d: 4, n: 'Thu', full: 'Thursday' },
    { d: 5, n: 'Fri', full: 'Friday' },
    { d: 6, n: 'Sat', full: 'Saturday' }
  ];
  const startDay = sched.weekStartDay;
  const ordered = [];
  for (let i = 0; i < 7; i++) {
    const dayIdx = (startDay + i) % 7;
    ordered.push(allDays.find(x => x.d === dayIdx));
  }
  return ordered;
}

function showScheduleSettingsModal() {
  const sched = getScheduleSettings();

  const startDayOptions = [
    { val: 6, label: 'Saturday', note: 'Egypt & Middle East' },
    { val: 0, label: 'Sunday', note: 'North America / Japan' },
    { val: 1, label: 'Monday', note: 'International ISO / Europe' }
  ];

  const presets = [
    { name: 'Early Bird (5 AM – 8 PM)', start: 5, end: 20 },
    { name: 'Dawn Scholar (6 AM – 9 PM)', start: 6, end: 21 },
    { name: 'Standard School (8 AM – 8 PM)', start: 8, end: 20 },
    { name: 'Night Owl (10 AM – 11 PM)', start: 10, end: 23 },
    { name: 'Full Day (5 AM – 11 PM)', start: 5, end: 23 }
  ];

  showModal(`
    <div style="max-width:540px;">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px;">
        <div style="width:36px; height:36px; border-radius:10px; background:var(--teal-g); display:flex; align-items:center; justify-content:center; color:var(--teal);">
          <i class="fas fa-sliders" style="font-size:16px;"></i>
        </div>
        <div>
          <h2 style="font-size:20px; font-weight:700; margin:0;">Timetable & Week Settings</h2>
          <p style="font-size:12px; color:var(--text2); margin:0;">Customize week start day and daily active hours</p>
        </div>
      </div>

      <!-- Week Start Day -->
      <div style="margin-bottom:18px;">
        <label style="font-size:13px; font-weight:700; display:block; margin-bottom:6px;">Week Starts On</label>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px;" id="sched-start-day-picker">
          ${startDayOptions.map(opt => `
            <button type="button" class="btn ${sched.weekStartDay === opt.val ? 'btn-teal' : 'btn-secondary'} sched-day-opt" 
                    data-day="${opt.val}" 
                    onclick="selectModalStartDay(${opt.val})"
                    style="padding:10px 8px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:2px; font-size:13px;">
              <span style="font-weight:700;">${opt.label}</span>
              <span style="font-size:10px; opacity:0.8;">${opt.note}</span>
            </button>
          `).join('')}
        </div>
        <input type="hidden" id="modal-sched-start-day" value="${sched.weekStartDay}">
      </div>

      <!-- Quick Preset Buttons -->
      <div style="margin-bottom:18px;">
        <label style="font-size:12px; color:var(--text2); display:block; margin-bottom:6px;">Quick Hour Presets</label>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          ${presets.map(p => `
            <button type="button" class="btn btn-ghost btn-sm" 
                    onclick="setModalHours(${p.start}, ${p.end})" 
                    style="border:1px solid var(--border); font-size:11px; padding:4px 8px;">
              ${p.name}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Daily Hour Range -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:18px;">
        <div>
          <label style="font-size:13px; font-weight:700; display:block; margin-bottom:4px;">Day Starts At (First Hour)</label>
          <select class="input" id="modal-day-start-hour" onchange="updateModalHourPreview()">
            ${[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => `
              <option value="${h}" ${h === sched.dayStartHour ? 'selected' : ''}>${String(h).padStart(2, '0')}:00 (${formatHour12(h)})</option>
            `).join('')}
          </select>
          <div style="font-size:11px; color:var(--text2); margin-top:3px;">e.g. 5:00 AM for early morning sessions</div>
        </div>
        <div>
          <label style="font-size:13px; font-weight:700; display:block; margin-bottom:4px;">Day Ends At (Last Hour)</label>
          <select class="input" id="modal-day-end-hour" onchange="updateModalHourPreview()">
            ${[17, 18, 19, 20, 21, 22, 23].map(h => `
              <option value="${h}" ${h === sched.dayEndHour ? 'selected' : ''}>${String(h).padStart(2, '0')}:00 (${formatHour12(h)})</option>
            `).join('')}
          </select>
          <div style="font-size:11px; color:var(--text2); margin-top:3px;">e.g. 8:00 PM (20:00) or 11:00 PM (23:00)</div>
        </div>
      </div>

      <!-- Live summary pill -->
      <div id="modal-sched-preview" style="background:var(--bg); border:1px solid var(--border); border-radius:10px; padding:10px 14px; margin-bottom:18px; font-size:12px; color:var(--text2); display:flex; align-items:center; gap:8px;">
        <i class="fas fa-check-circle" style="color:var(--teal);"></i>
        <span>Will display hours <strong>${formatHour12(sched.dayStartHour)} to ${formatHour12(sched.dayEndHour)}</strong> (${Math.max(1, sched.dayEndHour - sched.dayStartHour + 1)} time slots/day)</span>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-teal" onclick="applyModalScheduleSettings()"><i class="fas fa-check"></i> Apply to Timetable</button>
      </div>
    </div>
  `);
}

function selectModalStartDay(day) {
  const hiddenInp = document.getElementById('modal-sched-start-day');
  if (hiddenInp) hiddenInp.value = day;
  document.querySelectorAll('.sched-day-opt').forEach(btn => {
    if (parseInt(btn.dataset.day, 10) === day) {
      btn.className = 'btn btn-teal sched-day-opt';
    } else {
      btn.className = 'btn btn-secondary sched-day-opt';
    }
  });
  SFX.click();
}

function setModalHours(start, end) {
  const sEl = document.getElementById('modal-day-start-hour');
  const eEl = document.getElementById('modal-day-end-hour');
  if (sEl) sEl.value = start;
  if (eEl) eEl.value = end;
  updateModalHourPreview();
  SFX.click();
}

function updateModalHourPreview() {
  const sEl = document.getElementById('modal-day-start-hour');
  const eEl = document.getElementById('modal-day-end-hour');
  const pEl = document.getElementById('modal-sched-preview');
  if (!sEl || !eEl || !pEl) return;

  let s = parseInt(sEl.value, 10);
  let e = parseInt(eEl.value, 10);
  if (e <= s) {
    e = Math.min(23, s + 1);
    eEl.value = e;
  }
  const total = e - s + 1;
  pEl.innerHTML = `
    <i class="fas fa-check-circle" style="color:var(--teal);"></i>
    <span>Will display hours <strong>${formatHour12(s)} to ${formatHour12(e)}</strong> (${total} time slots/day)</span>
  `;
}

function applyModalScheduleSettings() {
  const dayInp = document.getElementById('modal-sched-start-day');
  const sEl = document.getElementById('modal-day-start-hour');
  const eEl = document.getElementById('modal-day-end-hour');

  const startDay = dayInp ? parseInt(dayInp.value, 10) : 6;
  const startHour = sEl ? parseInt(sEl.value, 10) : 8;
  const endHour = eEl ? parseInt(eEl.value, 10) : 20;

  closeModal();
  saveScheduleSettings(startDay, startHour, endHour);
}

function getWeekDays(offset = 0) {
  const sched = getScheduleSettings();
  const startDay = sched.weekStartDay; // 6: Sat, 0: Sun, 1: Mon
  const now = new Date();
  const todayStr = getLocalDateStr(now);
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday... 6 is Saturday
  const distToStart = (currentDay - startDay + 7) % 7;
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distToStart + (offset * 7));

  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fullNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i);
    const dateStr = getLocalDateStr(d);
    const dayIndex = d.getDay();
    days.push({
      name: dayNames[dayIndex],
      fullName: fullNames[dayIndex],
      dayIndex: dayIndex,
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

  const schedSettings = getScheduleSettings();
  const dayNameMap = { 6: 'Saturday', 0: 'Sunday', 1: 'Monday' };
  const weekStartName = dayNameMap[schedSettings.weekStartDay] || 'Custom';

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
          <button class="btn btn-secondary btn-sm" onclick="showScheduleSettingsModal()" title="Customize week start day and hours" style="border:1px solid var(--border);">
            <i class="fas fa-sliders"></i> Timetable Settings
          </button>
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

        <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
          <div style="font-family:'Fredoka',sans-serif; font-size:18px; font-weight:700; display:flex; align-items:center; gap:8px;">
            <i class="far fa-calendar-alt" style="color:var(--accent);"></i>
            <span>${weekStart} – ${weekEnd}</span>
            ${isCurrentWeek ? `<span class="tag" style="background:rgba(78,205,196,0.15); color:var(--teal); font-size:12px; font-family:'Nunito';">This Week</span>` : ''}
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span class="tag" style="background:var(--bg); border:1px solid var(--border); font-size:11px; cursor:pointer; font-family:'Nunito'; font-weight:600;" onclick="showScheduleSettingsModal()" title="Click to customize schedule hours and start day">
              <i class="fas fa-clock" style="color:var(--teal); margin-right:4px;"></i>${formatHour12(schedSettings.dayStartHour)} – ${formatHour12(schedSettings.dayEndHour)} &middot; Starts ${weekStartName} <i class="fas fa-pen" style="font-size:9px; margin-left:3px; opacity:0.6;"></i>
            </span>
          </div>
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
  const hours = getScheduleHours();
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
  const availableHours = getScheduleHours();
  let syncedCount = 0;

  // Study hours prioritized, falling back to available timetable hours
  const preferred = ['16:00', '17:00', '15:00', '18:00', '14:00', '19:00', '10:00', '11:00', '09:00'];
  let studyHours = preferred.filter(h => availableHours.includes(h));
  if (!studyHours.length) studyHours = availableHours;

  // Distribute tasks across week days (first 5 active days of configured week)
  pendingTasks.forEach((t, i) => {
    const dayObj = days[i % 5];
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
  const sched = getScheduleSettings();
  const dayIndex = defaultDay !== undefined ? defaultDay : sched.weekStartDay;
  const startTime = defaultHour || (String(sched.dayStartHour).padStart(2, '0') + ':00');
  const hourNum = parseInt(startTime.split(':')[0], 10);
  const endHour = String(Math.min(23, hourNum + 1)).padStart(2, '0') + ':00';

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
          ${getTimeSlotOptions(startTime)}
        </select>
      </div>
      <div>
        <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">End Time</label>
        <select class="input" id="evt-end-inp">
          ${getTimeSlotOptions(endHour)}
        </select>
      </div>
    </div>
    <div style="margin-bottom:12px;">
      <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:6px;">Recurring Days of Week</label>
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        ${getOrderedWeekDaysList().map(item => `
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
          ${getTimeSlotOptions(evt.startTime)}
        </select>
      </div>
      <div>
        <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:4px;">End Time</label>
        <select class="input" id="edit-evt-end">
          ${getTimeSlotOptions(evt.endTime)}
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
            ${getTimeSlotOptions(task.scheduledTime || '16:00')}
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
  great: { label: 'Great', labelAr: 'رائع ومتحمس', emoji: '🌟', rec: 'You are in high spirits! Capitalize on this momentum with a Focus session or learning game.', recAr: 'طاقتك ومعنوياتك مرتفعة جدًا! استغل هذا الزخم الرائع وابدأ جلسة تركيز عميق أو تحديًا تعليميًا.', preset: 'p_deep' },
  focused: { label: 'Focused', labelAr: 'مُركّز وواضح', emoji: '🎯', rec: 'Your mind is locked in. Perfect time to smash a task on your planner!', recAr: 'ذهنك حاضر ومستعد تمامًا. هذا هو الوقت المثالي لإنجاز مهمة رئيسية من جدول مهامك!', preset: 'p_pomo' },
  calm: { label: 'Calm', labelAr: 'هادئ ومطمئن', emoji: '🌿', rec: 'Steady & peaceful energy. Great time for deep reading or flashcard study.', recAr: 'طاقتك هادئة ومتزنة. توقيت ممتاز للقراءة المتأنية أو مراجعة البطاقات التعليمية.', preset: 'p_pomo' },
  low_energy: { label: 'Low Energy', labelAr: 'طاقة منخفضة', emoji: '🔋', rec: 'Be gentle with yourself. Try a 10-minute Quick Burst focus or cozy Lo-Fi soundscape.', recAr: 'كن رفيقًا بنفسك اليوم. جرّب جلسة تركيز سريعة لـ 10 دقائق فقط مع أصوات بيئية مهدئة.', preset: 'p_burst' },
  overwhelmed: { label: 'Overwhelmed', labelAr: 'مُثقَل / مشتت', emoji: '😫', rec: 'Stop and pause! Try 2 minutes of Box Breathing or the 5-4-3-2-1 Grounding exercise.', recAr: 'توقف مؤقتًا وخذ نفسًا! جرّب دقيقتين من تمرين التنفس الصندوقي أو تثبيت الحواس 5-4-3-2-1.', preset: 'p_adhd' },
  anxious: { label: 'Anxious', labelAr: 'قلق ومتوتر', emoji: '😰', rec: 'Take a deep breath. Use the Worry Dissolver below or listen to soothing Brown Noise.', recAr: 'خذ نفسًا عميقًا. استخدم مذيب القلق أدناه أو استمع إلى الضوضاء البنية المهدئة للذهن.', preset: 'p_adhd' },
  frustrated: { label: 'Frustrated', labelAr: 'محبط أو متضايق', emoji: '😤', rec: 'Take 3 deep breaths. Remember B-minus work is better than non-existent work.', recAr: 'خذ 3 أنفاس عميقة واسترخِ. تذكر دائمًا: إنجاز عمل متواضع خيرٌ ألف مرة من عمل لا يُسلّم أبدًا.', preset: 'p_burst' }
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
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  toast(isAr ? `تم تسجيل حالتك: ${mood.emoji} ${mood.labelAr || mood.label} (+10 نقاط خبرة)` : `Mood logged: ${mood.emoji} ${mood.label} (+10 XP)`, 'success');

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
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
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
      toast(isAr ? 'أتممت 4 دورات تنفس بنجاح! +15 نقطة خبرة' : '4 Breathing cycles complete! +15 XP', 'success');
    }
  }

  const circleEl = document.getElementById('guided-breath-circle');
  const timerEl = document.getElementById('breath-timer-display');
  const phaseEl = document.getElementById('breath-phase-label');
  const cycleEl = document.getElementById('breath-cycle-count');

  if (circleEl && timerEl && phaseEl) {
    timerEl.textContent = breathingState.seconds + (isAr ? ' ث' : 's');
    cycleEl.textContent = isAr ? `${breathingState.cycles} دورات مكتملة` : `${breathingState.cycles} cycles done`;

    let phaseText = isAr ? 'تنفّس بهدوء...' : 'Breathe In...';
    circleEl.className = 'guided-breath-circle ' + breathingState.phase;

    if (breathingState.phase === 'inhale') phaseText = isAr ? 'شهيق هادئ وعميق...' : 'Breathe In Slowly...';
    else if (breathingState.phase === 'hold' || breathingState.phase === 'hold2') phaseText = isAr ? 'احبس النفس باسترخاء...' : 'Hold Breath Calmly...';
    else if (breathingState.phase === 'exhale') phaseText = isAr ? 'زفير بطيء ومريح...' : 'Exhale Gently...';

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
    const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
    toast(isAr ? 'اكتمل تمرين تثبيت الحواس! ذهنك الآن حاضر وصافٍ (+20 نقطة خبرة)' : 'Grounding session complete! Feel present & clear. +20 XP', 'success');
  }
  renderWellness();
}

// Dissolve Thought / Worry Jar
function dissolveWorryThought() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const inp = document.getElementById('worry-dissolve-input');
  if (!inp) return;
  const val = inp.value.trim();
  if (!val) {
    toast(isAr ? 'اكتب ما يقلقك أو يشغل تفكيرك أولاً' : 'Write down what is troubling you', 'warn');
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
            ${isAr ? 'تلاشت الفكرة وتحررت منها تمامًا. لست أفكارك السلبية — بل أنت الوعي الهادئ الذي يراقبها.' : 'Thought released. You are not your thoughts — you are the one observing them.'}
          </div>
        `;
      }
      Store.addXP(10);
      toast(isAr ? 'تلاشى القلق وتفرغ ذهنك! +10 نقاط خبرة' : 'Worry dissolved & released! +10 XP', 'bonus');
    }, 2100);
  }
}

// ==================== COGNITIVE REFRAMING (CBT) DATA ====================
const COGNITIVE_DISTORTIONS = [
  {
    id: 'catastrophizing',
    name: 'Catastrophizing',
    nameAr: 'تضخيم الأمور وتوقع الكوارث',
    subtitle: 'Fortune Telling / Worst-Case Bias',
    subtitleAr: 'التنبؤ السلبي بالمستقبل وافتراض الأسوأ',
    icon: 'fa-meteor',
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    summary: 'Assuming the absolute worst-case scenario will definitely happen and that you will be totally unable to cope.',
    summaryAr: 'افتراض أن أسوأ سيناريو ممكن سيقع حتمًا، وأنك لن تتمكن إطلاقًا من تحمّله أو التعامل معه.',
    trapPrompt: 'If I mess this up, my entire grade and future will be completely ruined.',
    trapPromptAr: 'إذا أخطأت في هذا الاختبار، ستتدمر درجتي بالكامل ويضيع مستقبلي الدراسي.',
    counterQuestion: 'What is the most probable, realistic outcome? Even in a worst case, what practical steps would I take?',
    counterQuestionAr: 'ما هي النتيجة الأكثر واقعية واحتمالاً؟ وحتى في أسوأ سيناريو، ما هي الخطوات العملية المتاحة للتدارك؟',
    starterTemplate: 'Even though I fear [worst-case], the realistic probability is much lower, and I can handle it step-by-step by [concrete action].',
    starterTemplateAr: 'رغم أنني أخشى [أسوأ سيناريو]، إلا أن الاحتمال الواقعي أقل بكثير، ويمكنني التعامل معه خطوة بخطوة من خلال [إجراء عملي].'
  },
  {
    id: 'all-or-nothing',
    name: 'All-or-Nothing Thinking',
    nameAr: 'تفكير الكل أو لا شيء (الأبيض والأسود)',
    subtitle: 'Black-and-White / Perfectionist Split',
    subtitleAr: 'فخ الكمالية وتجاهل المنطقة الرمادية',
    icon: 'fa-circle-half-stroke',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.12)',
    summary: 'Viewing situations in polarized absolutes: either 100% flawless or a total failure. No middle ground or gray area.',
    summaryAr: 'النظر إلى المواقف كأضداد متطرفة: إما 100% مثالي أو فشل ذريع كامل. غياب لأي مساحة مرنة وسطى.',
    trapPrompt: 'If I can’t study for the full 2 hours, my whole day is wasted and there is no point.',
    trapPromptAr: 'إذا لم أتمكن من المذاكرة لساعتين كاملتين دون انقطاع، فقد ضاع يومي بالكامل ولا فائدة من البدء.',
    counterQuestion: 'What exists in the gray area between 0% and 100%? How is partial progress still valuable?',
    counterQuestionAr: 'ما الذي يوجد في المساحة الواقعية بين 0% و 100%؟ أليس أي تقدم جزئي أفضل بمراحل من الصفر؟',
    starterTemplate: 'Progress is not all-or-nothing. Completing [partial amount] is still real progress that moves me forward.',
    starterTemplateAr: 'التقدم ليس إما كل شيء أو لا شيء. إنجاز [جزء محدد] هو تقدم حقيقي يقربني من هدفي.'
  },
  {
    id: 'imposter-syndrome',
    name: 'Imposter Syndrome',
    nameAr: 'متلازمة المحتال والتشكيك بالذات',
    subtitle: 'Discounting Positive / Fear of Exposure',
    subtitleAr: 'تجاهل الإنجازات والخوف من الانكشاف',
    icon: 'fa-mask',
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.12)',
    summary: 'Attributing your achievements to luck, flukes, or mistakes, while secretly fearing you will be exposed as inadequate.',
    summaryAr: 'عزو نجاحاتك للحظ أو الصدفة وحدها، مع خوف داخلي مستمر من أن يكتشف الآخرون أنك غير كفء.',
    trapPrompt: 'I only got a good mark because the test was easy. I don’t truly belong in this class.',
    trapPromptAr: 'حصلت على درجة جيدة فقط لأن الامتحان كان سهلاً؛ أنا لا أستحق التواجد في هذا الصف المتقدم حقًا.',
    counterQuestion: 'What genuine effort, practice, knowledge, or persistence did I put in? Would I judge a friend this harshly?',
    counterQuestionAr: 'ما هو الجهد الحقيقي والممارسة والمثابرة التي بذلتها؟ هل كنت سأحكم على أعز أصدقائي بمثل هذه القسوة؟',
    starterTemplate: 'My achievements are the result of my actual effort and learning, not an accident. I belong in this space.',
    starterTemplateAr: 'نجاحاتي هي ثمرة جهدي الحقيقي ومذاكرتي وليست مجرد صدفة عابرة. أنا أستحق مكاني هنا عن جدارة.'
  },
  {
    id: 'overgeneralization',
    name: 'Overgeneralization',
    nameAr: 'التعميم المفرط (فخ دائمًا وأبدًا)',
    subtitle: 'The "Always / Never" Trap',
    subtitleAr: 'تحويل عثرة واحدة إلى قاعدة دائمة',
    icon: 'fa-infinity',
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.12)',
    summary: 'Taking a single isolated negative experience and projecting it as a permanent, inevitable rule across your entire life.',
    summaryAr: 'أخذ موقف سلبي عابر وتعميمه كقاعدة حتمية وأبدية على مسيرتك وقدراتك بأكملها.',
    trapPrompt: 'I forgot my notes today. I always mess up; I will never be an organized student.',
    trapPromptAr: 'نسيت دفاتري اليوم؛ أنا دائمًا أفسد الأمور، ولن أكون طالبًا منظمًا أبدًا.',
    counterQuestion: 'Is this truly happening "always" without exception? When has something gone well?',
    counterQuestionAr: 'هل يحدث هذا حقًا "دائمًا" بلا أي استثناء؟ متى سارت الأمور بشكل جيد ومنظم في السابق؟',
    starterTemplate: 'This is one specific setback on one day, not a permanent pattern. In the past, I have [counter-example].',
    starterTemplateAr: 'هذه عثرة محددة في يوم واحد، وليست نمطًا دائمًا لشخصيتي. في السابق تمكنت بنجاح من [مثال إيجابي سابق].'
  },
  {
    id: 'mind-reading',
    name: 'Mind Reading',
    nameAr: 'قراءة الأفكار وافتراض سوء الظن',
    subtitle: 'Jumping to Critical Conclusions',
    subtitleAr: 'القفز لاستنتاجات نقدية غير مثبتة',
    icon: 'fa-eye',
    color: '#EC4899',
    bg: 'rgba(236, 72, 153, 0.12)',
    summary: 'Assuming you know what classmates or teachers think about you, usually assuming disapproval or contempt.',
    summaryAr: 'افتراض معرفتك المسبقة بما يدور في رؤوس المعلمين أو الزملاء تجاهك، وافتراض أنهم يحكمون عليك سلبًا.',
    trapPrompt: 'The teacher answered my question abruptly. They must think I am annoying and incapable.',
    trapPromptAr: 'أجاب المعلم عن سؤالي باقتضاب وسرعة؛ لا بد أنه يراني مزعجًا وغير قادر على الفهم.',
    counterQuestion: 'What verifiable facts do I have? Could other explanations (teacher fatigue, busy schedule) explain their tone?',
    counterQuestionAr: 'ما هي الأدلة المادية الملموسة لدي؟ ألا يمكن أن يكون انشغال المعلم أو تعبه هو السبب الحقيقي لنبرته؟',
    starterTemplate: 'I cannot read minds. Their reaction could easily be due to [alternative reason], and I have no proof they think poorly of me.',
    starterTemplateAr: 'أنا لا أقرأ الغيب ولا عقول الناس. قد يكون تصرفهم ناتجًا عن [سبب بديل محتمل]، وليس لدي أي دليل على أنهم يظنون بي سوءًا.'
  },
  {
    id: 'emotional-reasoning',
    name: 'Emotional Reasoning',
    nameAr: 'الاستدلال العاطفي (الخلط بين الشعور والحقيقة)',
    subtitle: 'Feelings Mistaken for Facts',
    subtitleAr: 'اعتبار الإحساس حقيقة واقعية لا جدال فيها',
    icon: 'fa-heart-crack',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.12)',
    summary: 'Believing that because you feel intense anxiety, dread, or inadequacy, the objective reality must match that feeling.',
    summaryAr: 'الاعتقاد بأنه لمجرد أنك تشعر بالتوتر أو الارتباك أو العجز، فإن الواقع الموضوعي حتمًا يطابق هذا الشعور.',
    trapPrompt: 'I feel completely overwhelmed and stupid, which proves that I am unable to learn this subject.',
    trapPromptAr: 'أشعر بضغط هائل وعجز؛ وهذا يثبت بالدليل القاطع أنني غير مؤهل لفهم هذه المادة.',
    counterQuestion: 'Feelings are biological sensations, not court-admissible facts. What does the objective evidence say?',
    counterQuestionAr: 'المشاعر مجرد إشارات فسيولوجية مؤقتة وليست حقائق علمية. ماذا تقول الأدلة الموضوعية الحقيقية؟',
    starterTemplate: 'I am experiencing intense feelings of [emotion], but feelings are not facts. The objective reality is [fact].',
    starterTemplateAr: 'أنا أمر الآن بمشاعر قوية من [الشعور]، لكن المشاعر ليست حقائق قطعية. الحقيقة الموضوعية هي [الحقيقة].'
  },
  {
    id: 'should-statements',
    name: '"Should" / "Must" Tyranny',
    nameAr: 'استبداد "يجب" و "يلزم" (جلد الذات)',
    subtitle: 'Rigid Guilt Demands',
    subtitleAr: 'مطالب صارمة تغذي الذنب والإرهاق',
    icon: 'fa-scale-unbalanced',
    color: '#6366F1',
    bg: 'rgba(99, 102, 241, 0.12)',
    summary: 'Imposing rigid, unforgiving moralistic rules on yourself or others, leading to chronic guilt, shame, and burnout.',
    summaryAr: 'فرض قواعد حديدية قاسية لا ترحم على نفسك، مما يورث شعورًا مستمرًا بالذنب والخجل والإنهاك العصبي.',
    trapPrompt: 'I should be able to focus for 4 hours straight without getting distracted like normal people.',
    trapPromptAr: 'يجب أن أكون قادرًا على التركيز لـ 4 ساعات متواصلة دون تشتت كباقي الطلاب الطبيعيين.',
    counterQuestion: 'Says who? What happens if I replace "I should" with "I prefer" or "It is normal for humans to need breaks"?',
    counterQuestionAr: 'من قرر ذلك؟ ماذا يحدث إذا استبدلت "يجب عليّ" بـ "أفضّل" أو "من الطبيعي لبني البشر أخذ فترات استراحة"؟',
    starterTemplate: 'It is natural that my brain needs breaks. Instead of demanding perfection, I choose to work with my needs.',
    starterTemplateAr: 'من الطبيعي تمامًا أن يحتاج عقلي لفواصل راحة. بدلاً من مطالبة نفسي بالكمال الخيالي، أختار التعامل بحكمة مع طاقتي.'
  },
  {
    id: 'labeling',
    name: 'Labeling & Personalization',
    nameAr: 'إلصاق التسميات وتشويه الهوية',
    subtitle: 'Error Turned Into Identity',
    subtitleAr: 'تحويل الخطأ العابر إلى وصمة شخصية',
    icon: 'fa-tag',
    color: '#14B8A6',
    bg: 'rgba(20, 184, 166, 0.12)',
    summary: 'Taking a specific mistake and turning it into a total character verdict ("I am a failure" instead of "I made an error").',
    summaryAr: 'أخذ خطأ إجرائي محدد وتحويله إلى حُكم شامل على جوهرك ("أنا فاشل" بدلاً من "لقد ارتكبت خطأ يمكن إصلاحه").',
    trapPrompt: 'I made a mistake on that math calculation. I am just hopeless at math.',
    trapPromptAr: 'أخطأت في تلك العملية الحسابية؛ أنا فاشل ولا أمل مني في مادة الرياضيات.',
    counterQuestion: 'Am I a mistake, or a person who made a mistake? What is the distinction between my behavior and my worth?',
    counterQuestionAr: 'هل أنا نفسي "خطأ"، أم إنسان وقع في خطأ محدد؟ ما هو الفارق الجوهري بين سلوكي وقيمتي كإنسان؟',
    starterTemplate: 'A mistake is something I did, not who I am. Making mistakes is an essential part of learning.',
    starterTemplateAr: 'الخطأ هو تصرف قمت به، وليس هويتي. ارتكاب الأخطاء هو الخطوة الأولى والأساسية في رحلة التعلم الحقيقي.'
  }
];

const CBT_PRESETS = [
  {
    id: 'exam-panic',
    name: 'Pre-Exam Catastrophizing',
    nameAr: 'توقع الكوارث قبل الامتحان',
    icon: 'fa-graduation-cap',
    trigger: 'Upcoming midterm in 2 days with 4 chapters left to review',
    triggerAr: 'اختبار نصفي بعد يومين وما زالت هناك 4 فصول للمراجعة',
    stumble: 'I haven’t memorized all the formulas yet. I am going to bomb this exam, ruin my GPA, and disappoint everyone.',
    stumbleAr: 'لم أحفظ جميع القوانين بعد. سأرسب في الامتحان وأفسد معدلي وأخيّب آمال الجميع.',
    belief: 90,
    emotion: 'Panic & Overwhelm',
    emotionAr: 'هلع وضغط شديد',
    distortions: ['catastrophizing', 'all-or-nothing'],
    evidenceFor: 'I have 4 chapters left and feel stressed when looking at the formula sheet.',
    evidenceForAr: 'متبقي 4 فصول وأشعر بالتوتر عند النظر إلى قائمة القوانين.',
    evidenceAgainst: 'I still have 48 hours. I attended the lectures and have homework solutions. Even if I get a B or C, one exam does not ruin my life or GPA.',
    evidenceAgainstAr: 'ما زال لدي 48 ساعة كاملة. حضرت المحاضرات ولدي حلول الواجبات. وحتى لو حصلت على درجة متوسطة، فاختبار واحد لا ينهي مستقبلي أو معدلي.',
    friendAdvice: 'You don’t need 100% to pass and do well. Pick the high-yield topics, do practice problems, and get good sleep.',
    friendAdviceAr: 'لست بحاجة لعلامة 100% لتنجح وتتفوق. ركز على الموضوعات الأساسية المهمة، وحل بعض المسائل التدريبية، ونم جيدًا الليلة.',
    reframe: 'I don’t need to know every detail to succeed. Prioritizing the top 3 high-yield concepts today gives me plenty of points to pass comfortably.',
    reframeAr: 'لست بحاجة لمعرفة كل تفصيلة صغيرة لأنجح. التركيز اليوم على أهم 3 مفاهيم أساسية سيعطيني درجات كافية للنجاح والارتياح.',
    finalBelief: 25,
    microAction: 'Pick chapter 3 and do 5 practice problems with a 15-minute timer',
    microActionAr: 'اختيار الفصل الثالث وحل 5 مسائل تدريبية بمؤقت 15 دقيقة'
  },
  {
    id: 'broken-streak',
    name: 'Streak Break All-or-Nothing',
    nameAr: 'انقطاع السلسلة واليأس الكلي',
    icon: 'fa-fire-flame-curved',
    trigger: 'Missed yesterday’s scheduled study block due to family dinner',
    triggerAr: 'فاتتني فترة المذاكرة المحددة بالأمس بسبب عشاء عائلي',
    stumble: 'I ruined my 6-day study streak. My momentum is gone, so this whole week is wasted and I might as well give up.',
    stumbleAr: 'أفسدت سلسلة المذاكرة لـ 6 أيام متتالية. ضاع كل حماسي، وذهب هذا الأسبوع سدى، ومن الأفضل أن أستسلم.',
    belief: 85,
    emotion: 'Frustrated & Defeated',
    emotionAr: 'إحباط وشعور بالهزيمة',
    distortions: ['all-or-nothing', 'overgeneralization'],
    evidenceFor: 'I did not study yesterday.',
    evidenceForAr: 'لم أذاكر بالأمس.',
    evidenceAgainst: 'I studied 6 days in a row! That knowledge didn’t vanish overnight. A streak is just an arbitrary counter, not my brain’s actual learning.',
    evidenceAgainstAr: 'لقد ذاكرت 6 أيام متتالية سابقة! تلك المعرفة لم تتبخر بين عشية وضحاها. السلسلة مجرد رقم رمزي وليست مقياسًا حقيقيًا لما تعلمه عقلي.',
    friendAdvice: 'One rest day doesn’t erase 6 days of hard work. The strongest people take breaks and get right back on track.',
    friendAdviceAr: 'يوم استراحة واحد لا يلغي 6 أيام من الجهد والاجتهاد. حتى الأبطال يأخذون فترات راحة ويعودون للمسار أقوى.',
    reframe: 'One missed day is just life happening, not a ruined week. My 6 days of learning are banked, and starting today proves my resilience.',
    reframeAr: 'فوات يوم واحد هو مجرد ظرف طبيعي في الحياة وليس ضياعًا للأسبوع. معرفتي محفوظة، والبدء مجددًا اليوم يثبت مرونتي وقوتي.',
    finalBelief: 15,
    microAction: 'Do a quick 10-minute flashcard review right now to reset momentum',
    microActionAr: 'إجراء مراجعة سريعة لـ 10 دقائق على البطاقات التعليمية الآن لاستعادة الحماس'
  },
  {
    id: 'imposter-syndrome-doubt',
    name: 'Advanced Class Imposter Doubt',
    nameAr: 'شكوك متلازمة المحتال في الفصول المتقدمة',
    icon: 'fa-brain',
    trigger: 'Sitting in AP/Advanced Physics while classmates seem to answer instantly',
    triggerAr: 'الجلوس في فصل الفيزياء المتقدمة بينما يبدو الزملاء يجيبون فورًا',
    stumble: 'Everyone else here gets it naturally. I was only placed here by mistake and soon the teacher will realize I don’t belong.',
    stumbleAr: 'الجميع هنا يفهمون بالفطرة ودون جهد. تم قبولي هنا بالخطأ وسيكتشف المعلم قريبًا أنني لا أنتمي لهذا المكان.',
    belief: 80,
    emotion: 'Inadequate & Isolated',
    emotionAr: 'شعور بعدم الكفاءة والعزلة',
    distortions: ['imposter-syndrome', 'mind-reading'],
    evidenceFor: 'Two classmates raised their hands before I finished reading the problem.',
    evidenceForAr: 'رفع زميلان يديهما للإجابة قبل أن أنهي حتى قراءة المسألة.',
    evidenceAgainst: 'I passed the prerequisite with high marks. Fast hand-raising isn’t deep understanding. Most people are also too shy to admit when they’re confused.',
    evidenceAgainstAr: 'اجتزت المتطلبات السابقة بدرجات عالية جدًا. سرعة رفع اليد ليست مقياسًا للعمق أو الفهم. أغلب الطلاب يخجلون من الاعتراف بحيرتهم أيضًا.',
    friendAdvice: 'You worked hard to earn your seat in this class. Asking questions is a sign of bravery and curiosity, not stupidity.',
    friendAdviceAr: 'لقد اجتهدت ونلت مقعدك في هذا الفصل بجدارة. طرح الأسئلة دليل شجاعة ورغبة بالتعلم وليس دليلاً على الضعف.',
    reframe: 'Classmates answering quickly doesn’t mean I am behind. My brain processes methodically, and I earned my spot in this room through demonstrated ability.',
    reframeAr: 'إجابة زملائي بسرعة لا تعني أنني متأخر. عقلي يعالج المعلومات بتأنٍ ومنهجية، وقد اكتسبت مقعدي هنا بناءً على قدراتي الحقيقية.',
    finalBelief: 20,
    microAction: 'Write down one question to ask the teacher at the end of class',
    microActionAr: 'كتابة سؤال محدد لطرحه على المعلم في نهاية الحصة'
  }
];

let cbtSubTab = 'worksheet';
let cbtWizardStep = 1;
let cbtJournalFilter = 'all';
let cbtJournalSearch = '';

let cbtDraft = {
  trigger: '',
  stumble: '',
  initialBelief: 80,
  emotion: 'Anxious & Overwhelmed',
  distortions: ['catastrophizing'],
  evidenceFor: '',
  evidenceAgainst: '',
  friendAdvice: '',
  stepReframe: '',
  finalBelief: 25,
  microAction: ''
};

// ADHD Reframes Data
const ADHD_REFRAMES = [
  {
    title: 'Task Paralysis',
    titleAr: 'شلل المهام والتسويف القهري',
    problem: 'I have so much to do, I am overwhelmed and doing nothing at all.',
    problemAr: 'لدي مهام كثيرة جدًا لدرجة أنني أشعر بالعجز التام ولا أفعل أي شيء على الإطلاق.',
    reframe: 'You do not have to finish the whole project today. Lower the bar completely: just do 2 minutes or open the document. Starting micro builds momentum.',
    reframeAr: 'لست مجبرًا على إنهاء المشروع بأكمله اليوم. اخفض سقف التوقعات لأقصى حد: ابدأ بدقيقتين فقط أو مجرد فتح الملف. البدايات المجهرية تبني الزخم.',
    icon: 'fa-cubes-stacked'
  },
  {
    title: 'Perfectionism Trap',
    titleAr: 'فخ الكمال والمثالية',
    problem: 'If I cannot do this assignment perfectly, it is not worth doing.',
    problemAr: 'إذا لم أتمكن من أداء هذا الواجب على نحو مثالي وخالٍ من أي نقص، فلا فائدة من البدء به.',
    reframe: 'B-minus work submitted on time beats an unsubmitted masterwork every time. Done is infinite times better than perfect.',
    reframeAr: 'واجب مكتمل بجودة مقبولة يُسلَّم في موعده خيرٌ بمئات المرات من عمل مثالي متخيَّل لا يُسلَّم أبدًا. الإنجاز أهم من الكمال.',
    icon: 'fa-bullseye'
  },
  {
    title: 'Distraction Guilt',
    titleAr: 'جلد الذات بعد التشتت',
    problem: 'I lost 30 minutes on my phone. I ruined my entire focus routine.',
    problemAr: 'أمضيت 30 دقيقة أتصفح الهاتف وأضعت وقتي. أفسدت روتين مذاكرتي بالكامل.',
    reframe: 'A distraction is a temporary detour, not a crash. Take a deep breath, reset right now, and give yourself credit for returning.',
    reframeAr: 'التشتت هو مجرد منعطف مؤقت في الطريق وليس حادث تصادم مدمّر. خذ نفسًا عميقًا، وابدأ مجددًا الآن، وقدّر نفسك لأنك عدت.',
    icon: 'fa-rotate-left'
  },
  {
    title: 'Time Blindness Panic',
    titleAr: 'هلع عمى الوقت والشعور بالتأخر',
    problem: 'It feels like time is slipping away and I am falling behind.',
    problemAr: 'أشعر أن الوقت يفلت من بين يدي وأنني متأخر دائمًا عن الباقين.',
    reframe: 'Time is linear. Set a 10-minute timer for one single micro-task. You only need to focus on what is in front of you right now.',
    reframeAr: 'الوقت يمشي خطوة بخطوة. اضبط مؤقتًا لـ 10 دقائق لمهمة واحدة صغيرة فقط. ركز فقط على ما هو أمام عينيك في هذه اللحظة.',
    icon: 'fa-hourglass-half'
  }
];

function getRandomAffirmation() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const affirmationsEn = [
    "My worth is not measured by my productivity.",
    "Small steps taken consistently create incredible transformation.",
    "It is completely okay to pause, breathe, and restart at any point.",
    "I am capable, resilient, and learning how my brain works best.",
    "Imperfection is human. Progress is my only goal."
  ];
  const affirmationsAr = [
    "قيمتي الحقيقية لا تُقاس فقط بإنتاجيتي؛ أنا أستحق التقدير في كل حال.",
    "الخطوات الصغيرة المستمرة تصنع فارقًا هائلاً وإنجازًا عظيمًا.",
    "من الطبيعي تمامًا أن تتوقف للحظات، تتنفس بعمق، ثم تبدأ من جديد دون لوم.",
    "أنا قادر، مرن، وأتعلم باستمرار كيف يعمل عقلي بأفضل صورة ممكنة.",
    "الكمال مجرد وهم؛ والتقدم التدريجي هو هدفي الحقيقي الوحيد."
  ];
  const pool = isAr ? affirmationsAr : affirmationsEn;
  return pool[Math.floor(Math.random() * pool.length)];
}

function renderWellness() {
  updateUserPanel();
  const el = document.getElementById('view-wellness');
  if (!el) return;

  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const logs = Store.get('moodLogs') || [];
  const recentLog = logs[0];
  const activeMoodData = selectedMood ? MOOD_DATA[selectedMood] : MOOD_DATA.calm;

  el.innerHTML = `
    <div style="max-width:960px; margin:0 auto;">
      <div style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:16px; margin-bottom:24px;">
        <div>
          <h1 style="font-size:26px; font-weight:700; margin-bottom:4px;">${isAr ? 'مركز الراحة والمزاج والصحة النفسية' : 'Mind & Emotional Wellness Hub'}</h1>
          <p style="color:var(--text2); font-size:15px;">${isAr ? 'أدوات داعمة ومصممة خصيصًا لصفاء الذهن، تنظيم المشاعر، وتخفيف تشتت ADHD للطلاب.' : 'Compassionate mental health tools designed specifically for student focus & ADHD clarity.'}</p>
        </div>
        <button class="btn btn-sm btn-ghost" onclick="toast(getRandomAffirmation(), 'info')" style="border:1px solid var(--border); color:var(--teal);">
          <i class="fas fa-sparkles"></i> ${isAr ? 'توكيدة اليوم' : 'Daily Affirmation'}
        </button>
      </div>

      <!-- Tab Navigation -->
      <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:8px; margin-bottom:24px;" class="no-scrollbar">
        <button class="grade-pill ${wellnessTab==='checkin'?'selected':''}" onclick="wellnessTab='checkin'; SFX.click(); renderWellness();">
          <i class="fas fa-face-smile"></i> ${isAr ? 'تسجيل المزاج' : 'Mood Check-In'}
        </button>
        <button class="grade-pill ${wellnessTab==='firstaid'?'selected':''}" style="background:${wellnessTab==='firstaid'?'var(--red)':'rgba(239,68,68,0.12)'}; color:${wellnessTab==='firstaid'?'#fff':'var(--red)'}; font-weight:700;" onclick="wellnessTab='firstaid'; SFX.click(); renderWellness();">
          <i class="fas fa-kit-medical"></i> ${isAr ? 'إسعاف القلق SOS' : 'Panic / Anxiety SOS'}
        </button>
        <button class="grade-pill ${wellnessTab==='journal'?'selected':''}" onclick="wellnessTab='journal'; SFX.click(); renderWellness();">
          <i class="fas fa-book-heart"></i> ${isAr ? 'دفتر الإنجازات اليومية' : 'Small Wins Journal'}
        </button>
        <button class="grade-pill ${wellnessTab==='bodyscan'?'selected':''}" onclick="wellnessTab='bodyscan'; SFX.click(); renderWellness();">
          <i class="fas fa-spa"></i> ${isAr ? 'فحص الجسد والاسترخاء' : 'Body Scan & PMR'}
        </button>
        <button class="grade-pill ${wellnessTab==='affirmations'?'selected':''}" onclick="wellnessTab='affirmations'; SFX.click(); renderWellness();">
          <i class="fas fa-quote-left"></i> ${isAr ? 'بطاقات الحديث الذاتي' : 'Self-Talk Cards'}
        </button>
        <button class="grade-pill ${wellnessTab==='breathing'?'selected':''}" onclick="wellnessTab='breathing'; SFX.click(); renderWellness();">
          <i class="fas fa-wind"></i> ${isAr ? 'التنفس الموجّه' : 'Guided Breathing'}
        </button>
        <button class="grade-pill ${wellnessTab==='grounding'?'selected':''}" onclick="wellnessTab='grounding'; SFX.click(); renderWellness();">
          <i class="fas fa-anchor"></i> ${isAr ? 'تثبيت الحواس 5-4-3-2-1' : '5-4-3-2-1 Grounding'}
        </button>
        <button class="grade-pill ${wellnessTab==='dissolver'?'selected':''}" onclick="wellnessTab='dissolver'; SFX.click(); renderWellness();">
          <i class="fas fa-cloud-moon"></i> ${isAr ? 'مذيب القلق والهموم' : 'Worry Dissolver'}
        </button>
        <button class="grade-pill ${wellnessTab==='reframes'?'selected':''}" onclick="wellnessTab='reframes'; SFX.click(); renderWellness();">
          <i class="fas fa-brain"></i> ${isAr ? 'دفتر إعادة الصياغة (CBT)' : 'CBT Reframing Journal'}
        </button>
        <button class="grade-pill ${wellnessTab==='analytics'?'selected':''}" onclick="wellnessTab='analytics'; SFX.click(); renderWellness();">
          <i class="fas fa-chart-line"></i> ${isAr ? 'رؤى وتحليلات المزاج' : 'Mood Insights'}
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
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  return `
    <div class="card card-glow" style="border-left: 5px solid var(--red); padding:28px;">
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:48px; height:48px; border-radius:12px; background:rgba(239,68,68,0.15); display:flex; align-items:center; justify-content:center;">
            <i class="fas fa-heart-pulse" style="color:var(--red); font-size:24px;"></i>
          </div>
          <div>
            <h3 style="font-size:20px; font-weight:800; color:var(--text);">${isAr ? 'الإسعاف السريع لنوبات الهلع والقلق الحاد' : 'Panic & Acute Anxiety Rapid First-Aid'}</h3>
            <p style="font-size:13px; color:var(--text2);">${isAr ? 'خطة فورية من 4 خطوات لإعادة ضبط الجهاز العصبي عند تسارع ضربات القلب أو الشعور بالاختناق والضغط.' : 'Immediate 4-step physiological reset for intense anxiety, racing heart, or overwhelm.'}</p>
          </div>
        </div>
        <button class="btn btn-sm btn-teal" onclick="playSoundscape('brown'); toast('${isAr ? 'جاري تشغيل الضوضاء البنية المهدئة للذهن...' : 'Playing calming Brown Noise soundscape...'}', 'info');">
          <i class="fas fa-headphones"></i> ${isAr ? 'تشغيل الضوضاء البنية المهدئة' : 'Play Calming Brown Noise'}
        </button>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px; margin-top:20px;">
        <div style="background:var(--bg); padding:18px; border-radius:12px; border:1px solid var(--border);">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; font-weight:800; color:var(--red);">
            <span style="background:var(--red); color:#fff; width:22px; height:22px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:12px;">1</span>
            ${isAr ? 'الشهيق المزدوج الفسيولوجي' : 'Physiological Double-Inhale'}
          </div>
          <p style="font-size:13px; color:var(--text2); margin-bottom:12px; line-height:1.5;">
            ${isAr ? 'خذ <strong>شهيقين سريعين متتاليين</strong> من الأنف، متبوعين بزفير طويل وبطيء من الفم. تكرار هذا 3 مرات يفتح الحويصلات الهوائية ويخفض هرمون الأدرينالين فورًا.' : 'Take <strong>2 quick inhales</strong> through your nose, then 1 long slow exhale through your mouth. Doing this 3 times pops collapsed lung alveoli and rapidly drops adrenaline.'}
          </p>
          <button class="btn btn-sm btn-secondary" style="width:100%; justify-content:center;" onclick="startBreathing('slow')">
            <i class="fas fa-wind"></i> ${isAr ? 'بدء تمرين التنفس المهدئ' : 'Start Guided Reset Breath'}
          </button>
        </div>

        <div style="background:var(--bg); padding:18px; border-radius:12px; border:1px solid var(--border);">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; font-weight:800; color:var(--blue);">
            <span style="background:var(--blue); color:#fff; width:22px; height:22px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:12px;">2</span>
            ${isAr ? 'صدمة الماء البارد للوجه' : 'Cold Temperature Shock'}
          </div>
          <p style="font-size:13px; color:var(--text2); margin-bottom:12px; line-height:1.5;">
            ${isAr ? 'اغسل وجهك بماء مثلج أو ضع زجاجة ماء باردة على معصمك. هذا يُحفز رد فعل الغطس الطبيعي ويبطئ نبضات القلب المتسارعة.' : 'Splash ice cold water on your face or press a cold bottle / ice cube against your wrists. Triggers the <em>Mammalian Dive Reflex</em>, dropping heart rate.'}
          </p>
          <div style="font-size:12px; color:var(--teal); font-weight:700;">
            <i class="fas fa-temperature-arrow-down"></i> ${isAr ? 'أسرع قاطع مادي لنوبات التوتر.' : 'Quickest physical circuit breaker.'}
          </div>
        </div>

        <div style="background:var(--bg); padding:18px; border-radius:12px; border:1px solid var(--border);">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; font-weight:800; color:var(--purple);">
            <span style="background:var(--purple); color:#fff; width:22px; height:22px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:12px;">3</span>
            ${isAr ? 'مرساة الأمان الحقيقية' : 'Safety Anchor Truth'}
          </div>
          <p style="font-size:13px; color:var(--text2); margin-bottom:12px; line-height:1.5;">
            ${isAr ? 'ردد بصوت واضح: <em>"جسدي يفرز الأدرينالين الآن، لكني في أمان تام هنا. القلق يبلغ ذروته ثم يتلاشى خلال دقائق معدودة."</em>' : 'Say aloud: <em>"My body is feeling adrenaline, but I am safe right now. Anxiety always peaks and passes within minutes."</em>'}
          </p>
          <button class="btn btn-sm btn-ghost" style="width:100%; justify-content:center; border:1px solid var(--border);" onclick="createNewStickyNote('${isAr ? '🚨 أنا في مكان آمن الآن. هذا الشعور مؤقت وسيزول قريبًا.' : '🚨 I am in a safe space right now. This feeling will pass soon.'}')">
            <i class="fas fa-thumbtack"></i> ${isAr ? 'تثبيت ملحوظة الأمان على الشاشة' : 'Stick Anchor Note on Screen'}
          </button>
        </div>

        <div style="background:var(--bg); padding:18px; border-radius:12px; border:1px solid var(--border);">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; font-weight:800; color:var(--green);">
            <span style="background:var(--green); color:#fff; width:22px; height:22px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:12px;">4</span>
            ${isAr ? 'التأريض وتفريغ توتر الجسد' : 'Grounding & Body Unplug'}
          </div>
          <p style="font-size:13px; color:var(--text2); margin-bottom:12px; line-height:1.5;">
            ${isAr ? 'أرخِ فكك، أنزل كتفيك المشدودين، وضع قدميك منبسطتين على الأرض. لست مطالبًا بحل أي مشكلة في هذه الدقيقة بالذات.' : 'Unclench jaw, drop shoulders down, press feet flat on the floor. You do not need to solve anything in this exact minute.'}
          </p>
          <button class="btn btn-sm btn-teal" style="width:100%; justify-content:center;" onclick="wellnessTab='grounding'; renderWellness();">
            <i class="fas fa-anchor"></i> ${isAr ? 'الانتقال لتمرين الحواس 5-4-3-2-1' : 'Go to 5-4-3-2-1 Grounding'}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderWellnessJournalSection() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const journals = Store.get('journalLogs') || [];

  return `
    <div class="card card-glow" style="padding:28px;">
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
        <div>
          <h3 style="font-size:20px; font-weight:800; margin-bottom:4px; display:flex; align-items:center; gap:8px;">
            <i class="fas fa-book-heart" style="color:var(--teal);"></i> ${isAr ? 'دفتر الإنجازات اليومية وملاحظة النعم' : 'Small Wins & Gratitude Journal'}
          </h3>
          <p style="font-size:14px; color:var(--text2);">
            ${isAr ? 'تدريب عقلك على ملاحظة الإنجازات الصغيرة يبني مناعة عاطفية قوية ويحميك من الاحتراق النفسي.' : 'Training your brain to notice micro-wins builds emotional resilience and combats study burnout.'}
          </p>
        </div>
        <span class="tag" style="background:var(--teal-g); color:var(--teal); font-weight:700; font-size:13px;">
          <i class="fas fa-fire"></i> ${isAr ? `${journals.length} تدوينات مسجلة` : `${journals.length} Entries Saved`}
        </span>
      </div>

      <div style="background:var(--bg); padding:20px; border-radius:14px; border:1px solid var(--border); margin-bottom:24px;">
        <h4 style="font-size:15px; font-weight:700; margin-bottom:12px;">${isAr ? 'ما هي 3 إنجازات صغيرة أو أشياء أنت ممتن لحدوثها اليوم؟' : 'What are 3 small things that went well or you appreciate today?'}</h4>
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">
          <input class="input" id="journal-win-1" placeholder="${isAr ? '1. مثل: بدأت واجب الرياضيات مبكرًا / شربت كوب ماء منعش...' : '1. E.g., Started my math homework early / Drank a glass of water...'}" style="font-size:14px;">
          <input class="input" id="journal-win-2" placeholder="${isAr ? '2. مثل: مشيت 10 دقائق في الهواء الطلق / ساعدت زميلي...' : '2. E.g., Took a 10-minute walk outside / Helped a friend...'}" style="font-size:14px;">
          <input class="input" id="journal-win-3" placeholder="${isAr ? '3. مثل: فخور بأنني واصلت المحاولة رغم تعبي...' : '3. E.g., Proud of showing up even when tired...'}" style="font-size:14px;">
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <select class="input" id="journal-category" style="width:auto; font-size:13px;">
            <option value="Study & Focus">${isAr ? '📚 المذاكرة والتركيز' : '📚 Study & Focus'}</option>
            <option value="Health & Energy">${isAr ? '🌿 الصحة والنشاط' : '🌿 Health & Energy'}</option>
            <option value="Personal Growth">${isAr ? '🌱 التطور الشخصي' : '🌱 Personal Growth'}</option>
            <option value="Mindset & Peace">${isAr ? '💖 راحة البال والسكينة' : '💖 Mindset & Peace'}</option>
          </select>
          <button class="btn btn-teal" onclick="saveJournalEntry()">
            <i class="fas fa-bookmark"></i> ${isAr ? 'حفظ إنجازات اليوم (+15 نقطة خبرة)' : 'Save Daily Wins (+15 XP)'}
          </button>
        </div>
      </div>

      <div>
        <h4 style="font-size:16px; font-weight:700; margin-bottom:12px;">${isAr ? 'سجل إنجازاتك ويومياتك السابقة' : 'Your Journal Log History'}</h4>
        ${journals.length === 0 ? `
          <div style="text-align:center; padding:24px; color:var(--text2); font-size:14px;">
            ${isAr ? 'لا توجد تدوينات بعد! اكتب 3 إنجازات صغيرة بالأعلى لبدء سلسلتك اليومية.' : 'No journal entries yet! Write down 3 small wins above to start your streak.'}
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${journals.slice().reverse().map((j) => {
              const dateStr = new Date(j.date).toLocaleDateString(isAr ? 'ar-EG' : undefined, { month: 'short', day: 'numeric', year: 'numeric' });
              return `
                <div style="background:var(--bg); padding:16px; border-radius:12px; border-left:4px solid var(--teal); display:flex; flex-direction:column; gap:8px;">
                  <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-weight:800; font-size:13px; color:var(--teal);">${j.category || (isAr ? 'إنجازات صغيرة' : 'Small Wins')}</span>
                    <span style="font-size:12px; color:var(--text2);">${dateStr}</span>
                  </div>
                  <ul style="margin:0; padding-left:${isAr ? '0' : '18px'}; padding-right:${isAr ? '18px' : '0'}; font-size:13px; color:var(--text); line-height:1.6;">
                    ${j.wins.map(w => `<li>${escHtml(w)}</li>`).join('')}
                  </ul>
                  <div style="display:flex; justify-content:flex-end;">
                    <button class="btn btn-sm btn-ghost" style="font-size:11px;" onclick="createNewStickyNote('${isAr ? '🌟 إنجازات صغيرة' : '🌟 Small Win'} (${dateStr}):\\n• ${j.wins.join('\\n• ')}')">
                      <i class="fas fa-thumbtack"></i> ${isAr ? 'تثبيت كملحوظة لاصقة' : 'Pin to Sticky Note'}
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
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const w1 = document.getElementById('journal-win-1').value.trim();
  const w2 = document.getElementById('journal-win-2').value.trim();
  const w3 = document.getElementById('journal-win-3').value.trim();
  const category = document.getElementById('journal-category').value;

  const wins = [w1, w2, w3].filter(w => w.length > 0);
  if (wins.length === 0) {
    toast(isAr ? 'يرجى كتابة إنجاز واحد على الأقل أو لحظة امتنان!' : 'Please enter at least 1 win or moment of gratitude!', 'warn');
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
  toast(isAr ? 'تم حفظ التدوينة بنجاح! نلت +15 نقطة خبرة 🎉' : 'Journal entry saved! +15 XP earned 🎉', 'success');
  renderWellness();
}

let pmrStep = 0;
let pmrIsTense = true;
let pmrSecondsLeft = 5;

const PMR_STEPS = [
  { name: 'Shoulders & Neck', nameAr: 'الأكتاف والرقبة', instruction: 'Shrug your shoulders up high towards your ears and hold tight!', instructionAr: 'ارفع كتفيك عاليًا باتجاه أذنيك واضغط عليهما بقوة وثبّت الشد!', icon: 'fa-user-nurse' },
  { name: 'Hands & Arms', nameAr: 'اليدان والذراعان', instruction: 'Clench both fists tightly as if squeezing lemons!', instructionAr: 'اقبض كفيك بإحكام شديد كأنك تعصر ليمونة بكل قوتك!', icon: 'fa-hand-back-fist' },
  { name: 'Face & Jaw', nameAr: 'الوجه والفك', instruction: 'Scrunch up your facial muscles, squeeze eyes shut and clench jaw gently.', instructionAr: 'قطّب عضلات وجهك، وأغمض عينيك بقوة، واضغط على فكك برفق.', icon: 'fa-face-grimace' },
  { name: 'Stomach & Core', nameAr: 'البطن والجذع', instruction: 'Tighten your abdominal muscles as if bracing for impact.', instructionAr: 'شد عضلات بطنك بقوة كأنك تستعد لتلقي ضربة خفيفة.', icon: 'fa-child-reaching' },
  { name: 'Legs & Feet', nameAr: 'الساقان والقدمان', instruction: 'Curl your toes downward and tense your calf muscles tight.', instructionAr: 'اثنِ أصابع قدميك للأسفل وشد عضلات ساقيك بإحكام.', icon: 'fa-shoe-prints' }
];

function renderWellnessBodyScanSection() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const step = PMR_STEPS[pmrStep] || PMR_STEPS[0];

  return `
    <div class="card card-glow" style="text-align:center; padding:32px 24px;">
      <div style="display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:12px;">
        <i class="fas fa-spa" style="font-size:28px; color:var(--teal);"></i>
        <h3 style="font-size:22px; font-weight:800;">${isAr ? 'استرخاء العضلات التدريجي (PMR)' : 'Progressive Muscle Relaxation (PMR)'}</h3>
      </div>
      <p style="color:var(--text2); font-size:14px; max-width:520px; margin:0 auto 24px;">
        ${isAr ? 'التوتر الجسدي يغذي القلق الذهني مباشرة. شد مجموعة عضلية لـ 5 ثوانٍ ثم إرخاؤها فجأة يدرب جسدك على تفريغ الإجهاد المتراكم من الجلوس.' : 'Physical tension directly feeds mental anxiety. Tensing each muscle group for 5s then dropping it instantly trains your body to release stress held while sitting.'}
      </p>

      <div style="display:flex; justify-content:center; gap:8px; margin-bottom:24px; flex-wrap:wrap;">
        ${PMR_STEPS.map((s, idx) => `
          <div class="grade-pill ${idx === pmrStep ? 'selected' : ''}" style="cursor:default; font-size:12px;">
            ${isAr ? `الخطوة ${idx + 1}: ${s.nameAr || s.name}` : `Step ${idx + 1}: ${s.name}`}
          </div>
        `).join('')}
      </div>

      <div style="background:var(--bg); max-width:480px; margin:0 auto 24px; padding:28px; border-radius:16px; border:2px solid ${pmrIsTense ? 'var(--accent)' : 'var(--teal)'}; transition:all 0.3s ease;">
        <div style="width:64px; height:64px; border-radius:50%; background:${pmrIsTense ? 'rgba(255,140,66,0.15)' : 'var(--teal-g)'}; display:flex; align-items:center; justify-content:center; margin:0 auto 16px;">
          <i class="fas ${step.icon}" style="font-size:28px; color:${pmrIsTense ? 'var(--accent)' : 'var(--teal)'};"></i>
        </div>
        <h4 style="font-size:18px; font-weight:800; margin-bottom:8px; color:${pmrIsTense ? 'var(--accent)' : 'var(--teal)'};">
          ${pmrIsTense ? (isAr ? '1. شد العضلات الآن بقوة' : '1. TENSE MUSCLES NOW') : (isAr ? '2. أرخِ العضلات تمامًا واسترخِ' : '2. RELEASE & LET DROP')}
        </h4>
        <p style="font-size:15px; color:var(--text); font-weight:600; line-height:1.5; margin-bottom:20px;">
          ${pmrIsTense ? (isAr ? (step.instructionAr || step.instruction) : step.instruction) : (isAr ? 'دع كل التشنج يذوب ويتلاشى. اشعر بالدفء والراحة يتدفقان في عضلاتك.' : 'Let all tension melt away. Notice the warm, relaxed sensation.')}
        </p>

        <div style="font-family:Fredoka; font-size:36px; font-weight:700; color:var(--teal);">
          ${pmrSecondsLeft}${isAr ? ' ث' : 's'}
        </div>
      </div>

      <div style="display:flex; gap:12px; justify-content:center;">
        <button class="btn btn-lg btn-teal" onclick="nextPMRStep()">
          <i class="fas ${pmrStep === PMR_STEPS.length - 1 && !pmrIsTense ? 'fa-circle-check' : 'fa-step-forward'}"></i>
          ${pmrStep === PMR_STEPS.length - 1 && !pmrIsTense ? (isAr ? 'إنهاء جلسة الاسترخاء (+10 نقاط)' : 'Complete Session (+10 XP)') : (isAr ? 'المجموعة العضلية التالية' : 'Next Muscle Group')}
        </button>
        <button class="btn btn-lg btn-ghost" onclick="resetPMR()">
          <i class="fas fa-rotate-left"></i> ${isAr ? 'إعادة البدء' : 'Reset'}
        </button>
      </div>
    </div>
  `;
}

function nextPMRStep() {
  SFX.click();
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
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
      toast(isAr ? 'اكتمل تمرين استرخاء العضلات بنجاح! جسدك الآن مسترخٍ ونشيط.' : 'Full Progressive Muscle Relaxation Complete! Body refreshed.', 'bonus');
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
    categoryAr: '🎓 التخلص من قلق الامتحانات',
    icon: 'fa-graduation-cap',
    items: [
      "I have prepared to the best of my ability, and my worth is not defined by a score.",
      "Anxiety is just energy looking for direction. I can take one calm question at a time.",
      "If I encounter a difficult problem, I can pause, skip, and come back with fresh eyes."
    ],
    itemsAr: [
      "لقد استعددت بأفضل ما لدي من طاقة، وقيمتي لا تُختصر أبدًا في رقم أو درجة.",
      "القلق هو مجرد طاقة تبحث عن اتجاه. يمكنني التعامل مع كل سؤال بهدوء ورويّة.",
      "إذا واجهت مسألة صعبة، يمكنني التوقف، تجاوزها مؤقتًا، والعودة إليها بذهن متجدد."
    ]
  },
  {
    category: '⏳ Feeling Behind & Overwhelmed',
    categoryAr: '⏳ الشعور بالتأخر والضغط',
    icon: 'fa-hourglass-half',
    items: [
      "I don't have to fix my whole life today. I just need to do the next 5 minutes.",
      "Starting late is infinitely better than never starting. I am starting right now.",
      "It is safe to slow down. High panic does not equal high speed."
    ],
    itemsAr: [
      "لست مطالبًا بإصلاح كل شيء في حياتي اليوم؛ أحتاج فقط إلى التركيز على الـ 5 دقائق التالية.",
      "البدء متأخرًا خيرٌ ألف مرة من عدم البدء إطلاقًا. أنا أبدأ الآن بكل ثقة.",
      "من الآمن أن أبطئ وتيرتي؛ فالذعر العالي لا يعني سرعة إنجاز حقيقية."
    ]
  },
  {
    category: '🧠 ADHD Brain Appreciation',
    categoryAr: '🧠 تقدير عقل ADHD الفريد',
    icon: 'fa-bolt',
    items: [
      "My brain works differently, and that includes incredible creativity and hyperfocus gifts.",
      "Taking frequent short breaks is not laziness — it is smart energy management.",
      "I forgive myself for yesterday's distractions. Today is a brand new canvas."
    ],
    itemsAr: [
      "عقلي يعمل بأسلوب مختلف، وهذا يتضمن إبداعًا استثنائيًا وقدرة مذهلة على التركيز الفائق.",
      "أخذ فترات راحة قصيرة متكررة ليس كسلاً؛ بل هو إدارة ذكية ومحترفة للطاقة.",
      "أسامح نفسي على تشتت الأمس. اليوم صفحة بيضاء جديدة ومجال جديد للنجاح."
    ]
  },
  {
    category: '🌿 Self-Compassion & Peace',
    categoryAr: '🌿 الرأفة بالنفس وسكينة الروح',
    icon: 'fa-heart',
    items: [
      "I talk to myself with the same kindness and patience I give my best friends.",
      "Resting is a productive part of learning and memory consolidation.",
      "I am doing my best, and my best is enough."
    ],
    itemsAr: [
      "أتحدث مع نفسي بنفس اللطف والصبر والتفهم الذي أمنحه لأعز أصدقائي.",
      "الراحة والاسترخاء جزء منتج وأساسي من عملية التعلم وتثبيت الذكريات في الدماغ.",
      "أنا أبذل قصارى جهدي اليوم، وما أقدمه كافٍ ومحل فخر وتقدير."
    ]
  }
];

function renderWellnessAffirmationsSection() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  return `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <div class="card" style="background:var(--card); border-left:4px solid var(--teal);">
        <h3 style="font-size:18px; font-weight:800; margin-bottom:4px; display:flex; align-items:center; gap:8px;">
          <i class="fas fa-quote-left" style="color:var(--teal);"></i> ${isAr ? 'بطاقات الحديث الذاتي الإيجابي والرحمة بالنفس' : 'Compassionate Self-Talk Decks'}
        </h3>
        <p style="color:var(--text2); font-size:14px;">
          ${isAr ? 'اختر أي بطاقة توكيد لنسخها أو تثبيتها كملحوظة لاصقة ملهمة أمامك على الشاشة!' : 'Select any affirmation card below to copy or pin it directly onto your screen as a Sticky Note!'}
        </p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:18px;">
        ${AFFIRMATION_DECKS.map(deck => {
          const cat = isAr ? (deck.categoryAr || deck.category) : deck.category;
          const items = isAr ? (deck.itemsAr || deck.items) : deck.items;
          return `
          <div class="card" style="display:flex; flex-direction:column; gap:12px;">
            <div style="display:flex; align-items:center; gap:8px; font-weight:800; font-size:15px; color:var(--text); border-bottom:1px solid var(--border); padding-bottom:8px;">
              <i class="fas ${deck.icon}" style="color:var(--teal);"></i> ${cat}
            </div>
            <div style="display:flex; flex-direction:column; gap:10px;">
              ${items.map(quote => `
                <div style="background:var(--bg); padding:12px; border-radius:10px; font-size:13px; line-height:1.5; color:var(--text); border:1px solid var(--border); display:flex; flex-direction:column; gap:8px;">
                  <div>"${escHtml(quote)}"</div>
                  <div style="display:flex; justify-content:flex-end; gap:6px;">
                    <button class="btn btn-sm btn-ghost" style="font-size:11px;" onclick="navigator.clipboard.writeText('${escHtml(quote)}'); toast('${isAr ? 'تم نسخ التوكيدة إلى الحافظة!' : 'Copied affirmation to clipboard!'}', 'info');">
                      <i class="fas fa-copy"></i> ${isAr ? 'نسخ' : 'Copy'}
                    </button>
                    <button class="btn btn-sm btn-teal" style="font-size:11px;" onclick="createNewStickyNote('${isAr ? '✨ توكيدة ملهمة' : '✨ Affirmation'}:\\n${escHtml(quote)}')">
                      <i class="fas fa-thumbtack"></i> ${isAr ? 'تثبيت على الشاشة' : 'Pin to Desktop'}
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderWellnessAnalyticsSection() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const logs = Store.get('moodLogs') || [];
  const totalLogs = logs.length;

  const moodCounts = {};
  logs.forEach(l => {
    moodCounts[l.mood] = (moodCounts[l.mood] || 0) + 1;
  });

  return `
    <div class="card card-glow" style="padding:28px;">
      <h3 style="font-size:20px; font-weight:800; margin-bottom:6px; display:flex; align-items:center; gap:8px;">
        <i class="fas fa-chart-line" style="color:var(--teal);"></i> ${isAr ? 'رؤى وتحليلات الأنماط المزاجية' : 'Emotional Pattern Insights'}
      </h3>
      <p style="font-size:14px; color:var(--text2); margin-bottom:20px;">
        ${isAr ? 'فهم تقلباتك ومستويات طاقتك النفسية يساعدك في تنظيم جدول مذاكرتك وفق طاقتك الطبيعية.' : 'Understanding your emotional patterns helps tailor study schedules around your natural energy levels.'}
      </p>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:16px; margin-bottom:24px;">
        <div style="background:var(--bg); padding:16px; border-radius:12px; text-align:center;">
          <div style="font-size:28px; font-weight:800; color:var(--teal);">${totalLogs}</div>
          <div style="font-size:12px; color:var(--text2); font-weight:700;">${isAr ? 'إجمالي تسجيلات المزاج' : 'Total Mood Check-Ins'}</div>
        </div>
        <div style="background:var(--bg); padding:16px; border-radius:12px; text-align:center;">
          <div style="font-size:28px; font-weight:800; color:var(--accent);">
            ${Object.keys(moodCounts).length ? MOOD_DATA[Object.keys(moodCounts).reduce((a,b) => moodCounts[a] > moodCounts[b] ? a : b)]?.emoji || '🧘' : '🧘'}
          </div>
          <div style="font-size:12px; color:var(--text2); font-weight:700;">${isAr ? 'الحالة المزاجية الغالبة' : 'Primary Mood State'}</div>
        </div>
        <div style="background:var(--bg); padding:16px; border-radius:12px; text-align:center;">
          <div style="font-size:28px; font-weight:800; color:var(--blue);">
            ${(Store.get('journalLogs') || []).length}
          </div>
          <div style="font-size:12px; color:var(--text2); font-weight:700;">${isAr ? 'الإنجازات المسجلة' : 'Small Wins Recorded'}</div>
        </div>
      </div>

      <h4 style="font-size:15px; font-weight:700; margin-bottom:12px;">${isAr ? 'توزيع الحالات المزاجية المسجلة' : 'Logged Mood Breakdown'}</h4>
      <div style="display:flex; flex-direction:column; gap:10px;">
        ${Object.keys(MOOD_DATA).map(key => {
          const item = MOOD_DATA[key];
          const count = moodCounts[key] || 0;
          const pct = totalLogs > 0 ? Math.round((count / totalLogs) * 100) : 0;
          const label = isAr ? (item.labelAr || item.label) : item.label;
          return `
            <div>
              <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:700; margin-bottom:4px;">
                <span>${item.emoji} ${label}</span>
                <span style="color:var(--text2);">${isAr ? `${count} مرات (${pct}%)` : `${count} times (${pct}%)`}</span>
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
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const label = isAr ? (activeMoodData.labelAr || activeMoodData.label) : activeMoodData.label;
  const rec = isAr ? (activeMoodData.recAr || activeMoodData.rec) : activeMoodData.rec;

  return `
    <div class="card card-glow" style="margin-bottom:24px;">
      <h3 style="font-size:18px; font-weight:700; margin-bottom:6px; display:flex; align-items:center; gap:8px;">
        <i class="fas fa-heart-circle-check" style="color:var(--teal);"></i> ${isAr ? 'تفقّد الحالة النفسية ومستوى الطاقة اليومي' : 'Daily Emotional & Energy Check-In'}
      </h3>
      <p style="color:var(--text2); font-size:14px; margin-bottom:16px;">
        ${isAr ? 'تفقّد مشاعرك ينمي وعيك الذاتي ويحميك من الإنهاك الدراسي. اختر حالتك الحالية الآن:' : 'Checking in with yourself builds emotional awareness and prevents burnout. Select your current state:'}
      </p>

      <!-- Emoji Picker -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(90px, 1fr)); gap:10px; margin-bottom:20px;">
        ${Object.keys(MOOD_DATA).map(key => {
          const item = MOOD_DATA[key];
          const isSel = selectedMood === key;
          const chipLabel = isAr ? (item.labelAr || item.label) : item.label;
          return `
            <div class="mood-chip ${isSel ? 'selected' : ''}" onclick="selectedMood='${key}'; SFX.click(); renderWellness();">
              <div class="mood-emoji">${item.emoji}</div>
              <div class="mood-label">${chipLabel}</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Recommendation Card -->
      <div style="padding:16px; background:var(--bg); border-radius:12px; border-left:4px solid var(--teal); margin-bottom:20px;">
        <div style="font-weight:700; font-size:14px; margin-bottom:4px; color:var(--teal);">
          <i class="fas fa-lightbulb"></i> ${isAr ? 'توصية مخصصة لحالتك الآن' : 'Personal Recommendation'}
        </div>
        <div style="font-size:14px; color:var(--text);">${rec}</div>
        <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn btn-sm btn-teal" onclick="quickLogMood('${selectedMood}')">
            <i class="fas fa-check"></i> ${isAr ? 'تسجيل الحالة (+10 نقاط خبرة)' : 'Log Mood (+10 XP)'}
          </button>
          <button class="btn btn-sm btn-secondary" onclick="navigate('focus')">
            <i class="fas fa-bullseye"></i> ${isAr ? `بدء جلسة تناسب حالة ${label}` : `Start ${label} Session`}
          </button>
        </div>
      </div>

      <!-- Past Logs History -->
      ${logs.length ? `
        <div>
          <h4 style="font-size:14px; font-weight:700; color:var(--text2); margin-bottom:10px;">${isAr ? 'أحدث تسجيلاتك' : 'Recent Check-Ins'}</h4>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${logs.slice(0, 5).map(l => {
              const info = MOOD_DATA[l.mood] || MOOD_DATA.calm;
              const dateStr = new Date(l.date).toLocaleString(isAr ? 'ar-EG' : undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              const histLabel = isAr ? (info.labelAr || info.label) : info.label;
              return `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:var(--bg); border-radius:10px; font-size:13px;">
                  <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:18px;">${info.emoji}</span>
                    <span style="font-weight:700;">${histLabel}</span>
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
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const isRun = breathingState.running;
  let phaseText = isAr ? 'اضغط ابدأ لبدء التمرين' : 'Click Start to Begin';
  if (isRun) {
    if (breathingState.phase === 'inhale') phaseText = isAr ? 'شهيق هادئ وعميق...' : 'Breathe In Slowly...';
    else if (breathingState.phase === 'hold' || breathingState.phase === 'hold2') phaseText = isAr ? 'احبس النفس باسترخاء...' : 'Hold Breath Calmly...';
    else if (breathingState.phase === 'exhale') phaseText = isAr ? 'زفير بطيء ومريح...' : 'Exhale Gently...';
  }

  return `
    <div class="card card-glow" style="text-align:center; padding:32px 24px;">
      <h3 style="font-size:22px; font-weight:700; margin-bottom:6px;">${isAr ? 'تمرين التنفس الموجّه وصفاء الذهن' : 'Guided Mind Reset & Breathing'}</h3>
      <p style="color:var(--text2); font-size:14px; margin-bottom:20px; max-width:500px; margin-left:auto; margin-right:auto;">
        ${isAr ? 'إبطاء وتيرة التنفس يبعث إشارة فورية لجهازك العصبي بأنك في أمان تام، مما يبدد نوبات الذعر وإجهاد التركيز.' : 'Slowing down your respiration signals your nervous system that you are safe, dissolving panic & focus fatigue.'}
      </p>

      <!-- Breathing Technique Selector -->
      <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap; margin-bottom:24px;">
        <button class="grade-pill ${breathingState.mode==='box'?'selected':''}" onclick="startBreathing('box')">
          ${isAr ? 'التنفس الصندوقي (4-4-4-4)' : 'Box Breathing (4-4-4-4)'}
        </button>
        <button class="grade-pill ${breathingState.mode==='478'?'selected':''}" onclick="startBreathing('478')">
          ${isAr ? 'تنفس الهدوء العميق (4-7-8)' : '4-7-8 Deep Calm'}
        </button>
        <button class="grade-pill ${breathingState.mode==='slow'?'selected':''}" onclick="startBreathing('slow')">
          ${isAr ? 'التهدئة البطيئة (5-5)' : 'Slow Reset (5-5)'}
        </button>
      </div>

      <!-- Animated Breathing Circle -->
      <div class="guided-breath-circle ${isRun ? breathingState.phase : ''}" id="guided-breath-circle">
        <div style="font-family:Fredoka; font-size:48px; font-weight:700; color:var(--teal);" id="breath-timer-display">
          ${isRun ? breathingState.seconds + (isAr ? ' ث' : 's') : (isAr ? 'جاهز' : 'Ready')}
        </div>
        <div style="font-size:12px; font-weight:700; color:var(--text2);" id="breath-cycle-count">
          ${isAr ? `${breathingState.cycles} دورات مكتملة` : `${breathingState.cycles} cycles done`}
        </div>
      </div>

      <div style="font-size:18px; font-weight:700; color:var(--teal); margin-bottom:24px;" id="breath-phase-label">
        ${phaseText}
      </div>

      <!-- Controls -->
      <div style="display:flex; gap:12px; justify-content:center;">
        ${!isRun ? `
          <button class="btn btn-lg btn-teal" onclick="startBreathing()"><i class="fas fa-play"></i> ${isAr ? 'بدء تمرين التنفس' : 'Start Breathing'}</button>
        ` : `
          <button class="btn btn-lg btn-secondary" onclick="stopBreathing()"><i class="fas fa-pause"></i> ${isAr ? 'إيقاف مؤقت' : 'Pause'}</button>
        `}
      </div>
    </div>
  `;
}

function renderWellnessGroundingSection() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const stepsMeta = [
    { num: 5, icon: 'fa-eye', title: isAr ? '5 أشياء يمكنك رؤيتها' : '5 Things You Can SEE', desc: isAr ? 'انظر حولك في الغرفة. حدد 5 أشياء واضحة بعينيك.' : 'Look around your room. Find 5 distinct objects.', key: 'see' },
    { num: 4, icon: 'fa-hand', title: isAr ? '4 أشياء يمكنك لمسها' : '4 Things You Can TOUCH', desc: isAr ? 'تحسس ملابسك، سطح المكتب، الكرسي، أو برودة الهواء.' : 'Feel your clothes, desk, chair, or cool air.', key: 'touch' },
    { num: 3, icon: 'fa-ear-listen', title: isAr ? '3 أصوات يمكنك سماعها' : '3 Things You HEAR', desc: isAr ? 'أنصت بدقة للأصوات المحيطة بك في الخلفية.' : 'Listen closely for ambient background sounds.', key: 'hear' },
    { num: 2, icon: 'fa-nose', title: isAr ? 'شيئان يمكنك شمهما' : '2 Things You SMELL', desc: isAr ? 'لاحظ الروائح من حولك أو خذ نفسًا منعشًا.' : 'Notice smells around you or take a fresh breath.', key: 'smell' },
    { num: 1, icon: 'fa-heart', title: isAr ? 'شيء إيجابي تقدره وتشكره' : '1 Good Thing You Appreciate', desc: isAr ? 'تذكر أمرًا إيجابيًا واحدًا عن نفسك أو عن يومك.' : 'Acknowledge one positive thing about yourself or today.', key: 'appreciate' }
  ];

  if (groundingStep >= 5) {
    return `
      <div class="card card-glow" style="text-align:center; padding:40px 24px;">
        <i class="fas fa-anchor" style="font-size:48px; color:var(--teal); margin-bottom:16px;"></i>
        <h3 style="font-size:22px; font-weight:700; margin-bottom:8px;">${isAr ? 'أنت الآن حاضر ومتصل بالواقع' : 'You Are Grounded & Present'}</h3>
        <p style="color:var(--text2); font-size:14px; margin-bottom:24px; max-width:480px; margin-left:auto; margin-right:auto;">
          ${isAr ? 'تثبيت الحواس يعيد عقلك المشتت أو القلق إلى اللحظة الملموسة الحالية. أحسنت صنعًا!' : 'Sensory grounding brings your hyperactive or anxious brain back to the immediate physical present. Great job!'}
        </p>
        <div style="display:flex; gap:12px; justify-content:center;">
          <button class="btn btn-teal" onclick="resetGroundingWizard()"><i class="fas fa-rotate-left"></i> ${isAr ? 'تكرار التمرين' : 'Repeat Grounding'}</button>
          <button class="btn btn-primary" onclick="navigate('focus')"><i class="fas fa-play"></i> ${isAr ? 'جاهز للتركيز الآن' : 'Ready to Focus'}</button>
        </div>
      </div>
    `;
  }

  const currStep = stepsMeta[groundingStep];

  return `
    <div class="card card-glow" style="padding:28px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <span class="tag" style="background:var(--teal-g); color:var(--teal); font-weight:700;">
          ${isAr ? `الخطوة ${groundingStep + 1} من 5` : `Step ${groundingStep + 1} of 5`}
        </span>
        <button class="btn btn-sm btn-ghost" onclick="resetGroundingWizard()" style="font-size:12px;"><i class="fas fa-rotate-left"></i> ${isAr ? 'إعادة البدء' : 'Restart'}</button>
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
        <label style="font-size:13px; color:var(--text2); display:block; margin-bottom:8px;">${isAr ? 'اكتبها هنا (أو تأملها ذهنيًا):' : 'Type them out (or mentally acknowledge them):'}</label>
        <input class="input" id="grounding-step-inp" placeholder="${isAr ? 'اكتب ما لاحظته هنا...' : 'Type here...'}" style="font-size:14px;" autofocus onkeydown="if(event.key==='Enter')nextGroundingStep()">
      </div>

      <div style="display:flex; justify-content:flex-end;">
        <button class="btn btn-teal" onclick="nextGroundingStep()">${isAr ? 'الخطوة التالية' : 'Next Step'} <i class="fas ${isAr ? 'fa-arrow-left' : 'fa-arrow-right'}"></i></button>
      </div>
    </div>
  `;
}

function renderWellnessDissolverSection() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  return `
    <div class="card card-glow" style="padding:28px;">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
        <div style="width:44px; height:44px; border-radius:12px; background:rgba(168,85,247,0.12); display:flex; align-items:center; justify-content:center;">
          <i class="fas fa-cloud-moon" style="color:#A855F7; font-size:20px;"></i>
        </div>
        <div>
          <h3 style="font-size:20px; font-weight:700;">${isAr ? 'مذيب القلق وتفكيك الأفكار السلبية' : 'Worry & Thought Dissolver'}</h3>
          <p style="font-size:13px; color:var(--text2);">${isAr ? 'هل تعلق فكرة مقلقة أو مزعجة في ذهنك؟ اكتبها هنا وشاهدها تذوب وتتلاشى في الفضاء.' : 'Got a sticky, anxious thought in your head? Write it down and watch it fade into space.'}</p>
        </div>
      </div>

      <div id="worry-stage" style="min-height:100px; display:flex; align-items:center; justify-content:center; background:var(--bg); border-radius:12px; padding:16px; margin-bottom:16px;">
        <input class="input" id="worry-dissolve-input" placeholder="${isAr ? 'مثال: ماذا لو لم أنجح في اختبار الغد؟ / أشعر بضغط هائل...' : 'e.g. What if I fail tomorrow\'s test? / I feel overwhelmed...'}" style="font-size:15px; border:none; background:transparent;" onkeydown="if(event.key==='Enter')dissolveWorryThought()">
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <span style="font-size:12px; color:var(--text2);"><i class="fas fa-shield-halved" style="color:var(--teal);"></i> ${isAr ? 'خاصة ومحفوظة على جهازك فقط. لا يتم تخزين أي شيء بشكل دائم.' : 'Private & purely client-side. Nothing is permanently stored.'}</span>
        <button class="btn btn-teal" onclick="dissolveWorryThought()"><i class="fas fa-sparkles"></i> ${isAr ? 'إطلاق الفكرة وتذويبها' : 'Release & Dissolve Thought'}</button>
      </div>
    </div>
  `;
}

// ======================== COGNITIVE REFRAMING JOURNAL & CBT WORKSHEET ========================

function setCbtSubTab(tab) {
  cbtSubTab = tab;
  SFX.click();
  renderWellness();
}

function setCbtWizardStep(step) {
  // Sync current form fields before moving
  syncCbtDraftInputs();
  cbtWizardStep = step;
  SFX.click();
  renderWellness();
  const target = document.getElementById('cbt-worksheet-card');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function syncCbtDraftInputs() {
  const triggerEl = document.getElementById('cbt-trigger-input');
  const stumbleEl = document.getElementById('cbt-stumble-input');
  const initialBeliefEl = document.getElementById('cbt-initial-belief');
  const evForEl = document.getElementById('cbt-ev-for');
  const evAgainstEl = document.getElementById('cbt-ev-against');
  const friendEl = document.getElementById('cbt-friend-advice');
  const reframeEl = document.getElementById('cbt-step-reframe-input');
  const finalBeliefEl = document.getElementById('cbt-final-belief');
  const actionEl = document.getElementById('cbt-micro-action-input');

  if (triggerEl) cbtDraft.trigger = triggerEl.value;
  if (stumbleEl) cbtDraft.stumble = stumbleEl.value;
  if (initialBeliefEl) cbtDraft.initialBelief = parseInt(initialBeliefEl.value, 10) || 75;
  if (evForEl) cbtDraft.evidenceFor = evForEl.value;
  if (evAgainstEl) cbtDraft.evidenceAgainst = evAgainstEl.value;
  if (friendEl) cbtDraft.friendAdvice = friendEl.value;
  if (reframeEl) cbtDraft.stepReframe = reframeEl.value;
  if (finalBeliefEl) cbtDraft.finalBelief = parseInt(finalBeliefEl.value, 10) || 25;
  if (actionEl) cbtDraft.microAction = actionEl.value;
}

function loadCbtPreset(presetId) {
  const p = CBT_PRESETS.find(x => x.id === presetId);
  if (!p) return;
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  cbtDraft = {
    trigger: isAr ? (p.triggerAr || p.trigger) : p.trigger,
    stumble: isAr ? (p.stumbleAr || p.stumble) : p.stumble,
    initialBelief: p.belief,
    emotion: isAr ? (p.emotionAr || p.emotion) : p.emotion,
    distortions: [...p.distortions],
    evidenceFor: isAr ? (p.evidenceForAr || p.evidenceFor) : p.evidenceFor,
    evidenceAgainst: isAr ? (p.evidenceAgainstAr || p.evidenceAgainst) : p.evidenceAgainst,
    friendAdvice: isAr ? (p.friendAdviceAr || p.friendAdvice) : p.friendAdvice,
    stepReframe: isAr ? (p.reframeAr || p.reframe) : p.reframe,
    finalBelief: p.finalBelief,
    microAction: isAr ? (p.microActionAr || p.microAction) : p.microAction
  };
  cbtWizardStep = 1;
  cbtSubTab = 'worksheet';
  SFX.click();
  toast(isAr ? `تم تحميل السيناريو: "${p.nameAr || p.name}". اتبع الخطوات الأربع!` : `Loaded scenario: "${p.name}". Follow each step!`, 'info');
  renderWellness();
}

function toggleCbtDistortion(id) {
  syncCbtDraftInputs();
  const idx = cbtDraft.distortions.indexOf(id);
  if (idx >= 0) {
    cbtDraft.distortions.splice(idx, 1);
  } else {
    cbtDraft.distortions.push(id);
  }
  SFX.click();
  renderWellness();
}

function selectCbtEmotion(emotion) {
  syncCbtDraftInputs();
  cbtDraft.emotion = emotion;
  SFX.click();
  renderWellness();
}

function applyCbtTemplate(text) {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const el = document.getElementById('cbt-step-reframe-input');
  if (el) {
    el.value = text;
    cbtDraft.stepReframe = text;
    el.focus();
  } else {
    cbtDraft.stepReframe = text;
  }
  toast(isAr ? 'تم تطبيق القالب المقترح على صياغتك!' : 'Template starter applied to your reframe!', 'info');
}

function saveCbtReframe() {
  syncCbtDraftInputs();
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';

  if (!cbtDraft.stumble || !cbtDraft.stumble.trim()) {
    toast(isAr ? 'يرجى وصف الفكرة السلبية أولاً (العثرة)' : 'Please describe the negative thought (The Stumble)', 'warn');
    setCbtWizardStep(1);
    return;
  }
  if (!cbtDraft.stepReframe || !cbtDraft.stepReframe.trim()) {
    toast(isAr ? 'يرجى كتابة الصياغة البديلة المتزنة (الخطوة)' : 'Please write your realistic reframing alternative (The Step)', 'warn');
    setCbtWizardStep(4);
    return;
  }

  const logs = Store.get('cbtReframes') || [];
  const entry = {
    id: 'cbt_' + Date.now(),
    date: new Date().toISOString(),
    trigger: cbtDraft.trigger.trim() || (isAr ? 'موقف مذاكرة أو مدرسة' : 'Study or school situation'),
    stumble: cbtDraft.stumble.trim(),
    initialBelief: parseInt(cbtDraft.initialBelief, 10) || 75,
    emotion: cbtDraft.emotion || (isAr ? 'قلق ومُثقل' : 'Overwhelmed'),
    distortions: cbtDraft.distortions.length ? [...cbtDraft.distortions] : ['catastrophizing'],
    evidenceFor: cbtDraft.evidenceFor.trim(),
    evidenceAgainst: cbtDraft.evidenceAgainst.trim(),
    friendAdvice: cbtDraft.friendAdvice.trim(),
    stepReframe: cbtDraft.stepReframe.trim(),
    finalBelief: parseInt(cbtDraft.finalBelief, 10) || 25,
    microAction: cbtDraft.microAction.trim() || (isAr ? 'أخذ دقيقتين للتنفس وإكمال الخطوة التالية' : 'Take a 2-minute reset breath and continue with next step'),
    actionDone: false,
    helpful: true
  };

  logs.unshift(entry);
  Store.set('cbtReframes', logs);
  Store.addXP(25);
  if (window.SFX && SFX.complete) SFX.complete();

  const drop = entry.initialBelief - entry.finalBelief;
  toast(isAr ? `تم حفظ إعادة الصياغة في دفترك! تراجع تصديق الفكرة السلبية بنسبة ${drop > 0 ? drop + '%' : 'تراجع'}. +25 نقطة خبرة!` : `Reframe saved to Journal! Belief shift: ${drop > 0 ? '-' + drop + '%' : 're-anchored'}. +25 XP!`, 'bonus');

  // Reset draft
  cbtDraft = {
    trigger: '',
    stumble: '',
    initialBelief: 80,
    emotion: isAr ? 'قلق ومُثقل' : 'Anxious & Overwhelmed',
    distortions: ['catastrophizing'],
    evidenceFor: '',
    evidenceAgainst: '',
    friendAdvice: '',
    stepReframe: '',
    finalBelief: 25,
    microAction: ''
  };
  cbtWizardStep = 1;
  cbtSubTab = 'journal';
  renderWellness();
}

function toggleCbtHelpful(id) {
  const logs = Store.get('cbtReframes') || [];
  const item = logs.find(x => x.id === id);
  if (item) {
    item.helpful = !item.helpful;
    Store.set('cbtReframes', logs);
    SFX.click();
    renderWellness();
  }
}

function toggleCbtAction(id) {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const logs = Store.get('cbtReframes') || [];
  const item = logs.find(x => x.id === id);
  if (item) {
    item.actionDone = !item.actionDone;
    Store.set('cbtReframes', logs);
    if (item.actionDone) {
      Store.addXP(10);
      toast(isAr ? 'أحسنت! أتممت الخطوة المجهرية بنجاح (+10 نقاط خبرة)' : 'Micro-action completed! +10 XP', 'success');
      if (window.SFX && SFX.complete) SFX.complete();
    } else {
      SFX.click();
    }
    renderWellness();
  }
}

function deleteCbtReframe(id) {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  if (!confirm(isAr ? 'هل أنت متأكد من رغبتك في حذف تدوينة إعادة الصياغة هذه؟' : 'Are you sure you want to delete this reframe entry?')) return;
  let logs = Store.get('cbtReframes') || [];
  logs = logs.filter(x => x.id !== id);
  Store.set('cbtReframes', logs);
  SFX.click();
  toast(isAr ? 'تمت إزالة التدوينة من الدفتر' : 'Reframe removed from journal', 'info');
  renderWellness();
}

function practiceDistortionInWorksheet(distId) {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const d = COGNITIVE_DISTORTIONS.find(x => x.id === distId);
  cbtDraft.distortions = [distId];
  if (d) {
    cbtDraft.stumble = isAr ? (d.trapPromptAr || d.trapPrompt) : d.trapPrompt;
  }
  cbtWizardStep = 1;
  cbtSubTab = 'worksheet';
  SFX.click();
  toast(isAr ? `جاري التدرب على فخ: "${d ? (d.nameAr || d.name) : distId}". ابدأ الصياغة!` : `Practicing distortion: ${d ? d.name : distId}. Start reframing!`, 'info');
  renderWellness();
}

// Window bindings
window.setCbtSubTab = setCbtSubTab;
window.setCbtWizardStep = setCbtWizardStep;
window.loadCbtPreset = loadCbtPreset;
window.toggleCbtDistortion = toggleCbtDistortion;
window.selectCbtEmotion = selectCbtEmotion;
window.applyCbtTemplate = applyCbtTemplate;
window.saveCbtReframe = saveCbtReframe;
window.toggleCbtHelpful = toggleCbtHelpful;
window.toggleCbtAction = toggleCbtAction;
window.deleteCbtReframe = deleteCbtReframe;
window.practiceDistortionInWorksheet = practiceDistortionInWorksheet;

function renderWellnessReframesSection() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const entries = Store.get('cbtReframes') || [];
  const totalEntries = entries.length;
  const totalCompletedActions = entries.filter(e => e.actionDone).length;
  const avgShift = totalEntries > 0
    ? Math.round(entries.reduce((acc, e) => acc + (e.initialBelief - e.finalBelief), 0) / totalEntries)
    : 0;

  return `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <!-- Hero Header & Subnavigation -->
      <div class="card" style="background:var(--card); border-left:4px solid var(--teal); padding:20px 24px;">
        <div style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:16px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              <span class="badge" style="background:var(--teal-g); color:var(--teal); font-weight:700;">${isAr ? 'إعادة الصياغة الإدراكية (CBT)' : 'CBT Cognitive Reframing'}</span>
              <span style="font-size:12px; color:var(--text2);"><i class="fas fa-shield-heart" style="color:var(--green);"></i> ${isAr ? 'ممارسة معتمدة على أدلة علمية' : 'Evidence-Based Practice'}</span>
            </div>
            <h2 style="font-size:20px; font-weight:800; margin-bottom:6px;">${isAr ? 'دفتر وورقة عمل تفكيك الأفكار وتحويل العثرات إلى خطوات' : 'Stumble-to-Step Interactive Worksheet & Journal'}</h2>
            <p style="color:var(--text2); font-size:14px; max-width:680px; line-height:1.5;">
              ${isAr ? 'تعرف على تشوهات التفكير (توقع الكوارث، تفكير الكل أو لا شيء، متلازمة المحتال) وحوّل الأفكار السلبية التلقائية إلى خطوات عملية واقعية ورحيمة.' : 'Identify cognitive distortions (catastrophizing, all-or-nothing thinking, imposter syndrome) and disarm automatic negative thoughts into realistic, compassionate action steps.'}
            </p>
          </div>

          <!-- Section Tabs -->
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-sm ${cbtSubTab === 'worksheet' ? 'btn-teal' : 'btn-ghost'}" onclick="setCbtSubTab('worksheet')" style="border:1px solid var(--border);">
              <i class="fas fa-pen-to-square"></i> ${isAr ? 'ورقة عمل العثرات إلى خطوات' : 'Stumble-to-Step Worksheet'}
            </button>
            <button class="btn btn-sm ${cbtSubTab === 'journal' ? 'btn-teal' : 'btn-ghost'}" onclick="setCbtSubTab('journal')" style="border:1px solid var(--border);">
              <i class="fas fa-book-bookmark"></i> ${isAr ? `دفتر إعادة الصياغة (${totalEntries})` : `Reframe Journal (${totalEntries})`}
            </button>
            <button class="btn btn-sm ${cbtSubTab === 'guide' ? 'btn-teal' : 'btn-ghost'}" onclick="setCbtSubTab('guide')" style="border:1px solid var(--border);">
              <i class="fas fa-compass"></i> ${isAr ? 'دليل تشوهات التفكير' : 'Distortions Field Guide'}
            </button>
            <button class="btn btn-sm ${cbtSubTab === 'adhd' ? 'btn-teal' : 'btn-ghost'}" onclick="setCbtSubTab('adhd')" style="border:1px solid var(--border);">
              <i class="fas fa-bolt"></i> ${isAr ? 'بطاقات مواجهة تشتت ADHD' : 'ADHD Anti-Paralysis'}
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 1: INTERACTIVE WORKSHEET -->
      ${cbtSubTab === 'worksheet' ? renderCbtWorksheetTab() : ''}

      <!-- TAB 2: JOURNAL LOG -->
      ${cbtSubTab === 'journal' ? renderCbtJournalTab(entries, totalEntries, avgShift, totalCompletedActions) : ''}

      <!-- TAB 3: FIELD GUIDE -->
      ${cbtSubTab === 'guide' ? renderCbtFieldGuideTab() : ''}

      <!-- TAB 4: ADHD COMPASSION CARDS -->
      ${cbtSubTab === 'adhd' ? renderCbtAdhdCardsTab() : ''}
    </div>
  `;
}

function renderCbtWorksheetTab() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const selectedDistortions = COGNITIVE_DISTORTIONS.filter(d => cbtDraft.distortions.includes(d.id));
  const beliefShift = (cbtDraft.initialBelief || 80) - (cbtDraft.finalBelief || 25);

  const emotionsList = isAr ? [
    'قلق ومُثقل',
    'محبط ومهزوم',
    'شعور بعدم الكفاءة والشك',
    'خجل ولوم للذات',
    'يائس',
    'مضغوط'
  ] : [
    'Anxious & Overwhelmed',
    'Frustrated & Defeated',
    'Inadequate & Insecure',
    'Ashamed & Guilty',
    'Hopeless',
    'Stressed'
  ];

  return `
    <div class="card" id="cbt-worksheet-card" style="padding:24px;">
      <!-- Presets quick-picker -->
      <div style="margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid var(--border);">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
          <span style="font-size:12px; font-weight:700; color:var(--text2); text-transform:uppercase; letter-spacing:0.5px;">
            <i class="fas fa-sparkles" style="color:var(--accent);"></i> ${isAr ? 'سيناريوهات جاهزة للتجربة والتدريب السريع' : 'Quick Scenario Presets (1-Click Test & Practice)'}
          </span>
          <span style="font-size:11px; color:var(--text2);">${isAr ? 'انقر على سيناريو لرؤية كيف تعيد تقنيات CBT صياغة مواقف الطلاب الواقعية' : 'Click a preset to see how CBT reframes realistic student traps'}</span>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          ${CBT_PRESETS.map(p => `
            <button class="cbt-preset-card" onclick="loadCbtPreset('${p.id}')">
              <i class="fas ${p.icon}" style="color:var(--accent);"></i>
              <span>${isAr ? (p.nameAr || p.name) : p.name}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Step Wizard Indicator -->
      <div class="cbt-wizard-steps">
        <button class="cbt-step-node ${cbtWizardStep === 1 ? 'active' : ''} ${cbtWizardStep > 1 ? 'completed' : ''}" onclick="setCbtWizardStep(1)">
          <div class="cbt-step-circle">${cbtWizardStep > 1 ? '<i class="fas fa-check"></i>' : '1'}</div>
          <span class="cbt-step-label">${isAr ? '1. العثرة (الفكرة السلبية)' : '1. The Stumble'}</span>
        </button>
        <button class="cbt-step-node ${cbtWizardStep === 2 ? 'active' : ''} ${cbtWizardStep > 2 ? 'completed' : ''}" onclick="setCbtWizardStep(2)">
          <div class="cbt-step-circle">${cbtWizardStep > 2 ? '<i class="fas fa-check"></i>' : '2'}</div>
          <span class="cbt-step-label">${isAr ? '2. كشف تشوهات التفكير' : '2. Unmask Distortions'}</span>
        </button>
        <button class="cbt-step-node ${cbtWizardStep === 3 ? 'active' : ''} ${cbtWizardStep > 3 ? 'completed' : ''}" onclick="setCbtWizardStep(3)">
          <div class="cbt-step-circle">${cbtWizardStep > 3 ? '<i class="fas fa-check"></i>' : '3'}</div>
          <span class="cbt-step-label">${isAr ? '3. اختبار الواقع والأدلة' : '3. Reality Check'}</span>
        </button>
        <button class="cbt-step-node ${cbtWizardStep === 4 ? 'active' : ''}" onclick="setCbtWizardStep(4)">
          <div class="cbt-step-circle">4</div>
          <span class="cbt-step-label">${isAr ? '4. الصياغة المتزنة' : '4. The Step Reframe'}</span>
        </button>
      </div>

      <!-- STEP 1: THE STUMBLE -->
      ${cbtWizardStep === 1 ? `
        <div style="display:flex; flex-direction:column; gap:18px;">
          <div class="cbt-stumble-box">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <i class="fas fa-triangle-exclamation" style="color:var(--red);"></i>
              <h3 style="font-size:16px; font-weight:700; color:var(--red);">${isAr ? 'الخطوة 1: التقاط "العثرة" (الفكرة السلبية التلقائية)' : 'Step 1: Capture the "Stumble" (Automatic Negative Thought)'}</h3>
            </div>
            <p style="font-size:13px; color:var(--text2); line-height:1.5;">
              ${isAr ? 'عندما يواجهنا موقف مجهد، يميل عقلنا تلقائيًا لاستنتاجات مبالغ فيها وغير مفيدة. اكتب بدقة ما حدث وما الذي أخبرك به عقلك.' : 'When something triggers stress, our brain instinctively jumps to unhelpful, exaggerated conclusions. Write down exactly what happened and what your brain told you.'}
            </p>
          </div>

          <div>
            <label style="font-size:13px; font-weight:700; display:block; margin-bottom:6px;">
              ${isAr ? 'الموقف المثير للتوتر / الحدث' : 'Triggering Situation / Event'} <span style="font-weight:400; color:var(--text2);">${isAr ? '(ما الذي حدث بالضبط؟)' : '(What happened?)'}</span>
            </label>
            <input class="input" id="cbt-trigger-input" placeholder="${isAr ? 'مثال: حصلت على درجة 65% في اختبار قصير، أو رأيت زملائي يذاكرون معًا بدوني' : 'e.g. Scored 65% on math quiz, or saw friends studying together without me'}" value="${escHtml(cbtDraft.trigger)}" oninput="cbtDraft.trigger=this.value;">
          </div>

          <div>
            <label style="font-size:13px; font-weight:700; display:block; margin-bottom:6px;">
              ${isAr ? 'الفكرة السلبية التلقائية (العثرة)' : 'The Automatic Negative Thought (The Stumble)'} <span style="color:var(--red);">*</span>
            </label>
            <textarea class="input" id="cbt-stumble-input" rows="3" placeholder="${isAr ? 'مثال: لقد أخفقت في هذا الاختبار، لذا سأفشل في المادة بأكملها وأضيع مستقبلي.' : 'e.g. I failed this quiz, so I will fail the entire class, drop out of school, and ruin everything.'}" oninput="cbtDraft.stumble=this.value;">${escHtml(cbtDraft.stumble)}</textarea>
          </div>

          <!-- Emotion selector -->
          <div>
            <label style="font-size:13px; font-weight:700; display:block; margin-bottom:8px;">
              ${isAr ? 'الشعور الأساسي المسيطر:' : 'Primary Emotion Felt:'}
            </label>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              ${emotionsList.map(emo => `
                <button type="button" class="grade-pill ${cbtDraft.emotion === emo ? 'selected' : ''}" onclick="selectCbtEmotion('${emo}')">
                  ${emo}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Initial Belief Rating Slider -->
          <div style="background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <label style="font-size:13px; font-weight:700;">
                ${isAr ? 'شدة التصديق الأولية: ما مدى إيمانك بهذه الفكرة الآن؟' : 'Initial Belief Intensity: How strongly do you believe this thought right now?'}
              </label>
              <span class="cbt-belief-badge" style="color:var(--red); font-size:14px;">
                <span id="cbt-initial-belief-val">${cbtDraft.initialBelief}%</span>
              </span>
            </div>
            <input type="range" min="0" max="100" step="5" class="cbt-belief-slider" id="cbt-initial-belief" value="${cbtDraft.initialBelief}" oninput="cbtDraft.initialBelief=parseInt(this.value,10); document.getElementById('cbt-initial-belief-val').innerText=this.value+'%';">
            <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text2); margin-top:6px;">
              <span>0% (${isAr ? 'بالكاد' : 'Barely'})</span>
              <span>50% (${isAr ? 'إلى حد ما' : 'Somewhat'})</span>
              <span>100% (${isAr ? 'يقين تام' : 'Absolute certainty'})</span>
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:8px;">
            <button class="btn btn-teal" onclick="if(!cbtDraft.stumble.trim()){toast('${isAr ? 'يرجى كتابة فكرتك قبل المتابعة' : 'Please enter your thought before continuing'}','warn');}else{setCbtWizardStep(2);}">
              ${isAr ? 'التالي: كشف تشوهات التفكير' : 'Next: Identify Distortions'} <i class="fas ${isAr ? 'fa-arrow-left' : 'fa-arrow-right'}"></i>
            </button>
          </div>
        </div>
      ` : ''}

      <!-- STEP 2: UNMASK COGNITIVE DISTORTIONS -->
      ${cbtWizardStep === 2 ? `
        <div style="display:flex; flex-direction:column; gap:18px;">
          <!-- Review of stumble -->
          <div class="cbt-stumble-box" style="margin-bottom:4px;">
            <div style="font-size:11px; font-weight:700; color:var(--red); text-transform:uppercase; margin-bottom:4px;">${isAr ? 'العثرة (الفكرة السلبية التلقائية)' : 'The Stumble (Automatic Thought)'}</div>
            <div style="font-size:14px; font-weight:600; font-style:italic;">"${escHtml(cbtDraft.stumble || (isAr ? 'لم يتم إدخال فكرة بعد' : 'No thought entered yet'))}"</div>
          </div>

          <div>
            <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
              <div>
                <h3 style="font-size:16px; font-weight:700;">${isAr ? 'الخطوة 2: كشف فخاخ التفكير (التشوهات الإدراكية)' : 'Step 2: Unmask the Thinking Traps (Cognitive Distortions)'}</h3>
                <p style="font-size:13px; color:var(--text2);">${isAr ? 'حدد جميع أنماط التشوه التي تنطبق على هذه الفكرة التلقائية.' : 'Select all distortion patterns that match this automatic thought.'}</p>
              </div>
              <span class="badge" style="background:var(--teal-g); color:var(--teal); font-weight:700;">
                ${isAr ? `${cbtDraft.distortions.length} محددة` : `${cbtDraft.distortions.length} Selected`}
              </span>
            </div>

            <!-- Distortion Cards Grid -->
            <div class="cbt-distortion-grid">
              ${COGNITIVE_DISTORTIONS.map(d => {
                const isSelected = cbtDraft.distortions.includes(d.id);
                const name = isAr ? (d.nameAr || d.name) : d.name;
                const summary = isAr ? (d.summaryAr || d.summary) : d.summary;
                const trapPrompt = isAr ? (d.trapPromptAr || d.trapPrompt) : d.trapPrompt;
                return `
                  <div class="cbt-distortion-item ${isSelected ? 'selected' : ''}" onclick="toggleCbtDistortion('${d.id}')">
                    <div style="display:flex; align-items:center; justify-content:space-between;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <div style="width:28px; height:28px; border-radius:8px; background:${d.bg}; display:flex; align-items:center; justify-content:center;">
                          <i class="fas ${d.icon} cbt-dist-icon" style="color:${d.color}; font-size:12px;"></i>
                        </div>
                        <span style="font-weight:700; font-size:13px;">${name}</span>
                      </div>
                      ${isSelected ? '<i class="fas fa-check-circle" style="color:var(--teal);"></i>' : '<i class="far fa-circle" style="color:var(--text2);"></i>'}
                    </div>
                    <div style="font-size:11px; color:var(--text2); line-height:1.4;">${summary}</div>
                    <div style="font-size:11px; color:${d.color}; font-style:italic; margin-top:2px;">"${trapPrompt}"</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Dynamic Counter-Question Helper for selected distortions -->
          ${selectedDistortions.length > 0 ? `
            <div style="background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:16px;">
              <div style="font-size:12px; font-weight:700; color:var(--teal); text-transform:uppercase; margin-bottom:8px;">
                <i class="fas fa-magnifying-glass"></i> ${isAr ? 'أسئلة المحقق المنطقي لتفكيك تشوهاتك المحددة:' : 'Reality-Check Detective Questions for Your Distortions:'}
              </div>
              <div style="display:flex; flex-direction:column; gap:8px;">
                ${selectedDistortions.map(d => `
                  <div style="font-size:13px; line-height:1.4; display:flex; gap:8px;">
                    <strong style="color:${d.color}; min-width:130px;">${isAr ? (d.nameAr || d.name) : d.name}:</strong>
                    <span style="color:var(--text2);">${isAr ? (d.counterQuestionAr || d.counterQuestion) : d.counterQuestion}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div style="display:flex; justify-content:space-between; gap:10px; margin-top:8px;">
            <button class="btn btn-ghost" onclick="setCbtWizardStep(1)">
              <i class="fas ${isAr ? 'fa-arrow-right' : 'fa-arrow-left'}"></i> ${isAr ? 'رجوع' : 'Back'}
            </button>
            <button class="btn btn-teal" onclick="if(cbtDraft.distortions.length===0){toast('${isAr ? 'يرجى تحديد نمط تشوه فكري واحد على الأقل' : 'Please select at least 1 distortion pattern'}','warn');}else{setCbtWizardStep(3);}">
              ${isAr ? 'التالي: اختبار الواقع والأدلة' : 'Next: Reality Check'} <i class="fas ${isAr ? 'fa-arrow-left' : 'fa-arrow-right'}"></i>
            </button>
          </div>
        </div>
      ` : ''}

      <!-- STEP 3: REALITY CHECK INVESTIGATION -->
      ${cbtWizardStep === 3 ? `
        <div style="display:flex; flex-direction:column; gap:18px;">
          <!-- Header Context -->
          <div style="background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:14px 16px;">
            <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-bottom:6px;">
              <span style="font-size:11px; font-weight:700; color:var(--red); text-transform:uppercase;">${isAr ? 'العثرة' : 'The Stumble'}</span>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                ${selectedDistortions.map(d => `<span class="cbt-tag" style="background:${d.bg}; color:${d.color};"><i class="fas ${d.icon}"></i> ${isAr ? (d.nameAr || d.name) : d.name}</span>`).join('')}
              </div>
            </div>
            <div style="font-size:14px; font-weight:600; font-style:italic; color:var(--text);">"${escHtml(cbtDraft.stumble)}"</div>
          </div>

          <div>
            <h3 style="font-size:16px; font-weight:700; margin-bottom:4px;">${isAr ? 'الخطوة 3: اختبار الواقع (محكمة العقل والأدلة)' : 'Step 3: Conduct a Reality Check (Courtroom of the Mind)'}</h3>
            <p style="font-size:13px; color:var(--text2); line-height:1.5;">
              ${isAr ? 'التشوهات تخدعنا وتخلط بين المشاعر المؤقتة والحقائق الموضوعية. ضع فكرتك في قفص المحاكمة المنطقية:' : 'Distortions trick us into confusing feelings with facts. Put your negative thought on trial:'}
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:14px;">
            <div style="background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:16px;">
              <label style="font-size:13px; font-weight:700; display:block; margin-bottom:6px;">
                <i class="fas fa-clipboard-check" style="color:var(--text2);"></i> ${isAr ? 'أدلة تدعم الفكرة السلبية' : 'Facts Supporting the Thought'}
              </label>
              <p style="font-size:11px; color:var(--text2); margin-bottom:8px;">${isAr ? 'ما هي الحقائق المادية الملموسة الموجودة؟ (دون افتراضات أو مشاعر).' : 'What actual, verifiable facts exist? (No assumptions or feelings).'}</p>
              <textarea class="input" id="cbt-ev-for" rows="3" placeholder="${isAr ? 'مثال: حصلت بالفعل على درجة منخفضة في هذا الاختبار القصير.' : 'e.g. I got a low score on this 5-point quiz.'}" oninput="cbtDraft.evidenceFor=this.value;">${escHtml(cbtDraft.evidenceFor)}</textarea>
            </div>

            <div style="background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:16px;">
              <label style="font-size:13px; font-weight:700; display:block; margin-bottom:6px;">
                <i class="fas fa-scale-balanced" style="color:var(--teal);"></i> ${isAr ? 'أدلة وحقائق تنقض الفكرة السلبية' : 'Facts Contradicting the Thought'}
              </label>
              <p style="font-size:11px; color:var(--text2); margin-bottom:8px;">${isAr ? 'ما الأدلة التي تثبت مبالغة هذه الفكرة؟ النجاحات السابقة، السياق، الموارد.' : 'What evidence proves this thought is exaggerated? Past wins, context, resources.'}</p>
              <textarea class="input" id="cbt-ev-against" rows="3" placeholder="${isAr ? 'مثال: كان اختبارًا واحدًا بوزن 2% فقط. حصلت على 88% في المشروع ولدي 6 أسابيع للتعويض.' : 'e.g. It was only 1 quiz, worth 2% of my grade. I scored 88% on the lab and have 6 weeks left to study.'}" oninput="cbtDraft.evidenceAgainst=this.value;">${escHtml(cbtDraft.evidenceAgainst)}</textarea>
            </div>
          </div>

          <!-- Best Friend Check -->
          <div style="background:rgba(168, 85, 247, 0.06); border:1px solid rgba(168, 85, 247, 0.2); border-radius:12px; padding:16px;">
            <label style="font-size:13px; font-weight:700; color:var(--purple); display:block; margin-bottom:6px;">
              <i class="fas fa-heart"></i> ${isAr ? 'اختبار الصديق العزيز (الرأفة بالنفس)' : 'The "Best Friend" Compassion Test'}
            </label>
            <p style="font-size:12px; color:var(--text2); margin-bottom:8px;">
              ${isAr ? 'لو أتاك صديقك المفضل بهذه الفكرة المقلقة ذاتها، ماذا كنت ستقول له بحب وحكمة هادئة؟' : 'If your best friend came to you with this exact thought, what compassionate, grounded wisdom would you gently tell them?'}
            </p>
            <textarea class="input" id="cbt-friend-advice" rows="2" placeholder="${isAr ? 'مثال: كنت سأقول له: إخفاق في اختبار صغير لا يلغي ذكاءك ولا مجهودك. دعنا نراجع الأخطاء معًا بهدوء.' : 'e.g. I would tell them: One bad quiz does not erase your intelligence or hard work. Let\'s study the hard parts together.'}" oninput="cbtDraft.friendAdvice=this.value;">${escHtml(cbtDraft.friendAdvice)}</textarea>
          </div>

          <div style="display:flex; justify-content:space-between; gap:10px; margin-top:8px;">
            <button class="btn btn-ghost" onclick="setCbtWizardStep(2)">
              <i class="fas ${isAr ? 'fa-arrow-right' : 'fa-arrow-left'}"></i> ${isAr ? 'رجوع' : 'Back'}
            </button>
            <button class="btn btn-teal" onclick="setCbtWizardStep(4)">
              ${isAr ? 'التالي: الصياغة المتزنة' : 'Next: The Step Reframe'} <i class="fas ${isAr ? 'fa-arrow-left' : 'fa-arrow-right'}"></i>
            </button>
          </div>
        </div>
      ` : ''}

      <!-- STEP 4: THE STEP REFRAME -->
      ${cbtWizardStep === 4 ? `
        <div style="display:flex; flex-direction:column; gap:18px;">
          <!-- Transformation Preview Box -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">
            <div class="cbt-stumble-box">
              <div style="font-size:11px; font-weight:700; color:var(--red); text-transform:uppercase; margin-bottom:4px;">
                <i class="fas fa-xmark"></i> ${isAr ? 'العثرة (الفخ التلقائي)' : 'The Stumble (Automatic Trap)'}
              </div>
              <div style="font-size:13px; font-style:italic;">"${escHtml(cbtDraft.stumble)}"</div>
              <div style="font-size:11px; color:var(--text2); margin-top:6px;">${isAr ? 'التصديق المبدئي:' : 'Initial Belief:'} <strong>${cbtDraft.initialBelief}%</strong></div>
            </div>

            <div class="cbt-step-box">
              <div style="font-size:11px; font-weight:700; color:var(--green); text-transform:uppercase; margin-bottom:4px;">
                <i class="fas fa-lightbulb"></i> ${isAr ? 'الخطوة (هدف الصياغة المتزنة)' : 'The Step (Realistic Reframe Goal)'}
              </div>
              <div style="font-size:12px; color:var(--text2); line-height:1.4;">
                ${isAr ? 'فكرة متوازنة ترتكز على الحقيقة، والرحمة بالنفس، والعمل الإيجابي الواقعي.' : 'A balanced thought grounded in truth, self-compassion, and practical action.'}
              </div>
            </div>
          </div>

          <!-- Quick Starter Templates -->
          <div>
            <div style="font-size:12px; font-weight:700; color:var(--text2); margin-bottom:6px;">
              <i class="fas fa-wand-magic-sparkles" style="color:var(--accent);"></i> ${isAr ? 'انقر على قالب مقترح لمساعدتك في صياغة الفكرة المتزنة:' : 'Click a Starter Framework to help craft your reframe:'}
            </div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              <button type="button" class="cbt-template-chip" onclick="applyCbtTemplate('${isAr ? 'رغم قلقي حيال هذا الأمر، إلا أن الحقيقة الموضوعية هي أن عثرة واحدة لا تحدد مستقبلي، ويمكنني التعامل معها خطوة بخطوة.' : 'Even though I am worried about this, the objective reality is that one setback does not define my future, and I can take it one small step at a time.'}')">
                💡 <strong>${isAr ? 'الحقيقة الموضوعية:' : 'The Objective Reality:'}</strong> "${isAr ? 'رغم قلقي حيال هذا الأمر، إلا أن الحقيقة الموضوعية هي أن عثرة واحدة لا تحدد مستقبلي، ويمكنني التعامل معها خطوة بخطوة.' : 'Even though I am worried about this, the objective reality is that one setback does not define my future, and I can take it one small step at a time.'}"
              </button>
              <button type="button" class="cbt-template-chip" onclick="applyCbtTemplate('${isAr ? 'التقدم أهم من الكمال: إنجاز 20% اليوم خيرٌ ألف مرة من عدم إنجاز أي شيء، وأنا أستحق التقدير لأنني حاولت.' : 'Progress over perfection: doing 20% today is infinitely better than doing nothing, and I still deserve credit for showing up.'}')">
                🌱 <strong>${isAr ? 'التقدم أهم من الكمال:' : 'Progress Over Perfection:'}</strong> "${isAr ? 'التقدم أهم من الكمال: إنجاز 20% اليوم خيرٌ ألف مرة من عدم إنجاز أي شيء، وأنا أستحق التقدير لأنني حاولت.' : 'Progress over perfection: doing 20% today is infinitely better than doing nothing, and I still deserve credit for showing up.'}"
              </button>
              <button type="button" class="cbt-template-chip" onclick="applyCbtTemplate('${isAr ? 'المشاعر مجرد إشارات بيولوجية عابرة وليست حقائق قطعية. مجرد شعوري بالضغط لا يعني إطلاقًا عجزي عن التعلم.' : 'Feelings are biological sensations, not objective facts. Just because I feel overwhelmed does not mean I am incapable of learning this.'}')">
                🧠 <strong>${isAr ? 'المشاعر ليست حقائق:' : 'Feelings Are Not Facts:'}</strong> "${isAr ? 'المشاعر مجرد إشارات بيولوجية عابرة وليست حقائق قطعية. مجرد شعوري بالضغط لا يعني إطلاقًا عجزي عن التعلم.' : 'Feelings are biological sensations, not objective facts. Just because I feel overwhelmed does not mean I am incapable of learning this.'}"
              </button>
            </div>
          </div>

          <!-- Realistic Reframe Input -->
          <div>
            <label style="font-size:13px; font-weight:700; display:block; margin-bottom:6px;">
              ${isAr ? 'صياغتك البديلة الواقعية والمتزنة (الخطوة الإيجابية)' : 'Your Realistic Reframing Alternative (The Step)'} <span style="color:var(--green);">*</span>
            </label>
            <textarea class="input" id="cbt-step-reframe-input" rows="3" placeholder="${isAr ? 'اكتب صياغتك المتزنة والمطمئنة هنا...' : 'Write your balanced, grounded reframe here...'}" oninput="cbtDraft.stepReframe=this.value;">${escHtml(cbtDraft.stepReframe)}</textarea>
          </div>

          <!-- Post-Reframe Belief Re-rating -->
          <div style="background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <label style="font-size:13px; font-weight:700;">
                ${isAr ? 'إعادة التقييم: ما مدى تصديقك للفكرة السلبية الأصلية الآن؟' : 'Re-rate: How strongly do you believe the original negative thought now?'}
              </label>
              <span class="cbt-belief-badge" style="color:var(--green); font-size:14px;">
                <span id="cbt-final-belief-val">${cbtDraft.finalBelief}%</span>
              </span>
            </div>
            <input type="range" min="0" max="100" step="5" class="cbt-belief-slider" id="cbt-final-belief" value="${cbtDraft.finalBelief}" oninput="cbtDraft.finalBelief=parseInt(this.value,10); document.getElementById('cbt-final-belief-val').innerText=this.value+'%'; const shift = cbtDraft.initialBelief - cbtDraft.finalBelief; document.getElementById('cbt-live-shift').innerText = (shift > 0 ? (typeof currentLang === 'function' && currentLang() === 'ar' ? 'تراجع ' + shift + '% راحة' : '-' + shift + '% Relief') : (typeof currentLang === 'function' && currentLang() === 'ar' ? 'متزن' : 'Grounded'));">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
              <span style="font-size:12px; color:var(--text2);">${isAr ? 'التصديق الأصلي:' : 'Original Belief:'} ${cbtDraft.initialBelief}%</span>
              <span class="badge" id="cbt-live-shift" style="background:var(--green-g); color:var(--green); font-weight:700;">
                ${beliefShift > 0 ? (isAr ? `تراجع ${beliefShift}% راحة` : `-${beliefShift}% Relief`) : (isAr ? 'متزن' : 'Grounded')}
              </span>
            </div>
          </div>

          <!-- Actionable Micro-Step -->
          <div style="background:rgba(78, 205, 196, 0.06); border:1px solid rgba(78, 205, 196, 0.2); border-radius:12px; padding:16px;">
            <label style="font-size:13px; font-weight:700; color:var(--teal); display:block; margin-bottom:6px;">
              <i class="fas fa-shoe-prints"></i> ${isAr ? 'خطوة عملية مجهرية لـ 5 دقائق' : 'Concrete 5-Minute Micro-Action'}
            </label>
            <p style="font-size:12px; color:var(--text2); margin-bottom:8px;">
              ${isAr ? 'ما هو الإجراء الصغير والفوري الذي يمكنك تنفيذه الآن لترسيخ هذه الصياغة في الواقع؟' : 'What is one small, immediate action you can take to ground this reframe in reality?'}
            </p>
            <input class="input" id="cbt-micro-action-input" placeholder="${isAr ? 'مثال: فتح الفصل الثالث ومراجعة قانونين اثنين بمؤقت 5 دقائق' : 'e.g. Open chapter 3 and review 2 formulas with a 5-minute timer'}" value="${escHtml(cbtDraft.microAction)}" oninput="cbtDraft.microAction=this.value;">
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top:8px;">
            <button class="btn btn-ghost" onclick="setCbtWizardStep(3)">
              <i class="fas ${isAr ? 'fa-arrow-right' : 'fa-arrow-left'}"></i> ${isAr ? 'رجوع' : 'Back'}
            </button>
            <button class="btn btn-lg btn-teal" onclick="saveCbtReframe()">
              <i class="fas fa-floppy-disk"></i> ${isAr ? 'حفظ في دفتر إعادة الصياغة (+25 نقطة خبرة)' : 'Save to Reframe Journal (+25 XP)'}
            </button>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderCbtJournalTab(entries, totalEntries, avgShift, totalCompletedActions) {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  const filtered = entries.filter(e => {
    if (cbtJournalFilter !== 'all' && !e.distortions.includes(cbtJournalFilter)) {
      return false;
    }
    if (cbtJournalSearch) {
      const q = cbtJournalSearch.toLowerCase();
      const matchStumble = (e.stumble || '').toLowerCase().includes(q);
      const matchReframe = (e.stepReframe || '').toLowerCase().includes(q);
      const matchTrigger = (e.trigger || '').toLowerCase().includes(q);
      if (!matchStumble && !matchReframe && !matchTrigger) return false;
    }
    return true;
  });

  return `
    <div style="display:flex; flex-direction:column; gap:16px;">
      <!-- Stats Row -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
        <div class="card" style="padding:16px; display:flex; align-items:center; gap:12px;">
          <div style="width:40px; height:40px; border-radius:10px; background:var(--teal-g); display:flex; align-items:center; justify-content:center;">
            <i class="fas fa-brain" style="color:var(--teal); font-size:18px;"></i>
          </div>
          <div>
            <div style="font-size:20px; font-weight:800;">${totalEntries}</div>
            <div style="font-size:12px; color:var(--text2);">${isAr ? 'أفكار تمت إعادة صياغتها' : 'Thoughts Reframed'}</div>
          </div>
        </div>

        <div class="card" style="padding:16px; display:flex; align-items:center; gap:12px;">
          <div style="width:40px; height:40px; border-radius:10px; background:var(--green-g); display:flex; align-items:center; justify-content:center;">
            <i class="fas fa-arrow-trend-down" style="color:var(--green); font-size:18px;"></i>
          </div>
          <div>
            <div style="font-size:20px; font-weight:800; color:var(--green);">-${avgShift}%</div>
            <div style="font-size:12px; color:var(--text2);">${isAr ? 'متوسط انخفاض التصديق' : 'Avg Belief Shift'}</div>
          </div>
        </div>

        <div class="card" style="padding:16px; display:flex; align-items:center; gap:12px;">
          <div style="width:40px; height:40px; border-radius:10px; background:var(--purple-g); display:flex; align-items:center; justify-content:center;">
            <i class="fas fa-check-double" style="color:var(--purple); font-size:18px;"></i>
          </div>
          <div>
            <div style="font-size:20px; font-weight:800;">${totalCompletedActions}</div>
            <div style="font-size:12px; color:var(--text2);">${isAr ? 'خطوات عملية منجزة' : 'Micro-Actions Done'}</div>
          </div>
        </div>
      </div>

      <!-- Search & Distortion Filter Toolbar -->
      <div class="card" style="padding:14px 18px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:220px;">
          <i class="fas fa-magnifying-glass" style="color:var(--text2);"></i>
          <input class="input" style="padding:6px 10px; font-size:13px; height:34px;" placeholder="${isAr ? 'ابحث في دفتر إعادة الصياغة...' : 'Search your reframing journal...'}" value="${escHtml(cbtJournalSearch)}" oninput="cbtJournalSearch=this.value; renderWellness();">
        </div>

        <div style="display:flex; align-items:center; gap:8px; overflow-x:auto;" class="no-scrollbar">
          <span style="font-size:12px; color:var(--text2); white-space:nowrap;">${isAr ? 'تصفية الفخاخ:' : 'Filter Trap:'}</span>
          <select class="input" style="padding:4px 8px; font-size:12px; height:34px; width:auto;" onchange="cbtJournalFilter=this.value; renderWellness();">
            <option value="all" ${cbtJournalFilter === 'all' ? 'selected' : ''}>${isAr ? 'جميع التشوهات' : 'All Distortions'}</option>
            ${COGNITIVE_DISTORTIONS.map(d => `
              <option value="${d.id}" ${cbtJournalFilter === d.id ? 'selected' : ''}>${isAr ? (d.nameAr || d.name) : d.name}</option>
            `).join('')}
          </select>
          <button class="btn btn-sm btn-teal" onclick="setCbtSubTab('worksheet')">
            <i class="fas fa-plus"></i> ${isAr ? 'إعادة صياغة جديدة' : 'New Reframe'}
          </button>
        </div>
      </div>

      <!-- Journal Entries List -->
      ${filtered.length === 0 ? `
        <div class="card" style="text-align:center; padding:40px 20px;">
          <div style="width:48px; height:48px; border-radius:50%; background:var(--bg); display:flex; align-items:center; justify-content:center; margin:0 auto 12px; color:var(--text2); font-size:20px;">
            <i class="fas fa-book-open"></i>
          </div>
          <h3 style="font-size:16px; font-weight:700; margin-bottom:4px;">${isAr ? 'لم يتم العثور على تدوينات' : 'No reframing entries found'}</h3>
          <p style="font-size:13px; color:var(--text2); margin-bottom:16px;">
            ${cbtJournalSearch || cbtJournalFilter !== 'all' ? (isAr ? 'جرّب مسح البحث أو تصفية التشوهات لرؤية كل التدوينات.' : 'Try clearing your search or distortion filter.') : (isAr ? 'سجل أول فكرة وأعد صياغتها باستخدام ورقة عمل العثرات إلى خطوات!' : 'Capture your first cognitive reframe using the Stumble-to-Step worksheet!')}
          </p>
          <button class="btn btn-teal" onclick="cbtJournalFilter='all'; cbtJournalSearch=''; setCbtSubTab('worksheet');">
            ${isAr ? 'فتح ورقة عمل العثرات إلى خطوات' : 'Open Stumble-to-Step Worksheet'}
          </button>
        </div>
      ` : `
        <div style="display:flex; flex-direction:column; gap:14px;">
          ${filtered.map(entry => {
            const shift = entry.initialBelief - entry.finalBelief;
            const formattedDate = new Date(entry.date).toLocaleDateString(isAr ? 'ar-EG' : undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return `
              <div class="cbt-journal-card" id="${entry.id}">
                <!-- Entry Top Bar -->
                <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:12px; color:var(--text2);">${formattedDate}</span>
                    <span style="font-size:12px; color:var(--border2);">•</span>
                    <span style="font-size:12px; font-weight:600; color:var(--text);">${escHtml(entry.trigger)}</span>
                    <span class="badge" style="background:var(--bg); font-size:11px;">${escHtml(entry.emotion || (isAr ? 'مُثقل' : 'Overwhelmed'))}</span>
                  </div>

                  <div style="display:flex; align-items:center; gap:8px;">
                    <button class="btn btn-sm btn-ghost" title="${isAr ? 'تمييز كمفيد' : 'Mark as helpful'}" onclick="toggleCbtHelpful('${entry.id}')" style="color:${entry.helpful ? 'var(--accent)' : 'var(--text2)'};">
                      <i class="${entry.helpful ? 'fas fa-heart' : 'far fa-heart'}"></i> ${entry.helpful ? (isAr ? 'مفيد وملهم' : 'Helpful') : ''}
                    </button>
                    <button class="btn btn-sm btn-ghost" title="${isAr ? 'حذف التدوينة' : 'Delete entry'}" onclick="deleteCbtReframe('${entry.id}')" style="color:var(--text2);">
                      <i class="fas fa-trash-can"></i>
                    </button>
                  </div>
                </div>

                <!-- Distortion Tags -->
                <div style="display:flex; gap:6px; flex-wrap:wrap;">
                  ${entry.distortions.map(distId => {
                    const d = COGNITIVE_DISTORTIONS.find(x => x.id === distId);
                    if (!d) return '';
                    const distName = isAr ? (d.nameAr || d.name) : d.name;
                    return `<span class="cbt-tag" style="background:${d.bg}; color:${d.color};"><i class="fas ${d.icon}"></i> ${distName}</span>`;
                  }).join('')}
                </div>

                <!-- Side-by-side Stumble vs Step -->
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:12px;">
                  <div class="cbt-stumble-box">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                      <span style="font-size:11px; font-weight:700; color:var(--red); text-transform:uppercase;">
                        <i class="fas fa-xmark"></i> ${isAr ? 'العثرة (الفخ السلبي)' : 'The Stumble'}
                      </span>
                      <span style="font-size:11px; color:var(--red); font-weight:700;">${isAr ? 'التصديق:' : 'Belief:'} ${entry.initialBelief}%</span>
                    </div>
                    <div style="font-size:13px; font-style:italic; line-height:1.4;">"${escHtml(entry.stumble)}"</div>
                  </div>

                  <div class="cbt-step-box">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                      <span style="font-size:11px; font-weight:700; color:var(--green); text-transform:uppercase;">
                        <i class="fas fa-check"></i> ${isAr ? 'الصياغة المتزنة' : 'Realistic Reframe'}
                      </span>
                      <span class="badge" style="background:var(--green-g); color:var(--green); font-weight:700; font-size:11px;">
                        ${shift > 0 ? (isAr ? `تراجع ${shift}% راحة` : `-${shift}% Shift`) : (isAr ? 'متزن' : 'Grounded')} (${entry.finalBelief}%)
                      </span>
                    </div>
                    <div style="font-size:13px; font-weight:600; line-height:1.4; color:var(--text);">"${escHtml(entry.stepReframe)}"</div>
                  </div>
                </div>

                <!-- Key Evidence or Best Friend Advice if present -->
                ${entry.friendAdvice ? `
                  <div style="font-size:12px; color:var(--purple); background:rgba(168, 85, 247, 0.05); padding:8px 12px; border-radius:8px; display:flex; align-items:center; gap:8px;">
                    <i class="fas fa-heart"></i>
                    <span><strong>${isAr ? 'نصيحة الصديق الرحيم:' : 'Friend Compassion:'}</strong> "${escHtml(entry.friendAdvice)}"</span>
                  </div>
                ` : ''}

                <!-- Micro-Action Checkbox -->
                ${entry.microAction ? `
                  <div style="display:flex; align-items:center; justify-content:space-between; background:var(--bg); border:1px solid var(--border); border-radius:8px; padding:8px 12px;">
                    <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:13px; font-weight:600; ${entry.actionDone ? 'text-decoration:line-through; color:var(--text2);' : ''}">
                      <input type="checkbox" ${entry.actionDone ? 'checked' : ''} onchange="toggleCbtAction('${entry.id}')" style="cursor:pointer; accent-color:var(--teal);">
                      <span>${isAr ? 'خطوة عملية:' : 'Micro-Action:'} ${escHtml(entry.microAction)}</span>
                    </label>
                    <span style="font-size:11px; color:${entry.actionDone ? 'var(--green)' : 'var(--text2)'}; font-weight:700;">
                      ${entry.actionDone ? (isAr ? '<i class="fas fa-circle-check"></i> تم الإنجاز (+10 نقاط)' : '<i class="fas fa-circle-check"></i> Completed (+10 XP)') : (isAr ? 'خطوة للبدء' : 'Action Step')}
                    </span>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}

function renderCbtFieldGuideTab() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  return `
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div class="card" style="padding:18px 20px; background:var(--card);">
        <h3 style="font-size:17px; font-weight:700; margin-bottom:4px;">${isAr ? 'دليل تشوهات التفكير المعرفية' : 'Cognitive Distortions Field Guide'}</h3>
        <p style="font-size:13px; color:var(--text2); line-height:1.5;">
          ${isAr ? 'التشوهات هي عدسات ضيقة ومشوهة يستخدمها العقل تلقائيًا تحت وطأة الضغط. التعرف على اسم الفخ وحده يمثل 80% من التحرر منه.' : 'Distortions are habitual, faulty lenses our brains use when stressed. Recognizing the trap pattern by name is 80% of breaking free.'}
        </p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:16px;">
        ${COGNITIVE_DISTORTIONS.map(d => {
          const name = isAr ? (d.nameAr || d.name) : d.name;
          const subtitle = isAr ? (d.subtitleAr || d.subtitle) : d.subtitle;
          const summary = isAr ? (d.summaryAr || d.summary) : d.summary;
          const trapPrompt = isAr ? (d.trapPromptAr || d.trapPrompt) : d.trapPrompt;
          const counterQuestion = isAr ? (d.counterQuestionAr || d.counterQuestion) : d.counterQuestion;
          return `
          <div class="card" style="padding:20px; display:flex; flex-direction:column; justify-content:space-between; gap:14px; border-top:3px solid ${d.color};">
            <div>
              <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                <div style="width:36px; height:36px; border-radius:10px; background:${d.bg}; display:flex; align-items:center; justify-content:center;">
                  <i class="fas ${d.icon}" style="color:${d.color}; font-size:16px;"></i>
                </div>
                <div>
                  <h4 style="font-size:16px; font-weight:700; line-height:1.2;">${name}</h4>
                  <span style="font-size:11px; color:var(--text2);">${subtitle}</span>
                </div>
              </div>

              <p style="font-size:13px; color:var(--text); line-height:1.5; margin-bottom:12px;">
                ${summary}
              </p>

              <div style="background:rgba(239, 68, 68, 0.05); border-left:3px solid var(--red); padding:8px 12px; border-radius:6px; font-size:12px; color:var(--text); margin-bottom:10px;">
                <strong style="color:var(--red);">${isAr ? 'كيف تبدو في ذهنك:' : 'How it sounds:'}</strong> "${trapPrompt}"
              </div>

              <div style="background:rgba(78, 205, 196, 0.06); border-left:3px solid var(--teal); padding:8px 12px; border-radius:6px; font-size:12px; color:var(--text);">
                <strong style="color:var(--teal);">${isAr ? 'سؤال المحقق لتفكيكها:' : 'Disarming Detective Question:'}</strong> ${counterQuestion}
              </div>
            </div>

            <button class="btn btn-sm btn-ghost" style="border:1px solid var(--border); width:100%; justify-content:center; color:var(--teal);" onclick="practiceDistortionInWorksheet('${d.id}')">
              <i class="fas fa-pen"></i> ${isAr ? 'تدرب على تفكيك هذا الفخ' : 'Practice Reframing This Trap'}
            </button>
          </div>
        `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderCbtAdhdCardsTab() {
  const isAr = typeof currentLang === 'function' && currentLang() === 'ar';
  return `
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div class="card" style="background:var(--card); border-left:4px solid var(--accent); padding:18px 20px;">
        <h3 style="font-size:17px; font-weight:700; margin-bottom:4px;">${isAr ? 'بطاقات مواجهة الشلل والتسويف لـ ADHD' : 'ADHD Compassion & Anti-Paralysis Reframes'}</h3>
        <p style="color:var(--text2); font-size:13px; line-height:1.5;">
          ${isAr ? 'يمر عقل ذوي تشتت الانتباه وفرط الحركة ADHD بحالات متكررة من شلل المهام، ولوم النفس بسبب التشتت، والجمود التام. احتفظ بهذه المراسي الداعمة أمامك:' : 'The neurodivergent and ADHD brain frequently hits task paralysis, intense distraction guilt, and perfectionist freeze. Keep these compassion anchors handy:'}
        </p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
        ${ADHD_REFRAMES.map(r => {
          const title = isAr ? (r.titleAr || r.title) : r.title;
          const problem = isAr ? (r.problemAr || r.problem) : r.problem;
          const reframe = isAr ? (r.reframeAr || r.reframe) : r.reframe;
          return `
          <div class="card" style="padding:18px; display:flex; flex-direction:column; gap:10px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="width:36px; height:36px; border-radius:10px; background:var(--teal-g); display:flex; align-items:center; justify-content:center;">
                <i class="fas ${r.icon}" style="color:var(--teal);"></i>
              </div>
              <h4 style="font-weight:700; font-size:15px;">${title}</h4>
            </div>

            <div style="font-size:12px; color:var(--red); font-weight:600; background:rgba(239,68,68,0.06); padding:8px 10px; border-radius:8px;">
              <i class="fas fa-xmark"></i> "${problem}"
            </div>

            <div style="font-size:12px; color:var(--green); background:var(--bg); border:1px solid rgba(34,197,94,0.2); padding:10px 12px; border-radius:8px; line-height:1.5;">
              <i class="fas fa-lightbulb"></i> <strong>${isAr ? 'إعادة الصياغة الرحيمة:' : 'Compassionate Reframe:'}</strong> ${reframe}
            </div>
          </div>
        `;
        }).join('')}
      </div>
    </div>
  `;
}

// ======================== ONBOARDING ========================
function showOnboarding(){
  const isAr = currentLang() === 'ar';
  const logoUrl = 'https://placehold.co/80x80/4ECDC4/0F0F14?text=S';

  // Ensure sticky notes are collapsed and hidden before user enters their name
  stickyNotesVisible = false;
  const layer = document.getElementById('sticky-notes-layer');
  if (layer) layer.style.display = 'none';
  const dock = document.getElementById('sticky-dock');
  if (dock) dock.style.display = 'none';

  showModal(`
    <div style="text-align:center">
      <div style="display:flex;justify-content:center;margin-bottom:12px">
        <img src="${logoUrl}" alt="Spark Logo" style="width:64px;height:64px;border-radius:14px;border:2px solid var(--teal);box-shadow:0 0 25px var(--teal-g);object-fit:cover;">
      </div>
      <div style="display:inline-flex;align-items:center;gap:6px;margin-bottom:14px;background:var(--card);padding:4px 10px;border-radius:20px;border:1px solid var(--border);">
        <button class="btn btn-xs ${isAr?'btn-teal':'btn-ghost'}" onclick="setLanguage('ar');showOnboarding();" style="font-size:11px;padding:3px 10px;">العربية (RTL)</button>
        <button class="btn btn-xs ${!isAr?'btn-teal':'btn-ghost'}" onclick="setLanguage('en');showOnboarding();" style="font-size:11px;padding:3px 10px;">English</button>
      </div>
      <h1 style="font-size:24px;margin-bottom:4px">${isAr ? 'مرحبًا بك في منصة سَبارك' : 'Welcome to Spark'}</h1>
      <p style="color:var(--text2);margin-bottom:20px;font-size:14px">${isAr ? 'خطوات صغيرة، انطلاقة عظيمة في التعلّم والتركيز والعلوم.' : 'Small steps, big momentum in learning and focus.'}</p>
      
      <div style="text-align:${isAr ? 'right' : 'left'};margin-bottom:16px">
        <label style="font-size:13px;color:var(--text2);display:block;margin-bottom:4px">${isAr ? 'ما هو اسمك المفضل؟' : 'What should we call you?'}</label>
        <input class="input" id="onb-name" placeholder="${isAr ? 'اكتب اسمك هنا...' : 'Your name'}" autofocus>
      </div>

      <div style="text-align:${isAr ? 'right' : 'left'};margin-bottom:16px">
        <label style="font-size:13px;color:var(--text2);display:block;margin-bottom:6px">${isAr ? 'المرحلة والصف الدراسي' : 'Grade'}</label>
        <div style="display:flex;flex-direction:column;gap:8px" id="onb-grades">
          <div>
            <div style="font-size:11px;color:var(--text2);margin-bottom:4px">${isAr ? 'المرحلة الابتدائية' : 'Primary'}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              ${[1,2,3,4,5,6].map(g=>`<button class="grade-pill" data-g="${g}" onclick="document.querySelectorAll('#onb-grades .grade-pill').forEach(p=>p.classList.remove('selected'));this.classList.add('selected')">${g}</button>`).join('')}
            </div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text2);margin-bottom:4px">${isAr ? 'المرحلة الإعدادية' : 'Preparatory'}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              ${[7,8,9].map(g=>`<button class="grade-pill" data-g="${g}" onclick="document.querySelectorAll('#onb-grades .grade-pill').forEach(p=>p.classList.remove('selected'));this.classList.add('selected')">${g}</button>`).join('')}
            </div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text2);margin-bottom:4px">${isAr ? 'المرحلة الثانوية' : 'Secondary'}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              ${[10,11,12].map(g=>`<button class="grade-pill" data-g="${g}" onclick="document.querySelectorAll('#onb-grades .grade-pill').forEach(p=>p.classList.remove('selected'));this.classList.add('selected')">${g}</button>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <div style="text-align:${isAr ? 'right' : 'left'};margin-bottom:24px">
        <label style="font-size:13px;color:var(--text2);display:block;margin-bottom:6px">${isAr ? 'اختر لون هويتك' : 'Color'}</label>
        <div style="display:flex;gap:8px;justify-content:center" id="onb-colors">
          ${['#FF8C42','#4ECDC4','#FF6B6B','#58A6FF','#A855F7','#22C55E'].map(c=>`<div class="color-opt" style="background:${c}" data-c="${c}" onclick="document.querySelectorAll('#onb-colors .color-opt').forEach(o=>o.classList.remove('selected'));this.classList.add('selected')"></div>`).join('')}
        </div>
      </div>

      <button class="btn btn-lg btn-primary" style="width:100%;justify-content:center" onclick="finishOnboarding()">
        ${isAr ? 'انطلق الآن في سبارك <i class="fas fa-arrow-left" style="margin-right:6px"></i>' : "Let's Go <i class=\"fas fa-arrow-right\" style=\"margin-left:6px\"></i>"}
      </button>
    </div>
  `);
  setTimeout(()=>{
    const g2=document.querySelector('#onb-grades [data-g="2"]');if(g2)g2.classList.add('selected');
    const c1=document.querySelector('#onb-colors [data-c="#4ECDC4"]') || document.querySelector('#onb-colors [data-c="#FF8C42"]');if(c1)c1.classList.add('selected');
  },50);
}
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

  // ONLY open the sticky note now that the user has entered their name on first launch
  const isAr = currentLang() === 'ar';
  stickyNotesVisible = true;
  try {
    localStorage.setItem('spark_sticky_notes_visible', 'true');
    localStorage.setItem('sticky_notes_visible', 'true');
  } catch(e) {}

  let notes = getStickyNotes();
  if (!notes || notes.length === 0) {
    notes = [
      {
        id: 'sn_welcome',
        text: isAr 
          ? `📌 مرحباً ${n}!\n• يمكنك سحب هذه البطاقة لأي مكان على الشاشة.\n• دوّن ملاحظاتك وأفكارك السريعة.\n• اضغط (-) لتصغيرها متى شئت!\n• استخدم قائمة البطاقات أسفل الشاشة.`
          : `📌 Welcome ${n}!\n• Drag me anywhere on screen.\n• Write reminders or quick ideas.\n• Minimize me (-) when busy!\n• Use the bottom-right dock anytime.`,
        color: 'yellow',
        x: Math.max(260, (typeof window !== 'undefined' ? window.innerWidth : 1000) - 280),
        y: 80,
        width: 230,
        height: 200,
        minimized: false,
        zIndex: 100
      }
    ];
  } else {
    // Uncollapse and open the note on first launch after name entry
    notes.forEach(note => {
      note.minimized = false;
      if (note.id === 'sn_welcome') {
        note.text = isAr 
          ? `📌 مرحباً ${n}!\n• يمكنك سحب هذه البطاقة لأي مكان على الشاشة.\n• دوّن ملاحظاتك وأفكارك السريعة.\n• اضغط (-) لتصغيرها متى شئت!`
          : `📌 Welcome ${n}!\n• Drag me anywhere on screen.\n• Write reminders or quick ideas.\n• Minimize me (-) when busy!`;
      }
    });
  }
  saveStickyNotes(notes);

  const layer = document.getElementById('sticky-notes-layer');
  const dock = document.getElementById('sticky-dock');
  const visText = document.getElementById('sticky-vis-text');
  if (layer) layer.style.display = 'block';
  if (dock) dock.style.display = 'flex';
  if (visText) visText.textContent = isAr ? 'إخفاء الكل' : 'Hide All';
  renderStickyNotes();
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
  // Initialize language & RTL
  const initialLang = currentLang();
  const isAr = initialLang === 'ar';
  document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', isAr ? 'ar' : 'en');
  if (isAr) document.body.classList.add('rtl'); else document.body.classList.remove('rtl');
  
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  if (langToggleBtn) langToggleBtn.onclick = toggleLanguage;
  const langLabel = document.getElementById('lang-toggle-label');
  if (langLabel) langLabel.textContent = isAr ? 'English' : 'العربية';
  
  const subEl = document.getElementById('logo-subtitle');
  if (subEl) subEl.textContent = isAr ? 'منصة التعلّم والتركيز' : 'Learn & Focus';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    if (I18N[initialLang] && I18N[initialLang][k]) {
      el.textContent = I18N[initialLang][k];
    }
  });

  document.querySelectorAll('#nav a').forEach(a => {
    const v = a.dataset.view;
    if (VIEW_INFO[v]) {
      const title = isAr && VIEW_INFO[v].titleAr ? VIEW_INFO[v].titleAr : VIEW_INFO[v].title;
      a.setAttribute('data-tooltip', title);
      a.setAttribute('title', title);
    }
  });

  if(!Store.get('user')) {
    stickyNotesVisible = false;
    const layer = document.getElementById('sticky-notes-layer');
    if (layer) layer.style.display = 'none';
    const dock = document.getElementById('sticky-dock');
    if (dock) dock.style.display = 'none';
    showOnboarding();
  } else {
    Store.updateStreak();
    updateUserPanel();
    renderDashboard();

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
    const dock = document.getElementById('sticky-dock');
    const visText = document.getElementById('sticky-vis-text');
    if (layer) layer.style.display = stickyNotesVisible ? 'block' : 'none';
    if (dock) dock.style.display = 'flex';
    if (visText) visText.textContent = stickyNotesVisible ? (isAr ? 'إخفاء الكل' : 'Hide All') : (isAr ? 'إظهار الكل' : 'Show All');

    renderStickyNotes();
  }
  const savedThemeId = Store.get('inventory').equipped.theme;
  const savedTheme = CATALOG.themes.find(t=>t.id===savedThemeId);
  if(savedTheme) applyTheme(savedTheme);

  document.querySelectorAll('#nav a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();SFX.click();navigate(a.dataset.view);}));
  window.addEventListener('hashchange',()=>{const v=location.hash.slice(1);if(v&&VN.includes(v))navigate(v);});

  // Sidebar toggling & collapse listeners
  const menuBtn = document.getElementById('menu-btn');
  if (menuBtn) menuBtn.onclick = toggleSidebarCollapse;

  const topbarBtn = document.getElementById('topbar-toggle-btn');
  if (topbarBtn) topbarBtn.onclick = toggleSidebarCollapse;

  const sidebarCollapseBtn = document.getElementById('sidebar-collapse-btn');
  if (sidebarCollapseBtn) sidebarCollapseBtn.onclick = toggleSidebarCollapse;

  const sidebarFooterToggle = document.getElementById('sidebar-footer-toggle');
  if (sidebarFooterToggle) sidebarFooterToggle.onclick = toggleSidebarCollapse;

  const backdrop = document.getElementById('sidebar-backdrop');
  if (backdrop) backdrop.onclick = closeSidebarMobile;

  document.getElementById('main').addEventListener('click', (e) => {
    if (e.target && e.target.closest('#topbar-toggle-btn')) return;
    if (window.innerWidth <= 540) closeSidebarMobile();
    closeStickyDockMenu();
  });

  // Restore sidebar collapsed preference on desktop
  try {
    const savedCollapsed = localStorage.getItem('spark_sidebar_collapsed') === 'true';
    if (savedCollapsed && window.innerWidth > 540) {
      document.body.classList.add('sidebar-collapsed');
      updateCollapseIcons(true);
    } else {
      updateCollapseIcons(false);
    }
  } catch(e) {}

  updateTopBar();

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar collapse
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      toggleSidebarCollapse();
    }
    if (e.key === 'Escape') closeModal();
  });
  
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && focusState.running && focusState.mode === 'focus') {
      logDistraction(true);
    }
  });
  FlashDB.open().catch(()=>{});
}
init();
