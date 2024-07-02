import { environmentMode, processUrl } from '../../scripts/global-functions.js';
import { decorateIcons } from '../../scripts/aem.js';

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      if (col.firstElementChild === null) {
        col.style.border = 'none';
        col.style.background = 'none';
        col.style.boxShadow = 'none';
      }

      const downloadLink = col.querySelectorAll('a');
      downloadLink.forEach((download) => {
        if (download?.textContent.trim() === 'download') {
          download.classList.add('download-btn');
          download.setAttribute('aria-label', 'download');
          const processLink = processUrl(download.href);
          download.href = processLink;
          const downloadImg = `<span class="icon icon-download"></span>`;
          download.innerHTML = downloadImg;
          decorateIcons(download, '', 'Pricefx', 'png');
        }
      });

      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        const picParent = pic.parentElement;
        if (picWrapper) {
          picWrapper.classList.add('columns-img-col');
        }

        const linkwrapper = pic.parentElement.nextElementSibling;
        const aInsideStrong = linkwrapper?.querySelector('strong a');
        const aInsideEM = linkwrapper?.querySelector('em a');
        const a = linkwrapper?.querySelector('a');
        const isTarget = linkwrapper?.nextElementSibling;
        if (a && !aInsideStrong && !aInsideEM && !a.classList.contains('download-btn')) {
          a.textContent = '';
          const processHref = processUrl(a.href);
          a.href = processHref;
          a.target = isTarget?.textContent.trim() === 'true' ? '_blank' : '';
          a.append(pic);
          picParent.append(a);

          if (environmentMode() === 'publish') {
            linkwrapper.remove();
            if (isTarget === null) {
              return;
            }

            if (!isTarget.querySelector('.download-btn')) {
              isTarget.remove();
            }
          }
        }
      }
    });
  });
}
