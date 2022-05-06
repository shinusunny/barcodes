'use strict';

// main barcode object
const barcode = {
  types: {
    8: 'GTIN-8',
    12: 'GTIN-12',
    13: 'GTIN-13',
    14: 'GTIN-14',
    17: 'GSIN',
    18: 'SSSC',
  },

  two_minus: [0, 2, 4, 6, 8, 9, 1, 3, 5, 7],
  three_plus: [0, 3, 6, 9, 2, 5, 8, 1, 4, 7],
  five_plus: [0, 5, 1, 6, 2, 7, 3, 8, 4, 9],
  five_minus: [0, 5, 9, 4, 8, 3, 7, 2, 6, 1],
  three_add: [0, 7, 4, 1, 8, 5, 2, 9, 6, 3],
  five_add: [0, 9, 7, 5, 3, 1, 8, 6, 4, 2],

  cdValidate(ean) {
    let valid = true;
    if (isNaN(ean) || ean <= 0 || !this.types[ean.length + 1]) {
      const errMsg = Object.entries(this.types)
        .map(([k, v]) => `${k - 1} (${v})`)
        .join(', ');
      setTimeout(function () {
        alert(`Entered length: ${ean.length}\nValid lengths: ${errMsg}`);
      }, 2000);
      valid = false;
    }
    return valid;
  },

  pdValidate(ean) {
    let valid = true;
    if (isNaN(ean) || ean <= 0 || ean.length !== 13 || +ean[0] !== 2 || ![1, 2, 3, 4, 7, 8, 9].includes(+ean[1])) {
      const errMsg = Object.entries(this.types)
        .filter(([k, _]) => {
          return [13].includes(+k);
        })
        .map(([k, v]) => `${k} (${v})`)
        .join(', ');
      alert(
        `Entered length: ${ean.length}\nValid lengths: ${errMsg}\nOther Validations: starts with 2 followed by 1, 2, 3, 4, 7, 8 or 9`
      );
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
    let cd = (odd + even * 3) % 10;
    return cd == 0 ? 0 : 10 - cd;
  },

  pcdFourDigitPrice(ean) {
    const digits = [...ean];
    let sum =
      this.two_minus[digits[8]] + this.two_minus[digits[9]] + this.three_plus[digits[10]] + this.five_minus[digits[11]];

    sum %= 10;
    return sum == 0 ? 0 : this.three_add[10 - sum];
  },

  pcdFiveDigitPrice(ean) {
    const digits = [...ean];
    let sum =
      this.five_plus[digits[7]] +
      this.two_minus[digits[8]] +
      this.five_minus[digits[9]] +
      this.five_plus[digits[10]] +
      this.two_minus[digits[11]];

    sum %= 10;
    return sum == 0 ? 0 : this.five_add[10 - sum];
  },
};

// select elements for selection page
const cdMenu = document.querySelector('.section-0');

// display section
const showSection = function (sect) {
  document.querySelectorAll('section').forEach((elem, i) => {
    if (i > 0) elem.style.display = 'none';
  });

  if (sect) sect.style.display = 'block';
};

// select elements for check digit page
const cdBtn = document.getElementById('cd-btn');
const cdInp = document.querySelector('.cd-inp');
const cdRes = document.querySelector('.cd-res');
const cdEan = document.querySelector('.cd-ean');
const cdCdg = document.querySelector('.cd-cd');
const cdTyp = document.querySelector('.cd-typ');
const cdCpy = document.getElementById('cd-cpy');

// select elements for price check digit page
const pdBtn = document.getElementById('pd-btn');
const pdInp = document.querySelector('.pd-inp');
const pdRes = document.querySelector('.pd-res');
const pdEan = document.querySelector('.pd-ean');
const pdTyp = document.querySelector('.pd-typ');
const pdCpy = document.getElementById('pd-cpy');

// initialize
const init = function () {
  showSection();
  cdRes.style.visibility = 'hidden';
  pdRes.style.visibility = 'hidden';
};

init();

cdMenu.addEventListener('click', function (e) {
  const clicked = e.target.closest('.btn-select');
  if (!clicked) return;
  const toSection = document.querySelector(`.section-${clicked.dataset.button}`);
  showSection(toSection);
  toSection.scrollIntoView({ behavior: 'smooth' });
  e.preventDefault();
});

// functions for check digit section
cdBtn.addEventListener('click', function (e) {
  cdRes.style.visibility = 'hidden';

  const ean = cdInp.value;
  if (barcode.cdValidate(ean)) {
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

// functions for price check digit section
pdBtn.addEventListener('click', function (e) {
  pdRes.style.visibility = 'hidden';

  let pdi = pdInp.value;
  let pde = '';
  if (barcode.pdValidate(pdi)) {
    let ean = `${pdi.slice(0, pdi.length - 1)}`.padStart(12, '0');
    const prc4 = [3, 4].includes(+ean[1]);
    let pdp = prc4 ? 7 : 6;
    let pd = prc4 ? barcode.pcdFourDigitPrice(ean) : barcode.pcdFiveDigitPrice(ean);
    pde = `${ean.slice(0, pdp)}${pd}${ean.slice(pdp + 1)}`;
    pdEan.textContent = pde.concat(barcode.checkDigit(pde));
    pdTyp.textContent = `${prc4 ? '(4-digit Price Field)' : '(5-digit Price Field)'}`;
    pdRes.style.visibility = 'visible';
  }
  e.preventDefault();
});

pdInp.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    pdBtn.click();
    e.preventDefault();
  }
});

pdCpy.addEventListener('click', function (e) {
  navigator.clipboard.writeText(pdEan.textContent);
  e.preventDefault();
});
