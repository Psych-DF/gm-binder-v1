const imageCount = 40;
const grid = document.getElementById('grid');

async function loadCards() {
  for (let i = 1; i <= imageCount; i++) {
    const imageSrc = `output/${i}.png`;
    const jsonSrc = `output/${i}.json`;

    try {
      const res = await fetch(jsonSrc);
      if (!res.ok) throw new Error(`Missing JSON for ${i}`);
      const jsonData = await res.json();

      // Card back HTML
      let backHTML = `<div class="card-back">
        <h4>${jsonData.name || `Card ${i}`}</h4>`;

      if (jsonData.attributes && Array.isArray(jsonData.attributes)) {
        backHTML += jsonData.attributes.map(attr =>
          `<div class="attr"><strong>${attr.trait_type.toUpperCase()}</strong>: ${attr.value}</div>`
        ).join('');
      } else {
        backHTML += `<em>No attributes found.</em>`;
      }

      backHTML += `
        <div style="margin-top: auto; width: 100%; text-align: center;">
          <a href="https://yoursite.com/buy/${i}" target="_blank" class="buy-button">Buy Now</a>
        </div>
      </div>`;

      // Create card DOM
      const card = document.createElement('div');
      card.className = 'card';

      const cardInner = document.createElement('div');
      cardInner.className = 'card-inner';

      const cardFront = document.createElement('div');
      cardFront.className = 'card-front';

      // Create image and loading dot
      const img = document.createElement('img');
      img.dataset.src = imageSrc;
      img.alt = `Card ${i}`;
      img.classList.add('lazy-image');

      const loadingDot = document.createElement('div');
      loadingDot.className = 'loading-dot';

      cardFront.appendChild(img);
      cardFront.appendChild(loadingDot);
      cardInner.appendChild(cardFront);
      cardInner.insertAdjacentHTML('beforeend', backHTML);
      card.appendChild(cardInner);
      grid.appendChild(card);
    } catch (err) {
      console.warn(`Card ${i} skipped due to error:`, err.message);
    }
  }

  // Flip logic
  document.addEventListener('click', function (event) {
    const clickedCard = event.target.closest('.card');
    document.querySelectorAll('.card').forEach(card => {
      if (card !== clickedCard) card.classList.remove('flipped');
    });
    if (clickedCard) clickedCard.classList.toggle('flipped');
  });

  // Lazy loading with staggered fade + dot
  let staggerDelay = 0;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const loadingDot = img.parentElement.querySelector('.loading-dot');

        img.src = img.dataset.src;

        img.onload = () => {
          setTimeout(() => {
            img.classList.add('loaded');
            if (loadingDot) loadingDot.remove();
          }, staggerDelay);
          staggerDelay += 150;
        };

        img.onerror = () => {
          if (loadingDot) loadingDot.remove();
        };

        obs.unobserve(img);
      }
    });
  }, {
    rootMargin: '200px',
  });

  document.querySelectorAll('.lazy-image').forEach(img => observer.observe(img));
}

loadCards();
