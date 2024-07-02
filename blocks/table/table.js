import { CIRCLEICON } from '../../scripts/constants.js';
import { decorateButtons } from '../../scripts/aem.js';

function hasNumber(myString) {
  return /\d/.test(myString);
}

function hasUlList(div) {
  const ul = div.querySelector('ul');
  let list = false;
  if (ul !== null) {
    list = true;
  }
  return list;
}

export default async function decorate(block) {
  const [title, showHeader, totalColumns, tableVariation, ...rows] = block.children;

  const columnOptions = {
    twoCol: 2,
    threeCol: 3,
    fourCol: 4,
  };

  const selectedOption = totalColumns.textContent.trim();
  const columns = columnOptions[selectedOption];

  const tableContainer = document.createElement('div');
  tableContainer.classList.add('table-container');

  const tableTitle = document.createElement('div');
  tableTitle.classList.add('table-title');
  tableTitle.innerHTML = `<h3>${title.textContent} </h3>`;
  tableContainer.appendChild(tableTitle);

  /* Table component  */
  const table = document.createElement('table');

  let variation = '';
  if (tableVariation && tableVariation.textContent !== undefined) {
    variation = tableVariation.textContent.trim();
  } else {
    variation = 'default';
  }

  rows.forEach((rowDiv, rowIndex) => {
    const row = document.createElement('tr');
    [...rowDiv.attributes].forEach(({ nodeName, nodeValue }) => {
      row.setAttribute(nodeName, nodeValue);
    });

    const rowCells = [...rowDiv.children].slice(0, columns);

    if (variation === 'default') {
      table.classList.add('table-default');
      table.classList.add(totalColumns.textContent.trim());
      rowCells.forEach((cellDiv) => {
        const cell =
          showHeader.textContent.trim() === 'true' && rowIndex === 0
            ? document.createElement('th')
            : document.createElement('td');

        cell.appendChild(cellDiv);

        row.appendChild(cell);
      });
    } else if (variation === 'defaultListRow') {
      table.classList.add('table-listRow');
      table.classList.add(totalColumns.textContent.trim());
      rowCells.forEach((cellDiv) => {
        const hasList = hasUlList(cellDiv);

        const cell =
          showHeader.textContent.trim() === 'true' && rowIndex === 0
            ? document.createElement('th')
            : document.createElement('td');
        if (hasList === true) {
          cell.classList.add('cell-title');
          cell.appendChild(cellDiv);
        } else {
          cell.textContent = cellDiv.textContent;
        }
        row.appendChild(cell);
      });
    } else if (variation === 'icon') {
      table.classList.add('table-icon');
      table.classList.add(totalColumns.textContent.trim());
      rowCells.forEach((cellDiv) => {
        const cell =
          showHeader.textContent.trim() === 'true' && rowIndex === 0
            ? document.createElement('th')
            : document.createElement('td');
        cell.appendChild(cellDiv);
        row.appendChild(cell);
      });
    } else if (variation === 'level') {
      table.classList.add('table-level');
      rowCells.forEach((cellDiv) => {
        const cell =
          showHeader.textContent.trim() === 'true' && rowIndex === 0
            ? document.createElement('th')
            : document.createElement('td');
        const cellText = cellDiv.textContent.trim().toLowerCase();
        if (cellText === 'yes') {
          cell.classList.add('concentric-circle');
          cell.innerHTML = CIRCLEICON;
        } else if (cellText === 'no') {
          cell.textContent = '';
        } else {
          const hasNum = hasNumber(cellText);

          if (hasNum === true) {
            cell.style.fontWeight = 'var(--fw-bold)';
          }
          cell.appendChild(cellDiv);
        }
        row.appendChild(cell);
      });
    } else if (variation === 'LevelColor') {
      table.classList.add('levelcolor');
      const columnColors = [
        'var(--c-white)',
        'var(--c-level-header-1)',
        'var(--c-level-header-2)',
        'var(--c-level-header-3)',
      ];

      rowCells.forEach((cellDiv, cellIndex) => {
        const cell =
          showHeader.textContent.trim() === 'true' && rowIndex === 0
            ? document.createElement('th')
            : document.createElement('td');
        const cellText = cellDiv.textContent.trim().toLowerCase();
        if (cellText === 'yes') {
          cell.classList.add('concentric-circle');
          cell.innerHTML = CIRCLEICON;
        } else if (cellText === 'no') {
          cell.textContent = '';
        } else {
          const hasNum = hasNumber(cellText);

          if (hasNum === true) {
            cell.style.fontWeight = 'var(--fw-bold)';
          }
          cell.appendChild(cellDiv);
        }

        if (rowIndex === 0 && showHeader.textContent.trim() === 'true') {
          cell.style.color = columnColors[cellIndex];
        }

        row.appendChild(cell);
      });
    } else if (variation === 'buttonRow') {
      table.classList.add('table-im-connect');
      table.classList.add(totalColumns.textContent.trim());
      rowCells.forEach((cellDiv) => {
        const cell =
          showHeader.textContent.trim() === 'true' && rowIndex === 0
            ? document.createElement('th')
            : document.createElement('td');

        if (rowIndex === 0) {
          cell.textContent = cellDiv.textContent;
        } else if (rowIndex >= 1) {
          cell.appendChild(cellDiv);
          decorateButtons(cellDiv);
        }

        row.appendChild(cell);
      });
    }

    table.appendChild(row);
  });
  tableContainer.appendChild(table);

  block.textContent = '';
  block.appendChild(tableContainer);
}
