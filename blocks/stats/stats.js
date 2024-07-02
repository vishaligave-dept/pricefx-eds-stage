export default function decorate(block) {
  const parentDiv = document.createElement('div');
  const size = block.lastElementChild.querySelector('p');
  let titleSize = '';
  if (size) {
    titleSize = size.textContent.trim();
  }
  parentDiv.classList.add('stats-container-wrap');
  const background = block.lastElementChild.previousElementSibling;
  const pText = background.querySelector('p');
  if (pText) {
    parentDiv.classList.add(pText.textContent.trim());
  }

  let childDiv = null;
  [...block.children].forEach((row, index) => {
    if (index < 6) {
      const propValue = row.querySelector('p, h1, h2, h3, h4, h5, h6');
      // If either a title or description is left empty, add a corresponding empty tag
      if (propValue && index % 2 === 0) {
        // If title is authored without description
        if (childDiv) {
          const emptyTag = document.createElement('p');
          const textDiv = document.createElement('div');
          textDiv.classList.add('stat-description');
          textDiv.appendChild(emptyTag.cloneNode(true));
          childDiv.appendChild(textDiv);
          parentDiv.appendChild(childDiv);
          childDiv = null;
        }
        childDiv = document.createElement('div');
        childDiv.classList.add('stat');
        const pTag = row.querySelector('p, h1, h2, h3, h4, h5, h6');
        const titleDiv = document.createElement('div');
        titleDiv.classList.add('stat-title');
        if (titleSize) {
          titleDiv.classList.add(titleSize);
        }
        titleDiv.appendChild(pTag.cloneNode(true));
        childDiv.appendChild(titleDiv);
        const line = document.createElement('div');
        line.classList.add('line');
        childDiv.appendChild(line);
      } else if (propValue && index % 2 !== 0) {
        // If description is authored without title
        if (childDiv === null) {
          childDiv = document.createElement('div');
          childDiv.classList.add('stat');
          const emptyTag = document.createElement('p');
          const titleDiv = document.createElement('div');
          titleDiv.appendChild(emptyTag.cloneNode(true));
          titleDiv.classList.add('stat-title');
          if (titleSize) {
            titleDiv.classList.add(titleSize);
          }
          childDiv.appendChild(titleDiv);
          const line = document.createElement('div');
          line.classList.add('line');
          childDiv.appendChild(line);
        }
        const pTag = row.querySelector('p, h1, h2, h3, h4, h5, h6');
        const textDiv = document.createElement('div');
        textDiv.classList.add('stat-description');
        textDiv.appendChild(pTag.cloneNode(true));
        childDiv.appendChild(textDiv);
        parentDiv.appendChild(childDiv);
        childDiv = null;
      }
    }
  });

  if (childDiv) {
    const emptyTag = document.createElement('p');
    const textDiv = document.createElement('div');
    textDiv.appendChild(emptyTag.cloneNode(true));
    textDiv.classList.add('stat-description');
    childDiv.appendChild(textDiv);
    parentDiv.appendChild(childDiv);
  }

  // Adjust Height of stat-title
  const adjustStatTitleHeight = () => {
    setTimeout(() => {
      const statTitle = parentDiv.querySelectorAll('.stat-title');
      let maxHeight = 0;
      statTitle.forEach((title) => {
        const height = title.offsetHeight;
        maxHeight = Math.max(maxHeight, height);
      });
      if (maxHeight !== 0) {
        statTitle.forEach((title) => {
          title.style.height = `${maxHeight}px`;
        });
      }
    }, 200); // Delay to ensure proper recalculation after content changes
  };

  const setDefaultTitle = () => {
    const statTitles = parentDiv.querySelectorAll('.stat-title');
    statTitles.forEach((title) => {
      title.style.height = 'auto';
    });
  };

  // Attach resize event listener to adjust heights on window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      setDefaultTitle();
      adjustStatTitleHeight();
    } else {
      setDefaultTitle();
    }
  });

  // Initial call to adjust heights
  if (window.innerWidth > 768) {
    adjustStatTitleHeight();
  }

  block.innerHTML = '';
  block.appendChild(parentDiv);
}
