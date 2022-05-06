'use strict';

const barcode = {
  types: {
    8: 'GTIN-8',
    12: 'GTIN-12',
    13: 'GTIN-13',
    14: 'GTIN-14',
    17: 'GSIN',
    18: 'SSSC',
  },

  validate(ean) {
    let valid = true;
    if (isNaN(ean) || ean <= 0 || !this.types[ean.length + 1]) {
      const errMsg = Object.entries(this.types)
        .map(([k, v]) => `${k - 1} (${v})`)
        .join(', ');
      alert(`Entered length: ${ean.length}\nValid lengths: ${errMsg}`);
      valid = false;
    }
    return valid;
  },

  checkDigit(ean) {
    const digits = [...ean].reverse();
    const { even, odd } = digits.reduce(
      (sum, cur, i) => {
        sum[i % 2 == 0 ? 'even' : 'odd'] += +cur;
        return sum;
      },
      { even: 0, odd: 0 }
    );
    return (10 - ((odd + even * 3) % 10)) % 10;
  },
};

const cdMenu = document.querySelector('.section-0');

const cdInp = document.querySelector('.cd-inp');
const cdBtn = document.getElementById('cd-btn');
const cdRes = document.querySelector('.cd-res');
const cdEan = document.querySelector('.cd-ean');
const cdCdg = document.querySelector('.cd-cd');
const cdTyp = document.querySelector('.cd-typ');
const cdCpy = document.getElementById('cd-cpy');

const showSection = function (sect) {
  document.querySelectorAll('section').forEach(function (elem, i) {
    if (i > 0) {
      elem.style.display = 'none';
    }
  });

  if (sect) sect.style.display = 'block';
};

showSection();

cdMenu.addEventListener('click', function (e) {
  const clicked = e.target.closest('.btn-select');
  if (!clicked) return;
  const toSection = document.querySelector(`.section-${clicked.dataset.button}`);
  showSection(toSection);
  toSection.scrollIntoView({ behavior: 'smooth' });
  e.preventDefault();
});

cdRes.style.visibility = 'hidden';

cdBtn.addEventListener('click', function (e) {
  cdRes.style.visibility = 'hidden';

  const ean = cdInp.value;
  if (barcode.validate(ean)) {
    const cd = barcode.checkDigit(ean);
    cdEan.textContent = '';
    cdEan.insertAdjacentHTML('beforeend', `${ean}<span class="cd-cd">${cd}</span>`);
    cdTyp.textContent = `(${barcode.types[ean.length + 1]})`;
    cdRes.style.visibility = 'visible';
  }
  e.preventDefault();
});

cdInp.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    cdBtn.click();
    e.preventDefault();
  }
});

cdCpy.addEventListener('click', function (e) {
  navigator.clipboard.writeText(cdEan.textContent.concat(cdCdg.textContent));
  e.preventDefault();
});
