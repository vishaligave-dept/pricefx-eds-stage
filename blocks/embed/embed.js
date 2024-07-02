import { loadScript } from '../../scripts/aem.js';
import { DM_VIDEO_SERVER_URL, DM_SERVER_URL } from '../../scripts/url-constants.js';

const getDefaultEmbed = (url, autoplay) => `<div class="embed-default">
    <iframe src="${url.href}" allowfullscreen="" scrolling="no" allow="${autoplay ? 'autoplay; ' : ''}encrypted-media" 
        title="Content from ${url.hostname}" loading="lazy">
    </iframe>
  </div>`;

const embedBrightcove = (url, autoplay) => {
  const [, account, player] = url.pathname.split('/');
  const video = url.searchParams.get('videoId');
  loadScript(`https://players.brightcove.net/${account}/${player}/index.min.js`, {});
  return `<div>
    <video-js data-account="${account}"
      data-player="${player.split('_')[0]}"
      data-embed="default"
      controls=""
      data-video-id="${video}"
      data-playlist-id=""
      data-application-id=""
      ${autoplay ? 'autoplay=true' : ''}
      ${autoplay ? 'muted=true' : ''}
      class="video-js vjs-fluid"></video-js>
  </div>`;
};

const embedTwitter = (url) => {
  const embedHTML = `<blockquote class="twitter-tweet"><a href="${url.href}"></a></blockquote>`;
  loadScript('https://platform.twitter.com/widgets.js', {});
  return embedHTML;
};

const embedVidyard = (url, autoplay) => {
  const { length, [length - 1]: video } = url.pathname.split('/');
  loadScript('https://play.vidyard.com/embed/v4.js', {});
  return `<div>
    <img class="vidyard-player-embed"
          src="https://play.vidyard.com/${video}.jpg"
          alt=""
          data-uuid="${video}"
          data-v="4"
          data-type="inline"
          data-autoplay="${autoplay ? '1' : '0'}"
          data-muted="${autoplay ? '1' : '0'}"
          loading="lazy"/>
  </div>`;
};

const embedVimeo = (url, autoplay) => {
  const [, video] = url.pathname.split('/');
  const suffix = autoplay ? '?muted=1&autoplay=1' : '';
  return `<div class="embed-vimeo">
      <iframe src="https://player.vimeo.com/video/${video}${suffix}" frameborder="0" 
      allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Content from Vimeo" loading="lazy"></iframe>
    </div>`;
};

const embedWistia = (url, autoplay) => {
  const { length, [length - 1]: video } = url.pathname.split('/');
  loadScript(`//fast.wistia.com/embed/medias/${video}.jsonp`, {});
  loadScript('//fast.wistia.com/assets/external/E-v1.js', {});
  return `<div class="embed-wistia">
    <div class="embed-wistia-responsive-wrapper">
    <div class="wistia_embed wistia_async_${video} ${autoplay ? 'autoPlay=true' : ''} seo=false videoFoam=true">
        &nbsp;</div></div></div>`;
};

