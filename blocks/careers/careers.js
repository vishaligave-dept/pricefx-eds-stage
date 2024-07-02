import { loadScript } from '../../scripts/aem.js';
import { FACEBOOK, TWITTER, PINTEREST, LINKEDIN } from '../../scripts/constants.js';
import { CAREERS_PATH } from '../../scripts/url-constants.js';

async function loadJobsData(sortBy, filterBy, block) {
  block.querySelector('.careers-postings-container')?.remove();
  const jobPosting = document.createElement('div');
  jobPosting.classList.add('careers-postings-container');
  jobPosting.classList.add('loading');
  block.append(jobPosting);
  try {
    const response = await fetch(`${CAREERS_PATH}?sort=${filterBy}${sortBy}`);
    const jobScore = await response.json();

    const { jobs } = jobScore;
    const departments = [];
    jobPosting.querySelector('.careers-loader')?.classList.add('loaded');
    jobs.forEach((job) => {
      const departmentName = job.department;
      const departmentID = departmentName.replace(/[^a-zA-Z0-9]/g, '_');

      if (departments.indexOf(departmentName) === -1) {
        departments.push(departmentName);
        const departmentDiv = document.createElement('div');
        departmentDiv.classList.add('careers-postings');
        departmentDiv.innerHTML = `<h3><strong>${departmentName}</strong></h3>
        <div class="careers-content-container"><ul id="${departmentID}"></ul></div>`;
        jobPosting.append(departmentDiv);
      }
      const jobItem = document.createElement('div');
      jobItem.classList.add('job-item');
      jobItem.innerHTML = `<li class="job-item">                        
          <div class="job-container">                                 
            <div class="job-header">                                   
            <h3>${job.title}</h3>   
            <p>${job.city}, ${job.state} - ${job.country}</p>
            </div>                                   
            <div class="job-details" data-expanded="false">${job.description}                                     
              <a href="${job.detail_url}" target="_blank" class="button primary">Apply Now</a>                                 
              <div class="a2a_kit a2a_kit_size_32 a2a_default_style careers-social-links">
                <a class="a2a_button_facebook" target="_blank" href="/#facebook">${FACEBOOK}</a>
                <a class="a2a_button_twitter" target="_blank" href="/#twitter">${TWITTER}</a>
                <a class="a2a_button_linkedin" target="_blank" href="/#linkedin">${LINKEDIN}</a>
                <a class="a2a_button_pinterest" target="_blank" href="/#pinterest">${PINTEREST}</a>        
              </div>
            </div>
          </div>                      
        </li>`;
      jobPosting.querySelector(`#${departmentID}`).append(jobItem);

      jobPosting.classList.remove('loading');
    });
    loadScript('https://static.addtoany.com/menu/page.js', { async: true });
  } catch (error) {
    jobPosting.innerHTML = `<p>Something went wrong. Please try again later.</p>`;
  }
}

function renderCareers(block) {
  const joinTeam = document.createElement('h2');
  joinTeam.classList.add('careers-join-team');
  const careersDropdown = document.createElement('div');
  careersDropdown.classList.add('careers-select');
  const filterBy = document.createElement('div');
  filterBy.classList.add('careers-filter');
  filterBy.innerHTML = `<select class="form-control" id="filterby" name="filterBy">
      <option>- Choose an Option -</option>
      <option value="department" selected>Department</option>
      <option value="title">Title</option>
      <option value="location">Location</option>
      <option value="country">Country</option>
      <option value="city">City</option>
      <option value="state">State</option>
      <option value="date">Date</option>
  </select>`;

  const sortBy = document.createElement('div');
  sortBy.classList.add('careers-sort');
  sortBy.innerHTML = `<select class="form-control" id="sortby" name="sortby">
    <option>- Choose an Option -</option>
    <option value="" selected>A to Z</option>
    <option value="_reverse">Z to A</option>
  </select>`;
  joinTeam.innerHTML = `<strong>Join Our Team</strong>`;
  block.append(joinTeam);
  careersDropdown.append(filterBy);
  careersDropdown.append(sortBy);
  block.append(careersDropdown);
}

function addEventListeners(block) {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('.job-header');
    if (target) {
      const targetParent = target.parentElement.parentElement;
      targetParent.classList.toggle('active');
      if (targetParent.classList.contains('active')) {
        target.nextElementSibling.setAttribute('data-expanded', 'true');
      } else {
        target.nextElementSibling.setAttribute('data-expanded', 'false');
      }
    }
  });
  document.addEventListener('change', (e) => {
    const targetSort = e.target.closest('#sortby');
    const targetFilter = e.target.closest('#filterby');
    let sortBy = document.querySelector('#sortby').value;
    let filterBy = document.querySelector('#filterby').value;
    if (targetSort) {
      sortBy = targetSort.value;
    }
    if (targetFilter) {
      filterBy = targetFilter.value;
    }
    loadJobsData(sortBy, filterBy, block);
  });
}

export default async function decorate(block) {
  renderCareers(block);
  loadJobsData('deparment', '', block);
  addEventListeners(block);
}
