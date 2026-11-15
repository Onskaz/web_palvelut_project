const PLACEHOLDER_IMG = 'https://placehold.co/600x400/e2e8f0/475569?text=Ei+kuvaa+saatavilla';
let currentAnimal = null;

// Haetaan kaikki eläimet ja näytetään kortit
async function loadAnimals() {
  const grid = document.getElementById('animals-grid');
  grid.innerHTML = '<p>Ladataan eläimiä...</p>';

  try {
    const res = await fetch('/animals');
    const animals = await res.json();

    grid.innerHTML = '';
    animals.forEach(animal => {
      const imgUrl = animal.image_url && animal.image_url.trim() !== '' ? animal.image_url : PLACEHOLDER_IMG;
      const isAdopted = animal.status === 'adopted';

      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${imgUrl}" alt="${animal.name}">
        <div class="card-body">
          <div>
            <span class="badge ${isAdopted ? 'adopted' : 'available'}">
              ${isAdopted ? 'Adoptoitu' : 'Etsii kotia'}
            </span>
            <h3>${animal.name}</h3>
            <p><strong>Tyyppi:</strong> ${animal.type}</p>
            <p><strong>Ikä:</strong> ${animal.age} vuotta</p>
          </div>
          <button class="btn-primary" onclick="showAnimalDetail(${animal.id})">Katso lisää</button>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = '<p class="error-msg">Eläinten lataaminen epäonnistui.</p>';
  }
}

// Näytetään yksittäisen eläimen sivu
async function showAnimalDetail(id) {
  try {
    const res = await fetch(`/animals/${id}`);
    if (!res.ok) throw new Error('Eläintä ei löytynyt');
    const animal = await res.json();
    currentAnimal = animal;

    const imgUrl = animal.image_url && animal.image_url.trim() !== '' ? animal.image_url : PLACEHOLDER_IMG;
    const isAdopted = animal.status === 'adopted';

    const detailContent = document.getElementById('animal-detail-content');
    detailContent.innerHTML = `
      <img src="${imgUrl}" alt="${animal.name}">
      <div>
        <span class="badge ${isAdopted ? 'adopted' : 'available'}">
          ${isAdopted ? 'Adoptoitu' : 'Etsii kotia'}
        </span>
        <h2>${animal.name}</h2>
        <p><strong>Tyyppi:</strong> ${animal.type}</p>
        <p><strong>Rotu:</strong> ${animal.breed}</p>
        <p><strong>Ikä:</strong> ${animal.age} vuotta</p>
        <hr style="margin: 12px 0; border: none; border-top: 1px solid #eee;">
        <p>${animal.description}</p>
      </div>
    `;

    const formContainer = document.getElementById('adoption-form-container');
    if (isAdopted) {
      formContainer.innerHTML = `<p class="error-msg">${animal.name} on jo löytänyt uuden kodin, eikä uusia hakemuksia enää vastaanoteta.</p>`;
    } else {
      // Varmistetaan että lomake näkyy ja on tyhjennetty
      formContainer.innerHTML = `
        <h3>Jätä adoptiohakemus eläimestä ${animal.name}</h3>
        <form id="adoption-form" onsubmit="submitAdoption(event)">
          <div class="form-group">
            <label for="applicant_name">Nimesi *</label>
            <input type="text" id="applicant_name" required placeholder="Matti Meikäläinen">
          </div>
          <div class="form-group">
            <label for="applicant_email">Sähköposti *</label>
            <input type="email" id="applicant_email" required placeholder="matti@esimerkki.fi">
          </div>
          <div class="form-group">
            <label for="applicant_phone">Puhelinnumero *</label>
            <input type="tel" id="applicant_phone" required placeholder="040 123 4567">
          </div>
          <div class="form-group">
            <label for="message">Kerro kodistasi</label>
            <textarea id="message" rows="4" placeholder="Kerro lyhyesti millaiseen kotiin eläin pääsisi..."></textarea>
          </div>
          <p id="form-error" class="error-msg hidden"></p>
          <button type="submit" id="submit-btn" class="btn-primary">Adoptoi minut</button>
        </form>
      `;
    }

    document.getElementById('list-view').classList.add('hidden');
    document.getElementById('thank-you-view').classList.add('hidden');
    document.getElementById('detail-view').classList.remove('hidden');
  } catch (err) {
    alert('Virhe eläimen tietoja ladattaessa.');
  }
}

// Lähetetään adoptiohakemus Server A:lle
async function submitAdoption(event) {
  event.preventDefault();
  if (!currentAnimal) return;

  const errorEl = document.getElementById('form-error');
  const submitBtn = document.getElementById('submit-btn');
  errorEl.classList.add('hidden');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Lähetetään...';

  const payload = {
    applicant_name: document.getElementById('applicant_name').value,
    applicant_email: document.getElementById('applicant_email').value,
    applicant_phone: document.getElementById('applicant_phone').value,
    message: document.getElementById('message').value
  };

  try {
    const res = await fetch(`/animals/${currentAnimal.id}/adopt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || 'Adoptio epäonnistui.';
      errorEl.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Adoptoi minut';
      return;
    }

    // Kiitos-sivu
    document.getElementById('thank-you-text').textContent =
      `Olet jättänyt adoptiohakemuksen eläimestä: ${currentAnimal.name} (${currentAnimal.breed}).`;
    document.getElementById('detail-view').classList.add('hidden');
    document.getElementById('thank-you-view').classList.remove('hidden');
  } catch (err) {
    errorEl.textContent = 'Verkkovirhe. Yritä uudelleen.';
    errorEl.classList.remove('hidden');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Adoptoi minut';
  }
}

function showListView() {
  document.getElementById('detail-view').classList.add('hidden');
  document.getElementById('thank-you-view').classList.add('hidden');
  document.getElementById('list-view').classList.remove('hidden');
  loadAnimals();
}

// Alustetaan sivu
loadAnimals();