const embedYoutube = (url, autoplay) => {
  const usp = new URLSearchParams(url.search);
  const suffix = autoplay ? '&muted=1&autoplay=1' : '';
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  const embed = url.pathname;
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }
  return `<div class="embed-youtube">
      <iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}${suffix}` : embed}" 
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; picture-in-picture" 
        allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>
    </div>`;
};

const embedScene7 = (url, autoplay, block) => {
  const params = new URLSearchParams(url.search);
  const asset = params.get('asset');
  const serverurl = DM_SERVER_URL;
  const videoserverurl = DM_VIDEO_SERVER_URL;

  return new Promise((resolve, reject) => {
    const timestamp = new Date().getTime();
    const s7viewerDiv = document.createElement('div');
    s7viewerDiv.id = `s7viewer-${timestamp}`;
    s7viewerDiv.style.cssText = 'position:relative;';

    block.appendChild(s7viewerDiv);

    loadScript('https://s7d9.scene7.com/s7viewers/html5/js/VideoViewer.js')
      .then(() => {
        const scene7Script = document.createElement('script');
        scene7Script.textContent = `
        var videoViewer = new s7viewers.VideoViewer({
          "containerId": "s7viewer-${timestamp}",
          "params": {
            "autoplay":"${autoplay ? '1' : '0'}",
            "asset": "${asset}",
            "serverurl": "${serverurl}",
            "videoserverurl": "${videoserverurl}"
          }
        }).init();`;

        block.appendChild(scene7Script);
        resolve(s7viewerDiv);
      })
      .catch(reject);
  });
};

async function loadModal(block) {
  const { openModal } = await import(`${window.hlx.codeBasePath}/blocks/modal/modal.js`);
  const modalContent = block.cloneNode(true); // Clone the block to reload its content
  openModal({ block: modalContent });
}
let scene7VideoElement;
const loadEmbed = (block, link, autoplay, isPopup) => {
  if (block.classList.contains('embed-is-loaded')) {
    return;
  }

  const EMBEDS_CONFIG = [
    {
      match: ['brightcove'],
      embed: embedBrightcove,
    },
    {
      match: ['twitter'],
      embed: embedTwitter,
    },
    {
      match: ['vidyard'],
      embed: embedVidyard,
    },
    {
      match: ['vimeo'],
      embed: embedVimeo,
    },
    {
      match: ['wistia'],
      embed: embedWistia,
    },
    {
      match: ['youtube', 'youtu.be'],
      embed: embedYoutube,
    },
    {
      match: ['scene7'],
      embed: embedScene7,
    },
  ];

  const config = EMBEDS_CONFIG.find((e) => e.match.some((match) => link.includes(match)));
  const url = new URL(link);

  if (isPopup === 'true') {
    if (config) {
      if (config.match.includes('scene7')) {
        const container = document.createElement('div');
        config
          .embed(url, autoplay, container)
          .then((holder) => {
            container.classList = `embed embed-${config.match[0]}`;
            container.classList.add('embed-is-loaded');
            container.append(holder);
            loadModal(container);
          })
          .catch(() => {});
        return;
      }
      const embedHTML = document.createElement('div');
      embedHTML.classList = `embed embed-${config.match[0]}`;
      embedHTML.innerHTML = config.embed(url, autoplay);
      embedHTML.classList.add('embed-is-loaded');
      loadModal(embedHTML);
      return;
    }
    const embedHTML = document.createElement('div');
    embedHTML.innerHTML = getDefaultEmbed(url);
    embedHTML.classList = 'embed';
    embedHTML.classList.add('embed-is-loaded');
    loadModal(embedHTML);
    return;
  }

  if (config) {
    if (config.match.includes('scene7')) {
      // Load the Scene7 video
      config
        .embed(url, autoplay, block)
        .then((holder) => {
          scene7VideoElement = holder;
          block.textContent = '';
          block.append(scene7VideoElement);
          block.classList = `block embed embed-${config.match[0]}`;
          block.classList.add('embed-is-loaded');
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Error loading Scene7 video:', error);
        });
    } else {
      block.innerHTML = config.embed(url, autoplay);
      block.classList = `block embed embed-${config.match[0]}`;
      block.classList.add('embed-is-loaded');
    }
  } else {
    const buzzSprout = url.hostname.includes('buzzsprout') ? 'buzzsprout' : '';
    block.innerHTML = getDefaultEmbed(url);
    block.classList = `block embed ${buzzSprout}`;
    block.classList.add('embed-is-loaded');
  }
};

export default function decorate(block) {
  const placeholder = block.querySelector('picture');
  const link = block.querySelector('a')?.href;
  const overlayText = block.children[2]?.textContent.trim();
  const isPopup = block.children[3]?.textContent.trim();
  block.textContent = '';

  if (placeholder) {
    const wrapper = document.createElement('div');
    wrapper.className = 'embed-placeholder';
    if (overlayText) {
      wrapper.innerHTML = `
      <div class="embed-placeholder-play">
        <button type="button" title="Play"></button>
        <p class="embed-play-title">${overlayText}</p>
      </div>`;
    } else {
      wrapper.innerHTML = '<div class="embed-placeholder-play"><button type="button" title="Play"></button></div>';
    }
    wrapper.prepend(placeholder);
    wrapper.addEventListener('click', async () => {
      loadEmbed(block, link, true, isPopup);
    });
    block.append(wrapper);
  } else {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadEmbed(block, link);
      }
    });
    observer.observe(block);
  }
}

export function decorateEmbed(block) {
  decorate(block);
}
