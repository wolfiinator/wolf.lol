let hasUserInteracted = false;

function initMedia() {
  console.log("initMedia called");
  const musicPlayer = document.getElementById('music-player');
  const backgroundVideo = document.getElementById('background');
  if (!musicPlayer || !backgroundVideo) {
    console.error("Media elements not found");
    return;
  }
  musicPlayer.volume = 0.3;
  backgroundVideo.muted = true; 
  backgroundVideo.loop = true;

  const applyVideoFallback = () => {
    document.body.classList.add('video-fallback');
    backgroundVideo.classList.add('hidden');
  };
  backgroundVideo.addEventListener('error', applyVideoFallback);
  const backgroundSource = backgroundVideo.querySelector('source');
  if (backgroundSource) {
    backgroundSource.addEventListener('error', applyVideoFallback);
  }

  
  backgroundVideo.play().catch(err => {
    console.error("Failed to play background video:", err);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const startScreen = document.getElementById('start-screen');
  const startText = document.getElementById('start-text');
  const profileName = document.getElementById('profile-name');
  const profileBio = document.getElementById('profile-bio');
  const visitorCount = document.getElementById('visitor-count');
  const musicPlayer = document.getElementById('music-player');
  const musicManifestNode = document.getElementById('music-manifest');
  const homeButton = document.getElementById('home-theme');
  const hackerButton = document.getElementById('hacker-theme');
  const rainButton = document.getElementById('rain-theme');
  const animeButton = document.getElementById('anime-theme');
  const carButton = document.getElementById('car-theme');
  const resultsButtons = document.querySelectorAll('.results-toggle');
  const profileClock = document.getElementById('profile-clock');
  const volumeIcon = document.getElementById('volume-icon');
  const volumeSlider = document.getElementById('volume-slider');
  const transparencySlider = document.getElementById('transparency-slider');
  const backgroundVideo = document.getElementById('background');
  const hackerOverlay = document.getElementById('hacker-overlay');
  const snowOverlay = document.getElementById('snow-overlay');
  const glitchOverlay = document.querySelector('.glitch-overlay');
  const profileBlock = document.getElementById('profile-block');
  const skillsBlock = document.getElementById('skills-block');
  const profilePicture = document.querySelector('.profile-picture');
  const profileContainer = document.querySelector('.profile-container');
  const socialIcons = document.querySelectorAll('.social-icon');
  const badges = document.querySelectorAll('.badge');
  const interestTabs = document.querySelectorAll('.interest-tab');
  const interestImage = document.getElementById('interest-image');
  const interestName = document.getElementById('interest-name');
  const interestDescription = document.getElementById('interest-description');

  const interestsContent = {
    beastars: {
      name: 'Beastars',
      image: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/BEASTARS%2C_volume_1.jpg/250px-BEASTARS%2C_volume_1.jpg',
      alt: 'Beastars volume cover art',
      description: "In this anthropomorphic world, gentle wolf Legoshi struggles with instinct, identity, and love after a classmate's murder deepens the divide between carnivores and herbivores at Cherryton Academy."
    },
    'fantastic-mr-fox': {
      name: 'Fantastic Mr. Fox',
      image: 'https://upload.wikimedia.org/wikipedia/en/a/af/Fantastic_mr_fox.jpg',
      alt: 'Fantastic Mr. Fox theatrical poster',
      description: 'A clever fox returns to stealing from three ruthless farmers, pulling his family and entire animal community into a stylish, hilarious underground survival heist.'
    },
    'the-bad-guys-1': {
      name: 'The Bad Guys (2022)',
      image: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/00/The_Bad_Guys_poster.jpeg/250px-The_Bad_Guys_poster.jpeg',
      alt: 'The Bad Guys 2022 poster',
      description: 'After years of high-profile crimes, a notorious animal crew is forced into a good-behavior experiment that starts as a con but slowly becomes a real shot at redemption.'
    },
    'the-bad-guys-2': {
      name: 'The Bad Guys 2 (2025)',
      image: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/The_Bad_Guys_2_%282025%29_teaser_poster.jpg/250px-The_Bad_Guys_2_%282025%29_teaser_poster.jpg',
      alt: 'The Bad Guys 2 teaser poster',
      description: 'The reformed crew gets pulled back into the action when a new all-female criminal team forces them into one more globe-trotting heist.'
    }
  };

  
  const fallbackManifest = {
    folder: 'assets',
    tracks: [
      { name: 'Background', file: 'background_music.mp3', theme: 'home-theme' },
      { name: 'Hacker', file: 'hacker_music.mp3', theme: 'hacker-theme' },
      { name: 'Rain', file: 'rain_music.mp3', theme: 'rain-theme' },
      { name: 'Anime', file: 'anime_music.mp3', theme: 'anime-theme' },
      { name: 'Car', file: 'car_music.mp3', theme: 'car-theme' }
    ]
  };

  function parseMusicManifest() {
    if (!musicManifestNode) {
      return fallbackManifest;
    }

    try {
      const parsed = JSON.parse(musicManifestNode.textContent);
      if (!Array.isArray(parsed?.tracks) || parsed.tracks.length === 0) {
        return fallbackManifest;
      }
      return parsed;
    } catch (err) {
      console.error('Failed to parse music manifest:', err);
      return fallbackManifest;
    }
  }

  const musicManifest = parseMusicManifest();

  function resolveTrackSrc(track) {
    const folder = (musicManifest.folder || 'assets').replace(/\/$/, '');
    return `${folder}/${track.file}`;
  }

  function findTrackByTheme(themeClass) {
    const themedTrack = musicManifest.tracks.find((track) => track.theme === themeClass);
    return themedTrack || musicManifest.tracks[0];
  }


  const cursor = document.querySelector('.custom-cursor');
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

  if (isTouchDevice) {
    document.body.classList.add('touch-device');
    
    document.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      cursor.style.left = touch.clientX + 'px';
      cursor.style.top = touch.clientY + 'px';
      cursor.style.display = 'block';
    });

    document.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      cursor.style.left = touch.clientX + 'px';
      cursor.style.top = touch.clientY + 'px';
      cursor.style.display = 'block';
    });

    document.addEventListener('touchend', () => {
      cursor.style.display = 'none'; 
    });
  } else {

    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      cursor.style.display = 'block';
    });

    document.addEventListener('mousedown', () => {
      cursor.style.transform = 'scale(0.8) translate(-50%, -50%)';
    });

    document.addEventListener('mouseup', () => {
      cursor.style.transform = 'scale(1) translate(-50%, -50%)';
    });
  }


  const startMessage = "wolf.lol";
  let startTextContent = '';
  let startIndex = 0;
  let startCursorVisible = true;

  function typeWriterStart() {
    if (startIndex < startMessage.length) {
      startTextContent = startMessage.slice(0, startIndex + 1);
      startIndex++;
    }
    startText.textContent = startTextContent + (startCursorVisible ? '|' : ' ');
    setTimeout(typeWriterStart, 100);
  }


  setInterval(() => {
    startCursorVisible = !startCursorVisible;
    startText.textContent = startTextContent + (startCursorVisible ? '|' : ' ');
  }, 500);


  function initializeVisitorCounter() {
    let totalVisitors = localStorage.getItem('totalVisitorCount');
    if (!totalVisitors) {
      totalVisitors = 7922;
      localStorage.setItem('totalVisitorCount', totalVisitors);
    } else {
      totalVisitors = parseInt(totalVisitors);
    }

    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      totalVisitors++;
      localStorage.setItem('totalVisitorCount', totalVisitors);
      localStorage.setItem('hasVisited', 'true');
    }

    visitorCount.textContent = totalVisitors.toLocaleString();
  }


  initializeVisitorCounter();

  function updateProfileClock() {
    const time = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    profileClock.textContent = `local time: ${time}`;
  }

  updateProfileClock();
  setInterval(updateProfileClock, 1000);


  startScreen.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    currentAudio.muted = false;
    currentAudio.play().catch(err => {
      console.error("Failed to play music after start screen click:", err);
    });
    profileBlock.classList.remove('hidden');
    gsap.fromTo(profileBlock,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out', onComplete: () => {
        profileBlock.classList.add('profile-appear');
        profileContainer.classList.add('orbit');
      }}
    );
    if (!isTouchDevice) {
      try {
        new cursorTrailEffect({
          length: 10,
          size: 8,
          speed: 0.2
        });
        console.log("Cursor trail initialized");
      } catch (err) {
        console.error("Failed to initialize cursor trail effect:", err);
      }
    }
    typeWriterName();
    typeWriterBio();
  });

  startScreen.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startScreen.classList.add('hidden');
    currentAudio.muted = false;
    currentAudio.play().catch(err => {
      console.error("Failed to play music after start screen touch:", err);
    });
    profileBlock.classList.remove('hidden');
    gsap.fromTo(profileBlock,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out', onComplete: () => {
        profileBlock.classList.add('profile-appear');
        profileContainer.classList.add('orbit');
      }}
    );
    if (!isTouchDevice) {
      try {
        new cursorTrailEffect({
          length: 10,
          size: 8,
          speed: 0.2
        });
        console.log("Cursor trail initialized");
      } catch (err) {
        console.error("Failed to initialize cursor trail effect:", err);
      }
    }
    typeWriterName();
    typeWriterBio();
  });


  const name = "wolf.";
  let nameText = '';
  let nameIndex = 0;
  let isNameDeleting = false;
  let nameCursorVisible = true;

  function typeWriterName() {
    if (!isNameDeleting && nameIndex < name.length) {
      nameText = name.slice(0, nameIndex + 1);
      nameIndex++;
    } else if (isNameDeleting && nameIndex > 0) {
      nameText = name.slice(0, nameIndex - 1);
      nameIndex--;
    } else if (nameIndex === name.length) {
      isNameDeleting = true;
      setTimeout(typeWriterName, 10000);
      return;
    } else if (nameIndex === 0) {
      isNameDeleting = false;
    }
    profileName.textContent = nameText + (nameCursorVisible ? '|' : ' ');
    if (Math.random() < 0.1) {
      profileName.classList.add('glitch');
      setTimeout(() => profileName.classList.remove('glitch'), 200);
    }
    setTimeout(typeWriterName, isNameDeleting ? 150 : 300);
  }

  setInterval(() => {
    nameCursorVisible = !nameCursorVisible;
    profileName.textContent = nameText + (nameCursorVisible ? '|' : ' ');
  }, 500);


  const bioMessages = [
    "love yall.",
    "the best oat."
  ];
  let bioText = '';
  let bioIndex = 0;
  let bioMessageIndex = 0;
  let isBioDeleting = false;
  let bioCursorVisible = true;

  function typeWriterBio() {
    if (!isBioDeleting && bioIndex < bioMessages[bioMessageIndex].length) {
      bioText = bioMessages[bioMessageIndex].slice(0, bioIndex + 1);
      bioIndex++;
    } else if (isBioDeleting && bioIndex > 0) {
      bioText = bioMessages[bioMessageIndex].slice(0, bioIndex - 1);
      bioIndex--;
    } else if (bioIndex === bioMessages[bioMessageIndex].length) {
      isBioDeleting = true;
      setTimeout(typeWriterBio, 2000);
      return;
    } else if (bioIndex === 0 && isBioDeleting) {
      isBioDeleting = false;
      bioMessageIndex = (bioMessageIndex + 1) % bioMessages.length;
    }
    profileBio.textContent = bioText + (bioCursorVisible ? '|' : ' ');
    if (Math.random() < 0.1) {
      profileBio.classList.add('glitch');
      setTimeout(() => profileBio.classList.remove('glitch'), 200);
    }
    setTimeout(typeWriterBio, isBioDeleting ? 75 : 150);
  }

  setInterval(() => {
    bioCursorVisible = !bioCursorVisible;
    profileBio.textContent = bioText + (bioCursorVisible ? '|' : ' ');
  }, 500);


  let currentAudio = musicPlayer;

  function playTrackForTheme(themeClass) {
    const track = findTrackByTheme(themeClass);
    if (!track) {
      return;
    }

    const nextSrc = resolveTrackSrc(track);
    if (!currentAudio.src.endsWith(nextSrc)) {
      currentAudio.src = nextSrc;
      currentAudio.load();
    }

    currentAudio.volume = volumeSlider.value;
    currentAudio.muted = isMuted;
    currentAudio.play().catch(err => console.error('Failed to play theme music:', err));
  }

  let isMuted = false;
  currentAudio.muted = true;
  playTrackForTheme('home-theme');

  volumeIcon.addEventListener('click', () => {
    isMuted = !isMuted;
    currentAudio.muted = isMuted;
    volumeIcon.innerHTML = isMuted
      ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>`
      : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>`;
  });

  volumeIcon.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isMuted = !isMuted;
    currentAudio.muted = isMuted;
    volumeIcon.innerHTML = isMuted
      ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>`
      : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>`;
  });

  volumeSlider.addEventListener('input', () => {
    currentAudio.volume = volumeSlider.value;
    isMuted = false;
    currentAudio.muted = false;
    volumeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>`;
  });


  transparencySlider.addEventListener('input', () => {
    const opacity = transparencySlider.value;
    if (opacity == 0) {
      profileBlock.style.background = 'rgba(0, 0, 0, 0)';
      profileBlock.style.borderOpacity = '0';
      profileBlock.style.borderColor = 'transparent';
      profileBlock.style.backdropFilter = 'none';
      skillsBlock.style.background = 'rgba(0, 0, 0, 0)';
      skillsBlock.style.borderOpacity = '0';
      skillsBlock.style.borderColor = 'transparent';
      skillsBlock.style.backdropFilter = 'none';
   
      profileBlock.style.pointerEvents = 'auto';
      socialIcons.forEach(icon => {
        icon.style.pointerEvents = 'auto';
        icon.style.opacity = '1';
      });
      badges.forEach(badge => {
        badge.style.pointerEvents = 'auto';
        badge.style.opacity = '1';
      });
      profilePicture.style.pointerEvents = 'auto';
      profilePicture.style.opacity = '1';
      profileName.style.opacity = '1';
      profileBio.style.opacity = '1';
      visitorCount.style.opacity = '1';
    } else {
      profileBlock.style.background = `rgba(0, 0, 0, ${opacity})`;
      profileBlock.style.borderOpacity = opacity;
      profileBlock.style.borderColor = '';
      profileBlock.style.backdropFilter = `blur(${10 * opacity}px)`;
      skillsBlock.style.background = `rgba(0, 0, 0, ${opacity})`;
      skillsBlock.style.borderOpacity = opacity;
      skillsBlock.style.borderColor = '';
      skillsBlock.style.backdropFilter = `blur(${10 * opacity}px)`;
      profileBlock.style.pointerEvents = 'auto';
      socialIcons.forEach(icon => {
        icon.style.pointerEvents = 'auto';
        icon.style.opacity = '1';
      });
      badges.forEach(badge => {
        badge.style.pointerEvents = 'auto';
        badge.style.opacity = '1';
      });
      profilePicture.style.pointerEvents = 'auto';
      profilePicture.style.opacity = '1';
      profileName.style.opacity = '1';
      profileBio.style.opacity = '1';
      visitorCount.style.opacity = '1';
    }
  });


  function switchTheme(videoSrc, themeClass, overlay = null, overlayOverProfile = false) {
    let primaryColor;
    switch (themeClass) {
      case 'home-theme':
        primaryColor = '#00CED1';
        break;
      case 'hacker-theme':
        primaryColor = '#22C55E';
        break;
      case 'rain-theme':
        primaryColor = '#1E3A8A';
        break;
      case 'anime-theme':
        primaryColor = '#DC2626';
        break;
      case 'car-theme':
        primaryColor = '#EAB308';
        break;
      default:
        primaryColor = '#00CED1';
    }
    document.documentElement.style.setProperty('--primary-color', primaryColor);

    gsap.to(backgroundVideo, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        backgroundVideo.src = videoSrc;

        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
        playTrackForTheme(themeClass);

        document.body.classList.remove('home-theme', 'hacker-theme', 'rain-theme', 'anime-theme', 'car-theme');
        document.body.classList.add(themeClass);

        hackerOverlay.classList.add('hidden');
        snowOverlay.classList.add('hidden');
        profileBlock.style.zIndex = overlayOverProfile ? 10 : 20;
        skillsBlock.style.zIndex = overlayOverProfile ? 10 : 20;
        if (overlay) {
          overlay.classList.remove('hidden');
        }

        gsap.to(backgroundVideo, {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          onComplete: () => {
            profileContainer.classList.remove('orbit');
            void profileContainer.offsetWidth;
            profileContainer.classList.add('orbit');
          }
        });
      }
    });
  }


  homeButton.addEventListener('click', () => {
    switchTheme('assets/background.mp4', 'home-theme');
  });
  homeButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    switchTheme('assets/background.mp4', 'home-theme');
  });

  hackerButton.addEventListener('click', () => {
    switchTheme('assets/background.mp4', 'hacker-theme', hackerOverlay, false);
  });
  hackerButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    switchTheme('assets/background.mp4', 'hacker-theme', hackerOverlay, false);
  });

  rainButton.addEventListener('click', () => {
    switchTheme('assets/background.mp4', 'rain-theme', snowOverlay, true);
  });
  rainButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    switchTheme('assets/background.mp4', 'rain-theme', snowOverlay, true);
  });

  animeButton.addEventListener('click', () => {
    switchTheme('assets/background.mp4', 'anime-theme');
  });
  animeButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    switchTheme('assets/background.mp4', 'anime-theme');
  });

  carButton.addEventListener('click', () => {
    switchTheme('assets/background.mp4', 'car-theme');
  });
  carButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    switchTheme('assets/background.mp4', 'car-theme');
  });

 
  function handleTilt(e, element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let clientX, clientY;

    if (e.type === 'touchmove') {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const mouseX = clientX - centerX;
    const mouseY = clientY - centerY;

    const maxTilt = 15;
    const tiltX = (mouseY / rect.height) * maxTilt;
    const tiltY = -(mouseX / rect.width) * maxTilt;

    gsap.to(element, {
      rotationX: tiltX,
      rotationY: tiltY,
      duration: 0.3,
      ease: 'power2.out',
      transformPerspective: 1000
    });
  }

  profileBlock.addEventListener('mousemove', (e) => handleTilt(e, profileBlock));
  profileBlock.addEventListener('touchmove', (e) => {
    e.preventDefault();
    handleTilt(e, profileBlock);
  });

  skillsBlock.addEventListener('mousemove', (e) => handleTilt(e, skillsBlock));
  skillsBlock.addEventListener('touchmove', (e) => {
    e.preventDefault();
    handleTilt(e, skillsBlock);
  });

  profileBlock.addEventListener('mouseleave', () => {
    gsap.to(profileBlock, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.5,
      ease: 'power2.out'
    });
  });
  profileBlock.addEventListener('touchend', () => {
    gsap.to(profileBlock, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.5,
      ease: 'power2.out'
    });
  });

  skillsBlock.addEventListener('mouseleave', () => {
    gsap.to(skillsBlock, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.5,
      ease: 'power2.out'
    });
  });
  skillsBlock.addEventListener('touchend', () => {
    gsap.to(skillsBlock, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.5,
      ease: 'power2.out'
    });
  });


  profilePicture.addEventListener('mouseenter', () => {
    glitchOverlay.style.opacity = '1';
    setTimeout(() => {
      glitchOverlay.style.opacity = '0';
    }, 500);
  });


  profilePicture.addEventListener('click', () => {
    profileContainer.classList.remove('fast-orbit');
    profileContainer.classList.remove('orbit');
    void profileContainer.offsetWidth;
    profileContainer.classList.add('fast-orbit');
    setTimeout(() => {
      profileContainer.classList.remove('fast-orbit');
      void profileContainer.offsetWidth;
      profileContainer.classList.add('orbit');
    }, 500);
  });

  profilePicture.addEventListener('touchstart', (e) => {
    e.preventDefault();
    profileContainer.classList.remove('fast-orbit');
    profileContainer.classList.remove('orbit');
    void profileContainer.offsetWidth;
    profileContainer.classList.add('fast-orbit');
    setTimeout(() => {
      profileContainer.classList.remove('fast-orbit');
      void profileContainer.offsetWidth;
      profileContainer.classList.add('orbit');
    }, 500);
  });

 
  let isShowingSkills = false;

  function setResultsButtonText() {
    const label = isShowingSkills ? 'Back to Profile' : 'View Results';
    resultsButtons.forEach((button) => {
      button.textContent = label;
    });
  }

  function toggleResultsView() {
    if (!isShowingSkills) {
      gsap.to(profileBlock, {
        x: -100,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          profileBlock.classList.add('hidden');
          skillsBlock.classList.remove('hidden');
          gsap.fromTo(skillsBlock,
            { x: 100, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
          );
        }
      });
      isShowingSkills = true;
    } else {
      gsap.to(skillsBlock, {
        x: 100,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          skillsBlock.classList.add('hidden');
          profileBlock.classList.remove('hidden');
          gsap.fromTo(profileBlock,
            { x: -100, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
          );
        }
      });
      isShowingSkills = false;
    }
    setResultsButtonText();
  }

  setResultsButtonText();

  resultsButtons.forEach((button) => {
    button.addEventListener('click', toggleResultsView);
    button.addEventListener('touchstart', (e) => {
      e.preventDefault();
      toggleResultsView();
    });
  });

  function updateInterestTab(interestKey) {
    const interest = interestsContent[interestKey];
    if (!interest || !interestImage || !interestName || !interestDescription) return;

    interestImage.src = interest.image;
    interestImage.alt = interest.alt;
    interestName.textContent = interest.name;
    interestDescription.textContent = interest.description;

    interestTabs.forEach((tab) => {
      const isActive = tab.dataset.interest === interestKey;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });
  }

  interestTabs.forEach((tab) => {
    tab.addEventListener('click', () => updateInterestTab(tab.dataset.interest));
    tab.addEventListener('touchstart', (e) => {
      e.preventDefault();
      updateInterestTab(tab.dataset.interest);
    });
  });

  updateInterestTab('beastars');


  typeWriterStart();
});
