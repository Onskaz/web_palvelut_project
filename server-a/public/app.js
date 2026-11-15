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